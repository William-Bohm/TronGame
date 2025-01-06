import React, {useEffect, useRef, useState} from 'react';
import * as THREE from 'three';
import {EffectComposer} from 'three/examples/jsm/postprocessing/EffectComposer.js';
import {RenderPass} from 'three/examples/jsm/postprocessing/RenderPass.js';
import {UnrealBloomPass} from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import Letter3D from "../animations/letters";
import {useTronContext} from "../../context/GameContext";
import styled, {ThemeProvider} from "styled-components";
import {darkTheme, lightTheme} from "../../theme";
import {SceneManager} from "./SceneManager";

import {NeonMultiLine} from "./mainMenuLines/mainMenuLinesComponent";
import {AnimatedLine, LineSegment} from "./mainMenuLines/newLines";
import FuturisticButton from "./components/SciFiComponents/SciFiButton1";
import {CircleSlider} from "./components/SciFiComponents/CircleSelector";
import FuturisticButton2 from "./components/SciFiComponents/SciFitButton2";


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

    @media (max-width: 1000px) {
        top: 90%; // or whatever percentage you want for mobile
    }
    @media (max-width: 750px) {
        top: 92%; // or whatever percentage you want for mobile
    }

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
    @media (max-width: 750px) {
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
  const [isMobile, setIsMobile] = useState(window.innerWidth >= 750);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth >= 750);
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
    const [lineGroups, setLineGroups] = useState<{ [key: string]: LineSegment[] }>({});
    const [gameSpeed, setGameSpeed] = useState(500);
    const isMobile = useIsMobile();


    useEffect(() => {
        console.log('ThreeScene3 mounted');
        if (!mountRef.current) return;

        const sceneManager = new SceneManager(mountRef.current);
        sceneManagerRef.current = sceneManager;

        // animation callback
        sceneManager.setAnimationChangeCallback((newAnimation) => {
            setCurrentAnimation(newAnimation);
        });

        let lastTime = 0;
        const animate = (time: number) => {
            const deltaTime = (time - lastTime) / 1000;
            lastTime = time;

            sceneManager.update(deltaTime);
            requestAnimationFrame(animate);
        };

        requestAnimationFrame(animate);

        return () => {
            if (sceneManagerRef.current) {
                console.log('cleaning up now!')
                sceneManagerRef.current?.cleanup();
            }
        };
    }, []);

    const {
        setIntroComplete,
        introComplete
    } = useTronContext();

    const lineConfigs: LineSegmentGroup[] = [
        {
            id: 'line1',
            color: '#007bff',
            thickness: 3,
            segments: [
                {
                    start: {xPercent: 35, yPercent: 100},
                    end: {xPercent: 25, yPercent: 93}
                },
                {
                    start: {xPercent: 25, yPercent: 93},
                    end: {xPercent: 7, yPercent: 93}
                },
                {
                    start: {xPercent: 7, yPercent: 93},
                    end: {xPercent: 5, yPercent: 90}
                },
                {
                    start: {xPercent: 5, yPercent: 90},
                    end: {xPercent: 5, yPercent: 30}
                },
                {
                    start: {xPercent: 5, yPercent: 30},
                    end: {xPercent: 0, yPercent: 23}
                },
            ]
        },
        {
            id: 'line2',
            color: '#007bff',
            thickness: 3,
            segments: [
                {
                    start: {xPercent: 32, yPercent: 100},
                    end: {xPercent: 25, yPercent: 95}
                },
                {
                    start: {xPercent: 25, yPercent: 95},
                    end: {xPercent: 7, yPercent: 95}
                },
                {
                    start: {xPercent: 7, yPercent: 95},
                    end: {xPercent: 5, yPercent: 92}
                },
                {
                    start: {xPercent: 5, yPercent: 92},
                    end: {xPercent: 5, yPercent: 50}
                },
                {
                    start: {xPercent: 5, yPercent: 50},
                    end: {xPercent: 4, yPercent: 50}
                },
                {
                    start: {xPercent: 4, yPercent: 50},
                    end: {xPercent: 4, yPercent: 31}
                },
                {
                    start: {xPercent: 4, yPercent: 31},
                    end: {xPercent: 0, yPercent: 25}
                },
            ]
        },
        {
            id: 'line3',
            color: '#007bff',
            thickness: 3,
            segments: [
                {
                    start: {xPercent: 38, yPercent: 100},
                    end: {xPercent: 25, yPercent: 91}
                },
                {
                    start: {xPercent: 25, yPercent: 91},
                    end: {xPercent: 7, yPercent: 91}
                },
                {
                    start: {xPercent: 7, yPercent: 91},
                    end: {xPercent: 5, yPercent: 88}
                },
                {
                    start: {xPercent: 5, yPercent: 88},
                    end: {xPercent: 5, yPercent: 70}
                },
                {
                    start: {xPercent: 5, yPercent: 70},
                    end: {xPercent: 6, yPercent: 70}
                },
                {
                    start: {xPercent: 6, yPercent: 70},
                    end: {xPercent: 6, yPercent: 29}
                },
                {
                    start: {xPercent: 6, yPercent: 29},
                    end: {xPercent: 0, yPercent: 21}
                },
            ]
        },
        {
            id: 'mirroredLine1',
            color: '#007bff',
            thickness: 3,
            segments: [
                {
                    start: {xPercent: 65, yPercent: 100},
                    end: {xPercent: 75, yPercent: 93}
                },
                {
                    start: {xPercent: 75, yPercent: 93},
                    end: {xPercent: 93, yPercent: 93}
                },
                {
                    start: {xPercent: 93, yPercent: 93},
                    end: {xPercent: 95, yPercent: 90}
                },
                {
                    start: {xPercent: 95, yPercent: 90},
                    end: {xPercent: 95, yPercent: 30}
                },
                {
                    start: {xPercent: 95, yPercent: 30},
                    end: {xPercent: 100, yPercent: 23}
                },
            ]
        },
        {
            id: 'mirroredLine2',
            color: '#007bff',
            thickness: 3,
            segments: [
                {
                    start: {xPercent: 68, yPercent: 100},
                    end: {xPercent: 75, yPercent: 95}
                },
                {
                    start: {xPercent: 75, yPercent: 95},
                    end: {xPercent: 93, yPercent: 95}
                },
                {
                    start: {xPercent: 93, yPercent: 95},
                    end: {xPercent: 95, yPercent: 92}
                },
                {
                    start: {xPercent: 95, yPercent: 92},
                    end: {xPercent: 95, yPercent: 32}
                },
                {
                    start: {xPercent: 95, yPercent: 32},
                    end: {xPercent: 100, yPercent: 25}
                },
            ]
        },
        {
            id: 'mirroredLine3',
            color: '#007bff',
            thickness: 3,
            segments: [
                {
                    start: {xPercent: 62, yPercent: 100},
                    end: {xPercent: 75, yPercent: 91}
                },
                {
                    start: {xPercent: 75, yPercent: 91},
                    end: {xPercent: 93, yPercent: 91}
                },
                {
                    start: {xPercent: 93, yPercent: 91},
                    end: {xPercent: 95, yPercent: 88}
                },
                {
                    start: {xPercent: 95, yPercent: 88},
                    end: {xPercent: 95, yPercent: 28}
                },
                {
                    start: {xPercent: 95, yPercent: 28},
                    end: {xPercent: 100, yPercent: 21}
                },
            ]
        }
    ];


    useEffect(() => {
        const updateLineSegments = () => {
            const screenHeight = window.innerHeight;
            const screenWidth = window.innerWidth;

            const newGroups = lineConfigs.reduce((acc, group) => {
                const convertedSegments = group.segments.map(segment => ({
                    start: {
                        x: (segment.start.xPercent / 100) * screenWidth,
                        y: (segment.start.yPercent / 100) * screenHeight
                    },
                    end: {
                        x: (segment.end.xPercent / 100) * screenWidth,
                        y: (segment.end.yPercent / 100) * screenHeight
                    },
                }));

                acc[group.id] = convertedSegments;
                return acc;
            }, {} as { [key: string]: LineSegment[] });

            setLineGroups(newGroups);
        };

        updateLineSegments();
        window.addEventListener('resize', updateLineSegments);
        return () => window.removeEventListener('resize', updateLineSegments);
    }, []);


    const [isDarkMode, setIsDarkMode] = useState(true);

    return (
        <ThemeProvider theme={isDarkMode ? darkTheme : lightTheme}>
            <AppContainer>
                <SceneContainer>
                    {/* Three.js scene */}
                    <div ref={mountRef} style={{width: '100%', height: '100%'}}/>

                    {/* UI Overlay */}
                    <UIOverlay>
                        {/*{currentAnimation === 'intro' && (*/}
                        {/*    <ButtonWrapper>*/}
                        {/*        <SkipIntroButton*/}
                        {/*            onClick={() => sceneManagerRef.current?.skipIntro()}*/}
                        {/*            disabled={false}*/}
                        {/*        >*/}
                        {/*            Skip Intro bud*/}
                        {/*        </SkipIntroButton>*/}
                        {/*    </ButtonWrapper>*/}
                        {/*)}*/}

                        {isMobile && (
                            <>
                                {lineConfigs.map(config => (
                                    <AnimatedLine
                                        segments={lineGroups[config.id] || []}
                                        color={config.color}
                                        thickness={config.thickness}
                                    />
                                ))}
                            </>
                        )}

                        <UIColumnsWrapper>
                            {/* Left Column */}
                            <LeftColumn>
                                {/* Put your left side content here */}
                            </LeftColumn>

                            {/* Right Column */}
                            <RightColumn>
                                <CircleSlider value={gameSpeed} onChange={setGameSpeed}/>
                            </RightColumn>
                        </UIColumnsWrapper>

                        <StartButtonsAbsoluteWrapper>
                            <StartButtonsRelativeWrapper>
                                <FuturisticButton2
                                    text="How to Play"
                                    onClick={() => console.log('Button clicked!')}
                                />
                                <FuturisticButton
                                    text="Start Game"
                                    onClick={() => console.log('Button clicked!')}
                                />
                            </StartButtonsRelativeWrapper>
                        </StartButtonsAbsoluteWrapper>

                    </UIOverlay>
                </SceneContainer>
            </AppContainer>
        </ThemeProvider>
    );
};

export default ThreeScene3;