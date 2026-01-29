/**
 * File: components/controls/panels/CustomTextSettingsPanel.tsx
 * Version: 2.0.0
 * Author: Sut
 * Copyright (c) 2024 Aura Vision. All rights reserved.
 * Updated: 2025-03-11 10:00
 */

import React from 'react';
import { AVAILABLE_FONTS, getPositionOptions } from '../../../core/constants';
import { SettingsToggle } from '../../ui/controls/SettingsToggle';
import { Slider } from '../../ui/controls/Slider';
import { CustomSelect } from '../../ui/controls/CustomSelect';
import { PositionSelector } from '../../ui/controls/PositionSelector';
import { BentoCard } from '../../ui/layout/BentoCard';
import { useVisuals, useUI } from '../../AppContext';
import { Position } from '../../../core/types';
import { TooltipArea } from '../../ui/controls/Tooltip';

export const CustomTextSettingsPanel: React.FC = () => {
  const { settings, setSettings, resetTextSettings } = useVisuals();
  const { t } = useUI();
  
  const isAdvanced = settings.uiMode === 'advanced';
  const hints = t?.hints || {};
  const textSources = t?.textSources || {};
  
  const positionOptions = getPositionOptions(t);

  const handleTextPositionChange = (value: Position) => {
    setSettings({ ...settings, customTextPosition: value });
  };

  const colorPresets = [
    '#ffffff', '#64748b', '#475569', '#f87171', '#ef4444', '#f97316', 
    '#facc15', '#84cc16', '#22c55e', '#00ff41', '#14b8a6', '#00e5ff',
    '#38bdf8', '#3b82f6', '#6366f1', '#8b5cf6', '#d946ef', '#ff007f'
  ];

  const currentFont = settings.customTextFont || 'Inter, sans-serif';
  const isPresetFont = AVAILABLE_FONTS.some(f => f.value === currentFont);
  const selectValue = isPresetFont ? currentFont : 'custom';

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 h-full">
      {/* Card 1: Content */}
      <BentoCard title="Content">
        <div className="space-y-3">
            <SettingsToggle 
                label={t?.customText || "Text Content"}
                value={settings.showCustomText}
                onChange={() => setSettings({...settings, showCustomText: !settings.showCustomText})}
                hintText={hints?.showCustomText}
                activeColor="blue"
            />
            
            <CustomSelect 
                label={t?.textSource || "Source"}
                value={settings.textSource || 'AUTO'}
                options={[
                    { value: 'AUTO', label: textSources.auto || 'Auto (Smart)' },
                    { value: 'CUSTOM', label: textSources.custom || 'Custom Text Only' },
                    { value: 'SONG', label: textSources.song || 'Song Info Only' }
                ]}
                onChange={(val) => setSettings({...settings, textSource: val})}
                hintText={hints?.textSource}
            />

            <TooltipArea text={hints?.customTextPlaceholder || "Enter message"}>
                <textarea 
                value={settings.customText} 
                onChange={(e) => setSettings({...settings, customText: e.target.value.toUpperCase()})} 
                placeholder={t?.customTextPlaceholder || "ENTER TEXT"} 
                rows={2} 
                className="w-full bg-white/[0.04] rounded-xl px-3 py-2 text-sm font-bold text-white tracking-widest uppercase focus:outline-none focus:ring-1 focus:ring-blue-500/50 transition-all resize-none min-h-[60px]" 
                />
            </TooltipArea>
        </div>
      </BentoCard>

      {/* Card 2: Appearance */}
      <BentoCard title="Appearance">
        <div className="space-y-4">
            {isAdvanced && (
                <>
                    <Slider label={t?.textSize || "Size"} hintText={hints?.textSize} value={settings.customTextSize ?? 12} min={2} max={60} step={1} onChange={(v: number) => setSettings({...settings, customTextSize: v})} />
                    <Slider label={t?.textRotation || "Rotate"} hintText={hints?.textRotation} value={settings.customTextRotation ?? 0} min={-180} max={180} step={5} onChange={(v: number) => setSettings({...settings, customTextRotation: v})} unit="°" />
                    <Slider label={t?.textOpacity || "Opacity"} hintText={hints?.textOpacity} value={settings.customTextOpacity ?? 1.0} min={0} max={1} step={0.05} onChange={(v: number) => setSettings({...settings, customTextOpacity: v})} />
                </>
            )}

            <div className="pt-2 border-t border-white/5 space-y-2">
                <span className="text-xs font-black uppercase text-white/50 tracking-widest block ml-1">{t?.customColor || 'TEXT COLOR'}</span>
                
                {isAdvanced && (
                    <div className="mb-2">
                        <SettingsToggle 
                          label={t?.cycleColors || "Cycle Color"} 
                          value={settings.customTextCycleColor} 
                          onChange={() => setSettings({...settings, customTextCycleColor: !settings.customTextCycleColor})}
                          variant="clean"
                          hintText={hints?.customTextCycleColor}
                        />
                        {settings.customTextCycleColor && (
                            <div className="pl-1 pt-1">
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
                    <div className="grid grid-cols-6 gap-2">
                        {colorPresets.map(c => ( <button key={c} onClick={() => setSettings({...settings, customTextColor: c})} className={`aspect-square rounded-full transition-all duration-300 ${settings.customTextColor === c ? 'ring-2 ring-white/80 scale-110' : 'opacity-60 hover:opacity-100'}`} style={{backgroundColor: c}} aria-label={`Color ${c}`} /> ))}
                    </div>
                </div>
            </div>
        </div>
      </BentoCard>

      {/* Card 3: Typography & Layout */}
      <BentoCard 
        title="Typography"
        action={
            <TooltipArea text={hints?.resetText}>
              <button onClick={resetTextSettings} className="p-1 text-white/30 hover:text-white transition-colors">
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
              </button>
            </TooltipArea>
        }
      >
         <div className="space-y-4">
            {isAdvanced ? (
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-2">
                        <SettingsToggle
                            label={t?.textAudioReactive || "Reactive"}
                            value={settings.textPulse}
                            onChange={() => setSettings({...settings, textPulse: !settings.textPulse})}
                            variant="clean"
                            hintText={hints?.textAudioReactive}
                        />
                        <SettingsToggle
                            label={t?.text3D || "3D Effect"}
                            value={!!settings.customText3D}
                            onChange={() => setSettings({...settings, customText3D: !settings.customText3D})}
                            variant="clean"
                            hintText={hints?.text3D}
                        />
                    </div>
                    
                    <div>
                        <CustomSelect 
                            label={t?.textFont || "Font Style"} 
                            value={selectValue} 
                            hintText={hints?.textFont} 
                            options={AVAILABLE_FONTS} 
                            onChange={(val) => {
                                if (val === 'custom') {
                                    setSettings({...settings, customTextFont: 'Arial'});
                                } else {
                                    setSettings({...settings, customTextFont: val});
                                }
                            }} 
                        />
                        {selectValue === 'custom' && (
                            <div className="mt-2 animate-fade-in-up">
                                <label className="text-[10px] font-bold uppercase text-white/40 tracking-wider ml-1 mb-1 block">
                                    {hints?.localFont || "Local Font Name"}
                                </label>
                                <input 
                                    type="text" 
                                    value={currentFont}
                                    onChange={(e) => setSettings({...settings, customTextFont: e.target.value})}
                                    placeholder={hints?.enterLocalFont || "e.g. Arial"}
                                    className="w-full bg-white/[0.04] rounded-xl px-3 py-2 text-xs font-medium text-white focus:outline-none focus:ring-1 focus:ring-blue-500/50 transition-colors"
                                />
                            </div>
                        )}
                    </div>

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
                <div className="flex items-center justify-center h-full text-white/20 text-xs font-mono uppercase tracking-widest text-center px-4">
                    {t?.common?.advanced || "Advanced Mode Required"}
                </div>
            )}
         </div>
      </BentoCard>
    </div>
  );
};
