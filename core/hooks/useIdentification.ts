/**
 * File: core/hooks/useIdentification.ts
 * Version: 1.8.23
 * Author: Sut
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { SongInfo, Language, Region, AIProvider } from '../types';
import { identifySongFromAudio } from '../services/aiService';

interface UseIdentificationProps {
  language: Language;
  region: Region;
  provider: AIProvider;
  isEnabled: boolean;
  apiKey?: string;
  onSongUpdate?: (song: SongInfo | null) => void;
}

export const useIdentification = ({ language, region, provider, isEnabled, apiKey, onSongUpdate }: UseIdentificationProps) => {
  const [isIdentifying, setIsIdentifying] = useState(false);
  const [currentSong, setCurrentSong] = useState<SongInfo | null>(null);
  
  const isMounted = useRef(true);
  const latestRequestId = useRef(0);
  const recorderRef = useRef<MediaRecorder | null>(null);

  useEffect(() => {
    isMounted.current = true;
    return () => { 
      isMounted.current = false; 
      if (recorderRef.current && recorderRef.current.state === 'recording') {
        recorderRef.current.stop();
      }
    };
  }, []);

  const getSupportedMimeType = useCallback(() => {
    const types = [
      'audio/webm;codecs=opus',
      'audio/webm',
      'audio/ogg;codecs=opus',
      'audio/mp4',
      'audio/aac'
    ];
    for (const type of types) {
      if (typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported(type)) {
        return type;
      }
    }
    console.warn("[AI] No supported MediaRecorder MIME type found.");
    return '';
  }, []);

  const performIdentification = useCallback(async (stream: MediaStream) => {
    if (!isEnabled || isIdentifying) return;
    
    const requestId = ++latestRequestId.current;
    const mimeType = getSupportedMimeType();
    
    if (!mimeType) return;

    setIsIdentifying(true);
    
    if (currentSong?.identified === false) {
        setCurrentSong(null);
        if (onSongUpdate) onSongUpdate(null);
    }
    
    try {
      const recorder = new MediaRecorder(stream, { mimeType });
      recorderRef.current = recorder;
      const chunks: Blob[] = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };

      recorder.onstop = async () => {
        if (!isMounted.current || requestId !== latestRequestId.current) return;
        const blob = new Blob(chunks, { type: mimeType });
        const reader = new FileReader();
        reader.onloadend = async () => {
          if (!isMounted.current || requestId !== latestRequestId.current) return;
          const base64Audio = (reader.result as string).split(',')[1];
          try {
            const result = await identifySongFromAudio(base64Audio, mimeType, language, region, provider, apiKey);
            if (isMounted.current && requestId === latestRequestId.current) {
              setCurrentSong(result);
              if (onSongUpdate) onSongUpdate(result);
            }
          } catch (error) {
            console.error("[AI] Identification request failed:", error);
          } finally {
            if (isMounted.current && requestId === latestRequestId.current) {
              setIsIdentifying(false);
            }
          }
        };
        reader.readAsDataURL(blob);
      };

      recorder.start();
      setTimeout(() => {
        if (recorderRef.current && recorderRef.current.state === 'recording') {
          recorderRef.current.stop();
        }
      }, 4000);
    } catch (e) {
      console.error("[AI] Recorder initialization failed:", e);
      setIsIdentifying(false);
    }
  }, [isEnabled, isIdentifying, language, region, provider, apiKey, onSongUpdate, getSupportedMimeType, currentSong]);

  return { isIdentifying, currentSong, setCurrentSong, performIdentification };
};