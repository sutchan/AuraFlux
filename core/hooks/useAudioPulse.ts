/**
 * File: core/hooks/useAudioPulse.ts
 * Version: 1.8.23
 * Author: Aura Flux Team
 * Copyright (c) 2024 Aura Flux. All rights reserved.
 */

import React, { useRef, useEffect } from 'react';
import { VisualizerSettings } from '../types';
import { BeatDetector } from '../services/beatDetector';

interface UseAudioPulseProps {
  elementRef: React.RefObject<HTMLElement | null>;
  analyser: AnalyserNode | null;
  settings: Pick<VisualizerSettings, 'sensitivity'>;
  isEnabled: boolean;
  pulseStrength?: number;
  opacityStrength?: number;
  baseOpacity?: number;
  mode?: 'volume' | 'beat';
}

export const useAudioPulse = ({
  elementRef,
  analyser,
  settings,
  isEnabled,
  pulseStrength = 0.5,
  opacityStrength = 0.4,
  baseOpacity = 1.0,
  mode = 'volume'
}: UseAudioPulseProps) => {
  const requestRef = useRef<number>(0);
  const beatDetectorRef = useRef<BeatDetector | null>(null);
  const beatScaleRef = useRef(1.0);

  useEffect(() => {
    if (!beatDetectorRef.current) {
        beatDetectorRef.current = new BeatDetector();
    }

    const cleanup = () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      const el = elementRef.current;
      if (el) {
        el.style.removeProperty('--pulse-scale');
        el.style.removeProperty('--pulse-opacity');
        el.style.willChange = 'auto';
      }
    };

    if (!isEnabled) {
      cleanup();
      return;
    }

    const el = elementRef.current;
    if (el) {
      el.style.willChange = 'transform, opacity';
      el.style.setProperty('--pulse-scale', '1');
      el.style.setProperty('--pulse-opacity', baseOpacity.toString());
    }

    const animate = () => {
      if (elementRef.current && analyser) {
        const dataArray = new Uint8Array(analyser.frequencyBinCount);
        analyser.getByteFrequencyData(dataArray);
        
        let scale = 1;
        let opacity = baseOpacity;

        let bass = 0;
        const bassBins = 10;
        for (let i = 0; i < bassBins; i++) bass += dataArray[i];
        const bassNormalized = (bass / bassBins) / 255;

        if (mode === 'beat') {
            const isBeat = beatDetectorRef.current?.detect(dataArray);
            if (isBeat) {
                beatScaleRef.current = 1.0 + (pulseStrength * settings.sensitivity);
            }
            beatScaleRef.current += (1.0 - beatScaleRef.current) * 0.12;
            const breathing = bassNormalized * 0.3 * settings.sensitivity;
            scale = beatScaleRef.current + breathing;
            const flash = (scale - 1.0) * opacityStrength; 
            opacity = Math.min(1, baseOpacity + flash);
        } else {
            scale = 1 + (bassNormalized * pulseStrength * settings.sensitivity);
            opacity = Math.min(1, (1.0 - opacityStrength + bassNormalized * opacityStrength) * baseOpacity);
        }

        elementRef.current.style.setProperty('--pulse-scale', scale.toFixed(3));
        elementRef.current.style.setProperty('--pulse-opacity', opacity.toFixed(3));
      }
      requestRef.current = requestAnimationFrame(animate);
    };

    requestRef.current = requestAnimationFrame(animate);
    return cleanup;
  }, [isEnabled, analyser, settings.sensitivity, pulseStrength, opacityStrength, baseOpacity, elementRef, mode]);
};