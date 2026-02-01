/**
 * File: components/controls/panels/VisualizerPreview.tsx
 * Version: 2.1.0
 * Author: Sut
 * Updated: 2025-07-18 16:00
 */

import React, { memo } from 'react';
import { VisualizerMode } from '../../../core/types';
import { TooltipArea } from '../../ui/controls/Tooltip';
import { useUI } from '../../AppContext';

const styles: Partial<Record<VisualizerMode, React.CSSProperties>> = {
    [VisualizerMode.SILK_WAVE]: { background: 'linear-gradient(45deg, #000, #3b82f6 50%, #000), linear-gradient(-45deg, #000, #ff007f 50%, #000)' },
    [VisualizerMode.DIGITAL_GRID]: { background: 'linear-gradient(45deg, #000 0%, #00ffff 50%, #ff00ff 100%)' },
    [VisualizerMode.NEURAL_FLOW]: { background: 'radial-gradient(circle at 30% 30%, #00ffaa, transparent), radial-gradient(circle at 70% 70%, #00aaff, #000)' },
    [VisualizerMode.KINETIC_WALL]: { background: 'radial-gradient(ellipse at bottom, #1e3a8a 20%, #020617 80%)' }, 
    [VisualizerMode.RESONANCE_ORB]: { background: 'radial-gradient(circle, #9333ea, #1e1b4b)' },
    [VisualizerMode.CUBE_FIELD]: { background: 'linear-gradient(to bottom, transparent, #0c4a6e), repeating-linear-gradient(45deg, #0c4a6e, #0c4a6e 1px, transparent 1px, transparent 10px)' },
    [VisualizerMode.OCEAN_WAVE]: { background: 'linear-gradient(to top, #ff00ff 0%, #00ffff 50%, transparent 80%)' },
    [VisualizerMode.WAVEFORM]: { background: 'linear-gradient(to right, transparent, #8b5cf6, #ec4899, #8b5cf6, transparent)' },
    [VisualizerMode.FLUID_CURVES]: { background: 'radial-gradient(ellipse at 50% 0%, #3b82f6 0%, transparent 50%), radial-gradient(ellipse at 50% 100%, #8b5cf6 0%, transparent 50%)' },
    [VisualizerMode.NEBULA]: { background: 'radial-gradient(ellipse at 70% 30%, #af52de, transparent), radial-gradient(ellipse at 30% 70%, #5856d6, #020617)' },
    [VisualizerMode.TUNNEL]: { background: 'repeating-radial-gradient(circle at center, #8b5cf6, #8b5cf6 5px, #000 5px, #000 15px)' },
    [VisualizerMode.LASERS]: { background: 'linear-gradient(10deg, transparent 48%, #ff00ff 50%, transparent 52%), linear-gradient(-15deg, transparent 47%, #00e5ff 50%, transparent 53%)' },
    [VisualizerMode.RINGS]: { background: 'repeating-radial-gradient(circle at center, #ec4899, #ec4899 2px, transparent 2px, transparent 20px)' },
    [VisualizerMode.PARTICLES]: { background: 'radial-gradient(ellipse at center, rgba(255,255,255,0.1) 0%, rgba(0,0,0,0) 70%), repeating-radial-gradient(circle at center, white 0, white 0.5px, black 0.5px, black 15px)', backgroundSize: '100% 100%, 30px 30px' },
    [VisualizerMode.PLASMA]: { background: 'radial-gradient(circle, #ec4899, #8b5cf6, #3b82f6)' },
    [VisualizerMode.BARS]: { background: 'linear-gradient(to top, #3b82f6, #8b5cf6)' },
    [VisualizerMode.RIPPLES]: { background: 'radial-gradient(circle, transparent 20%, #4f46e5 20%, #4f46e5 25%, transparent 25%, transparent 40%, #ec4899 40%, #ec4899 45%, transparent 45%)' },
};

export const VisualizerPreview: React.FC<VisualizerPreviewProps> = memo(({ mode, name, isActive, isIncluded, onClick, onToggleInclude }) => {
  const { t } = useUI();
  return (
    <div className="relative w-full group">
      <TooltipArea text={t?.modeDescriptions?.[mode] || ''}>
        <button onClick={onClick} className={`relative w-full rounded-xl transition-all duration-300 overflow-hidden ${isActive?'ring-2 ring-blue-500 shadow-lg':'hover:ring-1 hover:ring-black/30 dark:hover:ring-white/30'} ${isIncluded?'':'grayscale opacity-60'}`}>
          <div className="h-12 w-full bg-black" style={styles[mode] || { background: 'black' }}/>
          <div className={`absolute inset-0 flex items-center justify-between px-3 py-2 ${isActive?'bg-black/40':'bg-black/60'}`}><span className="text-[11px] font-bold uppercase tracking-widest truncate pr-8 text-white">{name}</span>
            <div onClick={(e)=>{e.stopPropagation();onToggleInclude();}} className="absolute right-1 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center cursor-pointer">
                <div className={`w-4 h-4 rounded-full border ${isIncluded?'bg-green-500 border-green-500':'bg-black/40 border-white/30'}`}>{isIncluded && <svg className="w-2.5 h-2.5 mx-auto text-black" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4L19 7"/></svg>}</div>
            </div>
          </div>
        </button>
      </TooltipArea>
    </div>
  );
});

interface VisualizerPreviewProps { mode: VisualizerMode; name: string; isActive: boolean; isIncluded: boolean; onClick: () => void; onToggleInclude: () => void; }