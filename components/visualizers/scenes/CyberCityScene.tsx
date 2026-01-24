/**
 * File: components/visualizers/scenes/CyberCityScene.tsx
 * Version: 2.2.0
 * Author: Sut
 * Copyright (c) 2025 Aura Vision. All rights reserved.
 * Updated: 2025-02-29 14:00
 * Description: "Digital Pulse" Update. Added audio-reactive holographic billboards
 * and pulsing road lanes for a true cyberpunk aesthetic.
 */

import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
// @fixtsx(11) - import THREE members directly
// Fix: Import MeshStandardMaterial to resolve namespace error
import { InstancedMesh, Object3D, Color, CanvasTexture, Fog, AdditiveBlending, ShaderMaterial, MeshStandardMaterial } from 'three';
import { VisualizerSettings } from '../../../core/types';
import { useAudioReactive } from '../../../core/hooks/useAudioReactive';

interface SceneProps {
  analyser: AnalyserNode;
  colors: string[];
  settings: VisualizerSettings;
}

const Rain = ({ count }: { count: number }) => {
    const meshRef = useRef<InstancedMesh>(null);
    const dummy = useMemo(() => new Object3D(), []);
    const particles = useMemo(() => Array.from({ length: count }, () => ({ x: (Math.random() - 0.5) * 200, y: Math.random() * 100, z: (Math.random() - 0.5) * 400 })), [count]);
    useFrame(() => { if (!meshRef.current) return; particles.forEach((p, i) => { p.y -= 2.0; if (p.y < -10) p.y = 100; dummy.position.set(p.x, p.y, p.z); dummy.updateMatrix(); meshRef.current!.setMatrixAt(i, dummy.matrix); }); meshRef.current.instanceMatrix.needsUpdate = true; });
    return <instancedMesh ref={meshRef} args={[undefined, undefined, count]}><capsuleGeometry args={[0.03, 1.5, 4, 8]} /><meshBasicMaterial color="#5f90f1" transparent opacity={0.3} /></instancedMesh>;
};

const Traffic = ({ count, color, speed, direction }: { count: number, color: Color, speed: number, direction: number }) => {
    const meshRef = useRef<InstancedMesh>(null);
    const dummy = useMemo(() => new Object3D(), []);
    const lanes = useMemo(() => Array.from({ length: count }, () => ({ x: (10 + Math.random() * 8) * direction, y: 0.5, z: (Math.random() - 0.5) * 400 })), [count, direction]);
    useFrame((_, delta) => { if(!meshRef.current) return; lanes.forEach((l, i) => { l.z += delta * speed * (direction > 0 ? -1 : 1); if (l.z < -200) l.z = 200; if (l.z > 200) l.z = -200; dummy.position.set(l.x, l.y, l.z); dummy.updateMatrix(); meshRef.current!.setMatrixAt(i, dummy.matrix); }); meshRef.current.instanceMatrix.needsUpdate = true; });
    return <instancedMesh ref={meshRef} args={[undefined, undefined, count]}><planeGeometry args={[0.5, 0.2]} /><meshBasicMaterial color={color} toneMapped={false} /></instancedMesh>;
};

const Holograms = ({ count, color, mids }: { count: number; color: Color; mids: number }) => {
    const meshRef = useRef<InstancedMesh>(null);
    const dummy = useMemo(() => new Object3D(), []);
    const ads = useMemo(() => Array.from({ length: count }, (_, i) => ({ x: (i % 2 === 0 ? -1 : 1) * (12 + Math.random() * 2), y: 4 + Math.random() * 8, z: (Math.random() - 0.5) * 400 })), [count]);
    useFrame(({ clock }) => { if (!meshRef.current) return; (meshRef.current.material as ShaderMaterial).uniforms.uTime.value = clock.getElapsedTime(); (meshRef.current.material as ShaderMaterial).uniforms.uBrightness.value = 0.2 + mids * 1.5; ads.forEach((ad, i) => { dummy.position.set(ad.x, ad.y, ad.z); dummy.updateMatrix(); meshRef.current!.setMatrixAt(i, dummy.matrix); }); meshRef.current.instanceMatrix.needsUpdate = true; });
    return <instancedMesh ref={meshRef} args={[undefined, undefined, count]}><planeGeometry args={[10, 5]} /><shaderMaterial transparent blending={AdditiveBlending} depthWrite={false} uniforms={{ uTime: { value: 0 }, uBrightness: { value: 0.5 }, uColor: { value: color } }} vertexShader={`varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * instanceMatrix * vec4(position, 1.0); }`} fragmentShader={`uniform float uTime; uniform float uBrightness; uniform vec3 uColor; varying vec2 vUv; float rand(vec2 n) { return fract(sin(dot(n, vec2(12.9898, 4.1414))) * 43758.5453); } void main() { float scanline = sin(vUv.y * 100.0 - uTime * 10.0) * 0.05; float glitch = rand(vec2(uTime * 0.5, vUv.y)) > 0.9 ? 0.2 : 0.0; float border = smoothstep(0.0, 0.1, vUv.y) * smoothstep(1.0, 0.9, vUv.y); float baseAlpha = (0.5 + scanline + glitch) * border * uBrightness; gl_FragColor = vec4(uColor, baseAlpha); }`} /></instancedMesh>;
};

