/**
 * File: components/ui/layout/BentoCard.tsx
 * Version: 1.0.0
 * Author: Aura Vision Team
 * Copyright (c) 2025 Aura Vision. All rights reserved.
 */

import React from 'react';

interface BentoCardProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
  topRight?: React.ReactNode;
  action?: React.ReactNode;
}

export const BentoCard: React.FC<BentoCardProps> = ({ title, children, className = '', topRight, action }) => (
  <div className={`bg-white/[0.02] border border-white/5 rounded-2xl p-4 flex flex-col h-full relative group hover:border-white/10 transition-colors ${className}`}>
    {(title || topRight || action) && (
      <div className="flex justify-between items-center mb-3 min-h-[20px] shrink-0">
        <div className="flex items-center gap-2">
            {title && <span className="text-xs font-black uppercase text-white/40 tracking-widest pl-1">{title}</span>}
            {topRight && <div>{topRight}</div>}
        </div>
        {action && <div>{action}</div>}
      </div>
    )}
    <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar pr-1 -mr-1 relative">
        {children}
    </div>
  </div>
);
