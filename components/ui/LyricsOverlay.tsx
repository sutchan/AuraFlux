/**
 * File: components/ui/LyricsOverlay.tsx
 * Version: 2.0.0
 * Author: Aura Vision Team
 * Copyright (c) 2025 Aura Vision. All rights reserved.
 * Updated: 2025-03-09 15:00
 * Description: Support for both AI snippets and fully synchronized LRC lyrics (from ID3/file).
 */

import React, { useRef, useMemo, useEffect, useState } from 'react';
import { VisualizerSettings, SongInfo, LyricsStyle } from '../../core/types';
import { useAudioPulse } from '../../core/hooks/useAudioPulse';
import { useAudioContext } from '../AppContext';

interface LyricsOverlayProps {
  settings: VisualizerSettings;
  song: SongInfo | null;
  showLyrics: boolean;
  lyricsStyle: LyricsStyle;
  analyser: AnalyserNode | null;
}

interface LrcLine {
    time: number;
    text: string;
}

// Helper: Parse LRC string to structured array
const parseLrc = (lrc: string): LrcLine[] => {
    const lines = lrc.split('\n');
    const result: LrcLine[] = [];
    const timeRegex = /\[(\d{2}):(\d{2})(?:\.(\d{2,3}))?\]/;

    for (const line of lines) {
        const match = timeRegex.exec(line);
        if (match) {
            const min = parseInt(match[1]);
            const sec = parseInt(match[2]);
            const msStr = match[3] || '0';
            const ms = parseInt(msStr.padEnd(3, '0').slice(0,3));
            const time = min * 60 + sec + ms / 1000;
            const text = line.replace(timeRegex, '').trim();
            if (text) result.push({ time, text });
        }
    }
    return result.sort((a, b) => a.time - b.time);
};

