
/**
 * File: components/controls/panels/AiSettingsPanel.tsx
 * Version: 1.2.1
 * Author: Aura Vision Team
 * Copyright (c) 2024 Aura Vision. All rights reserved.
 * Updated: 2025-02-18 19:15
 */

import React, { useRef } from 'react';
import { LyricsStyle, Region, Position } from '../../../core/types';
import { REGION_NAMES, getPositionOptions, AVAILABLE_FONTS } from '../../../core/constants';
import { CustomSelect } from '../../ui/controls/CustomSelect';
import { SettingsToggle } from '../../ui/controls/SettingsToggle';
import { Slider } from '../../ui/controls/Slider';
import { PositionSelector } from '../../ui/controls/PositionSelector';
import { useVisuals, useAI, useUI } from '../../AppContext';
import { TooltipArea } from '../../ui/controls/Tooltip';

const BetaBadge = ({ label }: { label?: string }) => (
  <span className="ml-2 px-1.5 py-[1px] rounded-[4px] bg-blue-500/20 border border-blue-500/30 text-[9px] font-bold text-blue-300 tracking-wider">
    {label || 'BETA'}
  </span>
);

export const AiSettingsPanel: React.FC = () => {
  const { settings, setSettings } = useVisuals();
  const { showLyrics, setShowLyrics, resetAiSettings, currentSong, setCurrentSong } = useAI();
  const { t } = useUI();

  const common = t?.common || {};
  const regions = t?.regions || {};
  const lyricsStyles = t?.lyricsStyles || {};
  const hints = t?.hints || {};
  
  const isAdvanced = settings.uiMode === 'advanced';
  const previewTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const positionOptions = getPositionOptions(t);
  
  const handleLyricsPositionChange = (value: Position) => {
    setSettings({ ...settings, lyricsPosition: value });
    
    if (!currentSong || currentSong.matchSource === 'PREVIEW') {
        if (previewTimeoutRef.current) clearTimeout(previewTimeoutRef.current);
        
        setCurrentSong({
            title: "Preview Mode",
            artist: "System",
            lyricsSnippet: "Adjusting layout position...\nReviewing visual alignment\nDoes this look correct?\nWaiting for audio...",
            identified: true,
            matchSource: 'PREVIEW',
            mood: 'Energetic'
        });

        previewTimeoutRef.current = setTimeout(() => {
            setCurrentSong((prev) => prev?.matchSource === 'PREVIEW' ? null : prev);
        }, 4000);
    }
  };

  return (
    <>
      {/* Col 1: Core AI Settings */}
      <div className="p-4 h-full flex flex-col border-b lg:border-b-0 lg:border-r border-white/5 pt-6 overflow-hidden">
        <div className="space-y-4 flex-grow overflow-y-auto custom-scrollbar pr-2">
            <div className="flex items-center mb-1">
               <span className="text-xs font-bold uppercase text-white/50 tracking-[0.25em]">{t?.tabs?.ai || "AI Recognition"}</span>
               <BetaBadge label={common?.beta} />
            </div>
            <SettingsToggle label={t?.showLyrics || "Enable Recognition"} value={showLyrics} onChange={() => setShowLyrics(!showLyrics)} activeColor="green" hintText={`${hints?.lyrics || "Enable AI Lyrics"} [L]`} />
            
            {isAdvanced && (
                <div className="space-y-1 pt-1 animate-fade-in-up">
                   <CustomSelect 
                     label={t?.recognitionSource || "AI Source"} 
                     value={settings.recognitionProvider || 'GEMINI'} 
                     hintText={hints?.recognitionSource || "Choose AI persona"}
                     options={[
                       { value: 'GEMINI', label: '🟢 Gemini 3.0 (Native)' }, 
                       { value: 'GROK', label: '🟡 Grok (Persona)' },
                       { value: 'CLAUDE', label: '🟡 Claude 3.5 (Persona)' },
                       { value: 'OPENAI', label: '🟡 GPT-4 (Persona)' },
                       { value: 'DEEPSEEK', label: '🟡 DeepSeek (Persona)' },
                       { value: 'QWEN', label: '🟡 Qwen (Persona)' },
                       { value: 'MOCK', label: `⚪ ${t?.simulatedDemo || 'Simulated'} (Offline)` }
                     ]} 
                     onChange={(val) => setSettings({...settings, recognitionProvider: val})} 
                   />
                   {/* Status Legend */}
                   <div className="flex gap-3 px-1 mt-1 text-[9px] font-mono text-white/20 uppercase tracking-tight select-none">
                      <span className="flex items-center gap-1"><span className="text-green-500">🟢</span> API Connected</span>
                      <span className="flex items-center gap-1"><span className="text-yellow-500">🟡</span> Emulated</span>
                   </div>
                   
                   <div className="pt-3">
                      <CustomSelect label={t?.region || "Region"} value={settings.region || 'global'} hintText={hints?.region} options={Object.keys(REGION_NAMES).map(r => ({ value: r, label: regions[r] || r }))} onChange={(val) => setSettings({...settings, region: val as Region})} />
                   </div>
                </div>
            )}
        </div>
      </div>

      {/* Col 2: Style */}
      <div className="p-4 h-full flex flex-col border-b lg:border-b-0 lg:border-r border-white/5 pt-6">
        <div className="space-y-4 flex-grow overflow-y-auto custom-scrollbar pr-2">
            <CustomSelect 
              label={`${t?.lyrics || "Lyrics"} ${t?.styleTheme || "Style"}`} 
              value={settings.lyricsStyle || LyricsStyle.KARAOKE} 
              hintText={hints?.lyricsStyle} 
              options={Object.values(LyricsStyle).map(s => ({ value: s, label: lyricsStyles[s] || s }))} 
              onChange={(val) => setSettings({...settings, lyricsStyle: val as LyricsStyle})} 
            />
            {isAdvanced && (
                <div className="space-y-4 animate-fade-in-up">
                    <CustomSelect 
                        label={t?.lyricsFont || "Font Family"} 
                        value={settings.lyricsFont || 'Inter, sans-serif'} 
                        options={AVAILABLE_FONTS} 
                        onChange={(val) => setSettings({...settings, lyricsFont: val})} 
                    />
                    <Slider 
                        label={t?.lyricsFontSize || "Font Size"} 
                        hintText={hints?.lyricsFontSize || "Scale identification text"}
                        value={settings.lyricsFontSize ?? 4} 
                        min={1} max={8} step={0.5} 
                        onChange={(v: number) => setSettings({...settings, lyricsFontSize: v})} 
                    />
                </div>
            )}
        </div>
      </div>

      {/* Col 3: Position & Actions */}
      <div className="p-4 h-full flex flex-col pt-6">
        <div className="flex-grow">
            {isAdvanced ? (
                <div className="animate-fade-in-up">
                    {/* Wrap PositionSelector in TooltipArea as it does not accept hintText prop */}
                    <TooltipArea text={hints?.lyricsPosition}>
                        <PositionSelector
                        label={t?.lyricsPosition || "Position"}
                        value={settings.lyricsPosition}
                        onChange={handleLyricsPositionChange}
                        options={positionOptions}
                        activeColor="green"
                        />
                    </TooltipArea>
                </div>
            ) : (
                <div className="flex items-center justify-center h-full text-white/20 text-xs font-mono uppercase tracking-widest text-center px-4">
                    {t?.common?.advanced || "Advanced Mode Required for Positioning"}
                </div>
            )}
        </div>
        <div className="mt-auto pt-6">
          <TooltipArea text={hints?.resetAi}>
            <button onClick={resetAiSettings} className="w-full py-3 bg-white/[0.04] rounded-xl text-xs font-bold uppercase tracking-widest text-white/50 hover:text-white flex items-center justify-center gap-2 border border-transparent hover:border-white/10 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 opacity-60" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
              {t?.resetAi || "Reset AI"}
            </button>
          </TooltipArea>
        </div>
      </div>
    </>
  );
};
