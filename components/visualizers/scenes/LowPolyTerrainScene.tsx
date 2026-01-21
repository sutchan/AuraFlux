
/**
 * File: components/visualizers/scenes/LowPolyTerrainScene.tsx
 * Version: 1.1.0
 * Author: Aura Vision Team
 * Copyright (c) 2024 Aura Vision. All rights reserved.
 */

import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { VisualizerSettings } from '../../../core/types';
import { useAudioReactive } from '../../../core/hooks/useAudioReactive';
import { DynamicStarfield } from './DynamicStarfield';

interface SceneProps {
  analyser: AnalyserNode;
  colors: string[];
  settings: VisualizerSettings;
}

export const LowPolyTerrainScene: React.FC<SceneProps> = ({ analyser, colors, settings }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const sunRef = useRef<THREE.Mesh>(null);
  
  const materialRef = useRef<THREE.MeshStandardMaterial>(null);
  const fogRef = useRef<THREE.Fog>(null);
  const ambientLightRef = useRef<THREE.AmbientLight>(null);

  const { bass, mids, treble, smoothedColors } = useAudioReactive({ analyser, colors, settings });
  const [c0, c1, c2] = smoothedColors;

  // Optimize geometry creation
  const { geometry } = useMemo(() => {
    // Higher segment count for richer detail
    const segmentsW = settings.quality === 'high' ? 80 : settings.quality === 'med' ? 50 : 30;
    const segmentsH = settings.quality === 'high' ? 60 : settings.quality === 'med' ? 40 : 24;
    
    const geo = new THREE.PlaneGeometry(160, 120, segmentsW, segmentsH);
    return { geometry: geo };
  }, [settings.quality]);

  useFrame(({ clock }) => {
     const time = clock.getElapsedTime() * settings.speed;

     // 1. Sun/Moon Animation (The Anchor)
     if (sunRef.current) {
        sunRef.current.position.set(0, 30 + Math.sin(time * 0.1) * 5, -80);
        const sunScale = 15 + bass * 8.0;
        sunRef.current.scale.setScalar(sunScale);
        (sunRef.current.material as THREE.MeshBasicMaterial).color = c0;
     }

     // 2. Environment Atmosphere
     if (materialRef.current) {
         materialRef.current.color = c1;
         materialRef.current.emissive = c2;
         // Glows more on high energy
         materialRef.current.emissiveIntensity = 0.1 + treble * 0.5;
     }
     
     if (fogRef.current) {
        fogRef.current.color = new THREE.Color(c2).multiplyScalar(0.1); // Darker fog
        fogRef.current.near = 10;
        fogRef.current.far = 90;
     }

     if (ambientLightRef.current) {
        ambientLightRef.current.color = c1;
        ambientLightRef.current.intensity = 0.2 + mids * 0.5;
     }

     // 3. Terrain Synthesis Loop
     if (!meshRef.current) return;
     
     const positions = meshRef.current.geometry.attributes.position as THREE.BufferAttribute;
     const count = positions.count;

     // Pre-calculate constants for the loop
     const moveSpeed = time * 8.0;
     const bassAmp = bass * 15.0; 
     const midAmp = mids * 6.0;
     const valleyWidth = 15 + bass * 10.0; // Valley breathes with bass

     for(let i=0; i < count; i++) {
         const x = positions.getX(i);
         const y = positions.getY(i); // This is actually Z in world space before rotation

         // Coordinate distortion for "warp" effect
         const flowY = y - moveSpeed; 
         const flowX = x + Math.sin(flowY * 0.05 + time) * 5.0;

         // --- FRACTAL TERRAIN GENERATION ---
         
         // Layer 1: Base Hills (Low Frequency)
         let h = Math.sin(flowX * 0.08) * Math.cos(flowY * 0.05) * 6.0;

         // Layer 2: Jagged Ridges (Medium Frequency + Abs)
         // Math.abs creates sharp peaks instead of round hills
         h += Math.abs(Math.sin(flowX * 0.15 + flowY * 0.1)) * 8.0;

         // Layer 3: Audio Detail (High Frequency)
         // Adds roughness based on Mids/Treble
         h += Math.sin(flowX * 0.5 + flowY * 0.6) * midAmp * 0.3;

         // --- SAFETY VALLEY LOGIC ---
         // Flatten the center path for the camera
         const distFromCenter = Math.abs(x);
         let valleyFactor = (distFromCenter - 2) / valleyWidth;
         valleyFactor = Math.max(0, Math.min(1, valleyFactor)); // Clamp 0-1
         
         // Apply cubic ease-in for smooth valley walls
         valleyFactor = valleyFactor * valleyFactor * (3 - 2 * valleyFactor);

         // Final Height Composition
         // The valleyFactor flattens the center. 
         // We also add a specific "Bass Spike" on the valley walls.
         const finalHeight = (h * valleyFactor) + (valleyFactor * bassAmp * Math.sin(x * 0.3) * 0.5);
         
         positions.setZ(i, Math.max(-5, finalHeight));
     }
     
     positions.needsUpdate = true;
     meshRef.current.geometry.computeVertexNormals();
  });

  return (
      <>
        <color attach="background" args={['#000000']} /> 
        <fog ref={fogRef} attach="fog" args={['#000000', 20, 100]} />
        
        <DynamicStarfield treble={treble} speed={settings.speed} />
        
        {/* The Retro Sun */}
        <mesh ref={sunRef} position={[0, 30, -80]}>
            <circleGeometry args={[1, 32]} />
            <meshBasicMaterial color={c0} fog={false} />
        </mesh>

        {/* Main Terrain Surface */}
        <mesh 
            ref={meshRef} 
            geometry={geometry}
            rotation={[-Math.PI/2, 0, 0]} 
            position={[0, -10, -20]}
        >
            <meshStandardMaterial 
                ref={materialRef}
                flatShading={true} 
                roughness={0.8}
                metalness={0.2}
                side={THREE.DoubleSide}
            />
        </mesh>

        {/* Neon Grid Overlay (Clone mesh for wireframe effect) */}
        <mesh 
            geometry={geometry}
            rotation={[-Math.PI/2, 0, 0]} 
            position={[0, -9.9, -20]} // Slightly higher to avoid z-fighting
        >
            <meshBasicMaterial 
                color={c0}
                wireframe={true}
                transparent={true}
                opacity={0.15}
            />
        </mesh>
        
        <ambientLight ref={ambientLightRef} intensity={0.2} />
        
        {/* Dynamic lighting from the "Sun" */}
        <pointLight position={[0, 20, -70]} intensity={2} color={c0} distance={150} />
        
        {/* Rim light from front/bottom for volume */}
        <directionalLight position={[0, 10, 20]} intensity={0.5} color={c1} />
      </>
  );
};