const RoadLanes = ({ time, speed, bass, color }: { time: number; speed: number; bass: number; color: Color }) => {
    const matRef = useRef<ShaderMaterial>(null);
    useFrame(() => { if(matRef.current) { matRef.current.uniforms.uTime.value = time; matRef.current.uniforms.uSpeed.value = speed; matRef.current.uniforms.uBass.value = bass; } });
    return <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.15, 0]}><planeGeometry args={[10, 400]} /><shaderMaterial ref={matRef} transparent blending={AdditiveBlending} uniforms={{ uTime: { value: 0 }, uSpeed: { value: 0 }, uBass: { value: 0 }, uColor: { value: color } }} vertexShader={`varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`} fragmentShader={`uniform float uTime; uniform float uSpeed; uniform float uBass; uniform vec3 uColor; varying vec2 vUv; void main() { float t = uTime * uSpeed * 0.0002; float y = fract(vUv.y * 10.0 + t); float line = pow(1.0 - abs(y - 0.5) * 2.0, 10.0); float brightness = 0.2 + uBass * 1.2; gl_FragColor = vec4(uColor, line * brightness); }`} /></mesh>;
};

export const CyberCityScene: React.FC<SceneProps> = ({ analyser, colors, settings }) => {
  const buildingRef = useRef<InstancedMesh>(null);
  const fogRef = useRef<Fog>(null);
  const { bass, mids, treble, smoothedColors, isBeat } = useAudioReactive({ analyser, colors, settings });
  const [c0, c1, c2] = smoothedColors;

  const count = 400; const dummy = useMemo(() => new Object3D(), []);
  const heightBuffer = useMemo(() => new Float32Array(count).fill(5.0), [count]);
  const dataArray = useMemo(() => new Uint8Array(analyser.frequencyBinCount), [analyser]);
  const windowTexture = useMemo(() => { const c = document.createElement("canvas"); c.width=32; c.height=128; const ctx=c.getContext("2d")!; ctx.fillStyle="#000"; ctx.fillRect(0,0,32,128); for(let y=2;y<128;y+=8)for(let x=2;x<32;x+=8)if(Math.random()>0.3){ctx.fillStyle=`hsl(0,0%,${60+Math.random()*40}%)`;ctx.fillRect(x,y,5,5);} return new CanvasTexture(c);},[]);
  const buildings = useMemo(() => Array.from({ length: count }, (_, i) => ({ x: (i % 2 === 0 ? 1 : -1) * (15 + Math.random() * 60), z: (Math.random() - 0.5) * 400, w: 4 + Math.random() * 8, d: 4 + Math.random() * 8, freqIdx: Math.floor(Math.abs((Math.random() - 0.5) * 400 + 200) / 400 * 40)})), []);
  const beatState = useRef({ shake: 0, flash: 0 });
  let time = 0, speed = 0;

  useFrame((state) => {
    time = state.clock.getElapsedTime(); speed = settings.speed * 40 * (1 + mids * 0.5);
    analyser.getByteFrequencyData(dataArray);
    if (isBeat) beatState.current = { shake: 1.0, flash: 1.0 }; beatState.current.shake *= 0.9; beatState.current.flash *= 0.85;
    const sway = Math.sin(time * 0.2); state.camera.position.y = 4; state.camera.position.x = sway * 2; state.camera.rotation.z = Math.cos(time * 0.2) * -0.05 + ((Math.random() - 0.5) * beatState.current.shake * 0.05); state.camera.rotation.y = (Math.random() - 0.5) * beatState.current.shake * 0.05;
    if (fogRef.current) fogRef.current.color.lerp(c2, 0.05);
    // Fix: Remove `THREE.` namespace prefix
    if (buildingRef.current) { const mat = buildingRef.current.material as MeshStandardMaterial; mat.emissive.set(c0); mat.emissiveIntensity = 0.5 + treble * 3.0 + beatState.current.flash * 2.0; buildings.forEach((b, i) => { let z = b.z + (time * speed) % 400; if (z > 200) z -= 400; const val = dataArray[b.freqIdx % dataArray.length] / 255; const targetH = 10 + val * 80 * settings.sensitivity; heightBuffer[i]+=(targetH-heightBuffer[i])*0.1; const h=heightBuffer[i]; dummy.position.set(b.x, h/2, z); dummy.scale.set(b.w, h, b.d); dummy.updateMatrix(); buildingRef.current!.setMatrixAt(i, dummy.matrix); }); buildingRef.current.instanceMatrix.needsUpdate = true; }
  });

  return (
    <>
      <color attach="background" args={['#020104']} />
      <fog ref={fogRef} attach="fog" args={['#020104', 50, 200]} />
      <ambientLight intensity={0.1} />
      {/* @fixtsx(80) - JSX props are now correctly typed with named imports */}
      <pointLight position={[0, 50, -100]} intensity={5} color={c1} distance={200} />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.1, 0]}><planeGeometry args={[200, 400]} /><meshStandardMaterial color="#111115" metalness={0.9} roughness={0.3} roughnessMap={useMemo(() => new CanvasTexture((() => {const c=document.createElement("canvas");c.width=128;c.height=128;const ctx=c.getContext("2d")!;for(let x=0;x<128;x++)for(let y=0;y<128;y++){const v=Math.random()>0.6?255:100;ctx.fillStyle=`rgb(${v},${v},${v})`;ctx.fillRect(x,y,1,1);}return c;})()),[])} /></mesh>
      <instancedMesh ref={buildingRef} args={[undefined, undefined, count]}><boxGeometry args={[1, 1, 1]} /><meshStandardMaterial color="#080810" metalness={0.9} roughness={0.1} emissiveMap={windowTexture} /></instancedMesh>
      {settings.quality !== 'low' && <Rain count={settings.quality === 'high' ? 5000 : 2000} />}
      <Traffic count={40} color={new Color("#ffffff")} speed={80 + bass * 100} direction={-1} />
      <Traffic count={40} color={new Color("#ff5555")} speed={60 + mids * 80} direction={1} />
      <Holograms count={settings.quality === 'low' ? 4 : 8} color={c1} mids={mids} />
      <RoadLanes time={time} speed={speed} bass={bass} color={c0} />
    </>
  );
};