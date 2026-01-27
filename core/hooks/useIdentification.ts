/**
 * File: core/hooks/useIdentification.ts
 * Version: 1.7.33
 * Author: Aura Vision Team
 * Copyright (c) 2024 Aura Vision. All rights reserved.
 * Updated: 2025-03-05 12:00
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { SongInfo, Language, Region, AIProvider } from '../types';
import { identifySongFromAudio } from '../services/aiService';

interface UseIdentificationProps {
  language: Language;
  region: Region;
  provider: AIProvider;
  showLyrics: boolean;
  apiKey?: string; // Optional custom key
  onSongUpdate?: (song: SongInfo | null) => void;
}

export const useIdentification = ({ language, region, provider, showLyrics, apiKey, onSongUpdate }: UseIdentificationProps) => {
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
      'audio/mp4', // Fallback for iOS Safari
      'audio/aac'  // Another common fallback
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
    // Note: Removed check for !stream.active because AudioContext streams are always "active" even if paused.
    // If user forces retry, we ignore isIdentifying state (handled via requestId race condition).
    if (!showLyrics) return;
    
    const requestId = ++latestRequestId.current;
    const mimeType = getSupportedMimeType();
    
    if (!mimeType) {
      console.error("[AI] No supported audio format.");
      return;
    }

    setIsIdentifying(true);
    
    // Clear previous song if manual retry
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
        if (!isMounted.current || requestId !== latestRequestId.current || chunks.length === 0) {
          setIsIdentifying(false);
          return;
        }

        try {
          const blob = new Blob(chunks, { type: mimeType });
          const reader = new FileReader();
          
          reader.onloadend = async () => {
            if (!isMounted.current || requestId !== latestRequestId.current) return;
            
            const resultStr = reader.result as string;
            const base64Data = resultStr.includes(',') ? resultStr.split(',')[1] : '';
            if (!base64Data) {
               setIsIdentifying(false);
               return;
            }

            const info = await identifySongFromAudio(base64Data, mimeType, language, region, provider, apiKey);
            
            if (isMounted.current && requestId === latestRequestId.current) {
              if (info) {
                // Always update song info, even if identified=false, to show "AI Analysis" results
                setCurrentSong(info);
                if (onSongUpdate) onSongUpdate(info);
              }
              setIsIdentifying(false);
            }
          };
          reader.readAsDataURL(blob);
        } catch (e) {
          console.error("[AI] Processing Error:", e);
          setIsIdentifying(false);
        }
      };

      recorder.start();
      
      // Record 6 seconds for better lyrics capture
      setTimeout(() => {
        if (recorderRef.current && recorderRef.current.state === 'recording') {
          recorderRef.current.stop();
        }
      }, 6000); 

    } catch (e) {
      console.error("[AI] Recording Error:", e);
      setIsIdentifying(false);
    }
  }, [showLyrics, language, region, provider, apiKey, getSupportedMimeType, onSongUpdate, currentSong?.identified]);

  return { isIdentifying, currentSong, setCurrentSong, performIdentification };
};