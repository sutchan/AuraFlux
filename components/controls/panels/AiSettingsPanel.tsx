
/**
 * File: components/controls/panels/AiSettingsPanel.tsx
 * Version: 2.1.1
 * Author: Aura Vision Team
 * Copyright (c) 2025 Aura Vision. All rights reserved.
 * Updated: 2025-03-20 12:40
 */

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { LyricsStyle, Region, Position, AIProvider } from '../../../core/types';
import { REGION_NAMES, getPositionOptions, getFontOptions, AVAILABLE_FONTS } from '../../../core/constants';
import { CustomSelect } from '../../ui/controls/CustomSelect';
import { SettingsToggle } from '../../ui/controls/SettingsToggle';
import { Slider } from '../../ui/controls/Slider';
import { PositionSelector } from '../../ui/controls/PositionSelector';
import { BentoCard } from '../../ui/layout/BentoCard';
import { useVisuals, useAI, useUI } from '../../AppContext';
import { TooltipArea } from '../../ui/controls/Tooltip';
import { validateApiKey } from '../../../core/services/aiService';

const BetaBadge = ({ label }: { label?: string }) => (
  <span className="ml-2 px-1.5 py-[1px] rounded text-[9px] font-black bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30 text-blue-200 tracking-widest shadow-[0_0_8px_rgba(59,130,246,0.3)]">
    {label || 'BETA'}
  </span>
);

