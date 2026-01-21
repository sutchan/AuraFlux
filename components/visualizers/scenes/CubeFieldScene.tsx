
/**
 * File: components/visualizers/scenes/CubeFieldScene.tsx
 * Version: 1.4.3
 * Author: Aura Vision Team
 * Copyright (c) 2024 Aura Vision. All rights reserved.
 * Updated: 2025-02-17 16:00
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
  
  const { bass, mids, treble, smoothedColors, isBeat } = useAudioReactive({ analyser, colors, settings });
  const [c0, c1, c2] = smoothedColors;

  const count = settings.quality === 'high' ? 1800 : settings.quality === 'med' ? 1000 : 500;
  const dummy = useMemo(() => new THREE.Object3D(), []);
  
  // 1. 初始化增强物理属性
  const particles = useMemo(() => {
    const temp = [];
    for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        // 偏置半径分布
        const radius = 10 + Math.pow(Math.random(), 1.8) * 140; 
        
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius; 
        const z = (Math.random() - 0.5) * 450;

        // 尺寸多样性
        const isStructure = Math.random() > 0.95;
        const scaleBase = isStructure ? (1.5 + Math.random() * 3.0) : (0.1 + Math.random() * 0.4);

        // 大幅度随机化速度偏移
        const speedOffset = 0.4 + Math.random() * 1.8;

        // 旋转轴
        const rotAxis = new THREE.Vector3(Math.random()-0.5, Math.random()-0.5, Math.random()-0.5).normalize();
        const baseRotSpeed = (Math.random() - 0.5) * (isStructure ? 0.005 : 0.04);

        temp.push({
            x, y, z,
            baseX: x, 
            baseY: y,
            scale: scaleBase,
            isStructure,
            speedOffset, 
            rotationAxis: rotAxis,
            rotationSpeed: baseRotSpeed,
            phase: Math.random() * Math.PI * 2,
            wobbleSpeed: 0.02 + Math.random() * 0.05,
            jitterAmplitude: 0.2 + Math.random() * 0.8
        });
    }
    return temp;
  }, [count]);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    
    // 核心修改：推进速度加速 3 倍。
    // 基础航行速度乘数从 1.0 提升至 3.0
    const globalSpeed = settings.speed * 3.0 * (1 + bass * 0.15);
    
    // 动态相机逻辑
    const centerTime = time * 0.2; 
    const centerX = Math.sin(centerTime) * 35;
    const centerY = Math.cos(centerTime * 0.7) * 25;

    state.camera.position.x += (Math.sin(time * 0.1) * 5 - state.camera.position.x) * 0.05;
    state.camera.lookAt(centerX * 0.2, centerY * 0.2, -100);

    if (coreLightRef.current) {
        coreLightRef.current.position.set(centerX, centerY, -80);
        coreLightRef.current.color = c1;
        coreLightRef.current.intensity = 8 + bass * 15;
    }

    if (meshRef.current) {
        const mat = meshRef.current.material as THREE.MeshStandardMaterial;
        mat.color = c0;
        mat.emissive = c1;
        // 材质自发光强度受高音频谱驱动
        mat.emissiveIntensity = 0.2 + treble * 1.5 + (isBeat ? 1.0 : 0);

        // 动量因子
        const rotationBoost = 1.0 + mids * 2.0 + treble * 1.5;

        particles.forEach((p, i) => {
            // 2. 差异化航行速度应用
            p.z += globalSpeed * p.speedOffset * 0.016; 
            if (p.z > 60) p.z -= 450;

            // 3. 湍流扰动 (Turbulence)
            const turbulenceX = Math.sin(time * p.wobbleSpeed + p.phase) * p.jitterAmplitude * (1 + mids);
            const turbulenceY = Math.cos(time * p.wobbleSpeed * 0.8 + p.phase) * p.jitterAmplitude * (1 + mids);

            // 4. 空间透视扭曲
            const depthFactor = Math.max(0, -p.z / 350); 
            const perspectiveWarpX = centerX * Math.pow(depthFactor, 1.2);
            const perspectiveWarpY = centerY * Math.pow(depthFactor, 1.2);

            dummy.position.set(
                p.baseX + turbulenceX + perspectiveWarpX, 
                p.baseY + turbulenceY + perspectiveWarpY, 
                p.z
            );

            // 5. 旋转物理
            const rotStep = p.rotationSpeed * 0.1 * (1 + bass * 0.5) * rotationBoost;
            dummy.rotateOnAxis(p.rotationAxis, rotStep);
            
            // 结构件增加微弱惯性摆动
            if (p.isStructure) {
                dummy.rotation.y += Math.sin(time * 0.1 + p.phase) * 0.002;
            }

            // 6. 尺寸灵敏度优化 (高频闪烁)
            const shimmer = 1 + treble * 0.4 * (p.isStructure ? 0.2 : 1.5);
            const s = p.scale * shimmer;
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
      <fog attach="fog" args={['#000000', 30, 200]} /> 
      
      <ambientLight intensity={0.15} />
      <pointLight ref={coreLightRef} distance={250} decay={1.8} />
      <pointLight position={[0, 0, 15]} intensity={1.5} color={c2} distance={100} />
      <directionalLight position={[40, 40, 20]} intensity={0.7} color={c0} />

      <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial 
            roughness={0.25} 
            metalness={0.9}
            envMapIntensity={0.5}
        />
      </instancedMesh>
    </>
  );
};
