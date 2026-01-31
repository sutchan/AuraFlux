/**
 * File: components/ui/controls/CustomSelect.tsx
 * Version: 1.8.24
 * Author: Sut
 */

import React, { memo } from 'react';
import { TooltipArea } from './Tooltip';

interface CustomSelectProps {
  label: React.ReactNode; 
  value: string | number; 
  options: { value: string | number; label: string }[]; 
  onChange: (val: any) => void; 
  hintText?: string;
}

export const CustomSelect = memo(({ label, value, options, onChange, hintText }: CustomSelectProps) => (
  <div className="space-y-1.5">
    <TooltipArea text={hintText}>
      <div className="text-xs font-bold uppercase text-white/60 tracking-wider ml-1">{label}</div>
    </TooltipArea>
    <div className="relative">
      <select 
        value={value} 
        onChange={(e) => onChange?.(e.target.value)} 
        className="w-full bg-white/[0.04] rounded-xl px-4 py-2.5 text-xs font-bold text-white uppercase tracking-wider appearance-none focus:outline-none focus:ring-1 focus:ring-blue-500/50 transition-colors cursor-pointer"
        aria-label={typeof label === 'string' ? label : 'Select'}
      >
        {options.map(opt => (
          <option key={opt.value} value={opt.value} className="bg-[#0f0f11] text-white">{opt.label}</option>
        ))}
      </select>
      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none opacity-50">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
      </div>
    </div>
  </div>
));