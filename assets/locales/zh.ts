/**
 * File: assets/locales/zh.ts
 * Version: 1.7.9
 * Author: Sut
 * Copyright (c) 2024 Aura Vision. All rights reserved.
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
    lyrics: '激活 AI 驱动的声景分析、曲目识别与通感描述。',
    lyricsStyle: '更改识别结果及元数据的排版风格。',
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
    resetAi: '重置 AI 角色、识别区域及歌词排版。',
    randomize: '随机生成一套意想不到的模式与配色组合。',
    fullscreen: '进入沉浸式全屏交互模式。',
    help: '查看快捷键操作指南与项目详细文档。',
    mic: '启动或静音系统麦克风信号。',
    device: '选择当前活动的音频输入硬件。',
    monitor: '通过扬声器监听输入信号。',
    showFps: '在屏幕左上角显示实时的渲染帧率（FPS）。',
    showTooltips: '鼠标悬停在控件上时显示功能说明。',
    doubleClickFullscreen: '允许通过双击屏幕任意位置切换全屏模式。',
    autoHideUi: '在无操作时自动隐藏底部控制面板。',
    mirrorDisplay: '水平翻转画面（适用于背投或镜像显示）。',
    showCustomText: '切换自定义文字图层的可见性。',
    textPulse: '文字大小随音乐节拍动态缩放。',
    textAudioReactive: '文字的透明度和大小将响应实时音量。',
    customTextCycleColor: '自动在光谱色中循环切换文字颜色。',
    hideCursor: '自动隐藏鼠标指针以获得纯净视觉体验。',
    uiModeSimple: '隐藏技术参数，专注于核心美学调整。',
    uiModeAdvanced: '展示所有调优参数以获得精确控制。',
    quality: '调节渲染分辨率与粒子密度。',
    textSize: '缩放自定义文字图层的大小。',
    textRotation: '旋转文字覆盖层。',
    textPosition: '自定义文字的锚定位置。',
    lyricsPosition: 'AI 歌词覆盖层的显示锚点。',
    customTextPlaceholder: '输入您的自定义信息。',
    textOpacity: '自定义文字的透明度级别。',
    cycleSpeed: '完成一次色彩循环所需的时间（秒）。',
    lyricsFont: 'AI 歌词的排版风格。',
    lyricsFontSize: '缩放 AI 识别文本的大小。',
    textFont: '自定义文字图层的字体系列。',
    recognitionSource: '选择 AI 角色或提供商。',
    exportConfig: '将当前所有设置导出为配置文件。',
    importConfig: '从文件加载配置。',
    savePreset: '将当前状态保存到浏览器。',
    loadPreset: '加载此预设。',
    copyConfig: '将配置代码复制到剪贴板。'
  },
  aiPanel: {
      keySaved: 'API Key 已验证并保存',
      keyInvalid: 'API Key 无效',
      keyCleared: 'API Key 已清除',
      saved: '已保存',
      missing: '未配置',
      save: '保存',
      update: '更新',
      geminiHint: '可选。留空则使用默认免费配额。',
      customHint: '必填。Key 仅保存在本地浏览器中。',
      groqHint: '必填。用于极速 Whisper+Llama 推理。'
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
  monitorAudio: '音频监听',
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
  welcomeText: '将旋律凝炼为极光，让节奏跃然屏上。由 Gemini AI 提供实时声景分析支持。',
  unsupportedTitle: '浏览器不受支持',
  unsupportedText: 'Aura Flux 需要现代浏览器功能才能运行。请更新 Chrome, Edge 或 Safari。',
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
  betaDisclaimer: 'Beta：通感神经网络正在校准中。',
  wrongSong: '特征不匹配？重新采样',
  hideCursor: '隐藏鼠标指针',
  customColor: '文字颜色',
  randomizeTooltip: '随机视觉设置 (R)',
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
  textAudioReactive: '音频响应',
  textSize: '字体大小',
  textRotation: '旋转角度',
  textFont: '字体样式',
  textOpacity: '不透明度',
  textPosition: '显示位置',
  quality: '渲染画质',
  qualities: {
    low: '流畅', med: '均衡', high: '极致'
  },
  visualPanel: {
    effects: '视觉特效', automation: '自动化', display: '显示'
  },
  audioPanel: {
    info: '调节“灵敏度”以改变反应强度。更高的 FFT 能提供更精细的细节。'
  },
  systemPanel: {
    interface: '界面交互', behavior: '系统行为', maintenance: '维护与信息', engine: '渲染架构', audio: '音频架构', ai: 'AI'
  },
  config: {
    title: '云端与数据',
    export: '导出配置',
    import: '导入配置',
    library: '本地预设库',
    save: '保存',
    load: '加载',
    delete: '删除',
    placeholder: '预设名称...',
    confirmImport: '覆盖当前设置？',
    invalidFile: '文件格式无效',
    importSuccess: '配置加载成功',
    copy: '复制',
    copied: '已复制'
  },
  showFps: '显示帧率',
  showTooltips: '显示提示',
  doubleClickFullscreen: '双击全屏',
  autoHideUi: '自动隐藏控制栏',
  mirrorDisplay: '镜像翻转',
  presets: {
    title: '智能预设',
    hint: '一键应用由专家精心调校的参数组合。',
    select: '选择一种心境...',
    custom: '自定义 / 已修改',
    calm: '数字波形',
    party: '动感派对',
    ambient: '深空星云',
    cyberpunk: '赛博都市', 
    retrowave: '复古夕阳',
    vocal: '晶体核心' 
  },
  recognitionSource: 'AI 角色偏好',
  lyricsPosition: '歌词显示位置',
  lyricsFont: '字体样式',
  lyricsFontSize: '字体大小',
  simulatedDemo: '演示模式 (离线)',
  positions: {
      top: '顶部', center: '居中', bottom: '底部', tl: '左上', tc: '中上', tr: '右上', ml: '左中', mc: '正中', mr: '右中', bl: '左下', bc: '中下', br: '右下'
  },
  wakeLock: '屏幕常亮',
  system: {
    shortcuts: { mic: '麦克风', ui: '界面', mode: '模式', random: '随机' }
  },
  errors: {
    title: '音频错误', accessDenied: '权限被拒绝', noDevice: '未发现设备', deviceBusy: '设备忙', general: '无法访问音频', tryDemo: '演示模式'
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
    [VisualizerMode.KINETIC_WALL]: '动感光墙 (WebGL)', 
    [VisualizerMode.LIQUID]: '液态星球 (WebGL)',
    [VisualizerMode.WAVEFORM]: '数字波形'
  },
  modeDescriptions: {
    [VisualizerMode.NEURAL_FLOW]: '基于 WebGL 粒子系统的有机流体模拟。',
    [VisualizerMode.CUBE_FIELD]: '响应频率的几何方块无尽矩阵。',
    [VisualizerMode.PLASMA]: '基于经典演示场景效果的平滑流体色彩混合。',
    [VisualizerMode.BARS]: '带有悬浮峰值的经典频谱分析仪。',
    [VisualizerMode.PARTICLES]: '随节拍强度反应的深空星野穿越。',
    [VisualizerMode.TUNNEL]: '递归几何隧道。',
    [VisualizerMode.RINGS]: '从中心向外扩散的霓虹共振环。',
    [VisualizerMode.NEBULA]: '深空粒子模拟。',
    [VisualizerMode.LASERS]: '高能锐利光束。',
    [VisualizerMode.FLUID_CURVES]: '平滑大气光波。',
    [VisualizerMode.MACRO_BUBBLES]: '柔焦微观液泡。',
    [VisualizerMode.KINETIC_WALL]: '带有 3D 动力学挤出的巨型 LED 舞台背景墙。',
    [VisualizerMode.LIQUID]: '对低频做出反应的抽象球体。',
    [VisualizerMode.WAVEFORM]: '展现频谱历史的液体丝带。'
  },
  lyricsStyles: {
    [LyricsStyle.STANDARD]: '标准排版', [LyricsStyle.KARAOKE]: '动态律动', [LyricsStyle.MINIMAL]: '极简主义'
  },
  helpModal: {
    title: 'Aura Flux 交互指南',
    tabs: { guide: '指南', shortcuts: '控制', about: '关于' },
    intro: 'Aura Flux 利用高精度采样，结合 Gemini 3 智能大脑，将音频实时转化为数学生成的数字艺术。',
    shortcutsTitle: '快捷操作键',
    gesturesTitle: '触控手势',
    shortcutItems: {
      toggleMic: '麦克风', fullscreen: '全屏', randomize: '随机', lyrics: '曲目识别', hideUi: '显示/隐藏面板', glow: '霓虹光晕', trails: '动态拖尾', changeMode: '切换模式', changeTheme: '切换配色'
    },
    gestureItems: {
        swipeMode: '左右滑动切换模式', swipeSens: '上下滑动调节灵敏度', longPress: '长按激活 AI 识别'
    },
    howItWorksTitle: '使用指南',
    howItWorksSteps: [
      '1. 连接: 点击“开启”并授权麦克风。',
      '2. 视觉: 播放音乐。使用“智能预设”设定氛围。',
      '3. 定制: 切换“专业模式”以微调参数。',
      '4. 交互: 滑动切换模式，长按 AI 识别。',
      '5. 探索: 按 H 打开设置，F 全屏，R 随机。'
    ],
    settingsTitle: '核心参数指南',
    settingsDesc: {
      sensitivity: '振幅反应增益。', speed: '时间演化速率。', glow: '全域辉光强度。', trails: '运动模糊效果。', smoothing: '平滑系数。', fftSize: '频谱采样精度。'
    },
    projectInfoTitle: '项目简介',
    aboutDescription: '新一代视听交互工具。适用于直播、VJ 演出及沉浸式环境。',
    privacyTitle: '隐私安全',
    privacyText: '音频分析在本地完成。仅在识别时发送加密特征至 Gemini。',
    version: '版本号', coreTech: '技术栈', repository: '仓库', support: '支持', reportBug: '反馈'
  },
  onboarding: {
    welcome: '欢迎体验 Aura Flux',
    subtitle: '新一代 AI 音乐通感引擎',
    selectLanguage: '选择语言',
    next: '继续', back: '返回', skip: '跳过', finish: '开启体验',
    features: {
      title: '核心特性',
      visuals: { title: '生成式艺术', desc: '15+ 种 WebGL 数学动力学引擎。' },
      ai: { title: 'Gemini AI', desc: '实时曲目与情绪识别。' },
      privacy: { title: '隐私安全', desc: '本地处理，不存储录音。' }
    },
    shortcuts: { title: '极速交互', desc: '掌控全场的快捷键。' }
  }
};