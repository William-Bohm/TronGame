import React, {useRef, useEffect, useState} from 'react';
import styled from 'styled-components';
import {useNavigate} from "react-router-dom";
import {useTronContext} from "../../../../context/GameContext";
import {rgba} from "polished";
import {SciFiButton} from "./backToSettingsButton";
import PlayerScoreComponent from "../SciFiComponents/PlayerScoreComponent";

const GameBoardContainer = styled.div`
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    height: 100%;
    width: 100%;
    padding: 20px;
    box-sizing: border-box;
        // background-color: ${({theme}) => theme.colors.background};
`;

const SettingsButtonContainer = styled.div`
    position: absolute;
    top: 0;
    left: 0;
`;

const CanvasContainer = styled.div`
    position: relative;
    width: 100%;
    height: calc(100% - 70px); // Subtract space for button and padding
    display: flex;
    justify-content: center;
    align-items: center;
`;

const StyledCanvas = styled.canvas`
    max-width: 100%;
    max-height: 100%;
    border: 2px solid ${({theme}) => theme.colors.primary};
    // box-shadow: 
        //   0 0 5px ${({theme}) => theme.colors.primary},
        //   0 0 10px ${({theme}) => theme.colors.primary},
        //   0 0 20px ${({theme}) => theme.colors.primary};
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
        setShowGameGrid
    } = useTronContext();
    const navigate = useNavigate();

    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const [canvasWidth, setCanvasWidth] = useState(0);
    const [boardWidth, setBoardWidth] = useState(0);
    const [cellSize, setCellSize] = useState(0);

    //
    // resize the board
    //
    useEffect(() => {
        if (canvasRef.current) {
            console.log(canvasRef.current?.width ?? 0);
            setCanvasWidth(canvasRef.current?.width ?? 0);
        }
        console.log(gameGrid)
    }, []);

    const calculateBoardSize = () => {
        const maxWidth = Math.min(window.innerWidth * (8 / 10), window.innerHeight * (8 / 10));
        const cellSize = Math.floor(maxWidth / gridSize.width);
        const actualWidth = cellSize * gridSize.width;
        return {boardWidth: actualWidth, cellSize};
    };

    // handle grid dimension resizing
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
    }, [gridSize]);

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
        ctx.strokeStyle = rgba(192, 192, 192, 0.3);
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

        if (isMounted) {
            setShowGameGrid(true);
            navigate('/game');
        }

        return () => {
            isMounted = false;
        };
    }, []);

// Reset drawn positions when game resets
    useEffect(() => {
        drawnPositionsRef.current = new Set();
    }, [gameStatus]);

    return (
        <GameBoardContainer>
            <SettingsButtonContainer>
                <SciFiButton onClick={() => navigate('/menu')}/>
            </SettingsButtonContainer>

            {players.map((player => (
                <PlayerScoreComponent player={player}/>
            )))}
            {/*<CanvasContainer>*/}
            {/*    <StyledCanvas ref={canvasRef}/>*/}
            {/*</CanvasContainer>*/}
        </GameBoardContainer>
    );
};

export default GameBoard2;