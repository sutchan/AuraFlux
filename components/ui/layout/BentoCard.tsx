/**
 * File: components/ui/layout/BentoCard.tsx
 * Version: 1.0.2
 * Author: Aura Vision Team
 * Copyright (c) 2025 Aura Vision. All rights reserved.
 * Updated: 2025-07-16 18:00
 */

import React from 'react';

interface BentoCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  children: React.ReactNode;
  topRight?: React.ReactNode;
  action?: React.ReactNode;
}

export const BentoCard: React.FC<BentoCardProps> = ({ title, children, className = '', topRight, action, ...rest }) => (
  <div className={`bg-black/[0.02] dark:bg-white/[0.02] border border-black/5 dark:border-white/5 rounded-2xl p-4 flex flex-col relative group hover:border-black/10 dark:hover:border-white/10 transition-colors ${className}`} {...rest}>
    {(title || topRight || action) && (
      <div className="flex justify-between items-center mb-3 min-h-[20px] shrink-0">
        <div className="flex items-center gap-2">
            {title && <span className="text-xs font-black uppercase text-black/40 dark:text-white/40 tracking-widest pl-1">{title}</span>}
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