import React, { useRef, useEffect, useState } from 'react';
import { useTronContext } from '../context/GameContext';
import styled from 'styled-components';

const GameBoardContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100%;
  width: 100%;
  padding: 20px;
  box-sizing: border-box;
  background-color: ${({ theme }) => theme.colors.background};
`;

const CanvasContainer = styled.div`
  position: relative;
  width: 100%;
  height: calc(100% - 60px); // Subtract space for button and padding
  display: flex;
  justify-content: center;
  align-items: center;
`;

const StyledCanvas = styled.canvas`
  max-width: 100%;
  max-height: 100%;
  border: 2px solid ${({ theme }) => theme.colors.primary};
  box-shadow: 
    0 0 5px ${({ theme }) => theme.colors.primary},
    0 0 10px ${({ theme }) => theme.colors.primary},
    0 0 20px ${({ theme }) => theme.colors.primary};
`;

const StartButton = styled.button`
  width: 100%;
  max-width: 800px; // or any other suitable max-width
  margin-top: 20px;
  background: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.background};
  border: 2px solid ${({ theme }) => theme.colors.primary};
  box-shadow: 0 0 10px ${({ theme }) => theme.colors.primary};
  border-radius: 10px;
  padding: 10px 20px;
  font-size: 1.2rem;
  cursor: pointer;
  transition: background 0.3s ease-in-out;

  &:hover {
    background: ${({ theme }) => theme.colors.secondary};
    color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 0 15px ${({ theme }) => theme.colors.secondary};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const MAX_GRID_LINES = 20;

const GameBoard: React.FC = () => {
  const {
    gameGrid,
    players,
    gridSize,
    gameStatus,
    startGame,
    modelInitialized
  } = useTronContext();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [cellSize, setCellSize] = useState(0);

  useEffect(() => {
    const calculateCellSize = () => {
      const viewWidth = window.innerWidth;
      const viewHeight = window.innerHeight;
      const maxGridWidth = viewWidth * 0.8;
      const maxGridHeight = viewHeight * 0.8;

      const cellWidthSize = Math.floor(maxGridWidth / gridSize.width);
      const cellHeightSize = Math.floor(maxGridHeight / gridSize.height);

      return Math.min(cellWidthSize, cellHeightSize);
    };

    const handleResize = () => {
      setCellSize(calculateCellSize());
    };

    handleResize(); // Initial calculation
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [gridSize]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || cellSize === 0) return;

    canvas.width = gridSize.width * cellSize;
    canvas.height = gridSize.height * cellSize;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Calculate the spacing for grid lines
    const xSpacing = Math.max(1, Math.floor(gridSize.width / MAX_GRID_LINES));
    const ySpacing = Math.max(1, Math.floor(gridSize.height / MAX_GRID_LINES));

    // Draw the grid with subtle neon lines
    ctx.strokeStyle = `#7DFDFE`;
    ctx.lineWidth = 1;
    for (let y = 0; y < gridSize.height; y += ySpacing) {
      for (let x = 0; x < gridSize.width; x += xSpacing) {
        ctx.strokeRect(x * cellSize, y * cellSize, cellSize * xSpacing, cellSize * ySpacing);
      }
    }

    // Draw the grid cells (player paths)
    for (let y = 0; y < gridSize.height; y++) {
      for (let x = 0; x < gridSize.width; x++) {
        const cellValue = gameGrid[y][x];
        if (cellValue !== 0) {
          const player = players.find(p => p.id === cellValue);
          if (player) {
            ctx.fillStyle = player.color;
            ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
          }
        }
      }
    }

    // Draw player heads with a glowing effect
    players.forEach(player => {
      const [x, y] = player.position;
      ctx.fillStyle = 'white';
      ctx.beginPath();
      ctx.arc(
        x * cellSize + cellSize / 2,
        y * cellSize + cellSize / 2,
        cellSize / 2,
        0,
        2 * Math.PI
      );
      ctx.fill();
      ctx.strokeStyle = player.color;
      ctx.lineWidth = 2;
      ctx.shadowBlur = 15;
      ctx.shadowColor = player.color;
      ctx.stroke();
      ctx.shadowBlur = 0; // Reset shadowBlur after drawing the stroke
    });
  }, [gameGrid, players, gridSize, cellSize]);

return (
  <GameBoardContainer>
    <CanvasContainer>
      <StyledCanvas ref={canvasRef} />
    </CanvasContainer>
    <StartButton
      onClick={startGame}
      disabled={!modelInitialized || gameStatus === 'playing'}
      style={{ width: canvasRef.current ? `${canvasRef.current?.width}px` : '100%' }}
    >
      {gameStatus === 'playing' ? 'Game in Progress' : 'Start Game'}
    </StartButton>
  </GameBoardContainer>
);
};

export default GameBoard;
