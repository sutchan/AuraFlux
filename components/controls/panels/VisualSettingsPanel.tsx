/**
 * File: components/controls/panels/VisualSettingsPanel.tsx
 * Version: 2.3.0
 * Author: Sut
 */

import React, { useState } from 'react';
import { VisualizerMode } from '../../../core/types';
import { COLOR_THEMES, SMART_PRESETS, THEME_NAMES } from '../../../core/constants';
import { SettingsToggle } from '../../ui/controls/SettingsToggle';
import { Slider } from '../../ui/controls/Slider';
import { CustomSelect } from '../../ui/controls/CustomSelect';
import { SegmentedControl } from '../../ui/controls/SegmentedControl';
import { BentoCard } from '../../ui/layout/BentoCard';
import { VisualizerPreview } from './VisualizerPreview';
import { useVisuals, useUI, useAudioContext, useAI } from '../../AppContext';
import { TooltipArea } from '../../ui/controls/Tooltip';
import { generateArtisticBackground } from '../../../core/services/aiService';

export const VisualSettingsPanel: React.FC = () => {
  const { 
    mode: currentMode, setMode, 
    colorTheme, setColorTheme, 
    settings, setSettings, 
    resetVisualSettings, 
    applyPreset, 
    activePreset, setActivePreset
  } = useVisuals();
  
  const { currentSong } = useAudioContext();
  const { apiKeys } = useAI();
  const { t, showToast } = useUI();
  
  const [isGenerating, setIsGenerating] = useState(false);

  const localizedThemes = t?.themes || [];
  const isAdvanced = settings.uiMode === 'advanced';

  const handleVisualSettingChange = (key: keyof typeof settings, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    setActivePreset('');
  };

  const handleGenerateAiBg = async () => {
      const mood = currentSong?.mood_en_keywords || currentSong?.mood || 'Vibrant, Abstract, Cosmic';
      const apiKey = apiKeys['GEMINI'] || process.env.API_KEY;
      
      if (!apiKey) {
          showToast(t?.toasts?.aiDirectorReq || 'Key required', 'error');
          return;
      }
      
      setIsGenerating(true);
      try {
          const imgUrl = await generateArtisticBackground(mood, apiKey);
          if (imgUrl) {
              setSettings(p => ({ ...p, aiBgUrl: imgUrl, showAiBg: true }));
              showToast(t?.visualPanel?.bgGenerated || "Background Generated", 'success');
          } else {
              throw new Error("Empty image");
          }
      } catch (e) {
          showToast(t?.toasts?.aiFail || "Failed to generate image", 'error');
      } finally {
          setIsGenerating(false);
      }
  };

  const toggleIncludeMode = (m: VisualizerMode) => {
      const current = settings.includedModes || Object.values(VisualizerMode);
      if (current.includes(m)) {
          if (current.length > 1) {
              handleVisualSettingChange('includedModes', current.filter(x => x !== m));
          }
      } else {
          handleVisualSettingChange('includedModes', [...current, m]);
      }
  };

  const presetOptions = [
    { value: '', label: t?.presets?.select || 'Choose a mood...' },
    ...Object.values(SMART_PRESETS).map(p => ({
      value: p.nameKey,
      label: t?.presets?.[p.nameKey] || p.nameKey
    }))
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-start">
      {/* Column 1: Core Tuning & Display (7 cols) */}
      <div className="lg:col-span-7 space-y-3">
        <BentoCard 
            title={t?.presets?.title || "Visual Core"}
            action={
                <TooltipArea text={t?.hints?.resetVisual}>
                <button onClick={resetVisualSettings} className="p-1.5 text-black/30 dark:text-white/30 hover:text-blue-500 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                </button>
                </TooltipArea>
            }
        >
            <div className="space-y-4">
                {/* Mood & Presets Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
                    <CustomSelect 
                        label={t?.presets?.hint || "Vibe Selector"}
                        value={activePreset}
                        options={presetOptions}
                        onChange={(val) => {
                            const selected = SMART_PRESETS[val];
                            if (selected) applyPreset(selected);
                        }}
                    />
                    <div className="flex gap-2">
                        <SettingsToggle label={t?.glow || "Bloom"} value={settings.glow} onChange={()=>handleVisualSettingChange('glow', !settings.glow)} activeColor="blue" variant="clean" />
                        <SettingsToggle label={t?.trails || "Motion"} value={settings.trails} onChange={()=>handleVisualSettingChange('trails', !settings.trails)} activeColor="blue" variant="clean" />
                    </div>
                </div>
                
                {/* Main Sliders Row */}
                <div className="pt-4 border-t border-black/5 dark:border-white/5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
                        <Slider label={t?.speed || "Motion"} value={settings.speed} min={0.1} max={3.0} step={0.1} onChange={(v)=>handleVisualSettingChange('speed', v)} />
                        <Slider label={t?.sensitivity || "React"} value={settings.sensitivity} min={0.5} max={4.0} step={0.1} onChange={(v)=>handleVisualSettingChange('sensitivity', v)} />
                        
                        {isAdvanced && (
                            <>
                                <Slider label={t?.smoothing || "Inertia"} value={settings.smoothing} min={0} max={0.95} step={0.01} onChange={(v)=>handleVisualSettingChange('smoothing', v)} />
                                <SegmentedControl 
                                    label={t?.visualPanel?.display || "Fidelity"}
                                    value={settings.quality}
                                    options={[{value:'low',label:'LOW'},{value:'med',label:'MED'},{value:'high',label:'HIGH'}]}
                                    onChange={(val)=>handleVisualSettingChange('quality', val)}
                                />
                            </>
                        )}
                    </div>
                </div>

                {/* Theme Picker Row */}
                <div className="pt-4 border-t border-black/5 dark:border-white/5">
                    <div className="flex justify-between items-center mb-3">
                        <span className="text-[10px] font-black text-black/30 dark:text-white/30 uppercase tracking-widest">{t?.styleTheme || "Aesthetic Palette"}</span>
                        <SettingsToggle 
                            label={t?.cycleColors || "Auto-Cycle"} 
                            value={settings.cycleColors} 
                            onChange={() => handleVisualSettingChange('cycleColors', !settings.cycleColors)} 
                            variant="clean"
                            hintText={t?.hints?.cycleColors}
                        />
                    </div>
                    
                    {!settings.cycleColors ? (
                        <div className="grid grid-cols-6 sm:grid-cols-9 gap-2 animate-fade-in-up">
                            {COLOR_THEMES.map((theme, idx) => {
                                const isActive = JSON.stringify(colorTheme) === JSON.stringify(theme);
                                const name = localizedThemes[idx] || THEME_NAMES[idx] || `Theme ${idx + 1}`;
                                return (
                                    <button 
                                        key={idx}
                                        onClick={() => setColorTheme(theme)}
                                        title={name}
                                        className={`w-full aspect-square rounded-lg transition-all duration-300 relative overflow-hidden flex items-center justify-center ${isActive ? 'ring-2 ring-blue-500 scale-105 shadow-lg z-10' : 'opacity-60 hover:opacity-100 hover:scale-105'}`}
                                    >
                                        <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, ${theme[0]}, ${theme[1]}, ${theme[2] || theme[0]})` }} />
                                        {isActive && <div className="absolute inset-0 bg-white/10" />}
                                    </button>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="animate-fade-in-up max-w-sm">
                            <Slider 
                                label={t?.speed || "Color Tempo"} 
                                value={settings.colorInterval || 10} 
                                min={2} max={60} step={1} 
                                onChange={(v) => handleVisualSettingChange('colorInterval', v)} 
                                unit="s"
                            />
                        </div>
                    )}
                </div>
            </div>
        </BentoCard>

        {/* AI Background Card - Redesigned for better horizontal integration */}
        <BentoCard title={t?.visualPanel?.aiBg || "AI Inspiration Background"}>
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                <div className="shrink-0 flex gap-2">
                    <button 
                        onClick={handleGenerateAiBg} 
                        disabled={isGenerating}
                        className={`px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-[0.15em] transition-all flex items-center justify-center gap-2 border border-black/10 dark:border-white/10 ${isGenerating ? 'bg-black/5 dark:bg-white/5 text-black/40 dark:text-white/40' : 'bg-black dark:bg-white text-white dark:text-black hover:bg-blue-600 dark:hover:bg-blue-400 hover:text-white dark:hover:text-black'}`}
                    >
                        <svg className={`h-3 w-3 ${isGenerating ? 'animate-spin' : ''}`} fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd"/></svg>
                        {isGenerating ? t?.audioPanel?.analyzing : (settings.aiBgUrl ? t?.visualPanel?.regenerate : t?.visualPanel?.generateBg)}
                    </button>
                    {settings.aiBgUrl && (
                        <button onClick={() => setSettings(p => ({ ...p, aiBgUrl: '' }))} className="w-10 h-10 rounded-xl bg-red-500/10 text-red-500 flex items-center justify-center hover:bg-red-500/20 transition-colors border border-red-500/20">
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12"/></svg>
                        </button>
                    )}
                </div>
                
                {settings.aiBgUrl && (
                    <div className="flex-1 w-full grid grid-cols-2 sm:grid-cols-3 gap-4 items-center animate-fade-in-up">
                        <SettingsToggle label={t?.visualPanel?.showBg || "Layer"} value={settings.showAiBg} onChange={() => handleVisualSettingChange('showAiBg', !settings.showAiBg)} variant="clean" />
                        <Slider label={t?.visualPanel?.opacity || "Alpha"} value={settings.aiBgOpacity} min={0} max={1} step={0.05} onChange={(v) => handleVisualSettingChange('aiBgOpacity', v)} />
                        <Slider label={t?.player?.blur || "Blur"} value={settings.aiBgBlur} min={0} max={60} step={1} onChange={(v) => handleVisualSettingChange('aiBgBlur', v)} />
                    </div>
                )}
            </div>
        </BentoCard>
      </div>

      {/* Column 2: Engine Selection (5 cols) */}
      <div className="lg:col-span-5 h-full">
        <BentoCard 
            title={t?.visualizerMode || "Visual Synthesis"} 
            className="h-full min-h-[400px] lg:min-h-[500px]"
            action={
                <div className="flex items-center gap-3">
                    {settings.autoRotate && (
                        <div className="animate-fade-in-up w-16">
                            <Slider label="" value={settings.rotateInterval || 30} min={5} max={120} step={5} onChange={(v) => handleVisualSettingChange('rotateInterval', v)} unit="s" />
                        </div>
                    )}
                    <SettingsToggle label="" value={settings.autoRotate} onChange={() => handleVisualSettingChange('autoRotate', !settings.autoRotate)} variant="clean" hintText={t?.hints?.autoRotate} />
                </div>
            }
        >
            <div className="grid grid-cols-2 gap-2 pb-1 lg:max-h-[460px] overflow-y-auto custom-scrollbar pr-1">
                {Object.values(VisualizerMode).map((mode) => (
                    <VisualizerPreview 
                        key={mode} 
                        mode={mode} 
                        name={t?.modes?.[mode] || mode} 
                        isActive={currentMode === mode}
                        isIncluded={settings.includedModes ? settings.includedModes.includes(mode) : true}
                        onClick={() => setMode(mode)}
                        onToggleInclude={() => toggleIncludeMode(mode)}
                    />
                ))}
            </div>
        </BentoCard>
      </div>
    </div>
  );
};
