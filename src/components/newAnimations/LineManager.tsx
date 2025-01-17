// LineAnimationManager.ts
import * as THREE from 'three';
import {Line3D, Waypoint} from "./components/Line3d";
import {AnimationManager} from "./AnimationManager";

export class LineAnimationManager extends AnimationManager {
    private lines: Line3D[] = [];
    private waypoints: { [key: string]: Waypoint[] };
    private startTimes: { [key: string]: number };

    constructor(scene: THREE.Scene, waypoints: { [key: string]: Waypoint[] }, startTimes: { [key: string]: number }) {
        super(scene);
        this.waypoints = waypoints;
        this.startTimes = startTimes;
        this.initializeLines();
        console.log("LineAnimationManager initialized");
    }

    private initializeLines(): void {
        Object.entries(this.waypoints).forEach(([key, points]) => {
            this.lines.push(new Line3D(this.scene, points, this.startTimes[key]));
        });

        console.log(this.lines)
        console.log("Lines initialized");
    }

    update(deltaTime: number): boolean {
        this.elapsedTime += deltaTime;

        // Update all lines and remove finished ones
        for (let i = this.lines.length - 1; i >= 0; i--) {
            this.lines[i].update(deltaTime, this.elapsedTime)
        }
        return this.lines.length > 0;
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