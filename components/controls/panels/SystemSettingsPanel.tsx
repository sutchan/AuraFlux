/**
 * File: components/controls/panels/SystemSettingsPanel.tsx
 * Version: 2.3.0
 * Author: Sut
 */

import React, { useState, useRef, useEffect } from 'react';
import { SettingsToggle } from '../../ui/controls/SettingsToggle';
import { useVisuals, useUI } from '../../AppContext';
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
  const { t, resetSettings, language, setLanguage, showToast, setShowHelpModal, setHelpModalInitialTab } = useUI();
  const { getStorage, setStorage } = useLocalStorage();

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
                  showToast(t?.config?.importSuccess || "Configuration loaded successfully", 'success');
              }
          } catch (err) {
              showToast(t?.config?.invalidFile || "Invalid file format", 'error');
          }
      };
      reader.readAsText(file);
      e.target.value = ''; 
  };

  const handleSavePreset = () => {
      if (presets.length >= 3) { showToast(t?.config?.limitReached || "Limit reached", 'error'); return; }
      if (!presetName.trim()) return;
      const newPreset = { id: Date.now(), name: presetName.trim().slice(0, 18), data: { ...settings }, timestamp: Date.now() };
      const newPresets = [...presets, newPreset];
      setPresets(newPresets); setStorage('user_presets', newPresets);
      setPresetName(''); showToast(t?.config?.saved || "Saved", 'success');
  };

  const handleDeletePreset = (id: number) => {
      if (window.confirm(t?.config?.deleteConfirm || "Delete?")) {
          const newPresets = presets.filter(p => p.id !== id);
          setPresets(newPresets); setStorage('user_presets', newPresets);
      }
  };

  const subHeaderClass = "text-[9px] font-black text-black/30 dark:text-white/30 uppercase tracking-[0.2em] mb-2 block mt-3 first:mt-0";

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-stretch">
      {/* Column 1: Appearance & Interaction (7 cols) */}
      <div className="lg:col-span-7 flex flex-col gap-3">
        <BentoCard title={t?.systemPanel?.localization || "Aesthetics & Language"}>
            <div className="space-y-4">
                <CustomSelect label={t?.language} value={language} options={LANGUAGES} onChange={(v) => setLanguage(v as Language)} />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-black/5 dark:border-white/5">
                    <SegmentedControl label={t?.styleTheme || "Global Theme"} value={settings.appTheme} options={[{ value: 'dark', label: t?.systemPanel?.darkMode || 'Dark' }, { value: 'light', label: t?.systemPanel?.lightMode || 'Light' }]} onChange={(v) => setSettings({...settings, appTheme: v as any})} />
                    <SegmentedControl label={t?.systemPanel?.uiMode} value={settings.uiMode} options={[{ value: 'simple', label: t?.common?.simple }, { value: 'advanced', label: t?.common?.advanced }]} onChange={(v) => setSettings({...settings, uiMode: v as any})} />
                </div>
            </div>
        </BentoCard>

        <BentoCard title={t?.systemPanel?.interface || "System & Behavior"} className="flex-1">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-1 gap-x-6">
                <SettingsToggle label={t?.showTooltips} value={settings.showTooltips} onChange={() => setSettings({...settings, showTooltips: !settings.showTooltips})} variant="clean" />
                <SettingsToggle label={t?.autoHideUi} value={settings.autoHideUi} onChange={() => setSettings({...settings, autoHideUi: !settings.autoHideUi})} variant="clean" />
                <SettingsToggle label={t?.hideCursor} value={settings.hideCursor} onChange={() => setSettings({...settings, hideCursor: !settings.hideCursor})} variant="clean" />
                <SettingsToggle label={t?.doubleClickFullscreen} value={!!settings.doubleClickFullscreen} onChange={() => setSettings({...settings, doubleClickFullscreen: !settings.doubleClickFullscreen})} variant="clean" />
                <SettingsToggle label={t?.wakeLock} value={settings.wakeLock} onChange={() => setSettings({...settings, wakeLock: !settings.wakeLock})} variant="clean" />
                <SettingsToggle label={t?.mirrorDisplay} value={!!settings.mirrorDisplay} onChange={() => setSettings({...settings, mirrorDisplay: !settings.mirrorDisplay})} variant="clean" />
                <SettingsToggle label={t?.showFps} value={settings.showFps} onChange={() => setSettings({...settings, showFps: !settings.showFps})} variant="clean" />
            </div>
        </BentoCard>
      </div>

      {/* Column 2: Information & Data (5 cols) */}
      <div className="lg:col-span-5 flex flex-col gap-3">
        <BentoCard title={t?.helpModal?.title || "Project Resources"}>
            <div className="grid grid-cols-3 gap-2">
                <button onClick={() => { setHelpModalInitialTab('guide'); setShowHelpModal(true); }} className="py-2.5 bg-black/[0.04] dark:bg-white/5 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all border border-black/5 dark:border-white/5 flex items-center justify-center gap-2">{t?.helpModal?.tabs?.guide || 'Guide'}</button>
                <button onClick={() => { setHelpModalInitialTab('shortcuts'); setShowHelpModal(true); }} className="py-2.5 bg-black/[0.04] dark:bg-white/5 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all border border-black/5 dark:border-white/5 flex items-center justify-center gap-2">{t?.helpModal?.tabs?.shortcuts || 'Keys'}</button>
                <button onClick={() => { setHelpModalInitialTab('about'); setShowHelpModal(true); }} className="py-2.5 bg-black/[0.04] dark:bg-white/5 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all border border-black/5 dark:border-white/5 flex items-center justify-center gap-2">{t?.helpModal?.tabs?.about || 'About'}</button>
            </div>
        </BentoCard>

        <BentoCard title={t?.config?.title || "Data Management"} className="flex-1">
            <div className="flex flex-col h-full space-y-4">
                <div className="grid grid-cols-2 gap-3">
                    <button onClick={handleExport} className="py-2.5 bg-black/[0.04] dark:bg-white/5 rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-blue-600 hover:text-white transition-all border border-black/5 dark:border-white/5">{t?.config?.export}</button>
                    <button onClick={() => fileInputRef.current?.click()} className="py-2.5 bg-black/[0.04] dark:bg-white/5 rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-blue-600 hover:text-white transition-all border border-black/5 dark:border-white/5">{t?.config?.import}</button>
                    <input type="file" ref={fileInputRef} className="hidden" accept=".json" onChange={handleImport} />
                </div>

                <div className="pt-2 border-t border-black/5 dark:border-white/5 space-y-3">
                    <span className={subHeaderClass}>{t?.config?.library || "PRESET ARCHIVE"} ({presets.length}/3)</span>
                    <div className="flex gap-2">
                        <input type="text" value={presetName} onChange={(e)=>setPresetName(e.target.value)} placeholder={t?.config?.placeholder} className="flex-1 bg-black/[0.04] dark:bg-black/40 border border-black/5 dark:border-white/10 rounded-xl px-3 py-2 text-xs text-black dark:text-white placeholder-black/20 dark:placeholder-white/20 outline-none focus:border-blue-500/50" maxLength={18} />
                        <button onClick={handleSavePreset} disabled={presets.length>=3 || !presetName.trim()} className="px-4 py-2 bg-blue-600 text-white rounded-xl text-[9px] font-black uppercase tracking-widest disabled:opacity-20 hover:bg-blue-500 transition-colors shadow-lg shadow-blue-500/20">{t?.config?.save}</button>
                    </div>
                    <div className="space-y-1.5 overflow-y-auto custom-scrollbar max-h-[140px] pr-1">
                        {presets.map(p => (
                            <div key={p.id} className="flex items-center justify-between bg-black/[0.02] dark:bg-white/[0.03] border border-black/5 dark:border-white/5 rounded-xl px-3 py-2 hover:bg-black/[0.04] dark:hover:bg-white/[0.06] transition-all group">
                                <div className="flex flex-col flex-1 cursor-pointer" onClick={() => { setSettings({...settings, ...p.data}); showToast(`${t?.config?.load}: ${p.name}`, 'success'); }}>
                                    <span className="text-[10px] font-black text-black/80 dark:text-white/80 group-hover:text-blue-600 dark:group-hover:text-blue-400 uppercase truncate">{p.name}</span>
                                    <span className="text-[8px] font-mono text-black/20 dark:text-white/20">{new Date(p.timestamp).toLocaleDateString()}</span>
                                </div>
                                <button onClick={()=>handleDeletePreset(p.id)} className="p-2 opacity-20 group-hover:opacity-100 hover:text-red-500 transition-all"><svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12"/></svg></button>
                            </div>
                        ))}
                        {presets.length === 0 && <div className="py-4 text-center text-[10px] font-bold text-black/10 dark:text-white/10 uppercase tracking-widest">{t?.common?.empty}</div>}
                    </div>
                </div>
                
                <div className="mt-auto pt-4 border-t border-black/5 dark:border-white/5">
                    <button onClick={() => window.confirm(t?.hints?.confirmReset) && resetSettings()} className="w-full py-3 bg-red-500/5 hover:bg-red-500 hover:text-white border border-red-500/10 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] text-red-500 transition-all">
                        {t?.systemPanel?.factoryReset || 'Factory Reset All Settings'}
                    </button>
                </div>
            </div>
        </BentoCard>
      </div>
    </div>
  );
};
