/**
 * File: components/ui/controls/Slider.tsx
 * Version: 1.0.9
 * Author: Aura Vision Team
 * Copyright (c) 2024 Aura Vision. All rights reserved.
 * Updated: 2025-02-26 19:30
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

export const Slider = memo(({ label, value, min, max, step, onChange, unit = '', hintText }: SliderProps) => (
  <div className="space-y-1.5">
    <div className="flex justify-between items-center px-1">
      <TooltipArea text={hintText}>
        <span className="text-xs font-bold uppercase text-white/60 tracking-wider">{label}</span>
      </TooltipArea>
      <span className="text-xs font-mono text-white/80">{value.toFixed(step < 1 ? (step < 0.1 ? 2 : 1) : 0)}{unit}</span>
    </div>
    <div className="group relative flex items-center h-4 w-full">
        <input 
            type="range" 
            min={min} max={max} step={step} 
            value={value} 
            onChange={(e) => onChange(parseFloat(e.target.value))} 
            className="absolute w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer z-10 opacity-0 group-hover:opacity-100 transition-opacity"
            aria-label={label}
        />
        <div className="w-full h-1 bg-white/10 rounded-lg overflow-hidden relative">
            <div className="absolute top-0 left-0 h-full bg-blue-500" style={{ width: `${((value - min) / (max - min)) * 100}%` }} />
        </div>
        <div className="absolute h-2.5 w-2.5 bg-white rounded-full shadow-lg transform -translate-x-1.25 pointer-events-none transition-all group-hover:scale-125" style={{ left: `${((value - min) / (max - min)) * 100}%` }} />
    </div>
  </div>
));