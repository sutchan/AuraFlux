
/**
 * File: core/hooks/useAiState.ts
 * Version: 1.7.34
 * Author: Aura Vision Team
 * Copyright (c) 2025 Aura Vision. All rights reserved.
 * Updated: 2025-03-20 12:40
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useLocalStorage } from './useLocalStorage';
import { useIdentification } from './useIdentification';
import { LyricsStyle, Language, Region, VisualizerSettings, AIProvider, SongInfo } from '../types';

const DEFAULT_LYRICS_STYLE = LyricsStyle.KARAOKE;
const DEFAULT_SHOW_LYRICS = false;
const DEFAULT_ENABLE_ANALYSIS = false;

// Privacy Helper: Simple Base64 obfuscation to prevent shoulder-surfing leaks.
// Note: This is not encryption. The key is still accessible in the browser.
const encodeKey = (key: string) => `enc:${btoa(key)}`;
const decodeKey = (str: string) => {
    if (typeof str === 'string' && str.startsWith('enc:')) {
        try { return atob(str.slice(4)); } catch (e) { return ''; }
    }
    return str; // Backward compatibility for legacy plain-text keys
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
  currentSong?: SongInfo | null; // Passed from AudioContext to optimize
}

export const useAiState = ({ 
  language, region, provider, isListening, 
  isSimulating, mediaStream, initialSettings, setSettings, onSongIdentified, currentSong
}: AiStateProps) => {
  const { getStorage, setStorage } = useLocalStorage();

  const [lyricsStyle, setLyricsStyle] = useState<LyricsStyle>(() => {
    const saved = getStorage('lyricsStyle', DEFAULT_LYRICS_STYLE);
    // Robustness: Validate enum from storage. If invalid, fallback to default.
    return Object.values(LyricsStyle).includes(saved) ? saved : DEFAULT_LYRICS_STYLE;
  });
  
  // Controls visibility of UI overlay (Lyrics/Song Info)
  const [showLyrics, setShowLyrics] = useState<boolean>(() => getStorage('showLyrics', DEFAULT_SHOW_LYRICS));
  
  // Controls background AI analysis loop (Genre/Mood/Identification)
  const [enableAnalysis, setEnableAnalysis] = useState<boolean>(() => getStorage('enableAnalysis', DEFAULT_ENABLE_ANALYSIS));
  
  // Store API Keys per provider with obfuscation
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

  // Save keys encoded
  useEffect(() => {
      const encoded: Record<string, string> = {};
      Object.entries(apiKeys).forEach(([k, v]) => {
          // FIX: Add type guard for `v` to satisfy TypeScript. `Object.entries` can return `unknown` for values.
          if (v && typeof v === 'string') {
            encoded[k] = encodeKey(v);
          }
      });
      setStorage('api_keys_v1', encoded);
  }, [apiKeys, setStorage]);

  // We pass 'enableAnalysis' as the "showLyrics" prop to useIdentification,
  // effectively decoupling the loop from the UI visibility.
  const { isIdentifying, setCurrentSong, performIdentification } = useIdentification({
    language, region, provider, 
    showLyrics: enableAnalysis, // Pass enableAnalysis here to control the loop
    apiKey: apiKeys[provider], // Pass the custom key for current provider
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
    
    // Optimization: If we are playing a file and it already has full lyrics (e.g. from ID3),
    // skip the AI loop to save API costs and avoid conflicts.
    const hasFileLyrics = currentSong?.matchSource === 'FILE' && !!currentSong?.lyrics;

    // Trigger loop based on enableAnalysis, not showLyrics
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
