/**
 * File: core/services/playlistService.ts
 * Version: 1.0.1
 * Author: Aura Flux Team
 */

import { Track } from '../types';

const DB_NAME = 'AuraFluxDB';
const STORE_NAME = 'playlist';
const DB_VERSION = 1;

// Helper to open DB
const openDB = (): Promise<IDBDatabase> => {
    return new Promise((resolve, reject) => {
        try {
            if (typeof window === 'undefined' || !window.indexedDB) {
                reject(new Error("IndexedDB not supported"));
                return;
            }
            const request = indexedDB.open(DB_NAME, DB_VERSION);
            
            request.onupgradeneeded = (e) => {
                const db = (e.target as IDBOpenDBRequest).result;
                if (!db.objectStoreNames.contains(STORE_NAME)) {
                    // 'id' is a unique string generated in useAudio
                    db.createObjectStore(STORE_NAME, { keyPath: 'id' });
                }
            };
            
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        } catch (e) {
            // Catches synchronous SecurityError (Permission denied) in restricted iframes
            reject(e);
        }
    });
};

export const saveTrackToDB = async (track: Track) => {
    try {
        const db = await openDB();
        return new Promise<void>((resolve, reject) => {
            const tx = db.transaction(STORE_NAME, 'readwrite');
            const store = tx.objectStore(STORE_NAME);
            const req = store.put(track);
            req.onsuccess = () => resolve();
            req.onerror = () => reject(req.error);
        });
    } catch (e) {
        console.warn("[Playlist] Failed to save track (Storage access denied or quota exceeded):", e);
    }
};

export const removeTrackFromDB = async (id: string) => {
    try {
        const db = await openDB();
        return new Promise<void>((resolve, reject) => {
            const tx = db.transaction(STORE_NAME, 'readwrite');
            const store = tx.objectStore(STORE_NAME);
            const req = store.delete(id);
            req.onsuccess = () => resolve();
            req.onerror = () => reject(req.error);
        });
    } catch (e) {
        console.warn("[Playlist] Failed to remove track:", e);
    }
};

export const clearPlaylistDB = async () => {
    try {
        const db = await openDB();
        return new Promise<void>((resolve, reject) => {
            const tx = db.transaction(STORE_NAME, 'readwrite');
            const store = tx.objectStore(STORE_NAME);
            const req = store.clear();
            req.onsuccess = () => resolve();
            req.onerror = () => reject(req.error);
        });
    } catch (e) {
        console.warn("[Playlist] Failed to clear DB:", e);
    }
};

export const loadPlaylistFromDB = async (): Promise<Track[]> => {
    try {
        const db = await openDB();
        return new Promise((resolve, reject) => {
            const tx = db.transaction(STORE_NAME, 'readonly');
            const store = tx.objectStore(STORE_NAME);
            const req = store.getAll();
            req.onsuccess = () => resolve(req.result as Track[]);
            req.onerror = () => reject(req.error);
        });
    } catch (e) {
        console.warn("[Playlist] Failed to load DB (Storage access denied):", e);
        return [];
    }
};
