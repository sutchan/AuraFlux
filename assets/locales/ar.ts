
/**
 * File: assets/locales/ar.ts
 * Version: 2.2.3
 * Author: Sut
 */

import { VisualizerMode, LyricsStyle } from '../../core/types';

export const ar = {
  common: {
    on: 'تشغيل', off: 'إيقاف', visible: 'ظاهر', hidden: 'مخفي', active: 'نشط', muted: 'صامت', beta: 'تجريبي', simple: 'بسيط', advanced: 'متقدم', new: 'جديد', unknownTrack: 'مقطع غير معروف',
    menu: 'قائمة', queue: 'قائمة التشغيل', empty: 'فارغ', unknownArtist: 'فنان غير معروف',
    clearAll: 'مسح الكل', confirmClear: 'مسح القائمة؟',
    dropFiles: 'إفلات الملفات الصوتية',
    themeLight: 'الوضع الفاتح', themeDark: 'الوضع الداكن'
  },
  toasts: {
    canvasNotFound: 'لم يتم العثور على اللوحة.',
    audioNotReady: 'مصدر الصوت غير جاهز.',
    noVideoFormat: 'تنسيق الفيديو غير مدعوم.',
    recInitFail: 'فشل تهيئة التسجيل.',
    processing: 'جاري معالجة الفيديو...',
    reviewReady: 'جاهز للمراجعة!',
    exportFail: 'فشل التصدير.',
    recStart: 'بدأ التسجيل!',
    shareFail: 'المشاركة غير مدعومة.',
    aiDirectorReq: 'مطلوب مفتاح Gemini API للمخرج الذكي.',
    aiFail: 'فشل تحليل الذكاء الاصطناعي.'
  },
  player: {
    play: 'تشغيل', pause: 'إيقاف مؤقت', previous: 'السابق', next: 'التالي', shuffle: 'عشوائي', repeatAll: 'تكرار الكل', repeatOne: 'تكرار واحد', mode: 'وضع التشغيل',
    nowPlaying: 'يتم التشغيل الآن',
    add: 'إضافة'
  },
  tabs: {
    visual: 'مرئي', text: 'طبقة المعلومات', input: 'صوت', audio: 'صوت', playback: 'المكتبة', ai: 'ذكاء', system: 'نظام', studio: 'استوديو'
  },
  studioPanel: {
    title: 'استوديو التسجيل',
    info: 'التقط مقاطع عالية الدقة لتصورك. يلتقط التسجيل كلا من المرئيات وصوت النظام.',
    start: 'بدء التسجيل',
    stop: 'إيقاف التسجيل',
    recording: 'جاري التسجيل',
    processing: 'معالجة...',
    ready: 'جاهز',
    format: 'تنسيق',
    quality: '8 ميجابت (1080p)',
    autoStop: 'إيقاف تلقائي',
    sourceMic: 'المصدر: ميكروفون',
    sourceInt: 'المصدر: صوت داخلي',
    arming: 'انتظار الإشارة...',
    cancel: 'إلغاء',
    stopping: 'تلاشي...',
    previewTitle: 'معاينة',
    save: 'حفظ الفيديو',
    discard: 'تجاهل',
    share: 'مشاركة',
    videoStream: 'دفق الفيديو',
    audioStream: 'دفق الصوت',
    videoConfig: 'إعدادات الفيديو',
    audioMix: 'الصوت والمزج',
    stats: {
        time: 'الوقت',
        size: 'الحجم'
    },
    settings: {
        resolution: 'الدقة',
        aspectRatio: 'نسبة العرض',
        fps: 'إطارات/ثانية',
        bitrate: 'معدل البت',
        codec: 'الترميز',
        resNative: 'نافذة (أصلية)',
        arNative: 'نافذة (أصلية)',
        bpsLow: 'منخفض (4 ميجا)',
        bpsStd: 'قياسي (8 ميجا)',
        bpsHigh: 'مرتفع (12 ميجا)',
        bpsUltra: 'فائق (25 ميجا)',
        syncStart: 'بدء متزامن',
        countdown: 'عد تنازلي',
        duration: 'المدة',
        unlimited: 'غير محدود',
        sec15: '15 ثانية',
        sec30: '30 ثانية',
        sec60: '60 ثانية',
        recGain: 'مستوى التسجيل',
        fade: 'تلاشي',
        fadeOff: 'لا يوجد',
        fade1s: '1 ثانية',
        fade2s: '2 ثانية'
    },
    formats: {
        vp9: 'WebM (VP9) - جودة عالية',
        vp8: 'WebM (VP8) - متوافق',
        mp4_h264: 'MP4 (H.264) - اجتماعي',
        mp4_generic: 'MP4 - عام'
    },
    hints: {
        syncStart: 'ينتظر إشارة صوتية أو زر تشغيل للبدء.',
        countdown: 'يضيف تأخير 3 ثوانٍ قبل التسجيل.',
        duration: 'يوقف التسجيل تلقائيًا بعد وقت محدد.',
        recGain: 'يضبط حجم صوت الفيديو المسجل دون تغيير حجم التشغيل.',
        fade: 'يطبق تلاشي الدخول عند البدء وتلاشي الخروج عند الإيقاف.'
    }
  },
  aiProviders: {
    GEMINI: 'Gemini 3.0',
    OPENAI: 'GPT-4o',
    GROQ: 'Groq',
    