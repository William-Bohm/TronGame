import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';

interface Waypoint {
  position: THREE.Vector3;
  speed: number;
}

class Line3D {
  private static readonly LINE_WIDTH = 0.1;
  private static readonly LINE_HEIGHT = 0.2;
  private static readonly LINE_DEPTH = 0.2;

  private scene: THREE.Scene;
  private waypoints: Waypoint[];
  private currentWaypointIndex: number;
  private currentSegment: THREE.Mesh | null;
  private material: THREE.MeshPhongMaterial;
  private progress: number;
  private lastPosition: THREE.Vector3;

  constructor(scene: THREE.Scene, waypoints: Waypoint[]) {
    this.scene = scene;
    this.waypoints = waypoints;
    this.currentWaypointIndex = 0;
    this.progress = 0;
    this.currentSegment = null;
    this.lastPosition = waypoints[0].position.clone();

    this.material = new THREE.MeshPhongMaterial({
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

  private createSegment(start: THREE.Vector3, end: THREE.Vector3): THREE.Mesh {
    const direction = new THREE.Vector3().subVectors(end, start);
    const length = direction.length();
    const geometry = new THREE.BoxGeometry(length, Line3D.LINE_HEIGHT, Line3D.LINE_DEPTH);

    // Shift the geometry so that it starts at the origin
    geometry.translate(length / 2 + Line3D.LINE_WIDTH, 0, 0);

    const segment = new THREE.Mesh(geometry, this.material);

    // Orient the segment along the direction vector
    segment.quaternion.setFromUnitVectors(new THREE.Vector3(1, 0, 0), direction.normalize());

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

update(deltaTime: number): boolean {
  if (!this.currentSegment) return false;

  const currentWaypoint = this.waypoints[this.currentWaypointIndex];

  if (!currentWaypoint) return false;

  this.progress += currentWaypoint.speed * deltaTime;

  if (this.progress >= 1) {
    // Finish current segment
    this.updateSegmentScale(this.currentSegment, 1);

    // Update last position to current waypoint's position
    this.lastPosition.copy(currentWaypoint.position);

    this.currentWaypointIndex++;
    this.progress = 0;

    // Check if we've reached the end of the waypoints
    if (this.currentWaypointIndex >= this.waypoints.length - 1) {
      return false; // We're done with all waypoints
    }

    // Create next segment
    this.createNextSegment();
  } else if (this.currentSegment) {
    // Grow the current segment
    this.updateSegmentScale(this.currentSegment, this.progress);
  }

  return true;
}

  private updateSegmentScale(segment: THREE.Mesh, progress: number) {
    const initialScale = Line3D.LINE_WIDTH / segment.userData.fullLength;
    const remainingScale = 1 - initialScale;
    const newScale = initialScale + (remainingScale * progress);
    segment.scale.setX(newScale);
  }
}
const ThreeScene: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Scene setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true });

    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio * 1.5);
    mountRef.current?.appendChild(renderer.domElement);

    // Composer and passes setup
    const composer = new EffectComposer(renderer);
    const renderPass = new RenderPass(scene, camera);
    composer.addPass(renderPass);

    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(window.innerWidth, window.innerHeight),
      1,  // Strength
      0.8,  // Radius
      0.2  // Threshold
    );
    composer.addPass(bloomPass);

    camera.position.set(5, 5, 10);
    // camera.lookAt(2.5, 2.5, 2.5);

    // Define waypoints
    const waypoints1: Waypoint[] = [
    { position: new THREE.Vector3(0, 0, 0), speed: 1 },
    { position: new THREE.Vector3(10, 0, 0), speed: 1 },
    { position: new THREE.Vector3(10, 5, 0), speed: 1 },
    { position: new THREE.Vector3(20, 5, 0), speed: 1 },
  ];

  // const waypoints2: Waypoint[] = [
  //   { position: new THREE.Vector3(8, 0, 0), speed: 2 },
  //   { position: new THREE.Vector3(3, 0, 0), speed: 2 },
  //   { position: new THREE.Vector3(3, 4, 0), speed: 2 },
  //   { position: new THREE.Vector3(6, 4, 0), speed: 2 },
  //   { position: new THREE.Vector3(6, 1, 0), speed: 2 },
  //   { position: new THREE.Vector3(1, 1, 0), speed: 2 },
  //   { position: new THREE.Vector3(1, 7, 0), speed: 2 },
  //   { position: new THREE.Vector3(5, 7, 0), speed: 2 },
  //   { position: new THREE.Vector3(5, 2, 0), speed: 2 },
  //   { position: new THREE.Vector3(0, 2, 0), speed: 2 },
  // ];

    const lines: Line3D[] = [];

    // Add initial lines
    lines.push(new Line3D(scene, waypoints1));
    // lines.push(new Line3D(scene, waypoints2));

    // Animation loop
    let lastTime = 0;
    let cameraSpeed = 5; // Adjust this value to change the speed of camera movement

    const animate = (time: number) => {
      const deltaTime = (time - lastTime) / 1000;
      lastTime = time;

      // Move camera to the right
      camera.position.x += cameraSpeed * deltaTime;

      // Update camera's look at point to keep it centered on the scene
      camera.lookAt(camera.position.x, camera.position.y, 0);

      // Update all lines and remove finished ones
      for (let i = lines.length - 1; i >= 0; i--) {
        if (!lines[i].update(deltaTime)) {
          lines.splice(i, 1);
        }
      }

      composer.render();
      requestAnimationFrame(animate);
    };

    animate(0);

    // Cleanup
    return () => {
      mountRef.current?.removeChild(renderer.domElement);
    };
  }, []);

  return <div ref={mountRef} />;
};

export default ThreeScene;