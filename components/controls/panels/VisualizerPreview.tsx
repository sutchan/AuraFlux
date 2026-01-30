
/**
 * File: components/controls/panels/VisualizerPreview.tsx
 * Version: 1.8.2
 * Author: Sut
 * Copyright (c) 2025 Aura Vision. All rights reserved.
 * Updated: 2025-03-14 23:20
 */

import React, { memo } from 'react';
import { VisualizerMode } from '../../../core/types';
import { TooltipArea } from '../../ui/controls/Tooltip';
import { useUI } from '../../AppContext';

const styles: Partial<Record<VisualizerMode, React.CSSProperties>> = {
    // WebGL High-End
    [VisualizerMode.SILK_WAVE]: { background: 'linear-gradient(90deg, #000, #3b82f6, #000), radial-gradient(circle, rgba(255,255,255,0.2) 1px, transparent 1px)', backgroundSize: '100% 100%, 8px 8px' },
    [VisualizerMode.DIGITAL_GRID]: { background: 'linear-gradient(90deg, #000, #ff00ff, #00ffff, #000), repeating-linear-gradient(0deg, transparent 0px, transparent 3px, #000 3px, #000 4px)' },
    [VisualizerMode.NEURAL_FLOW]: { background: 'radial-gradient(circle at 30% 30%, #00ffaa, transparent), radial-gradient(circle at 70% 70%, #00aaff, #000)' },
    [VisualizerMode.KINETIC_WALL]: { background: 'radial-gradient(ellipse at bottom, #1e3a8a 20%, #020617 80%), repeating-conic-gradient(from 45deg, #020617 0% 2.5%, #1e3a8a22 2.5% 5%)' }, 
    [VisualizerMode.LIQUID]: { background: 'radial-gradient(circle, #4c1d95, #1e1b4b)' },
    [VisualizerMode.CUBE_FIELD]: { background: 'linear-gradient(to top, #0c4a6e, #020617 70%), linear-gradient(90deg, rgba(59,130,246,0.1) 1px, transparent 1px), linear-gradient(rgba(59,130,246,0.1) 1px, transparent 1px)', backgroundSize: '20px 20px' },
    
    // Modern 2D
    [VisualizerMode.WAVEFORM]: { background: 'radial-gradient(ellipse 50% 10% at 50% 40%, #8b5cf6, transparent), radial-gradient(ellipse 50% 10% at 50% 60%, #ec4899, transparent), #050508' },
    [VisualizerMode.FLUID_CURVES]: { background: 'radial-gradient(ellipse at 50% 0%, #3b82f6 0%, transparent 50%), radial-gradient(ellipse at 50% 100%, #ec4899 0%, transparent 50%), #050508' },
    [VisualizerMode.NEBULA]: { background: 'radial-gradient(ellipse at bottom, #2e1065, #000)' },
    [VisualizerMode.MACRO_BUBBLES]: { background: 'radial-gradient(circle at 20% 30%, #8b5cf6 20%, transparent 21%), radial-gradient(circle at 75% 80%, #ec4899 15%, transparent 16%), black' },
    
    // Classic
    [VisualizerMode.TUNNEL]: { background: 'radial-gradient(circle, transparent 20%, #8b5cf6 50%, black 80%)' },
    [VisualizerMode.LASERS]: { background: 'linear-gradient(10deg, transparent 48%, #ff00ff 50%, transparent 52%), linear-gradient(170deg, transparent 48%, #00ffff 50%, transparent 52%), black' },
    [VisualizerMode.RINGS]: { background: 'radial-gradient(circle, transparent 30%, #ec4899 35%, transparent 40%), radial-gradient(circle, transparent 60%, #8b5cf6 65%, transparent 70%), black' },
    [VisualizerMode.PARTICLES]: { background: 'radial-gradient(circle, white 0.5px, transparent 1px), black', backgroundSize: '15px 15px' },
    [VisualizerMode.PLASMA]: { background: 'radial-gradient(circle, #ec4899, #8b5cf6, #3b82f6)' },
    [VisualizerMode.BARS]: { background: 'linear-gradient(to top, #3b82f6, #8b5cf6)', WebkitMask: 'repeating-linear-gradient(90deg, transparent 0 3px, black 3px 6px)' },
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
          className={`relative w-full rounded-xl transition-all duration-300 overflow-hidden focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black focus:ring-blue-500 text-left ${
            isActive 
              ? 'ring-2 ring-blue-500 shadow-lg' 
              : 'hover:ring-1 hover:ring-white/30'
          } ${
            isIncluded 
              ? '' 
              : 'grayscale opacity-60 hover:grayscale-0 hover:opacity-100'
          }`}
        >
          <div 
            className="h-12 w-full bg-black transition-transform duration-500 ease-in-out group-hover:scale-110"
            style={styles[mode] || { background: 'black' }}
          ></div>
          
          {/* Label Overlay - Left aligned to leave space for toggle */}
          <div className={`absolute inset-0 flex items-center justify-between px-3 py-2 transition-colors duration-300 ${isActive ? 'bg-black/40' : 'bg-black/60 group-hover:bg-black/50'}`}>
            <span className={`text-[11px] font-bold uppercase tracking-widest leading-tight truncate pr-8 ${isActive ? 'text-white' : 'text-white/70 group-hover:text-white'}`}>{name}</span>
            
            {/* Inline Checkbox Toggle - Increased Hit Area */}
            <div
                onClick={(e) => {
                    e.stopPropagation();
                    onToggleInclude();
                }}
                className="absolute right-1 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center cursor-pointer group/toggle"
                aria-label={isIncluded ? (t?.hints?.excludeFromAutoRotate || "Exclude from Auto-Rotate") : (t?.hints?.includeInAutoRotate || "Include in Auto-Rotate")}
                title={isIncluded ? (t?.hints?.excludeFromAutoRotate || "Exclude from Auto-Rotate") : (t?.hints?.includeInAutoRotate || "Include in Auto-Rotate")}
            >
                <div className={`w-4 h-4 rounded-full flex items-center justify-center transition-all duration-200 border transform group-hover/toggle:scale-110 ${
                    isIncluded 
                    ? 'bg-green-500 border-green-500 text-black shadow-[0_0_8px_rgba(34,197,94,0.6)]' 
                    : 'bg-black/40 border-white/30 text-transparent hover:border-white/60 hover:bg-white/10'
                }`}>
                    {isIncluded && (
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                </div>
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
