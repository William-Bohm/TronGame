import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry';

const CubeToLetter: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Scene setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    mountRef.current?.appendChild(renderer.domElement);

    // Lighting
    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(5, 10, 5).normalize();
    scene.add(light);

    const ambientLight = new THREE.AmbientLight(0x404040); // Soft white light
    scene.add(ambientLight);

    // Cube geometry
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshPhongMaterial({ color: 0x0077ff }); // Solid material with shading
    const cube = new THREE.Mesh(geometry, material);
    scene.add(cube);

    // Font loader to create the letter geometry
    const loader = new FontLoader();
    loader.load('https://threejs.org/examples/fonts/helvetiker_regular.typeface.json', (font) => {
      const textGeometry = new TextGeometry('A', {
        font: font,
        size: 1,
        height: 0.2,
        curveSegments: 12,
        bevelEnabled: true,
        bevelThickness: 0.02,
        bevelSize: 0.05,
        bevelOffset: 0,
        bevelSegments: 5,
      });

      textGeometry.center(); // Center the text geometry
      const letter = new THREE.Mesh(textGeometry, material);
      scene.add(letter);
      letter.visible = false; // Hide the letter initially

      // Interpolation logic for morphing the cube into the letter
      let progress = 0;
      const animate = () => {
        requestAnimationFrame(animate);

        // Interpolate between cube and letter vertices
        if (progress < 0.1) {
          const cubeVertices = cube.geometry.attributes.position.array;
          const letterVertices = textGeometry.attributes.position.array;
          const length = Math.min(cubeVertices.length, letterVertices.length);

          for (let i = 0; i < length; i++) {
            cubeVertices[i] = THREE.MathUtils.lerp(cubeVertices[i], letterVertices[i], progress);
          }
          cube.geometry.attributes.position.needsUpdate = true;

          progress += 0.001; // Adjust speed of transition
        } else {
          cube.visible = false;
          letter.visible = true;
        }

        renderer.render(scene, camera);
      };

      animate();
    });

    camera.position.z = 5;

    // Cleanup
    return () => {
      mountRef.current?.removeChild(renderer.domElement);
    };
  }, []);

  return <div ref={mountRef} />;
};

export default CubeToLetter;
