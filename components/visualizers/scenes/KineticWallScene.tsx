/**
 * File: components/visualizers/scenes/KineticWallScene.tsx
 * Version: 3.2.0
 * Author: Sut
 * Copyright (c) 2025 Aura Flux. All rights reserved.
 * Updated: 2025-02-25 22:00
 * Description: Full-screen Kinetic Wall with dynamic aspect ratio adaptation.
 */

import React, { useRef, useMemo, useLayoutEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import * as THREE from 'three';
import { VisualizerSettings } from '../../../core/types';
import { useAudioReactive } from '../../../core/hooks/useAudioReactive';

interface SceneProps {
  analyser: AnalyserNode;
  colors: string[];
  settings: VisualizerSettings;
}

export const KineticWallScene: React.FC<SceneProps> = ({ analyser, colors, settings }) => {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const materialRef = useRef<THREE.MeshStandardMaterial>(null);
  const { viewport } = useThree();
  
  const { bass, volume, smoothedColors, isBeat } = useAudioReactive({ analyser, colors, settings });
  const [c0, c1] = smoothedColors;

  // --- 1. Dynamic Grid Logic ---
  // We calculate a grid that is roughly 20% larger than the required viewport coverage
  // to account for camera oscillations and "breathing" movement.
  const { count, cols, rows, aLayoutData } = useMemo(() => {
    const aspect = window.innerWidth / window.innerHeight;
    const baseDensity = settings.quality === 'high' ? 85 : 55;
    
    // Adjust columns and rows to be aspect-aware
    const c = Math.ceil(baseDensity * Math.max(aspect, 1.0));
    const r = Math.ceil(baseDensity / Math.min(aspect, 1.0));
    const total = c * r;

    const data = new Float32Array(total * 2); 
    for (let i = 0; i < total; i++) {
        const row = Math.floor(i / c);
        const col = i % c;
        const cx = col - c / 2;
        const cy = row - r / 2;
        data[i * 2 + 0] = Math.sqrt(cx * cx + cy * cy); // distFromCenter for ripples
        data[i * 2 + 1] = Math.random(); // phase for breathing
    }

    return { count: total, cols: c, rows: r, aLayoutData: data };
  }, [settings.quality]); // Re-calculate grid only on quality change

  // Create standard geometry for instances
  const geometry = useMemo(() => new RoundedBoxGeometry(0.92, 0.92, 1.0, 3, 0.12), []);

  // Sync attribute to geometry
  useLayoutEffect(() => {
    if (geometry) {
      geometry.setAttribute('aLayout', new THREE.InstancedBufferAttribute(aLayoutData, 2));
    }
  }, [geometry, aLayoutData]);

  // Audio Texture Data
  const dataArray = useMemo(() => new Uint8Array(analyser.frequencyBinCount), [analyser]);
  const audioTexture = useMemo(() => {
    const tex = new THREE.DataTexture(dataArray, dataArray.length, 1, THREE.RedFormat, THREE.UnsignedByteType);
    tex.magFilter = THREE.LinearFilter;
    return tex;
  }, [dataArray.length]);

  const uniforms = useMemo(() => ({
    uAudioTexture: { value: audioTexture },
    uTime: { value: 0 },
    uColor1: { value: new THREE.Color() },
    uColor2: { value: new THREE.Color() },
    uBeat: { value: 0.0 },
    uSensitivity: { value: 1.0 }
  }), [audioTexture]);

  const onBeforeCompile = useMemo(() => (shader: any) => {
    Object.assign(shader.uniforms, uniforms);

    shader.vertexShader = `
      attribute vec2 aLayout;
      varying float vFluxHeat;
      uniform sampler2D uAudioTexture;
      uniform float uTime;
      uniform float uBeat;
      uniform float uSensitivity;
      ${shader.vertexShader}
    `.replace(
      '#include <begin_vertex>',
      `
      #include <begin_vertex>
      
      // Dynamic scaling: Higher quality = more bins sampled
      float flux_freqIdx = clamp(aLayout.x / 60.0, 0.0, 0.85);
      float flux_rawAudio = texture2D(uAudioTexture, vec2(flux_freqIdx, 0.5)).r;

      // 1. MECHANICAL QUANTIZATION (Industrial stepper motor feel)
      float flux_levels = 12.0; 
      float flux_quantized = floor(flux_rawAudio * flux_levels) / flux_levels;

      // 2. BREATHING & RIPPLE
      float flux_breathe = sin(uTime * 0.4 + aLayout.y * 6.28) * 0.15;
      float flux_wave = sin(aLayout.x * 0.35 - uTime * 4.0) * 0.5 + 0.5;
      float flux_ripple = flux_wave * uBeat * 4.0;
      
      // Apply Displacement to Z
      float flux_ext = (flux_quantized * 16.0 * uSensitivity) + flux_ripple + flux_breathe;
      transformed.z += max(0.0, flux_ext);
      
      vFluxHeat = flux_quantized;
      `
    );

    shader.fragmentShader = `
      uniform vec3 uColor1;
      uniform vec3 uColor2;
      uniform float uBeat;
      varying float vFluxHeat;
      ${shader.fragmentShader}
    `.replace(
      '#include <color_fragment>',
      `
      #include <color_fragment>
      
      // Improved Fresnel with View Position check
      vec3 flux_fNormal = normalize(vNormal);
      vec3 flux_viewDir = normalize(vViewPosition);
      float flux_fresnel = pow(1.0 - clamp(dot(flux_fNormal, -flux_viewDir), 0.0, 1.0), 3.0);
      
      // Blend colors based on local intensity
      vec3 flux_baseCol = mix(uColor1, uColor2, vFluxHeat);
      
      // Edge Pop: Stronger rim lighting on beat
      vec3 flux_rimCol = mix(flux_baseCol, vec3(1.0), 0.4);
      float flux_edgeGlow = flux_fresnel * (1.5 + uBeat * 4.0 + vFluxHeat * 3.0);
      
      diffuseColor.rgb = mix(flux_baseCol, flux_rimCol, flux_fresnel * 0.5) + (flux_rimCol * flux_edgeGlow * 0.3);
      `
    ).replace(
      '#include <emissivemap_fragment>',
      `
      #include <emissivemap_fragment>
      float flux_fres2 = pow(1.0 - clamp(dot(normalize(vNormal), -normalize(vViewPosition)), 0.0, 1.0), 4.0);
      totalEmissiveRadiance = diffuseColor.rgb * (vFluxHeat * 0.6 + uBeat * 0.8 + flux_fres2 * 0.5);
      `
    );
  }, [uniforms]);

  const beatRef = useRef(0);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    analyser.getByteFrequencyData(dataArray);
    audioTexture.needsUpdate = true;

    if (isBeat) beatRef.current = 1.0;
    beatRef.current *= 0.93; 

    uniforms.uTime.value = time;
    uniforms.uBeat.value = beatRef.current;
    uniforms.uSensitivity.value = settings.sensitivity;
    uniforms.uColor1.value.set(c1);
    uniforms.uColor2.value.set(c0);

    // Update Matrix (Staggered Brick Layout)
    if (meshRef.current) {
        // We use a slight multiplier to ensure visual continuity
        const spacing = 1.06; 
        for (let i = 0; i < count; i++) {
            const r = Math.floor(i / cols);
            const c = i % cols;
            const rowOffset = (r % 2) * 0.5;
            dummy.position.set(
                (c + rowOffset - cols / 2) * spacing,
                (r - rows / 2) * spacing,
                0
            );
            dummy.updateMatrix();
            meshRef.current.setMatrixAt(i, dummy.matrix);
        }
        meshRef.current.instanceMatrix.needsUpdate = true;
    }

    // --- Dynamic Cinematic Camera Optimization ---
    // Constraints: Ensure camera never pans far enough to show the edges of the wall.
    // X pan is tied to cols, Z depth is tied to bass.
    const maxPanX = (cols * 0.2); 
    const camX = Math.sin(time * 0.2) * maxPanX;
    
    // Closer Z-base (50 instead of 55) to ensure we are "inside" the wall boundaries
    const camZ = 50 - (bass * 14);
    
    state.camera.position.x += (camX - state.camera.position.x) * 0.05;
    state.camera.position.z += (camZ - state.camera.position.z) * 0.05;
    state.camera.lookAt(0, 0, 0);
  });

  return (
    <>
      <color attach="background" args={['#010103']} />
      <ambientLight intensity={0.25} />
      <pointLight position={[50, 50, 60]} intensity={35} color={c0} />
      <pointLight position={[-50, -50, 30]} intensity={20} color={c1} />
      
      <instancedMesh ref={meshRef} args={[geometry, undefined, count]}>
        <meshStandardMaterial 
            ref={materialRef}
            onBeforeCompile={onBeforeCompile}
            metalness={0.9}
            roughness={0.15}
            envMapIntensity={0.8}
        />
      </instancedMesh>
    </>
  );
};
