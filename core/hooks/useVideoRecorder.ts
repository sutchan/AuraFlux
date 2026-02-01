/**
 * File: core/hooks/useVideoRecorder.ts
 * Version: 1.8.39
 * Author: Sut
 */

import { useState, useRef, useCallback, useEffect } from 'react';
import { AudioSourceType } from '../types';

export interface RecorderConfig {
    resolution: number | 'native';
    aspectRatio: number | 'native';
    fps: number;
    bitrate: number;
    mimeType: string;
    duration?: number;
    recGain: number;
    fadeDuration: number;
}

interface UseVideoRecorderProps {
    audioContext: AudioContext | null;
    analyser: AnalyserNode | null;
    mediaStream: MediaStream | null;
    showToast: (message: string, type?: 'success' | 'info' | 'error') => void;
    sourceType: AudioSourceType;
    t: any;
}

export const useVideoRecorder = ({ audioContext, analyser, mediaStream, showToast, sourceType, t }: UseVideoRecorderProps) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [duration, setDuration] = useState(0);
  const [size, setSize] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const activeMimeTypeRef = useRef<string>('');
  const toasts = t?.toasts || {};

  const recDestinationRef = useRef<MediaStreamAudioDestinationNode | null>(null);
  const recGainNodeRef = useRef<GainNode | null>(null);
  const recSourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const autoStopTimerRef = useRef<number | null>(null);
  const fadeDurationRef = useRef<number>(0);
  const startTimeRef = useRef<number>(0);
  const timerIntervalRef = useRef<number | null>(null);
  const originalCanvasStateRef = useRef<{ width: number; height: number; styleWidth: string; styleHeight: string } | null>(null);

  const setupRecordingAudio = useCallback((inputGain: number, fadeDur: number): MediaStream | null => {
      if (!audioContext || audioContext.state !== 'running') return null;

      /**
       * CRITICAL FIX: Verify that cached nodes belong to the CURRENT AudioContext.
       * If useAudio recreated the context (e.g. after a crash or on some browsers), 
       * we must recreate our gain/destination nodes or connection will fail.
       */
      if (recGainNodeRef.current && recGainNodeRef.current.context !== audioContext) {
          try { recGainNodeRef.current.disconnect(); } catch(e) {}
          recGainNodeRef.current = null;
      }
      if (recDestinationRef.current && recDestinationRef.current.context !== audioContext) {
          try { recDestinationRef.current.disconnect(); } catch(e) {}
          recDestinationRef.current = null;
      }

      if (!recGainNodeRef.current) recGainNodeRef.current = audioContext.createGain();
      if (!recDestinationRef.current) recDestinationRef.current = audioContext.createMediaStreamDestination();
      
      recGainNodeRef.current.gain.cancelScheduledValues(audioContext.currentTime);
      if (fadeDur > 0) {
          recGainNodeRef.current.gain.setValueAtTime(0, audioContext.currentTime);
          recGainNodeRef.current.gain.linearRampToValueAtTime(inputGain, audioContext.currentTime + fadeDur);
      } else {
          recGainNodeRef.current.gain.setValueAtTime(inputGain, audioContext.currentTime);
      }

      if (sourceType === 'MICROPHONE' && mediaStream && mediaStream.active) {
          if (recSourceRef.current) {
              try { recSourceRef.current.disconnect(); } catch(e) {}
              recSourceRef.current = null;
          }
          // source node must also be from the current context
          recSourceRef.current = audioContext.createMediaStreamSource(mediaStream);
          recSourceRef.current.connect(recGainNodeRef.current);
      } else if (sourceType === 'FILE' && analyser) {
          // analyser is already verified to be from the same context in useAudio
          try { analyser.connect(recGainNodeRef.current); } catch (e) {
              console.warn("[Recorder] Failed to connect analyser to recorder gain:", e);
              return null;
          }
      } else return null;

      recGainNodeRef.current.connect(recDestinationRef.current);
      return recDestinationRef.current.stream;
  }, [audioContext, analyser, mediaStream, sourceType]);

  const cleanupAudioGraph = useCallback(() => {
      if (recSourceRef.current) { 
          try { recSourceRef.current.disconnect(); } catch (e) {}
          recSourceRef.current = null; 
      }
      if (sourceType === 'FILE' && analyser && recGainNodeRef.current) {
          try { analyser.disconnect(recGainNodeRef.current); } catch(e) {}
      }
      if (recGainNodeRef.current) {
          try { recGainNodeRef.current.disconnect(); } catch (e) {}
      }
  }, [analyser, sourceType]);

  const stopRecording = useCallback(() => {
    if (!mediaRecorderRef.current || mediaRecorderRef.current.state === 'inactive') return;
    const doStop = () => {
        setIsFadingOut(false);
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') mediaRecorderRef.current.stop();
        cleanupAudioGraph();
        const canvas = document.querySelector('canvas');
        if (canvas && originalCanvasStateRef.current) {
            const { width, height, styleWidth, styleHeight } = originalCanvasStateRef.current;
            canvas.width = width; canvas.height = height; canvas.style.width = styleWidth; canvas.style.height = styleHeight;
            originalCanvasStateRef.current = null;
            window.dispatchEvent(new Event('resize'));
        }
    };
    if (audioContext && recGainNodeRef.current && fadeDurationRef.current > 0) {
        setIsFadingOut(true);
        recGainNodeRef.current.gain.cancelScheduledValues(audioContext.currentTime);
        recGainNodeRef.current.gain.setValueAtTime(recGainNodeRef.current.gain.value, audioContext.currentTime);
        recGainNodeRef.current.gain.linearRampToValueAtTime(0, audioContext.currentTime + fadeDurationRef.current);
        setTimeout(doStop, fadeDurationRef.current * 1000);
    } else doStop();
    if (autoStopTimerRef.current) { clearTimeout(autoStopTimerRef.current); autoStopTimerRef.current = null; }
    if (timerIntervalRef.current) { clearInterval(timerIntervalRef.current); timerIntervalRef.current = null; }
  }, [audioContext, cleanupAudioGraph]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden' && mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
          mediaRecorderRef.current.stop(); cleanupAudioGraph();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (recGainNodeRef.current) try { recGainNodeRef.current.disconnect(); } catch(e) {}
      if (recDestinationRef.current) try { recDestinationRef.current.disconnect(); } catch(e) {}
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [cleanupAudioGraph]);

  const startRecording = useCallback((config: RecorderConfig) => {
    const canvas = document.querySelector('canvas');
    if (!canvas) { showToast(toasts.canvasNotFound || 'Canvas not found.', 'error'); return; }
    if (config.resolution !== 'native') {
        const targetHeight = config.resolution;
        let targetWidth = config.aspectRatio === 'native' ? Math.round(targetHeight * (canvas.width / canvas.height)) : Math.round(targetHeight * (config.aspectRatio as number));
        originalCanvasStateRef.current = { width: canvas.width, height: canvas.height, styleWidth: canvas.style.width, styleHeight: canvas.style.height };
        canvas.width = targetWidth; canvas.height = targetHeight;
    }
    window.dispatchEvent(new Event('resize'));
    fadeDurationRef.current = config.fadeDuration;
    const audioStream = setupRecordingAudio(config.recGain, config.fadeDuration);
    if (!audioStream) { showToast(toasts.audioNotReady || 'Audio source not ready.', 'error'); if (originalCanvasStateRef.current) stopRecording(); return; }
    const combinedStream = new MediaStream([...canvas.captureStream(config.fps).getVideoTracks(), ...audioStream.getAudioTracks()]);
    let mimeType = config.mimeType;
    if (!MediaRecorder.isTypeSupported(mimeType)) {
        const supported = ['video/webm; codecs=vp9', 'video/webm; codecs=vp8', 'video/webm', 'video/mp4; codecs="avc1.42E01E, mp4a.40.2"', 'video/mp4'].filter(t => typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported(t));
        if (supported.length > 0) mimeType = supported[0];
        else { showToast(toasts.noVideoFormat || 'No supported video format.', 'error'); if (originalCanvasStateRef.current) stopRecording(); return; }
    }
    activeMimeTypeRef.current = mimeType;
    try {
      mediaRecorderRef.current = new MediaRecorder(combinedStream, { mimeType, videoBitsPerSecond: config.bitrate });
    } catch (e) { showToast(toasts.recInitFail || 'Recording failed.', 'error'); if (originalCanvasStateRef.current) stopRecording(); return; }
    recordedChunksRef.current = []; setRecordedBlob(null); setDuration(0); setSize(0);
    mediaRecorderRef.current.ondataavailable = (event) => { if (event.data.size > 0) { recordedChunksRef.current.push(event.data); setSize(prev => prev + event.data.size); } };
    mediaRecorderRef.current.onstop = () => {
      setIsRecording(false); setIsProcessing(true); showToast(toasts.processing || 'Processing...', 'info');
      setTimeout(() => { try { setRecordedBlob(new Blob(recordedChunksRef.current, { type: activeMimeTypeRef.current })); showToast(toasts.reviewReady || 'Ready!', 'success'); } catch (err) { showToast(toasts.exportFail || 'Fail.', 'error'); } finally { setIsProcessing(false); } }, 500);
    };
    mediaRecorderRef.current.start(1000); setIsRecording(true); showToast(toasts.recStart || 'Started!', 'success');
    startTimeRef.current = Date.now(); timerIntervalRef.current = window.setInterval(() => setDuration(Math.floor((Date.now() - startTimeRef.current) / 1000)), 1000);
    if (config.duration && config.duration > 0) autoStopTimerRef.current = window.setTimeout(stopRecording, config.duration);
  }, [setupRecordingAudio, showToast, stopRecording, toasts]);

  return { isRecording, isProcessing, isFadingOut, recordedBlob, duration, size, startRecording, stopRecording, discardRecording: () => { setRecordedBlob(null); setDuration(0); setSize(0); recordedChunksRef.current = []; }, getSupportedMimeTypes: () => ['video/webm; codecs=vp9', 'video/webm; codecs=vp8', 'video/webm', 'video/mp4; codecs="avc1.42E01E, mp4a.40.2"', 'video/mp4'].filter(t => typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported(t)) };
};