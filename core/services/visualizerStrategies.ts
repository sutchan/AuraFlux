
/**
 * File: core/services/visualizerStrategies.ts
 * Version: 1.6.10
 * Author: Sut
 * Copyright (c) 2024 Aura Vision. All rights reserved.
 * Updated: 2024-05-15 14:25
 */

import { VisualizerMode, IVisualizerRenderer } from '../types/index';

// Import all renderer implementations
import { BarsRenderer } from './renderers/BarsRenderer';
import { RingsRenderer } from './renderers/RingsRenderer';
import { FluidCurvesRenderer } from './renderers/FluidCurvesRenderer';
import { MacroBubblesRenderer } from './renderers/MacroBubblesRenderer';
import { ParticlesRenderer } from './renderers/ParticlesRenderer';
import { NebulaRenderer } from './renderers/NebulaRenderer';
import { TunnelRenderer } from './renderers/GeometryRenderers';
import { PlasmaRenderer } from './renderers/PlasmaRenderer';
import { LasersRenderer } from './renderers/LasersRenderer';
import { WaveformRenderer } from './renderers/WaveformRenderer';

// Export classes for type usage
export { 
  BarsRenderer, RingsRenderer, FluidCurvesRenderer, MacroBubblesRenderer, 
  ParticlesRenderer, NebulaRenderer, TunnelRenderer, PlasmaRenderer, 
  LasersRenderer, WaveformRenderer
};

export { BeatDetector } from './beatDetector';

export const createVisualizerRenderers = (): Record<string, IVisualizerRenderer> => {
  return {
    [VisualizerMode.BARS]: new BarsRenderer(),
    [VisualizerMode.RINGS]: new RingsRenderer(),
    [VisualizerMode.PARTICLES]: new ParticlesRenderer(),
    [VisualizerMode.TUNNEL]: new TunnelRenderer(),
    [VisualizerMode.PLASMA]: new PlasmaRenderer(),
    [VisualizerMode.NEBULA]: new NebulaRenderer(),
    [VisualizerMode.LASERS]: new LasersRenderer(),
    [VisualizerMode.FLUID_CURVES]: new FluidCurvesRenderer(),
    [VisualizerMode.MACRO_BUBBLES]: new MacroBubblesRenderer(),
    [VisualizerMode.WAVEFORM]: new WaveformRenderer(),
  };
};
