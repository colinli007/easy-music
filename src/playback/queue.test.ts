// SPDX-License-Identifier: GPL-3.0-or-later
// Copyright (C) 2026 li1164267803 · 轻松音乐 EasyMusic

/**
 * 推进规则的单测（fix-playback-failure-handling/design.md 决策 1）。
 *
 * 「自然播完 / 失败跳过 / 用户切歌」在四种播放模式与两个方向上的组合，正是单曲循环下
 * 「界面是 A、发声是 B」那类问题藏身的地方。`step` 是纯函数，在这里穷举，
 * 设备验收只需要确认控制器把正确的原因传了进来。
 *
 * 用法：pnpm test:queue
 */

/// <reference types="node" />

import assert from 'node:assert/strict';
import test from 'node:test';

import type { PlayMode } from '@/domain/model/playback';
import {
  buildOrder,
  step,
  withRemoved,
  type AdvanceReason,
  type PlayOrder,
} from '@/playback/queue';

const MODES: readonly PlayMode[] = ['sequential', 'loopAll', 'loopOne', 'shuffle'];
const REASONS: readonly AdvanceReason[] = ['finished', 'skipped', 'user'];

/** 随机模式用固定的顺序表，结果才可断言；洗牌本身另测。 */
const SHUFFLED = [2, 0, 3, 1];
const SEQUENTIAL = [0, 1, 2, 3];

function orderAt(mode: PlayMode, position: number): PlayOrder {
  return { order: mode === 'shuffle' ? SHUFFLED : SEQUENTIAL, position };
}

function at(order: PlayOrder, position: number) {
  return { index: order.order[position] as number, position };
}

test('队列中间：除单曲循环自然播完外，一律按方向移动一位', () => {
  for (const mode of MODES) {
    for (const reason of REASONS) {
      const order = orderAt(mode, 1);
      const label = `${mode} / ${reason}`;

      if (mode === 'loopOne' && reason === 'finished') {
        assert.deepEqual(step(order, 1, mode, reason), at(order, 1), `${label} / +1`);
        assert.deepEqual(step(order, -1, mode, reason), at(order, 1), `${label} / -1`);
        continue;
      }

      assert.deepEqual(step(order, 1, mode, reason), at(order, 2), `${label} / +1`);
      assert.deepEqual(step(order, -1, mode, reason), at(order, 0), `${label} / -1`);
    }
  }
});

test('队列末尾向后：顺序模式停止，其余模式绕回首位（单曲循环自然播完除外）', () => {
  for (const mode of MODES) {
    for (const reason of REASONS) {
      const order = orderAt(mode, 3);
      const label = `${mode} / ${reason}`;
      const result = step(order, 1, mode, reason);

      if (mode === 'loopOne' && reason === 'finished') {
        assert.deepEqual(result, at(order, 3), label);
      } else if (mode === 'sequential') {
        assert.equal(result, null, label);
      } else {
        assert.deepEqual(result, at(order, 0), label);
      }
    }
  }
});

test('队列首位向前：顺序模式停止，其余模式绕到末尾（单曲循环自然播完除外）', () => {
  for (const mode of MODES) {
    for (const reason of REASONS) {
      const order = orderAt(mode, 0);
      const label = `${mode} / ${reason}`;
      const result = step(order, -1, mode, reason);

      if (mode === 'loopOne' && reason === 'finished') {
        assert.deepEqual(result, at(order, 0), label);
      } else if (mode === 'sequential') {
        assert.equal(result, null, label);
      } else {
        assert.deepEqual(result, at(order, 3), label);
      }
    }
  }
});

test('单曲循环下失败跳过不停留在失败曲目上', () => {
  const order = orderAt('loopOne', 2);
  assert.deepEqual(step(order, 1, 'loopOne', 'skipped'), { index: 3, position: 3 });
  assert.deepEqual(step(order, -1, 'loopOne', 'skipped'), { index: 1, position: 1 });
});

test('随机模式按顺序表移动，返回的是顺序表里的队列下标', () => {
  const order = orderAt('shuffle', 1);
  assert.deepEqual(step(order, 1, 'shuffle', 'user'), { index: 3, position: 2 });
  assert.deepEqual(step(order, -1, 'shuffle', 'skipped'), { index: 2, position: 0 });
});

test('空队列一律停止', () => {
  const empty: PlayOrder = { order: [], position: -1 };
  for (const mode of MODES) {
    for (const reason of REASONS) {
      assert.equal(step(empty, 1, mode, reason), null, `${mode} / ${reason} / +1`);
      assert.equal(step(empty, -1, mode, reason), null, `${mode} / ${reason} / -1`);
    }
  }
});

/**
 * 移除后的断言按「曲目」而不是按下标写：移除会让后面的下标整体前移一位，
 * 直接比下标看不出切到的是不是原来的那首。
 */
function removing(mode: PlayMode, position: number, removedPosition: number) {
  const before = orderAt(mode, position);
  const removedIndex = before.order[removedPosition] as number;
  const result = withRemoved(before, removedIndex, mode);
  const current = result.order.order[result.order.position];
  return {
    result,
    /** 移除后顺序表当前位置上的曲目，换算回移除前的下标 */
    currentBefore:
      current === undefined ? undefined : current >= removedIndex ? current + 1 : current,
    before,
  };
}

test('移除排在中间的当前曲目：各模式都切到原来的下一首（单曲循环也往下走）', () => {
  for (const mode of MODES) {
    const { result, currentBefore, before } = removing(mode, 1, 1);
    assert.equal(result.hasNext, true, mode);
    assert.equal(currentBefore, before.order[2], mode);
    assert.equal(result.order.order.length, 3, mode);
  }
});

test('移除排在最后的当前曲目：顺序模式停在新的末尾一首，其余模式回到首位', () => {
  for (const mode of MODES) {
    const { result, currentBefore, before } = removing(mode, 3, 3);
    if (mode === 'sequential') {
      assert.equal(result.hasNext, false, mode);
      assert.equal(result.order.position, 2, mode);
      assert.equal(currentBefore, before.order[2], mode);
    } else {
      assert.equal(result.hasNext, true, mode);
      assert.equal(result.order.position, 0, mode);
      assert.equal(currentBefore, before.order[0], mode);
    }
  }
});

test('移除非当前曲目：当前曲目不变，排在它之前时位置前移一位', () => {
  for (const mode of MODES) {
    const earlier = removing(mode, 2, 0);
    assert.equal(earlier.result.order.position, 1, `${mode} / 之前`);
    assert.equal(earlier.currentBefore, earlier.before.order[2], `${mode} / 之前`);

    const later = removing(mode, 1, 3);
    assert.equal(later.result.order.position, 1, `${mode} / 之后`);
    assert.equal(later.currentBefore, later.before.order[1], `${mode} / 之后`);
  }
});

test('移除唯一的曲目：顺序表清空', () => {
  for (const mode of MODES) {
    const result = withRemoved({ order: [0], position: 0 }, 0, mode);
    assert.deepEqual(result, { order: { order: [], position: -1 }, hasNext: false }, mode);
  }
});

test('洗牌得到的顺序表是队列下标的排列，且当前曲目钉在首位', () => {
  const { order, position } = buildOrder(6, 'shuffle', 4);
  assert.equal(position, 0);
  assert.equal(order[0], 4);
  assert.deepEqual(
    [...order].sort((a, b) => a - b),
    [0, 1, 2, 3, 4, 5],
  );
});
