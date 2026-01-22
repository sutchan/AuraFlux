/**
 * File: components/controls/panels/SystemSettingsPanel.tsx
 * Version: 1.4.1
 * Author: Aura Vision Team
 * Copyright (c) 2024 Aura Vision. All rights reserved.
 * Updated: 2025-02-24 13:00
 */

import React, { useState, useRef } from 'react';
import { Language, VisualizerSettings } from '../../../core/types';
import { APP_VERSION } from '../../../core/constants';
import { CustomSelect } from '../../ui/controls/CustomSelect';
import { SettingsToggle } from '../../ui/controls/SettingsToggle';
import { useVisuals, useUI } from '../../AppContext';
import { TooltipArea } from '../../ui/controls/Tooltip';
import { useLocalStorage } from '../../../core/hooks/useLocalStorage';

export const SystemSettingsPanel: React.FC = () => {
  const { language, setLanguage, resetSettings, t, showToast } = useUI();
  const { settings, setSettings } = useVisuals();
  const { getStorage, setStorage } = useLocalStorage();
  
  const [confirmReset, setConfirmReset] = useState(false);
  const [shouldCrash, setShouldCrash] = useState(false); 
  
  // Configuration Management State
  const [savedPresets, setSavedPresets] = useState<Record<string, VisualizerSettings>>(() => getStorage('user_presets', {}));
  const [presetName, setPresetName] = useState('');
  
  // Rename State
  const [editingPreset, setEditingPreset] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  // ROBUSTNESS TEST: Throw error during render to trigger ErrorBoundary
  if (shouldCrash) {
    throw new Error("System Integrity Check: Manual Crash Triggered via Settings Panel");
  }

  const hints = t?.hints || {};
  const sys = t?.systemPanel || {};
  const config = t?.config || {};
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

  // --- Configuration Logic ---

  const handleExport = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(settings, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    
    const dateStr = new Date().toISOString().slice(0,10);
    const filename = `aura_flux_config_${dateStr}.json`;
    
    downloadAnchorNode.setAttribute("download", filename);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
    showToast(config?.exportSuccess || "Config Exported", 'success');
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        // Basic validation: check for required keys
        if (json && typeof json === 'object' && 'sensitivity' in json && 'speed' in json) {
            if (window.confirm(config.confirmImport || "Overwrite current settings?")) {
                setSettings(prev => ({ ...prev, ...json }));
                showToast(config.importSuccess || "Configuration loaded", 'success');
            }
        } else {
            showToast(config.invalidFile || "Invalid configuration file", 'error');
        }
      } catch (err) {
        console.error("Import failed:", err);
        showToast("JSON Parse Error", 'error');
      }
    };
    reader.readAsText(file);
    // Reset input
    e.target.value = ''; 
  };

  const handleCopyConfig = () => {
      const configStr = JSON.stringify(settings);
      navigator.clipboard.writeText(configStr).then(() => {
          showToast(config?.copied || "Copied to Clipboard", 'success');
      });
  };

  // --- Preset Logic ---

  const handleSavePreset = () => {
      if (!presetName.trim()) return;
      const newPresets = { ...savedPresets, [presetName.trim()]: settings };
      setSavedPresets(newPresets);
      setStorage('user_presets', newPresets);
      setPresetName('');
      showToast("Preset Saved", 'success');
  };

  const handleLoadPreset = (name: string) => {
      if (savedPresets[name]) {
          setSettings(prev => ({ ...prev, ...savedPresets[name] }));
          showToast(`Loaded "${name}"`, 'success');
      }
  };

  const handleDeletePreset = (e: React.MouseEvent, name: string) => {
      e.stopPropagation(); // Stop propagation to prevent accidental triggers
      if (window.confirm(`Delete preset "${name}"?`)) {
          const newPresets = { ...savedPresets };
          delete newPresets[name];
          setSavedPresets(newPresets);
          setStorage('user_presets', newPresets);
          showToast("Preset Deleted", 'info');
      }
  };

  const handleStartRename = (e: React.MouseEvent, name: string) => {
      e.stopPropagation();
      setEditingPreset(name);
      setEditName(name);
  };

  const handleCancelRename = () => {
      setEditingPreset(null);
      setEditName('');
  };

  const handleSaveRename = () => {
      const oldName = editingPreset;
      const newName = editName.trim();

      if (!oldName) return;
      
      if (!newName) {
          showToast("Name cannot be empty", 'error');
          return;
      }

      if (newName === oldName) {
          handleCancelRename();
          return;
      }

      if (savedPresets[newName]) {
          showToast("Preset name already exists", 'error');
          return;
      }

      const newPresets = { ...savedPresets };
      const presetData = newPresets[oldName];
      delete newPresets[oldName];
      newPresets[newName] = presetData;

      setSavedPresets(newPresets);
      setStorage('user_presets', newPresets);
      handleCancelRename();
      showToast("Preset Renamed", 'success');
  };

  return (
    <>
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        accept=".json" 
        style={{ display: 'none' }} 
      />

      {/* Col 1: Interface & Behavior & Display */}
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
                <div className="pt-4 border-t border-white/5 animate-fade-in-up space-y-6">
                    {/* Interface Group */}
                    <div>
                        <span className="text-xs font-bold uppercase text-white/50 tracking-[0.25em] block ms-1 mb-3">{sys?.interface || "Interface"}</span>
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

                    {/* Behavior Group */}
                    <div>
                        <span className="text-xs font-bold uppercase text-white/50 tracking-[0.25em] block ms-1 mb-3">{sys?.behavior || "Behavior"}</span>
                        <div className="space-y-1">
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
                        </div>
                    </div>
                </div>
            )}
         </div>
      </div>

      {/* Col 2: Configuration & Data Management */}
      <div className="p-4 h-full flex flex-col border-b lg:border-b-0 lg:border-e border-white/5 pt-6 overflow-hidden">
         <div className="space-y-6 flex-grow overflow-y-auto custom-scrollbar pe-2">
             <span className="text-xs font-bold uppercase text-white/50 tracking-[0.15em] block ms-1 mb-2">{config?.title || "Cloud & Data"}</span>
             
             {/* Optimized Action Buttons Grid */}
             <div className="grid grid-cols-3 gap-2 mb-4">
                 <TooltipArea text={hints?.exportConfig}>
                    <button onClick={handleExport} className="w-full py-3 bg-blue-600 hover:bg-blue-500 rounded-lg text-[10px] sm:text-xs font-bold uppercase tracking-wider text-white transition-all flex items-center justify-center gap-1.5 shadow-lg shadow-blue-900/20 whitespace-nowrap">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                        <span className="hidden sm:inline">{config?.export || "Export"}</span>
                        <span className="sm:hidden">Exp</span>
                    </button>
                 </TooltipArea>
                 
                 <TooltipArea text={hints?.importConfig}>
                    <button onClick={handleImportClick} className="w-full py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-[10px] sm:text-xs font-bold uppercase tracking-wider text-white transition-colors flex items-center justify-center gap-1.5 whitespace-nowrap">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                        <span className="hidden sm:inline">{config?.import || "Import"}</span>
                        <span className="sm:hidden">Imp</span>
                    </button>
                 </TooltipArea>

                 <TooltipArea text={hints?.copyConfig}>
                    <button onClick={handleCopyConfig} className="w-full py-3 border border-white/10 rounded-lg text-[10px] sm:text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 bg-white/5 text-white hover:bg-white/10 whitespace-nowrap">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" /></svg>
                        <span className="hidden sm:inline">{config?.copy || "Copy"}</span>
                        <span className="sm:hidden">Copy</span>
                    </button>
                 </TooltipArea>
             </div>

             {/* Preset Library */}
             <div className="bg-white/[0.03] rounded-xl border border-white/5 p-3">
                 <div className="flex items-center justify-between mb-3">
                    <span className="text-[11px] font-bold text-blue-300 uppercase tracking-widest">{config?.library || "Preset Library"}</span>
                    <span className="text-[10px] text-white/30 font-mono">LOCAL</span>
                 </div>
                 
                 {/* Save New */}
                 <div className="flex gap-2 mb-4">
                     <input 
                        type="text" 
                        value={presetName}
                        onChange={(e) => setPresetName(e.target.value)}
                        placeholder={config?.placeholder || "Preset Name..."}
                        className="flex-1 bg-black/20 border border-white/10 rounded-lg px-2 py-2 text-xs text-white placeholder-white/20 focus:outline-none focus:border-blue-500/50 transition-colors"
                     />
                     <button 
                        onClick={handleSavePreset}
                        disabled={!presetName.trim()}
                        className="px-3 bg-blue-600/80 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg text-xs font-bold uppercase tracking-wider transition-colors"
                     >
                        {config?.save || "Save"}
                     </button>
                 </div>

                 {/* List */}
                 <div className="space-y-1.5 max-h-[180px] overflow-y-auto custom-scrollbar pr-1">
                     {Object.keys(savedPresets).length === 0 && (
                         <div className="text-xs text-white/20 text-center py-4 italic">No saved presets</div>
                     )}
                     {Object.keys(savedPresets).map(key => (
                         <div key={key} className="bg-white/5 px-3 py-2 rounded-lg group hover:bg-white/10 transition-colors min-h-[36px] flex items-center">
                             {editingPreset === key ? (
                                // Rename Mode
                                <div className="flex w-full items-center gap-2">
                                    <input 
                                        autoFocus
                                        type="text" 
                                        value={editName}
                                        onChange={(e) => setEditName(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') handleSaveRename();
                                            if (e.key === 'Escape') handleCancelRename();
                                        }}
                                        className="flex-1 bg-black/40 border border-blue-500/50 rounded px-1.5 py-0.5 text-xs text-white focus:outline-none"
                                    />
                                    <button onClick={handleSaveRename} className="text-green-400 hover:text-green-300 p-1">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                                    </button>
                                    <button onClick={handleCancelRename} className="text-red-400 hover:text-red-300 p-1">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                                    </button>
                                </div>
                             ) : (
                                // View Mode
                                <div className="flex items-center justify-between w-full">
                                    <span className="text-xs font-medium text-white/80 truncate max-w-[100px] cursor-pointer hover:text-white" onClick={() => handleLoadPreset(key)} title="Click to load">{key}</span>
                                    <div className="flex gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                                        <TooltipArea text={hints?.loadPreset}>
                                            <button onClick={() => handleLoadPreset(key)} className="p-1.5 hover:text-green-400 transition-colors" title={config?.load}>
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                            </button>
                                        </TooltipArea>
                                        <TooltipArea text="Rename Preset">
                                            <button onClick={(e) => handleStartRename(e, key)} className="p-1.5 hover:text-blue-400 transition-colors" title="Rename">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                                            </button>
                                        </TooltipArea>
                                        <TooltipArea text={hints?.delete}>
                                            <button onClick={(e) => handleDeletePreset(e, key)} className="p-1.5 hover:text-red-400 transition-colors" title={config?.delete}>
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                            </button>
                                        </TooltipArea>
                                    </div>
                                </div>
                             )}
                         </div>
                     ))}
                 </div>
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
                   <span className="text-xs font-mono text-white/40">v{APP_VERSION}</span>
                </div>
                <div className="space-y-2">
                  <p className="text-xs text-white/30 leading-relaxed">
                    {t?.appDescription || "Immersive audio visualization suite."}
                  </p>
                  <div className="pt-3 border-t border-white/5 space-y-2">
                     <div className="flex justify-between text-[11px] font-mono uppercase text-white/30"><span>{sys?.engine || 'Engine'}</span><span>Three.js r182 + React 19</span></div>
                     <div className="flex justify-between text-[11px] font-mono uppercase text-white/30"><span>{sys?.audio || 'Audio'}</span><span>Web Audio API (Real-time)</span></div>
                     <div className="flex justify-between text-[11px] font-mono uppercase text-white/30"><span>{sys?.ai || 'AI'}</span><span>Gemini 3 Flash (1.5s Latency)</span></div>
                  </div>
                </div>
             </div>
        </div>
        
        <div className="mt-auto space-y-3 pt-4 border-t border-white/5">
            <TooltipArea text={hints?.reset}>
              <button 
                onClick={handleResetClick} 
                className={`w-full py-4 rounded-xl font-bold text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 group ${confirmReset ? 'bg-red-600 text-white border-red-400' : 'bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20'}`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 opacity-70 group-hover:opacity-100" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                {confirmReset ? (t?.confirmReset || 'Are you sure?') : (t?.reset || "Reset App")}
              </button>
            </TooltipArea>
            
            {isAdvanced && (
                <TooltipArea text="Force application crash for testing.">
                  <button 
                      onClick={() => setShouldCrash(true)} 
                      className="w-full py-2 bg-transparent border border-white/5 rounded-lg text-[10px] font-mono text-white/20 uppercase tracking-widest hover:bg-white/5 hover:text-white/50 transition-colors animate-fade-in-up"
                  >
                      Simulate Crash
                  </button>
                </TooltipArea>
            )}
        </div>
      </div>
    </>
  );
};