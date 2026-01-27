/**
 * File: core/hooks/useVideoRecorder.ts
 * Version: 2.0.0
 * Author: Aura Vision Team
 * Copyright (c) 2024 Aura Vision. All rights reserved.
 * Updated: 2025-03-05 16:30
 */

import { useState, useRef, useCallback, useEffect } from 'react';
import { AudioSourceType } from '../types';

interface UseVideoRecorderProps {
    audioContext: AudioContext | null;
    analyser: AnalyserNode | null;
    mediaStream: MediaStream | null;
    showToast: (message: string, type?: 'success' | 'info' | 'error') => void;
    sourceType: AudioSourceType;
}

export const useVideoRecorder = ({ audioContext, analyser, mediaStream, showToast, sourceType }: UseVideoRecorderProps) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const activeMimeTypeRef = useRef<string>('');
  const destinationRef = useRef<MediaStreamAudioDestinationNode | null>(null);

  const getAudioStream = useCallback(() => {
    // 1. Microphone Mode: Use the active media stream directly
    if (sourceType === 'MICROPHONE' && mediaStream && mediaStream.active) {
        return mediaStream;
    }
    
    // 2. File / Internal Mode: Synthesize stream from AudioContext
    // This connects the analyser (which receives all audio) to a MediaStreamDestination
    if (audioContext && analyser && audioContext.state === 'running') {
        // Reuse destination if exists to prevent graph fan-out issues
        if (!destinationRef.current) {
            destinationRef.current = audioContext.createMediaStreamDestination();
            analyser.connect(destinationRef.current);
        }
        return destinationRef.current.stream;
    }
    
    return null;
  }, [audioContext, analyser, mediaStream, sourceType]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
  }, []);

  const handleVisibilityChange = useCallback(() => {
    if (document.visibilityState === 'hidden') {
      stopRecording();
    }
  }, [stopRecording]);

  useEffect(() => {
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      stopRecording();
      // Cleanup destination node on unmount
      if (destinationRef.current) {
          destinationRef.current.disconnect();
          destinationRef.current = null;
      }
    };
  }, [handleVisibilityChange, stopRecording]);

  const getSupportedMimeType = () => {
    const types = [
      'video/webm; codecs=vp9',
      'video/webm; codecs=vp8',
      'video/webm',
      'video/mp4' // Safari / iOS support
    ];
    for (const type of types) {
      if (typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported(type)) {
        return type;
      }
    }
    return '';
  };

  const startRecording = useCallback(() => {
    const canvas = document.querySelector('canvas');
    if (!canvas) {
      showToast('Canvas not found.', 'error');
      return;
    }

    const audioStream = getAudioStream();
    if (!audioStream) {
      showToast('Active audio source not found. Start audio first.', 'error');
      return;
    }

    // Capture canvas at 30fps for performance balance
    const canvasStream = canvas.captureStream(30);
    const combinedStream = new MediaStream([
      ...canvasStream.getVideoTracks(),
      ...audioStream.getAudioTracks()
    ]);

    const mimeType = getSupportedMimeType();
    if (!mimeType) {
      showToast('No supported video mime type found.', 'error');
      return;
    }
    
    activeMimeTypeRef.current = mimeType;

    try {
      mediaRecorderRef.current = new MediaRecorder(combinedStream, { 
          mimeType,
          videoBitsPerSecond: 8000000 // 8 Mbps for high quality
      });
    } catch (e) {
      console.error('MediaRecorder error:', e);
      showToast('Recording initialization failed.', 'error');
      return;
    }
    
    recordedChunksRef.current = [];
    mediaRecorderRef.current.ondataavailable = (event) => {
      if (event.data.size > 0) {
        recordedChunksRef.current.push(event.data);
      }
    };

    mediaRecorderRef.current.onstop = () => {
      setIsRecording(false);
      setIsProcessing(true);
      showToast('Processing video...', 'info');

      // Add a small delay to ensure UI updates before heavy blob processing
      setTimeout(() => {
        try {
            const blob = new Blob(recordedChunksRef.current, { type: activeMimeTypeRef.current });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            
            // Determine extension based on MIME type
            let ext = 'webm';
            if (activeMimeTypeRef.current.includes('mp4')) ext = 'mp4';
            
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            a.download = `AuraFlux_Clip_${timestamp}.${ext}`;
            
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
            
            showToast('Download started!', 'success');
        } catch (err) {
            console.error("Export failed:", err);
            showToast('Export failed.', 'error');
        } finally {
            setIsProcessing(false);
        }
      }, 500);
    };

    mediaRecorderRef.current.start();
    setIsRecording(true);
    showToast('Recording started!', 'success');

  }, [getAudioStream, showToast]);

  return { isRecording, isProcessing, startRecording, stopRecording };
};
