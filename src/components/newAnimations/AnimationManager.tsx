// AnimationManager.ts
import React, {useEffect, useRef, useState} from 'react';
import * as THREE from 'three';
import {EffectComposer} from 'three/examples/jsm/postprocessing/EffectComposer.js';
import {RenderPass} from 'three/examples/jsm/postprocessing/RenderPass.js';
import {UnrealBloomPass} from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import Letter3D from "../animations/letters";
import {useTronContext} from "../../context/GameContext";
import styled, {ThemeProvider} from "styled-components";
import {darkTheme, lightTheme} from "../../theme";


export abstract class AnimationManager {
    protected scene: THREE.Scene;
    protected elapsedTime: number = 0;

    constructor(scene: THREE.Scene) {
        this.scene = scene;
    }

    abstract update(deltaTime: number, cameraSpeed?: number): boolean;
    abstract cleanup(): void;
}

