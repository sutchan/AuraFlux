/**
 * File: components/ui/help/ShortcutsContent.tsx
 * Version: 1.0.8
 * Author: Aura Vision Team
 * Copyright (c) 2024 Aura Vision. All rights reserved.
 */

import React from 'react';
import { ShortcutItem } from './ShortcutItem';

interface ShortcutsContentProps { 
  h: any; 
  s: any; // shortcutItems from translation
}

export const ShortcutsContent: React.FC<ShortcutsContentProps> = ({ h, s }) => {
  const g = h?.gestureItems || {};
  return (
    <div className="space-y-8">
        <div>
            <h4 className="text-sm font-black text-orange-400 uppercase tracking-[0.2em] mb-4 px-1">{h?.shortcutsTitle || "Keyboard Shortcuts"}</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <ShortcutItem label={s?.toggleMic || "Mic"} k="Space" />
                <ShortcutItem label={s?.fullscreen || "Fullscreen"} k="F" />
                <ShortcutItem label={s?.lyrics || "AI Info"} k="L" />
                <ShortcutItem label={s?.hideUi || "Toggle UI"} k="H" />
                <ShortcutItem label={s?.randomize || "Randomize"} k="R" />
                <ShortcutItem label={s?.speed || "Speed"} k="Shift + ↑↓" />
                <ShortcutItem label={s?.glow || "Glow"} k="G" />
                <ShortcutItem label={s?.trails || "Trails"} k="T" />
                <ShortcutItem label={s?.changeMode || "Cycle Mode"} k="← →" />
                <ShortcutItem label={s?.changeTheme || "Cycle Theme"} k="[ ]" />
                <ShortcutItem label={s?.tabs || "Switch Tabs"} k="1 - 5" />
                <ShortcutItem label={s?.help || "Help"} k="?" />
            </div>
        </div>

        <div>
            <h4 className="text-sm font-black text-blue-400 uppercase tracking-[0.2em] mb-4 px-1">{h?.gesturesTitle || "Touch Gestures"}</h4>
            <div className="grid grid-cols-1 gap-3">
                <div className="bg-white/[0.02] p-4 rounded-2xl border border-white/5 flex justify-between items-center group hover:bg-white/5 transition-all">
                    <span className="text-xs text-white/60 group-hover:text-white/80 font-bold uppercase tracking-wider">{g?.swipeMode || "Swipe Left/Right: Change Mode"}</span>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>
                </div>
                <div className="bg-white/[0.02] p-4 rounded-2xl border border-white/5 flex justify-between items-center group hover:bg-white/5 transition-all">
                    <span className="text-xs text-white/60 group-hover:text-white/80 font-bold uppercase tracking-wider">{g?.swipeSens || "Swipe Up/Down: Adjust Sensitivity"}</span>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" /></svg>
                </div>
                <div className="bg-white/[0.02] p-4 rounded-2xl border border-white/5 flex justify-between items-center group hover:bg-white/5 transition-all">
                    <span className="text-xs text-white/60 group-hover:text-white/80 font-bold uppercase tracking-wider">{g?.longPress || "Long Press: AI Info"}</span>
                    <div className="w-4 h-4 rounded-full border-2 border-white/40 group-hover:border-white/80 animate-pulse"></div>
                </div>
            </div>
        </div>
    </div>
  );
};
