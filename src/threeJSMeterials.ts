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

export const toHSLA = (hex: string, opacity: number) => {
  // Remove the # if present
  const cleanHex = hex.replace('#', '');

  // Convert hex to RGB first
  const r = parseInt(cleanHex.slice(0, 2), 16) / 255;
  const g = parseInt(cleanHex.slice(2, 4), 16) / 255;
  const b = parseInt(cleanHex.slice(4, 6), 16) / 255;

  // Find greatest and smallest channel values
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);

  let h = 0;
  let s = 0;
  let l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }

  // Convert to degrees
  h = Math.round(h * 360);
  // Convert to percentage
  s = Math.round(s * 100);
  l = Math.round(l * 100);

  return `hsla(${h}, ${s}%, ${l}%, ${opacity})`;
};

// Type definitions if needed
export type MaterialKeys = keyof typeof materials;