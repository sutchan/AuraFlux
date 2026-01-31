
/**
 * File: components/controls/panels/CustomTextSettingsPanel.tsx
 * Version: 2.3.0
 * Author: Sut
 * Copyright (c) 2025 Aura Vision. All rights reserved.
 * Updated: 2025-03-20 10:00
 */

import React, { useMemo } from 'react';
import { AVAILABLE_FONTS, getPositionOptions, getFontOptions } from '../../../core/constants';
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
  
  const isAdvanced = settings.uiMode === 'advanced';
  const hints = t?.hints || {};
  const textSources = t?.textSources || {};
  const textPanel = t?.textPanel || {};
  
  const positionOptions = useMemo(() => getPositionOptions(t), [t]);
  const localizedFonts = useMemo(() => getFontOptions(t), [t]);

  const handleTextPositionChange = (value: any) => {
    setSettings({ ...settings, customTextPosition: value as Position });
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
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 h-full">
      {/* Card 1: Custom Text Content */}
      <BentoCard title={textPanel.overlay || "Custom Text Overlay"}>
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
                    { value: 'SONG', label: textSources.song || 'Song Info Only' },
                    { value: 'CLOCK', label: textSources.clock || 'Current Time' }
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

            {isAdvanced && (
                <div className="grid grid-cols-2 gap-2 pt-2">
                    <Slider label={t?.textSize || "Size"} hintText={hints?.textSize} value={settings.customTextSize ?? 12} min={2} max={60} step={1} onChange={(v: number) => setSettings({...settings, customTextSize: v})} />
                    <Slider label={t?.textRotation || "Rotate"} hintText={hints?.textRotation} value={settings.customTextRotation ?? 0} min={-180} max={180} step={5} onChange={(v: number) => setSettings({...settings, customTextRotation: v})} unit="°" />
                </div>
            )}
            
            <div className="pt-2 border-t border-white/5">
                <CustomSelect
                    label={t?.lyricsPosition || "Position"} 
                    value={settings.customTextPosition || 'mc'}
                    options={positionOptions}
                    onChange={handleTextPositionChange}
                    hintText={hints?.customTextPosition}
                />
            </div>
        </div>
      </BentoCard>

      {/* Card 2: Advanced Typography & Color */}
      <BentoCard 
        title={textPanel.appearance || "Custom Appearance"}
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
                <>
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
                            label={t?.textFont || "Custom Font"} 
                            value={selectValue} 
                            hintText={hints?.textFont} 
                            options={localizedFonts} 
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

                    <div className="space-y-2">
                        <div className="flex justify-between items-center">
                            <span className="text-xs font-black uppercase text-white/50 tracking-widest block ml-1">{t?.customColor || 'TEXT COLOR'}</span>
                            <SettingsToggle 
                                label={t?.cycleColors || "Cycle"} 
                                value={settings.customTextCycleColor} 
                                onChange={() => setSettings({...settings, customTextCycleColor: !settings.customTextCycleColor})}
                                variant="clean"
                                hintText={hints?.customTextCycleColor}
                            />
                        </div>
                        
                        {!settings.customTextCycleColor && (
                            <div className="grid grid-cols-6 gap-2 p-2 animate-fade-in-up">
                                {colorPresets.map(c => ( <button key={c} onClick={() => setSettings({...settings, customTextColor: c})} className={`aspect-square rounded-full transition-all duration-300 ${settings.customTextColor === c ? 'ring-2 ring-white/80 scale-110' : 'opacity-60 hover:opacity-100'}`} style={{backgroundColor: c}} aria-label={`Color ${c}`} /> ))}
                            </div>
                        )}
                    </div>
                </>
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
