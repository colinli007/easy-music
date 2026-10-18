## Why

项目最初定的分发形态是「应用商店上架 + 代码开源」两条路都走，仓库里有三条硬约束都是为上架服务的：外部贡献必须签 CLA（维护者才能替贡献代码向 App Store 做额外授权）；依赖不得引入 GPL 系许可证的库（维护者无权替第三方库做额外授权）；插件系统在 iOS 构建中整体裁掉（App Store 审核指南 2.5.2 / 2.3.1）。

2026-10-18 用户决定**不上架任何应用商店，只走开源分发**：Android 从 GitHub Release 获取 APK，iOS 用户自行编译安装。上架这个前提没了，三条约束就只剩代价——贡献门槛、可用依赖受限、iOS 用户拿不到插件——没有收益，应当一并放开。同时项目文档仍写着「开发中，尚无可用版本」、仓库地址与实际 `origin` 不一致，推广前必须改对。

## What Changes

- **分发形态改为仅开源**：README、PRODUCT.md、项目上下文（`openspec/config.yaml`）不再出现「上架」作为目标；「应用商店上架」进入「明确不做」并写明理由。
- **BREAKING（贡献流程）取消 CLA**：删除 CLA 签署工作流、脚本与测试、`CLA.md`；README 与 CONTRIBUTING 去掉签署要求。仓库 `main` 分支保护中的必需检查 `CLA` 需由用户在 GitHub 上撤销，否则 PR 将永远无法合并。
- **依赖许可证约束改为「能与 GPL-3.0-or-later 合并分发」**：不再禁止 GPL / LGPL / AGPL；仍拦下真正不兼容的许可证（专有授权、仅限 GPL-2.0、未声明）。
- **插件系统在 iOS 上启用**：插件管理、插件搜索、发现层、插件歌词在两端行为一致；删除 iOS 裁剪机制（平台后缀文件、空实现门面、`check:ios-strip`）。
- **仓库地址与版权持有人统一为 `colinli007`**：源文件 GPL 头部、头部检查规则、README、CONTRIBUTING、推广稿。
- **README 反映真实状态**：功能已全部完成并在两端验收；补上「如何获取」——Android 安装包从 GitHub Release 获取（尚无 Release 时如实写明），iOS 需自行编译；PRODUCT.md 路线图的「iOS 侧验收未跑」更新为实际状态。

### 非目标

- **发布第一个 GitHub Release 与签名密钥**：需要用户提供或生成正式签名密钥，并决定版本号与发布节奏；本 change 只让文档如实描述获取方式，发布是独立的一步。
- **放行明文 HTTP**：两端 Release 包都拒绝明文 HTTP（Android 默认禁止 cleartext、iOS ATS 未放开任意加载），会影响 `http://` 的远程地址与插件。这是安全与可用性的取舍，与「是否上架」正交，另开 change 讨论。
- **其他应用抢占音频后播放按钮仍显示播放中**：已记录的 iOS 缺陷，属于播放层，与分发无关。
- **把插件仍作为核心能力的依赖**：插件在 iOS 上启用后，核心能力（本地文件、远程直链、曲库、歌单、播放、缓存）仍不依赖插件——这条边界是架构约束而不是上架约束，保留。
- **修改 MusicFree 相关的禁止复制约束**：该约束出于版权而非上架，不受本次影响。
- **已归档 change 中关于上架、CLA、iOS 裁剪的历史记录**：归档是当时决策的记录，不回改。

## Capabilities

### New Capabilities

无。

### Modified Capabilities

- `plugin-source`：移除「插件能力在 iOS 上完全不存在」，改为插件能力在 Android 与 iOS 上一致可用，核心能力仍不依赖插件。
- `plugin-discovery`：移除「发现入口在 iOS 上不存在」。

## Impact

- **插件模块**：`src/plugins/index.ts` 与 `index.android.ts`、`src/plugins/screens/` 下 7 对平台文件合并为平台中立的单一实现；门面去掉 `supported` 成员，`src/app/(tabs)/profile.tsx`、`src/lyrics/ui/lyrics-card.tsx` 中依它分支的代码随之简化。
- **检查与工具**：删除 `tools/check-ios-strip.mjs`、`.github/`（CLA 工作流与脚本）及 `check:ios-strip`、`test:cla` 两个脚本；`tools/check-constraints.mjs` 的许可证判定改写；`eslint.config.js` 与 `tools/eslint-rules/gpl-header.js` 中以 iOS 裁剪为理由的注释与规则文案改写，版权行改为 `colinli007`。
- **全部源文件头部**：约 120 个文件的版权行。
- **文档**：README、CONTRIBUTING、删除 CLA.md、`openspec/PRODUCT.md`、`openspec/config.yaml`、`docs/architecture.md`、`docs/promotion/`。
- **GitHub 仓库设置（用户操作）**：撤销 `main` 分支保护中的 `CLA` 必需检查。
- **不触及**：数据库结构、播放与曲库逻辑、原生代码、依赖版本。
