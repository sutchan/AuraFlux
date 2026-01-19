
# OpenSpec: 部署与环境规范

## 1. 先决条件
- **Node.js**: 18.x 或更高版本 (LTS)。
- **包管理器**: `npm` 或 `pnpm`。
- **API 密钥**: 一个有效的 Google Gemini API 密钥。

## 2. 本地开发
1.  **克隆仓库**: `git clone <repository-url>`
2.  **创建 `.env` 文件**: 
    ```env
    API_KEY=你的_GEMINI_API_KEY
    ```
3.  **安装并运行**:
    ```bash
    npm install
    npm run dev
    ```

## 3. 生产环境部署

### 🚨 关键：Importmap 依赖策略 (Importmap Dependency Strategy)
项目采用 `index.html` 中的 **Importmap** 作为依赖版本的单一事实来源 (Single Source of Truth)。
构建配置 (`vite.config.ts`) 已配置为 **Externalize** 主要运行时依赖 (React, Three.js, GenAI SDK)，以便在生产环境中直接使用 CDN 资源。

- **Three.js 版本:** `^0.182.0` (遵循 importmap 配置)。
- **构建行为:** 构建产物将保留 `import { ... } from "three"` 等语句，由浏览器根据 `index.html` 解析。

### 构建步骤
```bash
# 注入 API Key 并构建
API_KEY=你的_GEMINI_API_KEY npm run build
```
构建产物位于 `build/` 目录。

### 部署平台适配

#### Vercel
- **Command:** `npm run build`
- **Output Directory:** `build`
- **Environment Variables:** 添加 `API_KEY`。

#### 腾讯云 EdgeOne / 静态托管
- 确保域名启用 **HTTPS**。现代浏览器的 `getUserMedia` (麦克风权限) 只能在 HTTPS 或 localhost 环境下工作。HTTP 环境下应用将无法启动音频采集。

---
*Aura Flux Deployment Guide - Version 1.0.6*
