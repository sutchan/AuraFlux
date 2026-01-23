/**
 * File: components/controls/panels/CustomTextSettingsPanel.tsx
 * Version: 1.1.5
 * Author: Aura Vision Team
 * Copyright (c) 2024 Aura Vision. All rights reserved.
 * Updated: 2025-02-26 19:30
 * Description: Standardized font styles for improved readability and consistency.
 */

import React from 'react';
import { AVAILABLE_FONTS, getPositionOptions } from '../../../core/constants';
import { SettingsToggle } from '../../ui/controls/SettingsToggle';
import { Slider } from '../../ui/controls/Slider';
import { CustomSelect } from '../../ui/controls/CustomSelect';
import { PositionSelector } from '../../ui/controls/PositionSelector';
import { useVisuals, useUI } from '../../AppContext';
import { Position } from '../../../core/types';
import { TooltipArea } from '../../ui/controls/Tooltip';

export const CustomTextSettingsPanel: React.FC = () => {
  const { settings, setSettings, resetTextSettings } = useVisuals();
  const { t } = useUI();
  
  const isAdvanced = settings.uiMode === 'advanced';
  const hints = t?.hints || {};
  
  const positionOptions = getPositionOptions(t);

  const handleTextPositionChange = (value: Position) => {
    setSettings({ ...settings, customTextPosition: value });
  };

  const colorPresets = [
    '#ffffff', '#f1f5f9', '#cbd5e1', '#94a3b8', '#64748b', '#475569',
    '#fca5a5', '#f87171', '#ef4444', '#f97316', '#f59e0b', '#facc15',
    '#bef264', '#84cc16', '#4ade80', '#22c55e', '#10b981', '#00ff41',
    '#14b8a6', '#00e5ff', '#22d3ee', '#38bdf8', '#60a5fa', '#3b82f6',
    '#6366f1', '#818cf8', '#a78bfa', '#8b5cf6', '#d946ef', '#ff007f'
  ];

  return (
    <>
      {/* Col 1: Content & Typography & Layout Sizing */}
      <div className="p-3 h-full flex flex-col border-b lg:border-b-0 lg:border-r border-white/5 pt-4 overflow-hidden">
        <div className="space-y-3 flex-grow overflow-y-auto custom-scrollbar pr-1.5">
            <div className="space-y-2">
                <SettingsToggle 
                  label={t?.customText || "Text Content"}
                  value={settings.showCustomText}
                  onChange={() => setSettings({...settings, showCustomText: !settings.showCustomText})}
                  hintText={hints?.showCustomText}
                  activeColor="blue"
                />
                <TooltipArea text={hints?.customTextPlaceholder || "Enter message"}>
                  <textarea 
                    value={settings.customText} 
                    onChange={(e) => setSettings({...settings, customText: e.target.value.toUpperCase()})} 
                    placeholder={t?.customTextPlaceholder || "ENTER TEXT"} 
                    rows={2} 
                    className="w-full bg-white/[0.04] rounded-xl px-3 py-2 text-sm font-bold text-white tracking-widest uppercase focus:outline-none focus:ring-1 focus:ring-blue-500/50 transition-all resize-none min-h-[50px]" 
                  />
                </TooltipArea>
            </div>
            
            {isAdvanced && (
                <div className="space-y-4 pt-1.5 border-t border-white/5 animate-fade-in-up">
                    <Slider label={t?.textSize || "Size"} hintText={hints?.textSize} value={settings.customTextSize ?? 12} min={2} max={60} step={1} onChange={(v: number) => setSettings({...settings, customTextSize: v})} />
                    <Slider label={t?.textRotation || "Rotate"} hintText={hints?.textRotation} value={settings.customTextRotation ?? 0} min={-180} max={180} step={5} onChange={(v: number) => setSettings({...settings, customTextRotation: v})} unit="°" />
                    <div className="pt-1.5 border-t border-white/5">
                        <Slider label={t?.textOpacity || "Opacity"} hintText={hints?.textOpacity} value={settings.customTextOpacity ?? 1.0} min={0} max={1} step={0.05} onChange={(v: number) => setSettings({...settings, customTextOpacity: v})} />
                    </div>
                </div>
            )}
        </div>
      </div>

      {/* Col 2: Visual Style (Color) */}
      <div className="p-3 h-full flex flex-col border-b lg:border-b-0 lg:border-r border-white/5 pt-4 overflow-hidden">
        <div className="space-y-4 flex-grow overflow-y-auto custom-scrollbar pr-1.5">
            <div className="space-y-2.5">
                <span className="text-xs font-black uppercase text-white/50 tracking-widest block ml-1">{t?.customColor || 'TEXT COLOR'}</span>
                
                {isAdvanced && (
                    <div className="animate-fade-in-up">
                        <SettingsToggle 
                          label={t?.cycleColors || "Cycle Color"} 
                          value={settings.customTextCycleColor} 
                          onChange={() => setSettings({...settings, customTextCycleColor: !settings.customTextCycleColor})}
                          variant="clean"
                          hintText={hints?.customTextCycleColor}
                        />
                        {settings.customTextCycleColor && (
                            <div className="pl-1 pt-1.5 pb-1">
                                <Slider 
                                    label={t?.cycleSpeed || "Speed"} 
                                    hintText={hints?.cycleSpeed}
                                    value={settings.customTextCycleInterval || 5} 
                                    min={1} max={60} step={1} unit="s"
                                    onChange={(v) => setSettings({...settings, customTextCycleInterval: v})} 
                                />
                            </div>
                        )}
                    </div>
                )}

                <div className={`flex flex-col gap-2 p-0.5 transition-opacity duration-300 ${settings.customTextCycleColor ? 'opacity-30 pointer-events-none' : 'opacity-100'}`}>
                    <div className="relative w-full h-8 rounded-lg border border-white/20 overflow-hidden group cursor-pointer shadow-md">
                        <div className="absolute inset-0 transition-colors duration-300" style={{ backgroundColor: settings.customTextColor || '#ffffff' }} />
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <span className="text-xs font-black text-white uppercase tracking-widest drop-shadow-md">
                                {settings.customTextColor}
                            </span>
                        </div>
                        <input type="color" value={settings.customTextColor || '#ffffff'} onChange={(e) => setSettings({...settings, customTextColor: e.target.value})} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                    </div>
                    <div className="grid grid-cols-6 gap-1.5 pt-0.5">
                        {colorPresets.map(c => ( <button key={c} onClick={() => setSettings({...settings, customTextColor: c})} className={`aspect-square rounded-full transition-all duration-300 ${settings.customTextColor === c ? 'ring-2 ring-white/80 scale-110' : 'opacity-60 hover:opacity-100'}`} style={{backgroundColor: c}} aria-label={`Color ${c}`} /> ))}
                    </div>
                </div>
            </div>
        </div>
      </div>

      {/* Col 3: Layout & Actions */}
      <div className="p-3 h-full flex flex-col pt-4 overflow-hidden">
         <div className="flex-grow space-y-4 overflow-y-auto custom-scrollbar pr-1.5">
            {isAdvanced ? (
                <div className="animate-fade-in-up space-y-4">
                    <SettingsToggle
                        label={t?.textAudioReactive || "Audio Reactive"}
                        value={settings.textPulse}
                        onChange={() => setSettings({...settings, textPulse: !settings.textPulse})}
                        variant="clean"
                        hintText={hints?.textAudioReactive}
                    />
                    <CustomSelect label={t?.textFont || "Font Style"} value={settings.customTextFont || 'Inter, sans-serif'} hintText={hints?.textFont} options={AVAILABLE_FONTS} onChange={(val) => setSettings({...settings, customTextFont: val})} />
                    <TooltipArea text={hints?.textPosition}>
                        <PositionSelector 
                            label={t?.textPosition || "Text Position"} 
                            value={settings.customTextPosition} 
                            onChange={handleTextPositionChange} 
                            options={positionOptions} 
                            activeColor="blue" 
                        />
                    </TooltipArea>
                </div>
            ) : (
                <div className="flex items-center justify-center h-full text-white/20 text-xs font-mono uppercase tracking-widest text-center">
                    {t?.common?.advanced || "Advanced Mode Required"}
                </div>
            )}
         </div>
         
         <div className="mt-auto pt-3">
            <TooltipArea text={hints?.resetText}>
              <button onClick={resetTextSettings} className="w-full py-2 bg-white/[0.04] rounded-lg text-xs font-bold uppercase tracking-wider text-white/50 hover:text-white flex items-center justify-center gap-1.5 border border-transparent hover:border-white/10 transition-colors">
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 opacity-60" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                 {t?.resetText || "Reset Text"}
              </button>
            </TooltipArea>
         </div>
      </div>
    </>
  );
};