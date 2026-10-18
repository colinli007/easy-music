// SPDX-License-Identifier: GPL-3.0-or-later
// Copyright (C) 2026 li1164267803 · 轻松音乐 EasyMusic

import type { PlayMode } from '@/domain/model/playback';

/**
 * 播放顺序与播放模式的纯逻辑，与播放引擎完全解耦，便于单独推理与验证。
 *
 * 「队列」是曲目的存放顺序（用户在队列页看到的顺序，切换播放模式不改变它）；
 * 「顺序表」是实际的播放次序，随机模式下是队列下标的一个排列。两者分开，
 * 才能做到随机播放时队列页显示的仍是原始顺序——用户对队列的心智模型不该被打乱。
 */
export type PlayOrder = {
  /** 队列下标的播放次序 */
  order: number[];
  /** 当前处在 order 中的第几位 */
  position: number;
};

function shuffled(size: number, pinFirst: number): number[] {
  const indices = Array.from({ length: size }, (_, index) => index).filter(
    (index) => index !== pinFirst,
  );
  // Fisher–Yates
  for (let i = indices.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    const a = indices[i] as number;
    const b = indices[j] as number;
    indices[i] = b;
    indices[j] = a;
  }
  // 当前曲目固定排在首位，避免切到随机模式的瞬间跳走
  return pinFirst >= 0 && pinFirst < size ? [pinFirst, ...indices] : indices;
}

export function buildOrder(size: number, mode: PlayMode, currentIndex: number): PlayOrder {
  if (size === 0) return { order: [], position: -1 };

  if (mode === 'shuffle') {
    const order = shuffled(size, currentIndex);
    return { order, position: currentIndex >= 0 ? 0 : -1 };
  }

  const order = Array.from({ length: size }, (_, index) => index);
  return { order, position: currentIndex };
}

/**
 * 为什么要推进（fix-playback-failure-handling/design.md 决策 1）。
 *
 * - `finished`：曲目自然播完
 * - `skipped`：装载失败或播放出错后跳过
 * - `user`：用户点击上/下一曲
 */
export type AdvanceReason = 'finished' | 'skipped' | 'user';

/**
 * 计算下一个要播放的队列下标。返回 null 表示应当停止播放。
 *
 * 单曲循环只在**自然播完**时重复当前曲目。用户主动点下一曲仍然切歌——否则「下一曲」
 * 这个按钮在该模式下就失去了意义；失败后的跳过也照常移动——单曲循环的语义是
 * 「播完再来一遍」，不是把用户锁死在一首播不了的歌上。
 */
export function step(
  { order, position }: PlayOrder,
  direction: 1 | -1,
  mode: PlayMode,
  reason: AdvanceReason,
): { index: number; position: number } | null {
  if (order.length === 0) return null;

  if (mode === 'loopOne' && reason === 'finished') {
    const index = order[position];
    return index === undefined ? null : { index, position };
  }

  const next = position + direction;

  if (next >= order.length) {
    // 顺序播放到末尾即停止；列表循环与随机回到第一首
    if (mode === 'sequential') return null;
    const index = order[0];
    return index === undefined ? null : { index, position: 0 };
  }

  if (next < 0) {
    // 在第一首上点上一曲：顺序模式停在原地，循环模式绕到末尾
    if (mode === 'sequential') return null;
    const last = order.length - 1;
    const index = order[last];
    return index === undefined ? null : { index, position: last };
  }

  const index = order[next];
  return index === undefined ? null : { index, position: next };
}

/**
 * 队列中移除一项后修正顺序表，并给出移除当前项时应切到的曲目。
 *
 * media-playback spec：移除当前正在播放的曲目时切到「下一首」，而「下一首」只有 `step`
 * 一个定义——列表循环与随机在末尾绕回首位，顺序播放在末尾没有下一首
 * （polish-playback-and-library-details/design.md 决策 2）。所以先在移除前的顺序表上
 * 求出下一首，再把它映射到移除后的下标。按用户切歌（`user`）求：移除当前项就是「不要
 * 这首了，往下走」，单曲循环下也照常往下走。
 *
 * 移除当前项后，返回的顺序表位置就指向接下来的当前曲目；`hasNext` 说明它是不是真正的
 * 「下一首」。没有下一首（顺序播放下移除了末尾的当前项）时停在新的末尾一首，与队列
 * 自然播到头停下的语义一致（决策 1），由控制器决定不自动播放。
 */
export function withRemoved(
  { order, position }: PlayOrder,
  removedIndex: number,
  mode: PlayMode,
): { order: PlayOrder; hasNext: boolean } {
  const remap = (index: number) => (index > removedIndex ? index - 1 : index);
  const remapped = order.filter((index) => index !== removedIndex).map(remap);

  if (remapped.length === 0) return { order: { order: [], position: -1 }, hasNext: false };

  const removedPosition = order.indexOf(removedIndex);
  const removedCurrent = removedPosition !== -1 && removedPosition === position;

  if (!removedCurrent) {
    // 移除的是当前项之前的曲目，当前项在顺序表中前移一位
    const removedBeforeCurrent = removedPosition !== -1 && removedPosition < position;
    return {
      order: { order: remapped, position: removedBeforeCurrent ? position - 1 : position },
      hasNext: false,
    };
  }

  const target = step({ order, position }, 1, mode, 'user');
  if (!target) return { order: { order: remapped, position: remapped.length - 1 }, hasNext: false };

  return {
    order: { order: remapped, position: remapped.indexOf(remap(target.index)) },
    hasNext: true,
  };
}
