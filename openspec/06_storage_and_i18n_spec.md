# OpenSpec: 持久化与国际化规范

## 1. 存储设计
- **Prefix:** `av_v1_`。
- **LocalStorage:** 存储设置项、AI 密钥及 UI 状态。
- **IndexedDB:** 存储大体积音频文件，支持持久化媒体库（AuraFluxDB）。

## 2. 国际化 (v1.8.65)
- **支持语言 (10种):** English (EN), 简体中文 (ZH), 繁體中文 (TW), 日本語 (JA), Español (ES), 한국어 (KO), Deutsch (DE), Français (FR), العربية (AR), Русский (RU)。
- **完整性审计:** 已完成所有语言包的 key-value 对齐，确保 `welcomeScreen`, `visualPanel`, `studioPanel` 等字段在非英语环境下无缺失。
- **特殊布局:** 完整支持 **RTL (阿拉伯语)** 镜像布局，自动检测浏览器语言并设置文档方向。

---
*Aura Flux Storage & i18n - Version 1.8.65*