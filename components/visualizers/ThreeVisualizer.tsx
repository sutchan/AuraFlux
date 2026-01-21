/**
 * File: components/visualizers/ThreeVisualizer.tsx
 * Version: 1.7.5
 * Author: Sut
 * Copyright (c) 2024 Aura Vision. All rights reserved.
 * Updated: 2025-02-19 11:00
 */

import React, { Suspense, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { EffectComposer, Bloom, ChromaticAberration, TiltShift } from '@react-three/postprocessing';
import * as THREE from 'three';
import { VisualizerMode, VisualizerSettings } from '../../core/types';
import { 
    SilkWavesScene, 
    LiquidSphereScene, 
    CubeFieldScene,
    NeuralFlowScene,
    // Fix: Import missing scene
    LowPolyTerrainScene
} from './ThreeScenes';

interface ThreeVisualizerProps {
  analyser: AnalyserNode | null;
  colors: string[];
  settings: VisualizerSettings;
  mode: VisualizerMode; 
}

const ThreeVisualizer: React.FC<ThreeVisualizerProps> = ({ analyser, colors, settings, mode }) => {
  
  const dpr = useMemo(() => {
    return settings.quality === 'low' ? 0.8 : settings.quality === 'med' ? 1.0 : Math.min(window.devicePixelRatio, 1.5);
  }, [settings.quality]);

  const bloomIntensity = useMemo(() => {
      const base = 2.0;
      if (mode === VisualizerMode.SILK) return base * 0.8;
      if (mode === VisualizerMode.LIQUID) return base * 1.5;
      if (mode === VisualizerMode.CUBE_FIELD) return base * 1.2;
      if (mode === VisualizerMode.NEURAL_FLOW) return base * 1.8;
      return base;
  }, [mode]);

  const enableTiltShift = useMemo(() => {
      return settings.quality === 'high' && (
          mode === VisualizerMode.LIQUID || 
          mode === VisualizerMode.SILK
      );
  }, [settings.quality, mode]);

  const activeScene = useMemo(() => {
    if (!analyser || !settings) return null;
    switch (mode) {
        case VisualizerMode.SILK:
            return <SilkWavesScene analyser={analyser} colors={colors} settings={settings} />;
        case VisualizerMode.LIQUID:
            return <LiquidSphereScene analyser={analyser} colors={colors} settings={settings} />;
        case VisualizerMode.CUBE_FIELD:
            return <CubeFieldScene analyser={analyser} colors={colors} settings={settings} />;
        case VisualizerMode.NEURAL_FLOW:
            return <NeuralFlowScene analyser={analyser} colors={colors} settings={settings} />;
        // Fix: Added TERRAIN scene case
        case VisualizerMode.TERRAIN:
            return <LowPolyTerrainScene analyser={analyser} colors={colors} settings={settings} />;
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
          
          const handleContextLost = (event: Event) => {
            event.preventDefault();
            console.warn('[ThreeVisualizer] WebGL Context Lost.');
          };

          const handleContextRestored = () => {
            console.log('[ThreeVisualizer] WebGL Context Restored.');
          };

          gl.domElement.addEventListener('webglcontextlost', handleContextLost, false);
          gl.domElement.addEventListener('webglcontextrestored', handleContextRestored, false);
        }}
      >
        <Suspense fallback={null}>
            {activeScene}
        </Suspense>
        
        {settings.glow && (
            <EffectComposer multisampling={0}>
                <Bloom 
                    luminanceThreshold={0.15} 
                    luminanceSmoothing={0.9} 
                    intensity={bloomIntensity} 
                    mipmapBlur={true} 
                    radius={0.7}
                />
                {settings.quality === 'high' && (
                    <ChromaticAberration 
                        offset={new THREE.Vector2(0.0015, 0.0015)}
                        radialModulation={false}
                    />
                )}
                {enableTiltShift && (
                    <TiltShift blur={0.1} />
                )}
            </EffectComposer>
        )}
      </Canvas>
    </div>
  );
};

export default ThreeVisualizer;