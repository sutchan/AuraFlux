/**
 * File: core/hooks/usePlaylist.ts
 * Version: 1.8.23
 * Author: Sut
 */

import { useState, useCallback, useEffect } from 'react';
import { Track, PlaybackMode, SongInfo } from '../types';
import { loadPlaylistFromDB, saveTrackToDB, clearPlaylistDB } from '../services/playlistService';
import { extractMetadata } from '../services/metadataService';

export const usePlaylist = (setCurrentSong: (s: SongInfo | null) => void) => {
  const [playlist, setPlaylist] = useState<Track[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(-1);
  const [playbackMode, setPlaybackMode] = useState<PlaybackMode>('repeat-all');

  useEffect(() => {
    loadPlaylistFromDB().then(saved => {
      if (saved.length > 0) {
        setPlaylist(saved);
        setCurrentIndex(0);
        setCurrentSong(saved[0]);
      }
    });
  }, [setCurrentSong]);

  const importFiles = useCallback(async (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    const newTracks: Track[] = [];
    for (const file of fileArray) {
      const track = await extractMetadata(file);
      newTracks.push(track);
      await saveTrackToDB(track);
    }
    setPlaylist(prev => [...prev, ...newTracks]);
    return newTracks;
  }, []);

  const getNextIndex = useCallback(() => {
    if (playlist.length === 0) return -1;
    if (playbackMode === 'shuffle') {
      const next = Math.floor(Math.random() * playlist.length);
      return (next === currentIndex && playlist.length > 1) ? (next + 1) % playlist.length : next;
    }
    return (currentIndex + 1) % playlist.length;
  }, [playlist, currentIndex, playbackMode]);

  return {
    playlist, setPlaylist,
    currentIndex, setCurrentIndex,
    playbackMode, setPlaybackMode,
    importFiles, getNextIndex, 
    getPrevIndex: () => playlist.length === 0 ? -1 : (currentIndex - 1 + playlist.length) % playlist.length,
    clearPlaylist: () => { clearPlaylistDB(); setPlaylist([]); setCurrentIndex(-1); setCurrentSong(null); }
  };
};