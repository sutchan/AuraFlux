/**
 * File: components/controls/panels/VisualSettingsPanel.tsx
 * Version: 2.0.0
 * Author: Aura Vision Team
 * Copyright (c) 2024 Aura Vision. All rights reserved.
 * Updated: 2025-03-11 10:00
 */

import React from 'react';
import { VisualizerMode } from '../../../core/types';
import { VISUALIZER_PRESETS, COLOR_THEMES, SMART_PRESETS } from '../../../core/constants';
import { SettingsToggle } from '../../ui/controls/SettingsToggle';
import { Slider } from '../../ui/controls/Slider';
import { CustomSelect } from '../../ui/controls/CustomSelect';
import { SegmentedControl } from '../../ui/controls/SegmentedControl';
import { BentoCard } from '../../ui/layout/BentoCard';
import { VisualizerPreview } from './VisualizerPreview';
import { useVisuals, useUI } from '../../AppContext';
import { TooltipArea } from '../../ui/controls/Tooltip';

export const VisualSettingsPanel: React.FC = () => {
  const { 
    mode: currentMode, setMode, 
    colorTheme, setColorTheme, 
    settings, setSettings, 
    resetVisualSettings, 
    applyPreset, 
    activePreset, setActivePreset
  } = useVisuals();
  
  const { t } = useUI();
  
  const hints = t?.hints || {};
  const modes = t?.modes || {};
  const qualities = t?.qualities || {};
  const presets = t?.presets || {};
  const visualPanel = t?.visualPanel || {};

  const isAdvanced = settings.uiMode === 'advanced';

  const handleVisualSettingChange = (key: keyof typeof settings, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    setActivePreset('');
  };

  const handleToggleModeInclusion = (mode: VisualizerMode) => {
      setSettings(prev => {
          const currentList = prev.includedModes || [];
          const exists = currentList.includes(mode);
          let newList;
          if (exists) {
              newList = currentList.filter(m => m !== mode);
          } else {
              newList = [...currentList, mode];
          }
          if (activePreset === 'all_modes') setActivePreset('');
          return { ...prev, includedModes: newList };
      });
  };

  const isModeIncluded = (mode: VisualizerMode) => {
      return (settings.includedModes || []).includes(mode);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 h-full">
      {/* Card 1: Visual Modes Selection */}
      <BentoCard title={t?.visualizerMode || "Visualizer Mode"} className="row-span-1 md:row-span-2 lg:row-span-1">
        <div className="grid grid-cols-2 gap-2 pb-2">
            {Object.keys(VISUALIZER_PRESETS).map(m => {
                const mode = m as VisualizerMode;
                return (
                <VisualizerPreview
                    key={mode}
                    mode={mode}
                    name={modes[mode] || mode}
                    isActive={currentMode === mode}
                    isIncluded={isModeIncluded(mode)}
                    onClick={() => setMode(mode)}
                    onToggleInclude={() => handleToggleModeInclusion(mode)}
                />
                );
            })}
        </div>
      </BentoCard>
      
      {/* Card 2: Atmosphere (Quality, Presets, Themes) */}
      <BentoCard title="Atmosphere" className="space-y-4">
        {isAdvanced && (
            <div className="space-y-1">
                <SegmentedControl 
                    label={t?.quality || "Quality"}
                    value={settings.quality}
                    options={(['low', 'med', 'high'] as const).map(q => ({ value: q, label: qualities[q] || q }))}
                    onChange={(val) => setSettings(prev => ({...prev, quality: val}))}
                    hintText={hints?.quality}
                />
            </div>
        )}

        <div className="space-y-1">
            <CustomSelect 
                label={presets.title || 'Smart Presets'}
                value={activePreset}
                hintText={presets.hint || 'Apply a curated aesthetic'}
                options={[
                    { value: '', label: activePreset ? (presets.custom || 'Custom / Modified') : (presets.select || 'Select a mood...') },
                    { value: 'all_modes', label: `⚙️ ${presets.all_modes || 'All Modes'}` },
                    ...Object.keys(SMART_PRESETS).map(key => ({
                    value: key,
                    label: presets[key] || SMART_PRESETS[key].nameKey,
                    }))
                ]}
                onChange={(val) => {
                    if (val === 'all_modes') {
                    setSettings(prev => ({...prev, includedModes: Object.values(VisualizerMode)}));
                    setActivePreset('all_modes');
                    } else if (val && SMART_PRESETS[val]) {
                    applyPreset(SMART_PRESETS[val]);
                    } else {
                    setActivePreset('');
                    }
                }}
            />
        </div>

        <div>
            <span className="text-xs font-black uppercase text-white/50 tracking-widest block ms-1 mb-2 flex-shrink-0">{t?.styleTheme || "Visual Theme"}</span>
            <div className="grid grid-cols-6 gap-2 p-1">
                {COLOR_THEMES.map((theme, i) => (
                <button key={i} onClick={() => setColorTheme(theme)} aria-label={`Theme ${i+1}`} className={`aspect-square rounded-full flex-shrink-0 transition-all duration-300 ${JSON.stringify(colorTheme) === JSON.stringify(theme) ? 'ring-2 ring-white/80 scale-110 shadow-[0_0_10px_rgba(255,255,255,0.25)]' : 'opacity-60 hover:opacity-100'}`} style={{background: `linear-gradient(135deg, ${theme[0]}, ${theme[1]})` }} />
                ))}
            </div>
        </div>
      </BentoCard>
      
      {/* Card 3: Dynamics (Tuning & Automation) */}
      <BentoCard 
        title="Dynamics" 
        className="flex flex-col"
        action={
            <TooltipArea text={hints?.resetVisual}>
                <button onClick={resetVisualSettings} className="p-1 text-white/30 hover:text-white transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                </button>
            </TooltipArea>
        }
      >
        <div className="space-y-4">
          <div className="space-y-4">
            <Slider label={t?.speed || "Speed"} hintText={hints?.speed} value={settings.speed} min={0.1} max={3.0} step={0.1} onChange={(v: number) => handleVisualSettingChange('speed', v)} />
            <Slider label={t?.sensitivity || "Sensitivity"} hintText={hints?.sensitivity} value={settings.sensitivity} min={0.5} max={4.0} step={0.1} onChange={(v: number) => handleVisualSettingChange('sensitivity', v)} />
          </div>
          
          {isAdvanced && (
              <>
                  <div className="space-y-2 pt-2 border-t border-white/5 animate-fade-in-up">
                      <span className="text-[10px] font-black uppercase text-white/30 tracking-widest block mb-1">{visualPanel.effects || "Effects"}</span>
                      <div className="grid grid-cols-2 gap-2">
                          <SettingsToggle label={t?.glow || "Glow"} value={settings.glow} onChange={() => handleVisualSettingChange('glow', !settings.glow)} hintText={`${hints?.glow || "Glow"} [G]`} />
                          <SettingsToggle label={t?.trails || "Trails"} value={settings.trails} onChange={() => handleVisualSettingChange('trails', !settings.trails)} hintText={`${hints?.trails || "Trails"} [T]`} />
                      </div>
                  </div>
                  <div className="space-y-2 pt-2 border-t border-white/5 animate-fade-in-up">
                    <span className="text-[10px] font-black uppercase text-white/30 tracking-widest block mb-1">{visualPanel.automation || "Automation"}</span>
                    <SettingsToggle label={t?.autoRotate || "Auto Rotate"} value={settings.autoRotate} onChange={() => handleVisualSettingChange('autoRotate', !settings.autoRotate)} hintText={hints?.autoRotate}>
                        <div className="pt-1 px-1">
                            <Slider 
                                label={t?.rotateInterval || "Interval"} 
                                value={settings.rotateInterval} 
                                min={10} max={120} step={5} 
                                unit="s" 
                                hintText={hints?.rotateInterval}
                                onChange={(v: number) => handleVisualSettingChange('rotateInterval', v)} 
                            />
                        </div>
                    </SettingsToggle>
                    <SettingsToggle label={t?.cycleColors || "Cycle Colors"} value={settings.cycleColors} onChange={() => handleVisualSettingChange('cycleColors', !settings.cycleColors)} hintText={hints?.cycleColors}>
                        <div className="pt-1 px-1">
                            <Slider 
                                label={t?.colorInterval || "Interval"} 
                                value={settings.colorInterval} 
                                min={5} max={60} step={5} 
                                unit="s" 
                                hintText={hints?.colorInterval}
                                onChange={(v: number) => handleVisualSettingChange('colorInterval', v)} 
                            />
                        </div>
                    </SettingsToggle>
                  </div>
              </>
          )}
        </div>
      </BentoCard>
    </div>
  );
};
