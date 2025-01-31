import {AnimationManager} from "./AnimationManager";
import {screenToWorld} from "./SceneManager";
import {materials} from "../../threeJSMeterials";
import Letter3D from "./Letters3D";
import {Group, PerspectiveCamera, Scene, Vector3} from "three";

interface LetterOptions {
    letter: string;
    startPosition: Vector3;
    endPosition: Vector3;
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
    public letters: Letter3D[] = [];
    public currentAnimation: 'unInitialized' | 'intro' | 'mainMenu' | 'game' = 'unInitialized';
    public lettersGroup: Group;
    private letterOptions: LetterOptions[];
    private startTime: number;
    private lettersInitialized: boolean = false;
    private renderingLettersGroup: boolean = false;
    public currentPosition: LogoPosition = LogoPosition.CENTER;
    private onComplete?: () => void;

    constructor(scene: Scene, letterOptions: LetterOptions[], startTime: number, onComplete?: () => void) {
        super(scene);
        this.lettersGroup = new Group();
        this.lettersGroup.position.x = 0;
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
    public resizeLogo(camera: PerspectiveCamera, speed: number = 0.0001): void {
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
    public moveToPosition(targetPosition: Vector3, duration: number = 1.0): void {
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

    public initializeLetters(): void {
        console.log('Initializing letters');
        // this.resizeLogo(camera);
        this.letters = this.letterOptions.map(
            options => new Letter3D(this.lettersGroup, options, materials.neonBlue)
        );
        // this.lettersInitialized = true;
        // this.elapsedTime = 0;
    }

    update(deltaTime: number, cameraSpeed: number, camera: PerspectiveCamera): void {
        if (!this.renderingLettersGroup) {
            console.log('Adding letters group to scene');
            this.scene.add(this.lettersGroup);
            this.renderingLettersGroup = true;
            this.resizeLogo(camera);
            this.lettersInitialized = true;
            this.elapsedTime = 0;
        }
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

    cleanup(): void {
        console.log('Starting LetterAnimationManager cleanup');
        this.letters.forEach(letter => {
            letter.cleanup();
        });
        this.letters = [];
        console.log('LetterAnimationManager cleanup complete');
    }
}