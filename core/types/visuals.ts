/**
 * File: core/types/visuals.ts
 * Version: 2.1.0
 * Author: Sut
 * Updated: 2025-03-25 22:15 - Added AI Background settings.
 */

import { Position, Region } from './common';
import { LyricsStyle } from './audio';

export enum VisualizerMode {
  // Priority Modes
  PLASMA = 'PLASMA',
  BARS = 'BARS',
  DIGITAL_GRID = 'DIGITAL_GRID',
  SILK_WAVE = 'SILK_WAVE',
  OCEAN_WAVE = 'OCEAN_WAVE',

  // Classic / 2D Modes
  PARTICLES = 'PARTICLES',
  TUNNEL = 'TUNNEL',
  RINGS = 'RINGS',
  LASERS = 'LASERS',
  FLUID_CURVES = 'FLUID_CURVES',
  WAVEFORM = 'WAVEFORM',
  NEBULA = 'NEBULA', 
  
  // WebGL Modes (High Fidelity)
  NEURAL_FLOW = 'NEURAL_FLOW',
  CUBE_FIELD = 'CUBE_FIELD',
  KINETIC_WALL = 'KINETIC_WALL', 
  RESONANCE_ORB = 'RESONANCE_ORB'
}

export interface VisualizerSettings {
  uiMode: 'simple' | 'advanced';
  appTheme: 'dark' | 'light';
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
  albumArtBlur?: number;
  showAlbumArtOverlay: boolean;
  showSongInfo: boolean; 

  // AI Background Settings
  aiBgUrl: string;
  showAiBg: boolean;
  aiBgOpacity: number;
  aiBgBlur: number;

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
    dataR?: Uint8Array 
  ): void;
  cleanup?(): void;
}

export type WorkerMessage = 
  | { type: 'INIT'; canvas: OffscreenCanvas; width: number; height: number; devicePixelRatio: number }
  | { type: 'RESIZE'; width: number; height: number; devicePixelRatio: number }
  | { type: 'FRAME'; data: Uint8Array; dataR?: Uint8Array }
  | { type: 'CONFIG'; mode: VisualizerMode; settings: VisualizerSettings; colors: string[] };