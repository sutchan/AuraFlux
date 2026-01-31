
/**
 * File: components/ui/WelcomeScreen.tsx
 * Version: 1.1.1
 * Author: Aura Vision Team
 * Copyright (c) 2024 Aura Vision. All rights reserved.
 * Updated: 2025-03-18 14:00
 */

import React from 'react';
import { useUI, useAudioContext } from '../AppContext';

export const WelcomeScreen: React.FC = () => {
  const { t, setHasStarted } = useUI();
  const { errorMessage, setErrorMessage, startMicrophone, startDemoMode, selectedDeviceId } = useAudioContext();

  // Safe fallback for t to prevent crashes if translations aren't loaded
  const safeT = t || {};

  // Logic to split title into Brand and Slogan if separated by "|"
  const titleRaw = safeT.welcomeTitle || "Aura Flux";
  // Robust splitting: Handle spacing around pipe
  const parts = titleRaw.includes('|') ? titleRaw.split('|') : [titleRaw];
  const titleMain = parts[0].trim();
  const titleSub = parts.length > 1 ? parts.slice(1).join('|').trim() : null;

  return (
    <div className="fixed inset-0 z-[100] bg-black flex items-center justify-center p-6 text-center select-none overflow-hidden">
      {/* 
         Fix: Animation moved to inner container. 
         The outer container acts as a solid black cover to hide the app behind it.
      */}
      <div className="max-w-md w-full space-y-8 animate-fade-in-up relative z-10">
        <div className="flex flex-col items-center gap-2">
          <h1 className="text-5xl md:text-7xl font-black leading-tight pb-2 tracking-tight">
            {/* 
               Gradient Text Fix: 
               1. Use inline-block to ensure transform/clip works correctly.
               2. Add explicit text-transparent and background-clip utilities.
               3. Fallback text color is handled by the gradient if clipping fails in some browsers, 
                  but text-transparent is essential for the effect.
            */}
            <span className="inline-block bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 pb-1">
              {titleMain}
            </span>
          </h1>
          {titleSub && (
            <span className="text-xl md:text-3xl font-bold text-white/90 tracking-[0.15em] uppercase block">
              {titleSub}
            </span>
          )}
        </div>
        
        <div className="px-4">
            <p className="text-gray-400 text-sm leading-relaxed">
                {safeT.welcomeText || "Translate audio into generative art."}
            </p>
        </div>

        <div className="flex flex-col gap-3 pt-4">
          <button 
            onClick={() => { setHasStarted(true); startMicrophone(selectedDeviceId); }} 
            className="px-8 py-4 bg-white text-black font-bold rounded-2xl hover:scale-105 transition-all shadow-lg shadow-white/10"
          >
            {safeT.startExperience || "Start"}
          </button>
          <button 
            onClick={() => { setHasStarted(true); startDemoMode(); }} 
            className="px-8 py-3 bg-white/10 text-white font-bold rounded-2xl hover:bg-white/20 transition-all text-sm border border-white/10"
          >
            {safeT.errors?.tryDemo || "Try Demo Mode"}
          </button>
        </div>
        
        {errorMessage && (
          <div className="p-3 bg-red-500/20 text-red-200 text-xs rounded-lg border border-red-500/30 leading-relaxed flex items-center justify-between mt-4">
             <span>{errorMessage}</span>
             <button onClick={() => setErrorMessage(null)} className="ml-2 hover:text-white p-1">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
             </button>
          </div>
        )}
      </div>
    </div>
  );
};
