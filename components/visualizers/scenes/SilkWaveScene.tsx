/**
 * File: components/visualizers/scenes/SilkWaveScene.tsx
 * Version: 2.1.1
 * Author: Sut
 * Description: "Lumina Silk" - Optimized fluid ribbons with staggered pulses to avoid clumping.
 */

import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { InstancedMesh, ShaderMaterial, Color, AdditiveBlending, MathUtils, DoubleSide } from 'three';
import { VisualizerSettings } from '../../../core/types';
import { useAudioReactive } from '../../../core/hooks/useAudioReactive';

interface SceneProps {
  analyser: AnalyserNode;
  analyserR?: AnalyserNode | null;
  colors: string[];
  settings: VisualizerSettings;
}

export const SilkWaveScene: React.FC<SceneProps> = ({ analyser, analyserR, colors, settings }) => {
  const meshRef = useRef<InstancedMesh>(null);
  const { features, smoothedColors } = useAudioReactive({ analyser, analyserR, colors, settings });
  const [c0, c1, c2] = smoothedColors;

  const SEGMENTS_X = settings.quality === 'high' ? 512 : (settings.quality === 'med' ? 320 : 160);
  const MAX_LINES = 50; 
  const RIBBON_WIDTH = 260;

  const { channels, randoms, layerIndices } = useMemo(() => {
    const ch = new Float32Array(MAX_LINES), rnd = new Float32Array(MAX_LINES), idx = new Float32Array(MAX_LINES);
    for (let i = 0; i < MAX_LINES; i++) { 
        idx[i] = i / Math.max(1, MAX_LINES - 1); 
        ch[i] = i % 2 === 0 ? 1.0 : -1.0; 
        rnd[i] = Math.random(); 
    }
    return { channels: ch, randoms: rnd, layerIndices: idx };
  }, [MAX_LINES]);

  const uniforms = useMemo(() => ({
    uTime: { value: 0 }, uSpeed: { value: 1.0 }, uBass: { value: 0 }, uEnergyL: { value: 0 }, 
    uEnergyR: { value: 0 }, uShockwave: { value: 0 }, uDensity: { value: 0.1 }, 
    uColor1: { value: new Color() }, uColor2: { value: new Color() }, uColor3: { value: new Color() }
  }), []);

  const shockwaveRef = useRef(0), densityRef = useRef(0.1);

  useFrame((state) => {
    if (!meshRef.current) return;
    
    if (features.isBeat) shockwaveRef.current = 1.0; 
    shockwaveRef.current = MathUtils.lerp(shockwaveRef.current, 0, 0.06); 

    const targetDensity = MathUtils.clamp(0.1 + features.volume * 1.5, 0.1, 1.0);
    densityRef.current = MathUtils.lerp(densityRef.current, targetDensity, 0.03);

    const mat = meshRef.current.material as ShaderMaterial, time = state.clock.getElapsedTime();
    mat.uniforms.uTime.value = time; 
    mat.uniforms.uSpeed.value = settings.speed; 
    mat.uniforms.uShockwave.value = shockwaveRef.current; 
    mat.uniforms.uDensity.value = densityRef.current;
    
    const ls = 0.15; 
    mat.uniforms.uBass.value += (features.bass - mat.uniforms.uBass.value) * ls;
    mat.uniforms.uEnergyL.value += (features.energyL - mat.uniforms.uEnergyL.value) * ls;
    mat.uniforms.uEnergyR.value += (features.energyR - mat.uniforms.uEnergyR.value) * ls;
    
    if (c0) mat.uniforms.uColor1.value.copy(c0); 
    if (c1) mat.uniforms.uColor2.value.copy(c1); 
    if (c2) mat.uniforms.uColor3.value.copy(c2);
    
    state.camera.position.x = Math.sin(time * 0.05) * 12; 
    state.camera.position.y = Math.cos(time * 0.07) * 4 + 2; 
    state.camera.lookAt(0, 0, -40);
  });

  return (
    <>
      {!settings.albumArtBackground && <color attach="background" args={['#000000']} />}
      <instancedMesh ref={meshRef} args={[undefined, undefined, MAX_LINES]}>
        <planeGeometry args={[RIBBON_WIDTH, 1.0, SEGMENTS_X, 1]}>
            <instancedBufferAttribute attach="attributes-aChannel" args={[channels, 1]} />
            <instancedBufferAttribute attach="attributes-aRandom" args={[randoms, 1]} />
            <instancedBufferAttribute attach="attributes-aLayerIndex" args={[layerIndices, 1]} />
        </planeGeometry>
        <shaderMaterial transparent depthWrite={false} side={DoubleSide} blending={AdditiveBlending} uniforms={uniforms}
          vertexShader={`
            uniform float uTime, uSpeed, uBass, uEnergyL, uEnergyR, uShockwave, uDensity; 
            attribute float aChannel, aRandom, aLayerIndex; 
            varying float vIntensity, vDepth, vSideFade, vVisibility, vRandom; 
            varying vec2 vUv; 

            vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; } 
            vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; } 
            vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); } 
            vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; } 
            
            float snoise(vec3 v) { 
                const vec2 C = vec2(1.0/6.0, 1.0/3.0); 
                const vec4 D = vec4(0.0, 0.5, 1.0, 2.0); 
                vec3 i = floor(v + dot(v, C.yyy)); 
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
                vec3 dx = vec3(e, 0.0, 0.0), dy = vec3(0.0, e, 0.0), dz = vec3(0.0, 0.0, e); 
                float p_dx = snoise(p + dx), m_dx = snoise(p - dx), p_dy = snoise(p + dy), m_dy = snoise(p - dy), p_dz = snoise(p + dz), m_dz = snoise(p - dz); 
                return normalize(vec3((p_dy - m_dy) - (p_dz - m_dz), (p_dz - m_dz) - (p_dx - m_dx), (p_dx - m_dx) - (p_dy - m_dy))); 
            } 

            void main() { 
                vUv = uv; 
                vRandom = aRandom;
                vVisibility = smoothstep(uDensity + 0.05, uDensity - 0.05, aLayerIndex); 
                vSideFade = smoothstep(0.0, 0.15, uv.x) * smoothstep(1.0, 0.85, uv.x); 
                
                float taper = smoothstep(0.0, 0.2, uv.x) * smoothstep(1.0, 0.8, uv.x);
                float thickness = 0.1 * taper * (1.0 + uBass * 0.5);
                
                vec3 pos = position; 
                pos.y *= thickness; 
                pos.z += (aLayerIndex * 2.0 - 1.0) * 45.0; 
                
                float energy = (aChannel > 0.0) ? uEnergyL : uEnergyR; 
                float flowTime = uTime * uSpeed * 0.35; 
                
                vec3 noisePos = pos * 0.0018 + vec3(flowTime * 0.1, pos.z * 0.015, aLayerIndex * 0.4); 
                pos += curlNoise(noisePos) * (8.0 + uBass * 6.0) * vSideFade; 
                
                float xInput = pos.x * 0.015 + aRandom * 40.0; 
                float baseWave = sin(xInput + snoise(vec3(pos.x * 0.005, uTime * 0.1, aLayerIndex)) * 3.0); 
                float amp = (baseWave + snoise(vec3(pos.x * 0.01, uTime * 0.15, aLayerIndex)) * 0.3); 
                
                pos.y += amp * (4.0 + pow(energy, 0.7) * 20.0) * aChannel; 
                pos.y += aChannel * 3.0 + sin(flowTime + pos.x * 0.008) * uBass * 10.0 * aChannel; 
                pos.y += sin(length(pos.xz) * 0.1 - uTime * 7.0) * uShockwave * 12.0 * aChannel; 
                
                vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0); 
                gl_Position = projectionMatrix * mvPosition; 
                
                vIntensity = pow(energy, 0.7) * 0.8 + smoothstep(0.0, 50.0, abs(pos.y)) * 0.4 + uShockwave * 0.6; 
                vDepth = -mvPosition.z; 
            }
          `}
          fragmentShader={`
            uniform vec3 uColor1, uColor2, uColor3; 
            uniform float uTime; 
            varying float vIntensity, vDepth, vSideFade, vVisibility, vRandom; 
            varying vec2 vUv; 
            void main() { 
                if (vVisibility < 0.01) discard; 

                float blur = smoothstep(0.0, 70.0, abs(vDepth - 30.0)); 
                float alpha = smoothstep(0.0, mix(0.1, 0.9, blur), 1.0 - abs(vUv.y - 0.5) * 2.0); 
                if (alpha < 0.01) discard; 

                // v2.1.1 Optimization: Stagger pulse phase and speed per line using vRandom
                float lineSpeed = 0.12 + vRandom * 0.18;
                float linePhase = vRandom * 20.0;
                float glowX = fract(uTime * lineSpeed + linePhase + vIntensity * 0.08); 
                
                // Narrower, sharper glow pulses to avoid clumping
                float glow = exp(-abs(vUv.x - glowX) * 22.0) * (1.0 + vIntensity * 2.8); 
                
                vec3 baseCol = mix(uColor1, uColor2, vUv.x);
                vec3 finalCol = baseCol * 0.4 + uColor3 * glow * 2.5 + vec3(1.0) * glow * smoothstep(0.5, 1.0, glow); 
                
                float tip = smoothstep(0.97, 1.0, vUv.x) * smoothstep(0.3, 1.0, sin(uTime * 5.0 + vIntensity * 80.0)); 
                finalCol += vec3(1.0) * tip * 8.0 + uColor3 * tip * 4.0; 

                float fAlpha = alpha * vSideFade * vVisibility * smoothstep(160.0, 30.0, vDepth); 
                gl_FragColor = vec4(finalCol, fAlpha * (0.4 + glow * 0.6 + tip * 0.5) * (1.0 - blur * 0.3)); 
            }
          `}
        />
      </instancedMesh>
    </>
  );
};