# 贡献指南

欢迎提 Issue 和 PR，**不需要签署任何贡献者协议**。开始之前有两件事需要知道。

你的贡献以 GPL-3.0-or-later 授权并入本项目，著作权归你本人。相应地，项目今后若要改用其他许可证，需要征得每一位贡献者的同意——这是不设 CLA 的代价，项目已接受。

## 1. 新增依赖的许可证必须能与 GPL-3.0-or-later 一起分发

宽松许可证（MIT、BSD、Apache-2.0、ISC 等）以及 LGPL、GPL-2.0-or-later、GPL-3.0、AGPL-3.0 都可以。**不能引入**的是：

- **专有授权**（含「个人免费、商用付费」）：与 GPL-3.0 分发直接冲突，并会断绝 F-Droid 收录
- **仅限 GPL-2.0**（`GPL-2.0-only`）：与 GPL-3.0 本身不兼容
- **未声明许可证**：无法确认可以再分发

新增任何依赖前请在 PR 描述中注明其许可证，并跑一次 `pnpm check:constraints`。

> 这不是假设性风险。`react-native-track-player` 曾是本项目的既定播放引擎，它在 v5 转为商业授权、开源的 v4 线随即冻结——本项目因此在实施阶段更换了播放引擎，详见 [design.md 决策 3](openspec/changes/archive/2026-08-11-bootstrap-music-player/design.md)。

## 2. 源文件头部需附 GPL 声明块

每个 `.ts` / `.tsx` 源文件的头部需以下面两行开始：

```ts
// SPDX-License-Identifier: GPL-3.0-or-later
// Copyright (C) 2026 colinli007 and contributors · 轻松音乐 EasyMusic
```

版权行写作「维护者与贡献者」，对每个文件都成立，因此不随贡献者变化；谁写了哪部分由 git 历史记录。

该约束由 ESLint 强制执行（规则 `easymusic/gpl-header`，实现在 `tools/eslint-rules/`），**可自动修复**：

```bash
pnpm lint --fix
```

## 开发流程

```bash
pnpm install
pnpm typecheck   # tsc --noEmit
pnpm lint        # eslint
pnpm format      # prettier --write
```

代码分层约定见 [`docs/architecture.md`](docs/architecture.md)。**任何新增代码都必须能被归入其中某一层，且不得反向依赖。**

本项目使用 [OpenSpec](openspec/) 管理需求与设计。改动行为的 PR 请先在对应的 change 中说明，不要让代码与 spec 脱节。
