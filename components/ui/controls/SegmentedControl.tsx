/**
 * File: components/ui/controls/SegmentedControl.tsx
 * Version: 1.1.1
 * Author: Aura Vision Team
 * Updated: 2025-03-25 15:20 - Added safety check for onChange
 */

import React from 'react';
import { TooltipArea } from './Tooltip';

interface Option<T> {
  value: T;
  label: React.ReactNode;
}

interface SegmentedControlProps<T> {
  label?: string;
  value: T;
  options: Option<T>[];
  onChange: (value: T) => void;
  hintText?: string;
}

export const SegmentedControl = <T extends string | number>({ label, value, options, onChange, hintText }: SegmentedControlProps<T>) => {
  return (
    <div className="space-y-2">
      {label && (
        <TooltipArea text={hintText}>
          <span className="text-xs font-bold uppercase text-white/60 tracking-wider ml-1 block">{label}</span>
        </TooltipArea>
      )}
      <div className="relative flex bg-black/40 p-1 rounded-xl border border-white/5 shadow-inner">
        {options.map((opt) => {
          const isActive = opt.value === value;
          return (
            <button
              key={String(opt.value)}
              onClick={() => onChange?.(opt.value)}
              className={`relative z-10 flex-1 min-w-0 py-1.5 px-2 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-colors duration-200 truncate ${
                isActive
                  ? 'text-white'
                  : 'text-white/40 hover:text-white/70'
              }`}
            >
              {opt.label}
              
              {isActive && (
                <div className="absolute inset-0 bg-white/10 border border-white/10 rounded-lg shadow-sm -z-10 animate-fade-in-up duration-200" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};