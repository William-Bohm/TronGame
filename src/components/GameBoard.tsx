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
  height: calc(100% - 70px); // Subtract space for button and padding
  display: flex;
  justify-content: center;
  align-items: center;
`;

const StyledCanvas = styled.canvas`
  max-width: 100%;
  max-height: 100%;
  border: 2px solid ${({ theme }) => theme.colors.primary};
  // box-shadow: 
  //   0 0 5px ${({ theme }) => theme.colors.primary},
  //   0 0 10px ${({ theme }) => theme.colors.primary},
  //   0 0 20px ${({ theme }) => theme.colors.primary};
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
  const [canvasWidth, setCanvasWidth] = useState(0);

  useEffect(() => {
    if (canvasRef.current) {
      console.log(canvasRef.current?.width ?? 0);
      setCanvasWidth(canvasRef.current?.width ?? 0);
    }
  }, []);

  const [boardWidth, setBoardWidth] = useState(0);
  const [cellSize, setCellSize] = useState(0);

  const calculateBoardSize = () => {
    const maxWidth = Math.min(window.innerWidth * (3 / 5)); // 90% of window width, max 800px
    const maxHeight = Math.min(window.innerHeight * (3 / 5)); // 90% of window width, max 800px
    const cellSize = Math.floor(maxWidth / gridSize.width);
    const actualWidth = cellSize * gridSize.width;
    return { boardWidth: actualWidth, cellSize };
  };

  useEffect(() => {
    const handleResize = () => {
      const { boardWidth, cellSize } = calculateBoardSize();

      setBoardWidth(boardWidth);
      setCellSize(cellSize);
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
    ctx.strokeStyle = `#C0C0C0`;
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
  }, [gameGrid, players, gridSize, cellSize, boardWidth]);

  return (
    <GameBoardContainer>
      <CanvasContainer >
        <StyledCanvas ref={canvasRef} />
      </CanvasContainer>
    </GameBoardContainer>
  );
};

export default GameBoard;