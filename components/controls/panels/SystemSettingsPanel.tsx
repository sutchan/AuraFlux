/**
 * File: components/controls/panels/SystemSettingsPanel.tsx
 * Version: 1.8.0
 * Author: Sut
 * Copyright (c) 2024 Aura Vision. All rights reserved.
 * Updated: 2025-03-05 18:00
 * Description: Component for system-level settings with added crash simulation for testing.
 */

import React, { useState } from 'react';
import { SettingsToggle } from '../../ui/controls/SettingsToggle';
import { useVisuals, useUI } from '../../AppContext';
import { TooltipArea } from '../../ui/controls/Tooltip';
import { CustomSelect } from '../../ui/controls/CustomSelect';
import { Language } from '../../../core/types';

// This list is also present in OnboardingOverlay.tsx
const LANGUAGES: { value: Language; label: string }[] = [
  { value: 'en', label: 'English' }, { value: 'zh', label: '简体中文' }, { value: 'tw', label: '繁體中文' },
  { value: 'ja', label: '日本語' }, { value: 'es', label: 'Español' }, { value: 'ko', label: '한국어' },
  { value: 'de', label: 'Deutsch' }, { value: 'fr', label: 'Français' }, { value: 'ru', label: 'Русский' },
  { value: 'ar', label: 'العربية' }
];

export const SystemSettingsPanel: React.FC = () => {
  const { settings, setSettings } = useVisuals();
  const { t, resetSettings, language, setLanguage } = useUI();
  const [shouldCrash, setShouldCrash] = useState(false);

  const hints = t?.hints || {};
  const systemPanel = t?.systemPanel || {};
  const isAdvanced = settings.uiMode === 'advanced';

  if (shouldCrash) {
      throw new Error("Manual Crash Simulation triggered by user.");
  }

  const handleSystemSettingChange = (key: keyof typeof settings, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleConfirmReset = () => {
    if (window.confirm(t?.hints?.confirmReset || 'Are you sure you want to reset all settings? This cannot be undone.')) {
      resetSettings();
    }
  };

  return (
    <>
      {/* Col 1: Interface Settings */}
      <div className="p-3 pt-4 h-full flex flex-col border-b lg:border-b-0 lg:border-e border-white/5">
        <div className="space-y-2.5 flex-grow overflow-y-auto custom-scrollbar pr-1.5">
          <span className="text-xs font-black uppercase text-white/50 tracking-widest block ml-1">{systemPanel.interface || "Interface"}</span>
          <SettingsToggle label={t?.showTooltips || "Show Tooltips"} value={settings.showTooltips} onChange={() => handleSystemSettingChange('showTooltips', !settings.showTooltips)} hintText={hints?.showTooltips} />
          <SettingsToggle label={t?.autoHideUi || "Auto-Hide Controls"} value={settings.autoHideUi} onChange={() => handleSystemSettingChange('autoHideUi', !settings.autoHideUi)} hintText={hints?.autoHideUi} />
          <SettingsToggle label={t?.hideCursor || "Hide Cursor"} value={settings.hideCursor} onChange={() => handleSystemSettingChange('hideCursor', !settings.hideCursor)} hintText={hints?.hideCursor} />
          <SettingsToggle label={t?.showFps || "Show FPS"} value={settings.showFps} onChange={() => handleSystemSettingChange('showFps', !settings.showFps)} hintText={hints?.showFps} />
        </div>
      </div>

      {/* Col 2: Behavior & Display */}
      <div className="p-3 pt-4 h-full flex flex-col border-b lg:border-b-0 lg:border-e border-white/5">
        <div className="space-y-2.5 flex-grow overflow-y-auto custom-scrollbar pr-1.5">
          <span className="text-xs font-black uppercase text-white/50 tracking-widest block ml-1">{systemPanel.behavior || "Behavior"}</span>
          <SettingsToggle label={t?.doubleClickFullscreen || "Double-Click Fullscreen"} value={settings.doubleClickFullscreen} onChange={() => handleSystemSettingChange('doubleClickFullscreen', !settings.doubleClickFullscreen)} hintText={hints?.doubleClickFullscreen} />
          <SettingsToggle label={t?.mirrorDisplay || "Mirror Display"} value={settings.mirrorDisplay} onChange={() => handleSystemSettingChange('mirrorDisplay', !settings.mirrorDisplay)} hintText={hints?.mirrorDisplay} />
          <SettingsToggle label={t?.wakeLock || "Screen Always On"} value={settings.wakeLock} onChange={() => handleSystemSettingChange('wakeLock', !settings.wakeLock)} hintText={hints?.wakeLock} />
          
          <div className="pt-2.5 border-t border-white/5 mt-2">
            <CustomSelect
              label={t?.language || "Interface Language"}
              value={language}
              options={LANGUAGES}
              onChange={(val: string) => setLanguage(val as Language)}
            />
          </div>
        </div>
      </div>

      {/* Col 3: Maintenance */}
      <div className="p-3 pt-4 h-full flex flex-col">
        <div className="space-y-3 flex-grow">
          <span className="text-xs font-black uppercase text-white/50 tracking-widest block ml-1">{systemPanel.maintenance || "Maintenance"}</span>
          <div className="p-3 bg-white/5 rounded-xl border border-white/5">
            <span className="text-xs font-bold text-white/40 uppercase tracking-widest leading-relaxed block">
              {t?.hints?.reset || "Reset all application settings to factory defaults."}
            </span>
          </div>
          
          {isAdvanced && (
              <div className="pt-2">
                  <button 
                    onClick={() => {
                        if (window.confirm("This will intentionally crash the app to test the error boundary. Proceed?")) {
                            setShouldCrash(true);
                        }
                    }}
                    className="w-full py-2 bg-yellow-500/10 border border-yellow-500/20 text-yellow-200/60 hover:text-yellow-200 hover:bg-yellow-500/20 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-colors"
                  >
                      {systemPanel.simulateCrash || "Simulate Crash"}
                  </button>
              </div>
          )}
        </div>
        <div className="mt-auto pt-3">
          <TooltipArea text={hints?.confirmReset}>
            <button onClick={handleConfirmReset} className="w-full py-2 bg-red-500/[0.15] rounded-lg text-xs font-bold uppercase tracking-wider text-red-400/80 hover:text-red-300 flex items-center justify-center gap-1.5 border border-red-500/20 hover:border-red-500/40 transition-all">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 opacity-60" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
              {t?.reset || "Factory Reset"}
            </button>
          </TooltipArea>
        </div>
      </div>
    </>
  );
};