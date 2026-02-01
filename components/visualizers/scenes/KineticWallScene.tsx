/**
 * File: components/visualizers/scenes/KineticWallScene.tsx
 * Version: 1.8.46
 * Author: Sut
 */

import React, { useRef, useMemo, useLayoutEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
// @fix: Removed Shader from import as it's not exported from 'three' in some environments. A local type definition for Shader is now used.
import { InstancedMesh, MeshStandardMaterial, DataTexture, RedFormat, UnsignedByteType, LinearFilter, InstancedBufferAttribute, Color, Object3D } from 'three';
import { VisualizerSettings } from '../../../core/types';
import { useAudioReactive } from '../../../core/hooks/useAudioReactive';

interface SceneProps { analyser: AnalyserNode; colors: string[]; settings: VisualizerSettings; }

// @fix: Local type definition for the shader object used in onBeforeCompile to avoid import issues.
type Shader = {
  uniforms: { [key: string]: any };
  vertexShader: string;
  fragmentShader: string;
};

export const KineticWallScene: React.FC<SceneProps> = ({ analyser, colors, settings }) => {
  const meshRef = useRef<InstancedMesh>(null);
  const materialRef = useRef<MeshStandardMaterial>(null);
  const { features, smoothedColors } = useAudioReactive({ analyser, colors, settings });
  const [c0, c1] = smoothedColors;
  
  const { count, cols, rows, aLayoutData, gridRadius } = useMemo(() => {
    const aspect = window.innerWidth / window.innerHeight, base = settings.quality === 'high' ? 22 : 15;
    const c = Math.ceil(base * Math.max(aspect, 1.0) * 1.5), r = Math.ceil(base / Math.min(aspect, 1.0));
    const total = c * r, rad = Math.sqrt(Math.pow(c/2,2)+Math.pow(r/2,2)), data = new Float32Array(total*2);
    for (let i = 0; i < total; i++) { const row = Math.floor(i/c), col = i%c, cx = col-c/2, cy = row-r/2; data[i*2] = Math.sqrt(cx*cx+cy*cy); data[i*2+1] = Math.random(); }
    return { count: total, cols: c, rows: r, aLayoutData: data, gridRadius: rad };
  }, [settings.quality]);

  const geometry = useMemo(() => new RoundedBoxGeometry(3.68, 3.68, 4.0, 3, 0.4), []);
  useLayoutEffect(() => { if (geometry) geometry.setAttribute('aLayout', new InstancedBufferAttribute(aLayoutData, 2)); }, [geometry, aLayoutData]);
  
  const dataArray = useMemo(() => new Uint8Array(analyser.frequencyBinCount), [analyser]);
  const audioTexture = useMemo(() => { const tex = new DataTexture(dataArray, dataArray.length, 1, RedFormat, UnsignedByteType); tex.magFilter = LinearFilter; return tex; }, [dataArray.length]);
  const uniforms = useMemo(() => ({ uAudioTexture: { value: audioTexture }, uTime: { value: 0 }, uColor1: { value: new Color() }, uColor2: { value: new Color() }, uBeat: { value: 0.0 }, uSensitivity: { value: 1.0 }, uGridRadius: { value: gridRadius } }), [audioTexture, gridRadius]);
  
  const onBeforeCompile = useMemo(() => (shader: Shader) => {
    Object.assign(shader.uniforms, uniforms);
    shader.vertexShader = `
      attribute vec2 aLayout;
      varying float vFluxHeight;
      varying float vFluxHeat;
      varying vec3 vFluxViewDir;
      uniform sampler2D uAudioTexture;
      uniform float uTime;
      uniform float uBeat;
      uniform float uSensitivity;
      uniform float uGridRadius;
      ${shader.vertexShader}
    `.replace('#include <begin_vertex>', `
      #include <begin_vertex>
      float flux_freqIdx = clamp(aLayout.x / uGridRadius, 0.0, 0.85);
      float flux_rawAudio = texture2D(uAudioTexture, vec2(flux_freqIdx, 0.5)).r;
      float flux_ext = (flux_rawAudio * 5.0 * uSensitivity) + (sin(aLayout.x * 0.35 - uTime * 5.0) * 0.5 + 0.5) * uBeat * 6.0 + sin(uTime * 0.5 + aLayout.y * 6.28) * 0.5;
      transformed.z += flux_ext;
      vFluxHeight = clamp(flux_ext / 8.0, 0.0, 1.0);
      vFluxHeat = flux_rawAudio;
      vFluxViewDir = (modelViewMatrix * vec4(transformed, 1.0)).xyz;
    `);
    shader.fragmentShader = `
      uniform vec3 uColor1;
      uniform vec3 uColor2;
      uniform float uBeat;
      varying float vFluxHeight;
      varying float vFluxHeat;
      varying vec3 vFluxViewDir;
      ${shader.fragmentShader}
    `.replace('#include <color_fragment>', `
      #include <color_fragment>
      vec3 fNorm = normalize(vNormal);
      float fres = pow(1.0-clamp(dot(fNorm,normalize(-vFluxViewDir)),0.0,1.0),3.5);
      diffuseColor.rgb = (mix(uColor1,uColor2,vFluxHeat) * mix(0.2,1.0,vFluxHeight) * mix(0.6,1.0,pow(clamp(dot(fNorm,vec3(0,0,1)),0.0,1.0),2.0))) + (mix(mix(uColor1,uColor2,vFluxHeat),vec3(1.0),0.5) * fres * (2.0+uBeat*6.0+vFluxHeat*5.0) * 0.4);
    `).replace('#include <emissivemap_fragment>', `
      #include <emissivemap_fragment>
      totalEmissiveRadiance = diffuseColor.rgb * (vFluxHeat * 1.5 + uBeat * 2.0) * pow(vFluxHeight, 2.0);
    `);
  }, [uniforms]);

  const beatRef = useRef(0), dummy = useMemo(() => new Object3D(), []);
  useFrame((state) => {
    const time = state.clock.getElapsedTime(); analyser.getByteFrequencyData(dataArray); audioTexture.needsUpdate = true;
    if (features.isBeat) beatRef.current = 1.0; beatRef.current *= 0.92; 
    uniforms.uTime.value = time; uniforms.uBeat.value = beatRef.current; uniforms.uSensitivity.value = settings.sensitivity; uniforms.uColor1.value.set(c1); uniforms.uColor2.value.set(c0);
    if (meshRef.current) { const sp = 3.80; for (let i = 0; i < count; i++) { const r = Math.floor(i/cols), c = i%cols; dummy.position.set((c+(r%2)*0.5-cols/2)*sp, (r-rows/2)*sp, 0); dummy.updateMatrix(); meshRef.current.setMatrixAt(i, dummy.matrix); } meshRef.current.instanceMatrix.needsUpdate = true; }
    const gW = (cols*3.8)/2, mX = gW*0.35, camX = Math.sin(time*0.2)*mX, camY = Math.cos(time*0.15)*4.0, camZ = 48-(features.bass*16);
    state.camera.position.x += (camX-state.camera.position.x)*0.04; state.camera.position.y += (camY-state.camera.position.y)*0.04; state.camera.position.z += (camZ-state.camera.position.z)*0.04; state.camera.lookAt(0,0,0);
  });

  return (<>{!settings.albumArtBackground && <color attach="background" args={['#010103']} />}<ambientLight intensity={0.2} /><directionalLight position={[15,15,25]} intensity={1.8} color={c0} /><pointLight position={[50,50,60]} intensity={45} color={c0} /><pointLight position={[-50,-50,30]} intensity={30} color={c1} /><instancedMesh ref={meshRef} args={[geometry, undefined, count]}><meshStandardMaterial ref={materialRef} onBeforeCompile={onBeforeCompile} metalness={0.95} roughness={0.08} envMapIntensity={1.5}/></instancedMesh></>);
};
