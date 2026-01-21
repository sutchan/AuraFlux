
/**
 * File: components/visualizers/scenes/CyberCityScene.tsx
 * Version: 1.0.0
 * Author: Aura Vision Team
 * Copyright (c) 2024 Aura Vision. All rights reserved.
 */

import React, { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { VisualizerSettings } from '../../../core/types';
import { useAudioReactive } from '../../../core/hooks/useAudioReactive';

interface SceneProps {
  analyser: AnalyserNode;
  colors: string[];
  settings: VisualizerSettings;
}

export const CyberCityScene: React.FC<SceneProps> = ({ analyser, colors, settings }) => {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const gridRef = useRef<THREE.GridHelper>(null);
  const sunRef = useRef<THREE.Mesh>(null);
  const { bass, mids, treble, smoothedColors, isBeat } = useAudioReactive({ analyser, colors, settings });
  const [c0, c1, c2] = smoothedColors;

  // City Generation
  const count = 400; // Buildings count
  const dummy = useMemo(() => new THREE.Object3D(), []);
  
  const buildings = useMemo(() => {
    const temp = [];
    // Two rows of buildings on sides
    for (let i = 0; i < count; i++) {
        const side = i % 2 === 0 ? 1 : -1;
        const x = side * (15 + Math.random() * 60); // Gap in middle
        const z = (Math.random() - 0.5) * 400;
        const w = 2 + Math.random() * 5;
        const d = 2 + Math.random() * 5;
        // Map z position to frequency bin approximation
        const freqIdx = Math.floor(Math.abs(z + 200) / 400 * 40);
        temp.push({ x, z, w, d, freqIdx });
    }
    // Sort by Z for painter's alg if needed (not needed for opaque)
    return temp;
  }, []);

  const dataArray = useMemo(() => new Uint8Array(analyser.frequencyBinCount), [analyser]);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    const speed = settings.speed * 40;
    
    analyser.getByteFrequencyData(dataArray);

    // Sun Animation
    if (sunRef.current) {
        sunRef.current.position.z = -200;
        sunRef.current.position.y = 20 + Math.sin(time * 0.1) * 5;
        const sunScale = 1 + bass * 0.3;
        sunRef.current.scale.setScalar(sunScale);
        
        // Sun material color
        const sunMat = sunRef.current.material as THREE.MeshBasicMaterial;
        sunMat.color = c0;
    }

    // Grid movement simulation
    if (gridRef.current) {
        gridRef.current.position.z = (time * speed) % 20; 
        gridRef.current.material.color = c1;
    }

    // Buildings Logic
    if (meshRef.current) {
        const mat = meshRef.current.material as THREE.MeshStandardMaterial;
        mat.color = c2;
        mat.emissive = c1;
        mat.emissiveIntensity = 0.2 + treble * 2.0;

        buildings.forEach((b, i) => {
            // Infinite scroll
            let zPos = b.z + time * speed;
            if (zPos > 100) zPos -= 400;
            
            // Audio Reactivity
            // Map freqIdx to FFT data
            const val = dataArray[b.freqIdx % dataArray.length] / 255;
            const h = 5 + val * 60 * settings.sensitivity; 
            
            dummy.position.set(b.x, h/2, zPos);
            dummy.scale.set(b.w, h, b.d);
            dummy.updateMatrix();
            meshRef.current!.setMatrixAt(i, dummy.matrix);
        });
        meshRef.current.instanceMatrix.needsUpdate = true;
    }
  });

  return (
    <>
      <color attach="background" args={['#050011']} />
      <fog attach="fog" args={['#050011', 50, 250]} />
      
      {/* Sun */}
      <mesh ref={sunRef} position={[0, 20, -200]}>
         <circleGeometry args={[40, 32]} />
         <meshBasicMaterial color="#ff00ff" />
      </mesh>
      
      {/* Grid Floor */}
      <gridHelper 
        ref={gridRef} 
        args={[400, 40]} 
        position={[0, 0, 0]} 
      />
      
      {/* Buildings */}
      <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial 
            metalness={0.8}
            roughness={0.2}
        />
      </instancedMesh>
      
      <ambientLight intensity={0.2} />
      <pointLight position={[0, 20, 0]} intensity={1} color={c2} distance={50} />
    </>
  );
};
