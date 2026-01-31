/**
 * File: components/AppContext.tsx
 * Version: 1.8.26
 * Author: Sut
 * Updated: 2025-03-25 23:20 - Added manageWakeLock to UIContextType.
 */

import React, { useState, createContext, useContext, useMemo } from 'react';
import { VisualizerMode, LyricsStyle, Language, VisualizerSettings, Region, AudioDevice, SongInfo, SmartPreset, AudioSourceType, Track, PlaybackMode } from '../core/types';
import { useAudio } from '../core/hooks/useAudio';
import { useAppState } from '../core/hooks/useAppState';
import { useVisualsState } from '../core/hooks/useVisualsState';
import { useAiState } from '../core/hooks/useAiState';
import { Toast } from './ui/Toast';

interface UIContextType {
  language: Language; setLanguage: React.Dispatch<React.SetStateAction<Language>>;
  region: Region; setRegion: React.Dispatch<React.SetStateAction<Region>>;
  hasStarted: boolean; setHasStarted: React.Dispatch<React.SetStateAction<boolean>>;
  resetSettings: () => void;
  // @fix: Added manageWakeLock to interface to resolve property existence error
  manageWakeLock: (enabled: boolean) => Promise<void>;
  toggleFullscreen: () => void; t: any;
  showToast: (message: string, type?: 'success' | 'info' | 'error') => void;
}
const UIContext = createContext<UIContextType | null>(null);
export const useUI = () => useContext(UIContext)!;

interface VisualsContextType {
  mode: VisualizerMode; setMode: React.Dispatch<React.SetStateAction<VisualizerMode>>;
  colorTheme: string[]; setColorTheme: React.Dispatch<React.SetStateAction<string[]>>;
  settings: VisualizerSettings; setSettings: React.Dispatch<React.SetStateAction<VisualizerSettings>>;
  activePreset: string; setActivePreset: React.Dispatch<React.SetStateAction<string>>;
  isThreeMode: boolean;
  randomizeSettings: () => void; resetVisualSettings: () => void;
  resetTextSettings: () => void; resetAudioSettings: () => void;
  applyPreset: (preset: SmartPreset) => void;
}
const VisualsContext = createContext<VisualsContextType | null>(null);
export const useVisuals = () => useContext(VisualsContext)!;

interface AudioContextType {
  sourceType: AudioSourceType; isListening: boolean; isPending: boolean;
  analyser: AnalyserNode | null; analyserR: AnalyserNode | null;
  mediaStream: MediaStream | null; audioDevices: AudioDevice[];
  selectedDeviceId: string; onDeviceChange: (id: string) => void;
  toggleMicrophone: (id: string) => void;
  currentSong: SongInfo | null; setCurrentSong: (s: SongInfo | null) => void;
  playlist: Track[]; currentIndex: number; playbackMode: PlaybackMode;
  setPlaybackMode: (m: PlaybackMode) => void;
  importFiles: (files: FileList | File[]) => Promise<any>;
  togglePlayback: () => void; seekFile: (t: number) => void;
  playNext: () => void; playPrev: () => void;
  playTrackByIndex: (i: number) => void; removeFromPlaylist: (i: number) => void;
  clearPlaylist: () => void; getAudioSlice: (s?: number) => Promise<Blob | null>;
  isPlaying: boolean; duration: number; currentTime: number;
  fileStatus?: 'ready' | 'loading' | 'none';
  fileName?: string;
  audioContext: AudioContext | null;
}
const AudioContext = createContext<AudioContextType | null>(null);
export const useAudioContext = () => useContext(AudioContext)!;

interface AIContextType {
  lyricsStyle: LyricsStyle; showLyrics: boolean; setShowLyrics: (b: boolean) => void;
  enableAnalysis: boolean; setEnableAnalysis: (b: boolean) => void;
  performIdentification: (s: MediaStream) => Promise<void>;
  resetAiSettings: () => void; apiKeys: Record<string, string>; setApiKeys: any;
}
const AIContext = createContext<AIContextType | null>(null);
export const useAI = () => useContext(AIContext)!;

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const ui = useAppState();
  const [toast, setToast] = useState({ message: null as string | null, type: 'info' as any });
  const visuals = useVisualsState(ui.hasStarted, {} as any);
  const [currentSong, setCurrentSong] = useState<SongInfo | null>(null);
  const audio = useAudio({ settings: visuals.settings, language: ui.language, setCurrentSong, t: ui.t });

  const ai = useAiState({
    language: ui.language,
    region: ui.region,
    provider: visuals.settings.recognitionProvider || 'GEMINI',
    isListening: audio.isListening,
    isSimulating: visuals.settings.recognitionProvider === 'MOCK',
    mediaStream: audio.mediaStream,
    initialSettings: visuals.settings,
    setSettings: visuals.setSettings,
    onSongIdentified: setCurrentSong,
    currentSong: currentSong
  });

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      if (document.exitFullscreen) document.exitFullscreen().catch(() => {});
    }
  };

  const fileStatus = audio.playlist.length > 0 ? 'ready' as const : 'none' as const;
  const fileName = audio.playlist[audio.currentIndex]?.file.name;

  // Fix: Dynamically determine if we should use Three.js engine or 2D Canvas engine
  const isThreeMode = useMemo(() => {
    return [
      VisualizerMode.DIGITAL_GRID,
      VisualizerMode.SILK_WAVE,
      VisualizerMode.OCEAN_WAVE,
      VisualizerMode.NEURAL_FLOW,
      VisualizerMode.CUBE_FIELD,
      VisualizerMode.KINETIC_WALL,
      /* @fix: Changed LIQUID to RESONANCE_ORB */
      VisualizerMode.RESONANCE_ORB
    ].includes(visuals.mode);
  }, [visuals.mode]);

  return (
    <UIContext.Provider value={{ 
      ...ui, 
      toggleFullscreen,
      showToast: (m, t = 'info') => setToast({ message: m, type: t }) 
    }}>
      <VisualsContext.Provider value={{ ...visuals, isThreeMode } as any}>
        <AudioContext.Provider value={{ ...audio, currentSong, setCurrentSong, fileStatus, fileName } as any}>
          <AIContext.Provider value={ai as any}>
            {children}
            <Toast message={toast.message} type={toast.type} onClose={() => setToast({ ...toast, message: null })} />
          </AIContext.Provider>
        </AudioContext.Provider>
      </VisualsContext.Provider>
    </UIContext.Provider>
  );
};