/**
 * File: components/ui/CustomTextOverlay.tsx
 * Version: 1.0.6
 * Author: Aura Vision Team
 * Copyright (c) 2024 Aura Vision. All rights reserved.
 * Updated: 2025-03-05 12:00
 */

import React, { useRef, useEffect } from 'react';
import { VisualizerSettings } from '../../core/types';
import { useAudioPulse } from '../../core/hooks/useAudioPulse';

interface CustomTextOverlayProps {
  settings: VisualizerSettings;
  analyser: AnalyserNode | null;
}

const CustomTextOverlay: React.FC<CustomTextOverlayProps> = ({ settings, analyser }) => {
  const textRef = useRef<HTMLDivElement>(null);
  const hueRef = useRef(0);
  const lastTimeRef = useRef(0);
  const sizeVw = settings.customTextSize || 12;
  const sizePx = sizeVw * 13; 

  const pulseEnabled = settings.showCustomText && !!settings.customText && settings.textPulse;
  
  // Always use the optimized 'beat' mode which now includes breathing/hybrid behavior
  useAudioPulse({
    elementRef: textRef,
    analyser,
    settings,
    isEnabled: pulseEnabled,
    baseOpacity: settings.customTextOpacity,
    mode: 'beat', 
    pulseStrength: 0.6, 
    opacityStrength: 0.5
  });
  
  useEffect(() => {
    let rafId: number;
    
    const animateColor = (timestamp: number) => {
      if (!lastTimeRef.current) lastTimeRef.current = timestamp;
      const deltaTime = timestamp - lastTimeRef.current;
      lastTimeRef.current = timestamp;

      if (textRef.current && settings.customTextCycleColor) {
        const interval = settings.customTextCycleInterval || 5; 
        const speed = 360 / Math.max(0.1, interval);
        const delta = (deltaTime / 1000) * speed;
        
        hueRef.current = (hueRef.current + delta) % 360;
        textRef.current.style.color = `hsl(${hueRef.current}, 100%, 65%)`;
        
        rafId = requestAnimationFrame(animateColor);
      }
    };

    if (settings.customTextCycleColor) {
      rafId = requestAnimationFrame(animateColor);
    } else if (textRef.current) {
      // FIX: Ensure color resets correctly when cycling is toggled off
      textRef.current.style.color = settings.customTextColor || '#ffffff';
      lastTimeRef.current = 0;
    }

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      lastTimeRef.current = 0;
    };
  }, [settings.customTextCycleColor, settings.customTextColor, settings.customTextCycleInterval]);


  if (!settings.showCustomText || !settings.customText) return null;

  const getPositionClasses = () => {
      const pos = settings.customTextPosition || 'mc';
      const map: Record<string, string> = {
          tl: 'top-8 left-8 text-left items-start',
          tc: 'top-8 left-1/2 -translate-x-1/2 text-center items-center',
          tr: 'top-8 right-8 text-right items-end',
          ml: 'top-1/2 left-8 -translate-y-1/2 text-left items-start',
          mc: 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center items-center',
          mr: 'top-1/2 right-8 -translate-y-1/2 text-right items-end',
          bl: 'bottom-8 left-8 text-left items-start',
          bc: 'bottom-8 left-1/2 -translate-x-1/2 text-center items-center',
          br: 'bottom-8 right-8 text-right items-end',
      };
      return map[pos] || map.mc;
  };

  const rotation = settings.customTextRotation || 0;
  const textShadow = settings.customText3D 
    ? '4px 4px 8px rgba(0,0,0,0.9), -2px -2px 2px rgba(255,255,255,0.25)' 
    : 'none';

  return (
    <div className={`pointer-events-none fixed z-[100] flex flex-col ${getPositionClasses()}`}>
      <div 
        ref={textRef} 
        className="font-black tracking-widest uppercase select-none inline-block origin-center break-words transition-opacity duration-300"
        style={{ 
            color: settings.customTextCycleColor ? undefined : (settings.customTextColor || '#ffffff'),
            fontSize: `min(${sizeVw}vw, ${sizePx}px)`, 
            whiteSpace: 'pre-wrap', 
            lineHeight: 1.1,
            fontFamily: settings.customTextFont || 'Inter, sans-serif',
            textShadow,
            // FIX: Use fallback values when pulse is disabled to ensure settings are respected immediately
            transform: `rotate(${rotation}deg) ${pulseEnabled ? 'scale(var(--pulse-scale, 1))' : ''}`,
            opacity: pulseEnabled ? 'var(--pulse-opacity, 1)' : settings.customTextOpacity
        } as React.CSSProperties}
      >
        {settings.customText}
      </div>
    </div>
  );
};

export default CustomTextOverlay;