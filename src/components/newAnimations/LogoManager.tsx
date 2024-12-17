// LetterAnimationManager.ts
import {AnimationManager} from "./AnimationManager";
import Letter3D from "../animations/letters"; // Move Letter3D to separate file
import * as THREE from 'three';
import {screenToWorld} from "./SceneManager";

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
    private lettersGroup: THREE.Group;
    private letterOptions: LetterOptions[];
    private startTime: number;
    private lettersInitialized: boolean = false;
    private currentPosition: LogoPosition = LogoPosition.CENTER;



    constructor(scene: THREE.Scene, letterOptions: LetterOptions[], startTime: number) {
        super(scene);
        this.lettersGroup = new THREE.Group();
        this.lettersGroup.position.x = 3; // Add desired offset to the left
        this.scene.add(this.lettersGroup);
        this.letterOptions = letterOptions;
        this.startTime = startTime;

    }


        private getScreenCoordinates(position: LogoPosition): { x: number, y: number, z: number } {
        switch (position) {
            case LogoPosition.TOP_MIDDLE:
                return {
                    x: window.innerWidth * 0.45,
                    y: window.innerHeight * -0.01,
                    z: 0
                };
            case LogoPosition.TOP_LEFT:
                return {
                    x: window.innerWidth * 0.1,
                    y: window.innerHeight * -0.01,
                    z: 0
                };
            case LogoPosition.TOP_RIGHT:
                return {
                    x: window.innerWidth * 0.9,
                    y: window.innerHeight * -0.01,
                    z: 0
                };
            case LogoPosition.CENTER:
                return {
                    x: window.innerWidth * 0.5,
                    y: window.innerHeight * 0.5,
                    z: 0
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
    public resizeLogo(camera: THREE.PerspectiveCamera): void {
        const coords = this.getScreenCoordinates(this.currentPosition);
        const worldPos = screenToWorld(
            camera,
            coords.x,
            coords.y,
            coords.z
        );
        this.moveToPosition(worldPos, 0.1);
    }

    // Your existing helper methods
    public moveToTopMiddle(camera: THREE.PerspectiveCamera): void {
        const coords = this.getScreenCoordinates(LogoPosition.TOP_MIDDLE);
        const worldPos = screenToWorld(
            camera,
            coords.x,
            coords.y,
            coords.z
        );
        this.moveToPosition(worldPos, 2);
        this.currentPosition = LogoPosition.TOP_MIDDLE;
    }

    private moveToTopLeft(camera: THREE.PerspectiveCamera): void {
        const coords = this.getScreenCoordinates(LogoPosition.TOP_LEFT);
        const worldPos = screenToWorld(
            camera,
            coords.x,
            coords.y,
            coords.z
        );
        this.moveToPosition(worldPos, 1);
        this.currentPosition = LogoPosition.TOP_LEFT;
    }

    private moveToTopRight(camera: THREE.PerspectiveCamera): void {
        const coords = this.getScreenCoordinates(LogoPosition.TOP_RIGHT);
        const worldPos = screenToWorld(
            camera,
            coords.x,
            coords.y,
            coords.z
        );
        this.moveToPosition(worldPos, 1);
        this.currentPosition = LogoPosition.TOP_RIGHT;
    }

    private moveToCenter(camera: THREE.PerspectiveCamera): void {
        const coords = this.getScreenCoordinates(LogoPosition.CENTER);
        const worldPos = screenToWorld(
            camera,
            coords.x,
            coords.y,
            coords.z
        );
        this.moveToPosition(worldPos, 1);
        this.currentPosition = LogoPosition.CENTER;
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

    private initializeLetters(): void {
        this.letters = this.letterOptions.map(
            options => new Letter3D(this.lettersGroup, options)
        );
    }

    update(deltaTime: number, cameraSpeed: number): boolean {
        this.elapsedTime += deltaTime;

        if (this.elapsedTime > this.startTime && !this.lettersInitialized && this.letters.length === 0) {
            this.initializeLetters();
            this.lettersInitialized = true;
        }


        for (let i = this.letters.length - 1; i >= 0; i--) {
            this.letters[i].update(deltaTime, this.elapsedTime - this.startTime)
        }
        this.lettersGroup.position.x += deltaTime * cameraSpeed;

        return this.letters.length > 0;
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