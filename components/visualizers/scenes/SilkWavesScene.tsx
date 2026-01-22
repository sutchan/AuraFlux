/**
 * File: components/visualizers/scenes/SilkWavesScene.tsx
 * Version: 2.2.0
 * Author: Aura Vision Team
 * Copyright (c) 2024 Aura Vision. All rights reserved.
 * Updated: 2025-02-23 14:00
 */

import React, { useRef, useMemo, useCallback } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { VisualizerSettings } from '../../../core/types';
import { useAudioReactive } from '../../../core/hooks/useAudioReactive';
import { useAI } from '../../AppContext';

interface SceneProps {
  analyser: AnalyserNode;
  colors: string[];
  settings: VisualizerSettings;
}

export const SilkWavesScene: React.FC<SceneProps> = ({ analyser, colors, settings }) => {
  const materialRef = useRef<THREE.MeshPhysicalMaterial>(null);
  const meshRef = useRef<THREE.Mesh>(null);
  const light1Ref = useRef<THREE.PointLight>(null);
  const light2Ref = useRef<THREE.PointLight>(null);
  const light3Ref = useRef<THREE.SpotLight>(null);
  
  const { isIdentifying } = useAI();
  const { bass, treble, smoothedColors } = useAudioReactive({ analyser, colors, settings });

  // --- Core Fix & Optimization ---
  const geometry = useMemo(() => {
    // Increased segment count for smoother waves (GPU can handle it)
    let segs = settings.quality === 'low' ? 64 : settings.quality === 'med' ? 128 : 256;
    // Increased size for full coverage in top-down view
    const geo = new THREE.PlaneGeometry(70, 70, segs, segs); 
    
    // CRITICAL FIX: Compute Tangents is REQUIRED for 'anisotropy' to work correctly.
    // Without this, the TBN matrix calculation in the shader produces NaNs, 
    // causing the Bloom effect (Glow) to crash and turn the screen black.
    geo.computeTangents();
    
    return geo;
  }, [settings.quality]);

  // Uniforms for GPU-based animation
  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uBass: { value: 0 },
    uTreble: { value: 0 },
    uScan: { value: 0 },
  }), []);

  // Inject custom wave logic into the physical material shader
  const onBeforeCompile = useCallback((shader: any) => {
    shader.uniforms.uTime = uniforms.uTime;
    shader.uniforms.uBass = uniforms.uBass;
    shader.uniforms.uTreble = uniforms.uTreble;
    shader.uniforms.uScan = uniforms.uScan;

    // 1. Wave Function Definition
    // Calculates Height (Z) and Derivatives (dx, dy) for correct lighting
    shader.vertexShader = `
      uniform float uTime;
      uniform float uBass;
      uniform float uTreble;
      uniform float uScan;

      vec3 calculateWave(vec2 uv) {
          float x = uv.x;
          float y = uv.y;
          float t = uTime;
          
          float z = 0.0;
          float dx = 0.0;
          float dy = 0.0;

          // Wave 1: Large diagonal swell
          float k1 = 0.15;
          float p1 = x * k1 + t * 0.5;
          float a1 = 3.0;
          z += sin(p1) * cos(y * 0.1) * a1;
          dx += k1 * cos(p1) * cos(y * 0.1) * a1;
          dy += -0.1 * sin(p1) * sin(y * 0.1) * a1;

          // Wave 2: Detailed ripple
          float k2 = 0.4;
          float p2 = x * k2 - t * 0.6;
          float a2 = 1.5;
          z += sin(p2) * sin(y * 0.35) * a2;
          dx += k2 * cos(p2) * sin(y * 0.35) * a2;
          dy += 0.35 * sin(p2) * cos(y * 0.35) * a2;

          // Wave 3: Bass Shockwave (Center Ripple - Enhanced for Top Down)
          float d = length(uv);
          if (d > 0.1) {
             float freq = 0.8;
             float phase = -t * 2.0;
             float amp = uBass * 6.0; // Increased amplitude for vertical impact
             z += sin(d * freq + phase) * amp;
             // Chain rule derivative
             float dVal = cos(d * freq + phase) * freq * amp;
             dx += dVal * (x / d);
             dy += dVal * (y / d);
          }
          
          // AI Scan Wave
          if (uScan > 0.01) {
             z += sin(x * 0.5 - t * 2.0) * 2.0 * uScan;
          }

          return vec3(z, dx, dy);
      }

      ${shader.vertexShader}
    `;

    // 2. Inject Normal Re-calculation
    shader.vertexShader = shader.vertexShader.replace(
      '#include <beginnormal_vertex>',
      `
      #include <beginnormal_vertex>
      vec3 wave = calculateWave(position.xy);
      
      // Analytical Normal: (-dx, -dy, 1) normalized
      vec3 newNormal = normalize(vec3(-wave.y, -wave.z, 1.0));
      objectNormal = newNormal;
      
      // Update Tangent to be orthogonal to new normal
      #ifdef USE_TANGENT
        vec3 t = normalize(vec3(1.0, 0.0, wave.y)); 
        objectTangent = t; 
      #endif
      `
    );

    // 3. Inject Position Displacement
    shader.vertexShader = shader.vertexShader.replace(
      '#include <begin_vertex>',
      `
      #include <begin_vertex>
      transformed.z = wave.x;
      
      // Treble jitter (high freq detail)
      if (uTreble > 0.01) {
         transformed.z += sin(position.x * 5.0 + uTime * 10.0) * 0.1 * uTreble;
      }
      `
    );
  }, [uniforms]);

  useFrame((state) => {
    const time = state.clock.getElapsedTime() * settings.speed;
    const [c0, c1, c2] = smoothedColors;

    // Update Uniforms
    uniforms.uTime.value = time;
    uniforms.uBass.value = bass;
    uniforms.uTreble.value = treble;
    uniforms.uScan.value = isIdentifying ? 1.0 : 0.0;

    // Update Material Props
    if (materialRef.current) {
        materialRef.current.color = c0;
        materialRef.current.emissive = c1;
        materialRef.current.sheenColor = c2;
        
        const scanIntensity = isIdentifying ? (Math.sin(time * 5) * 0.5 + 0.5) * 0.6 : 0;
        materialRef.current.emissiveIntensity = 0.2 + bass * 0.4 + scanIntensity;
    }
    
    // Light 1: Main Top-Side Light (Simulate Sun/Studio Light)
    if (light1Ref.current) {
      light1Ref.current.position.set(30, 40, 20); 
      light1Ref.current.color = c0;
      light1Ref.current.intensity = 8.0 + bass * 20;
    }

    // Light 2: Under-lighting (Subsurface scattering simulation)
    // Placed below the mesh (Y < 0) to shine through via transmission
    if (light2Ref.current) {
      light2Ref.current.position.set(-15, -25, -5);
      light2Ref.current.color = c1;
      light2Ref.current.intensity = 10.0 + treble * 25;
    }

    // Light 3: Spot from opposite side for Anisotropic highlights
    if (light3Ref.current) {
        light3Ref.current.position.set(-40, 50, -20);
        light3Ref.current.color = c2;
        light3Ref.current.lookAt(0,0,0);
    }
    
    // Camera: Top-Down View
    // Position high on Y axis, looking at origin.
    // Dynamic zoom based on Bass
    const camY = 45 - bass * 10.0; 
    state.camera.position.set(0, camY, 0.1); // Slight Z offset prevents lookAt gimbal lock
    state.camera.lookAt(0, 0, 0);
    
    // Slight slow rotation of the camera for "Satellite" feel
    state.camera.rotation.z = time * 0.05;
  });

  return (
    <>
      <color attach="background" args={['#020205']} /> 
      
      <pointLight ref={light1Ref} distance={200} decay={2} />
      <pointLight ref={light2Ref} distance={100} decay={2} />
      <spotLight ref={light3Ref} angle={0.6} penumbra={0.5} intensity={15.0} distance={150} />
      
      <ambientLight intensity={0.3} />
      
      {/* Flat Floor Orientation (-90deg X) */}
      <mesh ref={meshRef} rotation={[-Math.PI / 2, 0, 0]}>
         <primitive object={geometry} attach="geometry" />
         <meshPhysicalMaterial 
            ref={materialRef}
            onBeforeCompile={onBeforeCompile}
            dithering={true}
            side={THREE.DoubleSide}
            
            // --- Silk Physics (Optimized for Top-Down) ---
            color={colors[0]}
            emissive={colors[1]}
            emissiveIntensity={0.2}
            
            roughness={0.35} 
            metalness={0.6} 
            
            // Anisotropy: Critical for silk threads look
            anisotropy={0.7}
            anisotropyRotation={Math.PI / 4}
            
            iridescence={0.4}
            iridescenceIOR={1.5}
            iridescenceThicknessRange={[100, 400]}
            
            sheen={1.0}
            sheenRoughness={0.4}
            sheenColor={colors[2]}
            
            // Transmission allows under-lighting to bleed through peaks
            transmission={0.2} 
            thickness={1.5} 
            ior={1.45} 
            
            clearcoat={0.5}
            clearcoatRoughness={0.2}
         />
      </mesh>
    </>
  );
};