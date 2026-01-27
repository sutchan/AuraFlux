/**
 * File: core/hooks/useAudio.ts
 * Version: 2.1.0
 * Author: Aura Vision Team
 * Copyright (c) 2024 Aura Vision. All rights reserved.
 * Updated: 2025-03-05 17:00
 */

import { useState, useRef, useEffect, useCallback } from 'react';
import { AudioDevice, VisualizerSettings, Language, AudioFeatures, AudioSourceType } from '../types';
import { TRANSLATIONS } from '../i18n';
import { createDemoAudioGraph } from '../services/audioSynthesis';
import { audioBufferToWav } from '../services/audioUtils';

// Inline Worklet Code to avoid module resolution issues.
const WORKLET_CODE = `
class AudioFeaturesProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    this._volume = 0;
    this._lastUpdate = currentTime;
    this._smoothingFactor = 0.8;
  }

  process(inputs, outputs, parameters) {
    const input = inputs[0];
    
    if (input && input.length > 0) {
      const samples = input[0];
      let sum = 0;
      
      for (let i = 0; i < samples.length; ++i) {
        sum += samples[i] * samples[i];
      }
      const rms = Math.sqrt(sum / samples.length);
      
      this._volume = (this._volume * this._smoothingFactor) + (rms * (1 - this._smoothingFactor));

      if (currentTime - this._lastUpdate > 0.016) {
        this.port.postMessage({
          type: 'features',
          data: {
            rms: this._volume,
            energy: rms,
            timestamp: currentTime
          }
        });
        this._lastUpdate = currentTime;
      }
    }

    return true;
  }
}

registerProcessor('audio-features-processor', AudioFeaturesProcessor);
`;

interface UseAudioProps {
  settings: VisualizerSettings;
  language: Language;
}

