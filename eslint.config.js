// SPDX-License-Identifier: GPL-3.0-or-later
// Copyright (C) 2026 colinli007 and contributors · 轻松音乐 EasyMusic

const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');
const prettierConfig = require('eslint-config-prettier/flat');

const gplHeader = require('./tools/eslint-rules/gpl-header');

module.exports = defineConfig([
  expoConfig,
  prettierConfig,
  {
    // expo-env.d.ts 由 expo 自动生成，不受 GPL 头部与代码规范约束
    ignores: ['dist/*', 'android/*', 'ios/*', 'openspec/*', 'expo-env.d.ts'],
  },
  {
    plugins: { easymusic: { rules: { 'gpl-header': gplHeader } } },
    rules: { 'easymusic/gpl-header': 'error' },
  },
  {
    // 这些脚本跑在 Node 里（本地命令行与 GitHub Actions），不在 React Native 运行时里，
    // 因此需要 Node 的全局对象——基础配置只提供 RN/浏览器那一套。
    files: ['tools/**', '.github/scripts/**'],
    languageOptions: {
      globals: {
        Buffer: 'readonly',
        console: 'readonly',
        process: 'readonly',
        __dirname: 'readonly',
      },
    },
  },
  {
    // 插件模块对外只有两个出口：`@/plugins` 门面与 `@/plugins/screens/*` 屏幕模块
    // （drop-store-distribution/design.md 决策 3）。核心代码只经由门面调用插件，插件内部
    // 才能自由重构而不波及核心；未安装任何插件时核心能力完整，也靠这条边界保证。
    files: ['src/**/*.{ts,tsx}'],
    ignores: ['src/plugins/**'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              // 逐个列出实现模块而不是「禁 @/plugins/* 再放行 screens」：gitignore 语义下
              // 被排除的目录里的文件无法再被重新放行，那种写法看着对，实际不生效。
              group: [
                '@/plugins/host/**',
                '@/plugins/store/**',
                '@/plugins/ui/**',
                '@/plugins/manager',
                '@/plugins/search',
                '@/plugins/discovery',
                '@/plugins/source',
                '@/plugins/candidate',
                '@/plugins/lyrics',
                '@/plugins/protocol',
              ],
              message:
                '插件实现只能被 src/plugins 内部引用。外部只能用 @/plugins 门面与 @/plugins/screens/* 屏幕模块。',
            },
          ],
        },
      ],
    },
  },
  {
    // media-source spec：播放器 MUST NOT 依赖任何特定来源的私有字段或私有行为。
    //
    // 只约束播放层，不约束导入流程与 UI——导入本来就是来源特有的动作（本地文件要开
    // 文件选择器，远程地址要校验 URL），把它们一并禁掉只会逼出绕过规则的写法。真正
    // 必须来源无关的是播放：它只能拿到「地址 + 请求头 + UA」这一个形状。
    files: ['src/playback/**'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@/sources/*', '!@/sources/contract', '!@/sources/resolve'],
              message:
                '播放层不得感知具体来源。只能通过 @/sources/resolve 取地址、@/sources/contract 取类型。',
            },
          ],
        },
      ],
    },
  },
]);
