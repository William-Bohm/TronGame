import * as THREE from 'three';

export class UnderlineMesh {
    private mesh: THREE.Mesh;
    private speed: number;
    private targetScale: number = 0;
    private currentScale: number = 0;

    constructor(parentGroup: THREE.Group, width: number, vector: THREE.Vector3, speed: number, material: THREE.MeshPhongMaterial) {
        const geometry = new THREE.BoxGeometry(1, 0.1, 1);

        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.scale.x = 0; // Start invisible

        // Center the line horizontally and position it below the text
        this.mesh.position.set(vector.x, vector.y, vector.z);
        this.mesh.scale.x = 0;

        this.targetScale = width;
        this.speed = speed;

        parentGroup.add(this.mesh);
    }

animate(deltaTime: number, show: boolean) {
    const targetScale = show ? this.targetScale : 0;
    if (show) {
        this.currentScale = Math.min(this.currentScale + deltaTime * this.speed, targetScale);
        this.mesh.scale.y = 0.1; // Return y to original size when showing
        this.mesh.scale.z = 1;    // Return z to original size when showing
    } else {
        this.currentScale = Math.max(this.currentScale - deltaTime * this.speed, targetScale);
        this.mesh.scale.y = 0;    // Hide y dimension when not showing
        this.mesh.scale.z = 0;    // Hide z dimension when not showing
    }
    this.mesh.scale.x = this.currentScale;
}

    cleanup() {
        if (this.mesh.parent) {
            this.mesh.parent.remove(this.mesh);
        }
        if (this.mesh.geometry) {
            this.mesh.geometry.dispose();
        }
        if (this.mesh.material instanceof THREE.Material) {
            this.mesh.material.dispose();
        }
    }
}