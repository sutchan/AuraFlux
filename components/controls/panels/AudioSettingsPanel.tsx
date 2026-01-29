
/**
 * File: components/controls/panels/AudioSettingsPanel.tsx
 * Version: 2.4.1
 * Author: Aura Vision Team
 * Copyright (c) 2025 Aura Vision. All rights reserved.
 * Updated: 2025-03-13 12:30
 */

import React, { useRef, useState, useEffect } from 'react';
import { Slider } from '../../ui/controls/Slider';
import { CustomSelect } from '../../ui/controls/CustomSelect';
import { BentoCard } from '../../ui/layout/BentoCard';
import { SettingsToggle } from '../../ui/controls/SettingsToggle';
import { useVisuals, useAudioContext, useUI, useAI } from '../../AppContext';
import { TooltipArea } from '../../ui/controls/Tooltip';
import { generateVisualConfigFromAudio, validateApiKey } from '../../../core/services/aiService';
import { VisualizerMode, AIProvider, Region } from '../../../core/types';
import { REGION_NAMES } from '../../../core/constants';

export const AudioSettingsPanel: React.FC = () => {
  const { settings, setSettings, resetAudioSettings, setActivePreset, setMode, setColorTheme } = useVisuals();
  const { 
      audioDevices, selectedDeviceId, onDeviceChange, toggleMicrophone, isListening, isPending,
      sourceType, fileStatus, fileName, getAudioSlice
  } = useAudioContext();
  const { apiKeys, setApiKeys, showLyrics, setShowLyrics } = useAI();
  const { t, showToast, language } = useUI();
  
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  // AI Key Management State
  const [inputKey, setInputKey] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [showKey, setShowKey] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const hints = t?.hints || {};
  const audioPanel = t?.audioPanel || {};
  const toasts = t?.toasts || {};
  const aiProviders = t?.aiProviders || {};
  const aiPanel = t?.aiPanel || {};
  const regions = t?.regions || {};
  const isAdvanced = settings.uiMode === 'advanced';

  const currentProvider = settings.recognitionProvider || 'GEMINI';
  const hasKey = !!apiKeys[currentProvider];
  const isMock = currentProvider === 'MOCK';

  useEffect(() => {
      setInputKey(apiKeys[currentProvider] || '');
      setShowKey(false);
  }, [currentProvider, apiKeys]);

  const handleSaveKey = async () => {
      const provider = settings.recognitionProvider as AIProvider;
      if (!inputKey.trim()) {
          const newKeys = { ...apiKeys };
          delete newKeys[provider];
          setApiKeys(newKeys);
          showToast(aiPanel.keyCleared || "Key cleared", 'info');
          return;
      }

      setIsValidating(true);
      const isValid = await validateApiKey('GEMINI', inputKey);
      setIsValidating(false);

      if (isValid) {
          setApiKeys(prev => ({ ...prev, [provider]: inputKey }));
          showToast(aiPanel.keySaved || "Key Verified & Saved", 'success');
      } else {
          showToast(aiPanel.keyInvalid || "Invalid Gemini API Key", 'error');
          inputRef.current?.select();
      }
  };

  const fftOptions = [
    { value: 512, label: '512' },
    { value: 1024, label: '1024' },
    { value: 2048, label: '2048' },
    { value: 4096, label: '4096' },
  ];

  const deviceOptions = [
    { value: '', label: t?.defaultMic || "Default Microphone" },
    ...audioDevices.map(d => ({ value: d.deviceId, label: d.label }))
  ];

  const handleAudioSettingChange = (key: keyof typeof settings, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    setActivePreset('');
  };

  const handleAiDirector = async () => {
      if (fileStatus !== 'ready') return;
      
      const apiKey = apiKeys['GEMINI'] || process.env.API_KEY;
      if (!apiKey) {
          showToast(toasts.aiDirectorReq || 'Gemini API Key required for AI Director.', 'error');
          return;
      }

      setIsAnalyzing(true);
      try {
          const wavBlob = await getAudioSlice(15);
          if (!wavBlob) throw new Error("Failed to capture audio.");

          const reader = new FileReader();
          reader.readAsDataURL(wavBlob);
          
          reader.onloadend = async () => {
              const base64Audio = (reader.result as string).split(',')[1];
              const config = await generateVisualConfigFromAudio(base64Audio, apiKey, language);
              
              if (config) {
                  if (config.mode && Object.values(VisualizerMode).includes(config.mode as VisualizerMode)) {
                      setMode(config.mode as VisualizerMode);
                  }
                  if (config.colors && config.colors.length === 3) {
                      setColorTheme(config.colors);
                  }
                  setSettings(prev => ({
                      ...prev,
                      speed: config.speed || prev.speed,
                      sensitivity: config.sensitivity || prev.sensitivity,
                      glow: config.glow ?? prev.glow
                  }));
                  
                  showToast(`AI: ${config.explanation}`, 'success');
              }
              setIsAnalyzing(false);
          };
      } catch (e) {
          console.error(e);
          showToast(toasts.aiFail || 'AI Analysis Failed.', 'error');
          setIsAnalyzing(false);
      }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 h-full">
      {/* Card 1: Input Source (Microphone) */}
      <BentoCard title={t?.audioInput || "Microphone"}>
         <div className="space-y-4">
             <div className="space-y-3 animate-fade-in-up">
                <CustomSelect 
                    label={t?.audioInput || "Device"}
                    value={selectedDeviceId}
                    options={deviceOptions}
                    onChange={onDeviceChange}
                    hintText={hints?.device}
                />
                
                {/* File Mode Indicator */}
                {sourceType === 'FILE' && (
                    <div className="p-2.5 rounded-lg bg-white/5 border border-white/10 text-xs flex items-center justify-between group">
                        <div className="flex items-center gap-2 min-w-0">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-blue-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" /></svg>
                            <span className="truncate text-white/70 font-medium">{fileName || "Local Audio"}</span>
                        </div>
                        <span className="text-[9px] font-black uppercase text-blue-400 tracking-wider">Active</span>
                    </div>
                )}

                <TooltipArea text={`${isListening ? t?.stopMic : t?.startMic} [Space]`}>
                    <button 
                        onClick={() => toggleMicrophone(selectedDeviceId)} 
                        disabled={isPending}
                        className={`w-full py-3 rounded-xl font-bold text-sm uppercase tracking-wider transition-all duration-300 shadow-lg ${isListening ? 'bg-red-500/15 text-red-400 border border-red-500/30 hover:bg-red-500/25' : 'bg-blue-600 text-white hover:bg-blue-500'} ${isPending ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        {isPending ? '...' : (isListening ? (t?.stopMic || "Stop") : (sourceType === 'FILE' ? "Switch to Mic" : (t?.startMic || "Start")))}
                    </button>
                </TooltipArea>
             </div>
         </div>
      </BentoCard>

      {/* Card 2: Analysis & AI Core */}
      <BentoCard title={audioPanel.analysisAi || "Analysis & AI Intelligence"}>
        <div className="space-y-4">
          {/* Signal Tuning */}
          <Slider label={t?.sensitivity || "Sensitivity"} hintText={hints?.sensitivity} value={settings.sensitivity} min={0.5} max={4.0} step={0.1} onChange={(v: number) => handleAudioSettingChange('sensitivity', v)} />
          
          {isAdvanced && (
              <div className="grid grid-cols-2 gap-2 pb-2 border-b border-white/5">
                  <Slider label={t?.smoothing || "Smoothing"} hintText={hints?.smoothing} value={settings.smoothing} min={0} max={0.95} step={0.01} onChange={(v: number) => handleAudioSettingChange('smoothing', v)} />
                  <CustomSelect
                        label={t?.fftSize || "FFT"}
                        value={settings.fftSize}
                        options={fftOptions}
                        onChange={(val) => handleAudioSettingChange('fftSize', val)}
                        hintText={hints?.fftSize}
                    />
              </div>
          )}

          {/* AI Core Configuration */}
          <div className="space-y-3 animate-fade-in-up">
             <CustomSelect 
                label={t?.recognitionSource || "AI Model"} 
                value={currentProvider} 
                hintText={hints?.recognitionSource}
                options={[
                    { value: 'GEMINI', label: `🟢 ${aiProviders.GEMINI || 'Gemini 3.0'}` }, 
                    { value: 'OPENAI', label: `🔵 ${aiProviders.OPENAI || 'GPT-4o Style'}` },
                    { value: 'MOCK', label: `⚪ ${t?.simulatedDemo || 'Simulated'}` }
                ]} 
                onChange={(val) => setSettings({...settings, recognitionProvider: val})} 
             />
             
             {!isMock && (
                 <div className="bg-gradient-to-b from-white/5 to-transparent p-2 rounded-xl border border-white/10 space-y-1.5">
                     <div className="flex justify-between items-center">
                         <span className="text-[9px] font-bold text-blue-200 uppercase tracking-widest">API Key</span>
                         <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded border ${hasKey ? 'bg-green-500/20 text-green-300 border-green-500/30' : 'bg-yellow-500/10 text-yellow-500/80 border-yellow-500/20'}`}>
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
                                 className="w-full bg-black/60 border border-white/10 rounded-lg pl-2 pr-7 py-1.5 text-[10px] text-white placeholder-white/20 focus:outline-none focus:border-blue-500 transition-all font-mono"
                                 autoComplete="off"
                                 placeholder="AIzaSy..."
                             />
                             <button onClick={() => setShowKey(!showKey)} className="absolute right-1 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/80 p-1">
                                 {showKey ? (
                                   <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor"><path d="M10 12a2 2 0 100-4 2 2 0 000 4z" /><path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" /></svg>
                                 ) : (
                                   <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd" /><path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.742L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.064 7 9.542 7 .847 0 1.669-.105 2.454-.303z" /></svg>
                                 )}
                             </button>
                         </div>
                         <button 
                            onClick={handleSaveKey} 
                            disabled={isValidating} 
                            className={`px-2 rounded-lg text-[9px] font-bold uppercase transition-all shrink-0 flex items-center justify-center min-w-[40px] ${hasKey ? 'bg-white/10 hover:bg-white/20 text-white' : 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg'}`}
                         >
                             {isValidating ? '...' : (hasKey ? 'UPD' : 'SAVE')}
                         </button>
                     </div>
                 </div>
             )}
          </div>
        </div>
      </BentoCard>

      {/* Card 3: Actions & Activation */}
      <BentoCard 
        title={audioPanel.smartActions || "Smart Actions"}
        className="flex flex-col"
        action={
            <TooltipArea text={hints?.resetAudio}>
              <button onClick={resetAudioSettings} className="p-1 text-white/30 hover:text-white transition-colors">
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
              </button>
            </TooltipArea>
        }
      >
          <div className="flex-grow space-y-4">
             <div className="bg-white/[0.03] p-2 rounded-xl border border-white/5 space-y-2">
                 <SettingsToggle label={t?.showLyrics || "AI Synesthesia"} value={showLyrics} onChange={() => setShowLyrics(!showLyrics)} activeColor="green" hintText={`${hints?.lyrics || "Enable AI Lyrics"} [L]`} />
                 {isAdvanced && (
                     <div className="px-1 pb-1 animate-fade-in-up">
                        <CustomSelect 
                            label={t?.region || "Region"} 
                            value={settings.region || 'global'} 
                            hintText={hints?.region} 
                            options={Object.keys(REGION_NAMES).map(r => ({ value: r, label: regions[r] || r }))} 
                            onChange={(val) => setSettings({...settings, region: val as Region})} 
                        />
                     </div>
                 )}
             </div>

             {sourceType === 'FILE' && fileStatus === 'ready' && (
                 <div className="p-3 bg-gradient-to-br from-purple-900/30 to-blue-900/30 rounded-xl border border-white/10 animate-fade-in-up">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-[10px] font-black uppercase tracking-widest text-blue-200">{audioPanel.aiDirector || "AI Auto-Director"}</span>
                        <div className="px-1.5 py-0.5 bg-blue-500/20 rounded text-[9px] font-bold text-blue-300 border border-blue-500/30">GENERATE</div>
                    </div>
                    <button 
                        onClick={handleAiDirector}
                        disabled={isAnalyzing}
                        className={`w-full py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${isAnalyzing ? 'bg-white/10 text-white/50 cursor-wait' : 'bg-white text-black hover:scale-[1.02] shadow-lg shadow-white/10'}`}
                    >
                        {isAnalyzing ? (
                            <>
                                <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                <span>{audioPanel.analyzing || "Analyzing..."}</span>
                            </>
                        ) : (
                            <>
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" /></svg>
                                <span>{audioPanel.analyze || "Create Visuals"}</span>
                            </>
                        )}
                    </button>
                 </div>
             )}
          </div>
      </BentoCard>
    </div>
  );
};
