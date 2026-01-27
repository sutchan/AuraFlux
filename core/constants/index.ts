/**
 * File: core/constants/index.ts
 * Version: 1.8.0
 * Author: Sut
 * Copyright (c) 2024 Aura Vision. All rights reserved.
 * Updated: 2025-03-05 18:00
 */

import { VisualizerMode, SmartPreset } from '../types';

export const APP_VERSION = '1.8.0';
export const GEMINI_MODEL = 'gemini-3-flash-preview';
export const STORAGE_PREFIX = 'av_v1_';

// Expanded to 30 curated color themes.
export const COLOR_THEMES: string[][] = [
  ['#ff007f', '#7a00ff', '#00e5ff'], // 01: Vaporwave
  ['#00ff87', '#60efff', '#a100ff'], // 02: Aurora Borealis
  ['#ff6a00', '#ee0979', '#7b4397'], // 03: Sunset Boulevard
  ['#00d2ff', '#ff56f6', '#3a7bd5'], // 04: Cotton Candy
  ['#00f2ff', '#0060ff', '#00c3ff'], // 05: Electric Blue
  ['#ff00ea', '#ff0055', '#ff00a6'], // 06: Neon Pink
  ['#00ffaa', '#00aa00', '#00ff41'], // 07: Matrix Green
  ['#ffcc00', '#ff6600', '#ff9500'], // 08: Gold Sunset
  ['#af52de', '#5856d6', '#8b5cf6'], // 09: Royal Purple
  ['#ff3c00', '#ff0055', '#ff9500'], // 10: Solar Flare
  ['#00ffd5', '#008cff', '#5500ff'], // 11: Deep Ocean
  ['#9dff00', '#00ff8c', '#00ccff'], // 12: Cyber Lime
  ['#f78fb3', '#cf6a87', '#f8a5c2'], // 13: Sakura
  ['#3dc1d3', '#546de5', '#786fa6'], // 14: Arctic Mist
  ['#f19066', '#f3a683', '#f5cd79'], // 15: Desert Sand
  ['#fffa65', '#fff200', '#ff9f1a'], // 16: Electric Yellow
  ['#32ff7e', '#3ae374', '#05c46b'], // 17: Emerald City
  ['#18dcff', '#00d2d3', '#01a3a4'], // 18: Cyanide
  ['#ff9ff3', '#f368e0', '#ff4dff'], // 19: Candy Gloss
  ['#54a0ff', '#00d2d3', '#2e86de'], // 20: Skyward
  ['#5f27cd', '#341f97', '#222f3e'], // 21: Deep Purple
  ['#ff9f43', '#ee5253', '#ff6b6b'], // 22: Lava Flow
  ['#10ac84', '#1dd1a1', '#10ac84'], // 23: Jungle
  ['#222f3e', '#576574', '#8395a7'], // 24: Storm Cloud
  ['#00d2d3', '#48dbfb', '#0abde3'], // 25: Glacier
  ['#ff6b6b', '#ee5253', '#c0392b'], // 26: Crimson
  ['#feca57', '#ff9f43', '#f39c12'], // 27: Amber
  ['#9b59b6', '#8e44ad', '#2c3e50'], // 28: Nebula Dream
  ['#ffffff', '#8e8e93', '#c7c7cc'], // 29: Monochrome
  ['#7d5fff', '#4b4b4b', '#1e272e'], // 30: Phantom
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

export const VISUALIZER_PRESETS: Record<string, { description: string }> = {
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
  [VisualizerMode.NEURAL_FLOW]: { description: 'Organic fluid simulation powered by WebGL.' },
  [VisualizerMode.CUBE_FIELD]: { description: 'Infinite field of geometric blocks.' },
  [VisualizerMode.KINETIC_WALL]: { description: 'Massive LED stage wall with kinetic extrusions.' },
  [VisualizerMode.LIQUID]: { description: 'Abstract morphing sphere reacting to rhythm.' },
};

export const SMART_PRESETS: Record<string, SmartPreset> = {
  calm: {
    nameKey: 'calm',
    settings: {
      mode: VisualizerMode.WAVEFORM,
      colorTheme: COLOR_THEMES[4],
      speed: 0.5,
      sensitivity: 1.0,
      glow: false,
      trails: true,
      smoothing: 0.9,
      includedModes: [VisualizerMode.WAVEFORM, VisualizerMode.FLUID_CURVES, VisualizerMode.LIQUID, VisualizerMode.NEBULA]
    }
  },
  party: {
    nameKey: 'party',
    settings: {
      mode: VisualizerMode.KINETIC_WALL,
      colorTheme: COLOR_THEMES[0],
      speed: 1.5,
      sensitivity: 2.0,
      glow: true,
      trails: true,
      smoothing: 0.6,
      includedModes: [VisualizerMode.KINETIC_WALL, VisualizerMode.LASERS, VisualizerMode.BARS, VisualizerMode.CUBE_FIELD, VisualizerMode.PLASMA]
    }
  },
  ambient: {
    nameKey: 'ambient',
    settings: {
      mode: VisualizerMode.NEBULA,
      colorTheme: COLOR_THEMES[8],
      speed: 0.3,
      sensitivity: 1.2,
      glow: true,
      trails: true,
      smoothing: 0.95,
      includedModes: [VisualizerMode.NEBULA, VisualizerMode.MACRO_BUBBLES, VisualizerMode.NEURAL_FLOW, VisualizerMode.PARTICLES]
    }
  },
  cyberpunk: {
    nameKey: 'cyberpunk',
    settings: {
      mode: VisualizerMode.LASERS,
      colorTheme: COLOR_THEMES[1],
      speed: 1.2,
      sensitivity: 1.8,
      glow: true,
      trails: true,
      smoothing: 0.7,
      includedModes: [VisualizerMode.LASERS, VisualizerMode.TUNNEL, VisualizerMode.RINGS]
    }
  },
  retrowave: {
    nameKey: 'retrowave',
    settings: {
      mode: VisualizerMode.CUBE_FIELD,
      colorTheme: COLOR_THEMES[2],
      speed: 1.0,
      sensitivity: 1.5,
      glow: true,
      trails: false,
      smoothing: 0.8,
      includedModes: [VisualizerMode.CUBE_FIELD, VisualizerMode.TUNNEL, VisualizerMode.BARS]
    }
  },
  vocal: {
    nameKey: 'vocal',
    settings: {
      mode: VisualizerMode.BARS,
      colorTheme: COLOR_THEMES[28],
      speed: 0.8,
      sensitivity: 1.3,
      glow: false,
      trails: true,
      smoothing: 0.85,
      includedModes: [VisualizerMode.BARS, VisualizerMode.RINGS, VisualizerMode.WAVEFORM]
    }
  }
};