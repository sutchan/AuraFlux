/**
 * File: components/controls/panels/AudioSettingsPanel.tsx
 * Version: 2.0.5
 * Author: Sut
 * Updated: 2025-07-16 16:30
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
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 lg:items-start">
      <BentoCard title={t?.audioPanel?.audioInput || "Signal Input"} className="py-2.5">
         <div className="space-y-3">
            <CustomSelect label={t?.audioPanel?.mic} value={selectedDeviceId} options={deviceOptions} onChange={onDeviceChange} />
            {sourceType === 'FILE' && (
                <div className="px-3 py-1.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-[10px] flex items-center justify-between font-black uppercase tracking-widest">
                    <span className="truncate max-w-[120px] text-blue-300">{fileName || "Local Stream"}</span>
                    <span className="text-blue-400/50">{t?.audioPanel?.fileActive || "ACTIVE"}</span>
                </div>
            )}
            <button onClick={() => toggleMicrophone(selectedDeviceId)} disabled={isPending}
                className={`w-full py-2.5 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] transition-all shadow-lg ${isListening ? 'bg-red-500/10 text-red-500 border border-red-500/20' : 'bg-blue-600 text-white hover:scale-[1.01]'}`}>
                {isPending ? '...' : (isListening ? (t?.audioPanel?.stop || "STOP") : (t?.audioPanel?.start || "START"))}
            </button>
            <div className="pt-2 border-t border-white/5 space-y-3">
                <Slider label={t?.sensitivity || "Sensitivity"} value={settings.sensitivity} min={0.5} max={4.0} step={0.1} onChange={(v)=>handleAudioSettingChange('sensitivity', v)} />
                {isAdvanced && (
                    <div className="grid grid-cols-2 gap-4 animate-fade-in-up pt-1">
                        <Slider label={t?.smoothing || "Decay"} value={settings.smoothing} min={0} max={0.95} step={0.01} onChange={(v)=>handleAudioSettingChange('smoothing', v)} />
                        <CustomSelect label={t?.fftSize || "FFT"} value={settings.fftSize} options={[{value:512,label:'512'},{value:1024,label:'1024'},{value:2048,label:'2048'}]} onChange={(v)=>handleAudioSettingChange('fftSize', v)} />
                    </div>
                )}
            </div>
         </div>
      </BentoCard>

      <BentoCard 
        title={t?.audioPanel?.analysisAi || "Intelligence"}
        className="py-2.5"
        action={
            <TooltipArea text={t?.hints?.resetAudio}>
              <button onClick={resetAudioSettings} className="p-1 text-white/30 hover:text-white transition-colors">
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
              </button>
            </TooltipArea>
        }
      >
        <div className="space-y-3">
            <div className="bg-white/[0.03] p-2.5 rounded-2xl border border-white/5 space-y-2">
                <SettingsToggle label={t?.audioPanel?.enableAi || "Live AI Analysis"} value={enableAnalysis} onChange={()=>setEnableAnalysis(!enableAnalysis)} activeColor="green" />
                {enableAnalysis && isAdvanced && (
                    <div className="animate-fade-in-up pt-1">
                        <CustomSelect label={t?.region} value={settings.region || 'global'} options={Object.keys(REGION_NAMES).map(r=>({value:r,label:t?.regions?.[r]||r}))} onChange={(v)=>setSettings({...settings,region:v as Region})} />
                    </div>
                )}
            </div>
            
            {enableAnalysis && (
              <div className="bg-blue-600/5 p-2.5 rounded-2xl border border-blue-500/10 space-y-3 animate-fade-in-up">
                  <CustomSelect 
                      label={t?.recognitionSource || "AI Provider"} 
                      value={currentProvider} 
                      options={Object.keys(t?.aiProviders || {}).map(p => ({ value: p, label: t?.aiProviders?.[p] }))} 
                      onChange={(v) => handleAudioSettingChange('recognitionProvider', v as AIProvider)}
                  />
                  {!isMock && (
                      <div className="pt-2 border-t border-blue-500/10 space-y-2">
                          <div className="flex justify-between items-center px-1"><span className="text-[9px] font-black text-blue-300 uppercase tracking-widest">{t?.audioPanel?.apiKey}</span>{hasKey && <span className="text-[8px] font-black text-green-400 bg-green-400/10 px-1.5 py-0.5 rounded">{t?.audioPanel?.saved || "READY"}</span>}</div>
                          <div className="flex gap-2">
                              <div className="relative flex-1">
                                  <input type={showKey?"text":"password"} value={inputKey} onChange={(e)=>setInputKey(e.target.value)} placeholder={t?.audioPanel?.apiKeyPlaceholder || "Gemini Key..."} className="w-full bg-black/60 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white placeholder-white/20 focus:border-blue-500 font-mono outline-none" />
                                  <button onClick={()=>setShowKey(!showKey)} className="absolute right-2 top-1/2 -translate-y-1/2 opacity-30 hover:opacity-100 transition-opacity"><svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/><path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd"/></svg></button>
                              </div>
                              <button onClick={handleSaveKey} disabled={isValidating} className={`px-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${hasKey?'bg-white/5 text-white':'bg-blue-600 text-white'}`}>{isValidating ? '...' : (hasKey ? (t?.audioPanel?.update || 'UPD') : (t?.audioPanel?.save || 'SAVE'))}</button>
                          </div>
                      </div>
                  )}
              </div>
            )}

            {sourceType === 'FILE' && fileStatus === 'ready' && (
                <button onClick={handleAiDirector} disabled={isAnalyzing} className={`w-full py-2.5 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-2 border border-white/10 transition-all ${isAnalyzing ? 'bg-white/5 text-white/40' : 'bg-white text-black hover:scale-[1.01]'}`}>
                    <svg className={`h-3 w-3 ${isAnalyzing ? 'animate-spin' : ''}`} fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd"/></svg>
                    {isAnalyzing ? t?.audioPanel?.analyzing : t?.audioPanel?.aiDirector}
                </button>
            )}
        </div>
      </BentoCard>
    </div>
  );
};