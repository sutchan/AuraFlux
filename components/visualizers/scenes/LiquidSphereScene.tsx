/**
 * File: components/visualizers/scenes/LiquidSphereScene.tsx
 * Version: 1.1.1
 * Author: Aura Vision Team
 * Copyright (c) 2024 Aura Vision. All rights reserved.
 * Updated: 2025-03-08 16:00
 */

import React, { useRef, useMemo, Suspense } from 'react';
import { useFrame } from '@react-three/fiber';
import { Stars } from '@react-three/drei';
// @fixtsx(9) - import THREE members directly
import { IcosahedronGeometry, BufferAttribute, DoubleSide, MeshPhysicalMaterial, PointLight, RectAreaLight, Mesh, Group, MathUtils, Color } from 'three';
import { VisualizerSettings } from '../../../core/types';
import { useAudioReactive } from '../../../core/hooks/useAudioReactive';

interface SceneProps {
  analyser: AnalyserNode;
  colors: string[];
  settings: VisualizerSettings;
}

export const LiquidSphereScene: React.FC<SceneProps> = ({ analyser, colors, settings }) => {
  const meshRef = useRef<Mesh>(null);
  const materialRef = useRef<MeshPhysicalMaterial>(null);
  const light1Ref = useRef<PointLight>(null);
  const light2Ref = useRef<PointLight>(null);
  const light3Ref = useRef<PointLight>(null);
  const rectLightRef = useRef<RectAreaLight>(null);
  const starsRef = useRef<Group>(null);

  const { bass: reactivity, treble: vibration, smoothedColors, isBeat } = useAudioReactive({ analyser, colors, settings });
  const [c0, c1, c2] = smoothedColors;

  const geometry = useMemo(() => {
      // Optimization v1.1.0: Drastically reduced subdivision detail to prevent CPU bottleneck
      // Previous High (4) was ~2500 vertices updating per frame in JS.
      // New High (3) is ~642 vertices. New Med (2) is ~162 vertices.
      let detail = 1;
      if (settings.quality === 'med') detail = 2;
      if (settings.quality === 'high') detail = 3;
      // @fixtsx(41) - Use imported IcosahedronGeometry
      return new IcosahedronGeometry(4, detail);
  }, [settings.quality]);
  
  const originalPositions = useMemo(() => {
     const pos = geometry.attributes.position;
     const count = pos.count;
     const array = new Float32Array(count * 3);
     for(let i=0; i<count; i++) {
         array[i*3] = pos.getX(i);
         array[i*3+1] = pos.getY(i);
         array[i*3+2] = pos.getZ(i);
     }
     return array;
  }, [geometry]);

  useFrame(({ clock }) => {
    const time = clock.getElapsedTime() * settings.speed * 0.4;

    if (materialRef.current) {
        materialRef.current.color.set(c0);
        materialRef.current.emissive.set(c1);
        
        // Pulse emissive strongly on true beat
        const beatFlash = isBeat ? 1.5 : 0;
        const currentEmissive = materialRef.current.emissiveIntensity;
        // Smooth decay for the flash
        const targetEmissive = 0.2 + reactivity * 0.8 + beatFlash;
        // @fixtsx(70) - Use imported MathUtils
        materialRef.current.emissiveIntensity = MathUtils.lerp(currentEmissive, targetEmissive, 0.2);
    }
    
    // Position lights dynamically to simulate a moving environment
    if (light1Ref.current) {
        // @fixtsx(73) - Set color using .set() method
        light1Ref.current.color.set(c0);
        // @fixtsx(74,75) - TypeScript now correctly finds 'position' property
        light1Ref.current.position.x = Math.sin(time * 0.5) * 20;
        light1Ref.current.position.z = Math.cos(time * 0.5) * 20;
        light1Ref.current.intensity = 15 + reactivity * 30;
    }
    if (light2Ref.current) {
        // @fixtsx(79) - Set color using .set() method
        light2Ref.current.color.set(c1);
        // @fixtsx(80) - TypeScript now correctly finds 'position' property
        light2Ref.current.position.y = Math.cos(time * 0.7) * 20;
        light2Ref.current.intensity = 10 + reactivity * 20;
    }
    if (light3Ref.current) {
        // @fixtsx(84) - Set color using .set() method
        light3Ref.current.color.set(c2 || c0);
        // @fixtsx(85) - TypeScript now correctly finds 'position' property
        light3Ref.current.position.x = Math.cos(time * 0.3) * -15;
        light3Ref.current.intensity = 5 + vibration * 15;
    }
    if (rectLightRef.current) {
        rectLightRef.current.intensity = 2 + vibration * 20; 
        // @fixtsx(90) - TypeScript now correctly finds 'lookAt' method
        rectLightRef.current.lookAt(0,0,0);
    }
    
    if (starsRef.current) {
        starsRef.current.rotation.y += 0.0001 * settings.speed;
        starsRef.current.rotation.z += 0.00005 * settings.speed;
    }


    if (!meshRef.current) return;
    // @fixtsx(100) - Use imported BufferAttribute
    const positions = meshRef.current.geometry.attributes.position as BufferAttribute;

    // Vertex Loop: This is the most expensive part.
    // Reducing count allows us to keep the math complex but fast.
    for (let i = 0; i < positions.count; i++) {
        const ox = originalPositions[i*3];
        const oy = originalPositions[i*3+1];
        const oz = originalPositions[i*3+2];
        
        // Base liquid movement
        const noise1 = Math.sin(ox * 0.5 + time) * Math.cos(oy * 0.4 + time * 0.8) * Math.sin(oz * 0.5 + time * 1.2);
        
        let noise2 = 0;
        if (settings.quality !== 'low') {
            noise2 = Math.sin(ox * 2.5 + time * 1.5) * Math.cos(oy * 2.2 + time * 1.8) * 0.5;
        }
        
        // Reactivity Boost + Beat Punch
        const beatPunch = isBeat ? 0.5 : 0;
        const d1 = noise1 * (0.3 + reactivity * 1.2 + beatPunch); 
        const d2 = noise2 * (0.05 + vibration * 0.6); 
        
        const totalDisplacement = Math.max(0.1, 1.0 + d1 + d2);
        
        positions.setXYZ(i, ox * totalDisplacement, oy * totalDisplacement, oz * totalDisplacement);
    }
    positions.needsUpdate = true;
    meshRef.current.geometry.computeVertexNormals();
    meshRef.current.rotation.y = time * 0.08 + reactivity * 0.1; 
    meshRef.current.rotation.x = time * 0.05;
  });

  return (
    <>
      {!settings.albumArtBackground && <color attach="background" args={['#030303']} />}
      <Suspense fallback={null}>
        <group ref={starsRef}>
          <Stars radius={100} depth={50} count={3000} factor={4} saturation={0} fade speed={1} />
        </group>
      </Suspense>
      
      <ambientLight intensity={0.4} />
      {/* @fixtsx(142-145) - JSX props are now correctly typed with named imports */}
      <pointLight ref={light1Ref} position={[20, 20, 20]} intensity={15} distance={100} />
      <pointLight ref={light2Ref} position={[-20, -20, 10]} intensity={10} distance={100} />
      <pointLight ref={light3Ref} position={[0, 0, -25]} intensity={5} distance={80} />
      <rectAreaLight ref={rectLightRef} width={10} height={10} intensity={2} color={c1} position={[10, 10, -20]} />
      
      <mesh ref={meshRef}>
         <primitive object={geometry} attach="geometry" />
         <meshPhysicalMaterial 
            ref={materialRef}
            dithering={true}
            metalness={0.95}
            roughness={0.1}
            clearcoat={1.0}
            clearcoatRoughness={0.1}
            reflectivity={1.0}
            envMapIntensity={0}
            ior={1.8}
            // @fixtsx(159) - Use imported DoubleSide
            side={DoubleSide}
            flatShading={settings.quality === 'low'}
         />
      </mesh>
    </>
  );
};