/**
 * File: components/controls/panels/StudioPanel.tsx
 * Version: 4.0.0
 * Author: Aura Vision Team
 * Copyright (c) 2025 Aura Vision. All rights reserved.
 * Updated: 2025-03-11 10:00
 */

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useUI, useAudioContext, useVisuals, useAI } from '../../AppContext';
import { useVideoRecorder, RecorderConfig } from '../../../core/hooks/useVideoRecorder';
import { CustomSelect } from '../../ui/controls/CustomSelect';
import { Slider } from '../../ui/controls/Slider';
import { SegmentedControl } from '../../ui/controls/SegmentedControl';
import { BentoCard } from '../../ui/layout/BentoCard';
import { TooltipArea } from '../../ui/controls/Tooltip';
import { getAverage } from '../../../core/services/audioUtils';
import { generateVisualConfigFromAudio } from '../../../core/services/aiService';
import { VisualizerMode } from '../../../core/types';
import { getPositionOptions } from '../../../core/constants';

// Helper to format bytes
const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 MB';
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(1)} MB`;
};

// Helper to format time MM:SS
const formatDuration = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
};

export const StudioPanel: React.FC = () => {
  const { t, showToast, language } = useUI();
  
  const { 
      audioContext, analyser, mediaStream, sourceType, 
      isPlaying, currentSong, importFiles, getAudioSlice,
      duration: fileDuration
  } = useAudioContext();
  
  const { settings, setSettings, mode, setMode, setColorTheme, setActivePreset } = useVisuals();
  const { apiKeys } = useAI();
  
  const [resolution, setResolution] = useState<number | 'native'>('native');
  const [aspectRatio, setAspectRatio] = useState<number | 'native'>('native');
  const [fps, setFps] = useState(30);
  const [bitrate, setBitrate] = useState(8000000);
  const [mimeType, setMimeType] = useState('video/webm; codecs=vp9');
  
  const [recGain, setRecGain] = useState(1.0);
  const [fadeDuration, setFadeDuration] = useState(0);

  const [syncStart, setSyncStart] = useState(false);
  const [enableCountdown, setEnableCountdown] = useState(false);
  const [durationPreset, setDurationPreset] = useState(0); 
  
  const [isArmed, setIsArmed] = useState(false);
  const [countdownVal, setCountdownVal] = useState(0);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  const armCheckInterval = useRef<number | null>(null);

  const { isRecording, isProcessing, isFadingOut, recordedBlob, duration: recordingDuration, size, startRecording, stopRecording, discardRecording, getSupportedMimeTypes } = useVideoRecorder({
      audioContext, analyser, mediaStream, showToast, sourceType, t
  });

  const studio = t?.studioPanel || {};
  const audioPanel = t?.audioPanel || {};
  const settingsLabels = studio.settings || {};
  const hints = studio.hints || {};

  const supportedTypes = useMemo(() => {
      const types = getSupportedMimeTypes();
      if (types.length > 0 && !types.includes(mimeType)) {
          setMimeType(types[0]);
      }
      return types;
  }, []); 

  const previewUrl = useMemo(() => {
      return recordedBlob ? URL.createObjectURL(recordedBlob) : null;
  }, [recordedBlob]);

  useEffect(() => {
      return () => {
          if (previewUrl) URL.revokeObjectURL(previewUrl);
      };
  }, [previewUrl]);

  useEffect(() => {
      if (isRecording || !isArmed) {
          if (armCheckInterval.current) {
              clearInterval(armCheckInterval.current);
              armCheckInterval.current = null;
          }
      }
  }, [isRecording, isArmed]);

  const triggerRecording = () => {
      setIsArmed(false);
      const doStart = () => {
          const config: RecorderConfig = {
              resolution, aspectRatio, fps, bitrate, mimeType,
              duration: durationPreset, recGain, fadeDuration
          };
          startRecording(config);
      };

      if (enableCountdown) {
          let count = 3;
          setCountdownVal(count);
          const timer = setInterval(() => {
              count--;
              if (count > 0) {
                  setCountdownVal(count);
              } else {
                  clearInterval(timer);
                  setCountdownVal(0);
                  doStart();
              }
          }, 1000);
      } else {
          doStart();
      }
  };

  const handleStartClick = () => {
      if (syncStart) {
          setIsArmed(true);
          if (sourceType === 'MICROPHONE') {
              armCheckInterval.current = window.setInterval(() => {
                  if (analyser) {
                      const data = new Uint8Array(analyser.frequencyBinCount);
                      analyser.getByteFrequencyData(data);
                      const vol = getAverage(data, 0, 10) / 255;
                      if (vol > 0.1) triggerRecording();
                  }
              }, 50);
          }
      } else {
          triggerRecording();
      }
  };

  useEffect(() => {
      if (isArmed && sourceType === 'FILE' && isPlaying) {
          triggerRecording();
      }
  }, [isArmed, sourceType, isPlaying]);

  const getFormatLabel = (mime: string) => {
      const formats = t?.studioPanel?.formats || {};
      if (mime.includes('vp9')) return formats.vp9 || 'WebM (VP9)';
      if (mime.includes('vp8')) return formats.vp8 || 'WebM (VP8)';
      if (mime.includes('avc1')) return formats.mp4_h264 || 'MP4 (Social)';
      if (mime.includes('mp4')) return formats.mp4_generic || 'MP4';
      return mime.split('/')[1].toUpperCase();
  };

  const cancelArming = () => {
      setIsArmed(false);
      if (armCheckInterval.current) clearInterval(armCheckInterval.current);
  };

  const handleAiDirector = async () => {
      const apiKey = apiKeys['GEMINI'] || process.env.API_KEY;
      if (!apiKey) {
          showToast(t?.toasts?.aiDirectorReq || 'Gemini API Key required.', 'error');
          return;
      }
      setIsAnalyzing(true);
      try {
          const wavBlob = await getAudioSlice(15);
          if (!wavBlob) throw new Error("Failed capture.");
          const reader = new FileReader();
          reader.readAsDataURL(wavBlob);
          reader.onloadend = async () => {
              const base64Audio = (reader.result as string).split(',')[1];
              const config = await generateVisualConfigFromAudio(base64Audio, apiKey, language);
              if (config) {
                  if (config.mode) setMode(config.mode as VisualizerMode);
                  if (config.colors) setColorTheme(config.colors);
                  setSettings(prev => ({ ...prev, speed: config.speed || prev.speed, sensitivity: config.sensitivity || prev.sensitivity, glow: config.glow ?? prev.glow }));
                  showToast(`AI: ${config.explanation}`, 'success');
              }
              setIsAnalyzing(false);
          };
      } catch (e) {
          showToast(t?.toasts?.aiFail || 'Analysis Failed.', 'error');
          setIsAnalyzing(false);
      }
  };

  const handleSaveVideo = () => {
      if (!recordedBlob) return;
      const url = URL.createObjectURL(recordedBlob);
      const a = document.createElement('a');
      a.href = url;
      let ext = mimeType.includes('mp4') ? 'mp4' : 'webm';
      let filename = `AuraFlux_${new Date().toISOString().slice(0,19).replace(/[:T]/g, '-')}`;
      
      if (currentSong && currentSong.title) {
          const artist = currentSong.artist !== "System Alert" ? currentSong.artist : "Unknown";
          const safeTitle = currentSong.title.replace(/[<>:"/\\|?*]/g, '_').trim().slice(0, 50);
          const safeArtist = artist.replace(/[<>:"/\\|?*]/g, '_').trim().slice(0, 30);
          
          if (safeTitle) {
              filename = `${safeArtist} - ${safeTitle} [${mode}]`;
          }
      } else {
          filename += `_[${mode}]`;
      }
      a.download = `${filename}.${ext}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      discardRecording();
      showToast(t?.config?.copied || "Saved!", 'success');
  };

  const handleShareVideo = async () => {
      if (!recordedBlob || !navigator.canShare) { showToast(t?.toasts?.shareFail || "Sharing not supported.", 'info'); return; }
      try {
          await navigator.share({ files: [new File([recordedBlob], 'aura_flux.mp4', { type: mimeType })], title: 'Aura Flux', text: 'Generative Art' });
      } catch (e) {}
  };

  const isCountingDown = countdownVal > 0;

  if (recordedBlob && previewUrl) {
      return createPortal(
          <div className="fixed inset-0 z-[200] bg-black/90 backdrop-blur-xl flex flex-col items-center justify-center p-6 animate-fade-in-up">
              <div className="w-full max-w-2xl bg-[#0a0a0c] border border-white/10 rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
                  <div className="p-4 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-white uppercase tracking-widest">{studio.previewTitle}</span>
                        <span className="text-[10px] text-white/30 uppercase tracking-wider border border-white/10 px-1.5 rounded">{getFormatLabel(recordedBlob.type || mimeType)}</span>
                      </div>
                      <div className="px-2 py-0.5 bg-blue-900/30 text-blue-300 text-[10px] font-mono rounded border border-blue-500/20">{formatSize(recordedBlob.size)} • {formatDuration(recordingDuration)}</div>
                  </div>
                  <div className="flex-1 bg-black relative flex items-center justify-center overflow-hidden min-h-[300px]">
                      <video src={previewUrl} autoPlay loop controls className="w-full h-full object-contain max-h-[60vh]" />
                  </div>
                  <div className="p-4 flex flex-col sm:flex-row gap-3 bg-white/[0.02]">
                      <button onClick={discardRecording} className="flex-1 py-3 rounded-xl border border-white/10 text-white/60 hover:text-red-300 hover:border-red-500/30 font-bold text-xs uppercase tracking-wider transition-colors hover:bg-white/5">{studio.discard}</button>
                      <button onClick={handleShareVideo} className="flex-1 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white border border-white/5 font-bold text-xs uppercase tracking-wider transition-colors">{studio.share}</button>
                      <button onClick={handleSaveVideo} className="flex-[2] py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-blue-900/20 transition-colors flex items-center justify-center gap-2">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                          {studio.save}
                      </button>
                  </div>
              </div>
          </div>, document.body
      );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 h-full relative">
        {isCountingDown && <div className="absolute inset-0 z-20 bg-black/80 flex items-center justify-center backdrop-blur-sm rounded-2xl"><span className="text-6xl font-black text-white animate-ping">{countdownVal}</span></div>}
        
        {/* Card 1: Output Config */}
        <BentoCard title="Video Configuration">
            <div className="space-y-4">
                <div className="grid grid-cols-2 gap-2">
                    <CustomSelect label={settingsLabels.resolution} value={resolution} onChange={(val) => setResolution(val === 'native' ? 'native' : Number(val))} 
                        options={[{ value: 'native', label: settingsLabels.resNative }, { value: 720, label: 'HD (720p)' }, { value: 1080, label: 'FHD (1080p)' }, { value: 2160, label: '4K (2160p)' }]} />
                    <CustomSelect label={settingsLabels.fps} value={fps} onChange={(val) => setFps(Number(val))} options={[{ value: 30, label: '30 FPS' }, { value: 60, label: '60 FPS' }]} />
                </div>
                <div className="grid grid-cols-1 gap-2">
                    <CustomSelect 
                        label={settingsLabels.codec || "Format"} 
                        value={mimeType} 
                        onChange={(val) => setMimeType(val as string)} 
                        options={supportedTypes.map(t => ({ value: t, label: getFormatLabel(t) }))} 
                    />
                </div>
                <div className="pt-2">
                    <SegmentedControl 
                        label={settingsLabels.bitrate} 
                        value={bitrate} 
                        onChange={(val) => setBitrate(Number(val))} 
                        options={[{ value: 4000000, label: "4 Mb" }, { value: 8000000, label: "8 Mb" }, { value: 12000000, label: "12 Mb" }, { value: 25000000, label: "25 Mb" }]} 
                    />
                </div>
            </div>
        </BentoCard>

        {/* Card 2: Audio & Automation */}
        <BentoCard title="Audio & Mix">
            <div className="space-y-4">
                <Slider label={settingsLabels.recGain} value={recGain} min={0} max={2} step={0.1} onChange={setRecGain} hintText={hints.recGain} />
                
                <SegmentedControl 
                    label={settingsLabels.fade} 
                    value={fadeDuration} 
                    onChange={(val) => setFadeDuration(Number(val))} 
                    options={[{ value: 0, label: settingsLabels.fadeOff }, { value: 1, label: "1s" }, { value: 2, label: "2s" }]} 
                    hintText={hints.fade} 
                />

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/5">
                    <TooltipArea text={hints.syncStart}>
                        <button 
                            onClick={() => setSyncStart(!syncStart)} 
                            className={`w-full py-2.5 rounded-lg border text-[9px] font-bold uppercase tracking-wider flex flex-col items-center justify-center gap-1 transition-all ${syncStart ? 'bg-green-500/10 border-green-500/30 text-green-400' : 'bg-white/5 border-white/5 text-white/40 hover:text-white'}`}
                        >
                            <div className={`w-1.5 h-1.5 rounded-full ${syncStart ? 'bg-green-400 animate-pulse shadow-[0_0_8px_rgba(74,222,128,0.6)]' : 'bg-current opacity-50'}`} />
                            {settingsLabels.syncStart || "Auto-Start"}
                        </button>
                    </TooltipArea>
                    
                    <TooltipArea text={hints.countdown}>
                        <button 
                            onClick={() => setEnableCountdown(!enableCountdown)} 
                            className={`w-full py-2.5 rounded-lg border text-[9px] font-bold uppercase tracking-wider flex flex-col items-center justify-center gap-1 transition-all ${enableCountdown ? 'bg-blue-500/10 border-blue-500/30 text-blue-400' : 'bg-white/5 border-white/5 text-white/40 hover:text-white'}`}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            {settingsLabels.countdown || "Timer"}
                        </button>
                    </TooltipArea>
                </div>
            </div>
        </BentoCard>

        {/* Card 3: Recorder Action */}
        <BentoCard className="flex flex-col items-center justify-center bg-gradient-to-br from-white/[0.02] to-white/[0.05]">
            <div className="flex flex-col items-center gap-4 w-full">
                <div className="relative z-10 group">
                    {isRecording && <div className="absolute inset-0 rounded-full border-4 border-red-500/30 animate-ping pointer-events-none"></div>}
                    {isArmed ? (
                        <button onClick={cancelArming} className="w-16 h-16 rounded-full flex flex-col items-center justify-center border-4 border-yellow-500 text-yellow-500 bg-yellow-900/20 animate-pulse hover:bg-yellow-900/40 transition-all">
                            <span className="text-[10px] font-bold uppercase">{studio.cancel}</span>
                        </button>
                    ) : (
                        <button onClick={isRecording ? stopRecording : handleStartClick} disabled={isProcessing || isCountingDown || isFadingOut} className={`w-16 h-16 rounded-full flex items-center justify-center border-4 transition-all duration-300 shadow-2xl ${isRecording ? 'bg-red-900/10 border-red-500/50 scale-95' : 'bg-white/5 border-white/20 hover:border-white/40 hover:bg-white/10 hover:scale-105'} ${isProcessing ? 'opacity-50 cursor-wait' : ''}`}>
                        {isProcessing ? <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"/> : <div className={`transition-all duration-300 ${isRecording ? 'w-5 h-5 bg-red-500 rounded-sm shadow-[0_0_12px_rgba(239,68,68,0.5)]' : 'w-8 h-8 bg-red-600 rounded-full shadow-[inset_0_2px_4px_rgba(255,255,255,0.3),0_4px_8px_rgba(0,0,0,0.3)] group-hover:scale-90 group-hover:bg-red-500'}`} />}
                        </button>
                    )}
                </div>
                
                <div className="w-full text-center space-y-1">
                    {isRecording ? (
                        <div className="flex flex-col items-center animate-pulse"><span className="text-2xl font-black text-red-400 font-mono tracking-tight">{formatDuration(recordingDuration)}</span><span className="text-[10px] font-bold text-red-400/60 uppercase">{formatSize(size)}</span></div>
                    ) : (
                        <span className={`text-xs font-black uppercase tracking-widest ${isArmed ? 'text-yellow-400' : 'text-white/40'}`}>{isFadingOut ? studio.stopping : (isProcessing ? studio.processing : (isArmed ? studio.arming : studio.start))}</span>
                    )}
                </div>
            </div>
        </BentoCard>
    </div>
  );
};
