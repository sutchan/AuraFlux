/**
 * File: components/App.tsx
 * Version: 1.8.50
 * Author: Sut
 * Updated: 2025-03-25 00:10 - Updated version string and verified info layer stability.
 */

import React, { useState, useEffect, useRef } from 'react';
import VisualizerCanvas from './visualizers/VisualizerCanvas';
import ThreeVisualizer from './visualizers/ThreeVisualizer';
import Controls from './controls/Controls';
import SongOverlay from './ui/SongOverlay';
import CustomTextOverlay from './ui/CustomTextOverlay';
import LyricsOverlay from './ui/LyricsOverlay';
import { WelcomeScreen } from './ui/WelcomeScreen';
import { FPSCounter } from './ui/FPSCounter';
import { AppProvider, useVisuals, useUI, useAudioContext, useAI } from './AppContext';

const BackgroundLayer: React.FC = () => {
    const { settings } = useVisuals();
    const { currentSong } = useAudioContext();
    
    const showAlbumArt = settings.albumArtBackground && !!currentSong?.albumArtUrl;
    const showAiBg = settings.showAiBg && !!settings.aiBgUrl;
    
    const blurStyle = { filter: `blur(${settings.aiBgBlur}px)` };
    const opacity = settings.aiBgOpacity ?? 0.5;

    return (
        <div className="absolute inset-0 z-[-1] overflow-hidden pointer-events-none">
            {/* Base Layer */}
            <div className="absolute inset-0 bg-black" />
            
            {/* Album Art Layer */}
            <div 
                className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${showAlbumArt ? 'opacity-40' : 'opacity-0'}`}
                style={{ filter: `blur(${settings.albumArtBlur ?? 20}px)` }}
            >
                {currentSong?.albumArtUrl && <img src={currentSong.albumArtUrl} className="w-full h-full object-cover scale-110" alt="" />}
            </div>

            {/* AI Generated Layer */}
            <div 
                className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${showAiBg ? '' : 'opacity-0'}`}
                style={{ ...blurStyle, opacity: showAiBg ? opacity : 0 }}
            >
                {settings.aiBgUrl && <img src={settings.aiBgUrl} className="w-full h-full object-cover scale-105" alt="" />}
            </div>

            {/* Vignette Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black opacity-60" />
            <div className="absolute inset-0 bg-gradient-to-r from-black via-transparent to-black opacity-40" />
        </div>
    );
};

const AppContent: React.FC = () => {
  const { settings, isThreeMode, mode, colorTheme } = useVisuals();
  const { analyser, analyserR, mediaStream, currentSong, setCurrentSong, importFiles } = useAudioContext();
  const { hasStarted, language, toggleFullscreen, manageWakeLock } = useUI();
  const { showLyrics, performIdentification, lyricsStyle } = useAI();
  
  const [isControlsOpen, setIsControlsOpen] = useState(false);
  const [isIdle, setIsIdle] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const dragCounter = useRef(0);

  const appClassName = `h-[100dvh] overflow-hidden relative touch-none select-none transition-colors duration-700 ${
    settings.appTheme === 'light' ? 'bg-zinc-100 text-black' : 'bg-black text-white'
  } ${settings.hideCursor ? 'cursor-none' : 'cursor-auto'}`;

  useEffect(() => {
    let timer: number;
    const resetTimer = () => {
        setIsIdle(false);
        clearTimeout(timer);
        if (settings.autoHideUi && !isControlsOpen) {
            timer = window.setTimeout(() => setIsIdle(true), 3000);
        }
    };
    window.addEventListener('mousemove', resetTimer);
    window.addEventListener('touchstart', resetTimer);
    resetTimer();
    return () => {
      window.removeEventListener('mousemove', resetTimer);
      window.removeEventListener('touchstart', resetTimer);
    };
  }, [settings.autoHideUi, isControlsOpen]);

  useEffect(() => {
      if (hasStarted) manageWakeLock(!!settings.wakeLock);
  }, [settings.wakeLock, hasStarted, manageWakeLock]);

  const handleDrag = (e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); };
  const handleDragIn = (e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); dragCounter.current++; if (e.dataTransfer.items?.length > 0) setIsDragging(true); };
  const handleDragOut = (e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); dragCounter.current--; if (dragCounter.current === 0) setIsDragging(false); };
  const handleDrop = (e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); setIsDragging(false); dragCounter.current = 0; if (e.dataTransfer.files?.length > 0) importFiles(e.dataTransfer.files); };

  const handleDoubleClick = () => {
      if (settings.doubleClickFullscreen) toggleFullscreen();
  };

  if (!hasStarted) return <WelcomeScreen />;

  return (
    <div 
        className={appClassName} 
        onDragEnter={handleDragIn} 
        onDragLeave={handleDragOut} 
        onDragOver={handleDrag} 
        onDrop={handleDrop}
        onDoubleClick={handleDoubleClick}
    >
      <BackgroundLayer />

      {/* Visualizer Layer with Mirror Support */}
      <div 
        data-visualizer-layer="true" 
        className="absolute inset-0 z-0 transition-transform duration-500"
        style={{ transform: settings.mirrorDisplay ? 'scaleX(-1)' : 'none' }}
      >
        {isThreeMode ? (
          <ThreeVisualizer analyser={analyser} analyserR={analyserR} mode={mode} colors={colorTheme} settings={settings} />
        ) : (
          <VisualizerCanvas analyser={analyser} analyserR={analyserR} mode={mode} colors={colorTheme} settings={settings} />
        )}
      </div>

      {/* Debug Info */}
      {settings.showFps && <FPSCounter />}

      <div className="fixed bottom-4 right-4 z-[5] pointer-events-none opacity-40 text-[9px] font-mono uppercase tracking-[0.2em]">
        Aura Flux v1.8.50 | AI Art Synergy
      </div>

      {/* Info Layers */}
      <div className={`absolute inset-0 pointer-events-none transition-opacity duration-700 ${isIdle ? 'opacity-40' : 'opacity-100'}`}>
          <CustomTextOverlay settings={settings} analyser={analyser} song={currentSong} />
          <LyricsOverlay settings={settings} song={currentSong} showLyrics={showLyrics} lyricsStyle={lyricsStyle || settings.lyricsStyle} analyser={analyser} />
          <SongOverlay song={currentSong} isVisible={settings.showSongInfo && !showLyrics} language={language} onRetry={() => mediaStream && performIdentification(mediaStream)} onClose={() => setCurrentSong(null)} analyser={analyser} isIdle={isIdle} />
      </div>

      {/* Control Layer */}
      <div className={`absolute inset-0 z-[40] pointer-events-none transition-transform duration-700 ${isIdle ? 'translate-y-8 opacity-0' : 'translate-y-0 opacity-100'}`}>
          <div className="pointer-events-auto h-full w-full relative">
            <Controls isExpanded={isControlsOpen} setIsExpanded={setIsControlsOpen} isIdle={isIdle} />
          </div>
      </div>

      {/* Drag Overlay */}
      {isDragging && (
        <div className="fixed inset-0 z-[200] bg-blue-600/20 backdrop-blur-md border-4 border-dashed border-blue-500/50 m-4 rounded-3xl flex flex-col items-center justify-center pointer-events-none animate-pulse">
            <div className="bg-blue-600 text-white p-6 rounded-full shadow-2xl mb-6 scale-125"><svg className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg></div>
            <h3 className="text-3xl font-black text-white uppercase tracking-tighter drop-shadow-lg">释放以导入音频</h3>
            <p className="text-white/60 font-bold mt-2 uppercase tracking-widest text-sm">Supports MP3, WAV, FLAC</p>
        </div>
      )}
    </div>
  );
};

const App: React.FC = () => (
  <AppProvider>
    <AppContent />
  </AppProvider>
);

export default App;