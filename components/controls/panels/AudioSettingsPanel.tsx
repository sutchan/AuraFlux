/**
 * File: components/controls/panels/AudioSettingsPanel.tsx
 * Version: 1.1.4
 * Author: Aura Vision Team
 * Copyright (c) 2024 Aura Vision. All rights reserved.
 * Updated: 2025-03-05 12:00
 * Description: Replaced SteppedSlider with Slider for continuous values to fix visual bugs.
 */

import React from 'react';
import { SteppedSlider } from '../../ui/controls/SteppedSlider';
import { Slider } from '../../ui/controls/Slider';
import { CustomSelect } from '../../ui/controls/CustomSelect';
import { useVisuals, useAudioContext, useUI } from '../../AppContext';
import { TooltipArea } from '../../ui/controls/Tooltip';

export const AudioSettingsPanel: React.FC = () => {
  const { settings, setSettings, resetAudioSettings, setActivePreset } = useVisuals();
  const { audioDevices, selectedDeviceId, onDeviceChange, toggleMicrophone, isListening, isPending } = useAudioContext();
  const { t } = useUI();
  
  const hints = t?.hints || {};
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

  return (
    <>
      {/* Col 1: Device Management */}
      <div className="p-3 pt-4 h-full flex flex-col space-y-3 border-b lg:border-b-0 lg:border-e border-white/5">
         <CustomSelect 
            label={t?.audioInput || "Input Device"}
            value={selectedDeviceId}
            options={deviceOptions}
            onChange={onDeviceChange}
            hintText={hints?.device}
         />
        <TooltipArea text={`${isListening ? t?.stopMic : t?.startMic} [Space]`}>
          <button 
              onClick={() => toggleMicrophone(selectedDeviceId)} 
              disabled={isPending}
              className={`w-full py-3 rounded-lg font-bold text-sm uppercase tracking-wider transition-all duration-300 ${isListening ? 'bg-red-500/15 text-red-400 border border-red-500/30' : 'bg-blue-600 text-white hover:bg-blue-500'} ${isPending ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {isPending ? '...' : (isListening ? (t?.stopMic || "Stop") : (t?.startMic || "Start"))}
          </button>
        </TooltipArea>
      </div>

      {/* Col 2: Core Processing Parameters */}
      <div className="p-3 pt-4 h-full flex flex-col border-b lg:border-b-0 lg:border-e border-white/5">
        <div className="space-y-4 flex-grow overflow-y-auto custom-scrollbar pe-1.5">
          <Slider label={t?.sensitivity || "Sensitivity"} hintText={hints?.sensitivity} value={settings.sensitivity} min={0.5} max={4.0} step={0.1} onChange={(v: number) => handleAudioSettingChange('sensitivity', v)} />
          
          {isAdvanced && (
              <div className="space-y-4 animate-fade-in-up">
                  <Slider label={t?.smoothing || "Smoothing"} hintText={hints?.smoothing} value={settings.smoothing} min={0} max={0.95} step={0.01} onChange={(v: number) => handleAudioSettingChange('smoothing', v)} />
                  <div className="pt-3 border-t border-white/5">
                    <SteppedSlider
                        label={t?.fftSize || "Resolution"}
                        hintText={hints?.fftSize || "FFT Size"}
                        options={fftOptions}
                        value={settings.fftSize}
                        min={512}
                        max={4096}
                        step={512}
                        onChange={(val) => handleAudioSettingChange('fftSize', val)}
                    />
                  </div>
              </div>
          )}
        </div>
      </div>

      {/* Col 3: Actions & Advanced Info */}
      <div className="p-3 pt-4 h-full flex flex-col">
          <div className="flex-grow">
             <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                <span className="text-xs font-bold text-white/40 uppercase tracking-widest leading-relaxed block">
                   {t?.audioPanel?.info || "Adjust input sensitivity and smoothing to customize visual reaction."}
                </span>
             </div>
          </div>
          <div className="mt-auto pt-3">
            <TooltipArea text={hints?.resetAudio}>
              <button onClick={resetAudioSettings} className="w-full py-2 bg-white/[0.04] rounded-lg text-xs font-bold uppercase tracking-wider text-white/50 hover:text-white flex items-center justify-center gap-1.5 border border-transparent hover:border-white/10 transition-colors">
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 opacity-60" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                 {t?.resetAudio || "Reset Audio"}
              </button>
            </TooltipArea>
          </div>
      </div>
    </>
  );
};