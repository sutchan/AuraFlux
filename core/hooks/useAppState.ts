/**
 * File: core/hooks/useAppState.ts
 * Version: 1.8.23
 * Author: Sut
 */

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useLocalStorage } from './useLocalStorage';
import { Language, Region } from '../types';
import { TRANSLATIONS } from '../i18n';

const DEFAULT_LANGUAGE: Language = 'en';
const SUPPORTED_LANGUAGES: Language[] = ['en', 'zh', 'tw', 'ja', 'es', 'ko', 'de', 'fr', 'ar', 'ru'];
const SUPPORTED_REGIONS: Region[] = ['global', 'US', 'CN', 'JP', 'KR', 'EU', 'LATAM'];

const detectBrowserLanguage = (): Language => {
  if (typeof navigator === 'undefined') return DEFAULT_LANGUAGE;
  const browserLangs = navigator.languages ? Array.from(navigator.languages) : [navigator.language];
  
  for (const lang of browserLangs) {
    const code = lang.toLowerCase();
    if (code.includes('zh-tw') || code.includes('zh-hk') || code.includes('zh-hant')) return 'tw';
    if (code.startsWith('zh')) return 'zh';
    const primary = code.split('-')[0] as Language;
    if (SUPPORTED_LANGUAGES.includes(primary)) return primary;
  }
  return DEFAULT_LANGUAGE;
};

const detectDefaultRegion = (lang: Language): Region => {
  switch (lang) {
    case 'zh': case 'tw': return 'CN';
    case 'ja': return 'JP';
    case 'ko': return 'KR';
    case 'es': return 'LATAM';
    case 'de': case 'fr': return 'EU';
    default: return 'global';
  }
};

export const useAppState = () => {
  const { getStorage, setStorage, clearStorage } = useLocalStorage();

  const [hasStarted, setHasStarted] = useState(false);
  
  const [language, setLanguage] = useState<Language>(() => {
    const saved = getStorage<Language | null>('language', null);
    return (saved && SUPPORTED_LANGUAGES.includes(saved)) ? saved : detectBrowserLanguage();
  });

  const [region, setRegion] = useState<Region>(() => {
    const saved = getStorage<Region | null>('region', null);
    return (saved && SUPPORTED_REGIONS.includes(saved)) ? saved : detectDefaultRegion(language);
  });

  useEffect(() => {
    const dir = language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.dir = dir;
    document.documentElement.lang = language;
    setStorage('language', language);
  }, [language, setStorage]);

  useEffect(() => {
    setStorage('region', region);
  }, [region, setStorage]);

  const t = useMemo(() => TRANSLATIONS[language] || TRANSLATIONS[DEFAULT_LANGUAGE], [language]);

  const wakeLockRef = useRef<any>(null);

  const manageWakeLock = useCallback(async (enabled: boolean) => {
    if (!('wakeLock' in navigator)) return;
    try {
      if (enabled && !wakeLockRef.current) {
        wakeLockRef.current = await (navigator as any).wakeLock.request('screen');
      } else if (!enabled && wakeLockRef.current) {
        await wakeLockRef.current.release();
        wakeLockRef.current = null;
      }
    } catch (err) {
      console.warn("WakeLock Error:", err);
    }
  }, []);

  const resetSettings = useCallback(() => {
    clearStorage();
    window.location.reload();
  }, [clearStorage]);

  return {
    hasStarted, setHasStarted,
    language, setLanguage,
    region, setRegion,
    t,
    manageWakeLock,
    resetSettings
  };
};