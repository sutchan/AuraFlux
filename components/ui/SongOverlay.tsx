/**
 * File: components/ui/SongOverlay.tsx
 * Version: 1.1.7
 * Author: Aura Vision Team
 * Copyright (c) 2024 Aura Vision. All rights reserved.
 * Updated: 2025-03-05 12:00
 */

import React, { useRef, useMemo } from 'react';
import { SongInfo, Language } from '../../core/types';
import { TRANSLATIONS } from '../../core/i18n';
import { useAudioPulse } from '../../core/hooks/useAudioPulse';

interface SongOverlayProps {
  song: SongInfo | null;
  language: Language;
  showLyrics: boolean;
  onRetry: () => void;
  onClose: () => void;
  analyser?: AnalyserNode | null;
  sensitivity?: number;
}

const getMoodStyle = (keywords: string | undefined | null) => {
  if (!keywords || typeof keywords !== 'string') {
      return {
          textColor: 'text-purple-300', borderColor: 'border-blue-500',
          gradient: 'from-purple-500/10 to-blue-500/10', badgeGradient: 'from-purple-500/20 to-blue-500/20',
          icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M18 3a1 1 0 00-1.447-.894L8.763 6H5a3 3 0 000 6h.28l1.771 5.316A1 1 0 008 18h1a1 1 0 001-1v-4.382l6.553 3.276A1 1 0 0018 15V3z" clipRule="evenodd" /></svg>
      };
  }
  const m = keywords.toLowerCase();
  
  if (m.includes('error') || m.includes('alert')) {
    return {
      textColor: 'text-red-300', borderColor: 'border-red-500',
      gradient: 'from-red-500/10 to-orange-500/10', badgeGradient: 'from-red-500/20 to-orange-500/20',
      icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.21 3.031-1.742 3.031H4.42c-1.532 0-2.492-1.697-1.742-3.031l5.58-9.92zM10 13a1 1 0 110-2 1 1 0 010 2zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
    };
  }
  if (m.match(/happy|upbeat|energetic|dance|party|fun|joy|pop|bright/)) {
    return {
      textColor: 'text-yellow-300', borderColor: 'border-yellow-400',
      gradient: 'from-yellow-500/20 to-orange-500/20', badgeGradient: 'from-yellow-500/20 to-orange-500/20',
      icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 animate-[spin_4s_linear_infinite]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
    };
  }
  if (m.match(/sad|melancholy|calm|slow|soft|ballad|emotional|dark|ambient/)) {
    return {
      textColor: 'text-blue-300', borderColor: 'border-blue-400',
      gradient: 'from-blue-500/20 to-indigo-500/20', badgeGradient: 'from-blue-500/20 to-indigo-500/20',
      icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
    };
  }
  return {
    textColor: 'text-purple-300', borderColor: 'border-purple-500',
    gradient: 'from-purple-500/10 to-pink-500/10', badgeGradient: 'from-purple-500/20 to-pink-500/20',
    icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M18 3a1 1 0 00-1.447-.894L8.763 6H5a3 3 0 000 6h.28l1.771 5.316A1 1 0 008 18h1a1 1 0 001-1v-4.382l6.553 3.276A1 1 0 0018 15V3z" clipRule="evenodd" /></svg>
  };
};

const getProviderLabel = (source: string | undefined) => {
    switch(source) {
        case 'OPENAI': return 'GPT-4o';
        case 'LOCAL': return 'Local Cache';
        case 'MOCK': return 'Simulation';
        case 'GEMINI': 
        default: return 'Gemini 3.0';
    }
};

