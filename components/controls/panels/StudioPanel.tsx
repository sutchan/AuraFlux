/**
 * File: components/controls/panels/StudioPanel.tsx
 * Version: 2.5.4
 * Author: Aura Vision Team
 * Copyright (c) 2025 Aura Vision. All rights reserved.
 * Updated: 2025-03-06 18:00
 */

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useUI, useAudioContext, useVisuals } from '../../AppContext';
import { useVideoRecorder, RecorderConfig } from '../../../core/hooks/useVideoRecorder';
import { SettingsToggle } from '../../ui/controls/SettingsToggle';
import { CustomSelect } from '../../ui/controls/CustomSelect';
import { Slider } from '../../ui/controls/Slider';
import { getAverage } from '../../../core/services/audioUtils';

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
  const { t, showToast } = useUI();
  const { audioContext, analyser, mediaStream, sourceType, isPlaying, currentSong } = useAudioContext();
  const { mode } = useVisuals();
  
  // Advanced Config State
  const [resolution, setResolution] = useState<number | 'native'>('native');
  const [aspectRatio, setAspectRatio] = useState<number | 'native'>('native');
  const [fps, setFps] = useState(30);
  const [bitrate, setBitrate] = useState(8000000);
  const [mimeType, setMimeType] = useState('video/webm; codecs=vp9');
  
  // Audio Control State
  const [recGain, setRecGain] = useState(1.0);
  const [fadeDuration, setFadeDuration] = useState(0);

  // Automation State
  const [syncStart, setSyncStart] = useState(false);
  const [enableCountdown, setEnableCountdown] = useState(false);
  const [durationPreset, setDurationPreset] = useState(0); 
  
  // Workflow State
  const [isArmed, setIsArmed] = useState(false);
  const [countdownVal, setCountdownVal] = useState(0);
  const armCheckInterval = useRef<number | null>(null);

  const { isRecording, isProcessing, isFadingOut, recordedBlob, duration, size, startRecording, stopRecording, discardRecording, getSupportedMimeTypes } = useVideoRecorder({
      audioContext, analyser, mediaStream, showToast, sourceType
  });

  const studio = t?.studioPanel || {};
  const settingsLabels = studio.settings || {};
  const hints = studio.hints || {};

  const supportedTypes = useMemo(() => {
      const types = getSupportedMimeTypes();
      if (types.length > 0 && !types.includes(mimeType)) {
          setMimeType(types[0]);
      }
      return types;
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

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
              resolution,
              aspectRatio,
              fps,
              bitrate,
              mimeType,
              duration: durationPreset,
              recGain,
              fadeDuration
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
                      if (vol > 0.1) {
                          triggerRecording();
                      }
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
      if (mime.includes('vp9')) return formats.vp9 || 'WebM (VP9) - High Qual';
      if (mime.includes('vp8')) return formats.vp8 || 'WebM (VP8) - Compatible';
      if (mime.includes('avc1')) return formats.mp4_h264 || 'MP4 (H.264) - Social';
      if (mime.includes('mp4')) return formats.mp4_generic || 'MP4 - Generic';
      return mime.split('/')[1].toUpperCase();
  };

  const cancelArming = () => {
      setIsArmed(false);
      if (armCheckInterval.current) clearInterval(armCheckInterval.current);
  };

  const isCountingDown = countdownVal > 0;

  // --- Smart Save Logic ---
  const handleSaveVideo = () => {
      if (!recordedBlob) return;
      
      const url = URL.createObjectURL(recordedBlob);
      const a = document.createElement('a');
      a.href = url;
      
      // Generate Smart Filename
      let ext = 'webm';
      if (mimeType.includes('mp4')) ext = 'mp4';
      
      let filename = `AuraFlux_${new Date().toISOString().slice(0,19).replace(/[:T]/g, '-')}`;
      
      if (currentSong && currentSong.title) {
          const artist = currentSong.artist !== "System Alert" ? currentSong.artist : "Unknown";
          // Sanitize filename
          const safeTitle = currentSong.title.replace(/[^a-z0-9]/gi, '_').slice(0, 30);
          const safeArtist = artist.replace(/[^a-z0-9]/gi, '_').slice(0, 20);
          filename = `${safeArtist} - ${safeTitle} [${mode}]`;
      } else {
          filename += `_[${mode}]`;
      }
      
      a.download = `${filename}.${ext}`;
      
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      discardRecording(); // Close modal after save
      showToast(t?.config?.copied || "Saved!", 'success');
  };

  const handleShareVideo = async () => {
      if (!recordedBlob) return;
      if (navigator.canShare && navigator.canShare({ files: [new File([recordedBlob], 'video.mp4', { type: mimeType })] })) {
          try {
              await navigator.share({
                  files: [new File([recordedBlob], 'aura_flux.mp4', { type: mimeType })],
                  title: 'Aura Flux Visualization',
                  text: 'Check out my generative art video!'
              });
          } catch (e) {
              console.error("Share failed", e);
          }
      } else {
          showToast("Sharing not supported on this device.", 'info');
      }
  };

  // --- Render Preview Modal via Portal ---
  // Using Portal allows the preview to overlay the entire screen, escaping the small panel container.
  if (recordedBlob) {
      return createPortal(
          <div className="fixed inset-0 z-[200] bg-black/90 backdrop-blur-xl flex flex-col items-center justify-center p-6 animate-fade-in-up">
              <div className="w-full max-w-2xl bg-[#0a0a0c] border border-white/10 rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
                  <div className="p-4 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-white uppercase tracking-widest">{studio.previewTitle || "Recording Preview"}</span>
                        <span className="text-[10px] text-white/30 uppercase tracking-wider border border-white/10 px-1.5 rounded">{getFormatLabel(recordedBlob.type || mimeType)}</span>
                      </div>
                      <div className="px-2 py-0.5 bg-blue-900/30 text-blue-300 text-[10px] font-mono rounded border border-blue-500/20">
                          {formatSize(recordedBlob.size)} • {formatDuration(duration)}
                      </div>
                  </div>
                  <div className="flex-1 bg-black relative flex items-center justify-center overflow-hidden min-h-[300px]">
                      <video 
                          src={URL.createObjectURL(recordedBlob)} 
                          autoPlay 
                          loop 
                          controls 
                          className="w-full h-full object-contain max-h-[60vh]"
                      />
                  </div>
                  <div className="p-4 flex flex-col sm:flex-row gap-3 bg-white/[0.02]">
                      <button onClick={discardRecording} className="flex-1 py-3 rounded-xl border border-white/10 text-white/60 hover:text-red-300 hover:border-red-500/30 hover:bg-red-500/5 font-bold text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-2">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                          {studio.discard || "Discard"}
                      </button>
                      <button onClick={handleShareVideo} className="flex-1 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white border border-white/5 font-bold text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-2">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>
                          {studio.share || "Share"}
                      </button>
                      <button onClick={handleSaveVideo} className="flex-[2] py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-blue-900/20 transition-colors flex items-center justify-center gap-2">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                          {studio.save || "Save Video"}
                      </button>
                  </div>
              </div>
          </div>,
          document.body
      );
  }

  return (
    <>
      {/* Col 1: Main Actions */}
      <div className="p-3 pt-4 h-full flex flex-col border-b lg:border-b-0 lg:border-e border-white/5 items-center justify-center relative overflow-hidden">
         {isCountingDown && (
             <div className="absolute inset-0 z-20 bg-black/80 flex items-center justify-center backdrop-blur-sm">
                 <span className="text-6xl font-black text-white animate-ping">{countdownVal}</span>
             </div>
         )}

         <div className="relative z-10">
             {isRecording && (
                 <div className="absolute inset-0 rounded-full border-4 border-red-500/50 animate-ping pointer-events-none"></div>
             )}
             
             {isArmed ? (
                 <button 
                    onClick={cancelArming}
                    className="w-24 h-24 rounded-full flex flex-col items-center justify-center border-4 border-yellow-500 text-yellow-500 bg-yellow-900/20 animate-pulse hover:bg-yellow-900/40 transition-all group"
                 >
                     <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mb-1 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                     </svg>
                     <span className="text-[9px] font-bold uppercase tracking-wider">{studio.cancel}</span>
                 </button>
             ) : (
                 <button 
                    onClick={isRecording ? stopRecording : handleStartClick}
                    disabled={isProcessing || isCountingDown || isFadingOut}
                    className={`w-24 h-24 rounded-full flex items-center justify-center border-4 transition-all duration-300 shadow-2xl ${
                        isRecording 
                        ? 'bg-red-900/20 border-red-500 text-red-500 scale-95' 
                        : 'bg-white/5 border-white/20 text-white hover:bg-red-500/10 hover:border-red-500/50 hover:text-red-400 hover:scale-105'
                    } ${isProcessing || isFadingOut ? 'opacity-50 cursor-wait' : ''}`}
                 >
                    {isProcessing || isFadingOut ? (
                        <svg className="animate-spin h-8 w-8" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                    ) : (
                        <div className={`rounded-sm transition-all duration-300 ${isRecording ? 'w-8 h-8 bg-red-500' : 'w-10 h-10 bg-current rounded-full'}`} />
                    )}
                 </button>
             )}
         </div>
         
         {/* Live Stats or Status Text */}
         {isRecording ? (
             <div className="mt-4 flex flex-col items-center gap-1 animate-pulse">
                 <span className="text-sm font-black text-red-400 font-mono tracking-widest">{formatDuration(duration)}</span>
                 <span className="text-[10px] font-bold text-red-400/60 uppercase tracking-wider">{formatSize(size)}</span>
             </div>
         ) : (
             <span className={`mt-4 text-xs font-black uppercase tracking-widest ${isFadingOut ? 'text-red-400 animate-pulse' : (isArmed ? 'text-yellow-400 animate-pulse' : 'text-white/40')}`}>
                 {isFadingOut ? studio.stopping : (isProcessing ? studio.processing : (isArmed ? studio.arming : studio.start))}
             </span>
         )}
         
         {!isRecording && (
             <div className="mt-3">
                 <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded border ${sourceType === 'FILE' ? 'bg-blue-900/20 text-blue-300 border-blue-500/30' : 'bg-white/5 text-white/40 border-white/10'}`}>
                     {sourceType === 'FILE' ? (studio.sourceInt || "Source: Internal") : (studio.sourceMic || "Source: Mic")}
                 </span>
             </div>
         )}
      </div>

      {/* Col 2: Audio & Automation */}
      <div className="p-3 pt-4 h-full flex flex-col border-b lg:border-b-0 lg:border-e border-white/5">
        <div className="space-y-3 overflow-y-auto custom-scrollbar pr-1.5">
            {/* Audio Control Section */}
            <div className="space-y-3 pb-2 border-b border-white/5">
                <Slider 
                    label={settingsLabels.recGain || "Recording Vol"} 
                    value={recGain} 
                    min={0} max={2} step={0.1} 
                    onChange={setRecGain} 
                    hintText={hints.recGain}
                />
                <CustomSelect
                    label={settingsLabels.fade || "Fade In/Out"}
                    value={fadeDuration}
                    onChange={(val) => setFadeDuration(Number(val))}
                    options={[
                        { value: 0, label: settingsLabels.fadeOff || "None" },
                        { value: 1, label: settingsLabels.fade1s || "1 Second" },
                        { value: 2, label: settingsLabels.fade2s || "2 Seconds" },
                    ]}
                    hintText={hints.fade}
                />
            </div>

            {/* Automation Section */}
            <div className="bg-white/5 p-2 rounded-xl border border-white/5 space-y-2">
                <SettingsToggle 
                    label={settingsLabels.syncStart || "Sync Start"} 
                    value={syncStart} 
                    onChange={() => setSyncStart(!syncStart)} 
                    activeColor="green"
                    variant="clean"
                    hintText={hints.syncStart}
                />
                <SettingsToggle 
                    label={settingsLabels.countdown || "Countdown"} 
                    value={enableCountdown} 
                    onChange={() => setEnableCountdown(!enableCountdown)} 
                    activeColor="blue"
                    variant="clean"
                    hintText={hints.countdown}
                />
                <div className="pt-1">
                    <CustomSelect
                        label={settingsLabels.duration || "Duration"}
                        value={durationPreset}
                        onChange={(val) => setDurationPreset(Number(val))}
                        options={[
                            { value: 0, label: settingsLabels.unlimited || "Unlimited" },
                            { value: 15000, label: settingsLabels.sec15 || "15s (Story)" },
                            { value: 30000, label: settingsLabels.sec30 || "30s" },
                            { value: 60000, label: settingsLabels.sec60 || "60s" },
                        ]}
                        hintText={hints.duration}
                    />
                </div>
            </div>
        </div>
      </div>

      {/* Col 3: Resolution & Size */}
      <div className="p-3 pt-4 h-full flex flex-col">
          <div className="space-y-3 flex-grow">
            
            <CustomSelect
                label={settingsLabels.resolution || "Vertical Res"}
                value={resolution}
                onChange={(val) => setResolution(val === 'native' ? 'native' : Number(val))}
                options={[
                    { value: 'native', label: settingsLabels.resNative || 'Window (Native)' },
                    { value: 720, label: 'HD (720p)' },
                    { value: 1080, label: 'FHD (1080p)' },
                    { value: 2160, label: '4K (2160p)' },
                ]}
            />

            <CustomSelect
                label={settingsLabels.aspectRatio || "Aspect Ratio"}
                value={aspectRatio}
                onChange={(val) => setAspectRatio(val === 'native' ? 'native' : Number(val))}
                options={[
                    { value: 'native', label: settingsLabels.arNative || 'Native' },
                    { value: 1.7778, label: 'Landscape (16:9)' },
                    { value: 0.5625, label: 'Portrait (9:16)' },
                ]}
            />

            <div className="grid grid-cols-2 gap-2">
                <CustomSelect 
                    label={settingsLabels.bitrate || "Bitrate"}
                    value={bitrate}
                    onChange={(val) => setBitrate(Number(val))}
                    options={[
                        { value: 4000000, label: settingsLabels.bpsLow || "Low" },
                        { value: 8000000, label: settingsLabels.bpsStd || "Std" },
                        { value: 12000000, label: settingsLabels.bpsHigh || "High" },
                        { value: 25000000, label: settingsLabels.bpsUltra || "Ultra" },
                    ]}
                />
                <CustomSelect
                    label={settingsLabels.fps || "FPS"}
                    value={fps}
                    onChange={(val) => setFps(Number(val))}
                    options={[
                        { value: 30, label: '30' },
                        { value: 60, label: '60' },
                    ]}
                />
            </div>
            
            <div className="p-3 bg-white/5 rounded-xl border border-white/5 mt-auto">
                <div className="flex justify-between text-[10px] text-white/40 mb-1 font-mono">
                    <span>EST. FILE SIZE (1 min)</span>
                    <span>{Math.round(bitrate / 8 / 1024 / 1024 * 60)} MB</span>
                </div>
                <div className="w-full bg-white/10 h-1 rounded-full overflow-hidden">
                    <div className="bg-red-500 h-full" style={{ width: `${(bitrate / 25000000) * 100}%` }}></div>
                </div>
            </div>
          </div>
      </div>
    </>
  );
};