import React, { createContext, useContext, useState, ReactNode, useRef, useEffect } from 'react';
import { initializeModelSession } from "../onnx-handler";
import init, { run_engine, Move } from "../wasm/trust.js"

export type Position = [number, number];
export type PlayerType = 'human' | 'bot';
// control scheme types
export type ControlScheme = 'wasd' | 'yghj' | 'arrows' | 'ijkl' | "pl;'" | 'numpad' | 'bot';
type KeyMap = Record<string, Direction>;
type ControlSchemesMapping = Record<ControlScheme, KeyMap>;

export type Direction = 'up' | 'down' | 'left' | 'right';

/*
 * TODO: Want to be able to iterate through all directions.
 * This feels bad - Direction should probably be an Enum?
 */
const directions: Direction[] = ['up', 'down', 'left', 'right'];

export const STEP_THROUGH_SPEED = 0;
export const MIN_GAME_SPEED = 1;
export const MAX_GAME_SPEED = 10;
export const DEFAULT_GAME_SPEED = STEP_THROUGH_SPEED;

const SLOWEST_TICK_DELAY_MS = 1000;
const FASTEST_TICK_DELAY_MS = 100;

export const isStepThroughSpeed = (speed: number) => speed === STEP_THROUGH_SPEED;

export const getGameTickDelay = (speed: number) => {
    const clampedSpeed = Math.max(MIN_GAME_SPEED, Math.min(MAX_GAME_SPEED, Math.round(speed)));
    const speedProgress = (clampedSpeed - MIN_GAME_SPEED) / (MAX_GAME_SPEED - MIN_GAME_SPEED);
    return Math.round(SLOWEST_TICK_DELAY_MS - speedProgress * (SLOWEST_TICK_DELAY_MS - FASTEST_TICK_DELAY_MS));
};

const isOppositeDirection = (currentDirection: Direction, nextDirection: Direction) =>
    (currentDirection === 'up' && nextDirection === 'down') ||
    (currentDirection === 'down' && nextDirection === 'up') ||
    (currentDirection === 'left' && nextDirection === 'right') ||
    (currentDirection === 'right' && nextDirection === 'left');

export type GameStatus = 'waiting' | 'playing' | 'gameOver';

export interface PlayerMove {
    x: number;
    y: number;
    player_id: number;
    direction: Direction;
}

export interface Player {
    id: number;
    name?: string;
    type: PlayerType;
    position: Position;
    direction: Direction;
    controlScheme?: ControlScheme;
    alive?: boolean;
    color: string;
    score: number;
}

interface TronContextType {
    gameGrid: number[][];
    setGameGrid: (grid: number[][]) => void;

    players: Player[];
    setPlayers: (players: Player[]) => void;

    gameStatus: GameStatus;
    setGameStatus: (status: GameStatus) => void;

    winner: number | null;
    setWinner: (winnerId: number | null) => void;

    gridSize: { width: number; height: number };
    setGridSize: (size: { width: number; height: number }) => void;

    gameSpeed: number;
    setGameSpeed: (speed: number) => void;

    setDefaultSettings: () => void;
    startGame: () => Player[];
    resetGame: () => void;
    gameLoop: () => void;
    updateGridSize: (width: number, height: number) => void;
    changePlayerDirection: (playerId: number, direction: Direction) => void;
    desiredDirections: React.MutableRefObject<{ [key: number]: Direction }>;

    modelInitialized: boolean;
    initializeModel: () => Promise<void>;
    initBoard: () => Promise<void>;
    calculatePlayerStartPositions: (players: Player[], gridSize: { width: number; height: number }) => Player[];

    availableControlSchemes: ControlScheme[];
    setAvailableControlSchemes: (schemes: ControlScheme[]) => void;
    allControlSchemes: readonly ControlScheme[];
    controlSchemeMappings: ControlSchemesMapping;

    introComplete: boolean;
    setIntroComplete: (introComplete: boolean) => void;

    skipIntro: boolean;
    setSkipIntro: (skipIntro: boolean) => void;

    playerPositions: PlayerMove[];
    setPlayerPositions: (playerPositions: PlayerMove[]) => void;
    showGameGrid: boolean;
    setShowGameGrid: (showGameGrid: boolean) => void;
}

export const TronContext = createContext<TronContextType | undefined>(undefined);

interface TronProviderProps {
    children: ReactNode;
}

