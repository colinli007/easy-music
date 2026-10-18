// SPDX-License-Identifier: GPL-3.0-or-later
// Copyright (C) 2026 colinli007 and contributors · 轻松音乐 EasyMusic

/**
 * design.md 决策 9 要求每个源文件头部附 GPL 声明块。用本地规则而非第三方插件实现，
 * 一是避免为一条格式约束引入依赖，二是每新增一个依赖都需核查许可证（同为决策 9 的约束）。
 *
 * 声明块采用 SPDX 短标识 + 版权行两行形式：SPDX 可被 GitHub、F-Droid 与各类许可证
 * 扫描器直接识别。版权行写作「维护者与贡献者」（drop-store-distribution/design.md
 * 决策 6）：项目不要求 CLA，外部贡献的著作权归贡献者本人，这一行对每个文件都成立，
 * 也不随每次贡献改动文件头；具体归属由 git 历史记录。
 */

const SPDX_LINE = '// SPDX-License-Identifier: GPL-3.0-or-later';
const COPYRIGHT_LINE = '// Copyright (C) 2026 colinli007 and contributors · 轻松音乐 EasyMusic';
const HEADER = `${SPDX_LINE}\n${COPYRIGHT_LINE}\n`;

/** @type {import('eslint').Rule.RuleModule} */
module.exports = {
  meta: {
    type: 'layout',
    docs: { description: '要求源文件头部附 GPL-3.0 声明块' },
    fixable: 'whitespace',
    schema: [],
    messages: {
      missing: '源文件头部缺少 GPL-3.0 声明块（见 CONTRIBUTING.md）。',
    },
  },
  create(context) {
    return {
      Program(node) {
        const source = context.sourceCode;
        const [first] = source.getAllComments();
        if (first && first.type === 'Line' && source.getText(first).trim() === SPDX_LINE) {
          return;
        }
        context.report({
          node,
          messageId: 'missing',
          fix: (fixer) => fixer.insertTextBeforeRange([0, 0], HEADER),
        });
      },
    };
  },
};
