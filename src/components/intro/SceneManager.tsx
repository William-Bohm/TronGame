// SceneManager.ts
import {EffectComposer} from "three/examples/jsm/postprocessing/EffectComposer.js";
import {LineAnimationManager} from "./LineManager";
import {LogoManager} from "./LogoManager";
import {Waypoint} from "./Line3d";
import {RenderPass} from "three/examples/jsm/postprocessing/RenderPass";
import {UnrealBloomPass} from "three/examples/jsm/postprocessing/UnrealBloomPass";
import {colors} from "../../threeJSMeterials";
import {
    Color,
    Material,
    Mesh,
    PCFSoftShadowMap,
    PerspectiveCamera,
    Scene,
    Vector2,
    Vector3,
    WebGLRenderer
} from "three";

export function screenToWorld(camera: any, screenX: number, screenY: number, targetZ: number) {
    const ndcX = (screenX / window.innerWidth) * 2 - 1;
    const ndcY = -(screenY / window.innerHeight) * 2 + 1;

    // Unproject two points: one on the near plane and one on the far plane
    const nearPoint = new Vector3(ndcX, ndcY, 0).unproject(camera);
    const farPoint = new Vector3(ndcX, ndcY, 1).unproject(camera);

    // Direction from camera through the screen point
    const dir = farPoint.clone().sub(nearPoint).normalize();

    // Calculate intersection with targetZ plane
    const distance = (targetZ - nearPoint.z) / dir.z;
    const worldPosition = nearPoint.add(dir.multiplyScalar(distance));

    return worldPosition;
}

// Define lines
const waypoints1: Waypoint[] = [
    {position: new Vector3(-40, 15, -20), speed: 0.5},
    {position: new Vector3(65, 15, -20), speed: 2},
    {position: new Vector3(65, -8, -20), speed: 1},
    {position: new Vector3(100, -8, -20), speed: 2},
    {position: new Vector3(100, -8, 0), speed: 1.1},
    {position: new Vector3(153, -8, 0), speed: 2},
    {position: new Vector3(153, -8, -10), speed: 2},
    {position: new Vector3(153, 5, -10), speed: 1},
    {position: new Vector3(170, 5, -10), speed: 0.3},
    {position: new Vector3(170, 70, -10), speed: 1},
];

const waypoints2: Waypoint[] = [
    {position: new Vector3(70, 50, -20), speed: 1},
    {position: new Vector3(70, -7, -20), speed: 1},
    {position: new Vector3(100, -7, -20), speed: 2},
    {position: new Vector3(100, -7, 0), speed: 1},
    {position: new Vector3(150, -7, 0), speed: 2},
    {position: new Vector3(150, -7, -10), speed: 2},
    {position: new Vector3(150, 6, -10), speed: 0.8},
    {position: new Vector3(170, 6, -10), speed: 1},
];

interface LetterOptions {
    letter: string;
    startPosition: Vector3;
    endPosition: Vector3;
    startTime: number;
    duration: number;
    initialDuration: number;
}

const lettersData: LetterOptions[] = [
    createLetterOptions('T', -22.7),
    createLetterOptions('r', -17.4),
    createLetterOptions('o', -13.9),
    createLetterOptions('n', -9),
    createLetterOptions('v', -4),
    createLetterOptions('o', 1.2),
    createLetterOptions('l', 6),
    createLetterOptions('u', 8),
    createLetterOptions('t', 13.1),
    createLetterOptions('i', 16),
    createLetterOptions('o', 17.4),
    createLetterOptions('n', 22.2),
];


function createLetterOptions(
    letter: string,
    xPosition: number,
    zPosition: number = -20
): LetterOptions {
    return {
        letter: letter,
        startPosition: new Vector3(
            (Math.random() - 0.5) * 100,
            (Math.random() - 0.5) * 100,
            -100 // Adjust as needed
        ),
        endPosition: new Vector3(xPosition, -2.7, zPosition),
        startTime: 0, // All letters start at the same time
        initialDuration: 1, // Random duration between 2 and 3 seconds
        duration: 1 + Math.random(),    // Random duration between 3 and 5 seconds
    };
}


export class SceneManager {
    private currentViewportType: 'mobile' | 'tablet' | 'desktop' = 'desktop';
    public _currentAnimation: 'intro' | 'mainMenu' | 'game' = 'intro';
    private onAnimationChange?: (animation: 'intro' | 'mainMenu' | 'game') => void;
    private scene!: Scene;
    private camera!: PerspectiveCamera;
    private renderer!: WebGLRenderer;
    private composer!: EffectComposer;
    private introLineManager!: LineAnimationManager;
    private logoManager!: LogoManager;
    private cameraSpeed: number = 25;
    public elapsedTime: number = 0;
    private introComplete: boolean = false;
    private startTime!: number;
    private loadingPromise: Promise<void>;
    private isInitialized = false;


