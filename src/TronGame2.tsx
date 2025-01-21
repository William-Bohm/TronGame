import React, {useEffect, useState, useCallback, useRef, Suspense, lazy} from 'react';
import {Player, useTronContext} from "./context/GameContext";
import {keyframes, ThemeProvider} from "styled-components";
import {darkTheme, lightTheme} from "./theme";
import GlobalStyles from './GlobalStyles';
import styled from 'styled-components';
import './TronGame.css';
import MainMenu from "./components/mainMenu/MainMenu";
// import ThreeScene3 from "./components/newAnimations/ThreeScene3";
import GlowingDots from "./components/mainMenu/BackgroundGlowingDots";
import {useNavigate} from "react-router-dom";

import {SoundProvider} from "./context/AudioContext";
import GameBoard2 from "./components/gameboard/GameBoard";

const ThreeScene3 = lazy(() => import("./components/intro/ThreeScene3"));


const AppContainer = styled.div`
    display: flex;
    flex-direction: column;
    height: 100dvh;
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

    useEffect(() => {
        let mounted = true;

        // Check if on mobile using window.innerWidth
        const isMobile = window.innerWidth <= 768; // You can adjust this breakpoint

        if (mounted) {
            if (isMobile) {
                setIntroComplete(true);
            }

            if (!modelInitialized) {
                initBoard();
            }
        }

        return () => {
            mounted = false;
        };
    }, []);

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

    // useEffect(() => {
    //     // Set up timeout only if we're coming from direct menu route
    //     if (directToMenu) {
    //         // Cleanup function
    //         return () => {
    //             setIsMounted(false);
    //         };
    //     }
    // }, [directToMenu, navigate, isMounted]);

    // music
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);

    const togglePlay = () => {
        if (audioRef.current) {
            if (isPlaying) {
                audioRef.current.pause();
                // setIsPlaying(false);
            } else {
                audioRef.current.play();
                // setIsPlaying(true);
            }
            audioRef.current.volume = 0.3;
            setIsPlaying(!isPlaying);
        }
    };

    const [hasInteracted, setHasInteracted] = useState(false);

    useEffect(() => {
        const handleFirstInteraction = () => {
            if (audioRef.current && !hasInteracted) {
                togglePlay();
                setHasInteracted(true);
                // Remove listeners after first interaction
                document.removeEventListener('click', handleFirstInteraction);
                document.removeEventListener('keydown', handleFirstInteraction);
            }
        };

        document.addEventListener('click', handleFirstInteraction);
        document.addEventListener('keydown', handleFirstInteraction);

        return () => {
            document.removeEventListener('click', handleFirstInteraction);
            document.removeEventListener('keydown', handleFirstInteraction);
        };
    }, [hasInteracted]);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        // Prevent space from triggering the button
        if (e.code === 'Space') {
            e.preventDefault();
        }
    };


    return (
        <ThemeProvider theme={isDarkMode ? darkTheme : lightTheme}>
            <SoundProvider>
                <AppContainer>
                    <GlobalStyles/>
                    {(!introComplete && !directToMenu && !directToGame) ? (
                        // intro
                        <Suspense fallback={<div></div>}>
                            <ThreeScene3/>
                        </Suspense>
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
                                    height: '100dvh'
                                }}>
                                    <GameBoard2/>

                                </div>

                            )}
                        </div>
                    )}
                </AppContainer>
            </SoundProvider>
        </ThemeProvider>
    );
};

export default TronGame2;