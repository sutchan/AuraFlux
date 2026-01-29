/**
 * File: components/controls/panels/SystemSettingsPanel.tsx
 * Version: 2.0.0
 * Author: Sut
 * Copyright (c) 2024 Aura Vision. All rights reserved.
 * Updated: 2025-03-11 10:00
 */

import React, { useState, useRef, useEffect } from 'react';
import { SettingsToggle } from '../../ui/controls/SettingsToggle';
import { useVisuals, useUI } from '../../AppContext';
import { TooltipArea } from '../../ui/controls/Tooltip';
import { CustomSelect } from '../../ui/controls/CustomSelect';
import { BentoCard } from '../../ui/layout/BentoCard';
import { Language, VisualizerSettings } from '../../../core/types';
import { useLocalStorage } from '../../../core/hooks/useLocalStorage';

const LANGUAGES: { value: Language; label: string }[] = [
  { value: 'en', label: 'English' }, { value: 'zh', label: '简体中文' }, { value: 'tw', label: '繁體中文' },
  { value: 'ja', label: '日本語' }, { value: 'es', label: 'Español' }, { value: 'ko', label: '한국어' },
  { value: 'de', label: 'Deutsch' }, { value: 'fr', label: 'Français' }, { value: 'ru', label: 'Русский' },
  { value: 'ar', label: 'العربية' }
];

interface SavedPreset {
    id: number;
    name: string;
    data: VisualizerSettings;
    timestamp: number;
}

