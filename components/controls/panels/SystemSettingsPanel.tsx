/**
 * File: components/controls/panels/SystemSettingsPanel.tsx
 * Version: 2.0.2
 * Author: Sut
 */

import React, { useState, useRef, useEffect } from 'react';
import { SettingsToggle } from '../../ui/controls/SettingsToggle';
import { useVisuals, useUI } from '../../AppContext';
import { TooltipArea } from '../../ui/controls/Tooltip';
import { CustomSelect } from '../../ui/controls/CustomSelect';
import { SegmentedControl } from '../../ui/controls/SegmentedControl';
import { BentoCard } from '../../ui/layout/BentoCard';
import { Language, VisualizerSettings } from '../../../core/types';
import { useLocalStorage } from '../../../core/hooks/useLocalStorage';

const LANGUAGES: { value: Language; label: string }[] = [
  { value: 'en', label: 'English' }, { value: 'zh', label: '简体中文' }, { value: 'tw', label: '繁體中文' },
  { value: 'ja', label: '日本語' }, { value: 'es', label: 'Español' }, { value: 'ko', label: '한국어' },
  { value: 'de', label: 'Deutsch' }, { value: 'fr', label: 'Français' }, { value: 'ru', label: 'Русский' },
  { value: 'ar', label: 'العربية' }
];

