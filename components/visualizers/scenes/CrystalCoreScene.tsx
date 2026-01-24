/**
 * File: components/visualizers/scenes/CrystalCoreScene.tsx
 * Version: 2.5.5
 * Author: Sut
 * Copyright (c) 2025 Aura Vision. All rights reserved.
 * Updated: 2025-03-03 10:00
 * Description: Patched circular structure JSON error by memoizing onBeforeCompile with useCallback.
 */

import React, { useRef, useMemo, useState, useEffect, useCallback } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { EffectComposer, GodRays, ChromaticAberration } from '@react-three/postprocessing';
import { TorusKnot, Environment } from '@react-three/drei';
import {
    Vector3,
    MeshBasicMaterial,
    AdditiveBlending,
    DodecahedronGeometry,
    IcosahedronGeometry,
    PerspectiveCamera,
    Mesh,
    PointLight,
    Color,
    Group,
    Object3D,
    InstancedMesh,
    MeshPhysicalMaterial,
    MeshStandardMaterial,
    MathUtils
} from 'three';
import { VisualizerSettings } from '../../../core/types';
import { useAudioReactive } from '../../../core/hooks/useAudioReactive';
import { DynamicStarfield } from './DynamicStarfield';

interface SceneProps {
  analyser: AnalyserNode;
  colors: string[];
  settings: VisualizerSettings;
}

const ShardParticles = ({ count, treble, color }: { count: number; treble: number; color: Color }) => {
    const meshRef = useRef<InstancedMesh>(null);
    const dummy = useMemo(() => new Object3D(), []);
    
    const particles = useMemo(() => Array.from({ length: count }, () => ({
        life: 0, maxLife: 0.5 + Math.random() * 0.5, velocity: new Vector3(),
    })), [count]);

    useFrame((_, delta) => {
        if (!meshRef.current) return;
        (meshRef.current.material as MeshBasicMaterial).color.set(color);
        particles.forEach((p, i) => {
            if (p.life <= 0 && treble > 0.4 && Math.random() > 0.8) {
                p.life = p.maxLife;
                p.velocity.set((Math.random() - 0.5), (Math.random() - 0.5), (Math.random() - 0.5)).normalize().multiplyScalar(20 + treble * 60);
                dummy.position.set(0, 0, 0);
            }
            if (p.life > 0) {
                p.life -= delta; p.velocity.multiplyScalar(0.95);
                dummy.position.addScaledVector(p.velocity, delta);
                dummy.scale.setScalar(Math.sin(p.life / p.maxLife * Math.PI) * (0.05 + treble * 0.1));
            } else { dummy.scale.setScalar(0); }
            dummy.updateMatrix(); meshRef.current!.setMatrixAt(i, dummy.matrix);
        });
        meshRef.current.instanceMatrix.needsUpdate = true;
    });

    return <instancedMesh ref={meshRef} args={[undefined, undefined, count]}><coneGeometry args={[1, 3, 4]} /><meshBasicMaterial toneMapped={false} blending={AdditiveBlending} /></instancedMesh>;
};

const SparkleParticles = ({ count, treble, color }: { count: number; treble: number; color: Color }) => {
    const meshRef = useRef<InstancedMesh>(null);
    const dummy = useMemo(() => new Object3D(), []);
    const particles = useMemo(() => Array.from({ length: count }, () => ({ life: 0, maxLife: 0.2 + Math.random() * 0.3, velocity: new Vector3() })), [count]);

    useFrame((_, delta) => {
        if (!meshRef.current) return;
        (meshRef.current.material as MeshBasicMaterial).color.set(color);
        particles.forEach((p, i) => {
            if (p.life <= 0 && treble > 0.5 && Math.random() > 0.4) {
                p.life = p.maxLife;
                p.velocity.set((Math.random() - 0.5), (Math.random() - 0.5), (Math.random() - 0.5)).normalize().multiplyScalar(60 + treble * 100);
                dummy.position.set(0, 0, 0);
            }
            if (p.life > 0) {
                p.life -= delta;
                dummy.position.addScaledVector(p.velocity, delta);
                const lifeRatio = p.life / p.maxLife;
                dummy.scale.setScalar(Math.sin(lifeRatio * Math.PI) * 0.08);
            } else { dummy.scale.setScalar(0); }
            dummy.updateMatrix(); meshRef.current!.setMatrixAt(i, dummy.matrix);
        });
        meshRef.current.instanceMatrix.needsUpdate = true;
    });

    return <instancedMesh ref={meshRef} args={[undefined, undefined, count]}><planeGeometry args={[1, 1]} /><meshBasicMaterial toneMapped={false} blending={AdditiveBlending} /></instancedMesh>;
};

