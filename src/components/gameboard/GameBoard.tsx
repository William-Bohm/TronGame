import React, {useRef, useEffect, useState, useCallback} from 'react';
import styled, {keyframes} from 'styled-components';
import {useNavigate} from "react-router-dom";
import {
    Direction,
    getGameTickDelay,
    isStepThroughSpeed,
    Player,
    PlayerMove,
    useTronContext
} from "../../context/GameContext";
import {rgba} from "polished";
import {SciFiButton} from "./backToSettingsButton";
import {LeftPlayerScoreComponent, PlayerScoreComponents} from "../SciFiComponents/PlayerScoreComponents";
import {
    BottomLeftPlayerScoreComponent,
    BottomRightPlayerScoreComponent
} from "../SciFiComponents/BottomPlayerScoreComponents";
import {cssFormatColors} from "../../threeJSMeterials";
import {useSound} from "../../context/AudioContext";

interface GameBoardContainerProps {
    playerCount: number;
}

const typeAnimation = keyframes`
    from {
        width: 0
    }
    to {
        width: 100%
    }
`;


interface TypedTitleProps {
    fontSize: 'small' | 'big';
    color?: string;  // Optional color prop
}

const TypedTitle = styled.h2<TypedTitleProps>`
    font-family: 'Orbitron', sans-serif;
    color: ${props => props.color || cssFormatColors.neonBlue};
    text-align: center;
    margin: 0;
    display: inline-block;
    overflow: hidden;
    white-space: nowrap;
    margin-bottom: 10px;
    animation: ${typeAnimation} 1s steps(40, end);
    animation-delay: 1s;
    width: 0;
    animation-fill-mode: forwards;
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
    font-size: ${props => props.fontSize === 'small' ? '20px' : '32px'};

    @media screen and (max-width: 768px) {
        font-size: ${props => props.fontSize === 'small' ? '16px' : '24px'};
    }
`;


const GameBoardContainer = styled.div<GameBoardContainerProps>`
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    height: 100%;
    width: 100%;
    padding: 20px;
    box-sizing: border-box;
    //border: 1px solid deeppink;
    @media screen and (min-width: 1400px) {
        ${props => props.playerCount > 4 && `
            flex-direction: row;
            justify-content: space-between;
        `}
    }
`;

const PlayersContainer = styled.div<GameBoardContainerProps>`
    display: flex;
    flex-direction: column;
    width: 320px;
    align-items: center; // Add this to center children horizontally
    //border: 2px solid red;

    @media screen and (min-width: 1400px) {
        ${props => props.playerCount <= 4 && `
            flex-direction: row;
            justify-content: space-between;
            width: 800px;
        `}
    }

    @media screen and (min-width: 935px) and (max-width: 1399px) {
        flex-direction: row;
        flex-wrap: wrap;
        justify-content: space-between; // Change to center instead of space-between
        //gap: 20px; // Add some spacing between sections
        width: 100%;
        max-width: 750px;
    }
    @media screen and (min-width: 805px) and (max-width: 935px) {
        flex-direction: row;
        flex-wrap: wrap;
        justify-content: space-between; // Change to center instead of space-between
        //gap: 20px; // Add some spacing between sections
        width: 80vw;
    }

`;

const PlayerSection = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center; // Add this to center children horizontally

    //@media screen and (min-width: 805px) and (max-width: 1399px) {
    //    width: 45%;
    //}
`;

const SettingsButtonContainer = styled.div`
    position: absolute;
    top: 0;
    left: 0;
`;

const CanvasContainer = styled.div`
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
`;

const StyledCanvas = styled.canvas`
    max-width: 100%;
    max-height: 100%;
    border: 2px solid ${({theme}) => theme.colors.primary};
`;
const fadeIn = keyframes`
    from {
        opacity: 0;
    }
    to {
        opacity: 1;
    }
`;

const Overlay = styled.div`
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.7);
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    color: white;
    font-size: 24px;
    z-index: 1;
    animation: ${fadeIn} 1s ease-in forwards;
