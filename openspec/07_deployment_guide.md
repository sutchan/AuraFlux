# OpenSpec: 部署与环境规范

## 1. 先决条件
- **Node.js**: 18.x 或更高版本。
- **API 密钥**: 有效的 Google Gemini API 密钥。

## 2. 生产环境部署
### 📦 CDN 混合构建策略
项目采用 `importmap` 策略，通过 CDN (`esm.sh`) 加载核心第三方库。Vite 将这些库标记为 `external`。

### 构建步骤
```bash
API_KEY=你的_GEMINI_API_KEY npm run build
```

---
*Aura Flux Deployment Guide - Version 1.7.45*