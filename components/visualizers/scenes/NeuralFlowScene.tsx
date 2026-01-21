
/**
 * File: components/visualizers/scenes/NeuralFlowScene.tsx
 * Version: 1.2.0
 * Author: Aura Vision Team
 * Copyright (c) 2024 Aura Vision. All rights reserved.
 * Updated: 2025-02-17 15:00
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
  const { bass, treble, smoothedColors } = useAudioReactive({ analyser, colors, settings });
  const [c0, c1] = smoothedColors;

  const count = settings.quality === 'high' ? 12000 : settings.quality === 'med' ? 8000 : 4000;

  // Attributes: Position and "Random Seed"
  const [positions, randomness] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const rnd = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      // Sphere distribution
      const r = 15 + Math.random() * 50;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      
      pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      pos[i * 3 + 2] = r * Math.cos(phi);
      
      // 使用指数级分布提升尺寸层级
      rnd[i] = Math.pow(Math.random(), 3.5);
    }
    return [pos, rnd];
  }, [count]);

  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uBass: { value: 0 },
    uTreble: { value: 0 },
    uColor1: { value: new THREE.Color(c0) },
    uColor2: { value: new THREE.Color(c1) }
  }), []);

  useFrame((state) => {
    if (!pointsRef.current) return;
    
    // Update uniforms
    const mat = pointsRef.current.material as THREE.ShaderMaterial;
    mat.uniforms.uTime.value = state.clock.getElapsedTime() * settings.speed;
    mat.uniforms.uBass.value = bass;
    mat.uniforms.uTreble.value = treble;
    mat.uniforms.uColor1.value.set(c0);
    mat.uniforms.uColor2.value.set(c1);
    
    // Slow rotation
    pointsRef.current.rotation.y += 0.0008 * settings.speed;
    pointsRef.current.rotation.z += 0.0004 * settings.speed;
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
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          uniforms={uniforms}
          vertexShader={`
            uniform float uTime;
            uniform float uBass;
            uniform float uTreble;
            attribute float aRandom;
            varying float vNoise;
            varying float vAlpha;
            varying float vSize;

            // Simple noise function
            vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
            vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
            vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
            vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }
            
            float snoise(vec3 v) { 
              const vec2  C = vec2(1.0/6.0, 1.0/3.0) ;
              const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);
              vec3 i  = floor(v + dot(v, C.yyy) );
              vec3 x0 = v - i + dot(i, C.xxx) ;
              vec3 g = step(x0.yzx, x0.xyz);
              vec3 l = 1.0 - g;
              vec3 i1 = min( g.xyz, l.zxy );
              vec3 i2 = max( g.xyz, l.zxy );
              vec3 x1 = x0 - i1 + C.xxx;
              vec3 x2 = x0 - i2 + C.yyy;
              vec3 x3 = x0 - D.yyy;
              i = mod289(i); 
              vec4 p = permute( permute( permute( 
                        i.z + vec4(0.0, i1.z, i2.z, 1.0 ))
                      + i.y + vec4(0.0, i1.y, i2.y, 1.0 )) 
                      + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));
              float n_ = 0.142857142857;
              vec3  ns = n_ * D.wyz - D.xzx;
              vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
              vec4 x_ = floor(j * ns.z);
              vec4 y_ = floor(j - 7.0 * x_ );
              vec4 x = x_ *ns.x + ns.yyyy;
              vec4 y = y_ *ns.x + ns.yyyy;
              vec4 h = 1.0 - abs(x) - abs(y);
              vec4 b0 = vec4( x.xy, y.xy );
              vec4 b1 = vec4( x.zw, y.zw );
              vec4 s0 = floor(b0)*2.0 + 1.0;
              vec4 s1 = floor(b1)*2.0 + 1.0;
              vec4 sh = -step(h, vec4(0.0));
              vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;
              vec4 a1 = b1.xzyw + s1.zzww*sh.zzww ;
              vec3 p0 = vec3(a0.xy,h.x);
              vec3 p1 = vec3(a0.zw,h.y);
              vec3 p2 = vec3(a1.xy,h.z);
              vec3 p3 = vec3(a1.zw,h.w);
              vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
              p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
              vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
              m = m * m;
              return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1), 
                                            dot(p2,x2), dot(p3,x3) ) );
            }

            void main() {
              float timeScale = uTime * 0.3;
              vec3 noisePos = position * 0.04 + timeScale;
              float noiseVal = snoise(noisePos);
              vNoise = noiseVal;
              
              vec3 newPos = position;
              
              // 核心优化：大幅增强随声音波动的幅度。
              // 1. 低音驱动的体积扩张 (Expansion) - 强度从 1.5 提升至 3.5
              float expansion = 1.0 + pow(uBass, 1.1) * 3.5 * (0.3 + 0.7 * abs(noiseVal));
              newPos *= expansion;
              
              // 2. 音频驱动的湍流位移 (Turbulent Displacement) - 强度从 4.0 提升至 12.0
              // X 轴位移：随低音大幅摆动 + 随高音产生高频抖动
              float jitter = uTreble * 2.5; 
              newPos.x += (sin(newPos.y * 0.1 + uTime * 2.0) * 12.0 * uBass) + (sin(uTime * 15.0 + aRandom * 10.0) * jitter);
              
              // Y 轴位移：新增垂直律动
              newPos.y += (cos(newPos.z * 0.1 + uTime * 1.8) * 10.0 * uBass);
              
              // Z 轴位移：深度空间跳变
              newPos.z += (cos(newPos.x * 0.12 + uTime * 1.6) * 12.0 * uBass) + (cos(uTime * 12.0 + aRandom * 10.0) * jitter);
              
              vec4 mvPosition = modelViewMatrix * vec4(newPos, 1.0);
              gl_Position = projectionMatrix * mvPosition;
              
              // 尺寸响应
              float baseSize = 1.0 + aRandom * 18.0; 
              float dynamicSize = baseSize * (1.0 + uTreble * 2.5);
              
              gl_PointSize = dynamicSize * (250.0 / -mvPosition.z);
              
              vSize = aRandom;
              vAlpha = 0.4 + uBass * 0.6;
            }
          `}
          fragmentShader={`
            uniform vec3 uColor1;
            uniform vec3 uColor2;
            varying float vNoise;
            varying float vAlpha;
            varying float vSize;

            void main() {
              float d = distance(gl_PointCoord, vec2(0.5));
              if(d > 0.5) discard;
              
              vec3 baseColor = mix(uColor1, uColor2, vNoise * 0.5 + 0.5);
              vec3 color = baseColor + (vSize * 0.2); 
              
              float core = smoothstep(0.5, 0.0, d);
              float centerGlow = pow(core, 4.0) * vSize;
              color = mix(color, vec3(1.0), centerGlow * 0.8);
              
              float alpha = (1.0 - smoothstep(0.0, 0.5, d)) * vAlpha;
              alpha *= (0.3 + vSize * 0.7);
              
              gl_FragColor = vec4(color, alpha);
            }
          `}
        />
      </points>
    </>
  );
};
