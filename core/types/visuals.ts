
/**
 * File: core/types/visuals.ts
 * Version: 1.6.11
 * Author: Sut
 * Copyright (c) 2024 Aura Vision. All rights reserved.
 * Updated: 2025-02-17 10:00
 */

import { Position, Region } from './common';
import { LyricsStyle } from './audio';

export enum VisualizerMode {
  // WebGL Modes
  NEURAL_FLOW = 'NEURAL_FLOW',
  SILK = 'SILK',
  LIQUID = 'LIQUID',
  CUBE_FIELD = 'CUBE_FIELD',
  // Fix: Added missing TERRAIN mode
  TERRAIN = 'TERRAIN',

  // Modern 2D Modes
  WAVEFORM = 'WAVEFORM', // New Elegant Waveform
  FLUID_CURVES = 'FLUID_CURVES',
  NEBULA = 'NEBULA', 
  MACRO_BUBBLES = 'MACRO_BUBBLES',
  
  // Classic Modes
  LASERS = 'LASERS',
  TUNNEL = 'TUNNEL',
  RINGS = 'RINGS',
  PARTICLES = 'PARTICLES',
  PLASMA = 'PLASMA',
  BARS = 'BARS'
}

export interface VisualizerSettings {
  uiMode: 'simple' | 'advanced';
  sensitivity: number;
  speed: number;
  glow: boolean;
  trails: boolean;
  autoRotate: boolean;
  rotateInterval: number;
  cycleColors: boolean;
  colorInterval: number;
  hideCursor: boolean;
  smoothing: number;
  fftSize: number;
  quality: 'low' | 'med' | 'high';
  monitor: boolean;
  wakeLock: boolean;
  // Overlay Settings
  customText: string;
  showCustomText: boolean;
  textPulse: boolean;
  customTextRotation: number;
  customTextSize: number;
  customTextFont: string;
  customTextOpacity: number;
  customTextColor: string;
  customTextPosition: Position;
  customTextCycleColor: boolean;
  customTextCycleInterval: number;
  lyricsPosition: Position;
  recognitionProvider: 'GEMINI' | 'MOCK' | 'OPENAI' | 'CLAUDE' | 'GROK' | 'DEEPSEEK' | 'QWEN';
  lyricsStyle?: LyricsStyle;
  lyricsFont?: string;
  lyricsFontSize?: number;
  region?: Region;
  // System Settings
  showFps: boolean;
  showTooltips: boolean;
  doubleClickFullscreen: boolean;
  autoHideUi: boolean;
  mirrorDisplay: boolean;
}

export interface VisualizerConfig {
  mode: VisualizerMode;
  sensitivity: number;
  colorTheme: string[];
}

export interface SmartPreset {
  nameKey: string;
  settings: {
    mode: VisualizerMode;
    colorTheme: string[];
    speed: number;
    sensitivity: number;
    glow: boolean;
    trails: boolean;
    smoothing: number;
    fftSize?: number;
  };
}

// RenderContext uses any to avoid bringing in DOM types that might crash Workers
export type RenderContext = any; 

export interface IVisualizerRenderer {
  init(canvas: any): void;
  draw(
    ctx: RenderContext, 
    data: Uint8Array, 
    width: number, 
    height: number, 
    colors: string[], 
    settings: VisualizerSettings,
    rotation: number, 
    beat: boolean
  ): void;
  cleanup?(): void;
}

// Worker Messages
export type WorkerMessage = 
  | { type: 'INIT'; canvas: OffscreenCanvas; width: number; height: number; devicePixelRatio: number }
  | { type: 'RESIZE'; width: number; height: number; devicePixelRatio: number }
  | { type: 'FRAME'; data: Uint8Array }
  | { type: 'CONFIG'; mode: VisualizerMode; settings: VisualizerSettings; colors: string[] };
