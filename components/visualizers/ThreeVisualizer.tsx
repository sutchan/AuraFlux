
/**
 * File: components/visualizers/ThreeVisualizer.tsx
 * Version: 1.0.5
 * Author: Aura Vision Team
 * Copyright (c) 2024 Aura Vision. All rights reserved.
 */

import React, { Suspense } from 'react';
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
  if (!analyser || !settings) return null;

  const renderScene = () => {
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
  };

  const getBloomIntensity = () => {
      if (mode === VisualizerMode.SILK) return 1.2;
      if (mode === VisualizerMode.LIQUID) return 1.8;
      return 1.5;
  };

  const dpr = settings.quality === 'low' ? 0.8 : settings.quality === 'med' ? 1.0 : Math.min(window.devicePixelRatio, 1.5);
  const enableTiltShift = settings.quality === 'high' && (mode === VisualizerMode.LIQUID || mode === VisualizerMode.SILK);
  
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
          // This prevents the application from freezing if the GPU crashes or browser kills the context
          // We must call event.preventDefault() to allow the browser to attempt to restore the context.
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
            {renderScene()}
        </Suspense>
        
        {settings.glow && (
            <EffectComposer 
              multisampling={0} // Disable multisampling for stability
              enableNormalPass={false}
            >
                <Bloom 
                    luminanceThreshold={0.4} 
                    luminanceSmoothing={0.9} 
                    intensity={getBloomIntensity()} 
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
