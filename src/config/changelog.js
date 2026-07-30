/**
 * 版本更新日志数据
 * type: 'added' (新增) | 'fixed' (修复) | 'improved' (优化)
 */
export const changelog = [
  {
    version: '1.1.0',
    date: '2026-07-30',
    isLatest: true,
    changes: [
      { type: 'added', text: '"加入队列"和"下一首播放"功能' },
      { type: 'added', text: '电脑端空格键播放/暂停快捷键' },
      { type: 'added', text: '版本更新日志功能' },
      { type: 'improved', text: '队列管理界面，插队队列置顶显示' },
      { type: 'improved', text: '添加歌曲加入队列飞入动画效果' },
      { type: 'improved', text: '分享链接支持携带歌曲信息' },
      { type: 'fixed', text: '歌单列表页只显示6个歌单的问题' },
      { type: 'fixed', text: '歌单7和8点进去空白页面的问题' },
      { type: 'fixed', text: '首页推荐歌单"全部"跳转重复导航栏' },
      { type: 'fixed', text: '全屏播放器移动端进度条闪烁问题' },
      { type: 'fixed', text: '歌曲分享链接无法打开具体页面的问题' },
    ]
  },
  {
    version: '1.0.0',
    date: '2026-07-20',
    changes: [
      { type: 'added', text: '初始版本发布' },
      { type: 'added', text: '基本播放功能与全屏播放器' },
      { type: 'added', text: '歌单管理与搜索功能' },
      { type: 'added', text: '播放队列与播放模式切换' },
      { type: 'added', text: '桌面歌词与音乐可视化' },
      { type: 'added', text: '国风沉浸式歌单页面' },
      { type: 'added', text: '季节主题页面' },
    ]
  }
]

// 当前版本号
export const currentVersion = changelog[0].version
