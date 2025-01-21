// LineAnimationManager.ts
import {Line3D, Waypoint} from "./Line3d";
import {AnimationManager} from "./AnimationManager";
import {Scene} from "three";

export class LineAnimationManager extends AnimationManager {
    private lines: Line3D[] = [];
    private waypoints: { [key: string]: Waypoint[] };
    private startTimes: { [key: string]: number };
    private onComplete?: () => void;
    private hasTriggeredComplete: boolean = false;

    constructor(
        scene: Scene,
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

    update(deltaTime: number): boolean {
        this.elapsedTime += deltaTime;

        // Check for first completion if we haven't triggered yet
        if (!this.hasTriggeredComplete) {
            for (let i = this.lines.length - 1; i >= 0; i--) {
                if (this.lines[i].isAnimationComplete()) {
                    if (this.onComplete) {
                        this.onComplete();
                        this.hasTriggeredComplete = true;
                    }
                    return true;
                }
            }
        }

        // Continue updating all lines regardless of completion
        for (let i = this.lines.length - 1; i >= 0; i--) {
            this.lines[i].update(deltaTime, this.elapsedTime);
        }
        return this.hasTriggeredComplete;
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