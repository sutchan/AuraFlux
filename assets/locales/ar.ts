/**
 * File: assets/locales/ar.ts
 * Version: 2.2.0
 * Author: Sut
 * Updated: 2025-03-10 21:00
 */

import { en } from './en';

export const ar = {
  ...en,
  common: {
    on: 'تشغيل', off: 'إيقاف', visible: 'ظاهر', hidden: 'مخفي', active: 'نشط', muted: 'صامت', beta: 'تجريبي', simple: 'بسيط', advanced: 'متقدم', new: 'جديد', unknownTrack: 'مقطع غير معروف',
    menu: 'قائمة', queue: 'قائمة التشغيل', empty: 'فارغ', unknownArtist: 'فنان غير معروف',
    clearAll: 'مسح الكل', confirmClear: 'مسح القائمة؟',
    dropFiles: 'إفلات الملفات الصوتية',
    themeLight: 'الوضع الفاتح', themeDark: 'الوضع الداكن'
  },
  welcomeTitle: 'Aura Flux | صوت الضوء',
  welcomeText: 'حول كل اهتزاز إلى تحفة فنية توليدية. مدعوم بـ Gemini AI للتعرف في الوقت الفعلي.',
  startExperience: 'ابدأ التجربة',
  errors: {
    title: 'خطأ في الصوت',
    accessDenied: 'تم رفض الوصول.',
    noDevice: 'لم يتم العثور على جهاز.',
    deviceBusy: 'الجهاز مشغول.',
    general: 'خطأ في الوصول.',
    tryDemo: 'الوضع التجريبي'
  },
  systemPanel: {
    interface: 'الواجهة', behavior: 'السلوك', maintenance: 'الصيانة', engine: 'المحرك', audio: 'الصوت', ai: 'الذكاء الاصطناعي',
    lightMode: 'الوضع الفاتح', darkMode: 'الوضع الداكن'
  },
  showFps: 'عرض FPS',
  showTooltips: 'إظهار التلميحات',
  doubleClickFullscreen: 'ملء الشاشة بنقر مزدوج',
  autoHideUi: 'إخفاء الواجهة تلقائيًا',
  mirrorDisplay: 'مرآة',
  hideCursor: 'إخفاء المؤشر',
  wakeLock: 'شاشة دائمة',
  language: 'اللغة',
  localFont: 'خط محلي',
  enterLocalFont: 'اسم الخط (مثل Arial)',
  aiProviders: {
    ...(en as any).aiProviders,
    MOCK: 'محاكاة',
    FILE: 'وسم ID3'
  },
  studioPanel: {
    ...en.studioPanel,
    title: 'استوديو التسجيل',
    start: 'بدء التسجيل',
    stop: 'إيقاف التسجيل',
    recording: 'تسجيل',
    processing: 'معالجة...',
    ready: 'جاهز',
    save: 'حفظ الفيديو',
    discard: 'تجاهل',
    share: 'مشاركة',
    settings: {
        ...(en.studioPanel.settings as any),
        resolution: 'الدقة',
        fps: 'إطارات/ثانية',
        bitrate: 'معدل البت',
        recGain: 'مستوى التسجيل',
        fade: 'تلاشي'
    }
  },
  aiPanel: {
      keySaved: 'تم حفظ مفتاح API',
      keyInvalid: 'مفتاح غير صالح',
      keyCleared: 'تم مسح المفتاح',
      saved: 'محفوظ',
      missing: 'مفقود',
      save: 'حفظ',
      update: 'تحديث',
      geminiHint: 'اختياري. يستخدم الحصة المجانية إذا كان فارغًا.',
      customHint: 'مطلوب. يتم تخزينه محليًا.',
      notImplemented: 'الذكاء الاصطناعي لـ {provider} غير مدعوم بعد.'
  },
  config: {
    title: 'السحابة والبيانات',
    export: 'تصدير ملف',
    import: 'استيراد ملف',
    library: 'المكتبة المحلية',
    save: 'حفظ',
    saved: 'تم الحفظ',
    load: 'تحميل',
    delete: 'حذف',
    deleteConfirm: 'حذف هذا الإعداد المسبق؟',
    placeholder: 'اسم الإعداد المسبق...',
    confirmImport: 'هل تريد استبدال الإعدادات الحالية؟',
    invalidFile: 'تنسيق الملف غير صالح',
    importSuccess: 'تم تحميل التكوين.',
    copy: 'نسخ',
    copied: 'تم النسخ!',
    limitReached: 'الحد الأقصى 5 إعدادات مسبقة مسموح بها.'
  },
  helpModal: {
    title: 'دليل Aura Flux',
    tabs: { guide: 'دليل', shortcuts: 'اختصارات', about: 'حول' },
    intro: 'يحول Aura Flux الصوت إلى فن رقمي توليدي باستخدام التحليل الطيفي وذكاء Gemini 3.',
    shortcutsTitle: 'اختصارات لوحة المفاتيح',
    gesturesTitle: 'إيماءات اللمس',
    shortcutItems: {
      toggleMic: 'تبديل الميكروفون',
      fullscreen: 'ملء الشاشة',
      randomize: 'عشوائي',
      lyrics: 'معلومات الذكاء الاصطناعي',
      hideUi: 'تبديل الواجهة',
      glow: 'توهج',
      trails: 'ذيول',
      changeMode: 'تغيير الوضع',
      changeTheme: 'تغيير المظهر'
    },
    gestureItems: {
        swipeMode: 'سحب: تغيير الوضع',
        swipeSens: 'سحب عمودي: الحساسية',
        longPress: 'ضغط مطول: معلومات AI'
    },
    howItWorksTitle: 'كيفية الاستخدام',
    howItWorksSteps: [
      '1. الاتصال: انقر فوق "ابدأ التجربة" واسمح بالوصول إلى الميكروفون.',
      '2. تصور: شغل الموسيقى. استخدم "الإعدادات الذكية" لضبط الجو.',
      '3. تخصيص: استخدم "الوضع المتقدم" للحساسية والنص المخصص.',
      '4. تفاعل: اسحب لتغيير الأوضاع أو اضغط مطولاً للذكاء الاصطناعي.',
      '5. استكشاف: اضغط H للخيارات، F لملء الشاشة، R للعشوائي.'
    ],
    settingsTitle: 'دليل المعلمات',
    settingsDesc: {
      sensitivity: 'التحكم في الكسب لتفاعل الصوت.',
      speed: 'التردد الزمني للأنماط.',
      glow: 'شدة التوهج للعمق الجوي.',
      trails: 'استمرار البيكسل للحركة السائلة.',
      smoothing: 'التخميد الزمني للبيانات الطيفية.',
      fftSize: 'دقة التردد.'
    },
    projectInfoTitle: 'رؤيتنا',
    aboutDescription: 'Aura Flux هو محرك حس مرافق في الوقت الفعلي يحول الترددات الصوتية إلى فن ثلاثي الأبعاد توليدي. من خلال دمج الدقة الرياضية لـ WebGL مع الفهم الدلالي لـ Google Gemini، فإنه يخلق لغة بصرية لا تتفاعل فقط مع الصوت، بل تفهمه.',
    privacyTitle: 'التزام الخصوصية',
    privacyText: 'نؤمن بالخصوصية أولاً. يتم إجراء جميع التحليلات الطيفية والعرض المرئي محليًا على جهازك. فقط عندما تقوم بتشغيل تعريف الذكاء الاصطناعي بنشاط، يتم إرسال بصمات صوتية قصيرة ومشفرة إلى Gemini للتحليل، ولا يتم تخزينها أبدًا.',
    version: 'الإصدار', coreTech: 'التقنية', repository: 'المصدر', support: 'دعم', reportBug: 'خطأ'
  },
  onboarding: {
    welcome: 'مرحبًا بك في Aura Flux',
    subtitle: 'الجيل القادم من محرك الحس المرافق بالذكاء الاصطناعي',
    selectLanguage: 'اختر لغتك المفضلة',
    next: 'التالي', back: 'السابق', skip: 'تخطي', finish: 'ابدأ التجربة',
    features: {
      title: 'الميزات الحسية',
      visuals: { title: 'منحوتات توليدية', desc: 'أكثر من 15 محركًا تفاعليًا مدعومًا بـ WebGL والرياضيات المتقدمة.' },
      ai: { title: 'ذكاء Gemini', desc: 'بيانات وصفية فورية للمسار والتعرف على الحالة المزاجية بدعم من Google Gemini 3.' },
      privacy: { title: 'ذكاء الحافة', desc: 'تتم المعالجة محليًا. نحن لا نسجل أو نخزن بياناتك الصوتية الخاصة أبدًا.' }
    },
    shortcuts: { title: 'تحكم ديناميكي', desc: 'تحكم في بيئتك مثل المايسترو باستخدام أوامر لوحة المفاتيح هذه.' }
  }
};