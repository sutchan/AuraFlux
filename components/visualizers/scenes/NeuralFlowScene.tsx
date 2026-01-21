/**
 * File: components/visualizers/scenes/NeuralFlowScene.tsx
 * Version: 1.3.1
 * Author: Sut
 * Copyright (c) 2024 Aura Vision. All rights reserved.
 * Updated: 2025-02-18 21:25
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

export const NeuralFlowScene: React.FC<SceneProps> = ({ analyser, colors, settings }) => {
  const pointsRef = useRef<THREE.Points>(null);
  const { bass, mids, treble, smoothedColors, isBeat } = useAudioReactive({ analyser, colors, settings });
  const [c0, c1] = smoothedColors;

  // 1. 密度与数据初始化
  const count = settings.quality === 'high' ? 24000 : settings.quality === 'med' ? 12000 : 6000;

  const [positions, randomness] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const rnd = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      // 空间球形初始分布，为流场提供基座
      const r = 20 + Math.random() * 60;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      
      pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      pos[i * 3 + 2] = r * Math.cos(phi);
      
      // rnd[i] 决定粒子的本征属性：0-1，通过指数分布拉开差距
      rnd[i] = Math.pow(Math.random(), 2.0);
    }
    return [pos, rnd];
  }, [count]);

  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uBass: { value: 0 },
    uMids: { value: 0 },
    uTreble: { value: 0 },
    uBeat: { value: 0 }, // 节拍能量累加
    uColor1: { value: new THREE.Color(c0) },
    uColor2: { value: new THREE.Color(c1) }
  }), []);

  // 缓动记录上次节拍时间，用于 Shader 中的冲击波扩散
  const beatTimerRef = useRef(0);

  useFrame((state) => {
    if (!pointsRef.current) return;
    
    const mat = pointsRef.current.material as THREE.ShaderMaterial;
    const time = state.clock.getElapsedTime();
    
    // 节拍逻辑控制：当检测到 isBeat 时，触发一次能量脉冲
    if (isBeat) {
      beatTimerRef.current = time;
    }

    // 更新 Uniforms
    mat.uniforms.uTime.value = time * settings.speed;
    mat.uniforms.uBass.value = bass;
    mat.uniforms.uMids.value = mids;
    mat.uniforms.uTreble.value = treble;
    // 衰减后的节拍强度传入 Shader
    const beatPhase = Math.max(0, 1.0 - (time - beatTimerRef.current) * 2.5);
    mat.uniforms.uBeat.value = beatPhase;

    mat.uniforms.uColor1.value.set(c0);
    mat.uniforms.uColor2.value.set(c1);
    
    // 整体缓速旋转，模拟空间漂浮感
    pointsRef.current.rotation.y += 0.0005 * settings.speed;
  });

  return (
    <>
      <color attach="background" args={['#000000']} />
      <points ref={pointsRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
          <bufferAttribute attach="attributes-aRandom" count={count} array={randomness} itemSize={1} />
        </bufferGeometry>
        <shaderMaterial
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          uniforms={uniforms}
          vertexShader={`
            uniform float uTime;
            uniform float uBass;
            uniform float uMids;
            uniform float uTreble;
            uniform float uBeat;
            attribute float aRandom;
            varying float vNoise;
            varying float vSpeed;
            varying float vAlpha;

            // Simplex 3D Noise for Vector Field
            vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
            vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
            vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
            vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }
            float snoise(vec3 v) { 
              const vec2 C = vec2(1.0/6.0, 1.0/3.0);
              const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
              vec3 i  = floor(v + dot(v, C.yyy));
              vec3 x0 = v - i + dot(i, C.xxx);
              vec3 g = step(x0.yzx, x0.xyz);
              vec3 l = 1.0 - g;
              vec3 i1 = min(g.xyz, l.zxy);
              vec3 i2 = max(g.xyz, l.zxy);
              vec3 x1 = x0 - i1 + C.xxx;
              vec3 x2 = x0 - i2 + C.yyy;
              vec3 x3 = x0 - D.yyy;
              i = mod289(i); 
              vec4 p = permute(permute(permute(i.z + vec4(0.0, i1.z, i2.z, 1.0)) + i.y + vec4(0.0, i1.y, i2.y, 1.0)) + i.x + vec4(0.0, i1.x, i2.x, 1.0));
              vec4 j = p - 49.0 * floor(p * (1.0/49.0));
              vec4 x_ = floor(j * (1.0/7.0));
              vec4 y_ = floor(j - 7.0 * x_);
              vec4 x = x_ * (1.0/7.0) + vec4(-0.5);
              vec4 y = y_ * (1.0/7.0) + vec4(-0.5);
              vec4 h = 1.0 - abs(x) - abs(y);
              vec4 b0 = vec4(x.xy, y.xy);
              vec4 b1 = vec4(x.zw, y.zw);
              vec4 s0 = floor(b0)*2.0 + 1.0;
              vec4 s1 = floor(b1)*2.0 + 1.0;
              vec4 sh = -step(h, vec4(0.0));
              vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
              vec4 a1 = b1.xzyw + s1.zzww*sh.zzww;
              vec3 p0 = vec3(a0.xy,h.x); vec3 p1 = vec3(a0.zw,h.y); vec3 p2 = vec3(a1.xy,h.z); vec3 p3 = vec3(a1.zw,h.w);
              vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
              p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
              vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
              m = m * m;
              return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
            }

            // --- HELPER FUNCTIONS MUST BE DEFINED BEFORE USE ---
            float life(float d) {
                return smoothstep(0.0, 150.0, d);
            }

            void main() {
              vec3 newPos = position;
              float distToCenter = length(position);
              
              // 1. 流场动力学 (Vector Field Flow)
              // 采样三维噪声构建向量场。aRandom 增加个体差异，确保流动轨迹不重合。
              float n1 = snoise(position * 0.03 + uTime * 0.2 + aRandom);
              float n2 = snoise(position * 0.02 - uTime * 0.15 + aRandom * 5.0);
              float n3 = snoise(position * 0.025 + uTime * 0.1 + aRandom * 10.0);
              vec3 flow = vec3(n1, n2, n3) * (5.0 + uBass * 15.0);
              newPos += flow;

              // 2. 纤维化聚集 (Neural Filament Clumping)
              // 对噪声值取绝对值并进行幂运算，迫使粒子向噪声“脊线”汇聚。
              float filamentNoise = snoise(newPos * 0.05 + uTime * 0.1);
              float clump = pow(abs(filamentNoise), 4.0);
              newPos += normalize(newPos) * clump * 25.0 * (1.0 + uBass);
              
              // 3. 节拍能量冲击波 (Beat-Driven Shockwaves)
              // 从中心向外扩散的物理波
              float shockwave = sin(distToCenter * 0.2 - uTime * 8.0) * 0.5 + 0.5;
              float waveFront = exp(-pow(distToCenter * 0.05 - uBeat * 5.0, 2.0) * 10.0);
              newPos += normalize(newPos) * waveFront * 15.0 * uBeat;

              vNoise = filamentNoise;
              vSpeed = length(flow) * 0.1; // 传出速度用于荧光亮度计算

              vec4 mvPosition = modelViewMatrix * vec4(newPos, 1.0);
              gl_Position = projectionMatrix * mvPosition;

              // 动态尺寸：节拍处变大，远处的点变小
              float sizeBase = 2.0 + aRandom * 12.0;
              float beatScale = 1.0 + uBeat * 2.0;
              float trebleScale = 1.0 + uTreble * 3.0;
              gl_PointSize = sizeBase * beatScale * trebleScale * (300.0 / -mvPosition.z);
              
              vAlpha = (0.3 + uBass * 0.4 + uBeat * 0.3) * (1.0 - life(distToCenter));
            }
          `}
          fragmentShader={`
            uniform vec3 uColor1;
            uniform vec3 uColor2;
            uniform float uTime;
            uniform float uTreble;
            varying float vNoise;
            varying float vSpeed;
            varying float vAlpha;

            void main() {
              float dist = distance(gl_PointCoord, vec2(0.5));
              if(dist > 0.5) discard;

              // 4. 基于速度的“生物荧光”色彩 (Velocity-Based Bioluminescence)
              // 速度越快（通常受声音驱动），颜色越亮
              vec3 baseColor = mix(uColor1, uColor2, vNoise * 0.5 + 0.5);
              vec3 bioluminescence = baseColor + (vSpeed * 0.8) + (uTreble * 0.5);
              
              // 模拟电信号闪烁 (Flicker)
              float flicker = sin(uTime * 20.0 + vNoise * 100.0) * 0.5 + 0.5;
              bioluminescence *= (0.8 + flicker * 0.2 * uTreble);

              float core = 1.0 - smoothstep(0.0, 0.5, dist);
              float glow = pow(core, 3.0);
              
              gl_FragColor = vec4(bioluminescence, vAlpha * core);
            }
          `}
        />
      </points>
    </>
  );
};