/**
 * File: assets/locales/tw.ts
 * Version: 1.7.35
 * Author: Sut
 * Copyright (c) 2024 Aura Vision. All rights reserved.
 * Updated: 2025-03-05 12:00
 */

import { VisualizerMode, LyricsStyle } from '../../core/types';

export const tw = {
  common: {
    on: '開啟', off: '關閉', visible: '顯示', hidden: '隱藏', active: '啟用', muted: '靜音', beta: '測試版', simple: '簡潔', advanced: '專業'
  },
  tabs: {
    visual: '視覺', text: '文字', audio: '音訊', ai: 'AI 通感辨識', system: '系統'
  },
  hints: {
    mode: '選擇用於生成視覺效果的數學渲染引擎。',
    theme: '應用精心調校的場景配色方案。',
    speed: '時間流速倍率。低數值催眠舒緩，高數值動感強烈。',
    glow: '開啟後期泛光 (Bloom)。關閉可提升低階裝置效能。',
    trails: '控制光影殘留時間。高數值可產生如油畫般的流動感。',
    sensitivity: '音訊響應增益。在安靜環境下調高此值可增強視覺爆發力。',
    smoothing: '時域阻尼係數。高數值如液體般柔順，低數值則反應銳利。',
    fftSize: '頻譜採樣精度。4096 提供極致細節但消耗更多 CPU 資源。',
    lyrics: '激活 AI 驅動的聲景分析、曲目辨識與通感描述。',
    lyricsStyle: '更改辨識結果及元數據的排版風格。',
    region: '針對特定音樂市場優化 AI 搜尋的匹配權重。',
    autoRotate: '自動循環切換不同的視覺化引擎。',
    rotateInterval: '自動切換到下一個視覺化引擎前的停留時間（秒）。',
    cycleColors: '隨時間推移自動平滑過渡色彩主題。',
    colorInterval: '平滑過渡到下一色彩主題前的停留時間（秒）。',
    reset: '將所有應用設定、語言及音訊選項恢復至原廠狀態。',
    confirmReset: '確認重設？此操作無法復原。',
    resetVisual: '僅重置視覺參數（速度、光暈、殘影）至預設值。',
    resetText: '清除自訂文字內容、字體及排版設定。',
    resetAudio: '恢復靈敏度、平滑度及 FFT 解析度為預設值。',
    resetAi: '重置辨識設定。',
    randomize: '隨機生成一套意想不到的模式與配色組合。',
    fullscreen: '進入沉浸式全螢幕互動模式。',
    help: '查看快捷鍵操作指南與專案詳細文件。',
    mic: '啟動或靜音系統麥克風訊號。',
    device: '選擇當前活動的音訊輸入硬體。',
    monitor: '透過揚聲器監聽輸入訊號。',
    hideCursor: '自動隱藏滑鼠游標以獲得純淨視覺體驗。',
    wakeLock: '啟用後，只要視覺化處於活動狀態，螢幕將保持常亮。',
    showFps: '在螢幕左上角顯示即時的幀率 (FPS) 計數器。',
    showTooltips: '滑鼠懸停在控制項上時顯示功能說明。',
    doubleClickFullscreen: '允許透過雙擊螢幕任意位置切換全螢幕模式。',
    autoHideUi: '在無操作時自動隱藏底部控制面板。',
    mirrorDisplay: '水平翻轉畫面 (適用於背投或攝影機模式)。',
    showCustomText: '切換自訂文字圖層的可見性。',
    textPulse: '文字大小隨音樂節奏動態縮放。',
    textAudioReactive: '文字的透明度和大小將響應即時音量。',
    customTextCycleColor: '自動在光譜色中循環切換文字顏色。',
    text3D: '為自訂文字應用偽 3D 浮雕效果。',
    uiModeSimple: '隱藏技術參數，專注於核心美學調整。',
    uiModeAdvanced: '展示所有調優參數以獲得精確控制。',
    quality: '調節渲染解析度與粒子密度。',
    textSize: '縮放自訂文字圖層的大小。',
    textRotation: '旋轉文字覆蓋層。',
    textPosition: '自訂文字的錨定錨點位置。',
    lyricsPosition: 'AI 歌詞覆蓋層的顯示錨點位置。',
    customTextPlaceholder: '輸入您的訊息。',
    textOpacity: '自訂文字的透明度。',
    cycleSpeed: '完成一次色彩循環所需的時間（秒）。',
    lyricsFont: 'AI 歌詞的字體樣式。',
    lyricsFontSize: '字體大小',
    textFont: '自訂文字圖層的字體系列。',
    recognitionSource: 'AI 角色偏好',
    exportConfig: '將當前所有設定導出為 JSON 配置檔。',
    importConfig: '從 JSON 檔案載入配置。',
    savePreset: '將當前狀態保存到瀏覽器本地存儲。',
    loadPreset: '載入此預設。',
    copyConfig: '將配置代碼複製到剪貼簿以便分享。'
  },
  aiPanel: {
      keySaved: 'API Key 已驗證並保存',
      keyInvalid: 'API Key 無效',
      keyCleared: 'API Key 已清除',
      saved: '已保存',
      missing: '未配置',
      save: '保存',
      update: '更新',
      geminiHint: '可選。留空則使用預設免費配額。',
      customHint: '必填。Key 僅保存在本地瀏覽器中。',
      groqHint: '必填。用於極速 Whisper+Llama 推理。'
  },
  visualizerMode: '視覺化模式',
  styleTheme: '視覺風格',
  settings: '進階設定',
  sensitivity: '響應靈敏度',
  speed: '演化速度',
  glow: '霓虹光暈',
  trails: '動態殘影',
  autoRotate: '視覺化模式循環',
  rotateInterval: '切換間隔 (秒)',
  cycleColors: '自動循環配色',
  colorInterval: '切換間隔 (秒)',
  cycleSpeed: '循環週期 (秒)',
  monitorAudio: '音訊監聽',
  audioInput: '輸入來源選擇',
  lyrics: 'AI 通感辨識',
  showLyrics: '激活通感引擎',
  displaySettings: '顯示設定',
  language: '介面語言',
  region: '音樂市場定位',
  startMic: '開啟音訊採集',
  stopMic: '停止音訊採集',
  listening: '監聽中',
  identifying: '正在捕獲聲景特徵...',
  startExperience: '步入流光之境',
  welcomeTitle: 'Aura Flux | 靈動流光',
  welcomeText: '讓每一縷振動凝結為視覺傑作。由 Gemini AI 驅動，將聲音重構為觸手可及的光影藝術。',
  unsupportedTitle: '瀏覽器不受支援',
  unsupportedText: 'Aura Flux 需要現代瀏覽器功能才能運作。請更新 Chrome, Edge 或 Safari。',
  hideOptions: '收起',
  showOptions: '顯示設定',
  reset: '重置全域設定',
  confirmReset: '確認重設？',
  resetEngine: '重置引擎',
  confirmResetAction: '確認重置',
  resetVisual: '重置視覺參數',
  resetText: '重置文字設定',
  resetAudio: '重置音訊設定',
  resetAi: '重置辨識設定。',
  randomize: '隨機美學組合',
  help: '說明與協助',
  close: '關閉',
  betaDisclaimer: 'Beta：通感神經網絡正在校準中。',
  wrongSong: '特徵不匹配？重新採樣',
  hideCursor: '隱藏滑鼠游標',
  customColor: '文字顏色',
  randomizeTooltip: '隨機視覺設定 (R)',
  smoothing: '動態平滑度',
  fftSize: '頻域解析度 (FFT)',
  appInfo: '關於應用',
  appDescription: '一個基於即時頻域分析與 Gemini AI 語意辨識的沉浸式音樂視覺化套件。',
  version: '版本號',
  defaultMic: '系統預設麥克風',
  customText: '自訂文字內容',
  textProperties: '排版與佈局',
  text3D: '3D 立體效果',
  customTextPlaceholder: '輸入文字',
  showText: '顯示文字圖層',
  pulseBeat: '隨節奏律動',
  textAudioReactive: '音訊響應',
  textSize: '字體大小',
  textRotation: '旋轉角度',
  textFont: '字體樣式',
  textOpacity: '不透明度',
  textPosition: '顯示位置',
  quality: '渲染畫質',
  qualities: {
    low: '流暢', med: '均衡', high: '極致'
  },
  visualPanel: {
    effects: '視覺特效', automation: '自動化', display: '顯示'
  },
  audioPanel: {
    info: '調節「靈敏度」以改變反應強度。更高的 FFT 解析度能提供更精細的細節。'
  },
  systemPanel: {
    interface: '介面互動', behavior: '系統行為', maintenance: '維護與資訊', engine: '渲染架構', audio: '音訊架構', ai: 'AI'
  },
  config: {
    title: '雲端與資料',
    export: '導出配置',
    import: '導入配置',
    library: '本地預設庫',
    save: '保存',
    load: '載入',
    delete: '刪除',
    placeholder: '預設名稱...',
    confirmImport: '覆蓋當前設定？',
    invalidFile: '檔案格式無效',
    importSuccess: '配置載入成功',
    copy: '複製',
    copied: '已複製',
    limitReached: '最多只能儲存 5 個預設。'
  },
  showFps: '顯示幀率',
  showTooltips: '顯示提示',
  doubleClickFullscreen: '雙擊全螢幕',
  autoHideUi: '自動隱藏控制欄',
  mirrorDisplay: '鏡像翻轉',
  presets: {
    title: '智慧預設',
    hint: '一鍵應用由專家精心調校的參數組合。',
    select: '選擇一種心境...',
    custom: '自定義 / 已修改',
    all_modes: '所有模式',
    calm: '數位波形',
    party: '動感光牆派對',
    ambient: '深空星雲',
    cyberpunk: '賽博雷射', 
    retrowave: '復古力場',
    vocal: '人聲頻譜' 
  },
  recognitionSource: 'AI 角色偏好',
  lyricsPosition: '歌詞顯示位置',
  lyricsFont: '字體樣式',
  lyricsFontSize: '字體大小',
  simulatedDemo: '演示模式 (離線)',
  positions: {
      top: '頂部', center: '居中', bottom: '底部', tl: '左上', tc: '中上', tr: '右上', ml: '左中', mc: '正中', mr: '右中', bl: '左下', bc: '中下', br: '右下'
  },
  wakeLock: '螢幕常亮',
  system: {
    shortcuts: { mic: '麥克風', ui: '介面', mode: '模式', random: '隨機' }
  },
  errors: {
    title: '音訊錯誤', accessDenied: '權限被拒絕', noDevice: '未發現設備', deviceBusy: '設備忙', general: '無法訪問音訊', tryDemo: '演示模式'
  },
  modes: {
    [VisualizerMode.NEURAL_FLOW]: '神經流體 (WebGL)',
    [VisualizerMode.CUBE_FIELD]: '量子方陣 (WebGL)',
    [VisualizerMode.PLASMA]: '流體電漿',
    [VisualizerMode.BARS]: '頻譜分析',
    [VisualizerMode.PARTICLES]: '星際穿越', 
    [VisualizerMode.TUNNEL]: '幾何時空隧道',
    [VisualizerMode.RINGS]: '霓虹共振環',
    [VisualizerMode.NEBULA]: '深空星雲',
    [VisualizerMode.LASERS]: '舞台雷射矩陣',
    [VisualizerMode.FLUID_CURVES]: '極光之舞',
    [VisualizerMode.MACRO_BUBBLES]: '微觀液泡', 
    [VisualizerMode.KINETIC_WALL]: '動感光牆 (WebGL)', 
    [VisualizerMode.LIQUID]: '液態星球 (WebGL)',
    [VisualizerMode.WAVEFORM]: '數位波形'
  },
  modeDescriptions: {
    [VisualizerMode.NEURAL_FLOW]: '基於 WebGL 粒子系統的有機流體模擬。',
    [VisualizerMode.CUBE_FIELD]: '響應頻率的幾何方塊無盡矩陣。',
    [VisualizerMode.PLASMA]: '基於經典展示場景效果的平滑流體色彩混合。',
    [VisualizerMode.BARS]: '帶有懸浮峰值的經典頻譜分析儀。',
    [VisualizerMode.PARTICLES]: '隨節拍強度反應的深空星野穿越。',
    [VisualizerMode.TUNNEL]: '遞迴幾何隧道。',
    [VisualizerMode.RINGS]: '從中心向外擴散的霓虹共振環。',
    [VisualizerMode.NEBULA]: '深空粒子模擬。',
    [VisualizerMode.LASERS]: '高能銳利光束。',
    [VisualizerMode.FLUID_CURVES]: '平滑大氣光波。',
    [VisualizerMode.MACRO_BUBBLES]: '柔焦微觀液泡。',
    [VisualizerMode.KINETIC_WALL]: '帶有 3D 動力學擠出的巨型 LED 舞台背景牆。',
    [VisualizerMode.LIQUID]: '對低頻做出反應的抽象球體。',
    [VisualizerMode.WAVEFORM]: '展現頻譜歷史的液體絲帶。'
  },
  lyricsStyles: {
    [LyricsStyle.STANDARD]: '標準排版', [LyricsStyle.KARAOKE]: '動態律動', [LyricsStyle.MINIMAL]: '極簡主義'
  },
  helpModal: {
    title: 'Aura Flux 交互指南',
    tabs: { guide: '指南', shortcuts: '控制', about: '關於' },
    intro: 'Aura Flux 利用高精度採樣，結合 Gemini 3 智能大腦，將音訊實時轉化為數學生成的數字藝術。',
    shortcutsTitle: '快捷操作鍵',
    gesturesTitle: '觸控手勢',
    shortcutItems: {
      toggleMic: '麥克風', fullscreen: '全屏', randomize: '隨機', lyrics: '曲目辨識', hideUi: '顯示/隱藏面板', glow: '霓虹光暈', trails: '動態殘影', changeMode: '切換模式', changeTheme: '切換配色'
    },
    gestureItems: {
        swipeMode: '左右滑動切換模式', swipeSens: '上下滑動調節靈敏度', longPress: '長按激活 AI 辨識'
    },
    howItWorksTitle: '使用指南',
    howItWorksSteps: [
      '1. 連接: 點擊「開啟體驗」並授權麥克風。',
      '2. 視覺: 播放音樂。使用「智慧預設」設定氛圍。',
      '3. 定制: 切換「專業模式」以微調參數。',
      '4. 交互: 滑動切換模式，長按 AI 辨識。',
      '5. 探索: 按 H 打開設置，F 全屏，R 隨機。'
    ],
    settingsTitle: '核心參數指南',
    settingsDesc: {
      sensitivity: '振幅反應增益。', speed: '時間演化速率。', glow: '全域輝光強度。', trails: '運動模糊效果。', smoothing: '平滑係數。', fftSize: '頻譜採樣精度。'
    },
    projectInfoTitle: '項目簡介',
    aboutDescription: '新一代視聽交互工具。適用於直播、VJ 演出及沉浸式環境。',
    privacyTitle: '隱私安全',
    privacyText: '音訊分析在本地完成。僅在辨識時發送加密特徵至 Gemini。',
    version: '版本號', coreTech: '技術棧', repository: '倉庫', support: '支持', reportBug: '反饋'
  },
  onboarding: {
    welcome: '歡迎體驗 Aura Flux',
    subtitle: '新一代 AI 音樂通感引擎',
    selectLanguage: '選擇您的偏好語言',
    next: '繼續', back: '返回', skip: '跳過', finish: '開啟盛宴',
    features: {
      title: '感官特性',
      visuals: { title: '數學生成藝術', desc: '內置 15+ 種基於 WebGL 的數學動力學引擎，將聲波具象化。' },
      ai: { title: 'Gemini 智能核心', desc: '實時感知曲目元數據與視覺情緒，由 Google Gemini 3 提供支持。' },
      privacy: { title: '邊緣計算保護', desc: '所有分析均在本地執行，我們絕不記錄或存儲您的私人聲音數據。' }
    },
    shortcuts: { title: '指揮官快捷鍵', desc: '像指揮家一樣掌控全場，通过键盘即時調遣光影。' }
  }
};