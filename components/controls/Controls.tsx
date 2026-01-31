/**
 * File: components/controls/Controls.tsx
 * Version: 1.8.33
 * Author: Aura Vision Team
 * Updated: 2025-03-24 19:10 - Fix touch interaction
 */

import React, { useState, useEffect } from 'react';
import { ActionButton } from '../ui/controls/ActionButton';
import { VisualSettingsPanel } from './panels/VisualSettingsPanel';
import { SystemSettingsPanel } from './panels/SystemSettingsPanel';
import { CustomTextSettingsPanel } from './panels/CustomTextSettingsPanel';
import { AudioSettingsPanel } from './panels/AudioSettingsPanel';
import { StudioPanel } from './panels/StudioPanel';
import { PlaybackPanel } from './panels/PlaybackPanel';
import { HelpModal } from '../ui/HelpModal';
import { useVisuals, useAI, useAudioContext, useUI } from '../AppContext';
import { BottomBar } from './BottomBar';
import { TooltipArea } from '../ui/controls/Tooltip';
import { VISUALIZER_PRESETS, COLOR_THEMES } from '../../core/constants';
import { VisualizerMode } from '../../core/types';

type TabType = 'visual' | 'input' | 'playback' | 'text' | 'studio' | 'system';

const TAB_ICONS: Record<TabType, React.ReactNode> = {
  visual: <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>,
  input: <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>,
  playback: <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" /></svg>,
  text: <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" /></svg>,
  studio: <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14v-4" /></svg>,
  system: <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
};

interface ControlsProps {
    isExpanded: boolean;
    setIsExpanded: (val: boolean | ((prev: boolean) => boolean)) => void;
    isIdle: boolean;
}

