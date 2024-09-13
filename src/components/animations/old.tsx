// import React, { useEffect, useRef } from 'react';
// import * as THREE from 'three';
// import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
// import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
// import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
//
//
// class Line3D {
//   private
// }
//
//
//
// const OldThreeScene: React.FC = () => {
//   const mountRef = useRef<HTMLDivElement>(null);
//
// useEffect(() => {
//   // Basic scene setup
//   const scene = new THREE.Scene();
//   const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
//   const renderer = new THREE.WebGLRenderer();
//
//   renderer.setSize(window.innerWidth, window.innerHeight);
//   mountRef.current?.appendChild(renderer.domElement);
//
//   // Initialize composer and passes
//   const composer = new EffectComposer(renderer);
//   const renderPass = new RenderPass(scene, camera);
//   composer.addPass(renderPass);
//
//   const bloomPass = new UnrealBloomPass(
//     new THREE.Vector2(window.innerWidth, window.innerHeight),
//     2,  // Strength
//     0.8,  // Radius
//     0.5  // Threshold
//   );
//   composer.addPass(bloomPass);
//
//   camera.position.z = 20;
//
//   // Define waypoints for the line to follow
//   const waypoints = [
//     { x: 0, y: 2, z: 0 },  // Start position
//     { x: 5, y: 2, z: 0 },  // Move right
//     { x: 5, y: 10, z: 0 },  // Move up
//     // { x: 10, y: 4, z: 0 }, // Move right again
//     // { x: 10, y: 2, z: 0 }, // Move down
//     // Add more waypoints as needed
//   ];
//
//   let currentIndex = 0;
//   const speed = 0.01;
//   let progress = 0;
//
//   // Animation loop
//   const animate = () => {
//
//     requestAnimationFrame(animate);
//
//     // Move line along the path
//     if (currentIndex < waypoints.length - 1) {
//       // Create a cube (thin line)
//       const geometry = new THREE.BoxGeometry(1, 0.05, 0.3);
//       const material = new THREE.MeshPhongMaterial({
//         color: 0x7DFDFE,
//         emissive: 0x7DFDFE,
//         emissiveIntensity: 0.9,
//         shininess: 100
//       });
//       const line = new THREE.Mesh(geometry, material);
//
//       const previousPosition = waypoints[currentIndex - 1] || waypoints[currentIndex];
//         line.position.x = previousPosition.x;
//         line.position.y = previousPosition.y;
//         line.position.z = previousPosition.z;
//
//       scene.add(line);
//
//       const currentPoint = waypoints[currentIndex];
//       const nextPoint = waypoints[currentIndex + 1];
//
//       // Interpolate position
//       line.scale.x = THREE.MathUtils.lerp(currentPoint.x, nextPoint.x, progress);
//       line.position.x += speed / 2;
//       line.scale.y = THREE.MathUtils.lerp(currentPoint.y, nextPoint.y, progress);
//       line.position.y += speed / 2;
//       line.scale.z = THREE.MathUtils.lerp(currentPoint.z, nextPoint.z, progress);
//       line.position.z += speed / 2;
//
//       // Update progress along the current segment
//       progress += speed;
//
//       // If progress is complete, move to the next segment
//       if (progress >= 1) {
//         progress = 0;
//         currentIndex++;
//         console.log('finished waypoint: ', currentIndex);
//       }
//     }
//
//     composer.render();
//   };
//
//   animate();
//
//   // Cleanup on unmount
//   return () => {
//     mountRef.current?.removeChild(renderer.domElement);
//   };
// }, []);
//
//
//   return <div ref={mountRef} />;
// };
//
// export default OldThreeScene;
