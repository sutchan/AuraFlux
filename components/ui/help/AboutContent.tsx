/**
 * File: components/ui/help/AboutContent.tsx
 * Version: 1.8.23
 * Author: Sut
 */

import React from 'react';
import { APP_VERSION } from '../../../core/constants';

interface AboutContentProps { 
  h: any; // helpModal translations
  t: any; // full translations object
}

const TechBadge = ({ label, colorClass }: { label: string, colorClass: string }) => (
  <div className={`px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 flex items-center gap-2 group hover:bg-white/10 transition-colors`}>
    <div className={`w-1.5 h-1.5 rounded-full ${colorClass}`} />
    <span className="text-[10px] font-bold text-white/70 uppercase tracking-wider">{label}</span>
  </div>
);

// @fix(AboutContent): Export component to fix import error in HelpModal.tsx
export const AboutContent: React.FC<AboutContentProps> = ({ h, t }) => {
  const tech = t?.about?.tech || {};
  
  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <h4 className="text-sm font-black text-blue-400 uppercase tracking-[0.2em] px-1">
          {h?.projectInfoTitle || "Our Vision"}
        </h4>
        <p className="text-sm text-white/70 leading-relaxed font-medium bg-white/[0.02] p-4 rounded-2xl border border-white/5">
          {h?.aboutDescription || "Aura Flux is a real-time synesthesia engine that transmutes audio frequencies into generative 3D art."}
        </p>
      </div>

      <div className="space-y-4">
        <h4 className="text-sm font-black text-purple-400 uppercase tracking-[0.2em] px-1">
          {h?.coreTech || "Core Technology"}
        </h4>
        <div className="grid grid-cols-2 gap-2">
          <TechBadge label={tech.gemini || "Gemini 3 AI"} colorClass="bg-blue-400" />
          <TechBadge label={tech.react || "React 19"} colorClass="bg-cyan-400" />
          <TechBadge label={tech.webgl || "WebGL / Three.js"} colorClass="bg-orange-400" />
          <TechBadge label={tech.audio || "Web Audio API"} colorClass="bg-green-400" />
        </div>
      </div>

      <div className="space-y-4">
        <h4 className="text-sm font-black text-green-400 uppercase tracking-[0.2em] px-1">
          {h?.privacyTitle || "Privacy Commitment"}
        </h4>
        <p className="text-xs text-white/50 leading-relaxed italic px-1">
          {h?.privacyText || "All spectral analysis and visual rendering happen locally on your device."}
        </p>
      </div>

      <div className="pt-6 border-t border-white/5 flex justify-between items-center px-1">
        <div className="flex flex-col">
          <span className="text-[10px] font-black text-white/20 uppercase tracking-widest">Version</span>
          <span className="text-xs font-mono text-white/40">{APP_VERSION}</span>
        </div>
        <div className="text-right">
          <span className="text-[10px] font-black text-white/20 uppercase tracking-widest block">Signature</span>
          <span className="text-xs font-bold text-blue-400/60">Sut / Aura Flux Team</span>
        </div>
      </div>
    </div>
  );
};