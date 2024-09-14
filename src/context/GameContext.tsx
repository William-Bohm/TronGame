import React, {createContext, useContext, useState, ReactNode, useRef, useEffect} from 'react';
import {initializeModelSession, getModelMoveSuggestion} from "../onnx-handler";

export type Position = [number, number];
export type PlayerType = 'human' | 'bot';
export type ControlScheme = 'wasd' | 'yghj' | 'arrows' | 'ijkl' | "pl;'" | 'numpad' | 'bot';

export type Direction = 'up' | 'down' | 'left' | 'right';
export type GameStatus = 'waiting' | 'playing' | 'gameOver';

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
  startGame: () => void;
  resetGame: () => void;
  gameLoop: () => void;
  updateGridSize: (width: number, height: number) => void;
  changePlayerDirection: (playerId: number, direction: Direction) => void;
  desiredDirections: React.MutableRefObject<{ [key: number]: Direction }>;

  modelInitialized: boolean;
  initializeModel: () => Promise<void>;
  initBoard: () => Promise<void>;
  getMoveSuggestion: (playerId: number) => Promise<string>;
  calculatePlayerStartPositions: (players: Player[], gridSize: { width: number; height: number }) => Player[];

  availableControlSchemes: ControlScheme[];
  setAvailableControlSchemes: (schemes: ControlScheme[]) => void;
  allControlSchemes: readonly ControlScheme[];

  introComplete: boolean;
    setIntroComplete: (introComplete: boolean) => void;
}

export const TronContext = createContext<TronContextType | undefined>(undefined);

interface TronProviderProps {
  children: ReactNode;
}

