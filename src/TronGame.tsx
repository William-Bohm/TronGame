import React, { useEffect, useState, useCallback } from 'react';
import GameBoard from './components/GameBoard';
import PlayerManager from './components/PlayerManager';
import {useTronContext} from "./context/GameContext";
import {ThemeProvider} from "styled-components";
import {darkTheme, lightTheme} from "./theme";
import GlobalStyles from './GlobalStyles';
import NeonLogo from "./components/NeonLogo";
import GameSpeedSlider from "./components/ControllerComponents/GameSpeedSlider";
import BoardSizeSelector from "./components/ControllerComponents/BoardSizeSelector";
import styled from 'styled-components';
import Controls from "./components/Controls";
import './TronGame.css';

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


const ControlsWrapper = styled.div`
  display: flex;
  flex-direction: column;
  padding: 20px;
  gap: 20px;
`;

const MainContent = styled.div`
  display: flex;
  flex: 1;
  overflow: hidden;

  @media (max-width: 768px) {
    flex-direction: column;
  }
`;
const LeftColumn = styled.div`
  display: flex;
  flex-direction: column;
  width: 500px; // Adjust this value as needed
  height: 100%;
  overflow: visible; // Add this line to allow overflow

  @media (max-width: 768px) {
    width: 100%;
    height: auto;
  }
`;
const PlayerManagerWrapper = styled.div`
  flex: 1;
  overflow-y: auto;
  
  @media (max-width: 768px) {
    height: 300px;
  }
`;

const GameBoardWrapper = styled.div`
  flex: 5;
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

const LogoAnimation: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete();
    }, 3000); // Adjust this time to match your animation duration

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="logo-animation">
      <NeonLogo />
    </div>
  );
};


const TronGame: React.FC = () => {
  const [animationComplete, setAnimationComplete] = useState(false);


 const {
    players,
    gameStatus,
    modelInitialized,
    initBoard,
  desiredDirections

  } = useTronContext();

  //   init game board
  useEffect(() => {
    if (!modelInitialized) {
      initBoard();
    }
  }, [modelInitialized, initBoard]);



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
          {/*<SceneTest/>*/}
        {/*{!animationComplete ? (*/}
        {/*  <LogoAnimation onComplete={() => setAnimationComplete(true)} />*/}
        {/*) : (*/}
        {/*  <MainContent className="game-container">*/}
        {/*    <LeftColumn>*/}
        {/*        <NeonLogo />*/}
        {/*      <ControlsWrapper>*/}
        {/*        <Controls />*/}
        {/*      </ControlsWrapper>*/}
        {/*      <PlayerManagerWrapper>*/}
        {/*        <PlayerManager />*/}
        {/*      </PlayerManagerWrapper>*/}
        {/*    </LeftColumn>*/}
        {/*    <GameBoardWrapper>*/}
        {/*      <GameBoard />*/}
        {/*    </GameBoardWrapper>*/}
        {/*  </MainContent>*/}
        {/*)}*/}
      </AppContainer>
    </ThemeProvider>
  );
};

export default TronGame;