import React, {useRef, useEffect, useState, useCallback} from 'react';
import styled, {keyframes} from 'styled-components';
import {useNavigate} from "react-router-dom";
import {Player, PlayerMove, useTronContext} from "../../context/GameContext";
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

    const drawnPositionsRef = useRef(new Set<string>());

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas || cellSize === 0 || !playerPositions.length) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const drawWithGlow = (x: number, y: number, width: number, height: number, color: string) => {
            if (!ctx) return;

            // Clear the area first to prevent additive glowing
            ctx.clearRect(x, y, width, height);

            // Single pass with consistent glow
            ctx.save();
            // ctx.shadowColor = color;
            // ctx.shadowBlur = 15;
            // ctx.shadowOffsetX = 0;
            // ctx.shadowOffsetY = 0;
            ctx.fillStyle = color;
            ctx.fillRect(x, y, width, height);
            ctx.restore();
        };
        // First, redraw all previously drawn positions
        drawnPositionsRef.current.forEach(posKey => {
            const [x, y, playerId] = posKey.split(',');
            const player = players.find(p => p.id === parseInt(playerId));
            if (player) {
                drawWithGlow(
                    parseInt(x) * cellSize,
                    parseInt(y) * cellSize,
                    cellSize,
                    cellSize,
                    player.color
                );
            }
        });

        // Then animate new positions
        playerPositions.forEach(position => {
            const posKey = `${position.x},${position.y},${position.player_id}`;
            if (drawnPositionsRef.current.has(posKey)) return;

            const player = players.find(p => p.id === position.player_id);
            if (!player) return;

            ctx.fillStyle = player.color;
            const startX = position.x * cellSize;
            const startY = position.y * cellSize;

            const animate = () => {
                let progress = 0;
                const animationDuration = gameSpeed;
                const startTime = performance.now();

                const drawFrame = (currentTime: number) => {
                    // Redraw all previous positions first
                    ctx.clearRect(startX, startY, cellSize, cellSize);

                    // Redraw all previous positions
                    drawnPositionsRef.current.forEach(posKey => {
                        const [x, y, playerId] = posKey.split(',');
                        const player = players.find(p => p.id === parseInt(playerId));
                        if (player) {
                            drawWithGlow(
                                parseInt(x) * cellSize,
                                parseInt(y) * cellSize,
                                cellSize,
                                cellSize,
                                player.color
                            );
                        }
                    });

                    progress = (currentTime - startTime) / animationDuration;
                    if (progress >= 1) {
                        drawWithGlow(startX, startY, cellSize, cellSize, player.color);
                        drawnPositionsRef.current.add(posKey);
                        return;
                    }

                    ctx.fillStyle = player.color;
                    switch (position.direction) {
                        case 'left':
                            drawWithGlow(
                                startX + cellSize * (1 - progress),
                                startY,
                                cellSize * progress,
                                cellSize,
                                player.color
                            );
                            break;
                        case 'right':
                            drawWithGlow(
                                startX,
                                startY,
                                cellSize * progress,
                                cellSize,
                                player.color
                            );
                            break;
                        case 'up':
                            drawWithGlow(
                                startX,
                                startY + cellSize * (1 - progress),
                                cellSize,
                                cellSize * progress,
                                player.color
                            );
                            break;
                        case 'down':
                            drawWithGlow(
                                startX,
                                startY,
                                cellSize,
                                cellSize * progress,
                                player.color
                            );
                            break;
                    }
                    requestAnimationFrame(drawFrame);
                };
                requestAnimationFrame(drawFrame);
            };
            animate();
        });
    }, [playerPositions, players, cellSize]);

    useEffect(() => {
        let isMounted = true;
        drawnPositionsRef.current = new Set();
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
        drawnPositionsRef.current = new Set();
        let resetPlayers = startGame();
        initializePlayerSquares(resetPlayers);
    }

    // Reset drawn positions when game resets
    useEffect(() => {
        drawnPositionsRef.current = new Set();
    }, [gameStatus]);

    // handle key press's
    const handleKeyPress = useCallback((event: KeyboardEvent) => {
        // if space bar then start
        if (gameStatus !== 'playing') {
            if (event.key === ' ') {
                handleGameStart();
            }
            return;
        }
        players.forEach((player: Player) => {
            if (player.type === 'human') {
                // Use optional chaining to safely access nested properties
                const direction = controlSchemeMappings[player.controlScheme!]?.[event.key];
                if (direction) {
                    desiredDirections.current[player.id] = direction;
                }
            }
        });
    }, [gameStatus, players]);

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
                            Press space to start...
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