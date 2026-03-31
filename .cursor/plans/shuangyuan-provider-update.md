---
name: Shuangyuan provider update
overview: 将原 Xiaomi 槽位全面改为内部键 `shuangyuan`，展示为 Shuangyuan（双源），默认 API 为 `https://ai-api.qzsyzn.com`；中文列表排第一；不做旧键 `xiaomi` 的读取兼容或数据迁移。
todos:
  - id: config-types-defaults
    content: "config.ts: AppConfig.providers 字段 xiaomi→shuangyuan、defaultConfig、CHINA_PROVIDERS 首位"
    status: pending
  - id: settings-provider-keys
    content: "Settings.tsx: providerKeys/providerMeta/providerSwitchableDefaultBaseUrls 全部改为 shuangyuan"
    status: pending
  - id: api-heuristics
    content: "api.ts: provider 白名单与 infer 返回 shuangyuan；去掉对旧 xiaomi 子串的兼容"
    status: pending
  - id: icon-optional-rename
    content: "可选：XiaomiIcon 重命名为 ShuangyuanIcon（或仅改 title/gradient id），与内部键一致"
    status: pending
isProject: true
---

# Shuangyuan（双源）替换 Xiaomi（内部键 `shuangyuan`）

## 核心约定

- **内部配置键**：统一为 **`shuangyuan`**（`AppConfig.providers.shuangyuan`、设置页、`providerKey`、会话里记录的 `providerKey` 等）。
- **不做旧键兼容**：不实现从 `providers.xiaomi` 到 `shuangyuan` 的合并/迁移；不双读旧键。升级后本地若仍残留 JSON 中的 `xiaomi` 字段，可按需在 `src/renderer/services/config.ts` init / `normalizeProvidersConfig` 里**丢弃未知键**或**启动时删除 `xiaomi`**（属清理孤立数据，不是「兼容迁移」）；若不做清理，合并结果里可能多出一个无用的 `xiaomi` 键直至用户重置配置。
- **展示名**：`src/renderer/components/Settings.tsx` 中 `providerMeta` 使用 **`Shuangyuan (双源)`**。

## API 与默认值

- **根域名**：`https://ai-api.qzsyzn.com`。
- **双格式默认**（与当前 Xiaomi 槽位相同结构）：
  - `anthropic`: `https://ai-api.qzsyzn.com/anthropic`
  - `openai`: `https://ai-api.qzsyzn.com/v1/chat/completions`
- **`defaultConfig.providers.shuangyuan.baseUrl`**（默认 `apiFormat: 'anthropic'`）：`https://ai-api.qzsyzn.com/anthropic`。

## 排序

- `src/renderer/config.ts` 中 `CHINA_PROVIDERS`：**`'shuangyuan'` 放在第一位**。
- `Settings.tsx` 中 `providerKeys`：将 **`'shuangyuan'` 置于数组首位**。

## 需修改的文件（实现时全库 `xiaomi` 再扫一遍）

| 区域 | 说明 |
|------|------|
| `src/renderer/config.ts` | 接口 `xiaomi` → `shuangyuan`；`defaultConfig.providers`；`CHINA_PROVIDERS` |
| `src/renderer/components/Settings.tsx` | `providerKeys`、`providerMeta`、`providerSwitchableDefaultBaseUrls` 键名 |
| `src/renderer/services/api.ts` | 合法 `provider` 列表；`inferProviderFromModelId` 返回 **`'shuangyuan'`**；**移除** `normalizedModelId.includes('xiaomi')` 及任何仅为旧 Xiaomi 保留的启发式（可保留 `mimo` 前缀等若仍指向该槽位，则返回 `shuangyuan`） |
| `src/renderer/components/icons/providers/index.ts` + 组件文件 | 可选：导出 `ShuangyuanIcon`、`Settings` 引用新名；SVG 内 `id`/`<title>` 避免再写 Xiaomi |

主进程（`claudeSettings.ts` 等）按 **provider 名字符串**透传，无 `xiaomi` 硬编码则通常无需改；实现后再全局检索 `xiaomi` 确认无遗漏。

## 默认模型

- 仍为 `defaultConfig.providers.shuangyuan.models` 中现有条目，除非产品提供双源侧新模型 ID（本次计划不臆改）。

## 与 IM「小蜜蜂 / xiaomifeng」无关

- `imStore.ts` 等 **xiaomifeng** 为即时通讯渠道，**不要**改动。
