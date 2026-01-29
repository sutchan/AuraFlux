
/**
 * File: core/hooks/useAudio.ts
 * Version: 2.7.0
 * Author: Sut
 * Copyright (c) 2024 Aura Vision. All rights reserved.
 * Updated: 2025-03-12 12:00
 * Changes: Added stereo support (analyserR) and ChannelSplitterNode logic.
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { AudioDevice, VisualizerSettings, Language, AudioFeatures, AudioSourceType, SongInfo, Track, PlaybackMode } from '../types';
import { createDemoAudioGraph } from '../services/audioSynthesis';
import { audioBufferToWav } from '../services/audioUtils';
import { loadPlaylistFromDB, saveTrackToDB, removeTrackFromDB, clearPlaylistDB } from '../services/playlistService';

interface UseAudioProps {
  settings: VisualizerSettings;
  language: Language;
  setCurrentSong: React.Dispatch<React.SetStateAction<SongInfo | null>>;
  t?: any; // Add translation object
}

export const useAudio = ({ settings, language, setCurrentSong, t }: UseAudioProps) => {
  const safeFftSize = settings?.fftSize || 512;
  const safeSmoothing = (settings?.smoothing !== undefined) ? settings.smoothing : 0.8;

  // --- Common State ---
  const [sourceType, setSourceType] = useState<AudioSourceType>('MICROPHONE');
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const [analyser, setAnalyser] = useState<AnalyserNode | null>(null); // Left / Mono
  const [analyserR, setAnalyserR] = useState<AnalyserNode | null>(null); // Right
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  // --- Mic State ---
  const [isListening, setIsListening] = useState(false);
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
  const [audioDevices, setAudioDevices] = useState<AudioDevice[]>([]);

  // --- File/Playlist State ---
  const [fileStatus, setFileStatus] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle');
  const [fileName, setFileName] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  
  // Playlist State
  const [playlist, setPlaylist] = useState<Track[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(-1);
  const [playbackMode, setPlaybackMode] = useState<PlaybackMode>('repeat-all');

  // --- Refs ---
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null); // Left
  const analyserRRef = useRef<AnalyserNode | null>(null); // Right
  
  // Mic Refs
  const streamRef = useRef<MediaStream | null>(null);
  const workletNodeRef = useRef<AudioWorkletNode | null>(null);
  const workletUrlRef = useRef<string | null>(null);
  
  // File Refs
  const audioBufferRef = useRef<AudioBuffer | null>(null);
  const fileSourceNodeRef = useRef<AudioBufferSourceNode | null>(null);
  const splitterRef = useRef<ChannelSplitterNode | null>(null);
  const startTimeRef = useRef(0);
  const pausedAtRef = useRef(0);
  const rafRef = useRef(0);
  
  // Demo Refs
  const [isSimulating, setIsSimulating] = useState(false);
  const demoGraphRef = useRef<{ stop: () => void } | null>(null);
  const featuresRef = useRef<AudioFeatures>({ rms: 0, energy: 0, timestamp: 0 });

  // Track End Handler Ref (to avoid stale closures in onended)
  const handleTrackEndRef = useRef<() => void>(() => {});

  // Cleanup Worklet URL on unmount
  useEffect(() => {
    return () => {
      if (workletUrlRef.current) {
        URL.revokeObjectURL(workletUrlRef.current);
      }
      stopAll();
    };
  }, []);

  // --- Load Playlist on Mount ---
  useEffect(() => {
      const initPlaylist = async () => {
          const savedTracks = await loadPlaylistFromDB();
          if (savedTracks.length > 0) {
              setPlaylist(savedTracks);
              setSourceType('FILE'); // Switch to file mode if tracks exist
              setFileStatus('ready');
              // Auto-select first track but don't play
              if (savedTracks.length > 0) {
                  const first = savedTracks[0];
                  setFileName(first.title);
                  setCurrentSong(first);
                  setCurrentIndex(0);
              }
          }
      };
      initPlaylist();
  }, [setCurrentSong]);

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

    // Init Left Analyser
    if (!analyserRef.current) {
      const node = audioContextRef.current.createAnalyser();
      node.fftSize = safeFftSize;
      node.smoothingTimeConstant = safeSmoothing;
      analyserRef.current = node;
      setAnalyser(node);
    } else {
        analyserRef.current.fftSize = safeFftSize;
        analyserRef.current.smoothingTimeConstant = safeSmoothing;
    }

    // Init Right Analyser
    if (!analyserRRef.current) {
      const node = audioContextRef.current.createAnalyser();
      node.fftSize = safeFftSize;
      node.smoothingTimeConstant = safeSmoothing;
      analyserRRef.current = node;
      setAnalyserR(node);
    } else {
        analyserRRef.current.fftSize = safeFftSize;
        analyserRRef.current.smoothingTimeConstant = safeSmoothing;
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
    if (splitterRef.current) {
      splitterRef.current.disconnect();
      splitterRef.current = null;
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
      
      // Cleanup previous connections
      if (analyserRef.current) {
          try { analyserRef.current.disconnect(); } catch(e) {}
      }
      if (analyserRRef.current) {
          try { analyserRRef.current.disconnect(); } catch(e) {}
      }

      // Route Mic to both analysers (Mirroring Mono)
      source.connect(analyserRef.current!);
      source.connect(analyserRRef.current!);
      
      setIsListening(true);
      updateAudioDevices();
    } catch (err: any) {
      console.error(err);
      setErrorMessage(t?.errors?.accessDenied || "Microphone access denied or error occurred.");
    } finally {
      setIsPending(false);
    }
  }, [stopAll, safeFftSize, safeSmoothing, t]);

  const updateAudioDevices = async () => {
    if (!navigator.mediaDevices?.enumerateDevices) return;
    try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        setAudioDevices(devices.filter(d => d.kind === 'audioinput').map(d => ({ deviceId: d.deviceId, label: d.label || `Mic ${d.deviceId.slice(0, 5)}` })));
    } catch (e) {}
  };

  // --- Playlist Logic ---

  // Helper to extract metadata
  const extractMetadata = (file: File): Promise<Track> => {
      return new Promise((resolve) => {
          const basicTrack: Track = {
              id: Math.random().toString(36).substr(2, 9) + Date.now(),
              file,
              title: file.name.replace(/\.[^/.]+$/, ""),
              artist: 'Unknown Artist',
              identified: false,
              matchSource: 'FILE',
              duration: 0 
          };

          if (window.jsmediatags) {
              window.jsmediatags.read(file, {
                  onSuccess: (tag: any) => {
                      const { title, artist, picture, lyrics } = tag.tags;
                      let albumArtUrl = undefined;
                      let lyricsText: string | undefined = undefined;

                      // Extract Lyrics (USLT frame)
                      if (typeof lyrics === 'string') {
                          lyricsText = lyrics;
                      } else if (typeof lyrics === 'object' && lyrics.lyrics) {
                          lyricsText = lyrics.lyrics;
                      }

                      if (picture) {
                          try {
                              const { data, format } = picture;
                              let base64String = "";
                              for (let i = 0; i < data.length; i++) {
                                  base64String += String.fromCharCode(data[i]);
                              }
                              albumArtUrl = `data:${format};base64,${window.btoa(base64String)}`;
                          } catch (e) {}
                      }
                      resolve({
                          ...basicTrack,
                          title: title || basicTrack.title,
                          artist: artist || basicTrack.artist,
                          albumArtUrl,
                          lyrics: lyricsText,
                          identified: true
                      });
                  },
                  onError: () => resolve(basicTrack)
              });
          } else {
              resolve(basicTrack);
          }
      });
  };

  const importFiles = useCallback(async (files: FileList | File[]) => {
      const fileArray = Array.from(files);
      if (fileArray.length === 0) return;

      setFileStatus('loading');
      
      const newTracks: Track[] = [];
      for (const file of fileArray) {
          const track = await extractMetadata(file);
          newTracks.push(track);
          // Persist each track
          await saveTrackToDB(track);
      }

      setPlaylist(prev => {
          const combined = [...prev, ...newTracks];
          // If we were empty, start playing the first new track
          if (prev.length === 0 && newTracks.length > 0) {
              // Delay slightly to let state update
              setTimeout(() => playTrackByIndex(0, combined), 100);
          }
          return combined;
      });
      setFileStatus('ready');
  }, []);

  // For legacy drag-drop single file support
  const loadFile = useCallback(async (file: File) => {
      await importFiles([file]);
  }, [importFiles]);

  // Internal function to play the loaded buffer
  const playFileBuffer = useCallback(async () => {
    if (!audioBufferRef.current) return;
    const ctx = await ensureContext();

    if (fileSourceNodeRef.current) {
        try { fileSourceNodeRef.current.stop(); } catch(e){}
        fileSourceNodeRef.current.disconnect();
    }
    if (splitterRef.current) {
        splitterRef.current.disconnect();
    }

    const source = ctx.createBufferSource();
    source.buffer = audioBufferRef.current;
    
    // Stereo Routing Logic
    if (audioBufferRef.current.numberOfChannels >= 2) {
        const splitter = ctx.createChannelSplitter(2);
        source.connect(splitter);
        // Route Left -> AnalyserL
        splitter.connect(analyserRef.current!, 0);
        // Route Right -> AnalyserR
        splitter.connect(analyserRRef.current!, 1);
        splitterRef.current = splitter;
    } else {
        // Mono File -> Mirror
        source.connect(analyserRef.current!);
        source.connect(analyserRRef.current!);
    }
    
    // Connect to destination for hearing
    source.connect(ctx.destination);

    source.onended = () => {
       // Check if it ended naturally (approx duration match)
       if (audioBufferRef.current && Math.abs(ctx.currentTime - startTimeRef.current - audioBufferRef.current.duration) < 0.5) {
           handleTrackEndRef.current();
       }
    };

    source.start(0, pausedAtRef.current);
    startTimeRef.current = ctx.currentTime - pausedAtRef.current;
    fileSourceNodeRef.current = source;
    setIsPlaying(true);

    const updateProgress = () => {
      if (!audioBufferRef.current || !audioContextRef.current) return;
      const now = audioContextRef.current.currentTime;
      const current = now - startTimeRef.current;
      setCurrentTime(Math.min(current, audioBufferRef.current.duration));
      
      if (audioContextRef.current.state === 'running' && fileSourceNodeRef.current) {
          rafRef.current = requestAnimationFrame(updateProgress);
      }
    };
    rafRef.current = requestAnimationFrame(updateProgress);

  }, []);

  const playTrackByIndex = useCallback(async (index: number, currentList?: Track[]) => {
      const list = currentList || playlist;
      if (index < 0 || index >= list.length) return;

      const track = list[index];
      setCurrentIndex(index);
      
      // Stop current playback & Microphone
      setIsPending(true);
      
      if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
          streamRef.current = null;
          setIsListening(false);
      }

      if (fileSourceNodeRef.current) {
          try { fileSourceNodeRef.current.stop(); } catch(e) {}
          fileSourceNodeRef.current.disconnect();
          fileSourceNodeRef.current = null;
      }
      if (splitterRef.current) {
          splitterRef.current.disconnect();
          splitterRef.current = null;
      }
      if (rafRef.current) cancelAnimationFrame(rafRef.current);

      setSourceType('FILE');
      setFileName(track.title);
      setCurrentSong(track);
      pausedAtRef.current = 0;
      setCurrentTime(0);

      try {
          const ctx = await ensureContext();
          const arrayBuffer = await track.file.arrayBuffer();
          const audioBuffer = await ctx.decodeAudioData(arrayBuffer);
          audioBufferRef.current = audioBuffer;
          setDuration(audioBuffer.duration);
          
          playFileBuffer(); // Call internal play function
          setFileStatus('ready');
      } catch (e) {
          console.error("Track load error", e);
          setErrorMessage("Failed to play track.");
          setFileStatus('error');
      } finally {
          setIsPending(false);
      }
  }, [playlist, setCurrentSong, playFileBuffer]);

  const removeFromPlaylist = useCallback((index: number) => {
      setPlaylist(prev => {
          const toRemove = prev[index];
          if (toRemove) removeTrackFromDB(toRemove.id);

          const newList = [...prev];
          newList.splice(index, 1);
          
          if (index < currentIndex) {
              setCurrentIndex(c => c - 1);
          } else if (index === currentIndex) {
              if (newList.length === 0) {
                  stopAll();
                  setCurrentIndex(-1);
                  setCurrentSong(null);
                  setFileName(null);
              } else {
                  const nextIdx = index < newList.length ? index : index - 1;
                  setTimeout(() => playTrackByIndex(nextIdx, newList), 50);
              }
          }
          return newList;
      });
  }, [currentIndex, stopAll, setCurrentSong, playTrackByIndex]);

  const clearPlaylist = useCallback(() => {
      stopAll();
      clearPlaylistDB(); 
      setPlaylist([]);
      setCurrentIndex(-1);
      setCurrentSong(null);
      setFileName(null);
      setFileStatus('idle');
  }, [stopAll, setCurrentSong]);

  const playNext = useCallback(() => {
      if (playlist.length === 0) return;
      let nextIndex = -1;
      if (playbackMode === 'shuffle') {
          nextIndex = Math.floor(Math.random() * playlist.length);
          if (playlist.length > 1 && nextIndex === currentIndex) {
              nextIndex = (nextIndex + 1) % playlist.length;
          }
      } else {
          nextIndex = (currentIndex + 1) % playlist.length;
      }
      playTrackByIndex(nextIndex);
  }, [playlist, currentIndex, playbackMode, playTrackByIndex]);

  const playPrev = useCallback(() => {
      if (playlist.length === 0) return;
      let prevIndex = (currentIndex - 1 + playlist.length) % playlist.length;
      playTrackByIndex(prevIndex);
  }, [playlist, currentIndex, playTrackByIndex]);

  const handleTrackEnd = useCallback(() => {
      setIsPlaying(false);
      pausedAtRef.current = 0;
      setCurrentTime(0);

      if (playlist.length > 0) {
          if (playbackMode === 'repeat-one') {
              playTrackByIndex(currentIndex);
          } else if (playbackMode === 'shuffle') {
              const nextIndex = Math.floor(Math.random() * playlist.length);
              playTrackByIndex(nextIndex);
          } else {
              const nextIndex = (currentIndex + 1) % playlist.length;
              playTrackByIndex(nextIndex);
          }
      }
  }, [playlist, currentIndex, playbackMode, playTrackByIndex]);

  useEffect(() => {
      handleTrackEndRef.current = handleTrackEnd;
  }, [handleTrackEnd]);

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
      if (isPlaying) {
          pauseFile();
      } else {
          if (streamRef.current) {
              streamRef.current.getTracks().forEach(track => track.stop());
              streamRef.current = null;
              setIsListening(false);
          }
          playFileBuffer();
      }
  }, [isPlaying, pauseFile, playFileBuffer]);

  const seekFile = useCallback((time: number) => {
      const wasPlaying = isPlaying;
      if (isPlaying) pauseFile();
      pausedAtRef.current = Math.max(0, Math.min(time, duration));
      setCurrentTime(pausedAtRef.current);
      if (wasPlaying) playFileBuffer();
  }, [isPlaying, duration, pauseFile, playFileBuffer]);

  // --- AI Analysis Helper ---
  const getAudioSlice = useCallback(async (durationSeconds: number = 15): Promise<Blob | null> => {
      if (!audioBufferRef.current) return null;
      
      const totalDuration = audioBufferRef.current.duration;
      let startOffset = Math.min(totalDuration * 0.2, Math.max(0, totalDuration - durationSeconds));
      if (startOffset < 0) startOffset = 0;
      
      const sliceDuration = Math.min(durationSeconds, totalDuration - startOffset);
      const sampleRate = audioBufferRef.current.sampleRate;
      const frameCount = Math.floor(sliceDuration * sampleRate);
      
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
      try { analyserRef.current!.connect(ctx.destination); } catch(e){}
      
      demo.start();
      demoGraphRef.current = demo;
      setIsSimulating(true);
      setIsListening(true);
  }, [stopAll]);

  useEffect(() => {
    if (analyser) {
      analyser.smoothingTimeConstant = safeSmoothing;
      if (analyser.fftSize !== safeFftSize) analyser.fftSize = safeFftSize;
    }
    if (analyserR) {
        analyserR.smoothingTimeConstant = safeSmoothing;
        if (analyserR.fftSize !== safeFftSize) analyserR.fftSize = safeFftSize;
    }
  }, [safeSmoothing, safeFftSize, analyser, analyserR]);

  return { 
      // Common
      sourceType, setSourceType,
      audioContext, analyser, analyserR, errorMessage, setErrorMessage, isPending,
      
      // Mic
      isListening, isSimulating, mediaStream, audioDevices, 
      startMicrophone, startDemoMode, toggleMicrophone: startMicrophone,
      
      // File / Playlist
      fileStatus, fileName, isPlaying, duration, currentTime,
      playlist, currentIndex, playbackMode, setPlaybackMode,
      importFiles, loadFile, togglePlayback, seekFile,
      playNext, playPrev, playTrackByIndex, removeFromPlaylist, clearPlaylist,
      
      getAudioSlice,
      audioFeaturesRef: featuresRef 
  };
};