interface SavedPreset { id: number; name: string; data: VisualizerSettings; timestamp: number; }

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

  const handleExport = () => {
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(settings, null, 2));
      const downloadAnchorNode = document.createElement('a'); downloadAnchorNode.setAttribute("href", dataStr);
      downloadAnchorNode.setAttribute("download", `aura_config_${new Date().toISOString().slice(0,10)}.json`);
      document.body.appendChild(downloadAnchorNode); downloadAnchorNode.click(); downloadAnchorNode.remove();
      showToast(t?.config?.copied || "Exported!", 'success');
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (evt) => {
          try {
              const data = JSON.parse(evt.target?.result as string);
              if (data && typeof data === 'object') {
                  setSettings(prev => ({ ...prev, ...data }));
                  showToast(config.importSuccess || "Configuration loaded successfully", 'success');
              }
          } catch (err) {
              showToast(config.invalidFile || "Invalid file format", 'error');
          }
      };
      reader.readAsText(file);
      e.target.value = ''; 
  };

  const handleSavePreset = () => {
      if (presets.length >= 3) { showToast(config.limitReached || "Limit reached", 'error'); return; }
      if (!presetName.trim()) return;
      const newPreset = { id: Date.now(), name: presetName.trim().slice(0, 18), data: { ...settings }, timestamp: Date.now() };
      const newPresets = [...presets, newPreset];
      setPresets(newPresets); setStorage('user_presets', newPresets);
      setPresetName(''); showToast(config.saved || "Saved", 'success');
  };

  const handleDeletePreset = (id: number) => {
      if (window.confirm(config.deleteConfirm || "Delete?")) {
          const newPresets = presets.filter(p => p.id !== id);
          setPresets(newPresets); setStorage('user_presets', newPresets);
      }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
      {/* Column 1: System Experience */}
      <BentoCard title={systemPanel.interface || "System Architecture"} className="py-2.5">
        <div className="space-y-3">
            <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
                <SettingsToggle label={t?.showTooltips || "Tooltips"} value={settings.showTooltips} onChange={() => setSettings({...settings, showTooltips: !settings.showTooltips})} variant="clean" />
                <SettingsToggle label={t?.autoHideUi || "Auto HUD"} value={settings.autoHideUi} onChange={() => setSettings({...settings, autoHideUi: !settings.autoHideUi})} variant="clean" />
                <SettingsToggle label={t?.hideCursor || "No Cursor"} value={settings.hideCursor} onChange={() => setSettings({...settings, hideCursor: !settings.hideCursor})} variant="clean" />
                <SettingsToggle label={t?.wakeLock || "Keep Alive"} value={settings.wakeLock} onChange={() => setSettings({...settings, wakeLock: !settings.wakeLock})} variant="clean" />
                <SettingsToggle label={t?.showFps || "Debug FPS"} value={settings.showFps} onChange={() => setSettings({...settings, showFps: !settings.showFps})} variant="clean" />
                <SettingsToggle label={t?.mirrorDisplay || "Mirror"} value={!!settings.mirrorDisplay} onChange={() => setSettings({...settings, mirrorDisplay: !settings.mirrorDisplay})} variant="clean" />
                <SettingsToggle label={t?.doubleClickFullscreen || "Quick FS"} value={!!settings.doubleClickFullscreen} onChange={() => setSettings({...settings, doubleClickFullscreen: !settings.doubleClickFullscreen})} variant="clean" />
            </div>
            
            <div className="pt-2 border-t border-white/5 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                    <CustomSelect label={t?.language} value={language} options={LANGUAGES} onChange={(v) => setLanguage(v as Language)} />
                    <SegmentedControl 
                        label={t?.styleTheme || "UI Mode"} 
                        value={settings.appTheme} 
                        options={[{ value: 'dark', label: systemPanel.darkMode || 'DARK' }, { value: 'light', label: systemPanel.lightMode || 'LIGHT' }]} 
                        onChange={(v) => setSettings({...settings, appTheme: v as any})} 
                    />
                </div>
                <SegmentedControl label={systemPanel.uiMode} value={settings.uiMode} options={[{ value: 'simple', label: 'SIMPLE' }, { value: 'advanced', label: 'ADVANCED' }]} onChange={(v) => setSettings({...settings, uiMode: v as any})} />
            </div>
        </div>
      </BentoCard>

      {/* Column 2: Data & Storage */}
      <BentoCard 
        title={config.title || "Data Management"}
        className="py-2.5"
        action={<button onClick={() => window.confirm(hints?.confirmReset) && resetSettings()} className="p-1 text-red-500/40 hover:text-red-400 transition-colors"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg></button>}
      >
        <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
                <button onClick={handleExport} className="py-2 bg-white/5 rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-white/10 transition-all border border-white/5">{config.export || 'EXPORT'}</button>
                <button onClick={() => fileInputRef.current?.click()} className="py-2 bg-white/5 rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-white/10 transition-all border border-white/5">{config.import || 'IMPORT'}</button>
                <input type="file" ref={fileInputRef} className="hidden" accept=".json" onChange={handleImport} />
            </div>

            <div className="pt-2 border-t border-white/5 space-y-3">
                <span className="text-[9px] font-black text-white/30 uppercase tracking-[0.2em]">{config.library || "SNAPSHOTS"} ({presets.length}/3)</span>
                <div className="flex gap-2">
                    <input type="text" value={presetName} onChange={(e)=>setPresetName(e.target.value)} placeholder={config.placeholder || "Tag name..."} className="flex-1 bg-black/40 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white placeholder-white/20 outline-none focus:border-blue-500/50" maxLength={18} />
                    <button onClick={handleSavePreset} disabled={presets.length>=3 || !presetName.trim()} className="px-4 py-1.5 bg-blue-600 text-white rounded-xl text-[9px] font-black uppercase tracking-widest disabled:opacity-20">{config.save || 'COMMIT'}</button>
                </div>
                <div className="space-y-1 overflow-y-auto custom-scrollbar max-h-[140px]">
                    {presets.map(p => (
                        <div key={p.id} className="flex items-center justify-between bg-white/[0.03] border border-white/5 rounded-xl px-3 py-1.5 hover:bg-white/[0.06] transition-all group">
                            <div className="flex flex-col flex-1 cursor-pointer" onClick={() => setSettings({...settings, ...p.data})}>
                                <span className="text-[10px] font-black text-white/80 group-hover:text-blue-300 uppercase truncate">{p.name}</span>
                                <span className="text-[8px] font-mono text-white/20">{new Date(p.timestamp).toLocaleDateString()}</span>
                            </div>
                            <button onClick={()=>handleDeletePreset(p.id)} className="p-1.5 opacity-20 group-hover:opacity-100 hover:text-red-500 transition-all"><svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg></button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
      </BentoCard>
    </div>
  );
};