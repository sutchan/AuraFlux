/**
 * File: core/constants/index.ts
 * Version: 1.6.75
 * Author: Sut
 * Copyright (c) 2024 Aura Vision. All rights reserved.
 * Updated: 2025-02-21 23:00
 */

import { VisualizerMode, SmartPreset } from '../types';

export const APP_VERSION = '1.6.75';
export const GEMINI_MODEL = 'gemini-3-flash-preview';
export const STORAGE_PREFIX = 'av_v1_';

// Expanded to 30 curated color themes with 3 colors each for high-fidelity rendering
export const COLOR_THEMES: string[][] = [
  ['#00f2ff', '#0060ff', '#00c3ff'], // 01: Electric Blue
  ['#ff00ea', '#ff0055', '#ff00a6'], // 02: Neon Pink
  ['#00ffaa', '#00aa00', '#00ff41'], // 03: Matrix Green
  ['#ffcc00', '#ff6600', '#ff9500'], // 04: Gold Sunset
  ['#af52de', '#5856d6', '#8b5cf6'], // 05: Royal Purple
  ['#ffffff', '#8e8e93', '#c7c7cc'], // 06: Monochrome
  ['#ff3c00', '#ff0055', '#ff9500'], // 07: Solar Flare
  ['#00ffd5', '#008cff', '#5500ff'], // 08: Deep Ocean
  ['#ff007f', '#7a00ff', '#00e5ff'], // 09: Vaporwave
  ['#9dff00', '#00ff8c', '#00ccff'], // 10: Cyber Lime
  ['#ff0000', '#660000', '#330000'], // 11: Blood Moon
  ['#e0e0e0', '#424242', '#212121'], // 12: Industrial
  ['#f78fb3', '#cf6a87', '#f8a5c2'], // 13: Sakura
  ['#3dc1d3', '#546de5', '#786fa6'], // 14: Arctic Mist
  ['#f19066', '#f3a683', '#f5cd79'], // 15: Desert Sand
  ['#574b90', '#303952', '#2c2c54'], // 16: Midnight Blue
  ['#fffa65', '#fff200', '#ff9f1a'], // 17: Electric Yellow
  ['#32ff7e', '#3ae374', '#05c46b'], // 18: Emerald City
  ['#18dcff', '#00d2d3', '#01a3a4'], // 19: Cyanide
  ['#7d5fff', '#4b4b4b', '#1e272e'], // 20: Phantom
  ['#ff9ff3', '#f368e0', '#ff4dff'], // 21: Candy Gloss
  ['#54a0ff', '#00d2d3', '#2e86de'], // 22: Skyward
  ['#5f27cd', '#341f97', '#222f3e'], // 23: Deep Purple
  ['#ff9f43', '#ee5253', '#ff6b6b'], // 24: Lava Flow
  ['#10ac84', '#1dd1a1', '#10ac84'], // 25: Jungle
  ['#222f3e', '#576574', '#8395a7'], // 26: Storm Cloud
  ['#00d2d3', '#48dbfb', '#0abde3'], // 27: Glacier
  ['#ff6b6b', '#ee5253', '#c0392b'], // 28: Crimson
  ['#feca57', '#ff9f43', '#f39c12'], // 29: Amber
  ['#9b59b6', '#8e44ad', '#2c3e50'], // 30: Nebula Dream
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