/**
 * File: assets/locales/ru.ts
 * Version: 2.2.1
 * Author: Sut
 * Updated: 2025-03-11 14:00
 */

import { en } from './en';

export const ru = {
  ...en,
  common: {
    on: 'ВКЛ', off: 'ВЫКЛ', visible: 'ВИДИМЫЙ', hidden: 'СКРЫТЫЙ', active: 'АКТИВЕН', muted: 'БЕЗ ЗВУКА', beta: 'БЕТА', simple: 'ПРОСТОЙ', advanced: 'РАСШИР.', new: 'НОВЫЙ', unknownTrack: 'Неизвестный трек',
    menu: 'МЕНЮ', queue: 'Очередь', empty: 'Пусто', unknownArtist: 'Неизвестный исполнитель',
    clearAll: 'Очистить', confirmClear: 'Очистить очередь?',
    dropFiles: 'Перетащите аудиофайлы',
    themeLight: 'Светлая тема', themeDark: 'Темная тема'
  },
  player: {
    ...en.player,
    mode: 'Режим воспр.'
  },
  tabs: {
    visual: 'Визуал', text: 'Текст', input: 'Аудио', audio: 'Аудио', playback: 'Библиотека', ai: 'ИИ', system: 'Система', studio: 'Студия'
  },
  welcomeTitle: 'Aura Flux | Звук Света',
  welcomeText: 'Превратите каждую вибрацию в генеративный шедевр. Работает на базе Gemini AI для распознавания в реальном времени.',
  startExperience: 'Войти в поток',
  errors: {
    title: 'Ошибка аудио',
    accessDenied: 'Доступ запрещен.',
    noDevice: 'Устройство не найдено.',
    deviceBusy: 'Устройство занято.',
    general: 'Ошибка доступа.',
    tryDemo: 'Демо-режим'
  },
  systemPanel: {
    interface: 'Интерфейс', behavior: 'Поведение', maintenance: 'Обслуживание', engine: 'Движок', audio: 'Аудио', ai: 'ИИ',
    lightMode: 'Светлая тема', darkMode: 'Темная тема'
  },
  showFps: 'Показать FPS',
  showTooltips: 'Подсказки',
  doubleClickFullscreen: 'Двойной клик - весь экран',
  autoHideUi: 'Скрывать интерфейс',
  mirrorDisplay: 'Зеркало',
  hideCursor: 'Скрывать курсор',
  wakeLock: 'Не выключать экран',
  language: 'Язык',
  localFont: 'Локальный шрифт',
  enterLocalFont: 'Имя шрифта (напр. Arial)',
  aiProviders: {
    ...(en as any).aiProviders,
    MOCK: 'Симуляция',
    FILE: 'ID3 тег'
  },
  studioPanel: {
    ...en.studioPanel,
    title: 'Студия записи',
    start: 'Начать запись',
    stop: 'Остановить',
    recording: 'ЗАПИСЬ',
    processing: 'Обработка...',
    ready: 'Готово',
    save: 'Сохранить',
    discard: 'Сброс',
    share: 'Поделиться',
    settings: {
        ...(en.studioPanel.settings as any),
        resolution: 'Разрешение',
        fps: 'Кадры/с',
        bitrate: 'Битрейт',
        recGain: 'Громкость',
        fade: 'Затухание'
    }
  },
  aiPanel: {
      keySaved: 'Ключ API сохранен',
      keyInvalid: 'Неверный ключ',
      keyCleared: 'Ключ удален',
      saved: 'СОХРАНЕНО',
      missing: 'НЕТ',
      save: 'Сохр.',
      update: 'Обновить',
      geminiHint: 'Необязательно. Используется бесплатная квота.',
      customHint: 'Обязательно. Хранится локально.',
      notImplemented: 'ИИ для {provider} не реализован.'
  },
  config: {
    title: 'Облако и данные',
    export: 'Экспорт файла',
    import: 'Импорт файла',
    library: 'Локальная библиотека',
    save: 'Сохр.',
    saved: 'Сохранено',
    load: 'Загр.',
    delete: 'Удал.',
    deleteConfirm: 'Удалить этот пресет?',
    placeholder: 'Имя пресета...',
    confirmImport: 'Перезаписать текущие настройки?',
    invalidFile: 'Неверный формат',
    importSuccess: 'Конфигурация загружена.',
    copy: 'Копировать',
    copied: 'Скопировано!',
    limitReached: 'Максимум 5 пресетов.'
  },
  helpModal: {
    title: 'Руководство Aura Flux',
    tabs: { guide: 'Гайд', shortcuts: 'Кнопки', about: 'О нас' },
    intro: 'Aura Flux превращает звук в генеративное цифровое искусство, используя спектральный анализ и интеллект Gemini 3.',
    shortcutsTitle: 'Горячие клавиши',
    gesturesTitle: 'Сенсорные жесты',
    shortcutItems: {
      toggleMic: 'Вкл/Выкл Микрофон',
      fullscreen: 'На весь экран',
      randomize: 'Случайно',
      lyrics: 'ИИ Инфо',
      hideUi: 'Скрыть UI',
      glow: 'Свечение',
      trails: 'Шлейфы',
      changeMode: 'Сменить режим',
      changeTheme: 'Сменить тему'
    },
    gestureItems: {
        swipeMode: 'Свайп: Сменить режим',
        swipeSens: 'Свайп Верт: Чувствительность',
        longPress: 'Долгое нажатие: ИИ Инфо'
    },
    howItWorksTitle: 'Как использовать',
    howItWorksSteps: [
      '1. Подключение: Нажмите "Войти в поток" и разрешите доступ к микрофону.',
      '2. Визуализация: Включите музыку. Используйте "Умные пресеты" для атмосферы.',
      '3. Настройка: Используйте "Расширенный режим" для чувствительности и текста.',
      '4. Взаимодействие: Свайп для смены режима, долгое нажатие для ИИ.',
      '5. Исследование: H для настроек, F для полного экрана, R для случайного.'
    ],
    settingsTitle: 'Руководство по параметрам',
    settingsDesc: {
      sensitivity: 'Усиление реакции на звук.',
      speed: 'Скорость временных изменений.',
      glow: 'Интенсивность свечения для атмосферной глубины.',
      trails: 'Персистенция пикселей для плавного движения.',
      smoothing: 'Временное сглаживание спектральных данных.',
      fftSize: 'Частотное разрешение.'
    },
    projectInfoTitle: 'Наше видение',
    aboutDescription: 'Aura Flux — это движок синестезии в реальном времени, который превращает звуковые частоты в генеративное 3D-искусство. Объединяя математическую точность WebGL с семантическим пониманием Google Gemini, он создает визуальный язык, который не просто реагирует на звук, но и понимает его.',
    privacyTitle: 'Конфиденциальность',
    privacyText: 'Мы верим в приватность. Весь спектральный анализ и визуальный рендеринг происходят локально на вашем устройстве. Только при активном запуске ИИ-идентификации короткие зашифрованные аудио-отпечатки отправляются в Gemini для анализа и никогда не сохраняются.',
    version: 'Версия', coreTech: 'Технологии', repository: 'Исходный код', support: 'Поддержка', reportBug: 'Ошибка'
  },
  onboarding: {
    welcome: 'Добро пожаловать в Aura Flux',
    subtitle: 'ИИ-движок синестезии нового поколения',
    selectLanguage: 'Выберите предпочтительный язык',
    next: 'Далее', back: 'Назад', skip: 'Пропустить', finish: 'Начать',
    features: {
      title: 'Сенсорные функции',
      visuals: { title: 'Генеративные скульптуры', desc: '15+ реактивных движков на базе WebGL и высшей математики.' },
      ai: { title: 'Интеллект Gemini', desc: 'Мгновенные метаданные трека и распознавание настроения от Google Gemini 3.' },
      privacy: { title: 'Граничные вычисления', desc: 'Обработка остается локальной. Мы никогда не записываем и не храним ваши личные аудиоданные.' }
    },
    shortcuts: { title: 'Динамическое управление', desc: 'Управляйте своим окружением как дирижер с помощью этих клавиш.' }
  }
};