export const AiSettingsPanel: React.FC = () => {
  const { settings, setSettings } = useVisuals();
  const { showLyrics, setShowLyrics, resetAiSettings, apiKeys, setApiKeys } = useAI();
  const { t, showToast } = useUI();

  const [inputKey, setInputKey] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [showKey, setShowKey] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  
  useEffect(() => {
      const currentProvider = settings.recognitionProvider || 'GEMINI';
      setInputKey(apiKeys[currentProvider] || '');
      setShowKey(false);
  }, [settings.recognitionProvider, apiKeys]);

  const handleSaveKey = async () => {
      const provider = settings.recognitionProvider as AIProvider;
      if (!inputKey.trim()) {
          const newKeys = { ...apiKeys };
          delete newKeys[provider];
          setApiKeys(newKeys);
          showToast(t?.aiPanel?.keyCleared || "Key cleared", 'info');
          return;
      }

      setIsValidating(true);
      const isValid = await validateApiKey('GEMINI', inputKey);
      setIsValidating(false);

      if (isValid) {
          setApiKeys(prev => ({ ...prev, [provider]: inputKey }));
          showToast(t?.aiPanel?.keySaved || "Key Verified & Saved", 'success');
      } else {
          showToast(t?.aiPanel?.keyInvalid || "Invalid Gemini API Key", 'error');
          inputRef.current?.select();
      }
  };

  const common = t?.common || {};
  const regions = t?.regions || {};
  const lyricsStyles = t?.lyricsStyles || {};
  const hints = t?.hints || {};
  const aiPanel = t?.aiPanel || {};
  const aiProviders = t?.aiProviders || {};
  
  const isAdvanced = settings.uiMode === 'advanced';
  const positionOptions = useMemo(() => getPositionOptions(t), [t]);
  const localizedFonts = useMemo(() => getFontOptions(t), [t]);

  const handleLyricsPositionChange = (value: Position) => {
    setSettings({ ...settings, lyricsPosition: value });
  };

  const currentProvider = settings.recognitionProvider || 'GEMINI';
  const hasKey = !!apiKeys[currentProvider];
  const isMock = currentProvider === 'MOCK';

  const currentFont = settings.lyricsFont || 'Inter, sans-serif';
  const isPresetFont = AVAILABLE_FONTS.some(f => f.value === currentFont);
  const selectValue = isPresetFont ? currentFont : 'custom';

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 h-full">
      {/* Card 1: Core AI */}
      <BentoCard title={t?.tabs?.ai || "AI Recognition"} topRight={<BetaBadge label={common?.beta} />}>
        <div className="space-y-4">
            <SettingsToggle label={t?.showLyrics || "Show Lyrics"} value={showLyrics} onChange={() => setShowLyrics(!showLyrics)} activeColor="green" hintText={`${t?.showLyrics || "Show Lyrics"} [L]`} />
            
            {isAdvanced && (
                <div className="space-y-3 pt-1 animate-fade-in-up">
                   <CustomSelect 
                     label={t?.recognitionSource || "AI Persona"} 
                     value={currentProvider} 
                     hintText={hints?.recognitionSource}
                     options={[
                       { value: 'GEMINI', label: `🟢 ${aiProviders.GEMINI || 'Gemini 3.0'}` }, 
                       { value: 'OPENAI', label: `🔵 ${aiProviders.OPENAI || 'GPT-4o Style'}` },
                       { value: 'GROQ', label: `🟠 ${aiProviders.GROQ || 'Groq Fast'}` },
                       { value: 'CLAUDE', label: `🟪 ${aiProviders.CLAUDE || 'Claude 3'}` },
                       { value: 'DEEPSEEK', label: `🤖 ${aiProviders.DEEPSEEK || 'DeepSeek'}` },
                       { value: 'QWEN', label: `🌏 ${aiProviders.QWEN || 'Qwen'}` },
                       { value: 'MOCK', label: `⚪ ${t?.simulatedDemo || 'Simulated'}` }
                     ]} 
                     onChange={(val) => setSettings({...settings, recognitionProvider: val})} 
                   />
                   
                   {!isMock && (
                       <div className="bg-gradient-to-b from-white/5 to-transparent p-2.5 rounded-xl border border-white/10 space-y-2">
                           <div className="flex justify-between items-center">
                               <span className="text-[10px] font-black text-blue-200/80 uppercase tracking-widest flex items-center gap-1.5">
                                 KEY
                               </span>
                               <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${hasKey ? 'bg-green-500/20 text-green-300 border-green-500/30' : 'bg-yellow-500/10 text-yellow-500/80 border-yellow-500/20'}`}>
                                   {hasKey ? (aiPanel.saved || 'READY') : (aiPanel.missing || 'OPTIONAL')}
                               </span>
                           </div>
                           
                           <div className="flex gap-1.5">
                               <div className="relative flex-1">
                                   <input
                                       ref={inputRef}
                                       type={showKey ? "text" : "password"} 
                                       value={inputKey}
                                       onChange={(e) => setInputKey(e.target.value)}
                                       className="w-full bg-black/60 border border-white/10 rounded-lg pl-2 pr-7 py-2 text-[11px] text-white placeholder-white/20 focus:outline-none focus:border-blue-500 transition-all font-mono"
                                       autoComplete="off"
                                       placeholder="AIzaSy..."
                                   />
                                   <button onClick={() => setShowKey(!showKey)} className="absolute right-1 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/80 p-1.5">
                                       {showKey ? (
                                         <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor"><path d="M10 12a2 2 0 100-4 2 2 0 000 4z" /><path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" /></svg>
                                       ) : (
                                         <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd" /><path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.742L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.064 7 9.542 7 .847 0 1.669-.105 2.454-.303z" /></svg>
                                       )}
                                   </button>
                               </div>
                               <button 
                                  onClick={handleSaveKey} 
                                  disabled={isValidating} 
                                  className={`px-2 rounded-lg text-[10px] font-black uppercase transition-all shrink-0 flex items-center justify-center min-w-[50px] ${hasKey ? 'bg-white/10 hover:bg-white/20 text-white' : 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg'}`}
                               >
                                   {isValidating ? '...' : (hasKey ? (aiPanel.update || 'UPD') : (aiPanel.save || 'SAVE'))}
                               </button>
                           </div>
                       </div>
                   )}
                </div>
            )}
        </div>
      </BentoCard>

      {/* Card 2: Typography */}
      <BentoCard title="Typography">
        <div className="space-y-4">
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
                        value={selectValue} 
                        options={localizedFonts} 
                        hintText={hints?.lyricsFont}
                        onChange={(val) => {
                            if (val === 'custom') {
                                setSettings({...settings, lyricsFont: 'Arial'});
                            } else {
                                setSettings({...settings, lyricsFont: val});
                            }
                        }} 
                    />
                    
                    {selectValue === 'custom' && (
                        <div className="animate-fade-in-up">
                            <label className="text-[10px] font-bold uppercase text-white/40 tracking-wider ml-1 mb-1 block">
                                {hints?.localFont || "Local Font Name"}
                            </label>
                            <input 
                                type="text" 
                                value={currentFont}
                                onChange={(e) => setSettings({...settings, lyricsFont: e.target.value})}
                                placeholder={hints?.enterLocalFont || "e.g. Arial"}
                                className="w-full bg-white/[0.04] rounded-xl px-3 py-2 text-xs font-medium text-white focus:outline-none focus:ring-1 focus:ring-blue-500/50 transition-colors"
                            />
                        </div>
                    )}

                    <Slider 
                        label={t?.lyricsFontSize || "Font Size"} 
                        hintText={hints?.lyricsFontSize}
                        value={settings.lyricsFontSize ?? 4} 
                        min={1} max={8} step={0.5} 
                        onChange={(v: number) => setSettings({...settings, lyricsFontSize: v})} 
                    />
                </div>
            )}
        </div>
      </BentoCard>

      {/* Card 3: Layout */}
      <BentoCard 
        title="Layout" 
        className="flex flex-col"
        action={
            <TooltipArea text={hints?.resetAi}>
            <button onClick={resetAiSettings} className="p-1 text-white/30 hover:text-white transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
            </button>
          </TooltipArea>
        }
      >
        <div className="flex-grow space-y-4">
            {isAdvanced ? (
                <div className="animate-fade-in-up space-y-4">
                    <CustomSelect 
                    label={t?.region || "Region"} 
                    value={settings.region || 'global'} 
                    hintText={hints?.region} 
                    options={Object.keys(REGION_NAMES).map(r => ({ value: r, label: regions[r] || r }))} 
                    onChange={(val) => setSettings({...settings, region: val as Region})} 
                    />

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
                    {t?.common?.advanced || "Advanced Mode Required"}
                </div>
            )}
        </div>
      </BentoCard>
    </div>
  );
};
