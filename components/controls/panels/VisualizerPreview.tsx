/**
 * File: components/controls/panels/VisualizerPreview.tsx
 * Version: 2.0.4
 * Author: Sut
 * Copyright (c) 2025 Aura Flux. All rights reserved.
 * Updated: 2025-03-25 21:05 - Removed MACRO_BUBBLES.
 */

import React, { memo } from 'react';
import { VisualizerMode } from '../../../core/types';
import { TooltipArea } from '../../ui/controls/Tooltip';
import { useUI } from '../../AppContext';

const styles: Partial<Record<VisualizerMode, React.CSSProperties>> = {
    [VisualizerMode.SILK_WAVE]: { background: 'linear-gradient(90deg, #000, #3b82f6, #000), radial-gradient(circle, rgba(255,255,255,0.2) 1px, transparent 1px)' },
    [VisualizerMode.DIGITAL_GRID]: { background: 'linear-gradient(90deg, #000, #ff00ff, #00ffff, #000)' },
    [VisualizerMode.NEURAL_FLOW]: { background: 'radial-gradient(circle at 30% 30%, #00ffaa, transparent), radial-gradient(circle at 70% 70%, #00aaff, #000)' },
    [VisualizerMode.KINETIC_WALL]: { background: 'radial-gradient(ellipse at bottom, #1e3a8a 20%, #020617 80%)' }, 
    [VisualizerMode.RESONANCE_ORB]: { background: 'radial-gradient(circle, #4c1d95, #1e1b4b)' },
    [VisualizerMode.CUBE_FIELD]: { background: 'linear-gradient(to top, #0c4a6e, #020617 70%)' },
    [VisualizerMode.OCEAN_WAVE]: { background: 'linear-gradient(to top, #ff00ff 0%, transparent 50%)' },
    [VisualizerMode.WAVEFORM]: { background: 'radial-gradient(ellipse 50% 10% at 50% 40%, #8b5cf6, transparent), radial-gradient(ellipse 50% 10% at 50% 60%, #ec4899, transparent)' },
    [VisualizerMode.FLUID_CURVES]: { background: 'radial-gradient(ellipse at 50% 0%, #3b82f6 0%, transparent 50%)' },
    [VisualizerMode.NEBULA]: { background: 'radial-gradient(ellipse at bottom, #2e1065, #000)' },
    [VisualizerMode.TUNNEL]: { background: 'radial-gradient(circle, transparent 20%, #8b5cf6 50%, black 80%)' },
    [VisualizerMode.LASERS]: { background: 'linear-gradient(10deg, transparent 48%, #ff00ff 50%, transparent 52%)' },
    [VisualizerMode.RINGS]: { background: 'radial-gradient(circle, transparent 30%, #ec4899 35%, transparent 40%)' },
    [VisualizerMode.PARTICLES]: { background: 'radial-gradient(circle, white 0.5px, transparent 1px), black' },
    [VisualizerMode.PLASMA]: { background: 'radial-gradient(circle, #ec4899, #8b5cf6, #3b82f6)' },
    [VisualizerMode.BARS]: { background: 'linear-gradient(to top, #3b82f6, #8b5cf6)' },
};

export const VisualizerPreview: React.FC<VisualizerPreviewProps> = memo(({ mode, name, isActive, isIncluded, onClick, onToggleInclude }) => {
  const { t } = useUI();
  return (
    <div className="relative w-full group">
      <TooltipArea text={t?.modeDescriptions?.[mode] || ''}>
        <button onClick={onClick} className={`relative w-full rounded-xl transition-all duration-300 overflow-hidden ${isActive?'ring-2 ring-blue-500 shadow-lg':'hover:ring-1 hover:ring-white/30'} ${isIncluded?'':'grayscale opacity-60'}`}>
          <div className="h-12 w-full bg-black" style={styles[mode] || { background: 'black' }}/>
          <div className={`absolute inset-0 flex items-center justify-between px-3 py-2 ${isActive?'bg-black/40':'bg-black/60'}`}><span className="text-[11px] font-bold uppercase tracking-widest truncate pr-8">{name}</span>
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