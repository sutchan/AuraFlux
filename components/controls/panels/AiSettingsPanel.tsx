/**
 * File: components/controls/panels/AiSettingsPanel.tsx
 * Version: 1.6.0
 * Author: Aura Vision Team
 * Copyright (c) 2025 Aura Vision. All rights reserved.
 * Updated: 2025-02-24 20:00
 */

import React, { useState, useEffect } from 'react';
import { LyricsStyle, Region, Position, AIProvider } from '../../../core/types';
import { REGION_NAMES, getPositionOptions, AVAILABLE_FONTS } from '../../../core/constants';
import { CustomSelect } from '../../ui/controls/CustomSelect';
import { SettingsToggle } from '../../ui/controls/SettingsToggle';
import { Slider } from '../../ui/controls/Slider';
import { PositionSelector } from '../../ui/controls/PositionSelector';
import { useVisuals, useAI, useUI } from '../../AppContext';
import { TooltipArea } from '../../ui/controls/Tooltip';
import { validateApiKey } from '../../../core/services/aiService';

const BetaBadge = ({ label }: { label?: string }) => (
  <span className="ml-2 px-1.5 py-[1px] rounded-[4px] bg-blue-500/20 border border-blue-500/30 text-[10px] font-bold text-blue-300 tracking-wider">
    {label || 'BETA'}
  </span>
);

export const AiSettingsPanel: React.FC = () => {
  const { settings, setSettings } = useVisuals();
  const { showLyrics, setShowLyrics, resetAiSettings, apiKeys, setApiKeys } = useAI();
  const { t, showToast } = useUI();

  const [inputKey, setInputKey] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  
  // Load key when provider changes
  useEffect(() => {
      const currentProvider = settings.recognitionProvider || 'GEMINI';
      setInputKey(apiKeys[currentProvider] || '');
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
      const isValid = await validateApiKey(provider, inputKey);
      setIsValidating(false);

      if (isValid) {
          setApiKeys(prev => ({ ...prev, [provider]: inputKey }));
          showToast(t?.aiPanel?.keySaved || "Key Verified & Saved", 'success');
      } else {
          showToast(t?.aiPanel?.keyInvalid || "Invalid Key", 'error');
      }
  };

  const common = t?.common || {};
  const regions = t?.regions || {};
  const lyricsStyles = t?.lyricsStyles || {};
  const hints = t?.hints || {};
  const aiPanel = t?.aiPanel || {};
  
  const isAdvanced = settings.uiMode === 'advanced';
  const positionOptions = getPositionOptions(t);
  
  const handleLyricsPositionChange = (value: Position) => {
    setSettings({ ...settings, lyricsPosition: value });
  };

  const currentProvider = settings.recognitionProvider || 'GEMINI';
  const hasKey = !!apiKeys[currentProvider];

  const getKeyHint = () => {
      if (currentProvider === 'GEMINI') return aiPanel.geminiHint || "Optional. Uses default free quota if empty.";
      if (currentProvider === 'GROQ') return aiPanel.groqHint || "Required. Enables fast Whisper+Llama inference.";
      return aiPanel.customHint || "Required. Key is stored locally in your browser.";
  };

  return (
    <>
      {/* Col 1: Core AI Settings & Key Management */}
      <div className="p-4 h-full flex flex-col border-b lg:border-b-0 lg:border-r border-white/5 pt-6 overflow-hidden">
        <div className="space-y-4 flex-grow overflow-y-auto custom-scrollbar pr-2">
            <div className="flex items-center mb-1">
               <span className="text-xs font-bold uppercase text-white/50 tracking-[0.25em]">{t?.tabs?.ai || "AI Recognition"}</span>
               <BetaBadge label={common?.beta} />
            </div>
            <SettingsToggle label={t?.showLyrics || "Enable Recognition"} value={showLyrics} onChange={() => setShowLyrics(!showLyrics)} activeColor="green" hintText={`${hints?.lyrics || "Enable AI Lyrics"} [L]`} />
            
            {isAdvanced && (
                <div className="space-y-4 pt-1 animate-fade-in-up">
                   <CustomSelect 
                     label={t?.recognitionSource || "AI Source"} 
                     value={currentProvider} 
                     hintText={hints?.recognitionSource}
                     options={[
                       { value: 'GEMINI', label: '🟢 Gemini 3.0 (Native Audio)' }, 
                       { value: 'OPENAI', label: '🔵 GPT-4o (Audio Preview)' },
                       { value: 'GROQ', label: '🟠 Groq (Whisper + Llama 3)' },
                       { value: 'MOCK', label: `⚪ ${t?.simulatedDemo || 'Simulated'} (Offline)` }
                     ]} 
                     onChange={(val) => setSettings({...settings, recognitionProvider: val})} 
                   />
                   
                   {/* API Key Input Section */}
                   {currentProvider !== 'MOCK' && (
                       <div className="bg-white/5 p-3 rounded-xl border border-white/10 space-y-2">
                           <div className="flex justify-between items-center">
                               <span className="text-[10px] font-bold text-white/50 uppercase tracking-widest">{currentProvider} API KEY</span>
                               <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded ${hasKey ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'}`}>
                                   {hasKey ? (aiPanel.saved || 'SAVED') : (aiPanel.missing || 'MISSING')}
                               </span>
                           </div>
                           <div className="flex gap-2">
                               <input 
                                   type="password" 
                                   value={inputKey}
                                   onChange={(e) => setInputKey(e.target.value)}
                                   placeholder={currentProvider === 'GROQ' ? "gsk_..." : "sk-..."}
                                   className="flex-1 bg-black/40 border border-white/10 rounded-lg px-2 py-1.5 text-xs text-white placeholder-white/20 focus:outline-none focus:border-blue-500 transition-colors"
                               />
                               <button 
                                   onClick={handleSaveKey}
                                   disabled={isValidating}
                                   className="px-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-lg text-[10px] font-bold uppercase transition-colors"
                               >
                                   {isValidating ? '...' : (hasKey ? (aiPanel.update || 'Update') : (aiPanel.save || 'Save'))}
                               </button>
                           </div>
                           <p className="text-[9px] text-white/30 leading-tight">
                               {getKeyHint()}
                           </p>
                       </div>
                   )}

                   <div className="pt-1">
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
                        hintText={hints?.lyricsFont}
                        onChange={(val) => setSettings({...settings, lyricsFont: val})} 
                    />
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
      </div>

      {/* Col 3: Position & Actions */}
      <div className="p-4 h-full flex flex-col pt-6">
        <div className="flex-grow">
            {isAdvanced ? (
                <div className="animate-fade-in-up">
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
