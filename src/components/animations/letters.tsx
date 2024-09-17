// Letter3D.ts
import * as THREE from 'three';
import { FontLoader, Font } from 'three/examples/jsm/loaders/FontLoader.js';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js';

interface LetterOptions {
  letter: string;
  startPosition: THREE.Vector3;
  endPosition: THREE.Vector3;
  startTime: number;         // When the animation starts
  initialDuration: number;   // Duration of Phase 1
  duration: number;          // Duration of Phase 2
}

class Letter3D {
  private static font: Font | null = null;
  private static fontLoading: Promise<void> | null = null;

  // Common initial position for all letters
  private static initialPosition: THREE.Vector3 = new THREE.Vector3(-55, 10, -100);

  private parent: THREE.Object3D;
  private mesh: THREE.Mesh | null = null;
  private options: LetterOptions;

  private initialRotation: THREE.Quaternion = new THREE.Quaternion();
  private finalRotation: THREE.Quaternion = new THREE.Quaternion();

  constructor(parent: THREE.Object3D, options: LetterOptions) {
    this.parent = parent;
    this.options = options;

    if (Letter3D.font) {
      this.createMesh();
    } else {
      this.loadFont().then(() => this.createMesh());
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

  private createMesh() {
    if (!Letter3D.font) return;

    const geometry = new TextGeometry(this.options.letter, {
      font: Letter3D.font,
      size: 5,
      depth: 1,
      curveSegments: 12,
    });

    const material = new THREE.MeshPhongMaterial({
      color: 0x7dfdfe,
      emissive: 0x7dfdfe,
      emissiveIntensity: 0.8,
      shininess: 100,
    });

    this.mesh = new THREE.Mesh(geometry, material);

    // Set initial position (common for all letters)
    this.mesh.position.copy(Letter3D.initialPosition);

    // Generate random initial rotation
    const randomX = Math.random() * Math.PI * 2;
    const randomY = Math.random() * Math.PI * 2;
    const randomZ = Math.random() * Math.PI * 2;
    this.initialRotation.setFromEuler(new THREE.Euler(randomX, randomY, randomZ));

    // Set mesh to initial rotation
    this.mesh.quaternion.copy(this.initialRotation);

    // Desired final rotation (face the camera)
    this.finalRotation.setFromEuler(new THREE.Euler(0, Math.PI * 2, 0));

    // Add mesh to parent group
    this.parent.add(this.mesh);
  }

update(deltaTime: number, elapsedTime: number): boolean {
  if (!this.mesh) return true;

  const { startTime, initialDuration, duration, startPosition, endPosition } = this.options;

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
}

export default Letter3D;
