
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

### 📦 标准构建策略 (Standard Bundling Strategy)
项目已弃用 Importmap，转为完全依赖 Vite 的构建与打包机制。这解决了 Worker 环境下模块解析的不一致问题。

- **依赖管理:** 所有第三方库 (React, Three.js, GenAI SDK) 均通过 `node_modules` 管理并打包至最终产物中。
- **Worker 处理:** Web Workers 会被编译为独立的 chunk，并由 Vite 自动处理其内部的 import 路径。

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
*Aura Flux Deployment Guide - Version 1.1.0*