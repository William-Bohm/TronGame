import {Scene} from "three";

export abstract class AnimationManager {
    protected scene: Scene;
    protected elapsedTime: number = 0;

    constructor(scene: Scene) {
        this.scene = scene;
    }

    // abstract update(deltaTime: number, cameraSpeed?: number): boolean | void;
    abstract cleanup(): void;
}

