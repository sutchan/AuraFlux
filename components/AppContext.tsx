/**
 * File: components/AppContext.tsx
 * Version: 1.9.5
 * Author: Aura Flux Team
 * Copyright (c) 2025 Aura Flux. All rights reserved.
 * Updated: 2025-03-08 17:30
 */

import React, { useState, useEffect, useCallback, createContext, useContext, useMemo } from 'react';
import { VisualizerMode, LyricsStyle, Language, VisualizerSettings, Region, AudioDevice, SongInfo, SmartPreset, AudioSourceType, Track, PlaybackMode } from '../core/types';
import { useAudio } from '../core/hooks/useAudio';
import { useLocalStorage } from '../core/hooks/useLocalStorage';
import { useAppState } from '../core/hooks/useAppState';
import { useVisualsState } from '../core/hooks/useVisualsState';
import { useAiState } from '../core/hooks/useAiState';
import { Toast } from './ui/Toast';

// --- Default Settings ---
const DEFAULT_SETTINGS: VisualizerSettings = {
  uiMode: 'advanced',
  sensitivity: 1.5, speed: 1.0, glow: false, trails: true, 
  albumArtBackground: false,
  albumArtDim: 0.8, // Default dimming increased to 0.8 for better contrast
  showAlbumArtOverlay: true, 
  autoRotate: false, rotateInterval: 30, includedModes: Object.values(VisualizerMode), 
  cycleColors: true, colorInterval: 5, hideCursor: false, smoothing: 0.8, fftSize: 512, 
  quality: 'high', monitor: false, wakeLock: false, 
  customText: 'AURA', showCustomText: false, textSource: 'AUTO',
  textPulse: true, customTextRotation: 0, customTextSize: 12, customTextFont: 'Inter, sans-serif',
  customTextOpacity: 0.35, customTextColor: '#ffffff', customTextPosition: 'mc', customTextCycleColor: false, customTextCycleInterval: 5,
  customText3D: false, 
  lyricsPosition: 'mc', recognitionProvider: 'GEMINI', lyricsFont: 'Inter, sans-serif', lyricsFontSize: 4,
  showFps: false, showTooltips: true, doubleClickFullscreen: true, autoHideUi: true, mirrorDisplay: false
};

// --- 1. UI Context ---
interface UIContextType {
  language: Language; setLanguage: React.Dispatch<React.SetStateAction<Language>>;
  region: Region; setRegion: React.Dispatch<React.SetStateAction<Region>>;
  hasStarted: boolean; setHasStarted: React.Dispatch<React.SetStateAction<boolean>>;
  isUnsupported: boolean;
  showOnboarding: boolean;
  handleOnboardingComplete: () => void;
  resetSettings: () => void;
  toggleFullscreen: () => void;
  t: any;
  showToast: (message: string, type?: 'success' | 'info' | 'error') => void;
}
const UIContext = createContext<UIContextType | null>(null);
export const useUI = () => {
  const context = useContext(UIContext);
  if (!context) throw new Error("useUI must be used within UIProvider");
  return context;
};

// --- 2. Visuals Context ---
interface VisualsContextType {
  mode: VisualizerMode; setMode: React.Dispatch<React.SetStateAction<VisualizerMode>>;
  colorTheme: string[]; setColorTheme: React.Dispatch<React.SetStateAction<string[]>>;
  settings: VisualizerSettings; setSettings: React.Dispatch<React.SetStateAction<VisualizerSettings>>;
  activePreset: string; setActivePreset: React.Dispatch<React.SetStateAction<string>>;
  isThreeMode: boolean;
  randomizeSettings: () => void;
  resetVisualSettings: () => void;
  resetTextSettings: () => void;
  resetAudioSettings: () => void;
  applyPreset: (preset: SmartPreset) => void;
}
const VisualsContext = createContext<VisualsContextType | null>(null);
export const useVisuals = () => {
  const context = useContext(VisualsContext);
  if (!context) throw new Error("useVisuals must be used within VisualsProvider");
  return context;
};

// --- 3. Audio Context ---
interface AudioContextType {
  sourceType: AudioSourceType;
  setSourceType: React.Dispatch<React.SetStateAction<AudioSourceType>>;
  isListening: boolean; isSimulating: boolean; isPending: boolean;
  audioContext: AudioContext | null;
  analyser: AnalyserNode | null; mediaStream: MediaStream | null; audioDevices: AudioDevice[];
  selectedDeviceId: string; onDeviceChange: React.Dispatch<React.SetStateAction<string>>;
  errorMessage: string | null; setErrorMessage: React.Dispatch<React.SetStateAction<string | null>>;
  startMicrophone: (deviceId?: string) => Promise<void>;
  toggleMicrophone: (deviceId: string) => void;
  hasAudioPermission: () => Promise<boolean>;
  startDemoMode: () => Promise<void>;
  currentSong: SongInfo | null;
  setCurrentSong: React.Dispatch<React.SetStateAction<SongInfo | null>>;
  
