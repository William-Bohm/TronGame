import React, {useEffect, useRef, useState} from 'react';
import {useTronContext} from "../../context/GameContext";
import styled, {ThemeProvider} from "styled-components";
import {darkTheme, lightTheme} from "../../theme";
import {SceneManager} from "./SceneManager";

const AppContainer = styled.div`
    display: flex;
    flex-direction: column;
    height: 100vh;
    overflow: hidden;
`;

const SceneContainer = styled.div`
    position: relative;
    width: 100vw;
    height: 100vh;
`;

const SkipIntroButton = styled.button<{ fadeOut: boolean }>`
    position: absolute;
    top: 20px;
    right: 20px;
    background: ${({theme}) => theme.colors.background};
    color: ${({theme}) => theme.colors.primary};
    border: 2px solid ${({theme}) => theme.colors.primary};
        // box-shadow: 0 0 10px ${({theme}) => theme.colors.primary};
    border-radius: 10px;
    padding: 10px 15px;
    font-size: 1.2rem;
    cursor: pointer;
    transition: background 0.2s ease-in-out, opacity 0.5s ease-in-out;
    z-index: 1000;
    opacity: ${props => props.fadeOut ? 0 : 1};

    &:hover {
        background: ${({theme}) => theme.colors.primary};
        color: ${({theme}) => theme.colors.background};
        box-shadow: 0 0 15px ${({theme}) => theme.colors.primary};
    }
`;

const ToggleLinesButton = styled.button`
    position: absolute;
    top: 100px;
    right: 20px;
    background: ${({theme}) => theme.colors.background};
    color: ${({theme}) => theme.colors.primary};
    border: 2px solid ${({theme}) => theme.colors.primary};
    box-shadow: 0 0 10px ${({theme}) => theme.colors.primary};
    border-radius: 10px;
    padding: 10px 20px;
    font-size: 1.2rem;
    cursor: pointer;
    transition: background 0.2s ease-in-out;
    z-index: 1000;

    &:hover {
        background: ${({theme}) => theme.colors.primary};
        color: ${({theme}) => theme.colors.background};
        box-shadow: 0 0 15px ${({theme}) => theme.colors.primary};
    }
`;

const UIOverlay = styled.div`
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none; // This allows clicks to pass through to the scene
    z-index: 1;
`;

const StartButtonsAbsoluteWrapper = styled.div`
    position: absolute;
    top: 92%;
    left: 50%;
    transform: translate(-50%, -50%);
    pointer-events: auto;
`;

const StartButtonsRelativeWrapper = styled.div`
    display: flex;
    flex-direction: column;
    gap: 0.5rem; // Adds space between buttons
`;

const GameSpeedWrapper = styled.div`
    pointer-events: auto; // This re-enables clicks for the button
    position: absolute;
    // You can position your button wherever you want
    top: 25%;
    left: 50%;
`;

const UIColumnsWrapper = styled.div`
    position: absolute;
    top: 15%;
    left: 8%;
    width: 84%;
    height: 80%;
    @media (max-width: 1000px) {
        left: 0;
        width: 100%;

    }
    display: flex;
    justify-content: space-between;
    pointer-events: none; // This allows clicking through to the Three.js scene
`;

const LeftColumn = styled.div`
    position: relative;
    width: 50%; // Adjust width as needed
    height: 100%;
    padding: 20px;
    pointer-events: auto; // Re-enable pointer events for the UI elements
    border: 2px solid ${({theme}) => theme.colors.primary};

`;

const RightColumn = styled.div`
    position: relative;
    width: 50%; // Adjust width as needed
    height: 100%;
    padding: 20px;
    pointer-events: auto; // Re-enable pointer events for the UI elements
    border: 2px solid ${({theme}) => theme.colors.primary};
    //justify-content: space-between;
    align-items: center;
    display: flex;
    flex-direction: column;
`;

import {keyframes} from 'styled-components';
import {cssFormatColors} from "../../threeJSMeterials";

