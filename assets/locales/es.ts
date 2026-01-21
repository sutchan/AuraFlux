/**
 * File: assets/locales/es.ts
 * Version: 1.6.54
 * Author: Aura Vision Team
 * Copyright (c) 2024 Aura Vision. All rights reserved.
 * Updated: 2025-02-19 17:00
 */

import { VisualizerMode, LyricsStyle } from '../../core/types';

export const es = {
  common: {
    on: 'ON',
    off: 'OFF',
    visible: 'VISIBLE',
    hidden: 'OCULTO',
    active: 'ACTIVO',
    muted: 'SILENCIADO',
    beta: 'BETA',
    simple: 'Simple',
    advanced: 'Avanzado'
  },
  tabs: {
    visual: 'Visual',
    text: 'Texto',
    audio: 'Audio',
    ai: 'Identificación IA',
    system: 'Sistema'
  },
  hints: {
    mode: 'Selecciona el motor matemático principal para la generación visual.',
    theme: 'Aplica una paleta de colores curada a la escena.',
    speed: 'Multiplicador de tiempo. Valores bajos son hipnóticos; altos son enérgicos.',
    glow: 'Activa el resplandor de post-procesamiento. Desactívalo para mejorar el rendimiento.',
    trails: 'Controla la persistencia de píxeles. Valores altos crean un movimiento fluido tipo pintura.',
    sensitivity: 'Amplifica la reacción visual al audio. Aumentar para entornos silenciosos.',
    smoothing: 'Amortiguación temporal. Valores altos dan fluidez líquida; bajos son más nerviosos.',
    fftSize: 'Resolución espectral. 4096 ofrece detalles finos pero consume más CPU.',
    lyrics: 'Letras IA síncronas para visualización.',
    lyricsStyle: 'Personaliza la presentación visual de las letras sincronizadas.',
    region: 'Orienta el motor de búsqueda IA hacia la música de este mercado específico.',
    autoRotate: 'Cicla automáticamente a través de diferentes motores visuales.',
    rotateInterval: 'Tiempo en segundos antes de cambiar al siguiente motor visual.',
    cycleColors: 'Realiza transiciones suaves automáticas entre temas de color.',
    colorInterval: 'Tiempo en segundos antes de mezclarse con la siguiente paleta.',
    reset: 'Restaura toda la configuración a los valores de fábrica.',
    confirmReset: '¿Confirmar reinicio? Esta acción no se puede deshacer.',
    resetVisual: 'Restablece solo estética (Velocidad, Brillo, Estelas).',
    randomize: 'Genera una combinación inesperada de modo visual y colores.',
    fullscreen: 'Alterna el modo inmersivo de pantalla completa.',
    help: 'Ver atajos de teclado y documentación.',
    mic: 'Activa o silencia la entrada del micrófono.',
    device: 'Selecciona la fuente de entrada de audio de hardware.',
    monitor: 'Envía el audio a los altavoces (Cuidado: puede causar retroalimentación).',
    wakeLock: 'Evita que la pantalla se apague mientras el visualizador está activo.',
    showFps: 'Muestra un contador de fotogramas por segundo en tiempo real.',
    showTooltips: 'Muestra pistas flotantes al pasar el ratón por los controles.',
    doubleClickFullscreen: 'Alterna pantalla completa haciendo doble clic en cualquier lugar.',
    autoHideUi: 'Oculta automáticamente los controles tras un periodo de inactividad.',
    mirrorDisplay: 'Voltea la imagen horizontalmente (útil para retroproyección o webcams).',
    showCustomText: 'Alterna la visibilidad de tu capa de texto personalizado.',
    textPulse: 'El texto escala dinámicamente con el ritmo de la música.',
    textAudioReactive: 'La opacidad y el tamaño del texto reaccionan al volumen.',
    customTextCycleColor: 'Cicla automáticamente por el espectro de colores para el texto.',
    hideCursor: 'Ocultar Cursor tras inactividad.'
  },
  visualizerMode: 'Modo Visualizador',
  styleTheme: 'Tema Visual',
  settings: 'Avanzado',
  sensitivity: 'Sensibilidad',
  speed: 'Velocidad de Evolución',
  glow: 'Resplandor Neón',
  trails: 'Estelas de Movimiento',
  autoRotate: 'Ciclo de Modos',
  rotateInterval: 'Intervalo (s)',
  cycleColors: 'Ciclo de Colores',
  colorInterval: 'Intervalo (s)',
  cycleSpeed: 'Duración Ciclo (s)',
  monitorAudio: 'Monitor de Audio',
  audioInput: 'Dispositivo de Entrada',
  lyrics: 'Letras IA',
  showLyrics: 'Habilitar Reconocimiento',
  displaySettings: 'Configuración de Pantalla',
  language: 'Idioma del Sistema',
  region: 'Mercado de Referencia',
  startMic: 'Activar Captura',
  stopMic: 'Detener Captura',
  listening: 'Escuchando',
  identifying: 'IA Analizando pista...',
  startExperience: 'Lanzar Experiencia',
  welcomeTitle: 'Aura Flux | El Sonido de la Luz',
  welcomeText: 'Transmuta cada vibración en una obra maestra generativa. Impulsado por Gemini AI para reconocimiento en tiempo real, vive el viaje sinestésico definitivo.',
  unsupportedTitle: 'Navegador no compatible',
  unsupportedText: 'Aura Flux requiere funciones modernas de Web Audio. Por favor, usa una versión reciente de Chrome, Edge o Safari.',
  hideOptions: 'Contraer',
  showOptions: 'Descripción',
  reset: 'Reiniciar Sistema',
  resetVisual: 'Reiniciar Estética',
  resetText: 'Reiniciar Texto',
  resetAudio: 'Reiniciar Audio',
  resetAi: 'Reiniciar IA',
  randomize: 'Aleatorio Inteligente',
  help: 'Soporte y Guía',
  close: 'Cerrar',
  betaDisclaimer: 'El reconocimiento por IA está en fase Beta.',
  wrongSong: '¿Canción incorrecta? Reintentar',
  hideCursor: 'Ocultar Cursor',
  customColor: 'Color de Texto',
  randomizeTooltip: 'Aleatorizar estética visual (R)',
  smoothing: 'Suavizado',
  fftSize: 'Resolución (FFT)',
  appInfo: 'Sobre Aura Flux',
  appDescription: 'Una suite de visualización inmersiva impulsada por análisis espectral y IA Gemini.',
  version: 'Versión',
  defaultMic: 'Micrófono Predeterminado',
  customText: 'Texto Personalizado',
  textProperties: 'Tipografía y Diseño',
  customTextPlaceholder: 'ESCRIBE AQUÍ',
  showText: 'Mostrar Superposición',
  pulseBeat: 'Pulsar con el Ritmo',
  textSize: 'Tamaño de Fuente',
  textRotation: 'Rotación',
  textFont: 'Fuente',
  textOpacity: 'Opacidad',
  textPosition: 'Posición',
  quality: 'Calidad de Renderizado',
  qualities: {
    low: 'Baja',
    med: 'Media',
    high: 'Alta'
  },
  visualPanel: {
    effects: 'Efectos',
    automation: 'Automatización',
    display: 'Visualización'
  },
  audioPanel: {
    info: 'Ajusta la sensibilidad y el suavizado para personalizar cómo reacciona el visualizador. Resoluciones FFT más altas ofrecen más detalle pero consumen más CPU.'
  },
  systemPanel: {
    interface: 'Interfaz',
    behavior: 'Comportamiento',
    maintenance: 'Mantenimiento',
    engine: 'Motor',
    audio: 'Audio',
    ai: 'IA'
  },
  showFps: 'Mostrar FPS',
  showTooltips: 'Mostrar Ayuda',
  doubleClickFullscreen: 'Doble Clic Fullscreen',
  autoHideUi: 'Ocultar UI auto.',
  mirrorDisplay: 'Espejar Pantalla',
  presets: {
    title: 'Ajustes Inteligentes',
    hint: 'Aplica combinaciones estéticas profesionales con un clic.',
    select: 'Elige un ambiente...',
    custom: 'Personalizado / Modificado',
    calm: 'Hipnótico y Calmo',
    party: 'Fiesta Energética',
    ambient: 'Enfoque Ambiental',
    cyberpunk: 'Frenesí Cyberpunk',
    retrowave: 'Ocaso Retro',
    vocal: 'Enfoque Vocal'
  },
  recognitionSource: 'Proveedor de IA',
  lyricsPosition: 'Posición de Letras',
  lyricsFont: 'Fuente',
  lyricsFontSize: 'Tamaño',
  simulatedDemo: 'Simulado (Demo)',
  positions: {
      top: 'Arriba',
      center: 'Centro',
      bottom: 'Abajo',
      tl: 'Sup. Izquierda',
      tc: 'Sup. Centro',
      tr: 'Sup. Derecha',
      ml: 'Med. Izquierda',
      mc: 'Centro',
      mr: 'Med. Derecha',
      bl: 'Inf. Izquierda',
      bc: 'Inf. Centro',
      br: 'Inf. Derecha'
  },
  wakeLock: 'No dormir pantalla',
  system: {
    shortcuts: {
      mic: 'Micro',
      ui: 'Interfaz',
      mode: 'Modo',
      random: 'Azar'
    }
  },
  errors: {
    title: 'Error de Audio',
    accessDenied: 'Acceso denegado. Revisa los permisos del micrófono en tu navegador.',
    noDevice: 'No se detectó ningún dispositivo de entrada.',
    deviceBusy: 'El dispositivo está ocupado o no es válido.',
    general: 'No se pudo acceder al audio.',
    tryDemo: 'Modo Demo (Sin Audio)'
  },
  aiState: {
    active: 'Identificación Activa',
    enable: 'Habilitar Reconocimiento'
  },
  regions: {
    global: 'Global',
    US: 'EE.UU. / Occidente',
    CN: 'China',
    JP: 'Japón',
    KR: 'Corea',
    EU: 'Europa',
    LATAM: 'Latinoamérica'
  },
  modes: {
    [VisualizerMode.NEURAL_FLOW]: 'Flujo Neuronal (WebGL)',
    [VisualizerMode.CUBE_FIELD]: 'Campo Cuántico (WebGL)',
    [VisualizerMode.PLASMA]: 'Flujo de Plasma',
    [VisualizerMode.BARS]: 'Espectro de Barras',
    [VisualizerMode.PARTICLES]: 'Viaje Estelar',
    [VisualizerMode.TUNNEL]: 'Túnel Geométrico',
    [VisualizerMode.RINGS]: 'Anillos de Resonancia',
    [VisualizerMode.NEBULA]: 'Nebulosa Profunda',
    [VisualizerMode.LASERS]: 'Matriz de Láseres',
    [VisualizerMode.FLUID_CURVES]: 'Danza de Auroras',
    [VisualizerMode.MACRO_BUBBLES]: 'Burbujas Macro (DoF)',
    [VisualizerMode.SILK]: 'Seda Flotante (WebGL)',
    [VisualizerMode.LIQUID]: 'Planeta Líquido (WebGL)',
    [VisualizerMode.WAVEFORM]: 'Forma de onda elegante'
  },
  lyricsStyles: {
    [LyricsStyle.STANDARD]: 'Diseño Estándar',
    [LyricsStyle.KARAOKE]: 'Dinámico',
    [LyricsStyle.MINIMAL]: 'Minimalista'
  },
  helpModal: {
    title: 'Guía de Aura Flux',
    tabs: {
        guide: 'Guía',
        shortcuts: 'Atajos',
        about: 'Acerca de'
    },
    intro: 'Aura Flux transforma la señal de tu micrófono en arte digital generativo altamente reactivo mediante análisis espectral avanzado.',
    shortcutsTitle: 'Interacción por Teclado',
    gesturesTitle: 'Gestos Táctiles',
    shortcutItems: {
      toggleMic: 'Activar/Desactivar Audio',
      fullscreen: 'Pantalla Completa',
      randomize: 'Estética al Azar',
      lyrics: 'Info de Pista IA',
      hideUi: 'Panel de Control',
      glow: 'Efecto Brillo',
      trails: 'Estelas de Movimiento',
      changeMode: 'Cambiar Modo',
      changeTheme: 'Cambiar Colores'
    },
    gestureItems: {
        swipeMode: 'Deslizar Horizontal: Cambiar Modo',
        swipeSens: 'Deslizar Vertical: Ajustar Sensibilidad',
        longPress: 'Pulsación Larga: Info IA'
    },
    howItWorksTitle: 'Cómo usar',
    howItWorksSteps: [
      '1. Conectar: Haz clic en "Lanzar" y autoriza el micrófono.',
      '2. Visualizar: Reproduce música. Usa "Ajustes Inteligentes" para cambiar de ambiente.',
      '3. Personalizar: Activa el "Modo Avanzado" para ajustar sensibilidad, FFT y "Texto Personalizado".',
      '4. Interactuar: Desliza para cambiar modo/sensibilidad. Mantén pulsado para IA.',
      '5. Explorar: H para opciones, F para pantalla completa, R para aleatorio.'
    ],
    settingsTitle: 'Guía de Parámetros',
    settingsDesc: {
      sensitivity: 'Control de ganancia para la reactividad visual.',
      speed: 'Frecuencia temporal de los patrones generativos.',
      glow: 'Intensidad de la iluminación atmosférica.',
      trails: 'Acumulación temporal para un movimiento fluido.',
      smoothing: 'Suavizado de los datos de frecuencia.',
      fftSize: 'Precisión del análisis espectral.'
    },
    projectInfoTitle: 'Descripción del Proyecto',
    aboutDescription: 'Una experiencia sinestésica de próxima generación. Aura Flux fusiona el análisis espectral de alta precisión con IA Gemini 3 para transformar el sonido en luz viva. Diseñado para VJs, streamers y ambientes inmersivos.',
    privacyTitle: 'Privacidad y Seguridad',
    privacyText: 'El análisis de audio es local. Solo se envían firmas espectrales cifradas a Gemini para la identificación, nunca audio real.',
    version: 'Lanzamiento',
    coreTech: 'Tecnología Principal',
    repository: 'Repositorio',
    support: 'Soporte',
    reportBug: 'Reportar Error'
  },
  onboarding: {
    welcome: 'Bienvenido a Aura Flux',
    subtitle: 'Motor de Sinestesia AI de Nueva Generación',
    selectLanguage: 'Elige tu idioma',
    next: 'Continuar',
    back: 'Atrás',
    skip: 'Omitir',
    finish: 'Lanzar App',
    features: {
      title: 'Características Principales',
      visuals: {
        title: 'Obras Generativas',
        desc: '12+ motores basados en WebGL que materializan las ondas sonoras.'
      },
      ai: {
        title: 'Cerebro Gemini AI',
        desc: 'Identificación instantánea de pistas y estados de ánimo con Google Gemini 3.'
      },
      privacy: {
        title: 'Seguro y Privado',
        desc: 'El procesamiento es local. Jamás grabamos o almacenamos tus datos de audio privados.'
      }
    },
    shortcuts: {
      title: 'Control Dinámico',
      desc: 'Domina el entorno con estas teclas.'
    }
  }
};