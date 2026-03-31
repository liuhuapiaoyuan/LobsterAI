# Frontend refactor: stable boundaries

UI refactors should treat these surfaces as **contracts**: change only with intentional versioning, migration notes, and regression checks.

## Preload / `window.electron`

**Source:** [`src/main/preload.ts`](../src/main/preload.ts) (exposes `contextBridge.exposeInMainWorld('electron', …)`).

**Top-level namespaces:**

| Namespace | Role |
|-----------|------|
| `platform`, `arch` | OS metadata |
| `store` | `get` / `set` / `remove` (persisted key-value) |
| `skills` | Skill list, enable/disable, download/upgrade, config, `onChanged` |
| `mcp` | MCP server CRUD, marketplace, bridge refresh |
| `permissions` | Calendar check/request |
| `api` | `fetch`, streaming `stream` + `cancelStream`, stream event listeners per `requestId` |
| `ipcRenderer` | `send`, `on` (escape hatch; prefer typed APIs) |
| `window` | Minimize/maximize/close, `isMaximized`, system menu, `onStateChanged` |
| `getApiConfig`, `checkApiConfig`, `saveApiConfig` | Legacy/simple API config |
| `generateSessionTitle`, `getRecentCwds` | Session helpers |
| `openclaw.engine` | Install/status/restart + `onProgress` |
| `agents` | CRUD, presets |
| `cowork` | Sessions, permissions, config, memory, bootstrap files, stream listeners (`onStreamMessage`, …), `onSessionsChanged` |
| `dialog` | Directory/file pickers, inline save, read data URL |
| `shell` | `openPath`, `showItemInFolder`, `openExternal` |
| `autoLaunch`, `preventSleep` | App settings |
| `appInfo` | Version, system locale |
| `appUpdate` | Download/install + progress events |
| `log` | Log path, open folder, export zip |
| `im` | IM config, gateway, status, pairing, Weixin QR, events |
| `scheduledTasks` | CRUD, runs, channels, stream events |
| `networkStatus` | Renderer → main online/offline |
| `auth` | Login, token, user, quota, models, events |
| `feishu.install` | Feishu/Lark device flow |

**Types:** [`src/renderer/types/electron.d.ts`](../src/renderer/types/electron.d.ts) augments `Window` with `electron`.

## Renderer services (`src/renderer/services/`)

These wrap IPC, HTTP, or local config; components should call **services**, not raw `window.electron` where a service exists.

| Module | Responsibility |
|--------|------------------|
| `config.ts` | App config load/save |
| `api.ts` | LLM streaming and REST via main-process proxy |
| `auth.ts` | Auth session and quota |
| `cowork.ts` | Cowork sessions, stream subscription, permissions |
| `agent.ts` | Agents CRUD |
| `skill.ts` | Skills |
| `mcp.ts` | MCP |
| `scheduledTask.ts` | Scheduled tasks |
| `im.ts` | IM / gateway |
| `appUpdate.ts` | Auto-update |
| `theme.ts` | Theme application |
| `i18n.ts` | Locale strings |
| `store.ts` | Renderer preferences / electron store bridge |
| `shortcuts.ts` | Keyboard matching |
| `quickAction.ts` | Quick actions |
| `encryption.ts` | Crypto helpers |
| `endpoints.ts` | URL helpers |

Adding new UI features should **extend** these modules or add a new service file rather than duplicating IPC usage across components.

## Redux store (`src/renderer/store/`)

**Configure:** [`store/index.ts`](../src/renderer/store/index.ts).

| Slice | State focus | Notes |
|-------|-------------|--------|
| `model` | Selected model, available models | |
| `cowork` | Sessions, current session, drafts, streaming, permissions, config | Large; stream merge logic lives here |
| `skill` | Skill UI state | |
| `mcp` | MCP UI state | |
| `im` | IM UI state | |
| `quickAction` | Quick action selection | |
| `scheduledTask` | Task list / selection | |
| `agent` | Agent list / selection | |
| `auth` | Auth user / tokens | |

Refactors may **change reducers** only with the same discipline as API changes: migrations, tests, and compatibility with persisted state if any.

## Intentionally out of scope for “UI-only” refactors

- Main process handler implementations (unless adding a new IPC with matching preload).
- OpenClaw runtime and plugin wiring.
- Patch files under `patches/`.
