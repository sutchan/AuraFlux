
/**
 * File: core/services/visualizerStrategies.ts
 * Version: 1.6.8
 * Author: Aura Vision Team
 * Copyright (c) 2024 Aura Vision. All rights reserved.
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

// Export classes for type usage if needed
export { 
  BarsRenderer, RingsRenderer, FluidCurvesRenderer, MacroBubblesRenderer, 
  ParticlesRenderer, NebulaRenderer, TunnelRenderer, PlasmaRenderer, 
  LasersRenderer
};

// Also export the BeatDetector
export { BeatDetector } from './beatDetector';

/**
 * Factory function to instantiate all 2D visualizer renderers.
 * This ensures strict consistency between the Main Thread (fallback) and Web Worker (primary).
 */
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
  };
};
