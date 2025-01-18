// LetterAnimationManager.ts
import {AnimationManager} from "./AnimationManager";
import * as THREE from 'three';
import {screenToWorld} from "./SceneManager";
import {Line3D, Waypoint} from "./components/Line3d";
import {UnderlineMesh} from "./components/simpleLine3d";
import {materials} from "../../threeJSMeterials";
import Letter3D from "./components/Letters3D";

interface LetterOptions {
    letter: string;
    startPosition: THREE.Vector3;
    endPosition: THREE.Vector3;
    startTime: number;
    duration: number;
    initialDuration: number;
}

export enum LogoPosition {
    TOP_MIDDLE = 'TOP_MIDDLE',
    TOP_LEFT = 'TOP_LEFT',
    TOP_RIGHT = 'TOP_RIGHT',
    CENTER = 'CENTER',
}


export class LogoManager extends AnimationManager {
    private letters: Letter3D[] = [];
    public currentAnimation: 'unInitialized' | 'intro' | 'mainMenu' | 'game' = 'unInitialized';
    public lettersGroup: THREE.Group;
    private letterOptions: LetterOptions[];
    private startTime: number;
    private lettersInitialized: boolean = false;
    public currentPosition: LogoPosition = LogoPosition.CENTER;
    private onComplete?: () => void;

    constructor(scene: THREE.Scene, letterOptions: LetterOptions[], startTime: number, onComplete?: () => void) {
        super(scene);
        this.lettersGroup = new THREE.Group();
        this.lettersGroup.position.x = 0;
        this.scene.add(this.lettersGroup);
        this.letterOptions = letterOptions;
        this.startTime = startTime;
        this.onComplete = onComplete;
    }

    private getScreenCoordinates(position: LogoPosition): { x: number, y: number, z: number } {
        switch (position) {
            case LogoPosition.TOP_MIDDLE:
                return {
                    x: window.innerWidth * 0.47,
                    y: window.innerHeight * -0.01,
                    z: -20
                };
            case LogoPosition.TOP_RIGHT:
                return {
                    x: window.innerWidth * 0.9,
                    y: window.innerHeight * -0.01,
                    z: -20
                };
            case LogoPosition.CENTER:
                return {
                    x: window.innerWidth * 0.49,
                    y: window.innerHeight * 0.5,
                    z: -20
                };
            default:
                return {
                    x: window.innerWidth * 0.5,
                    y: window.innerHeight * 0.5,
                    z: 0
                };
        }
    }

    // Method to resize/reposition logo based on current position
    public resizeLogo(camera: THREE.PerspectiveCamera, speed: number = 0.0001): void {
        console.log('Resizing logo to: ', this.currentPosition);
        const coords = this.getScreenCoordinates(this.currentPosition);
        const worldPos = screenToWorld(
            camera,
            coords.x,
            coords.y,
            coords.z
        );
        console.log('World pos: ', worldPos);
        const screenWidth = window.innerWidth;
        if (screenWidth < 768) {
            worldPos.x -= 0.4; // Adjust this value as needed for mobile
        } else if (screenWidth < 1024) {
            worldPos.x -= 0.6; // Adjust this value as needed for tablets
        }


        this.moveToPosition(worldPos, speed);
    }

    private easeInOutCubic(t: number): number {
        return t < 0.5
            ? 4 * t * t * t
            : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }

    // Update the original moveToPosition function with optional easing types
    public moveToPosition(targetPosition: THREE.Vector3, duration: number = 1.0): void {
        const startPosition = this.lettersGroup.position.clone();
        const startTime = this.elapsedTime;

        const animate = (currentTime: number) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);

            const eased = this.easeInOutCubic(progress);

            this.lettersGroup.position.lerpVectors(startPosition, targetPosition, eased);

            if (progress < 1) {
                requestAnimationFrame(() => animate(this.elapsedTime));
            }
        };

        animate(this.elapsedTime);
    }

    public initializeLetters(camera: THREE.PerspectiveCamera): void {
        console.log('Initializing letters');
        this.resizeLogo(camera);
        this.letters = this.letterOptions.map(
            options => new Letter3D(this.lettersGroup, options, materials.neonBlue)
        );
        this.lettersInitialized = true;
        this.elapsedTime = 0;
    }

    public updateLettersIntro(deltaTime: number, cameraSpeed: number, camera: THREE.PerspectiveCamera): void {
        this.elapsedTime += deltaTime;
        if (this.elapsedTime < 4) {
            let allComplete = true;
            for (let i = this.letters.length - 1; i >= 0; i--) {
                const isActive = this.letters[i].update(deltaTime, this.elapsedTime - this.startTime);
                if (isActive) {
                    allComplete = false;
                }
            }

            if (allComplete && this.onComplete) {
                this.onComplete();
                this.onComplete = undefined; // Prevent multiple calls
            }
        }
        this.lettersGroup.position.x += deltaTime * cameraSpeed;
    }

    update(deltaTime: number, cameraSpeed: number): boolean {
        this.lettersGroup.position.x += deltaTime * cameraSpeed;
        return true
    }

    cleanup(): void {
        console.log('Starting LetterAnimationManager cleanup');
        this.letters.forEach(letter => {
            letter.cleanup();
        });
        this.letters = [];
        console.log('LetterAnimationManager cleanup complete');
    }
}