
/**
 * File: components/ui/help/AboutContent.tsx
 * Version: 1.6.5
 * Author: Aura Vision Team
 * Copyright (c) 2024 Aura Vision. All rights reserved.
 */

import React from 'react';
import { APP_VERSION } from '../../../core/constants';

interface AboutContentProps { 
  h: any; // helpModal translations
  t: any; // full translations object (for APP_VERSION)
}

const TechBadge = ({ label, colorClass }: { label: string, colorClass: string }) => (
  <div className={`px-3 py-1.5 rounded-md bg-white/[0.03] border border-white/5 text-[10px] font-bold ${colorClass} flex items-center justify-center shadow-sm`}>
    {label}
  </div>
);

export const AboutContent: React.FC<AboutContentProps> = ({ h, t }) => (
    <div className="space-y-6 animate-fade-in-up">
        {/* Project Description */}
        <div className="bg-white/[0.03] p-5 rounded-2xl border border-white/5">
           <h4 className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-3 flex items-center gap-2">
             <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
             {h?.projectInfoTitle || "About Aura"}
           </h4>
           <p className="text-sm text-white/60 leading-relaxed font-medium">
             {h?.aboutDescription || "Immersive AI visualizer for Streamers, VJs, Ambient decor, and Focus sessions."}
           </p>
        </div>

        {/* Tech Stack */}
        <div>
            <h4 className="text-[10px] font-bold text-white/30 uppercase tracking-widest mb-3 px-1">{h?.coreTech || "Core Technology"}</h4>
            <div className="grid grid-cols-3 gap-2">
                <TechBadge label="Gemini 3 Flash" colorClass="text-purple-300" />
                <TechBadge label="React 19" colorClass="text-blue-300" />
                <TechBadge label="WebGL / Three.js" colorClass="text-green-300" />
            </div>
        </div>

        {/* Privacy */}
        <div className="bg-white/[0.03] p-5 rounded-2xl border border-white/5">
           <h4 className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-2 flex items-center gap-2">
             <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
             {h?.privacyTitle || "Privacy"}
           </h4>
           <p className="text-xs text-white/50 leading-relaxed">{h?.privacyText || "Local analysis only."}</p>
        </div>

        {/* Links Grid */}
        <div className="grid grid-cols-2 gap-3">
            <a href="https://github.com/sutchan/auraflux" target="_blank" rel="noopener noreferrer" className="bg-white/[0.03] p-3 rounded-xl border border-white/5 flex items-center justify-between hover:bg-white/5 hover:border-white/20 transition-all group decoration-0">
                <div className="flex flex-col">
                    <span className="text-[9px] font-bold text-white/30 uppercase tracking-widest group-hover:text-white/50 transition-colors">{h?.repository || "Repository"}</span>
                    <span className="text-xs font-bold text-white group-hover:text-blue-300 transition-colors">GitHub</span>
                </div>
                <svg className="w-4 h-4 text-white/20 group-hover:text-white transition-colors" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
            </a>
            <a href="https://github.com/sutchan/auraflux/issues" target="_blank" rel="noopener noreferrer" className="bg-white/[0.03] p-3 rounded-xl border border-white/5 flex items-center justify-between hover:bg-white/5 hover:border-white/20 transition-all group decoration-0">
                <div className="flex flex-col">
                    <span className="text-[9px] font-bold text-white/30 uppercase tracking-widest">{h?.support || "Support"}</span>
                    <span className="text-xs font-bold text-white group-hover:text-red-300 transition-colors">{h?.reportBug || "Report Bug"}</span>
                </div>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white/20 group-hover:text-white transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
            </a>
        </div>
        
        <div className="text-center pt-6 border-t border-white/5">
             <div className="inline-flex items-center gap-3 px-4 py-1 rounded-full bg-white/[0.03] border border-white/5">
                <span className="text-[10px] font-mono text-white/40">{t?.version || "Build"} v{APP_VERSION}</span>
                <span className="w-px h-3 bg-white/10"></span>
                <span className="text-[10px] font-mono text-white/40">&copy; {new Date().getFullYear()} Aura Vision</span>
             </div>
        </div>
    </div>
);
