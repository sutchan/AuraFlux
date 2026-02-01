/**
 * File: components/controls/panels/StudioPanel.tsx
 * Version: 2.3.0
 * Author: Sut
 */

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useUI, useAudioContext } from '../../AppContext';
import { useVideoRecorder } from '../../../core/hooks/useVideoRecorder';
import { CustomSelect } from '../../ui/controls/CustomSelect';
import { Slider } from '../../ui/controls/Slider';
import { SegmentedControl } from '../../ui/controls/SegmentedControl';
import { BentoCard } from '../../ui/layout/BentoCard';
import { SettingsToggle } from '../../ui/controls/SettingsToggle';
import { getAverage } from '../../../core/services/audioUtils';

const formatSize = (b: number) => b === 0 ? '0 MB' : `${(b / (1024 * 1024)).toFixed(1)} MB`;
const formatDur = (s: number) => `${Math.floor(s / 60).toString().padStart(2, '0')}:${Math.floor(s % 60).toString().padStart(2, '0')}`;

const ArmedVisualizer: React.FC<{ analyser: AnalyserNode | null }> = ({ analyser }) => {
  const barsRef = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    if (!analyser) return;
    const data = new Uint8Array(analyser.frequencyBinCount);
    let animFrameId: number;

    const render = () => {
      analyser.getByteFrequencyData(data);
      const bass = getAverage(data, 0, 10) / 255;
      const mid = getAverage(data, 20, 80) / 255;

      barsRef.current.forEach((bar, i) => {
        if (bar) {
          const level = (i < 4) ? bass : mid;
          bar.style.transform = `scaleY(${Math.max(0.1, level * 2.5)})`;
        }
      });
      animFrameId = requestAnimationFrame(render);
    };
    render();
    return () => cancelAnimationFrame(animFrameId);
  }, [analyser]);

  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-40">
      <div className="w-48 h-48 relative">
        {Array.from({ length: 12 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-12 bg-blue-500 rounded-full origin-bottom"
            ref={el => { barsRef.current[i] = el; }}
            style={{
              left: '50%',
              top: '50%',
              transform: `rotate(${i * 30}deg) translateY(-60px) scaleY(0.1)`,
              transition: 'transform 0.1s ease-out'
            }}
          />
        ))}
      </div>
    </div>
  );
};

