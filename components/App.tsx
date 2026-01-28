/**
 * File: components/App.tsx
 * Version: 1.8.4
 * Author: Aura Flux Team
 * Copyright (c) 2025 Aura Flux. All rights reserved.
 * Updated: 2025-03-07 23:55
 */

import React, { useCallback, useState } from 'react';
import VisualizerCanvas from './visualizers/VisualizerCanvas';
import ThreeVisualizer from './visualizers/ThreeVisualizer';
import Controls from './controls/Controls';
import SongOverlay from './ui/SongOverlay';
import CustomTextOverlay from './ui/CustomTextOverlay';
import LyricsOverlay from './ui/LyricsOverlay';
import { OnboardingOverlay } from './ui/OnboardingOverlay'; 
import { FPSCounter } from './ui/FPSCounter';
import { WelcomeScreen } from './ui/WelcomeScreen';
import { UnsupportedScreen } from './ui/UnsupportedScreen';
import { AppProvider, useVisuals, useUI, useAudioContext, useAI } from './AppContext';
import { APP_VERSION } from '../core/constants';
import { useMobileGestures } from '../core/hooks/useMobileGestures';


const AppContent: React.FC = () => {
  const { settings, isThreeMode, mode, colorTheme } = useVisuals();
  const { errorMessage, setErrorMessage, analyser, mediaStream, startDemoMode, currentSong, setCurrentSong, importFiles } = useAudioContext();
  const { hasStarted, isUnsupported, showOnboarding, language, setLanguage, handleOnboardingComplete, t, toggleFullscreen } = useUI();
  const { showLyrics, lyricsStyle, performIdentification } = useAI();
  const [isDragOver, setIsDragOver] = useState(false);
  
  // Mobile Gestures
  const gestureHandlers = useMobileGestures();

  const handleDoubleClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.tagName === 'BUTTON' || target.tagName === 'INPUT' || target.closest('button')) return;
    
    if (settings.doubleClickFullscreen) {
      toggleFullscreen();
    }
  };

  const onDragOver = useCallback((e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(true);
  }, []);

  const onDragLeave = useCallback(() => setIsDragOver(false), []);

  const onDrop = useCallback((e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      
      const files = Array.from(e.dataTransfer.files).filter((file: File) => file.type.startsWith('audio/'));
      if (files.length > 0) {
          importFiles(files);
      }
  }, [importFiles]);

  if (showOnboarding) {
    return <OnboardingOverlay language={language} setLanguage={setLanguage} onComplete={handleOnboardingComplete} />;
  }

  if (!hasStarted) {
    if (isUnsupported) {
        return <UnsupportedScreen />;
    }
    return <WelcomeScreen />;
  }

  return (
    <div 
      className="h-[100dvh] bg-black overflow-hidden relative touch-none" 
      onDoubleClick={handleDoubleClick}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      {...gestureHandlers}
    >
      {settings.showFps && <FPSCounter />}

      {/* Drag Overlay */}
      {isDragOver && (
          <div className="absolute inset-0 z-[200] bg-blue-600/30 backdrop-blur-sm border-4 border-blue-400 border-dashed m-4 rounded-3xl flex items-center justify-center animate-pulse pointer-events-none">
              <span className="text-3xl font-black text-white uppercase tracking-widest drop-shadow-lg">
                  Drop Audio Files
              </span>
          </div>
      )}

      {/* Background Layer */}
      <div className={`absolute inset-0 z-0 ${settings.hideCursor ? 'cursor-none' : ''}`} style={settings.mirrorDisplay ? { transform: 'scaleX(-1)' } : undefined}>
        {isThreeMode ? (
          <ThreeVisualizer analyser={analyser} mode={mode} colors={colorTheme} settings={settings} />
        ) : (
          <VisualizerCanvas analyser={analyser} mode={mode} colors={colorTheme} settings={settings} />
        )}
      </div>

      {/* Overlays */}
      <div className="absolute inset-0 z-10 pointer-events-none">
          <CustomTextOverlay settings={settings} analyser={analyser} song={currentSong} />
          <LyricsOverlay settings={settings} song={currentSong} showLyrics={showLyrics} lyricsStyle={lyricsStyle} analyser={analyser} />
      </div>

      {/* UI Layer */}
      <div className="absolute inset-0 z-20 pointer-events-none">
          <div className="pointer-events-auto cursor-default h-full w-full relative">
            {errorMessage && (
              <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[150] bg-red-900/90 text-white px-6 py-4 rounded-xl border border-red-500/50 animate-fade-in-up flex flex-col sm:flex-row items-center gap-4 shadow-2xl max-w-[90vw]">
                  <div className="flex-1 text-xs font-medium">{errorMessage}</div>
                  <div className="flex items-center gap-3">
                    <button onClick={startDemoMode} className="whitespace-nowrap px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-xs font-bold transition-colors">{t?.errors?.tryDemo || "Demo Mode"}</button>
                    <button onClick={() => setErrorMessage(null)} className="p-2 hover:bg-white/10 rounded-full"><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
                  </div>
              </div>
            )}
            
            <SongOverlay song={currentSong} showLyrics={showLyrics} language={language} onRetry={() => mediaStream && performIdentification(mediaStream)} onClose={() => setCurrentSong(null)} analyser={analyser} sensitivity={settings.sensitivity} />
            <Controls />
          </div>
      </div>

      <div className="fixed bottom-4 right-4 z-50 pointer-events-none text-white/20 text-[10px] font-mono uppercase tracking-widest">
        AURA FLUX v{APP_VERSION}
      </div>
    </div>
  );
};

const App: React.FC = () => (
  <AppProvider>
    <AppContent />
  </AppProvider>
);

export default App;