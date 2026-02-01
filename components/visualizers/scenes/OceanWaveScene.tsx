/**
 * File: components/visualizers/scenes/OceanWaveScene.tsx
 * Version: 1.8.45
 * Author: Sut
 * Description: "Joy Division" Style Pulsar Terrain with scrolling history.
 */

import React, { useRef, useMemo, useLayoutEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { InstancedMesh, Color, DataTexture, RedFormat, UnsignedByteType, LinearFilter, DoubleSide, Object3D, ShaderMaterial, NearestFilter, InstancedBufferAttribute } from 'three';
import { VisualizerSettings } from '../../../core/types';
import { useAudioReactive } from '../../../core/hooks/useAudioReactive';

interface SceneProps {
  analyser: AnalyserNode;
  analyserR?: AnalyserNode | null;
  colors: string[];
  settings: VisualizerSettings;
}

export const OceanWaveScene: React.FC<SceneProps> = ({ analyser, analyserR, colors, settings }) => {
  const meshRef = useRef<InstancedMesh>(null);
  const frameCounterRef = useRef(0);
  
  // @fix: Destructure features object correctly from useAudioReactive
  const { features, smoothedColors } = useAudioReactive({ analyser, colors, settings });
  const { isBeat } = features;
  const [c0, , c2] = smoothedColors;

  const NUM_LINES = settings.quality === 'high' ? 64 : (settings.quality === 'med' ? 48 : 32);
  const SEGMENTS_X = settings.quality === 'high' ? 384 : (settings.quality === 'med' ? 192 : 128);
  
  const LINE_WIDTH = 180;
  const LINE_HEIGHT = 25; 
  const Z_SPACING = 3.2;
  
  const bins = settings.fftSize / 2; 
  const historyData = useMemo(() => new Uint8Array(bins * NUM_LINES), [bins, NUM_LINES]);
  
  const audioTexture = useMemo(() => {
    const tex = new DataTexture(historyData, bins, NUM_LINES, RedFormat, UnsignedByteType);
    tex.magFilter = LinearFilter;
    tex.minFilter = NearestFilter;
    return tex;
  }, [historyData, bins, NUM_LINES]);

  const dummy = useMemo(() => new Object3D(), []);
  
  const lineProgressAttr = useMemo(() => {
    const arr = new Float32Array(NUM_LINES);
    for (let i = 0; i < NUM_LINES; i++) arr[i] = i / Math.max(1, NUM_LINES - 1);
    return new InstancedBufferAttribute(arr, 1);
  }, [NUM_LINES]);

  useLayoutEffect(() => {
      if (meshRef.current) {
          for (let i = 0; i < NUM_LINES; i++) {
              dummy.position.set(0, i * 0.75 - 12, -i * Z_SPACING);
              dummy.updateMatrix();
              meshRef.current.setMatrixAt(i, dummy.matrix);
          }
          meshRef.current.instanceMatrix.needsUpdate = true;
          meshRef.current.geometry.setAttribute('aLineProgress', lineProgressAttr);
      }
  }, [NUM_LINES, Z_SPACING, dummy, lineProgressAttr]);

  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uAudioHistory: { value: audioTexture },
    uColorRidge: { value: new Color(0xffffff) },
    uColorBody: { value: new Color(0x000000) },
    uSensitivity: { value: 1.0 },
    uBeat: { value: 0.0 },
  }), [audioTexture]);

  const tempL = useMemo(() => new Uint8Array(bins), [bins]);
  const tempR = useMemo(() => new Uint8Array(bins), [bins]);

  useFrame((state) => {
    if (historyData.length < bins) return;

    frameCounterRef.current++;
    if (frameCounterRef.current >= 2) {
        frameCounterRef.current = 0;
        historyData.copyWithin(bins, 0, historyData.length - bins);

        try {
            analyser.getByteFrequencyData(tempL);
            if (analyserR) analyserR.getByteFrequencyData(tempR);
            else tempR.set(tempL);
        } catch (e) { return; }

        const limit = Math.floor(bins * 0.7); 
        for (let x = 0; x < bins; x++) {
            const nx = (x / bins) * 2 - 1; 
            const bin = Math.floor(Math.abs(nx) * limit);
            historyData[x] = (nx < 0) ? tempL[bin] : tempR[bin];
        }
        audioTexture.needsUpdate = true;
    }

    if (meshRef.current) {
        const mat = meshRef.current.material as ShaderMaterial;
        mat.uniforms.uTime.value = state.clock.getElapsedTime();
        mat.uniforms.uSensitivity.value = settings.sensitivity;
        mat.uniforms.uBeat.value += ((isBeat ? 1.0 : 0.0) - mat.uniforms.uBeat.value) * 0.15;
        if (c2) mat.uniforms.uColorRidge.value.copy(c2); 
        else if (c0) mat.uniforms.uColorRidge.value.copy(c0);
    }
    
    const time = state.clock.getElapsedTime();
    state.camera.position.x = Math.sin(time * 0.1) * 12;
    state.camera.position.y = 22 + Math.cos(time * 0.08) * 4;
    state.camera.lookAt(0, -8, -70); 
  });

  return (
    <>{!settings.albumArtBackground && <color attach="background" args={['#000000']} />}
      <instancedMesh ref={meshRef} args={[undefined, undefined, NUM_LINES]}>
        <planeGeometry args={[LINE_WIDTH, LINE_HEIGHT, SEGMENTS_X, 1]} />
        <shaderMaterial
          side={DoubleSide}
          uniforms={uniforms}
          transparent={true}
          vertexShader={`
            attribute float aLineProgress;
            varying vec2 vUv;
            varying float vElevation;
            varying float vLineProgress;
            varying float vSideFade;
            uniform sampler2D uAudioHistory;
            uniform float uSensitivity;
            uniform float uTime;
            uniform float uBeat;
            void main() {
              vUv = uv; 
              vLineProgress = aLineProgress;
              
              // v1.8.44: Calculate smooth horizontal fade and envelope
              float xDist = abs(uv.x - 0.5) * 2.0;
              float xFade = 1.0 - pow(xDist, 2.5); // Rounder profile than 3.5
              vSideFade = smoothstep(1.0, 0.75, xDist); // Gradually fade alpha at ends
              
              vec3 pos = position;
              float audioVal = texture2D(uAudioHistory, vec2(uv.x, aLineProgress)).r;
              
              // Apply smoother elevation scaling
              float elevation = audioVal * 4.2 * uSensitivity * xFade;
              float beatReaction = uBeat * sin(uv.x * 4.0 + uTime * 4.0) * 1.5 * (1.0 - aLineProgress) * xFade;
              float totalDisp = elevation + beatReaction;
              
              if (uv.y > 0.5) pos.y += totalDisp;
              vElevation = totalDisp;
              
              gl_Position = projectionMatrix * modelViewMatrix * instanceMatrix * vec4(pos, 1.0);
            }
          `}
          fragmentShader={`
            uniform vec3 uColorRidge;
            uniform vec3 uColorBody;
            varying vec2 vUv;
            varying float vElevation;
            varying float vLineProgress;
            varying float vSideFade;
            void main() {
              // v1.8.44: Smooth line rendering with transparency at edges
              float thickness = mix(0.012, 0.003, vLineProgress);
              
              // Use smoothstep for the line mask to reduce aliasing/sharpness
              float isLine = smoothstep(1.0 - thickness, 1.0 - thickness + 0.005, vUv.y);
              
              vec3 ridgeCol = uColorRidge + vec3(0.4) * smoothstep(2.0, 15.0, vElevation);
              ridgeCol *= (0.25 + pow(1.0 - vLineProgress, 1.3) * 0.75);
              
              // Mix colors based on line mask and side fade
              vec3 finalRgb = mix(uColorBody, ridgeCol, isLine);
              float finalAlpha = mix(1.0, vSideFade, isLine);
              
              // If not part of the line, it's the black body (occlusion)
              if (isLine < 0.1) {
                  gl_FragColor = vec4(uColorBody, 1.0);
              } else {
                  gl_FragColor = vec4(finalRgb, finalAlpha);
              }
            }
          `}
        />
      </instancedMesh>
    </>
  );
};