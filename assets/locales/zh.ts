/**
 * File: assets/locales/zh.ts
 * Version: 1.6.29
 * Author: Sut
 * Copyright (c) 2024 Aura Vision. All rights reserved.
 * Updated: 2025-02-18 18:15
 */

import { VisualizerMode, LyricsStyle } from '../../core/types';

export const zh = {
  common: {
    on: '开启', off: '关闭', visible: '显示', hidden: '隐藏', active: '运行中', muted: '静音', beta: '测试版', simple: '简洁', advanced: '专业'
  },
  tabs: {
    visual: '视觉', text: '文字', audio: '音频', ai: 'AI 通感', system: '系统'
  },
  hints: {
    mode: '切换用于生成实时影像的核心数学引擎。',
    theme: '应用精心调校的沉浸式色彩主题。',
    speed: '时间流速倍率。低数值催眠舒缓，高数值动感强烈。',
    glow: '开启后期辉光渲染 (Bloom)。关闭可显著提升低配设备性能。',
    trails: '控制光影残留时间。高数值可产生如油画般的流动轨迹。',
    sensitivity: '音频响应增益。在安静环境下调高此值可增强视觉爆发力。',
    smoothing: '时域阻尼系数。高数值如液体般柔顺，低数值则反应锐利。',
    fftSize: '频谱采样精度。4096 提供极致细节，但会增加 CPU 负载。',
    lyrics: '激活 AI 驱动的声景分析与歌词同步展示。',
    lyricsStyle: '更改识别结果及歌词的排版风格。',
    region: '针对特定音乐市场优化 AI 搜索的匹配权重。',
    autoRotate: '自动循环切换不同的视觉引擎。',
    rotateInterval: '切换到下一个视觉引擎前的停留时间（秒）。',
    cycleColors: '随时间推移自动平滑过渡色彩主题。',
    colorInterval: '平滑过渡到下一个色彩主题前的停留时间（秒）。',
    reset: '将所有应用配置、语言及音频选项恢复至出厂状态。',
    confirmReset: '确认重置？此操作将清除所有自定义设置。',
    resetVisual: '仅重置视觉参数（速度、辉光、拖尾）至默认值。',
    resetText: '清除自定义文字内容、字体及排版设置。',
    resetAudio: '恢复灵敏度、平滑度及 FFT 分辨率为默认值。',
    resetAi: '重置 AI 提供商、识别区域及歌词排版。',
    randomize: '随机生成一套意想不到的模式与配色组合。',
    fullscreen: '进入沉浸式全屏交互模式。',
    help: '查看快捷键操作指南与项目详细文档。',
    mic: '启动或静音系统麦克风信号。',
    device: '选择当前活动的音频输入硬件。',
    monitor: '通过扬声器监听输入信号（警告：可能产生啸叫）。',
    hideCursor: '自动隐藏鼠标指针以获得纯净视觉体验。',
    wakeLock: '启用后，只要视觉引擎处于活动状态，屏幕将保持常亮。',
    showFps: '在屏幕左上角显示实时的渲染帧率（FPS）。',
    showTooltips: '鼠标悬停在控件上时显示功能说明。',
    doubleClickFullscreen: '允许通过双击屏幕任意位置切换全屏模式。',
    autoHideUi: '在无操作时自动隐藏底部控制面板。',
    mirrorDisplay: '水平翻转画面（适用于背投或摄像头模式）。',
    showCustomText: '切换自定义文字图层的可见性。',
    textPulse: '文字大小随音乐节拍动态缩放。',
    textAudioReactive: '文字的透明度和大小将响应实时音量。',
    customTextCycleColor: '自动在光谱色中循环切换文字颜色。',
    uiModeSimple: '隐藏技术参数，专注于核心美学调整。',
    uiModeAdvanced: '展示所有调优参数以获得精确控制。',
    quality: '调节渲染分辨率与粒子密度。',
    textSize: '缩放自定义文字图层的大小。',
    textRotation: '旋转文字覆盖层。',
    textPosition: '自定义文字的锚定锚点位置。',
    lyricsPosition: 'AI 歌词覆盖层的显示锚点位置。'
  },
  visualizerMode: '视觉引擎',
  styleTheme: '色彩主题',
  settings: '参数微调',
  sensitivity: '响应灵敏度',
  speed: '演化速度',
  glow: '霓虹辉光',
  trails: '动态拖尾',
  autoRotate: '引擎自动巡航',
  rotateInterval: '切换间隔 (秒)',
  cycleColors: '色彩自动流转',
  colorInterval: '切换间隔 (秒)',
  cycleSpeed: '循环周期 (秒)',
  monitorAudio: '音频监听 (Monitor)',
  audioInput: '输入源选择',
  lyrics: 'AI 通感识别', 
  showLyrics: '激活通感引擎',
  displaySettings: '显示设置',
  language: '界面语言',
  region: '音乐市场定位',
  startMic: '开启音频采集',
  stopMic: '停止音频采集',
  listening: '监听中',
  identifying: '正在捕获声景特征...', 
  startExperience: '开启视听盛宴',
  welcomeTitle: 'Aura Flux | 灵动流光',
  welcomeText: '将旋律凝炼为极光，让节奏跃然屏上。融合 Gemini AI 实时声景分析，为您开启感官交响的全新维度。',
  unsupportedTitle: '浏览器不受支持',
  unsupportedText: 'Aura Flux 需要现代浏览器功能（例如 Web Audio API）才能运行。请更新到最新版本的 Chrome、Edge 或 Safari。',
  hideOptions: '收起面板',
  showOptions: '显示设置',
  reset: '重置全局设置',
  confirmReset: '确认重置？',
  resetVisual: '重置视觉参数',
  resetText: '重置文字设置',
  resetAudio: '重置音频设置',
  resetAi: '重置识别设置',
  randomize: '随机美学组合',
  help: '帮助与说明',
  close: '关闭',
  betaDisclaimer: 'Beta 协议：通感神经网络正在校准中。',
  wrongSong: '特征不匹配？重新采样',
  hideCursor: '隐藏鼠标指针',
  customColor: '文字颜色',
  randomizeTooltip: '随机视觉设置 (快捷键: R)',
  smoothing: '动态平滑度',
  fftSize: '频域分辨率 (FFT)',
  appInfo: '关于应用',
  appDescription: '一个基于实时频域分析与 Gemini AI 语义识别的沉浸式音乐可视化套件。',
  version: '版本号',
  defaultMic: '系统默认麦克风',
  customText: '自定义文字内容',
  textProperties: '排版与布局',
  customTextPlaceholder: '输入文字...',
  showText: '显示文字图层',
  pulseBeat: '随节拍律动',
  textAudioReactive: '音频响应 (大小/透明度)',
  textSize: '字体大小',
  textRotation: '旋转角度',
  textFont: '字体样式',
  textOpacity: '不透明度',
  textPosition: '显示位置',
  quality: '渲染画质',
  qualities: {
    low: '流畅',
    med: '均衡',
    high: '极致'
  },
  visualPanel: {
    effects: '视觉特效',
    automation: '自动化',
    display: '显示'
  },
  audioPanel: {
    info: '调节“灵敏度”以改变视觉对声音的反应强度，“平滑度”控制动画的流畅性。更高的 FFT 分辨率能提供更精细的细节，但会增加 CPU 负载。'
  },
  systemPanel: {
    interface: '界面交互',
    behavior: '系统行为',
    maintenance: '维护与信息',
    engine: '渲染架构',
    audio: '音频架构',
    ai: '人工智能'
  },
  showFps: '显示帧率',
  showTooltips: '显示提示',
  doubleClickFullscreen: '双击全屏',
  autoHideUi: '自动隐藏控制栏',
  mirrorDisplay: '镜像翻转',
  presets: {
    title: '智能预设',
    hint: '一键应用由专家精心调校的视觉参数组合。',
    select: '选择一种心境...',
    custom: '自定义 / 已修改',
    calm: '数字波形',
    party: '动感派对',
    ambient: '深空星云',
    cyberpunk: '舞台激光',
    retrowave: '复古夕阳',
    vocal: '人声专注'
  },
  recognitionSource: 'AI 识别源',
  lyricsPosition: '歌词显示位置',
  lyricsFont: '字体样式',
  lyricsFontSize: '字体大小',
  simulatedDemo: '模拟演示 (Demo)',
  positions: {
      top: '顶部', center: '居中', bottom: '底部', tl: '左上', tc: '中上', tr: '右上', ml: '左中', mc: '正中', mr: '右中', bl: '左下', bc: '中下', br: '右下'
  },
  wakeLock: '屏幕常亮',
  system: {
    shortcuts: { mic: '麦克风', ui: '界面', mode: '模式', random: '随机' }
  },
  errors: {
    title: '音频错误',
    accessDenied: '无法访问麦克风，请检查浏览器权限。',
    noDevice: '未检测到音频输入设备。',
    deviceBusy: '音频设备被占用或无效。',
    general: '无法访问音频设备。',
    tryDemo: '进入演示模式 (无音频)'
  },
  aiState: {
    active: '通感分析已运行', 
    enable: '激活通感引擎'
  },
  regions: {
    global: '全球', US: '美国 / 西方', CN: '中国大陆', JP: '日本', KR: '韩国', EU: '欧洲', LATAM: '拉丁美洲'
  },
  modes: {
    [VisualizerMode.NEURAL_FLOW]: '神经流体 (WebGL)',
    [VisualizerMode.CUBE_FIELD]: '量子方阵 (WebGL)',
    [VisualizerMode.PLASMA]: '流体等离子',
    [VisualizerMode.BARS]: '频谱分析',
    [VisualizerMode.PARTICLES]: '星际穿越', 
    [VisualizerMode.TUNNEL]: '几何时空隧道',
    [VisualizerMode.RINGS]: '霓虹共振环',
    [VisualizerMode.NEBULA]: '深空星云',
    [VisualizerMode.LASERS]: '舞台激光矩阵',
    [VisualizerMode.FLUID_CURVES]: '极光之舞',
    [VisualizerMode.MACRO_BUBBLES]: '微观液泡', 
    [VisualizerMode.SILK]: '流光绸缎 (WebGL)',
    [VisualizerMode.LIQUID]: '液态星球 (WebGL)',
    [VisualizerMode.WAVEFORM]: '数字波形',
    [VisualizerMode.TERRAIN]: '低多边形山脉 (WebGL)'
  },
  lyricsStyles: {
    [LyricsStyle.STANDARD]: '标准排版',
    [LyricsStyle.KARAOKE]: '动态律动',
    [LyricsStyle.MINIMAL]: '极简主义'
  },
  helpModal: {
    title: 'Aura Flux 交互指南',
    tabs: { guide: '指南', shortcuts: '控制', about: '关于' },
    intro: 'Aura Flux 是一款沉浸式的视听交互工具，它利用高精度麦克风采样，将音频信号实时转化为数学生成的数字艺术。',
    shortcutsTitle: '快捷操作键',
    gesturesTitle: '触控手势',
    shortcutItems: {
      toggleMic: '麦克风',
      fullscreen: '全屏',
      randomize: '随机',
      lyrics: '曲目识别',
      hideUi: '显示/隐藏面板',
      glow: '霓虹光晕',
      trails: '动态拖尾',
      changeMode: '切换模式',
      changeTheme: '切换配色'
    },
    gestureItems: {
        swipeMode: '水平滑动：切换模式',
        swipeSens: '垂直滑动：调节灵敏度',
        longPress: '长按：AI 通感识别'
    },
    howItWorksTitle: '使用指南',
    howItWorksSteps: [
      '1. 连接: 点击“开启体验”并授权麦克风，启动音频响应引擎。',
      '2. 视觉: 播放音乐。使用“智能预设”一键设定完美氛围。',
      '3. 定制: 切换“专业模式 (Advanced)”以微调灵敏度、FFT参数或添加“自定义文字”。',
      '4. 交互: 左右滑动切换模式，上下滑动调节灵敏度，长按激活 AI 识别。',
      '5. 探索: 按 H 打开设置，F 全屏，R 随机切换风格。'
    ],
    settingsTitle: '核心参数指南',
    settingsDesc: {
      sensitivity: '控制视觉元素对振幅反应的增益。',
      speed: '调节生成算法在时间维度上的演化速率。',
      glow: '后期处理中的全域辉光强度，增强氛围感。',
      trails: '控制像素在画面上的停留时间，产生运动模糊效果。',
      smoothing: '音频数据的平滑系数，越高则过渡越圆滑。',
      fftSize: '决定了频谱分析的颗粒度，即频段采样数量。'
    },
    projectInfoTitle: '项目简介',
    aboutDescription: '一个基于实时频域分析与 Gemini AI 语义识别的沉浸式音乐可视化套件。',
    privacyTitle: '隐私与安全',
    privacyText: '音频分析完全在本地完成。仅在识别歌曲时，会将加密的频率特征临时发送至云端，绝不存储或上传任何原始录音数据。',
    version: '版本号',
    coreTech: '核心技术',
    repository: '代码仓库',
    support: '技术支持',
    reportBug: '反馈 Bug'
  },
  onboarding: {
    welcome: '欢迎体验 Aura Flux',
    subtitle: '新一代 AI 音乐通感引擎',
    selectLanguage: '选择您的语言',
    next: '继续',
    back: '返回',
    skip: '跳过',
    finish: '立即开启',
    features: {
      title: '核心特性',
      visuals: {
        title: '生成式艺术杰作',
        desc: '12+ 种基于 WebGL 的数学动力学引擎，将声波具象化。'
      },
      ai: {
        title: 'Gemini AI 智能大脑',
        desc: '实时识别曲目元数据与视觉情绪，由 Google Gemini 3 提供支持。'
      },
      privacy: {
        title: '隐私安全保障',
        desc: '音频分析完全在本地运行，我们绝不记录或存储您的私人声音数据。'
      }
    },
    shortcuts: {
      title: '极速交互',
      desc: '通过以下快捷键，像指挥家一样掌控全场。'
    }
  }
};