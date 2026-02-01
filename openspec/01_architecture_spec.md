# OpenSpec: 系统架构规范 (01)

## 1. 核心设计哲学
Aura Flux 采用 **"离屏优先" (Offscreen-First)** 与 **"混合引擎" (Hybrid Engine)** 架构，旨在实现 UI 交互与高频图形渲染的完全解耦。

## 2. 线程模型与解耦策略
- **主线程 (Main Thread):**
  - 管理 React 18 组件树、UI 状态（Bento Card 布局）、AI 服务通信及音频采集路由。
  - 承载 **React Three Fiber (R3F)** 的指令流，负责高保真 3D 场景（如 Kinetic Wall, Resonance Orb）。
- **Worker 线程 (Visualizer Worker):**
  - 使用 `OffscreenCanvas` 接口处理所有 2D 绘图逻辑。
  - 独立于 UI 刷新频率，通过 `postMessage` 接收音频频谱数据。
- **GPU 渲染管线:**
  - 3D 场景通过 WebGL 2.0 (Three.js) 进行硬件加速，支持 Bloom, Dithering 等后处理。
  - 2D 效果通过 2D Context 实现亚像素级平滑渲染。

## 3. 数值安全性与稳定性
- **NaN 保护:** 在所有涉及除法或对数的计算中引入 `EPSILON (1e-6)`。
- **动态峰值限制器 (Dynamic Peak Limiter):** 针对不稳定的音频输入，自动调节频谱增益，防止视觉效果触顶。
- **上下文自动恢复:** 监听 `webglcontextlost` 事件，并在系统资源释放后自动重新初始化渲染器。

## 4. 核心系统模块
- **UI 引擎:** 基于 Tailwind CSS 构建的响应式 Bento 布局，支持 10 种语言及 RTL。
- **音频引擎:** 集成自适应降噪与节拍检测的 Web Audio 管线。
- **AI 引擎:** 集成 Google Gemini 3 Flash 用于语义分析，Gemini 2.5 Flash Image 用于背景生成。
- **持久化层:** 使用 IndexedDB (AuraFluxDB) 存储 HQ 音频文件与元数据，LocalStorage 存储用户偏好。

---
*Aura Flux Architecture Specification - Version 1.8.66*
*Author: Sut*