export const TronProvider: React.FC<TronProviderProps> = ({ children }) => {
  const [introComplete, setIntroComplete] = useState(false);
  const [gridSize, setGridSize] = useState({ width: 10, height: 10 });
  const [gameGrid, setGameGrid] = useState<number[][]>(
      Array(gridSize.height).fill(null).map(() =>
        Array(gridSize.width).fill(0)
      )
  );
  const [players, setPlayers] = useState<Player[]>([]);
  const desiredDirections = useRef<{ [key: number]: Direction }>({});
  const [gameStatus, setGameStatus] = useState<GameStatus>('waiting');
  const isGameRunning = useRef(false);
  const [winner, setWinner] = useState<number | null>(null);
  const [gameSpeed, setGameSpeed] = useState(500);
  const [modelInitialized, setModelInitialized] = useState(false);
  const [availableControlSchemes, setAvailableControlSchemes] = useState<ControlScheme[]>([
    'yghj' , 'ijkl' , "pl;'" ,'numpad', 'bot'
  ]);
  const allControlSchemes = ['wasd', 'yghj', 'arrows', 'ijkl', "pl;'", 'numpad', 'bot'] as const;

  const updateGridSize = (width: number, height: number) => {
    if (gameStatus === 'playing') return;
    setGridSize({ width, height });
    setGameGrid(
        Array(height).fill(null).map(() =>
            Array(width).fill(0)
        )
    )
      let newPlayers = calculatePlayerStartPositions(players, gridSize);
      setPlayers(newPlayers);
  }

  const initBoard = async () => {
    await initializeModel();
    setDefaultSettings();
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
          direction: 'right',
          controlScheme: 'wasd',
          color: '#FF0000',
          score: 0
        },
        {
          id: 2,
          type: 'human',
          name: 'Player 2',
          position: [9, 5],
          direction: 'left',
          controlScheme: 'arrows',
          color: '#0000FF',
          score: 0
        }
      ];
      defaultPlayers = calculatePlayerStartPositions(defaultPlayers, gridSize);
      setPlayers(defaultPlayers);

      // // Place players on the grid
      // defaultPlayers.forEach(player => {
      //   const [x, y] = player.position;
      //   newGrid[y][x] = player.id;
      // });

      setGameStatus('waiting');
      setWinner(null);
    };

  const startGame = () => {
    // Initialize game grid, reset players, etc.
    resetGame();
    setGameStatus('playing');
    isGameRunning.current = true;
  };

  function calculatePlayerStartPositions(
    players: Player[],
    gridSize: { width: number; height: number }
  ): Player[] {
    const { width, height } = gridSize;
    const playerCount = players.length;

    // Calculate the inset amount (20% of the smaller dimension, minimum 1)
    const inset = Math.max(1, Math.floor(Math.min(width, height) * 0.2));

    // Calculate the playable area
    const playableWidth = width - 2 * inset;
    const playableHeight = height - 2 * inset;

    // Calculate the center of the playable area
    const centerX = (width - 1) / 2;
    const centerY = (height - 1) / 2;

    // Calculate the radius of the circle on which players will be placed
    const radius = Math.min(playableWidth, playableHeight) / 2 - 0.5;

    return players.map((player, index) => {
      // Calculate the angle for this player
      const angle = (index / playerCount) * 2 * Math.PI;

      // Calculate the position
      const x = Math.round(centerX + radius * Math.cos(angle));
      const y = Math.round(centerY + radius * Math.sin(angle));

      // Determine the direction based on the player's position relative to the center
      let direction: Player['direction'];
      if (Math.abs(x - centerX) > Math.abs(y - centerY)) {
        direction = x > centerX ? 'left' : 'right';
      } else {
        direction = y > centerY ? 'up' : 'down';
      }



      return {
        ...player,
        position: [x, y] as Position,
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
    // for (let player of resetPlayers) {
    //   const [x, y] = player.position;
    //   newGrid[y][x] = player.id;
    // }

    setGameGrid(newGrid);
  };

  const changePlayerDirection = (playerId: number, direction: Direction) => {
    let player = players.find(player => player.id === playerId);
      if (
          (player?.direction === 'up' && direction === 'down') ||
          (player?.direction === 'down' && direction === 'up') ||
          (player?.direction === 'left' && direction === 'right') ||
          (player?.direction === 'right' && direction === 'left')
        ) {
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
      const initialized = await initializeModelSession();
      setModelInitialized(initialized);
      console.log('Model initialized:', initialized);
    } catch (error) {
      console.error('Failed to initialize AI model:', error);
      setModelInitialized(false);
    }
  };

const getMoveSuggestion = async (playerId: number): Promise<Direction> => {
  const prepareModelInput = (currentPlayer: Player): Float32Array => {
    // Create a copy of the game grid
    const gridCopy = gameGrid.map(row => [...row]);

    // Mark the current player's position
    const [currentX, currentY] = currentPlayer.position;

    // Check if the current position is within bounds
    if (currentY >= 0 && currentY < gridSize.height && currentX >= 0 && currentX < gridSize.width) {
      gridCopy[currentY][currentX] = currentPlayer.id;
    }

    // Flatten the grid
    const flatGrid = gridCopy.flat();

    // Create arrays for current player and other players
    const currentPlayerPosition = new Array(gridSize.height * gridSize.width).fill(0);
    const otherPlayersPosition = new Array(gridSize.height * gridSize.width).fill(0);

    // Mark player positions
    players.forEach(p => {
      const [x, y] = p.position;
      const index = y * gridSize.width + x;
      if (x >= 0 && x < gridSize.width && y >= 0 && y < gridSize.height) {
        if (p.id === currentPlayer.id) {
          currentPlayerPosition[index] = 1;
        } else {
          otherPlayersPosition[index] = 1;
        }
      }
    });

  // Combine all information into a single Float32Array
    return new Float32Array([...flatGrid, ...currentPlayerPosition, ...otherPlayersPosition]);
  };

  const simulateMove = (player: Player, direction: Direction): Player => {
    let [x, y] = player.position;
    switch (direction) {
      case 'up':
        y -= 1;
        break;
      case 'down':
        y += 1;
        break;
      case 'left':
        x -= 1;
        break;
      case 'right':
        x += 1;
        break;
    }
    return {
      ...player,
      position: [x, y],
      direction,
    };
  };
    const moveDecision = (outputs: number[], possibleMoves: Direction[]): Direction => {
      // Handle the decision logic here, possibly giving a very low score to out-of-bounds moves
      const maxOutputIndex = outputs.indexOf(Math.max(...outputs));
      return possibleMoves[maxOutputIndex];
    };


    if (!modelInitialized) {
      throw new Error('Model not initialized. Please call initializeAIModel() first.');
    }

    const player = players.find(p => p.id === playerId);
    if (!player || player.type !== 'bot') {
      throw new Error('Invalid player or not a bot');
    }

    const { direction } = player;
    let possibleDirections: Direction[] = [];

    // Determine the possible moves based on the current direction
    switch (direction) {
      case 'up':
        possibleDirections = ['left', 'right', 'up'];
        break;
      case 'down':
        possibleDirections = ['left', 'right', 'down'];
        break;
      case 'left':
        possibleDirections = ['up', 'down', 'left'];
        break;
      case 'right':
        possibleDirections = ['up', 'down', 'right'];
        break;
    }

 const modelOutputs: number[] = [];
  const validDirections: Direction[] = [];
  const isValidMove = (player: Player, direction: Direction): boolean => {
    let [x, y] = player.position;
    switch (direction) {
      case 'up':
        y -= 1;
        break;
      case 'down':
        y += 1;
        break;
      case 'left':
        x -= 1;
        break;
      case 'right':
        x += 1;
        break;
    }
    // Check if the move is within the grid and the square is empty (zero)
    return x >= 0 && x < gridSize.width && y >= 0 && y < gridSize.height && gameGrid[y][x] === 0;
  };

  for (const dir of possibleDirections) {
    if (isValidMove(player, dir)) {
      const simulatedPlayer = simulateMove(player, dir);
      const input = prepareModelInput(simulatedPlayer);
      const modelOutput = await getModelMoveSuggestion(input, [1, 3, gridSize.height, gridSize.width]);
      modelOutputs.push(modelOutput);
      validDirections.push(dir);
    }
  }

  // If no valid moves, return the current direction (or handle game over)
  if (validDirections.length === 0) {
    return player.direction;
  }

  return moveDecision(modelOutputs, validDirections);
  };

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

const gameLoop = () => {
  console.log("game loop running...");
  if (gameStatus !== 'playing') {
    console.log('game not running');
    return;
  }

  let newGrid = [...gameGrid];

  // Update players' directions from desiredDirections
  const newPlayers = players.map(player => {
    const desiredDirection = desiredDirections.current[player.id];
    if (
      desiredDirection &&
      player.direction !== desiredDirection &&
      !(
        (player.direction === 'up' && desiredDirection === 'down') ||
        (player.direction === 'down' && desiredDirection === 'up') ||
        (player.direction === 'left' && desiredDirection === 'right') ||
        (player.direction === 'right' && desiredDirection === 'left')
      )
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

  // Check game over condition after all players have moved
  const { gameOver, winner } = isGameOver(newPlayers);
  if (gameOver) {
    isGameRunning.current = false;
    console.log(gameOver, winner);
    setGameStatus('gameOver');
    setWinner(winner);
    return;
  }

  // Move AI players
  newPlayers.forEach(async (player) => {
    if (player.type === 'bot' && player.alive) {
      const aiMove = await getMoveSuggestion(player.id);
      console.log('AI move:', aiMove);
      desiredDirections.current[player.id] = aiMove as Direction;
    }
  });
  setPlayers(newPlayers);

  // Update grid
  setGameGrid(newGrid);
};

  useEffect(() => {
    let timeoutId: number;

    const loop = () => {
      gameLoop();
      timeoutId = window.setTimeout(loop, gameSpeed);
    };

    if (gameStatus === 'playing') {
      timeoutId = window.setTimeout(loop, gameSpeed);
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
    getMoveSuggestion,
    availableControlSchemes,
    setAvailableControlSchemes,
    allControlSchemes,
    initBoard: initBoard,
    gameLoop,
    calculatePlayerStartPositions,
    updateGridSize,
    desiredDirections,
    introComplete,
    setIntroComplete
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