const LyricsOverlay: React.FC<LyricsOverlayProps> = ({ settings, song, showLyrics, lyricsStyle, analyser }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const { currentTime } = useAudioContext(); // Hook into playback time for syncing
  
  const isPreview = song?.matchSource === 'PREVIEW';
  const isSystemError = song?.artist === "System Alert" || song?.title === "Quota Exceeded";

  // Prioritize full lyrics from file (ID3) over AI snippets
  const hasFullLyrics = !!song?.lyrics;
  const rawText = hasFullLyrics ? song?.lyrics : song?.lyricsSnippet;
  
  const isEnabled = !isSystemError && (isPreview || (showLyrics && !!song && (!!rawText || song.identified || !!song.title)));

  // --- LRC Processing ---
  const lrcLines = useMemo(() => {
      if (hasFullLyrics && rawText) {
          return parseLrc(rawText);
      }
      return [];
  }, [hasFullLyrics, rawText]);

  const isSynced = lrcLines.length > 0;

  // --- Sync Logic ---
  const [activeIndex, setActiveIndex] = useState(-1);

  useEffect(() => {
      if (!isSynced) return;
      // Find the last line that has started
      const idx = lrcLines.findIndex((line, i) => {
          const nextTime = lrcLines[i+1]?.time || Infinity;
          return currentTime >= line.time && currentTime < nextTime;
      });
      setActiveIndex(idx);
  }, [currentTime, isSynced, lrcLines]);

  // --- Auto Scroll ---
  useEffect(() => {
      if (isSynced && activeIndex !== -1 && scrollContainerRef.current) {
          const el = scrollContainerRef.current.children[activeIndex] as HTMLElement;
          if (el) {
              el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
      }
  }, [activeIndex, isSynced]);

  // --- Audio Pulse Effect (Subtle for Full Lyrics) ---
  useAudioPulse({
    elementRef: containerRef,
    analyser,
    settings,
    isEnabled: !!isEnabled,
    pulseStrength: isSynced ? 0.05 : (lyricsStyle === LyricsStyle.KARAOKE ? 0.45 : 0.2), // Reduce pulse for scrolling lyrics to avoid nausea
    opacityStrength: 0,
    baseOpacity: 1.0,
  });

  if (!isEnabled) return null;

  // --- Content Preparation ---
  let content: React.ReactNode;

  if (isSynced) {
      // --- Render: Synced Lyrics (Karaoke) ---
      content = (
          <div ref={scrollContainerRef} className="flex flex-col items-center gap-6 w-full max-w-3xl px-4 py-[40vh] overflow-hidden no-scrollbar h-full mask-linear-fade">
              {lrcLines.map((line, i) => {
                  const isActive = i === activeIndex;
                  const isNear = Math.abs(i - activeIndex) <= 1;
                  
                  let className = "transition-all duration-500 text-center max-w-[90vw] ";
                  let style: React.CSSProperties = { 
                      fontFamily: settings.lyricsFont || 'Inter, sans-serif',
                      fontSize: isActive ? '2rem' : '1.25rem',
                      opacity: isActive ? 1 : (isNear ? 0.6 : 0.3),
                      transform: isActive ? 'scale(1.05)' : 'scale(1)',
                      filter: isActive ? 'blur(0px)' : 'blur(1px)',
                      color: isActive ? '#ffffff' : '#aaaaaa',
                      fontWeight: isActive ? 800 : 500
                  };

                  if (lyricsStyle === LyricsStyle.KARAOKE && isActive) {
                      className += "text-transparent bg-clip-text bg-gradient-to-r from-blue-300 via-white to-purple-300 drop-shadow-[0_0_20px_rgba(255,255,255,0.6)]";
                  }

                  return (
                      <p key={i} className={className} style={style}>
                          {line.text}
                      </p>
                  );
              })}
          </div>
      );
  } else {
      // --- Render: Static Text / AI Snippet ---
      const text = (rawText || "").replace(/\[\d{2}:\d{2}(\.\d{1,3})?\]/g, '').trim();
      // If full unsynced lyrics, show more lines but fade out
      const lines = hasFullLyrics ? text.split('\n').slice(0, 12) : text.split('\n').slice(0, 6);
      
      let textClass = "";
      let fontStyle: React.CSSProperties = {
        fontFamily: settings.lyricsFont || 'Inter, sans-serif',
      };
      
      const baseSizeVw = settings.lyricsFontSize || 4;

      if (lyricsStyle === LyricsStyle.KARAOKE) {
         textClass = "font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-300 via-white to-purple-300 drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]";
         const sizeVw = baseSizeVw;
         fontStyle = { ...fontStyle, fontSize: `max(24px, min(${sizeVw}vw, ${sizeVw * 12}px))`, lineHeight: 1.3 };
      } else if (lyricsStyle === LyricsStyle.MINIMAL) {
         textClass = "font-mono text-white/80 tracking-[0.2em]";
         const sizeVw = baseSizeVw * 0.6;
         fontStyle = { ...fontStyle, fontSize: `max(14px, min(${sizeVw}vw, ${sizeVw * 8.5}px))`, lineHeight: 1.8 };
      } else {
         textClass = "font-serif italic text-white drop-shadow-md";
         const sizeVw = baseSizeVw * 0.9;
         fontStyle = { ...fontStyle, fontSize: `max(18px, min(${sizeVw}vw, ${sizeVw * 10}px))`, lineHeight: 1.4 };
      }

      content = (
          <div className="select-none max-w-4xl text-center">
             {isPreview && <div className="text-[9px] font-mono text-white/40 mb-2 uppercase tracking-widest">Layout Preview</div>}
             {lines.map((line, i) => <p key={i} className={textClass} style={fontStyle}>{line}</p>)}
             {hasFullLyrics && lines.length < text.split('\n').length && (
                 <p className="mt-4 text-xs text-white/30 animate-pulse">...</p>
             )}
          </div>
      );
  }

  // --- Container Layout ---
  // If synced, use fixed inset to allow scrolling container.
  // If static, use existing positioning logic.
  const containerClass = isSynced 
      ? `fixed inset-0 z-10 flex flex-col items-center justify-center mask-fade-vertical pointer-events-none`
      : `pointer-events-none fixed inset-0 z-10 flex flex-col px-6 pt-24 pb-48 md:pb-32 pb-safe ${getPositionClasses(settings.lyricsPosition)}`;

  return (
    <div className={containerClass}>
      <div 
        ref={containerRef}
        className={isSynced ? "w-full h-full flex items-center justify-center" : ""}
        style={{
            transform: 'scale(var(--pulse-scale, 1))',
            opacity: 'var(--pulse-opacity, 1)'
        }}
      >
         {content}
      </div>
    </div>
  );
};

// Helper for static positioning
const getPositionClasses = (pos: string = 'mc') => {
    const map: Record<string, string> = {
        tl: 'justify-start items-start text-left',
        tc: 'justify-start items-center text-center',
        tr: 'justify-start items-end text-right',
        ml: 'justify-center items-start text-left',
        mc: 'justify-center items-center text-center',
        mr: 'justify-center items-end text-right',
        bl: 'justify-end items-start text-left',
        bc: 'justify-end items-center text-center',
        br: 'justify-end items-end text-right',
    };
    return map[pos] || map.mc;
};

export default LyricsOverlay;