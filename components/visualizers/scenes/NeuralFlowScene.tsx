/**
 * File: components/visualizers/scenes/NeuralFlowScene.tsx
 * Version: 1.3.7
 * Author: Sut
 * Copyright (c) 2024 Aura Vision. All rights reserved.
 * Updated: 2025-02-24 21:00
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
  const { bass, mids, treble, volume, smoothedColors, isBeat } = useAudioReactive({ analyser, colors, settings });
  const [c0, c1] = smoothedColors;

  // Optimization: Particle count reduced by 50% across all quality tiers (v1.3.5)
  const count = settings.quality === 'high' ? 12000 : settings.quality === 'med' ? 6000 : 3000;

  const [positions, randomness] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const rnd = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      const r = 20 + Math.random() * 60;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      
      pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      pos[i * 3 + 2] = r * Math.cos(phi);
      
      rnd[i] = Math.pow(Math.random(), 2.0);
    }
    return [pos, rnd];
  }, [count]);

  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uBass: { value: 0 },
    uMids: { value: 0 },
    uTreble: { value: 0 },
    uBeat: { value: 0 }, 
    uVolume: { value: 0 },
    uColor1: { value: new THREE.Color(c0) },
    uColor2: { value: new THREE.Color(c1) }
  }), []);

  const beatTimerRef = useRef(0);
  const accumulatedTimeRef = useRef(0);

  useFrame((state, delta) => {
    if (!pointsRef.current) return;
    
    const mat = pointsRef.current.material as THREE.ShaderMaterial;
    const sysTime = state.clock.getElapsedTime();
    
    // --- Dynamic Time Integration (Hyper-Reactive v1.3.6) ---
    // Drastically increased dynamic range.
    // Silence = Restless flow (0.5 base)
    // Loud = Chaotic turbulence (up to +4.0x speed)
    accumulatedTimeRef.current += delta * settings.speed * (0.5 + volume * 4.0);

    if (isBeat) {
      beatTimerRef.current = sysTime;
    }

    mat.uniforms.uTime.value = accumulatedTimeRef.current;
    
    // Pre-process audio data for sharper response curve
    // Squaring the input exaggerates peaks relative to background noise
    mat.uniforms.uBass.value = Math.pow(bass, 1.2); 
    mat.uniforms.uMids.value = mids;
    mat.uniforms.uTreble.value = treble;
    mat.uniforms.uVolume.value = volume;
    
    // Beat energy decay curve
    const beatElapsed = sysTime - beatTimerRef.current;
    const beatPhase = Math.max(0, Math.exp(-beatElapsed * 3.5));
    mat.uniforms.uBeat.value = beatPhase;

    mat.uniforms.uColor1.value.set(c0);
    mat.uniforms.uColor2.value.set(c1);
    
    // Dynamic Rotation: Spin significantly faster with Bass
    pointsRef.current.rotation.y += (0.001 + bass * 0.01) * settings.speed;
    // Hard tilt on beat
    pointsRef.current.rotation.x += (isBeat ? 0.005 : 0) * settings.speed;
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

            void main() {
              vec3 newPos = position;
              float distToCenter = length(position);
              
              // --- 1. Explosive Dynamics: Bass Displacement (4.0 + 25.0) ---
              // Amplitude reduced (50.0 -> 25.0) to prevent excessive distortion
              float n1 = snoise(position * 0.02 + uTime * 0.15 + aRandom);
              float n2 = snoise(position * 0.015 - uTime * 0.1 + aRandom * 5.0);
              float n3 = snoise(position * 0.025 + uTime * 0.08 + aRandom * 10.0);
              vec3 flow = vec3(n1, n2, n3) * (4.0 + uBass * 25.0);
              newPos += flow;

              // --- 2. Filament Clumping: Driven by Mids ---
              float filamentNoise = snoise(newPos * 0.04 + uTime * 0.05);
              float clumpingPower = 3.0 + uMids * 4.0;
              float clump = pow(abs(filamentNoise), clumpingPower);
              newPos += normalize(newPos) * clump * 20.0 * (1.0 + uBass);
              
              // --- 3. High Frequency Jitter (4.0) ---
              // Faster frequency (20.0) and higher amplitude (4.0) makes high notes "shiver" visibly
              float jitter = snoise(newPos * 0.8 + uTime * 20.0) * uTreble * 4.0;
              newPos += jitter;

              // --- 4. Massive Beat Shockwave (15.0) ---
              // Reduced from 25.0 to 15.0 for cleaner impact
              float waveFront = exp(-pow(distToCenter * 0.04 - uBeat * 6.0, 2.0) * 8.0);
              newPos += normalize(newPos) * waveFront * 15.0 * uBeat;

              vNoise = filamentNoise;
              vSpeed = length(flow) * 0.15 + uTreble * 0.5; 

              vec4 mvPosition = modelViewMatrix * vec4(newPos, 1.0);
              gl_Position = projectionMatrix * mvPosition;

              // Visual Compensation: Slightly increase particle size to maintain volume with fewer particles
              float sizeBase = 4.0 + aRandom * 16.0; 
              float beatScale = 1.0 + uBeat * 3.0; // Beat pulse increased to 3.0x
              float treblePulse = 1.0 + sin(uTime * 30.0 + aRandom * 100.0) * uTreble;
              gl_PointSize = sizeBase * beatScale * treblePulse * (300.0 / -mvPosition.z);
              
              vAlpha = (0.3 + uBass * 0.6 + uBeat * 0.5) * (1.0 - smoothstep(0.0, 200.0, distToCenter));
            }
          `}
          fragmentShader={`
            uniform vec3 uColor1;
            uniform vec3 uColor2;
            uniform float uTime;
            uniform float uTreble;
            uniform float uBeat;
            uniform float uVolume;
            varying float vNoise;
            varying float vSpeed;
            varying float vAlpha;

            void main() {
              float dist = distance(gl_PointCoord, vec2(0.5));
              if(dist > 0.5) discard;

              vec3 baseColor = mix(uColor1, uColor2, vNoise * 0.5 + 0.5);
              // Intense discharge on beat (1.5x)
              vec3 discharge = vec3(1.0) * uBeat * 1.5;
              vec3 bioluminescence = baseColor + discharge + (vSpeed * 0.8);
              
              float sparkle = pow(abs(sin(uTime * 20.0 + vNoise * 50.0)), 10.0) * uTreble;
              bioluminescence += sparkle * 1.5;

              float core = 1.0 - smoothstep(0.0, 0.5, dist);
              float glow = pow(core, 2.0 - uVolume * 1.8); // Glow widens significantly with volume
              
              gl_FragColor = vec4(bioluminescence, vAlpha * glow);
            }
          `}
        />
      </points>
    </>
  );
};