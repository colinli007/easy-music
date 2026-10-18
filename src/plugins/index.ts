// SPDX-License-Identifier: GPL-3.0-or-later
// Copyright (C) 2026 colinli007 and contributors · 轻松音乐 EasyMusic

import type { PluginsFacade } from '@/plugins/api';
import { INJECTED_MODULE_NAMES } from '@/plugins/host/deps';
import {
  getUserVariables,
  initPlugins,
  installFromFile,
  installFromUrl,
  listPlugins,
  lyricPlugins,
  saveUserVariables,
  searchablePlugins,
  uninstallPlugin,
  updatePlugin,
} from '@/plugins/manager';
import { lyricForTrack, searchLyric } from '@/plugins/lyrics';
import { searchMusic } from '@/plugins/search';

/**
 * 插件门面。
 *
 * 这是**整个插件模块唯一的对外出口**：插件宿主、协议适配与依赖白名单只被本文件
 * （及其下游）引用，核心代码只经由这里调用插件，插件内部可以自由重构而不波及核心。
 */
export const Plugins: PluginsFacade = {
  injectedModules: INJECTED_MODULE_NAMES,

  init: initPlugins,
  list: listPlugins,
  hasSearchable: () => searchablePlugins('music').length > 0,
  hasLyricPlugins: () => lyricPlugins().length > 0,

  installFromFile,
  installFromUrl,
  update: updatePlugin,
  uninstall: uninstallPlugin,

  getUserVariables,
  saveUserVariables,

  search: searchMusic,

  lyricForTrack,
  searchLyric,
};
