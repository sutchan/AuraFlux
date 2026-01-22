/**
 * File: assets/locales/ar.ts
 * Version: 1.6.92
 * Author: Aura Vision Team
 * Copyright (c) 2024 Aura Vision. All rights reserved.
 * Updated: 2025-02-23 16:00
 */

import { VisualizerMode, LyricsStyle } from '../../core/types';

export const ar = {
  common: {
    on: 'تشغيل', off: 'إيقاف', visible: 'مرئي', hidden: 'مخفي', active: 'نشط', muted: 'مكتوم', beta: 'بيتا', simple: 'بسيط', advanced: 'متقدم'
  },
  tabs: {
    visual: 'بصري', text: 'نص', audio: 'صوت', ai: 'تمييز المسار', system: 'نظام'
  },
  hints: {
    mode: 'اختر المحرك الرياضي الأساسي لتوليد المؤثرات البصرية.',
    theme: 'تطبيق لوحة ألوان منسقة على المشهد.',
    speed: 'مضاعف مقياس الوقت. القيم المنخفضة منومة؛ العالية نشطة.',
    glow: 'تمكين توهج المعالجة اللاحقة. قم بالتعطيل لتحسين الأداء.',
    trails: 'التحكم في استمرار البكسل. القيم العالية تخلق حركة انسيابية.',
    sensitivity: 'تضخيم التفاعل البصري مع الصوت. قم بزيادته في البيئات الهادئة.',
    smoothing: 'التخميد الزمني. القيم العالية تعطي حركة سائلة.',
    fftSize: 'الدقة الطيفية. 4096 يوفر تفاصيل دقيقة ولكنه يستهلك المزيد من المعالج.',
    lyrics: 'تفعيل/تعطيل التعرف على الأغاني بواسطة الذكاء الاصطناعي [L].',
    lyricsStyle: 'تخصيص العرض المرئي للكلمات المتزامنة.',
    region: 'توجيه محرك بحث الذكاء الاصطناعي نحو الموسيقى في هذا السوق المحدد.',
    autoRotate: 'التنقل تلقائيًا عبر محركات بصرية مختلفة.',
    rotateInterval: 'الوقت بالثواني قبل التبديل إلى المحرك التالي.',
    cycleColors: 'الانتقال تلقائيًا وسلاسة بين سمات الألوان.',
    colorInterval: 'الوقت بالثواني قبل الانتقال للوحة الألوان التالية.',
    reset: 'استعادة جميع إعدادات التطبيق إلى وضع المصنع.',
    confirmReset: 'تأكيد إعادة التعيين؟ لا يمكن التراجع عن هذا الإجراء.',
    resetVisual: 'إعادة تعيين الجماليات فقط (السرعة، التوهج، الآثار).',
    resetText: 'مسح النص المخصص والخطوط وإعدادات الموضع.',
    resetAudio: 'استعادة الحساسية والتنعيم و FFT إلى الوضع الافتراضي.',
    resetAi: 'إعادة تعيين شخصية الذكاء الاصطناعي والمنطقة وتخطيط النصوص.',
    randomize: 'توليد مزيج عشوائي من الأوضاع والألوان [R].',
    fullscreen: 'تبديل وضع ملء الشاشة الغامر [F].',
    help: 'عرض اختصارات لوحة المفاتيح والوثائق.',
    mic: 'تنشيط أو كتم إدخال الميكروفون [Space].',
    device: 'اختر مصدر إدخال الصوت من الجهاز.',
    monitor: 'تمرير إدخال الميكروفون إلى مكبرات الصوت.',
    wakeLock: 'منع الشاشة من الانطفاء.',
    showFps: 'عرض عداد الإطارات في الثانية.',
    showTooltips: 'عرض تلميحات مفيدة عند تحويم الماوس.',
    doubleClickFullscreen: 'تبديل ملء الشاشة بالنقر المزدوج.',
    autoHideUi: 'إخفاء لوحة التحكم تلقائيًا.',
    mirrorDisplay: 'عكس العرض أفقيًا.',
    showCustomText: 'تبديل رؤية تراكب رسالتك المخصصة.',
    textPulse: 'يتغير حجم النص ديناميكيًا مع إيقاع الموسيقى.',
    textAudioReactive: 'تتفاعل شفافية وحجم النص مع سعة الصوت الحية.',
    customTextCycleColor: 'التنقل تلقائيًا عبر طيف الألوان للنص.',
    hideCursor: 'إخفاء مؤشر الماوس تلقائيًا.',
    uiModeSimple: 'إخفاء المعلمات التقنية والتركيز على الجماليات.',
    uiModeAdvanced: 'إظهار جميع معلمات الضبط للتحكم الدقيق.',
    quality: 'ضبط دقة الرندرة وكثافة الجسيمات.',
    textSize: 'تغيير حجم طبقة النص المخصص.',
    textRotation: 'تدوير تراكب النص.',
    textPosition: 'نقطة الارتكاز للنص المخصص.',
    lyricsPosition: 'نقطة الارتكاز لتراكب الكلمات بالذكاء الاصطناعي.',
    customTextPlaceholder: 'أدخل رسالتك.',
    textOpacity: 'مستوى شفافية النص المخصص.',
    cycleSpeed: 'الوقت بالثواني لدورة ألوان كاملة.',
    lyricsFont: 'نمط الطباعة لكلمات الذكاء الاصطناعي.',
    lyricsFontSize: 'تغيير حجم نص التعريف بالذكاء الاصطناعي.',
    textFont: 'عائلة الخط لطبقة النص المخصص.',
    recognitionSource: 'اختر شخصية الذكاء الاصطناعي أو المزود.'
  },
  visualizerMode: 'محرك العرض المرئي',
  styleTheme: 'سمة الألوان',
  settings: 'ضبط',
  sensitivity: 'حساسية الاستجابة',
  speed: 'سرعة التطور',
  glow: 'توهج نيون',
  trails: 'آثار الحركة',
  autoRotate: 'دورة المحركات',
  rotateInterval: 'الفاصل (ث)',
  cycleColors: 'دورة الألوان',
  colorInterval: 'الفاصل (ث)',
  cycleSpeed: 'مدة الدورة (ث)',
  monitorAudio: 'المراقبة',
  audioInput: 'جهاز الإدخال',
  lyrics: 'تمييز المسار',
  showLyrics: 'تفعيل التمييز',
  displaySettings: 'إعدادات العرض',
  language: 'لغة الواجهة',
  region: 'السوق المستهدف',
  startMic: 'تفعيل الصوت',
  stopMic: 'إيقاف الصوت',
  listening: 'نشط',
  identifying: 'الذكاء الاصطناعي يحلل المسار...',
  startExperience: 'بدء التجربة',
  welcomeTitle: 'Aura Flux | صوت الضوء',
  welcomeText: 'حول كل اهتزاز إلى تحفة فنية توليدية. مدعوم بذكاء Gemini للتعرف الفوري – اختبر الرحلة الحسية القصوى.',
  unsupportedTitle: 'المتصفح غير مدعوم',
  unsupportedText: 'يتطلب Aura Flux ميزات Web Audio حديثة. يرجى استخدام أحدث إصدار من Chrome أو Safari.',
  hideOptions: 'طي اللوحة',
  showOptions: 'خيارات',
  reset: 'إعادة تعيين النظام',
  resetVisual: 'إعادة تعيين الجماليات',
  resetText: 'إعادة تعيين النص',
  resetAudio: 'إعادة تعيين الصوت',
  resetAi: 'إعادة تعيين الذكاء الاصطناعي',
  randomize: 'عشوائي ذكي',
  help: 'المساعدة',
  close: 'إغلاق',
  betaDisclaimer: 'ميزة تمييز المسار في مرحلة تجريبية.',
  wrongSong: 'أغنية خاطئة؟',
  hideCursor: 'إخفاء المؤشر',
  customColor: 'لون النص',
  randomizeTooltip: 'عشوائية جميع الإعدادات (R)',
  smoothing: 'التنعيم',
  fftSize: 'الدقة (FFT)',
  appInfo: 'عن التطبيق',
  appDescription: 'مجموعة تصور غامرة تعتمد على تحليل الطيف وذكاء Gemini.',
  version: 'الإصدار',
  defaultMic: 'الميكروفون الافتراضي',
  customText: 'نص مخصص',
  textProperties: 'الطباعة والتخطيط',
  customTextPlaceholder: 'أدخل النص',
  showText: 'إظهار التراكب',
  pulseBeat: 'نبض مع الإيقاع',
  textAudioReactive: 'تفاعل صوتي',
  textSize: 'حجم الخط',
  textRotation: 'الدوران',
  textFont: 'نوع الخط',
  textOpacity: 'الشفافية',
  textPosition: 'موضع النص',
  quality: 'جودة الرندرة',
  qualities: {
    low: 'سلس', med: 'متوازن', high: 'فائق'
  },
  visualPanel: {
    effects: 'تأثيرات', automation: 'أتمتة', display: 'عرض'
  },
  audioPanel: {
    info: 'اضبط الحساسية والتنعيم. الدقة العالية توفر تفاصيل أكثر لكنها تزيد الحمل.'
  },
  systemPanel: {
    interface: 'الواجهة', behavior: 'السلوك', maintenance: 'الصيانة', engine: 'المحرك', audio: 'الصوت', ai: 'الذكاء الاصطناعي'
  },
  showFps: 'عرض FPS',
  showTooltips: 'عرض تلميحات',
  doubleClickFullscreen: 'ملء الشاشة بالنقر المزدوج',
  autoHideUi: 'إخفاء لوحة التحكم تلقائيًا.',
  mirrorDisplay: 'عكس العرض',
  presets: {
    title: 'إعدادات مسبقة ذكية', hint: 'تطبيق مزيج جمالي منسق بنقرة واحدة.', select: 'اختر مزاجاً...', custom: 'معدل', calm: 'شكل موجي رقمي', party: 'حفلة نشطة', ambient: 'سديم عميق', cyberpunk: 'ليزر حفلات', retrowave: 'غروب ريترو', vocal: 'تركيز صوتي'
  },
  recognitionSource: 'مزود الذكاء الاصطناعي',
  lyricsPosition: 'موضع الكلمات',
  lyricsFont: 'نوع الخط',
  lyricsFontSize: 'الحجم',
  simulatedDemo: 'محاكاة (عرض)',
  positions: {
      top: 'أعلى', center: 'وسط', bottom: 'أسفل', tl: 'أعلى يسار', tc: 'أعلى وسط', tr: 'أعلى يمين', ml: 'وسط يسار', mc: 'مركز', mr: 'وسط يمين', bl: 'أسفل يسار', bc: 'أسفل وسط', br: 'أسفل يمين'
  },
  wakeLock: 'الشاشة دائماً مشتعلة',
  system: {
    shortcuts: { mic: 'ميكروفون', ui: 'واجهة', mode: 'وضع', random: 'عشوائي' }
  },
  errors: {
    title: 'خطأ صوتي', accessDenied: 'تم رفض الوصول للميكروفون.', noDevice: 'لم يتم العثور على جهاز.', deviceBusy: 'الجهاز مشغول.', general: 'تعذر الوصول للصوت.', tryDemo: 'وضع العرض'
  },
  aiState: {
    active: 'التمييز نشط', enable: 'بدء التمييز'
  },
  regions: {
    global: 'عالمي', US: 'أمريكا / الغرب', CN: 'الصين', JP: 'اليابان', KR: 'كوريا', EU: 'أوروبا', LATAM: 'أمريكا اللاتينية'
  },
  modes: {
    [VisualizerMode.NEURAL_FLOW]: 'التدفق العصبي (WebGL)',
    [VisualizerMode.CUBE_FIELD]: 'المجال الكمي (WebGL)',
    [VisualizerMode.PLASMA]: 'تدفق البلازما',
    [VisualizerMode.BARS]: 'أشرطة التردد',
    [VisualizerMode.PARTICLES]: 'الملاحة بين النجوم',
    [VisualizerMode.TUNNEL]: 'النفق الهندسي',
    [VisualizerMode.RINGS]: 'حلقات النيون',
    [VisualizerMode.NEBULA]: 'سديم عميق',
    [VisualizerMode.LASERS]: 'مصفوفة الليزر',
    [VisualizerMode.FLUID_CURVES]: 'رقصة الشفق',
    [VisualizerMode.MACRO_BUBBLES]: 'فقاعات ماكرو',
    [VisualizerMode.KINETIC_WALL]: 'الجدار الحركي (WebGL)',
    [VisualizerMode.LIQUID]: 'الكوكب السائل (WebGL)',
    [VisualizerMode.WAVEFORM]: 'شكل موجي رقمي'
  },
  lyricsStyles: {
    [LyricsStyle.STANDARD]: 'تنسيق قياسي', [LyricsStyle.KARAOKE]: 'ديناميكي', [LyricsStyle.MINIMAL]: 'بسيط جداً'
  },
  helpModal: {
    title: 'دليل Aura Flux',
    tabs: { guide: 'دليل', shortcuts: 'اختصارات', about: 'حول' },
    intro: 'Aura Flux يحول الصوت إلى فن رقمي رياضي في الوقت الفعلي باستخدام تحليل طيفي عالي الدقة وذكاء Gemini 3.',
    shortcutsTitle: 'التحكم بلوحة المفاتيح',
    gesturesTitle: 'إيماءات اللمس',
    shortcutItems: {
      toggleMic: 'تشغيل/إيقاف الصوت', fullscreen: 'تبديل ملء الشاشة', randomize: 'عشوائية الجماليات', lyrics: 'تبديل معلومات المسار', hideUi: 'إظهار/إخفاء اللوحة', glow: 'تأثير التوهج', trails: 'تأثير الآثار', changeMode: 'تغيير النمط', changeTheme: 'تغيير السمة'
    },
    gestureItems: {
        swipeMode: 'سحب أفقي: تغيير الوضع', swipeSens: 'سحب عمودي: ضبط الحساسية', longPress: 'ضغطة طويلة: تمييز بالذكاء الاصطناعي'
    },
    howItWorksTitle: 'كيفية الاستخدام',
    howItWorksSteps: [
      '1. الاتصال: انقر على "بدء" واسمح باستخدام الميكروفون.',
      '2. المشاهدة: شغل الموسيقى واستخدم "الإعدادات المسبقة".',
      '3. التخصيص: انتقل إلى الوضع "المتقدم" لضبط FFT و "النص المخصص".',
      '4. التفاعل: اسحب لتغيير الوضع/الحساسية.',
      '5. الاستكشاف: H للخيارات، F لملء الشاشة، R للعشوائي.'
    ],
    settingsTitle: 'دليل المعايير',
    settingsDesc: {
      sensitivity: 'التحكم في كسب رد الفعل للمؤثرات البصرية.', speed: 'سرعة التطور الزمني للخوارزميات.', glow: 'شدة الإضاءة المحيطة.', trails: 'تراكم البكسل للحركة.', smoothing: 'التنعيم الطيفي للبيانات.', fftSize: 'دقة التحليل الطيفي.'
    },
    projectInfoTitle: 'عن المشروع',
    aboutDescription: 'تجربة تفاعلية تدمج التحليل الطيفي مع Google Gemini 3 لتحويل الأمواج الصوتية إلى ضوء حي. مثالي للبث المباشر والديكور.',
    privacyTitle: 'الخصوصية',
    privacyText: 'التحليل الصوتي محلي. يتم إرسال بصمات مشفرة فقط لتمييز الأغنية؛ لا يتم حفظ تسجيلات.',
    version: 'الإصدار', coreTech: 'التقنيات', repository: 'المستودع', support: 'الدعم', reportBug: 'الإبلاغ عن خطأ'
  },
  onboarding: {
    welcome: 'مرحباً بك في Aura Flux', subtitle: 'محرك الحس المرافق بالذكاء الاصطناعي', selectLanguage: 'يرجى اختيار اللغة', next: 'التالي', back: 'العودة', skip: 'تخطي', finish: 'بدء التجربة',
    features: {
      title: 'الميزات الرئيسية',
      visuals: { title: 'فنون توليدية', desc: '12+ محركاً تعتمد على WebGL لتجسيد الصوت.' },
      ai: { title: 'ذكاء Gemini AI', desc: 'تحليل فوري للمسارات والمزاج عبر Google Gemini 3.' },
      privacy: { title: 'آمن وخاص', desc: 'المعالجة محلية. لا يتم تسجيل بياناتك الصوتية أبداً.' }
    },
    shortcuts: { title: 'تحكم ديناميكي', desc: 'كن مايسترو الضوء عبر لوحة المفاتيح.' }
  }
};