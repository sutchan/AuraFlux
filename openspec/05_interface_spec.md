# OpenSpec: UI/UX 与交互规范 (05)

## 1. 布局哲学：Bento Grid
- **响应式面板:** 设置界面采用模块化的 Bento 卡片布局，自动适配 Mobile (1-col) 与 Desktop (12-cols)。
- **视觉比例:** 
  - 核心调节面板（7 列）vs 功能支撑面板（5 列）。
- **沉浸式画布:** 主视图支持 0.98x 悬浮缩放（展开模式）与 1.0x 全屏显示（交互模式）。

## 2. 交互系统
- **VJ 控制台:**
  - **标签系统:** 视觉、输入、媒体库、图层、工作室、系统。
  - **热键映射:** 1-6 切换标签, Space 播放, R 随机, F 全屏, L 切换 HUD。
- **手势交互:**
  - 左右滑动切换视觉模式。
  - 上下滑动调节灵敏度增益。
  - 长按触发 AI 通感识别。
- **HUD (Head-Up Display):**
  - 包含实时频率脉动的 Song Overlay。
  - 基于 `useAudioPulse` 的动态歌词叠层（Standard, Karaoke, Minimal 风格）。

## 3. 4K Studio 录制
- **导出管线:** 使用 `MediaRecorder` 集成，支持 WebM (VP9/VP8) 与 MP4 (H.264) 编码。
- **高级混音:** 录制过程中注入 `GainNode` 控制录音增益，支持自动化淡入淡出 (Fade In/Out)。
- **智能触发:** 支持检测到音频信号时自动开始录制 (Sync Start) 及 3 秒视觉倒计时。

---
*Aura Flux Interface Specification - Version 1.8.66*
*Author: Sut*