export const SystemSettingsPanel: React.FC = () => {
  const { settings, setSettings } = useVisuals();
  const { t, resetSettings, language, setLanguage, showToast } = useUI();
  const { getStorage, setStorage } = useLocalStorage();

  const hints = t?.hints || {};
  const systemPanel = t?.systemPanel || {};
  const config = t?.config || {};

  const [presets, setPresets] = useState<SavedPreset[]>([]);
  const [presetName, setPresetName] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
      const saved = getStorage<SavedPreset[]>('user_presets', []);
      if (Array.isArray(saved)) setPresets(saved);
  }, [getStorage]);

  const updatePresets = (newPresets: SavedPreset[]) => {
      setPresets(newPresets);
      setStorage('user_presets', newPresets);
  };

  const handleSystemSettingChange = (key: keyof typeof settings, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleConfirmReset = () => {
    if (window.confirm(t?.hints?.confirmReset || 'Are you sure you want to reset all settings? This cannot be undone.')) {
      resetSettings();
    }
  };

  const handleExport = () => {
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(settings, null, 2));
      const downloadAnchorNode = document.createElement('a');
      downloadAnchorNode.setAttribute("href", dataStr);
      downloadAnchorNode.setAttribute("download", `aura_flux_config_${new Date().toISOString().slice(0,10)}.json`);
      document.body.appendChild(downloadAnchorNode);
      downloadAnchorNode.click();
      downloadAnchorNode.remove();
      showToast(t?.config?.copied || "Exported!", 'success');
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
      const fileObj = event.target.files && event.target.files[0];
      if (!fileObj) return;

      const reader = new FileReader();
      reader.onload = (e) => {
          try {
              const json = JSON.parse(e.target?.result as string);
              if (json && typeof json === 'object') {
                  if (window.confirm(config.confirmImport || 'Overwrite current settings?')) {
                      setSettings(prev => ({ ...prev, ...json }));
                      showToast(config.importSuccess || "Configuration loaded.", 'success');
                  }
              } else {
                  throw new Error("Invalid structure");
              }
          } catch (err) {
              console.error(err);
              showToast(config.invalidFile || "Invalid file format", 'error');
          }
      };
      reader.readAsText(fileObj);
      event.target.value = '';
  };

  const handleSavePreset = () => {
      if (presets.length >= 3) {
          showToast(config.limitReached || "Maximum 3 presets allowed.", 'error');
          return;
      }
      if (!presetName.trim()) return;

      const newPreset: SavedPreset = {
          id: Date.now(),
          name: presetName.trim().slice(0, 20),
          data: { ...settings },
          timestamp: Date.now()
      };
      
      updatePresets([...presets, newPreset]);
      setPresetName('');
      showToast(config.saved || "Preset Saved", 'success');
  };

  const handleLoadPreset = (preset: SavedPreset) => {
      setSettings(prev => ({ ...prev, ...preset.data }));
      showToast(`${config.load || "Loaded"}: ${preset.name}`, 'success');
  };

  const handleDeletePreset = (id: number) => {
      if (window.confirm(config.deleteConfirm || "Delete this preset?")) {
          updatePresets(presets.filter(p => p.id !== id));
      }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 h-full">
      {/* Card 1: Interface */}
      <BentoCard title={systemPanel.interface || "Interface"}>
        <div className="space-y-2">
          <SettingsToggle 
            label={settings.appTheme === 'light' ? (systemPanel.lightMode || "Light Theme") : (systemPanel.darkMode || "Dark Theme")} 
            value={settings.appTheme === 'light'} 
            onChange={() => handleSystemSettingChange('appTheme', settings.appTheme === 'light' ? 'dark' : 'light')} 
            hintText={hints?.lightMode}
            activeColor="green"
          />
          <SettingsToggle label={t?.showTooltips || "Show Tooltips"} value={settings.showTooltips} onChange={() => handleSystemSettingChange('showTooltips', !settings.showTooltips)} hintText={hints?.showTooltips} />
          <SettingsToggle label={t?.autoHideUi || "Auto-Hide Controls"} value={settings.autoHideUi} onChange={() => handleSystemSettingChange('autoHideUi', !settings.autoHideUi)} hintText={hints?.autoHideUi} />
          <SettingsToggle label={t?.hideCursor || "Hide Cursor"} value={settings.hideCursor} onChange={() => handleSystemSettingChange('hideCursor', !settings.hideCursor)} hintText={hints?.hideCursor} />
          <SettingsToggle label={t?.showFps || "Show FPS"} value={settings.showFps} onChange={() => handleSystemSettingChange('showFps', !settings.showFps)} hintText={hints?.showFps} />
        </div>
      </BentoCard>

      {/* Card 2: Behavior & Language */}
      <BentoCard title={systemPanel.behavior || "Behavior"}>
        <div className="space-y-4">
          <div className="space-y-2">
            <SettingsToggle label={t?.doubleClickFullscreen || "Double-Click Fullscreen"} value={settings.doubleClickFullscreen} onChange={() => handleSystemSettingChange('doubleClickFullscreen', !settings.doubleClickFullscreen)} hintText={hints?.doubleClickFullscreen} />
            <SettingsToggle label={t?.mirrorDisplay || "Mirror Display"} value={settings.mirrorDisplay} onChange={() => handleSystemSettingChange('mirrorDisplay', !settings.mirrorDisplay)} hintText={hints?.mirrorDisplay} />
            <SettingsToggle label={t?.wakeLock || "Screen Always On"} value={settings.wakeLock} onChange={() => handleSystemSettingChange('wakeLock', !settings.wakeLock)} hintText={hints?.wakeLock} />
          </div>
          
          <div className="pt-2 border-t border-white/5">
            <CustomSelect
              label={
                <div className="flex items-center gap-1.5">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  <span>{t?.language || "Interface Language"}</span>
                </div>
              }
              value={language}
              options={LANGUAGES}
              onChange={(val: string) => setLanguage(val as Language)}
            />
          </div>
        </div>
      </BentoCard>

      {/* Card 3: Data */}
      <BentoCard 
        title={config.title || "Data Management"}
        action={
            <TooltipArea text={hints?.confirmReset}>
                <button onClick={handleConfirmReset} className="p-1 text-red-400 hover:text-red-300 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                </button>
            </TooltipArea>
        }
      >
        <div className="space-y-4">
            <div className="grid grid-cols-2 gap-2">
                <TooltipArea text={hints?.exportConfig}>
                    <button onClick={handleExport} className="w-full py-2.5 bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10 rounded-lg text-[10px] font-bold uppercase tracking-wider text-white transition-all flex items-center justify-center gap-2 group">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 opacity-60 group-hover:opacity-100" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                        {config.export || "Export"}
                    </button>
                </TooltipArea>
                <TooltipArea text={hints?.importConfig}>
                    <button onClick={() => fileInputRef.current?.click()} className="w-full py-2.5 bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10 rounded-lg text-[10px] font-bold uppercase tracking-wider text-white transition-all flex items-center justify-center gap-2 group">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 opacity-60 group-hover:opacity-100" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m-4 4v12" /></svg>
                        {config.import || "Import"}
                    </button>
                </TooltipArea>
                <input type="file" ref={fileInputRef} onChange={handleImport} accept=".json" className="hidden" />
            </div>

            <div className="space-y-2 pt-2 border-t border-white/5">
                <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold text-white/40 uppercase tracking-wider">{config.library || "Local Library"} ({presets.length}/3)</span>
                </div>
                
                <div className="flex gap-2">
                    <input 
                        type="text" 
                        value={presetName}
                        onChange={(e) => setPresetName(e.target.value)}
                        placeholder={config.placeholder || "Preset Name..."}
                        className="flex-1 bg-black/40 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white placeholder-white/20 focus:outline-none focus:border-blue-500/50 transition-colors font-medium"
                        maxLength={18}
                        disabled={presets.length >= 3}
                    />
                    <button 
                        onClick={handleSavePreset}
                        disabled={presets.length >= 3 || !presetName.trim()}
                        className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider border transition-all flex items-center justify-center min-w-[50px] ${presets.length >= 3 || !presetName.trim() ? 'bg-white/5 border-transparent text-white/20 cursor-not-allowed' : 'bg-blue-600 border-blue-500 text-white shadow-lg hover:bg-blue-500'}`}
                    >
                        {config.save || "Save"}
                    </button>
                </div>

                <div className="space-y-1.5 min-h-[80px]">
                    {presets.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-6 text-white/20 gap-2 border border-dashed border-white/5 rounded-lg bg-white/[0.01]">
                            <span className="text-[10px] uppercase tracking-widest">{t?.common?.empty || "Empty"}</span>
                        </div>
                    )}
                    {presets.map(p => (
                        <div key={p.id} className="group flex items-center justify-between bg-white/[0.03] hover:bg-white/[0.08] border border-white/5 hover:border-white/20 rounded-lg px-3 py-2 transition-all">
                            <div className="flex flex-col flex-1 min-w-0 cursor-pointer" onClick={() => handleLoadPreset(p)} title={hints?.loadPreset}>
                                <span className="text-xs font-bold text-white/80 group-hover:text-white truncate">{p.name}</span>
                                <span className="text-[9px] text-white/30 font-mono">{new Date(p.timestamp).toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <button onClick={() => handleDeletePreset(p.id)} className="p-1.5 rounded hover:bg-white/10 text-white/40 hover:text-red-400 transition-colors" title={config.delete || "Delete"}>
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
      </BentoCard>
    </div>
  );
};
