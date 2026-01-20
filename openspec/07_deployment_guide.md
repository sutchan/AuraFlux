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

### 📦 CDN 混合构建策略 (CDN Hybrid Strategy)
项目采用 `importmap` 策略，通过 CDN (`esm.sh`) 加载核心第三方库 (React, Three.js 等)。Vite 负责构建应用本身的代码，并将这些库标记为外部依赖 (`external`)。

- **优势:** 减小了最终构建文件的大小，并可利用浏览器对常用库的缓存。
- **注意:** 此策略依赖于 `esm.sh` CDN 的可用性和性能。

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
*Aura Flux Deployment Guide - Version 1.5.0*