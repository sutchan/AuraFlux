/**
 * File: core/constants/index.ts
 * Version: 1.6.68
 * Author: Sut
 * Copyright (c) 2024 Aura Vision. All rights reserved.
 * Updated: 2025-02-21 14:30
 */

import { VisualizerMode, SmartPreset } from '../types';

export const APP_VERSION = '1.6.68';
export const GEMINI_MODEL = 'gemini-3-flash-preview';
export const STORAGE_PREFIX = 'av_v1_';

// Updated to 3 colors per theme for better depth and scene compatibility
export const COLOR_THEMES: string[][] = [
  ['#00f2ff', '#0060ff', '#00c3ff'], // Electric Blue
  ['#ff00ea', '#ff0055', '#ff00a6'], // Magenta Pink
  ['#00ffaa', '#00aa00', '#00ff41'], // Matrix Green
  ['#ffcc00', '#ff6600', '#ff9500'], // Gold Sunset
  ['#af52de', '#5856d6', '#8b5cf6'], // Royal Purple
  ['#ffffff', '#8e8e93', '#c7c7cc'], // Monochrome
];

export const REGION_NAMES: Record<string, string> = {
  global: 'Global',
  US: 'United States',
  CN: 'China',
  JP: 'Japan',
  KR: 'Korea',
  EU: 'Europe',
  LATAM: 'Latin America'
};

export const AVAILABLE_FONTS = [
  { value: 'Inter, sans-serif', label: 'Inter (Sans)' },
  { value: '"JetBrains Mono", monospace', label: 'JetBrains (Mono)' },
  { value: '"Playfair Display", serif', label: 'Playfair (Serif)' },
  { value: 'system-ui, sans-serif', label: 'System' }
];

export const getPositionOptions = (t: any) => [
  { value: 'tl', label: t?.positions?.tl || 'Top Left' },
  { value: 'tc', label: t?.positions?.tc || 'Top Center' },
  { value: 'tr', label: t?.positions?.tr || 'Top Right' },
  { value: 'ml', label: t?.positions?.ml || 'Mid Left' },
  { value: 'mc', label: t?.positions?.mc || 'Center' },
  { value: 'mr', label: t?.positions?.mr || 'Mid Right' },
  { value: 'bl', label: t?.positions?.bl || 'Bottom Left' },
  { value: 'bc', label: t?.positions?.bc || 'Bottom Center' },
  { value: 'br', label: t?.positions?.br || 'Bottom Right' },
];

/**
 * Visualizer Presets Sorting:
 * 1. 2D / Classic Engines (High performance, pure canvas)
 * 2. WebGL Engines (High fidelity, 3D scenes - moved to end per user request)
 */
export const VISUALIZER_PRESETS: Record<string, { description: string }> = {
  // --- 2D & Classic Engines ---
  [VisualizerMode.PLASMA]: { description: 'Smooth fluid-like color blending.' },
  [VisualizerMode.BARS]: { description: 'Classic frequency spectrum analyzer.' },
  [VisualizerMode.PARTICLES]: { description: 'Deep space starfield traversal.' },
  [VisualizerMode.TUNNEL]: { description: 'Recursive geometric corridor.' },
  [VisualizerMode.RINGS]: { description: 'Concentric neon resonance patterns.' },
  [VisualizerMode.NEBULA]: { description: 'Deep space particle simulation.' },
  [VisualizerMode.LASERS]: { description: 'Sharp high-energy light beams.' },
  [VisualizerMode.FLUID_CURVES]: { description: 'Smooth atmospheric light waves.' },
  [VisualizerMode.MACRO_BUBBLES]: { description: 'Soft focus micro-cellular visuals.' },
  [VisualizerMode.WAVEFORM]: { description: 'Liquid ribbons of spectral frequency.' },

  // --- WebGL Engines (At the end) ---
  [VisualizerMode.NEURAL_FLOW]: { description: 'Organic fluid simulation powered by WebGL.' },
  [VisualizerMode.CUBE_FIELD]: { description: 'Infinite field of geometric blocks.' },
  [VisualizerMode.SILK]: { description: 'Ethereal ribbons dancing in 3D space.' },
  [VisualizerMode.LIQUID]: { description: 'Abstract morphing sphere reacting to rhythm.' },
};

export const SMART_PRESETS: Record<string, SmartPreset> = {
  calm: {
    nameKey: 'calm',
    settings: {
      mode: VisualizerMode.WAVEFORM,
      colorTheme: COLOR_THEMES[0],
      speed: 0.5,
      sensitivity: 1.0,
      glow: false,
      trails: true,
      smoothing: 0.9,
    }
  },
  party: {
    nameKey: 'party',
    settings: {
      mode: VisualizerMode.PLASMA,
      colorTheme: COLOR_THEMES[1],
      speed: 1.5,
      sensitivity: 2.0,
      glow: true,
      trails: true,
      smoothing: 0.6,
    }
  },
  ambient: {
    nameKey: 'ambient',
    settings: {
      mode: VisualizerMode.NEBULA,
      colorTheme: COLOR_THEMES[4],
      speed: 0.3,
      sensitivity: 1.2,
      glow: true,
      trails: true,
      smoothing: 0.95,
    }
  },
  cyberpunk: {
    nameKey: 'cyberpunk',
    settings: {
      mode: VisualizerMode.LASERS,
      colorTheme: COLOR_THEMES[0],
      speed: 1.2,
      sensitivity: 1.8,
      glow: true,
      trails: true,
      smoothing: 0.7,
    }
  },
  retrowave: {
    nameKey: 'retrowave',
    settings: {
      mode: VisualizerMode.CUBE_FIELD,
      colorTheme: COLOR_THEMES[1],
      speed: 1.0,
      sensitivity: 1.5,
      glow: true,
      trails: false,
      smoothing: 0.8,
    }
  },
  vocal: {
    nameKey: 'vocal',
    settings: {
      mode: VisualizerMode.BARS,
      colorTheme: COLOR_THEMES[5],
      speed: 0.8,
      sensitivity: 1.3,
      glow: false,
      trails: true,
      smoothing: 0.85
    }
  }
};