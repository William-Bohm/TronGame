// components/animations/CubeRain.tsx
import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import {EffectComposer, FXAA} from "@react-three/postprocessing";

interface CubeProps {
    position: [number, number, number],
    speed: number,
    rotationSpeed: number,
    startDelay: number,
    key?: number
}

import { Line } from '@react-three/drei';

const Cube: React.FC<CubeProps> = ({ position, speed, rotationSpeed, startDelay }) => {
  const meshRef = useRef<THREE.Group>(null!);

  const timeRef = useRef(0);

useFrame((state, delta) => {
    if (meshRef.current) {
        timeRef.current += delta;

        if (timeRef.current > startDelay) {
            // Move the cube down
            meshRef.current.position.y -= speed * delta;
            // Rotate the cube
            meshRef.current.rotation.x += rotationSpeed * delta;
            meshRef.current.rotation.y += rotationSpeed * delta;

            // Calculate the off-screen position based on z-coordinate
            const distance = meshRef.current.position.z - state.camera.position.z;
            const projectionMatrix = state.camera.projectionMatrix;
            const visibleHeight = 2 * Math.abs(distance) / projectionMatrix.elements[5];
            const offScreenY = -visibleHeight / 2  - 1; // Add an extra unit to ensure it's fully off-screen

            // Reset position if the cube is below the calculated off-screen position
            if (meshRef.current.position.y < offScreenY) {
                meshRef.current.position.y = -offScreenY + 15; // Start from the top
                meshRef.current.position.x = (Math.random() - 0.5) * 20;
                meshRef.current.position.z = (Math.random() - 0.5) * 20;
                timeRef.current = 0; // Reset the timer for the next fall
            }
        }
    }
});


 const cubeEdges = useMemo(() => {
    const size = 0.5;
    const vertices = [
      new THREE.Vector3(-size, -size, -size), // 0
      new THREE.Vector3(size, -size, -size),  // 1
      new THREE.Vector3(size, size, -size),   // 2
      new THREE.Vector3(-size, size, -size),  // 3
      new THREE.Vector3(-size, -size, size),  // 4
      new THREE.Vector3(size, -size, size),   // 5
      new THREE.Vector3(size, size, size),    // 6
      new THREE.Vector3(-size, size, size),   // 7
    ];

    return [
      [vertices[0], vertices[1]],
      [vertices[1], vertices[5]],
      [vertices[5], vertices[4]],
      [vertices[4], vertices[0]],
      [vertices[3], vertices[2]],
      [vertices[2], vertices[6]],
      [vertices[6], vertices[7]],
      [vertices[7], vertices[3]],
      [vertices[0], vertices[3]],
      [vertices[1], vertices[2]],
      [vertices[5], vertices[6]],
      [vertices[4], vertices[7]],
    ];
  }, []);

  return (
    <group ref={meshRef} position={position}>
      {cubeEdges.map((edge, index) => (
        <Line
          key={index}
          points={edge}
          color="#7DFDFE"
          lineWidth={2}
        />
      ))}
    </group>
  );
};

const CubeRain: React.FC = () => {
    const cubes = useMemo(() => {
        const temp = [];
        for (let i = 0; i < 10; i++) {
            temp.push({
                position: [
                    (Math.random() - 0.5) * 20, // x position
                    25,     // y position (start above the screen)
                    (Math.random() - 0.5) * 20, // z position
                ] as [number, number, number],
                speed: Math.random() * 2 + 5,       // Falling speed
                rotationSpeed: Math.random() * 2,   // Rotation speed
                startDelay: i * 2 // Stagger start times
            });
        }
        return temp;
    }, []);

  return (
    <Canvas
      style={{ position: 'absolute', top: 0, left: 0 }}
      camera={{ position: [0, 0, 15] }}
    >
      {/* Your scene content */}
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} />
      {cubes.map((cubeProps, index) => (
        <Cube key={index} {...cubeProps} />
      ))}

      {/* Add the FXAA effect */}
      <EffectComposer>
        <FXAA />
      </EffectComposer>
    </Canvas>
  );
};

export default CubeRain;