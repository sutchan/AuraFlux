/**
 * File: components/visualizers/scenes/CubeFieldScene.tsx
 * Version: 1.6.3
 * Author: Sut
 * Copyright (c) 2024 Aura Vision. All rights reserved.
 * Updated: 2025-02-18 23:15
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
  
  const { bass, mids, treble, volume, smoothedColors, isBeat } = useAudioReactive({ analyser, colors, settings });
  const [c0, c1, c2] = smoothedColors;

  const count = settings.quality === 'high' ? 1800 : settings.quality === 'med' ? 1000 : 500;
  const dummy = useMemo(() => new THREE.Object3D(), []);
  
  const dataArray = useMemo(() => new Uint8Array(analyser.frequencyBinCount), [analyser]);

  const particles = useMemo(() => {
    const temp = [];
    for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const baseRadius = 10 + Math.pow(Math.random(), 1.8) * 140; 
        
        const x = Math.cos(angle) * baseRadius;
        const y = Math.sin(angle) * baseRadius; 
        const z = (Math.random() - 0.5) * 450;

        const isStructure = Math.random() > 0.95;
        const scaleBase = isStructure ? (1.5 + Math.random() * 3.0) : (0.1 + Math.random() * 0.4);

        // 分配随机旋转轴
        const rotAxis = new THREE.Vector3(
            (Math.random() - 0.5) * 2.0, 
            (Math.random() - 0.5) * 2.0, 
            (Math.random() - 0.5) * 2.0
        ).normalize();
        
        const initialRotation = new THREE.Euler(
            Math.random() * Math.PI,
            Math.random() * Math.PI,
            Math.random() * Math.PI
        );

        // 核心优化：引入 2 倍速差倍率 [0.66, 1.33]
        const individualSpeedMult = 0.66 + Math.random() * 0.67;

        temp.push({
            x, y, z,
            angle,
            baseRadius,
            scale: scaleBase,
            isStructure,
            speedOffset: 0.4 + Math.random() * 1.8, 
            rotationAxis: rotAxis,
            initialRotation: initialRotation,
            // 基础旋转速度下调至原先的 1/10
            rotationSpeed: (Math.random() - 0.5) * (isStructure ? 0.0005 : 0.004),
            speedMult: individualSpeedMult,
            torque: 0,
            phase: Math.random() * Math.PI * 2,
            wobbleSpeed: 0.02 + Math.random() * 0.05,
            jitterAmplitude: 0.2 + Math.random() * 0.8,
            radialEnergy: 0 
        });
    }
    return temp;
  }, [count]);

  const initialSetupRef = useRef(false);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    if (!analyser) return;
    analyser.getByteFrequencyData(dataArray);
    
    const velocityBoost = 1.0 + volume * 2.0 + (isBeat ? 2.5 : 0);
    const globalSpeed = settings.speed * 3.0 * velocityBoost;
    
    const centerTime = time * 0.2; 
    const centerX = Math.sin(centerTime) * 35;
    const centerY = Math.cos(centerTime * 0.7) * 25;
    state.camera.position.x += (Math.sin(time * 0.1) * 5 - state.camera.position.x) * 0.05;
    state.camera.lookAt(centerX * 0.2, centerY * 0.2, -100);

    if (coreLightRef.current) {
        coreLightRef.current.position.set(centerX, centerY, -80);
        coreLightRef.current.color = c1;
        coreLightRef.current.intensity = 8 + bass * 25 + (isBeat ? 40 : 0);
    }

    if (meshRef.current) {
        const mat = meshRef.current.material as THREE.MeshStandardMaterial;
        mat.color = c0;
        mat.emissive = c1;
        mat.emissiveIntensity = 0.1 + treble * 2.5 + (isBeat ? 2.0 : 0);

        const rotationBoost = 1.0 + mids * 2.0 + treble * 2.5;

        particles.forEach((p, i) => {
            p.z += globalSpeed * p.speedOffset * 0.016; 
            if (p.z > 60) p.z -= 450;

            const breathingScale = 1.0 + bass * 0.4;
            
            if (isBeat) {
                p.radialEnergy += (0.5 + Math.random() * 1.5) * settings.sensitivity;
            }
            p.radialEnergy *= 0.9; 
            
            const currentRadius = p.baseRadius * breathingScale + p.radialEnergy;
            const targetX = Math.cos(p.angle) * currentRadius;
            const targetY = Math.sin(p.angle) * currentRadius;

            const turbulenceX = Math.sin(time * p.wobbleSpeed + p.phase) * p.jitterAmplitude * (1 + mids * 3);
            const turbulenceY = Math.cos(time * p.wobbleSpeed * 0.8 + p.phase) * p.jitterAmplitude * (1 + mids * 3);

            const depthFactor = Math.max(0, -p.z / 350); 
            const perspectiveWarpX = centerX * Math.pow(depthFactor, 1.2);
            const perspectiveWarpY = centerY * Math.pow(depthFactor, 1.2);

            dummy.position.set(
                targetX + turbulenceX + perspectiveWarpX, 
                targetY + turbulenceY + perspectiveWarpY, 
                p.z
            );

            // 翻滚动力学优化：随机方向与 2 倍速差
            if (isBeat) {
                // 转矩脉冲也下调 10 倍以匹配慢速美学
                p.torque += (Math.random() * 0.015 + 0.005) * settings.sensitivity;
            }
            p.torque *= 0.94;
            
            // 应用个体速差倍率
            const combinedRotation = (p.rotationSpeed + p.torque) * rotationBoost * p.speedMult;
            
            if (!initialSetupRef.current) {
                dummy.rotation.copy(p.initialRotation);
            }
            // 绕分配的随机轴旋转
            dummy.rotateOnAxis(p.rotationAxis, combinedRotation);
            
            if (p.isStructure) {
                dummy.rotation.y += Math.sin(time * 0.1 + p.phase) * 0.002;
            }

            const binData = dataArray[i % dataArray.length] / 255;
            const localScale = p.scale * (1.0 + binData * 1.5 * settings.sensitivity);
            
            const shimmer = 1 + treble * 0.8 * (p.isStructure ? 0.3 : 2.0);
            const finalScale = localScale * shimmer;
            dummy.scale.set(finalScale, finalScale, finalScale);
            
            dummy.updateMatrix();
            meshRef.current!.setMatrixAt(i, dummy.matrix);
        });
        
        initialSetupRef.current = true;
        meshRef.current.instanceMatrix.needsUpdate = true;
    }
  });

  return (
    <>
      <color attach="background" args={['#000000']} />
      <fog attach="fog" args={['#000000', 30, 220]} /> 
      
      <ambientLight intensity={0.15} />
      <pointLight ref={coreLightRef} distance={280} decay={2.0} />
      <pointLight position={[0, 0, 20]} intensity={2} color={c2} distance={120} />
      <directionalLight position={[40, 40, 20]} intensity={0.8} color={c0} />

      <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial 
            roughness={0.2} 
            metalness={0.9}
        />
      </instancedMesh>
    </>
  );
};