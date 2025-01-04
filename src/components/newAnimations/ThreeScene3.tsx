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

const ThreeScene3: React.FC = () => {
    const mountRef = useRef<HTMLDivElement>(null);
    const sceneManagerRef = useRef<SceneManager | null>(null);
    const [currentAnimation, setCurrentAnimation] = useState<'intro' | 'mainMenu' | 'game'>('intro');
    const [isLinesVisible, setIsLinesVisible] = useState(true);
    const [lineGroups, setLineGroups] = useState<{ [key: string]: LineSegment[] }>({});


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

    const toggleLines = () => {
        setIsLinesVisible(prev => !prev);
    };

const lineConfigs: LineSegmentGroup[] = [
    {
        id: 'line1',
        color: '#007bff',
        thickness: 3,
        segments: [
            {
                start: {xPercent: 40, yPercent: 100},
                end: {xPercent: 30, yPercent: 90}
            },
            {
                start: {xPercent: 30, yPercent: 90},
                end: {xPercent: 7, yPercent: 90}
            },
            {
                start: {xPercent: 7, yPercent: 90},
                end: {xPercent: 5, yPercent: 87}
            },
            {
                start: {xPercent: 5, yPercent: 87},
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
                start: {xPercent: 40, yPercent: 102},
                end: {xPercent: 30, yPercent: 92}
            },
            {
                start: {xPercent: 30, yPercent: 92},
                end: {xPercent: 7, yPercent: 92}
            },
            {
                start: {xPercent: 7, yPercent: 92},
                end: {xPercent: 5, yPercent: 89}
            },
            {
                start: {xPercent: 5, yPercent: 89},
                end: {xPercent: 5, yPercent: 32}
            },
            {
                start: {xPercent: 5, yPercent: 32},
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
                start: {xPercent: 42, yPercent: 100},
                end: {xPercent: 30, yPercent: 88}
            },
            {
                start: {xPercent: 30, yPercent: 88},
                end: {xPercent: 7, yPercent: 88}
            },
            {
                start: {xPercent: 7, yPercent: 88},
                end: {xPercent: 5, yPercent: 85}
            },
            {
                start: {xPercent: 5, yPercent: 85},
                end: {xPercent: 5, yPercent: 28}
            },
            {
                start: {xPercent: 5, yPercent: 28},
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
                start: {xPercent: 60, yPercent: 100},
                end: {xPercent: 70, yPercent: 90}
            },
            {
                start: {xPercent: 70, yPercent: 90},
                end: {xPercent: 93, yPercent: 90}
            },
            {
                start: {xPercent: 93, yPercent: 90},
                end: {xPercent: 95, yPercent: 87}
            },
            {
                start: {xPercent: 95, yPercent: 87},
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
                start: {xPercent: 60, yPercent: 102},
                end: {xPercent: 70, yPercent: 92}
            },
            {
                start: {xPercent: 70, yPercent: 92},
                end: {xPercent: 93, yPercent: 92}
            },
            {
                start: {xPercent: 93, yPercent: 92},
                end: {xPercent: 95, yPercent: 89}
            },
            {
                start: {xPercent: 95, yPercent: 89},
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
                start: {xPercent: 58, yPercent: 100},
                end: {xPercent: 70, yPercent: 88}
            },
            {
                start: {xPercent: 70, yPercent: 88},
                end: {xPercent: 93, yPercent: 88}
            },
            {
                start: {xPercent: 93, yPercent: 88},
                end: {xPercent: 95, yPercent: 85}
            },
            {
                start: {xPercent: 95, yPercent: 85},
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
                    <div ref={mountRef} style={{width: '100%', height: '100%'}}></div>
                    {currentAnimation === 'intro' && (
                        <SkipIntroButton
                            onClick={() => sceneManagerRef.current?.skipIntro()}
                            disabled={false}
                        >
                            Skip Intro bud
                        </SkipIntroButton>
                    )}
                    <ToggleLinesButton
                        onClick={toggleLines}
                    >
                        {isLinesVisible ? 'Hide Lines' : 'Show Lines'}
                    </ToggleLinesButton>

                    {lineConfigs.map(config => (
                        <AnimatedLine
                            segments={lineGroups[config.id] || []}
                            color={config.color}
                            thickness={config.thickness}
                        />
                    ))}

                </SceneContainer>
            </AppContainer>
        </ThemeProvider>
    );
};

export default ThreeScene3;