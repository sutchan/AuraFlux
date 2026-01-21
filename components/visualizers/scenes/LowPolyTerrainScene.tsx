
/**
 * File: components/visualizers/scenes/LowPolyTerrainScene.tsx
 * Version: 1.2.0
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
  const sunGroupRef = useRef<THREE.Group>(null);
  const coronaRef = useRef<THREE.Mesh>(null);
  const particlesRef = useRef<THREE.Points>(null);
  
  const materialRef = useRef<THREE.MeshStandardMaterial>(null);
  const gridMaterialRef = useRef<THREE.MeshBasicMaterial>(null);
  const fogRef = useRef<THREE.Fog>(null);

  const { bass, mids, treble, smoothedColors, isBeat } = useAudioReactive({ analyser, colors, settings });
  const [c0, c1, c2] = smoothedColors;

  // 1. 地形几何体配置
  const { geometry } = useMemo(() => {
    const segmentsW = settings.quality === 'high' ? 80 : settings.quality === 'med' ? 50 : 30;
    const segmentsH = settings.quality === 'high' ? 60 : settings.quality === 'med' ? 40 : 24;
    return { geometry: new THREE.PlaneGeometry(180, 160, segmentsW, segmentsH) };
  }, [settings.quality]);

  // 2. 能量粒子配置
  const particleCount = settings.quality === 'low' ? 40 : 80;
  const [particleData] = useMemo(() => {
    const pos = new Float32Array(particleCount * 3);
    const vel = new Float32Array(particleCount);
    for (let i = 0; i < particleCount; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 100;
      pos[i * 3 + 1] = Math.random() * 20 - 5;
      pos[i * 3 + 2] = -Math.random() * 300;
      vel[i] = 1.5 + Math.random() * 3.0;
    }
    return [{ pos, vel }];
  }, [particleCount]);

  useFrame((state) => {
    const time = state.clock.getElapsedTime() * settings.speed;
    const { camera } = state;

    // --- 摄影机动态算法 ---
    const swerve = Math.sin(time * 0.4) * 2.0 * (1 + mids);
    const shake = isBeat ? (Math.random() - 0.5) * 0.8 : 0;
    
    camera.position.x = THREE.MathUtils.lerp(camera.position.x, swerve, 0.05);
    camera.position.y = 2 + Math.cos(time * 0.2) * 0.5 + (isBeat ? 0.3 : 0);
    camera.rotation.z = THREE.MathUtils.lerp(camera.rotation.z, -swerve * 0.02 + shake * 0.1, 0.1);
    camera.lookAt(swerve * 0.5, 0, -80);

    // --- 太阳与日冕增强 ---
    if (sunGroupRef.current) {
        sunGroupRef.current.position.set(0, 35 + Math.sin(time * 0.15) * 3, -120);
        const sunScale = 1.0 + bass * 0.4;
        sunGroupRef.current.scale.setScalar(sunScale);
        
        if (coronaRef.current) {
            coronaRef.current.scale.setScalar(1.2 + Math.sin(time * 2) * 0.1 + bass * 0.5);
            (coronaRef.current.material as THREE.MeshBasicMaterial).opacity = 0.1 + bass * 0.4;
            (coronaRef.current.material as THREE.MeshBasicMaterial).color = c0;
        }
    }

    // --- 材质与雾气响应 ---
    if (materialRef.current) {
        materialRef.current.color = c1;
        materialRef.current.emissive = c2;
        materialRef.current.emissiveIntensity = 0.05 + treble * 0.8;
    }
    
    if (gridMaterialRef.current) {
        gridMaterialRef.current.color = c0;
        gridMaterialRef.current.opacity = 0.1 + treble * 0.5 + (isBeat ? 0.3 : 0);
    }

    if (fogRef.current) {
        fogRef.current.color = new THREE.Color(c2).multiplyScalar(0.05);
    }

    // --- 地形合成逻辑 ---
    if (!meshRef.current) return;
    const positions = meshRef.current.geometry.attributes.position as THREE.BufferAttribute;
    const count = positions.count;
    const moveSpeed = time * 12.0;
    const valleyWidth = 18 + bass * 12.0;

    for (let i = 0; i < count; i++) {
        const x = positions.getX(i);
        const y = positions.getY(i);
        const flowY = y - moveSpeed;
        const flowX = x + Math.sin(flowY * 0.04 + time) * 8.0;

        // 多频段分形噪声
        let h = Math.sin(flowX * 0.06) * Math.cos(flowY * 0.04) * 8.0; // 基础起伏
        h += Math.abs(Math.sin(flowX * 0.12 + flowY * 0.08)) * 10.0; // 锐利山脊
        h += Math.sin(flowX * 0.4 + time) * mids * 4.0; // 动态波动

        // 重拍时的地形随机跳变 (Glitch Effect)
        if (isBeat && Math.abs(x) > 10) {
            h += (Math.random() - 0.5) * 12.0 * bass;
        }

        // 山谷平滑逻辑
        const dist = Math.abs(x);
        let vFactor = Math.max(0, Math.min(1, (dist - 4) / valleyWidth));
        vFactor = vFactor * vFactor * (3 - 2 * vFactor); // Cubic Smooth Step

        const finalH = h * vFactor;
        positions.setZ(i, Math.max(-6, finalH));
    }
    positions.needsUpdate = true;
    meshRef.current.geometry.computeVertexNormals();

    // --- 能量流星粒子更新 ---
    if (particlesRef.current) {
        const pPositions = particlesRef.current.geometry.attributes.position.array as Float32Array;
        for (let i = 0; i < particleCount; i++) {
            pPositions[i * 3 + 2] += particleData.vel[i] * (1 + bass * 2); // 速度受低音驱动
            if (pPositions[i * 3 + 2] > 50) {
                pPositions[i * 3 + 2] = -250;
                pPositions[i * 3] = (Math.random() - 0.5) * 120;
            }
        }
        particlesRef.current.geometry.attributes.position.needsUpdate = true;
        (particlesRef.current.material as THREE.PointsMaterial).color = c0;
        (particlesRef.current.material as THREE.PointsMaterial).opacity = 0.2 + bass * 0.6;
    }
  });

  return (
      <>
        <color attach="background" args={['#000000']} /> 
        <fog ref={fogRef} attach="fog" args={['#000000', 10, 140]} />
        
        <DynamicStarfield treble={treble} speed={settings.speed} />

        {/* 升级版太阳系统 */}
        <group ref={sunGroupRef}>
            {/* 核心太阳 */}
            <mesh>
                <circleGeometry args={[18, 32]} />
                <meshBasicMaterial color={c0} fog={false} />
            </mesh>
            {/* 外部日冕层 */}
            <mesh ref={coronaRef}>
                <circleGeometry args={[22, 32]} />
                <meshBasicMaterial 
                    color={c0} 
                    transparent 
                    opacity={0.3} 
                    blending={THREE.AdditiveBlending} 
                    fog={false} 
                />
            </mesh>
        </group>

        {/* 能量流星粒子 */}
        <points ref={particlesRef}>
            <bufferGeometry>
                <bufferAttribute
                    attach="attributes-position"
                    count={particleCount}
                    array={particleData.pos}
                    itemSize={3}
                />
            </bufferGeometry>
            <pointsMaterial 
                size={0.6} 
                transparent 
                blending={THREE.AdditiveBlending} 
                depthWrite={false}
            />
        </points>

        {/* 地形表面 */}
        <mesh 
            ref={meshRef} 
            geometry={geometry}
            rotation={[-Math.PI/2, 0, 0]} 
            position={[0, -12, -20]}
        >
            <meshStandardMaterial 
                ref={materialRef}
                flatShading={true} 
                roughness={0.7}
                metalness={0.3}
            />
        </mesh>

        {/* 发光霓虹网格 */}
        <mesh 
            geometry={geometry}
            rotation={[-Math.PI/2, 0, 0]} 
            position={[0, -11.9, -20]}
        >
            <meshBasicMaterial 
                ref={gridMaterialRef}
                wireframe={true}
                transparent={true}
                opacity={0.2}
            />
        </mesh>
        
        <ambientLight intensity={0.1} />
        <pointLight position={[0, 40, -100]} intensity={3} color={c0} distance={200} />
        <directionalLight position={[0, 10, 50]} intensity={0.8} color={c1} />
      </>
  );
};
