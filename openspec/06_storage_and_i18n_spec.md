# OpenSpec: 持久化与本地化规范

## 1. 持久化存储 (LocalStorage)
- **前缀:** `av_v1_` (版本号用于隔离破坏性变更)。
- **健壮性策略 (v1.6.21):** 
  - 读取 Enum 类型数据 (如 `VisualizerMode`) 时必须进行白名单校验。
  - **色盘防御:** 必须确保主题色数组非空且元素为有效 Hex 字符串。若检测到 `theme` 数据非法（源自旧版本数据或异常写入），必须回退至默认色盘，防止 UI 渲染由于 `undefined` 颜色崩溃。
- **Key 列表:**
  - `language`: 用户手动选择的语言键。
  - `mode`: 当前渲染模式。
  - `theme`: 数组字符串化后的色盘。
  - `settings`: 完整的配置对象 (包含 `monitor`, `autoRotate`, `customText` 等)。
  - `fingerprints`: 指纹缓存库。
  - `has_onboarded`: 首次引导完成状态。

## 2. 国际化 (i18n) 与自动检测
- **检测策略 (Browser-First):** 
  - 首次运行且无 LocalStorage 记录时，应用将查询 `navigator.language`。
  - **特例处理:** `zh-TW`, `zh-HK` 自动映射至繁体中文 (`tw`)，其余 `zh` 映射至简体中文 (`zh`)。
- **支持列表 (v1.6.21 Complete):** 
  - 英语 (en), 简体中文 (zh), 繁體中文 (tw), 日本语 (ja), 西班牙语 (es), 韩语 (ko), 德语 (de), 法语 (fr), 俄语 (ru), 阿拉伯语 (ar)。
  - **工具提示 (v1.6.20):** 已补全所有设置项、重置按钮及引擎预览的工具提示。

## 3. 专业术语标准化
- **AI Recognition** -> AI 通感识别 / AI Synesthesia Recognition。
- **Enable Recognition** -> 激活通感引擎 / Activate Synesthesia Engine。
- **Visualizer Mode** -> 视觉引擎 / Visual Engine。
- **Wake Lock** -> 屏幕常亮 / Screen Always On。

---
*Aura Flux Storage & i18n - Version 1.6.21*