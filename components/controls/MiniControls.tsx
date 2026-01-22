/**
 * File: components/controls/MiniControls.tsx
 * Version: 1.1.0
 * Author: Aura Vision Team
 * Copyright (c) 2024 Aura Vision. All rights reserved.
 * Updated: 2025-02-24 14:00
 */

import React from 'react';
import { useVisuals, useAudioContext, useAI, useUI } from '../AppContext';
import { TooltipArea } from '../ui/controls/Tooltip';

interface MiniControlsProps {
  isExpanded: boolean;
  isIdle: boolean;
  setIsExpanded: (expanded: boolean) => void;
  toggleFullscreen: () => void;
}

export const MiniControls: React.FC<MiniControlsProps> = ({ isExpanded, isIdle, setIsExpanded, toggleFullscreen }) => {
  const { isListening, toggleMicrophone, selectedDeviceId } = useAudioContext();
  const { randomizeSettings } = useVisuals();
  const { t } = useUI();
  const { isIdentifying } = useAI();

  if (isExpanded) return null;

  return (
    <>
      {isIdentifying && (
        // UI FIX: Repositioned to avoid overlapping SongOverlay (Top-Left)
        // Mobile: Bottom Center (above controls)
        // Desktop: Top Right
        <div className="fixed bottom-32 left-1/2 -translate-x-1/2 md:bottom-auto md:top-8 md:left-auto md:right-8 md:translate-x-0 z-[110] bg-black/60 backdrop-blur-2xl border border-blue-500/30 rounded-full px-5 py-2.5 md:px-6 md:py-3.5 flex items-center gap-3 md:gap-4 animate-pulse shadow-lg shadow-blue-900/20 w-max max-w-[90vw]">
          <div className="w-2 h-2 md:w-2.5 md:h-2.5 bg-blue-400 rounded-full animate-ping" />
          <span className="text-[10px] md:text-xs font-bold uppercase tracking-[0.2em] text-blue-100 truncate">{t?.identifying || "AI ANALYZING..."}</span>
        </div>
      )}
      {/* Mobile: bottom-10 to clear home indicator. Desktop: bottom-8 */}
      <div className="fixed bottom-10 md:bottom-8 left-0 w-full z-[110] flex justify-center pointer-events-none px-4 pb-safe">
        <div className={`flex items-center border border-white/10 rounded-full p-1.5 pr-5 md:p-2 md:pr-6 transition-all duration-700 pointer-events-auto ${isIdle ? 'bg-black/20 backdrop-blur-none opacity-[0.12] translate-y-2 scale-95 shadow-none' : 'bg-black/80 backdrop-blur-3xl opacity-100 translate-y-0 scale-100 shadow-2xl shadow-black/80'}`}>
          <TooltipArea text={`${isListening ? t?.stopMic : t?.startMic} [Space]`}>
            <button
              onClick={() => toggleMicrophone(selectedDeviceId)}
              aria-label={isListening ? t?.stopMic : t?.startMic}
              className={`w-12 h-12 md:w-12 md:h-12 rounded-full flex items-center justify-center transition-all duration-500 ${isListening ? 'bg-indigo-600/90 text-white shadow-lg shadow-indigo-600/40 scale-105' : 'bg-white/10 text-white/40 hover:text-white'}`}>
              {isListening ? <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor"><path fillRule="evenodd" d="M6 7.5A1.5 1.5 0 017.5 6h9A1.5 1.5 0 0118 7.5v9a1.5 1.5 0 01-1.5 1.5h-9A1.5 1.5 0 016 16.5v-9z" clipRule="evenodd" /></svg> : <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>}
            </button>
          </TooltipArea>
          <div className="h-6 w-px bg-white/10 mx-3" />
          <TooltipArea text={`${t?.randomize || "Randomize"} [R]`}>
            <button onClick={randomizeSettings} aria-label={t?.randomize} className="p-2 text-white/40 hover:text-white transition-colors active:scale-90"><svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 md:h-5 md:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg></button>
          </TooltipArea>
          <div className="w-2 md:w-0" /> {/* Spacer for mobile touch targets */}
          <TooltipArea text={`${t?.hints?.fullscreen || "Fullscreen"} [F]`}>
            <button onClick={toggleFullscreen} aria-label={t?.hints?.fullscreen} className="p-2 text-white/40 hover:text-white transition-colors active:scale-90"><svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 md:h-5 md:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M20 8V4m0 0h-4M4 16v4m0 0h4M20 16v4m0 0h-4" /></svg></button>
          </TooltipArea>
          <TooltipArea text={`${t?.showOptions || "Expand"} [H]`}>
            <button onClick={() => setIsExpanded(true)} aria-label={t?.showOptions} className="text-xs md:text-sm font-bold uppercase tracking-[0.2em] text-white/60 hover:text-white transition-colors flex items-center gap-2 pl-4 active:opacity-70">
                <span>{t?.showOptions || "OPTIONS"}</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 15l7-7 7 7" /></svg>
            </button>
          </TooltipArea>
        </div>
      </div>
    </>
  );
};