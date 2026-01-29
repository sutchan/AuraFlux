
/**
 * File: components/controls/panels/PlaybackPanel.tsx
 * Version: 2.0.0
 * Author: Aura Vision Team
 * Copyright (c) 2025 Aura Vision. All rights reserved.
 * Updated: UI Overhaul - Centralized file management in Playlist card.
 */

import React, { useRef, useEffect } from 'react';
import { BentoCard } from '../../ui/layout/BentoCard';
import { useAudioContext, useUI, useVisuals } from '../../AppContext';
import { TooltipArea } from '../../ui/controls/Tooltip';
import { SegmentedControl } from '../../ui/controls/SegmentedControl';

export const PlaybackPanel: React.FC = () => {
  const { 
    playlist, currentIndex, playTrackByIndex, removeFromPlaylist, clearPlaylist, 
    importFiles, playbackMode, setPlaybackMode, playNext, playPrev, isPlaying, togglePlayback,
    currentTime, duration, seekFile, currentSong
  } = useAudioContext();
  const { t } = useUI();
  const { colorTheme } = useVisuals();
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const activeTrackRef = useRef<HTMLDivElement>(null);

  // Theme color for active elements (fallback to blue if not defined)
  const themeColor = colorTheme?.[0] || '#3b82f6';

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
        importFiles(e.target.files);
    }
    e.target.value = ''; // Reset
  };

  const formatDuration = (seconds: number) => {
    if (isNaN(seconds)) return '0:00';
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  // Scroll to active track when it changes
  useEffect(() => {
    if (activeTrackRef.current) {
        activeTrackRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [currentIndex]);

  // Playlist Header Actions
  const PlaylistActions = (
      <div className="flex items-center gap-1">
          <TooltipArea text={t?.common?.dropFiles || "Add Files"}>
              <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="p-1.5 rounded-lg hover:bg-white/10 text-white/60 hover:text-blue-300 transition-colors border border-transparent hover:border-white/5"
              >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
              </button>
          </TooltipArea>
          <TooltipArea text={t?.common?.clearAll || "Clear Queue"}>
              <button 
                  onClick={() => { if(playlist.length > 0 && window.confirm(t?.common?.confirmClear)) clearPlaylist(); }}
                  disabled={playlist.length === 0}
                  className={`p-1.5 rounded-lg border border-transparent transition-colors ${playlist.length === 0 ? 'opacity-30 cursor-not-allowed' : 'hover:bg-white/10 text-white/60 hover:text-red-400 hover:border-white/5'}`}
              >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
              </button>
          </TooltipArea>
      </div>
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
      {/* Hidden Input for Global Access */}
      <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept="audio/*" multiple className="hidden" />

      {/* Card 1: Now Playing & Controls */}
      <BentoCard title="Now Playing">
        <div className="flex flex-col h-full gap-4">
            {/* Playback Status / Art */}
            {playlist.length > 0 ? (
                <div className="flex flex-col gap-3 p-4 bg-gradient-to-b from-white/[0.03] to-transparent rounded-xl border border-white/5 animate-fade-in-up relative overflow-hidden flex-1 justify-center">
                    {/* Art Background Blur */}
                    {currentSong?.albumArtUrl && (
                        <div className="absolute inset-0 opacity-20 pointer-events-none blur-xl bg-cover bg-center transition-all duration-700" style={{ backgroundImage: `url(${currentSong.albumArtUrl})` }} />
                    )}
                    
                    {/* Metadata */}
                    <div className="relative z-10 text-center mb-1">
                        <div className="text-sm font-bold text-white truncate px-2 drop-shadow-md">{currentSong?.title || t?.common?.unknownTrack}</div>
                        <div className="text-[10px] text-white/60 truncate px-2 font-medium tracking-wide">{currentSong?.artist || t?.common?.unknownArtist}</div>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-1.5 relative z-10 w-full">
                        <div className="relative h-1.5 bg-black/40 rounded-full overflow-hidden group cursor-pointer border border-white/5">
                            <div 
                                className="absolute top-0 left-0 h-full transition-all duration-100 ease-linear rounded-r-full" 
                                style={{ 
                                    width: `${(currentTime / (duration || 1)) * 100}%`,
                                    backgroundColor: themeColor,
                                    boxShadow: `0 0 10px ${themeColor}80`
                                }} 
                            />
                            <input
                                type="range"
                                min={0}
                                max={duration || 1}
                                step={0.1}
                                value={currentTime}
                                onChange={(e) => seekFile(parseFloat(e.target.value))}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            />
                        </div>
                        <div className="flex justify-between text-[9px] font-mono text-white/40 px-0.5">
                            <span>{formatDuration(currentTime)}</span>
                            <span>{formatDuration(duration)}</span>
                        </div>
                    </div>

                    {/* Main Controls */}
                    <div className="flex items-center justify-center gap-6 pt-2 relative z-10">
                        <button onClick={playPrev} className="p-2 text-white/40 hover:text-white transition-colors hover:scale-110 active:scale-95">
                            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path d="M8.445 14.832A1 1 0 0010 14v-2.798l5.445 3.63A1 1 0 0017 14V6a1 1 0 00-1.555-.832L10 8.798V6a1 1 0 00-1.555-.832l-6 4a1 1 0 000 1.664l6 4z" /></svg>
                        </button>
                        <button 
                            onClick={togglePlayback} 
                            className="w-14 h-14 rounded-full flex items-center justify-center transition-all shadow-lg hover:scale-105 active:scale-95 border border-white/10 hover:border-white/30"
                            style={{ 
                                backgroundColor: isPlaying ? 'white' : 'rgba(255,255,255,0.1)',
                                color: isPlaying ? 'black' : 'white'
                            }}
                        >
                            {isPlaying ? <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg> : <svg className="w-6 h-6 ml-1" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>}
                        </button>
                        <button onClick={playNext} className="p-2 text-white/40 hover:text-white transition-colors hover:scale-110 active:scale-95">
                            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path d="M4.555 5.168A1 1 0 003 6v8a1 1 0 001.555.832L10 11.202V14a1 1 0 001.555.832l6-4a1 1 0 000-1.664l-6-4A1 1 0 0010 6v2.798l-5.445-3.63z" /></svg>
                        </button>
                    </div>
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center flex-1 bg-white/[0.02] rounded-xl border border-white/5 border-dashed min-h-[120px] text-white/20">
                    <span className="text-[10px] font-bold uppercase tracking-widest">{t?.common?.empty || "No Active Track"}</span>
                </div>
            )}

            {/* Playback Mode */}
            <div className="mt-auto pt-2 border-t border-white/5">
                <SegmentedControl 
                    label={t?.player?.mode || "Playback Mode"}
                    value={playbackMode}
                    onChange={(val) => setPlaybackMode(val as any)}
                    options={[
                        { 
                            value: 'repeat-all', 
                            label: (<div className="flex justify-center py-0.5" title={t?.player?.repeatAll}><svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg></div>) 
                        },
                        { 
                            value: 'repeat-one', 
                            label: (<div className="flex justify-center py-0.5" title={t?.player?.repeatOne}><div className="relative"><svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg><span className="absolute text-[7px] font-black right-[-2px] bottom-[-2px] bg-black px-[1px] leading-none">1</span></div></div>) 
                        }, 
                        { 
                            value: 'shuffle', 
                            label: (<div className="flex justify-center py-0.5" title={t?.player?.shuffle}><svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 3h5v5M4 20L21 3M21 16v5h-5M15 15l6 6M4 4l5 5" /></svg></div>) 
                        }
                    ]}
                />
            </div>
        </div>
      </BentoCard>

      {/* Card 2 & 3: Library / Playlist */}
      <BentoCard 
        title={`${t?.tabs?.playback || "Library"} (${playlist.length})`} 
        className="md:col-span-2 max-h-[50vh] md:max-h-[420px]"
        action={PlaylistActions}
      >
        <div className="flex flex-col min-h-full">
            {playlist.length === 0 ? (
                <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="flex flex-col items-center justify-center flex-1 min-h-[240px] text-white/30 gap-4 border-2 border-dashed border-white/10 rounded-xl m-1 hover:bg-white/[0.02] hover:border-blue-500/30 hover:text-blue-200 transition-all cursor-pointer group"
                >
                    <div className="p-4 bg-white/5 rounded-full group-hover:scale-110 transition-transform duration-300">
                        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                    </div>
                    <div className="text-center">
                        <p className="text-sm font-bold uppercase tracking-widest mb-1">{t?.common?.dropFiles || "Add Audio Files"}</p>
                        <p className="text-[10px] opacity-60">MP3, WAV, FLAC, OGG</p>
                    </div>
                </div>
            ) : (
                <div className="space-y-1 pb-2">
                    {playlist.map((track, idx) => {
                        const isActive = idx === currentIndex;
                        return (
                            <div 
                                key={track.id || idx}
                                ref={isActive ? activeTrackRef : null}
                                onClick={() => playTrackByIndex(idx)}
                                className={`group flex items-center gap-3 p-2.5 rounded-lg cursor-pointer transition-all border relative overflow-hidden ${
                                    isActive 
                                    ? 'bg-blue-900/20 border-blue-500/30 shadow-[inset_0_0_20px_rgba(59,130,246,0.1)]' 
                                    : 'bg-white/[0.02] hover:bg-white/[0.08] border-transparent hover:border-white/5'
                                }`}
                            >
                                {/* Active Indicator Bar */}
                                {isActive && <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500" />}

                                <div className="w-8 text-center shrink-0 flex items-center justify-center pl-1">
                                    {isActive ? (
                                        isPlaying ? (
                                            <div className="flex gap-0.5 items-end h-3">
                                                <div className="w-0.5 bg-blue-400 animate-[bounce_1s_infinite] h-2"></div>
                                                <div className="w-0.5 bg-blue-400 animate-[bounce_1.2s_infinite] h-3"></div>
                                                <div className="w-0.5 bg-blue-400 animate-[bounce_0.8s_infinite] h-1.5"></div>
                                            </div>
                                        ) : (
                                            <div className="w-1.5 h-1.5 bg-blue-400 rounded-full shadow-[0_0_8px_rgba(96,165,250,0.8)]"></div>
                                        )
                                    ) : (
                                        <span className="text-[10px] font-mono text-white/30 group-hover:text-white/50">{idx + 1}</span>
                                    )}
                                </div>
                                
                                <div className="flex-1 min-w-0 flex flex-col justify-center">
                                    <div className={`text-xs font-bold truncate transition-colors ${isActive ? 'text-blue-200' : 'text-white/80 group-hover:text-white'}`}>
                                        {track.title}
                                    </div>
                                    <div className="flex items-center gap-2 mt-0.5">
                                        <span className={`text-[10px] truncate ${isActive ? 'text-blue-300/60' : 'text-white/40'}`}>{track.artist}</span>
                                    </div>
                                </div>

                                {/* Album Art Thumbnail (if available) */}
                                {track.albumArtUrl && (
                                    <div className="w-8 h-8 rounded overflow-hidden opacity-40 group-hover:opacity-100 transition-opacity border border-white/10 shrink-0 hidden sm:block">
                                        <img src={track.albumArtUrl} alt="Art" className="w-full h-full object-cover" loading="lazy" />
                                    </div>
                                )}

                                <button 
                                    onClick={(e) => { e.stopPropagation(); removeFromPlaylist(idx); }}
                                    className="p-2 opacity-0 group-hover:opacity-100 hover:bg-white/10 rounded-lg text-white/20 hover:text-red-400 transition-all focus:opacity-100"
                                    title={t?.config?.delete}
                                    aria-label="Remove"
                                >
                                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                </button>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
      </BentoCard>
    </div>
  );
};
