/**
 * File: core/hooks/useAudioReactive.ts
 * Version: 1.7.42
 * Author: Sut
 * Copyright (c) 2024 Aura Vision. All rights reserved.
 * Updated: 2025-03-05 12:00
 */

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Color } from 'three';
import { VisualizerSettings } from '../types';
import { getAverage, AdaptiveNoiseFilter, DynamicPeakLimiter, applySoftCompression } from '../services/audioUtils';
import { BeatDetector } from '../services/beatDetector';

interface UseAudioReactiveProps {
  analyser: AnalyserNode;
  colors: string[];
  settings: VisualizerSettings;
}

const getSafeColors = (inputColors: string[]) => {
  const base = inputColors.length > 0 ? inputColors : ['#ffffff'];
  const safe = [...base];
  while (safe.length < 3) {
    safe.push(base[0]);
  }
  return safe;
};

export const useAudioReactive = ({ analyser, colors, settings }: UseAudioReactiveProps) => {
  const dataArray = useRef(new Uint8Array(analyser.frequencyBinCount)).current;
  
  const safeInputColors = useMemo(() => getSafeColors(colors), [colors]);

  const smoothedColorsRef = useRef(safeInputColors.map(c => new Color(c)));
  const targetColorRef = useRef(new Color());
  const beatDetectorRef = useRef(new BeatDetector());
  const noiseFilterRef = useRef(new AdaptiveNoiseFilter());
  
  // --- New: Dynamic Response Processors ---
  const peakLimiterRef = useRef(new DynamicPeakLimiter());

  const audioData = useRef({ bass: 0, mids: 0, treble: 0, volume: 0, isBeat: false }).current;

  useFrame(() => {
    const smoothedColors = smoothedColorsRef.current;
    const lerpSpeed = 0.05;
    
    if (smoothedColors.length !== safeInputColors.length) {
      const currentLength = smoothedColors.length;
      const targetLength = safeInputColors.length;
      if (currentLength < targetLength) {
        for (let i = currentLength; i < targetLength; i++) {
          smoothedColors.push(new Color(safeInputColors[i] || safeInputColors[0] || '#ffffff'));
        }
      } else {
        smoothedColors.length = targetLength;
      }
    }

    smoothedColors.forEach((color, i) => {
      const targetHex = safeInputColors[i] || safeInputColors[0] || '#ffffff';
      color.lerp(targetColorRef.current.set(targetHex), lerpSpeed);
    });

    analyser.getByteFrequencyData(dataArray);
    noiseFilterRef.current.process(dataArray);
    
    // 1. Calculate Raw Energy for Limiter
    const rawVolume = getAverage(dataArray, 0, dataArray.length) / 255;
    const normFactor = peakLimiterRef.current.process(rawVolume);
    
    // 2. Beat Detection
    audioData.isBeat = beatDetectorRef.current.detect(dataArray);
    
    // 3. Process Features with Non-linear Compression
    // applySoftCompression squashes the high end so it doesn't "clip" visuals.
    const rawBass = (getAverage(dataArray, 0, 15) / 255) * normFactor;
    const rawMids = (getAverage(dataArray, 20, 80) / 255) * normFactor;
    const rawTreble = (getAverage(dataArray, 100, 160) / 255) * normFactor;

    audioData.bass = applySoftCompression(rawBass, 0.7) * settings.sensitivity;
    audioData.mids = applySoftCompression(rawMids, 0.75) * settings.sensitivity;
    audioData.treble = applySoftCompression(rawTreble, 0.8) * settings.sensitivity;
    audioData.volume = applySoftCompression(rawVolume * normFactor, 0.9);
  });

  return { ...audioData, smoothedColors: smoothedColorsRef.current };
};