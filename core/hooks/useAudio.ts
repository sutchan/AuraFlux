/**
 * File: core/hooks/useAudio.ts
 * Version: 1.8.50
 * Author: Sut
 * Updated: 2025-03-25 00:10 - Added navigator.mediaDevices checks and context state auto-recovery.
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { AudioDevice, VisualizerSettings, Language, AudioSourceType, SongInfo } from '../types';
import { audioBufferToWav } from '../services/audioUtils';
import { usePlaylist } from './usePlaylist';

interface UseAudioProps {
  settings: VisualizerSettings;
  language: Language;
  setCurrentSong: React.Dispatch<React.SetStateAction<SongInfo | null>>;
  t?: any;
}

export const useAudio = ({ settings, setCurrentSong, t }: UseAudioProps) => {
  const safeFftSize = settings?.fftSize || 512;
  const safeSmoothing = settings?.smoothing ?? 0.8;

  const [sourceType, setSourceType] = useState<AudioSourceType>('MICROPHONE');
  const [analyser, setAnalyser] = useState<AnalyserNode | null>(null);
  const [analyserR, setAnalyserR] = useState<AnalyserNode | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
  const [audioDevices, setAudioDevices] = useState<AudioDevice[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);

  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const analyserRRef = useRef<AnalyserNode | null>(null);
  const audioBufferRef = useRef<AudioBuffer | null>(null);
  const fileSourceNodeRef = useRef<AudioBufferSourceNode | null>(null);
  const micSourceNodeRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const splitterNodeRef = useRef<ChannelSplitterNode | null>(null);
  const startTimeRef = useRef(0);
  const pausedAtRef = useRef(0);
  const rafRef = useRef(0);

  const playTrackByIndexRef = useRef<(index: number) => Promise<void>>(null!);
  const pl = usePlaylist(setCurrentSong);

  useEffect(() => {
    const getDevices = async () => {
        try {
            if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
                console.warn("[Audio] MediaDevices API not available (Insecure context?)");
                return;
            }
            const devices = await navigator.mediaDevices.enumerateDevices();
            const audioIn = devices
                .filter(d => d.kind === 'audioinput')
                .map(d => ({ deviceId: d.deviceId, label: d.label || `Microphone ${d.deviceId.slice(0, 5)}` }));
            setAudioDevices(audioIn);
        } catch (e) {
            console.error("[Audio] Device enumeration failed:", e);
        }
    };
    getDevices();
    
    if (navigator.mediaDevices) {
        navigator.mediaDevices.addEventListener('devicechange', getDevices);
        return () => navigator.mediaDevices.removeEventListener('devicechange', getDevices);
    }
  }, []);

  const ensureContext = useCallback(async (): Promise<AudioContext> => {
    if (!audioContextRef.current || audioContextRef.current.state === 'closed') {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    
    if (audioContextRef.current.state === 'suspended') {
        await audioContextRef.current.resume();
    }

    if (!analyserRef.current || !analyserRRef.current) {
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = analyserRRef.current.fftSize = safeFftSize;
      analyserRef.current.smoothingTimeConstant = analyserRRef.current.smoothingTimeConstant = safeSmoothing;
      setAnalyser(analyserRef.current);
      setAnalyserR(analyserRRef.current);
    }
    
    return audioContextRef.current;
  }, [safeFftSize, safeSmoothing]);

  const stopAll = useCallback(async () => {
    cancelAnimationFrame(rafRef.current);
    if (mediaStream) mediaStream.getTracks().forEach(track => track.stop());
    const disconnectNode = (nodeRef: React.MutableRefObject<any>) => {
        if (nodeRef.current) { try { nodeRef.current.disconnect(); } catch (e) {} nodeRef.current = null; }
    };
    if (fileSourceNodeRef.current) try { fileSourceNodeRef.current.stop(); } catch(e) {}
    disconnectNode(fileSourceNodeRef); disconnectNode(micSourceNodeRef); disconnectNode(splitterNodeRef);
    setIsListening(false); setIsPlaying(false); setMediaStream(null);
  }, [mediaStream]);

  const toggleMicrophone = useCallback(async (deviceId?: string) => {
    if (!navigator.mediaDevices) {
        alert(t?.errors?.accessDenied || "Microphone access not supported in this browser context.");
        return;
    }

    if (isListening && sourceType === 'MICROPHONE' && (!deviceId || deviceId === selectedDeviceId)) {
      await stopAll();
    } else {
      setIsPending(true);
      try {
        await stopAll();
        setSourceType('MICROPHONE');
        const ctx = await ensureContext();
        const constraints = (deviceId || selectedDeviceId) 
            ? { audio: { deviceId: { exact: deviceId || selectedDeviceId } } } 
            : { audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false } };
            
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        setMediaStream(stream);
        const source = ctx.createMediaStreamSource(stream);
        micSourceNodeRef.current = source;
        if (analyserRef.current) source.connect(analyserRef.current);
        if (analyserRRef.current) source.connect(analyserRRef.current);
        if (deviceId) setSelectedDeviceId(deviceId);
        setIsListening(true);
      } catch (e) {
          console.error("[Audio] Microphone access denied:", e);
      } finally {
          setIsPending(false);
      }
    }
  }, [isListening, sourceType, stopAll, ensureContext, selectedDeviceId, t]);

  const playFileBuffer = useCallback(async () => {
    if (!audioBufferRef.current) return;
    const ctx = await ensureContext();
    const source = ctx.createBufferSource(); source.buffer = audioBufferRef.current;
    const splitter = ctx.createChannelSplitter(2); splitterNodeRef.current = splitter;
    source.connect(splitter);
    splitter.connect(analyserRef.current!, 0);
    splitter.connect(analyserRRef.current!, audioBufferRef.current.numberOfChannels > 1 ? 1 : 0);
    source.connect(ctx.destination);
    source.onended = () => { 
        if (Math.abs(ctx.currentTime - startTimeRef.current - audioBufferRef.current!.duration) < 0.5) { 
            const next = pl.getNextIndex(); 
            if (next !== -1) playTrackByIndexRef.current(next); 
        } 
    };
    source.start(0, pausedAtRef.current);
    startTimeRef.current = ctx.currentTime - pausedAtRef.current;
    fileSourceNodeRef.current = source; setIsPlaying(true);
    const update = () => { if (audioContextRef.current) setCurrentTime(audioContextRef.current.currentTime - startTimeRef.current); rafRef.current = requestAnimationFrame(update); };
    rafRef.current = requestAnimationFrame(update);
  }, [pl.getNextIndex, ensureContext]);

  const playTrackByIndex = useCallback(async (index: number) => {
    const track = pl.playlist[index]; if (!track) return;
    setIsPending(true); await stopAll(); setSourceType('FILE'); setCurrentSong(track); pl.setCurrentIndex(index); pausedAtRef.current = 0;
    try {
      const ctx = await ensureContext(); const ab = await ctx.decodeAudioData(await track.file.arrayBuffer());
      audioBufferRef.current = ab; setDuration(ab.duration); playFileBuffer();
    } catch (e) {
        console.error("[Audio] File decoding error:", e);
    } finally { setIsPending(false); }
  }, [pl.playlist, stopAll, setCurrentSong, playFileBuffer, ensureContext, pl.setCurrentIndex]);

  useEffect(() => { playTrackByIndexRef.current = playTrackByIndex; }, [playTrackByIndex]);

  return {
    sourceType, analyser, analyserR, isListening, isPending, mediaStream, audioDevices,
    selectedDeviceId, onDeviceChange: setSelectedDeviceId,
    isPlaying, duration, currentTime, ...pl, toggleMicrophone, playTrackByIndex,
    togglePlayback: () => isPlaying ? (fileSourceNodeRef.current?.stop(), setIsPlaying(false)) : playFileBuffer(),
    seekFile: (t: number) => { if (fileSourceNodeRef.current) try { fileSourceNodeRef.current.stop(); } catch(e) {} pausedAtRef.current = t; if (isPlaying) playFileBuffer(); else setCurrentTime(t); },
    getAudioSlice: async (s = 15) => audioBufferRef.current ? audioBufferToWav(audioBufferRef.current) : null,
    audioContext: audioContextRef.current
  };
};