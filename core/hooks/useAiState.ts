/**
 * File: core/hooks/useAiState.ts
 * Version: 1.8.23
 * Author: Aura Flux Team
 * Copyright (c) 2025 Aura Flux. All rights reserved.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useLocalStorage } from './useLocalStorage';
import { useIdentification } from './useIdentification';
import { LyricsStyle, Language, Region, VisualizerSettings, AIProvider, SongInfo } from '../types';

const DEFAULT_LYRICS_STYLE = LyricsStyle.KARAOKE;
const DEFAULT_SHOW_LYRICS = false;
const DEFAULT_ENABLE_ANALYSIS = false;

// Privacy Helper: Simple Base64 obfuscation to prevent shoulder-surfing leaks.
const encodeKey = (key: string) => `enc:${btoa(key)}`;
const decodeKey = (str: string) => {
    if (typeof str === 'string' && str.startsWith('enc:')) {
        try { return atob(str.slice(4)); } catch (e) { return ''; }
    }
    return str;
};

interface AiStateProps {
  language: Language;
  region: Region;
  provider: AIProvider;
  isListening: boolean;
  isSimulating: boolean;
  mediaStream: MediaStream | null;
  initialSettings: VisualizerSettings;
  setSettings: React.Dispatch<React.SetStateAction<VisualizerSettings>>;
  onSongIdentified?: (song: SongInfo | null) => void;
  currentSong?: SongInfo | null;
}

export const useAiState = ({ 
  language, region, provider, isListening, 
  isSimulating, mediaStream, initialSettings, setSettings, onSongIdentified, currentSong
}: AiStateProps) => {
  const { getStorage, setStorage } = useLocalStorage();

  const [lyricsStyle, setLyricsStyle] = useState<LyricsStyle>(() => {
    const saved = getStorage('lyricsStyle', DEFAULT_LYRICS_STYLE);
    return Object.values(LyricsStyle).includes(saved) ? saved : DEFAULT_LYRICS_STYLE;
  });
  
  const [showLyrics, setShowLyrics] = useState<boolean>(() => getStorage('showLyrics', DEFAULT_SHOW_LYRICS));
  const [enableAnalysis, setEnableAnalysis] = useState<boolean>(() => getStorage('enableAnalysis', DEFAULT_ENABLE_ANALYSIS));
  
  const [apiKeys, setApiKeys] = useState<Record<string, string>>(() => {
      const raw = getStorage<Record<string, string>>('api_keys_v1', {});
      const decoded: Record<string, string> = {};
      if (raw && typeof raw === 'object') {
          Object.entries(raw).forEach(([k, v]) => {
              if (typeof v === 'string') decoded[k] = decodeKey(v);
          });
      }
      return decoded;
  });

  useEffect(() => {
      const encoded: Record<string, string> = {};
      Object.entries(apiKeys).forEach(([k, v]) => {
          if (v && typeof v === 'string') {
            encoded[k] = encodeKey(v);
          }
      });
      setStorage('api_keys_v1', encoded);
  }, [apiKeys, setStorage]);

  const { isIdentifying, setCurrentSong, performIdentification } = useIdentification({
    language, region, provider, 
    isEnabled: enableAnalysis, 
    apiKey: apiKeys[provider], 
    onSongUpdate: onSongIdentified
  });

  useEffect(() => {
    setStorage('lyricsStyle', lyricsStyle);
    setSettings(s => ({ ...s, lyricsStyle }));
  }, [lyricsStyle, setStorage, setSettings]);

  useEffect(() => {
    setStorage('showLyrics', showLyrics);
  }, [showLyrics, setStorage]);

  useEffect(() => {
    setStorage('enableAnalysis', enableAnalysis);
  }, [enableAnalysis, setStorage]);
  
  useEffect(() => {
    let interval: number;
    const hasFileLyrics = currentSong?.matchSource === 'FILE' && !!currentSong?.lyrics;

    if (isListening && mediaStream && enableAnalysis && !isSimulating && !hasFileLyrics) {
      performIdentification(mediaStream);
      interval = window.setInterval(() => performIdentification(mediaStream), 20000);
    }
    return () => clearInterval(interval);
  }, [isListening, mediaStream, enableAnalysis, performIdentification, isSimulating, currentSong]);

  const resetAiSettings = useCallback(() => {
    setShowLyrics(DEFAULT_SHOW_LYRICS);
    setEnableAnalysis(DEFAULT_ENABLE_ANALYSIS);
    setLyricsStyle(DEFAULT_LYRICS_STYLE);
    setSettings(p => ({
      ...p,
      lyricsPosition: initialSettings.lyricsPosition,
      recognitionProvider: initialSettings.recognitionProvider,
      lyricsFont: initialSettings.lyricsFont,
      lyricsFontSize: initialSettings.lyricsFontSize
    }));
  }, [setSettings, initialSettings]);

  return {
    lyricsStyle, setLyricsStyle,
    showLyrics, setShowLyrics,
    enableAnalysis, setEnableAnalysis,
    isIdentifying,
    currentSong, setCurrentSong,
    performIdentification,
    resetAiSettings,
    apiKeys, setApiKeys
  };
};