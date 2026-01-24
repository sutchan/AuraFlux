/**
 * File: components/visualizers/ThreeVisualizer.tsx
 * Version: 1.8.0
 * Author: Sut
 * Copyright (c) 2025 Aura Vision. All rights reserved.
 * Updated: 2025-02-28 10:00
 * Description: Integrated new WebGL scenes for robustness.
 */

import React, { Suspense, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { EffectComposer, Bloom, Noise } from '@react-three/postprocessing';
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
  
  // 1. Memoize Device Pixel Ratio
  const dpr = useMemo(() => {
    if (!settings) return 1;
    const quality = settings.quality;
    if (quality === 'low') return 0.8;
    if (quality === 'med') return 1.0;
    return Math.min(window.devicePixelRatio, 1.5);
  }, [settings?.quality]);

  // 2. Memoize Camera Configuration (Prevents R3F from resetting camera on every render)
  const cameraConfig = useMemo(() => ({ 
    position: [0, 2, 16] as [number, number, number], 
    fov: 55 
  }), []);

  // 3. Memoize WebGL Context Attributes
  const glConfig = useMemo(() => ({ 
    antialias: false,
    alpha: false,
    stencil: false,
    depth: true,
    powerPreference: "high-performance" as WebGLPowerPreference
  }), []);

  // 4. Memoize Bloom intensity based on the active mode
  const bloomIntensity = useMemo(() => {
      const base = 2.0;
      switch (mode) {
          case VisualizerMode.KINETIC_WALL: return base * 1.5;
          case VisualizerMode.LIQUID: return base * 1.5;
          case VisualizerMode.CUBE_FIELD: return base * 1.2;
          case VisualizerMode.NEURAL_FLOW: return base * 1.5;
          default: return base;
      }
  }, [mode]);

  // 5. Memoize Post-Processing Chain
  const postProcessingEffects = useMemo(() => {
      const ditheringNoise = <Noise opacity={0.025} premultiply />;

      if (!settings.glow) return (
        <EffectComposer multisampling={0}>
            {ditheringNoise}
        </EffectComposer>
      );

      return (
          <EffectComposer multisampling={0}>
              <Bloom 
                  luminanceThreshold={0.2} 
                  luminanceSmoothing={0.9} 
                  intensity={bloomIntensity} 
                  mipmapBlur={true} 
                  radius={0.6}
              />
              {ditheringNoise}
          </EffectComposer>
      );
  }, [settings.glow, bloomIntensity]);

  // 6. Memoize the Active Scene Logic (Expensive Computation)
  const activeScene = useMemo(() => {
    if (!analyser || !settings) return null;
    
    // Pass references to stable components
    const sceneProps = { analyser, colors, settings };

    switch (mode) {
        case VisualizerMode.KINETIC_WALL:
            return <KineticWallScene {...sceneProps} />;
        case VisualizerMode.LIQUID:
            return <LiquidSphereScene {...sceneProps} />;
        case VisualizerMode.CUBE_FIELD:
            return <CubeFieldScene {...sceneProps} />;
        case VisualizerMode.NEURAL_FLOW:
            return <NeuralFlowScene {...sceneProps} />;
        default:
            return <NeuralFlowScene {...sceneProps} />;
    }
    // We include 'colors' in dependencies to ensure theme updates propagate,
    // but the component switching logic itself is now stable.
  }, [mode, analyser, colors, settings]);

  if (!analyser || !settings) return null;
  
  return (
    <div className="w-full h-full">
      <Canvas 
        key={settings.quality}
        camera={cameraConfig}
        dpr={dpr} 
        gl={glConfig}
        onCreated={({ gl }) => {
          gl.setClearColor('#000000');
          // Context loss handling
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