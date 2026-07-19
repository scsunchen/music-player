/**
 * 季节/节日主题配置引擎
 *
 * 每个主题配置驱动一个动态的 SeasonalPage.vue 组件。
 * getActiveTheme() 根据当前日期自动匹配最合适的主题，
 * 优先级：精确日期（节日） > 月份范围（季节），首个匹配即返回。
 * 若无匹配则返回当前季节作为兜底。
 */

// ============================================================
// 工具函数
// ============================================================

/**
 * 判断当前日期是否落在给定的日期范围内
 * @param {'monthRange'|'exact'} type - 范围类型
 * @param {{ month: number, day: number }} start - 起始月日
 * @param {{ month: number, day: number }} end - 结束月日
 * @param {Date} [date] - 要检测的日期，默认今天
 * @returns {boolean}
 */
function isInRange(type, start, end, date = new Date()) {
  const m = date.getMonth() + 1
  const d = date.getDate()

  if (type === 'exact') {
    return m === start.month && d === start.day
  }

  // monthRange: 支持跨年（如 winter: 12月 - 2月）
  const startVal = start.month * 100 + start.day
  const endVal = end.month * 100 + end.day
  const currentVal = m * 100 + d

  if (startVal <= endVal) {
    // 不跨年：如 6/1 - 8/31
    return currentVal >= startVal && currentVal <= endVal
  }
  // 跨年：如 12/1 - 2/28
  return currentVal >= startVal || currentVal <= endVal
}

/**
 * 根据月份获取当前季节的兜底主题 ID
 * @param {number} month - 月份 (1-12)
 * @returns {string}
 */
function getSeasonFallback(month) {
  if (month >= 3 && month <= 5) return 'spring'
  if (month >= 6 && month <= 8) return 'summer'
  if (month >= 9 && month <= 11) return 'autumn'
  return 'winter'
}

// ============================================================
// 主题配置数组
// ============================================================

