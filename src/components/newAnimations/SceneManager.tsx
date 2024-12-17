// SceneManager.ts
import * as THREE from 'three';
import {EffectComposer} from "three/examples/jsm/postprocessing/EffectComposer.js";
import {LineAnimationManager} from "./LineManager";
import {LogoManager} from "./LogoManager";
import {Waypoint} from "./components/Line3d";
import {useTronContext} from "../../context/GameContext";
import {RenderPass} from "three/examples/jsm/postprocessing/RenderPass";
import {UnrealBloomPass} from "three/examples/jsm/postprocessing/UnrealBloomPass";

export function screenToWorld(camera: any, screenX: number, screenY: number, targetZ: number): THREE.Vector3 {
    const aspect = window.innerWidth / window.innerHeight;

    // Convert screen coordinates to normalized device coordinates (-1 to +1)
    const normalizedX = (screenX / window.innerWidth) * 2 - 1;
    const normalizedY = -(screenY / window.innerHeight) * 2 + 1;

    // Calculate the field of view in radians
    const fovRadians = (camera.fov * Math.PI) / 180;

    // Calculate the visible height at the target Z distance
    const visibleHeight = 2 * Math.tan(fovRadians / 2) * Math.abs(targetZ - camera.position.z);
    const visibleWidth = visibleHeight * (window.innerWidth / window.innerHeight);

    // Calculate world space coordinates
    const worldX = (normalizedX * visibleWidth / 2) + camera.position.x;
    const worldY = (normalizedY * visibleHeight / 2) + camera.position.y;

    return new THREE.Vector3(worldX, worldY, targetZ);
}
// Define lines
const waypoints1: Waypoint[] = [
    {position: new THREE.Vector3(-40, 15, -20), speed: 0.5},
    {position: new THREE.Vector3(65, 15, -20), speed: 2},
    {position: new THREE.Vector3(65, -8, -20), speed: 1},
    {position: new THREE.Vector3(100, -8, -20), speed: 2},
    {position: new THREE.Vector3(100, -8, 0), speed: 1.1},
    {position: new THREE.Vector3(153, -8, 0), speed: 2},
    {position: new THREE.Vector3(153, -8, -10), speed: 2},
    {position: new THREE.Vector3(153, 5, -10), speed: 1},
    {position: new THREE.Vector3(170, 5, -10), speed: 0.3},
    {position: new THREE.Vector3(170, 70, -10), speed: 1},
];

const waypoints2: Waypoint[] = [
    {position: new THREE.Vector3(70, 50, -20), speed: 1},
    {position: new THREE.Vector3(70, -7, -20), speed: 1},
    {position: new THREE.Vector3(100, -7, -20), speed: 2},
    {position: new THREE.Vector3(100, -7, 0), speed: 1},
    {position: new THREE.Vector3(150, -7, 0), speed: 2},
    {position: new THREE.Vector3(150, -7, -10), speed: 2},
    {position: new THREE.Vector3(150, 6, -10), speed: 0.8},
    {position: new THREE.Vector3(170, 6, -10), speed: 1},
];

interface LetterOptions {
    letter: string;
    startPosition: THREE.Vector3;
    endPosition: THREE.Vector3;
    startTime: number;
    duration: number;
    initialDuration: number;
}

const lettersData: LetterOptions[] = [
    createLetterOptions('T', -23),
    createLetterOptions('r', -18),
    createLetterOptions('o', -14),
    createLetterOptions('n', -9),
    createLetterOptions('v', -4),
    createLetterOptions('o', 1),
    createLetterOptions('l', 6),
    createLetterOptions('u', 8),
    createLetterOptions('t', 13),
    createLetterOptions('i', 16),
    createLetterOptions('o', 17),
    createLetterOptions('n', 22),
];

function createLetterOptions(
    letter: string,
    xPosition: number,
    zPosition: number = -20
): LetterOptions {
    return {
        letter: letter,
        startPosition: new THREE.Vector3(
            (Math.random() - 0.5) * 100,
            (Math.random() - 0.5) * 100,
            -100 // Adjust as needed
        ),
        endPosition: new THREE.Vector3(xPosition, 0, zPosition),
        startTime: 0, // All letters start at the same time
        initialDuration: 1, // Random duration between 2 and 3 seconds
        duration: 1 + Math.random(),    // Random duration between 3 and 5 seconds
    };
}

