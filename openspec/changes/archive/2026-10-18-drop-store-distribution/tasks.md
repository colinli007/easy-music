## 1. 仓库设置（用户操作）

- [x] 1.1 用户撤销 `colinli007/easy-music` 的 `main` 分支保护中的 `CLA` 必需检查（决策 5）：`gh api --method DELETE repos/colinli007/easy-music/branches/main/protection/required_status_checks`，或在 GitHub 仓库 Settings → Branches 中删除。验证：`gh api repos/colinli007/easy-music/branches/main/protection` 的输出中不再出现 `CLA`（或返回 404 表示没有保护规则）

## 2. 取消 CLA

- [x] 2.1 删除 `.github/` 整个目录与 `CLA.md`，从 `package.json` 删去 `test:cla` 脚本（决策 5）。验证：`git grep -n -i 'cla'` 在 `src`、`tools`、`package.json`、`README.md`、`CONTRIBUTING.md` 中不再出现指向 CLA 的引用（文档部分在第 5 组改完后复核）

## 3. 插件在 iOS 上启用

- [x] 3.1 `git mv` 把 `src/plugins/index.android.ts` 与 `src/plugins/screens/` 下 7 个 `*.android.tsx` 覆盖到对应的平台中立文件名，删去空实现（决策 1）；改写文件头注释中关于 Android 侧、iOS 裁剪的描述。验证：`git ls-files 'src/**/*.android.*'` 为空，`pnpm typecheck` 通过
- [x] 3.2 `src/plugins/api.ts` 删去 `supported` 成员；`src/plugins/index.ts` 不再声明它；`src/app/(tabs)/profile.tsx` 无条件渲染「插件音源」入口；`src/lyrics/ui/lyrics-card.tsx` 删去 `!Plugins.supported` 分支（决策 2）；`src/app/plugins.tsx` 等路由文件中「iOS 上没有入口」的注释改写。验证：`git grep -n 'supported\b' -- src/plugins/api.ts src/app src/lyrics` 无门面 `supported` 的引用，`pnpm typecheck` 通过
- [x] 3.3 `eslint.config.js`：保留插件实现模块的禁令并把理由改为「门面是唯一出口」，删除插件专属依赖的禁令组（决策 3）。验证：`pnpm lint` 通过
- [x] 3.4 删除 `tools/check-ios-strip.mjs` 与 `package.json` 中的 `check:ios-strip` 脚本。验证：`git grep -n 'ios-strip'` 只在 `openspec/changes/archive/` 中出现

## 4. 许可证检查与版权行

- [x] 4.1 `tools/check-constraints.mjs`：许可证判定改为放行 LGPL / GPL-2.0-or-later / GPL-3.0 / AGPL-3.0，拦下仅限 GPL-2.0、专有授权与未声明（决策 4）；核心不引用插件实现模块的检查保留，理由改写为架构边界。验证：`pnpm check:constraints` 通过；在脚本内临时把一个依赖的许可证判定喂入 `GPL-2.0-only` 与 `AGPL-3.0` 各一次，前者被拦、后者放行，确认后撤回临时改动
- [x] 4.2 版权行改为 `// Copyright (C) 2026 colinli007 and contributors · 轻松音乐 EasyMusic`：`tools/eslint-rules/gpl-header.js` 的常量与注释（删去「唯一版权持有人」「经由 CLA 授权」的表述），以及所有带旧版权行的文件（决策 6）。验证：`git grep -n 'li1164267803' -- ':!openspec/changes/archive'` 为空，`pnpm lint` 通过

## 5. 文档

