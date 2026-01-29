/**
 * File: assets/locales/de.ts
 * Version: 2.2.0
 * Author: Sut
 * Updated: 2025-03-10 21:00
 */

import { en } from './en';

export const de = {
  ...en,
  common: {
    on: 'EIN', off: 'AUS', visible: 'SICHTBAR', hidden: 'VERSTECKT', active: 'AKTIV', muted: 'STUMM', beta: 'BETA', simple: 'EINFACH', advanced: 'ERWEITERT', new: 'NEU', unknownTrack: 'Unbekannter Titel',
    menu: 'MENÜ', queue: 'Warteschlange', empty: 'Leer', unknownArtist: 'Unbekannter Künstler',
    clearAll: 'Alles löschen', confirmClear: 'Warteschlange leeren?',
    dropFiles: 'Audiodateien hier ablegen',
    themeLight: 'Heller Modus', themeDark: 'Dunkler Modus'
  },
  welcomeTitle: 'Aura Flux | Der Klang des Lichts',
  welcomeText: 'Verwandeln Sie jede Schwingung in ein generatives Meisterwerk. Angetrieben von Gemini AI, definiert Aura Flux das sensorische Erlebnis neu.',
  startExperience: 'Erlebnis starten',
  errors: {
    title: 'Audio-Fehler',
    accessDenied: 'Zugriff verweigert.',
    noDevice: 'Kein Gerät gefunden.',
    deviceBusy: 'Gerät beschäftigt.',
    general: 'Zugriffsfehler.',
    tryDemo: 'Demo-Modus'
  },
  systemPanel: {
    interface: 'Oberfläche', behavior: 'Verhalten', maintenance: 'Wartung', engine: 'Engine', audio: 'Audio', ai: 'KI',
    lightMode: 'Heller Modus', darkMode: 'Dunkler Modus'
  },
  showFps: 'FPS anzeigen',
  showTooltips: 'Tooltips anzeigen',
  doubleClickFullscreen: 'Doppelklick Vollbild',
  autoHideUi: 'UI autom. ausblenden',
  mirrorDisplay: 'Anzeige spiegeln',
  hideCursor: 'Cursor ausblenden',
  wakeLock: 'Bildschirm wachhalten',
  language: 'Sprache',
  localFont: 'Lokale Schriftart',
  enterLocalFont: 'Schriftartname (z.B. Arial)',
  aiProviders: {
    ...(en as any).aiProviders,
    MOCK: 'Simuliert',
    FILE: 'ID3-Tag'
  },
  studioPanel: {
    ...en.studioPanel,
    title: 'Aufnahmestudio',
    start: 'Aufnahme starten',
    stop: 'Aufnahme stoppen',
    recording: 'AUFNAHME LÄUFT',
    processing: 'Verarbeitung...',
    ready: 'Bereit',
    save: 'Video speichern',
    discard: 'Verwerfen',
    share: 'Teilen',
    settings: {
        ...(en.studioPanel.settings as any),
        resolution: 'Auflösung',
        fps: 'Bildrate',
        bitrate: 'Bitrate',
        recGain: 'Aufnahmepegel',
        fade: 'Ein-/Ausblenden'
    }
  },
  aiPanel: {
      keySaved: 'API-Schlüssel gespeichert',
      keyInvalid: 'Ungültiger Schlüssel',
      keyCleared: 'Schlüssel gelöscht',
      saved: 'GESPEICHERT',
      missing: 'FEHLT',
      save: 'Speichern',
      update: 'Aktualisieren',
      geminiHint: 'Optional. Verwendet Standardquote falls leer.',
      customHint: 'Erforderlich. Wird lokal gespeichert.',
      notImplemented: 'KI für {provider} noch nicht verfügbar.'
  },
  config: {
    title: 'Cloud & Daten',
    export: 'Datei exportieren',
    import: 'Datei importieren',
    library: 'Lokale Bibliothek',
    save: 'Speichern',
    saved: 'Gespeichert',
    load: 'Laden',
    delete: 'Löschen',
    deleteConfirm: 'Dieses Preset löschen?',
    placeholder: 'Preset-Name...',
    confirmImport: 'Aktuelle Einstellungen überschreiben?',
    invalidFile: 'Ungültiges Dateiformat',
    importSuccess: 'Konfiguration geladen.',
    copy: 'Kopieren',
    copied: 'Kopiert!',
    limitReached: 'Maximal 5 Presets erlaubt.'
  },
  helpModal: {
    title: 'Aura Flux Anleitung',
    tabs: { guide: 'Anleitung', shortcuts: 'Steuerung', about: 'Über' },
    intro: 'Aura Flux verwandelt Audio mithilfe von Spektralanalyse und Gemini 3 Intelligenz in generative digitale Kunst.',
    shortcutsTitle: 'Tastaturkürzel',
    gesturesTitle: 'Touch-Gesten',
    shortcutItems: {
      toggleMic: 'Mikrofon umschalten',
      fullscreen: 'Vollbild',
      randomize: 'Zufall',
      lyrics: 'KI-Info',
      hideUi: 'UI umschalten',
      glow: 'Leuchten',
      trails: 'Spuren',
      changeMode: 'Modus wechseln',
      changeTheme: 'Thema wechseln'
    },
    gestureItems: {
        swipeMode: 'Wischen: Modus wechseln',
        swipeSens: 'Wischen Vert: Empfindlichkeit',
        longPress: 'Langes Drücken: KI-Info'
    },
    howItWorksTitle: 'Verwendung',
    howItWorksSteps: [
      '1. Verbinden: Klicken Sie auf "Erlebnis starten" und erlauben Sie den Mikrofonzugriff.',
      '2. Visualisieren: Musik abspielen. Nutzen Sie "Smarte Presets" für die Stimmung.',
      '3. Anpassen: Nutzen Sie den "Erweiterten Modus" für Empfindlichkeit und Text.',
      '4. Interagieren: Wischen für Moduswechsel oder langes Drücken für KI.',
      '5. Entdecken: Drücken Sie H für Optionen, F für Vollbild, R für Zufall.'
    ],
    settingsTitle: 'Parameter-Guide',
    settingsDesc: {
      sensitivity: 'Verstärkungsregelung für Audioreaktion.',
      speed: 'Zeitliche Frequenz der Muster.',
      glow: 'Leuchtintensität für atmosphärische Tiefe.',
      trails: 'Pixelpersistenz für flüssige Bewegung.',
      smoothing: 'Zeitliche Dämpfung der Spektraldaten.',
      fftSize: 'Frequenzauflösung.'
    },
    projectInfoTitle: 'Unsere Vision',
    aboutDescription: 'Aura Flux ist eine Echtzeit-Synästhesie-Engine, die Audiofrequenzen in generative 3D-Kunst verwandelt. Durch die Verschmelzung der mathematischen Präzision von WebGL mit dem semantischen Verständnis von Google Gemini entsteht eine visuelle Sprache, die nicht nur auf Klang reagiert, sondern ihn versteht.',
    privacyTitle: 'Datenschutzversprechen',
    privacyText: 'Wir glauben an Edge-First-Datenschutz. Alle Spektralanalysen und visuellen Renderings finden lokal auf Ihrem Gerät statt. Nur wenn Sie die KI-Identifikation aktiv auslösen, werden kurze, verschlüsselte Audio-Fingerabdrücke zur Analyse an Gemini gesendet und niemals gespeichert.',
    version: 'Version', coreTech: 'Tech', repository: 'Quelle', support: 'Support', reportBug: 'Fehler'
  },
  onboarding: {
    welcome: 'Willkommen bei Aura Flux',
    subtitle: 'KI-Synästhesie-Engine der nächsten Generation',
    selectLanguage: 'Wählen Sie Ihre bevorzugte Sprache',
    next: 'Weiter', back: 'Zurück', skip: 'Überspringen', finish: 'Erlebnis beginnen',
    features: {
      title: 'Sensorische Funktionen',
      visuals: { title: 'Generative Skulpturen', desc: '15+ reaktive Engines, angetrieben von WebGL und fortgeschrittener Mathematik.' },
      ai: { title: 'Gemini Intelligenz', desc: 'Sofortige Titel-Metadaten und Stimmungserkennung durch Google Gemini 3.' },
      privacy: { title: 'Edge-Intelligenz', desc: 'Die Verarbeitung bleibt lokal. Wir zeichnen Ihre privaten Audiodaten niemals auf oder speichern sie.' }
    },
    shortcuts: { title: 'Dynamische Steuerung', desc: 'Meistern Sie Ihre Umgebung wie ein Dirigent mit diesen Tastaturbefehlen.' }
  }
};