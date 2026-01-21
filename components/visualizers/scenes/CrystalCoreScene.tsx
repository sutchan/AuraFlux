
/**
 * File: components/visualizers/scenes/CrystalCoreScene.tsx
 * Version: 1.0.3
 * Author: Aura Vision Team
 * Copyright (c) 2024 Aura Vision. All rights reserved.
 * Updated: 2025-02-20 18:30
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

export const CrystalCoreScene: React.FC<SceneProps> = ({ analyser, colors, settings }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const innerRef = useRef<THREE.Mesh>(null);
  const lightRef = useRef<THREE.PointLight>(null);
  const groupRef = useRef<THREE.Group>(null);
  
  const { bass, mids, treble, smoothedColors, isBeat } = useAudioReactive({ analyser, colors, settings });
  const [c0, c1, c2] = smoothedColors;

  const geometry = useMemo(() => new THREE.IcosahedronGeometry(6, 0), []);
  const innerGeometry = useMemo(() => new THREE.OctahedronGeometry(3, 2), []);

  useFrame((state) => {
    const time = state.clock.getElapsedTime() * settings.speed;
    
    if (groupRef.current) {
        groupRef.current.rotation.y = time * 0.2;
        groupRef.current.rotation.z = Math.sin(time * 0.1) * 0.1;
    }

    // Outer Crystal Pulse
    if (meshRef.current) {
        // Breathe
        const scale = 1 + Math.sin(time) * 0.05 + bass * 0.2;
        meshRef.current.scale.setScalar(scale);
        meshRef.current.rotation.x = time * 0.1;
        meshRef.current.rotation.y = time * 0.15;
    }

    // Inner Core Spin & Flash
    if (innerRef.current) {
        innerRef.current.rotation.x = time * -0.5;
        innerRef.current.rotation.z = time * -0.3;
        
        const mat = innerRef.current.material as THREE.MeshBasicMaterial;
        mat.color = c1;
        // Flash white on beat
        if (isBeat) mat.color = new THREE.Color('#ffffff');
    }
    
    // Volumetric-ish Light Burst
    if (lightRef.current) {
        lightRef.current.color = c0;
        lightRef.current.intensity = 5 + bass * 30 + (isBeat ? 50 : 0);
        lightRef.current.distance = 50 + bass * 50;
    }
  });

  return (
    <>
      <color attach="background" args={['#050505']} />
      
      <group ref={groupRef}>
          {/* Inner Glowing Core */}
          <mesh ref={innerRef} geometry={innerGeometry}>
            <meshBasicMaterial color="#ffffff" wireframe={true} transparent opacity={0.5} />
          </mesh>
          
          <pointLight ref={lightRef} position={[0, 0, 0]} intensity={10} distance={50} decay={2} />

          {/* Refractive Shell */}
          <mesh ref={meshRef} geometry={geometry}>
            <meshPhysicalMaterial 
                roughness={0}
                metalness={0.1}
                transmission={1.0} // Glass-like
                thickness={3} // Refraction volume
                ior={1.8} // Diamond-like refractive index
                // FIX: Use dispersion instead of chromaticAberration for physical accuracy in modern Three.js
                dispersion={0.05 + treble * 0.1}
                attenuationColor={c0}
                attenuationDistance={10}
                clearcoat={1}
            />
          </mesh>
          
          {/* Dynamic Light Streaks (Simulated Volumetrics via Planes) */}
          {[...Array(6)].map((_, i) => (
             <LightBeam key={i} index={i} bass={bass} color={c2} />
          ))}
      </group>
      
      {/* Environment for reflections */}
      <ambientLight intensity={0.2} />
      <pointLight position={[20, 20, 20]} intensity={2} color={c1} />
      <pointLight position={[-20, -20, -10]} intensity={2} color={c2} />
    </>
  );
};

const LightBeam = ({ index, bass, color }: { index: number, bass: number, color: THREE.Color, key?: React.Key }) => {
    const ref = useRef<THREE.Mesh>(null);
    useFrame((state) => {
        const t = state.clock.getElapsedTime();
        if (ref.current) {
            const scaleY = 10 + bass * 40 * Math.random();
            ref.current.scale.y = scaleY;
            // FIX: Cast material to MeshBasicMaterial to access opacity property as material can be an array
            (ref.current.material as THREE.MeshBasicMaterial).opacity = (bass * 0.5 + 0.1) * Math.sin(t * 5 + index);
        }
    });
    
    return (
        <mesh 
            ref={ref} 
            rotation={[0, 0, (index / 6) * Math.PI * 2]} 
            position={[0,0,0]}
        >
            <planeGeometry args={[0.2, 1]} />
            <meshBasicMaterial 
                color={color} 
                transparent 
                opacity={0} 
                side={THREE.DoubleSide} 
                blending={THREE.AdditiveBlending}
                depthWrite={false}
            />
        </mesh>
    );
}