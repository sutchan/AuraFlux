# OpenSpec: 部署与环境规范

## 1. 构建环境
- **Node.js**: 20.x+
- **Vite 6**: 开启 `esnext` 构建目标以支持最新 Web 特性。

## 2. API 注入
- 必须通过 `process.env.API_KEY` 注入默认密钥，同时支持用户在 UI 中手动覆盖以实现 BYOK 模式。

---
*Aura Flux Deployment Guide - Version 1.8.62*