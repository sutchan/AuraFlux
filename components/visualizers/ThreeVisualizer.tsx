/**
 * File: components/visualizers/ThreeVisualizer.tsx
 * Version: 1.8.1
 * Author: Sut
 * Copyright (c) 2024 Aura Vision. All rights reserved.
 * Updated: 2025-02-25 18:00
 */

import React, { Suspense, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { EffectComposer, Bloom, Noise } from '@react-three/postprocessing';
import * as THREE from 'three';
import { VisualizerMode, VisualizerSettings } from '../../core/types';
import { 
    KineticWallScene, 
    LiquidSphereScene, 
    CubeFieldScene,
    NeuralFlowScene
} from './ThreeScenes';

interface ThreeVisualizerProps {
  analyser: AnalyserNode | null;
  colors: string[];
  settings: VisualizerSettings;
  mode: VisualizerMode; 
}

const ThreeVisualizer: React.FC<ThreeVisualizerProps> = ({ analyser, colors, settings, mode }) => {
  
  // Memoize Device Pixel Ratio calculation to prevent unnecessary re-renders
  const dpr = useMemo(() => {
    if (!settings) return 1;
    return settings.quality === 'low' ? 0.8 : settings.quality === 'med' ? 1.0 : Math.min(window.devicePixelRatio, 1.5);
  }, [settings?.quality]);

  // Memoize Bloom intensity based on the active mode for visual consistency
  const bloomIntensity = useMemo(() => {
      const base = 2.0;
      switch (mode) {
          case VisualizerMode.KINETIC_WALL: return base * 1.5; // High bloom for concert lights
          case VisualizerMode.LIQUID: return base * 1.5;
          case VisualizerMode.CUBE_FIELD: return base * 1.2;
          case VisualizerMode.NEURAL_FLOW: return base * 1.5;
          default: return base;
      }
  }, [mode]);

  // Memoize post-processing logic
  const postProcessingEffects = useMemo(() => {
      // Noise acts as dithering to prevent color banding on 8-bit monitors
      const ditheringNoise = <Noise opacity={0.025} premultiply />;

      if (!settings.glow) return (
        <EffectComposer multisampling={0}>
            {ditheringNoise}
        </EffectComposer>
      );

      // Removed ChromaticAberration and TiltShift to ensure a clean, sharp neon glow 
      // without "ghosting" or double-image artifacts on particles.
      return (
          <EffectComposer multisampling={0}>
              <Bloom 
                  luminanceThreshold={0.2} // Slightly higher threshold to reduce haze
                  luminanceSmoothing={0.9} 
                  intensity={bloomIntensity} 
                  mipmapBlur={true} 
                  radius={0.6} // Tighter radius for cleaner neon edges
              />
              {ditheringNoise}
          </EffectComposer>
      );
  }, [settings.glow, settings.quality, mode, bloomIntensity]);

  // Memoize the active scene component
  const activeScene = useMemo(() => {
    if (!analyser || !settings) return null;
    
    switch (mode) {
        case VisualizerMode.KINETIC_WALL:
            return <KineticWallScene analyser={analyser} colors={colors} settings={settings} />;
        case VisualizerMode.LIQUID:
            return <LiquidSphereScene analyser={analyser} colors={colors} settings={settings} />;
        case VisualizerMode.CUBE_FIELD:
            return <CubeFieldScene analyser={analyser} colors={colors} settings={settings} />;
        case VisualizerMode.NEURAL_FLOW:
            return <NeuralFlowScene analyser={analyser} colors={colors} settings={settings} />;
        default:
            return <NeuralFlowScene analyser={analyser} colors={colors} settings={settings} />;
    }
  }, [mode, analyser, colors, settings]);

  if (!analyser || !settings) return null;
  
  return (
    <div className="w-full h-full">
      <Canvas 
        key={settings.quality}
        camera={{ position: [0, 2, 16], fov: 55 }} 
        dpr={dpr} 
        gl={{ 
            antialias: false,
            alpha: false,
            stencil: false,
            depth: true,
            powerPreference: "high-performance"
        }}
        onCreated={({ gl }) => {
          gl.setClearColor('#000000');
          const handleContextLost = (event: Event) => { event.preventDefault(); };
          gl.domElement.addEventListener('webglcontextlost', handleContextLost, false);
        }}
      >
        <Suspense fallback={null}>
            {activeScene}
        </Suspense>
        
        {postProcessingEffects}
      </Canvas>
    </div>
  );
};

export default ThreeVisualizer;
