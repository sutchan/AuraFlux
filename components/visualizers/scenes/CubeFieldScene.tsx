
/**
 * File: components/visualizers/scenes/CubeFieldScene.tsx
 * Version: 1.3.2
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
  const coreLightRef = useRef<THREE.PointLight>(null);
  
  const { bass, treble, smoothedColors } = useAudioReactive({ analyser, colors, settings });
  const [c0, c1, c2] = smoothedColors;

  // Increased particle count for better density
  const count = settings.quality === 'high' ? 2000 : settings.quality === 'med' ? 1200 : 600;
  const dummy = useMemo(() => new THREE.Object3D(), []);
  
  // Initialize particles with chaotic physics properties
  const particles = useMemo(() => {
    const temp = [];
    for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        // Biased radius: more particles at the periphery
        const radius = 15 + Math.pow(Math.random(), 1.5) * 120; 
        
        const x = Math.cos(angle) * radius * (0.8 + Math.random() * 0.4);
        const y = Math.sin(angle) * radius * (0.6 + Math.random() * 0.4); 
        const z = (Math.random() - 0.5) * 400;

        // Scale variation: Big structures vs tiny debris
        const isStructure = Math.random() > 0.94;
        const scaleBase = isStructure ? (2.0 + Math.random() * 3.0) : (0.15 + Math.random() * 0.5);

        // ROTATION PHYSICS:
        // Reduced speed to 2% (20% of previous) for "deep space stasis" feel
        // 1. Inverse Mass: Smaller particles spin much faster than large ones
        let baseRotSpeed = (Math.random() - 0.5) * (isStructure ? 0.006 : 0.05);
        
        // 2. Chaos Factor: 15% of particles are "Hyper Spinners" (unstable debris)
        const isHyper = Math.random() > 0.85;
        if (isHyper && !isStructure) baseRotSpeed *= 4.0;

        // 3. Axis Variety: Some rotate strictly on one axis, others tumble randomly
        let rotAxis = new THREE.Vector3(Math.random()-0.5, Math.random()-0.5, Math.random()-0.5).normalize();
        if (Math.random() > 0.7) {
            // Snap to primary axis for visual contrast
            const r = Math.random();
            rotAxis = r < 0.33 ? new THREE.Vector3(1,0,0) : (r < 0.66 ? new THREE.Vector3(0,1,0) : new THREE.Vector3(0,0,1));
        }

        temp.push({
            x, y, z,
            baseX: x, 
            baseY: y,
            scale: scaleBase,
            isStructure,
            // Parallax speed
            speedOffset: isStructure ? 0.6 : (0.8 + Math.random() * 0.8), 
            rotationAxis: rotAxis,
            rotationSpeed: baseRotSpeed,
            phase: Math.random() * Math.PI * 2,
            wobbleSpeed: Math.random() * 0.04 // Extremely slow wobble
        });
    }
    return temp;
  }, [count]);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    // Smoother base speed, less jerky reaction to bass
    const moveSpeed = settings.speed * 25 * (1 + bass * 0.15); 
    
    // --- Dynamic Center / Vanishing Point Logic ---
    const centerTime = time * 0.15; 
    const centerX = Math.sin(centerTime) * 40 + Math.sin(centerTime * 2.3) * 15;
    const centerY = Math.cos(centerTime * 0.8) * 30 + Math.sin(centerTime * 1.5) * 10;

    // Move camera slightly to follow the curve
    state.camera.position.x += (centerX * 0.1 - state.camera.position.x) * 0.02;
    state.camera.position.y += (centerY * 0.1 - state.camera.position.y) * 0.02;
    state.camera.lookAt(centerX * 0.5, centerY * 0.5, -100);

    if (coreLightRef.current) {
        coreLightRef.current.position.set(centerX, centerY, -120);
        coreLightRef.current.color = c1;
        coreLightRef.current.intensity = 5 + bass * 10;
    }

    if (meshRef.current) {
        const mat = meshRef.current.material as THREE.MeshStandardMaterial;
        mat.color = c0;
        mat.emissive = c1;
        mat.emissiveIntensity = 0.3 + bass * 0.6 + Math.sin(time * 0.5) * 0.15;

        // Global rotation boost on high energy
        const globalRotBoost = 1.0 + bass * 1.5 + treble * 0.5;

        particles.forEach((p, i) => {
            // 1. Forward Flight
            p.z += moveSpeed * p.speedOffset * 0.016; 
            if (p.z > 50) p.z -= 400;

            // 2. Organic Sway
            const swayAmp = 2.0 + bass * 2.0; 
            const swayX = Math.sin(time * 0.15 + p.phase + p.z * 0.005) * swayAmp;
            const swayY = Math.cos(time * 0.1 + p.phase) * (swayAmp * 0.5);

            // 3. Position Expansion
            const expansion = 1.0 + bass * 0.08 * (100 / (Math.abs(p.z) + 1)); 
            
            // 4. Curvature Warp
            const depthFactor = Math.max(0, -p.z / 300); 
            const curveX = centerX * Math.pow(depthFactor, 1.5);
            const curveY = centerY * Math.pow(depthFactor, 1.5);

            dummy.position.set(
                (p.baseX + swayX) * expansion + curveX, 
                (p.baseY + swayY) * expansion + curveY, 
                p.z
            );

            // 5. ENHANCED TUMBLING LOGIC
            // Apply rotation step based on particle's inherent speed + audio boost
            const rotStep = p.rotationSpeed * 0.02 * globalRotBoost;
            dummy.rotateOnAxis(p.rotationAxis, rotStep);
            
            // Add a secondary subtle wobble for large structures to make them feel heavy
            if (p.isStructure) {
                dummy.rotation.x += Math.sin(time * p.wobbleSpeed) * 0.002;
                dummy.rotation.z += Math.cos(time * p.wobbleSpeed) * 0.002;
            }

            // 6. Scale Reactivity (Shimmer)
            const s = p.scale * (1 + treble * 0.3 * (p.isStructure ? 0.1 : 1.0));
            dummy.scale.set(s, s, s);
            
            dummy.updateMatrix();
            meshRef.current!.setMatrixAt(i, dummy.matrix);
        });
        meshRef.current.instanceMatrix.needsUpdate = true;
    }
  });

  return (
    <>
      <color attach="background" args={['#010103']} />
      <fog attach="fog" args={['#010103', 20, 160]} /> 
      
      <ambientLight intensity={0.1} />
      
      {/* The Dynamic Wandering Core Light */}
      <pointLight ref={coreLightRef} distance={300} decay={2} />
      
      {/* Foreground Fill Light */}
      <pointLight position={[0, 0, 10]} intensity={2} color={c2} distance={80} />
      
      {/* Rim lighting from side */}
      <directionalLight position={[50, 20, 10]} intensity={1.0} color={c0} />

      <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial 
            roughness={0.2} 
            metalness={0.9}
            envMapIntensity={1.0}
        />
      </instancedMesh>
    </>
  );
};
