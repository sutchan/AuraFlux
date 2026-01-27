# OpenSpec: 系统架构规范

## 1. 核心技术栈
- **Build System:** Vite 6.0 (Rollup)
- **Runtime:** React 19.0.0
- **Language:** TypeScript 5.7
- **Styling:** Tailwind CSS 3.4 (PostCSS)
- **Engine:** 
  - **2D (Optimized):** OffscreenCanvas API + Web Workers (ESM 模块化加载)
  - **3D:** Three.js (**^0.182.0**) / @react-three/fiber v9
    *   *CDN Strategy (Importmap):* 外部依赖通过 `importmap` 从 CDN 加载，构建配置中标记为 `external` 以优化加载速度。
- **Intelligence:** Google Gemini 3 (Flash Preview)
- **Audio:** Web Audio API (实时频域分析) + OfflineAudioContext (指纹与切片提取) + AudioWorklet (特征提取 v1.6.4)

## 2. 模块解析与 Worker 策略
- **Worker 导入:** 必须使用显式相对路径。
- **离屏架构:** 渲染线程 (Worker) 独立处理 2D Canvas 绘图，主线程仅负责音频采样与状态管理。
- **数值安全性 (v1.6.62):** Shader 引入 `epsilon` 保护机制，防止 en 极低或归零状态下产生 `NaN` 导致渲染黑屏。

## 3. 并发与生命周期健壮性
- **React 19 Compatibility:** 全面支持 Concurrent Mode。
- **Web GL Context:** 实现了上下文丢失自动恢复监听。
- **渲染画质适配 (v1.7.9):** 
  - 为 Kinetic Wall 引入动态长宽比适配算法。
  - 为 ThreeVisualizer 引入核心组件记忆化策略，减少 R3F 协调开销。

---
*Aura Flux Architecture - Version 1.8.3*