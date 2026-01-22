/**
 * File: components/visualizers/scenes/CubeFieldScene.tsx
 * Version: 1.6.14
 * Author: Sut
 * Copyright (c) 2024 Aura Vision. All rights reserved.
 * Updated: 2025-02-21 23:45
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
        // --- 1. 空间解耦：完全随机的笛卡尔分布 ---
        const x = (Math.random() - 0.5) * 300; 
        const y = (Math.random() - 0.5) * 200;
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

        // 旋转速差倍率
        const individualSpeedMult = isStructure 
            ? 0.2 + Math.random() * 1.8 
            : 0.66 + Math.random() * 0.67;

        // 基于质量的视差位移速度
        const speedOffset = isStructure
            ? 0.3 + Math.random() * 0.9 
            : 1.5 + Math.random() * 2.5;

        // --- 2. 运动解耦：独立的横向漂移向量 ---
        const driftSpeedBase = isStructure ? 0.05 : 0.2;
        const driftX = (Math.random() - 0.5) * driftSpeedBase;
        const driftY = (Math.random() - 0.5) * driftSpeedBase;

        // --- 3. 频谱解耦：分配特定的频率索引 ---
        const spectralAffinity = Math.pow(Math.random(), 1.5); 

        temp.push({
            x, y, z,
            scale: scaleBase,
            isStructure,
            speedOffset, 
            rotationAxis: rotAxis,
            initialRotation: initialRotation,
            rotationSpeed: (Math.random() - 0.5) * (isStructure ? 0.0005 : 0.004),
            speedMult: individualSpeedMult,
            torque: 0,
            phase: Math.random() * Math.PI * 2,
            
            // 新增属性
            driftX, 
            driftY,
            spectralAffinity, // 0.0 - 1.0
            
            tumbleRate: 0.5 + Math.random() * 2.0,
            tumblePhase: Math.random() * Math.PI * 2
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
    const globalSpeed = settings.speed * 4.5 * velocityBoost;
    
    const centerTime = time * 0.2; 
    const centerX = Math.sin(centerTime) * 35;
    const centerY = Math.cos(centerTime * 0.7) * 25;
    
    // 相机稍微跟随中心点
    state.camera.position.x += (Math.sin(time * 0.1) * 5 - state.camera.position.x) * 0.05;
    state.camera.lookAt(centerX * 0.1, centerY * 0.1, -100);

    if (coreLightRef.current) {
        coreLightRef.current.position.set(centerX, centerY, -80);
        coreLightRef.current.color = c1;
        coreLightRef.current.intensity = 15 + bass * 35 + (isBeat ? 50 : 0); // Increased light intensity
    }

    if (meshRef.current) {
        const mat = meshRef.current.material as THREE.MeshStandardMaterial;
        mat.color = c0;
        mat.emissive = c1;
        // 亮度优化：大幅提升基础自发光和高音响应
        mat.emissiveIntensity = 0.4 + treble * 4.0 + (isBeat ? 3.5 : 0);

        const rotationBoost = 1.0 + mids * 2.0 + treble * 2.5;
        const binCount = dataArray.length; 
        const effectiveBinLimit = Math.floor(binCount * 0.6); 

        particles.forEach((p, i) => {
            // Z轴主推进 (极速)
            p.z += globalSpeed * p.speedOffset * 0.016; 
            
            // 循环重置逻辑
            if (p.z > 60) {
                p.z -= 450;
                p.x = (Math.random() - 0.5) * 300;
                p.y = (Math.random() - 0.5) * 200;
                p.rotationAxis.set(Math.random()-0.5, Math.random()-0.5, Math.random()-0.5).normalize();
            }

            // --- 独立运动更新 (漂移速度同步提高3倍: 0.05 -> 0.15) ---
            p.x += p.driftX * settings.speed * 0.15;
            p.y += p.driftY * settings.speed * 0.15;

            // 边界回绕
            if (p.x > 180) p.x -= 360; else if (p.x < -180) p.x += 360;
            if (p.y > 120) p.y -= 240; else if (p.y < -120) p.y += 240;

            // --- 独立音频响应 ---
            const binIndex = Math.floor(p.spectralAffinity * effectiveBinLimit);
            const rawAudioVal = dataArray[binIndex] / 255; // 0.0 - 1.0
            
            const individualReaction = rawAudioVal * settings.sensitivity;
            
            // 应用透视扭曲
            const depthFactor = Math.max(0, -p.z / 350); 
            const perspectiveWarpX = centerX * Math.pow(depthFactor, 1.2);
            const perspectiveWarpY = centerY * Math.pow(depthFactor, 1.2);

            dummy.position.set(
                p.x + perspectiveWarpX, 
                p.y + perspectiveWarpY, 
                p.z
            );

            // --- 翻滚动力学 ---
            if (isBeat) {
                p.torque += (Math.random() * 0.015 + 0.005) * settings.sensitivity;
            }
            p.torque *= 0.94;
            
            // 轴向漂移
            const driftSpeed = 0.5;
            p.rotationAxis.x += Math.sin(time * 0.3 + p.tumblePhase) * 0.02 * driftSpeed;
            p.rotationAxis.y += Math.cos(time * 0.2 + p.tumblePhase) * 0.02 * driftSpeed;
            p.rotationAxis.z += Math.sin(time * 0.4 + p.tumblePhase) * 0.02 * driftSpeed;
            p.rotationAxis.normalize();

            // 速度振荡
            const timeVariance = Math.sin(time * p.tumbleRate + p.tumblePhase);
            const dynamicSpeedMultiplier = 1.0 + 0.5 * timeVariance;

            // 旋转速度也受个体音频反应影响
            const audioSpinBoost = 1.0 + individualReaction * 4.0;

            // 旋转速度维持在 10% (0.1)
            const combinedRotation = (p.rotationSpeed + p.torque) * rotationBoost * p.speedMult * dynamicSpeedMultiplier * audioSpinBoost * 0.1;
            
            if (!initialSetupRef.current) {
                dummy.rotation.copy(p.initialRotation);
            }
            
            dummy.rotateOnAxis(p.rotationAxis, combinedRotation);
            
            if (p.isStructure) {
                dummy.rotation.y += Math.sin(time * 0.1 + p.phase) * 0.002;
            }

            // 最终缩放
            const finalScale = p.scale * (1.0 + individualReaction * 1.8);
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
      
      <ambientLight intensity={0.2} />
      <pointLight ref={coreLightRef} distance={350} decay={2.0} />
      <pointLight position={[0, 0, 20]} intensity={3} color={c2} distance={150} />
      <directionalLight position={[40, 40, 20]} intensity={1.2} color={c0} />

      <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial 
            roughness={0.1} 
            metalness={0.95}
        />
      </instancedMesh>
    </>
  );
};