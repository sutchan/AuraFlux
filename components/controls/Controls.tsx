/**
 * File: components/controls/Controls.tsx
 * Version: 1.1.2
 * Author: Aura Vision Team
 * Copyright (c) 2024 Aura Vision. All rights reserved.
 * Updated: 2025-02-24 10:00
 */

import React, { useState, useEffect } from 'react';
import { ActionButton } from '../ui/controls/ActionButton';
import { VisualSettingsPanel } from './panels/VisualSettingsPanel';
import { AudioSettingsPanel } from './panels/AudioSettingsPanel';
import { AiSettingsPanel } from './panels/AiSettingsPanel';
import { SystemSettingsPanel } from './panels/SystemSettingsPanel';
import { CustomTextSettingsPanel } from './panels/CustomTextSettingsPanel';
import { HelpModal } from '../ui/HelpModal';
import { useIdleTimer } from '../../core/hooks/useIdleTimer';
import { useVisuals, useAI, useAudioContext, useUI } from '../AppContext';
import { MiniControls } from './MiniControls';
import { TooltipArea } from '../ui/controls/Tooltip';

type TabType = 'visual' | 'text' | 'audio' | 'ai' | 'system';

const TAB_ICONS: Record<TabType, React.ReactNode> = {
  visual: <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>,
  text: <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" /></svg>,
  audio: <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" /></svg>,
  ai: <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>,
  system: <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
};

