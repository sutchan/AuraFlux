
/**
 * File: components/visualizers/scenes/CubeFieldScene.tsx
 * Version: 1.6.8
 * Author: Aura Vision Team
 * Copyright (c) 2024 Aura Vision. All rights reserved.
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

export const CubeFieldScene: React.FC<SceneProps> = ({ analyser, colors, settings }) => {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const { bass, treble, smoothedColors } = useAudioReactive({ analyser, colors, settings });
  const [c0, c1, c2] = smoothedColors;

  const count = 1000;
  const dummy = useMemo(() => new THREE.Object3D(), []);
  
  // Initialize particles
  const particles = useMemo(() => {
    const temp = [];
    for (let i = 0; i < count; i++) {
        const x = (Math.random() - 0.5) * 120;
        const y = (Math.random() - 0.5) * 80;
        const z = (Math.random() - 0.5) * 200;
        const scale = Math.random() * 0.5 + 0.5;
        temp.push({ x, y, z, scale });
    }
    return temp;
  }, []);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    // Optimization: Reduced speed multiplier from 30 to 15 (50% slower)
    const moveSpeed = settings.speed * 15 * (1 + bass * 0.5);
    
    if (meshRef.current) {
        const mat = meshRef.current.material as THREE.MeshStandardMaterial;
        mat.color = c0;
        mat.emissive = c1;
        // Optimization: Reduced bass reactivity for emission from 2.5 to 1.2
        mat.emissiveIntensity = 0.2 + bass * 1.2;

        particles.forEach((p, i) => {
            // Infinite fly-through logic
            p.z += moveSpeed * 0.016 * 60; // Frame-rate independent approx
            if (p.z > 50) p.z -= 200;

            dummy.position.set(p.x, p.y, p.z);
            dummy.rotation.x = time * 0.5 + i;
            dummy.rotation.y = time * 0.3 + i;
            
            // Optimization: Reduced treble scaling factor from 1.2 to 0.6
            const s = p.scale * (1 + treble * 0.6);
            dummy.scale.set(s, s, s);
            
            dummy.updateMatrix();
            meshRef.current!.setMatrixAt(i, dummy.matrix);
        });
        meshRef.current.instanceMatrix.needsUpdate = true;
    }
  });

  return (
    <>
      <color attach="background" args={['#000000']} />
      <fog attach="fog" args={['#000000', 20, 120]} />
      <ambientLight intensity={0.5} />
      <pointLight position={[0, 0, 10]} intensity={2} color={c2} distance={100} />
      
      <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial 
            roughness={0.4} 
            metalness={0.8} 
        />
      </instancedMesh>
    </>
  );
};
