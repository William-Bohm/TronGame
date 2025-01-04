// Vertex Shader
const fogVertexShader = `
  varying vec2 vUv;

  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

// Fragment Shader
const fogFragmentShader = `
  uniform float uTime;
  uniform sampler2D uNoiseTexture;
  uniform vec3 uFogColor;
  uniform float uIntensity;
  uniform float uSpeed;
  uniform float uScale;

  varying vec2 vUv;

  void main() {
    // Animate the UV coordinates over time to create movement.
    vec2 uv = vUv;
    uv.x += uTime * uSpeed * 0.05;
    uv.y += uTime * uSpeed * 0.07;

    float noiseValue = texture2D(uNoiseTexture, uv * uScale).r;

    // Adjust the threshold or blend multiple layers if desired
    float alpha = smoothstep(0.3, 1.0, noiseValue) * uIntensity;

    gl_FragColor = vec4(uFogColor, alpha);
  }
`;
