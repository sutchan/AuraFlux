/**
 * File: components/controls/panels/AudioSettingsPanel.tsx
 * Version: 2.2.0
 * Author: Aura Vision Team
 * Copyright (c) 2024 Aura Vision. All rights reserved.
 * Updated: 2025-03-11 10:00
 */

import React, { useRef, useState } from 'react';
import { Slider } from '../../ui/controls/Slider';
import { CustomSelect } from '../../ui/controls/CustomSelect';
import { SegmentedControl } from '../../ui/controls/SegmentedControl';
import { BentoCard } from '../../ui/layout/BentoCard';
import { useVisuals, useAudioContext, useUI, useAI } from '../../AppContext';
import { TooltipArea } from '../../ui/controls/Tooltip';
import { generateVisualConfigFromAudio } from '../../../core/services/aiService';
import { VisualizerMode } from '../../../core/types';

export const AudioSettingsPanel: React.FC = () => {
  const { settings, setSettings, resetAudioSettings, setActivePreset, setMode, setColorTheme } = useVisuals();
  const { 
      audioDevices, selectedDeviceId, onDeviceChange, toggleMicrophone, isListening, isPending,
      sourceType, setSourceType, loadFile, fileStatus, fileName, getAudioSlice
  } = useAudioContext();
  const { apiKeys } = useAI();
  const { t, showToast, language } = useUI();
  
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const hints = t?.hints || {};
  const audioPanel = t?.audioPanel || {};
  const toasts = t?.toasts || {};
  const isAdvanced = settings.uiMode === 'advanced';

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

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
          loadFile(file);
      }
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
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 h-full">
      {/* Card 1: Input Source */}
      <BentoCard title={t?.audioInput || "Input Source"}>
         <div className="space-y-4">
             <SegmentedControl
                value={sourceType}
                onChange={(val) => setSourceType(val)}
                options={[
                    { value: 'MICROPHONE', label: audioPanel.mic || "MIC" },
                    { value: 'FILE', label: audioPanel.file || "FILE" }
                ]}
             />

             {sourceType === 'MICROPHONE' ? (
                 <div className="space-y-3 animate-fade-in-up">
                    <CustomSelect 
                        label={t?.audioInput || "Device"}
                        value={selectedDeviceId}
                        options={deviceOptions}
                        onChange={onDeviceChange}
                        hintText={hints?.device}
                    />
                    <TooltipArea text={`${isListening ? t?.stopMic : t?.startMic} [Space]`}>
                        <button 
                            onClick={() => toggleMicrophone(selectedDeviceId)} 
                            disabled={isPending}
                            className={`w-full py-3 rounded-xl font-bold text-sm uppercase tracking-wider transition-all duration-300 shadow-lg ${isListening ? 'bg-red-500/15 text-red-400 border border-red-500/30 hover:bg-red-500/25' : 'bg-blue-600 text-white hover:bg-blue-500'} ${isPending ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            {isPending ? '...' : (isListening ? (t?.stopMic || "Stop") : (t?.startMic || "Start"))}
                        </button>
                    </TooltipArea>
                 </div>
             ) : (
                 <div className="space-y-3 animate-fade-in-up">
                     <input 
                        type="file" 
                        accept="audio/*" 
                        ref={fileInputRef} 
                        className="hidden" 
                        onChange={handleFileUpload}
                     />
                     <button 
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full py-4 border-2 border-dashed border-white/20 rounded-xl flex flex-col items-center justify-center gap-2 hover:border-blue-500/50 hover:bg-blue-500/10 transition-all text-white/50 hover:text-blue-300"
                     >
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
                         <span className="text-[10px] font-bold uppercase tracking-widest">{audioPanel.upload || "Click to Upload"}</span>
                     </button>
                     {fileName && (
                         <div className="bg-white/5 p-2 rounded-lg border border-white/10 flex items-center gap-2">
                             <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                             <span className="text-xs text-white truncate flex-1">{fileName}</span>
                         </div>
                     )}
                 </div>
             )}
         </div>
      </BentoCard>

      {/* Card 2: Analysis */}
      <BentoCard title="Signal Analysis">
        <div className="space-y-6">
          <Slider label={t?.sensitivity || "Sensitivity"} hintText={hints?.sensitivity} value={settings.sensitivity} min={0.5} max={4.0} step={0.1} onChange={(v: number) => handleAudioSettingChange('sensitivity', v)} />
          
          {isAdvanced && (
              <div className="space-y-6 animate-fade-in-up">
                  <Slider label={t?.smoothing || "Smoothing"} hintText={hints?.smoothing} value={settings.smoothing} min={0} max={0.95} step={0.01} onChange={(v: number) => handleAudioSettingChange('smoothing', v)} />
                  
                  <SegmentedControl
                        label={t?.fftSize || "FFT Resolution"}
                        value={settings.fftSize}
                        options={fftOptions}
                        onChange={(val) => handleAudioSettingChange('fftSize', val)}
                        hintText={hints?.fftSize}
                    />
              </div>
          )}
        </div>
      </BentoCard>

      {/* Card 3: Actions & AI Director */}
      <BentoCard 
        title="Actions" 
        className="flex flex-col"
        action={
            <TooltipArea text={hints?.resetAudio}>
              <button onClick={resetAudioSettings} className="p-1 text-white/30 hover:text-white transition-colors">
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
              </button>
            </TooltipArea>
        }
      >
          <div className="flex-grow space-y-3">
             {sourceType === 'FILE' && fileStatus === 'ready' ? (
                 <div className="p-4 bg-gradient-to-br from-purple-900/30 to-blue-900/30 rounded-xl border border-white/10 animate-fade-in-up">
                    <div className="flex justify-between items-center mb-3">
                        <span className="text-[10px] font-black uppercase tracking-widest text-blue-200">{audioPanel.aiDirector || "AI Auto-Director"}</span>
                        <div className="px-1.5 py-0.5 bg-blue-500/20 rounded text-[9px] font-bold text-blue-300 border border-blue-500/30">{t?.common?.new || "NEW"}</div>
                    </div>
                    <button 
                        onClick={handleAiDirector}
                        disabled={isAnalyzing}
                        className={`w-full py-3 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${isAnalyzing ? 'bg-white/10 text-white/50 cursor-wait' : 'bg-white text-black hover:scale-[1.02] shadow-lg shadow-white/10'}`}
                    >
                        {isAnalyzing ? (
                            <>
                                <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                <span>{audioPanel.analyzing || "Analyzing..."}</span>
                            </>
                        ) : (
                            <>
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" /></svg>
                                <span>{audioPanel.analyze || "Generate Visuals"}</span>
                            </>
                        )}
                    </button>
                 </div>
             ) : (
                 <div className="p-4 bg-white/5 rounded-xl border border-white/5 h-full flex items-center justify-center text-center">
                    <span className="text-xs font-bold text-white/40 uppercase tracking-widest leading-relaxed">
                       {t?.audioPanel?.info || "Adjust input sensitivity and smoothing to customize visual reaction."}
                    </span>
                 </div>
             )}
          </div>
      </BentoCard>
    </div>
  );
};
