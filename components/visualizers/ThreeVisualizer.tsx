/**
 * File: components/visualizers/ThreeVisualizer.tsx
 * Version: 1.8.1
 * Author: Sut
 * Copyright (c) 2025 Aura Vision. All rights reserved.
 * Updated: 2025-03-08 12:00
 * Description: Added BackgroundController for transparent clear color handling.
 */

import React, { Suspense, useMemo, useEffect } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
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

// Helper component to manage WebGL Clear Color reactively
const BackgroundController: React.FC<{ isTransparent: boolean }> = ({ isTransparent }) => {
    const { gl } = useThree();
    useEffect(() => {
        // If transparent (showing album art), set alpha to 0. Otherwise opaque black.
        gl.setClearColor('#000000', isTransparent ? 0 : 1);
    }, [isTransparent, gl]);
    return null;
};

const ThreeVisualizer: React.FC<ThreeVisualizerProps> = ({ analyser, colors, settings, mode }) => {
  
  const dpr = useMemo(() => {
    if (!settings) return 1;
    const quality = settings.quality;
    if (quality === 'low') return 0.8;
    if (quality === 'med') return 1.0;
    return Math.min(window.devicePixelRatio, 1.5);
  }, [settings?.quality]);

  const cameraConfig = useMemo(() => ({ 
    position: [0, 2, 16] as [number, number, number], 
    fov: 55 
  }), []);

  const glConfig = useMemo(() => ({ 
    antialias: false,
    alpha: true, // Enable alpha buffer for transparency
    stencil: false,
    depth: true,
    powerPreference: "high-performance" as WebGLPowerPreference
  }), []);

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

  const activeScene = useMemo(() => {
    if (!analyser || !settings) return null;
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
          // Initial clear color, will be managed by BackgroundController
          gl.setClearColor('#000000', 1);
          const handleContextLost = (event: Event) => { event.preventDefault(); };
          gl.domElement.addEventListener('webglcontextlost', handleContextLost, false);
        }}
      >
        <BackgroundController isTransparent={!!settings.albumArtBackground} />
        
        <Suspense fallback={null}>
            {activeScene}
        </Suspense>
        
        {postProcessingEffects}
      </Canvas>
    </div>
  );
};

export default ThreeVisualizer;