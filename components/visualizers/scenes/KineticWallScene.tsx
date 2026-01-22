/**
 * File: components/visualizers/scenes/KineticWallScene.tsx
 * Version: 1.1.0
 * Author: Aura Vision Team
 * Copyright (c) 2025 Aura Vision. All rights reserved.
 * Description: A massive semi-cylindrical wall of instanced cubes that react to audio like a concert stage LED matrix.
 * Updated: Added per-instance smoothing buffer to eliminate jitter.
 */

import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
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
  const spotLight1Ref = useRef<THREE.SpotLight>(null);
  const spotLight2Ref = useRef<THREE.SpotLight>(null);
  
  const { bass, mids, treble, smoothedColors, isBeat } = useAudioReactive({ analyser, colors, settings });
  const [c0, c1, c2] = smoothedColors;

  // Grid Configuration
  // High quality = More blocks, smoother curves
  const cols = settings.quality === 'high' ? 64 : settings.quality === 'med' ? 48 : 32;
  const rows = settings.quality === 'high' ? 32 : settings.quality === 'med' ? 24 : 16;
  const count = cols * rows;

  const dummy = useMemo(() => new THREE.Object3D(), []);
  
  // Smoothing Buffer: Stores the current visual state of each block to lerp against
  const extrusionBuffer = useMemo(() => new Float32Array(count).fill(1.0), [count]);
  
  // Generate initial positions for a semi-cylinder (curved wall)
  const layout = useMemo(() => {
    const temp = [];
    const radius = 60; // Distance from center
    const heightSpread = 50;
    const angleSpread = Math.PI * 0.8; // Cover 144 degrees view

    for (let i = 0; i < count; i++) {
        const col = i % cols;
        const row = Math.floor(i / cols);
        
        // Normalized coordinates (0 to 1)
        const u = col / (cols - 1);
        const v = row / (rows - 1);

        // Cylinder mapping
        const angle = (u - 0.5) * angleSpread;
        const x = Math.sin(angle) * radius;
        const z = -Math.cos(angle) * radius; // Negative Z puts it in front of camera (if camera is at 0,0,0)
        const y = (v - 0.5) * heightSpread;

        // Rotation to face center (0,0,0)
        const rotY = -angle;

        // Map position to a frequency index for audio reaction
        // Center columns = Bass (Low Freq), Outer columns = Highs
        // Or: Map linearly across columns
        const freqIndex = Math.floor(Math.abs(u - 0.5) * 2 * 60); // Mirror spectrum from center

        temp.push({ x, y, z, rotY, freqIndex, u, v });
    }
    return temp;
  }, [cols, rows]);

  const dataArray = useMemo(() => new Uint8Array(analyser.frequencyBinCount), [analyser]);

  useFrame((state) => {
    const time = state.clock.getElapsedTime() * settings.speed;
    analyser.getByteFrequencyData(dataArray);

    // Update Spotlights (Sweeping stage lights)
    if (spotLight1Ref.current && spotLight2Ref.current) {
        spotLight1Ref.current.color = c0;
        spotLight2Ref.current.color = c1;
        
        // Sweep logic
        const sweep1 = Math.sin(time * 0.5) * 40;
        const sweep2 = Math.cos(time * 0.3) * 40;
        
        spotLight1Ref.current.target.position.set(sweep1, 0, -60);
        spotLight1Ref.current.target.updateMatrixWorld();
        
        spotLight2Ref.current.target.position.set(sweep2, -10, -60);
        spotLight2Ref.current.target.updateMatrixWorld();
        
        // Beat flash intensity
        const baseIntensity = 50;
        const flash = isBeat ? 200 : 0;
        spotLight1Ref.current.intensity = baseIntensity + bass * 100 + flash;
        spotLight2Ref.current.intensity = baseIntensity + mids * 100 + flash;
    }

    // Camera Movement: Slight handheld feeling
    state.camera.position.x = Math.sin(time * 0.2) * 5;
    state.camera.position.y = Math.cos(time * 0.15) * 2;
    state.camera.lookAt(0, 0, -60);

    if (meshRef.current) {
        // Material Updates
        const mat = meshRef.current.material as THREE.MeshStandardMaterial;
        mat.color = new THREE.Color('#111111'); // Dark base
        mat.emissive = c2;
        // Emissive strength reacts to Treble for "sparkle"
        mat.emissiveIntensity = 0.2 + treble * 2.0;

        // Instance Updates
        layout.forEach((data, i) => {
            // Audio Value
            const rawAudio = dataArray[data.freqIndex % dataArray.length] / 255;
            const boostedAudio = rawAudio * settings.sensitivity;

            // Target Extrusion (Z-scale)
            const targetExtrusion = 1 + boostedAudio * 15; 
            
            // --- SMOOTHING LOGIC ---
            // Asymmetric Lerp: Attack fast (0.3), Decay slow (0.1)
            // This prevents "flickering" when values drop too quickly
            const lerpFactor = targetExtrusion > extrusionBuffer[i] ? 0.3 : 0.1;
            extrusionBuffer[i] += (targetExtrusion - extrusionBuffer[i]) * lerpFactor;
            
            const smoothExtrusion = extrusionBuffer[i];

            // Pulse wave across the wall
            const wave = Math.sin(data.u * 10 + time * 2) * Math.cos(data.v * 5 + time);
            const waveScale = 1 + (wave * 0.5 * bass);

            dummy.position.set(data.x, data.y, data.z);
            dummy.rotation.set(0, data.rotY, 0);
            
            // Apply scale: Z is the length pointing inward
            dummy.scale.set(
                1.5 * (1 + bass * 0.2), // X Width
                1.5 * (1 + bass * 0.2), // Y Height
                Math.max(0.1, smoothExtrusion * waveScale) // Z Length (Kinetic action)
            );
            
            dummy.updateMatrix();
            meshRef.current!.setMatrixAt(i, dummy.matrix);
        });
        meshRef.current.instanceMatrix.needsUpdate = true;
    }
  });

  return (
    <>
      <color attach="background" args={['#050508']} />
      <fog attach="fog" args={['#050508', 20, 120]} />
      
      <ambientLight intensity={0.2} />
      
      {/* Stage Lights */}
      <spotLight 
        ref={spotLight1Ref}
        position={[30, 40, 20]}
        angle={0.15}
        penumbra={0.5}
        distance={200}
        castShadow
      />
      <spotLight 
        ref={spotLight2Ref}
        position={[-30, -40, 20]}
        angle={0.2}
        penumbra={0.5}
        distance={200}
        castShadow
      />

      {/* The Kinetic Wall */}
      <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial 
            roughness={0.2} 
            metalness={0.8}
            envMapIntensity={1.0}
        />
      </instancedMesh>
      
      {/* Volumetric Fake Light Beams (Optional, simplified as cones) */}
      <mesh position={[0, -20, -50]} rotation={[Math.PI, 0, 0]}>
         <coneGeometry args={[20, 100, 32, 1, true]} />
         <meshBasicMaterial color={c0} transparent opacity={0.03} side={THREE.DoubleSide} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
    </>
  );
};