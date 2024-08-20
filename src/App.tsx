import React, { useEffect, useState, useCallback } from 'react';
import GameBoard from './GameBoard';
import PlayerManager from './PlayerManager';
import {useTronContext} from "./context/GameContext";

const App: React.FC = () => {

 const {
    players,
    gameStatus,
    startGame,
    resetGame,
    changePlayerDirection,
    modelInitialized,
    initBoard,
    gameLoop,
     setGameSpeed,
    gameSpeed,
     updateGridSize,
     gridSize,
desiredDirections

  } = useTronContext();

  //   init game board
  useEffect(() => {
    if (!modelInitialized) {
      initBoard();
    }
  }, [modelInitialized, initBoard]);

  const [newWidth, setNewWidth] = useState(gridSize.width);
  const [newHeight, setNewHeight] = useState(gridSize.height);

  const handleGridSizeUpdate = () => {
    updateGridSize(newWidth, newHeight);
  };

  // handle key press's
  const handleKeyPress = useCallback((event: KeyboardEvent) => {
    if (gameStatus !== 'playing') return;

    players.forEach(player => {
      if (player.type === 'human') {
        let direction: 'up' | 'down' | 'left' | 'right' | null = null;

        switch (player.controlScheme) {
          case 'wasd':
            if (event.key === 'w') direction = 'up';
            if (event.key === 'a') direction = 'left';
            if (event.key === 's') direction = 'down';
            if (event.key === 'd') direction = 'right';
            break;
          case 'arrows':
            if (event.key === 'ArrowUp') direction = 'up';
            if (event.key === 'ArrowLeft') direction = 'left';
            if (event.key === 'ArrowDown') direction = 'down';
            if (event.key === 'ArrowRight') direction = 'right';
            break;

            case 'ijkl':
            if (event.key === 'i') direction = 'up';
            if (event.key === 'j') direction = 'left';
            if (event.key === 'k') direction = 'down';
            if (event.key === 'l') direction = 'right';
            break;

            case "pl;'":
            if (event.key === 'p') direction = 'up';
            if (event.key === 'l') direction = 'left';
            if (event.key === ';' ) direction = 'down';
            if (event.key === "'") direction = 'right';
            break;

            case 'yghj':
            if (event.key === 'y') direction = 'up';
            if (event.key === 'g') direction = 'left';
            if (event.key === 'h') direction = 'down';
            if (event.key === 'j') direction = 'right';
            break;

            case 'numpad':
            if (event.key === '8') direction = 'up';
            if (event.key === '4') direction = 'left';
            if (event.key === '5') direction = 'down';
            if (event.key === '6') direction = 'right';
            break;
        }


        if (direction) {
          desiredDirections.current[player.id] = direction;
        }
      }
    });
  }, [players, gameStatus]);



    useEffect(() => {
      window.addEventListener('keydown', handleKeyPress);
      return () => {
        window.removeEventListener('keydown', handleKeyPress);
      };
    }, [handleKeyPress]);



  return (
      <div tabIndex={0}>
          <h1>Tron Game</h1>
          {/*player manager*/}
          <PlayerManager/>
          {/*game speed*/}
          <div>
              <label>
                  Game Speed:
                  <input
                      type="range"
                      min="100"
                      max="1000"
                      step="100"
                      value={gameSpeed}
                      onChange={(e) => setGameSpeed(Number(e.target.value))}
                  />
                  {gameSpeed}ms
              </label>
          </div>
          {/*board size*/}
          <div>
              <label>
                  Grid Width:
                  <input
                      type="number"
                      value={newWidth}
                      onChange={(e) => setNewWidth(Number(e.target.value))}
                      min="5"
                      max="50"
                  />
              </label>
              <label>
                  Grid Height:
                  <input
                      type="number"
                      value={newHeight}
                      onChange={(e) => setNewHeight(Number(e.target.value))}
                      min="5"
                      max="50"
                  />
              </label>
              <button onClick={handleGridSizeUpdate} disabled={gameStatus === 'playing'}>
                  Update Grid Size
              </button>
          </div>
          {/*start game*/}
          <button onClick={startGame} disabled={!modelInitialized || gameStatus === 'playing'}>
              {gameStatus === 'playing' ? 'Game in Progress' : 'Start Game'}
          </button>
          {/*game board*/}
          <GameBoard/>
      </div>
  );
};

export default App;