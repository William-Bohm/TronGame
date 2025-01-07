// SceneManager.ts
import * as THREE from 'three';
import {EffectComposer} from "three/examples/jsm/postprocessing/EffectComposer.js";
import {LineAnimationManager} from "./LineManager";
import {LogoManager, LogoPosition} from "./LogoManager";
import {Waypoint} from "./components/Line3d";
import {useTronContext} from "../../context/GameContext";
import {RenderPass} from "three/examples/jsm/postprocessing/RenderPass";
import {UnrealBloomPass} from "three/examples/jsm/postprocessing/UnrealBloomPass";
import {colors} from "../../threeJSMeterials";

export function screenToWorld(camera: any, screenX: number, screenY: number, targetZ: number) {
    const ndcX = (screenX / window.innerWidth) * 2 - 1;
    const ndcY = -(screenY / window.innerHeight) * 2 + 1;

    // Unproject two points: one on the near plane and one on the far plane
    const nearPoint = new THREE.Vector3(ndcX, ndcY, 0).unproject(camera);
    const farPoint = new THREE.Vector3(ndcX, ndcY, 1).unproject(camera);

    // Direction from camera through the screen point
    const dir = farPoint.clone().sub(nearPoint).normalize();

    // Calculate intersection with targetZ plane
    const distance = (targetZ - nearPoint.z) / dir.z;
    const worldPosition = nearPoint.add(dir.multiplyScalar(distance));

    return worldPosition;
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


const _NOISE_GLSL = `
//
// Description : Array and textureless GLSL 2D/3D/4D simplex
//               noise functions.
//      Author : Ian McEwan, Ashima Arts.
//  Maintainer : stegu
//     Lastmod : 20201014 (stegu)
//     License : Copyright (C) 2011 Ashima Arts. All rights reserved.
//               Distributed under the MIT License. See LICENSE file.
//               https://github.com/ashima/webgl-noise
//               https://github.com/stegu/webgl-noise
//

vec3 mod289(vec3 x) {
  return x - floor(x * (1.0 / 289.0)) * 289.0;
}

vec4 mod289(vec4 x) {
  return x - floor(x * (1.0 / 289.0)) * 289.0;
}

vec4 permute(vec4 x) {
     return mod289(((x*34.0)+1.0)*x);
}

vec4 taylorInvSqrt(vec4 r)
{
  return 1.79284291400159 - 0.85373472095314 * r;
}

float snoise(vec3 v)
{
  const vec2  C = vec2(1.0/6.0, 1.0/3.0) ;
  const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);

// First corner
  vec3 i  = floor(v + dot(v, C.yyy) );
  vec3 x0 =   v - i + dot(i, C.xxx) ;

// Other corners
  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min( g.xyz, l.zxy );
  vec3 i2 = max( g.xyz, l.zxy );

  //   x0 = x0 - 0.0 + 0.0 * C.xxx;
  //   x1 = x0 - i1  + 1.0 * C.xxx;
  //   x2 = x0 - i2  + 2.0 * C.xxx;
  //   x3 = x0 - 1.0 + 3.0 * C.xxx;
  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy; // 2.0*C.x = 1/3 = C.y
  vec3 x3 = x0 - D.yyy;      // -1.0+3.0*C.x = -0.5 = -D.y

// Permutations
  i = mod289(i);
  vec4 p = permute( permute( permute(
             i.z + vec4(0.0, i1.z, i2.z, 1.0 ))
           + i.y + vec4(0.0, i1.y, i2.y, 1.0 ))
           + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));

// Gradients: 7x7 points over a square, mapped onto an octahedron.
// The ring size 17*17 = 289 is close to a multiple of 49 (49*6 = 294)
  float n_ = 0.142857142857; // 1.0/7.0
  vec3  ns = n_ * D.wyz - D.xzx;

  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);  //  mod(p,7*7)

  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_ );    // mod(j,N)

  vec4 x = x_ *ns.x + ns.yyyy;
  vec4 y = y_ *ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);

  vec4 b0 = vec4( x.xy, y.xy );
  vec4 b1 = vec4( x.zw, y.zw );

  //vec4 s0 = vec4(lessThan(b0,0.0))*2.0 - 1.0;
  //vec4 s1 = vec4(lessThan(b1,0.0))*2.0 - 1.0;
  vec4 s0 = floor(b0)*2.0 + 1.0;
  vec4 s1 = floor(b1)*2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));

  vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;
  vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ;

  vec3 p0 = vec3(a0.xy,h.x);
  vec3 p1 = vec3(a0.zw,h.y);
  vec3 p2 = vec3(a1.xy,h.z);
  vec3 p3 = vec3(a1.zw,h.w);

//Normalise gradients
  vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
  p0 *= norm.x;
  p1 *= norm.y;
  p2 *= norm.z;
  p3 *= norm.w;

// Mix final noise value
  vec4 m = max(0.5 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
  m = m * m;
  return 105.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1),
                                dot(p2,x2), dot(p3,x3) ) );
}

float FBM(vec3 p) {
  float value = 0.0;
  float amplitude = 0.5;
  float frequency = 0.0;
  for (int i = 0; i < 6; ++i) {
    value += amplitude * snoise(p);
    p *= 2.0;
    amplitude *= 0.5;
  }
  return value;
}
`;


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
        endPosition: new THREE.Vector3(xPosition, -2.7, zPosition),
        startTime: 0, // All letters start at the same time
        initialDuration: 1, // Random duration between 2 and 3 seconds
        duration: 1 + Math.random(),    // Random duration between 3 and 5 seconds
    };
}

