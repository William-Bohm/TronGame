import React, {useEffect, useRef, useState} from 'react';
import {useTronContext} from "../../../context/GameContext";
import styled, {css, ThemeProvider} from "styled-components";
import {darkTheme, lightTheme} from "../../../theme";


const MainMenuContainer = styled.div`
    display: flex;
    flex-direction: column;
    height: 100dvh;
    z-index: 1001;
`;

const SceneContainer = styled.div`
    position: relative;
    width: 100vw;
    height: 100dvh;
`;

const SkipIntroButton = styled.button`
    position: absolute;
    top: 20px;
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
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    align-items: center;
    z-index: 1002;
`;

const StartButtonsAbsoluteWrapper = styled.div`
    //position: absolute;
    //top: 92%;
    //left: 50%;
    //transform: translate(-50%, -50%);
    pointer-events: auto;
    margin-top: 5px;
    margin-Bottom: 20px;
        // border: 2px solid ${({theme}) => theme.colors.primary};
    //@media (max-width: 1000px) {
    //    top: 92%;
    //}
`;

const StartButtonsRelativeWrapper = styled.div`
    display: flex;
    flex-direction: column;
    gap: 0.5rem; // Adds space between buttons
    @media (max-width: 1000px) {
        gap: 0;
    }
`;

const GameSpeedWrapper = styled.div`
    pointer-events: auto; // This re-enables clicks for the button
    position: absolute;
    // You can position your button wherever you want
    top: 25%;
    left: 50%;
`;

const UIColumnsWrapper = styled.div`
    width: 84%;
    z-index: 1003;
    @media (max-width: 1400px) {
        left: 5%;
        width: 90%;
    }
    @media (max-width: 1200px) {
        width: 100%;
    }

    @media (max-width: 1000px) {
        flex-direction: column;
        mask-image: linear-gradient(
                to bottom,
                transparent 0%,
                black 10%,
                black 90%,
                transparent 100%
        );
    }
    display: flex;
    justify-content: space-between;
    align-items: center;
    //border: 1px solid red;
    //pointer-events: none;

    //scrollable
    overflow-y: auto;
    overflow-x: hidden;

    > * {
        pointer-events: auto;
    }
`;

const LeftColumn = styled.div`
    position: relative;
    left: 5%;
    width: 90%; // Adjust width as needed
    @media (max-width: 1000px) {
        width: 100%;
    }
    height: 100%;
    pointer-events: auto; // Re-enable pointer events for the UI elements
    //    center elements
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
`;

const RightColumn = styled.div`
    position: relative;
    width: 50%; // Adjust width as needed
    height: 100%;
    padding: 20px;
    @media (max-width: 1000px) {
        width: 100%;
    }
    pointer-events: auto; // Re-enable pointer events for the UI elements
        // border: 2px solid ${({theme}) => theme.colors.primary};
    //justify-content: space-between;
    align-items: center;
    justify-content: space-between;
    display: flex;
    flex-direction: column;
`;

import {keyframes} from 'styled-components';
import {cssFormatColors, toRGBA} from "../../../threeJSMeterials";
import GameBoardSelector from "../components/SciFiComponents/GameBoardSelector";
import {CircleSlider} from "../components/SciFiComponents/CircleSelector";
import FuturisticButton from "../components/SciFiComponents/SciFiButton1";
import FuturisticButton2 from "../components/SciFiComponents/SciFitButton2";
import PlayerSelector from "../components/SciFiComponents/PlayerSelector";
import AnimatedRings from "../components/SciFiComponents/AnimatedRings";
import {useNavigate} from "react-router-dom";
import {withSound} from "../../../TronGame2";
import {TypeWriterText} from "../components/SciFiComponents/TypeWriterText";
import {SciFiModal} from "../components/SciFiComponents/SciFiModal";

// Create the glitch animation
const glitchAnimation = keyframes`
    0% {
        opacity: 1;
        transform: translate(-50%, -50%) skew(0deg);
        text-shadow: none;
    }
    20% {
        opacity: 0.7;
        transform: translate(-48%, -50%) skew(15deg);
        text-shadow: 4px 4px ${cssFormatColors.neonOrange}, -4px -4px ${cssFormatColors.neonBlue};
    }
    21% {
        opacity: 1;
        transform: translate(-52%, -50%) skew(-12deg);
        text-shadow: -5px 3px ${cssFormatColors.neonOrange}, 3px -5px ${cssFormatColors.neonBlue};
    }
    22% {
        opacity: 1;
        transform: translate(-50%, -50%) skew(0deg);
        text-shadow: none;
    }
    60% {
        opacity: 0.7;
        transform: translate(-52%, -50%) skew(-15deg);
        text-shadow: -4px 4px ${cssFormatColors.neonOrange}, 4px -4px ${cssFormatColors.neonBlue};
    }
    61% {
        opacity: 1;
        transform: translate(-48%, -50%) skew(12deg);
        text-shadow: 5px 3px ${cssFormatColors.neonOrange}, -3px -5px ${cssFormatColors.neonBlue};
    }
    62% {
        opacity: 1;
        transform: translate(-50%, -50%) skew(0deg);
        text-shadow: none;
    }
`;


