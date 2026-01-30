
# Aura Flux 🎵👁️

### AI 驱动的 3D 音乐可视化与通感分析引擎 (v1.8.12)

[English](README.md) | [在线演示](https://aura.tanox.net/) | [更新日志](CHANGELOG.md)

<!-- README.md -->

<p align="center">
  <img src="https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black" />
  <img src="https://img.shields.io/badge/Three.js-WebGL-white?logo=three.js&logoColor=black" />
  <img src="https://img.shields.io/badge/AI-Gemini%203-8E75B2?logo=google&logoColor=white" />
  <img src="https://img.shields.io/badge/Perf-离屏渲染-orange" />
  <img src="https://img.shields.io/badge/License-Apache%202.0-blue.svg" />
</p>

**Aura Flux** 是一款将实时音频转化为沉浸式 3D 生成艺术的新一代 Web 应用。它融合了高精度的实时频谱分析技术与 **Google Gemini 3** 通感大模型，打造了一个不仅仅是对声音做出反应，更能“理解”音乐情绪、流派和质感的“通感引擎”。

借助多线程 **OffscreenCanvas** 和 **WebGL** 技术，它能以稳定的 60FPS 帧率在浏览器中渲染 15+ 种复杂的视觉引擎。

---

## ✨ 核心特性

*   **🧠 AI 通感 (AI Synesthesia):** 由 Gemini 3.0 Flash 驱动，实时聆听并识别曲目信息，分析音乐情绪（Mood），并提取歌词片段。
*   **🎨 生成式视觉引擎:**
    *   **WebGL 3D:** 神经流 (Neural Flow)、动感光墙 (Kinetic Wall)、量子方阵 (Cube Field)、熔核反应 (Liquid Core)。
    *   **经典 2D:** 数字波形、深空星云、复古激光、频谱仪。
*   **🎥 录制工作室 (Studio):** 内置高保真视频录制功能。支持 **4K/1080p** (WebM/MP4) 录制，完美同步内部音频，是制作社交媒体短片或 MV 的利器。
*   **🎵 智能播放器:** 支持拖拽播放本地音频文件。完整支持 **ID3 元数据**（专辑封面、艺术家、标题）读取及播放列表管理。
*   **🎛️ 深度定制:** 微调灵敏度、平滑度、速度、色彩和辉光效果。提供“赛博朋克”、“禅意”、“派对”等一键智能预设。
*   **🛡️ 边缘优先隐私:** 所有音频频谱分析均通过 Web Audio API 在本地浏览器完成，音频数据绝不上传服务器。

---

## 🌟 应用场景

无论你是创作者、音乐爱好者还是开发者，Aura Flux 都能为你的环境增添灵动的光影：

### 🎙️ 内容创作与直播
*   **直播背景:** 为 OBS/直播姬推流增加透明背景的动态音频响应层，提升直播间科技感。
*   **MV 制作:** 使用**录制工作室**为你的原创音乐快速生成高质量的视觉伴奏视频。
*   **播客可视化:** 将纯音频内容转化为吸引眼球的动态视频片段分享至社交媒体。

### 🎛️ 现场演出 & VJ
*   **轻量级 VJ 工具:** 无需安装笨重的专业软件，浏览器即开即用。连接投影仪，按 `F` 键全屏即可震撼全场。
*   **酒吧与活动:** 使用“动感光墙”或“激光矩阵”模式，驱动现场大屏随音乐律动。

### 🏠 环境氛围 & 居家
*   **客厅艺术:** 投屏到 4K 电视，将客厅瞬间变身沉浸式视听俱乐部。
*   **专注与心流:** 切换至“深空星云”或“流光绸缎”等舒缓模式，作为辅助编程、阅读或冥想的动态白噪音视觉伴侣。
*   **电子相框:** 在挂壁平板或显示器上运行，作为永不重复的数字艺术装饰。

### 📚 教育与科技
*   **物理可视化:** 直观展示声波、频谱分布及流体动力学原理。
*   **Web 技术展示:** 展示现代移动设备上 WebGL 与 Web Workers 的强大性能。

---

## 🎮 使用指南

**🚀 快速开始:** 访问 **[aura.tanox.net](https://aura.tanox.net/)** (推荐 Chrome, Edge, Safari)。

1.  **选择音源:**
    *   **麦克风 (Mic):** 捕获系统声音或麦克风输入（适合配合 Spotify/网易云音乐使用）。
    *   **文件 (File):** 拖拽 MP3/WAV/FLAC 文件，享受高音质内部播放与 ID3 封面展示。
2.  **视觉控制:**
    *   按 `H` 打开**控制面板**。
    *   点击 **智能预设 (Smart Presets)** 一键切换氛围。
    *   在 **专业模式** 下微调 `灵敏度` 或 `辉光` 等参数。
3.  **AI 能力:**
    *   按 `L` 键或点击“AI 通感”开关，识别当前播放的歌曲并分析情绪。
    *   *注：完整功能需要配置 Gemini API Key。*
4.  **录制:**
    *   进入 **工作室 (Studio)** 标签页，录制并导出你的视觉创作。

---

## 🛠️ 技术栈

*   **核心:** React 19, TypeScript, Vite 6.
*   **图形:** Three.js, React Three Fiber, Postprocessing (Bloom, Noise).
*   **性能:** Web Workers & OffscreenCanvas (主线程零阻塞渲染).
*   **AI:** Google GenAI SDK (Gemini 3 Flash).
*   **音频:** Web Audio API (AnalyserNode, AudioWorklet), jsmediatags.

---

## 📄 开源协议

本项目采用 Apache License 2.0 授权 - 详情请参阅 [LICENSE](LICENSE) 文件。

---
*Made with 💜 using React and Google Gemini API*
