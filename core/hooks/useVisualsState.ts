/**
 * File: core/hooks/useVisualsState.ts
 * Version: 2.1.0
 * Author: Sut
 * Updated: 2025-03-25 22:15 - Added AI Background defaults.
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useLocalStorage } from './useLocalStorage';
import { VisualizerMode, VisualizerSettings, SmartPreset, LyricsStyle } from '../types';
import { COLOR_THEMES, VISUALIZER_PRESETS } from '../constants';

const DEFAULT_MODE = VisualizerMode.PLASMA;
const DEFAULT_THEME_INDEX = 1;

export const DEFAULT_SETTINGS: VisualizerSettings = {
  uiMode: 'advanced',
  appTheme: 'dark',
  sensitivity: 1.5,
  speed: 1.0,
  glow: true,
  trails: true,
  autoRotate: false,
  rotateInterval: 30,
  includedModes: Object.values(VisualizerMode),
  cycleColors: false,
  colorInterval: 10,
  hideCursor: false,
  smoothing: 0.8,
  fftSize: 512,
  quality: 'med',
  monitor: false,
  wakeLock: false,
  showAlbumArtOverlay: true,
  showSongInfo: true,
  aiBgUrl: '',
  showAiBg: false,
  aiBgOpacity: 0.5,
  aiBgBlur: 10,
  customText: 'AURA',
  showCustomText: false,
  textSource: 'AUTO',
  textPulse: true,
  customTextRotation: 0,
  customTextSize: 12,
  customTextFont: 'Inter, sans-serif',
  customTextOpacity: 1.0,
  customTextColor: '#ffffff',
  customTextPosition: 'mc',
  customTextCycleColor: false,
  customTextCycleInterval: 5,
  customText3D: false,
  lyricsPosition: 'mc',
  recognitionProvider: 'GEMINI',
  lyricsStyle: LyricsStyle.KARAOKE,
  lyricsFont: 'Inter, sans-serif',
  lyricsFontSize: 4,
  region: 'global',
  showFps: false,
  showTooltips: true,
  doubleClickFullscreen: true,
  autoHideUi: true,
  mirrorDisplay: false
};

const NO_GLOW_MODES = [
    VisualizerMode.BARS,
    VisualizerMode.TUNNEL,
    VisualizerMode.RINGS,
    VisualizerMode.FLUID_CURVES,
    VisualizerMode.WAVEFORM,
    VisualizerMode.SILK_WAVE
];

const NO_TRAILS_MODES = [
    VisualizerMode.BARS,
    VisualizerMode.WAVEFORM,
    VisualizerMode.NEURAL_FLOW,
    VisualizerMode.FLUID_CURVES,
    VisualizerMode.SILK_WAVE
];

export const useVisualsState = (hasStarted: boolean, initialSettings: VisualizerSettings) => {
  const { getStorage, setStorage } = useLocalStorage();

  const [mode, setModeInternal] = useState<VisualizerMode>(() => {
    const saved = getStorage('mode', DEFAULT_MODE);
    return Object.values(VisualizerMode).includes(saved as VisualizerMode) ? (saved as VisualizerMode) : DEFAULT_MODE;
  });

  const [colorTheme, setColorThemeInternal] = useState<string[]>(() => {
    const saved = getStorage('theme', COLOR_THEMES[DEFAULT_THEME_INDEX]);
    if (Array.isArray(saved) && saved.length > 0) return saved;
    return COLOR_THEMES[DEFAULT_THEME_INDEX];
  });

  const [settings, setSettings] = useState<VisualizerSettings>(() => {
    const saved = getStorage<Partial<VisualizerSettings>>('settings', {});
    return { ...DEFAULT_SETTINGS, ...initialSettings, ...saved };
  });

  const [activePreset, setActivePreset] = useState<string>('');
  const rotateIntervalRef = useRef<number | null>(null);
  const colorIntervalRef = useRef<number | null>(null);

  const setMode = useCallback((value: React.SetStateAction<VisualizerMode>) => {
    setModeInternal(prev => {
        const nextMode = typeof value === 'function' ? (value as Function)(prev) : value;
        const forceNoGlow = NO_GLOW_MODES.includes(nextMode);
        const forceNoTrails = NO_TRAILS_MODES.includes(nextMode);
        if (forceNoGlow || forceNoTrails) {
            setSettings(s => ({
                ...s,
                glow: forceNoGlow ? false : s.glow,
                trails: forceNoTrails ? false : s.trails
            }));
        }
        return nextMode;
    });
    setActivePreset('');
  }, []);

  const setColorTheme = useCallback((value: React.SetStateAction<string[]>) => {
    setColorThemeInternal(value);
    setActivePreset('');
  }, []);

  useEffect(() => {
    if (settings.autoRotate && hasStarted) {
      rotateIntervalRef.current = window.setInterval(() => {
        setModeInternal(currentMode => {
          const availableModes = (settings.includedModes && settings.includedModes.length > 0) 
            ? settings.includedModes 
            : Object.keys(VISUALIZER_PRESETS) as VisualizerMode[];
          const currentIndex = availableModes.indexOf(currentMode);
          const nextIndex = currentIndex === -1 ? 0 : (currentIndex + 1) % availableModes.length;
          const nextMode = availableModes[nextIndex];
          const forceNoGlow = NO_GLOW_MODES.includes(nextMode);
          const forceNoTrails = NO_TRAILS_MODES.includes(nextMode);
          if (forceNoGlow || forceNoTrails) {
              setSettings(prev => ({
                  ...prev,
                  glow: forceNoGlow ? false : prev.glow,
                  trails: forceNoTrails ? false : prev.trails
              }));
          }
          return nextMode;
        });
      }, (settings.rotateInterval || 30) * 1000);
    }
    return () => { if (rotateIntervalRef.current) clearInterval(rotateIntervalRef.current); };
  }, [settings.autoRotate, settings.rotateInterval, settings.includedModes, hasStarted]);
  
  useEffect(() => {
    if (settings.cycleColors && hasStarted) {
      colorIntervalRef.current = window.setInterval(() => {
        setColorThemeInternal(currentTheme => {
          const currentIndex = COLOR_THEMES.findIndex(t => JSON.stringify(t) === JSON.stringify(currentTheme));
          const nextIndex = (currentIndex + 1) % COLOR_THEMES.length;
          return COLOR_THEMES[nextIndex];
        });
      }, (settings.colorInterval || 10) * 1000);
    }
    return () => { if (colorIntervalRef.current) clearInterval(colorIntervalRef.current); };
  }, [settings.cycleColors, settings.colorInterval, hasStarted]);

  const randomizeSettings = useCallback(() => {
    setColorThemeInternal(COLOR_THEMES[Math.floor(Math.random() * COLOR_THEMES.length)]);
    const availableModes = (settings.includedModes && settings.includedModes.length > 0)
        ? settings.includedModes
        : Object.keys(VISUALIZER_PRESETS) as VisualizerMode[];
    const nextMode = availableModes[Math.floor(Math.random() * availableModes.length)] as VisualizerMode;
    setModeInternal(nextMode);
    const heavyModes = [VisualizerMode.NEURAL_FLOW, VisualizerMode.KINETIC_WALL, VisualizerMode.RESONANCE_ORB, VisualizerMode.CUBE_FIELD, VisualizerMode.NEBULA];
    const isHeavy = heavyModes.includes(nextMode);
    const forceNoGlow = NO_GLOW_MODES.includes(nextMode);
    const forceNoTrails = NO_TRAILS_MODES.includes(nextMode);
    setSettings(p => ({ 
        ...p, 
        speed: 0.8 + Math.random() * 0.8, 
        sensitivity: 1.2 + Math.random() * 1.0, 
        glow: forceNoGlow ? false : (isHeavy ? Math.random() > 0.7 : Math.random() > 0.15), 
        trails: forceNoTrails ? false : (isHeavy ? Math.random() > 0.6 : Math.random() > 0.2), 
        smoothing: 0.7 + Math.random() * 0.2 
    }));
    setActivePreset('');
  }, [settings.includedModes]);

  const applyPreset = useCallback((preset: SmartPreset) => {
    setSettings(prev => ({ ...prev, ...preset.settings }));
    setModeInternal(preset.settings.mode);
    setColorThemeInternal(preset.settings.colorTheme);
    setActivePreset(preset.nameKey);
  }, []);

  const resetVisualSettings = useCallback(() => {
    setModeInternal(DEFAULT_MODE);
    setColorThemeInternal(COLOR_THEMES[DEFAULT_THEME_INDEX]);
    setSettings(prev => ({
      ...prev,
      speed: DEFAULT_SETTINGS.speed,
      sensitivity: DEFAULT_SETTINGS.sensitivity,
      glow: DEFAULT_SETTINGS.glow,
      trails: DEFAULT_SETTINGS.trails,
      autoRotate: DEFAULT_SETTINGS.autoRotate,
      rotateInterval: DEFAULT_SETTINGS.rotateInterval,
      cycleColors: DEFAULT_SETTINGS.cycleColors,
      colorInterval: DEFAULT_SETTINGS.colorInterval,
      smoothing: DEFAULT_SETTINGS.smoothing,
      quality: DEFAULT_SETTINGS.quality,
      includedModes: DEFAULT_SETTINGS.includedModes,
      aiBgUrl: DEFAULT_SETTINGS.aiBgUrl,
      showAiBg: DEFAULT_SETTINGS.showAiBg
    }));
    setActivePreset('');
  }, []);

  const resetTextSettings = useCallback(() => {
    setSettings(prev => ({
      ...prev,
      customText: DEFAULT_SETTINGS.customText,
      showCustomText: DEFAULT_SETTINGS.showCustomText,
      textSource: DEFAULT_SETTINGS.textSource,
      textPulse: DEFAULT_SETTINGS.textPulse,
      customTextRotation: DEFAULT_SETTINGS.customTextRotation,
      customTextSize: DEFAULT_SETTINGS.customTextSize,
      customTextFont: DEFAULT_SETTINGS.customTextFont,
      customTextOpacity: DEFAULT_SETTINGS.customTextOpacity,
      customTextColor: DEFAULT_SETTINGS.customTextColor,
      customTextPosition: DEFAULT_SETTINGS.customTextPosition,
      customTextCycleColor: DEFAULT_SETTINGS.customTextCycleColor,
      customTextCycleInterval: DEFAULT_SETTINGS.customTextCycleInterval,
      customText3D: DEFAULT_SETTINGS.customText3D
    }));
  }, []);

  const resetAudioSettings = useCallback(() => {
    setSettings(prev => ({
      ...prev,
      sensitivity: DEFAULT_SETTINGS.sensitivity,
      smoothing: DEFAULT_SETTINGS.smoothing,
      fftSize: DEFAULT_SETTINGS.fftSize,
      recognitionProvider: DEFAULT_SETTINGS.recognitionProvider,
      region: DEFAULT_SETTINGS.region
    }));
  }, []);

  return { 
    mode, setMode, 
    colorTheme, setColorTheme, 
    settings, setSettings, 
    activePreset, setActivePreset, 
    randomizeSettings, 
    resetVisualSettings, 
    resetTextSettings, 
    resetAudioSettings,
    applyPreset 
  };
};