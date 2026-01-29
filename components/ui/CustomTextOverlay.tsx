
/**
 * File: components/ui/CustomTextOverlay.tsx
 * Version: 1.2.0
 * Author: Aura Vision Team
 * Copyright (c) 2024 Aura Vision. All rights reserved.
 * Updated: 2025-03-12 10:00
 */

import React, { useRef, useEffect, useState } from 'react';
import { VisualizerSettings, SongInfo } from '../../core/types';
import { useAudioPulse } from '../../core/hooks/useAudioPulse';

interface CustomTextOverlayProps {
  settings: VisualizerSettings;
  analyser: AnalyserNode | null;
  song?: SongInfo | null;
}

const CustomTextOverlay: React.FC<CustomTextOverlayProps> = ({ settings, analyser, song }) => {
  const textRef = useRef<HTMLDivElement>(null);
  const hueRef = useRef(0);
  const lastTimeRef = useRef(0);
  const sizeVw = settings.customTextSize || 12;
  const sizePx = sizeVw * 13; 
  
  const [timeString, setTimeString] = useState('');

  useEffect(() => {
    if (settings.textSource === 'CLOCK') {
        const updateTime = () => setTimeString(new Date().toLocaleTimeString([], { hour12: false }));
        updateTime();
        const interval = setInterval(updateTime, 1000);
        return () => clearInterval(interval);
    }
  }, [settings.textSource]);

  // Priority Logic based on textSource setting
  let isSongMode = false;
  let isClockMode = false;
  const mode = settings.textSource || 'AUTO';

  if (mode === 'SONG') {
      isSongMode = true;
  } else if (mode === 'CLOCK') {
      isClockMode = true;
  } else if (mode === 'CUSTOM') {
      isSongMode = false;
  } else {
      // AUTO mode
      // Show song info if available and valid; otherwise fallback to Custom Text.
      isSongMode = !!(song && (song.title || song.artist) && song.artist !== 'System Alert');
  }
  
  let mainText = '';
  let subText: string | null | undefined = null;

  if (isClockMode) {
      mainText = timeString;
  } else if (isSongMode) {
      mainText = song?.title || '';
      subText = song?.artist || '';
  } else {
      mainText = settings.customText;
  }

  const hasContent = !!mainText;
  const pulseEnabled = settings.showCustomText && hasContent && settings.textPulse;
  
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


  if (!settings.showCustomText || !hasContent) return null;

  // Increased margins from 8 (2rem) to 12 (3rem) for better aesthetic breathing room
  const getPositionClasses = () => {
      const pos = settings.customTextPosition || 'mc';
      const map: Record<string, string> = {
          tl: 'top-12 left-12 items-start',
          tc: 'top-12 left-1/2 -translate-x-1/2 items-center',
          tr: 'top-12 right-12 items-end',
          ml: 'top-1/2 left-12 -translate-y-1/2 items-start',
          mc: 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 items-center',
          mr: 'top-1/2 right-12 -translate-y-1/2 items-end',
          bl: 'bottom-12 left-12 items-start',
          bc: 'bottom-12 left-1/2 -translate-x-1/2 items-center',
          br: 'bottom-12 right-12 items-end',
      };
      return map[pos] || map.mc;
  };

  const alignClass = settings.customTextPosition?.includes('l') 
    ? 'items-start text-left' 
    : (settings.customTextPosition?.includes('r') ? 'items-end text-right' : 'items-center text-center');

  const rotation = settings.customTextRotation || 0;
  const textShadow = settings.customText3D 
    ? '4px 4px 8px rgba(0,0,0,0.9), -2px -2px 2px rgba(255,255,255,0.25)' 
    : 'none';

  return (
    <div className={`pointer-events-none fixed z-[100] flex flex-col ${getPositionClasses()}`}>
      <div 
        ref={textRef} 
        className={`font-black tracking-widest uppercase select-none flex flex-col justify-center origin-center transition-opacity duration-300 ${alignClass}`}
        style={{ 
            color: settings.customTextCycleColor ? undefined : (settings.customTextColor || '#ffffff'),
            fontSize: `min(${sizeVw}vw, ${sizePx}px)`, 
            fontFamily: settings.customTextFont || 'Inter, sans-serif',
            textShadow,
            transform: `rotate(${rotation}deg) ${pulseEnabled ? 'scale(var(--pulse-scale, 1))' : ''}`,
            opacity: pulseEnabled ? 'var(--pulse-opacity, 1)' : settings.customTextOpacity,
            lineHeight: 1.1,
        } as React.CSSProperties}
      >
        <span className="whitespace-pre-wrap break-words max-w-[80vw]">{mainText}</span>
        {subText && (
            <span 
                className="font-bold opacity-80 mt-[0.2em] whitespace-nowrap overflow-hidden text-ellipsis max-w-[80vw]"
                style={{ fontSize: '0.4em', lineHeight: 1.2 }}
            >
                {subText}
            </span>
        )}
      </div>
    </div>
  );
};

export default CustomTextOverlay;
