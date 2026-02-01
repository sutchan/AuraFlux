/**
 * File: components/controls/panels/PlaybackPanel.tsx
 * Version: 2.3.0
 * Author: Sut
 * Updated: 2025-07-18 21:00
 */

import React, { useRef, useEffect, useMemo } from 'react';
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
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-stretch">
      <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept="audio/*" multiple className="hidden" />

      {/* Column 1: Now Playing Context (5 cols) */}
      <div className="lg:col-span-5 flex flex-col gap-3">
        <BentoCard title={t?.player?.nowPlaying || "Now Playing"}>
            <div className="space-y-6">
                {playlist.length > 0 ? (
                    <div className="group/player relative flex flex-col gap-5 p-5 bg-black/[0.04] dark:bg-white/[0.04] rounded-2xl border border-black/5 dark:border-white/5 overflow-hidden transition-all hover:border-black/10 dark:hover:border-white/10 shadow-xl">
                        {/* Immersive Background Glow */}
                        {currentSong?.albumArtUrl && (
                            <div className="absolute inset-0 pointer-events-none opacity-20 blur-3xl scale-125 transition-opacity duration-1000">
                                <img src={currentSong.albumArtUrl} className="w-full h-full object-cover" alt="" />
                            </div>
                        )}
                        
                        <div className="flex items-center gap-4 relative z-10">
                            {/* Left: Cover Art */}
                            <div className="w-20 h-20 shrink-0 rounded-2xl overflow-hidden border border-black/10 dark:border-white/10 bg-black/40 shadow-lg transform transition-all group-hover/player:scale-105 duration-500">
                                {currentSong?.albumArtUrl ? (
                                    <img src={currentSong.albumArtUrl} className="w-full h-full object-cover" alt="Album Art" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-black/5 dark:text-white/5">
                                        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20"><path d="M18 3a1 1 0 00-1.447-.894L8.763 6H5a3 3 0 000 6h.28l1.771 5.316A1 1 0 008 18h1a1 1 0 001-1v-4.382l6.553 3.276A1 1 0 0018 15V3z" /></svg>
                                    </div>
                                )}
                            </div>

                            {/* Middle: Metadata */}
                            <div className="flex-1 min-w-0 flex flex-col justify-center">
                                <div className="text-lg font-black text-black dark:text-white truncate leading-tight uppercase tracking-tight">
                                    {currentSong?.title}
                                </div>
                                <div className="text-[10px] text-blue-500 dark:text-blue-400 truncate font-black uppercase tracking-[0.2em] mt-1.5 opacity-80">
                                    {currentSong?.artist}
                                </div>
                            </div>
                        </div>

                        {/* Controls Row */}
                        <div className="flex items-center justify-between gap-4 relative z-10">
                            <div className="flex items-center gap-1">
                                <button onClick={playPrev} className="p-3 text-black/20 dark:text-white/20 hover:text-black dark:hover:text-white transition-all hover:scale-110 active:scale-90">
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M8.445 14.832A1 1 0 0010 14v-2.798l5.445 3.63A1 1 0 0017 14V6a1 1 0 00-1.555-.832L10 8.798V6a1 1 0 00-1.555-.832l-6 4a1 1 0 000 1.664l6 4z"/></svg>
                                </button>
                                <button onClick={togglePlayback} className="w-12 h-12 rounded-full bg-black dark:bg-white text-white dark:text-black flex items-center justify-center shadow-lg transform transition-all hover:scale-110 active:scale-95">
                                    {isPlaying ? (
                                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
                                    ) : (
                                        <svg className="w-5 h-5 ml-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                                    )}
                                </button>
                                <button onClick={playNext} className="p-3 text-black/20 dark:text-white/20 hover:text-black dark:hover:text-white transition-all hover:scale-110 active:scale-90">
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M4.555 5.168A1 1 0 003 6v8a1 1 0 001.555.832L10 11.202V14a1 1 0 001.555.832l6-4a1 1 0 000-1.664l-6-4A1 1 0 0010 6v2.798l-5.445-3.63z"/></svg>
                                </button>
                            </div>
                            
                            <div className="text-right">
                                <div className="text-[10px] font-black font-mono text-black/30 dark:text-white/30 uppercase tracking-widest">{fmt(currentTime)} / {fmt(duration)}</div>
                            </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="relative h-1 w-full bg-black/5 dark:bg-white/10 rounded-full overflow-hidden cursor-pointer group/seek z-10">
                            <div 
                                className="absolute h-full bg-blue-600 transition-[width] duration-300 ease-linear" 
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
                    </div>
                ) : (
                    <div className="h-40 rounded-2xl border-2 border-dashed border-black/5 dark:border-white/5 flex flex-col items-center justify-center text-black/10 dark:text-white/10 gap-3 hover:border-black/10 dark:hover:border-white/10 transition-colors">
                        <svg className="w-10 h-10 opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2z" />
                        </svg>
                        <span className="uppercase text-[10px] font-black tracking-[0.2em]">{t?.player?.noActiveTrack}</span>
                    </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                    <SettingsToggle label={t?.showLyrics || "AI HUD"} value={showLyrics} onChange={() => setShowLyrics(!showLyrics)} activeColor="green" variant="clean" />
                    <SettingsToggle label={t?.player?.info || "Meta Info"} value={settings.showSongInfo} onChange={() => setSettings(p => ({ ...p, showSongInfo: !p.showSongInfo }))} activeColor="blue" variant="clean" />
                </div>
            </div>
        </BentoCard>

        <BentoCard title={t?.player?.supportInfo || "Display Architecture"} className="flex-1">
            <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <CustomSelect label={t?.lyricsStyle} value={settings.lyricsStyle || LyricsStyle.KARAOKE} options={Object.values(LyricsStyle).map(s => ({ value: s, label: lyricsStyles[s] || s }))} onChange={(v) => setSettings({...settings, lyricsStyle: v as LyricsStyle})} />
                    <CustomSelect label={t?.lyricsPosition} value={settings.lyricsPosition} options={positionOptions} onChange={(v) => setSettings({ ...settings, lyricsPosition: v as Position })} />
                </div>
                <div className="pt-4 border-t border-black/5 dark:border-white/5 space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                        <SettingsToggle label={t?.player?.bg || "Art BG"} value={!!settings.albumArtBackground} onChange={() => setSettings(p => ({ ...p, albumArtBackground: !p.albumArtBackground }))} variant="clean" />
                        <SettingsToggle label={t?.player?.cover || "Overlay"} value={settings.showAlbumArtOverlay} onChange={() => setSettings(p => ({ ...p, showAlbumArtOverlay: !p.showAlbumArtOverlay }))} variant="clean" />
                    </div>
                    {settings.albumArtBackground && <Slider label={t?.player?.blur} value={settings.albumArtBlur ?? 20} min={0} max={60} step={2} onChange={(v) => setSettings({...settings, albumArtBlur: v})} />}
                </div>
            </div>
        </BentoCard>
      </div>

      {/* Column 2: Media Library context (7 cols) */}
      <BentoCard 
        title={t?.tabs?.playback || "Media Library"} 
        className="lg:col-span-7 flex flex-col h-full"
        action={
            <div className="flex items-center gap-2">
                {playlist.length > 0 && (
                    <button onClick={() => window.confirm(t?.common?.confirmClear) && clearPlaylist()} className="px-4 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-500 transition-all text-[10px] font-black uppercase tracking-widest">{t?.common?.clearAll || 'CLEAR'}</button>
                )}
                <button onClick={() => fileInputRef.current?.click()} className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white transition-all text-[10px] font-black uppercase tracking-widest shadow-lg">{t?.config?.import || 'IMPORT'}</button>
            </div>
        }
      >
        <div className={`flex-1 min-h-[400px] flex flex-col transition-all duration-500 ${isDragging ? 'bg-blue-500/5 ring-2 ring-blue-500/20 rounded-2xl p-4' : ''}`}>
            {playlist.length === 0 ? (
                <div 
                    onClick={() => fileInputRef.current?.click()} 
                    className={`flex-1 flex flex-col items-center justify-center gap-4 transition-all cursor-pointer rounded-2xl ${isDragging ? 'text-blue-500' : 'text-black/10 dark:text-white/10 hover:text-black/20 dark:hover:text-white/20'}`}
                >
                    <div className="w-16 h-16 rounded-full border-2 border-current flex items-center justify-center">
                        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" /></svg>
                    </div>
                    <div className="text-center space-y-1">
                        <p className="text-[11px] font-black uppercase tracking-[0.25em]">{t?.common?.dropFiles}</p>
                        <p className="text-[9px] font-bold uppercase tracking-widest opacity-40">{t?.player?.supportInfo}</p>
                    </div>
                </div>
            ) : (
                <div className="space-y-1.5 overflow-y-auto custom-scrollbar lg:max-h-[520px] pr-2">
                    {playlist.map((track, idx) => (
                        <div 
                            key={track.id} 
                            ref={idx === currentIndex ? activeTrackRef : null}
                            onClick={() => playTrackByIndex(idx)} 
                            className={`group flex items-center gap-4 p-3 rounded-2xl cursor-pointer transition-all border ${idx === currentIndex ? 'bg-blue-600/10 border-blue-500/30' : 'bg-transparent border-transparent hover:bg-black/[0.03] dark:hover:bg-white/[0.03]'}`}
                        >
                            <div className="w-8 text-[10px] font-black font-mono text-black/30 dark:text-white/30 text-center shrink-0">
                                {idx === currentIndex ? (
                                    <div className="flex gap-0.5 justify-center items-end h-3">
                                        <div className="w-0.5 bg-blue-500 animate-[bounce_0.6s_infinite] h-full" />
                                        <div className="w-0.5 bg-blue-500 animate-[bounce_0.8s_infinite] h-2/3" />
                                        <div className="w-0.5 bg-blue-500 animate-[bounce_0.4s_infinite] h-1/2" />
                                    </div>
                                ) : (
                                    (idx + 1).toString().padStart(2, '0')
                                )}
                            </div>
                            
                            <div className="w-12 h-12 rounded-xl overflow-hidden bg-black/40 shrink-0 border border-black/5 dark:border-white/5 shadow-md">
                                {track.albumArtUrl ? (
                                    <img src={track.albumArtUrl} className="w-full h-full object-cover" alt="" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center opacity-10"><svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M18 3a1 1 0 00-1.447-.894L8.763 6H5a3 3 0 000 6h.28l1.771 5.316A1 1 0 008 18h1a1 1 0 001-1v-4.382l6.553 3.276A1 1 0 0018 15V3z" /></svg></div>
                                )}
                            </div>
                            
                            <div className="flex-1 min-w-0">
                                <div className={`text-[11px] font-black truncate uppercase tracking-wide ${idx === currentIndex ? 'text-black dark:text-white' : 'text-black/70 dark:text-white/70'}`}>
                                    {track.title}
                                </div>
                                <div className="text-[9px] text-black/40 dark:text-white/40 truncate font-bold uppercase tracking-widest mt-1">
                                    {track.artist}
                                </div>
                            </div>
                            
                            <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <button 
                                    onClick={(e) => { e.stopPropagation(); removeFromPlaylist(idx); }} 
                                    className="p-2.5 rounded-xl hover:bg-red-500/10 text-black/20 dark:text-white/20 hover:text-red-500 transition-all transform hover:scale-110"
                                >
                                    <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
      </BentoCard>
    </div>
  );
};
