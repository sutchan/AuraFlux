/**
 * File: components/controls/panels/PlaybackPanel.tsx
 * Version: 1.8.45
 * Author: Sut
 * Updated: 2025-07-16 18:00
 */

import React, { useRef, useEffect, useMemo, useState } from 'react';
import { BentoCard } from '../../ui/layout/BentoCard';
import { useAudioContext, useUI, useVisuals, useAI } from '../../AppContext';
import { TooltipArea } from '../../ui/controls/Tooltip';
import { SettingsToggle } from '../../ui/controls/SettingsToggle';
import { CustomSelect } from '../../ui/controls/CustomSelect';
import { Slider } from '../../ui/controls/Slider';
import { LyricsStyle, Position } from '../../../core/types';
import { getPositionOptions } from '../../../core/constants';

export const PlaybackPanel: React.FC = () => {
  const { 
    playlist, currentIndex, playTrackByIndex, removeFromPlaylist, 
    importFiles, playNext, playPrev, isPlaying, togglePlayback,
    currentTime, duration, seekFile, currentSong, clearPlaylist
  } = useAudioContext();
  const { t, isDragging } = useUI();
  const { settings, setSettings } = useVisuals();
  const { showLyrics, setShowLyrics } = useAI();
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const activeTrackRef = useRef<HTMLDivElement>(null);

  const lyricsStyles = t?.lyricsStyles || {};
  const positionOptions = useMemo(() => getPositionOptions(t), [t]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) importFiles(e.target.files);
    e.target.value = ''; 
  };

  const fmt = (s: number) => isNaN(s) || s === Infinity ? '--:--' : `${Math.floor(s/60)}:${Math.floor(s%60).toString().padStart(2,'0')}`;

  useEffect(() => {
    if (activeTrackRef.current) activeTrackRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [currentIndex]);

  const progressPercent = (currentTime / (duration || 1)) * 100;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:items-start">
      <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept="audio/*" multiple className="hidden" />

      {/* Column 1: Player & Info Settings */}
      <BentoCard title={t?.player?.nowPlaying || "Playback & Display"}>
        <div className="space-y-6">
            {playlist.length > 0 ? (
                <div className="group/player relative flex flex-col gap-5 p-4 bg-gradient-to-br from-black/[0.04] to-transparent dark:from-white/[0.04] rounded-2xl border border-black/5 dark:border-white/5 overflow-hidden transition-all hover:border-black/10 dark:hover:border-white/10 shadow-2xl">
                    {/* Immersive Background Glow */}
                    {currentSong?.albumArtUrl && (
                        <div className="absolute inset-0 pointer-events-none opacity-20 blur-3xl scale-150 transition-opacity duration-1000">
                             <img src={currentSong.albumArtUrl} className="w-full h-full object-cover" alt="" />
                        </div>
                    )}
                    
                    <div className="flex items-center gap-4 relative z-10">
                        {/* Left: Cover Art */}
                        <div className="w-16 h-16 shrink-0 rounded-xl overflow-hidden border border-black/10 dark:border-white/10 bg-black/40 shadow-lg transform transition-transform group-hover/player:scale-105 duration-500">
                             {currentSong?.albumArtUrl ? (
                                 <img src={currentSong.albumArtUrl} className="w-full h-full object-cover" alt="Album Art" />
                             ) : (
                                 <div className="w-full h-full flex items-center justify-center text-black/5 dark:text-white/5">
                                     <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path d="M18 3a1 1 0 00-1.447-.894L8.763 6H5a3 3 0 000 6h.28l1.771 5.316A1 1 0 008 18h1a1 1 0 001-1v-4.382l6.553 3.276A1 1 0 0018 15V3z" /></svg>
                                 </div>
                             )}
                        </div>

                        {/* Middle: Metadata */}
                        <div className="flex-1 min-w-0 flex flex-col justify-center">
                            <div className="text-xl font-bold text-black dark:text-white truncate leading-tight">
                                {currentSong?.title}
                            </div>
                            <div className="text-sm text-blue-500 dark:text-blue-400 truncate font-medium mt-1 opacity-80">
                                {currentSong?.artist}
                            </div>
                        </div>

                        {/* Right: Actions/Controls */}
                        <div className="flex items-center gap-2 shrink-0 bg-black/5 dark:bg-white/5 p-1.5 rounded-2xl border border-black/5 dark:border-white/5">
                            <button onClick={playPrev} className="p-2 text-black/20 dark:text-white/20 hover:text-black dark:hover:text-white transition-all hover:scale-110 active:scale-90">
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M8.445 14.832A1 1 0 0010 14v-2.798l5.445 3.63A1 1 0 0017 14V6a1 1 0 00-1.555-.832L10 8.798V6a1 1 0 00-1.555-.832l-6 4a1 1 0 000 1.664l6 4z"/></svg>
                            </button>
                            <button onClick={togglePlayback} className="w-9 h-9 rounded-full bg-black dark:bg-white text-white dark:text-black flex items-center justify-center shadow-lg transform transition-all hover:scale-110 active:scale-95">
                                {isPlaying ? (
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
                                ) : (
                                    <svg className="w-4 h-4 ml-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                                )}
                            </button>
                            <button onClick={playNext} className="p-2 text-black/20 dark:text-white/20 hover:text-black dark:hover:text-white transition-all hover:scale-110 active:scale-90">
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M4.555 5.168A1 1 0 003 6v8a1 1 0 001.555.832L10 11.202V14a1 1 0 001.555.832l6-4a1 1 0 000-1.664l-6-4A1 1 0 0010 6v2.798l-5.445-3.63z"/></svg>
                            </button>
                        </div>
                    </div>

                    {/* Progressive SeekBar */}
                    <div className="space-y-2 relative z-10 px-1">
                        <div className="relative h-1 bg-black/5 dark:bg-white/5 rounded-full overflow-hidden cursor-pointer group/seek">
                            <div 
                                className="absolute h-full bg-gradient-to-r from-blue-600 to-blue-400 transition-[width] duration-300 ease-linear" 
                                style={{ width: `${progressPercent}%` }} 
                            />
                            <input 
                                type="range" 
                                min={0} max={duration || 1} step={0.1} 
                                value={currentTime} 
                                onChange={(e) => seekFile(parseFloat(e.target.value))} 
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20" 
                            />
                        </div>
                        <div className="flex justify-between text-[8px] font-mono text-black/30 dark:text-white/30 uppercase tracking-widest">
                            <span>{fmt(currentTime)}</span>
                            <span>{fmt(duration)}</span>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="h-24 rounded-2xl border-2 border-dashed border-black/5 dark:border-white/5 flex flex-col items-center justify-center text-black/10 dark:text-white/10 gap-2 hover:border-black/10 dark:hover:border-white/10 transition-colors">
                    <svg className="w-6 h-6 opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2z" />
                    </svg>
                    <span className="uppercase text-[9px] font-black tracking-[0.2em]">{t?.player?.noActiveTrack}</span>
                </div>
            )}

            <div className="grid grid-cols-2 gap-4">
                <SettingsToggle label={t?.showLyrics || "Lyrics"} value={showLyrics} onChange={() => setShowLyrics(!showLyrics)} activeColor="green" />
                <SettingsToggle label={t?.player?.info || "Badge"} value={settings.showSongInfo} onChange={() => setSettings(p => ({ ...p, showSongInfo: !p.showSongInfo }))} activeColor="blue" />
            </div>

            <div className="pt-4 border-t border-black/5 dark:border-white/5 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <CustomSelect label={t?.lyricsStyle} value={settings.lyricsStyle || LyricsStyle.KARAOKE} options={Object.values(LyricsStyle).map(s => ({ value: s, label: lyricsStyles[s] || s }))} onChange={(v) => setSettings({...settings, lyricsStyle: v as LyricsStyle})} />
                    <CustomSelect label={t?.lyricsPosition} value={settings.lyricsPosition} options={positionOptions} onChange={(v) => setSettings({ ...settings, lyricsPosition: v as Position })} />
                </div>
                <div className="bg-black/[0.03] dark:bg-white/[0.03] rounded-2xl p-3 border border-black/5 dark:border-white/5 space-y-3">
                    <div className="grid grid-cols-2 gap-4">
                        <SettingsToggle label={t?.player?.bg || "Cover BG"} value={!!settings.albumArtBackground} onChange={() => setSettings(p => ({ ...p, albumArtBackground: !p.albumArtBackground }))} variant="clean" />
                        <SettingsToggle label={t?.player?.cover || "Overlay"} value={settings.showAlbumArtOverlay} onChange={() => setSettings(p => ({ ...p, showAlbumArtOverlay: !p.showAlbumArtOverlay }))} variant="clean" />
                    </div>
                    {settings.albumArtBackground && <Slider label={t?.player?.blur} value={settings.albumArtBlur ?? 20} min={0} max={50} step={2} onChange={(v) => setSettings({...settings, albumArtBlur: v})} />}
                </div>
            </div>
        </div>
      </BentoCard>

      {/* Column 2: Track Library */}
      <BentoCard 
        title={t?.tabs?.playback || "Media Library"} 
        action={
            <div className="flex items-center gap-2">
                {playlist.length > 0 && (
                    <button onClick={() => window.confirm(t?.common?.confirmClear) && clearPlaylist()} className="px-3 py-1.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-all text-[10px] font-black uppercase tracking-widest shadow-lg">{t?.common?.clearAll || 'CLEAR'}</button>
                )}
                {/* @fix: Property 'import' does not exist on type 'common'. Changed to 'config'. */}
                <button onClick={() => fileInputRef.current?.click()} className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white transition-all text-[10px] font-black uppercase tracking-widest shadow-lg">{t?.config?.import || 'IMPORT'}</button>
            </div>
        }
        className={isDragging ? '!border-blue-500 bg-blue-500/10' : ''}
      >
        <div className="h-full flex flex-col">
            {playlist.length === 0 ? (
                <div onClick={() => fileInputRef.current?.click()} className={`flex-1 min-h-[300px] rounded-2xl border-2 border-dashed flex flex-col items-center justify-center gap-3 transition-all cursor-pointer ${isDragging ? 'border-blue-400 text-blue-300' : 'border-black/5 dark:border-white/5 text-black/10 dark:text-white/10 hover:border-black/10 dark:hover:border-white/10'}`}>
                    <svg className={`w-10 h-10 transition-colors ${isDragging ? '' : 'opacity-20'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m-4 4v12" /></svg>
                    <p className="text-[10px] font-black uppercase tracking-widest">{t?.common?.dropFiles}</p>
                </div>
            ) : (
                <div className="space-y-1 overflow-y-auto custom-scrollbar lg:max-h-[360px] pr-1">
                    {playlist.map((track, idx) => (
                        <div 
                            key={track.id} 
                            ref={idx === currentIndex ? activeTrackRef : null}
                            onClick={() => playTrackByIndex(idx)} 
                            className={`group flex items-center gap-3 p-2.5 rounded-xl cursor-pointer transition-all border ${idx === currentIndex ? 'bg-blue-600/10 border-blue-500/30' : 'bg-transparent border-transparent hover:bg-black/[0.03] dark:hover:bg-white/[0.03]'}`}
                        >
                            <div className="w-6 text-[9px] font-mono text-black/30 dark:text-white/30 text-center">
                                {idx === currentIndex ? (
                                    <div className="flex gap-0.5 justify-center items-end h-2">
                                        <div className="w-0.5 bg-blue-400 animate-[bounce_0.6s_infinite] h-full" />
                                        <div className="w-0.5 bg-blue-400 animate-[bounce_0.8s_infinite] h-2/3" />
                                        <div className="w-0.5 bg-blue-400 animate-[bounce_0.4s_infinite] h-1/2" />
                                    </div>
                                ) : (
                                    (idx + 1).toString().padStart(2, '0')
                                )}
                            </div>
                            <div className="w-10 h-10 rounded-lg overflow-hidden bg-black/40 shrink-0 border border-black/5 dark:border-white/5">
                                {track.albumArtUrl && <img src={track.albumArtUrl} className="w-full h-full object-cover" alt="" />}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className={`text-[10px] font-black truncate uppercase tracking-wide ${idx === currentIndex ? 'text-black dark:text-white' : 'text-black/60 dark:text-white/60'}`}>{track.title}</div>
                                <div className="text-[8px] text-black/30 dark:text-white/30 truncate font-bold uppercase tracking-widest mt-0.5">{track.artist}</div>
                            </div>
                            <button 
                                onClick={(e) => { e.stopPropagation(); removeFromPlaylist(idx); }} 
                                className="p-2 opacity-0 group-hover:opacity-100 hover:text-red-400 transition-all transform hover:scale-110"
                            >
                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
      </BentoCard>
    </div>
  );
};