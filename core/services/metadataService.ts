/**
 * File: core/services/metadataService.ts
 * Version: 1.8.23
 * Author: Sut
 */

import { Track } from '../types';

export const extractMetadata = (file: File): Promise<Track> => {
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
          const { title, artist, picture, USLT, lyrics } = tag.tags;
          let albumArtUrl = undefined;
          let lyricsText: string | undefined = undefined;
          if (lyrics) lyricsText = typeof lyrics === 'string' ? lyrics : lyrics.lyrics;
          if (!lyricsText && USLT) {
            const frames = Array.isArray(USLT) ? USLT : [USLT];
            for (const frame of frames) {
              if (typeof frame === 'string') lyricsText = frame;
              else if (frame.lyrics) lyricsText = frame.lyrics;
              else if (frame.data && frame.data.lyrics) lyricsText = frame.data.lyrics;
              if (lyricsText) break;
            }
          }
          if (picture) {
            try {
              const { data, format } = picture;
              let base64String = "";
              for (let i = 0; i < data.length; i++) base64String += String.fromCharCode(data[i]);
              albumArtUrl = `data:${format};base64,${window.btoa(base64String)}`;
            } catch (e) {}
          }
          resolve({ ...basicTrack, title: title || basicTrack.title, artist: artist || basicTrack.artist, albumArtUrl, lyrics: lyricsText, identified: true });
        },
        onError: () => resolve(basicTrack)
      });
    } else resolve(basicTrack);
  });
};