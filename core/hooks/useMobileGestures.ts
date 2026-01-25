/**
 * File: core/hooks/useMobileGestures.ts
 * Version: 1.7.32
 * Author: Aura Vision Team
 * Copyright (c) 2024 Aura Vision. All rights reserved.
 * Updated: 2025-03-05 12:00
 */

import React, { useRef, useCallback } from 'react';
import { useVisuals, useAI } from '../../components/AppContext';
import { VisualizerMode } from '../types';

export const useMobileGestures = () => {
  const { mode, setMode, setSettings } = useVisuals();
  const { setShowLyrics } = useAI();

  const touchStartRef = useRef<{ x: number, y: number, time: number } | null>(null);
  const longPressTimerRef = useRef<number | null>(null);
  const isLongPressTriggeredRef = useRef(false);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    // Only handle single touch gestures to allow pinch-to-zoom (if enabled) or browser gestures
    if (e.touches.length !== 1) return;
    
    // Avoid conflict with interactive controls (buttons, inputs, etc.)
    const target = e.target as HTMLElement;
    if (target.closest('button, input, select, textarea, a, [role="button"], [role="slider"], .no-gesture')) return;

    const t = e.touches[0];
    touchStartRef.current = { x: t.clientX, y: t.clientY, time: Date.now() };
    isLongPressTriggeredRef.current = false;

    // Start Long Press Timer (800ms) for AI Toggle
    longPressTimerRef.current = window.setTimeout(() => {
        setShowLyrics(prev => !prev);
        // Haptic feedback
        if (typeof navigator !== 'undefined' && navigator.vibrate) {
            navigator.vibrate(50);
        }
        isLongPressTriggeredRef.current = true;
    }, 800);
  }, [setShowLyrics]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
      if (!touchStartRef.current) return;
      const t = e.touches[0];
      const deltaX = t.clientX - touchStartRef.current.x;
      const deltaY = t.clientY - touchStartRef.current.y;
      const dist = Math.sqrt(deltaX*deltaX + deltaY*deltaY);

      // Cancel long press if moved significantly (> 10px)
      if (dist > 10) {
          if (longPressTimerRef.current) {
              clearTimeout(longPressTimerRef.current);
              longPressTimerRef.current = null;
          }
      }
  }, []);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    // Clean up long press timer
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

    // Swipe validation: must be fast enough (<500ms)
    if (duration > 500) return; 
    
    const absX = Math.abs(deltaX);
    const absY = Math.abs(deltaY);

    // Swipe validation: must be long enough (>50px)
    if (Math.max(absX, absY) < 50) return; 

    if (absX > absY) {
        // Horizontal Swipe: Cycle Mode
        const modes = Object.values(VisualizerMode);
        const currentIdx = modes.indexOf(mode);
        if (deltaX < 0) {
            // Swipe Left -> Next Mode
            const nextIdx = (currentIdx + 1) % modes.length;
            setMode(modes[nextIdx]);
        } else {
            // Swipe Right -> Prev Mode
            const prevIdx = (currentIdx - 1 + modes.length) % modes.length;
            setMode(modes[prevIdx]);
        }
    } else {
        // Vertical Swipe: Adjust Sensitivity
        const step = 0.5; // Chunkier step for gesture control
        setSettings(s => {
            let newSens = s.sensitivity;
            if (deltaY < 0) {
                // Swipe Up -> Increase
                newSens += step;
            } else {
                // Swipe Down -> Decrease
                newSens -= step;
            }
            return { ...s, sensitivity: Math.max(0.5, Math.min(4.0, newSens)) };
        });
    }
  }, [mode, setMode, setSettings]);

  return {
      onTouchStart: handleTouchStart,
      onTouchMove: handleTouchMove,
      onTouchEnd: handleTouchEnd
  };
};