export const CrystalCoreScene: React.FC<SceneProps> = ({ analyser, colors, settings }) => {
  const outerShellRef = useRef<Mesh>(null);
  const innerCoreRef = useRef<Mesh>(null);
  const innerHeartRef = useRef<Mesh>(null);
  const godRaysSunRef = useRef<Mesh>(null);
  const groupRef = useRef<Group>(null);
  const chromaticAberrationRef = useRef<any>(null);
  const pointLight1Ref = useRef<PointLight>(null);
  const pointLight2Ref = useRef<PointLight>(null);
  const camera = useThree(state => state.camera);
  
  const { bass, mids, treble, volume, smoothedColors, isBeat } = useAudioReactive({ analyser, colors, settings });
  const [c0, c1, c2] = smoothedColors;

  const outerGeo = useMemo(() => new DodecahedronGeometry(8, 0), []);
  const innerGeo = useMemo(() => new IcosahedronGeometry(4, 1), []);
  const particleCount = settings.quality === 'high' ? 150 : settings.quality === 'med' ? 80 : 40;
  
  const beatState = useRef({ impact: 0 });
  const [sunReady, setSunReady] = useState(false);
  useEffect(() => { if(godRaysSunRef.current) setSunReady(true); }, []);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    const dynamicTime = time * (0.2 + volume * 1.5) * settings.speed;
    
    // --- Camera & Beat Reactivity ---
    if (isBeat) beatState.current.impact = 1.0;
    beatState.current.impact *= 0.9;
    
    if (camera instanceof PerspectiveCamera) {
      camera.fov += (55 - beatState.current.impact * 10 - camera.fov) * 0.1;
      camera.position.z += ((22 - bass * 6) - camera.position.z) * 0.05;
      camera.updateProjectionMatrix();
    }
    
    if (chromaticAberrationRef.current) {
        const offsetVal = beatState.current.impact * 0.008;
        chromaticAberrationRef.current.offset.x = offsetVal;
        chromaticAberrationRef.current.offset.y = offsetVal;
    }

    // --- Scene Object Animations ---
    if (groupRef.current) {
        groupRef.current.rotation.y += (0.002 + volume * 0.01) * settings.speed;
        groupRef.current.rotation.z = Math.sin(time * 0.05) * 0.2;
    }

    if (outerShellRef.current) {
        const mat = outerShellRef.current.material as MeshPhysicalMaterial & {uniforms?: any};
        mat.ior = 1.7 + bass * 0.4; 
        mat.dispersion = 0.1 + treble * 0.2; 
        mat.thickness = 2.0 + bass * 3.0;
        mat.iridescence = mids * 2.0;
        outerShellRef.current.rotation.x = dynamicTime * 0.08; 
        outerShellRef.current.rotation.y = dynamicTime * 0.12;

        if (mat.uniforms) {
            mat.uniforms.uTime.value = time;
            mat.uniforms.uMids.value = mids;
            mat.uniforms.uVeinColor.value = c2;
        }
    }
    
    if (innerHeartRef.current) {
        const mat = innerHeartRef.current.material as MeshStandardMaterial;
        mat.emissive.set(c2);
        mat.emissiveIntensity = MathUtils.lerp(mat.emissiveIntensity, 0.5 + mids * 5.0, 0.1);
        innerHeartRef.current.rotation.x = dynamicTime * 0.4;
        innerHeartRef.current.rotation.y = dynamicTime * -0.6;
    }

    if (innerCoreRef.current && godRaysSunRef.current) {
        const coreMat = innerCoreRef.current.material as MeshStandardMaterial;
        const sunMat = godRaysSunRef.current.material as MeshBasicMaterial;
        coreMat.emissive.set(c1); sunMat.color.set(c1);
        coreMat.emissiveIntensity = MathUtils.lerp(coreMat.emissiveIntensity, 0.5 + bass * 4.0 + beatState.current.impact * 15.0, 0.1);
        const scale = 1.0 + Math.sin(time * 2) * 0.05 + beatState.current.impact * 0.2;
        innerCoreRef.current.scale.setScalar(scale); godRaysSunRef.current.scale.setScalar(scale);
        innerCoreRef.current.rotation.x = godRaysSunRef.current.rotation.x = dynamicTime * -0.3;
        innerCoreRef.current.rotation.z = godRaysSunRef.current.rotation.z = dynamicTime * -0.2;
    }

    // --- Lighting ---
    if (pointLight1Ref.current) pointLight1Ref.current.intensity = 5 + treble * 15;
    if (pointLight2Ref.current) pointLight2Ref.current.intensity = 3 + mids * 10;
  });

  const godRaysConfig = useMemo(() => ({
      density: 0.8 + bass * 0.4, decay: 0.96, weight: 0.3 + beatState.current.impact * 0.7,
      exposure: 0.4 + beatState.current.impact * 0.4, samples: settings.quality === 'high' ? 100 : 60, clampMax: 1.0
  }), [bass, beatState.current.impact, settings.quality]);

  const onBeforeCompile = useCallback((shader: any) => {
      shader.uniforms.uTime = { value: 0 };
      shader.uniforms.uMids = { value: 0 };
      shader.uniforms.uVeinColor = { value: new Color() };
      
      shader.vertexShader = shader.vertexShader.replace(
          `#include <worldpos_vertex>`,
          `#include <worldpos_vertex>\nvWorldPosition = worldPosition.xyz;`
      );

      shader.fragmentShader = `
          uniform float uTime; uniform float uMids; uniform vec3 uVeinColor;
          varying vec3 vWorldPosition;
          vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
          vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
          vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
          vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }
          float snoise(vec3 v) { 
            const vec2 C = vec2(1.0/6.0, 1.0/3.0); const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
            vec3 i  = floor(v + dot(v, C.yyy)); vec3 x0 = v - i + dot(i, C.xxx);
            vec3 g = step(x0.yzx, x0.xyz); vec3 l = 1.0 - g; vec3 i1 = min(g.xyz, l.zxy); vec3 i2 = max(g.xyz, l.zxy);
            vec3 x1 = x0 - i1 + C.xxx; vec3 x2 = x0 - i2 + C.yyy; vec3 x3 = x0 - D.yyy;
            i = mod289(i); 
            vec4 p = permute(permute(permute(i.z + vec4(0.0, i1.z, i2.z, 1.0)) + i.y + vec4(0.0, i1.y, i2.y, 1.0)) + i.x + vec4(0.0, i1.x, i2.x, 1.0));
            vec4 j = p - 49.0 * floor(p * (1.0/49.0)); vec4 x_ = floor(j * (1.0/7.0)); vec4 y_ = floor(j - 7.0 * x_);
            vec4 x = x_ * (1.0/7.0) + vec4(-0.5); vec4 y = y_ * (1.0/7.0) + vec4(-0.5);
            vec4 h = 1.0 - abs(x) - abs(y); vec4 b0 = vec4(x.xy, y.xy); vec4 b1 = vec4(x.zw, y.zw);
            vec4 s0 = floor(b0)*2.0 + 1.0; vec4 s1 = floor(b1)*2.0 + 1.0; vec4 sh = -step(h, vec4(0.0));
            vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy; vec4 a1 = b1.xzyw + s1.zzww*sh.zzww;
            vec3 p0 = vec3(a0.xy,h.x); vec3 p1 = vec3(a0.zw,h.y); vec3 p2 = vec3(a1.xy,h.z); vec3 p3 = vec3(a1.zw,h.w);
            vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
            p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
            vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0); m = m * m;
            return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
          }
          ${shader.fragmentShader.replace(
              '#include <dithering_fragment>',
              `#include <dithering_fragment>
              float veinNoise = snoise(vWorldPosition * 0.4 + uTime * 0.1);
              float veins = pow(1.0 - abs(veinNoise), 30.0);
              gl_FragColor.rgb += veins * uVeinColor * (0.2 + uMids * 1.5);`
          )}
      `;
  }, []);

  return (
    <>
      <color attach="background" args={['#020104']} />
      { (settings.quality === 'high' || settings.quality === 'med') && <Environment preset="city" resolution={256} /> }
      <DynamicStarfield treble={treble} speed={settings.speed} />
      
      <group ref={groupRef}>
          <mesh ref={innerCoreRef} geometry={innerGeo}><meshStandardMaterial metalness={0} roughness={0.2} emissive="#fff" emissiveIntensity={1} /></mesh>
          <TorusKnot ref={innerHeartRef} args={[1, 0.2, 128, 16]}>
            <meshStandardMaterial metalness={0.8} roughness={0.1} emissive="#fff" />
          </TorusKnot>
          <mesh ref={outerShellRef} geometry={outerGeo}>
            <meshPhysicalMaterial 
              roughness={0.01} metalness={0.5} transmission={1.0} ior={1.7} thickness={2.0} dispersion={0.1} 
              attenuationColor="#ffffff" attenuationDistance={12} clearcoat={1.0}
              iridescence={0.5} iridescenceIOR={1.3} iridescenceThicknessRange={[100, 400]}
              envMapIntensity={2.0}
              onBeforeCompile={onBeforeCompile}
            />
          </mesh>
          <ShardParticles count={particleCount} treble={treble} color={c2} />
          <SparkleParticles count={particleCount * 2} treble={treble} color={c0} />
      </group>
      
      <ambientLight intensity={0.5} />
      <pointLight ref={pointLight1Ref} position={[20, 30, 20]} intensity={5} color={c1} />
      <pointLight ref={pointLight2Ref} position={[-20, -10, -30]} intensity={3} color={c2} />
      
      <mesh ref={godRaysSunRef} geometry={innerGeo}><meshBasicMaterial color={c1} transparent opacity={0} /></mesh>
      
      {sunReady && (
        <EffectComposer multisampling={0}>
          <GodRays sun={godRaysSunRef.current!} {...godRaysConfig} />
          <ChromaticAberration ref={chromaticAberrationRef} offset={[0, 0]} />
        </EffectComposer>
      )}
    </>
  );
};