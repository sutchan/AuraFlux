/**
 * File: components/visualizers/scenes/KineticWallScene.tsx
 * Version: 2.1.1
 * Author: Aura Vision Team
 * Copyright (c) 2025 Aura Vision. All rights reserved.
 * Description: GPU-Accelerated Kinetic Wall. 
 * Animation logic moved to Vertex Shader via DataTexture for 60FPS at 8000+ instances.
 */

import React, { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { VisualizerSettings } from '../../../core/types';
import { useAudioReactive } from '../../../core/hooks/useAudioReactive';

interface SceneProps {
  analyser: AnalyserNode;
  colors: string[];
  settings: VisualizerSettings;
}

export const KineticWallScene: React.FC<SceneProps> = ({ analyser, colors, settings }) => {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const reflectionRef = useRef<THREE.InstancedMesh>(null);
  const materialRef = useRef<THREE.MeshStandardMaterial>(null);
  const beamGroupRef = useRef<THREE.Group>(null);
  
  // Lights
  const spotLightLeft = useRef<THREE.SpotLight>(null);
  const spotLightRight = useRef<THREE.SpotLight>(null);
  const spotLightCenter = useRef<THREE.SpotLight>(null);

  const { bass, mids, treble, isBeat, smoothedColors } = useAudioReactive({ analyser, colors, settings });
  const [c0, c1, c2] = smoothedColors;

  // --- Configuration ---
  // Drastically increased density due to GPU optimization
  const cols = settings.quality === 'high' ? 128 : settings.quality === 'med' ? 80 : 64;
  const rows = settings.quality === 'high' ? 64 : settings.quality === 'med' ? 40 : 32;
  const count = cols * rows;

  // --- GPU Audio Texture ---
  // We use a DataTexture to pass the entire frequency spectrum to the shader
  const fftSize = analyser.frequencyBinCount; // Usually 1024 or 2048
  const dataArray = useMemo(() => new Uint8Array(fftSize), [fftSize]);
  
  const audioTexture = useMemo(() => {
    const tex = new THREE.DataTexture(
      dataArray,
      fftSize,
      1,
      THREE.RedFormat,
      THREE.UnsignedByteType
    );
    tex.needsUpdate = true;
    return tex;
  }, [fftSize]);

  // --- Instance Attributes ---
  // Pre-calculate static data: Layout position (u,v) and Frequency Index
  const attributes = useMemo(() => {
    const layout = new Float32Array(count * 4); // x, y, u, v
    
    const radius = 90;
    const heightSpread = 80;
    const angleSpread = Math.PI * 0.8;

    for (let i = 0; i < count; i++) {
        const col = i % cols;
        const row = Math.floor(i / cols);
        
        const u = col / (cols - 1); // 0..1 horizontal
        const v = row / (rows - 1); // 0..1 vertical

        // Cylindrical Layout mapping
        const angle = (u - 0.5) * angleSpread;
        
        // Save normalized coordinates for shader to calculate position
        // We pack: [Angle, HeightPercent, FreqMap, Random]
        // x: Angle (-0.5 to 0.5 range approx)
        // y: Height (-0.5 to 0.5)
        // z: Frequency Lookup (0..1)
        // w: Random offset
        
        // Freq mapping: Low freqs in center, highs at edges
        const centerDist = Math.abs(u - 0.5) * 2.0; 
        const freqMap = centerDist * 0.5; // Map to lower half of spectrum (usually where music is)

        layout[i * 4 + 0] = angle;
        layout[i * 4 + 1] = v - 0.5;
        layout[i * 4 + 2] = freqMap;
        layout[i * 4 + 3] = Math.random();
    }
    return layout;
  }, [cols, rows]);

  // --- Shader Uniforms ---
  const uniforms = useMemo(() => ({
    uAudioTexture: { value: audioTexture },
    uTime: { value: 0 },
    uColor1: { value: new THREE.Color(0,0,0) },
    uColor2: { value: new THREE.Color(0,0,0) },
    uColor3: { value: new THREE.Color(0,0,0) },
    uSensitivity: { value: 1.0 },
    uBeat: { value: 0.0 },
    uRadius: { value: 90.0 },
    uHeight: { value: 80.0 }
  }), [audioTexture]);

  // --- Material Compilation ---
  const onBeforeCompile = useMemo(() => (shader: any) => {
    Object.assign(shader.uniforms, uniforms);
    
    // Vertex Shader Injection
    shader.vertexShader = `
      uniform sampler2D uAudioTexture;
      uniform float uTime;
      uniform float uSensitivity;
      uniform float uRadius;
      uniform float uHeight;
      uniform float uBeat;
      uniform vec3 uColor1;
      uniform vec3 uColor2;
      uniform vec3 uColor3; // Hot peak color
      
      attribute vec4 aLayout; // x: angle, y: heightPct, z: freqMap, w: random
      
      varying vec3 vInstanceColor;
      varying float vExtrusion;

      // Helper to rotate vector
      vec3 rotateY(vec3 v, float angle) {
        float c = cos(angle);
        float s = sin(angle);
        return vec3(v.x * c + v.z * s, v.y, -v.x * s + v.z * c);
      }

      ${shader.vertexShader}
    `;

    shader.vertexShader = shader.vertexShader.replace(
      '#include <begin_vertex>',
      `
      #include <begin_vertex>

      // 1. Retrieve Audio Data
      float freqIndex = aLayout.z;
      float rawAudio = texture2D(uAudioTexture, vec2(freqIndex, 0.0)).r; // 0..1
      
      // 2. Add organic wave motion
      float wave = sin(aLayout.x * 10.0 - uTime * 2.0) * cos(aLayout.y * 8.0 + uTime);
      float signal = rawAudio * (1.0 + wave * 0.2);
      
      // 3. Calculate Extrusion
      float extrusion = 0.5 + signal * 20.0 * uSensitivity;
      
      // Add Beat Punch
      if (uBeat > 0.01) {
         extrusion += uBeat * 5.0 * rawAudio;
      }

      vExtrusion = extrusion;

      // 4. Transform Position (Cylindrical Layout)
      // Base mesh is a 1x1x1 cube centered at 0.
      
      // Scale logic:
      // X/Y scale is static (block size)
      // Z scale is dynamic (extrusion)
      // We apply this scaling to the *local* vertex position before placing it in the world
      
      vec3 transformedPos = position;
      transformedPos.x *= 1.2; // Block width
      transformedPos.y *= 1.2; // Block height
      transformedPos.z *= extrusion; // Dynamic depth
      
      // Now position the block in the cylinder
      float angle = aLayout.x * 2.5; // Spread factor
      float yPos = aLayout.y * uHeight;
      
      // Base position on cylinder surface
      vec3 instancePos = vec3(0.0, yPos, -uRadius);
      
      // Rotate the position around Y axis
      vec3 finalPos = rotateY(instancePos, -angle);
      
      // Rotate the local vertex (block itself) to face center
      vec3 finalVertex = rotateY(transformedPos, -angle);
      
      // Combine
      transformed = finalPos + finalVertex;
      
      // 5. Calculate Color (Heatmap)
      float heat = smoothstep(0.1, 0.8, signal * uSensitivity);
      vec3 cBase = mix(uColor2, uColor1, heat); // Cold -> Hot
      
      // Add white-hot bloom tip
      float tip = smoothstep(0.8, 1.0, signal * uSensitivity);
      vInstanceColor = mix(cBase, uColor3, tip);
      
      // Fix normal for lighting
      // Ideally we should rotate normal too, but for box it's roughly ok or we use flat shading
      objectNormal = rotateY(objectNormal, -angle);
      `
    );

    // Fragment Shader Injection to use vertex color
    shader.fragmentShader = `
      varying vec3 vInstanceColor;
      ${shader.fragmentShader}
    `;
    
    shader.fragmentShader = shader.fragmentShader.replace(
      '#include <color_fragment>',
      `
      #include <color_fragment>
      // Override diffuse color with our calculated instance color
      diffuseColor.rgb = vInstanceColor;
      `
    );
  }, [uniforms]);

  // --- Rendering Loop ---
  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    analyser.getByteFrequencyData(dataArray);
    
    // Update Texture
    audioTexture.needsUpdate = true;
    
    // Update Uniforms
    uniforms.uTime.value = time * settings.speed;
    uniforms.uSensitivity.value = settings.sensitivity;
    uniforms.uColor1.value.set(c0);
    uniforms.uColor2.value.set(c1);
    uniforms.uColor3.value.set(isBeat ? '#ffffff' : c0); // Flash white on beat
    uniforms.uBeat.value = THREE.MathUtils.lerp(uniforms.uBeat.value, isBeat ? 1.0 : 0.0, 0.15);

    // Lights
    if (spotLightLeft.current && spotLightRight.current && spotLightCenter.current) {
        spotLightLeft.current.color.set(c0);
        spotLightRight.current.color.set(c1);
        spotLightCenter.current.color.set(c2);

        spotLightLeft.current.target.position.set(Math.sin(time) * 30, 0, -80);
        spotLightLeft.current.target.updateMatrixWorld();
        
        spotLightRight.current.target.position.set(Math.cos(time * 0.8) * 30, 0, -80);
        spotLightRight.current.target.updateMatrixWorld();

        const flash = isBeat ? 10 : 0;
        spotLightLeft.current.intensity = 100 + bass * 300 + flash * 20;
        spotLightRight.current.intensity = 100 + mids * 300 + flash * 20;
        spotLightCenter.current.intensity = 50 + treble * 500;
    }
    
    // Camera Shake
    const camShakeX = Math.sin(time * 0.2) * 5;
    const camShakeY = Math.cos(time * 0.15) * 3;
    state.camera.position.x += (camShakeX - state.camera.position.x) * 0.05;
    state.camera.position.y += (camShakeY - state.camera.position.y) * 0.05;
    state.camera.lookAt(0, 0, -70);
    
    // Volumetric Beams
    if (beamGroupRef.current) {
        beamGroupRef.current.rotation.x = Math.PI / 2 + Math.sin(time * 0.5) * 0.1;
        beamGroupRef.current.rotation.z = Math.sin(time * 0.2) * 0.1;
        beamGroupRef.current.children.forEach((child, i) => {
             const mat = (child as THREE.Mesh).material as THREE.MeshBasicMaterial;
             const beamFlash = isBeat ? 0.2 : 0.02;
             mat.opacity = THREE.MathUtils.lerp(mat.opacity, beamFlash * (1+bass), 0.2);
             mat.color.set(i % 2 === 0 ? c0 : c1);
        });
    }
  });

  const geometry = useMemo(() => new THREE.BoxGeometry(1, 1, 1), []);

  return (
    <>
      <color attach="background" args={['#000000']} />
      <fog attach="fog" args={['#000000', 30, 150]} />
      
      <spotLight ref={spotLightLeft} position={[40, 50, 40]} angle={0.3} penumbra={0.5} distance={200} decay={2} />
      <spotLight ref={spotLightRight} position={[-40, -50, 40]} angle={0.3} penumbra={0.5} distance={200} decay={2} />
      <spotLight ref={spotLightCenter} position={[0, 60, 10]} angle={0.5} penumbra={1} distance={150} decay={2} />
      <ambientLight intensity={0.1} />

      {/* Primary Wall */}
      <instancedMesh ref={meshRef} args={[geometry, undefined, count]} frustumCulled={false}>
        <instancedBufferAttribute attach="geometry-attributes-aLayout" args={[attributes, 4]} />
        <meshStandardMaterial 
            ref={materialRef}
            roughness={0.4} 
            metalness={0.8}
            onBeforeCompile={onBeforeCompile}
        />
      </instancedMesh>
      
      {/* Floor Reflection (Cheap Trick: Scaled Y -1) */}
      <instancedMesh 
        ref={reflectionRef} 
        args={[geometry, undefined, count]} 
        position={[0, -2, 0]} 
        scale={[1, -1, 1]}
        frustumCulled={false}
      >
        <instancedBufferAttribute attach="geometry-attributes-aLayout" args={[attributes, 4]} />
        <meshStandardMaterial 
            roughness={0.1} 
            metalness={0.9}
            transparent
            opacity={0.3}
            onBeforeCompile={onBeforeCompile}
        />
      </instancedMesh>
      
      {/* Volumetrics */}
      <group ref={beamGroupRef} position={[0, 0, -50]}>
         {[...Array(5)].map((_, i) => (
             <mesh key={i} rotation={[0, 0, (i / 5) * Math.PI * 2]} position={[0, 0, 0]}>
                 <coneGeometry args={[5 + i*2, 120, 32, 1, true]} />
                 <meshBasicMaterial color="#ffffff" transparent opacity={0.05} side={THREE.DoubleSide} blending={THREE.AdditiveBlending} depthWrite={false} />
             </mesh>
         ))}
      </group>
    </>
  );
};