const Controls: React.FC<ControlsProps> = ({ isExpanded, setIsExpanded, isIdle }) => {
  const { settings, setSettings, randomizeSettings, mode, setMode, setColorTheme } = useVisuals();
  const { showLyrics, setShowLyrics } = useAI();
  const { toggleMicrophone, sourceType, togglePlayback, playNext, playPrev, selectedDeviceId, isPlaying } = useAudioContext();
  const { t, toggleFullscreen } = useUI();

  const [activeTab, setActiveTab] = useState<TabType>('visual');
  const [showHelpModal, setShowHelpModal] = useState(false);
  
  const tabs: TabType[] = settings.uiMode === 'simple' 
    ? ['visual', 'input', 'playback', 'system']
    : ['visual', 'input', 'text', 'playback', 'studio', 'system'];

  useEffect(() => {
    if (!tabs.includes(activeTab)) {
        setActiveTab('visual');
    }
  }, [settings.uiMode, activeTab, tabs]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'SELECT' || target.tagName === 'TEXTAREA') return;
      if (e.ctrlKey || e.altKey || e.metaKey) return;

      const modes = Object.keys(VISUALIZER_PRESETS) as VisualizerMode[];

      switch (e.code) {
        case 'Space': 
            e.preventDefault(); 
            if (sourceType === 'FILE') togglePlayback();
            else toggleMicrophone(selectedDeviceId); 
            break;
        case 'KeyF': toggleFullscreen(); break;
        case 'KeyR': randomizeSettings(); break;
        case 'KeyL': setShowLyrics(!showLyrics); break;
        case 'KeyH': setIsExpanded(prev => !prev); break;
        case 'KeyG': setSettings(s => ({ ...s, glow: !s.glow })); break;
        case 'KeyT': setSettings(s => ({ ...s, trails: !s.trails })); break;
        case 'Escape': 
            if (showHelpModal) setShowHelpModal(false);
            else if (isExpanded) setIsExpanded(false); 
            break;
        case 'KeyN': if (sourceType === 'FILE') playNext(); break;
        case 'KeyP': if (sourceType === 'FILE') playPrev(); break;
        case 'ArrowRight':
            if (sourceType === 'FILE' && e.shiftKey) playNext();
            else {
                const nextIdx = (modes.indexOf(mode) + 1) % modes.length;
                setMode(modes[nextIdx]);
            }
            break;
        case 'ArrowLeft':
            if (sourceType === 'FILE' && e.shiftKey) playPrev();
            else {
                const prevIdx = (modes.indexOf(mode) - 1 + modes.length) % modes.length;
                setMode(modes[prevIdx]);
            }
            break;
        case 'ArrowUp':
            e.preventDefault();
            if (e.shiftKey) setSettings(s => ({ ...s, speed: Math.min(3.0, Number((s.speed + 0.1).toFixed(1))) }));
            else setSettings(s => ({ ...s, sensitivity: Math.min(4.0, Number((s.sensitivity + 0.1).toFixed(1))) }));
            break;
        case 'ArrowDown':
            e.preventDefault();
            if (e.shiftKey) setSettings(s => ({ ...s, speed: Math.max(0.1, Number((s.speed - 0.1).toFixed(1))) }));
            else setSettings(s => ({ ...s, sensitivity: Math.max(0.5, Number((s.sensitivity - 0.1).toFixed(1))) }));
            break;
        case 'Digit1': if (tabs.includes('visual')) setActiveTab('visual'); if(!isExpanded) setIsExpanded(true); break;
        case 'Digit2': if (tabs.includes('input')) setActiveTab('input'); if(!isExpanded) setIsExpanded(true); break;
        case 'Digit3': 
            if (settings.uiMode === 'simple') { if (tabs.includes('playback')) setActiveTab('playback'); }
            else { if (tabs.includes('text')) setActiveTab('text'); }
            if(!isExpanded) setIsExpanded(true); 
            break;
        case 'Digit4': 
            if (settings.uiMode === 'simple') { if (tabs.includes('system')) setActiveTab('system'); }
            else { if (tabs.includes('playback')) setActiveTab('playback'); }
            if(!isExpanded) setIsExpanded(true); 
            break;
        case 'Digit5': if (tabs.includes('studio')) setActiveTab('studio'); if(!isExpanded) setIsExpanded(true); break;
        case 'Digit6': if (tabs.includes('system')) setActiveTab('system'); if(!isExpanded) setIsExpanded(true); break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [settings, showLyrics, toggleMicrophone, randomizeSettings, setShowLyrics, setSettings, sourceType, togglePlayback, playNext, playPrev, mode, setMode, isExpanded, showHelpModal, setIsExpanded, toggleFullscreen, tabs, selectedDeviceId]);

  return (
    <>
      <BottomBar 
        isExpanded={isExpanded} 
        setIsExpanded={setIsExpanded} 
        toggleFullscreen={toggleFullscreen} 
        isIdle={isIdle} 
      />
      
      {isExpanded && (
        <div className="fixed bottom-0 left-0 w-full z-[120] bg-[#050505]/85 backdrop-blur-xl border-t border-white/10 transition-all duration-700 shadow-[0_-25px_100px_rgba(0,0,0,0.9)] opacity-100 flex flex-col animate-fade-in-up pointer-events-auto touch-auto">
          <div className="max-h-[85dvh] md:max-h-[60vh] overflow-y-auto custom-scrollbar relative flex flex-col">
            
            <div className="sticky top-0 z-50 bg-[#0a0a0c] border-b border-white/10 px-4 md:px-6 py-2 shadow-xl">
                <div className="max-w-5xl mx-auto flex flex-col lg:flex-row justify-between items-stretch lg:items-center gap-2">
                    <div className="flex bg-white/[0.04] p-0.5 rounded-lg overflow-x-auto max-w-full scrollbar-hide gap-0.5 mask-fade-right touch-pan-x" role="tablist">
                    {tabs.map((tab, index) => (
                        <TooltipArea key={tab} text={`${t?.tabs?.[tab] || tab} [${index + 1}]`} className="flex-shrink-0">
                            <button 
                            onClick={() => setActiveTab(tab)} 
                            className={`px-3 py-1.5 md:px-4 rounded-md text-[11px] font-bold uppercase tracking-wider transition-all duration-300 w-full h-full whitespace-nowrap flex items-center gap-1.5 ${activeTab === tab ? 'bg-blue-600 text-white shadow-lg' : 'text-white/40 hover:text-white hover:bg-white/5'}`}>
                            {TAB_ICONS[tab]}
                            <span>{t?.tabs?.[tab] || tab}</span>
                            </button>
                        </TooltipArea>
                    ))}
                    </div>
                    
                    <div className="flex items-center justify-between lg:justify-end gap-2 md:gap-3">
                    {sourceType === 'FILE' && (
                        <div className="bg-white/5 p-0.5 rounded-lg flex items-center border border-white/5 shrink-0">
                            <TooltipArea text={isPlaying ? t?.player?.pause : t?.player?.play}>
                                <button onClick={togglePlayback} className="w-8 h-7 flex items-center justify-center rounded hover:bg-white/10 text-white/80 hover:text-white transition-colors">
                                    {isPlaying ? <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg> : <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>}
                                </button>
                            </TooltipArea>
                            <div className="w-px h-4 bg-white/10 mx-0.5"></div>
                            <TooltipArea text={t?.player?.next}>
                                <button onClick={playNext} className="w-8 h-7 flex items-center justify-center rounded hover:bg-white/10 text-white/80 hover:text-white transition-colors">
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/></svg>
                                </button>
                            </TooltipArea>
                        </div>
                    )}

                    <div className="w-px h-5 bg-white/10 mx-1 hidden lg:block"></div>
                    <div className="flex items-center gap-1.5">
                        <div className="hidden md:flex gap-1.5">
                            <ActionButton onClick={randomizeSettings} hintText={`${t?.hints?.randomize || "Randomize"} [R]`} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>} />
                            <ActionButton onClick={toggleFullscreen} hintText={`${t?.hints?.fullscreen || "Fullscreen"} [F]`} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" /></svg>} />
                        </div>
                        <button onClick={() => setIsExpanded(false)} className="w-8 h-8 flex items-center justify-center bg-blue-600 rounded-lg text-white shadow-[0_4px_15px_rgba(37,99,235,0.3)] hover:bg-blue-500 transition-all duration-300" aria-label={t?.hideOptions}><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 15l7-7 7 7" /></svg></button>
                    </div>
                    </div>
                </div>
            </div>
            
            <div className="p-3 md:p-4 pb-safe">
              <div className="max-w-5xl mx-auto">
                <div className="bg-transparent min-h-[25vh] md:min-h-[200px]" role="tabpanel">
                    {activeTab === 'visual' && <VisualSettingsPanel />}
                    {activeTab === 'input' && <AudioSettingsPanel />}
                    {activeTab === 'text' && <CustomTextSettingsPanel />}
                    {activeTab === 'playback' && <PlaybackPanel />}
                    {activeTab === 'studio' && <StudioPanel />}
                    {activeTab === 'system' && <SystemSettingsPanel />}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {showHelpModal && <HelpModal onClose={() => setShowHelpModal(false)} />}
    </>
  );
};

export default Controls;