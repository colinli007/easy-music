# 轻松音乐推广素材

更新日期：2026 年 10 月 18 日。依据本地 `e7b2d24` 对应代码、当前项目说明，以及当日公开仓库和 Releases 页面重新整理。目标沿用原套件：向小红书、掘金与 CSDN 介绍轻松音乐，引导了解项目并自愿 Star。三平台均已提交，提交后核查时均为审核中，记录见下方。

## 直接使用

| 平台 | 完整文案 | 角度 |
| --- | --- | --- |
| 小红书 | [xiaohongshu.md](xiaohongshu.md) | 你的歌，你说了算：整理自己的音乐 |
| CSDN | [csdn.md](csdn.md) | 导入、管理与播放个人曲库 |
| 掘金 | [juejin.md](juejin.md) | 来源解析、缓存优先与播放队列边界 |

| 图片 | 建议位置 | 性质 |
| --- | --- | --- |
| [cover.png](assets/cover.png) | 小红书第 1 张、长文头图 | 品牌宣传插画 |
| [features.png](assets/features.png) | 小红书第 2 张、长文功能说明处 | 功能示意图 |

两张图片均为 1024 × 1536 PNG，由内置 imagegen 重新生成。已查看最终成图，核对主要中文、项目名及仓库地址。深色与荧光绿取自 `src/ui/theme.ts`，两图均标注“非应用截图”。没有生成模拟 App 界面、试听结果、用户评价或统计数据。

[封面提示词](assets/cover-prompt.txt)与[功能图提示词](assets/features-prompt.txt)随素材交付。旧封面已被新版替换，图中文字统一使用 `colinli007/easy-music`。

小红书顺序：品牌封面 → 功能图。正文见独立稿件；图片上的逐页文案以实际 PNG 为准。长文已插入图片及图注，相对路径基于当前目录。

## 核心表达

**你的歌，你说了算。音乐由你准备，播放交给轻松音乐。**

“免费、开源、无广告”描述播放器本身，不承诺附带曲库、第三方插件无广告或任意歌曲可下载。无广告的核查范围是当前应用源码及依赖，没有扩展成对外部插件的审计结论。

重点展示已实现的个人曲库、歌单拖动排序、歌词高亮、手动离线缓存和 M3U 导入。插件作为可选扩展，说明功能依赖具体插件，且不存在隔离沙箱。

## 当前入口与边界

- 已核对公开仓库：[colinli007/easy-music](https://github.com/colinli007/easy-music)。
- 当日 [Releases](https://github.com/colinli007/easy-music/releases) 显示尚无发布版本。正文引导查看源码和自行编译，没有声称已有 APK。未来发布版本后应核对真实资产再更新获取段。
- 项目说明不走应用商店分发；iOS 自行编译需要 Mac 与 Xcode。
- 项目仍列明锁屏没有上一首／下一首按钮，以及 iOS 音频被抢占后状态可能显示不准确。三篇正文均保留了此信息，没有使用“完整锁屏控制”或“完美双端体验”。
- 不宣传全网曲库、投屏、算法推荐、多设备同步、均衡器、倍速或全格式兼容。
- 普通 M3U / M3U8 导入是快照；HLS 分片清单不支持。歌词依赖实际来源，下载内容及长度依赖音源。

## 事实依据

| 文案主张 | 本地核查位置 |
| --- | --- |
| 文件、URL、M3U 导入及限制 | `src/library/import.ts`、`src/library/m3u.ts`、`src/ui/import-sheet.tsx` |
| 曲库分类、搜索排序 | `src/app/(tabs)/library.tsx`、`src/app/(tabs)/search.tsx`、`src/domain/repository/track-repository.ts` |
| 歌单拖动排序与批量下载 | `src/app/playlist/[id].tsx` |
| 模式与队列移除逻辑 | `src/playback/queue.ts`、`src/playback/player.ts` |
| 结束后回到开头、后台与锁屏边界 | `src/playback/player.ts`、`app.json`、`README.md` |
| 缓存有效性与优先解析 | `src/sources/resolve.ts`、`src/cache/store.ts`、`src/cache/files.ts` |
| 歌词来源与高亮 | `src/lyrics/sources.ts`、`src/lyrics/ui/lyrics-card.tsx` |
| 最近播放 | `src/history/repository.ts`、`src/playback/player.ts`、`src/app/(tabs)/index.tsx` |
| 插件门面、能力与风险 | `src/plugins/index.ts`、`src/plugins/screens/discovery.tsx`、`src/plugins/ui/risk-notice.tsx`、`eslint.config.js` |
| 许可、依赖与平台 | `package.json`、`LICENSE`、`app.json` |

本轮完成源码静态核对、公开入口核对与配图视觉检查；未重新做双端真机验收。检查时没有 ADB 已连接设备，也没有已启动的 iOS 模拟器，因此未新增真实 App 截图。README 的既有验收声明没有当成本轮实测结果使用。

本次仅修改推广目录，没有改业务代码，不为文案变更重复执行应用测试。发布前若代码、安装包或已知问题发生变化，应更新对应段落。

## 本次发布记录

2026 年 10 月 18 日已获明确发布授权，三平台均提交成功。以下为提交后当次核对状态，不代表审核已经通过。

| 平台 | 状态 | 入口 |
| --- | --- | --- |
| 小红书 | 审核中；管理页显示“你的歌，你说了算｜轻松音乐” | [笔记管理](https://creator.xiaohongshu.com/new/note-manager) |
| 掘金 | 审核中；已打开成文核对标题、正文与图片 | [查看文章](https://juejin.cn/spost/7697446131198951467) |
| CSDN | 发布成功页面显示“正在审核中” | [查看文章](https://blog.csdn.net/weixin_44309374/article/details/168343451) |

发布清单：[publish.json](publish.json)。已核验回执：[publish-results.json](publish-results.json)。运行状态保存在已忽略的 `.publish/state.json`，后续上传会读取去重记录；不要删除状态后重发。小红书尚未取得可验证的公开分享链接，保留管理页入口。

本次使用 article-promotion 上传器与原生 Chrome 界面补充完成：小红书在管理页核对未提交后，于原编辑页面点击发布；掘金等待配图上传完成后恢复同一草稿，并补充上传封面。没有新建重复文章。三平台均带 AI 内容说明或平台声明，小红书已取消无关的默认活动关联。
