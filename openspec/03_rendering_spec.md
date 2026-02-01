# OpenSpec: 视觉生成渲染规范 (03)

## 1. 3D 渲染管线 (React Three Fiber)
- **场景管理:** 包含 `KineticWall`, `LiquidSphere` (Resonance Orb), `CubeField`, `NeuralFlow`, `DigitalGrid`, `SilkWave`, `OceanWave`。
- **几何体优化:**
  - **Instancing:** 针对 `CubeField` 和 `KineticWall`，使用 `InstancedMesh` 将绘制调用减少至 1 次。
  - **Roundness:** `KineticWall` 采用 `RoundedBoxGeometry` 提升视觉质感。
- **着色器扩展:**
  - 利用 `onBeforeCompile` 注入自定义 GLSL 逻辑，实现基于 `DataTexture` 的实时频谱映射。
  - 支持 Fresnel 菲涅尔反射与自定义 Emissive 能量场。
- **后处理滤镜:**
  - **Bloom:** 采用 Mipmap Blur 算法实现高亮扩散，强度根据模式动态配置（3.0 - 4.0）。
  - **Dithering:** 消除 8-bit 色彩带。

## 2. 2D 渲染引擎 (Canvas 2D)
- **多引擎策略:** 包含 `Bars`, `Rings`, `Particles`, `Tunnel`, `Plasma`, `Lasers`, `FluidCurves`, `Waveform`, `Nebula`, `Ripples`。
- **渲染特性:**
  - **运动残影 (Trails):** 支持 `destination-out` 渐进式擦除。
  - **混合模式:** 大量应用 `screen` 和 `lighter` 模式增强发光感。
  - **自适应 DPI:** 自动根据设备像素比 (DPR) 调整画布分辨率。

## 3. 节拍同步与特征提取
- **通量检测 (Spectral Flux):** 计算两帧之间频谱能量的正向变化，聚焦低频段。
- **自适应阈值:** 根据 `fluxHistory` 移动平均值动态调整触发灵敏度。
- **特征工程:** 提取 `bass`, `mids`, `treble`, `volume`, `energyL`, `energyR` 六大核心维度驱动参数。

---
*Aura Flux Rendering Specification - Version 1.8.66*
*Author: Sut*