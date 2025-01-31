import {BoxGeometry, Group, Mesh, MeshPhongMaterial, Scene, Vector3} from "three";

export interface Waypoint {
    position: Vector3;
    speed: number;
}


export class Line3D {
    private static readonly LINE_WIDTH = 0.1;
    private static readonly LINE_HEIGHT = 0.2;
    private static readonly LINE_DEPTH = 0.2;
    private isComplete: boolean = false;


    private scene: Scene | Group;
    private waypoints: Waypoint[];
    private currentWaypointIndex: number;
    private currentSegment: Mesh | null;
    private completedSegments: Mesh[];
    public material: MeshPhongMaterial;
    private progress: number;
    private lastPosition: Vector3 | null;
    private startTime: number; // Start time in seconds

    constructor(scene: Scene | Group, waypoints: Waypoint[], startTime: number) {
        this.scene = scene;
        this.waypoints = waypoints;
        this.currentWaypointIndex = 0;
        this.progress = 0;
        this.currentSegment = null;
        this.completedSegments = [];
        this.lastPosition = waypoints[0].position.clone();
        this.startTime = startTime;

        this.material = new MeshPhongMaterial({
            color: 0x7DFDFE,
            emissive: 0x7DFDFE,
            emissiveIntensity: 0.8,
            shininess: 100,
        });

        this.createNextSegment();
    }

    private createNextSegment(): void {
        if (this.currentWaypointIndex >= this.waypoints.length - 1) return;

        const start = this.waypoints[this.currentWaypointIndex].position.clone();
        const end = this.waypoints[this.currentWaypointIndex + 1].position;

        this.currentSegment = this.createSegment(start, end);
        this.scene.add(this.currentSegment);
    }

    private createSegment(start: Vector3, end: Vector3): Mesh {
        const direction = new Vector3().subVectors(end, start);
        const length = direction.length();
        const geometry = new BoxGeometry(length, Line3D.LINE_HEIGHT, Line3D.LINE_DEPTH);

        // Shift the geometry so that it starts at the origin
        geometry.translate(length / 2 + Line3D.LINE_WIDTH, 0, 0);

        const segment = new Mesh(geometry, this.material);

        // Orient the segment along the direction vector
        segment.quaternion.setFromUnitVectors(new Vector3(1, 0, 0), direction.normalize());

        // Set position to start point
        segment.position.copy(start);

        // Set initial scale
        const initialScale = Line3D.LINE_WIDTH / length;
        segment.scale.set(initialScale, 1, 1);
        segment.userData = {
            fullLength: length,
            direction: direction.normalize(),
            start: start.clone(),
            end: end.clone(),
        };

        return segment;
    }

    update(deltaTime: number, elapsedTime: number): boolean {
        // Check if the start time has been reached
        if (elapsedTime < this.startTime) return true;

        if (!this.currentSegment) return false;

        const currentWaypoint = this.waypoints[this.currentWaypointIndex];

        if (!currentWaypoint) return false;

        this.progress += currentWaypoint.speed * deltaTime;

        if (this.progress >= 1) {
            // Finish current segment
            this.updateSegmentScale(this.currentSegment, 1);

            // Add current segment to completed segments
            if (this.currentSegment) {
                this.completedSegments.push(this.currentSegment);
            }

            // Update last position to current waypoint's position
            this.lastPosition?.copy(currentWaypoint.position);

            this.currentWaypointIndex++;
            this.progress = 0;

            // Check if we've reached the end of the waypoints
            if (this.currentWaypointIndex >= this.waypoints.length - 1) {
                this.currentSegment = null; // Clear the current segment
                this.isComplete = true;
                return true;
            }

            // Only create next segment if we haven't reached the end
            this.createNextSegment();
        } else if (this.currentSegment) {
            // Grow the current segment
            this.updateSegmentScale(this.currentSegment, this.progress);
        }
        return !this.isComplete;
    }

    private updateSegmentScale(segment: Mesh, progress: number) {
        const initialScale = Line3D.LINE_WIDTH / segment.userData.fullLength;
        const remainingScale = 1 - initialScale;
        const newScale = initialScale + remainingScale * progress;
        segment.scale.setX(newScale);
    }

    isAnimationComplete(): boolean {
        return this.isComplete;
    }

    public cleanup(): void {
        // Clean up current segment
        if (this.currentSegment) {
            if (this.currentSegment.geometry) {
                this.currentSegment.geometry.dispose();
            }
            this.scene.remove(this.currentSegment);
            this.currentSegment = null;
        }

        // Clean up all completed segments
        for (const segment of this.completedSegments) {
            if (segment.geometry) {
                segment.geometry.dispose();
            }
            this.scene.remove(segment);
        }

        // Clear the completed segments array
        this.completedSegments = [];

        // Dispose of shared material
        if (this.material) {
            this.material.dispose();
        }

        // Clear references
        this.waypoints = [];
        this.lastPosition = null;
    }
}