const SongOverlay: React.FC<SongOverlayProps> = ({ song, showLyrics, language, onRetry, onClose, analyser, sensitivity = 1.0 }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const moodStyle = useMemo(() => song ? getMoodStyle(song.mood_en_keywords || song.mood) : getMoodStyle('default'), [song]);
  
  const isEnabled = showLyrics && !!song && (song.identified || !!song.mood || !!song.title) && song.matchSource !== 'PREVIEW';

  useAudioPulse({
    elementRef: containerRef,
    analyser,
    settings: { sensitivity },
    isEnabled: !!isEnabled,
    pulseStrength: 0.1,
  });

  if (!isEnabled || !song) return null;
  const t = TRANSLATIONS[language] || TRANSLATIONS['en'];

  const isApiError = song.artist === "System Alert";
  const displayTitle = song.title;
  const displayArtist = isApiError ? null : (song.identified ? song.artist : (song.artist || "Analyzing..."));
  const isConfidenceLow = !song.identified && !isApiError;
  const sourceLabel = getProviderLabel(song.matchSource);

  return (
    <div className="pointer-events-none fixed inset-0 z-20 overflow-hidden">
      <div 
        ref={containerRef}
        className={`absolute top-14 left-4 right-4 md:right-auto md:top-8 md:left-8 bg-black/40 backdrop-blur-md border-s-4 ${moodStyle.borderColor} ps-4 py-3 pe-4 rounded-e-xl rounded-l-lg md:rounded-l-none md:max-w-md transition-all duration-700 shadow-[0_4px_10px_rgba(0,0,0,0.5)] pointer-events-auto group origin-top-center md:origin-top-left animate-fade-in-up`}
        style={{ 
          animationDuration: '0.8s',
          transform: 'scale(var(--pulse-scale, 1))',
          opacity: 'var(--pulse-opacity, 1)'
        }}
      >
        <div className={`absolute inset-0 bg-gradient-to-r ${moodStyle.gradient} opacity-20 pointer-events-none rounded-e-xl`} />
        
        <button onClick={onClose} className="absolute top-2 end-2 p-1 rounded-full bg-black/20 hover:bg-white/20 text-white/40 hover:text-white opacity-100 md:opacity-0 group-hover:opacity-100 transition-all duration-300 z-20">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        </button>

        <div className="relative z-10">
            {isConfidenceLow && (
               <div className="text-[9px] font-bold text-white/40 uppercase tracking-widest mb-1 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-white/40 rounded-full animate-pulse"></span>
                  AI Synesthesia
               </div>
            )}
            
            <h2 className={`${isConfidenceLow ? 'text-white/90 text-lg' : 'text-white text-lg md:text-2xl'} font-bold tracking-tight pe-6 break-words line-clamp-2 md:line-clamp-none`}>
              {displayTitle}
            </h2>
            {displayArtist && (
              <p className={`${isConfidenceLow ? 'text-white/60 text-xs' : 'text-blue-300 text-sm md:text-base'} font-medium pe-6 break-words`}>
                {displayArtist}
              </p>
            )}
            
            <div className="flex items-center gap-2 mt-2 flex-wrap">
                {song.mood && (
                  <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 bg-gradient-to-r ${moodStyle.badgeGradient} border border-white/10 rounded-full`}>
                     <span className={moodStyle.textColor}>{moodStyle.icon}</span>
                     <span className={`text-[10px] font-bold uppercase tracking-wider ${moodStyle.textColor}`}>{song.mood}</span>
                  </div>
                )}
                
                <div className="inline-flex items-center px-2 py-1 bg-white/5 border border-white/10 rounded-full">
                    <span className="text-[9px] font-mono text-white/40 uppercase tracking-widest">via {sourceLabel}</span>
                </div>
            </div>
            
            {isApiError && song.lyricsSnippet && (
                <div className="mt-3 pt-3 border-t border-white/10">
                    <p className="text-xs text-red-200/70">{song.lyricsSnippet}</p>
                </div>
            )}

            <div className="flex items-center gap-4 mt-3 pt-2 border-t border-white/10 opacity-80 md:opacity-60 group-hover:opacity-100 transition-opacity">
                {song.searchUrl && song.identified && (
                    <a href={song.searchUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-[10px] text-white/70 hover:text-blue-300 transition-colors">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
                      <span>Google</span>
                    </a>
                )}
                <button 
                    onClick={(e) => {
                        e.stopPropagation();
                        onClose();
                        setTimeout(onRetry, 100);
                    }} 
                    className="flex items-center gap-1 text-[10px] text-white/70 hover:text-orange-400 transition-colors"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                    <span>{t.wrongSong || "Retry"}</span>
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default SongOverlay;