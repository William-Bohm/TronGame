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

export const cssFormatColors = {
    neonBlue: '#9dfcfc',    // Changed from 0x9dfcfcc
    neonOrange: '#ff9f05',  // Changed from 0xff9f05
    darkGrey: '#0a0a0a'
}

export const toRGBA = (hex: string, alpha: number) => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

// Type definitions if needed
export type MaterialKeys = keyof typeof materials;