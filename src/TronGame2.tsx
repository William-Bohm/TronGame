import React, { useEffect, useState, useCallback } from 'react';
import PlayerManager from './components/PlayerManager';
import {Player, useTronContext} from "./context/GameContext";
import {keyframes, ThemeProvider} from "styled-components";
import {darkTheme, lightTheme} from "./theme";
import GlobalStyles from './GlobalStyles';
import NeonLogo from "./components/NeonLogo";
import GameSpeedSlider from "./components/ControllerComponents/GameSpeedSlider";
import BoardSizeSelector from "./components/ControllerComponents/BoardSizeSelector";
import styled from 'styled-components';
import Controls from "./components/Controls";
import './TronGame.css';
import CubeRain from "./components/animations/fallingCubes";
import MainMenu from "./components/newAnimations/mainMenuLines/MainMenu";
import ThreeScene3 from "./components/newAnimations/ThreeScene3";
import GlowingDots from "./components/newAnimations/components/BackgroundGlowingDots";

const AppContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;
`;

const LogoAnimation: React.FC = ({ }) => {

 const {
    setIntroComplete,
     startGame
  } = useTronContext();

  useEffect(() => {
    const timer = setTimeout(() => {
      setIntroComplete(true);
    }, 13000); // Adjust this time to match your animation duration

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="logo-animation">
      <NeonLogo />
    </div>
  );
};


const fadeIn = keyframes`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
`;

export const AnimatedBackground = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: -1; // This ensures it stays behind your content
  animation: ${fadeIn} 1s ease-in 0s; // 2s 11s
  animation-fill-mode: backwards;
  
  background-image: 
    radial-gradient(
      circle,
      rgba(255, 255, 255, 0.1) 1px,
      transparent 1.5px
    ),
    radial-gradient(
      circle at center,
      rgba(0, 0, 0, 1) 0%,
      rgba(0, 0, 0, .6) 50%,
      rgba(0, 0, 0, 0.5) 100%
    ),
    url('/bluredSmokeyBackground30.png');
  
  background-size: 
    40px 40px,
    cover,
    cover;
  
  background-position: center;
  background-repeat: repeat, no-repeat, no-repeat;
  background-attachment: fixed;
`;

const TronGame2: React.FC = () => {
    const [mainMenuActive, setMainMenuActive] = useState(true);

 const {
    players,
    gameStatus,
    modelInitialized,
    initBoard,
  desiredDirections,
     introComplete,
     startGame,
     controlSchemeMappings

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


    const [isDarkMode, setIsDarkMode] = useState(true);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };


  return (
    <ThemeProvider theme={isDarkMode ? darkTheme : lightTheme}>
      <AppContainer>
        <GlobalStyles />
          <AnimatedBackground />
          <GlowingDots />
          {/*<CubeRain/>*/}
        {introComplete ? (
            <div>
                <ThreeScene3/>
            </div>
        ) : (
            <div>
                <MainMenu/>
            </div>
        )}
      </AppContainer>
    </ThemeProvider>
  );
};

export default TronGame2;