export const useAudio = ({ settings, language }: UseAudioProps) => {
  const safeFftSize = settings?.fftSize || 512;
  const safeSmoothing = (settings?.smoothing !== undefined) ? settings.smoothing : 0.8;

  // --- Common State ---
  const [sourceType, setSourceType] = useState<AudioSourceType>('MICROPHONE');
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const [analyser, setAnalyser] = useState<AnalyserNode | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  // --- Mic State ---
  const [isListening, setIsListening] = useState(false);
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
  const [audioDevices, setAudioDevices] = useState<AudioDevice[]>([]);

  // --- File State ---
  const [fileStatus, setFileStatus] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle');
  const [fileName, setFileName] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  
  // --- Refs ---
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  
  // Mic Refs
  const streamRef = useRef<MediaStream | null>(null);
  const workletNodeRef = useRef<AudioWorkletNode | null>(null);
  const workletUrlRef = useRef<string | null>(null);
  
  // File Refs
  const audioBufferRef = useRef<AudioBuffer | null>(null);
  const fileSourceNodeRef = useRef<AudioBufferSourceNode | null>(null);
  const startTimeRef = useRef(0);
  const pausedAtRef = useRef(0);
  const rafRef = useRef(0);
  
  // Demo Refs
  const [isSimulating, setIsSimulating] = useState(false);
  const demoGraphRef = useRef<{ stop: () => void } | null>(null);
  const featuresRef = useRef<AudioFeatures>({ rms: 0, energy: 0, timestamp: 0 });

  // Cleanup Worklet URL on unmount
  useEffect(() => {
    return () => {
      if (workletUrlRef.current) {
        URL.revokeObjectURL(workletUrlRef.current);
      }
      stopAll();
    };
  }, []);

  // --- Initialization Helper ---
  const ensureContext = async (): Promise<AudioContext> => {
    if (!audioContextRef.current || audioContextRef.current.state === 'closed') {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioContextClass();
      audioContextRef.current = ctx;
      setAudioContext(ctx);
    }
    
    if (audioContextRef.current.state === 'suspended') {
      await audioContextRef.current.resume();
    }

    if (!analyserRef.current) {
      const node = audioContextRef.current.createAnalyser();
      node.fftSize = safeFftSize;
      node.smoothingTimeConstant = safeSmoothing;
      analyserRef.current = node;
      setAnalyser(node);
    } else {
        // Update existing analyser settings
        analyserRef.current.fftSize = safeFftSize;
        analyserRef.current.smoothingTimeConstant = safeSmoothing;
    }

    return audioContextRef.current;
  };

  const stopAll = useCallback(async () => {
    // Stop Mic
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (workletNodeRef.current) {
      workletNodeRef.current.disconnect();
      workletNodeRef.current = null;
    }
    
    // Stop File
    if (fileSourceNodeRef.current) {
      try { fileSourceNodeRef.current.stop(); } catch(e) {}
      fileSourceNodeRef.current.disconnect();
      fileSourceNodeRef.current = null;
    }
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    
    // Stop Demo
    if (demoGraphRef.current) {
      demoGraphRef.current.stop();
      demoGraphRef.current = null;
    }

    setIsListening(false);
    setIsPlaying(false);
    setIsSimulating(false);
    setMediaStream(null);
  }, []);

  // --- Microphone Logic ---
  const startMicrophone = useCallback(async (deviceId?: string) => {
    setIsPending(true);
    await stopAll();
    setSourceType('MICROPHONE');

    try {
      const ctx = await ensureContext();
      
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: { 
            deviceId: deviceId ? { exact: deviceId } : undefined, 
            echoCancellation: false, 
            noiseSuppression: false, 
            autoGainControl: false 
        } 
      });
      streamRef.current = stream;
      setMediaStream(stream);

      const source = ctx.createMediaStreamSource(stream);
      source.connect(analyserRef.current!);
      
      // Init worklet for features if needed (optional for visuals, good for metadata)
      // Note: We skip worklet for simplicity in this refactor unless critical

      setIsListening(true);
      updateAudioDevices();
    } catch (err: any) {
      console.error(err);
      setErrorMessage("Microphone access denied or error occurred.");
    } finally {
      setIsPending(false);
    }
  }, [stopAll, safeFftSize, safeSmoothing]);

  const updateAudioDevices = async () => {
    if (!navigator.mediaDevices?.enumerateDevices) return;
    try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        setAudioDevices(devices.filter(d => d.kind === 'audioinput').map(d => ({ deviceId: d.deviceId, label: d.label || `Mic ${d.deviceId.slice(0, 5)}` })));
    } catch (e) {}
  };

  // --- File Logic ---
  const loadFile = useCallback(async (file: File) => {
    setIsPending(true);
    await stopAll();
    setSourceType('FILE');
    setFileStatus('loading');
    setFileName(file.name);
    pausedAtRef.current = 0;
    setCurrentTime(0);

    try {
      const ctx = await ensureContext();
      const arrayBuffer = await file.arrayBuffer();
      const audioBuffer = await ctx.decodeAudioData(arrayBuffer);
      audioBufferRef.current = audioBuffer;
      setDuration(audioBuffer.duration);
      setFileStatus('ready');
      
      // Auto play on load
      playFile();
    } catch (e) {
      console.error("File load error:", e);
      setErrorMessage("Failed to decode audio file.");
      setFileStatus('error');
    } finally {
      setIsPending(false);
    }
  }, [stopAll]);

  const playFile = useCallback(async () => {
    if (!audioBufferRef.current) return;
    const ctx = await ensureContext();

    if (fileSourceNodeRef.current) fileSourceNodeRef.current.disconnect();

    const source = ctx.createBufferSource();
    source.buffer = audioBufferRef.current;
    
    // Connect: Source -> Analyser -> Speakers
    source.connect(analyserRef.current!);
    analyserRef.current!.connect(ctx.destination);

    source.onended = () => {
       // Only handle end if natural end, not manual stop
       if (ctx.currentTime - startTimeRef.current >= audioBufferRef.current!.duration - 0.1) {
           setIsPlaying(false);
           pausedAtRef.current = 0;
           setCurrentTime(0);
       }
    };

    source.start(0, pausedAtRef.current);
    startTimeRef.current = ctx.currentTime - pausedAtRef.current;
    fileSourceNodeRef.current = source;
    setIsPlaying(true);

    // Progress Loop
    const updateProgress = () => {
      if (!audioBufferRef.current || !audioContextRef.current) return;
      const now = audioContextRef.current.currentTime;
      // If playing, calculate time. If paused, use pausedAt.
      const current = now - startTimeRef.current;
      setCurrentTime(Math.min(current, audioBufferRef.current.duration));
      
      if (audioContextRef.current.state === 'running' && fileSourceNodeRef.current) {
          rafRef.current = requestAnimationFrame(updateProgress);
      }
    };
    rafRef.current = requestAnimationFrame(updateProgress);

  }, []);

  const pauseFile = useCallback(() => {
    if (fileSourceNodeRef.current && isPlaying && audioContextRef.current) {
        fileSourceNodeRef.current.stop();
        fileSourceNodeRef.current.disconnect();
        fileSourceNodeRef.current = null;
        pausedAtRef.current = audioContextRef.current.currentTime - startTimeRef.current;
        setIsPlaying(false);
        if (rafRef.current) cancelAnimationFrame(rafRef.current);
    }
  }, [isPlaying]);

  const togglePlayback = useCallback(() => {
      if (isPlaying) pauseFile();
      else playFile();
  }, [isPlaying, pauseFile, playFile]);

  const seekFile = useCallback((time: number) => {
      const wasPlaying = isPlaying;
      if (isPlaying) pauseFile();
      pausedAtRef.current = Math.max(0, Math.min(time, duration));
      setCurrentTime(pausedAtRef.current);
      if (wasPlaying) playFile();
  }, [isPlaying, duration, pauseFile, playFile]);

  // --- AI Analysis Helper ---
  const getAudioSlice = useCallback(async (durationSeconds: number = 15): Promise<Blob | null> => {
      if (!audioBufferRef.current) return null;
      
      // Try to take a slice from the middle of the song (e.g., 20% mark) to catch the main theme
      const totalDuration = audioBufferRef.current.duration;
      let startOffset = Math.min(totalDuration * 0.2, Math.max(0, totalDuration - durationSeconds));
      if (startOffset < 0) startOffset = 0;
      
      const sliceDuration = Math.min(durationSeconds, totalDuration - startOffset);
      const sampleRate = audioBufferRef.current.sampleRate;
      const frameCount = Math.floor(sliceDuration * sampleRate);
      
      // Create a new offline context to render just this slice
      const offlineCtx = new OfflineAudioContext(
          audioBufferRef.current.numberOfChannels,
          frameCount,
          sampleRate
      );
      
      const source = offlineCtx.createBufferSource();
      source.buffer = audioBufferRef.current;
      source.connect(offlineCtx.destination);
      source.start(0, startOffset, sliceDuration);
      
      const renderedBuffer = await offlineCtx.startRendering();
      return audioBufferToWav(renderedBuffer);
  }, []);

  // --- Demo Logic ---
  const startDemoMode = useCallback(async () => {
      await stopAll();
      const ctx = await ensureContext();
      const demo = createDemoAudioGraph(ctx, analyserRef.current!);
      demo.start();
      demoGraphRef.current = demo;
      setIsSimulating(true);
      setIsListening(true);
  }, [stopAll]);

  // --- Update Analyser Settings on Change ---
  useEffect(() => {
    if (analyser) {
      analyser.smoothingTimeConstant = safeSmoothing;
      if (analyser.fftSize !== safeFftSize) analyser.fftSize = safeFftSize;
    }
  }, [safeSmoothing, safeFftSize, analyser]);

  return { 
      // Common
      sourceType, setSourceType,
      audioContext, analyser, errorMessage, setErrorMessage, isPending,
      
      // Mic
      isListening, isSimulating, mediaStream, audioDevices, 
      startMicrophone, startDemoMode, toggleMicrophone: startMicrophone, // Alias for legacy
      
      // File
      fileStatus, fileName, isPlaying, duration, currentTime,
      loadFile, togglePlayback, seekFile,
      getAudioSlice,
      
      audioFeaturesRef: featuresRef 
  };
};