  // File / Playlist
  fileStatus: 'idle' | 'loading' | 'ready' | 'error';
  fileName: string | null;
  isPlaying: boolean;
  duration: number;
  currentTime: number;
  playlist: Track[];
  currentIndex: number;
  playbackMode: PlaybackMode;
  setPlaybackMode: React.Dispatch<React.SetStateAction<PlaybackMode>>;
  importFiles: (files: FileList | File[]) => Promise<void>;
  loadFile: (file: File) => Promise<void>; // Legacy wrapper
  togglePlayback: () => void;
  seekFile: (time: number) => void;
  playNext: () => void;
  playPrev: () => void;
  playTrackByIndex: (index: number) => void;
  removeFromPlaylist: (index: number) => void;
  clearPlaylist: () => void;
  getAudioSlice: (durationSeconds?: number) => Promise<Blob | null>;
}
const AudioContext = createContext<AudioContextType | null>(null);
export const useAudioContext = () => {
  const context = useContext(AudioContext);
  if (!context) throw new Error("useAudioContext must be used within AudioProvider");
  return context;
};

// --- 4. AI Context ---
interface AIContextType {
  lyricsStyle: LyricsStyle; setLyricsStyle: React.Dispatch<React.SetStateAction<LyricsStyle>>;
  showLyrics: boolean; setShowLyrics: React.Dispatch<React.SetStateAction<boolean>>;
  isIdentifying: boolean;
  performIdentification: (stream: MediaStream) => Promise<void>;
  resetAiSettings: () => void;
  apiKeys: Record<string, string>; setApiKeys: React.Dispatch<React.SetStateAction<Record<string, string>>>;
}
const AIContext = createContext<AIContextType | null>(null);
export const useAI = () => {
  const context = useContext(AIContext);
  if (!context) throw new Error("useAI must be used within AIProvider");
  return context;
};


// --- Providers ---

const UIProvider: React.FC<{children: React.ReactNode}> = ({children}) => {
  const { 
    language, setLanguage, region, setRegion, hasStarted, setHasStarted, 
    showOnboarding, isUnsupported, t, handleOnboardingComplete, resetSettings 
  } = useAppState();

  const [toast, setToast] = useState<{ message: string | null; type: 'success' | 'info' | 'error' }>({ message: null, type: 'success' });

  const showToast = useCallback((message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToast({ message, type });
  }, []);

  const closeToast = useCallback(() => {
    setToast(prev => ({ ...prev, message: null }));
  }, []);

  const toggleFullscreen = useCallback(() => {
    const doc = window.document as any;
    const elem = doc.documentElement as any;
    const isFullscreen = doc.fullscreenElement || doc.webkitFullscreenElement || doc.mozFullScreenElement || doc.msFullscreenElement;
    if (!isFullscreen) {
        if (elem.requestFullscreen) elem.requestFullscreen();
        else if (elem.webkitRequestFullscreen) elem.webkitRequestFullscreen();
        else if (elem.mozRequestFullScreen) elem.mozRequestFullScreen();
        else if (elem.msRequestFullscreen) elem.msRequestFullscreen();
    } else {
        if (doc.exitFullscreen) doc.exitFullscreen();
        else if (doc.webkitExitFullscreen) doc.webkitExitFullscreen();
        else if (doc.mozCancelFullScreen) doc.mozCancelFullScreen();
        else if (doc.msExitFullscreen) doc.msExitFullscreen();
    }
  }, []);

  return (
    <UIContext.Provider value={{
      language, setLanguage, region, setRegion, hasStarted, setHasStarted,
      isUnsupported, showOnboarding, handleOnboardingComplete, resetSettings,
      toggleFullscreen, t, showToast
    }}>
      {children}
      <Toast message={toast.message} type={toast.type} onClose={closeToast} />
    </UIContext.Provider>
  );
};

