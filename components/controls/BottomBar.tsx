/**
 * File: components/controls/BottomBar.tsx
 * Version: 1.1.7
 * Author: Aura Vision Team
 * Copyright (c) 2025 Aura Vision. All rights reserved.
 * Description: Unified bottom control bar combining player controls and system actions.
 * Updated: Added Lyrics toggle to Mic mode toolbar.
 */

import React, { useState, useRef, useEffect } from 'react';
import { useAudioContext, useUI, useVisuals, useAI } from '../AppContext';
import { PlaybackMode } from '../../core/types';
import { TooltipArea } from '../ui/controls/Tooltip';

interface BottomBarProps {
  isExpanded: boolean;
  setIsExpanded: (expanded: boolean) => void;
  toggleFullscreen: () => void;
  isIdle: boolean;
}

const formatTime = (seconds: number) => {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
};

export const BottomBar: React.FC<BottomBarProps> = ({ isExpanded, setIsExpanded, toggleFullscreen, isIdle }) => {
  const { 
      sourceType, fileStatus, isPlaying, currentTime, duration, 
      togglePlayback, seekFile, fileName, currentSong,
      playlist, currentIndex, playNext, playPrev, playTrackByIndex,
      playbackMode, setPlaybackMode, removeFromPlaylist, clearPlaylist,
      isListening, toggleMicrophone, selectedDeviceId
  } = useAudioContext();
  
  const { t } = useUI();
  const { randomizeSettings } = useVisuals();
  const { isIdentifying, showLyrics, setShowLyrics } = useAI();
  
  const [isDragging, setIsDragging] = useState(false);
  const [dragTime, setDragTime] = useState(0);
  const [showPlaylist, setShowPlaylist] = useState(false);
  
  const playlistRef = useRef<HTMLDivElement>(null);

  // Close playlist when clicking outside
  useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
          if (playlistRef.current && !playlistRef.current.contains(event.target as Node)) {
              setShowPlaylist(false);
          }
      };
      if (showPlaylist) document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showPlaylist]);

  // Hide everything if settings panel is open
  if (isExpanded) return null;

  // --- STATE 1: AI Analysis Indicator (Floating Top) ---
  const renderAiIndicator = () => (
    isIdentifying && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 md:top-8 md:left-auto md:right-8 md:translate-x-0 z-[110] bg-black/40 backdrop-blur-md border border-blue-500/30 rounded-full px-4 py-2 md:px-5 md:py-2.5 flex items-center gap-2.5 animate-pulse shadow-[0_0_15px_rgba(59,130,246,0.3)] w-max max-w-[90vw] pointer-events-none select-none">
          <div className="relative">
            <div className="w-2 h-2 bg-blue-400 rounded-full relative z-10" />
            <div className="absolute inset-0 bg-blue-400 rounded-full animate-ping opacity-75" />
          </div>
          <span className="text-[10px] md:text-xs font-bold uppercase tracking-[0.15em] text-blue-100 truncate">{t?.identifying || "AI ANALYZING..."}</span>
        </div>
    )
  );

  // --- STATE 2: File Player Mode (Unified Bar) ---
  if (sourceType === 'FILE' && fileStatus === 'ready') {
      const displayTime = isDragging ? dragTime : currentTime;
      const progress = duration > 0 ? (displayTime / duration) * 100 : 0;
      const title = currentSong?.title || fileName || t?.common?.unknownTrack;
      const artist = currentSong?.artist || t?.common?.unknownArtist;
      const cover = currentSong?.albumArtUrl;

      const handleSeek = (newTime: number) => {
          seekFile(Math.max(0, Math.min(newTime, duration)));
      };

      const toggleMode = () => {
          const modes: PlaybackMode[] = ['repeat-all', 'repeat-one', 'shuffle'];
          const nextIdx = (modes.indexOf(playbackMode) + 1) % modes.length;
          setPlaybackMode(modes[nextIdx]);
      };

      return (
        <>
            {renderAiIndicator()}
            
            {/* Playlist Popup */}
            {showPlaylist && (
                <div ref={playlistRef} className="fixed bottom-24 left-1/2 -translate-x-1/2 w-full max-w-[90vw] md:max-w-xl z-[116] bg-[#050505]/95 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col max-h-[50vh] pointer-events-auto animate-fade-in-up origin-bottom">
                    <div className="p-3 border-b border-white/10 bg-white/[0.02] flex justify-between items-center shrink-0">
                        <span className="text-[10px] font-black uppercase tracking-widest text-white/50 pl-2">{t?.common?.queue || "Queue"} ({playlist.length})</span>
                        <div className="flex items-center gap-1">
                            {playlist.length > 0 && (
                                <button
                                    onClick={() => {
                                        if(confirm(t?.common?.confirmClear || 'Clear queue?')) clearPlaylist();
                                    }}
                                    className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-white/10 text-white/40 hover:text-red-400 transition-colors mr-1"
                                    title={t?.common?.clearAll || "Clear All"}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                </button>
                            )}
                            <button onClick={() => setShowPlaylist(false)} className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-white/10 text-white/40 hover:text-white transition-colors">
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>
                    </div>
                    <div className="overflow-y-auto custom-scrollbar p-1.5 space-y-0.5">
                        {playlist.length === 0 ? (
                            <div className="p-8 text-center text-white/30 text-[10px] uppercase tracking-widest">{t?.common?.empty || "List Empty"}</div>
                        ) : (
                            playlist.map((track, idx) => (
                                <div 
                                    key={track.id || idx} 
                                    className={`group flex items-center gap-3 p-2 rounded-lg transition-all cursor-pointer border ${currentIndex === idx ? 'bg-white/10 border-white/10' : 'hover:bg-white/5 border-transparent'}`} 
                                    onClick={() => playTrackByIndex(idx)}
                                >
                                    <div className="w-8 h-8 rounded bg-black/40 flex items-center justify-center shrink-0 overflow-hidden relative shadow-sm border border-white/5">
                                        {currentIndex === idx && isPlaying ? (
                                            <div className="flex gap-0.5 h-3 items-end">
                                                <div className="w-0.5 bg-green-400 animate-[pulse_0.6s_ease-in-out_infinite]" style={{height: '60%'}}></div>
                                                <div className="w-0.5 bg-green-400 animate-[pulse_0.8s_ease-in-out_infinite]" style={{height: '100%'}}></div>
                                                <div className="w-0.5 bg-green-400 animate-[pulse_0.5s_ease-in-out_infinite]" style={{height: '40%'}}></div>
                                            </div>
                                        ) : (
                                            track.albumArtUrl ? <img src={track.albumArtUrl} className="w-full h-full object-cover" /> : <span className="text-[9px] font-mono text-white/30">{idx + 1}</span>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className={`text-[11px] font-bold truncate ${currentIndex === idx ? 'text-green-300' : 'text-white/80'}`}>{track.title}</div>
                                        <div className="text-[9px] text-white/40 truncate">{track.artist}</div>
                                    </div>
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); removeFromPlaylist(idx); }}
                                        className="p-1.5 rounded-full hover:bg-white/10 text-white/20 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all focus:opacity-100"
                                        aria-label="Remove"
                                    >
                                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}

            {/* Main Unified Player Bar */}
            <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-[115] w-full max-w-[90vw] md:max-w-2xl transition-all duration-700 ease-out ${isIdle && !showPlaylist ? 'opacity-0 translate-y-10 pointer-events-none' : 'opacity-100 translate-y-0 pointer-events-auto'}`}>
                <div className="bg-[#0f0f11]/90 backdrop-blur-2xl border border-white/10 rounded-xl p-2 md:px-3 md:py-2 shadow-[0_8px_32px_rgba(0,0,0,0.6)] flex items-center gap-2 group">
                    
                    {/* Metadata Section (Left) - Expanded to 30% for better title visibility */}
                    <div className="flex items-center gap-2 w-[15%] sm:w-[30%] min-w-0 transition-all duration-300">
                        <div className={`w-9 h-9 md:w-10 md:h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center shrink-0 overflow-hidden shadow-inner relative group/cover`}>
                            {cover ? (
                                <img src={cover} alt="Cover" className={`w-full h-full object-cover transition-transform duration-700 ${isPlaying ? 'scale-110' : 'scale-100 grayscale'}`} />
                            ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white/20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" /></svg>
                            )}
                        </div>
                        <div className="flex flex-col min-w-0 hidden sm:flex">
                            <span className="text-[11px] font-bold text-white truncate leading-tight" title={title}>{title}</span>
                            <span className="text-[9px] text-white/50 truncate font-medium" title={artist}>{artist}</span>
                        </div>
                    </div>

                    {/* Controls & Progress (Center) - Flex-1 shrinks as needed */}
                    <div className="flex-1 flex flex-col items-center justify-center gap-1">
                        <div className="flex items-center justify-center gap-1 sm:gap-2">
                            <button onClick={playPrev} className="text-white/60 hover:text-white transition-colors p-1" title="Previous">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path d="M8.445 14.832A1 1 0 0010 14v-2.798l5.445 3.63A1 1 0 0017 14V6a1 1 0 00-1.555-.832L10 8.798V6a1 1 0 00-1.555-.832l-6 4a1 1 0 000 1.664l6 4z" /></svg>
                            </button>
                            
                            <button 
                                onClick={togglePlayback}
                                className="w-8 h-8 rounded-full bg-white text-black flex items-center justify-center hover:scale-105 transition-transform shadow-[0_0_15px_rgba(255,255,255,0.3)]"
                            >
                                {isPlaying ? (
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                                        <path fillRule="evenodd" d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" clipRule="evenodd" />
                                    </svg>
                                ) : (
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-0.5" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z" />
                                    </svg>
                                )}
                            </button>
                            
                            <button onClick={playNext} className="text-white/60 hover:text-white transition-colors p-1" title="Next">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path d="M4.555 5.168A1 1 0 003 6v8a1 1 0 001.555.832L10 11.202V14a1 1 0 001.555.832l6-4a1 1 0 000-1.664l-6-4A1 1 0 0010 6v2.798l-5.445-3.63z" /></svg>
                            </button>

                            <div className="w-px h-4 bg-white/10 mx-1 sm:mx-2 hidden sm:block"></div>

                            {/* Loop Mode */}
                            <TooltipArea text={`Mode: ${playbackMode}`}>
                                <button onClick={toggleMode} className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${playbackMode === 'shuffle' ? 'text-blue-400 bg-blue-400/10' : (playbackMode === 'repeat-one' ? 'text-green-400 bg-green-400/10' : 'text-white/50 hover:text-white hover:bg-white/5')}`}>
                                    {playbackMode === 'shuffle' ? (
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>
                                    ) : playbackMode === 'repeat-one' ? (
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /><text x="10" y="14" fontSize="8" fill="currentColor" fontWeight="bold">1</text></svg>
                                    ) : (
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                                    )}
                                </button>
                            </TooltipArea>
                            
                            {/* Playlist */}
                            <TooltipArea text={t?.common?.queue || "Queue"}>
                                <button onClick={() => setShowPlaylist(!showPlaylist)} className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${showPlaylist ? 'text-white bg-white/10' : 'text-white/50 hover:text-white hover:bg-white/5'}`}>
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
                                </button>
                            </TooltipArea>

                            {/* Lyrics Toggle */}
                            <TooltipArea text={t?.showLyrics || "Lyrics"}>
                                <button onClick={() => setShowLyrics(!showLyrics)} className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${showLyrics ? 'text-purple-400 bg-purple-400/10' : 'text-white/50 hover:text-white hover:bg-white/5'}`}>
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" /></svg>
                                </button>
                            </TooltipArea>
                        </div>
                        
                        {/* Seeker */}
                        <div className="w-full flex items-center gap-2 group/seek">
                            <span className="text-[9px] font-mono text-white/30 w-7 text-right tabular-nums tracking-tight">{formatTime(displayTime)}</span>
                            <div className="relative flex-1 h-1 bg-white/10 rounded-full cursor-pointer group-hover/seek:h-1.5 transition-all">
                                <div 
                                    className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full" 
                                    style={{ width: `${progress}%` }} 
                                />
                                <div 
                                    className="absolute top-1/2 -translate-y-1/2 w-2.5 h-2.5 bg-white rounded-full shadow opacity-0 group-hover/seek:opacity-100 transition-opacity" 
                                    style={{ left: `${progress}%`, marginLeft: '-5px' }}
                                />
                                <input
                                    type="range"
                                    min={0}
                                    max={duration || 1}
                                    step={0.1}
                                    value={displayTime}
                                    onMouseDown={() => setIsDragging(true)}
                                    onMouseUp={() => { setIsDragging(false); handleSeek(dragTime); }}
                                    onTouchStart={() => setIsDragging(true)}
                                    onTouchEnd={() => { setIsDragging(false); handleSeek(dragTime); }}
                                    onChange={(e) => setDragTime(parseFloat(e.target.value))}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                />
                            </div>
                            <span className="text-[9px] font-mono text-white/30 w-7 tabular-nums tracking-tight">{formatTime(duration)}</span>
                        </div>
                    </div>

                    {/* Unified Extra Controls (Right) */}
                    <div className="flex items-center gap-1 w-auto justify-end pl-1">
                        {/* System Controls */}
                        <TooltipArea text={`${t?.hints?.randomize || "Randomize"} [R]`}>
                            <button onClick={randomizeSettings} className="hidden sm:flex w-9 h-9 rounded-lg items-center justify-center text-white/40 hover:text-white hover:bg-white/5 transition-colors">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                </svg>
                            </button>
                        </TooltipArea>

                        <TooltipArea text={`${t?.hints?.fullscreen || "Fullscreen"} [F]`}>
                            <button onClick={toggleFullscreen} className="hidden sm:flex w-9 h-9 rounded-lg items-center justify-center text-white/40 hover:text-white hover:bg-white/5 transition-colors">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M20 8V4m0 0h-4M4 16v4m0 0h4M20 16v4m0 0h-4" /></svg>
                            </button>
                        </TooltipArea>

                        <div className="w-px h-4 bg-white/10 mx-0.5 hidden sm:block"></div>

                        <TooltipArea text={`${t?.showOptions || "Expand"} [H]`}>
                            <button onClick={() => setIsExpanded(true)} className="w-9 h-9 rounded-lg flex items-center justify-center text-white/40 hover:text-white hover:bg-white/5 transition-colors">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 15l7-7 7 7" /></svg>
                            </button>
                        </TooltipArea>
                    </div>
                </div>
            </div>
        </>
      );
  }

  // --- STATE 3: Microphone / Default Mode ---
  return (
    <>
      {renderAiIndicator()}
      <div className={`fixed bottom-6 left-0 w-full z-[110] flex justify-center pointer-events-none px-6 transition-all duration-700 ease-out ${isIdle ? 'opacity-0 translate-y-10' : 'opacity-100 translate-y-0'}`}>
        <div className="flex items-center gap-1 bg-[#0a0a0c]/80 backdrop-blur-xl border border-white/10 rounded-full p-1.5 pl-2 shadow-[0_8px_32px_rgba(0,0,0,0.6)] pointer-events-auto transform hover:scale-[1.02] transition-transform duration-300">
          
          {/* Main Action: Mic Toggle */}
          <TooltipArea text={`${isListening ? t?.stopMic : t?.startMic} [Space]`}>
            <button
              onClick={() => toggleMicrophone(selectedDeviceId)}
              aria-label={isListening ? t?.stopMic : t?.startMic}
              className={`w-9 h-9 md:w-10 md:h-10 rounded-full flex items-center justify-center transition-all duration-300 active:scale-90 group relative overflow-hidden ${isListening ? 'bg-white text-black shadow-[0_0_20px_rgba(255,255,255,0.3)]' : 'bg-white/10 text-white/60 hover:text-white hover:bg-white/20'}`}>
              
              {isListening && <div className="absolute inset-0 bg-gradient-to-tr from-blue-400/20 to-purple-400/20 animate-pulse" />}
              
              {isListening ? (
                  <div className="flex gap-0.5 h-3 items-center">
                      <div className="w-0.5 bg-black h-full animate-[pulse_0.4s_ease-in-out_infinite]" />
                      <div className="w-0.5 bg-black h-[60%] animate-[pulse_0.6s_ease-in-out_infinite]" />
                      <div className="w-0.5 bg-black h-[80%] animate-[pulse_0.5s_ease-in-out_infinite]" />
                  </div>
              ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
              )}
            </button>
          </TooltipArea>

          <div className="w-px h-4 bg-white/10 mx-1.5" />

          {/* Secondary Actions */}
          <div className="flex items-center gap-0.5">
            <TooltipArea text={`${t?.hints?.randomize || "Randomize"} [R]`}>
                <button onClick={randomizeSettings} aria-label={t?.randomize} className="w-8 h-8 flex items-center justify-center rounded-full text-white/50 hover:text-white hover:bg-white/10 transition-all active:scale-90">
                    {/* D6 Dice Icon for Visual Randomization */}
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                </button>
            </TooltipArea>
            
            {/* NEW LYRICS TOGGLE */}
            <TooltipArea text={`${t?.showLyrics || "Lyrics"} [L]`}>
                <button onClick={() => setShowLyrics(!showLyrics)} aria-label={t?.showLyrics} className={`w-8 h-8 flex items-center justify-center rounded-full transition-all active:scale-90 ${showLyrics ? 'text-purple-300 bg-purple-500/20' : 'text-white/50 hover:text-white hover:bg-white/10'}`}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                </button>
            </TooltipArea>

            <TooltipArea text={`${t?.hints?.fullscreen || "Fullscreen"} [F]`}>
                <button onClick={toggleFullscreen} aria-label={t?.hints?.fullscreen} className="w-8 h-8 flex items-center justify-center rounded-full text-white/50 hover:text-white hover:bg-white/10 transition-all active:scale-90">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M20 8V4m0 0h-4M4 16v4m0 0h4M20 16v4m0 0h-4" /></svg>
                </button>
            </TooltipArea>
          </div>

          <div className="w-px h-4 bg-white/10 mx-1.5" />

          {/* Expand Button */}
          <TooltipArea text={`${t?.showOptions || "Expand"} [H]`}>
            <button onClick={() => setIsExpanded(true)} aria-label={t?.showOptions} className="h-8 px-4 rounded-full bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10 text-white/70 hover:text-white transition-all flex items-center gap-2 active:scale-95 group">
                <span className="text-[10px] font-bold uppercase tracking-widest">{t?.showOptions || "MENU"}</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 opacity-50 group-hover:-translate-y-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 15l7-7 7 7" /></svg>
            </button>
          </TooltipArea>
        </div>
      </div>
    </>
  );
};