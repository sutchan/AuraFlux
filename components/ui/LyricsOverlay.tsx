
/**
 * File: components/ui/LyricsOverlay.tsx
 * Version: 1.8.23
 * Author: Sut
 */

import React, { useRef, useMemo, useEffect, useState } from 'react';
import { VisualizerSettings, SongInfo, LyricsStyle } from '../../core/types';
import { useAudioPulse } from '../../core/hooks/useAudioPulse';
import { useAudioContext, useUI } from '../AppContext';

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

const parseLrc = (lrc: string): LrcLine[] => {
    const lines = lrc.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n');
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
  const { currentTime } = useAudioContext();
  const { t } = useUI();
  
  const [activeIndex, setActiveIndex] = useState(-1);

  // 歌词判定逻辑增强：
  // 1. 如果 showLyrics 为 false，直接不渲染。
  // 2. 只有在有 song 对象且不是系统错误时才显示。
  const isEnabled = showLyrics && !!song && !song.isError;
  const hasFullLyrics = !!song?.lyrics;
  const rawText = hasFullLyrics ? song?.lyrics : song?.lyricsSnippet;

  const lrcLines = useMemo(() => {
      if (hasFullLyrics && rawText) return parseLrc(rawText);
      return [];
  }, [hasFullLyrics, rawText]);

  const isSynced = lrcLines.length > 0;

  useEffect(() => {
      if (!isSynced) return;
      const idx = lrcLines.findIndex((line, i) => {
          const nextTime = lrcLines[i+1]?.time || Infinity;
          return currentTime >= line.time && currentTime < nextTime;
      });
      setActiveIndex(idx);
  }, [currentTime, isSynced, lrcLines]);

  useEffect(() => {
      if (isSynced && activeIndex !== -1 && scrollContainerRef.current) {
          const el = scrollContainerRef.current.children[activeIndex] as HTMLElement;
          if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
  }, [activeIndex, isSynced]);

  useAudioPulse({
    elementRef: containerRef,
    analyser,
    settings,
    isEnabled: !!isEnabled,
    pulseStrength: isSynced ? 0.05 : (lyricsStyle === LyricsStyle.KARAOKE ? 0.35 : 0.15),
    opacityStrength: 0,
    baseOpacity: 1.0,
  });

  if (!isEnabled) return null;

  let content: React.ReactNode;

  if (isSynced) {
      content = (
          <div ref={scrollContainerRef} className="flex flex-col items-center gap-6 w-full max-w-3xl px-4 py-[45vh] overflow-hidden no-scrollbar h-full mask-fade-vertical">
              {lrcLines.map((line, i) => {
                  const isActive = i === activeIndex;
                  const isNear = Math.abs(i - activeIndex) <= 2;
                  
                  let className = "transition-all duration-700 text-center max-w-[90vw] ";
                  let style: React.CSSProperties = { 
                      fontFamily: settings.lyricsFont || 'Inter, sans-serif',
                      fontSize: isActive ? '2.25rem' : '1.25rem',
                      opacity: isActive ? 1 : (isNear ? 0.4 : 0.1),
                      transform: isActive ? 'scale(1.05)' : 'scale(0.95)',
                      filter: isActive ? 'blur(0px)' : 'blur(2px)',
                      color: isActive ? '#ffffff' : '#888888',
                      fontWeight: isActive ? 900 : 500
                  };

                  if (lyricsStyle === LyricsStyle.KARAOKE && isActive) {
                      className += "text-transparent bg-clip-text bg-gradient-to-r from-blue-300 via-white to-purple-300 drop-shadow-[0_0_20px_rgba(255,255,255,0.6)]";
                  }

                  return <p key={i} className={className} style={style}>{line.text}</p>;
              })}
          </div>
      );
  } else {
      const text = (rawText || "")
        .replace(/\[\d{2}:\d{2}(\.\d{1,3})?\]/g, '')
        .replace(/\r\n/g, '\n')
        .replace(/\r/g, '\n')
        .trim();
      
      const allLines = text.split('\n');
      const lines = hasFullLyrics ? allLines.slice(0, 10) : allLines.slice(0, 4);
      
      let textClass = "";
      let fontStyle: React.CSSProperties = { fontFamily: settings.lyricsFont || 'Inter, sans-serif' };
      const baseSizeVw = settings.lyricsFontSize || 4;

      if (lyricsStyle === LyricsStyle.KARAOKE) {
         textClass = "font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-300 via-white to-purple-300 drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]";
         fontStyle = { ...fontStyle, fontSize: `max(24px, min(${baseSizeVw}vw, ${baseSizeVw * 12}px))`, lineHeight: 1.3 };
      } else if (lyricsStyle === LyricsStyle.MINIMAL) {
         textClass = "font-mono text-white/80 tracking-[0.2em]";
         fontStyle = { ...fontStyle, fontSize: `max(14px, min(${baseSizeVw * 0.6}vw, ${baseSizeVw * 8}px))`, lineHeight: 1.8 };
      } else {
         textClass = "font-serif italic text-white drop-shadow-md";
         fontStyle = { ...fontStyle, fontSize: `max(18px, min(${baseSizeVw * 0.9}vw, ${baseSizeVw * 10}px))`, lineHeight: 1.4 };
      }

      content = (
          <div className="select-none max-w-4xl text-center px-8 transition-all duration-1000 animate-fade-in-up">
             {lines.map((line, i) => <p key={i} className={`${textClass} mb-2`} style={fontStyle}>{line}</p>)}
             {hasFullLyrics && lines.length < allLines.length && <p className="mt-4 text-[10px] text-white/20 uppercase tracking-widest animate-pulse">... scrolling paused ...</p>}
          </div>
      );
  }

  const containerClass = isSynced 
      ? `fixed inset-0 z-[15] flex flex-col items-center justify-center pointer-events-none`
      : `pointer-events-none fixed inset-0 z-[15] flex flex-col px-6 pt-24 pb-48 md:pb-32 pb-safe ${getPositionClasses(settings.lyricsPosition)}`;

  return (
    <div className={containerClass}>
      <div 
        ref={containerRef}
        className={`transition-all duration-700 ${isSynced ? "w-full h-full flex items-center justify-center" : ""}`}
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
