/**
 * File: components/controls/panels/StudioPanel.tsx
 * Version: 2.1.2
 * Author: Aura Flux Team
 * Updated: 2025-03-25 23:05 - Extreme height optimization for Studio containers.
 */

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useUI, useAudioContext } from '../../AppContext';
import { useVideoRecorder } from '../../../core/hooks/useVideoRecorder';
import { CustomSelect } from '../../ui/controls/CustomSelect';
import { Slider } from '../../ui/controls/Slider';
import { SegmentedControl } from '../../ui/controls/SegmentedControl';
import { BentoCard } from '../../ui/layout/BentoCard';
import { getAverage } from '../../../core/services/audioUtils';

const formatSize = (b: number) => b === 0 ? '0 MB' : `${(b/(1024*1024)).toFixed(1)} MB`;
const formatDur = (s: number) => `${Math.floor(s/60).toString().padStart(2,'0')}:${Math.floor(s%60).toString().padStart(2,'0')}`;

export const StudioPanel: React.FC = () => {
  const { t, showToast } = useUI();
  const { audioContext, analyser, mediaStream, sourceType, isPlaying, currentSong } = useAudioContext();
  const [resolution, setResolution] = useState<number | 'native'>('native');
  const [fps, setFps] = useState(30);
  const [bitrate, setBitrate] = useState(8000000);
  const [mimeType, setMimeType] = useState('video/webm; codecs=vp9');
  const [recGain, setRecGain] = useState(1.0);
  const [syncStart, setSyncStart] = useState(false);
  const [enableCountdown, setEnableCountdown] = useState(false);
  const [isArmed, setIsArmed] = useState(false);
  const [countdownVal, setCountdownVal] = useState(0);
  const armCheckInterval = useRef<number | null>(null);

  const { isRecording, isProcessing, isFadingOut, recordedBlob, duration, size, startRecording, stopRecording, discardRecording, getSupportedMimeTypes } = useVideoRecorder({
      audioContext, analyser, mediaStream, showToast, sourceType, t
  });

  const studio = t?.studioPanel || {};
  const labels = studio.settings || {};
  const hints = studio.hints || {};

  const supportedTypes = useMemo(() => {
      const types = getSupportedMimeTypes();
      if (types.length > 0 && !types.includes(mimeType)) setMimeType(types[0]);
      return types;
  }, [getSupportedMimeTypes, mimeType]); 

  const previewUrl = useMemo(() => recordedBlob ? URL.createObjectURL(recordedBlob) : null, [recordedBlob]);

  const triggerRecording = () => {
      setIsArmed(false);
      const doStart = () => startRecording({ resolution, aspectRatio: 'native', fps, bitrate, mimeType, recGain, fadeDuration: 0 });
      if (enableCountdown) {
          let count = 3; setCountdownVal(count);
          const timer = setInterval(() => { count--; if (count > 0) setCountdownVal(count); else { clearInterval(timer); setCountdownVal(0); doStart(); } }, 1000);
      } else doStart();
  };

  useEffect(() => {
    if (isArmed && sourceType === 'FILE' && isPlaying) triggerRecording();
    if (isArmed && sourceType === 'MICROPHONE' && !armCheckInterval.current && analyser) {
        armCheckInterval.current = window.setInterval(() => {
            const data = new Uint8Array(analyser.frequencyBinCount);
            analyser.getByteFrequencyData(data);
            if (getAverage(data, 0, 10) / 255 > 0.1) triggerRecording();
        }, 50);
    }
    return () => { if (armCheckInterval.current) clearInterval(armCheckInterval.current); armCheckInterval.current = null; };
  }, [isArmed, sourceType, isPlaying, analyser]);

  const getFormatLabel = (mime: string) => {
      const f = t?.studioPanel?.formats || {};
      if (mime.includes('vp9')) return f.vp9 || 'WebM (VP9)';
      if (mime.includes('vp8')) return f.vp8 || 'WebM (VP8)';
      if (mime.includes('avc1')) return f.mp4_h264 || 'MP4 (Social)';
      return mime.split('/')[1].toUpperCase();
  };

  const handleSaveVideo = () => {
      if (!recordedBlob) return;
      const url = URL.createObjectURL(recordedBlob);
      const a = document.createElement('a'); a.href = url;
      let ext = mimeType.includes('mp4') ? 'mp4' : 'webm';
      let name = `AuraFlux_${Date.now()}`;
      if (currentSong?.title) name = `${currentSong.artist || 'Unknown'} - ${currentSong.title}`.replace(/[<>:"/\\|?*]/g, '_');
      a.download = `${name}.${ext}`; document.body.appendChild(a); a.click(); discardRecording();
  };

  if (recordedBlob && previewUrl) {
      return createPortal(
          <div className="fixed inset-0 z-[200] bg-black/90 backdrop-blur-xl flex flex-col items-center justify-center p-6">
              <div className="w-full max-w-2xl bg-[#0a0a0c] border border-white/10 rounded-2xl overflow-hidden flex flex-col">
                  <div className="p-4 border-b border-white/5 flex justify-between items-center">
                      <span className="text-sm font-bold text-white uppercase">{studio.previewTitle}</span>
                      <div className="px-2 py-0.5 bg-blue-900/30 text-blue-300 text-[10px] rounded">{formatSize(recordedBlob.size)} • {formatDur(duration)}</div>
                  </div>
                  <video src={previewUrl} autoPlay loop controls className="max-h-[60vh] object-contain" />
                  <div className="p-4 flex gap-3"><button onClick={discardRecording} className="flex-1 py-3 border border-white/10 text-white/60 font-bold text-xs uppercase">{studio.discard}</button><button onClick={handleSaveVideo} className="flex-1 py-3 bg-blue-600 text-white font-bold text-xs uppercase">{studio.save}</button></div>
              </div>
          </div>, document.body
      );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 h-full max-h-[360px] overflow-hidden">
        {/* Left: Configuration Column - Tightly Stacked */}
        <div className="flex flex-col gap-1.5 h-full">
            <BentoCard title={studio.videoConfig} className="p-2.5 flex-none">
                <div className="space-y-1.5">
                    <div className="grid grid-cols-2 gap-2">
                        <CustomSelect label={labels.resolution} value={resolution} onChange={(v)=>setResolution(v==='native'?'native':Number(v))} options={[{value:'native',label:labels.resNative},{value:720,label:'720p'},{value:1080,label:'1080p'},{value:2160,label:'4K'}]}/>
                        <CustomSelect label={labels.fps} value={fps} onChange={(v)=>setFps(Number(v))} options={[{value:30,label:'30 FPS'},{value:60,label:'60 FPS'}]}/>
                    </div>
                    <div className="grid grid-cols-1 gap-1.5">
                        <CustomSelect label={labels.codec} value={mimeType} onChange={(v)=>setMimeType(v as string)} options={supportedTypes.map(t=>({value:t,label:getFormatLabel(t)}))}/>
                        <SegmentedControl label={labels.bitrate} value={bitrate} onChange={(v)=>setBitrate(Number(v))} options={[{value:4e6,label:"4M"},{value:8e6,label:"8M"},{value:12e6,label:"12M"}]}/>
                    </div>
                </div>
            </BentoCard>

            <BentoCard title={studio.audioMix} className="p-2.5 flex-1">
                <div className="space-y-1.5 h-full flex flex-col justify-between">
                    <Slider label={labels.recGain} value={recGain} min={0} max={2} step={0.1} onChange={setRecGain} hintText={hints.recGain}/>
                    <div className="grid grid-cols-2 gap-2 mt-auto pt-1.5 border-t border-white/5">
                        <button onClick={()=>setSyncStart(!syncStart)} className={`py-1.5 rounded-lg border text-[9px] font-black uppercase tracking-widest transition-all ${syncStart?'bg-green-500/10 border-green-500/30 text-green-400':'bg-white/5 border-white/5 text-white/40'}`}>{labels.syncStart}</button>
                        <button onClick={()=>setEnableCountdown(!enableCountdown)} className={`py-1.5 rounded-lg border text-[9px] font-black uppercase tracking-widest transition-all ${enableCountdown?'bg-blue-500/10 border-blue-500/30 text-blue-400':'bg-white/5 border-white/5 text-white/40'}`}>{labels.countdown}</button>
                    </div>
                </div>
            </BentoCard>
        </div>

        {/* Right: Record Control - Center Focused */}
        <BentoCard className="flex flex-col items-center justify-center p-3 h-full">
            <div className="relative group mb-2">
                {isRecording && <div className="absolute inset-0 rounded-full border-2 border-red-500 animate-ping opacity-20 scale-150" />}
                <button 
                    onClick={isRecording?stopRecording:()=>isArmed?setIsArmed(false):syncStart?setIsArmed(true):triggerRecording()} 
                    className={`w-16 h-16 md:w-20 md:h-20 rounded-full border-[4px] transition-all flex items-center justify-center relative z-10 ${isRecording?'bg-red-900/10 border-red-500 shadow-[0_0_40px_rgba(239,68,68,0.4)]':'bg-white/5 border-white/10 hover:border-red-500/50'}`}
                >
                    {isProcessing ? (
                        <div className="w-8 h-8 border-4 border-white/20 border-t-white rounded-full animate-spin" />
                    ) : (
                        <div className={`transition-all duration-500 ${isRecording ? 'w-5 h-5 bg-red-500 rounded-lg animate-pulse' : 'w-8 h-8 md:w-10 md:h-10 bg-red-600 rounded-full hover:scale-110 shadow-lg'}`} />
                    )}
                </button>
            </div>
            
            <div className="text-center">
                <div className="text-sm md:text-lg font-black uppercase tracking-[0.25em] text-white leading-tight">
                    {isRecording ? formatDur(duration) : isFadingOut ? (studio.stopping || "Stopping...") : isProcessing ? (studio.processing || "Processing...") : isArmed ? (studio.arming || "Arming...") : (studio.start || "START REC")}
                </div>
                {isRecording && <div className="text-[9px] font-mono text-white/40 animate-pulse mt-1">{formatSize(size)}</div>}
                {!isRecording && !isProcessing && !isArmed && (
                    <p className="text-[9px] text-white/20 uppercase tracking-[0.15em] mt-1 font-bold">4K Studio Pipeline</p>
                )}
            </div>
            {countdownVal > 0 && <div className="absolute inset-0 z-20 bg-black/70 flex items-center justify-center rounded-2xl"><span className="text-5xl font-black text-white animate-ping">{countdownVal}</span></div>}
        </BentoCard>
    </div>
  );
};