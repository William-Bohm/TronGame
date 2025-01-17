import React, { useRef } from 'react'
import { useFrame, useLoader } from '@react-three/fiber'
import { TextureLoader } from 'three'
import { ShaderMaterial } from 'three'
import { fogVertexShader, fogFragmentShader } from './fogShader'

export function FogOverlay() {
  const materialRef = useRef()
  const noiseTexture = useLoader(TextureLoader, '/noise.png') // replace with your noise texture path

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.getElapsedTime()
    }
  })

  return (
    <mesh renderOrder={9999} position={[0, 0, -1]}>
      {/* A large plane in front of the camera.
          If camera is at z=0, place this slightly in front (negative z),
          or parent it to the camera. */}
      <planeBufferGeometry args={[2, 2]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={fogVertexShader}
        fragmentShader={fogFragmentShader}
        transparent={true}
        depthWrite={false}
        depthTest={false}
        uniforms={{
          uTime: { value: 0 },
          uNoiseTexture: { value: noiseTexture },
          uFogColor: { value: [0.5, 0.5, 0.5] }, // Your desired fog color
          uIntensity: { value: 0.5 }, // Adjust this for how opaque the fog is
          uSpeed: { value: 1.0 },    // Adjust to control speed of motion
          uScale: { value: 3.0 }     // Adjust scale of noise pattern
        }}
      />
    </mesh>
  )
}