const moveUpAnimation = keyframes`
    0%, 50% {
        top: 50%;
        left: 50%;
    }
    100% {
        top: 8%;
        left: 50%;
    }
`;

const CenteredText = styled.div<{ skipIntro: boolean }>`
    position: absolute;
    color: ${cssFormatColors.neonBlue};
    text-align: center;
    font-size: 62px;
    font-weight: 400;
    font-family: 'Orbitron', sans-serif;
    transform: translate(-50%, -50%);

    top: ${props => props.skipIntro ? '8%' : '50%'};
    left: 50%;
    animation: ${props => props.skipIntro
            ? 'none'
            : css`${glitchAnimation} 2s linear, ${moveUpAnimation} 4s ease-in-out forwards`};

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

interface MainMenuProps {
    directToMenu?: boolean;
}

const MainMenu: React.FC<MainMenuProps> = ({directToMenu = false}) => {
    const navigate = useNavigate();
    // const [gameSpeed, setGameSpeed] = useState(500);
    const isMobile = useIsMobile();
    const [lowerButtonsVisible, setLowerButtonsVisible] = useState(false);
    const [controlsVisible, setControlsVisible] = useState(false);
    const [isHowToPlayOpen, setIsHowToPlayOpen] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(0);

    const {
        setIntroComplete,
        introComplete,
        skipIntro,
        gameSpeed,
        setGameSpeed,
        setShowGameGrid
    } = useTronContext();


    useEffect(() => {
        //     timeout 1 seconds set lines to visible
        setTimeout(() => {
            setLowerButtonsVisible(true);
        }, 1000);
        setTimeout(() => {
            setControlsVisible(true);
        }, 3500);
        let isMounted = true;

        setTimeout(() => {
            // Only navigate if the component is still mounted
            if (isMounted) {
                setShowGameGrid(false);
                navigate('/menu');
            }
        }, 4000);

        // Cleanup function
        return () => {
            isMounted = false;
        };
    }, []);

    const instructions = [
        "Leave trails of light as you move - crash into any line or wall and you're out!",
        "Choose your controls or activate Bot mode in the Player Selector.",
        "Speed: 1 = Fastest, 999 = Slowest.",
        "Last survivor wins. Good luck!"
    ].filter(Boolean);


    const [isDarkMode, setIsDarkMode] = useState(true);

    return (
        <MainMenuContainer>
            {/* UI Overlay */}
            <UIOverlay>

                <CenteredText skipIntro={directToMenu || skipIntro}>Tronvolution</CenteredText>

                <div style={{height: 160}}></div>

                {(controlsVisible || directToMenu || skipIntro) && (!isHowToPlayOpen) && (
                    <UIColumnsWrapper>
                        <PlayerSelector
                            text={""}
                            onClick={() => console.log('Button clicked!')}
                        />
                        <CircleSlider value={gameSpeed} onChange={setGameSpeed}/>
                        <GameBoardSelector
                            text=""
                            onClick={() => console.log('Button clicked!')}
                        />
                    </UIColumnsWrapper>
                )}

                {(lowerButtonsVisible || directToMenu || skipIntro) && (
                    <StartButtonsAbsoluteWrapper>
                        <StartButtonsRelativeWrapper>
                            <FuturisticButton2
                                text="How to Play"
                                onClick={() => withSound(() => setIsHowToPlayOpen(true), '/sound/shimmer_synth.mp3', 0.5)()}
                            />
                            <FuturisticButton
                                text="Play Game"
                                onClick={() => withSound(() => setShowGameGrid(true))()}
                            />
                        </StartButtonsRelativeWrapper>
                    </StartButtonsAbsoluteWrapper>
                )}
            </UIOverlay>
            <SciFiModal
                isOpen={isHowToPlayOpen}
                onClose={() => setIsHowToPlayOpen(false)}
            >
                <div style={{fontSize: 30, textAlign: 'center'}}>
                    <TypeWriterText
                        text="How to play"
                        delay={0}
                        speed={10}
                    />
                </div>

                {instructions.map((instruction, index) => {
                    const delay = index === 0 ? 0 :
                        instructions
                            .slice(0, index)
                            .reduce((total, text) => total + text.length, 0) * 5;

                    return (
                        <div key={index} style={{color: '#fff'}}>
                            <TypeWriterText
                                text={instruction}
                                delay={delay}
                                speed={5}
                            />
                        </div>
                    );
                })}
            </SciFiModal>
        </MainMenuContainer>
    );
};

export default MainMenu;