export const themeConfigs = [
  // --------------------------------------------------------
  // 1. 夏天 —— 橘子味的夏天 (6月1日 - 8月31日)
  // --------------------------------------------------------
  {
    id: 'summer',
    name: '橘子味的夏天',
    badge: '夏日限定',
    dateRange: {
      type: 'monthRange',
      start: { month: 6, day: 1 },
      end: { month: 8, day: 31 },
    },
    heroEmoji: '🍊',
    subtitle: '清甜 · 温柔 · 日落氛围感',
    stats: [
      { icon: '🎵', text: '15 首' },
      { icon: '⏱️', text: '约 60 分钟' },
      { icon: '🌅', text: '傍晚最佳' },
    ],
    quotes: [
      '夏天是橘子汽水冒起的气泡，是黄昏染遍天空的橘粉，是晚风里轻轻晃动的旋律。',
      '这张歌单装满了暖橙色调的温柔与甜，适合傍晚散步、窗边发呆、和喜欢的人共享耳机。',
    ],
    highlight: '愿每一段旋律，都能陪你度过一整个温柔又明亮的夏天。',
    footerEmoji: '🌅',
    footerText: '橘子味的夏天歌单已就位',
    footerSubs: ['橘粉晚霞 + 暖橙旋律', '耳机分你一半，一起过夏天'],
    songIds: [],
    songs: [
      { id: 200, title: '橘子味的夏天', artist: '新地' },
      { id: 201, title: '橘子汽水', artist: '南拳妈妈' },
      { id: 202, title: '橙', artist: '筠野' },
      { id: 203, title: '波子汽水', artist: 'Bomb 比尔 / LBI 利比' },
      { id: 204, title: '青柠', artist: '徐秉龙 / 桃十五' },
      { id: 205, title: '夏日漱石', artist: '橘子海' },
      { id: 206, title: '落日橘子糖', artist: '达布希勒图' },
      { id: 207, title: '贩卖日落', artist: '蓝心羽' },
      { id: 208, title: '橘海', artist: '巴邓顿珠 / 你的大表哥曲甲' },
      { id: 209, title: '夏天的风', artist: '温岚' },
      { id: 210, title: '园游会', artist: '周杰伦' },
      { id: 211, title: '他夏了夏天', artist: '苏打绿' },
      { id: 212, title: '日落大道', artist: '梁博' },
      { id: 213, title: '夏日的颜色', artist: 'Fine 乐团' },
      { id: 214, title: '星空剪影', artist: '蓝心羽' },
    ],
    colors: {
      primary: '#ff6b6b',
      secondary: '#feca57',
      accent: '#ff9ff3',
      gradientStops: [
        '#2d1b4e 0%',
        '#5d2e5e 15%',
        '#b33939 30%',
        '#e17055 45%',
        '#fdcb6e 60%',
        '#e17055 75%',
        '#b33939 85%',
        '#2d1b4e 100%',
      ],
      textGradient: 'linear-gradient(135deg, #fff, #ffeaa7)',
      btnGradient: 'linear-gradient(135deg, #ff8a65 0%, #ff6b6b 100%)',
      songActiveBg: 'linear-gradient(135deg, rgba(255,138,101,0.2), rgba(255,107,107,0.15))',
    },
    particles: {
      type: 'float',
      emoji: '🍊',
      count: 5,
    },
    vinylLabelGradient: 'linear-gradient(135deg, #ff8a65, #ff6b6b)',
    headerBg: 'linear-gradient(180deg, rgba(26,26,46,0.9) 0%, transparent 100%)',
  },

  // --------------------------------------------------------
  // 2. 秋天 —— 枫叶信笺 (9月1日 - 11月30日)
  // --------------------------------------------------------
  {
    id: 'autumn',
    name: '枫叶信笺',
    badge: '秋日私语',
    dateRange: {
      type: 'monthRange',
      start: { month: 9, day: 1 },
      end: { month: 11, day: 30 },
    },
    heroEmoji: '🍂',
    subtitle: '温醇 · 怀旧 · 落叶与思念',
    stats: [
      { icon: '🎵', text: '10 首' },
      { icon: '⏱️', text: '约 45 分钟' },
      { icon: '🍁', text: '黄昏漫步' },
    ],
    quotes: [
      '秋天是踩着落叶走路的季节，空气里弥漫着焦糖和桂花的甜，耳机里循环着让人想家的旋律。',
      '把思念写进枫叶里，风一吹就变成了歌。每一首都是写给远方的明信片。',
    ],
    highlight: '秋天适合想念，也适合把想念唱成歌。',
    footerEmoji: '🍁',
    footerText: '枫叶信笺已为你折好',
    footerSubs: ['焦糖色夕阳 + 金色旋律', '落叶知秋，旋律知心'],
    songIds: [2, 5, 6, 13],
    songs: [
      { id: 2, title: '晴天', artist: '周杰伦' },
      { id: 5, title: '告白气球', artist: '周杰伦' },
      { id: 6, title: '光年之外', artist: '邓紫棋' },
      { id: 13, title: '你像风来了又走', artist: '刘大壮' },
      { id: 300, title: '秋天的第一杯奶茶', artist: '陈奕迅' },
      { id: 301, title: '枫', artist: '周杰伦' },
      { id: 302, title: '银杏路上的秋天', artist: '房东的猫' },
      { id: 303, title: '晚风', artist: '陈婧霏' },
      { id: 304, title: '桂花香', artist: '许嵩' },
      { id: 305, title: '那年秋天', artist: '徐佳莹' },
    ],
    colors: {
      primary: '#d35400',
      secondary: '#f39c12',
      accent: '#e74c3c',
      gradientStops: [
        '#1a120b 0%',
        '#3e2723 15%',
        '#5d4037 30%',
        '#8d6e63 45%',
        '#d4a574 60%',
        '#bf360c 75%',
        '#4e342e 90%',
        '#1a120b 100%',
      ],
      textGradient: 'linear-gradient(135deg, #ffe0b2, #ffab91)',
      btnGradient: 'linear-gradient(135deg, #e65100 0%, #f57c00 100%)',
      songActiveBg: 'linear-gradient(135deg, rgba(211,84,0,0.2), rgba(243,156,18,0.15))',
    },
    particles: {
      type: 'sakura',
      emoji: '🍂',
      count: 8,
    },
    vinylLabelGradient: 'linear-gradient(135deg, #d4a574, #bf360c)',
    headerBg: 'linear-gradient(180deg, rgba(26,18,11,0.92) 0%, transparent 100%)',
  },

  // --------------------------------------------------------
  // 3. 冬天 —— 雪落星光 (12月1日 - 2月28/29日, 跨年)
  // --------------------------------------------------------
  {
    id: 'winter',
    name: '雪落星光',
    badge: '冬日暖音',
    dateRange: {
      type: 'monthRange',
      start: { month: 12, day: 1 },
      end: { month: 2, day: 29 },
    },
    heroEmoji: '❄️',
    subtitle: '纯净 · 温暖 · 窗边的雪夜',
    stats: [
      { icon: '🎵', text: '12 首' },
      { icon: '⏱️', text: '约 50 分钟' },
      { icon: '🕯️', text: '雪夜最佳' },
    ],
    quotes: [
      '冬天的夜晚最温暖的事，是窗外飘着雪，屋内亮着灯，耳机里有人在轻声唱歌。',
      '把这首歌的温度，藏在围巾和手套之间，陪你走过每一个寒冷但明亮的日子。',
    ],
    highlight: '雪花落下的声音，就是冬天写给世界的歌。',
    footerEmoji: '🕯️',
    footerText: '雪落星光，温暖守候',
    footerSubs: ['冰蓝夜空 + 暖黄灯光', '戴上耳机，世界就安静了'],
    songIds: [],
    songs: [
      { id: 400, title: '冬眠', artist: '薛之谦' },
      { id: 401, title: '认真的雪', artist: '薛之谦' },
      { id: 402, title: '雪落下的声音', artist: '陆虎' },
      { id: 403, title: '白色风车', artist: '周杰伦' },
      { id: 404, title: '发如雪', artist: '周杰伦' },
      { id: 405, title: '蓝色星空', artist: '陈奕迅' },
      { id: 406, title: '暖暖', artist: '梁静茹' },
      { id: 407, title: '冬天快乐', artist: '李宇春' },
      { id: 408, title: '大约在冬季', artist: '齐秦' },
      { id: 409, title: '雪人', artist: '范晓萱' },
      { id: 410, title: '圣诞结', artist: '陈奕迅' },
      { id: 411, title: '月半小夜曲', artist: '李克勤' },
    ],
    colors: {
      primary: '#74b9ff',
      secondary: '#dfe6e9',
      accent: '#a29bfe',
      gradientStops: [
        '#0c1445 0%',
        '#1e3a5f 15%',
        '#2e5984 30%',
        '#5b8fb9 45%',
        '#b8d4e3 55%',
        '#a0c4ff 65%',
        '#4a7c9b 80%',
        '#0c1445 100%',
      ],
      textGradient: 'linear-gradient(135deg, #e0f0ff, #a0c4ff)',
      btnGradient: 'linear-gradient(135deg, #74b9ff 0%, #a29bfe 100%)',
      songActiveBg: 'linear-gradient(135deg, rgba(116,185,255,0.2), rgba(162,155,254,0.15))',
    },
    particles: {
      type: 'snowflakes',
      emoji: '❄️',
      count: 20,
    },
    vinylLabelGradient: 'linear-gradient(135deg, #74b9ff, #a29bfe)',
    headerBg: 'linear-gradient(180deg, rgba(12,20,69,0.92) 0%, transparent 100%)',
  },

  // --------------------------------------------------------
  // 4. 春天 —— 樱花物语 (3月1日 - 5月31日)
  // --------------------------------------------------------
  {
    id: 'spring',
    name: '樱花物语',
    badge: '春日复苏',
    dateRange: {
      type: 'monthRange',
      start: { month: 3, day: 1 },
      end: { month: 5, day: 31 },
    },
    heroEmoji: '🌸',
    subtitle: '清新 · 绽放 · 微风里的花语',
    stats: [
      { icon: '🎵', text: '12 首' },
      { icon: '⏱️', text: '约 48 分钟' },
      { icon: '🌱', text: '春日漫步' },
    ],
    quotes: [
      '春天是所有美好重新开始的季节，花开的声音藏在风里，也藏在歌里。',
      '这首歌像三月的风一样轻柔，像四月的雨一样温柔，适合送给每一个正在绽放的你。',
    ],
    highlight: '花开的时候，全世界都在替你高兴。',
    footerEmoji: '🌷',
    footerText: '樱花物语已为你翻到第一页',
    footerSubs: ['粉色花瓣 + 青草旋律', '春风十里，不如耳机里有你'],
    songIds: [],
    songs: [
      { id: 500, title: '春风十里', artist: '鹿先森乐队' },
      { id: 501, title: '樱花草', artist: 'Sweety' },
      { id: 502, title: '春天花会开', artist: '任贤齐' },
      { id: 503, title: '宁夏', artist: '梁静茹' },
      { id: 504, title: '小幸运', artist: '田馥甄' },
      { id: 505, title: '花海', artist: '周杰伦' },
      { id: 506, title: '晴天', artist: '周杰伦' },
      { id: 507, title: '遇见', artist: '孙燕姿' },
      { id: 508, title: '绿光', artist: '孙燕姿' },
      { id: 509, title: '七里香', artist: '周杰伦' },
      { id: 510, title: '微光', artist: '华晨宇' },
      { id: 511, title: '春风', artist: '方大同' },
    ],
    colors: {
      primary: '#fd79a8',
      secondary: '#55efc4',
      accent: '#ffeaa7',
      gradientStops: [
        '#1a1a2e 0%',
        '#3d2c5e 15%',
        '#6b3fa0 30%',
        '#d68fd6 45%',
        '#ffc0cb 55%',
        '#a8e6cf 70%',
        '#6b3fa0 85%',
        '#1a1a2e 100%',
      ],
      textGradient: 'linear-gradient(135deg, #fff, #ffc0cb)',
      btnGradient: 'linear-gradient(135deg, #fd79a8 0%, #e84393 100%)',
      songActiveBg: 'linear-gradient(135deg, rgba(253,121,168,0.2), rgba(85,239,196,0.15))',
    },
    particles: {
      type: 'sakura',
      emoji: '🌸',
      count: 12,
    },
    vinylLabelGradient: 'linear-gradient(135deg, #fd79a8, #e84393)',
    headerBg: 'linear-gradient(180deg, rgba(26,26,46,0.9) 0%, transparent 100%)',
  },

  // --------------------------------------------------------
  // 5. 情人节 —— 爱你 (2月14日 精确匹配)
  // --------------------------------------------------------
  {
    id: 'valentines',
    name: '爱你',
    badge: '情人节限定',
    dateRange: {
      type: 'exact',
      start: { month: 2, day: 14 },
      end: { month: 2, day: 14 },
    },
    heroEmoji: '💕',
    subtitle: '浪漫 · 甜蜜 · 心动的频率',
    stats: [
      { icon: '🎵', text: '6 首' },
      { icon: '💕', text: '甜蜜歌单' },
      { icon: '🌹', text: '约会必听' },
    ],
    quotes: [
      '爱是两个人一起听同一首歌时，不约而同看向对方的眼神。',
      '有些话说不出口，就放进歌里吧。当旋律响起的时候，ta 会听懂的。',
    ],
    highlight: '愿所有美好如期而至。',
    footerEmoji: '💝',
    footerText: '情人节快乐，把这首歌送给那个ta',
    footerSubs: ['玫瑰红 + 甜蜜旋律', '耳机分你一半，心跳同步'],
    songIds: [2, 3, 5, 6, 13, 14],
    songs: [
      { id: 2, title: '晴天', artist: '周杰伦' },
      { id: 3, title: '七里香', artist: '周杰伦' },
      { id: 5, title: '告白气球', artist: '周杰伦' },
      { id: 6, title: '光年之外', artist: '邓紫棋' },
      { id: 13, title: '你像风来了又走', artist: '刘大壮' },
      { id: 14, title: '梦底', artist: '刘大壮' },
    ],
    colors: {
      primary: '#e74c3c',
      secondary: '#ffeaa7',
      accent: '#fd79a8',
      gradientStops: [
        '#ffeaa7 0%',
        '#fab1a0 30%',
        '#fd79a8 70%',
        '#e17055 100%',
      ],
      textGradient: 'linear-gradient(135deg, #fff, #ffeaa7)',
      btnGradient: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)',
      songActiveBg: 'linear-gradient(135deg, rgba(255,107,107,0.2), rgba(238,90,36,0.15))',
    },
    particles: {
      type: 'hearts',
      emoji: '❤️',
      count: 20,
    },
    vinylLabelGradient: 'linear-gradient(135deg, #e74c3c, #c0392b)',
    headerBg: 'linear-gradient(180deg, rgba(231,76,60,0.7) 0%, transparent 100%)',
  },

  // --------------------------------------------------------
  // 6. 中秋节 —— 月满长安 (9月15日 - 9月17日 精确范围)
  // --------------------------------------------------------
  {
    id: 'mid-autumn',
    name: '月满长安',
    badge: '中秋限定',
    dateRange: {
      type: 'exact',
      start: { month: 9, day: 15 },
      end: { month: 9, day: 17 },
    },
    heroEmoji: '🥮',
    subtitle: '团圆 · 思念 · 月光下的歌',
    stats: [
      { icon: '🎵', text: '10 首' },
      { icon: '🌕', text: '赏月必听' },
      { icon: '🏮', text: '古风意境' },
    ],
    quotes: [
      '但愿人长久，千里共婵娟。月光是最好的邮差，把思念送到每个抬头看天的人心里。',
      '中秋的夜，月圆如镜，歌声是最好的月饼馅——甜而不腻，回味悠长。',
    ],
    highlight: '今夜月明人尽望，不知秋思落谁家。',
    footerEmoji: '🏮',
    footerText: '月满长安，阖家团圆',
    footerSubs: ['金色月光 + 悠扬旋律', '吃月饼，听好歌，想家的人都在歌里'],
    songIds: [],
    songs: [
      { id: 600, title: '但愿人长久', artist: '王菲' },
      { id: 601, title: '月亮之上', artist: '凤凰传奇' },
      { id: 602, title: '荷塘月色', artist: '凤凰传奇' },
      { id: 603, title: '城里的月光', artist: '许美静' },
      { id: 604, title: '看月亮爬上来', artist: '张杰' },
      { id: 605, title: '月光', artist: '黄明志' },
      { id: 606, title: '明月几时有', artist: '邓丽君' },
      { id: 607, title: '静夜思', artist: '毛不易' },
      { id: 608, title: '千里之外', artist: '周杰伦 / 费玉清' },
      { id: 609, title: '花好月圆夜', artist: '杨千嬅 / 任贤齐' },
    ],
    colors: {
      primary: '#f1c40f',
      secondary: '#1abc9c',
      accent: '#e67e22',
      gradientStops: [
        '#0a0a23 0%',
        '#1a1a3e 15%',
        '#2c3e50 30%',
        '#34495e 45%',
        '#2c3e50 55%',
        '#1a1a3e 70%',
        '#0a0a23 100%',
      ],
      textGradient: 'linear-gradient(135deg, #ffeaa7, #f1c40f)',
      btnGradient: 'linear-gradient(135deg, #f1c40f 0%, #e67e22 100%)',
      songActiveBg: 'linear-gradient(135deg, rgba(241,196,15,0.2), rgba(230,126,34,0.15))',
    },
    particles: {
      type: 'lanterns',
      emoji: '🏮',
      count: 8,
    },
    vinylLabelGradient: 'linear-gradient(135deg, #f1c40f, #e67e22)',
    headerBg: 'linear-gradient(180deg, rgba(10,10,35,0.92) 0%, transparent 100%)',
  },
]

