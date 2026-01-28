/**
 * File: components/ui/controls/SettingsToggle.tsx
 * Version: 1.1.3
 * Author: Aura Vision Team
 * Copyright (c) 2024 Aura Vision. All rights reserved.
 * Updated: 2025-03-09 18:00
 * Description: Unified UI style with other controls (text-xs uppercase).
 */

import React, { memo } from 'react';
import { TooltipArea } from './Tooltip';

interface SettingsToggleProps {
  label: string; 
  value: boolean; 
  onChange: () => void; 
  activeColor?: string; 
  hintText?: string; 
  statusText?: string; 
  children?: React.ReactNode; 
  variant?: 'default' | 'clean';
}

export const SettingsToggle = memo(({ label, value, onChange, activeColor = 'blue', hintText, statusText, children, variant = 'default' }: SettingsToggleProps) => {
  const activeBg = activeColor === 'green' ? 'bg-green-500' : 'bg-blue-600';
  const neonShadow = value 
    ? (activeColor === 'green' ? 'shadow-[0_0_12px_rgba(34,197,94,0.6)]' : 'shadow-[0_0_12px_rgba(59,130,246,0.6)]') 
    : '';
  
  const containerClasses = variant === 'clean' 
    ? 'py-2 flex flex-col group'
    : 'bg-white/[0.03] p-2.5 rounded-xl border border-white/5 hover:border-white/10 transition-colors';
    
  const headerClasses = variant === 'clean'
    ? 'flex items-center justify-between w-full' 
    : 'flex items-center justify-between min-h-[22px] w-full';

  // Unified label style: text-xs, bold, uppercase, tracking-wider, text-white/60
  const labelClasses = `text-xs font-bold uppercase tracking-wider leading-none transition-colors ${
    variant === 'clean' ? 'text-white/60 group-hover:text-white' : 'text-white/60'
  }`;

  return (
    <div className={containerClasses}> 
      <div className={headerClasses}>
        <TooltipArea text={hintText}>
          <span className={labelClasses}>{label}</span>
        </TooltipArea>
        <button 
          onClick={onChange} 
          className={`relative w-10 h-5 rounded-full transition-all duration-300 ease-in-out focus:outline-none flex items-center shrink-0 ${value ? activeBg : 'bg-white/10'} ${neonShadow}`}
          role="switch" 
          aria-checked={value}
          aria-label={label}
        >
          <span className={`inline-block w-4 h-4 transform transition-transform duration-200 ease-in-out bg-white rounded-full shadow-sm ${value ? 'translate-x-[22px]' : 'translate-x-[2px]'}`} />
        </button>
      </div>
      {statusText && <div className="text-[10px] font-mono text-white/30 uppercase tracking-widest text-right mt-1">{statusText}</div>}
      {value && children && <div className="mt-2 pt-2 border-t border-white/5 animate-fade-in-up w-full">{children}</div>}
    </div>
  );
});