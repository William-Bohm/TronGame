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
    private underlines: UnderlineMesh[] = [];
    private underlineSidelines: UnderlineMesh[] = [];
    public isUnderlineVisible: boolean = false;
    public isUnderlineSidelinesVisible: boolean = false;

    constructor(scene: THREE.Scene, letterOptions: LetterOptions[], startTime: number) {
        super(scene);
        this.lettersGroup = new THREE.Group();
        this.lettersGroup.position.x = 0;
        this.scene.add(this.lettersGroup);
        this.letterOptions = letterOptions;
        this.startTime = startTime;
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
        this.moveToPosition(worldPos, speed);
    }

    // Your existing helper methods
    public moveToTopMiddle(camera: THREE.PerspectiveCamera, speed: number = 2): void {
        this.currentPosition = LogoPosition.TOP_MIDDLE;
        const coords = this.getScreenCoordinates(LogoPosition.TOP_MIDDLE);
        const worldPos = screenToWorld(
            camera,
            coords.x,
            coords.y,
            coords.z
        );
        this.moveToPosition(worldPos, speed);
    }

    public moveToCenter(camera: THREE.PerspectiveCamera, speed: number = 2): void {
        const coords = this.getScreenCoordinates(LogoPosition.CENTER);
        const worldPos = screenToWorld(
            camera,
            coords.x,
            coords.y,
            coords.z
        );
        this.moveToPosition(worldPos, speed);
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

    public skipIntroAnimation(camera: THREE.PerspectiveCamera): void {
        // create letters if don't exist yet
        if (this.currentAnimation === 'unInitialized') {
            this.initializeLetters(camera);
            this.currentAnimation = 'intro';
        }

        for (let i = this.letters.length - 1; i >= 0; i--) {
            this.letters[i].skipToEnd();
            this.currentPosition = LogoPosition.TOP_MIDDLE;
        }

        this.lettersGroup.position.x = camera.position.x;


        this.resizeLogo(camera, 0.0001);
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
            for (let i = this.letters.length - 1; i >= 0; i--) {
                this.letters[i].update(deltaTime, this.elapsedTime - this.startTime)
            }
        }


        this.lettersGroup.position.x += deltaTime * cameraSpeed;
    }

    public updateLogoUnderline(deltaTime: number, cameraSpeed: number): void {
        this.underlines.forEach(underline => {
            underline.animate(deltaTime, this.isUnderlineVisible);
        });
        this.underlineSidelines.forEach(underline => {
            underline.animate(deltaTime, this.isUnderlineSidelinesVisible);
        });
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


//     underline
    public toggleUnderline(): void {
        this.isUnderlineVisible = !this.isUnderlineVisible;

        if (this.isUnderlineVisible && this.underlines.length === 0) {
            this.createUnderline();
        }
    }

    public toggleUnderlineSidelines(): void {
        console.log('toggling underline sidelines');
        this.isUnderlineSidelinesVisible = !this.isUnderlineSidelinesVisible;
        //
        // if (this.isUnderlineSidelinesVisible && this.underlineSidelines.length === 0) {
        //     this.createUnderline();
        // }
    }



    private createUnderline(): void {
        // Calculate total width of letters
        const bbox = new THREE.Box3().setFromObject(this.lettersGroup);
        const width = bbox.max.x - bbox.min.x;

        // Create underline
        const underlineVector = new THREE.Vector3(2, -2, -20);
        const leftLineVector = new THREE.Vector3(-width * 2 / 3 - 4.5 , 2, -20);
        const rightLineVector = new THREE.Vector3(width * 2 / 3 + 8.5, 2, -20);
        const underline = new UnderlineMesh(this.lettersGroup, width*2, underlineVector, 100, materials.neonBlue);
        const leftLine = new UnderlineMesh(this.lettersGroup, width * 2/ 5, leftLineVector, 20, materials.neonOrange);
        const rightLine = new UnderlineMesh(this.lettersGroup, width * 2  / 5, rightLineVector, 20, materials.neonOrange);
        this.underlines.push(underline);
        this.underlineSidelines.push(leftLine);
        this.underlineSidelines.push(rightLine);
        console.log('Underline created');
    }

}