export class SceneManager {
    private currentViewportType: 'mobile' | 'tablet' | 'desktop' = 'desktop';
    public _currentAnimation: 'intro' | 'mainMenu' | 'game' = 'intro';
    private onAnimationChange?: (animation: 'intro' | 'mainMenu' | 'game') => void;
    private scene: THREE.Scene;
    private camera: THREE.PerspectiveCamera;
    private renderer: THREE.WebGLRenderer;
    private composer: EffectComposer;
    private introLineManager: LineAnimationManager;
    private logoManager: LogoManager;
    private cameraSpeed: number = 25;
    public elapsedTime: number = 0;
    private introComplete: boolean = false;
    private startTime: number;


    constructor(container: HTMLDivElement) {
        console.log("initializing scene");
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(colors.darkGrey);
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer({antialias: true});
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio * 1.5);
        container.appendChild(this.renderer.domElement);

        this.startTime = Date.now();

        // Composer and passes setup
        this.composer = new EffectComposer(this.renderer);
        const renderPass = new RenderPass(this.scene, this.camera);
        this.composer.addPass(renderPass);

        const bloomPass = new UnrealBloomPass(
            new THREE.Vector2(window.innerWidth, window.innerHeight),
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

    update(deltaTime: number): void {
        this.elapsedTime += deltaTime;
        // intro, main menu, game
        switch (this.currentAnimation) {
            case 'intro':
                this.updateIntro(deltaTime);
                break;
            case 'mainMenu':
                // this.updateMainMenu(deltaTime);
                break;
        }

        // this.introLineManager.update(deltaTime);

        // if (!this.introComplete && this.elapsedTime > 10) {
        //     this.introComplete = true;
        //     this.cameraSpeed = 0;
        //     this.introLineManager.cleanup();
        //     this.logoManager.moveToTopMiddle(this.camera);
        //     this.logoManager.toggleUnderline();
        // }

        this.composer.render();
    }

    private updateMainMenu(deltaTime: number): void {

    }

    private updateIntro(deltaTime: number): void {
        this.introLineManager.update(deltaTime);
        this.updateCamera(deltaTime);

        // logo animation
        switch (this.logoManager.currentAnimation) {
            case 'unInitialized': {
                if (this.elapsedTime > 7.3) { // 7.3
                    this.logoManager.initializeLetters(this.camera);
                    this.logoManager.currentAnimation = 'intro';
                }
                return;
            }
            case 'intro': {
                this.logoManager.updateLettersIntro(deltaTime, this.cameraSpeed, this.camera);
                // if (this.elapsedTime > 4) {
                //     setIntroComplete(true);
                // }

                // if (this.elapsedTime > 11.3 && this.logoManager.currentPosition != LogoPosition.TOP_MIDDLE) {
                //     this.cameraSpeed = 0;
                //     this.logoManager.currentPosition = LogoPosition.TOP_MIDDLE;
                //     this.logoManager.resizeLogo(this.camera, 2);
                // }

                // if (this.elapsedTime > 12) {
                //     if (!this.logoManager.isUnderlineVisible) {
                //         this.logoManager.toggleUnderline();
                //     }
                //     if (!this.logoManager.isUnderlineSidelinesVisible && this.elapsedTime > 14) {
                //         this.logoManager.toggleUnderlineSidelines();
                //     }
                //
                //     this.logoManager.updateLogoUnderline(deltaTime, this.cameraSpeed);
                // }
                //
                // if (this.elapsedTime > 20) {
                //     console.log('intro done');
                //     this.elapsedTime = 0;
                //     this.currentAnimation = 'mainMenu';
                //     this.logoManager.currentAnimation = 'mainMenu';
                //     this.introComplete = true;
                //     this.cameraSpeed = 0;
                //     this.introLineManager.cleanup();
                // }
            }
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

    set currentAnimation(value: 'intro' | 'mainMenu' | 'game') {
        this._currentAnimation = value;  // Use the private property
        this.onAnimationChange?.(value);
    }

    get currentAnimation() {
        return this._currentAnimation;  // Return the private property
    }

    cleanup(): void {
        this.introLineManager.cleanup();
        this.logoManager.cleanup();
        this.renderer.dispose();
    }
}