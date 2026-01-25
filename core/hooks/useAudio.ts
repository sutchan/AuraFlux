/**
 * File: core/hooks/useAudio.ts
 * Version: 1.7.32
 * Author: Aura Vision Team
 * Copyright (c) 2024 Aura Vision. All rights reserved.
 * Updated: 2025-03-05 12:00
 */

import { useState, useRef, useEffect, useCallback } from 'react';
import { AudioDevice, VisualizerSettings, Language, AudioFeatures } from '../types';
import { TRANSLATIONS } from '../i18n';
import { createDemoAudioGraph } from '../services/audioSynthesis';

// Inline Worklet Code to avoid module resolution issues.
// Note: AudioWorkletProcessor is available in the AudioWorkletGlobalScope.
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
  // Defensive defaults: Ensure values exist even if settings object is malformed or null during init
  const safeFftSize = settings?.fftSize || 512;
  const safeSmoothing = (settings?.smoothing !== undefined) ? settings.smoothing : 0.8;

  const [isListening, setIsListening] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const [analyser, setAnalyser] = useState<AnalyserNode | null>(null);
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
  const [audioDevices, setAudioDevices] = useState<AudioDevice[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const featuresRef = useRef<AudioFeatures>({ rms: 0, energy: 0, timestamp: 0 });
  const workletNodeRef = useRef<AudioWorkletNode | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const demoGraphRef = useRef<{ stop: () => void } | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const workletUrlRef = useRef<string | null>(null);

  // Cleanup Worklet URL on unmount
  useEffect(() => {
    return () => {
      if (workletUrlRef.current) {
        URL.revokeObjectURL(workletUrlRef.current);
        workletUrlRef.current = null;
      }
    };
  }, []);

  const stopListening = useCallback(async () => {
    try {
        if (workletNodeRef.current) {
            workletNodeRef.current.port.onmessage = null;
            workletNodeRef.current.disconnect();
            workletNodeRef.current = null;
        }
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
        if (demoGraphRef.current) {
            demoGraphRef.current.stop();
            demoGraphRef.current = null;
        }
        if (audioContextRef.current) {
            if (audioContextRef.current.state !== 'closed') {
                await audioContextRef.current.close();
            }
            audioContextRef.current = null;
        }
    } catch (e) {
        console.warn("[Audio] Error during cleanup:", e);
    } finally {
        setAudioContext(null);
        setAnalyser(null);
        setMediaStream(null);
        setIsListening(false);
        setIsSimulating(false);
        featuresRef.current = { rms: 0, energy: 0, timestamp: 0 };
    }
  }, []);

  const attemptResume = useCallback(async () => {
    if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
      try {
        await audioContextRef.current.resume();
        console.log("[Audio] Context resumed successfully.");
      } catch (e) {
        console.warn("[Audio] Resume failed:", e);
      }
    }
  }, []);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && isListening) {
        attemptResume();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [isListening, attemptResume]);

  const updateAudioDevices = useCallback(async () => {
    if (typeof navigator === 'undefined' || !navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) return;
    try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        setAudioDevices(devices.filter(d => d.kind === 'audioinput').map(d => ({ deviceId: d.deviceId, label: d.label || `Mic ${d.deviceId.slice(0, 5)}` })));
    } catch (e) {
        console.warn("Could not enumerate audio devices", e);
    }
  }, []);
  
  useEffect(() => {
    if (typeof navigator !== 'undefined' && navigator.mediaDevices) {
        navigator.mediaDevices.addEventListener('devicechange', updateAudioDevices);
        return () => navigator.mediaDevices?.removeEventListener('devicechange', updateAudioDevices);
    }
  }, [updateAudioDevices]);

  const initWorklet = async (ctx: AudioContext, source: MediaStreamAudioSourceNode) => {
    try {
        if (!workletUrlRef.current) {
            const blob = new Blob([WORKLET_CODE], { type: 'application/javascript' });
            workletUrlRef.current = URL.createObjectURL(blob);
        }

        await ctx.audioWorklet.addModule(workletUrlRef.current);
        
        const node = new AudioWorkletNode(ctx, 'audio-features-processor');
        
        node.port.onmessage = (event) => {
            if (event.data.type === 'features') {
                featuresRef.current = event.data.data;
            }
        };
        
        source.connect(node);
        node.connect(ctx.destination); 
        workletNodeRef.current = node;
        console.log("[Audio] Worklet initialized successfully.");
    } catch (e) {
        console.warn("[Audio] AudioWorklet failed to load, falling back to main thread only:", e);
    }
  };

  const startMicrophone = useCallback(async (deviceId?: string) => {
    setErrorMessage(null);
    await stopListening();

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          throw new Error("Audio API not supported in this browser");
      }

      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: { 
            deviceId: deviceId ? { exact: deviceId } : undefined, 
            echoCancellation: false, 
            noiseSuppression: false, 
            autoGainControl: false 
        } 
      });
      streamRef.current = stream;

      const audioTrack = stream.getAudioTracks()[0];
      if (audioTrack) {
          audioTrack.onended = () => {
              console.log("Audio track ended. Stopping listener.");
              stopListening();
          };
      }
      
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) throw new Error("AudioContext not supported");

      const context = new AudioContextClass();
      
      context.onstatechange = () => {
          if (context.state === 'closed') return;
      };

      if (context.state === 'suspended') await context.resume();

      const node = context.createAnalyser();
      node.fftSize = safeFftSize;
      node.smoothingTimeConstant = safeSmoothing;
      
      const source = context.createMediaStreamSource(stream);
      source.connect(node);

      await initWorklet(context, source);

      audioContextRef.current = context;
      setAudioContext(context);
      setAnalyser(node);
      setMediaStream(stream);
      setIsListening(true);
      setIsSimulating(false);
      updateAudioDevices();
    } catch (err: any) {
      const t = TRANSLATIONS[language] || TRANSLATIONS['en'];
      const isPermissionDenied = err.name === 'NotAllowedError' || err.message?.includes('denied');
      
      setErrorMessage(isPermissionDenied ? t.errors.accessDenied : t.errors.general);
      setIsListening(false);
      
      if (isPermissionDenied) {
          console.warn("[Audio] Permission denied by user.");
      } else {
          console.error("[Audio] Access Error:", err);
      }
    }
  }, [safeFftSize, safeSmoothing, updateAudioDevices, language, stopListening]);

  const startDemoMode = useCallback(async () => {
    setErrorMessage(null);
    await stopListening();

    try {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        if (!AudioContextClass) return;

        const context = new AudioContextClass();
        if (context.state === 'suspended') await context.resume();

        const node = context.createAnalyser();
        node.fftSize = safeFftSize;
        node.smoothingTimeConstant = safeSmoothing;

        const silentDestination = context.createGain();
        silentDestination.gain.value = 0;
        node.connect(silentDestination);
        silentDestination.connect(context.destination);

        const demoGraph = createDemoAudioGraph(context, node);
        demoGraph.start();
        demoGraphRef.current = demoGraph;

        audioContextRef.current = context;
        setAudioContext(context);
        setAnalyser(node);
        setMediaStream(null);
        setIsListening(true);
        setIsSimulating(true);
    } catch (e) {
        console.error("Demo mode synthesis failed", e);
    }
  }, [safeFftSize, safeSmoothing, stopListening]);

  const toggleMicrophone = useCallback(async (deviceId: string) => {
    if (isPending) return;
    
    setIsPending(true);
    try {
        if (isListening) {
          await stopListening();
        } else {
          await startMicrophone(deviceId);
        }
    } finally {
        setIsPending(false);
    }
  }, [isListening, isPending, startMicrophone, stopListening]);
  
  useEffect(() => {
    if (analyser) {
      analyser.smoothingTimeConstant = safeSmoothing;
      if (analyser.fftSize !== safeFftSize) analyser.fftSize = safeFftSize;
    }
  }, [safeSmoothing, safeFftSize, analyser]);

  // Robust Return: Always return the structure expected by destructuring
  return { 
      isListening, isSimulating, isPending,
      audioContext, analyser, mediaStream, audioDevices, 
      errorMessage, setErrorMessage, 
      startMicrophone, startDemoMode, toggleMicrophone,
      audioFeaturesRef: featuresRef 
  };
};