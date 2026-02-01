# OpenSpec: 测试与验证规范

## 1. 健壮性自检
- [x] **FFT Size 稳定性:** 在 3D 模式下热切换采样率无崩溃。
- [x] **Context 恢复:** 锁屏或标签页切回后 AudioContext 自动恢复。
- [x] **移动端适配:** 在 iOS Safari 和 Android Chrome 上实现 60FPS 渲染。
- [x] **API 错误处理:** 无密钥或配额用尽时显示优雅的 Mock 数据。

---
*Aura Flux Testing & Validation - Version 1.8.62*