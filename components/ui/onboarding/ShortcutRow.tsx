/**
 * File: components/ui/onboarding/ShortcutRow.tsx
 * Version: 1.8.24
 * Author: Aura Flux Team
 * Copyright (c) 2024 Aura Flux. All rights reserved.
 * Updated: 2025-07-16 16:30
 */

import React from 'react';

interface ShortcutRowProps { 
  k: string; 
  label: string;
}

export const ShortcutRow = ({ k, label }: ShortcutRowProps) => (
  <div className="bg-white/[0.02] p-4 rounded-2xl border border-white/5 flex justify-between items-center group hover:bg-white/5 transition-all">
     <span className="text-xs text-white/60 group-hover:text-white/80 transition-colors pr-2 font-bold uppercase tracking-wider">{label}</span>
     <kbd className="text-xs font-mono bg-white/10 px-3 py-1 rounded-lg text-white border border-white/10 min-w-[24px] text-center shadow-md">{k}</kbd>
  </div>
);