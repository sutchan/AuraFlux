/**
 * File: components/AppContext.tsx
 * Version: 1.8.59
 * Author: Sut
 * Updated: 2025-07-18 12:00
 */

import React, { useState, createContext, useContext, useMemo, useCallback } from 'react';
import { VisualizerMode, LyricsStyle, Language, VisualizerSettings, Region, AudioDevice, SongInfo, SmartPreset, AudioSourceType, Track, PlaybackMode } from '../core/types';
import { useAudio } from '../core/hooks/useAudio';
import { useAppState } from '../core/hooks/useAppState';
import { useVisualsState } from '../core/hooks/useVisualsState';
import { useAiState } from '../core/hooks/useAiState';
import { Toast } from './ui/Toast';
import { TranslationSchema } from '../core/i18n';

type HelpTab = 'guide' | 'shortcuts' | 'about';

interface UIContextType {
  language: Language; setLanguage: React.Dispatch<React.SetStateAction<Language>>;
  region: Region; setRegion: React.Dispatch<React.SetStateAction<Region>>;
  hasStarted: boolean; setHasStarted: React.Dispatch<React.SetStateAction<boolean>>;
  resetSettings: () => void;
  manageWakeLock: (enabled: boolean) => Promise<void>;
  toggleFullscreen: () => void; t: TranslationSchema;
  showToast: (message: string, type?: 'success' | 'info' | 'error') => void;
  showHelpModal: boolean;
  setShowHelpModal: React.Dispatch<React.SetStateAction<boolean>>;
  helpModalInitialTab: HelpTab;
  setHelpModalInitialTab: React.Dispatch<React.SetStateAction<HelpTab>>;
  isDragging: boolean;
  setIsDragging: React.Dispatch<React.SetStateAction<boolean>>;
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
  lyricsStyle: LyricsStyle; showLyrics: boolean; setShowLyrics: (b: boolean | ((prev: boolean) => boolean)) => void;
  enableAnalysis: boolean; setEnableAnalysis: (b: boolean) => void;
  performIdentification: (s: MediaStream) => Promise<void>;
  resetAiSettings: () => void; 
  apiKeys: Record<string, string>; 
  setApiKeys: React.Dispatch<React.SetStateAction<Record<string, string>>>;
}
const AIContext = createContext<AIContextType | null>(null);
export const useAI = () => useContext(AIContext)!;

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toast, setToast] = useState({ message: null as string | null, type: 'info' as any });
  const showToast = useCallback((message: string, type: 'success' | 'info' | 'error' = 'info') => setToast({ message, type }), []);
  
  const uiState = useAppState();
  const visualsState = useVisualsState(uiState.hasStarted, {} as any);
  const [currentSong, setCurrentSong] = useState<SongInfo | null>(null);
  const audioState = useAudio({ settings: visualsState.settings, language: uiState.language, setCurrentSong, t: uiState.t, showToast });

  const aiState = useAiState({
    language: uiState.language,
    region: uiState.region,
    provider: visualsState.settings.recognitionProvider || 'GEMINI',
    isListening: audioState.isListening,
    isSimulating: visualsState.settings.recognitionProvider === 'MOCK',
    mediaStream: audioState.mediaStream,
    initialSettings: visualsState.settings,
    setSettings: visualsState.setSettings,
    onSongIdentified: setCurrentSong,
    currentSong: currentSong,
    getAudioSlice: audioState.getAudioSlice
  });

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      if (document.exitFullscreen) document.exitFullscreen().catch(() => {});
    }
  }, []);

  const fileStatus = audioState.playlist.length > 0 ? 'ready' as const : 'none' as const;
  const fileName = audioState.playlist[audioState.currentIndex]?.file.name;

  const isThreeMode = useMemo(() => {
    return [
      VisualizerMode.DIGITAL_GRID, VisualizerMode.SILK_WAVE,
      VisualizerMode.OCEAN_WAVE, VisualizerMode.NEURAL_FLOW,
      VisualizerMode.CUBE_FIELD, VisualizerMode.KINETIC_WALL,
      VisualizerMode.RESONANCE_ORB
    ].includes(visualsState.mode);
  }, [visualsState.mode]);

  const uiContextValue: UIContextType = useMemo(() => ({ ...uiState, toggleFullscreen, showToast }), [uiState, toggleFullscreen, showToast]);
  const visualsContextValue = useMemo(() => ({ ...visualsState, isThreeMode }), [visualsState, isThreeMode]);
  const audioContextValue = useMemo(() => ({ ...audioState, currentSong, setCurrentSong, fileStatus, fileName }), [audioState, currentSong, fileStatus, fileName]);
  const aiContextValue = useMemo(() => aiState, [aiState]);

  return (
    <UIContext.Provider value={uiContextValue}>
      <VisualsContext.Provider value={visualsContextValue}>
        <AudioContext.Provider value={audioContextValue}>
          <AIContext.Provider value={aiContextValue}>
            {children}
            <Toast message={toast.message} type={toast.type} onClose={() => setToast({ ...toast, message: null })} />
          </AIContext.Provider>
        </AudioContext.Provider>
      </VisualsContext.Provider>
    </UIContext.Provider>
  );
};