/**
 * File: components/controls/panels/AudioSettingsPanel.tsx
 * Version: 2.1.0
 * Author: Sut
 * Updated: 2025-07-18 22:00
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
  const { apiKeys, setApiKeys, enableAnalysis, setEnableAnalysis } = useAI();
  const { t, showToast, language } = useUI();
  
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [inputKey, setInputKey] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [showKey, setShowKey] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

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
          showToast(t?.audioPanel?.keyCleared || "Key cleared", 'info');
          return;
      }

      setIsValidating(true);
      const isValid = await validateApiKey('GEMINI', inputKey);
      setIsValidating(false);

      if (isValid) {
          setApiKeys(prev => ({ ...prev, [provider]: inputKey }));
          showToast(t?.audioPanel?.keySaved || "Key Verified & Saved", 'success');
      } else {
          showToast(t?.audioPanel?.keyInvalid || "Invalid Gemini API Key", 'error');
          inputRef.current?.select();
      }
  };

  const deviceOptions = [
    { value: '', label: t?.audioPanel?.defaultMic || "Default Microphone" },
    ...audioDevices.map(d => ({ value: d.deviceId, label: d.label }))
  ];

  const handleAudioSettingChange = (key: keyof typeof settings, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    setActivePreset('');
  };

  const handleAiDirector = async () => {
      if (fileStatus !== 'ready') return;
      const apiKey = apiKeys['GEMINI'] || process.env.API_KEY;
      if (!apiKey) { showToast(t?.toasts?.aiDirectorReq || 'Key required', 'error'); return; }
      setIsAnalyzing(true);
      try {
          const wavBlob = await getAudioSlice(15);
          if (!wavBlob) throw new Error("Failed");
          const reader = new FileReader(); reader.readAsDataURL(wavBlob);
          reader.onloadend = async () => {
              const base64Audio = (reader.result as string).split(',')[1];
              const config = await generateVisualConfigFromAudio(base64Audio, apiKey, language);
              if (config) {
                  if (config.mode && Object.values(VisualizerMode).includes(config.mode as VisualizerMode)) setMode(config.mode as VisualizerMode);
                  if (config.colors && config.colors.length === 3) setColorTheme(config.colors);
                  setSettings(p => ({ ...p, speed: config.speed || p.speed, sensitivity: config.sensitivity || p.sensitivity, glow: config.glow ?? p.glow }));
                  showToast(`AI: ${config.explanation}`, 'success');
              }
              setIsAnalyzing(false);
          };
      } catch (e) { setIsAnalyzing(false); }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-stretch">
      {/* Column 1: Signal & Capture (5 cols) */}
      <div className="lg:col-span-5 flex flex-col gap-3">
        <BentoCard 
            title={t?.audioPanel?.audioInput || "Signal Architecture"}
            action={
                <TooltipArea text={t?.hints?.resetAudio}>
                    <button onClick={resetAudioSettings} className="p-1.5 text-black/30 dark:text-white/30 hover:text-blue-500 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                    </button>
                </TooltipArea>
            }
        >
            <div className="space-y-5">
                <div className="space-y-4">
                    <CustomSelect label={t?.audioPanel?.mic} value={selectedDeviceId} options={deviceOptions} onChange={onDeviceChange} />
                    
                    {sourceType === 'FILE' && (
                        <div className="px-4 py-2.5 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-between animate-fade-in-up">
                            <div className="flex flex-col min-w-0">
                                <span className="text-[8px] font-black text-blue-400 uppercase tracking-widest">{t?.audioPanel?.fileActive || "ACTIVE STREAM"}</span>
                                <span className="text-[10px] font-bold text-blue-200 truncate pr-2 uppercase">{fileName || "Local Session"}</span>
                            </div>
                            <div className="shrink-0 w-2 h-2 bg-blue-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(59,130,246,0.8)]" />
                        </div>
                    )}

                    <button 
                        onClick={() => toggleMicrophone(selectedDeviceId)} 
                        disabled={isPending}
                        className={`group relative w-full py-4 rounded-2xl font-black text-xs uppercase tracking-[0.25em] transition-all overflow-hidden shadow-xl ${
                            isListening 
                            ? 'bg-red-500 text-white shadow-red-500/20' 
                            : 'bg-black dark:bg-white text-white dark:text-black hover:scale-[1.02] active:scale-95'
                        }`}
                    >
                        {isPending ? (
                            <div className="flex items-center justify-center gap-2">
                                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                <span>LOADING</span>
                            </div>
                        ) : (
                            <span className="relative z-10">
                                {isListening ? (t?.audioPanel?.stop || "STOP CAPTURE") : (t?.audioPanel?.start || "START CAPTURE")}
                            </span>
                        )}
                        <div className={`absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity ${isListening ? 'hidden' : ''}`} />
                    </button>
                </div>

                <div className="pt-4 border-t border-black/5 dark:border-white/5 grid gap-5">
                    <Slider label={t?.sensitivity || "Gain"} value={settings.sensitivity} min={0.5} max={4.0} step={0.1} onChange={(v)=>handleAudioSettingChange('sensitivity', v)} />
                    {isAdvanced && (
                        <div className="grid grid-cols-2 gap-4 animate-fade-in-up">
                            <Slider label={t?.smoothing || "Inertia"} value={settings.smoothing} min={0} max={0.95} step={0.01} onChange={(v)=>handleAudioSettingChange('smoothing', v)} />
                            <CustomSelect label={t?.fftSize || "FFT Size"} value={settings.fftSize} options={[{value:512,label:'512 (Fast)'},{value:1024,label:'1024 (Balanced)'},{value:2048,label:'2048 (Pro)'}]} onChange={(v)=>handleAudioSettingChange('fftSize', v)} />
                        </div>
                    )}
                </div>
            </div>
        </BentoCard>
      </div>

      {/* Column 2: AI Intelligence & Synergy (7 cols) */}
      <div className="lg:col-span-7 flex flex-col gap-3">
        <BentoCard title={t?.audioPanel?.analysisAi || "Neural Engine"}>
            <div className="space-y-6">
                {/* AI Master Toggle & Region */}
                <div className="flex flex-col sm:flex-row gap-4 sm:items-center justify-between bg-black/[0.04] dark:bg-white/[0.04] p-4 rounded-2xl border border-black/5 dark:border-white/5">
                    <div className="flex-1">
                        <SettingsToggle label={t?.audioPanel?.enableAi || "Live Synergy"} value={enableAnalysis} onChange={()=>setEnableAnalysis(!enableAnalysis)} activeColor="green" variant="clean" />
                    </div>
                    {enableAnalysis && isAdvanced && (
                        <div className="w-full sm:w-48 animate-fade-in-up">
                            <CustomSelect label={t?.region} value={settings.region || 'global'} options={Object.keys(REGION_NAMES).map(r=>({value:r,label:t?.regions?.[r]||r}))} onChange={(v)=>setSettings({...settings,region:v as Region})} />
                        </div>
                    )}
                </div>
                
                {/* AI Provider & API Key Section */}
                {enableAnalysis && (
                  <div className="space-y-5 animate-fade-in-up">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <CustomSelect 
                              label={t?.recognitionSource || "AI Protocol"} 
                              value={currentProvider} 
                              options={Object.keys(t?.aiProviders || {}).map(p => ({ value: p, label: t?.aiProviders?.[p] }))} 
                              onChange={(v) => handleAudioSettingChange('recognitionProvider', v as AIProvider)}
                          />
                          {!isMock && (
                            <div className="flex flex-col justify-end">
                                <div className="flex justify-between items-center mb-1.5 px-1">
                                    <span className="text-[9px] font-black text-black/30 dark:text-white/30 uppercase tracking-widest">{t?.audioPanel?.apiKey}</span>
                                    {hasKey && <span className="text-[8px] font-black text-green-500 bg-green-500/10 px-2 py-0.5 rounded-full border border-green-500/20 uppercase">{t?.audioPanel?.saved || "READY"}</span>}
                                </div>
                                <div className="flex gap-2">
                                    <div className="relative flex-1 group/input">
                                        <input 
                                            ref={inputRef}
                                            type={showKey?"text":"password"} 
                                            value={inputKey} 
                                            onChange={(e)=>setInputKey(e.target.value)} 
                                            placeholder={t?.audioPanel?.apiKeyPlaceholder || "Gemini Key..."} 
                                            className="w-full h-10 bg-black/[0.04] dark:bg-black/60 border border-black/10 dark:border-white/10 rounded-xl px-4 py-2 text-xs text-black dark:text-white placeholder-black/20 dark:placeholder-white/20 focus:border-blue-500/50 font-mono outline-none transition-all group-hover/input:border-black/20 dark:group-hover/input:border-white/20" 
                                        />
                                        <button onClick={()=>setShowKey(!showKey)} className="absolute right-3 top-1/2 -translate-y-1/2 text-black/20 dark:text-white/20 hover:text-blue-500 transition-colors">
                                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/><path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd"/></svg>
                                        </button>
                                    </div>
                                    <button 
                                        onClick={handleSaveKey} 
                                        disabled={isValidating} 
                                        className={`h-10 px-5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                                            hasKey ? 'bg-black/[0.04] dark:bg-white/5 text-black/40 dark:text-white/40 hover:text-black dark:hover:text-white' : 'bg-blue-600 text-white hover:bg-blue-500 shadow-lg shadow-blue-500/20'
                                        }`}
                                    >
                                        {isValidating ? '...' : (hasKey ? (t?.audioPanel?.update || 'UPD') : (t?.audioPanel?.save || 'SAVE'))}
                                    </button>
                                </div>
                            </div>
                          )}
                      </div>

                      {sourceType === 'FILE' && fileStatus === 'ready' && (
                        <div className="pt-4 border-t border-black/5 dark:border-white/5 animate-fade-in-up">
                            <button 
                                onClick={handleAiDirector} 
                                disabled={isAnalyzing} 
                                className={`w-full py-4 rounded-2xl text-xs font-black uppercase tracking-[0.25em] flex items-center justify-center gap-3 border transition-all ${
                                    isAnalyzing 
                                    ? 'bg-black/5 dark:bg-white/5 text-black/20 dark:text-white/20 border-transparent' 
                                    : 'bg-blue-500/5 text-blue-600 dark:text-blue-400 border-blue-500/20 hover:bg-blue-500/10 hover:border-blue-500/40 hover:scale-[1.01]'
                                }`}
                            >
                                <svg className={`h-4 w-4 ${isAnalyzing ? 'animate-spin' : 'animate-pulse'}`} fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd"/></svg>
                                {isAnalyzing ? t?.audioPanel?.analyzing : t?.audioPanel?.aiDirector}
                            </button>
                        </div>
                      )}
                  </div>
                )}
            </div>
        </BentoCard>

        {/* Informational Hint Card */}
        <div className="bg-black/5 dark:bg-white/[0.02] border border-black/5 dark:border-white/5 rounded-2xl p-4 flex gap-4 items-center group transition-colors hover:bg-black/[0.07] dark:hover:bg-white/[0.04]">
            <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500 shrink-0">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
            <div className="flex-1 min-w-0">
                <h4 className="text-[10px] font-black text-black/60 dark:text-white/60 uppercase tracking-widest mb-0.5">{t?.audioPanel?.analysisAi || "通感分析指南"}</h4>
                <p className="text-[10px] text-black/30 dark:text-white/30 leading-relaxed truncate group-hover:whitespace-normal group-hover:break-words transition-all">
                    {t?.helpModal?.howItWorksSteps?.[3] || "Enable AI Synesthesia to analyze the soul of the track and automatically tune visuals."}
                </p>
            </div>
        </div>
      </div>
    </div>
  );
};
