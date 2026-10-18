// SPDX-License-Identifier: GPL-3.0-or-later
// Copyright (C) 2026 colinli007 and contributors · 轻松音乐 EasyMusic

import { Pressable } from 'react-native';

import { AppText } from '@/ui/text';
import { Colors } from '@/ui/theme';

type ChipProps = {
  label: string;
  active: boolean;
  onPress: () => void;
  /** 发现页的胶囊比音乐库大一号：圆角 16 / 左右 15，音乐库为 15 / 14 */
  radius?: number;
  paddingHorizontal?: number;
};

/** 设计稿的筛选胶囊：选中为青柠底 + 深色字，未选中为 surface 底 + 灰字。 */
export function Chip({ label, active, onPress, radius = 15, paddingHorizontal = 14 }: ChipProps) {
  return (
    <Pressable
      onPress={onPress}
      style={{
        borderRadius: radius,
        paddingVertical: 8,
        paddingHorizontal,
        backgroundColor: active ? Colors.accent : Colors.surface,
      }}
    >
      <AppText
        size={12}
        weight={active ? 'semibold' : 'medium'}
        color={active ? Colors.bg : Colors.textMuted}
      >
        {label}
      </AppText>
    </Pressable>
  );
}
