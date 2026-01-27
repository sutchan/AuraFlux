/**
 * File: components/visualizers/scenes/NeuralFlowScene.tsx
 * Version: 2.0.1
 * Author: Sut
 * Copyright (c) 2024 Aura Vision. All rights reserved.
 * Updated: 2025-03-05 15:30
 * Description: Major overhaul for "Neural Fluid" aesthetic.
 * Features: Filament clustering, synaptic pulsing, and biological luminescence.
 */

import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
// @fixtsx(11) - import THREE members directly
import { Points, Color, AdditiveBlending, ShaderMaterial } from 'three';
import { VisualizerSettings } from '../../../core/types';
import { useAudioReactive } from '../../../core/hooks/useAudioReactive';

interface SceneProps {
  analyser: AnalyserNode;
  colors: string[];
  settings: VisualizerSettings;
}

export const NeuralFlowScene: React.FC<SceneProps> = ({ analyser, colors, settings }) => {
  const pointsRef = useRef<Points>(null);
  const { bass, mids, treble, volume, smoothedColors, isBeat } = useAudioReactive({ analyser, colors, settings });
  const [c0, c1] = smoothedColors;

  // Optimization: Balanced particle count for high visual density without killing GPU
  const count = settings.quality === 'high' ? 12000 : settings.quality === 'med' ? 8000 : 4000;

  const [positions, randomness] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const rnd = new Float32Array(count);
    
    // Create a spherical distribution but with some initial "tendrils" bias
    for (let i = 0; i < count; i++) {
      const r = 30 + Math.random() * 50; // Base radius
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      
      // Inject some initial structure bias
      const bias = Math.sin(theta * 3) * Math.cos(phi * 5) * 10.0;
      
      pos[i * 3] = (r + bias) * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = (r + bias) * Math.sin(phi) * Math.sin(theta);
      pos[i * 3 + 2] = (r + bias) * Math.cos(phi);
      
      // Randomness for size variation and phase offsets
      rnd[i] = Math.random();
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
    // @fixtsx(71,72) - Use imported Color
    uColor1: { value: new Color(c0) },
    uColor2: { value: new Color(c1) }
  }), []);

  const beatTimerRef = useRef(0);
  const accumulatedTimeRef = useRef(0);

  useFrame((state, delta) => {
    if (!pointsRef.current) return;
    
    const mat = pointsRef.current.material as ShaderMaterial;
    const sysTime = state.clock.getElapsedTime();
    
    // Fluid time integration: speed varies with volume for "time dilation" effect
    // Slow breathing when quiet, rushing current when loud.
    accumulatedTimeRef.current += delta * settings.speed * (0.2 + volume * 2.5);

    if (isBeat) {
      beatTimerRef.current = sysTime;
    }

    mat.uniforms.uTime.value = accumulatedTimeRef.current;
    
    // Audio Uniforms
    // Apply non-linear curves to make the reaction feel more "biological" and "twitchy"
    mat.uniforms.uBass.value = Math.pow(bass, 1.5); 
    mat.uniforms.uMids.value = mids;
    mat.uniforms.uTreble.value = treble;
    mat.uniforms.uVolume.value = volume;
    
    // Decay for the beat impact
    const beatElapsed = sysTime - beatTimerRef.current;
    const beatPhase = Math.max(0, Math.exp(-beatElapsed * 4.0));
    mat.uniforms.uBeat.value = beatPhase;

    // Optimization: Directly copy color values to avoid GC pressure from 'new Color()' every frame.
    // Note: c0/c1 are already smoothed Color objects from useAudioReactive.
    if (c0) mat.uniforms.uColor1.value.copy(c0);
    if (c1) mat.uniforms.uColor2.value.copy(c1);
    
    // Slow organic rotation
    pointsRef.current.rotation.y = accumulatedTimeRef.current * 0.05;
    pointsRef.current.rotation.z = Math.sin(accumulatedTimeRef.current * 0.1) * 0.1;
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
          // @fixtsx(134) - Use imported AdditiveBlending
          blending={AdditiveBlending}
          uniforms={uniforms}
          vertexShader={`
            uniform float uTime;
            uniform float uBass;
            uniform float uMids;
            uniform float uTreble;
            uniform float uBeat;
            attribute float aRandom;
            varying float vNoise;
            varying float vSignal;
            varying float vDist;

            // Simplex Noise (Ashima Arts)
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
              vec3 pos = position;
              
              // 1. Calculate Base Noise Field
              float nScale = 0.02;
              float nSpeed = 0.2;
              float noise = snoise(pos * nScale + uTime * nSpeed);
              
              vNoise = noise;
              vDist = length(pos);

              // 2. Filament Formation (The "Veins")
              // We push particles towards the "ridges" of the noise (where noise ~ 0 or 0.5)
              // This groups the uniform cloud into organic-looking strands.
              // 'veinStrength' determines how tightly they cluster.
              float veinStrength = 1.0 - abs(noise); 
              veinStrength = pow(veinStrength, 3.0); // Sharpen the ridges
              
              // Apply clustering displacement
              vec3 clusterDir = normalize(pos);
              // Mids control how tight the neural fibers are
              float contraction = (1.0 - veinStrength) * (5.0 + uMids * 10.0); 
              
              // 3. Turbulent Flow (Curl approximation)
              // Use a second noise layer to twist the filaments
              float twist = snoise(pos * 0.03 + vec3(0.0, 10.0, 0.0) + uTime * 0.15);
              vec3 curl = cross(normal, vec3(0.0, 1.0, 0.0)) * twist;
              
              // 4. Combine Forces
              vec3 newPos = pos;
              // Add slight contraction to form veins
              newPos -= clusterDir * contraction * 0.2; 
              // Add curling motion driven by Bass
              newPos += curl * (2.0 + uBass * 8.0);
              
              // 5. Beat Shockwave (Synaptic Firing)
              // Expands a spherical shockwave from center
              float shockwave = smoothstep(0.8, 1.0, sin(length(pos) * 0.1 - uBeat * 5.0));
              newPos += normal * shockwave * 3.0 * uBeat;

              vec4 mvPosition = modelViewMatrix * vec4(newPos, 1.0);
              gl_Position = projectionMatrix * mvPosition;

              // 6. Non-Linear Size Distribution (Micro Depth)
              // 95% of particles are small "neurotransmitters" (dust)
              // 5% are large "neurons" (nodes)
              // We use aRandom to decide.
              float isNode = step(0.95, aRandom); // 1.0 if top 5%, else 0.0
              
              // Base sizes
              float sizeDust = 1.5;
              float sizeNode = 12.0;
              
              // Reactivity: Nodes pulse with Bass, Dust sparkles with Treble
              float dynamicSize = mix(
                  sizeDust * (1.0 + uTreble * 1.5 + noise * 0.5), 
                  sizeNode * (1.0 + uBass * 0.8), 
                  isNode
              );
              
              // Perspective scaling
              gl_PointSize = dynamicSize * (300.0 / -mvPosition.z);
              
              // Pass signal strength to fragment for coloring
              vSignal = isNode; 
            }
          `}
          fragmentShader={`
            uniform vec3 uColor1;
            uniform vec3 uColor2;
            uniform float uTime;
            uniform float uTreble;
            uniform float uBass;
            
            varying float vNoise;
            varying float vSignal;
            varying float vDist;

            void main() {
              // Circular particle shape
              float d = distance(gl_PointCoord, vec2(0.5));
              if(d > 0.5) discard;
              
              // Soft edge glow
              float alpha = 1.0 - smoothstep(0.0, 0.5, d);
              alpha = pow(alpha, 2.0); // Exponential falloff for "glowy" look

              // --- Synaptic Pulse Logic ---
              // Create a wave that travels along the noise field
              // High frequency sine wave mapped to the noise value
              float pulsePhase = vNoise * 8.0 - uTime * 4.0;
              float synapticPulse = smoothstep(0.8, 1.0, sin(pulsePhase));
              
              // --- Bioluminescence Color Mixing ---
              // Base State: Darker, deeper color (uColor1)
              // Excited State: Bright, hot color (uColor2)
              // Excitation factors: High Bass, High Treble, or the Synaptic Pulse passing through
              
              float excitation = synapticPulse + uBass * 0.5;
              
              vec3 baseCol = mix(uColor1, uColor2, vSignal * 0.5); // Nodes are naturally brighter
              vec3 activeCol = mix(baseCol, uColor2 * 2.0, excitation);
              
              // Add a white-hot core to the pulse
              activeCol += vec3(1.0) * synapticPulse * uTreble * 2.0;

              // Distance fog (fade out edges)
              float fog = 1.0 - smoothstep(50.0, 150.0, vDist);
              
              gl_FragColor = vec4(activeCol, alpha * fog * (0.6 + uBass * 0.4));
            }
          `}
        />
      </points>
    </>
  );
};