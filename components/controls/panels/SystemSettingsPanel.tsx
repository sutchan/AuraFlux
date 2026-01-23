/**
 * File: components/controls/panels/SystemSettingsPanel.tsx
 * Version: 1.6.6
 * Author: Sut
 * Updated: 2025-02-26 13:00
 * Description: UI Layout adjustment - Added preset limit check (max 5).
 */

import React, { useState, useRef, useMemo, useEffect } from 'react';
import { Language, VisualizerSettings, VisualizerMode } from '../../../core/types';
import { APP_VERSION } from '../../../core/constants';
import { CustomSelect } from '../../ui/controls/CustomSelect';
import { SettingsToggle } from '../../ui/controls/SettingsToggle';
import { useVisuals, useUI } from '../../AppContext';
import { useLocalStorage } from '../../../core/hooks/useLocalStorage';
import { TooltipArea } from '../../ui/controls/Tooltip';

// --- Small Performance Sparkline Component ---
const PerformanceSparkline: React.FC = () => {
    const [points, setPoints] = useState<number[]>(new Array(20).fill(40));
    useEffect(() => {
        const interval = setInterval(() => {
            setPoints(prev => {
                const next = [...prev.slice(1), 30 + Math.random() * 30];
                return next;
            });
        }, 200);
        return () => clearInterval(interval);
    }, []);
    return (
        <svg className="w-16 h-6 overflow-visible opacity-50" viewBox="0 0 100 60">
            <path d={`M ${points.map((p, i) => `${(i / 19) * 100} ${60 - p}`).join(' L ')}`} fill="none" stroke="#60a5fa" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
};

export const SystemSettingsPanel: React.FC = () => {
  const { language, setLanguage, resetSettings, t, showToast } = useUI();
  const { mode, setMode, colorTheme, setColorTheme, settings, setSettings } = useVisuals();
  const { getStorage, setStorage } = useLocalStorage();
  
  const [confirmReset, setConfirmReset] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  const sessionId = useMemo(() => Math.random().toString(36).substring(2, 10).toUpperCase(), []);

  // Configuration Management State
  interface SavedPreset {
      settings: VisualizerSettings;
      colors: string[];
  }
  const [savedPresets, setSavedPresets] = useState<Record<string, SavedPreset>>(() => getStorage('user_presets_v2', {}));
  const [presetName, setPresetName] = useState('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const sys = t?.systemPanel || {};
  const config = t?.config || {};
  const hints = t?.hints || {};
  const isAdvanced = settings.uiMode === 'advanced';
  
  // --- Data Link Logic ---
  const handleExportConfig = () => {
      const data = { version: APP_VERSION, mode, colorTheme, settings };
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `AuraFlux_Config_${new Date().toISOString().slice(0,10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      showToast(config.export || "Export Success", 'success');
  };

  const handleCopyConfig = () => {
      const data = { mode, colorTheme, settings };
      navigator.clipboard.writeText(JSON.stringify(data));
      showToast(config.copied || "Copied to Clipboard", 'success');
  };

  const handleImportConfig = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
          try {
              const data = JSON.parse(event.target?.result as string);
              if (data.mode) setMode(data.mode as VisualizerMode);
              if (data.colorTheme) setColorTheme(data.colorTheme);
              if (data.settings) setSettings(prev => ({ ...prev, ...data.settings }));
              showToast(config.importSuccess || "Config Loaded", 'success');
          } catch (err) {
              showToast(config.invalidFile || "Invalid Config File", 'error');
          }
      };
      reader.readAsText(file);
      if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleResetClick = () => {
    if (confirmReset) {
      resetSettings();
      setConfirmReset(false);
    } else {
      setConfirmReset(true);
      setTimeout(() => setConfirmReset(false), 4000);
    }
  };

  const handleSavePreset = () => {
      const name = presetName.trim();
      if (!name) return;

      // Check for limit: Maximum 5 presets
      const currentCount = Object.keys(savedPresets).length;
      if (currentCount >= 5 && !savedPresets[name]) {
          showToast(config.limitReached || "Maximum of 5 presets allowed.", 'error');
          return;
      }

      const entry: SavedPreset = { settings, colors: colorTheme };
      const newPresets = { ...savedPresets, [name]: entry };
      setSavedPresets(newPresets);
      setStorage('user_presets_v2', newPresets);
      setPresetName('');
      showToast(`${t?.presets?.save || "Preset Saved"}: ${name}`, 'success');
  };

  const handleLoadPreset = (name: string) => {
      const entry = savedPresets[name];
      if (entry) {
          const newSettings = (entry as any).sensitivity ? (entry as any) : entry.settings;
          setSettings(prev => ({ ...prev, ...newSettings }));
          showToast(`${t?.presets?.load || "Loaded"}: ${name}`, 'success');
      }
  };

  const handleDeletePreset = (e: React.MouseEvent, name: string) => {
      e.stopPropagation();
      if (window.confirm(`${t?.config?.delete || "Delete"} "${name}"?`)) {
          const newPresets = { ...savedPresets };
          delete newPresets[name];
          setSavedPresets(newPresets);
          setStorage('user_presets_v2', newPresets);
          showToast("Deleted", 'info');
      }
  };

  const filteredPresets = useMemo(() => {
      return Object.keys(savedPresets).filter(k => k.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [savedPresets, searchTerm]);

  return (
    <>
      <input type="file" ref={fileInputRef} onChange={handleImportConfig} accept=".json" style={{ display: 'none' }} />

      {/* Col 1: System Behavior & UI Preferences */}
      <div className={`flex flex-col h-full border-b lg:border-b-0 lg:border-e border-white/5 bg-grid-pattern transition-all duration-500 ${confirmReset ? 'animate-glitch' : ''}`}>
         <div className="p-5 space-y-6 overflow-y-auto custom-scrollbar">
            {/* Module: Interface Preferences */}
            <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-4 clip-corner relative group">
                <div className="absolute top-3 right-3 w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)]" />
                <span className="text-[9px] font-black uppercase text-white/20 tracking-widest block mb-3">{sys?.interface || "Interface"}</span>
                <div className="space-y-1">
                    <SettingsToggle variant="clean" label={t?.showFps || "FPS Counter"} value={settings.showFps} onChange={() => setSettings(p => ({...p, showFps: !p.showFps}))} />
                    <SettingsToggle variant="clean" label={t?.showTooltips || "Show Tooltips"} value={settings.showTooltips} onChange={() => setSettings(p => ({...p, showTooltips: !p.showTooltips}))} />
                    <SettingsToggle variant="clean" label={t?.mirrorDisplay || "Mirror Output"} value={settings.mirrorDisplay} onChange={() => setSettings(p => ({...p, mirrorDisplay: !p.mirrorDisplay}))} activeColor="green" />
                </div>
            </div>

            {/* Module: Core Behavior */}
            <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4">
                <span className="text-[9px] font-black uppercase text-white/20 tracking-widest block mb-4">{sys?.behavior || "Behavior"}</span>
                <div className="space-y-1">
                    <SettingsToggle variant="clean" label={t?.wakeLock || "Prevent Sleep"} value={settings.wakeLock} onChange={() => setSettings(p => ({...p, wakeLock: !p.wakeLock}))} />
                    <SettingsToggle variant="clean" label={t?.autoHideUi || "Auto-Hide"} value={settings.autoHideUi} onChange={() => setSettings(p => ({...p, autoHideUi: !p.autoHideUi}))} />
                    {isAdvanced && (
                        <SettingsToggle variant="clean" label={t?.doubleClickFullscreen || "Dbl Click Fullscreen"} value={settings.doubleClickFullscreen} onChange={() => setSettings(p => ({...p, doubleClickFullscreen: !p.doubleClickFullscreen}))} />
                    )}
                </div>
                <p className="text-[8px] text-white/20 mt-3 leading-tight uppercase font-bold tracking-tighter opacity-40 italic">System will optimize resources based on activity.</p>
            </div>
         </div>
      </div>

      {/* Col 2: Library Management & Data Link */}
      <div className={`flex flex-col h-full border-b lg:border-b-0 lg:border-e border-white/5 bg-black/40 backdrop-blur-3xl relative transition-all duration-500 ${confirmReset ? 'animate-glitch' : ''}`}>
         <div className="absolute inset-0 bg-grid-pattern opacity-30 pointer-events-none" />
         
         <div className="p-5 flex flex-col h-full relative z-10 overflow-hidden">
            
            {/* 1. Global Actions (Data Link) - Now at the Top */}
            <div className="shrink-0 mb-6">
                <div className="flex items-center gap-2 mb-3 px-1">
                    <span className="text-[10px] font-black uppercase text-white/40 tracking-[0.2em]">{config?.title || "Data Link"}</span>
                    <div className="h-px flex-1 bg-white/5" />
                </div>
                <div className="grid grid-cols-3 gap-2">
                    <TooltipArea text={hints?.exportConfig}>
                        <button onClick={handleExportConfig} className="w-full flex flex-col items-center gap-1.5 p-2 rounded-xl bg-white/5 border border-white/5 hover:bg-blue-600/20 hover:border-blue-500/40 transition-all group">
                            <svg className="w-4 h-4 text-white/40 group-hover:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                            <span className="text-[8px] font-bold uppercase tracking-tighter text-white/30 group-hover:text-white/80">{config?.export || "Export"}</span>
                        </button>
                    </TooltipArea>
                    <TooltipArea text={hints?.importConfig}>
                        <button onClick={() => fileInputRef.current?.click()} className="w-full flex flex-col items-center gap-1.5 p-2 rounded-xl bg-white/5 border border-white/5 hover:bg-green-600/20 hover:border-green-500/40 transition-all group">
                            <svg className="w-4 h-4 text-white/40 group-hover:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                            <span className="text-[8px] font-bold uppercase tracking-tighter text-white/30 group-hover:text-white/80">{config?.import || "Import"}</span>
                        </button>
                    </TooltipArea>
                    <TooltipArea text={hints?.copyConfig}>
                        <button onClick={handleCopyConfig} className="w-full flex flex-col items-center gap-1.5 p-2 rounded-xl bg-white/5 border border-white/5 hover:bg-purple-600/20 hover:border-purple-500/40 transition-all group">
                            <svg className="w-4 h-4 text-white/40 group-hover:text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" /></svg>
                            <span className="text-[8px] font-bold uppercase tracking-tighter text-white/30 group-hover:text-white/80">{config?.copy || "Copy"}</span>
                        </button>
                    </TooltipArea>
                </div>
            </div>

            {/* 2. Preset Library Header */}
             <div className="flex items-center justify-between mb-4 px-1 shrink-0">
                <div className="flex items-center gap-3">
                    <span className="text-[11px] font-black uppercase text-white/80 tracking-[0.2em]">{config?.library || "Preset Library"}</span>
                    <span className="px-1.5 py-0.5 rounded bg-blue-500/10 border border-blue-500/20 text-[8px] font-mono text-blue-400">{Object.keys(savedPresets).length}/5</span>
                </div>
                <input 
                    type="text"
                    placeholder="FILTER..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="bg-transparent border-b border-white/10 text-[10px] font-mono text-white/50 focus:border-blue-500 focus:text-white outline-none transition-all w-24 md:w-32"
                />
             </div>
             
             {/* 3. Save Form */}
             <div className="flex gap-2 mb-4 shrink-0">
                 <input 
                    type="text" 
                    value={presetName}
                    onChange={(e) => setPresetName(e.target.value)}
                    placeholder={config?.placeholder || "SAVE NEW..."}
                    className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs text-white placeholder-white/20 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all font-bold"
                 />
                 <button 
                    onClick={handleSavePreset}
                    disabled={!presetName.trim()}
                    className="px-6 bg-blue-600 hover:bg-blue-500 disabled:opacity-20 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
                 >
                    {config?.save || "Store"}
                 </button>
             </div>

             {/* 4. Scrollable List */}
             <div className="flex-grow space-y-1.5 overflow-y-auto custom-scrollbar pr-2 content-start">
                 {filteredPresets.length === 0 ? (
                     <div className="py-12 flex flex-col items-center opacity-20">
                        <svg className="w-12 h-12 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" /></svg>
                        <span className="text-[10px] font-black uppercase tracking-[0.3em]">No Presets Found</span>
                     </div>
                 ) : (
                     filteredPresets.map(key => {
                         const entry = savedPresets[key];
                         const isActive = JSON.stringify(settings) === JSON.stringify(entry?.settings || entry);
                         const colors = entry?.colors || ['#333', '#333', '#333'];
                         return (
                            <div key={key} className={`group flex items-center justify-between p-3 rounded-xl transition-all border clip-corner cursor-pointer ${isActive ? 'bg-blue-600/10 border-blue-500/40 shadow-[0_0_15px_rgba(59,130,246,0.15)]' : 'bg-white/[0.03] border-transparent hover:border-white/20'}`} onClick={() => handleLoadPreset(key)}>
                                <div className="flex items-center gap-3 overflow-hidden">
                                    <div className="flex gap-0.5 shrink-0">
                                        {colors.slice(0, 3).map((c, i) => <div key={i} className="w-1.5 h-1.5 rounded-full border border-white/10" style={{backgroundColor: c}} />)}
                                    </div>
                                    <span className={`text-[11px] font-bold truncate transition-colors ${isActive ? 'text-blue-300' : 'text-white/70 group-hover:text-white'}`}>{key}</span>
                                </div>
                                <button onClick={(e) => handleDeletePreset(e, key)} className="p-1.5 text-white/0 group-hover:text-red-500/60 hover:text-red-500 transition-all">
                                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                </button>
                            </div>
                         );
                     })
                 )}
             </div>
         </div>
      </div>

      {/* Col 3: Maintenance & System Context */}
      <div className={`flex flex-col h-full bg-grid-pattern transition-all duration-500 ${confirmReset ? 'animate-glitch' : ''}`}>
        <div className="p-5 flex flex-col h-full overflow-y-auto custom-scrollbar space-y-6">
            
            {/* Context A: Language */}
            <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-4 clip-corner">
                <CustomSelect 
                  label={t?.language || "Language"} 
                  value={language} 
                  options={[
                    { value: 'en', label: 'English' }, { value: 'zh', label: '简体中文' }, 
                    { value: 'tw', label: '繁體中文' }, { value: 'ja', label: '日本語' }, 
                    { value: 'es', label: 'Español' }, { value: 'ko', label: '한국어' }, 
                    { value: 'de', label: 'Deutsch' }, { value: 'fr', label: 'Français' },
                    { value: 'ru', label: 'Русский' }, { value: 'ar', label: 'العربية' }
                  ]} 
                  onChange={(val) => setLanguage(val as Language)} 
                />
            </div>

            {/* Context B: Hardware Stats */}
            <div className="bg-black/60 border border-white/10 rounded-2xl p-4 clip-corner relative">
                <div className="flex justify-between items-start mb-6">
                    <div className="flex flex-col gap-1">
                        <span className="text-[11px] font-black text-white uppercase tracking-tighter">AURA CORE</span>
                        <span className="text-[8px] font-mono text-white/30 tracking-widest">SID: {sessionId}</span>
                    </div>
                    <PerformanceSparkline />
                </div>
                
                <div className="space-y-3">
                    {[
                        { label: sys?.engine || 'GPU', val: 'Three.js v182', active: true },
                        { label: sys?.audio || 'DSP', val: 'WebAudio PCM', active: true },
                        { label: sys?.ai || 'NN', val: 'Gemini 3-F', active: false }
                    ].map((item, idx) => (
                        <div key={idx} className="flex justify-between items-center text-[9px] font-mono uppercase">
                            <span className="text-white/30 flex items-center gap-1.5">
                                <div className={`w-1 h-1 rounded-full ${item.active ? 'bg-green-500 animate-pulse' : 'bg-white/20'}`} />
                                {item.label}
                            </span>
                            <span className="text-white/60 tracking-tighter">{item.val}</span>
                        </div>
                    ))}
                </div>
                
                <div className="mt-6 pt-4 border-t border-white/5 flex justify-between items-end">
                    <span className="text-[8px] font-mono text-white/20 italic">V.{APP_VERSION}_STABLE</span>
                    <div className="flex gap-1">
                        <div className="w-1 h-3 bg-white/5" />
                        <div className="w-1 h-3 bg-white/10" />
                        <div className="w-1 h-3 bg-white/20" />
                    </div>
                </div>
            </div>

            {/* Context C: Danger Zone */}
            <div className="mt-auto">
                <div className={`bg-red-950/20 border border-red-500/20 rounded-2xl p-4 transition-all duration-500 group ${confirmReset ? 'bg-red-600/10 border-red-500 shadow-[0_0_30px_rgba(239,68,68,0.2)]' : ''}`}>
                    <span className="text-[8px] font-black uppercase text-red-500/50 tracking-[0.3em] block mb-3">Kernel Command</span>
                    <button 
                        onClick={handleResetClick} 
                        className={`w-full py-4 rounded-xl font-black text-[10px] uppercase tracking-[0.15em] transition-all duration-300 flex items-center justify-center gap-2 relative overflow-hidden ${confirmReset ? 'bg-red-600 text-white shadow-2xl scale-[1.02]' : 'bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20'}`}
                    >
                        {confirmReset && <div className="absolute inset-0 bg-red-400 animate-pulse opacity-20" />}
                        <svg className={`h-4 w-4 ${confirmReset ? 'animate-bounce' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        {confirmReset ? "CONFIRM FACTORY RESET" : "RESET ENGINE"}
                    </button>
                    <p className="text-[7px] text-red-500/30 text-center mt-3 uppercase font-black tracking-widest leading-none">Warning: Irreversible data purge.</p>
                </div>
            </div>
        </div>
      </div>
    </>
  );
};
