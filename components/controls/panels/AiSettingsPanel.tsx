/**
 * File: components/controls/panels/AiSettingsPanel.tsx
 * Version: 1.7.5
 * Author: Aura Vision Team
 * Copyright (c) 2025 Aura Vision. All rights reserved.
 * Updated: 2025-03-05 12:00
 * Description: Prevent API key input for non-Gemini providers to fix "Invalid API Key" errors.
 */

import React, { useState, useEffect, useRef } from 'react';
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
  <span className="ml-1.5 px-1 py-[0.5px] rounded-[3px] bg-blue-500/20 border border-blue-500/30 text-[10px] font-bold text-blue-300 tracking-wider">
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
      const isValid = await validateApiKey(provider, inputKey);
      setIsValidating(false);

      if (isValid) {
          setApiKeys(prev => ({ ...prev, [provider]: inputKey }));
          showToast(t?.aiPanel?.keySaved || "Key Verified & Saved", 'success');
      } else {
          showToast(t?.aiPanel?.keyInvalid || "Invalid Key", 'error');
          inputRef.current?.select();
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

  const providerLabels: Record<string, string> = {
      GEMINI: 'Gemini 3.0',
      OPENAI: 'GPT-4o',
      GROQ: 'Groq',
      CLAUDE: 'Claude 3',
      DEEPSEEK: 'DeepSeek',
      QWEN: 'Qwen',
      MOCK: 'Simulated'
  };
  const currentProviderLabel = providerLabels[currentProvider] || currentProvider;

  return (
    <>
      {/* Col 1: Core AI Settings & Key Management */}
      <div className="p-3 h-full flex flex-col border-b lg:border-b-0 lg:border-r border-white/5 pt-4 overflow-hidden">
        <div className="space-y-3 flex-grow overflow-y-auto custom-scrollbar pr-1.5">
            <div className="flex items-center mb-0.5">
               <span className="text-xs font-black uppercase text-white/50 tracking-widest">{t?.tabs?.ai || "AI Recognition"}</span>
               <BetaBadge label={common?.beta} />
            </div>
            <SettingsToggle label={t?.showLyrics || "Enable Recognition"} value={showLyrics} onChange={() => setShowLyrics(!showLyrics)} activeColor="green" hintText={`${hints?.lyrics || "Enable AI Lyrics"} [L]`} />
            
            {isAdvanced && (
                <div className="space-y-3 pt-1 animate-fade-in-up">
                   <CustomSelect 
                     label={t?.recognitionSource || "AI Source"} 
                     value={currentProvider} 
                     hintText={hints?.recognitionSource}
                     options={[
                       { value: 'GEMINI', label: '🟢 Gemini 3.0' }, 
                       { value: 'OPENAI', label: '🔵 GPT-4o' },
                       { value: 'GROQ', label: '🟠 Groq' },
                       { value: 'CLAUDE', label: '🟪 Claude 3' },
                       { value: 'DEEPSEEK', label: '🤖 DeepSeek' },
                       { value: 'QWEN', label: '🌏 Qwen' },
                       { value: 'MOCK', label: `⚪ ${t?.simulatedDemo || 'Simulated'}` }
                     ]} 
                     onChange={(val) => setSettings({...settings, recognitionProvider: val})} 
                   />
                   
                   {currentProvider === 'GEMINI' && (
                       <div className="bg-white/5 p-2.5 rounded-xl border border-white/10 space-y-1.5 animate-fade-in-up">
                           <div className="flex justify-between items-center">
                               <span className="text-[11px] font-bold text-white/50 uppercase tracking-widest">{currentProvider} KEY</span>
                               <span className={`text-[10px] font-mono px-1 rounded ${hasKey ? 'bg-green-500/20 text-green-300' : 'bg-yellow-500/20 text-yellow-300'}`}>
                                   {hasKey ? (aiPanel.saved || 'OK') : (aiPanel.geminiHint || 'Optional')}
                               </span>
                           </div>
                           <div className="flex gap-1.5">
                               <div className="relative flex-1">
                                   <input
                                       ref={inputRef}
                                       type={showKey ? "text" : "password"} 
                                       value={inputKey}
                                       onChange={(e) => setInputKey(e.target.value)}
                                       className="w-full bg-black/40 border border-white/10 rounded-lg pl-2 pr-6 py-1.5 text-xs text-white placeholder-white/20 focus:outline-none focus:border-blue-500 transition-colors font-mono"
                                       autoComplete="off"
                                   />
                                   <button onClick={() => setShowKey(!showKey)} className="absolute right-1 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/80 p-1">
                                       <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                   </button>
                               </div>
                               <button onClick={handleSaveKey} disabled={isValidating} className="px-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-lg text-[10px] font-black uppercase transition-colors shrink-0">
                                   {isValidating ? '...' : (hasKey ? (aiPanel.update || 'Update') : (aiPanel.save || 'Save'))}
                               </button>
                           </div>
                           <p className="text-[11px] text-white/30 leading-tight">A custom key is optional. The app will use a default free-tier key if this is empty.</p>
                       </div>
                   )}

                   {currentProvider !== 'GEMINI' && currentProvider !== 'MOCK' && (
                        <div className="bg-yellow-900/20 border border-yellow-500/30 p-3 rounded-xl animate-fade-in-up text-center">
                            <p className="text-xs text-yellow-200/80 leading-relaxed">
                                {`AI processing for ${currentProviderLabel} is not yet implemented. Please select Gemini to use AI features.`}
                            </p>
                        </div>
                   )}
                </div>
            )}
        </div>
      </div>

      {/* Col 2: Style */}
      <div className="p-3 h-full flex flex-col border-b lg:border-b-0 lg:border-r border-white/5 pt-4">
        <div className="space-y-3 flex-grow overflow-y-auto custom-scrollbar pr-1.5">
            <CustomSelect 
              label={`${t?.lyrics || "Lyrics"} ${t?.styleTheme || "Style"}`} 
              value={settings.lyricsStyle || LyricsStyle.KARAOKE} 
              hintText={hints?.lyricsStyle} 
              options={Object.values(LyricsStyle).map(s => ({ value: s, label: lyricsStyles[s] || s }))} 
              onChange={(val) => setSettings({...settings, lyricsStyle: val as LyricsStyle})} 
            />
            {isAdvanced && (
                <div className="space-y-3 animate-fade-in-up">
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
      <div className="p-3 h-full flex flex-col pt-4">
        <div className="flex-grow space-y-4">
            {isAdvanced ? (
                <div className="animate-fade-in-up space-y-4">
                    <div className="pt-0.5">
                      <CustomSelect 
                        label={t?.region || "Region"} 
                        value={settings.region || 'global'} 
                        hintText={hints?.region} 
                        options={Object.keys(REGION_NAMES).map(r => ({ value: r, label: regions[r] || r }))} 
                        onChange={(val) => setSettings({...settings, region: val as Region})} 
                      />
                    </div>

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
        <div className="mt-auto pt-4">
          <TooltipArea text={hints?.resetAi}>
            <button onClick={resetAiSettings} className="w-full py-2 bg-white/[0.04] rounded-lg text-xs font-bold uppercase tracking-wider text-white/50 hover:text-white flex items-center justify-center gap-1.5 border border-transparent hover:border-white/10 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 opacity-60" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
              {t?.resetAi || "Reset AI"}
            </button>
          </TooltipArea>
        </div>
      </div>
    </>
  );
};