// const {
//     setIntroComplete,
//     introComplete
// } = useTronContext();

export class SceneManager {
    private currentViewportType: 'mobile' | 'tablet' | 'desktop' = 'desktop';
    private scene: THREE.Scene;
    private camera: THREE.PerspectiveCamera;
    private renderer: THREE.WebGLRenderer;
    private composer: EffectComposer;
    private introLineManager: LineAnimationManager;
    private logoManager: LogoManager;
    private cameraSpeed: number = 25;
    private elapsedTime: number = 0;
    private introComplete: boolean = false;

    constructor(container: HTMLDivElement) {
        console.log("initializing scene");
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer({antialias: true});

        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio * 1.5);
        container.appendChild(this.renderer.domElement);

        // Composer and passes setup
        this.composer = new EffectComposer(this.renderer);
        const renderPass = new RenderPass(this.scene, this.camera);
        this.composer.addPass(renderPass);

        const bloomPass = new UnrealBloomPass(
            new THREE.Vector2(window.innerWidth, window.innerHeight),
            1,  // Strength
            0.8,  // Radius
            0.2  // Threshold
        );
        this.composer.addPass(bloomPass);

        this.camera.position.set(5, 5, 30);

        console.log("initializing scene");

        const waypoints = {
            line1: waypoints1,
            line2: waypoints2
        };
        const startTimes = {
            line1: 0,
            line2: 1.5
        };

        this.introLineManager = new LineAnimationManager(this.scene, waypoints, startTimes);
        this.logoManager = new LogoManager(this.scene, lettersData, 0);  // start time is supposed to be 7.3

         // resize controller
        window.addEventListener('resize', this.handleWindowResize.bind(this));
        this.handleWindowResize();
    }

    private getViewportType(width: number): 'mobile' | 'tablet' | 'desktop' {
        if (width < 768) return 'mobile';
        if (width < 1024) return 'tablet';
        return 'desktop';
    }

    private handleWindowResize = (): void => {
        const width = window.innerWidth;
        const height = window.innerHeight;

        // Check if we're changing viewport types
        const newViewportType = this.getViewportType(width);
        const viewportChanged = newViewportType !== this.currentViewportType;

        // Store old viewport type
        this.currentViewportType = newViewportType;

        // Adjust FOV and camera position based on screen size
        if (width < 768) {
            this.camera.fov = 90;
            this.camera.position.z = 40;
        } else if (width < 1024) {
            this.camera.fov = 80;
            this.camera.position.z = 35;
        } else { // Desktop
            this.camera.fov = 75;
            this.camera.position.z = 30;
        }

        // Update camera
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();

        // If viewport type changed, recalculate logo position
        if (viewportChanged) {
            this.logoManager.resizeLogo(this.camera);
        }

        // Rest of your resize logic
        this.renderer.setSize(width, height);
        this.composer.setSize(width, height);
        this.renderer.setPixelRatio(window.devicePixelRatio * 1.5);

        const bloomPass = this.composer.passes.find(pass => pass instanceof UnrealBloomPass) as UnrealBloomPass;
        if (bloomPass) {
            bloomPass.resolution.set(width, height);
        }
    }

    update(deltaTime: number): void {
        this.elapsedTime += deltaTime;
        this.updateCamera(deltaTime);
        this.introLineManager.update(deltaTime);
        this.logoManager.update(deltaTime, this.cameraSpeed);
        this.composer.render();

        if (!this.introComplete && this.elapsedTime > 1) {
            this.introComplete = true;
            this.cameraSpeed = 0;
            this.introLineManager.cleanup();
            this.logoManager.moveToTopMiddle(this.camera);
        }
    }

    private updateCamera(deltaTime: number): void {
        // if (!introComplete) {
        this.camera.position.x += this.cameraSpeed * deltaTime;
        this.camera.lookAt(this.camera.position.x, this.camera.position.y, 0);
        // }
    }

    cleanup(): void {
        this.introLineManager.cleanup();
        this.logoManager.cleanup();
        this.renderer.dispose();
    }
}