export const StudioPanel: React.FC = () => {
  const { t, showToast } = useUI();
  const { audioContext, analyser, mediaStream, sourceType, isPlaying, currentSong } = useAudioContext();
  const [resolution, setResolution] = useState<number | 'native'>('native');
  const [aspectRatio, setAspectRatio] = useState<number | 'native'>('native');
  const [fps, setFps] = useState(60);
  const [bitrate, setBitrate] = useState(12000000);
  const [mimeType, setMimeType] = useState('video/webm; codecs=vp9');
  const [recGain, setRecGain] = useState(1.0);
  const [syncStart, setSyncStart] = useState(false);
  const [enableCountdown, setEnableCountdown] = useState(false);
  const [isArmed, setIsArmed] = useState(false);
  const [countdownVal, setCountdownVal] = useState(0);
  const armCheckInterval = useRef<number | null>(null);

  const { isRecording, isProcessing, isFadingOut, recordedBlob, duration, size, startRecording, stopRecording, discardRecording, getSupportedMimeTypes } = useVideoRecorder({
    audioContext, analyser, mediaStream, sourceType, t, showToast
  });

  const studio = t.studioPanel;
  const labels = studio.settings;
  const hints = studio.hints;

  const supportedTypes = useMemo(() => {
    const types = getSupportedMimeTypes();
    if (types.length > 0 && !types.includes(mimeType)) setMimeType(types[0]);
    return types;
  }, [getSupportedMimeTypes, mimeType]);

  const previewUrl = useMemo(() => recordedBlob ? URL.createObjectURL(recordedBlob) : null, [recordedBlob]);

  const triggerRecording = () => {
    setIsArmed(false);
    const doStart = () => startRecording({ resolution, aspectRatio, fps, bitrate, mimeType, recGain, fadeDuration: 0 });
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
  }, [isArmed, sourceType, isPlaying, analyser, triggerRecording]);

  const getFormatLabel = (mime: string) => {
    const f = t.studioPanel.formats;
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
      <div className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-3xl flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-3xl bg-[#0a0a0c] border border-white/10 rounded-3xl overflow-hidden flex flex-col shadow-[0_0_100px_rgba(0,0,0,0.8)] animate-fade-in-up">
          <div className="p-5 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
            <div className="flex flex-col">
              <span className="text-xs font-black text-white uppercase tracking-widest">{studio.previewTitle}</span>
              <span className="text-[10px] text-blue-400 font-mono mt-0.5">{currentSong?.title || "Untitled Creation"}</span>
            </div>
            <div className="px-3 py-1 bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-black rounded-lg uppercase tracking-wider">{formatSize(recordedBlob.size)} • {formatDur(duration)}</div>
          </div>
          <div className="relative aspect-video bg-black flex items-center justify-center overflow-hidden">
            <video src={previewUrl} autoPlay loop controls className="max-h-[60vh] w-full" />
          </div>
          <div className="p-6 flex gap-4 bg-white/[0.01]">
            <button onClick={discardRecording} className="flex-1 py-4 rounded-xl border border-white/10 text-white/40 hover:text-white hover:bg-white/5 transition-all text-xs font-black uppercase tracking-widest">{studio.discard}</button>
            <button onClick={handleSaveVideo} className="flex-1 py-4 rounded-xl bg-white text-black hover:bg-blue-500 hover:text-white transition-all text-xs font-black uppercase tracking-widest shadow-xl shadow-white/5">{studio.save}</button>
          </div>
        </div>
      </div>, document.body
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-stretch">
      {/* Settings Column (7 cols) */}
      <div className="lg:col-span-7 flex flex-col gap-3">
        <BentoCard title={studio.videoConfig}>
          <div className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <CustomSelect label={labels.resolution} value={resolution} onChange={(v) => setResolution(v === 'native' ? 'native' : Number(v))} options={[{ value: 'native', label: labels.resNative }, { value: 720, label: '720p' }, { value: 1080, label: '1080p' }, { value: 2160, label: '4K' }]} />
              <CustomSelect label={labels.aspectRatio} value={aspectRatio} onChange={(v) => setAspectRatio(v === 'native' ? 'native' : Number(v))} options={[{ value: 'native', label: labels.resNative }, { value: 16 / 9, label: '16:9' }, { value: 9 / 16, label: '9:16' }, { value: 1, label: '1:1' }]} />
              <CustomSelect label={labels.fps} value={fps} onChange={(v) => setFps(Number(v))} options={[{ value: 30, label: '30 FPS' }, { value: 60, label: '60 FPS' }]} />
            </div>
            
            <div className="pt-4 border-t border-black/5 dark:border-white/5 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <CustomSelect label={labels.codec} value={mimeType} onChange={(v) => setMimeType(v as string)} options={supportedTypes.map(t => ({ value: t, label: getFormatLabel(t) }))} />
              <SegmentedControl label={labels.bitrate} value={bitrate} onChange={(v) => setBitrate(Number(v))} options={[{ value: 4e6, label: "4M" }, { value: 8e6, label: "8M" }, { value: 12e6, label: "12M" }, { value: 24e6, label: "24M" }]} />
            </div>
          </div>
        </BentoCard>

        <BentoCard title={studio.audioMix} className="flex-1">
          <div className="h-full flex flex-col justify-between gap-4">
            <div className="max-w-md">
                <Slider label={labels.recGain} value={recGain} min={0} max={2} step={0.1} onChange={setRecGain} hintText={hints.recGain} />
            </div>
            <div className="grid grid-cols-2 gap-3 pt-3 border-t border-black/5 dark:border-white/5">
                <SettingsToggle label={labels.syncStart} value={syncStart} onChange={() => setSyncStart(!syncStart)} variant="clean" activeColor="blue" hintText={hints.syncStart} />
                <SettingsToggle label={labels.countdown} value={enableCountdown} onChange={() => setEnableCountdown(!enableCountdown)} variant="clean" activeColor="blue" hintText={hints.countdown} />
            </div>
          </div>
        </BentoCard>
      </div>

      {/* Monitor/Recording Column (5 cols) */}
      <BentoCard className="lg:col-span-5 flex flex-col items-center justify-center min-h-[300px] relative overflow-hidden">
        {/* Background Atmosphere */}
        <div className={`absolute inset-0 transition-colors duration-1000 ${isRecording ? 'bg-red-500/5' : isArmed ? 'bg-blue-500/5' : 'bg-transparent'}`} />
        
        <div className="relative z-10 flex flex-col items-center">
            <div className="relative group mb-6 flex items-center justify-center w-32 h-32">
                {isArmed && <ArmedVisualizer analyser={analyser} />}
                
                {isRecording && (
                    <div className="absolute inset-0 rounded-full border-2 border-red-500 animate-ping opacity-20 scale-150" />
                )}
                
                <button
                    onClick={isRecording ? stopRecording : () => isArmed ? setIsArmed(false) : syncStart ? setIsArmed(true) : triggerRecording()}
                    disabled={isProcessing}
                    className={`w-24 h-24 rounded-full border-4 transition-all flex items-center justify-center relative z-10 duration-500 ${isRecording ? 'bg-red-900/20 border-red-500 shadow-[0_0_50px_rgba(239,68,68,0.4)]' :
                        isArmed ? 'bg-blue-900/20 border-blue-500 shadow-[0_0_50px_rgba(59,130,246,0.4)] animate-pulse' :
                            'bg-black/10 dark:bg-white/5 border-black/10 dark:border-white/10 hover:border-red-500/50 hover:scale-105'
                        }`}
                >
                    {isProcessing ? (
                        <div className="w-10 h-10 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
                    ) : (
                        <div className={`transition-all duration-300 ${isRecording ? 'w-6 h-6 bg-red-500 rounded-lg animate-pulse' :
                            isArmed ? 'w-8 h-8 bg-blue-500 rounded-full animate-pulse' :
                                'w-12 h-12 bg-red-600 rounded-full group-hover:scale-110 shadow-lg'
                            }`} />
                    )}
                </button>
            </div>

            <div className="text-center space-y-1 h-14">
                <div className={`text-2xl font-black uppercase tracking-[0.2em] transition-all duration-300 ${isRecording ? 'text-red-500' : 'text-black dark:text-white'}`}>
                    {isRecording ? formatDur(duration) : isFadingOut ? studio.stopping : isProcessing ? studio.processing : isArmed ? studio.arming : studio.start}
                </div>
                {isRecording && (
                    <div className="text-[10px] font-mono text-black/40 dark:text-white/40 uppercase tracking-widest animate-pulse flex items-center justify-center gap-2">
                        <span className="w-1.5 h-1.5 bg-red-500 rounded-full" />
                        {formatSize(size)} ENCODING
                    </div>
                )}
            </div>
        </div>

        {/* Countdown Overlay */}
        {countdownVal > 0 && (
            <div className="absolute inset-0 z-50 bg-black/80 flex flex-col items-center justify-center backdrop-blur-sm">
                <span className="text-8xl font-black text-white animate-ping">{countdownVal}</span>
                <span className="text-xs font-black text-white/40 uppercase tracking-[0.4em] mt-8">Initializing...</span>
            </div>
        )}
      </BentoCard>
    </div>
  );
};