// Create the glitch animation
const glitchAnimation = keyframes`
    0% {
        opacity: 1;
        transform: translate(-50%, -50%) skew(0deg);
        text-shadow: none;
    }
    20% {
        opacity: 0.8;
        transform: translate(-50%, -50%) skew(4deg);
        text-shadow: 2px 2px ${cssFormatColors.neonOrange}, -2px -2px ${cssFormatColors.neonBlue};
    }
    21% {
        opacity: 1;
        transform: translate(-50%, -50%) skew(0deg);
    }
    30% {
        opacity: 0.9;
        transform: translate(-50%, -50%) skew(-4deg);
        text-shadow: -2px 2px ${cssFormatColors.neonOrange}, 2px -2px ${cssFormatColors.neonBlue};
    }
    35% {
        opacity: 1;
        transform: translate(-50%, -50%) skew(0deg);
        text-shadow: none;
    }
`;

const CenteredText = styled.div`
    position: absolute;
    color: ${cssFormatColors.neonBlue};
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    text-align: center;
    font-size: 62px;
    font-weight: 400;
    font-family: 'Orbitron', sans-serif;
    animation: ${glitchAnimation} 2s ease-in-out;
    animation-iteration-count: 3; // Will run 3 times

    @media (max-width: 1024px) {
        font-size: 51px;
        letter-spacing: 1px;
    }
    @media (max-width: 768px) {
        font-size: 41px;
        letter-spacing: 0;
    }
`;


type LineConfig = {
    start: { xPercent: number; yPercent: number };
    end: { xPercent: number; yPercent: number };
};

type LineSegmentGroup = {
    id: string;
    color: string;
    thickness: number;
    segments: LineConfig[];
};

export const useIsMobile = () => {
    const [isMobile, setIsMobile] = useState(window.innerWidth >= 1000);

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth >= 1000);
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return isMobile;
};

// Use in component:
const YourComponent = () => {
    const isMobile = useIsMobile();
    // ...rest of component
};

const ThreeScene3: React.FC = () => {
    const mountRef = useRef<HTMLDivElement>(null);
    const sceneManagerRef = useRef<SceneManager | null>(null);
    const [currentAnimation, setCurrentAnimation] = useState<'intro' | 'mainMenu' | 'game'>('intro');
    const isMobile = useIsMobile();
    const [buttonFadeOut, setButtonFadeOut] = useState(false);

    const {
        setIntroComplete,
        setSkipIntro,
    } = useTronContext();


    useEffect(() => {
        console.log('ThreeScene3 mounted');
        if (!mountRef.current) return;
        const sceneManager = new SceneManager(mountRef.current);
        sceneManagerRef.current = sceneManager;
        sceneManager.setAnimationChangeCallback((newAnimation) => {
            setCurrentAnimation(newAnimation);
        });

        let lastTime = 0;
        const animate = (time: number) => {
            const deltaTime = (time - lastTime) / 1000;
            lastTime = time;

            // Check if logo animation is complete
            const isComplete = sceneManager.update(deltaTime);
            if (isComplete) {
                setTimeout(() => {
                    endIntro();
                    return; // Stop animation loop
                }, 400);
            }

            requestAnimationFrame(animate);

            // Start fade out at 11 seconds (slightly before skip)
            if (sceneManager.elapsedTime > 9) {
                setButtonFadeOut(true);
            }
            // Skip intro at 11.4 seconds
            if (sceneManager.elapsedTime > 11.4) {
                endIntro();
            }
        };

        requestAnimationFrame(animate);

        return () => {
            if (sceneManagerRef.current) {
                console.log('cleaning up now!')
                sceneManagerRef.current?.cleanup();
                sceneManagerRef.current = null;
            }
        };
    }, []);


    const endIntro = () => {
        setIntroComplete(true);
        setTimeout(() => {
            sceneManagerRef.current?.cleanup()
        }, 9000);
    };


    const skipIntro = () => {
        setIntroComplete(true);
        setSkipIntro(true);
        setTimeout(() => {
            sceneManagerRef.current?.cleanup()
        }, 9000);
    };

    const [isDarkMode, setIsDarkMode] = useState(true);

    return (
        <ThemeProvider theme={isDarkMode ? darkTheme : lightTheme}>
            <AppContainer>
                <SceneContainer>
                    {/* Three.js scene */}
                    <div ref={mountRef} style={{width: '100%', height: '100%'}}/>
                    {currentAnimation === 'intro' && (
                        <SkipIntroButton
                            onClick={() => skipIntro()}
                            disabled={false}
                            fadeOut={buttonFadeOut}
                        >
                            Skip Intro
                        </SkipIntroButton>
                    )}
                </SceneContainer>
            </AppContainer>
        </ThemeProvider>
    );
};

export default ThreeScene3;