// ============================================================
// 主题匹配逻辑
// ============================================================

/**
 * 获取当前日期应匹配的活跃主题
 *
 * 匹配优先级：
 *   1. 精确日期匹配（type: 'exact' 的节日主题）
 *   2. 月份范围匹配（type: 'monthRange' 的季节主题）
 *   3. 兜底：根据当前月份返回对应季节主题
 *
 * @param {Date} [date] - 指定日期，默认为当前时间
 * @returns {object} 匹配到的主题配置对象
 */
export function getActiveTheme(date = new Date()) {
  const month = date.getMonth() + 1

  // 第一轮：精确日期（节日）优先
  for (const config of themeConfigs) {
    if (config.dateRange.type === 'exact' && isInRange('exact', config.dateRange.start, config.dateRange.end, date)) {
      return config
    }
  }

  // 第二轮：月份范围（季节）
  for (const config of themeConfigs) {
    if (config.dateRange.type === 'monthRange' && isInRange('monthRange', config.dateRange.start, config.dateRange.end, date)) {
      return config
    }
  }

  // 兜底：根据月份返回季节主题
  const fallbackId = getSeasonFallback(month)
  const fallback = themeConfigs.find(c => c.id === fallbackId)
  return fallback || themeConfigs[0]
}

/**
 * 根据 ID 获取指定主题配置
 * @param {string} id - 主题 ID
 * @returns {object|undefined}
 */
export function getThemeById(id) {
  return themeConfigs.find(c => c.id === id)
}

/**
 * 获取所有可用的季节主题（排除节日限定）
 * @returns {object[]}
 */
export function getSeasonalThemes() {
  return themeConfigs.filter(c => c.dateRange.type === 'monthRange')
}

/**
 * 获取所有可用的节日主题
 * @returns {object[]}
 */
export function getHolidayThemes() {
  return themeConfigs.filter(c => c.dateRange.type === 'exact')
}