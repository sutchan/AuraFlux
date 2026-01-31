
/**
 * File: components/controls/panels/VisualSettingsPanel.tsx
 * Version: 2.1.2
 * Author: Aura Vision Team
 * Copyright (c) 2024 Aura Vision. All rights reserved.
 * Updated: 2025-03-19 12:00
 */

import React from 'react';
import { VisualizerMode } from '../../../core/types';
import { VISUALIZER_PRESETS, COLOR_THEMES, SMART_PRESETS, THEME_NAMES } from '../../../core/constants';
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
  const localizedThemes = t?.themes || [];
  
  const isAdvanced = settings.uiMode === 'advanced';

  const handleVisualSettingChange = (key: keyof typeof settings, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    setActivePreset('');
  };

  const toggleIncludeMode = (m: VisualizerMode) => {
      const current = settings.includedModes || Object.values(VisualizerMode);
      if (current.includes(m)) {
          // Don't allow empty list
          if (current.length > 1) {
              handleVisualSettingChange('includedModes', current.filter(x => x !== m));
          }
      } else {
          handleVisualSettingChange('includedModes', [...current, m]);
      }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 h-full">
      {/* Card 1: Presets & Styles */}
      <BentoCard title={presets.title || "Smart Presets"}>
        <div className="space-y-4">
            <div className="grid grid-cols-2 gap-2">
                {Object.values(SMART_PRESETS).map(preset => (
                    <button
                        key={preset.nameKey}
                        onClick={() => applyPreset(preset)}
                        className={`py-3 px-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all border ${activePreset === preset.nameKey ? 'bg-white text-black border-white shadow-lg scale-105' : 'bg-white/5 border-white/5 text-white/60 hover:bg-white/10 hover:text-white'}`}
                    >
                        {presets[preset.nameKey] || preset.nameKey}
                    </button>
                ))}
            </div>
            
            <div className="pt-2 border-t border-white/5 space-y-2">
                <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">{t?.styleTheme || "Color Theme"}</span>
                    <SettingsToggle 
                        label={t?.cycleColors || "Cycle"} 
                        value={settings.cycleColors} 
                        onChange={() => handleVisualSettingChange('cycleColors', !settings.cycleColors)} 
                        variant="clean"
                        hintText={hints?.cycleColors}
                    />
                </div>
                {!settings.cycleColors && (
                    <div className="grid grid-cols-6 gap-2 p-1">
                        {COLOR_THEMES.map((theme, idx) => {
                            const isActive = JSON.stringify(colorTheme) === JSON.stringify(theme);
                            // Try localized name first, then English constant, then generic fallback
                            const name = localizedThemes[idx] || THEME_NAMES[idx] || `Theme ${idx + 1}`;
                            return (
                                <TooltipArea key={idx} text={name}>
                                    <button 
                                        onClick={() => setColorTheme(theme)}
                                        className={`w-full aspect-square rounded-full transition-all duration-300 relative overflow-hidden flex items-center justify-center group ${isActive ? 'ring-2 ring-white scale-110 shadow-[0_0_12px_rgba(255,255,255,0.4)] z-10' : 'opacity-60 hover:opacity-100 hover:scale-105 hover:shadow-md hover:z-10'}`}
                                        aria-label={name}
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-br" style={{ backgroundImage: `linear-gradient(to bottom right, ${theme[0]}, ${theme[1]}, ${theme[2] || theme[0]})` }} />
                                        {isActive && (
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white drop-shadow-md animate-fade-in-up" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                            </svg>
                                        )}
                                    </button>
                                </TooltipArea>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
      </BentoCard>

      {/* Card 2: Visual Engine */}
      <BentoCard 
        title={t?.visualizerMode || "Visual Engine"} 
        action={
            <div className="flex items-center gap-2">
                <span className="text-[9px] font-mono text-white/30 uppercase">{settings.autoRotate ? (t?.common?.active || "ACTIVE") : (t?.common?.off || "OFF")}</span>
                <SettingsToggle 
                    label={t?.autoRotate || "Auto-Cycle"} 
                    value={settings.autoRotate} 
                    onChange={() => handleVisualSettingChange('autoRotate', !settings.autoRotate)} 
                    variant="clean"
                    hintText={hints?.autoRotate}
                />
            </div>
        }
      >
        <div className="grid grid-cols-2 gap-2 pb-2 lg:max-h-[280px] lg:overflow-y-auto lg:custom-scrollbar lg:pr-1">
            {Object.values(VisualizerMode).map((mode) => (
                <VisualizerPreview 
                    key={mode} 
                    mode={mode} 
                    name={modes[mode] || mode} 
                    isActive={currentMode === mode}
                    isIncluded={settings.includedModes ? settings.includedModes.includes(mode) : true}
                    onClick={() => setMode(mode)}
                    onToggleInclude={() => toggleIncludeMode(mode)}
                />
            ))}
        </div>
      </BentoCard>

      {/* Card 3: Tuning & Dynamics */}
      <BentoCard 
        title={t?.settings || "Tuning"}
        action={
            <TooltipArea text={hints?.resetVisual}>
              <button onClick={resetVisualSettings} className="p-1 text-white/30 hover:text-white transition-colors">
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
              </button>
            </TooltipArea>
        }
      >
        <div className="space-y-5">
            <div className="space-y-4">
                <Slider 
                    label={t?.speed || "Speed"} 
                    hintText={`${hints?.speed || "Speed"} [Shift + ↑/↓]`}
                    value={settings.speed} 
                    min={0.1} max={3.0} step={0.1} 
                    onChange={(v: number) => handleVisualSettingChange('speed', v)} 
                />
                
                {isAdvanced && (
                    <div className="grid grid-cols-2 gap-3">
                        <SettingsToggle 
                            label={t?.glow || "Glow"} 
                            value={settings.glow} 
                            onChange={() => handleVisualSettingChange('glow', !settings.glow)} 
                            hintText={`${hints?.glow || "Glow"} [G]`} 
                        />
                        <SettingsToggle 
                            label={t?.trails || "Trails"} 
                            value={settings.trails} 
                            onChange={() => handleVisualSettingChange('trails', !settings.trails)} 
                            hintText={`${hints?.trails || "Trails"} [T]`} 
                        />
                    </div>
                )}
            </div>

            <div className="pt-2 border-t border-white/5 space-y-4">
                <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">{visualPanel.display || "Display"}</span>
                </div>
                
                {isAdvanced ? (
                    <>
                        <SegmentedControl 
                            label={t?.quality || "Quality"}
                            value={settings.quality}
                            options={[
                                { value: 'low', label: qualities.low || 'Low' },
                                { value: 'med', label: qualities.med || 'Med' },
                                { value: 'high', label: qualities.high || 'High' }
                            ]}
                            onChange={(val) => handleVisualSettingChange('quality', val)}
                            hintText={hints?.quality}
                        />
                    </>
                ) : (
                    <div className="text-center text-xs text-white/20 py-2 font-mono uppercase tracking-widest">{t?.common?.advanced || "Advanced Mode Required"}</div>
                )}
            </div>
        </div>
      </BentoCard>
    </div>
  );
};
