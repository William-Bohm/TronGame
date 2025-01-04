import * as THREE from 'three';

export const materials = {
  neonBlue: new THREE.MeshPhongMaterial({
          color: 0x9dfcfc,
          emissive: 0x9dfcfc,
          emissiveIntensity: 0.5,
          shininess: 100,
  }),
  // neonBlue: new THREE.MeshPhongMaterial({
  //         color: 0x7dfdfe,
  //         emissive: 0x7dfdfe,
  //         emissiveIntensity: 0.5,
  //         shininess: 100,
  // }),

  neonOrange: new THREE.MeshPhongMaterial({
          color: 0xff9f05,
          emissive: 0xff9f05,
          emissiveIntensity: 1,
          shininess: 100,
  })
};

// You could also store just the colors if you want to create materials with different properties
export const colors = {
  neonBlue: 0x9dfcfcc,
  neonOrange: 0xff9f05,
    darkGrey: 0x0a0a0a
};

// Type definitions if needed
export type MaterialKeys = keyof typeof materials;