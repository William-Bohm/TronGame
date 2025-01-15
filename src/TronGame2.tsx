import React, {useEffect, useState, useCallback} from 'react';
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
import {useNavigate} from "react-router-dom";
import GameBoard from "./components/newAnimations/components/gameboard/GameBoard";
import GameBoard2 from "./components/newAnimations/components/gameboard/GameBoard";

const AppContainer = styled.div`
    display: flex;
    flex-direction: column;
    height: 100vh;
    overflow: hidden;
`;

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
    animation: ${fadeIn} 2s ease-in; // 2s 11s
    animation-fill-mode: backwards;

    background-image: radial-gradient(
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

    background-size: 40px 40px,
    cover,
    cover;

    background-position: center;
    background-repeat: repeat, no-repeat, no-repeat;
    background-attachment: fixed;
`;

interface TronGame2Props {
    directToMenu?: boolean;
    directToGame?: boolean;
}

const TronGame2: React.FC<TronGame2Props> = ({directToMenu = false, directToGame = false}) => {
    const navigate = useNavigate();
    // const [showGameGrid, setShowGameGrid] = useState(false);
    const [isMounted, setIsMounted] = useState(true);

    const {
        players,
        gameStatus,
        modelInitialized,
        initBoard,
        desiredDirections,
        introComplete,
        skipIntro,
        startGame,
        setIntroComplete,
        setSkipIntro,
        showGameGrid,
        setShowGameGrid,
        controlSchemeMappings
    } = useTronContext();

    //   init game board
    useEffect(() => {
        let mounted = true;

        if (!modelInitialized && mounted) {
            initBoard();
        }

        return () => {
            mounted = false;
        };
    }, []);

    // handle key press's
    const handleKeyPress = useCallback((event: KeyboardEvent) => {
        // if space bar then start
        if (gameStatus !== 'playing') {
            if (event.key === ' ') {
                startGame();
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

    // useEffect(() => {
    //     if (directToGame) {
    //         navigate('/game', {replace: true});
    //     }
    //     else if (introComplete) {
    //         setTimeout(() => {
    //             navigate('/menu', {replace: true});
    //         }, 4000);
    //     }
    // }, [introComplete]);


    const [isDarkMode, setIsDarkMode] = useState(true);

    const toggleTheme = () => {
        setIsDarkMode(!isDarkMode);
    };

    useEffect(() => {
        if (directToMenu) {
            setIntroComplete(true);
            setSkipIntro(true);
            setShowGameGrid(false);
        }
        if (directToGame) {
            setShowGameGrid(true);
        }
    }, [directToMenu, directToGame]);

    useEffect(() => {
        // Set up timeout only if we're coming from direct menu route
        if (directToMenu) {
            const timer = setTimeout(() => {
                // Check if component is still mounted before navigating
                if (isMounted) {
                    navigate('/menu', {replace: true});
                }
            }, 4000);

            // Cleanup function
            return () => {
                setIsMounted(false);
                clearTimeout(timer);
            };
        }
    }, [directToMenu, navigate, isMounted]);

    return (
        <ThemeProvider theme={isDarkMode ? darkTheme : lightTheme}>
            <AppContainer>
                <GlobalStyles/>
                {(!introComplete && !directToMenu && !directToGame) ? (
                    // intro
                    <div>
                        <ThreeScene3/>
                    </div>
                ) : (
                    // main menu
                    <div>
                        <AnimatedBackground/>
                        {!showGameGrid ? (
                            <div>
                                <GlowingDots/>
                                <MainMenu
                                    // setShowGameGrid={setShowGameGrid}
                                    directToMenu={directToMenu}
                                />
                            </div>
                        ) : (
                            <div style={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                height: '100vh'
                            }}>
                                <GameBoard2/>

                            </div>

                        )}
                    </div>
                )}
            </AppContainer>
        </ThemeProvider>
    );
};

export default TronGame2;