`;

const MAX_GRID_LINES = 20;

const withAlpha = (color: string, alpha: number) => {
    try {
        return rgba(color, alpha);
    } catch {
        return color;
    }
};

const createDirectionalGradient = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    size: number,
    direction: Direction,
    color: string
) => {
    const gradient = direction === 'left' || direction === 'right'
        ? ctx.createLinearGradient(x, y, x + size, y)
        : ctx.createLinearGradient(x, y, x, y + size);

    const brightStop = direction === 'left' || direction === 'up' ? 0.12 : 0.88;
    gradient.addColorStop(0, withAlpha(color, 0.2));
    gradient.addColorStop(Math.max(0, brightStop - 0.12), withAlpha(color, 0.55));
    gradient.addColorStop(brightStop, withAlpha(color, 0.95));
    gradient.addColorStop(Math.min(1, brightStop + 0.12), withAlpha('#FFFFFF', 0.55));
    gradient.addColorStop(1, withAlpha(color, 0.18));
    return gradient;
};

const drawTrailCell = (
    ctx: CanvasRenderingContext2D,
    move: PlayerMove,
    color: string,
    cellSize: number
) => {
    const x = move.x * cellSize;
    const y = move.y * cellSize;

    ctx.clearRect(x, y, cellSize, cellSize);

    ctx.save();
    ctx.shadowColor = color;
    ctx.shadowBlur = cellSize * 0.28;
    ctx.fillStyle = withAlpha(color, 0.34);
    ctx.fillRect(x, y, cellSize, cellSize);
    ctx.restore();
};

const drawTrailProgress = (
    ctx: CanvasRenderingContext2D,
    move: PlayerMove,
    color: string,
    cellSize: number,
    progress: number
) => {
    const x = move.x * cellSize;
    const y = move.y * cellSize;
    const clippedSize = cellSize * progress;

    ctx.clearRect(x, y, cellSize, cellSize);
    ctx.save();
    ctx.beginPath();
    switch (move.direction) {
        case 'left':
            ctx.rect(x + cellSize - clippedSize, y, clippedSize, cellSize);
            break;
        case 'right':
            ctx.rect(x, y, clippedSize, cellSize);
            break;
        case 'up':
            ctx.rect(x, y + cellSize - clippedSize, cellSize, clippedSize);
            break;
        case 'down':
            ctx.rect(x, y, cellSize, clippedSize);
            break;
    }
    ctx.clip();
    drawTrailCell(ctx, move, color, cellSize);
    ctx.restore();
};

const drawPlayerHead = (
    ctx: CanvasRenderingContext2D,
    move: PlayerMove,
    color: string,
    cellSize: number
) => {
    const x = move.x * cellSize;
    const y = move.y * cellSize;
    const pad = Math.max(3, cellSize * 0.16);
    const centerX = x + cellSize / 2;
    const centerY = y + cellSize / 2;

    const points: [number, number][] = (() => {
        switch (move.direction) {
            case 'left':
                return [[x + pad, centerY], [x + cellSize - pad, y + pad], [x + cellSize - pad, y + cellSize - pad]];
            case 'right':
                return [[x + cellSize - pad, centerY], [x + pad, y + pad], [x + pad, y + cellSize - pad]];
            case 'up':
                return [[centerX, y + pad], [x + pad, y + cellSize - pad], [x + cellSize - pad, y + cellSize - pad]];
            case 'down':
                return [[centerX, y + cellSize - pad], [x + pad, y + pad], [x + cellSize - pad, y + pad]];
        }
    })();

    ctx.save();
    ctx.shadowColor = color;
    ctx.shadowBlur = cellSize * 0.35;
    ctx.fillStyle = createDirectionalGradient(ctx, x, y, cellSize, move.direction, color);
    ctx.strokeStyle = withAlpha('#FFFFFF', 0.78);
    ctx.lineWidth = Math.max(1.5, cellSize * 0.055);
    ctx.beginPath();
    points.forEach(([pointX, pointY], index) => {
        if (index === 0) {
            ctx.moveTo(pointX, pointY);
        } else {
            ctx.lineTo(pointX, pointY);
        }
    });
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = withAlpha('#FFFFFF', 0.82);
    ctx.beginPath();
    ctx.arc(points[0][0], points[0][1], Math.max(2, cellSize * 0.055), 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
};

const GameBoard2: React.FC = () => {
    const {
        gameGrid,
        players,
        gridSize,
        gameStatus,
        startGame,
        modelInitialized,
        gameSpeed,
        playerPositions,
        setShowGameGrid,
        setGameStatus,
        setPlayerPositions,
        winner,
        desiredDirections,
        controlSchemeMappings,
        gameLoop,

    } = useTronContext();
    const {
        withSound,
    } = useSound();
    const navigate = useNavigate();

    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const [canvasWidth, setCanvasWidth] = useState(0);
    const [boardWidth, setBoardWidth] = useState(0);
    const [cellSize, setCellSize] = useState(0);

    // player score left and right
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);

    useEffect(() => {
        const handleResize = () => {
            setWindowWidth(window.innerWidth);
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const quarterPoint = Math.ceil(players.length / 4);
    const midpoint = Math.ceil(players.length / 2);

    // For screens 805-1400px
    const topLeftPlayers = players.slice(0, quarterPoint);
    const topRightPlayers = players.slice(quarterPoint, midpoint);
    const bottomLeftPlayers = players.slice(midpoint, midpoint + quarterPoint);
    const bottomRightPlayers = players.slice(midpoint + quarterPoint);
    const [spaceTakenUpByPlayerScoresHorizontal, setSpaceTakenUpByPlayerScoresHorizontal] = useState(0);
    const [spaceTakenUpByPlayerScoresVertical, setSpaceTakenUpByPlayerScoresVertical] = useState(0);
    const isStepThroughMode = isStepThroughSpeed(gameSpeed);
    const isStepThroughModePlayable =
        players.length === 2 &&
        players.filter(player => player.type === 'human').length === 1 &&
        players.filter(player => player.type === 'bot').length === 1;
    const canStartGame = !isStepThroughMode || isStepThroughModePlayable;
    const trailAnimationDuration = getGameTickDelay(gameSpeed);

    useEffect(() => {
        const calculateScoreSpace = () => {
            if (window.innerWidth > 1400) {
                // On large screens, scores are horizontal
                setSpaceTakenUpByPlayerScoresHorizontal(0); // Fixed width for 2 players side by side
                setSpaceTakenUpByPlayerScoresVertical(0);
            } else if (window.innerWidth >= 805) {
                // Medium screens - 2 players per row
                const numberOfRows = Math.ceil((players.length) / 4);
                setSpaceTakenUpByPlayerScoresHorizontal(0);
                if (players.length > 4) {
                    setSpaceTakenUpByPlayerScoresVertical(numberOfRows * 70); // 70px height per row
                } else {
                    setSpaceTakenUpByPlayerScoresVertical(0); // 70px height per row

                }
            } else {
                // Small screens - 1 player per row
                setSpaceTakenUpByPlayerScoresHorizontal(0);
                setSpaceTakenUpByPlayerScoresVertical((players.length / 2) * 70); // 70px height per player
            }
        };

        calculateScoreSpace();
        window.addEventListener('resize', calculateScoreSpace);
        return () => {
            window.removeEventListener('resize', calculateScoreSpace);
        };
    }, [players]);

    // For screens <805px or >1400px
    const topPlayers = players.slice(0, midpoint);
    const bottomPlayers = players.slice(midpoint);
    //
    // resize the board
    //
    useEffect(() => {
        if (canvasRef.current) {
            // console.log(canvasRef.current?.width ?? 0);
            setCanvasWidth(canvasRef.current?.width ?? 0);
        }
        // console.log(gameGrid)
    }, []);

    const calculateBoardSize = () => {
        const availableWidth = window.innerWidth * (8 / 10) - spaceTakenUpByPlayerScoresHorizontal;
        const availableHeight = window.innerHeight * (8 / 10) - spaceTakenUpByPlayerScoresVertical;
        const maxWidth = Math.min(availableWidth, availableHeight);
        const cellSize = Math.floor((maxWidth / gridSize.width) + 0.5);
        const actualWidth = cellSize * gridSize.width;
        return {boardWidth: actualWidth, cellSize};
    };

    useEffect(() => {
        const handleResize = () => {
            const {boardWidth, cellSize} = calculateBoardSize();
            setBoardWidth(boardWidth);
            setCellSize(cellSize);
        };
        handleResize(); // Initial calculation
        window.addEventListener('resize', handleResize);
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, [gridSize, spaceTakenUpByPlayerScoresHorizontal, spaceTakenUpByPlayerScoresVertical]);

    // handle viewport dimension changes..... MAYBE
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas || cellSize === 0) return;

        canvas.width = boardWidth;
        canvas.height = cellSize * gridSize.height;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Clear the canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Calculate the spacing for grid lines
        const xSpacing = Math.max(1, Math.floor(gridSize.width / MAX_GRID_LINES));
        const ySpacing = Math.max(1, Math.floor(gridSize.height / MAX_GRID_LINES));

        // Draw the grid with subtle neon lines
        ctx.strokeStyle = rgba(192, 192, 192, 0.2);
        ctx.lineWidth = 0.5;
        for (let y = 0; y < gridSize.height; y += ySpacing) {
            for (let x = 0; x < gridSize.width; x += xSpacing) {
                ctx.strokeRect(x * cellSize, y * cellSize, cellSize * xSpacing, cellSize * ySpacing);
            }
        }
    }, [players, gridSize, cellSize, boardWidth]);

    const drawnPositionsRef = useRef(new Map<string, PlayerMove>());

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas || cellSize === 0 || !playerPositions.length) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const redrawStoredTrails = () => {
            drawnPositionsRef.current.forEach((storedMove) => {
                const player = players.find(p => p.id === storedMove.player_id);
                if (player) {
                    drawTrailCell(ctx, storedMove, player.color, cellSize);
                }
            });
        };

        redrawStoredTrails();

        const drawLiveHeads = () => {
            playerPositions.forEach(position => {
                const player = players.find(p => p.id === position.player_id);
                if (player) {
                    drawPlayerHead(ctx, position, player.color, cellSize);
                }
            });
        };

        const newPositionKeys = new Set<string>();
        playerPositions.forEach(position => {
            const posKey = `${position.x},${position.y},${position.player_id}`;
            const player = players.find(p => p.id === position.player_id);
            if (player && !drawnPositionsRef.current.has(posKey)) {
                newPositionKeys.add(posKey);
            }
        });

        if (isStepThroughMode) {
            playerPositions.forEach(position => {
                const posKey = `${position.x},${position.y},${position.player_id}`;
                drawnPositionsRef.current.set(posKey, position);
            });
        }

        playerPositions.forEach(position => {
            const posKey = `${position.x},${position.y},${position.player_id}`;
            const player = players.find(p => p.id === position.player_id);
            if (!player) return;

            if (isStepThroughMode) {
                drawTrailCell(ctx, position, player.color, cellSize);
                drawPlayerHead(ctx, position, player.color, cellSize);
                return;
            }

            if (!newPositionKeys.has(posKey)) {
                drawPlayerHead(ctx, position, player.color, cellSize);
                return;
            }

            const animate = () => {
                let progress = 0;
                const animationDuration = trailAnimationDuration;
                const startTime = performance.now();

                const drawFrame = (currentTime: number) => {
                    redrawStoredTrails();

                    progress = (currentTime - startTime) / animationDuration;
                    if (progress >= 1) {
                        drawnPositionsRef.current.set(posKey, position);
                        drawTrailCell(ctx, position, player.color, cellSize);
                        drawLiveHeads();
                        return;
                    }

                    drawTrailProgress(ctx, position, player.color, cellSize, progress);
                    requestAnimationFrame(drawFrame);
                };
                requestAnimationFrame(drawFrame);
            };
            animate();
        });

        if (isStepThroughMode || newPositionKeys.size === 0) {
            drawLiveHeads();
        }
    }, [playerPositions, players, cellSize, isStepThroughMode, trailAnimationDuration]);

    useEffect(() => {
        let isMounted = true;
        drawnPositionsRef.current = new Map();
        setPlayerPositions([]);

        if (isMounted) {
            setShowGameGrid(true);
            navigate('/game');
        }
        setGameStatus('waiting');
        return () => {
            isMounted = false;
        };
    }, [])

    const handleGameStart = () => {
        if (!canStartGame) return;

        drawnPositionsRef.current = new Map();
        let resetPlayers = startGame();
        initializePlayerSquares(resetPlayers);
    }

    // handle key press's
    const handleKeyPress = useCallback((event: KeyboardEvent) => {
        if (isStepThroughMode && event.repeat) {
            return;
        }

        // if space bar then start
        if (gameStatus !== 'playing') {
            if (event.key === ' ') {
                handleGameStart();
            }
            return;
        }
        let handledHumanInput = false;

        players.forEach((player: Player) => {
            if (player.type === 'human') {
                // Use optional chaining to safely access nested properties
                const direction = controlSchemeMappings[player.controlScheme!]?.[event.key];
                if (direction) {
                    desiredDirections.current[player.id] = direction;
                    handledHumanInput = true;
                }
            }
        });

        if (isStepThroughMode && handledHumanInput) {
            gameLoop();
        }
    }, [gameStatus, players, controlSchemeMappings, desiredDirections, isStepThroughMode, gameLoop, handleGameStart]);

    useEffect(() => {
        window.addEventListener('keydown', handleKeyPress);
        return () => {
            window.removeEventListener('keydown', handleKeyPress);
        };
    }, [handleKeyPress]);

    const initializePlayerSquares = (resetPlayers: Player[]) => {
        // console.log('resetPlayers', resetPlayers);
        const initialMoves: PlayerMove[] = resetPlayers.map(player => ({
            x: player.position[0],
            y: player.position[1],
            player_id: player.id,
            direction: player.direction
        }));
        setPlayerPositions(initialMoves);
    };

    return (
        <GameBoardContainer playerCount={players.length}>
            <SettingsButtonContainer>
                <SciFiButton
                    // onClick={() => navigate('/menu')}
                    onClick={() => withSound(() => navigate('/menu'))()}

                />
            </SettingsButtonContainer>


            {/* Top players */}
            <PlayersContainer playerCount={players.length}>
                {(windowWidth >= 805 && windowWidth < 1400) || (windowWidth >= 1400 && players.length <= 4) ? (
                    <>
                        <PlayerSection>
                            {topLeftPlayers.map(player => (
                                <LeftPlayerScoreComponent player={player}/>
                            ))}
                        </PlayerSection>
                        <PlayerSection>
                            {topRightPlayers.map(player => (
                                <PlayerScoreComponents player={player}/>
                            ))}
                        </PlayerSection>
                    </>
                ) : (
                    <PlayerSection>
                        {topPlayers.map(player => (
                            <LeftPlayerScoreComponent player={player}/>
                        ))}
                    </PlayerSection>
                )}
            </PlayersContainer>

            <CanvasContainer>
                <StyledCanvas ref={canvasRef}/>
                {gameStatus === 'waiting' && (
                    <Overlay onClick={handleGameStart}
                             onTouchStart={handleGameStart}>
                        <TypedTitle fontSize={'small'}>
                            {isStepThroughMode && !isStepThroughModePlayable
                                ? "Step needs 1 human + 1 bot"
                                : isStepThroughMode
                                    ? "Press space to start step mode..."
                                    : "Press space to start..."
                            }
                        </TypedTitle>
                    </Overlay>
                )}
                {gameStatus === 'gameOver' && (
                    <Overlay onClick={handleGameStart}
                             onTouchStart={handleGameStart}>
                        <TypedTitle
                            fontSize={"big"}
                            color={winner !== null ? players.find(player => player.id === winner)?.color : undefined}
                        >
                            {winner === null
                                ? "Draw!"
                                : `${players.find(player => player.id === winner)?.name} wins!`
                            }
                        </TypedTitle>
                        <TypedTitle
                            fontSize={'small'}
                            color={winner !== null ? players.find(player => player.id === winner)?.color : undefined}
                        >
                            Press space to play again...
                        </TypedTitle>
                    </Overlay>
                )}
            </CanvasContainer>

            {/* Bottom players */}
            <PlayersContainer playerCount={players.length}>
                {(windowWidth >= 805 && windowWidth < 1400) || (windowWidth >= 1400 && players.length <= 4) ? (
                    <>
                        <PlayerSection>
                            {bottomLeftPlayers.map(player => (
                                <BottomLeftPlayerScoreComponent player={player}/>
                            ))}
                        </PlayerSection>
                        <PlayerSection>
                            {bottomRightPlayers.map(player => (
                                <BottomRightPlayerScoreComponent player={player}/>
                            ))}
                        </PlayerSection>
                    </>
                ) : windowWidth >= 1400 ? (
                    <PlayerSection>
                        {bottomPlayers.map(player => (
                            <PlayerScoreComponents player={player}/>
                        ))}
                    </PlayerSection>
                ) : (
                    <PlayerSection>
                        {bottomPlayers.map(player => (
                            <BottomRightPlayerScoreComponent player={player}/>
                        ))}
                    </PlayerSection>
                )}
            </PlayersContainer>
        </GameBoardContainer>
    );
};

export default GameBoard2;
