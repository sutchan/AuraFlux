
/**
 * File: components/visualizers/scenes/SilkWaveScene.tsx
 * Version: 2.9.0
 * Author: Sut
 * Copyright (c) 2025 Aura Vision. All rights reserved.
 * Description: "Fiber Optic" Aesthetic Upgrade - Sparse Edition.
 * - Geometry: Instanced Ribbons with smooth flow.
 * - Physics: Low-frequency noise for zero sharp angles.
 * - Visuals: Highly sparse (70% reduced) stochastic blinking tips.
 */

import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { InstancedMesh, ShaderMaterial, Color, AdditiveBlending, MathUtils, DoubleSide } from 'three';
import { VisualizerSettings } from '../../../core/types';
import { useAudioReactive } from '../../../core/hooks/useAudioReactive';
import { getAverage, applySoftCompression } from '../../../core/services/audioUtils';

interface SceneProps {
  analyser: AnalyserNode;
  analyserR?: AnalyserNode | null;
  colors: string[];
  settings: VisualizerSettings;
}

export const SilkWaveScene: React.FC<SceneProps> = ({ analyser, analyserR, colors, settings }) => {
  const meshRef = useRef<InstancedMesh>(null);
  
  // Audio hooks
  const { bass, treble, smoothedColors, isBeat } = useAudioReactive({ analyser, colors, settings });
  const [c0, c1, c2] = smoothedColors;

  // Configuration:
  // High segment count for smoothness
  const SEGMENTS_X = settings.quality === 'high' ? 300 : (settings.quality === 'med' ? 200 : 100);
  // Moderate layer count for "sparse" but rich look
  const LAYERS_Z = settings.quality === 'high' ? 60 : (settings.quality === 'med' ? 40 : 25);
  
  // Ribbon Dimensions
  const RIBBON_WIDTH = 160;
  const RIBBON_THICKNESS = 0.1; // Thin fiber look

  // Generate Instance Attributes
  const { channels, randoms, layerIndices } = useMemo(() => {
    const ch = new Float32Array(LAYERS_Z);
    const rnd = new Float32Array(LAYERS_Z);
    const idx = new Float32Array(LAYERS_Z);

    for (let i = 0; i < LAYERS_Z; i++) {
      idx[i] = i / (LAYERS_Z - 1);
      
      // Split channels: Top half vs Bottom half (or interleaved)
      ch[i] = i % 2 === 0 ? 1.0 : -1.0; 
      
      // Full randomness for organic, non-regular motion
      rnd[i] = Math.random();
    }
    return { 
        channels: ch, 
        randoms: rnd, 
        layerIndices: idx 
    };
  }, [LAYERS_Z]);

  const dataArrayL = useMemo(() => new Uint8Array(analyser.frequencyBinCount), [analyser]);
  const dataArrayR = useMemo(() => analyserR ? new Uint8Array(analyserR.frequencyBinCount) : null, [analyserR]);

  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uSpeed: { value: 1.0 },
    uBass: { value: 0 },
    uTreble: { value: 0 },
    uEnergyL: { value: 0 }, 
    uEnergyR: { value: 0 },
    uShockwave: { value: 0 }, 
    uColor1: { value: new Color() },
    uColor2: { value: new Color() },
    uColor3: { value: new Color() }
  }), []);

  const shockwaveRef = useRef(0);

  useFrame((state) => {
    if (!meshRef.current) return;
    
    // 1. Audio Processing
    analyser.getByteFrequencyData(dataArrayL);
    if (analyserR && dataArrayR) analyserR.getByteFrequencyData(dataArrayR);

    // Lower mids drive the main wave height
    const rawL = getAverage(dataArrayL, 5, 60) / 255;
    const rawR = analyserR && dataArrayR ? getAverage(dataArrayR, 5, 60) / 255 : rawL;

    // Reduced sensitivity for elegance
    const damping = 0.5;
    const energyL = applySoftCompression(rawL, 0.8) * settings.sensitivity * damping;
    const energyR = applySoftCompression(rawR, 0.8) * settings.sensitivity * damping;

    // 2. Shockwave Logic
    if (isBeat) {
        shockwaveRef.current = 1.0; 
    }
    shockwaveRef.current = MathUtils.lerp(shockwaveRef.current, 0, 0.08);

    // 3. Uniform Updates
    const mat = meshRef.current.material as ShaderMaterial;
    const time = state.clock.getElapsedTime();
    
    mat.uniforms.uTime.value = time;
    mat.uniforms.uSpeed.value = settings.speed;
    mat.uniforms.uShockwave.value = shockwaveRef.current;
    
    const smooth = 0.2;
    mat.uniforms.uBass.value += (bass * damping - mat.uniforms.uBass.value) * smooth;
    mat.uniforms.uTreble.value += (treble * damping - mat.uniforms.uTreble.value) * smooth;
    mat.uniforms.uEnergyL.value += (energyL - mat.uniforms.uEnergyL.value) * smooth;
    mat.uniforms.uEnergyR.value += (energyR - mat.uniforms.uEnergyR.value) * smooth;

    if (c0) mat.uniforms.uColor1.value.copy(c0);
    if (c1) mat.uniforms.uColor2.value.copy(c1);
    if (c2) mat.uniforms.uColor3.value.copy(c2);
    
    // 4. Camera Flow - Gentle Sway
    state.camera.position.x = Math.sin(time * 0.05) * 4;
    state.camera.position.y = Math.cos(time * 0.08) * 2 + 1; 
    state.camera.lookAt(0, 0, 0);
  });

  return (
    <>
      {!settings.albumArtBackground && <color attach="background" args={['#000000']} />}
      
      <instancedMesh ref={meshRef} args={[undefined, undefined, LAYERS_Z]}>
        <planeGeometry args={[RIBBON_WIDTH, RIBBON_THICKNESS, SEGMENTS_X, 1]}>
            <instancedBufferAttribute attach="attributes-aChannel" args={[channels, 1]} />
            <instancedBufferAttribute attach="attributes-aRandom" args={[randoms, 1]} />
            <instancedBufferAttribute attach="attributes-aLayerIndex" args={[layerIndices, 1]} />
        </planeGeometry>
        <shaderMaterial
          transparent
          depthWrite={false}
          side={DoubleSide}
          blending={AdditiveBlending}
          uniforms={uniforms}
          vertexShader={`
            uniform float uTime;
            uniform float uSpeed;
            uniform float uBass;
            uniform float uTreble;
            uniform float uEnergyL;
            uniform float uEnergyR;
            uniform float uShockwave;
            
            attribute float aChannel; 
            attribute float aRandom;
            attribute float aLayerIndex; // 0..1
            
            varying float vIntensity;
            varying vec2 vUv;
            varying float vDepth;
            varying float vSparkle;
            varying float vLayer;
            varying float vRand;

            // Simplex Noise
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

            vec3 curlNoise(vec3 p) {
              const float e = 0.1;
              vec3 dx = vec3(e, 0.0, 0.0);
              vec3 dy = vec3(0.0, e, 0.0);
              vec3 dz = vec3(0.0, 0.0, e);
              vec3 p_x0 = snoise(p - dx) * vec3(1.0);
              vec3 p_x1 = snoise(p + dx) * vec3(1.0);
              vec3 p_y0 = snoise(p - dy) * vec3(1.0);
              vec3 p_y1 = snoise(p + dy) * vec3(1.0);
              vec3 p_z0 = snoise(p - dz) * vec3(1.0);
              vec3 p_z1 = snoise(p + dz) * vec3(1.0);
              float x = p_y1.z - p_y0.z - p_z1.y + p_z0.y;
              float y = p_z1.x - p_z0.x - p_x1.z + p_x0.z;
              float z = p_x1.y - p_x0.y - p_y1.x + p_y0.x;
              return normalize(vec3(x, y, z));
            }

            void main() {
              vUv = uv;
              vLayer = aLayerIndex;
              vRand = aRandom;
              
              vec3 pos = position; // Initial position (plane segment)
              
              // Distribute ribbons along Z
              float zSpread = 35.0; 
              float layerZ = (aLayerIndex * 2.0 - 1.0) * zSpread;
              pos.z += layerZ;

              // Energy Select
              float energy = (aChannel > 0.0) ? uEnergyL : uEnergyR;
              
              float flowTime = uTime * uSpeed * 0.4;
              
              // 1. Silk Turbulence (Ultra Smooth & Organic)
              // EXTREMELY low frequency noise (0.002) to prevent ANY sharp angles.
              vec3 noisePos = pos * 0.002 + vec3(flowTime * 0.2, pos.z * 0.01, 0.0);
              vec3 curl = curlNoise(noisePos);
              
              // Apply gentle, broad organic displacement
              // Treble adds a bit of "shiver" but keeps it smooth
              pos += curl * (5.0 + uTreble * 4.0);
              
              // 2. Stereo Waveform (Organic & Non-Regular)
              // Use random phase offsets to prevent "marching soldiers" look
              float organicPhase = aRandom * 20.0 + snoise(vec3(pos.x * 0.01, uTime * 0.1, 0.0)) * 5.0;
              
              float waveFreq = 0.03; // Very low freq for smooth waves
              float wavePhase = flowTime * 1.0 + organicPhase;
              
              // Mix Sine with Noise for irregular height
              float baseWave = sin(pos.x * waveFreq + wavePhase);
              float noiseWave = snoise(vec3(pos.x * 0.02, uTime * 0.2, aLayerIndex)) * 0.5;
              
              float direction = aChannel; 
              
              // Fluid dynamics for amplitude
              float fluidEnergy = pow(energy, 0.8);
              float amplitude = (baseWave + noiseWave) * (2.0 + fluidEnergy * 12.0) * direction;
              
              float channelOffset = direction * 5.0; 
              float bassHeave = sin(flowTime + pos.x * 0.01) * uBass * 8.0 * direction;

              pos.y += amplitude + channelOffset + bassHeave;
              
              // 3. Shockwave
              float rippleDist = length(pos.xy);
              float ripple = sin(rippleDist * 0.1 - uTime * 8.0) * uShockwave * 6.0 * direction;
              pos.y += ripple;
              pos.z += ripple * 1.5;

              vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
              gl_Position = projectionMatrix * mvPosition;

              // 4. Varying for Fragment
              float heightFactor = smoothstep(0.0, 35.0, abs(pos.y));
              vIntensity = fluidEnergy * 0.6 + heightFactor * 0.6 + uShockwave * 0.5;
              
              // Sparkle based on random instance attr
              float sparkle = 0.0;
              if (aRandom > 0.9) {
                  sparkle = sin(uTime * 10.0 + aRandom * 100.0) * uTreble;
              }
              vSparkle = sparkle;
              vDepth = -mvPosition.z;
            }
          `}
          fragmentShader={`
            uniform vec3 uColor1; 
            uniform vec3 uColor2; 
            uniform vec3 uColor3; 
            uniform float uTime;
            
            varying float vIntensity;
            varying vec2 vUv;
            varying float vDepth;
            varying float vSparkle;
            varying float vLayer;
            varying float vRand;

            void main() {
              // --- Fiber Optic Edges ---
              float edge = 1.0 - abs(vUv.y - 0.5) * 2.0;
              float alpha = smoothstep(0.0, 0.15, edge); 
              
              if (alpha < 0.01) discard;
              
              // --- Fiber Optic Transmission Effect ---
              vec3 baseCol = mix(uColor1, uColor2, vUv.x) * 0.2; // Dim housing
              
              // Moving Pulse (The Light Signal)
              float speed = 0.3 + vRand * 0.6 + vIntensity * 0.4;
              float phase = uTime * speed + vRand * 20.0;
              
              float pulsePos = fract(phase); 
              float distToPulse = abs(vUv.x - pulsePos);
              float glow = exp(-distToPulse * 12.0); // Softer trail
              
              glow *= (1.0 + vIntensity * 1.5);
              
              vec3 finalCol = baseCol;
              
              // Add the light pulse
              finalCol += uColor3 * glow * 2.5; 
              finalCol += vec3(1.0) * glow * 1.0 * smoothstep(0.8, 1.0, glow); 
              
              // --- Randomized Fiber Optic Tip (Stochastic) ---
              // Tip geometry mask
              float tipMask = smoothstep(0.96, 1.0, vUv.x);
              
              // 1. Density Control: Remove 70% of tips based on vRand (only top 30% show)
              float densityMask = step(0.7, vRand); 
              
              // 2. "Randomly Appear": Temporal randomness
              // Each strand has a different frequency and offset
              float blinkSpeed = 2.0 + vRand * 4.0;
              float blinkOffset = vRand * 100.0;
              
              // Sine wave for breathing/blinking
              float tipBreath = sin(uTime * blinkSpeed + blinkOffset);
              
              // Threshold: Only show when sine wave is near peak (e.g. > 0.7)
              // This makes them appear and disappear randomly
              float tipActive = smoothstep(0.7, 1.0, tipBreath);
              
              // Combined Mask: Geometry * Density (70% cut) * Temporal Blinking
              float finalTip = tipMask * densityMask * tipActive;
              
              // Combine: White hot core for the tip
              finalCol += vec3(1.0, 1.0, 1.0) * finalTip * 12.0;
              // Add colored halo to the tip
              finalCol += uColor3 * finalTip * 4.0;

              // Sparkle
              finalCol += vec3(1.0) * vSparkle * 3.0;
              
              // Depth Fog
              float fog = smoothstep(120.0, 30.0, vDepth);
              
              // Global alpha adjustment for faint fibers
              float fiberAlpha = 0.3 + glow * 0.7 + finalTip * 0.7;

              gl_FragColor = vec4(finalCol, alpha * fog * fiberAlpha);
            }
          `}
        />
      </instancedMesh>
    </>
  );
};
