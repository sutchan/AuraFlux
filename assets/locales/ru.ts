/**
 * File: assets/locales/ru.ts
 * Version: 1.6.75
 * Author: Aura Vision Team
 * Copyright (c) 2024 Aura Vision. All rights reserved.
 * Updated: 2025-02-21 23:00
 */

import { VisualizerMode, LyricsStyle } from '../../core/types';

export const ru = {
  common: {
    on: 'ВКЛ', off: 'ВЫКЛ', visible: 'ПОКАЗАТЬ', hidden: 'СКРЫТЬ', active: 'АКТИВЕН', muted: 'БЕЗ ЗВУКА', beta: 'БЕТА', simple: 'ПРОСТОЙ', advanced: 'ПРОФИ'
  },
  tabs: {
    visual: 'Визуал', text: 'Текст', audio: 'Аудио', ai: 'ИИ-Распознавание', system: 'Система'
  },
  hints: {
    mode: 'Выберите основной математический движок для генерации визуальных эффектов.',
    theme: 'Применить подобранную цветовую палитру к сцене.',
    speed: 'Множитель времени. Низкие значения гипнотизируют, высокие — энергичны.',
    glow: 'Включить пост-обработку свечения (Bloom). Отключите для повышения производительности.',
    trails: 'Управляет затуханием пикселей. Высокие значения создают эффект жидкого шлейфа.',
    sensitivity: 'Усиление реакции на звук. Увеличьте для тихих помещений.',
    smoothing: 'Временное сглаживание. Высокие значения — плавность, низкие — резкость.',
    fftSize: 'Спектральное разрешение. 4096 дает детализацию, но нагружает ЦП.',
    lyrics: 'Идентификация песен с помощью ИИ [L].',
    lyricsStyle: 'Настроить визуальное представление синхронизированных текстов.',
    region: 'Ориентировать поиск ИИ на музыку этого конкретного рынка.',
    autoRotate: 'Автоматически переключать визуальные движки.',
    rotateInterval: 'Время перед переключением на следующий движок.',
    cycleColors: 'Автоматически плавно менять цветовые темы со временем.',
    colorInterval: 'Время перед плавным переходом к следующей палитре.',
    reset: 'Восстановить все настройки приложения до заводских значений.',
    confirmReset: 'Подтвердить сброс? Это действие нельзя отменить.',
    resetVisual: 'Сбросить только эстетику (Скорость, Свечение, Шлейфы).',
    resetText: 'Очистить текст, шрифты и настройки положения.',
    resetAudio: 'Сбросить чувствительность, сглаживание и FFT.',
    resetAi: 'Сбросить ИИ-персону, регион и макет текста.',
    randomize: 'Случайная комбинация режима и цветов [R].',
    fullscreen: 'Полноэкранный режим [F].',
    help: 'Посмотреть горячие клавиши и документацию.',
    mic: 'Включить или отключить вход микрофона [Space].',
    device: 'Выберите аппаратный источник аудиовхода.',
    monitor: 'Направить звук микрофона на динамики.',
    wakeLock: 'Предотвратить выключение экрана.',
    showFps: 'Отображать счетчик FPS.',
    showTooltips: 'Показывать подсказки при наведении.',
    doubleClickFullscreen: 'Переключать полноэкранный режим двойным кликом.',
    autoHideUi: 'Автоматически скрывать панель управления.',
    mirrorDisplay: 'Отразить визуализацию по горизонтали.',
    showCustomText: 'Включить видимость текстового слоя.',
    textPulse: 'Текст масштабируется в такт музыке.',
    textAudioReactive: 'Прозрачность и размер текста реагируют на громкость.',
    customTextCycleColor: 'Циклически менять цвет текста.',
    hideCursor: 'Скрывать курсор мыши при бездействии.',
    uiModeSimple: 'Скрыть технические параметры.',
    uiModeAdvanced: 'Показать все настройки для точного контроля.',
    quality: 'Настройка разрешения и плотности частиц.',
    textSize: 'Масштаб текстового слоя.',
    textRotation: 'Вращение текстового слоя.',
    textPosition: 'Якорь для текста.',
    lyricsPosition: 'Якорь для текста ИИ.',
    customTextPlaceholder: 'Введите ваше сообщение.',
    textOpacity: 'Уровень прозрачности пользовательского текста.',
    cycleSpeed: 'Время в секундах для полного цветового цикла.',
    lyricsFont: 'Стиль типографики для текстов ИИ.',
    lyricsFontSize: 'Масштаб текста идентификации ИИ.',
    textFont: 'Семейство шрифтов для слоя пользовательского текста.',
    recognitionSource: 'Выберите личность или провайдера ИИ.'
  },
  visualizerMode: 'Визуальный движок',
  styleTheme: 'Цветовая тема',
  settings: 'Настройка',
  sensitivity: 'Чувствительность',
  speed: 'Скорость эволюции',
  glow: 'Неоновое свечение',
  trails: 'Шлейфы движения',
  autoRotate: 'Цикл движков',
  rotateInterval: 'Интервал (с)',
  cycleColors: 'Цикл цветов',
  colorInterval: 'Интервал (с)',
  cycleSpeed: 'Длительность (с)',
  monitorAudio: 'Мониторинг',
  audioInput: 'Устройство ввода',
  lyrics: 'ИИ-Синестезия',
  showLyrics: 'Включить ИИ',
  displaySettings: 'Отображение',
  language: 'Язык интерфейса',
  region: 'Целевой рынок',
  startMic: 'Включить звук',
  stopMic: 'Выключить звук',
  listening: 'Активен',
  identifying: 'ИИ анализирует трек...',
  startExperience: 'Запустить',
  welcomeTitle: 'Aura Flux | Звук Света',
  welcomeText: 'Превратите каждую вибрацию в генеративное цифровое искусство. Работает на базе Gemini AI для распознавания в реальном времени.',
  unsupportedTitle: 'Браузер не поддерживается',
  unsupportedText: 'Aura Flux требует современных функций Web Audio. Пожалуйста, используйте Chrome, Edge или Safari.',
  hideOptions: 'Свернуть',
  showOptions: 'Опции',
  reset: 'Сброс Системы',
  resetVisual: 'Сброс Эстетики',
  resetText: 'Сброс Текста',
  resetAudio: 'Сброс Аудио',
  resetAi: 'Сброс ИИ',
  randomize: 'Умный Рандом',
  help: 'Помощь',
  close: 'Закрыть',
  betaDisclaimer: 'ИИ-распознавание находится в бета-версии.',
  wrongSong: 'Не та песня?',
  hideCursor: 'Скрыть курсор',
  customColor: 'Цвет текста',
  randomizeTooltip: 'Случайные настройки (R)',
  smoothing: 'Сглаживание',
  fftSize: 'Разрешение (FFT)',
  appInfo: 'О приложении',
  appDescription: 'Иммерсивный набор визуализации на основе спектрального анализа и ИИ Gemini.',
  version: 'Сборка',
  defaultMic: 'Микрофон по умолчанию',
  customText: 'Текстовый слой',
  textProperties: 'Типографика и макет',
  customTextPlaceholder: 'ВВЕДИТЕ ТЕКСТ',
  showText: 'Показать текст',
  pulseBeat: 'Пульсация под бит',
  textAudioReactive: 'Аудио-реактивность',
  textSize: 'Размер шрифта',
  textRotation: 'Вращение',
  textFont: 'Шрифт',
  textOpacity: 'Прозрачность',
  textPosition: 'Позиция текста',
  quality: 'Качество рендера',
  qualities: {
    low: 'Скорость', med: 'Баланс', high: 'Ультима'
  },
  visualPanel: {
    effects: 'Эффекты', automation: 'Автоматизация', display: 'Экран'
  },
  audioPanel: {
    info: 'Настройте чувствительность и сглаживание. Высокий FFT дает детали, но нагружает ЦП.'
  },
  systemPanel: {
    interface: 'Интерфейс', behavior: 'Поведение', maintenance: 'Обслуживание', engine: 'Движок', audio: 'Аудио', ai: 'ИИ'
  },
  showFps: 'Показать FPS',
  showTooltips: 'Подсказки',
  doubleClickFullscreen: 'Двойной клик: Экран',
  autoHideUi: 'Авто-скрытие UI',
  mirrorDisplay: 'Отражение',
  presets: {
    title: 'Смарт-пресеты', hint: 'Применить эстетику в один клик.', select: 'Выберите настроение...', custom: 'Изменено', calm: 'Цифровая волна', party: 'Энергичная вечеринка', ambient: 'Глубокая туманность', cyberpunk: 'Концертные лазеры', retrowave: 'Ретро-закат', vocal: 'Акцент на вокал'
  },
  recognitionSource: 'ИИ-Провайдер',
  lyricsPosition: 'Позиция ИИ-текста',
  lyricsFont: 'Шрифт ИИ',
  lyricsFontSize: 'Размер ИИ',
  simulatedDemo: 'Демо (Офлайн)',
  positions: {
      top: 'Вверх', center: 'Центр', bottom: 'Вниз', tl: 'Слева Вверху', tc: 'Центр Вверху', tr: 'Справа Вверху', ml: 'Слева Посередине', mc: 'Центр', mr: 'Справа Посередине', bl: 'Слева Внизу', bc: 'Центр Внизу', br: 'Справа Внизу'
  },
  wakeLock: 'Экран всегда включен',
  system: {
    shortcuts: { mic: 'Мик', ui: 'UI', mode: 'Режим', random: 'Рандом' }
  },
  errors: {
    title: 'Ошибка аудио', accessDenied: 'Доступ запрещен. Проверьте права микрофона.', noDevice: 'Устройство не найдено.', deviceBusy: 'Устройство занято.', general: 'Ошибка доступа.', tryDemo: 'Демо-режим'
  },
  aiState: {
    active: 'ИИ Активен', enable: 'Включить ИИ'
  },
  regions: {
    global: 'Глобальный', US: 'США / Запад', CN: 'Китай', JP: 'Япония', KR: 'Корея', EU: 'Европа', LATAM: 'Латинская Америка'
  },
  modes: {
    [VisualizerMode.NEURAL_FLOW]: 'Нейронный поток (WebGL)',
    [VisualizerMode.CUBE_FIELD]: 'Квантовое поле (WebGL)',
    [VisualizerMode.PLASMA]: 'Плазменный поток',
    [VisualizerMode.BARS]: 'Спектральный анализатор',
    [VisualizerMode.PARTICLES]: 'Звездное поле',
    [VisualizerMode.TUNNEL]: 'Геометрический туннель',
    [VisualizerMode.RINGS]: 'Неоновые кольца',
    [VisualizerMode.NEBULA]: 'Глубокая туманность',
    [VisualizerMode.LASERS]: 'Лазерная матрица',
    [VisualizerMode.FLUID_CURVES]: 'Полярное сияние',
    [VisualizerMode.MACRO_BUBBLES]: 'Макро-пузырьки',
    [VisualizerMode.SILK]: 'Мерцающий шелк (WebGL)',
    [VisualizerMode.LIQUID]: 'Жидкая планета (WebGL)',
    [VisualizerMode.WAVEFORM]: 'Цифровая волна'
  },
  lyricsStyles: {
    [LyricsStyle.STANDARD]: 'Стандарт', [LyricsStyle.KARAOKE]: 'Динамичный', [LyricsStyle.MINIMAL]: 'Минимализм'
  },
  helpModal: {
    title: 'Гайд Aura Flux',
    tabs: { guide: 'Гайд', shortcuts: 'Клавиши', about: 'О проекте' },
    intro: 'Aura Flux преобразует звук в генеративное цифровое искусство на основе спектрального анализа и интеллекта Gemini 3.',
    shortcutsTitle: 'Горячие клавиши',
    gesturesTitle: 'Сенсорные жесты',
    shortcutItems: {
      toggleMic: 'Вкл/Выкл Аудио', fullscreen: 'Полный экран', randomize: 'Случайный стиль', lyrics: 'Инфо о треке ИИ', hideUi: 'Панель управления', glow: 'Неоновое свечение', trails: 'Шлейфы движения', changeMode: 'Смена режима', changeTheme: 'Смена темы'
    },
    gestureItems: {
        swipeMode: 'Свайп гориз.: Режим', swipeSens: 'Свайп верт.: Чувствительность', longPress: 'Долгое нажатие: ИИ-анализ'
    },
    howItWorksTitle: 'Начало работы',
    howItWorksSteps: [
      '1. Подключение: Нажмите "Запустить" и разрешите микрофон.',
      '2. Визуал: Включите музыку. Используйте "Смарт-пресеты".',
      '3. Настройка: Режим "Профи" для точной настройки FFT и "Своего текста".',
      '4. Управление: Свайп для смены режима. Долгое нажатие для ИИ.',
      '5. Экспорт: H для опций, F для экрана, R для рандома.'
    ],
    settingsTitle: 'Руководство по параметрам',
    settingsDesc: {
      sensitivity: 'Усиление реакции визуала на звук.', speed: 'Скорость эволюции паттернов.', glow: 'Интенсивность свечения.', trails: 'Плавность движений шлейфа.', smoothing: 'Временное сглаживание спектра.', fftSize: 'Точность спектрального анализа.'
    },
    projectInfoTitle: 'Описание проекта',
    aboutDescription: 'Aura Flux объединяет прецизионный Web Audio анализ с Google Gemini 3 для превращения звука в живой свет. Идеально для VJs и стримеров.',
    privacyTitle: 'Приватность',
    privacyText: 'Анализ аудио локальный. Шифрованные данные отправляются в Gemini только для поиска; записи не сохраняются.',
    version: 'Релиз', coreTech: 'Технологии', repository: 'Репозиторий', support: 'Поддержка', reportBug: 'Сообщить об ошибке'
  },
  onboarding: {
    welcome: 'Добро пожаловать в Aura Flux', subtitle: 'ИИ-Движок Синестезии Нового Поколения', selectLanguage: 'Выберите язык', next: 'Далее', back: 'Назад', skip: 'Пропустить', finish: 'Начать',
    features: {
      title: 'Ключевые Особенности',
      visuals: { title: 'Генеративное Искусство', desc: '12+ движков WebGL, материализующих звуковые волны.' },
      ai: { title: 'Интеллект Gemini AI', desc: 'Мгновенное распознавание треков и настроения через Google Gemini 3.' },
      privacy: { title: 'Приватно и Безопасно', desc: 'Обработка локальная. Мы не записываем ваши данные.' }
    },
    shortcuts: { title: 'Динамичное Управление', desc: 'Управляйте светом с помощью клавиш.' }
  }
};