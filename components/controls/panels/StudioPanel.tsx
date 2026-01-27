/**
 * File: components/controls/panels/StudioPanel.tsx
 * Version: 2.0.0
 * Author: Aura Vision Team
 * Copyright (c) 2025 Aura Vision. All rights reserved.
 * Updated: 2025-03-05 14:30
 */

import React from 'react';
import { useUI, useAudioContext } from '../../AppContext';
import { useVideoRecorder } from '../../../core/hooks/useVideoRecorder';

export const StudioPanel: React.FC = () => {
  const { t, showToast } = useUI();
  const { audioContext, analyser, mediaStream } = useAudioContext();
  
  const { isRecording, isProcessing, startRecording, stopRecording } = useVideoRecorder({
      audioContext, analyser, mediaStream, showToast
  });

  const studio = t?.studioPanel || {};

  return (
    <>
      {/* Col 1: Main Actions */}
      <div className="p-3 pt-4 h-full flex flex-col border-b lg:border-b-0 lg:border-e border-white/5 items-center justify-center">
         <div className="relative">
             {isRecording && (
                 <div className="absolute inset-0 rounded-full border-4 border-red-500/50 animate-ping pointer-events-none"></div>
             )}
             <button 
                onClick={isRecording ? stopRecording : startRecording}
                disabled={isProcessing}
                className={`w-24 h-24 rounded-full flex items-center justify-center border-4 transition-all duration-300 shadow-2xl ${
                    isRecording 
                    ? 'bg-red-900/20 border-red-500 text-red-500 scale-95' 
                    : 'bg-white/5 border-white/20 text-white hover:bg-red-500/10 hover:border-red-500/50 hover:text-red-400 hover:scale-105'
                } ${isProcessing ? 'opacity-50 cursor-wait' : ''}`}
             >
                {isProcessing ? (
                    <svg className="animate-spin h-8 w-8" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                ) : (
                    <div className={`rounded-sm transition-all duration-300 ${isRecording ? 'w-8 h-8 bg-red-500' : 'w-10 h-10 bg-current rounded-full'}`} />
                )}
             </button>
         </div>
         <span className={`mt-4 text-xs font-black uppercase tracking-widest ${isRecording ? 'text-red-400 animate-pulse' : 'text-white/40'}`}>
             {isProcessing ? studio.processing : (isRecording ? studio.recording : studio.start)}
         </span>
      </div>

      {/* Col 2: Info & Format */}
      <div className="p-3 pt-4 h-full flex flex-col border-b lg:border-b-0 lg:border-e border-white/5">
        <div className="space-y-4">
            <span className="text-xs font-black uppercase text-white/50 tracking-widest block ml-1">{studio.title || "Studio"}</span>
            <div className="bg-white/5 p-3 rounded-xl border border-white/10">
                <p className="text-xs text-white/60 leading-relaxed font-medium">
                    {studio.info || "Recording captures high-fidelity video directly from the visual engine combined with system audio output."}
                </p>
            </div>
            
            <div className="space-y-2">
                <div className="flex justify-between items-center px-1">
                    <span className="text-[10px] font-bold uppercase text-white/40 tracking-wider">{studio.format || "Format"}</span>
                    <span className="text-[10px] font-mono text-white/80">WebM / MP4</span>
                </div>
                <div className="flex justify-between items-center px-1">
                    <span className="text-[10px] font-bold uppercase text-white/40 tracking-wider">Bitrate</span>
                    <span className="text-[10px] font-mono text-white/80">{studio.quality || "8 Mbps"}</span>
                </div>
            </div>
        </div>
      </div>

      {/* Col 3: Status / Helper */}
      <div className="p-3 pt-4 h-full flex flex-col justify-center items-center text-center">
          <div className={`p-4 rounded-full mb-3 ${isRecording ? 'bg-red-500/10 text-red-400' : 'bg-green-500/10 text-green-400'}`}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  {isRecording ? (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  ) : (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  )}
              </svg>
          </div>
          <span className="text-xs font-bold text-white/50 uppercase tracking-widest">
              {isRecording ? "Capture Active" : (studio.ready || "Ready")}
          </span>
      </div>
    </>
  );
};