
/**
 * File: components/visualizers/ThreeVisualizer.tsx
 * Version: 1.0.6
 * Author: Aura Vision Team
 * Copyright (c) 2024 Aura Vision. All rights reserved.
 */

import React, { Suspense, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { EffectComposer, Bloom, ChromaticAberration, TiltShift } from '@react-three/postprocessing';
import * as THREE from 'three';
import { VisualizerMode, VisualizerSettings } from '../../core/types';
import { SilkWavesScene, LiquidSphereScene, LowPolyTerrainScene } from './ThreeScenes';

interface ThreeVisualizerProps {
  analyser: AnalyserNode | null;
  colors: string[];
  settings: VisualizerSettings;
  mode: VisualizerMode; 
}

const ThreeVisualizer: React.FC<ThreeVisualizerProps> = ({ analyser, colors, settings, mode }) => {
  
  // Performance Optimization: Memoize DPR calculation
  const dpr = useMemo(() => {
    return settings.quality === 'low' ? 0.8 : settings.quality === 'med' ? 1.0 : Math.min(window.devicePixelRatio, 1.5);
  }, [settings.quality]);

  // Performance Optimization: Memoize Bloom Intensity based on mode
  const bloomIntensity = useMemo(() => {
      if (mode === VisualizerMode.SILK) return 1.2;
      if (mode === VisualizerMode.LIQUID) return 1.8;
      return 1.5;
  }, [mode]);

  // Performance Optimization: Memoize TiltShift enable logic
  const enableTiltShift = useMemo(() => {
      return settings.quality === 'high' && (mode === VisualizerMode.LIQUID || mode === VisualizerMode.SILK);
  }, [settings.quality, mode]);

  // Performance Optimization: Memoize Scene selection to prevent unnecessary re-evaluations
  const activeScene = useMemo(() => {
    if (!analyser || !settings) return null;
    switch (mode) {
        case VisualizerMode.SILK:
            return <SilkWavesScene analyser={analyser} colors={colors} settings={settings} />;
        case VisualizerMode.LIQUID:
            return <LiquidSphereScene analyser={analyser} colors={colors} settings={settings} />;
        case VisualizerMode.TERRAIN:
            return <LowPolyTerrainScene analyser={analyser} colors={colors} settings={settings} />;
        default:
            return <LowPolyTerrainScene analyser={analyser} colors={colors} settings={settings} />;
    }
  }, [mode, analyser, colors, settings]);

  if (!analyser || !settings) return null;
  
  return (
    <div className="w-full h-full">
      <Canvas 
        key={settings.quality}
        camera={{ position: [0, 2, 16], fov: 55 }} 
        dpr={dpr} 
        shadows={false}
        gl={{ 
            antialias: settings.quality !== 'low', 
            alpha: false,
            stencil: false,
            depth: true,
            powerPreference: "high-performance",
            failIfMajorPerformanceCaveat: true
        }}
        onCreated={({ gl }) => {
          gl.setClearColor('#000000');
          
          // Robustness: Handle WebGL Context Loss
          const handleContextLost = (event: Event) => {
            event.preventDefault();
            console.warn('[ThreeVisualizer] WebGL Context Lost. Attempting to restore...');
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
            <EffectComposer 
              multisampling={0} // Disable multisampling for stability
              enableNormalPass={false}
            >
                <Bloom 
                    luminanceThreshold={0.4} 
                    luminanceSmoothing={0.9} 
                    intensity={bloomIntensity} 
                    mipmapBlur={settings.quality !== 'low'}
                />
                {settings.quality === 'high' && (
                    <ChromaticAberration 
                        offset={new THREE.Vector2(0.0015 * settings.sensitivity, 0.0015)}
                        radialModulation={false}
                        modulationOffset={0}
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
