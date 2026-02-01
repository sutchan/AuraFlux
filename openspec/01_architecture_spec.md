# OpenSpec: 系统架构规范

## 1. 核心技术栈
- **Build System:** Vite 6.0 (Rollup)
- **Runtime:** React 19.0.0
- **Language:** TypeScript 5.7
- **Engines:** 参考 [03 视觉生成渲染规范](./03_rendering_spec.md)。
- **Intelligence:** 参考 [04 AI 智能与语义规范](./04_ai_integration_spec.md)。
- **Audio Logic:** Web Audio API (实时分析) + IndexedDB (持久化播放列表)。

## 2. 线程解耦策略
- **主线程:** 负责 UI 状态、AI 通信、音频采集路由。
- **Worker 线程:** 处理 2D Canvas 的高频绘图逻辑，避免 UI 阻塞。
- **GPU 线程:** 承载 R3F 的 3D 渲染管线。

## 3. 数值安全性
- 全面引入 `epsilon` 保护和 `DynamicPeakLimiter` 类，确保在极端音频输入下渲染不产生 NaN 崩溃。

---
*Aura Flux Architecture - Version 1.8.62*