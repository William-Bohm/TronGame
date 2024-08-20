import React, { useRef, useEffect, useState } from 'react';
import { useTronContext } from './context/GameContext';

const GameBoard: React.FC = () => {
  const { gameGrid, players, gridSize } = useTronContext();
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

    // Draw the grid
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

    // Draw player heads
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
      ctx.stroke();
    });
  }, [gameGrid, players, gridSize, cellSize]);

  return (
    <div>
      <canvas
        ref={canvasRef}
        style={{ border: '1px solid black' }}
      />
    </div>
  );
};

export default GameBoard;