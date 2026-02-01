/**
 * File: core/hooks/usePlaylist.ts
 * Version: 1.8.23
 * Author: Sut
 */

import { useState, useCallback, useEffect } from 'react';
import { Track, PlaybackMode, SongInfo } from '../types';
// @fix: Import `removeTrackFromDB` to handle playlist item deletion from IndexedDB.
import { loadPlaylistFromDB, saveTrackToDB, clearPlaylistDB, removeTrackFromDB } from '../services/playlistService';
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

  // @fix: Implement `removeFromPlaylist` to correctly manage playlist state and persistence.
  const removeFromPlaylist = useCallback(async (index: number) => {
    const trackToRemove = playlist[index];
    if (trackToRemove) {
      await removeTrackFromDB(trackToRemove.id);
    }
    setPlaylist(p => {
      const newPlaylist = p.filter((_, i) => i !== index);
      if (index === currentIndex) {
        if (newPlaylist.length === 0) {
          setCurrentIndex(-1);
          setCurrentSong(null);
        } else if (index >= newPlaylist.length) {
          setCurrentIndex(newPlaylist.length - 1);
          setCurrentSong(newPlaylist[newPlaylist.length - 1]);
        } else {
          setCurrentSong(newPlaylist[index]);
        }
      } else if (index < currentIndex) {
        setCurrentIndex(ci => ci - 1);
      }
      return newPlaylist;
    });
  }, [playlist, currentIndex, setCurrentSong]);

  return {
    playlist, setPlaylist,
    currentIndex, setCurrentIndex,
    playbackMode, setPlaybackMode,
    importFiles, getNextIndex, 
    getPrevIndex: () => playlist.length === 0 ? -1 : (currentIndex - 1 + playlist.length) % playlist.length,
    clearPlaylist: () => { clearPlaylistDB(); setPlaylist([]); setCurrentIndex(-1); setCurrentSong(null); },
    removeFromPlaylist
  };
};