# OpenSpec: 系统架构规范

## 1. 核心技术栈
- **Build System:** Vite 6.0 (Rollup)
- **Runtime:** React 19.0.0
- **Language:** TypeScript 5.7
- **Styling:** Tailwind CSS 3.4 (PostCSS)
- **Engine:** 
  - **2D (Optimized):** OffscreenCanvas API + Web Workers (ESM 模块化加载)
  - **3D:** Three.js (**^0.173.0**) / @react-three/fiber v9
    *   *CDN Strategy (Importmap):* 外部依赖 (React, Three.js 等) 通过 `importmap` 从 CDN (`esm.sh`) 加载，并在 Vite 构建配置中标记为 `external`。这减小了构建产物的大小，并利用了浏览器缓存。
- **Intelligence:** Google Gemini 3 (Flash Preview)
- **Audio:** Web Audio API (实时频域分析) + OfflineAudioContext (指纹提取) + AudioWorklet (特征提取 v1.6.4)

## 2. 模块解析与 Worker 策略
- **Worker 导入:** 必须使用显式相对路径 (例如 `../../core/workers/visualizer.worker.ts?worker`)。
  - *原因：* 浏览器ใน加载 Worker 时无法解析 TSConfig 的 `@` 别名，且 `importmap` 会干扰 Vite 对 Worker 依赖的打包。
- **构建配置:** Vite 配置中 `worker.format` 设为 `es` 以支持模块化 Worker。
- **离屏架构:** 渲染线程 (Worker) 独立处理 2D Canvas 绘图，主线程仅负责音频采样与状态管理。
- **AudioWorklet (v1.6.4):** 
  - 采用 **Inline Blob URL** 策略 (`useAudio.ts`) 加载 `AudioFeaturesProcessor`。
  - 实时计算 RMS 和能量特征，与主线程 UI 解耦，避免卡顿。

## 3. 并发与生命周期健壮性
- **React 19 Compatibility:** 全面支持 Concurrent Mode。
- **Strict Mode Handling:** 
  - 针对 React Strict Mode 的双重挂载特性，`VisualizerCanvas` 实现了 **Canvas Key Remounting** 策略。
  - 若 `transferControlToOffscreen()` 因 Canvas 已分离 (Detached) 而失败，组件将自动更新 `key` 强制 DOM 重绘。
- **Web Context Loss:** 3D 渲染器监听 `webglcontextlost` 与 `webglcontextrestored` 事件，实现 GPU 崩溃后的自动恢复。

---
*Aura Flux Architecture - Version 1.6.21*