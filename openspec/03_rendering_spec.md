# OpenSpec: 渲染规范

## 1. 节拍检测算法 (True Beat Detection)
- **算法:** 谱通量 (Spectral Flux) 差分分析。
- **逻辑:** 输出 `isBeat` 布尔值，驱动视觉元素的瞬时爆发。

## 2. 2D 策略模式渲染器 (Worker-Compatible)
- **Digital Waveform (v2.9.0):** 优化振幅系数 (0.22) 与高频段增益补偿。
- **Deep Nebula (v1.8.0 蜂群增强):**
  - **动态集群 (Dynamic Cluster Swarm):** 渲染器维护 8 个独立质心 (`NebulaCluster`)。
  - **漂移与瞬移:** 集群位置根据低音强度进行布朗运动。
  - **引力微透镜:** 在强拍时于主集群处绘制反向遮罩。
- **Plasma Flow:** 去除中心 white 点，采用主题色深度渐变。

## 3. 3D WebGL 渲染
- **Neural Flow (v3.2.4):** 安全 Curl Noise 引入 `+ 0.0001` 偏移。
- **Quantum Field (v1.6.3):** 引入 `individualSpeedMult` 确保方阵内律动错落有致。
- **Crystal Core (v1.0.3):** 采用 `dispersion` (色散) 物理材质。

---
*Aura Flux Rendering - Version 1.6.74*