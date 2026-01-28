/**
 * File: components/controls/panels/StudioPanel.tsx
 * Version: 3.7.2
 * Author: Aura Vision Team
 * Copyright (c) 2025 Aura Vision. All rights reserved.
 * Updated: 2025-03-08 20:00
 * Description: UI Overhaul for better usability. Added Show Lyrics toggle and optimized Sync/Countdown buttons.
 */

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useUI, useAudioContext, useVisuals, useAI } from '../../AppContext';
import { useVideoRecorder, RecorderConfig } from '../../../core/hooks/useVideoRecorder';
import { CustomSelect } from '../../ui/controls/CustomSelect';
import { Slider } from '../../ui/controls/Slider';
import { SteppedSlider } from '../../ui/controls/SteppedSlider';
import { SettingsToggle } from '../../ui/controls/SettingsToggle';
import { TooltipArea } from '../../ui/controls/Tooltip';
import { getAverage } from '../../../core/services/audioUtils';
import { generateVisualConfigFromAudio } from '../../../core/services/aiService';
import { VisualizerMode } from '../../../core/types';

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
  
  // Audio Context
  const { 
      audioContext, analyser, mediaStream, sourceType, setSourceType, 
      isPlaying, currentSong, audioDevices, selectedDeviceId, onDeviceChange, 
      toggleMicrophone, isListening, isPending, importFiles, fileName, getAudioSlice,
      togglePlayback, seekFile, currentTime, duration: fileDuration,
      playNext, playPrev, playlist, currentIndex, playTrackByIndex, removeFromPlaylist
  } = useAudioContext();
  
  // Visuals Context
  const { settings, setSettings, mode, setMode, setColorTheme, setActivePreset } = useVisuals();
  
  // AI Context
  const { apiKeys, showLyrics, setShowLyrics } = useAI();
  
  // Advanced Config State (Video)
  const [resolution, setResolution] = useState<number | 'native'>('native');
  const [aspectRatio, setAspectRatio] = useState<number | 'native'>('native');
  const [fps, setFps] = useState(30);
  const [bitrate, setBitrate] = useState(8000000);
  const [mimeType, setMimeType] = useState('video/webm; codecs=vp9');
  
  // Audio Recorder State
  const [recGain, setRecGain] = useState(1.0);
  const [fadeDuration, setFadeDuration] = useState(0);

  // Automation State
  const [syncStart, setSyncStart] = useState(false);
  const [enableCountdown, setEnableCountdown] = useState(false);
  const [durationPreset, setDurationPreset] = useState(0); 
  
  // Workflow State
  const [isArmed, setIsArmed] = useState(false);
  const [countdownVal, setCountdownVal] = useState(0);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isPlaylistOpen, setIsPlaylistOpen] = useState(false);
  
  const armCheckInterval = useRef<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { isRecording, isProcessing, isFadingOut, recordedBlob, duration: recordingDuration, size, startRecording, stopRecording, discardRecording, getSupportedMimeTypes } = useVideoRecorder({
      audioContext, analyser, mediaStream, showToast, sourceType
  });

  const studio = t?.studioPanel || {};
  const audioPanel = t?.audioPanel || {};
  const settingsLabels = studio.settings || {};
  const hints = studio.hints || {};
  const audioHints = t?.hints || {};
  const isAdvanced = settings.uiMode === 'advanced';

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

  // --- Audio Logic Handlers ---
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
          importFiles(e.target.files);
      }
  };

  const handleAudioSettingChange = (key: keyof typeof settings, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    setActivePreset('');
  };

  // Helper for visual setting changes
  const handleVisualSettingChange = (key: keyof typeof settings, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleAiDirector = async () => {
      const apiKey = apiKeys['GEMINI'] || process.env.API_KEY;
      if (!apiKey) {
          showToast('Gemini API Key required.', 'error');
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
              const config = await generateVisualConfigFromAudio(base64Audio, apiKey);
              if (config) {
                  if (config.mode) setMode(config.mode as VisualizerMode);
                  if (config.colors) setColorTheme(config.colors);
                  setSettings(prev => ({ ...prev, speed: config.speed || prev.speed, sensitivity: config.sensitivity || prev.sensitivity, glow: config.glow ?? prev.glow }));
                  showToast(`AI: ${config.explanation}`, 'success');
              }
              setIsAnalyzing(false);
          };
      } catch (e) {
          showToast('Analysis Failed.', 'error');
          setIsAnalyzing(false);
      }
  };

  // --- Smart Save Logic ---
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
      if (!recordedBlob || !navigator.canShare) { showToast("Sharing not supported.", 'info'); return; }
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
    <>
      {/* Col 1: Source Selection & Player */}
      <div className="p-3 pt-4 h-full flex flex-col border-b lg:border-b-0 lg:border-e border-white/5 overflow-hidden">
         <div className="flex bg-white/5 p-1 rounded-lg mb-4 flex-shrink-0">
             <button onClick={() => setSourceType('MICROPHONE')} className={`flex-1 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 ${sourceType === 'MICROPHONE' ? 'bg-blue-600 text-white shadow-md' : 'text-white/40 hover:text-white'}`}>
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
                 {audioPanel.mic || "MIC"}
             </button>
             <button onClick={() => setSourceType('FILE')} className={`flex-1 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 ${sourceType === 'FILE' ? 'bg-blue-600 text-white shadow-md' : 'text-white/40 hover:text-white'}`}>
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" /></svg>
                 {audioPanel.file || "FILE"}
             </button>
         </div>

         <div className="flex-grow overflow-y-auto custom-scrollbar pr-1.5 space-y-4">
             {sourceType === 'MICROPHONE' ? (
                 <div className="space-y-3 animate-fade-in-up">
                    <CustomSelect label={t?.audioInput} value={selectedDeviceId} options={[{ value: '', label: t?.defaultMic }, ...audioDevices.map(d => ({ value: d.deviceId, label: d.label }))]} onChange={onDeviceChange} />
                    <TooltipArea text={`${isListening ? t?.stopMic : t?.startMic} [Space]`}>
                        <button onClick={() => toggleMicrophone(selectedDeviceId)} disabled={isPending} className={`w-full py-2.5 rounded-lg font-bold text-xs uppercase tracking-wider transition-all ${isListening ? 'bg-red-500/15 text-red-400 border border-red-500/30' : 'bg-blue-600 text-white hover:bg-blue-500'} ${isPending ? 'opacity-50' : ''}`}>
                            {isPending ? '...' : (isListening ? (t?.stopMic || "Stop Input") : (t?.startMic || "Start Input"))}
                        </button>
                    </TooltipArea>
                 </div>
             ) : (
                 <div className="space-y-3 animate-fade-in-up">
                     <input type="file" accept="audio/*" multiple ref={fileInputRef} className="hidden" onChange={handleFileUpload} />
                     <button onClick={() => fileInputRef.current?.click()} className="w-full py-3 border-2 border-dashed border-white/20 rounded-xl flex flex-col items-center justify-center gap-1 hover:border-blue-500/50 hover:bg-blue-500/10 transition-all text-white/50 hover:text-blue-300">
                         <span className="text-[10px] font-bold uppercase tracking-widest">{audioPanel.upload || "Upload Files"}</span>
                     </button>
                     
                     {(fileName || currentSong) && (
                        <div className="bg-white/5 p-3 rounded-lg border border-white/10 space-y-3">
                            <div className="flex items-center gap-3">
                                {currentSong?.albumArtUrl ? (
                                    <img src={currentSong.albumArtUrl} alt="Cover" className="w-8 h-8 rounded object-cover border border-white/10" />
                                ) : (
                                    <div className="w-8 h-8 rounded bg-white/10 flex items-center justify-center border border-white/10">
                                        <svg className="h-4 w-4 text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" /></svg>
                                    </div>
                                )}
                                <div className="flex flex-col min-w-0 flex-1">
                                    <span className="text-[10px] font-bold text-white truncate">{currentSong?.title || fileName}</span>
                                    <span className="text-[9px] text-white/50 truncate">{currentSong?.artist || t?.common?.unknownTrack}</span>
                                </div>
                                <button 
                                    onClick={() => setIsPlaylistOpen(!isPlaylistOpen)}
                                    className={`p-1.5 rounded-lg transition-colors ${isPlaylistOpen ? 'text-white bg-white/10' : 'text-white/40 hover:text-white hover:bg-white/5'}`}
                                    title={t?.common?.queue || "Playlist"}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                    </svg>
                                </button>
                            </div>
                            
                            {isPlaylistOpen && (
                                <div className="bg-black/20 rounded-lg p-1 max-h-[160px] overflow-y-auto custom-scrollbar space-y-0.5 my-2 border border-white/5 animate-fade-in-up">
                                    {playlist.length === 0 ? (
                                        <div className="text-[9px] text-white/30 text-center py-2 uppercase tracking-widest">{t?.common?.empty || "Empty"}</div>
                                    ) : (
                                        playlist.map((track, idx) => (
                                            <div 
                                                key={idx}
                                                onClick={() => playTrackByIndex(idx)}
                                                className={`w-full text-left px-2 py-1.5 rounded flex items-center gap-2 group transition-all cursor-pointer border ${currentIndex === idx ? 'bg-white/10 text-white border-white/5' : 'text-white/60 hover:bg-white/5 hover:text-white border-transparent'}`}
                                            >
                                                <span className="text-[9px] font-mono opacity-50 w-3 shrink-0">{idx+1}</span>
                                                <span className="text-[10px] font-bold truncate flex-1">{track.title}</span>
                                                {currentIndex === idx && isPlaying && <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse shrink-0" />}
                                                
                                                <button 
                                                    onClick={(e) => { e.stopPropagation(); removeFromPlaylist(idx); }}
                                                    className="p-1 rounded hover:bg-white/10 text-white/20 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all ml-1"
                                                    aria-label="Remove"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                </button>
                                            </div>
                                        ))
                                    )}
                                </div>
                            )}
                            
                            <div className="flex items-center gap-2">
                                <span className="text-[9px] font-mono text-white/50 w-8 text-right">{formatDuration(currentTime)}</span>
                                <div className="relative flex-1 h-1.5 bg-white/10 rounded-full group cursor-pointer">
                                    <div className="absolute top-0 left-0 h-full bg-blue-500 rounded-full" style={{ width: `${(currentTime / (fileDuration || 1)) * 100}%` }} />
                                    <input 
                                        type="range" 
                                        min={0} max={fileDuration || 1} step={0.1} 
                                        value={currentTime} 
                                        onChange={(e) => seekFile(parseFloat(e.target.value))}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                    />
                                </div>
                                <span className="text-[9px] font-mono text-white/50 w-8">{formatDuration(fileDuration)}</span>
                            </div>

                            <div className="flex items-center justify-center gap-3">
                                <button onClick={playPrev} className="p-2 text-white/50 hover:text-white hover:bg-white/10 rounded-full transition-all" title="Previous">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path d="M8.445 14.832A1 1 0 0010 14v-2.798l5.445 3.63A1 1 0 0017 14V6a1 1 0 00-1.555-.832L10 8.798V6a1 1 0 00-1.555-.832l-6 4a1 1 0 000 1.664l6 4z" /></svg>
                                </button>
                                <button onClick={() => seekFile(currentTime - 5)} className="p-1.5 text-white/30 hover:text-white hover:bg-white/5 rounded-full transition-all" title="-5s">
                                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12.066 11.2a1 1 0 000 1.6l5.334 4A1 1 0 0019 16V8a1 1 0 00-1.6-.8l-5.333 4zM4.066 11.2a1 1 0 000 1.6l5.334 4A1 1 0 0011 16V8a1 1 0 00-1.6-.8l-5.334 4z" /></svg>
                                </button>
                                <button onClick={togglePlayback} className={`w-9 h-9 flex items-center justify-center rounded-full transition-all ${isPlaying ? 'bg-white text-black shadow-lg shadow-white/20' : 'bg-white/10 text-white hover:bg-white/20'}`}>
                                    {isPlaying ? (
                                        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
                                    ) : (
                                        <svg className="w-3.5 h-3.5 ml-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                                    )}
                                </button>
                                <button onClick={() => seekFile(currentTime + 5)} className="p-1.5 text-white/30 hover:text-white hover:bg-white/5 rounded-full transition-all" title="+5s">
                                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.933 12.8a1 1 0 000-1.6L6.6 7.2A1 1 0 005 8v8a1 1 0 001.6.8l5.333-4zM19.933 12.8a1 1 0 000-1.6l-5.333-4A1 1 0 0013 8v8a1 1 0 001.6.8l5.333-4z" /></svg>
                                </button>
                                <button onClick={playNext} className="p-2 text-white/50 hover:text-white hover:bg-white/10 rounded-full transition-all" title="Next">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path d="M4.555 5.168A1 1 0 003 6v8a1 1 0 001.555.832L10 11.202V14a1 1 0 001.555.832l6-4a1 1 0 000-1.664l-6-4A1 1 0 0010 6v2.798l-5.445-3.63z" /></svg>
                                </button>
                            </div>
                        </div>
                     )}
                 </div>
             )}

             <div className="pt-2 border-t border-white/5 space-y-3">
                <Slider label={t?.sensitivity || "Sensitivity"} hintText={audioHints?.sensitivity} value={settings.sensitivity} min={0.5} max={4.0} step={0.1} onChange={(v) => handleAudioSettingChange('sensitivity', v)} />
                {isAdvanced && <Slider label={t?.smoothing || "Smoothing"} hintText={audioHints?.smoothing} value={settings.smoothing} min={0} max={0.95} step={0.01} onChange={(v) => handleAudioSettingChange('smoothing', v)} />}
             </div>
         </div>
      </div>

      {/* Col 2: Recorder Configuration & Display Settings */}
      <div className="p-3 pt-4 h-full flex flex-col border-b lg:border-b-0 lg:border-e border-white/5 overflow-hidden">
        <div className="space-y-3 overflow-y-auto custom-scrollbar pr-1.5">
            {/* Display Settings Block (Moved from VisualSettingsPanel) */}
            <div className="space-y-1 pb-3 border-b border-white/5">
                <span className="text-xs font-black uppercase text-white/50 tracking-widest block ml-1 mb-1.5">{t?.displaySettings || "Display"}</span>
                <SettingsToggle 
                    label={t?.bgImage || "Album Art BG"} 
                    value={!!settings.albumArtBackground} 
                    onChange={() => handleVisualSettingChange('albumArtBackground', !settings.albumArtBackground)} 
                    hintText={audioHints?.albumArtBackground || "Show album art as background"}
                >
                    <div className="pt-1">
                        <Slider 
                            label={t?.bgDim || "Dimming"} 
                            value={settings.albumArtDim ?? 0.8} 
                            min={0} max={0.9} step={0.1} 
                            onChange={(v) => handleVisualSettingChange('albumArtDim', v)} 
                        />
                    </div>
                </SettingsToggle>
                <SettingsToggle 
                    label={t?.overlayCover || "Overlay Cover"} 
                    value={settings.showAlbumArtOverlay} 
                    onChange={() => handleVisualSettingChange('showAlbumArtOverlay', !settings.showAlbumArtOverlay)} 
                    hintText={audioHints?.overlayCover || "Show album art in song info"}
                />
                {/* NEW LYRICS TOGGLE */}
                <SettingsToggle 
                    label={t?.showLyrics || "AI Lyrics"} 
                    value={showLyrics} 
                    onChange={() => setShowLyrics(!showLyrics)} 
                    hintText={audioHints?.lyrics || "Show AI recognition overlay"}
                />
            </div>

            <span className="text-xs font-black uppercase text-white/50 tracking-widest block ml-1 mb-1">VIDEO STREAM</span>
            
            <div className="space-y-2">
                <div className="grid grid-cols-2 gap-2">
                    <CustomSelect label={settingsLabels.resolution} value={resolution} onChange={(val) => setResolution(val === 'native' ? 'native' : Number(val))} 
                        options={[{ value: 'native', label: settingsLabels.resNative }, { value: 720, label: 'HD (720p)' }, { value: 1080, label: 'FHD (1080p)' }, { value: 2160, label: '4K (2160p)' }]} />
                    <CustomSelect label={settingsLabels.fps} value={fps} onChange={(val) => setFps(Number(val))} options={[{ value: 30, label: '30 FPS' }, { value: 60, label: '60 FPS' }]} />
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                    <CustomSelect 
                        label={settingsLabels.codec || "Format"} 
                        value={mimeType} 
                        onChange={(val) => setMimeType(val as string)} 
                        options={supportedTypes.map(t => ({ value: t, label: getFormatLabel(t) }))} 
                    />
                    <CustomSelect label={settingsLabels.bitrate} value={bitrate} onChange={(val) => setBitrate(Number(val))} 
                        options={[{ value: 4000000, label: settingsLabels.bpsLow }, { value: 8000000, label: settingsLabels.bpsStd }, { value: 12000000, label: settingsLabels.bpsHigh }, { value: 25000000, label: settingsLabels.bpsUltra }]} />
                </div>
            </div>

            <div className="pt-2 border-t border-white/5 space-y-2">
                <span className="text-xs font-black uppercase text-white/50 tracking-widest block ml-1 mb-1">AUDIO STREAM</span>
                <Slider label={settingsLabels.recGain} value={recGain} min={0} max={2} step={0.1} onChange={setRecGain} hintText={hints.recGain} />
                <CustomSelect label={settingsLabels.fade} value={fadeDuration} onChange={(val) => setFadeDuration(Number(val))} options={[{ value: 0, label: settingsLabels.fadeOff }, { value: 1, label: settingsLabels.fade1s }, { value: 2, label: settingsLabels.fade2s }]} hintText={hints.fade} />
            </div>
            
            {isAdvanced && (
                <div className="pt-2 border-t border-white/5">
                    <SteppedSlider label={t?.fftSize || "FFT Size"} hintText={audioHints?.fftSize} options={[{ value: 512, label: '512' }, { value: 1024, label: '1k' }, { value: 2048, label: '2k' }, { value: 4096, label: '4k' }]} value={settings.fftSize} min={512} max={4096} step={512} onChange={(val) => handleAudioSettingChange('fftSize', val)} />
                </div>
            )}
        </div>
      </div>

      {/* Col 3: Actions & Workflow */}
      <div className="p-3 pt-4 h-full flex flex-col items-center justify-between overflow-hidden relative">
          {isCountingDown && <div className="absolute inset-0 z-20 bg-black/80 flex items-center justify-center backdrop-blur-sm rounded-xl"><span className="text-6xl font-black text-white animate-ping">{countdownVal}</span></div>}
          
          <div className="w-full flex-grow flex flex-col items-center justify-center gap-4">
             <div className="relative z-10 group">
                 {isRecording && <div className="absolute inset-0 rounded-full border-4 border-red-500/30 animate-ping pointer-events-none"></div>}
                 {isArmed ? (
                     <button onClick={cancelArming} className="w-20 h-20 rounded-full flex flex-col items-center justify-center border-4 border-yellow-500 text-yellow-500 bg-yellow-900/20 animate-pulse hover:bg-yellow-900/40 transition-all">
                         <span className="text-[9px] font-bold uppercase">{studio.cancel}</span>
                     </button>
                 ) : (
                     <button onClick={isRecording ? stopRecording : handleStartClick} disabled={isProcessing || isCountingDown || isFadingOut} className={`w-20 h-20 rounded-full flex items-center justify-center border-4 transition-all duration-300 shadow-2xl ${isRecording ? 'bg-red-900/10 border-red-500/50 scale-95' : 'bg-white/5 border-white/20 hover:border-white/40 hover:bg-white/10 hover:scale-105'} ${isProcessing ? 'opacity-50 cursor-wait' : ''}`}>
                        {isProcessing ? <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin"/> : <div className={`transition-all duration-300 ${isRecording ? 'w-6 h-6 bg-red-500 rounded-sm shadow-[0_0_10px_rgba(239,68,68,0.5)]' : 'w-10 h-10 bg-red-600 rounded-full shadow-[inset_0_2px_4px_rgba(255,255,255,0.3),0_4px_8px_rgba(0,0,0,0.3)] group-hover:scale-90 group-hover:bg-red-500'}`} />}
                     </button>
                 )}
             </div>
             
             <div className="w-full text-center space-y-2">
                 {isRecording ? (
                     <div className="flex flex-col items-center animate-pulse"><span className="text-sm font-black text-red-400 font-mono">{formatDuration(recordingDuration)}</span><span className="text-[9px] font-bold text-red-400/60">{formatSize(size)}</span></div>
                 ) : (
                     <>
                        <span className={`text-[10px] font-black uppercase tracking-widest ${isArmed ? 'text-yellow-400' : 'text-white/40'}`}>{isFadingOut ? studio.stopping : (isProcessing ? studio.processing : (isArmed ? studio.arming : studio.start))}</span>
                        {sourceType === 'FILE' && !isRecording && (
                            <div className="pt-2">
                                <button onClick={handleAiDirector} disabled={isAnalyzing} className={`px-3 py-1.5 rounded border text-[9px] font-bold uppercase tracking-wider flex items-center gap-1.5 mx-auto transition-all ${isAnalyzing ? 'bg-white/10 text-white/50 border-white/10' : 'bg-blue-600/20 text-blue-300 border-blue-500/40 hover:bg-blue-600 hover:text-white'}`}>
                                    {isAnalyzing ? <div className="w-2 h-2 bg-white rounded-full animate-ping"/> : <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 00-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>}
                                    <span>{audioPanel.aiDirector || "AI DIRECTOR"}</span>
                                </button>
                            </div>
                        )}
                     </>
                 )}
             </div>
          </div>

          <div className="w-full pt-4 border-t border-white/5">
              <div className="grid grid-cols-2 gap-2">
                  <TooltipArea text={hints.syncStart}>
                    <button 
                        onClick={() => setSyncStart(!syncStart)} 
                        className={`relative py-2 px-3 rounded-xl border flex items-center justify-center gap-2 transition-all group ${syncStart ? 'bg-green-500/10 border-green-500/30 text-green-400' : 'bg-white/5 border-white/5 text-white/40 hover:bg-white/10 hover:text-white'}`}
                    >
                        <div className={`w-2 h-2 rounded-full ${syncStart ? 'bg-green-400 animate-pulse shadow-[0_0_8px_rgba(74,222,128,0.6)]' : 'bg-current opacity-50'}`} />
                        <span className="text-[10px] font-bold uppercase tracking-wider">{settingsLabels.syncStart || "Sync"}</span>
                    </button>
                  </TooltipArea>
                  
                  <TooltipArea text={hints.countdown}>
                    <button 
                        onClick={() => setEnableCountdown(!enableCountdown)} 
                        className={`relative py-2 px-3 rounded-xl border flex items-center justify-center gap-2 transition-all group ${enableCountdown ? 'bg-blue-500/10 border-blue-500/30 text-blue-400' : 'bg-white/5 border-white/5 text-white/40 hover:bg-white/10 hover:text-white'}`}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        <span className="text-[10px] font-bold uppercase tracking-wider">{settingsLabels.countdown || "Timer"}</span>
                        {enableCountdown && <span className="absolute -top-1 -right-1 flex h-3 w-3"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span><span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span></span>}
                    </button>
                  </TooltipArea>
              </div>
          </div>
      </div>
    </>
  );
};