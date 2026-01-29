/**
 * File: assets/locales/es.ts
 * Version: 2.2.0
 * Author: Sut
 * Updated: 2025-03-10 21:00
 */

import { en } from './en';

export const es = {
  ...en,
  common: {
    on: 'ENCENDIDO', off: 'APAGADO', visible: 'VISIBLE', hidden: 'OCULTO', active: 'ACTIVO', muted: 'SILENCIO', beta: 'BETA', simple: 'SIMPLE', advanced: 'AVANZADO', new: 'NUEVO', unknownTrack: 'Pista Desconocida',
    menu: 'MENÚ', queue: 'Cola', empty: 'Vacío', unknownArtist: 'Artista Desconocido',
    clearAll: 'Borrar Todo', confirmClear: '¿Borrar cola?',
    dropFiles: 'Soltar archivos de audio',
    themeLight: 'Modo Claro', themeDark: 'Modo Oscuro'
  },
  welcomeTitle: 'Aura Flux | El Sonido de la Luz',
  welcomeText: 'Transmuta cada vibración en una obra maestra generativa. Impulsado por Gemini AI para el reconocimiento en tiempo real, redefiniendo la experiencia sensorial.',
  startExperience: 'Entrar al Flujo',
  errors: {
    title: 'Error de Audio',
    accessDenied: 'Acceso denegado.',
    noDevice: 'Dispositivo no encontrado.',
    deviceBusy: 'Dispositivo ocupado.',
    general: 'Error de acceso.',
    tryDemo: 'Modo Demo'
  },
  toasts: {
    ...en.toasts,
    recStart: '¡Grabación iniciada!',
    processing: 'Procesando vídeo...',
    reviewReady: '¡Listo para revisar!',
    exportFail: 'Fallo al exportar.',
    aiDirectorReq: 'Se requiere clave API Gemini para AI Director.',
    aiFail: 'Análisis de AI fallido.'
  },
  systemPanel: {
    interface: 'Interfaz', behavior: 'Comportamiento', maintenance: 'Mantenimiento', engine: 'Motor', audio: 'Audio', ai: 'IA',
    lightMode: 'Modo Claro', darkMode: 'Modo Oscuro'
  },
  showFps: 'Mostrar FPS',
  showTooltips: 'Mostrar Consejos',
  doubleClickFullscreen: 'Doble Clic Pantalla Completa',
  autoHideUi: 'Ocultar Interfaz',
  mirrorDisplay: 'Modo Espejo',
  hideCursor: 'Ocultar Cursor',
  wakeLock: 'Pantalla Siempre Encendida',
  language: 'Idioma',
  localFont: 'Fuente Local',
  enterLocalFont: 'Nombre de fuente (ej. Arial)',
  aiProviders: {
    ...(en as any).aiProviders,
    MOCK: 'Simulado',
    FILE: 'Etiqueta ID3'
  },
  studioPanel: {
    ...en.studioPanel,
    title: 'Estudio de Grabación',
    start: 'Iniciar Grabación',
    stop: 'Detener Grabación',
    recording: 'GRABANDO',
    processing: 'Procesando...',
    ready: 'Listo',
    save: 'Guardar Vídeo',
    discard: 'Descartar',
    share: 'Compartir',
    videoStream: 'Flujo de Vídeo',
    audioStream: 'Flujo de Audio',
    settings: {
        ...(en.studioPanel.settings as any),
        resolution: 'Resolución',
        aspectRatio: 'Relación de Aspecto',
        fps: 'Cuadros por Segundo',
        bitrate: 'Tasa de Bits',
        codec: 'Códec',
        resNative: 'Ventana (Nativa)',
        arNative: 'Ventana (Nativa)',
        bpsLow: 'Baja (4 Mbps)',
        bpsStd: 'Estándar (8 Mbps)',
        bpsHigh: 'Alta (12 Mbps)',
        bpsUltra: 'Ultra (25 Mbps)',
        syncStart: 'Inicio Sincronizado',
        countdown: 'Cuenta Regresiva',
        duration: 'Duración',
        unlimited: 'Ilimitado',
        sec15: '15 Segundos',
        sec30: '30 Segundos',
        sec60: '60 Segundos',
        recGain: 'Volumen de Grabación',
        fade: 'Desvanecimiento',
        fadeOff: 'Ninguno',
        fade1s: '1 Segundo',
        fade2s: '2 Segundos'
    },
    formats: {
        vp9: 'WebM (VP9) - Alta Calidad',
        vp8: 'WebM (VP8) - Compatible',
        mp4_h264: 'MP4 (H.264) - Social',
        mp4_generic: 'MP4 - Genérico'
    }
  },
  aiPanel: {
      keySaved: 'Clave API Verificada',
      keyInvalid: 'Clave API Inválida',
      keyCleared: 'Clave API Borrada',
      saved: 'GUARDADO',
      missing: 'FALTA',
      save: 'Guardar',
      update: 'Actualizar',
      geminiHint: 'Opcional. Usa cuota gratuita si está vacío.',
      customHint: 'Requerido. Se guarda localmente.',
      notImplemented: 'IA para {provider} no implementada.'
  },
  config: {
    title: 'Nube y Datos',
    export: 'Exportar Archivo',
    import: 'Importar Archivo',
    library: 'Biblioteca Local',
    save: 'Guardar',
    saved: 'Guardado',
    load: 'Cargar',
    delete: 'Eliminar',
    deleteConfirm: '¿Eliminar este preajuste?',
    placeholder: 'Nombre del preajuste...',
    confirmImport: '¿Sobrescribir la configuración actual?',
    invalidFile: 'Formato de archivo no válido',
    importSuccess: 'Configuración cargada.',
    copy: 'Copiar',
    copied: '¡Copiado!',
    limitReached: 'Máximo de 5 preajustes permitidos.'
  },
  helpModal: {
    title: 'Guía Aura Flux',
    tabs: { guide: 'Guía', shortcuts: 'Atajos', about: 'Acerca de' },
    intro: 'Aura Flux transforma el audio en arte digital generativo utilizando análisis espectral e inteligencia Gemini 3.',
    shortcutsTitle: 'Atajos de Teclado',
    gesturesTitle: 'Gestos Táctiles',
    shortcutItems: {
      toggleMic: 'Alternar Micrófono',
      fullscreen: 'Pantalla Completa',
      randomize: 'Aleatorizar',
      lyrics: 'Info IA',
      hideUi: 'Alternar Interfaz',
      glow: 'Brillo',
      trails: 'Estelas',
      changeMode: 'Cambiar Modo',
      changeTheme: 'Cambiar Tema'
    },
    gestureItems: {
        swipeMode: 'Deslizar: Cambiar Modo',
        swipeSens: 'Deslizar Vert: Sensibilidad',
        longPress: 'Pulsación Larga: Info IA'
    },
    howItWorksTitle: 'Cómo Usar',
    howItWorksSteps: [
      '1. Conectar: Haz clic en "Entrar al Flujo" y permite el acceso al micrófono.',
      '2. Visualizar: Reproduce música. Usa "Preajustes Inteligentes" para cambiar el ambiente.',
      '3. Personalizar: Usa el "Modo Avanzado" para la sensibilidad y texto personalizado.',
      '4. Interactuar: Desliza para cambiar modos o mantén pulsado para IA.',
      '5. Explorar: Presiona H para opciones, F para pantalla completa, R para aleatorio.'
    ],
    settingsTitle: 'Guía de Parámetros',
    settingsDesc: {
      sensitivity: 'Control de ganancia para reacción de audio.',
      speed: 'Frecuencia temporal de patrones.',
      glow: 'Intensidad del brillo para profundidad atmosférica.',
      trails: 'Persistencia de píxeles para movimiento fluido.',
      smoothing: 'Amortiguación temporal de datos espectrales.',
      fftSize: 'Resolución de frecuencia.'
    },
    projectInfoTitle: 'Nuestra Visión',
    aboutDescription: 'Aura Flux es un motor de sinestesia en tiempo real que transmuta frecuencias de audio en arte 3D generativo. Al fusionar la precisión matemática de WebGL con la comprensión semántica de Google Gemini, crea un lenguaje visual que no solo reacciona al sonido, sino que lo entiende.',
    privacyTitle: 'Compromiso de Privacidad',
    privacyText: 'Creemos en la privacidad primero. Todo el análisis espectral y renderizado visual ocurre localmente en tu dispositivo. Solo cuando activas activamente la identificación por IA, se envían huellas de audio cortas y encriptadas a Gemini para su análisis, y nunca se almacenan.',
    version: 'Versión', coreTech: 'Tecnología', repository: 'Repositorio', support: 'Soporte', reportBug: 'Error'
  },
  onboarding: {
    welcome: 'Bienvenido a Aura Flux',
    subtitle: 'Motor de Sinestesia IA de Próxima Generación',
    selectLanguage: 'Selecciona tu idioma preferido',
    next: 'Siguiente', back: 'Anterior', skip: 'Saltar', finish: 'Comenzar Experiencia',
    features: {
      title: 'Características Sensoriales',
      visuals: { title: 'Esculturas Generativas', desc: 'Más de 15 motores reactivos impulsados por WebGL y matemáticas avanzadas.' },
      ai: { title: 'Inteligencia Gemini', desc: 'Metadatos de pistas instantáneos y reconocimiento de estado de ánimo impulsado por Google Gemini 3.' },
      privacy: { title: 'Inteligencia de Borde', desc: 'El procesamiento se mantiene local. Nunca grabamos ni almacenamos tus datos de audio privados.' }
    },
    shortcuts: { title: 'Controles Dinámicos', desc: 'Domina tu entorno como un director con estos comandos de teclado.' }
  }
};