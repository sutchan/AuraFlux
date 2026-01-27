/**
 * File: core/types/audio.ts
 * Version: 1.7.39
 * Author: Aura Vision Team
 * Copyright (c) 2024 Aura Vision. All rights reserved.
 * Updated: 2025-03-05 12:00
 */

export enum LyricsStyle {
  STANDARD = 'STANDARD',
  KARAOKE = 'KARAOKE',
  MINIMAL = 'MINIMAL'
}

export interface SongInfo {
  title: string;
  artist: string;
  lyricsSnippet?: string;
  mood?: string;
  mood_en_keywords?: string; // Canonical English keywords for styling
  identified: boolean;
  searchUrl?: string;
  albumArtUrl?: string;
  matchSource?: 'AI' | 'LOCAL' | 'MOCK' | 'GEMINI' | 'OPENAI' | 'GROQ' | 'CLAUDE' | 'DEEPSEEK' | 'QWEN' | 'PREVIEW' | 'FILE';
}

export interface AudioDevice {
  deviceId: string;
  label: string;
}

export interface AudioFeatures {
  rms: number;      // Smoothed volume level (0.0 - 1.0)
  energy: number;   // Raw instantaneous energy (0.0 - 1.0)
  timestamp: number;
}