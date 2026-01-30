
/**
 * File: components/controls/panels/PlaybackPanel.tsx
 * Version: 2.1.7
 * Author: Aura Vision Team
 * Copyright (c) 2025 Aura Vision. All rights reserved.
 * Updated: 2025-03-14 17:00
 */

import React, { useRef, useEffect } from 'react';
import { BentoCard } from '../../ui/layout/BentoCard';
import { useAudioContext, useUI, useVisuals } from '../../AppContext';
import { TooltipArea } from '../../ui/controls/Tooltip';
import { SegmentedControl } from '../../ui/controls/SegmentedControl';
import { SettingsToggle } from '../../ui/controls/SettingsToggle';

export const PlaybackPanel: React.FC = () => {
  const { 
    playlist, currentIndex, playTrackByIndex, removeFromPlaylist, clearPlaylist, 
    importFiles, playbackMode, setPlaybackMode, playNext, playPrev, isPlaying, togglePlayback,
    currentTime, duration, seekFile, currentSong
  } = useAudioContext();
  const { t } = useUI();
  const { colorTheme, settings, setSettings } = useVisuals();
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const activeTrackRef = useRef<HTMLDivElement>(null);

  // Theme color for active elements
  const themeColor = colorTheme?.[0] || '#3b82f6';
  const hints = t?.hints || {};

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
        importFiles(e.target.files);
    }
    e.target.value = ''; // Reset
  };

  const formatDuration = (seconds: number) => {
    if (isNaN(seconds) || seconds === Infinity) return '--:--';
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
      <div className="flex items-center gap-1.5">
          <TooltipArea text={t?.common?.dropFiles || "Add Files"}>
              <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="px-2 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 hover:text-blue-300 transition-all border border-white/5 hover:border-blue-500/30 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5"
              >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                  <span>{t?.player?.add || "ADD"}</span>
              </button>
          </TooltipArea>
          <TooltipArea text={t?.common?.clearAll || "Clear Queue"}>
              <button 
                  onClick={() => { 
                      // Robust confirm check
                      if (playlist.length > 0 && window.confirm(t?.common?.confirmClear || "Clear Queue?")) {
                          clearPlaylist(); 
                      }
                  }}
                  disabled={playlist.length === 0}
                  className={`p-1.5 rounded-lg border border-transparent transition-colors ${playlist.length === 0 ? 'opacity-30 cursor-not-allowed' : 'bg-white/5 hover:bg-white/10 text-white/60 hover:text-red-400 hover:border-red-500/20'}`}
              >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
              </button>
          </TooltipArea>
      </div>
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 h-full">
      {/* Hidden Input for Global Access */}
      <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept="audio/*" multiple className="hidden" />

      {/* Card 1: Now Playing & Controls */}
      <BentoCard title={t?.player?.nowPlaying || "Now Playing"} className="flex flex-col h-full">
        <div className="flex flex-col h-full gap-3 relative">
            {/* Playback Status / Art */}
            {playlist.length > 0 ? (
                <div className="flex flex-col gap-3 p-4 bg-gradient-to-b from-white/[0.03] to-transparent rounded-2xl border border-white/5 relative overflow-hidden flex-1 justify-center group">
                    {/* Art Background Blur */}
                    {currentSong?.albumArtUrl && (
                        <div className="absolute inset-0 opacity-30 pointer-events-none transition-all duration-1000 ease-in-out" style={{ backgroundImage: `url(${currentSong.albumArtUrl})`, backgroundSize: 'cover', backgroundPosition: 'center', filter: 'blur(30px) saturate(1.2)' }} />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />
                    
                    {/* Metadata - Compact Row Layout */}
                    <div className="relative z-10 flex items-center gap-4 mb-2 w-full">
                        <div className="w-20 h-20 shrink-0 rounded-lg overflow-hidden shadow-[0_8px_30px_rgba(0,0,0,0.5)] border border-white/10 relative bg-white/5">
                             {currentSong?.albumArtUrl ? (
                                 <img src={currentSong.albumArtUrl} alt="Art" className="w-full h-full object-cover" />
                             ) : (
                                 <div className="w-full h-full flex items-center justify-center">
                                     <svg className="w-8 h-8 text-white/20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" /></svg>
                                 </div>
                             )}
                        </div>
                        <div className="flex flex-col min-w-0 flex-1 text-left justify-center h-20">
                            <div className="text-sm font-black text-white truncate w-full drop-shadow-md tracking-tight leading-tight">{currentSong?.title || t?.common?.unknownTrack}</div>
                            <div className="text-xs text-blue-200/80 truncate w-full font-bold tracking-wide mt-1">{currentSong?.artist || t?.common?.unknownArtist}</div>
                        </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-1.5 relative z-10 w-full px-1">
                        <div className="relative h-1.5 bg-white/10 rounded-full overflow-hidden group cursor-pointer">
                            <div 
                                className="absolute top-0 left-0 h-full transition-all duration-100 ease-linear rounded-full" 
                                style={{ 
                                    width: `${(currentTime / (duration || 1)) * 100}%`,
                                    backgroundColor: themeColor,
                                    boxShadow: `0 0 15px ${themeColor}`
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
                        <div className="flex justify-between text-[9px] font-mono text-white/40 font-medium">
                            <span>{formatDuration(currentTime)}</span>
                            <span>{formatDuration(duration)}</span>
                        </div>
                    </div>

                    {/* Main Controls */}
                    <div className="flex items-center justify-center gap-5 relative z-10 mt-1">
                        <button onClick={playPrev} className="p-2.5 rounded-full hover:bg-white/10 text-white/50 hover:text-white transition-all hover:scale-105 active:scale-95">
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M8.445 14.832A1 1 0 0010 14v-2.798l5.445 3.63A1 1 0 0017 14V6a1 1 0 00-1.555-.832L10 8.798V6a1 1 0 00-1.555-.832l-6 4a1 1 0 000 1.664l6 4z" /></svg>
                        </button>
                        <button 
                            onClick={togglePlayback} 
                            className="w-12 h-12 rounded-full flex items-center justify-center transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_25px_rgba(255,255,255,0.2)] hover:scale-105 active:scale-95 border border-white/20 hover:border-white/50 bg-white/10 backdrop-blur-md"
                        >
                            {isPlaying ? <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg> : <svg className="w-5 h-5 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>}
                        </button>
                        <button onClick={playNext} className="p-2.5 rounded-full hover:bg-white/10 text-white/50 hover:text-white transition-all hover:scale-105 active:scale-95">
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M4.555 5.168A1 1 0 003 6v8a1 1 0 001.555.832L10 11.202V14a1 1 0 001.555.832l6-4a1 1 0 000-1.664l-6-4A1 1 0 0010 6v2.798l-5.445-3.63z" /></svg>
                        </button>
                    </div>
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center flex-1 bg-white/[0.02] rounded-xl border border-white/5 border-dashed min-h-[200px] text-white/20 animate-pulse">
                    <svg className="w-8 h-8 mb-2 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" /></svg>
                    <span className="text-[10px] font-bold uppercase tracking-widest">{t?.common?.empty || "No Active Track"}</span>
                </div>
            )}

            {/* Visual Art Controls */}
            {playlist.length > 0 && (
                <div className="grid grid-cols-2 gap-2 px-1">
                    <SettingsToggle 
                        label={t?.albumArtBackground || "BG"} 
                        value={!!settings.albumArtBackground} 
                        onChange={() => setSettings(prev => ({ ...prev, albumArtBackground: !prev.albumArtBackground }))} 
                        variant="clean"
                        hintText={hints?.albumArtBackground}
                    />
                    <SettingsToggle 
                        label={t?.overlayCover || "Cover"} 
                        value={settings.showAlbumArtOverlay} 
                        onChange={() => setSettings(prev => ({ ...prev, showAlbumArtOverlay: !prev.showAlbumArtOverlay }))} 
                        variant="clean"
                        hintText={hints?.overlayCover}
                    />
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
                            label: (<div className="flex justify-center py-0.5" title={t?.player?.repeatOne}><div className="relative"><svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg><span className="absolute text-[7px] font-black right-[-3px] bottom-[-2px] bg-black px-[2px] rounded-sm leading-none border border-white/20">1</span></div></div>) 
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
        className="md:col-span-2 h-full"
        action={PlaylistActions}
      >
        <div className="flex flex-col h-full">
            {playlist.length === 0 ? (
                <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="flex flex-col items-center justify-center flex-1 h-full min-h-[300px] text-white/30 gap-6 border-2 border-dashed border-white/10 rounded-xl m-1 hover:bg-white/[0.02] hover:border-blue-500/30 hover:text-blue-200 transition-all cursor-pointer group animate-fade-in-up"
                >
                    <div className="relative">
                        <div className="absolute inset-0 bg-blue-500/20 blur-xl rounded-full group-hover:bg-blue-500/30 transition-all duration-500" />
                        <div className="p-8 bg-white/5 rounded-full group-hover:scale-110 transition-transform duration-300 shadow-2xl relative z-10 border border-white/5">
                            <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                        </div>
                    </div>
                    <div className="text-center space-y-2">
                        <p className="text-lg font-black uppercase tracking-widest group-hover:text-white transition-colors">{t?.common?.dropFiles || "Click / Drop Audio Files"}</p>
                        <div className="flex items-center gap-2 justify-center opacity-60 text-xs font-medium">
                            <span className="bg-white/10 px-2 py-0.5 rounded">MP3</span>
                            <span className="bg-white/10 px-2 py-0.5 rounded">WAV</span>
                            <span className="bg-white/10 px-2 py-0.5 rounded">FLAC</span>
                        </div>
                        <p className="text-[10px] opacity-40 font-mono pt-2">Supports ID3 Metadata & Cover Art</p>
                    </div>
                </div>
            ) : (
                <div className="space-y-1 pb-2 overflow-y-auto custom-scrollbar pr-1 max-h-[340px]">
                    {playlist.map((track, idx) => {
                        const isActive = idx === currentIndex;
                        return (
                            <div 
                                key={track.id || idx}
                                ref={isActive ? activeTrackRef : null}
                                onClick={() => playTrackByIndex(idx)}
                                className={`group flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-all border relative overflow-hidden ${
                                    isActive 
                                    ? 'bg-blue-600/10 border-blue-500/20 shadow-[inset_0_0_20px_rgba(59,130,246,0.05)]' 
                                    : 'bg-transparent hover:bg-white/[0.04] border-transparent hover:border-white/5'
                                }`}
                            >
                                {/* Active Indicator Bar */}
                                {isActive && <div className="absolute left-0 top-2 bottom-2 w-0.5 bg-blue-500 rounded-r-full shadow-[0_0_8px_rgba(59,130,246,0.8)]" />}

                                <div className="w-8 text-center shrink-0 flex items-center justify-center pl-1">
                                    {isActive ? (
                                        isPlaying ? (
                                            <div className="flex gap-0.5 items-end h-3">
                                                <div className="w-0.5 bg-blue-400 animate-[bounce_1s_infinite] h-1.5"></div>
                                                <div className="w-0.5 bg-blue-400 animate-[bounce_1.2s_infinite] h-3"></div>
                                                <div className="w-0.5 bg-blue-400 animate-[bounce_0.8s_infinite] h-2"></div>
                                            </div>
                                        ) : (
                                            <div className="w-1.5 h-1.5 bg-blue-400 rounded-full shadow-[0_0_5px_rgba(96,165,250,0.8)]"></div>
                                        )
                                    ) : (
                                        <span className="text-[10px] font-mono text-white/20 group-hover:text-white/50 transition-colors">{String(idx + 1).padStart(2, '0')}</span>
                                    )}
                                </div>
                                
                                {/* Album Art Thumbnail (if available) */}
                                {track.albumArtUrl ? (
                                    <div className="w-9 h-9 rounded bg-black/20 overflow-hidden border border-white/5 shrink-0 relative group/art">
                                        <img src={track.albumArtUrl} alt="Art" className="w-full h-full object-cover opacity-80 group-hover/art:opacity-100 transition-opacity" loading="lazy" />
                                    </div>
                                ) : (
                                    <div className="w-9 h-9 rounded bg-white/5 flex items-center justify-center shrink-0">
                                        <svg className="w-4 h-4 text-white/10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" /></svg>
                                    </div>
                                )}

                                <div className="flex-1 min-w-0 flex flex-col justify-center">
                                    <div className={`text-xs font-bold truncate transition-colors ${isActive ? 'text-blue-200' : 'text-white/80 group-hover:text-white'}`}>
                                        {track.title}
                                    </div>
                                    <div className="flex items-center gap-2 mt-0.5">
                                        <span className={`text-[10px] truncate ${isActive ? 'text-blue-300/60' : 'text-white/40'}`}>{track.artist}</span>
                                    </div>
                                </div>

                                <div className="text-[10px] font-mono text-white/30 hidden sm:block w-12 text-right">
                                    {track.duration ? formatDuration(track.duration) : ''}
                                </div>

                                <button 
                                    onClick={(e) => { e.stopPropagation(); removeFromPlaylist(idx); }}
                                    className="p-2 opacity-0 group-hover:opacity-100 hover:bg-white/10 rounded-lg text-white/20 hover:text-red-400 transition-all focus:opacity-100 transform hover:scale-110"
                                    title={t?.config?.delete}
                                    aria-label="Remove"
                                >
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" /></svg>
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
