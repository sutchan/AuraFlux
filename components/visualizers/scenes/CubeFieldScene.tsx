/**
 * File: components/visualizers/scenes/CubeFieldScene.tsx
 * Version: 1.8.24
 * Author: Sut
 * Copyright (c) 2024 Aura Flux. All rights reserved.
 */

import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { InstancedMesh, PointLight, Color, Vector3, Euler, Object3D, MeshStandardMaterial } from 'three';
import { VisualizerSettings } from '../../../core/types';
import { useAudioReactive } from '../../../core/hooks/useAudioReactive';

interface SceneProps {
  analyser: AnalyserNode;
  colors: string[];
  settings: VisualizerSettings;
}

export const CubeFieldScene: React.FC<SceneProps> = ({ analyser, colors, settings }) => {
  const meshRef = useRef<InstancedMesh>(null);
  const coreLightRef = useRef<PointLight>(null);
  
  // @fix: Destructure features object correctly from useAudioReactive
  const { features, smoothedColors } = useAudioReactive({ analyser, colors, settings });
  const { bass, mids, treble, volume, isBeat } = features;
  const [c0, c1, c2] = smoothedColors;
  
  const count = settings.quality === 'high' ? 1200 : settings.quality === 'med' ? 800 : 400;
  const dummy = useMemo(() => new Object3D(), []);
  const dataArray = useMemo(() => new Uint8Array(analyser.frequencyBinCount), [analyser]);

  const particles = useMemo(() => {
    const temp = [];
    for (let i = 0; i < count; i++) {
        const x = (Math.random()-0.5)*300, y = (Math.random()-0.5)*200, z = (Math.random()-0.5)*450;
        const isStructure = Math.random() > 0.95;
        const scaleBase = isStructure ? (1.5 + Math.random()*3.0) : (0.1 + Math.random()*0.4);
        const rotAxis = new Vector3(Math.random()-0.5, Math.random()-0.5, Math.random()-0.5).normalize();
        const initialRotation = new Euler(Math.random()*Math.PI, Math.random()*Math.PI, Math.random()*Math.PI);
        temp.push({ x, y, z, scale: scaleBase, currentScale: scaleBase, isStructure, speedOffset: isStructure ? 0.3 + Math.random()*0.9 : 1.5 + Math.random()*2.5, rotationAxis: rotAxis, initialRotation, rotationSpeed: (Math.random()-0.5)*(isStructure ? 0.0005 : 0.004), speedMult: isStructure ? 0.2 + Math.random()*1.8 : 0.66 + Math.random()*0.67, torque: 0, phase: Math.random()*Math.PI*2, driftX: (Math.random()-0.5)*(isStructure?0.05:0.2), driftY: (Math.random()-0.5)*(isStructure?0.05:0.2), spectralAffinity: Math.pow(Math.random(), 1.5), tumbleRate: 0.5 + Math.random()*2.0, tumblePhase: Math.random()*Math.PI*2 });
    }
    return temp;
  }, [count]);

  const initialSetupRef = useRef(false);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    analyser.getByteFrequencyData(dataArray);
    const globalSpeed = settings.speed * 4.5 * (1.0 + volume * 2.0 + (isBeat ? 2.5 : 0));
    const centerX = Math.sin(time*0.2)*35, centerY = Math.cos(time*0.7)*25;
    state.camera.position.x += (Math.sin(time*0.1)*5 - state.camera.position.x) * 0.05;
    state.camera.lookAt(centerX*0.1, centerY*0.1, -100);
    if (coreLightRef.current) { coreLightRef.current.position.set(centerX, centerY, -80); coreLightRef.current.color.set(c1); coreLightRef.current.intensity = 15+bass*35+(isBeat?50:0); }
    if (meshRef.current) {
        const mat = meshRef.current.material as MeshStandardMaterial; mat.color.set(c0); mat.emissive.set(c1); mat.emissiveIntensity = 0.4 + treble*4.0 + (isBeat?3.5:0);
        const rotationBoost = 1.0 + mids*2.0 + treble*2.5;
        const binLimit = Math.floor(dataArray.length*0.6);
        particles.forEach((p, i) => {
            p.z += globalSpeed * p.speedOffset * 0.016; if (p.z > 60) { p.z -= 450; p.x = (Math.random()-0.5)*300; p.y = (Math.random()-0.5)*200; p.rotationAxis.set(Math.random()-0.5,Math.random()-0.5,Math.random()-0.5).normalize(); }
            p.x += p.driftX*settings.speed*0.15; p.y += p.driftY*settings.speed*0.15;
            if (p.x > 180) p.x -= 360; else if (p.x < -180) p.x += 360;
            if (p.y > 120) p.y -= 240; else if (p.y < -120) p.y += 240;
            const reaction = (dataArray[Math.floor(p.spectralAffinity*binLimit)]/255)*settings.sensitivity;
            const dF = Math.max(0, -p.z/350); dummy.position.set(p.x + centerX*Math.pow(dF, 1.2), p.y + centerY*Math.pow(dF, 1.2), p.z);
            if (isBeat) p.torque += (Math.random()*0.015+0.005)*settings.sensitivity; p.torque *= 0.94;
            p.rotationAxis.x += Math.sin(time*0.3+p.tumblePhase)*0.01; p.rotationAxis.y += Math.cos(time*0.2+p.tumblePhase)*0.01; p.rotationAxis.normalize();
            if (!initialSetupRef.current) dummy.rotation.copy(p.initialRotation);
            dummy.rotateOnAxis(p.rotationAxis, (p.rotationSpeed+p.torque)*rotationBoost*p.speedMult*(1.0+0.5*Math.sin(time*p.tumbleRate+p.tumblePhase))*(1.0+reaction*4.0)*0.1);
            const targetS = p.scale*(1.0+reaction*1.8); p.currentScale += (targetS - p.currentScale)*(targetS > p.currentScale ? 0.3 : 0.1);
            dummy.scale.set(p.currentScale, p.currentScale, p.currentScale); dummy.updateMatrix(); meshRef.current!.setMatrixAt(i, dummy.matrix);
        });
        initialSetupRef.current = true; meshRef.current.instanceMatrix.needsUpdate = true;
    }
  });

  return (
    <>
      {!settings.albumArtBackground && <color attach="background" args={['#000000']} />}
      {!settings.albumArtBackground && <fog attach="fog" args={['#000000', 30, 220]} />} 
      <ambientLight intensity={0.2} />
      <pointLight ref={coreLightRef} distance={350} decay={2.0} />
      <pointLight position={[0, 0, 20]} intensity={3} color={c2} distance={150} />
      <directionalLight position={[40, 40, 20]} intensity={1.2} color={c0} />
      <instancedMesh ref={meshRef} args={[undefined, undefined, count]}><boxGeometry args={[1, 1, 1]} /><meshStandardMaterial roughness={0.1} metalness={0.95}/></instancedMesh>
    </>
  );
};