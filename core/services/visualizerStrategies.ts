/**
 * File: core/services/visualizerStrategies.ts
 * Version: 2.0.5
 * Author: Sut
 * Copyright (c) 2024 Aura Flux. All rights reserved.
 */

import { VisualizerMode, IVisualizerRenderer } from '../types/index';
import { BarsRenderer } from './renderers/BarsRenderer';
import { RingsRenderer } from './renderers/RingsRenderer';
import { FluidCurvesRenderer } from './renderers/FluidCurvesRenderer';
import { ParticlesRenderer } from './renderers/ParticlesRenderer';
import { NebulaRenderer } from './renderers/NebulaRenderer';
import { TunnelRenderer } from './renderers/GeometryRenderers';
import { PlasmaRenderer } from './renderers/PlasmaRenderer';
import { LasersRenderer } from './renderers/LasersRenderer';
import { WaveformRenderer } from './renderers/WaveformRenderer';
import { RippleRenderer } from './renderers/RippleRenderer';

export { 
  BarsRenderer, RingsRenderer, FluidCurvesRenderer, 
  ParticlesRenderer, NebulaRenderer, TunnelRenderer, PlasmaRenderer, 
  LasersRenderer, WaveformRenderer, RippleRenderer
};

export { BeatDetector } from './beatDetector';

export const createVisualizerRenderers = (): Record<string, IVisualizerRenderer> => ({
  [VisualizerMode.BARS]: new BarsRenderer(),
  [VisualizerMode.RINGS]: new RingsRenderer(),
  [VisualizerMode.PARTICLES]: new ParticlesRenderer(),
  [VisualizerMode.TUNNEL]: new TunnelRenderer(),
  [VisualizerMode.PLASMA]: new PlasmaRenderer(),
  [VisualizerMode.NEBULA]: new NebulaRenderer(),
  [VisualizerMode.LASERS]: new LasersRenderer(),
  [VisualizerMode.FLUID_CURVES]: new FluidCurvesRenderer(),
  [VisualizerMode.WAVEFORM]: new WaveformRenderer(),
  [VisualizerMode.RIPPLES]: new RippleRenderer(),
});