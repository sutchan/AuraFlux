/**
 * File: components/controls/panels/CustomTextSettingsPanel.tsx
 * Version: 1.8.32
 * Author: Sut
 * Updated: 2025-03-24 23:55 - Fix missing AVAILABLE_FONTS import
 */

import React, { useMemo } from 'react';
/* @fix: Removed non-existent import AVAILABLE_FONTS from constants */
import { getPositionOptions, getFontOptions } from '../../../core/constants';
import { SettingsToggle } from '../../ui/controls/SettingsToggle';
import { Slider } from '../../ui/controls/Slider';
import { CustomSelect } from '../../ui/controls/CustomSelect';
import { BentoCard } from '../../ui/layout/BentoCard';
import { useVisuals, useUI } from '../../AppContext';
import { Position } from '../../../core/types';
import { TooltipArea } from '../../ui/controls/Tooltip';

export const CustomTextSettingsPanel: React.FC = () => {
  const { settings, setSettings, resetTextSettings } = useVisuals();
  const { t } = useUI();
  
  const hints = t?.hints || {};
  const textSources = t?.textSources || {};
  const textPanel = t?.textPanel || {};
  
  const positionOptions = useMemo(() => getPositionOptions(t), [t]);
  const localizedFonts = useMemo(() => getFontOptions(t), [t]);

  const colorPresets = ['#ffffff', '#64748b', '#f87171', '#facc15', '#22c55e', '#00e5ff', '#3b82f6', '#8b5cf6', '#ff007f'];

  const currentFont = settings.customTextFont || 'Inter, sans-serif';
  /* @fix: Use localizedFonts instead of non-existent AVAILABLE_FONTS to check if current font is a preset */
  const isPresetFont = localizedFonts.some(f => f.value !== 'custom' && f.value === currentFont);
  const selectValue = isPresetFont ? currentFont : 'custom';

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Column 1: Core Configuration */}
      <BentoCard title={textPanel.overlay || "Text Layer"}>
        <div className="space-y-5">
            <SettingsToggle label={t?.customText || "Overlay Switch"} value={settings.showCustomText} onChange={() => setSettings({...settings, showCustomText: !settings.showCustomText})} activeColor="blue" />
            
            <div className="pt-4 border-t border-white/5 space-y-4">
                <CustomSelect label={t?.textSource} value={settings.textSource || 'AUTO'} options={[{ value: 'AUTO', label: textSources.auto || 'AUTO' }, { value: 'CUSTOM', label: textSources.custom || 'MANUAL' }, { value: 'SONG', label: textSources.song || 'SONG' }, { value: 'CLOCK', label: textSources.clock || 'CLOCK' }]} onChange={(v) => setSettings({...settings, textSource: v})} />
                <textarea 
                    value={settings.customText} 
                    onChange={(e) => setSettings({...settings, customText: e.target.value.toUpperCase()})} 
                    placeholder={t?.customTextPlaceholder || "ENTER TEXT"} 
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-xs font-black text-white tracking-widest uppercase focus:border-blue-500/50 outline-none resize-none min-h-[80px] transition-all" 
                />
                <CustomSelect label={t?.lyricsPosition || "Anchor"} value={settings.customTextPosition || 'mc'} options={positionOptions} onChange={(v) => setSettings({...settings, customTextPosition: v as Position})} />
            </div>
        </div>
      </BentoCard>

      {/* Column 2: Visual Style */}
      <BentoCard 
        title={textPanel.appearance || "Style & Motion"}
        action={<button onClick={resetTextSettings} className="p-1 text-white/30 hover:text-white transition-colors"><svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg></button>}
      >
         <div className="space-y-5">
            <div className="grid grid-cols-2 gap-5">
                <Slider label={t?.textSize} value={settings.customTextSize ?? 12} min={2} max={60} step={1} onChange={(v) => setSettings({...settings, customTextSize: v})} />
                <Slider label={t?.textRotation || "Tilt"} value={settings.customTextRotation ?? 0} min={-180} max={180} step={5} onChange={(v) => setSettings({...settings, customTextRotation: v})} unit="°" />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
                <SettingsToggle label={t?.textAudioReactive || "Pulse"} value={settings.textPulse} onChange={() => setSettings({...settings, textPulse: !settings.textPulse})} variant="clean" />
                <SettingsToggle label={t?.text3D || "3D Shadow"} value={!!settings.customText3D} onChange={() => setSettings({...settings, customText3D: !settings.customText3D})} variant="clean" />
            </div>
            
            <div className="pt-4 border-t border-white/5 space-y-4">
                <CustomSelect label={t?.textFont} value={selectValue} options={localizedFonts} onChange={(v) => setSettings({...settings, customTextFont: v==='custom'?'Arial':v})} />
                <div className="flex justify-between items-center">
                    <span className="text-[10px] font-black uppercase text-white/30 tracking-widest">{t?.customColor}</span>
                    <SettingsToggle label={t?.cycleColors} value={settings.customTextCycleColor} onChange={() => setSettings({...settings, customTextCycleColor: !settings.customTextCycleColor})} variant="clean" />
                </div>
                {!settings.customTextCycleColor ? (
                    <div className="grid grid-cols-9 gap-1.5 p-1">
                        {colorPresets.map(c => (
                            <button key={c} onClick={() => setSettings({...settings, customTextColor: c})} className={`aspect-square rounded-full border border-white/5 transition-all ${settings.customTextColor === c ? 'ring-2 ring-white scale-110' : 'opacity-40 hover:opacity-100'}`} style={{backgroundColor: c}} />
                        ))}
                    </div>
                ) : (
                    <Slider label={t?.speed} value={settings.customTextCycleInterval || 5} min={1} max={30} step={1} onChange={(v) => setSettings({...settings, customTextCycleInterval: v})} unit="s" />
                )}
            </div>
         </div>
      </BentoCard>
    </div>
  );
};