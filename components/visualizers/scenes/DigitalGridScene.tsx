/**
 * File: components/visualizers/scenes/DigitalGridScene.tsx
 * Version: 1.8.28
 * Author: Sut
 * Updated: 2025-03-25 15:58 - Fixed audio feature destructuring.
 */

import React, { useRef, useMemo, useLayoutEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { InstancedMesh, Object3D, Color, InstancedBufferAttribute, DataTexture, RedFormat, UnsignedByteType, LinearFilter, DoubleSide, Shader } from 'three';
import { MeshReflectorMaterial } from '@react-three/drei';
import { VisualizerSettings } from '../../../core/types';
import { useAudioReactive } from '../../../core/hooks/useAudioReactive';

export const DigitalGridScene: React.FC<{ analyser: AnalyserNode; colors: string[]; settings: VisualizerSettings; }> = ({ analyser, colors, settings }) => {
  const meshRef = useRef<InstancedMesh>(null), { size } = useThree();
  
  // @fix: Destructure features object correctly from useAudioReactive
  const { features, smoothedColors } = useAudioReactive({ analyser, colors, settings });
  const { isBeat } = features;
  const [c0, c1, c2] = smoothedColors;
  
  const grid = useMemo(() => {
      const isHigh = settings.quality !== 'low', radius = 45, colStep = (isHigh ? 2.4 : 3.6) + 0.25, vFov = (55 * Math.PI) / 180, dist = 66;
      const targetH = 2 * Math.tan(vFov / 2) * dist * 1.15, targetW = targetH * (size.width/size.height) * 1.2;
      let rows = Math.ceil(targetH / ((isHigh ? 0.6 : 0.9) + 0.12)), cols = Math.min(Math.ceil(targetW / colStep), Math.floor((Math.PI * 1.5 * radius) / colStep));
      if (rows % 2 === 0) rows++; if (cols % 2 === 0) cols++;
      return { RADIUS: radius, GAP_Y: 0.12, BRICK_W: isHigh ? 2.4 : 3.6, BRICK_H: isHigh ? 0.6 : 0.9, COLS: cols, ROWS: rows, COUNT: cols * rows, STEP: colStep / radius };
  }, [size.width, size.height, settings.quality]);

  const { lAttr, rAttr } = useMemo(() => {
      const l = new Float32Array(grid.COUNT * 3), r = new Float32Array(grid.COUNT);
      for(let i=0; i<grid.COUNT; i++) {
          const col = Math.floor(i / grid.ROWS), colNorm = (col / (grid.COLS - 1)) * 2 - 1;
          l[i*3] = Math.pow(Math.abs(colNorm), 1.5); l[i*3+1] = (i % grid.ROWS) / (grid.ROWS - 1); l[i*3+2] = 1.0 - Math.pow(Math.abs(colNorm), 5.0); r[i] = Math.random();
      }
      return { lAttr: new InstancedBufferAttribute(l, 3), rAttr: new InstancedBufferAttribute(r, 1) };
  }, [grid]);

  useLayoutEffect(() => {
    if (meshRef.current) {
      const dummy = new Object3D(), startA = -((grid.COLS - 1) * grid.STEP) / 2, startY = -( (grid.ROWS - 1) * (grid.BRICK_H + grid.GAP_Y)) / 2;
      for (let c = 0; c < grid.COLS; c++) {
        const theta = startA + c * grid.STEP;
        for (let r = 0; r < grid.ROWS; r++) {
          dummy.position.set(Math.sin(theta)*grid.RADIUS, startY + r*(grid.BRICK_H+grid.GAP_Y), grid.RADIUS-(Math.cos(theta)*grid.RADIUS));
          dummy.lookAt(0, dummy.position.y, grid.RADIUS); dummy.scale.set(grid.BRICK_W, grid.BRICK_H, 1.0); dummy.updateMatrix();
          meshRef.current.setMatrixAt(c*grid.ROWS+r, dummy.matrix);
        }
      }
      meshRef.current.instanceMatrix.needsUpdate = true; meshRef.current.geometry.setAttribute('aLayout', lAttr); meshRef.current.geometry.setAttribute('aRandom', rAttr);
    }
  }, [grid, lAttr, rAttr]);

  const data = useMemo(() => new Uint8Array(analyser.frequencyBinCount), [analyser]);
  const tex = useMemo(() => { const t = new DataTexture(data, data.length, 1, RedFormat, UnsignedByteType); t.magFilter = LinearFilter; return t; }, [data.length]);
  const uniforms = useMemo(() => ({ uAudioTexture: { value: tex }, uTime: { value: 0 }, uColor1: { value: new Color() }, uColor2: { value: new Color() }, uColor3: { value: new Color() }, uBeat: { value: 0.0 }, uSensitivity: { value: 1.0 } }), [tex]);
  
  const onCompile = useMemo(() => (s: Shader) => {
    Object.assign(s.uniforms, uniforms);
    // Add explicitly handled newlines to prevent merging with internal defines
    s.vertexShader = `
      attribute vec3 aLayout;
      attribute float aRandom;
      varying float vA, vR, vE, vRn;
      uniform sampler2D uAudioTexture;
      uniform float uTime, uBeat, uSensitivity;
      ${s.vertexShader}
    `.replace('#include <begin_vertex>', `
      #include <begin_vertex>
      vR = aLayout.y;
      vE = aLayout.z;
      vRn = aRandom;
      float i = texture2D(uAudioTexture, vec2(aLayout.x*0.9+0.02, 0.5)).r * uSensitivity * 0.5;
      vA = clamp(smoothstep(0.0, 0.3, i*1.1 - abs(aLayout.y-0.5)*2.0) + smoothstep(0.8, 1.0, sin(aLayout.y*10.0-uTime*8.0))*uBeat*0.5, 0.0, 1.0);
      transformed.z += vA * 2.5;
    `);
    
    s.fragmentShader = `
      uniform vec3 uColor1, uColor2, uColor3;
      uniform float uBeat, uTime;
      varying float vA, vR, vE, vRn;
      ${s.fragmentShader}
    `.replace('#include <color_fragment>', `
      #include <color_fragment>
      vec3 c = mix(mix(uColor1*0.2, uColor2, smoothstep(0.0,0.6,vA)), uColor3, smoothstep(0.4+vRn*0.3-0.15, 0.9, vA+vR*0.3)) * (0.2+vRn*vRn*2.0) * (smoothstep(-1.0,1.0,sin(uTime*6.0+vRn*15.0))*0.4+0.6) + uColor3*uBeat*0.5*vRn;
      diffuseColor.rgb = c;
      diffuseColor.a = smoothstep(0.0,0.15,vE) * smoothstep(0.01,0.15,vA);
    `).replace('#include <emissivemap_fragment>', `
      #include <emissivemap_fragment>
      totalEmissiveRadiance = diffuseColor.rgb * (0.5+vRn*vRn*2.4) * (0.5+vA*0.8);
    `);
  }, [uniforms]);

  const beatRef = useRef(0);
  useFrame((state) => {
    analyser.getByteFrequencyData(data); tex.needsUpdate = true; if (isBeat) beatRef.current = 1.0; beatRef.current *= 0.92;
    uniforms.uTime.value = state.clock.getElapsedTime(); uniforms.uBeat.value = beatRef.current; uniforms.uSensitivity.value = settings.sensitivity;
    if(c1) uniforms.uColor1.value.copy(c1); if(c0) uniforms.uColor2.value.copy(c0); if(c2) uniforms.uColor3.value.copy(c2);
    state.camera.position.x += (Math.sin(uniforms.uTime.value*0.15)*3 - state.camera.position.x)*0.05; state.camera.lookAt(0,0,-50);
  });

  return (
    <>
      {!settings.albumArtBackground && <color attach="background" args={['#000000']} />}
      <ambientLight intensity={0.1}/><instancedMesh ref={meshRef} args={[undefined, undefined, grid.COLS * grid.ROWS]} position={[0,0,-50]}><planeGeometry args={[1,1]}/><meshStandardMaterial onBeforeCompile={onCompile} roughness={0.2} metalness={0.9} side={DoubleSide} transparent depthWrite={false}/></instancedMesh>
      <mesh rotation={[-Math.PI/2,0,0]} position={[0,-30,-20]}><planeGeometry args={[200,200]}/><MeshReflectorMaterial blur={[400,100]} resolution={1024} mixBlur={1} mixStrength={10} roughness={0.7} depthScale={1} minDepthThreshold={0.4} maxDepthThreshold={1.4} color="#050505" metalness={0.8} mirror={0.5}/></mesh>
    </>
  );
};