const VisualsProvider: React.FC<{children: React.ReactNode}> = ({children}) => {
  const { hasStarted } = useUI();
  const { getStorage, setStorage } = useLocalStorage();
  
  const initialSettings = useMemo(() => {
      const savedSettings = getStorage<Partial<VisualizerSettings>>('settings', {});
      return { ...DEFAULT_SETTINGS, ...savedSettings, showCustomText: savedSettings.showCustomText ?? false };
  }, [getStorage]);

  const { 
    mode, setMode, colorTheme, setColorTheme, settings, setSettings, activePreset, setActivePreset,
    randomizeSettings, resetVisualSettings, applyPreset
  } = useVisualsState(hasStarted, initialSettings);

  useEffect(() => {
    setStorage('settings', settings);
  }, [settings, setStorage]);

  useEffect(() => {
    let wakeLock: any = null;
    const request = async () => {
      if ('wakeLock' in navigator && settings.wakeLock && hasStarted) {
        try { wakeLock = await (navigator as any).wakeLock.request('screen'); } catch(e){}
      }
    };
    request();
    return () => { wakeLock?.release(); };
  }, [settings.wakeLock, hasStarted]);

  const resetTextSettings = useCallback(() => setSettings(p => ({ 
    ...p, 
    customText: DEFAULT_SETTINGS.customText, 
    showCustomText: DEFAULT_SETTINGS.showCustomText, 
    textSource: DEFAULT_SETTINGS.textSource,
    textPulse: DEFAULT_SETTINGS.textPulse,
    customTextRotation: DEFAULT_SETTINGS.customTextRotation, 
    customTextSize: DEFAULT_SETTINGS.customTextSize, 
    customTextFont: DEFAULT_SETTINGS.customTextFont, 
    customTextOpacity: DEFAULT_SETTINGS.customTextOpacity, 
    customTextColor: DEFAULT_SETTINGS.customTextColor, 
    customTextPosition: DEFAULT_SETTINGS.customTextPosition, 
    customTextCycleColor: DEFAULT_SETTINGS.customTextCycleColor, 
    customTextCycleInterval: DEFAULT_SETTINGS.customTextCycleInterval,
    customText3D: DEFAULT_SETTINGS.customText3D
  })), [setSettings]);
  
  const resetAudioSettings = useCallback(() => setSettings(p => ({ ...p, sensitivity: DEFAULT_SETTINGS.sensitivity, smoothing: DEFAULT_SETTINGS.smoothing, fftSize: DEFAULT_SETTINGS.fftSize })), [setSettings]);

  const isThreeMode = useMemo(() => 
    mode === VisualizerMode.KINETIC_WALL || 
    mode === VisualizerMode.LIQUID || 
    mode === VisualizerMode.CUBE_FIELD ||
    mode === VisualizerMode.NEURAL_FLOW
  , [mode]);

  return (
    <VisualsContext.Provider value={{
      mode, setMode, colorTheme, setColorTheme, settings, setSettings, activePreset, setActivePreset,
      isThreeMode, randomizeSettings, resetVisualSettings, resetTextSettings, resetAudioSettings, applyPreset
    }}>
      {children}
    </VisualsContext.Provider>
  );
};

const AudioProvider: React.FC<{children: React.ReactNode}> = ({children}) => {
  const { settings } = useVisuals();
  const { language, t } = useUI();
  const { getStorage, setStorage } = useLocalStorage();
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>(() => getStorage('deviceId', ''));
  const [currentSong, setCurrentSong] = useState<SongInfo | null>(null);

  const audioState = useAudio({ settings, language, setCurrentSong, t });

  useEffect(() => {
    setStorage('deviceId', selectedDeviceId);
  }, [selectedDeviceId, setStorage]);

  const hasAudioPermission = useCallback(async () => {
    try {
      const result = await navigator.permissions.query({ name: 'microphone' as any });
      return result.state === 'granted';
    } catch (e) { return false; }
  }, []);

  return (
    <AudioContext.Provider value={{
      ...audioState,
      selectedDeviceId, onDeviceChange: setSelectedDeviceId, 
      hasAudioPermission, currentSong, setCurrentSong
    }}>
      {children}
    </AudioContext.Provider>
  );
};

const AIProvider: React.FC<{children: React.ReactNode}> = ({children}) => {
  const { language, region } = useUI();
  const { settings, setSettings } = useVisuals();
  const { isListening, isSimulating, mediaStream, setCurrentSong } = useAudioContext();

  const {
    lyricsStyle, setLyricsStyle, showLyrics, setShowLyrics, isIdentifying,
    performIdentification, resetAiSettings, apiKeys, setApiKeys
  } = useAiState({
      language, region, provider: settings.recognitionProvider,
      isListening, isSimulating, mediaStream, initialSettings: DEFAULT_SETTINGS, setSettings,
      onSongIdentified: setCurrentSong,
  });

  return (
    <AIContext.Provider value={{
      lyricsStyle, setLyricsStyle, showLyrics, setShowLyrics, isIdentifying,
      performIdentification, resetAiSettings, apiKeys, setApiKeys
    }}>
      {children}
    </AIContext.Provider>
  );
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <UIProvider>
    <VisualsProvider>
      <AudioProvider>
        <AIProvider>
          {children}
        </AIProvider>
      </AudioProvider>
    </VisualsProvider>
  </UIProvider>
);

export const useAppContext = () => {
  const ui = useUI();
  const visuals = useVisuals();
  const audio = useAudioContext();
  const ai = useAI();
  return { ...ui, ...visuals, ...audio, ...ai };
};