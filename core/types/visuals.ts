
/**
 * File: core/types/visuals.ts
 * Version: 1.8.2
 * Author: Sut
 * Copyright (c) 2024 Aura Vision. All rights reserved.
 * Updated: 2025-03-14 21:00
 */

import { Position, Region } from './common';
import { LyricsStyle } from './audio';

export enum VisualizerMode {
  // Priority Modes
  PLASMA = 'PLASMA',
  BARS = 'BARS',

  // Classic / 2D Modes
  PARTICLES = 'PARTICLES',
  TUNNEL = 'TUNNEL',
  RINGS = 'RINGS',
  LASERS = 'LASERS',
  FLUID_CURVES = 'FLUID_CURVES',
  WAVEFORM = 'WAVEFORM',
  NEBULA = 'NEBULA', 
  MACRO_BUBBLES = 'MACRO_BUBBLES',
  
  // WebGL Modes (High Fidelity)
  NEURAL_FLOW = 'NEURAL_FLOW',
  CUBE_FIELD = 'CUBE_FIELD',
  KINETIC_WALL = 'KINETIC_WALL', 
  LIQUID = 'LIQUID'
}

export interface VisualizerSettings {
  uiMode: 'simple' | 'advanced';
  appTheme: 'dark' | 'light'; // New Theme Setting
  sensitivity: number;
  speed: number;
  glow: boolean;
  trails: boolean;
  
  // Automation
  autoRotate: boolean;
  rotateInterval: number;
  includedModes: VisualizerMode[]; 
  
  cycleColors: boolean;
  colorInterval: number;
  
  hideCursor: boolean;
  smoothing: number;
  fftSize: number;
  quality: 'low' | 'med' | 'high';
  monitor: boolean;
  wakeLock: boolean;
  
  // Media Settings
  albumArtBackground?: boolean;
  albumArtDim?: number;
  showAlbumArtOverlay: boolean;

  // Overlay Settings
  customText: string;
  showCustomText: boolean;
  textSource: 'AUTO' | 'CUSTOM' | 'SONG' | 'CLOCK';
  textPulse: boolean;
  customTextRotation: number;
  customTextSize: number;
  customTextFont: string;
  customTextOpacity: number;
  customTextColor: string;
  customTextPosition: Position;
  customTextCycleColor: boolean;
  customTextCycleInterval: number;
  customText3D?: boolean;
  lyricsPosition: Position;
  recognitionProvider: 'GEMINI' | 'OPENAI' | 'GROQ' | 'MOCK';
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
    includedModes?: VisualizerMode[]; 
    autoRotate?: boolean;
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
    beat: boolean,
    dataR?: Uint8Array // Optional Right Channel Data for Stereo
  ): void;
  cleanup?(): void;
}

// Worker Messages
export type WorkerMessage = 
  | { type: 'INIT'; canvas: OffscreenCanvas; width: number; height: number; devicePixelRatio: number }
  | { type: 'RESIZE'; width: number; height: number; devicePixelRatio: number }
  | { type: 'FRAME'; data: Uint8Array; dataR?: Uint8Array }
  | { type: 'CONFIG'; mode: VisualizerMode; settings: VisualizerSettings; colors: string[] };
