// SPDX-License-Identifier: GPL-3.0-or-later
// Copyright (C) 2026 colinli007 and contributors · 轻松音乐 EasyMusic

/**
 * 把两条**持续约束**变成可重复执行的检查（drop-store-distribution/design.md 决策 3、4）。
 *
 * 它们不是一次性检查项：任何一次新增依赖都可能引入无法与 GPL-3.0-or-later 一起分发的
 * 许可证，任何一次为图省事把插件能力写进核心路径都会破坏门面边界。放进检查比放进人的
 * 记忆里可靠。
 *
 * 用法：pnpm check:constraints
 */

import { execSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';

const require = createRequire(import.meta.url);
const problems = [];

// ── 决策 4：依赖的许可证必须能与 GPL-3.0-or-later 合并分发 ──
// 宽松许可证、LGPL、GPL-2.0-or-later、GPL-3.0、AGPL-3.0 都可以。拦下的是：仅限 GPL-2.0
// （与 GPL-3.0 本身不兼容）、专有授权（含「个人免费、商用付费」，npm 上写作 SEE LICENSE），
// 以及未声明许可证的库——无法确认它们可以随本项目再分发。
// 前后断言让 `LGPL-2.0`、`GPL-2.0-or-later`、`GPL-2.0+` 不被误拦；`(GPL-2.0 OR MIT)` 这类双许可
// 会被拦下交人工复核，看能否按其中兼容的那一项使用。
const INCOMPATIBLE = /(?<![\w-])GPL-2\.0(-only)?(?![\w.+-])|SEE LICENSE/i;

const pkg = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'));

console.log('依赖许可证：');
for (const name of Object.keys(pkg.dependencies ?? {})) {
  let license = '未声明';
  try {
    license = require(`${name}/package.json`).license ?? '未声明';
  } catch {
    license = '无法读取';
  }
  const flagged = INCOMPATIBLE.test(String(license)) || license === '未声明';
  console.log(`  ${flagged ? '✗' : '·'} ${name.padEnd(34)} ${license}`);
  if (flagged)
    problems.push(`依赖 ${name} 的许可证为「${license}」，需人工复核（design.md 决策 4）`);
}

// ── 决策 3：核心能力只经由门面调用插件，未安装任何插件时仍是完整的播放器 ──
//
// 核心路径**可以**引用 `@/plugins` 门面与 `@/plugins/screens/*` 屏幕模块，不可以引用插件
// 实现模块。ESLint 在编辑时挡同一件事，这里在检查时再兜一次底。
const CORE = [
  'src/domain',
  'src/sources',
  'src/playback',
  'src/library',
  'src/cache',
  'src/history',
  'src/lyrics',
  'src/ui',
  'src/app',
];
let pluginRefs = '';
try {
  pluginRefs = execSync(
    `grep -rn "from '@/plugins/" ${CORE.join(' ')} --include="*.ts" --include="*.tsx" | grep -v "@/plugins/screens/" || true`,
    { encoding: 'utf8' },
  ).trim();
} catch {
  pluginRefs = '';
}

console.log('\n核心路径对插件实现模块的引用：');
if (pluginRefs) {
  console.log(pluginRefs);
  problems.push('核心能力引用了插件实现模块，绕过了插件门面（design.md 决策 3）');
} else {
  console.log('  · 无（门面与屏幕模块的引用是允许的，见上方说明）');
}

console.log(
  problems.length === 0 ? '\n✅ 两条持续约束均满足。' : `\n✗ ${problems.length} 项问题：`,
);
for (const problem of problems) console.log(`  - ${problem}`);
process.exit(problems.length === 0 ? 0 : 1);
