/**
 * File: components/controls/PlayerControls.tsx
 * Version: 1.0.0
 * Author: Aura Vision Team
 * Copyright (c) 2025 Aura Vision. All rights reserved.
 */

import React, { useRef, useState, useEffect } from 'react';
import { useAudioContext } from '../AppContext';

const formatTime = (seconds: number) => {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
};

export const PlayerControls: React.FC = () => {
  const { sourceType, fileStatus, isPlaying, currentTime, duration, togglePlayback, seekFile, fileName } = useAudioContext();
  const [isDragging, setIsDragging] = useState(false);
  const [dragTime, setDragTime] = useState(0);
  
  // Only show if in file mode and a file is loaded
  if (sourceType !== 'FILE' || fileStatus !== 'ready') return null;

  const displayTime = isDragging ? dragTime : currentTime;
  const progress = duration > 0 ? (displayTime / duration) * 100 : 0;

  return (
    <div className="fixed bottom-24 md:bottom-24 left-1/2 -translate-x-1/2 z-[115] w-full max-w-md px-4 pointer-events-none">
        <div className="bg-black/60 backdrop-blur-xl border border-white/10 rounded-2xl p-4 shadow-2xl pointer-events-auto animate-fade-in-up">
            <div className="flex items-center gap-4 mb-2">
                <button 
                    onClick={togglePlayback}
                    className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-lg"
                >
                    {isPlaying ? (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor"><path fillRule="evenodd" d="M6.75 5.25a.75.75 0 01.75-.75H9a.75.75 0 01.75.75v13.5a.75.75 0 01-.75.75H7.5a.75.75 0 01-.75-.75V5.25zm7.5 0A.75.75 0 0115 4.5h1.5a.75.75 0 01.75.75v13.5a.75.75 0 01-.75.75H15a.75.75 0 01-.75-.75V5.25z" clipRule="evenodd" /></svg>
                    ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-0.5" viewBox="0 0 24 24" fill="currentColor"><path fillRule="evenodd" d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.348c1.295.712 1.295 2.573 0 3.285L7.28 19.991c-1.25.687-2.779-.217-2.779-1.643V5.653z" clipRule="evenodd" /></svg>
                    )}
                </button>
                <div className="flex-1 min-w-0">
                    <h3 className="text-white text-xs font-bold truncate">{fileName || "Unknown Track"}</h3>
                    <div className="flex justify-between text-[10px] text-white/50 font-mono mt-0.5">
                        <span>{formatTime(displayTime)}</span>
                        <span>{formatTime(duration)}</span>
                    </div>
                </div>
            </div>
            
            <div className="relative h-4 group flex items-center">
                <input 
                    type="range" 
                    min={0} max={duration} step={0.1}
                    value={displayTime}
                    onMouseDown={() => setIsDragging(true)}
                    onTouchStart={() => setIsDragging(true)}
                    onChange={(e) => setDragTime(parseFloat(e.target.value))}
                    onMouseUp={(e) => {
                        seekFile(parseFloat((e.target as HTMLInputElement).value));
                        setIsDragging(false);
                    }}
                    onTouchEnd={(e) => {
                        seekFile(parseFloat((e.target as HTMLInputElement).value));
                        setIsDragging(false);
                    }}
                    className="absolute w-full h-full opacity-0 cursor-pointer z-10"
                />
                <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 rounded-full" style={{ width: `${progress}%` }} />
                </div>
                <div 
                    className="absolute w-3 h-3 bg-white rounded-full shadow-md pointer-events-none transition-transform duration-100 group-hover:scale-125"
                    style={{ left: `${progress}%`, transform: 'translateX(-50%)' }}
                />
            </div>
        </div>
    </div>
  );
};
