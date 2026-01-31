/**
 * File: core/constants/visualThemes.ts
 * Version: 2.0.4
 * Author: Sut
 * Updated: 2025-03-25 21:05 - Removed MACRO_BUBBLES.
 */

import { VisualizerMode } from '../types';

export const COLOR_THEMES: string[][] = [
  ['#ff007f', '#7a00ff', '#00e5ff'], ['#00ff87', '#60efff', '#a100ff'],
  ['#ff6a00', '#ee0979', '#7b4397'], ['#00d2ff', '#ff56f6', '#3a7bd5'],
  ['#00f2ff', '#0060ff', '#00c3ff'], ['#ff00ea', '#ff0055', '#ff00a6'],
  ['#00ffaa', '#00aa00', '#00ff41'], ['#ffcc00', '#ff6600', '#ff9500'],
  ['#af52de', '#5856d6', '#8b5cf6'], ['#ff3c00', '#ff0055', '#ff9500'],
  ['#00ffd5', '#008cff', '#5500ff'], ['#9dff00', '#00ff8c', '#00ccff'],
  ['#f78fb3', '#cf6a87', '#f8a5c2'], ['#3dc1d3', '#546de5', '#786fa6'],
  ['#f19066', '#f3a683', '#f5cd79'], ['#fffa65', '#fff200', '#ff9f1a'],
  ['#32ff7e', '#3ae374', '#05c46b'], ['#18dcff', '#00d2d3', '#01a3a4']
];

export const THEME_NAMES = ["Vaporwave", "Aurora", "Sunset", "Cotton Candy", "Electric", "Neon", "Matrix", "Gold", "Royal", "Solar", "Ocean", "Cyber", "Sakura", "Arctic", "Desert", "Voltage", "Emerald", "Cyanide"];

export const VISUALIZER_PRESETS: Record<string, { description: string }> = {
  [VisualizerMode.PLASMA]: { description: 'Smooth fluid blending.' },
  [VisualizerMode.BARS]: { description: 'Spectrum analyzer.' },
  [VisualizerMode.PARTICLES]: { description: 'Starfield traversal.' },
  [VisualizerMode.TUNNEL]: { description: 'Geometric corridor.' },
  [VisualizerMode.RINGS]: { description: 'Neon resonance.' },
  [VisualizerMode.NEBULA]: { description: 'Space particles.' },
  [VisualizerMode.LASERS]: { description: 'Light beams.' },
  [VisualizerMode.FLUID_CURVES]: { description: 'Light waves.' },
  [VisualizerMode.WAVEFORM]: { description: 'Spectral ribbons.' },
  [VisualizerMode.NEURAL_FLOW]: { description: 'Fluid simulation.' },
  [VisualizerMode.CUBE_FIELD]: { description: 'Geometric blocks.' },
  [VisualizerMode.KINETIC_WALL]: { description: 'Stage wall.' },
  [VisualizerMode.RESONANCE_ORB]: { description: 'Morphing resonant sphere.' },
  [VisualizerMode.DIGITAL_GRID]: { description: 'LED wall.' },
  [VisualizerMode.SILK_WAVE]: { description: 'Fiber optic.' },
  [VisualizerMode.OCEAN_WAVE]: { description: 'Pulsar terrain.' },
};