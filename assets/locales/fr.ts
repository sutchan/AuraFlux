/**
 * File: assets/locales/fr.ts
 * Version: 2.2.0
 * Author: Sut
 * Updated: 2025-03-10 21:00
 */

import { en } from './en';

export const fr = {
  ...en,
  common: {
    on: 'ON', off: 'OFF', visible: 'VISIBLE', hidden: 'MASQUÉ', active: 'ACTIF', muted: 'MUET', beta: 'BÊTA', simple: 'SIMPLE', advanced: 'AVANCÉ', new: 'NOUVEAU', unknownTrack: 'Piste inconnue',
    menu: 'MENU', queue: 'File', empty: 'Vide', unknownArtist: 'Artiste inconnu',
    clearAll: 'Tout effacer', confirmClear: 'Effacer la file ?',
    dropFiles: 'Déposer des fichiers audio',
    themeLight: 'Mode Clair', themeDark: 'Mode Sombre'
  },
  welcomeTitle: 'Aura Flux | Le Son de la Lumière',
  welcomeText: 'Transformez chaque vibration en un chef-d\'œuvre génératif. Propulsé par Gemini AI pour une reconnaissance en temps réel.',
  startExperience: 'Entrer dans le Flux',
  errors: {
    title: 'Erreur Audio',
    accessDenied: 'Accès refusé.',
    noDevice: 'Aucun appareil trouvé.',
    deviceBusy: 'Appareil occupé.',
    general: 'Erreur d\'accès.',
    tryDemo: 'Mode Démo'
  },
  systemPanel: {
    interface: 'Interface', behavior: 'Comportement', maintenance: 'Maintenance', engine: 'Moteur', audio: 'Audio', ai: 'IA',
    lightMode: 'Mode Clair', darkMode: 'Mode Sombre'
  },
  showFps: 'Afficher FPS',
  showTooltips: 'Infobulles',
  doubleClickFullscreen: 'Double-clic Plein écran',
  autoHideUi: 'Masquer l\'interface',
  mirrorDisplay: 'Miroir',
  hideCursor: 'Masquer curseur',
  wakeLock: 'Écran toujours allumé',
  language: 'Langue',
  localFont: 'Police Locale',
  enterLocalFont: 'Nom de police (ex. Arial)',
  aiProviders: {
    ...(en as any).aiProviders,
    MOCK: 'Simulé',
    FILE: 'Tag ID3'
  },
  studioPanel: {
    ...en.studioPanel,
    title: 'Studio d\'enregistrement',
    start: 'Démarrer',
    stop: 'Arrêter',
    recording: 'ENREGISTREMENT',
    processing: 'Traitement...',
    ready: 'Prêt',
    save: 'Sauvegarder',
    discard: 'Annuler',
    share: 'Partager',
    settings: {
        ...(en.studioPanel.settings as any),
        resolution: 'Résolution',
        fps: 'Images/s',
        bitrate: 'Débit',
        recGain: 'Volume',
        fade: 'Fondu'
    }
  },
  aiPanel: {
      keySaved: 'Clé API enregistrée',
      keyInvalid: 'Clé invalide',
      keyCleared: 'Clé effacée',
      saved: 'SAUVEGARDÉ',
      missing: 'MANQUANT',
      save: 'Sauver',
      update: 'Mettre à jour',
      geminiHint: 'Optionnel. Utilise le quota gratuit si vide.',
      customHint: 'Requis. Stocké localement.',
      notImplemented: 'IA pour {provider} non implémentée.'
  },
  config: {
    title: 'Nuage et Données',
    export: 'Exporter Fichier',
    import: 'Importer Fichier',
    library: 'Bibliothèque Locale',
    save: 'Sauver',
    saved: 'Enregistré',
    load: 'Charger',
    delete: 'Suppr.',
    deleteConfirm: 'Supprimer ce préréglage ?',
    placeholder: 'Nom du préréglage...',
    confirmImport: 'Écraser les paramètres actuels ?',
    invalidFile: 'Format de fichier invalide',
    importSuccess: 'Configuration chargée.',
    copy: 'Copier',
    copied: 'Copié !',
    limitReached: 'Maximum de 5 préréglages autorisés.'
  },
  helpModal: {
    title: 'Guide Aura Flux',
    tabs: { guide: 'Guide', shortcuts: 'Raccourcis', about: 'À propos' },
    intro: 'Aura Flux transforme l\'audio en art numérique génératif en utilisant l\'analyse spectrale et l\'intelligence Gemini 3.',
    shortcutsTitle: 'Raccourcis Clavier',
    gesturesTitle: 'Gestes Tactiles',
    shortcutItems: {
      toggleMic: 'Activer/Désactiver Micro',
      fullscreen: 'Plein Écran',
      randomize: 'Aléatoire',
      lyrics: 'Info IA',
      hideUi: 'Masquer UI',
      glow: 'Lueur',
      trails: 'Traînées',
      changeMode: 'Changer Mode',
      changeTheme: 'Changer Thème'
    },
    gestureItems: {
        swipeMode: 'Glisser: Changer Mode',
        swipeSens: 'Glisser Vert: Sensibilité',
        longPress: 'Appui Long: Info IA'
    },
    howItWorksTitle: 'Comment Utiliser',
    howItWorksSteps: [
      '1. Connecter: Cliquez sur "Entrer dans le Flux" et autorisez l\'accès au micro.',
      '2. Visualiser: Jouez de la musique. Utilisez les "Préréglages Intelligents".',
      '3. Personnaliser: Utilisez le "Mode Avancé" pour la sensibilité et le texte.',
      '4. Interagir: Glissez pour changer de mode ou appui long pour l\'IA.',
      '5. Explorer: Appuyez sur H pour les options, F pour plein écran, R pour aléatoire.'
    ],
    settingsTitle: 'Guide des Paramètres',
    settingsDesc: {
      sensitivity: 'Contrôle de gain pour la réaction audio.',
      speed: 'Fréquence temporelle des motifs.',
      glow: 'Intensité de la lueur pour la profondeur atmosphérique.',
      trails: 'Persistance des pixels pour un mouvement fluide.',
      smoothing: 'Amortissement temporel des données spectrales.',
      fftSize: 'Résolution de fréquence.'
    },
    projectInfoTitle: 'Notre Vision',
    aboutDescription: 'Aura Flux est un moteur de synesthésie en temps réel qui transmute les fréquences audio en art 3D génératif. En fusionnant la précision mathématique de WebGL avec la compréhension sémantique de Google Gemini, il crée un langage visuel qui ne se contente pas de réagir au son, mais le comprend.',
    privacyTitle: 'Engagement de Confidentialité',
    privacyText: 'Nous croyons en la confidentialité avant tout. Toute l\'analyse spectrale et le rendu visuel se font localement sur votre appareil. Ce n\'est que lorsque vous déclenchez activement l\'identification par IA que de courtes empreintes audio cryptées sont envoyées à Gemini pour analyse, et jamais stockées.',
    version: 'Version', coreTech: 'Technologie', repository: 'Source', support: 'Support', reportBug: 'Bug'
  },
  onboarding: {
    welcome: 'Bienvenue sur Aura Flux',
    subtitle: 'Moteur de Synesthésie IA de Nouvelle Génération',
    selectLanguage: 'Sélectionnez votre langue préférée',
    next: 'Suivant', back: 'Précédent', skip: 'Passer', finish: 'Commencer l\'Expérience',
    features: {
      title: 'Caractéristiques Sensorielles',
      visuals: { title: 'Sculptures Génératives', desc: '15+ moteurs réactifs propulsés par WebGL et des mathématiques avancées.' },
      ai: { title: 'Intelligence Gemini', desc: 'Métadonnées de piste instantanées et reconnaissance de l\'humeur par Google Gemini 3.' },
      privacy: { title: 'Intelligence en Bordure', desc: 'Le traitement reste local. Nous n\'enregistrons ni ne stockons jamais vos données audio privées.' }
    },
    shortcuts: { title: 'Contrôles Dynamiques', desc: 'Maîtrisez votre environnement comme un chef d\'orchestre avec ces commandes clavier.' }
  }
};