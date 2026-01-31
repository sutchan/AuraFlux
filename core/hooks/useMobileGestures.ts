/**
 * File: core/hooks/useMobileGestures.ts
 * Version: 1.8.23
 * Author: Aura Flux Team
 * Copyright (c) 2024 Aura Flux. All rights reserved.
 */

import React, { useRef, useCallback } from 'react';
import { useVisuals, useAI } from '../../components/AppContext';
import { VisualizerMode } from '../types';

export const useMobileGestures = () => {
  const { mode, setMode, setSettings } = useVisuals();
  const { showLyrics, setShowLyrics } = useAI();

  const touchStartRef = useRef<{ x: number, y: number, time: number } | null>(null);
  const longPressTimerRef = useRef<number | null>(null);
  const isLongPressTriggeredRef = useRef(false);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (e.touches.length !== 1) return;
    const target = e.target as HTMLElement;
    if (target.closest('button, input, select, textarea, a, [role="button"], [role="slider"], .no-gesture')) return;

    const t = e.touches[0];
    touchStartRef.current = { x: t.clientX, y: t.clientY, time: Date.now() };
    isLongPressTriggeredRef.current = false;

    longPressTimerRef.current = window.setTimeout(() => {
        setShowLyrics(!showLyrics);
        if (typeof navigator !== 'undefined' && navigator.vibrate) {
            navigator.vibrate(50);
        }
        isLongPressTriggeredRef.current = true;
    }, 800);
  }, [setShowLyrics, showLyrics]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
      if (!touchStartRef.current) return;
      const t = e.touches[0];
      const deltaX = t.clientX - touchStartRef.current.x;
      const deltaY = t.clientY - touchStartRef.current.y;
      const dist = Math.sqrt(deltaX*deltaX + deltaY*deltaY);
      if (dist > 10 && longPressTimerRef.current) {
          clearTimeout(longPressTimerRef.current);
          longPressTimerRef.current = null;
      }
  }, []);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (longPressTimerRef.current) {
        clearTimeout(longPressTimerRef.current);
        longPressTimerRef.current = null;
    }
    if (isLongPressTriggeredRef.current) {
        touchStartRef.current = null;
        return;
    }
    if (!touchStartRef.current) return;
    const t = e.changedTouches[0];
    const deltaX = t.clientX - touchStartRef.current.x;
    const deltaY = t.clientY - touchStartRef.current.y;
    const duration = Date.now() - touchStartRef.current.time;
    touchStartRef.current = null;

    if (duration > 500) return; 
    const absX = Math.abs(deltaX);
    const absY = Math.abs(deltaY);
    if (Math.max(absX, absY) < 50) return; 

    if (absX > absY) {
        const modes = Object.values(VisualizerMode);
        const currentIdx = modes.indexOf(mode);
        if (deltaX < 0) {
            setMode(modes[(currentIdx + 1) % modes.length]);
        } else {
            setMode(modes[(currentIdx - 1 + modes.length) % modes.length]);
        }
    } else {
        const step = 0.5;
        setSettings(s => ({ ...s, sensitivity: Math.max(0.5, Math.min(4.0, s.sensitivity + (deltaY < 0 ? step : -step))) }));
    }
  }, [mode, setMode, setSettings]);

  return { onTouchStart: handleTouchStart, onTouchMove: handleTouchMove, onTouchEnd: handleTouchEnd };
};