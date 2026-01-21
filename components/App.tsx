/**
 * File: components/App.tsx
 * Version: 1.6.21
 * Author: Aura Flux Team
 * Copyright (c) 2024 Aura Flux. All rights reserved.
 * Updated: 2025-02-18 14:05
 */

import React from 'react';
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
  const { errorMessage, setErrorMessage, isSimulating, analyser, mediaStream, startDemoMode } = useAudioContext();
  const { hasStarted, isUnsupported, showOnboarding, language, setLanguage, handleOnboardingComplete, t, toggleFullscreen } = useUI();
  const { currentSong, showLyrics, lyricsStyle, performIdentification, setCurrentSong } = useAI();
  
  // Mobile Gestures
  const gestureHandlers = useMobileGestures();

  const handleDoubleClick = (e: React.MouseEvent) => {
    // Prevent fullscreen trigger if clicking on controls
    const target = e.target as HTMLElement;
    if (target.tagName === 'BUTTON' || target.tagName === 'INPUT' || target.closest('button')) return;
    
    if (settings.doubleClickFullscreen) {
      toggleFullscreen();
    }
  };

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
      {...gestureHandlers}
    >
      {settings.showFps && <FPSCounter />}

      {/* 画布层：背景渲染 */}
      <div className={`absolute inset-0 z-0 ${settings.hideCursor ? 'cursor-none' : ''}`} style={settings.mirrorDisplay ? { transform: 'scaleX(-1)' } : undefined}>
        {isThreeMode ? (
          <ThreeVisualizer analyser={analyser} mode={mode} colors={colorTheme} settings={settings} />
        ) : (
          <VisualizerCanvas analyser={analyser} mode={mode} colors={colorTheme} settings={settings} />
        )}
      </div>

      {/* 覆盖层：不拦截鼠标 */}
      <div className="absolute inset-0 z-10 pointer-events-none">
          <CustomTextOverlay settings={settings} analyser={analyser} />
          <LyricsOverlay settings={settings} song={currentSong} showLyrics={showLyrics} lyricsStyle={lyricsStyle} analyser={analyser} />
      </div>

      {/* 交互 UI 层：控制面板 */}
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
            {isSimulating && (
              <div className="fixed top-8 left-1/2 -translate-x-1/2 z-[140] bg-blue-600/20 backdrop-blur-md border border-blue-500/30 px-4 py-1.5 rounded-full flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse"/>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-blue-200">Demo Mode</span>
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