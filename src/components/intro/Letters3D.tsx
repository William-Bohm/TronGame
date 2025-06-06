// Letter3D.ts
import {FontLoader, Font} from 'three/examples/jsm/loaders/FontLoader.js';
import {TextGeometry} from 'three/examples/jsm/geometries/TextGeometry.js';
import {Euler, Material, Mesh, MeshPhongMaterial, Object3D, Quaternion, Vector3} from "three";

interface LetterOptions {
    letter: string;
    startPosition: Vector3;
    endPosition: Vector3;
    startTime: number;
    initialDuration: number;
    duration: number;
}

class Letter3D {
    private static font: Font | null = null;
    private static fontLoading: Promise<void> | null = null;

    // Common initial position for all letters
    private static initialPosition: Vector3 = new Vector3(-55, 10, -100);

    private parent: Object3D;
    private mesh: Mesh | null = null;
    private options: LetterOptions;

    private initialRotation: Quaternion = new Quaternion();
    private finalRotation: Quaternion = new Quaternion();
    private isComplete: boolean = false;

    constructor(parent: Object3D, options: LetterOptions, material: MeshPhongMaterial) {
        this.parent = parent;
        this.options = options;

        if (Letter3D.font) {
            this.createMesh(material);
        } else {
            this.loadFont().then(() => this.createMesh(material));
        }
    }

    private async loadFont() {
        if (Letter3D.fontLoading) {
            await Letter3D.fontLoading;
            return;
        }
        Letter3D.fontLoading = new Promise<void>((resolve, reject) => {
            const loader = new FontLoader();
            loader.load(
                '/font/Orbitron_Regular.json', // Adjust the path as needed
                (font) => {
                    Letter3D.font = font;
                    resolve();
                },
                undefined,
                (error) => {
                    console.error('Error loading font:', error);
                    reject(error);
                }
            );
        });
        await Letter3D.fontLoading;
    }

    private createMesh(material: MeshPhongMaterial) {
        if (!Letter3D.font) return;

        const geometry =  new TextGeometry(this.options.letter, {
            font: Letter3D.font,
            size: 5,
            depth: 1,
            curveSegments: 12,
        });

        this.mesh = new Mesh(geometry, material);

        // Set initial position (common for all letters)
        this.mesh.position.copy(Letter3D.initialPosition);

        // Generate random initial rotation
        const randomX = Math.random() * Math.PI * 2;
        const randomY = Math.random() * Math.PI * 2;
        const randomZ = Math.random() * Math.PI * 2;
        this.initialRotation.setFromEuler(new Euler(randomX, randomY, randomZ));

        // Set mesh to initial rotation
        this.mesh.quaternion.copy(this.initialRotation);

        // Desired final rotation (face the camera)
        this.finalRotation.setFromEuler(new Euler(0, Math.PI * 2, 0));

        // Add mesh to parent group
        this.parent.add(this.mesh);
    }

    update(deltaTime: number, elapsedTime: number): boolean {
        if (!this.mesh) return true;
        if (this.isComplete) return false;

        const {startTime, initialDuration, duration, startPosition, endPosition} = this.options;

        if (elapsedTime < startTime) return true; // Animation hasn't started yet

        const timeSinceStart = elapsedTime - startTime;

        if (timeSinceStart < initialDuration) {
            // Phase 1: Moving from initialPosition to startPosition
            const t = timeSinceStart / initialDuration;
            const easedT = 1 - Math.pow(1 - t, 2); // Ease-out quadratic
            this.mesh.position.lerpVectors(Letter3D.initialPosition, startPosition, easedT);
            return true;
        } else if (timeSinceStart < initialDuration + duration) {
            // Phase 2: Existing animation from startPosition to endPosition
            const t = (timeSinceStart - initialDuration) / duration;
            const easedT = t * t; // Ease-in quadratic

            // Update position
            this.mesh.position.lerpVectors(startPosition, endPosition, easedT);

            // Update rotation
            this.mesh.quaternion.slerpQuaternions(
                this.initialRotation,
                this.finalRotation,
                easedT
            );
            return true;
        } else {
            // Animation complete
            this.mesh.position.copy(endPosition);
            this.mesh.quaternion.copy(this.finalRotation);
            return false;
        }
    }

    public cleanup(): void {
        if (this.mesh) {
            // Dispose of geometry
            if (this.mesh.geometry) {
                this.mesh.geometry.dispose();
            }

            // Dispose of material
            if (this.mesh.material) {
                // Check if material is an array
                if (Array.isArray(this.mesh.material)) {
                    this.mesh.material.forEach(material => material.dispose());
                } else {
                    if (this.mesh.material instanceof Material) {
                        this.mesh.material.dispose();
                    }
                }
            }

            // Remove from parent
            if (this.mesh.parent) {
                this.mesh.parent.remove(this.mesh);
            }

            // Clear reference
            this.mesh = null;
        }

        // Clear references
        this.initialRotation.set(0, 0, 0, 1);
        this.finalRotation.set(0, 0, 0, 1);
    }

}

export default Letter3D;
