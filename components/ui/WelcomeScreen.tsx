
/**
 * File: components/ui/WelcomeScreen.tsx
 * Version: 1.0.7
 * Author: Aura Vision Team
 * Copyright (c) 2024 Aura Vision. All rights reserved.
 */

import React from 'react';
import { useUI, useAudioContext } from '../AppContext';

export const WelcomeScreen: React.FC = () => {
  const { t, setHasStarted } = useUI();
  const { errorMessage, setErrorMessage, startMicrophone, startDemoMode, selectedDeviceId } = useAudioContext();

  // Logic to split title into Brand and Slogan if separated by "|"
  const titleRaw = t?.welcomeTitle || "Aura Flux";
  const [titleMain, titleSub] = titleRaw.includes('|')
    ? titleRaw.split('|').map((s: string) => s.trim())
    : [titleRaw, null];

  return (
    <div className="min-h-[100dvh] bg-black flex items-center justify-center p-6 text-center">
      <div className="max-w-md space-y-8 animate-fade-in-up">
        <div className="flex flex-col items-center gap-1">
          <h1 className="text-5xl md:text-7xl font-black bg-clip-text bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 text-transparent leading-tight pb-2 tracking-tight">
            {titleMain}
          </h1>
          {titleSub && (
            <span className="text-xl md:text-3xl font-bold text-white/90 tracking-[0.15em] uppercase">
              {titleSub}
            </span>
          )}
        </div>
        <p className="text-gray-400 text-sm">{t?.welcomeText || "Translate audio into generative art."}</p>
        <div className="flex flex-col gap-3">
          <button onClick={() => { setHasStarted(true); startMicrophone(selectedDeviceId); }} className="px-8 py-4 bg-white text-black font-bold rounded-2xl hover:scale-105 transition-all">{t?.startExperience || "Start"}</button>
          <button onClick={() => { setHasStarted(true); startDemoMode(); }} className="px-8 py-3 bg-white/10 text-white font-bold rounded-2xl hover:bg-white/20 transition-all text-sm border border-white/10">{t?.errors?.tryDemo || "Try Demo Mode"}</button>
        </div>
        {errorMessage && (
          <div className="p-3 bg-red-500/20 text-red-200 text-xs rounded-lg border border-red-500/30 leading-relaxed flex items-center justify-between">
             <span>{errorMessage}</span>
             <button onClick={() => setErrorMessage(null)} className="ml-2 hover:text-white"><svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
          </div>
        )}
      </div>
    </div>
  );
};
