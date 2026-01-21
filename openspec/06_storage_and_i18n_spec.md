# OpenSpec: 持久化与本地化规范

## 1. 持久化存储 (LocalStorage)
- **前缀:** `av_v1_`。
- **健壮性策略:** 读取 Enum 类型进行白名单校验，色盘数组非空校验。

## 2. 国际化 (i18n) 与自动检测
- **检测策略:** 优先查询 `navigator.languages`。
- **支持列表:** en, zh, tw, ja, es, ko, de, fr, ru, ar。

## 3. 专业术语标准化
- **AI Recognition** -> AI 通感识别。
- **Visualizer Mode** -> 视觉引擎。
- **Wake Lock** -> 屏幕常亮。

---
*Aura Flux Storage & i18n - Version 1.6.74*