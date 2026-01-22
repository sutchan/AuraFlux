/**
 * File: components/controls/panels/VisualizerPreview.tsx
 * Version: 1.7.1
 * Author: Aura Vision Team
 * Copyright (c) 2024 Aura Vision. All rights reserved.
 * Updated: 2025-02-24 00:00
 */

import React, { memo } from 'react';
import { VisualizerMode } from '../../../core/types';
import { TooltipArea } from '../../ui/controls/Tooltip';
import { useUI } from '../../AppContext';

const styles: Partial<Record<VisualizerMode, React.CSSProperties>> = {
    // WebGL High-End
    [VisualizerMode.NEURAL_FLOW]: { background: 'radial-gradient(circle at 30% 30%, #00ffaa, transparent), radial-gradient(circle at 70% 70%, #00aaff, #000)' },
    [VisualizerMode.KINETIC_WALL]: { background: 'linear-gradient(90deg, #000 5%, #ff0055 20%, #000 35%, #000 65%, #00ffff 80%, #000 95%)' }, 
    [VisualizerMode.CYBER_CITY]: { background: 'linear-gradient(to top, #ff00ff 0%, #000 50%, #050011 100%)' }, 
    [VisualizerMode.CRYSTAL_CORE]: { background: 'radial-gradient(circle, #fff 10%, #00ffff 30%, #000 70%)' }, 
    [VisualizerMode.LIQUID]: { background: 'radial-gradient(circle, #4c1d95, #1e1b4b)' },
    [VisualizerMode.CUBE_FIELD]: { background: 'linear-gradient(180deg, #000 50%, #3b82f6 100%)' },
    
    // Modern 2D
    [VisualizerMode.WAVEFORM]: { background: 'linear-gradient(to right, #00e5ff, #ffffff, #af52de)' },
    [VisualizerMode.FLUID_CURVES]: { background: 'linear-gradient(to right, #3b82f6, #8b5cf6, #ec4899)'},
    [VisualizerMode.NEBULA]: { background: 'radial-gradient(ellipse at bottom, #2e1065, #000)' },
    [VisualizerMode.MACRO_BUBBLES]: { background: 'radial-gradient(circle at 20% 30%, #8b5cf6 20%, transparent 21%), radial-gradient(circle at 75% 80%, #ec4899 15%, transparent 16%), black' },
    
    // Classic
    [VisualizerMode.TUNNEL]: { background: 'radial-gradient(circle, transparent 20%, #8b5cf6 50%, black 80%)' },
    [VisualizerMode.LASERS]: { background: 'linear-gradient(10deg, transparent 48%, #ff00ff 50%, transparent 52%), linear-gradient(170deg, transparent 48%, #00ffff 50%, transparent 52%), black' },
    [VisualizerMode.RINGS]: { background: 'radial-gradient(circle, transparent 30%, #ec4899 35%, transparent 40%), radial-gradient(circle, transparent 60%, #8b5cf6 65%, transparent 70%), black' },
    [VisualizerMode.PARTICLES]: { background: 'radial-gradient(circle, white 2%, transparent 4%), black' },
    [VisualizerMode.PLASMA]: { background: 'radial-gradient(circle, #ec4899, #8b5cf6, #3b82f6)' },
    [VisualizerMode.BARS]: { background: 'linear-gradient(to top, #3b82f6, #8b5cf6 50%, #3b82f6)' },
};


export const VisualizerPreview: React.FC<VisualizerPreviewProps> = memo(({ mode, name, isActive, isIncluded, onClick, onToggleInclude }) => {
  const { t } = useUI();
  // Fetch description from i18n
  const description = t?.modeDescriptions?.[mode] || '';
  
  return (
    <div className="relative w-full group">
      {/* Main Selection Area */}
      <TooltipArea text={description}>
        <button
          onClick={onClick}
          aria-pressed={isActive}
          className={`relative w-full rounded-xl transition-all duration-300 overflow-hidden focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black focus:ring-blue-500 text-left ${isActive ? 'ring-2 ring-blue-500 shadow-lg' : 'hover:ring-1 hover:ring-white/30'}`}
        >
          <div 
            className="h-12 w-full bg-black transition-transform duration-500 ease-in-out group-hover:scale-110"
            style={styles[mode] || { background: 'black' }}
          ></div>
          
          {/* Label Overlay - Left aligned to leave space for toggle */}
          <div className={`absolute inset-0 flex items-center justify-between px-3 py-2 transition-colors duration-300 ${isActive ? 'bg-black/40' : 'bg-black/60 group-hover:bg-black/50'}`}>
            <span className={`text-[11px] font-bold uppercase tracking-widest leading-tight truncate pr-2 ${isActive ? 'text-white' : 'text-white/70 group-hover:text-white'}`}>{name}</span>
            
            {/* Inline Checkbox Toggle */}
            <div
                onClick={(e) => {
                    e.stopPropagation();
                    onToggleInclude();
                }}
                className={`w-4 h-4 rounded-full flex items-center justify-center transition-all duration-200 border ${
                    isIncluded 
                    ? 'bg-green-500 border-green-500 text-black shadow-[0_0_8px_rgba(34,197,94,0.6)]' 
                    : 'bg-black/30 border-white/20 text-transparent hover:border-white/50'
                }`}
                aria-label={isIncluded ? "Disable Auto-Rotate" : "Enable Auto-Rotate"}
                title={isIncluded ? "Included in Auto-Rotate" : "Excluded from Auto-Rotate"}
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
            </div>
          </div>
        </button>
      </TooltipArea>
    </div>
  );
});

interface VisualizerPreviewProps {
  mode: VisualizerMode;
  name: string;
  isActive: boolean;
  isIncluded: boolean;
  onClick: () => void;
  onToggleInclude: () => void;
}