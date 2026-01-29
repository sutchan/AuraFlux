/**
 * File: core/hooks/useVisualsState.ts
 * Version: 1.8.4
 * Author: Sut
 * Copyright (c) 2024 Aura Vision. All rights reserved.
 * Updated: 2025-03-10 23:35
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useLocalStorage } from './useLocalStorage';
import { VisualizerMode, VisualizerSettings, SmartPreset } from '../types';
import { COLOR_THEMES, VISUALIZER_PRESETS } from '../constants';

const DEFAULT_MODE = VisualizerMode.PLASMA;
const DEFAULT_THEME_INDEX = 1;

// Regex for validating Hex colors
const HEX_COLOR_REGEX = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;

const NO_GLOW_MODES = [
    VisualizerMode.BARS, VisualizerMode.TUNNEL,
    VisualizerMode.RINGS, VisualizerMode.FLUID_CURVES,
    VisualizerMode.WAVEFORM
];

const NO_TRAILS_MODES = [
    VisualizerMode.BARS,
    VisualizerMode.RINGS,
    VisualizerMode.LASERS,
    VisualizerMode.WAVEFORM
];

export const useVisualsState = (hasStarted: boolean, initialSettings: VisualizerSettings) => {
  const { getStorage, setStorage } = useLocalStorage();

  // Robustness: Validate enum from storage. If invalid (old version data), fallback to default.
  const [mode, setModeInternal] = useState<VisualizerMode>(() => {
    const saved = getStorage('mode', DEFAULT_MODE);
    return Object.values(VisualizerMode).includes(saved as VisualizerMode) ? (saved as VisualizerMode) : DEFAULT_MODE;
  });

  const [colorTheme, setColorThemeInternal] = useState<string[]>(() => {
    const saved = getStorage('theme', COLOR_THEMES[DEFAULT_THEME_INDEX]);
    
    // DEFENSE: Deep validation of color theme array
    if (Array.isArray(saved) && saved.length > 0) {
        const isValid = saved.every(c => typeof c === 'string' && HEX_COLOR_REGEX.test(c));
        if (isValid) return saved;
    }
    
    return COLOR_THEMES[DEFAULT_THEME_INDEX];
  });

  // --- Robustness: Deep settings validation & merge ---
  const [settings, setSettings] = useState<VisualizerSettings>(() => {
    const saved = getStorage<Partial<VisualizerSettings>>('settings', {});
    // Merge saved with initial to ensure no fields are missing due to version changes
    return { ...initialSettings, ...saved };
  });

  const [activePreset, setActivePreset] = useState<string>('');
  
  const rotateIntervalRef = useRef<number | null>(null);
  const colorIntervalRef = useRef<number | null>(null);

  const setMode = useCallback((value: React.SetStateAction<VisualizerMode>) => {
    setModeInternal(value);
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
          let nextMode: VisualizerMode;
          
          if (currentIndex === -1) {
            nextMode = availableModes[0];
          } else {
            const nextIndex = (currentIndex + 1) % availableModes.length;
            nextMode = availableModes[nextIndex];
          }

          // Enforce constraints for specific modes
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
    return () => {
      if (rotateIntervalRef.current) clearInterval(rotateIntervalRef.current);
    };
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
    return () => {
      if (colorIntervalRef.current) clearInterval(colorIntervalRef.current);
    };
  }, [settings.cycleColors, settings.colorInterval, hasStarted]);

  const randomizeSettings = useCallback(() => {
    // 1. Pick a random color theme
    setColorThemeInternal(COLOR_THEMES[Math.floor(Math.random() * COLOR_THEMES.length)]);
    
    // 2. Pick a mode from the whitelist or global list
    const availableModes = (settings.includedModes && settings.includedModes.length > 0)
        ? settings.includedModes
        : Object.keys(VISUALIZER_PRESETS) as VisualizerMode[];
    
    const nextMode = availableModes[Math.floor(Math.random() * availableModes.length)] as VisualizerMode;
    setModeInternal(nextMode);
    
    // 3. Performance-Aware & Aesthetic Setting Randomization
    const heavyModes = [
        VisualizerMode.NEURAL_FLOW, VisualizerMode.KINETIC_WALL,
        VisualizerMode.LIQUID, VisualizerMode.CUBE_FIELD,
        VisualizerMode.NEBULA, VisualizerMode.MACRO_BUBBLES
    ];
    
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
    // Apply all settings from the preset, merging over the existing state
    setSettings(prev => ({ ...prev, ...preset.settings }));
    setModeInternal(preset.settings.mode);
    setColorThemeInternal(preset.settings.colorTheme);
    setActivePreset(preset.nameKey);
  }, [setSettings]);

  const resetVisualSettings = useCallback(() => {
    setSettings(prev => ({
      ...prev,
      speed: initialSettings.speed,
      sensitivity: initialSettings.sensitivity,
      glow: initialSettings.glow,
      trails: initialSettings.trails,
      autoRotate: initialSettings.autoRotate,
      rotateInterval: initialSettings.rotateInterval,
      cycleColors: initialSettings.cycleColors,
      colorInterval: initialSettings.colorInterval
    }));
    setActivePreset('');
  }, [setSettings, initialSettings]);

  return {
    mode, setMode,
    colorTheme, setColorTheme,
    settings, setSettings,
    activePreset, setActivePreset,
    randomizeSettings,
    resetVisualSettings,
    applyPreset
  };
};