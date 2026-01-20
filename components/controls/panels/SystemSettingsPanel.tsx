
/**
 * File: components/controls/panels/SystemSettingsPanel.tsx
 * Version: 1.0.7
 * Author: Aura Vision Team
 * Copyright (c) 2024 Aura Vision. All rights reserved.
 */

import React, { useState } from 'react';
import { Language } from '../../../core/types';
import { APP_VERSION } from '../../../core/constants';
import { CustomSelect } from '../../ui/controls/CustomSelect';
import { SettingsToggle } from '../../ui/controls/SettingsToggle';
import { useVisuals, useUI } from '../../AppContext';

export const SystemSettingsPanel: React.FC = () => {
  const { language, setLanguage, resetSettings, t } = useUI();
  const { settings, setSettings } = useVisuals();
  
  const [confirmReset, setConfirmReset] = useState(false);
  const [shouldCrash, setShouldCrash] = useState(false); 

  // ROBUSTNESS TEST: Throw error during render to trigger ErrorBoundary
  if (shouldCrash) {
    throw new Error("System Integrity Check: Manual Crash Triggered via Settings Panel");
  }

  const hints = t?.hints || {};
  const sys = t?.systemPanel || {};
  const isAdvanced = settings.uiMode === 'advanced';
  
  const handleResetClick = () => {
    if (confirmReset) {
      resetSettings();
      setConfirmReset(false);
    } else {
      setConfirmReset(true);
      setTimeout(() => setConfirmReset(false), 4000);
    }
  };

  return (
    <>
      {/* Col 1: Interface & Display */}
      <div className="p-4 h-full flex flex-col border-b lg:border-b-0 lg:border-e border-white/5 pt-6 overflow-hidden">
         <div className="space-y-6 flex-grow overflow-y-auto custom-scrollbar pe-2">
            <CustomSelect 
              label={t?.language || "Language"} 
              value={language} 
              hintText={hints?.language} 
              options={[
                { value: 'en', label: 'English' }, { value: 'zh', label: '简体中文' }, 
                { value: 'tw', label: '繁體中文' }, { value: 'ja', label: '日本語' }, 
                { value: 'es', label: 'Español' }, { value: 'ko', label: '한국어' }, 
                { value: 'de', label: 'Deutsch' }, { value: 'fr', label: 'Français' },
                { value: 'ru', label: 'Русский' }, { value: 'ar', label: 'العربية' }
              ]} 
              onChange={(val) => setLanguage(val as Language)} 
            />
            
            {isAdvanced && (
                <div className="pt-4 border-t border-white/5 animate-fade-in-up">
                    <span className="text-xs font-bold uppercase text-white/50 tracking-[0.25em] block ms-1 mb-2">{sys?.interface || "Interface"}</span>
                    <div className="space-y-1">
                       <SettingsToggle 
                          variant="clean"
                          label={t?.showTooltips || "Show Tooltips"}
                          value={settings.showTooltips}
                          onChange={() => setSettings(p => ({...p, showTooltips: !p.showTooltips}))}
                          hintText={hints?.showTooltips}
                       />
                       <SettingsToggle 
                          variant="clean"
                          label={t?.showFps || "Show FPS"}
                          value={settings.showFps}
                          onChange={() => setSettings(p => ({...p, showFps: !p.showFps}))}
                          hintText={hints?.showFps}
                       />
                       <SettingsToggle 
                          variant="clean"
                          label={t?.mirrorDisplay || "Mirror Display"}
                          value={settings.mirrorDisplay}
                          onChange={() => setSettings(p => ({...p, mirrorDisplay: !p.mirrorDisplay}))}
                          hintText={t?.hints?.mirrorDisplay || "Flip the visual output horizontally."}
                          activeColor="green"
                       />
                    </div>
                </div>
            )}
         </div>
      </div>

      {/* Col 2: Behavior & Interaction */}
      <div className="p-4 h-full flex flex-col border-b lg:border-b-0 lg:border-e border-white/5 pt-6 overflow-hidden">
         <div className="space-y-6 flex-grow overflow-y-auto custom-scrollbar pe-2">
             <span className="text-xs font-bold uppercase text-white/50 tracking-[0.15em] block ms-1 mb-2">{sys?.behavior || "Behavior"}</span>
             <div className="space-y-1">
                {isAdvanced && (
                    <div className="space-y-1 animate-fade-in-up">
                        <SettingsToggle 
                            variant="clean"
                            label={t?.wakeLock || "Stay Awake"} 
                            value={settings.wakeLock} 
                            onChange={() => setSettings(p => ({...p, wakeLock: !p.wakeLock}))} 
                            hintText={hints?.wakeLock} 
                        />
                        <SettingsToggle 
                            variant="clean"
                            label={t?.autoHideUi || "Auto-Hide UI"} 
                            value={settings.autoHideUi} 
                            onChange={() => setSettings(p => ({...p, autoHideUi: !p.autoHideUi}))} 
                            hintText={t?.hints?.autoHideUi || "Automatically hide controls when inactive."} 
                        />
                        <SettingsToggle 
                            variant="clean"
                            label={t?.doubleClickFullscreen || "Dbl Click Fullscreen"}
                            value={settings.doubleClickFullscreen}
                            onChange={() => setSettings(p => ({...p, doubleClickFullscreen: !p.doubleClickFullscreen}))}
                            hintText={hints?.doubleClickFullscreen}
                        />
                        <SettingsToggle 
                            variant="clean"
                            label={t?.hideCursor || "Hide Cursor"} 
                            value={settings.hideCursor} 
                            onChange={() => setSettings(p => ({...p, hideCursor: !p.hideCursor}))} 
                            hintText={hints?.hideCursor} 
                        />
                    </div>
                )}
                {!isAdvanced && (
                    <div className="text-white/20 text-xs font-mono uppercase tracking-widest text-center py-4">
                        System Toggles hidden
                    </div>
                )}
             </div>
         </div>
      </div>

      {/* Col 3: Maintenance & Reset */}
      <div className="p-4 h-full flex flex-col pt-6">
        <div className="flex-grow">
            <span className="text-xs font-bold uppercase text-white/50 tracking-[0.15em] block ms-1 mb-2">{sys?.maintenance || "Maintenance"}</span>
             <div className="px-1">
                <div className="flex justify-between items-center mb-2">
                   <span className="text-xs font-bold text-white/70">Aura Flux</span>
                   <span className="text-[10px] font-mono text-white/40">v{APP_VERSION}</span>
                </div>
                <div className="space-y-2">
                  <p className="text-[10px] text-white/30 leading-relaxed">
                    {t?.appDescription || "Immersive audio visualization suite."}
                  </p>
                  <div className="pt-2 border-t border-white/5 space-y-1">
                     <div className="flex justify-between text-[9px] font-mono uppercase text-white/20"><span>{sys?.engine || 'Engine'}</span><span>Three.js r160 + React 19</span></div>
                     <div className="flex justify-between text-[9px] font-mono uppercase text-white/20"><span>{sys?.audio || 'Audio'}</span><span>Web Audio API (Real-time)</span></div>
                     <div className="flex justify-between text-[9px] font-mono uppercase text-white/20"><span>{sys?.ai || 'AI'}</span><span>Gemini 3 Flash (1.5s Latency)</span></div>
                  </div>
                </div>
             </div>
        </div>
        
        <div className="mt-auto space-y-3 pt-4 border-t border-white/5">
            <button 
              onClick={handleResetClick} 
              className={`w-full py-4 rounded-xl font-bold text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 group ${confirmReset ? 'bg-red-600 text-white border-red-400' : 'bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20'}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 opacity-70 group-hover:opacity-100" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              {confirmReset ? (t?.confirmReset || 'Are you sure?') : (t?.reset || "Reset App")}
            </button>
            
            {isAdvanced && (
                <button 
                    onClick={() => setShouldCrash(true)} 
                    className="w-full py-2 bg-transparent border border-white/5 rounded-lg text-[9px] font-mono text-white/20 uppercase tracking-widest hover:bg-white/5 hover:text-white/50 transition-colors animate-fade-in-up"
                >
                    Simulate Crash
                </button>
            )}
        </div>
      </div>
    </>
  );
};
