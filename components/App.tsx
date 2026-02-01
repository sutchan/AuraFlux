/**
 * File: components/App.tsx
 * Version: 1.8.65
 * Author: Sut
 */

import React, { useState, useEffect, Suspense, lazy } from 'react';
import { AppProvider, useUI, useVisuals, useAudioContext, useAI } from './AppContext';
import { WelcomeScreen } from './ui/WelcomeScreen';
import { OnboardingOverlay } from './ui/OnboardingOverlay';
import { UnsupportedScreen } from './ui/UnsupportedScreen';
import { HelpModal } from './ui/HelpModal';
import SongOverlay from './ui/SongOverlay';
import LyricsOverlay from './ui/LyricsOverlay';
import CustomTextOverlay from './ui/CustomTextOverlay';
import { FPSCounter } from './ui/FPSCounter';
import { useIdleTimer } from '../core/hooks/useIdleTimer';
import { useMobileGestures } from '../core/hooks/useMobileGestures';
import { APP_VERSION } from '../core/constants';

const VisualizerCanvas = lazy(() => import('./visualizers/VisualizerCanvas'));
const ThreeVisualizer = lazy(() => import('./visualizers/ThreeVisualizer'));
const Controls = lazy(() => import('./controls/Controls'));

const MainContent: React.FC = () => {
  const { hasStarted, language, setLanguage, t, manageWakeLock, showHelpModal, setShowHelpModal, helpModalInitialTab, isDragging, setIsDragging } = useUI();
  const { mode, colorTheme, settings, isThreeMode } = useVisuals();
  const { analyser, analyserR, currentSong, toggleMicrophone, selectedDeviceId, importFiles } = useAudioContext();
  const { showLyrics, lyricsStyle, performIdentification } = useAI();
  const [isExpanded, setIsExpanded] = useState(false);
  const [onboarded, setOnboarded] = useState(() => !!localStorage.getItem('av_v1_onboarded'));

  const { isIdle } = useIdleTimer(isExpanded, settings.autoHideUi);
  const gestures = useMobileGestures();

  useEffect(() => {
    if (settings.wakeLock) manageWakeLock(true);
    return () => { manageWakeLock(false); };
  }, [settings.wakeLock, manageWakeLock]);

  useEffect(() => {
    const root = document.documentElement;
    if (settings.appTheme === 'light') {
        root.classList.remove('dark');
        document.querySelector('meta[name="theme-color"]')?.setAttribute('content', '#ffffff');
    } else {
        root.classList.add('dark');
        document.querySelector('meta[name="theme-color"]')?.setAttribute('content', '#000000');
    }
  }, [settings.appTheme]);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.types.includes('Files')) setIsDragging(true);
  };
  
  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };
  
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      // @fix: Use e.dataTransfer.files directly and cast the items to File to resolve TypeScript inference issues and invalid e.target.files access.
      const audioFiles = Array.from(e.dataTransfer.files).filter((file: File) => file.type.startsWith('audio/'));
      if (audioFiles.length > 0) importFiles(audioFiles);
    }
  };

  if (!hasStarted) return <WelcomeScreen />;
  if (!onboarded) return <OnboardingOverlay language={language} setLanguage={setLanguage} onComplete={() => { setOnboarded(true); localStorage.setItem('av_v1_onboarded', 'true'); }} />;

  return (
    <div 
      className={`relative w-full h-full bg-white dark:bg-black select-none overflow-hidden transition-all duration-700 ${isExpanded ? 'p-2' : 'p-0'} ${isDragging ? 'ring-4 ring-blue-500 ring-inset' : ''}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      {...gestures}
    >
      {/* Background Layer */}
      {settings.showAiBg && settings.aiBgUrl && (
          <div className="absolute inset-0 z-0 transition-opacity duration-1000" style={{ opacity: settings.aiBgOpacity }}>
              <img src={settings.aiBgUrl} className="w-full h-full object-cover" style={{ filter: `blur(${settings.aiBgBlur}px)` }} alt="" />
          </div>
      )}

      {/* Main Visualizer Engine - Removed rounded corners for full rectangular view */}
      <div className={`w-full h-full relative z-[1] transition-transform duration-1000 ease-out overflow-hidden ${isExpanded ? 'scale-[0.98]' : 'scale-100'}`}>
        <Suspense fallback={null}>
          {isThreeMode ? (
            <ThreeVisualizer analyser={analyser} analyserR={analyserR} colors={colorTheme} settings={settings} mode={mode} />
          ) : (
            <VisualizerCanvas analyser={analyser} analyserR={analyserR} mode={mode} colors={colorTheme} settings={settings} />
          )}
        </Suspense>
      </div>

      {/* Interface Layers */}
      <div className={`transition-opacity duration-700 ${isIdle && !isExpanded ? 'opacity-0 cursor-none' : 'opacity-100'}`}>
        <SongOverlay 
          song={currentSong} isVisible={settings.showSongInfo} language={language} 
          onRetry={() => { if (performIdentification && (analyser?.context as any)?.stream) performIdentification((analyser?.context as any).stream); }} 
          onClose={() => {}} analyser={analyser} sensitivity={settings.sensitivity}
          showAlbumArt={settings.showAlbumArtOverlay} isIdle={isIdle}
        />
        <CustomTextOverlay settings={settings} analyser={analyser} song={currentSong} />
        <LyricsOverlay settings={settings} song={currentSong} showLyrics={showLyrics} lyricsStyle={lyricsStyle} analyser={analyser} />
        <Suspense fallback={null}>
          <Controls isExpanded={isExpanded} setIsExpanded={setIsExpanded} isIdle={isIdle} />
        </Suspense>
        {settings.showFps && <FPSCounter />}
      </div>
      
      {showHelpModal && <HelpModal onClose={() => setShowHelpModal(false)} initialTab={helpModalInitialTab} />}

      <div className="fixed bottom-4 right-4 z-[5] pointer-events-none opacity-40 text-xs font-mono uppercase tracking-widest text-black dark:text-white">
        Aura Flux v{APP_VERSION}
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const [isSupported, setIsSupported] = useState(true);
  useEffect(() => { if (!window.AudioContext && !(window as any).webkitAudioContext) setIsSupported(false); }, []);
  if (!isSupported) return <UnsupportedScreen />;
  return <AppProvider><MainContent /></AppProvider>;
};

export { App, AppProvider };