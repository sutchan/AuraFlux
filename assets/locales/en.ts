/**
 * File: assets/locales/en.ts
 * Version: 1.7.1
 * Author: Aura Vision Team
 * Copyright (c) 2024 Aura Vision. All rights reserved.
 */

import { VisualizerMode, LyricsStyle } from '../../core/types';

export const en = {
  common: {
    on: 'ON',
    off: 'OFF',
    visible: 'VISIBLE',
    hidden: 'HIDDEN',
    active: 'ACTIVE',
    muted: 'MUTED',
    beta: 'BETA',
    simple: 'SIMPLE',
    advanced: 'ADVANCED'
  },
  tabs: {
    visual: 'Visual',
    text: 'Text',
    audio: 'Audio',
    ai: 'AI Synesthesia',
    system: 'System'
  },
  hints: {
    mode: 'Select the core mathematical engine for generating visuals.',
    theme: 'Apply a curated color palette to the scene.',
    speed: 'Adjusts the time-scale. Low values are hypnotic; high values are energetic.',
    glow: 'Enable post-processing bloom. Disable to improve performance on low-end devices.',
    trails: 'Controls pixel persistence. High values create fluid, paint-like motion.',
    sensitivity: 'Amplifies the visual reaction to audio. Increase for quiet environments.',
    smoothing: 'Temporal damping. Higher values yield liquid-like movement; lower values are twitchy.',
    fftSize: 'Spectral resolution. 4096 provides fine detail but consumes more CPU.',
    lyrics: 'Toggle AI-powered song identification and lyric fetching.',
    lyricsStyle: 'Customize the visual presentation of the synchronized lyrics.',
    region: 'Bias the AI search engine towards music from this specific market.',
    autoRotate: 'Automatically cycle through different visual engines over time.',
    rotateInterval: 'Time in seconds before switching to the next visual engine.',
    cycleColors: 'Automatically transition between color themes over time.',
    colorInterval: 'Time in seconds before smoothly blending to the next color palette.',
    reset: 'Restore all application settings to factory defaults.',
    confirmReset: 'Confirm Reset? This action cannot be undone.',
    resetVisual: 'Reset only aesthetics (Speed, Glow, Trails) to defaults.',
    randomize: 'Generate a serendipitous combination of visual mode and colors.',
    fullscreen: 'Toggle immersive full-screen mode.',
    help: 'View keyboard shortcuts and documentation.',
    mic: 'Activate or mute microphone input.',
    device: 'Select the hardware audio input source.',
    monitor: 'Pass microphone input to speakers. WARNING: Can cause loud feedback loops.',
    wakeLock: 'Prevent the screen from turning off while the visualizer is active.',
    showFps: 'Display a real-time frames-per-second counter.',
    showTooltips: 'Enable helpful floating hints when hovering over controls.',
    doubleClickFullscreen: 'Toggle fullscreen mode by double-clicking anywhere on the visualizer.',
    autoHideUi: 'Automatically hide the control panel after a period of inactivity.',
    mirrorDisplay: 'Flip the visualizer output horizontally (useful for rear projection or webcams).',
    showCustomText: 'Toggle the visibility of your custom message overlay.',
    textPulse: 'Text scales dynamically with the rhythm of the music.',
    textAudioReactive: 'Text opacity and size react to live audio amplitude.',
    customTextCycleColor: 'Automatically cycle through the color spectrum for the text.',
    hideCursor: 'Automatically hide the mouse cursor after inactivity.'
  },
  visualizerMode: 'Visual Engine',
  styleTheme: 'Color Theme',
  settings: 'Tuning',
  sensitivity: 'Response Sensitivity',
  speed: 'Evolution Speed',
  glow: 'Neon Bloom',
  trails: 'Motion Trails',
  autoRotate: 'Engine Auto-Cycle',
  rotateInterval: 'Interval (s)',
  cycleColors: 'Auto-Cycle Colors',
  colorInterval: 'Interval (s)',
  cycleSpeed: 'Cycle Duration (s)',
  monitorAudio: 'Monitor Audio',
  audioInput: 'Input Device',
  lyrics: 'AI Synesthesia',
  showLyrics: 'Enable Recognition',
  displaySettings: 'Display Settings',
  language: 'Interface Language',
  region: 'Target Market',
  startMic: 'Enable Audio',
  stopMic: 'Disable Audio',
  listening: 'Active',
  identifying: 'AI Analyzing...',
  startExperience: 'Launch Experience',
  welcomeTitle: 'Aura Flux | The Sound of Light',
  welcomeText: 'Transmute every vibration into generative masterpieces. Powered by Gemini AI for real-time recognition, experience the ultimate synesthetic journey.',
  unsupportedTitle: 'Incompatible Browser',
  unsupportedText: 'Aura Flux requires modern Web Audio and Media features. Please switch to a recent version of Chrome, Edge, or Safari to continue.',
  hideOptions: 'Collapse',
  showOptions: 'Expand Options',
  reset: 'Reset System',
  resetVisual: 'Reset Aesthetics',
  resetText: 'Reset Text',
  resetAudio: 'Reset Audio',
  resetAi: 'Reset AI',
  randomize: 'Smart Random',
  help: 'Support',
  close: 'Dismiss',
  betaDisclaimer: 'AI Recognition is currently in Beta.',
  wrongSong: 'Not the right song?',
  hideCursor: 'Hide Cursor',
  customColor: 'Custom',
  randomizeTooltip: 'Randomize all visual settings',
  smoothing: 'Smoothing',
  fftSize: 'Resolution (FFT)',
  appInfo: 'About App',
  appDescription: 'An immersive visualization suite driven by real-time spectral analysis and Gemini AI recognition.',
  version: 'Build',
  defaultMic: 'Default Microphone',
  customText: 'Custom Text Content',
  textProperties: 'Typography & Layout',
  customTextPlaceholder: 'ENTER TEXT',
  showText: 'Show Overlay',
  pulseBeat: 'Pulse with Beat',
  textAudioReactive: 'Audio Reactive',
  textSize: 'Font Size',
  textRotation: 'Rotation',
  textFont: 'Font Family',
  textOpacity: 'Opacity',
  textPosition: 'Text Position',
  quality: 'Render Quality',
  qualities: {
    low: 'Smooth',
    med: 'Balanced',
    high: 'Ultimate'
  },
  visualPanel: {
    effects: 'Effects',
    automation: 'Automation',
    display: 'Display'
  },
  audioPanel: {
    info: 'Adjust input sensitivity and smoothing to customize how the visualizer reacts to audio dynamics. Higher FFT sizes provide more spectral detail but consume more CPU.'
  },
  systemPanel: {
    interface: 'Interface',
    behavior: 'Behavior',
    maintenance: 'Maintenance',
    engine: 'Engine',
    audio: 'Audio',
    ai: 'AI'
  },
  showFps: 'Show FPS',
  showTooltips: 'Show Tooltips',
  doubleClickFullscreen: 'Double-Click Fullscreen',
  autoHideUi: 'Auto-Hide Controls',
  mirrorDisplay: 'Mirror Display',
  presets: {
    title: 'Smart Presets',
    hint: 'Apply a curated aesthetic combination with one click.',
    select: 'Select a mood...',
    custom: 'Custom / Modified',
    calm: 'Hypnotic & Calm',
    party: 'Energetic Party',
    ambient: 'Ambient Focus',
    cyberpunk: 'Cyberpunk Rush',
    retrowave: 'Retro Sunset',
    vocal: 'Vocal Focus'
  },
  recognitionSource: 'AI Provider',
  lyricsPosition: 'Lyrics Position',
  lyricsFont: 'Font Family',
  lyricsFontSize: 'Font Size',
  simulatedDemo: 'Simulated (Demo)',
  positions: {
      top: 'Top',
      center: 'Center',
      bottom: 'Bottom',
      tl: 'Top Left',
      tc: 'Top Center',
      tr: 'Top Right',
      ml: 'Mid Left',
      mc: 'Center',
      mr: 'Mid Right',
      bl: 'Bottom Left',
      bc: 'Bottom Center',
      br: 'Bottom Right'
  },
  wakeLock: 'Screen Always On',
  system: {
    shortcuts: {
      mic: 'Mic',
      ui: 'UI',
      mode: 'Mode',
      random: 'Random'
    }
  },
  errors: {
    title: 'Audio Error',
    accessDenied: 'Access denied. Please check your browser permissions for microphone.',
    noDevice: 'No audio input device found.',
    deviceBusy: 'Audio device is busy or invalid.',
    general: 'Could not access audio device.',
    tryDemo: 'Try Demo Mode (No Audio)'
  },
  aiState: {
    active: 'Recognition Active',
    enable: 'Enable AI Recognition'
  },
  regions: {
    global: 'Global',
    US: 'USA / West',
    CN: 'China',
    JP: 'Japan',
    KR: 'Korea',
    EU: 'Europe',
    LATAM: 'Latin America'
  },
  modes: {
    [VisualizerMode.NEURAL_FLOW]: 'Neural Flow',
    [VisualizerMode.CUBE_FIELD]: 'Quantum Field',
    [VisualizerMode.PLASMA]: 'Plasma Flow',
    [VisualizerMode.BARS]: 'Frequency Bars',
    [VisualizerMode.PARTICLES]: 'Starfield (Drift)',
    [VisualizerMode.TUNNEL]: 'Geometric Tunnel',
    [VisualizerMode.RINGS]: 'Neon Rings',
    [VisualizerMode.NEBULA]: 'Deep Nebula',
    [VisualizerMode.LASERS]: 'Concert Lasers',
    [VisualizerMode.FLUID_CURVES]: 'Aura Waves',
    [VisualizerMode.MACRO_BUBBLES]: 'Macro Bubbles (DoF)',
    [VisualizerMode.SILK]: 'Silk Waves',
    [VisualizerMode.LIQUID]: 'Liquid Sphere',
    [VisualizerMode.TERRAIN]: 'Low-Poly Terrain'
  },
  lyricsStyles: {
    [LyricsStyle.STANDARD]: 'Standard',
    [LyricsStyle.KARAOKE]: 'Dynamic',
    [LyricsStyle.MINIMAL]: 'Minimalist'
  },
  helpModal: {
    title: 'Aura Flux Guide',
    tabs: {
        guide: 'Guide',
        shortcuts: 'Controls',
        about: 'About'
    },
    intro: 'Aura Flux transforms your microphone input into highly responsive, generative digital art using advanced spectral analysis.',
    shortcutsTitle: 'Keyboard Shortcuts',
    gesturesTitle: 'Touch Gestures',
    shortcutItems: {
      toggleMic: 'Toggle Audio Input',
      fullscreen: 'Enter Fullscreen',
      randomize: 'Randomize Aesthetic',
      lyrics: 'Toggle AI Info',
      hideUi: 'Toggle Control Panel',
      glow: 'Toggle Bloom',
      trails: 'Toggle Motion Blur',
      changeMode: 'Cycle Modes',
      changeTheme: 'Cycle Themes'
    },
    gestureItems: {
        swipeMode: 'Swipe Horizontal: Change Mode',
        swipeSens: 'Swipe Vertical: Adjust Sensitivity',
        longPress: 'Long Press: AI Identification'
    },
    howItWorksTitle: 'How to Use',
    howItWorksSteps: [
      '1. Connect: Click "Start" to authorize microphone access for audio reactivity.',
      '2. Visualize: Play music. Use "Smart Presets" to instantly set the mood.',
      '3. Customize: Toggle "Advanced Mode" to tune Sensitivity, FFT, and enable "Custom Text".',
      '4. Interact: Swipe horizontal/vertical to change modes or sensitivity. Long-press for AI.',
      '5. Explore: Press H for options, F for fullscreen, or R to randomize.'
    ],
    settingsTitle: 'Parameter Guide',
    settingsDesc: {
      sensitivity: 'Gain control for audio-reactive elements.',
      speed: 'Temporal frequency of the generative patterns.',
      glow: 'Bloom intensity for atmospheric depth.',
      trails: 'Temporal accumulation for fluid movement.',
      smoothing: 'Temporal damping of the frequency data.',
      fftSize: 'Sub-band count for spectral resolution.'
    },
    projectInfoTitle: 'Project Description',
    aboutDescription: 'A next-generation synesthetic experience. Aura Flux fuses high-precision Web Audio spectral analysis with Google Gemini 3 to transform sound into living, reactive light. Designed for VJs, Streamers, and immersive environments.',
    privacyTitle: 'Privacy Policy',
    privacyText: 'Audio is analyzed locally. Temporary high-frequency snapshots are sent to Gemini solely for identification.',
    version: 'Release',
    coreTech: 'Core Technology',
    repository: 'Repository',
    support: 'Support',
    reportBug: 'Report Bug'
  },
  onboarding: {
    welcome: 'Welcome to Aura Flux',
    subtitle: 'Next-Gen AI Synesthesia Engine',
    selectLanguage: 'Choose your language',
    next: 'Proceed',
    back: 'Previous',
    skip: 'Skip',
    finish: 'Launch App',
    features: {
      title: 'Experience Features',
      visuals: {
        title: 'Generative Masterpieces',
        desc: '12+ reactive engines powered by WebGL and math-driven procedural art.'
      },
      ai: {
        title: 'Gemini AI Intelligence',
        desc: 'Instant recognition of tracks and aesthetic mood through advanced AI grounding.'
      },
      privacy: {
        title: 'Secure & Private',
        desc: 'Processing stays local. We never record or store your private audio data.'
      }
    },
    shortcuts: {
      title: 'Dynamic Controls',
      desc: 'Master your environment with these keys.'
    }
  }
};