- [x] 5.1 `README.md`：状态横幅改为功能完成、两端已验收，并列出已知问题；能力表更新；新增「获取」一节（Android 看 Releases、首个版本发布前如实说明；iOS 自行编译，免费签名 7 天有效）（决策 7）；「关于插件音源」去掉 Android 独占与审核指南的段落；「检查」去掉 `check:ios-strip`、`test:cla`，约束说明改写；「贡献」去掉 CLA，写明不再要求 CLA 及其代价（不能单方面改许可证）；「许可证」去掉独家持有与应用商店授权的段落。验证：`grep -n -E '上架|App Store|CLA|li1164267803|尚无可用版本|ios-strip' README.md` 只剩「不上架」的说明
- [x] 5.2 `CONTRIBUTING.md`：删去 CLA 相关章节与维护者 CLA 工作流须知，版权行示例与说明按决策 6 改写，依赖许可证要求按决策 4 改写。验证：同 5.1 的 grep 无残留
- [x] 5.3 `openspec/PRODUCT.md`：「分发形态」改为仅开源分发；项目标识表的「应用商店显示名」与命名风险中以上架为前提的条目标注作废；路线图各行的「iOS 侧验收未跑」更新为实际状态（2026-09-19 iOS 全量验收及后续复验），C6a「仅 Android」改为两端；「明确不做」新增「应用商店上架」并写明理由；「验收策略」与 C2 / C6a 平台差异记录标注已完成或作废。验证：通读一遍，无以上架为目标的现行表述
- [x] 5.4 `openspec/config.yaml` 项目上下文：分发与插件裁剪两条改为仅开源分发、插件两端可用、核心不依赖插件。验证：`openspec validate drop-store-distribution --strict` 通过
- [x] 5.5 `docs/architecture.md`：「插件可裁剪」一节改写为「门面是插件模块唯一出口」，删除平台后缀文件与 `check:ios-strip` 的描述，歌词模块处「iOS 上门面为空实现」的说明删去。验证：`grep -n -E '裁剪|\.android|ios-strip|空实现' docs/architecture.md` 不再出现插件裁剪相关内容（「裁剪到上限」等无关用法除外）
- [x] 5.6 `docs/promotion/`：仓库地址改为 `colinli007/easy-music`；CSDN、掘金稿中「iOS 不包含插件系统」「iOS 使用空实现」改为两端可用；推广说明 README 的「当前发布入口差异」与核查依据按新状态更新。验证：`grep -rn -E 'li1164267803|iOS 不|空实现|index\.android' docs/promotion` 为空
  - 2026-10-18 完成。只剩 `assets/cover-prompt.txt` 中当时的生成提示词记录未改；封面图 `cover.png` 底部印着旧地址，推广说明中已标注需重新生成

## 6. 验证

- [x] 6.1 `pnpm lint`、`pnpm typecheck`、`pnpm test:queue`、`pnpm test:m3u`、`pnpm check:constraints` 全部通过
- [x] 6.2 iOS 模拟器（Release）插件验收：「我的」页出现插件音源入口；从地址安装测试插件并确认风险提示；从文件 App 选 `.js` 文件安装；插件搜索结果入库后播放（含请求头）；发现页榜单与导入歌单；歌词类插件为本地曲目取到歌词；更新与卸载。记录插件启用前后 iOS 产物体积
  - 2026-10-18 iPhone 17 Pro 模拟器（Release）全部通过，测试插件为验收目录的 `srv/plugins/acc-ios.js`：「我的」页出现插件音源入口；首次安装前弹出风险说明；从地址装上 AccIOS，从文件 App 选 `acc-b.js` 装上 AccPluginB；搜索 `ios` 得 3 条，入库后从曲库播放，服务端日志证实请求带上了插件给的 `X-Accept-Token` 与 UA（`auth.mp3` 校验通过，返回 200）；来源插件为 IOS1 给出歌词，歌词类插件按标题为远程地址曲目 `short` 给出歌词；发现页的榜单、推荐歌单（标签 → 歌单 → 曲目）、链接导入 `ios-sheet` 均正常，「全部加入歌单」新建歌单并报「新增入库 2 首，1 首原已在曲库」；更新（同版本确认后替换，服务端收到第二次下载）与卸载正常
  - 产物体积：JS bundle 6,847,215 → 7,745,476 字节（+877 KB），整个 app 117,924 → 119,680 KB
  - 发现的既有缺陷（与本 change 无关，另行处理）：iOS 本地文件曲目的 `source_ref` 存的是带应用容器 UUID 的绝对路径，重装后容器路径改变，导入的本地曲目全部报「文件已不在设备上」（副本其实仍在新容器的 `Documents/library-audio/`）。不上架后 iOS 用户需定期重新编译安装（免费签名 7 天），影响会频繁出现
  - 观察项：曲库列表停在顶部时新增曲目，新曲目插到可视区上方而不可见（FlashList v2 保持可视内容位置），头部计数已更新
- [x] 6.3 Android 模拟器回归：插件管理、搜索入库播放、发现、插件歌词照常可用；未装插件时核心能力不受影响
  - 2026-10-18 Android 模拟器（Medium_Phone_API_36.0，Release arm64）通过：「我的」页插件入口在；首次安装前弹风险说明；从文件选择器装上 `acc-ios.js`；搜索 `ios` 得 3 条并入库；发现页榜单与推荐标签正常；歌词类插件按标题为本地曲目 PPL1 给出歌词并逐行高亮；未装插件时（重装前曲库为空）界面与本地导入照常。插件曲目播放提示「无法连接到音频地址」——Release 包禁止明文 HTTP，测试服务器在 Android 上不可用，属 proposal 非目标，与本次改动无关
