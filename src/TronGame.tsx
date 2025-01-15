import React, {useEffect, useState, useCallback} from 'react';
import PlayerManager from './components/PlayerManager';
import {Player, useTronContext} from "./context/GameContext";
import {ThemeProvider} from "styled-components";
import {darkTheme, lightTheme} from "./theme";
import GlobalStyles from './GlobalStyles';
import NeonLogo from "./components/NeonLogo";
import GameSpeedSlider from "./components/ControllerComponents/GameSpeedSlider";
import BoardSizeSelector from "./components/ControllerComponents/BoardSizeSelector";
import styled from 'styled-components';
import Controls from "./components/Controls";
import './TronGame.css';
import ThreeScene from "./components/animations/ThreeScene";
import CubeRain from "./components/animations/fallingCubes";
import MainMenu from "./components/mainMenu/MainMenu";
import GameBoardMenu from "./components/GameBoard/GameBoard";

const AppContainer = styled.div`
    display: flex;
    flex-direction: column;
    height: 100vh;
    overflow: hidden;
`;

const LogoAnimation: React.FC = ({}) => {

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
            <NeonLogo/>
        </div>
    );
};


const TronGame: React.FC = () => {
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
                <GlobalStyles/>
                {/*<CubeRain/>*/}
                {introComplete ? (
                    <div>
                        <ThreeScene/>
                    </div>
                ) : (
                    <div>
                        <GameBoardMenu/>
                    </div>
                )}
            </AppContainer>
        </ThemeProvider>
    );
};

export default TronGame;