/**
 * File: components/ui/controls/Slider.tsx
 * Version: 1.8.33
 * Author: Sut
 * Updated: 2025-03-25 15:20 - Added safety check for onChange
 */

import React, { memo } from 'react';
import { TooltipArea } from './Tooltip';

interface SliderProps {
  label: string; 
  value: number; 
  min: number; 
  max: number; 
  step: number; 
  onChange: (val: number) => void; 
  unit?: string; 
  hintText?: string;
}

export const Slider = memo(({ label, value, min, max, step, onChange, unit = '', hintText }: SliderProps) => {
  const safeValue = value ?? 0;
  const percentage = ((safeValue - min) / (max - min)) * 100;
  
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between items-center px-1">
        <TooltipArea text={hintText}>
          <span className="text-xs font-bold uppercase text-white/60 tracking-wider">{label}</span>
        </TooltipArea>
        <span className="text-xs font-mono text-white/80">
          {safeValue.toFixed(step < 1 ? (step < 0.1 ? 2 : 1) : 0)}{unit}
        </span>
      </div>
      <div className="group relative flex items-center h-4 w-full">
          {/* Native Input: Interactions only */}
          <input 
              type="range" 
              min={min} max={max} step={step} 
              value={safeValue} 
              onChange={(e) => onChange?.(parseFloat(e.target.value))} 
              className="absolute w-full h-full opacity-0 cursor-pointer z-20 m-0 p-0 touch-auto accent-blue-500"
              aria-label={label}
          />
          
          {/* Custom Track */}
          <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden relative pointer-events-none">
              <div 
                className="absolute top-0 left-0 h-full bg-blue-500 transition-[width] duration-150 ease-out" 
                style={{ width: `${percentage}%` }} 
              />
          </div>
          
          {/* Custom Thumb */}
          <div 
              className="absolute pointer-events-none z-10 transition-[left] duration-150 ease-out"
              style={{ 
                  left: `${percentage}%`,
                  top: '50%',
                  transform: 'translate(-50%, -50%)'
              }}
          >
              <div className="h-2.5 w-2.5 bg-white rounded-full shadow-[0_0_10px_rgba(59,130,246,0.8)] ring-2 ring-blue-500/20 transition-transform group-hover:scale-125" />
          </div>
      </div>
    </div>
  );
});