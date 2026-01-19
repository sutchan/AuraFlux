
# OpenSpec: 系统架构规范

## 1. 核心技术栈
- **Build System:** Vite 5.2 (Rollup)
- **Runtime:** React 19.0.0
- **Language:** TypeScript 5.4
- **Styling:** Tailwind CSS 3.4 (PostCSS)
- **Engine:** 
  - **2D (Optimized):** OffscreenCanvas API + Web Workers (ESM 模块化加载)
  - **3D:** Three.js (**^0.182.0**) / @react-three/fiber v9
    *   *Importmap 优先:* 生产环境通过 importmap 加载依赖，Three.js 版本需与 `index.html` 中的配置保持一致。
- **Intelligence:** Google Gemini 3 (Flash Preview)
- **Audio:** Web Audio API (实时频域分析) + OfflineAudioContext (指纹提取)

## 2. 模块解析与 Worker 策略
- **Worker 导入:** 必须使用显式相对路径 (例如 `../../core/workers/visualizer.worker.ts?worker`)。
  - *原因：* 部分浏览器环境无法在 Worker 构造函数中正确解析 TSConfig 的 `@` 别名，导致 `Uncaught TypeError`。
- **构建配置:** Vite 配置中 `worker.format` 设为 `es` 以支持模块化 Worker。
- **离屏架构:** 渲染线程 (Worker) 独立处理 2D Canvas 绘图，主线程仅负责音频采样与状态管理。

## 3. 并发与生命周期健壮性
- **React 19 Compatibility:** 全面支持 Concurrent Mode。
- **Strict Mode Handling:** 
  - 针对 React Strict Mode 的双重挂载特性，`VisualizerCanvas` 实现了 **Canvas Key Remounting** 策略。
  - 若 `transferControlToOffscreen()` 因 Canvas 已分离 (Detached) 而失败，组件将自动更新 `key` 强制 DOM 重绘，确保 Worker 始终获得新的 Canvas 实例。
- **Web Context Loss:** 3D 渲染器监听 `webglcontextlost` 与 `webglcontextrestored` 事件，实现 GPU 崩溃后的自动恢复。

---
*Aura Flux Architecture - Version 1.3.1*
