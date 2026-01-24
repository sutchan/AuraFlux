/**
 * File: components/visualizers/scenes/KineticWallScene.tsx
 * Version: 3.8.1
 * Author: Sut
 * Copyright (c) 2025 Aura Flux. All rights reserved.
 * Updated: 2025-02-26 22:15
 * Description: Increased brick size by 2x for a bolder visual impact.
 */

import React, { useRef, useMemo, useLayoutEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
// @fixtsx(11) - import THREE members directly
import { InstancedMesh, MeshStandardMaterial, DataTexture, RedFormat, UnsignedByteType, LinearFilter, InstancedBufferAttribute, Color, Object3D } from 'three';
import { VisualizerSettings } from '../../../core/types';
import { useAudioReactive } from '../../../core/hooks/useAudioReactive';

interface SceneProps {
  analyser: AnalyserNode;
  colors: string[];
  settings: VisualizerSettings;
}

export const KineticWallScene: React.FC<SceneProps> = ({ analyser, colors, settings }) => {
  const meshRef = useRef<InstancedMesh>(null);
  const materialRef = useRef<MeshStandardMaterial>(null);
  
  const { bass, volume, smoothedColors, isBeat } = useAudioReactive({ analyser, colors, settings });
  const [c0, c1] = smoothedColors;

  // --- 1. Overscan Grid Logic ---
  const { count, cols, rows, aLayoutData } = useMemo(() => {
    const aspect = window.innerWidth / window.innerHeight;
    const baseDensity = settings.quality === 'high' ? 45 : 30; // Reduced density for larger bricks
    
    // Width Buffer (Overscan) to prevent black background leakage
    const c = Math.ceil(baseDensity * Math.max(aspect, 1.0) * 1.5);
    const r = Math.ceil(baseDensity / Math.min(aspect, 1.0));
    const total = c * r;

    const data = new Float32Array(total * 2); 
    for (let i = 0; i < total; i++) {
        const row = Math.floor(i / c);
        const col = i % c;
        const cx = col - c / 2;
        const cy = row - r / 2;
        data[i * 2 + 0] = Math.sqrt(cx * cx + cy * cy); 
        data[i * 2 + 1] = Math.random(); 
    }

    return { count: total, cols: c, rows: r, aLayoutData: data };
  }, [settings.quality]);

  const geometry = useMemo(() => new RoundedBoxGeometry(1.84, 1.84, 2.0, 3, 0.2), []); // Increased size by 2x

  useLayoutEffect(() => {
    if (geometry) {
      // @fixtsx(57) - Use imported InstancedBufferAttribute
      geometry.setAttribute('aLayout', new InstancedBufferAttribute(aLayoutData, 2));
    }
  }, [geometry, aLayoutData]);

  const dataArray = useMemo(() => new Uint8Array(analyser.frequencyBinCount), [analyser]);
  const audioTexture = useMemo(() => {
    // @fixtsx(63-64) - Use imported constants for DataTexture
    const tex = new DataTexture(dataArray, dataArray.length, 1, RedFormat, UnsignedByteType);
    tex.magFilter = LinearFilter;
    return tex;
  }, [dataArray.length]);

  const uniforms = useMemo(() => ({
    uAudioTexture: { value: audioTexture },
    uTime: { value: 0 },
    uColor1: { value: new Color() },
    uColor2: { value: new Color() },
    uBeat: { value: 0.0 },
    uSensitivity: { value: 1.0 }
  }), [audioTexture]);

  const onBeforeCompile = useMemo(() => (shader: any) => {
    Object.assign(shader.uniforms, uniforms);

    shader.vertexShader = `
      attribute vec2 aLayout;
      varying float vFluxHeight;
      varying float vFluxHeat;
      varying vec3 vFluxViewDir;
      uniform sampler2D uAudioTexture;
      uniform float uTime;
      uniform float uBeat;
      uniform float uSensitivity;
      ${shader.vertexShader}
    `.replace(
      '#include <begin_vertex>',
      `
      #include <begin_vertex>
      
      float flux_freqIdx = clamp(aLayout.x / 75.0, 0.0, 0.85);
      float flux_rawAudio = texture2D(uAudioTexture, vec2(flux_freqIdx, 0.5)).r;

      float flux_levels = 16.0; 
      float flux_quantized = floor(flux_rawAudio * flux_levels) / flux_levels;

      float flux_breathe = sin(uTime * 0.5 + aLayout.y * 6.28) * 0.12;
      float flux_wave = sin(aLayout.x * 0.35 - uTime * 5.0) * 0.5 + 0.5;
      float flux_ripple = flux_wave * uBeat * 5.0;
      
      // SENSITIVITY CALIBRATION: Multiplier reduced from 9.0 to 4.5 (Final 50% Reduction)
      float flux_ext = (flux_quantized * 4.5 * uSensitivity) + flux_ripple + flux_breathe;
      transformed.z += max(0.0, flux_ext);
      
      // Normalize height for AO/Fragment logic (Divisor adjusted to maintain gradient)
      vFluxHeight = clamp(flux_ext / 8.0, 0.0, 1.0);
      vFluxHeat = flux_quantized;
      vFluxViewDir = (modelViewMatrix * vec4(transformed, 1.0)).xyz;
      `
    );

    shader.fragmentShader = `
      uniform vec3 uColor1;
      uniform vec3 uColor2;
      uniform float uBeat;
      varying float vFluxHeight;
      varying float vFluxHeat;
      varying vec3 vFluxViewDir;
      ${shader.fragmentShader}
    `.replace(
      '#include <color_fragment>',
      `
      #include <color_fragment>
      vec3 flux_fNormal = normalize(vNormal);
      vec3 flux_viewDir = normalize(-vFluxViewDir);
      float flux_fresnel = pow(1.0 - clamp(dot(flux_fNormal, flux_viewDir), 0.0, 1.0), 3.5);
      
      float flux_facing = clamp(dot(flux_fNormal, vec3(0,0,1)), 0.0, 1.0);
      float flux_lateralShadow = mix(0.6, 1.0, pow(flux_facing, 2.0));
      float flux_ao = mix(0.2, 1.0, vFluxHeight);
      float flux_totalShadow = flux_ao * flux_lateralShadow;
      
      vec3 flux_baseCol = mix(uColor1, uColor2, vFluxHeat);
      vec3 flux_rimCol = mix(flux_baseCol, vec3(1.0), 0.5);
      float flux_edgeGlow = flux_fresnel * (2.0 + uBeat * 6.0 + vFluxHeat * 5.0);
      
      diffuseColor.rgb = (flux_baseCol * flux_totalShadow) + (flux_rimCol * flux_edgeGlow * 0.4);
      `
    ).replace(
      '#include <emissivemap_fragment>',
      `
      #include <emissivemap_fragment>
      float flux_emIntensity = (vFluxHeat * 1.5 + uBeat * 2.0) * pow(vFluxHeight, 2.0);
      totalEmissiveRadiance = diffuseColor.rgb * flux_emIntensity;
      `
    );
  }, [uniforms]);

  const beatRef = useRef(0);
  const dummy = useMemo(() => new Object3D(), []);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    analyser.getByteFrequencyData(dataArray);
    audioTexture.needsUpdate = true;

    if (isBeat) beatRef.current = 1.0;
    beatRef.current *= 0.92; 

    uniforms.uTime.value = time;
    uniforms.uBeat.value = beatRef.current;
    uniforms.uSensitivity.value = settings.sensitivity;
    uniforms.uColor1.value.set(c1);
    uniforms.uColor2.value.set(c0);

    // Update Matrix
    if (meshRef.current) {
        const spacing = 2.12; // Increased spacing by 2x
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

    // --- Overscan Camera Bound ---
    const gridHalfWidth = (cols * 2.12) / 2; // Use new spacing for bounds calculation
    const maxPanX = gridHalfWidth * 0.35; 
    
    const camX = Math.sin(time * 0.2) * maxPanX;
    const camY = Math.cos(time * 0.15) * 4.0;
    const camZ = 48 - (bass * 16);
    
    state.camera.position.x += (camX - state.camera.position.x) * 0.04;
    state.camera.position.y += (camY - state.camera.position.y) * 0.04;
    state.camera.position.z += (camZ - state.camera.position.z) * 0.04;
    state.camera.lookAt(0, 0, 0);
  });

  return (
    <>
      <color attach="background" args={['#010103']} />
      <ambientLight intensity={0.2} />
      {/* @fixtsx(206-208) - JSX props are now correctly typed with named imports */}
      <directionalLight position={[15, 15, 25]} intensity={1.8} color={c0} />
      <pointLight position={[50, 50, 60]} intensity={45} color={c0} />
      <pointLight position={[-50, -50, 30]} intensity={30} color={c1} />
      
      <instancedMesh ref={meshRef} args={[geometry, undefined, count]}>
        <meshStandardMaterial 
            ref={materialRef}
            onBeforeCompile={onBeforeCompile}
            metalness={0.95}
            roughness={0.08}
            envMapIntensity={1.5}
        />
      </instancedMesh>
    </>
  );
};
