/**
 * File: core/hooks/useAiState.ts
 * Version: 1.7.32
 * Author: Sut
 * Copyright (c) 2024 Aura Vision. All rights reserved.
 * Updated: 2025-03-04 11:00
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useLocalStorage } from './useLocalStorage';
import { useIdentification } from './useIdentification';
import { LyricsStyle, Language, Region, VisualizerSettings, AIProvider } from '../types';

const DEFAULT_LYRICS_STYLE = LyricsStyle.KARAOKE;
const DEFAULT_SHOW_LYRICS = false;

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
}

export const useAiState = ({ 
  language, region, provider, isListening, 
  isSimulating, mediaStream, initialSettings, setSettings 
}: AiStateProps) => {
  const { getStorage, setStorage } = useLocalStorage();

  const [lyricsStyle, setLyricsStyle] = useState<LyricsStyle>(() => {
    const saved = getStorage('lyricsStyle', DEFAULT_LYRICS_STYLE);
    // Robustness: Validate enum from storage. If invalid, fallback to default.
    return Object.values(LyricsStyle).includes(saved) ? saved : DEFAULT_LYRICS_STYLE;
  });
  const [showLyrics, setShowLyrics] = useState<boolean>(() => getStorage('showLyrics', DEFAULT_SHOW_LYRICS));
  
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

  const { isIdentifying, currentSong, setCurrentSong, performIdentification } = useIdentification({
    language, region, provider, showLyrics,
    apiKey: apiKeys[provider] // Pass the custom key for current provider
  });

  useEffect(() => {
    setStorage('lyricsStyle', lyricsStyle);
    setSettings(s => ({ ...s, lyricsStyle }));
  }, [lyricsStyle, setStorage, setSettings]);

  useEffect(() => {
    setStorage('showLyrics', showLyrics);
  }, [showLyrics, setStorage]);
  
  useEffect(() => {
    let interval: number;
    if (isListening && mediaStream && showLyrics && !isSimulating) {
      performIdentification(mediaStream);
      interval = window.setInterval(() => performIdentification(mediaStream), 20000);
    }
    return () => clearInterval(interval);
  }, [isListening, mediaStream, showLyrics, performIdentification, isSimulating]);

  const resetAiSettings = useCallback(() => {
    setShowLyrics(DEFAULT_SHOW_LYRICS);
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
    isIdentifying,
    currentSong, setCurrentSong,
    performIdentification,
    resetAiSettings,
    apiKeys, setApiKeys
  };
};