# OpenSpec: 渲染规范

## 1. 节拍检测算法 (True Beat Detection)
- **算法:** 谱通量 (Spectral Flux) 差分分析。
- **逻辑:** 输出 `isBeat` 布尔值，驱动视觉元素的瞬时爆发。

## 2. 2D 策略模式渲染器 (Worker-Compatible)
- **Digital Waveform (v2.9.0):** 优化振幅系数 (0.22) 与高频段增益补偿，增强线条视觉一致性。
- **Plasma Flow:** 去除中心白点，采用主题色深度渐变，修复色彩过载问题。

## 3. 3D WebGL 渲染
- **Neural Flow (v3.2.4 健壮性增强):**
  - **安全 Curl Noise:** 引入 `+ 0.0001` 偏移，彻底修复梯度归一化导致的 `NaN` 空白屏幕 Bug。
  - **运动拉伸 (Motion Stretching):** 通过顶点着色器计算 `vMotionDir`，在片段着色器中实现动态形状拉伸，模拟神经纤维质感。
  - **交互力场:** 映射触控点 `uPointer` 至 3D 空间，实现 Energetic (排斥) 与 Calm (吸引) 的物理反馈。
  - **粒子平衡:** 极致画质下限制为 24000 粒子 (v1.6.68)，保障 60FPS 基准。
- **Quantum Field (v1.6.3 随机翻滚优化):**
  - **随机轴动力学:** 每个方块实例分配独立旋转轴。
  - **2 倍速差:** 引入 `individualSpeedMult` 确保方阵内律动错落有致。
- **Crystal Core (v1.0.3):** 采用 `dispersion` (色散) 物理材质，替代已弃用的属性，确保兼容性。

---
*Aura Flux Rendering - Version 1.6.68*