export const TronProvider: React.FC<TronProviderProps> = ({ children }) => {
    const [introComplete, setIntroComplete] = useState(false);
    const [skipIntro, setSkipIntro] = useState(false);
    const [gridSize, setGridSize] = useState({ width: 3, height: 3 });
    const [gameGrid, setGameGrid] = useState<number[][]>(
        Array(gridSize.height).fill(null).map(() =>
            Array(gridSize.width).fill(0)
        )
    );
    const [showGameGrid, setShowGameGrid] = useState(false);
    const [players, setPlayers] = useState<Player[]>([]);
    const desiredDirections = useRef<{ [key: number]: Direction }>({});
    const [gameStatus, setGameStatus] = useState<GameStatus>('waiting');
    const isGameRunning = useRef(false);
    const [winner, setWinner] = useState<number | null>(null);
    const [gameSpeed, setGameSpeedState] = useState(DEFAULT_GAME_SPEED);
    const setGameSpeed = (speed: number) => {
        setGameSpeedState(Math.max(STEP_THROUGH_SPEED, Math.min(MAX_GAME_SPEED, Math.round(speed))));
    };
    const [modelInitialized, setModelInitialized] = useState(false);
    const [availableControlSchemes, setAvailableControlSchemes] = useState<ControlScheme[]>([
        'yghj', 'arrows', 'ijkl', "pl;'", 'numpad', 'bot'
    ]);
    const allControlSchemes = ['wasd', 'yghj', 'arrows', 'ijkl', "pl;'", 'numpad', 'bot'] as const;
    const controlSchemeMappings: ControlSchemesMapping = {
        wasd: { w: 'up', a: 'left', s: 'down', d: 'right' },
        arrows: { ArrowUp: 'up', ArrowLeft: 'left', ArrowDown: 'down', ArrowRight: 'right' },
        ijkl: { i: 'up', j: 'left', k: 'down', l: 'right' },
        "pl;'": { p: 'up', l: 'left', ';': 'down', "'": 'right' },
        yghj: { y: 'up', g: 'left', h: 'down', j: 'right' },
        numpad: { '8': 'up', '4': 'left', '5': 'down', '6': 'right' },
        bot: {} // Empty mapping for bot
    };
    const [playerPositions, setPlayerPositions] = useState<PlayerMove[]>([]);

    const updateGridSize = (width: number, height: number) => {
        if (gameStatus === 'playing') return;
        const nextGridSize = { width, height };
        setGridSize(nextGridSize);
        setGameGrid(
            Array(height).fill(null).map(() =>
                Array(width).fill(0)
            )
        )
        let newPlayers = calculatePlayerStartPositions(players, nextGridSize);
        setPlayers(newPlayers);
    }

    const initBoard = async () => {
        // set default values
        setDefaultSettings();
        // Initialize WASM
        await init();
        // Initialize onnxruntime-web model
        await initializeModel();
    };
    const setDefaultSettings = () => {
        // Create an empty grid
        const newGrid = Array(gridSize.height).fill(null).map(() =>
            Array(gridSize.width).fill(0)
        );
        setGameGrid(newGrid);

        // Set up default players
        let defaultPlayers: Player[] = [
            {
                id: 1,
                type: 'human',
                name: 'Player 1',
                position: [0, 5],
                direction: 'left',
                controlScheme: 'wasd',
                color: '#00FFFF',
                score: 0
            },
            {
                id: 2,
                type: 'bot',
                name: 'Player 2',
                position: [9, 5],
                direction: 'right',
                controlScheme: 'bot',
                color: '#FFA300',
                score: 0,
            }
        ];
        defaultPlayers = calculatePlayerStartPositions(defaultPlayers, gridSize);
        setPlayers(defaultPlayers);

        // Place players on the grid
        defaultPlayers.forEach(player => {
            const [x, y] = player.position;
            newGrid[y][x] = player.id;
        });

        setGameStatus('waiting');
        setWinner(null);
    };

    const startGame = () => {
        // Initialize game grid, reset players, etc.
        let resetPlayers = resetGame();
        setGameStatus('playing');
        isGameRunning.current = true;
        // console.log("starting game")
        return resetPlayers;
    };

    function calculatePlayerStartPositions(
        players: Player[],
        gridSize: { width: number; height: number }
    ): Player[] {
        const { width, height } = gridSize;
        const playerCount = players.length;

        if (playerCount === 0) {
            return players;
        }

        const availablePositions: Position[] = [];
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                availablePositions.push([x, y]);
            }
        }

        for (let i = availablePositions.length - 1; i > 0; i--) {
            const randomIndex = Math.floor(Math.random() * (i + 1));
            [availablePositions[i], availablePositions[randomIndex]] = [availablePositions[randomIndex], availablePositions[i]];
        }

        const occupiedPositions = new Set<string>();
        const playersWithPositions = players.map((player, index) => {
            const position = availablePositions[index % availablePositions.length];
            occupiedPositions.add(`${position[0]},${position[1]}`);

            return {
                ...player,
                position,
            };
        });

        const getNextPosition = ([x, y]: Position, direction: Direction): Position => {
            switch (direction) {
                case 'up':
                    return [x, y - 1];
                case 'down':
                    return [x, y + 1];
                case 'left':
                    return [x - 1, y];
                case 'right':
                    return [x + 1, y];
            }
        };

        const isInBounds = ([x, y]: Position) =>
            x >= 0 && x < width && y >= 0 && y < height;

        return playersWithPositions.map((player) => {
            const clearDirections = directions.filter(direction => {
                const nextPosition = getNextPosition(player.position, direction);
                return isInBounds(nextPosition) && !occupiedPositions.has(`${nextPosition[0]},${nextPosition[1]}`);
            });
            const inBoundsDirections = directions.filter(direction => isInBounds(getNextPosition(player.position, direction)));
            const possibleDirections = clearDirections.length > 0 ? clearDirections : inBoundsDirections;
            const direction = possibleDirections[Math.floor(Math.random() * possibleDirections.length)];

            return {
                ...player,
                direction,
            };
        });
    }

    const resetGame = () => {
        // Reset all game state
        isGameRunning.current = false;
        setGameStatus('waiting');
        setWinner(null);
        // set the grid to have the players starting position

        let resetPlayers = calculatePlayerStartPositions(players, gridSize);
        // set all players alive variable to true
        resetPlayers = resetPlayers.map(player => ({ ...player, alive: true }));
        setPlayers(resetPlayers);
        desiredDirections.current = {};

        let newGrid = Array(gridSize.height).fill(null).map(() =>
            Array(gridSize.width).fill(0)
        );
        for (let player of resetPlayers) {
            const [x, y] = player.position;
            newGrid[y][x] = player.id;
        }

        setGameGrid(newGrid);

        return resetPlayers;
    };

    const changePlayerDirection = (playerId: number, direction: Direction) => {
        let player = players.find(player => player.id === playerId);
        if (player && hasPlayerMoved(player.id) && isOppositeDirection(player.direction, direction)) {
            return;
        }

        if (player?.direction === direction) {
            return;
        }
        // Update player position and direction
        setPlayers(prevPlayers =>
            prevPlayers.map(player =>
                player.id === playerId
                    ? { ...player, direction }
                    : player
            )
        );
    };

    const initializeModel = async () => {
        try {
            if (modelInitialized) {
                return;
            }
            const initialized = await initializeModelSession();
            setModelInitialized(initialized);
        } catch (error) {
            console.error('Failed to initialize AI model:', error);
            setModelInitialized(false);
        }
    };

    const hasPlayerMoved = (playerId: number) =>
        gameGrid.reduce((total, row) => total + row.filter(cell => cell === playerId).length, 0) > 1;

    const isGameOver = (newPlayers: Player[]): { gameOver: boolean; winner: number | null } => {
        const alivePlayers = newPlayers.filter(player => player.alive);

        if (alivePlayers.length === 0) {
            // All players died simultaneously
            return { gameOver: true, winner: null };
        } else if (alivePlayers.length === 1) {
            // add a point to the users score
            const winner = players.find(player => player.id === alivePlayers[0].id);
            if (winner) {
                winner.score += 1;
            }
            return { gameOver: true, winner: alivePlayers[0].id };
        }

        // Game continues
        return { gameOver: false, winner: null };
    };

    const gameLoop = async () => {
        if (gameStatus !== 'playing') {
            return;
        }

        //////////////////////////////////////////
        // RUST WASM CODE START
        //////////////////////////////////////////

        // Flatten the 2D array into a 1D array
        const flattenedArray = gameGrid.flat();

        // Convert the flattened array to Uint8Array
        const uint8Array = new Uint8Array(flattenedArray);

        for (let i = 0; i < players.length; i++) {
            const player = players[i];

            if (player.type == 'bot' && player.alive) {

                let opponentPositions = new Array<Position>();

                for (let j = 0; j < players.length; j++) {

                    if (i != j) {
                        opponentPositions.push(players[j].position);
                    }

                }
                try {
                    // Only passes the first opponent position for now
                    const move: Move = run_engine(uint8Array, gameGrid.length, gameGrid[0].length, player.position[1], player.position[0], opponentPositions[0][1], opponentPositions[0][0]);
                    // console.log("Move (row, col) offset", move.row_offset, move.col_offset);

                    let new_dir: Direction;
                    if (move.row_offset == 1 && move.col_offset == 0) {
                        new_dir = "down";
                    } else if (move.row_offset == -1 && move.col_offset == 0) {
                        new_dir = "up";
                    } else if (move.row_offset == 0 && move.col_offset == 1) {
                        new_dir = "right";
                    } else if (move.row_offset == 0 && move.col_offset == -1) {
                        new_dir = "left";
                    } else {
                        throw new Error("Invalid move");
                    }

                    desiredDirections.current[player.id] = new_dir;

                } catch (error) {
                    console.error('Error running engine:', error);
                }

            }
        }

        //////////////////////////////////////////
        // RUST WASM CODE END
        //////////////////////////////////////////

        // Deepcopy gameGrid
        let newGrid = gameGrid.map(row => [...row]);

        // Update players' directions from desiredDirections
        const newPlayers = players.map(player => {
            const desiredDirection = desiredDirections.current[player.id];
            const canReverseDirection = !hasPlayerMoved(player.id);

            if (
                desiredDirection &&
                player.direction !== desiredDirection &&
                (canReverseDirection || !isOppositeDirection(player.direction, desiredDirection))
            ) {
                player.direction = desiredDirection;
            }
            return player;
        });

        // Move all players
        newPlayers.forEach(player => {
            if (!player.alive) return;

            const [x, y] = player.position;
            let newX = x;
            let newY = y;

            switch (player.direction) {
                case 'up':
                    newY = y - 1;
                    break;
                case 'down':
                    newY = y + 1;
                    break;
                case 'left':
                    newX = x - 1;
                    break;
                case 'right':
                    newX = x + 1;
                    break;
            }

            // Check for collisions
            const isOutOfBounds = newX < 0 || newX >= gridSize.width || newY < 0 || newY >= gridSize.height;
            const nextMove = isOutOfBounds ? -1 : gameGrid[newY][newX];

            if (nextMove !== 0 || isOutOfBounds) {
                player.alive = false;
            } else {
                // Update game grid only if no collision
                newGrid[newY][newX] = player.id;
                player.position = [newX, newY];
            }
        });

        // check if any players are trying to access the same coodirnates
        const positionMap = new Map<string, number[]>(); // Maps position string to array of player IDs

        // Build position map
        newPlayers.forEach(player => {
            if (!player.alive) return;
            const posKey = `${player.position[0]},${player.position[1]}`;

            if (!positionMap.has(posKey)) {
                positionMap.set(posKey, [player.id]);
            } else {
                positionMap.get(posKey)?.push(player.id);
            }
        });

        // Check for collisions
        positionMap.forEach((playerIds, position) => {
            if (playerIds.length > 1) {
                // If multiple players are in the same position, mark them all as not alive
                playerIds.forEach(id => {
                    const player = newPlayers.find(p => p.id === id);
                    if (player) {
                        player.alive = false;
                    }
                });
            }
        });

        // mark all new moves for UI to update efficiently (animated growth)
        const updatedPositions = newPlayers
            .filter(player => player.alive)
            .map(player => ({
                x: player.position[0],
                y: player.position[1],
                player_id: player.id,
                direction: player.direction as Direction
            }));

        setPlayerPositions(updatedPositions);


        // Check game over condition after all players have moved
        const { gameOver, winner } = isGameOver(newPlayers);
        if (gameOver) {
            isGameRunning.current = false;
            console.log(gameOver, winner);
            setGameStatus('gameOver');
            setWinner(winner);
            return;
        }

        setPlayers(newPlayers);

        // Update grid
        setGameGrid(newGrid);
    };

    useEffect(() => {
        let timeoutId: number;
        const isStepThroughMode = isStepThroughSpeed(gameSpeed);
        const tickDelay = getGameTickDelay(gameSpeed);

        const loop = () => {
            gameLoop();
            timeoutId = window.setTimeout(loop, tickDelay);
        };

        if (gameStatus === 'playing' && !isStepThroughMode) {
            timeoutId = window.setTimeout(loop, tickDelay);
        }

        return () => {
            if (timeoutId) {
                clearTimeout(timeoutId);
            }
        };
    }, [gameStatus, gameLoop, gameSpeed]);


    const value = {
        gameGrid,
        setGameGrid,
        players,
        setPlayers,
        gameStatus,
        setGameStatus,
        winner,
        setWinner,
        gridSize,
        setGridSize,
        gameSpeed,
        setGameSpeed,
        setDefaultSettings,
        startGame,
        resetGame,
        changePlayerDirection: changePlayerDirection,
        modelInitialized,
        initializeModel,
        availableControlSchemes,
        setAvailableControlSchemes,
        allControlSchemes,
        controlSchemeMappings,
        initBoard: initBoard,
        gameLoop,
        calculatePlayerStartPositions,
        updateGridSize,
        desiredDirections,
        introComplete,
        setIntroComplete,
        skipIntro,
        setSkipIntro,
        playerPositions,
        setPlayerPositions,
        showGameGrid,
        setShowGameGrid
    };

    return <TronContext.Provider value={value}>{children}</TronContext.Provider>;
};

export const useTronContext = () => {
    const context = useContext(TronContext);
    if (context === undefined) {
        throw new Error('useTronContext must be used within a TronProvider');
    }
    return context;
};
