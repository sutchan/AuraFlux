/**
 * File: core/hooks/useVisualsState.ts
 * Version: 1.1.3
 * Author: Sut
 * Copyright (c) 2024 Aura Vision. All rights reserved.
 * Updated: 2025-02-26 02:00
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useLocalStorage } from './useLocalStorage';
import { VisualizerMode, VisualizerSettings, SmartPreset } from '../types';
import { COLOR_THEMES } from '../constants';

const DEFAULT_MODE = VisualizerMode.PLASMA;
const DEFAULT_THEME_INDEX = 1;

// Regex for validating Hex colors
const HEX_COLOR_REGEX = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;

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
          // Robustness: Fallback to all modes if includedModes is somehow undefined or empty
          const availableModes = (settings.includedModes && settings.includedModes.length > 0) 
            ? settings.includedModes 
            : Object.values(VisualizerMode);
            
          // If the current mode is not in the whitelist, jump to the first one available
          if (!availableModes.includes(currentMode)) {
              return availableModes[0];
          }
          
          const currentIndex = availableModes.indexOf(currentMode);
          const nextIndex = (currentIndex + 1) % availableModes.length;
          return availableModes[nextIndex];
        });
      }, settings.rotateInterval * 1000);
    } else if (rotateIntervalRef.current) {
      clearInterval(rotateIntervalRef.current);
      rotateIntervalRef.current = null;
    }
    return () => { if (rotateIntervalRef.current) clearInterval(rotateIntervalRef.current); };
  }, [settings.autoRotate, settings.rotateInterval, settings.includedModes, hasStarted]);

  useEffect(() => {
    if (settings.cycleColors && hasStarted) {
      colorIntervalRef.current = window.setInterval(() => {
        const randomIndex = Math.floor(Math.random() * COLOR_THEMES.length);
        setColorThemeInternal(COLOR_THEMES[randomIndex]);
      }, settings.colorInterval * 1000);
    } else if (colorIntervalRef.current) {
      clearInterval(colorIntervalRef.current);
      colorIntervalRef.current = null;
    }
    return () => { if (colorIntervalRef.current) clearInterval(colorIntervalRef.current); };
  }, [settings.cycleColors, settings.colorInterval, hasStarted]);

  useEffect(() => {
    setStorage('mode', mode);
  }, [mode, setStorage]);

  useEffect(() => {
    setStorage('theme', colorTheme);
  }, [colorTheme, setStorage]);

  const randomizeSettings = useCallback(() => {
    // 1. Pick a random color theme
    setColorThemeInternal(COLOR_THEMES[Math.floor(Math.random() * COLOR_THEMES.length)]);
    
    // 2. Pick a mode from the whitelist or global list
    const availableModes = (settings.includedModes && settings.includedModes.length > 0)
        ? settings.includedModes
        : Object.values(VisualizerMode);
    
    const nextMode = availableModes[Math.floor(Math.random() * availableModes.length)];
    setModeInternal(nextMode);
    
    // 3. Performance-Aware Setting Randomization
    // Resource-heavy modes (WebGL and dense 2D) should have reduced probability of enabling heavy post-processing
    const heavyModes = [
        VisualizerMode.NEURAL_FLOW,
        VisualizerMode.KINETIC_WALL,
        VisualizerMode.LIQUID,
        VisualizerMode.CUBE_FIELD,
        VisualizerMode.CYBER_CITY,
        VisualizerMode.CRYSTAL_CORE,
        VisualizerMode.NEBULA,
        VisualizerMode.MACRO_BUBBLES
    ];
    
    const isHeavy = heavyModes.includes(nextMode);

    setSettings(p => ({ 
        ...p, 
        speed: 0.8 + Math.random() * 0.8, 
        sensitivity: 1.2 + Math.random() * 1.0, 
        // Logic: if heavy, 30% chance for glow/trails. If light, 85/80% chance.
        glow: isHeavy ? Math.random() > 0.7 : Math.random() > 0.15, 
        trails: isHeavy ? Math.random() > 0.6 : Math.random() > 0.2, 
        smoothing: 0.7 + Math.random() * 0.2 
    }));

    setActivePreset('');
  }, [settings.includedModes]);

  const applyPreset = useCallback((preset: SmartPreset) => {
    setModeInternal(preset.settings.mode);
    setColorThemeInternal(preset.settings.colorTheme);
    setSettings(p => ({
      ...p,
      speed: preset.settings.speed,
      sensitivity: preset.settings.sensitivity,
      glow: preset.settings.glow,
      trails: preset.settings.trails,
      smoothing: preset.settings.smoothing,
      fftSize: preset.settings.fftSize ?? p.fftSize,
      // Apply includedModes if present, otherwise default to just the active mode (as the "most appropriate")
      includedModes: preset.settings.includedModes || [preset.settings.mode],
    }));
    setActivePreset(preset.nameKey);
  }, []);

  const resetVisualSettings = useCallback(() => {
    setModeInternal(DEFAULT_MODE);
    setColorThemeInternal(COLOR_THEMES[DEFAULT_THEME_INDEX]);
    setSettings(p => ({
      ...p,
      speed: initialSettings.speed,
      sensitivity: initialSettings.sensitivity,
      glow: initialSettings.glow,
      trails: initialSettings.trails,
      autoRotate: initialSettings.autoRotate,
      cycleColors: initialSettings.cycleColors,
      smoothing: initialSettings.smoothing,
      hideCursor: initialSettings.hideCursor,
      quality: initialSettings.quality,
      includedModes: initialSettings.includedModes, // Reset allowed modes list
    }));
    setActivePreset('');
  }, [initialSettings]);

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