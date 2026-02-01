/**
 * File: components/ui/WelcomeScreen.tsx
 * Version: 2.0.2
 * Author: Sut
 * Updated: 2025-07-16 16:30
 */

import React from 'react';
import { useUI, useAudioContext } from '../AppContext';

export const WelcomeScreen: React.FC = () => {
  const { t, setHasStarted } = useUI();
  const { toggleMicrophone, selectedDeviceId } = useAudioContext();

  return (
    <div className="fixed inset-0 z-[100] bg-black flex items-center justify-center p-6 text-center overflow-hidden">
      {/* 动态背景光晕 */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/20 blur-[120px] rounded-full animate-pulse" />
      
      <div className="max-w-md w-full space-y-12 relative z-10 animate-fade-in-up">
        <div className="space-y-4">
          <h1 className="text-6xl md:text-8xl font-black tracking-tighter">
            <span className="bg-clip-text text-transparent bg-gradient-to-br from-white via-blue-400 to-purple-600">
              AURA
            </span>
            <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-tr from-purple-500 to-pink-500">
              FLUX
            </span>
          </h1>
          <p className="text-white/40 text-sm font-medium uppercase tracking-[0.3em]">
            {t?.welcomeText || "The Sound of Light"}
          </p>
        </div>

        <div className="flex flex-col gap-4">
          <button 
            onClick={() => { setHasStarted(true); toggleMicrophone(selectedDeviceId); }} 
            className="group relative px-8 py-4 bg-white text-black font-black rounded-2xl transition-all hover:scale-105 active:scale-95 overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-black/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
            <span className="relative z-10 uppercase tracking-widest">{t?.startExperience || "开启视听旅程"}</span>
          </button>
          
          <button 
            onClick={() => { setHasStarted(true); }} 
            className="px-8 py-4 bg-white/5 text-white/60 font-bold rounded-2xl hover:bg-white/10 hover:text-white transition-all text-xs border border-white/10 uppercase tracking-widest"
          >
            {t?.errors?.tryDemo || "试用演示模式"}
          </button>
        </div>
        
        <div className="pt-8 border-t border-white/5">
            <p className="text-[10px] text-white/20 font-mono uppercase tracking-widest">
                {t?.welcomeScreen?.micPermission || "Requires Microphone Access for Real-time Visualization"}
            </p>
        </div>
      </div>
    </div>
  );
};