/**
 * File: components/visualizers/ThreeVisualizer.tsx
 * Version: 1.9.7
 * Author: Sut
 */

import React, { Suspense, useMemo, useEffect } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { EffectComposer, Bloom, Noise } from '@react-three/postprocessing';
import { VisualizerMode, VisualizerSettings } from '../../core/types';
import { BLOOM_CONFIG } from '../../core/constants';
import { 
    KineticWallScene, 
    LiquidSphereScene, 
    CubeFieldScene,
    NeuralFlowScene,
    DigitalGridScene,
    SilkWaveScene,
    OceanWaveScene
} from './ThreeScenes';

interface ThreeVisualizerProps {
  analyser: AnalyserNode | null;
  analyserR?: AnalyserNode | null; 
  colors: string[];
  settings: VisualizerSettings;
  mode: VisualizerMode; 
}

const BackgroundController: React.FC<{ isTransparent: boolean }> = ({ isTransparent }) => {
    const { gl } = useThree();
    useEffect(() => {
        gl.setClearColor('#000000', isTransparent ? 0 : 1);
    }, [isTransparent, gl]);
    return null;
};

const ThreeVisualizer: React.FC<ThreeVisualizerProps> = ({ analyser, analyserR, colors, settings, mode }) => {
  
  const dpr = useMemo(() => {
    if (!settings) return 1;
    const quality = settings.quality;
    if (quality === 'low') return 0.8;
    if (quality === 'med') return 1.0;
    return Math.min(window.devicePixelRatio, 1.5);
  }, [settings?.quality]);

  const cameraConfig = useMemo(() => {
      if (mode === VisualizerMode.OCEAN_WAVE) {
          return { position: [0, 8, 15] as [number, number, number], fov: 60 };
      }
      return { position: [0, 2, 16] as [number, number, number], fov: 55 };
  }, [mode]);

  const glConfig = useMemo(() => ({ 
    antialias: false,
    alpha: true, 
    stencil: false,
    depth: true,
    powerPreference: "high-performance" as WebGLPowerPreference
  }), []);

  const bloomIntensity = useMemo(() => {
      return BLOOM_CONFIG[mode] || 2.0;
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
    const sceneProps = { analyser, analyserR, colors, settings };

    switch (mode) {
        case VisualizerMode.KINETIC_WALL: return <KineticWallScene {...sceneProps} />;
        case VisualizerMode.RESONANCE_ORB: return <LiquidSphereScene {...sceneProps} />;
        case VisualizerMode.CUBE_FIELD: return <CubeFieldScene {...sceneProps} />;
        case VisualizerMode.NEURAL_FLOW: return <NeuralFlowScene {...sceneProps} />;
        case VisualizerMode.DIGITAL_GRID: return <DigitalGridScene {...sceneProps} />;
        case VisualizerMode.SILK_WAVE: return <SilkWaveScene {...sceneProps} />;
        case VisualizerMode.OCEAN_WAVE: return <OceanWaveScene {...sceneProps} />;
        default: return <NeuralFlowScene {...sceneProps} />;
    }
  }, [mode, analyser, analyserR, colors, settings]);

  if (!analyser || !settings) return null;
  
  return (
    <div className="w-full h-full">
      <Canvas 
        key={settings.quality + mode} 
        camera={cameraConfig}
        dpr={dpr} 
        gl={glConfig}
        onCreated={({ gl }) => {
          gl.setClearColor('#000000', 1);
          const handleContextLost = (event: Event) => { event.preventDefault(); };
          gl.domElement.addEventListener('webglcontextlost', handleContextLost, false);
        }}
      >
        <BackgroundController isTransparent={!!settings.albumArtBackground} />
        <Suspense fallback={null}>{activeScene}</Suspense>
        {postProcessingEffects}
      </Canvas>
    </div>
  );
};

export default ThreeVisualizer;