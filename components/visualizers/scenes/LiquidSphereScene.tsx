/**
 * File: components/visualizers/scenes/LiquidSphereScene.tsx
 * Version: 1.9.6
 * Author: Sut
 * Description: "Resonance Orb" - High-fidelity reactive sphere with fixed real-time feature access.
 * Updated: 2025-03-25 17:10 - Fixed audio lag by accessing features inside useFrame and increased deformation scale.
 */

import React, { useRef, useMemo, Suspense } from 'react';
import { useFrame } from '@react-three/fiber';
import { Stars } from '@react-three/drei';
import { IcosahedronGeometry, BufferAttribute, DoubleSide, MeshPhysicalMaterial, PointLight, RectAreaLight, Mesh, Group, MathUtils } from 'three';
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

  const { features, smoothedColors } = useAudioReactive({ analyser, colors, settings });
  const [c0, c1, c2] = smoothedColors;

  const geometry = useMemo(() => {
      let detail = 1;
      if (settings.quality === 'med') detail = 2;
      if (settings.quality === 'high') detail = 3;
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
    
    // CRITICAL FIX: Access features inside useFrame to ensure reactive updates
    const { bass, treble, volume, isBeat } = features;

    if (materialRef.current) {
        materialRef.current.color.set(c0);
        materialRef.current.emissive.set(c1);
        
        const beatFlash = isBeat ? 2.5 : 0;
        const currentEmissive = materialRef.current.emissiveIntensity;
        const targetEmissive = 0.2 + bass * 1.5 + beatFlash;
        materialRef.current.emissiveIntensity = MathUtils.lerp(currentEmissive, targetEmissive, 0.15);
    }
    
    if (light1Ref.current) {
        light1Ref.current.color.set(c0);
        light1Ref.current.position.x = Math.sin(time * 0.5) * 20;
        light1Ref.current.position.z = Math.cos(time * 0.5) * 20;
        light1Ref.current.intensity = 15 + bass * 50;
    }
    if (light2Ref.current) {
        light2Ref.current.color.set(c1);
        light2Ref.current.position.y = Math.cos(time * 0.7) * 20;
        light2Ref.current.intensity = 10 + volume * 40;
    }
    if (light3Ref.current) {
        light3Ref.current.color.set(c2 || c0);
        light3Ref.current.position.x = Math.cos(time * 0.3) * -15;
        light3Ref.current.intensity = 5 + treble * 30;
    }
    if (rectLightRef.current) {
        rectLightRef.current.intensity = 5 + treble * 40; 
        rectLightRef.current.lookAt(0,0,0);
    }
    
    if (starsRef.current) {
        starsRef.current.rotation.y += 0.0001 * settings.speed * (1 + bass);
    }

    if (!meshRef.current) return;
    const positions = meshRef.current.geometry.attributes.position as BufferAttribute;

    // Displacement Logic Refinement
    for (let i = 0; i < positions.count; i++) {
        const ox = originalPositions[i*3];
        const oy = originalPositions[i*3+1];
        const oz = originalPositions[i*3+2];
        
        // Complex noise based on audio
        const noise1 = Math.sin(ox * 0.5 + time) * Math.cos(oy * 0.4 + time * 0.8) * Math.sin(oz * 0.5 + time * 1.2);
        const noise2 = Math.sin(ox * 3.0 + time * 2.0) * Math.cos(oy * 2.5 + time * 2.5) * 0.3;
        
        const beatPunch = isBeat ? 0.8 : 0;
        // Sensitivity applied to displacement
        const d1 = noise1 * (0.4 + bass * 2.0 + beatPunch); 
        const d2 = noise2 * (0.1 + treble * 1.5); 
        
        const totalDisplacement = Math.max(0.1, 1.0 + d1 + d2);
        
        positions.setXYZ(i, ox * totalDisplacement, oy * totalDisplacement, oz * totalDisplacement);
    }
    
    positions.needsUpdate = true;
    meshRef.current.geometry.computeVertexNormals();
    meshRef.current.rotation.y = time * 0.1 + bass * 0.2; 
    meshRef.current.rotation.x = time * 0.06;
  });

  return (
    <>
      {!settings.albumArtBackground && <color attach="background" args={['#020205']} />}
      <Suspense fallback={null}>
        <group ref={starsRef}>
          <Stars radius={100} depth={50} count={3000} factor={4} saturation={0} fade speed={1} />
        </group>
      </Suspense>
      
      <ambientLight intensity={0.5} />
      <pointLight ref={light1Ref} position={[20, 20, 20]} intensity={15} distance={100} />
      <pointLight ref={light2Ref} position={[-20, -20, 10]} intensity={10} distance={100} />
      <pointLight ref={light3Ref} position={[0, 0, -25]} intensity={5} distance={80} />
      <rectAreaLight ref={rectLightRef} width={10} height={10} intensity={2} color={c1} position={[10, 10, -20]} />
      
      <mesh ref={meshRef}>
         <primitive object={geometry} attach="geometry" />
         <meshPhysicalMaterial 
            ref={materialRef}
            dithering={true}
            metalness={0.9}
            roughness={0.05}
            clearcoat={1.0}
            clearcoatRoughness={0.05}
            reflectivity={1.0}
            envMapIntensity={0.5}
            ior={2.4}
            side={DoubleSide}
            flatShading={settings.quality === 'low'}
         />
      </mesh>
    </>
  );
};