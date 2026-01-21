/**
 * File: core/hooks/useAudioReactive.ts
 * Version: 1.0.8
 * Author: Aura Vision Team
 * Copyright (c) 2024 Aura Vision. All rights reserved.
 * Updated: 2025-02-20 20:15
 */

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { VisualizerSettings } from '../types';
import { getAverage, AdaptiveNoiseFilter } from '../services/audioUtils';
import { BeatDetector } from '../services/beatDetector';

interface UseAudioReactiveProps {
  analyser: AnalyserNode;
  colors: string[];
  settings: VisualizerSettings;
}

export const useAudioReactive = ({ analyser, colors, settings }: UseAudioReactiveProps) => {
  const dataArray = useRef(new Uint8Array(analyser.frequencyBinCount)).current;
  
  // Helper to ensure we have a minimum of 3 colors for scene shaders that destructure [c0, c1, c2]
  const getSafeColors = (inputColors: string[]) => {
    const base = inputColors.length > 0 ? inputColors : ['#ffffff'];
    const safe = [...base];
    while (safe.length < 3) {
      safe.push(base[0]);
    }
    return safe;
  };

  const smoothedColorsRef = useRef(getSafeColors(colors).map(c => new THREE.Color(c)));
  const targetColorRef = useRef(new THREE.Color());
  const beatDetectorRef = useRef(new BeatDetector());
  // Stateful noise filter for WebGL context
  const noiseFilterRef = useRef(new AdaptiveNoiseFilter());

  const audioData = useRef({ bass: 0, mids: 0, treble: 0, volume: 0, isBeat: false }).current;

  useFrame(() => {
    const smoothedColors = smoothedColorsRef.current;
    const safeInputColors = getSafeColors(colors);
    
    // 1. Smooth Color Transition Logic
    const lerpSpeed = 0.05;
    
    // Adjust smoothed colors array size if needed (e.g., if safeInputColors changed length)
    if (smoothedColors.length !== safeInputColors.length) {
      const currentLength = smoothedColors.length;
      const targetLength = safeInputColors.length;

      if (currentLength < targetLength) {
        for (let i = currentLength; i < targetLength; i++) {
          smoothedColors.push(new THREE.Color(safeInputColors[i] || safeInputColors[0] || '#ffffff'));
        }
      } else {
        smoothedColors.length = targetLength;
      }
    }

    smoothedColors.forEach((color, i) => {
      const targetHex = safeInputColors[i] || safeInputColors[0] || '#ffffff';
      color.lerp(targetColorRef.current.set(targetHex), lerpSpeed);
    });

    // 2. Audio Data Processing
    analyser.getByteFrequencyData(dataArray);
    
    // Intelligent Noise Filtering
    // Learns the noise floor over time and subtracts it
    noiseFilterRef.current.process(dataArray);
    
    audioData.isBeat = beatDetectorRef.current.detect(dataArray);
    
    audioData.bass = getAverage(dataArray, 0, 15) / 255 * settings.sensitivity;
    audioData.mids = getAverage(dataArray, 20, 80) / 255 * settings.sensitivity;
    audioData.treble = getAverage(dataArray, 100, 160) / 255 * settings.sensitivity;
    audioData.volume = getAverage(dataArray, 0, dataArray.length) / 255;
  });

  return { ...audioData, smoothedColors: smoothedColorsRef.current };
};