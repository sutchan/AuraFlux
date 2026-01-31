
/**
 * File: components/visualizers/scenes/OceanWaveScene.tsx
 * Version: 3.3.1
 * Author: Sut
 * Copyright (c) 2025 Aura Vision. All rights reserved.
 * Description: "Joy Division" Style Pulsar Terrain.
 * Implementation: Instanced Vertical Ribbons forming a waterfall plot.
 * - History Buffer: Maintains audio history for the scrolling effect.
 * - Occlusion: Ribbons are opaque black bodies with glowing top edges.
 * - Refined v3.3: Ultra-thin hair-lines (0.15%), High-res geometry, and kernel smoothing.
 */

import React, { useRef, useMemo, useLayoutEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { InstancedMesh, Color, DataTexture, RedFormat, UnsignedByteType, LinearFilter, DoubleSide, Object3D, ShaderMaterial, NearestFilter } from 'three';
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
  
  const { smoothedColors, isBeat } = useAudioReactive({ analyser, colors, settings });
  const [c0, c1, c2] = smoothedColors;

  // --- Configuration ---
  // Increased resolution for smoother curves (High: 384 segments)
  const NUM_LINES = settings.quality === 'high' ? 64 : (settings.quality === 'med' ? 48 : 32);
  const SEGMENTS_X = settings.quality === 'high' ? 384 : (settings.quality === 'med' ? 192 : 128);
  
  // Geometry sizing
  const LINE_WIDTH = 180;
  const LINE_HEIGHT = 20; // Tall enough to occlude lines behind
  const Z_SPACING = 3.5;
  
  // --- Audio History Buffer ---
  const bins = analyser.frequencyBinCount; 
  const texWidth = bins; 
  const texHeight = NUM_LINES;
  
  // Persistent buffer for history (Waterfall)
  // Layout: Row 0 = Newest, Row N = Oldest
  const historyData = useMemo(() => new Uint8Array(texWidth * texHeight), [texWidth, texHeight]);
  
  const audioTexture = useMemo(() => {
    const tex = new DataTexture(historyData, texWidth, texHeight, RedFormat, UnsignedByteType);
    tex.magFilter = LinearFilter;
    tex.minFilter = NearestFilter; // Keep rows distinct
    return tex;
  }, [historyData, texWidth, texHeight]);

  const dummy = useMemo(() => new Object3D(), []);
  
  // --- Instance Attributes ---
  const instanceAttribs = useMemo(() => {
      const indices = new Float32Array(NUM_LINES);
      for(let i=0; i<NUM_LINES; i++) {
          indices[i] = i / (NUM_LINES - 1); // Normalized 0..1
      }
      return indices;
  }, [NUM_LINES]);

  useLayoutEffect(() => {
      if (meshRef.current) {
          for (let i = 0; i < NUM_LINES; i++) {
              // Z goes backwards
              const z = -i * Z_SPACING;
              const y = i * 0.8; // Slight rise towards back for visibility
              
              dummy.position.set(0, y - 15, z);
              dummy.rotation.set(0, 0, 0); // Facing straight
              dummy.scale.set(1, 1, 1);
              dummy.updateMatrix();
              meshRef.current.setMatrixAt(i, dummy.matrix);
          }
          meshRef.current.instanceMatrix.needsUpdate = true;
      }
  }, [NUM_LINES, Z_SPACING, dummy]);

  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uAudioHistory: { value: audioTexture },
    uColorRidge: { value: new Color(0xffffff) },
    uColorBody: { value: new Color(0x000000) },
    uSensitivity: { value: 1.0 },
    uBeat: { value: 0.0 },
  }), [audioTexture]);

  // Temp buffers for frame audio
  const tempL = useMemo(() => new Uint8Array(bins), [bins]);
  const tempR = useMemo(() => new Uint8Array(bins), [bins]);

  useFrame((state) => {
    // 1. Shift History Buffer
    historyData.copyWithin(texWidth, 0, historyData.length - texWidth);

    // 2. Fetch New Data
    analyser.getByteFrequencyData(tempL);
    if (analyserR) {
        analyserR.getByteFrequencyData(tempR);
    } else {
        tempR.set(tempL); // Mono fallback
    }

    // 3. Fill Row 0 (Newest) - Center-Out Stereo Mapping with Smoothing
    const limit = Math.floor(bins * 0.6); // Use 60% of spectrum
    
    // Smoothing helper (kernel: 0.25, 0.5, 0.25) to round off sharp peaks
    const getSmooth = (arr: Uint8Array, idx: number) => {
        const i = Math.min(Math.max(0, idx), arr.length - 1);
        const prev = i > 0 ? arr[i-1] : arr[i];
        const next = i < arr.length - 1 ? arr[i+1] : arr[i];
        return (prev + arr[i] * 2 + next) / 4;
    };

    for (let x = 0; x < texWidth; x++) {
        // Normalized x (-1 to 1)
        const nx = (x / texWidth) * 2 - 1; 
        const dist = Math.abs(nx);
        
        // Map dist (0..1) to Frequency Bin (0..limit)
        const bin = Math.floor(dist * limit);
        
        let val = 0;
        if (nx < 0) { // Left Side
            val = getSmooth(tempL, bin);
        } else { // Right Side
            val = getSmooth(tempR, bin);
        }
        
        historyData[x] = val;
    }

    // 4. Update Texture
    audioTexture.needsUpdate = true;

    // 5. Update Uniforms
    if (meshRef.current) {
        const mat = meshRef.current.material as ShaderMaterial;
        mat.uniforms.uTime.value = state.clock.getElapsedTime();
        mat.uniforms.uSensitivity.value = settings.sensitivity;
        mat.uniforms.uBeat.value += ((isBeat ? 1.0 : 0.0) - mat.uniforms.uBeat.value) * 0.1;
        
        if (c2) mat.uniforms.uColorRidge.value.copy(c2); 
        else if (c0) mat.uniforms.uColorRidge.value.copy(c0);
        
        mat.uniforms.uColorBody.value.set('#000000');
    }
    
    state.camera.position.x = Math.sin(state.clock.getElapsedTime() * 0.1) * 10;
    state.camera.lookAt(0, -5, -60); 
  });

  return (
    <>
      {!settings.albumArtBackground && <color attach="background" args={['#000000']} />}
      
      <instancedMesh ref={meshRef} args={[undefined, undefined, NUM_LINES]} position={[0, 0, 0]}>
        <planeGeometry args={[LINE_WIDTH, LINE_HEIGHT, SEGMENTS_X, 1]}>
            <instancedBufferAttribute attach="attributes-aLineProgress" args={[instanceAttribs, 1]} />
        </planeGeometry>
        <shaderMaterial
          side={DoubleSide}
          uniforms={uniforms}
          transparent={false} // OPAQUE for Depth Buffer Occlusion
          vertexShader={`
            attribute float aLineProgress; // 0 (Front) to 1 (Back)
            
            varying vec2 vUv;
            varying float vElevation;
            varying float vLineIndex;

            uniform sampler2D uAudioHistory;
            uniform float uSensitivity;
            uniform float uTime;
            uniform float uBeat;

            void main() {
              vUv = uv;
              vLineIndex = aLineProgress;
              
              vec3 pos = position;
              
              float vCoord = aLineProgress; 
              // Linear interpolation in texture lookup handles additional sub-pixel smoothing
              float audioVal = texture2D(uAudioHistory, vec2(uv.x, vCoord)).r;
              
              // Displacement Logic
              float xFade = 1.0 - pow(abs(uv.x - 0.5) * 2.0, 4.0);
              
              // Apply Sensitivity (Lowered amplitude for smoother look)
              float elevation = audioVal * 12.0 * uSensitivity * xFade;
              
              // Beat Impulse (Reduced sharpness)
              float beatPulse = uBeat * sin(uv.x * 5.0 + uTime * 5.0) * 1.5 * xFade;
              
              float finalH = elevation + beatPulse;
              
              if (uv.y > 0.5) {
                  pos.y += finalH;
              }
              
              // Idle noise (gentle wave)
              if (uv.y > 0.5) {
                  pos.y += sin(pos.x * 0.1 + uTime + aLineProgress * 5.0) * 1.0;
              }

              vElevation = finalH;

              vec4 mvPosition = modelViewMatrix * instanceMatrix * vec4(pos, 1.0);
              gl_Position = projectionMatrix * mvPosition;
            }
          `}
          fragmentShader={`
            uniform vec3 uColorRidge;
            uniform vec3 uColorBody;
            
            varying vec2 vUv;
            varying float vElevation;
            varying float vLineIndex;

            void main() {
              // --- Refined Line Rendering ---
              // Reduced thickness to ~0.15% (was 0.5%) for ultra-thin hair-line effect
              float lineThickness = 0.0015; 
              
              // Tight, high-quality anti-aliasing
              float edgeSoftness = 0.001;
              float isLine = smoothstep(1.0 - lineThickness - edgeSoftness, 1.0 - lineThickness, vUv.y);
              
              // Color Logic
              vec3 ridgeCol = uColorRidge;
              
              // Boost brightness based on height
              ridgeCol += vec3(0.5) * smoothstep(2.0, 15.0, vElevation);
              
              // Fade distant lines
              float distFade = 1.0 - vLineIndex; 
              ridgeCol *= (0.4 + distFade * 0.6);
              
              // Body color (occlusion) is black
              vec3 finalColor = mix(uColorBody, ridgeCol, isLine);
              
              gl_FragColor = vec4(finalColor, 1.0);
            }
          `}
        />
      </instancedMesh>
    </>
  );
};
