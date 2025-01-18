// LineAnimationManager.ts
import * as THREE from 'three';
import {Line3D, Waypoint} from "./components/Line3d";
import {AnimationManager} from "./AnimationManager";

export class LineAnimationManager extends AnimationManager {
    private lines: Line3D[] = [];
    private waypoints: { [key: string]: Waypoint[] };
    private startTimes: { [key: string]: number };
    private onComplete?: () => void;
    private hasTriggeredComplete: boolean = false;

    constructor(
        scene: THREE.Scene,
        waypoints: { [key: string]: Waypoint[] },
        startTimes: { [key: string]: number },
        onComplete?: () => void
    ) {
        super(scene);
        this.waypoints = waypoints;
        this.startTimes = startTimes;
        this.onComplete = onComplete;
        this.initializeLines();
    }

    private initializeLines(): void {
        Object.entries(this.waypoints).forEach(([key, points]) => {
            this.lines.push(new Line3D(this.scene, points, this.startTimes[key]));
        });
        console.log(this.lines)
        console.log("Lines initialized");
    }

    update(deltaTime: number): void {
        this.elapsedTime += deltaTime;

        // Check for first completion if we haven't triggered yet
        if (!this.hasTriggeredComplete) {
            for (let i = this.lines.length - 1; i >= 0; i--) {
                if (this.lines[i].isAnimationComplete()) {
                    if (this.onComplete) {
                        this.onComplete();
                        this.hasTriggeredComplete = true;
                    }
                    break;
                }
            }
        }

        // Continue updating all lines regardless of completion
        for (let i = this.lines.length - 1; i >= 0; i--) {
            this.lines[i].update(deltaTime, this.elapsedTime);
        }
    }

    cleanup(): void {
        console.log('Starting LineAnimationManager cleanup');

        this.lines.forEach(line => {
            line.cleanup();
        });

        this.lines = [];
        this.waypoints = {};
        this.startTimes = {};

        console.log('LineAnimationManager cleanup complete');
    }
}