/**
 * File: core/services/fingerprintService.ts
 * Version: 1.7.43
 * Author: Sut
 * Copyright (c) 2024 Aura Vision. All rights reserved.
 * Updated: 2025-03-05 12:00
 */

import { SongInfo } from '../types';

const STORAGE_KEY = 'av_fingerprints_v2'; // Bumped version for new format
const MAX_CACHE_SIZE = 50;
const SIMILARITY_THRESHOLD = 0.25;

// v1.7.43: Define frequency bands for more robust fingerprinting
const PEAK_BANDS = [
  [2, 10],   // Sub-bass (approx 86-430Hz)
  [10, 30],  // Bass (approx 430-1290Hz)
  [30, 60],  // Low Mids (approx 1290-2580Hz)
  [60, 100]  // Mids (approx 2580-4300Hz)
];

interface FingerprintEntry {
  features: number[]; 
  song: SongInfo;
  timestamp: number;
}

export const generateFingerprint = async (base64Audio: string): Promise<number[]> => {
  let audioCtx: AudioContext | null = null;
  let offlineCtx: OfflineAudioContext | null = null;

  try {
    const binaryString = window.atob(base64Audio);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) bytes[i] = binaryString.charCodeAt(i);
    const arrayBuffer = bytes.buffer;

    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
    
    offlineCtx = new OfflineAudioContext(audioBuffer.numberOfChannels, audioBuffer.length, audioBuffer.sampleRate);
    const source = offlineCtx.createBufferSource();
    source.buffer = audioBuffer;

    const analyser = offlineCtx.createAnalyser();
    analyser.fftSize = 1024;
    analyser.smoothingTimeConstant = 0;

    const bufferSize = 2048; 
    const scriptProcessor = offlineCtx.createScriptProcessor(bufferSize, 1, 1);

    source.connect(analyser);
    analyser.connect(scriptProcessor);
    scriptProcessor.connect(offlineCtx.destination);
    source.start(0);

    const features: Set<number> = new Set();
    const freqData = new Uint8Array(analyser.frequencyBinCount);

    scriptProcessor.onaudioprocess = (audioProcessingEvent) => {
      analyser.getByteFrequencyData(freqData);
      
      // --- v1.7.43: Constellation Fingerprinting ---
      // Instead of one peak, find the strongest peak in each defined band.
      // This creates a much more unique "constellation" of features per timeslice.
      for (let bandIdx = 0; bandIdx < PEAK_BANDS.length; bandIdx++) {
          const [start, end] = PEAK_BANDS[bandIdx];
          let maxVal = 0;
          let maxIndex = -1;
          for (let i = start; i < end; i++) {
              if (freqData[i] > maxVal) {
                  maxVal = freqData[i];
                  maxIndex = i;
              }
          }
          // Add feature only if it's significant, creating a sparse but robust fingerprint
          if (maxVal > 50 && maxIndex !== -1) {
              // Create a unique key for the peak: (Band Index * 1000) + Frequency Bin Index
              // This ensures that a peak at index 50 in Band 1 (1050) is different from
              // a peak at index 50 in Band 2 (2050).
              features.add(bandIdx * 1000 + maxIndex);
          }
      }
    };

    await offlineCtx.startRendering();
    
    scriptProcessor.onaudioprocess = null;
    scriptProcessor.disconnect();

    return Array.from(features);

  } catch (e) {
    console.error("[Fingerprint] generation failed:", e);
    return [];
  } finally {
    if (audioCtx) {
      try { await audioCtx.close(); } catch (e) { console.warn("[Fingerprint] Error closing AudioContext:", e); }
    }
  }
};

export const saveToLocalCache = (features: number[], song: SongInfo) => {
  if (!features || features.length < 5) return;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    let cache: FingerprintEntry[] = raw ? JSON.parse(raw) : [];
    const existingIndex = cache.findIndex(c => 
        c.song.title.toLowerCase() === song.title.toLowerCase() && 
        c.song.artist.toLowerCase() === song.artist.toLowerCase()
    );
    if (existingIndex >= 0) cache.splice(existingIndex, 1);
    const entry: FingerprintEntry = {
        features,
        song: { ...song, matchSource: 'LOCAL' },
        timestamp: Date.now()
    };
    cache.unshift(entry);
    if (cache.length > MAX_CACHE_SIZE) cache = cache.slice(0, MAX_CACHE_SIZE);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cache));
  } catch (e) {
    console.warn("Local storage save failed", e);
  }
};

export const findLocalMatch = (features: number[]): SongInfo | null => {
  if (!features || features.length < 5) return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const cache: FingerprintEntry[] = JSON.parse(raw);
    let bestMatch: SongInfo | null = null;
    let bestScore = 0;

    for (const entry of cache) {
       const score = calculateJaccardSimilarity(features, entry.features);
       if (score > bestScore) {
           bestScore = score;
           bestMatch = entry.song;
       }
    }
    return (bestScore >= SIMILARITY_THRESHOLD && bestMatch) ? bestMatch : null;
  } catch (e) {
    return null;
  }
};

function calculateJaccardSimilarity(arr1: number[], arr2: number[]): number {
    const set1 = new Set(arr1);
    const set2 = new Set(arr2);
    let intersection = 0;
    set1.forEach(val => { if (set2.has(val)) intersection++; });
    const union = set1.size + set2.size - intersection;
    return union === 0 ? 0 : intersection / union;
}