const Controls: React.FC = () => {
  const { settings, setSettings, randomizeSettings } = useVisuals();
  const { showLyrics, setShowLyrics } = useAI();
  const { toggleMicrophone } = useAudioContext();
  const { t, language } = useUI();

  const [isExpanded, setIsExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('visual');
  const [showHelpModal, setShowHelpModal] = useState(false);
  
  const { isIdle } = useIdleTimer(isExpanded, settings.autoHideUi);
  
  const toggleFullscreen = () => {
    const doc = window.document as any;
    const elem = doc.documentElement as any;

    const isFullscreen = doc.fullscreenElement || doc.webkitFullscreenElement || doc.mozFullScreenElement || doc.msFullscreenElement;

    if (!isFullscreen) {
        if (elem.requestFullscreen) {
            elem.requestFullscreen();
        } else if (elem.webkitRequestFullscreen) { // Safari
            elem.webkitRequestFullscreen();
        } else if (elem.mozRequestFullScreen) { // Firefox
            elem.mozRequestFullScreen();
        } else if (elem.msRequestFullscreen) { // IE11
            elem.msRequestFullscreen();
        }
    } else {
        if (doc.exitFullscreen) {
            doc.exitFullscreen();
        } else if (doc.webkitExitFullscreen) { // Safari
            doc.webkitExitFullscreen();
        } else if (doc.mozCancelFullScreen) { // Firefox
            doc.mozCancelFullScreen();
        } else if (doc.msExitFullscreen) { // IE11
            doc.msExitFullscreen();
        }
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'SELECT' || target.tagName === 'TEXTAREA') return;
      if (e.ctrlKey || e.altKey || e.metaKey) return;
      switch (e.code) {
        case 'Space': e.preventDefault(); toggleMicrophone(settings.recognitionProvider); break;
        case 'KeyF': toggleFullscreen(); break;
        case 'KeyR': randomizeSettings(); break;
        case 'KeyL': setShowLyrics(!showLyrics); break;
        case 'KeyH': setIsExpanded(prev => !prev); break;
        case 'KeyG': setSettings({ ...settings, glow: !settings.glow }); break;
        case 'KeyT': setSettings({ ...settings, trails: !settings.trails }); break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [settings, showLyrics, toggleMicrophone, randomizeSettings, setShowLyrics, setSettings]);

  const tabFontSize = (language === 'zh' || language === 'tw') ? 'text-xs' : 'text-xs';

  return (
    <>
      <MiniControls isExpanded={isExpanded} isIdle={isIdle} setIsExpanded={setIsExpanded} toggleFullscreen={toggleFullscreen} />
      {isExpanded && (
        // Enhanced Translucent Background
        <div className="fixed bottom-0 left-0 w-full z-[120] bg-[#050505]/85 backdrop-blur-xl border-t border-white/10 transition-all duration-700 shadow-[0_-25px_100px_rgba(0,0,0,0.9)] opacity-100 flex flex-col">
          <div className="max-h-[85dvh] md:max-h-[70vh] overflow-y-auto custom-scrollbar p-3 md:p-6 pb-safe relative flex flex-col">
            <div className="max-w-5xl mx-auto space-y-3 md:space-y-4 w-full">
              
              {/* Sticky Header */}
              <div className="sticky top-0 z-50 bg-transparent pb-2 pt-1 border-b border-white/10 flex flex-col lg:flex-row justify-between items-stretch lg:items-center gap-3">
                {/* Scrollable Tabs with Icons */}
                <div className="flex bg-white/[0.04] p-1 rounded-xl overflow-x-auto max-w-full scrollbar-hide gap-1 mask-fade-right touch-pan-x" role="tablist" aria-label="Settings Categories">
                  {(['visual', 'text', 'ai', 'audio', 'system'] as TabType[]).map(tab => (
                    <button 
                      key={tab} 
                      onClick={() => setActiveTab(tab)} 
                      role="tab"
                      aria-selected={activeTab === tab}
                      aria-controls={`panel-${tab}`}
                      id={`tab-${tab}`}
                      className={`px-4 py-2.5 md:px-5 rounded-lg ${tabFontSize} font-bold uppercase tracking-[0.2em] transition-all duration-300 flex-shrink-0 whitespace-nowrap flex items-center gap-2 ${activeTab === tab ? 'bg-white/20 text-white shadow-sm' : 'text-white/40 hover:text-white hover:bg-white/5'}`}>
                      {TAB_ICONS[tab]}
                      <span>{t?.tabs?.[tab] || tab}</span>
                    </button>
                  ))}
                </div>
                
                <div className="flex items-center justify-between lg:justify-end gap-3 md:gap-4">
                  {/* Simple/Advanced Toggle Capsule */}
                  <div className="bg-white/5 p-1 rounded-lg flex text-[10px] font-bold uppercase tracking-wider border border-white/5 flex-shrink-0">
                      <TooltipArea text={t?.hints?.uiModeSimple}>
                        <button 
                          onClick={() => setSettings({...settings, uiMode: 'simple'})} 
                          className={`px-3 py-1.5 rounded-md transition-all duration-300 ${settings.uiMode === 'simple' ? 'bg-white text-black shadow-sm' : 'text-white/40 hover:text-white hover:bg-white/5'}`}
                        >
                          {t?.common?.simple || 'SIMPLE'}
                        </button>
                      </TooltipArea>
                      <TooltipArea text={t?.hints?.uiModeAdvanced}>
                        <button 
                          onClick={() => setSettings({...settings, uiMode: 'advanced'})} 
                          className={`px-3 py-1.5 rounded-md transition-all duration-300 ${settings.uiMode === 'advanced' ? 'bg-white text-black shadow-sm' : 'text-white/40 hover:text-white hover:bg-white/5'}`}
                        >
                          {t?.common?.advanced || 'ADVANCED'}
                        </button>
                      </TooltipArea>
                  </div>

                  <div className="w-px h-6 bg-white/10 mx-1 hidden lg:block"></div>

                  <div className="flex items-center gap-2">
                    <div className="hidden md:flex gap-2">
                        <ActionButton onClick={() => setShowHelpModal(true)} hintText={t?.hints?.help || "Help & Info"} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.546-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>} />
                        <ActionButton onClick={randomizeSettings} hintText={`${t?.hints?.randomize || "Randomize"} [R]`} icon={<span className="font-bold">R</span>} />
                        <ActionButton onClick={toggleFullscreen} hintText={`${t?.hints?.fullscreen || "Fullscreen"} [F]`} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M20 8V4m0 0h-4M4 16v4m0 0h4M20 16v4m0 0h-4" /></svg>} />
                    </div>
                    
                    <button onClick={() => setIsExpanded(false)} className="w-10 h-10 flex items-center justify-center bg-blue-600 rounded-xl text-white shadow-[0_4px_20px_rgba(37,99,235,0.4)] hover:bg-blue-500 transition-all duration-300 flex-shrink-0" aria-label={t?.hideOptions || "Collapse"}><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" /></svg></button>
                  </div>
                </div>
              </div>
              
              <div 
                className="bg-black/20 border border-white/5 rounded-2xl overflow-hidden min-h-[40vh] md:min-h-[240px]"
                role="tabpanel"
                id={`panel-${activeTab}`}
                aria-labelledby={`tab-${activeTab}`}
              >
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-0 items-stretch">
                  {activeTab === 'visual' && <VisualSettingsPanel />}
                  {activeTab === 'text' && <CustomTextSettingsPanel />}
                  {activeTab === 'audio' && <AudioSettingsPanel />}
                  {activeTab === 'ai' && <AiSettingsPanel />}
                  {activeTab === 'system' && <SystemSettingsPanel />}
                </div>
              </div>
              
              {/* Extra bottom padding for mobile scrolling */}
              <div className="h-16 md:h-0 w-full" />
            </div>
          </div>
        </div>
      )}
      {showHelpModal && <HelpModal onClose={() => setShowHelpModal(false)} />}
    </>
  );
};

export default Controls;