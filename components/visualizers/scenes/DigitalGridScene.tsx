
/**
 * File: components/visualizers/scenes/DigitalGridScene.tsx
 * Version: 3.14.0
 * Author: Sut
 * Copyright (c) 2025 Aura Vision. All rights reserved.
 * Description: GPU-Accelerated "Digital LED Wall" (Floating Active Blocks).
 * - Aesthetic: Smooth High-Fidelity Mosaic. Fluid transitions in brightness and activation.
 * - Animation: Center-Out Symmetric EQ with gentle digital shimmer.
 * - Layout: Responsive Curved Wall (Fills corners). Wide blocks.
 */

import React, { useRef, useMemo, useLayoutEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { InstancedMesh, Object3D, Color, InstancedBufferAttribute, DataTexture, RedFormat, UnsignedByteType, LinearFilter, MeshStandardMaterial, DoubleSide } from 'three';
import { MeshReflectorMaterial } from '@react-three/drei';
import { VisualizerSettings } from '../../../core/types';
import { useAudioReactive } from '../../../core/hooks/useAudioReactive';

interface SceneProps {
  analyser: AnalyserNode;
  analyserR?: AnalyserNode | null;
  colors: string[];
  settings: VisualizerSettings;
}

export const DigitalGridScene: React.FC<SceneProps> = ({ analyser, colors, settings }) => {
  const meshRef = useRef<InstancedMesh>(null);
  const { size } = useThree(); // Get viewport size for responsive layout
  
  const { smoothedColors, isBeat } = useAudioReactive({ analyser, colors, settings });
  const [c0, c1, c2] = smoothedColors;
  
  // --- 1. Dynamic Grid Configuration (Responsive) ---
  const { RADIUS, GAP, BRICK_W, BRICK_H, COLS, ROWS, COUNT, ANGLE_STEP } = useMemo(() => {
      const aspect = size.width / size.height;
      const isHighQuality = settings.quality !== 'low';
      
      const radius = 45; 
      const gap = 0.25; 
      
      // Adjust brick size based on quality
      // Double width blocks for "Wide Pixel" aesthetic
      const brickW = isHighQuality ? 2.4 : 3.6; 
      const brickH = isHighQuality ? 0.6 : 0.9;
      
      // Camera Geometry Assumptions (matching ThreeVisualizer defaults & Scene logic)
      // Cam Z = 16, Wall Center Z = -50. Distance = 66.
      // Vertical FOV = 55 degrees.
      const dist = 66;
      const vFovRad = (55 * Math.PI) / 180;
      const visibleHeightAtDepth = 2 * Math.tan(vFovRad / 2) * dist;
      
      // Vertical Coverage: Add 15% buffer for movement/shake
      const targetHeight = visibleHeightAtDepth * 1.15;
      let rows = Math.ceil(targetHeight / (brickH + gap));
      if (rows % 2 === 0) rows++; // Ensure odd number for center line
      
      // Horizontal Coverage: Calculate required arc length
      const visibleWidthAtDepth = visibleHeightAtDepth * aspect;
      // The wall curves away, so we need a wider arc to cover the corners.
      // 1.2x multiplier is a heuristic that works well for this curvature/distance ratio.
      const targetArcLength = visibleWidthAtDepth * 1.2;
      const colStep = brickW + gap;
      let cols = Math.ceil(targetArcLength / colStep);
      if (cols % 2 === 0) cols++; // Ensure symmetric
      
      // Limit max cols to avoid wrapping behind camera (max 270 deg)
      const maxCols = Math.floor((Math.PI * 1.5 * radius) / colStep);
      cols = Math.min(cols, maxCols);

      return {
          RADIUS: radius,
          GAP: gap,
          BRICK_W: brickW,
          BRICK_H: brickH,
          COLS: cols,
          ROWS: rows,
          COUNT: cols * rows,
          ANGLE_STEP: colStep / radius
      };
  }, [size.width, size.height, settings.quality]);
  
  // --- 2. Geometry Layout (Static) ---
  const dummy = useMemo(() => new Object3D(), []);
  
  // Attributes: 
  // aLayout: [x: freq_map (0..1), y: height_map (0..1), z: edge_fade (0..1)]
  // aRandom: [val: 0..1] for color variation
  const { layoutAttribute, randomAttribute } = useMemo(() => {
      const lArr = new Float32Array(COUNT * 3);
      const rArr = new Float32Array(COUNT);
      
      for(let i=0; i<COUNT; i++) {
          const col = Math.floor(i / ROWS);
          const row = i % ROWS;
          
          const colNorm = (col / (COLS - 1)) * 2 - 1; 
          const freqMap = Math.abs(colNorm); 
          const freqIndex = Math.pow(freqMap, 1.5); 

          const rowMap = row / (ROWS - 1);
          
          // Edge Fade: Varies based on column distance to soften the sides
          // Power 5.0 keeps the center distinct
          const edgeFade = 1.0 - Math.pow(Math.abs(colNorm), 5.0);

          lArr[i*3+0] = freqIndex;
          lArr[i*3+1] = rowMap;
          lArr[i*3+2] = edgeFade; 
          
          rArr[i] = Math.random(); 
      }
      return {
          layoutAttribute: new InstancedBufferAttribute(lArr, 3),
          randomAttribute: new InstancedBufferAttribute(rArr, 1)
      };
  }, [COUNT, COLS, ROWS]);

  // Set initial positions
  useLayoutEffect(() => {
    if (meshRef.current) {
      let i = 0;
      const totalArc = (COLS - 1) * ANGLE_STEP;
      const startAngle = -totalArc / 2;
      const totalHeight = (ROWS - 1) * (BRICK_H + GAP);
      const startY = -totalHeight / 2;

      for (let col = 0; col < COLS; col++) {
        const theta = startAngle + col * ANGLE_STEP;
        
        for (let row = 0; row < ROWS; row++) {
          const x = Math.sin(theta) * RADIUS;
          const z = RADIUS - (Math.cos(theta) * RADIUS); 
          const y = startY + row * (BRICK_H + GAP);

          dummy.position.set(x, y, z);
          dummy.lookAt(0, y, RADIUS); 
          dummy.scale.set(BRICK_W, BRICK_H, 1.0); 
          dummy.updateMatrix();
          
          meshRef.current.setMatrixAt(i, dummy.matrix);
          i++;
        }
      }
      meshRef.current.instanceMatrix.needsUpdate = true;
      meshRef.current.geometry.setAttribute('aLayout', layoutAttribute);
      meshRef.current.geometry.setAttribute('aRandom', randomAttribute);
    }
  }, [dummy, COLS, ROWS, RADIUS, ANGLE_STEP, GAP, BRICK_W, BRICK_H, layoutAttribute, randomAttribute]);

  // --- 3. Audio Texture ---
  const dataArray = useMemo(() => new Uint8Array(analyser.frequencyBinCount), [analyser]);
  const audioTexture = useMemo(() => {
    const tex = new DataTexture(dataArray, dataArray.length, 1, RedFormat, UnsignedByteType);
    tex.magFilter = LinearFilter;
    return tex;
  }, [dataArray.length]);

  // --- 4. Shader Logic (Smoother Transition) ---
  const uniforms = useMemo(() => ({
    uAudioTexture: { value: audioTexture },
    uTime: { value: 0 },
    uColor1: { value: new Color() },
    uColor2: { value: new Color() },
    uColor3: { value: new Color() },
    uBeat: { value: 0.0 },
    uSensitivity: { value: 1.0 },
  }), [audioTexture]);

  const onBeforeCompile = useMemo(() => (shader: any) => {
    Object.assign(shader.uniforms, uniforms);

    shader.vertexShader = `
      attribute vec3 aLayout;
      attribute float aRandom;
      
      varying float vActive; 
      varying float vRowPos; 
      varying float vEdge;
      varying float vRandom;
      varying vec2 vFluxUv;
      
      uniform sampler2D uAudioTexture;
      uniform float uTime;
      uniform float uBeat;
      uniform float uSensitivity;
      
      ${shader.vertexShader}
    `.replace(
      '#include <begin_vertex>',
      `
      #include <begin_vertex>
      vFluxUv = uv;
      vRowPos = aLayout.y;
      vEdge = aLayout.z;
      vRandom = aRandom;

      float audioVal = texture2D(uAudioTexture, vec2(aLayout.x * 0.9 + 0.02, 0.5)).r;
      float intensity = audioVal * uSensitivity;
      
      // --- Center-Out Logic ---
      // 0.0 at center, 1.0 at top/bottom edges
      float distFromCenter = abs(aLayout.y - 0.5) * 2.0; 
      
      float activationThreshold = distFromCenter;
      
      // Smoother activation for a more fluid feel (0.0 -> 0.3 range)
      float activation = smoothstep(0.0, 0.3, (intensity * 1.1) - activationThreshold);
      
      float beatPulse = smoothstep(0.8, 1.0, sin(aLayout.y * 10.0 - uTime * 8.0)) * uBeat * 0.5;
      activation += beatPulse * step(0.1, activation);

      vActive = clamp(activation, 0.0, 1.0);
      
      // Pop out active blocks physically (Solid block extrusion)
      transformed.z += vActive * 2.5; 
      `
    );

    shader.fragmentShader = `
      uniform vec3 uColor1; // Deep
      uniform vec3 uColor2; // Mid
      uniform vec3 uColor3; // Hot
      uniform float uBeat;
      uniform float uTime;
      
      varying float vActive;
      varying float vRowPos;
      varying float vEdge;
      varying float vRandom;
      varying vec2 vFluxUv;
      
      ${shader.fragmentShader}
    `.replace(
      '#include <color_fragment>',
      `
      #include <color_fragment>
      
      // --- Smooth Contrast Mosaic Logic ---
      
      // 1. Contrast Curve for Activity
      float activeCurve = pow(vActive, 1.5);
      
      // 2. Base Gradient: Deep -> Mid
      vec3 baseCol = mix(uColor1 * 0.2, uColor2, smoothstep(0.0, 0.6, vActive));
      
      // 3. Hot Highlights: Mid -> Hot
      float mixNoise = vRandom * 0.3 - 0.15;
      vec3 hotCol = mix(baseCol, uColor3, smoothstep(0.4 + mixNoise, 0.9 + mixNoise, vActive + vRowPos * 0.3));
      
      // 4. Brightness Variation (Smoothed)
      // 0.2 + pow(vRandom, 2.0) * 2.0 -> More gradients in brightness
      float brightness = 0.2 + pow(vRandom, 2.0) * 2.0;
      
      // 5. Time-based Glitch/Shimmer (Softer)
      float shimmer = sin(uTime * 6.0 + vRandom * 15.0);
      shimmer = smoothstep(-1.0, 1.0, shimmer) * 0.4 + 0.6; // range 0.6 - 1.0
      
      vec3 finalColor = hotCol * brightness * shimmer;
      
      // 6. Beat Flash
      finalColor += uColor3 * uBeat * 0.5 * vRandom;
      
      // Global Edge Fade (Vignette)
      float alpha = 1.0;
      alpha *= smoothstep(0.0, 0.15, vEdge); 
      
      // HIDE INACTIVE BLOCKS
      // Smooth fade out at the very bottom end of activity
      alpha *= smoothstep(0.01, 0.15, vActive);

      diffuseColor.rgb = finalColor;
      diffuseColor.a = alpha;
      `
    ).replace(
      '#include <emissivemap_fragment>',
      `
      #include <emissivemap_fragment>
      // Smoother bloom correlation
      float emBrightness = 0.2 + pow(vRandom, 2.0) * 2.0;
      float glowIntensity = (0.5 + emBrightness * 1.2) * (0.5 + vActive * 0.8);
      
      totalEmissiveRadiance = diffuseColor.rgb * glowIntensity;
      `
    );
  }, [uniforms]);

  const beatRef = useRef(0);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    analyser.getByteFrequencyData(dataArray);
    audioTexture.needsUpdate = true;

    if (isBeat) beatRef.current = 1.0;
    beatRef.current *= 0.92;

    uniforms.uTime.value = time;
    uniforms.uBeat.value = beatRef.current;
    uniforms.uSensitivity.value = settings.sensitivity;
    
    if (c1) uniforms.uColor1.value.copy(c1); 
    if (c0) uniforms.uColor2.value.copy(c0);
    if (c2) uniforms.uColor3.value.copy(c2);

    const camX = Math.sin(time * 0.15) * 3;
    const camY = Math.cos(time * 0.1) * 2;
    state.camera.position.x += (camX - state.camera.position.x) * 0.05;
    state.camera.position.y += (camY - state.camera.position.y) * 0.05;
    state.camera.lookAt(0, 0, -50); 
  });

  return (
    <>
      {!settings.albumArtBackground && <color attach="background" args={['#000000']} />}
      
      <ambientLight intensity={0.1} />
      
      {/* Centered deep in space, filling width */}
      <instancedMesh ref={meshRef} args={[undefined, undefined, COUNT]} position={[0, 0, -50]}>
        <planeGeometry args={[1, 1]} />
        <meshStandardMaterial
          onBeforeCompile={onBeforeCompile}
          roughness={0.2}
          metalness={0.9}
          side={DoubleSide}
          toneMapped={false} 
          transparent={true}
          depthWrite={false} // Disable depth write to prevent occlusion by invisible blocks
        />
      </instancedMesh>

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -30, -20]}>
          <planeGeometry args={[200, 200]} />
          <MeshReflectorMaterial
            blur={[400, 100]}
            resolution={1024}
            mixBlur={1}
            mixStrength={10}
            roughness={0.7}
            depthScale={1}
            minDepthThreshold={0.4}
            maxDepthThreshold={1.4}
            color="#050505"
            metalness={0.8}
            mirror={0.5}
          />
      </mesh>
    </>
  );
};
