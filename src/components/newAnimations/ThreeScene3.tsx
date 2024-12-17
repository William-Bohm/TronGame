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


const ThreeScene3: React.FC = () => {
    const mountRef = useRef<HTMLDivElement>(null);
    const sceneManagerRef = useRef<SceneManager | null>(null);

    useEffect(() => {
        console.log('ThreeScene3 mounted');
        if (!mountRef.current) return;

        const sceneManager = new SceneManager(mountRef.current);
        sceneManagerRef.current = sceneManager;

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


    const [isDarkMode, setIsDarkMode] = useState(true);

    return (
        <ThemeProvider theme={isDarkMode ? darkTheme : lightTheme}>
            <AppContainer>
                <SceneContainer>
                    <div ref={mountRef} style={{width: '100%', height: '100%'}}/>
                    <SkipIntroButton
                        onClick={() => setIntroComplete(true)}
                        disabled={false}
                    >
                        Skip Intro
                    </SkipIntroButton>
                </SceneContainer>
            </AppContainer>
        </ThemeProvider>
    );
};

export default ThreeScene3;