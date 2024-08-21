import React, { useEffect, useState, useCallback } from 'react';
import GameBoard from './components/GameBoard';
import PlayerManager from './components/PlayerManager';
import {useTronContext} from "./context/GameContext";
import {ThemeProvider} from "styled-components";
import {darkTheme, lightTheme} from "./theme";
import GlobalStyles from './GlobalStyles';
import NeonLogo from "./components/NeonLogo";
import GameSpeedSlider from "./components/GameSpeedSlider";
import BoardSizeSelector from "./components/BoardSizeSelector";
import styled from 'styled-components';

const TopRowWrapper = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  
  @media (max-width: 900px) {
    justify-content: center;
  }
  
  @media (max-width: 800px) {
    flex-direction: column;
    align-items: center;
  }
`;

const LogoWrapper = styled.div`
  flex: 1;
  display: flex;
  justify-content: flex-start;
    margin-left: 40px;
`;

const ControlsWrapper = styled.div`
  flex: 1;
  display: flex;
  justify-content: flex-end;
  gap: 70px; /* Space between the slider and board size selector */
      max-width: 800px;
    margin-right: 40px;

  @media (max-width: 900px) {
    justify-content: center;
    width: 100%;
  }

  @media (max-width: 800px) {
    flex-direction: column;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    
    & > * {
      width: 100%; /* Make child elements take full width */
      max-width: 400px; /* Optional: set a max-width for each control */
    }
  }
`;

const MainContent = styled.div`
  display: flex;
  flex: 1;
  overflow: hidden;

  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const PlayerManagerWrapper = styled.div`
  max-width: 500px;
  width: 20%;
  overflow-y: auto;

  @media (max-width: 768px) {
    width: 100%;
    height: 300px;
  }
`;

const GameBoardWrapper = styled.div`
  flex: 1;
  overflow: hidden;
  display: flex;
  justify-content: center;
  align-items: center;
`;


const AppContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;
`;



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


    const [isDarkMode, setIsDarkMode] = useState(true);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };


  return (
    <ThemeProvider theme={isDarkMode ? darkTheme : lightTheme}>
      <AppContainer>
        <GlobalStyles />
        <TopRowWrapper>
          <LogoWrapper>
            <NeonLogo />
          </LogoWrapper>
          <ControlsWrapper>
            <GameSpeedSlider gameSpeed={gameSpeed} setGameSpeed={setGameSpeed} />
            <BoardSizeSelector />
          </ControlsWrapper>
        </TopRowWrapper>
        <MainContent>
          <PlayerManagerWrapper>
            <PlayerManager />
          </PlayerManagerWrapper>
          <GameBoardWrapper>
            <GameBoard />
          </GameBoardWrapper>
        </MainContent>
      </AppContainer>
    </ThemeProvider>
  );
};

export default App;