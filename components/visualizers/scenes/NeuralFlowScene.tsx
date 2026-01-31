/**
 * File: components/visualizers/scenes/NeuralFlowScene.tsx
 * Version: 1.8.46
 * Author: Sut
 */

import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Points, Color, AdditiveBlending, ShaderMaterial } from 'three';
import { VisualizerSettings } from '../../../core/types';
import { useAudioReactive } from '../../../core/hooks/useAudioReactive';

interface SceneProps { analyser: AnalyserNode; colors: string[]; settings: VisualizerSettings; }

export const NeuralFlowScene: React.FC<SceneProps> = ({ analyser, colors, settings }) => {
  const pointsRef = useRef<Points>(null);
  const { features, smoothedColors } = useAudioReactive({ analyser, colors, settings });
  const [c0, c1] = smoothedColors;
  
  const count = settings.quality === 'high' ? 12000 : settings.quality === 'med' ? 8000 : 4000;
  const [positions, randomness] = useMemo(() => {
    const pos = new Float32Array(count * 3), rnd = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      const r = 30 + Math.random() * 50, th = Math.random() * Math.PI * 2, ph = Math.acos(2 * Math.random() - 1);
      const b = Math.sin(th * 3) * Math.cos(ph * 5) * 10.0;
      pos[i*3] = (r+b)*Math.sin(ph)*Math.cos(th); pos[i*3+1] = (r+b)*Math.sin(ph)*Math.sin(th); pos[i*3+2] = (r+b)*Math.cos(ph);
      rnd[i] = Math.random();
    }
    return [pos, rnd];
  }, [count]);

  const uniforms = useMemo(() => ({ 
    uTime:{value:0}, uBass:{value:0}, uMids:{value:0}, uTreble:{value:0}, 
    uBeat:{value:0}, uVolume:{value:0}, uColor1:{value:new Color()}, uColor2:{value:new Color()} 
  }), []);
  
  const beatTimerRef = useRef(0), accumulatedTimeRef = useRef(0);

  useFrame((state, delta) => {
    if (!pointsRef.current) return;
    const mat = pointsRef.current.material as ShaderMaterial, sysTime = state.clock.getElapsedTime();
    
    // Use features from useAudioReactive which are updated in its own useFrame
    accumulatedTimeRef.current += delta * settings.speed * (0.2 + features.volume * 2.5);
    if (features.isBeat) beatTimerRef.current = sysTime;
    
    mat.uniforms.uTime.value = accumulatedTimeRef.current; 
    mat.uniforms.uBass.value = Math.pow(features.bass, 1.5); 
    mat.uniforms.uMids.value = features.mids; 
    mat.uniforms.uTreble.value = features.treble; 
    mat.uniforms.uVolume.value = features.volume;
    
    const beatPhase = Math.max(0, Math.exp(-(sysTime - beatTimerRef.current) * 4.0));
    mat.uniforms.uBeat.value = beatPhase; 
    
    if (c0) mat.uniforms.uColor1.value.copy(c0); 
    if (c1) mat.uniforms.uColor2.value.copy(c1);
    
    pointsRef.current.rotation.y = accumulatedTimeRef.current * 0.05; 
    pointsRef.current.rotation.z = Math.sin(accumulatedTimeRef.current * 0.1) * 0.1;
  });

  return (
    <>
      {!settings.albumArtBackground && <color attach="background" args={['#000000']} />}
      <points ref={pointsRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
          <bufferAttribute attach="attributes-aRandom" count={count} array={randomness} itemSize={1} />
        </bufferGeometry>
        <shaderMaterial transparent depthWrite={false} blending={AdditiveBlending} uniforms={uniforms}
          vertexShader={`uniform float uTime; uniform float uBass; uniform float uMids; uniform float uTreble; uniform float uBeat; attribute float aRandom; varying float vNoise; varying float vSignal; varying float vDist; vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; } vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; } vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); } vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; } float snoise(vec3 v) { const vec2 C = vec2(1.0/6.0, 1.0/3.0); const vec4 D = vec4(0.0, 0.5, 1.0, 2.0); vec3 i = floor(v + dot(v, C.yyy)); vec3 x0 = v - i + dot(i, C.xxx); vec3 g = step(x0.yzx, x0.xyz); vec3 l = 1.0 - g; vec3 i1 = min(g.xyz, l.zxy); vec3 i2 = max(g.xyz, l.zxy); vec3 x1 = x0 - i1 + C.xxx; vec3 x2 = x0 - i2 + C.yyy; vec3 x3 = x0 - D.yyy; i = mod289(i); vec4 p = permute(permute(permute(i.z + vec4(0.0, i1.z, i2.z, 1.0)) + i.y + vec4(0.0, i1.y, i2.y, 1.0)) + i.x + vec4(0.0, i1.x, i2.x, 1.0)); vec4 j = p - 49.0 * floor(p * (1.0/49.0)); vec4 x_ = floor(j * (1.0/7.0)); vec4 y_ = floor(j - 7.0 * x_); vec4 x = x_ * (1.0/7.0) + vec4(-0.5); vec4 y = y_ * (1.0/7.0) + vec4(-0.5); vec4 h = 1.0 - abs(x) - abs(y); vec4 b0 = vec4(x.xy, y.xy); vec4 b1 = vec4(x.zw, y.zw); vec4 s0 = floor(b0)*2.0 + 1.0; vec4 s1 = floor(b1)*2.0 + 1.0; vec4 sh = -step(h, vec4(0.0)); vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy; vec4 a1 = b1.xzyw + s1.zzww*sh.zzww; vec3 p0 = vec3(a0.xy,h.x); vec3 p1 = vec3(a0.zw,h.y); vec3 p2 = vec3(a1.xy,h.z); vec3 p3 = vec3(a1.zw,h.w); vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3))); p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w; vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0); m = m * m; return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3))); } void main() { vec3 pos = position; float noise = snoise(pos * 0.02 + uTime * 0.2); vNoise = noise; vDist = length(pos); float vein = pow(1.0 - abs(noise), 3.0); vec3 curl = cross(normal, vec3(0.0, 1.0, 0.0)) * snoise(pos * 0.03 + vec3(0.0, 10.0, 0.0) + uTime * 0.15); vec3 newPos = pos - normalize(pos) * (1.0 - vein) * (5.0 + uMids * 10.0) * 0.2 + curl * (2.0 + uBass * 8.0) + normal * smoothstep(0.8, 1.0, sin(length(pos) * 0.1 - uBeat * 5.0)) * 3.0 * uBeat; vec4 mvPos = modelViewMatrix * vec4(newPos, 1.0); gl_Position = projectionMatrix * mvPos; vSignal = step(0.95, aRandom); gl_PointSize = mix(1.5 * (1.0 + uTreble * 1.5 + noise * 0.5), 12.0 * (1.0 + uBass * 0.8), vSignal) * (300.0 / -mvPos.z); }`}
          fragmentShader={`uniform vec3 uColor1; uniform vec3 uColor2; uniform float uTime; uniform float uTreble; uniform float uBass; varying float vNoise; varying float vSignal; varying float vDist; void main() { float d = distance(gl_PointCoord, vec2(0.5)); if(d > 0.5) discard; float alpha = pow(1.0 - smoothstep(0.0, 0.5, d), 2.0); float pulse = smoothstep(0.8, 1.0, sin(vNoise * 8.0 - uTime * 4.0)); vec3 col = mix(mix(uColor1, uColor2, vSignal * 0.5), uColor2 * 2.0, pulse + uBass * 0.5) + vec3(1.0) * pulse * uTreble * 2.0; gl_FragColor = vec4(col, alpha * (1.0 - smoothstep(50.0, 150.0, vDist)) * (0.6 + uBass * 0.4)); }`}
        />
      </points>
    </>
  );
};