    constructor(container: HTMLElement) {
        this.loadingPromise = this.init(container);
    }

    private async init(container: HTMLElement) {
        try {
            console.log("initializing scene");
            this.scene = new Scene();
            this.scene.background = new Color(colors.darkGrey);
            this.camera = new PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
            this.renderer = new WebGLRenderer({antialias: true});
            this.renderer.shadowMap.enabled = true;
            this.renderer.shadowMap.type = PCFSoftShadowMap;
            this.renderer.setSize(window.innerWidth, window.innerHeight);
            this.renderer.setPixelRatio(window.devicePixelRatio * 1.5);
            container.appendChild(this.renderer.domElement);

            this.startTime = Date.now();

            // Composer and passes setup
            this.composer = new EffectComposer(this.renderer);
            const renderPass = new RenderPass(this.scene, this.camera);
            this.composer.addPass(renderPass);

            const bloomPass = new UnrealBloomPass(
                new Vector2(window.innerWidth, window.innerHeight),
                0.5,  // Strength
                0.1,  // Radius
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

            this.introLineManager = new LineAnimationManager(
                this.scene,
                waypoints,
                startTimes,
                () => {
                    // this.logoManager.initializeLetters(this.camera);
                    this.logoManager.currentAnimation = 'intro';
                }
            );

            this.logoManager = new LogoManager(
                this.scene,
                lettersData,
                0,
                () => {
                    this.introComplete = true;
                }
            );
            this.logoManager.initializeLetters();
            // resize controller
            window.addEventListener('resize', this.handleWindowResize.bind(this));
            this.handleWindowResize();

        } catch (error) {
            console.error('Failed to initialize SceneManager:', error);
            throw error;
        }
    }

    async waitForLoad() {
        await this.loadingPromise;
        return this;
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

        // Rest of your resize logic
        this.renderer.setSize(width, height);
        this.composer.setSize(width, height);
        this.renderer.setPixelRatio(window.devicePixelRatio * 1.5);

        const bloomPass = this.composer.passes.find(pass => pass instanceof UnrealBloomPass) as UnrealBloomPass;
        if (bloomPass) {
            bloomPass.resolution.set(width, height);
        }

        this.logoManager.resizeLogo(this.camera);
    }

    update(deltaTime: number): boolean {
        this.elapsedTime += deltaTime;
        let isComplete = false;

        // intro, main menu, game
        switch (this.currentAnimation) {
            case 'intro':
                this.updateIntro(deltaTime);
                isComplete = this.introComplete;
                break;
            case 'mainMenu':
                break;
        }

        this.composer.render();
        return isComplete;
    }

    private updateIntro(deltaTime: number): void {
        let startLetters = this.introLineManager.update(deltaTime);
        // if (this.logoManager.letters.length == 0) {
        //     this.logoManager.initializeLetters(this.camera);
        // }
        this.updateCamera(deltaTime);

        // Simplified logo animation logic
        if (startLetters) {

            this.logoManager.update(deltaTime, this.cameraSpeed, this.camera);
        }
    }

    private updateCamera(deltaTime: number): void {
        // if (!introComplete) {
        this.camera.position.x += this.cameraSpeed * deltaTime;
        this.camera.lookAt(this.camera.position.x, this.camera.position.y, 0);
        // }
    }

    // animation controller
    setAnimationChangeCallback(callback: (animation: 'intro' | 'mainMenu' | 'game') => void) {
        this.onAnimationChange = callback;
    }

    get currentAnimation() {
        return this._currentAnimation;  // Return the private property
    }

    cleanup(): void {
        // Stop any ongoing animations or processes
        this.isInitialized = false;  // Add this flag if you haven't already

        // Clean up Three.js resources
        this.scene.traverse((object) => {
            if (object instanceof Mesh) {
                object.geometry.dispose();
                if (object.material instanceof Material) {
                    object.material.dispose();
                } else if (Array.isArray(object.material)) {
                    object.material.forEach(material => material.dispose());
                }
            }
        });

        // Clean up your managers
        this.introLineManager.cleanup();
        this.logoManager.cleanup();

        // Clean up renderer
        this.renderer.dispose();
        this.renderer.forceContextLoss();
        this.renderer.domElement.remove();

        // Clear references
        this.scene = null!;
        this.camera = null!;
        this.renderer = null!;
        this.composer = null!;

        console.log('Scene cleanup complete');
    }
}