/**
 * File: core/constants/index.ts
 * Version: 2.0.3
 * Author: Sut
 * Updated: 2025-03-25 20:15
 */

import { VisualizerMode, SmartPreset } from '../types';
import { COLOR_THEMES } from './visualThemes';

export * from './visualThemes';

export const APP_VERSION = '2.0.3';
export const GEMINI_MODEL = 'gemini-3-flash-preview';
export const STORAGE_PREFIX = 'av_v1_';

export const REGION_NAMES: Record<string, string> = {
  global: 'Global', US: 'United States', CN: 'China', JP: 'Japan', KR: 'Korea', EU: 'Europe', LATAM: 'Latin America'
};

export const getFontOptions = (t: any) => {
  const f = t?.fonts || {};
  return [
    { value: 'Inter, sans-serif', label: f.default || 'Inter' },
    { value: 'system-ui, sans-serif', label: f.system || 'System' },
    { value: '"JetBrains Mono", monospace', label: f.mono || 'Mono' },
    { value: '"Montserrat", sans-serif', label: f.modern || 'Modern' },
    { value: '"Oswald", sans-serif', label: f.heavy || 'Heavy' },
    { value: '"Playfair Display", serif', label: f.elegant || 'Elegant' },
    { value: '"Courier New", monospace', label: f.retro || 'Retro' },
    { value: '"Times New Roman", serif', label: f.serif || 'Serif' },
    { value: 'custom', label: f.custom || '📂 Custom...' }
  ];
};

export const getPositionOptions = (t: any) => [
  { value: 'tl', label: t?.positions?.tl || 'TL' }, { value: 'tc', label: t?.positions?.tc || 'TC' }, { value: 'tr', label: t?.positions?.tr || 'TR' },
  { value: 'ml', label: t?.positions?.ml || 'ML' }, { value: 'mc', label: t?.positions?.mc || 'MC' }, { value: 'mr', label: t?.positions?.mr || 'MR' },
  { value: 'bl', label: t?.positions?.bl || 'BL' }, { value: 'bc', label: t?.positions?.bc || 'BC' }, { value: 'br', label: t?.positions?.br || 'BR' },
];

export const SMART_PRESETS: Record<string, SmartPreset> = {
  all_modes: { nameKey: 'all_modes', settings: { mode: VisualizerMode.NEBULA, colorTheme: COLOR_THEMES[0], speed: 1.0, sensitivity: 1.5, glow: true, trails: true, smoothing: 0.8, autoRotate: true, includedModes: Object.values(VisualizerMode) } },
  calm: { nameKey: 'calm', settings: { mode: VisualizerMode.OCEAN_WAVE, colorTheme: COLOR_THEMES[4], speed: 0.4, sensitivity: 1.2, glow: true, trails: true, smoothing: 0.92, includedModes: [VisualizerMode.OCEAN_WAVE, VisualizerMode.WAVEFORM] } },
  party: { nameKey: 'party', settings: { mode: VisualizerMode.KINETIC_WALL, colorTheme: COLOR_THEMES[0], speed: 1.6, sensitivity: 2.2, glow: true, trails: true, smoothing: 0.6, includedModes: [VisualizerMode.KINETIC_WALL, VisualizerMode.DIGITAL_GRID] } },
  ambient: { nameKey: 'ambient', settings: { mode: VisualizerMode.SILK_WAVE, colorTheme: COLOR_THEMES[8], speed: 0.3, sensitivity: 1.2, glow: true, trails: true, smoothing: 0.95, includedModes: [VisualizerMode.SILK_WAVE, VisualizerMode.NEBULA] } }
};