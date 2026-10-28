// 首页的静态常量：顶部 tab、筛选标签、热搜词。

export const FEED_TABS = [
  { key: 'recommend', label: '推荐' },
  { key: 'follow', label: '关注' },
  { key: 'club', label: '俱乐部' },
] as const
export type FeedTab = (typeof FEED_TABS)[number]['key']

export const FILTER_TAGS = [
  '数学',
  'A-Level',
  '雅思',
  '竞赛',
  '留学',
  '剑桥',
  '牛津',
  '文书',
  '面试',
  '备考',
  'STEP',
  'IB',
  'AP',
  '学习',
]

export const HOT_SEARCHES = [
  'A-Level 数学大考时间表',
  'TMUA 2026 报名',
  '牛津面试真题',
  '留学文书怎么写',
  'STEP 备考攻略',
  '剑桥申请时间线',
  '雅思 8 分经验',
  '英国本科申请流程',
]
export const HOT_VALUES = ['1000万+', '860万', '720万', '655万', '510万', '438万', '390万', '322万']
export const SEARCH_POOL = [
  'A-Level 数学',
  'A-Level 物理',
  'A-Level 化学',
  'TMUA 真题',
  'STEP 备考',
  '剑桥面试',
  '牛津申请',
  '留学文书',
  'UCAS 时间线',
  '雅思 8 分',
  'AMC 数学竞赛',
  '数学社活动',
  '推荐信',
  '签证材料',
  '雅思口语',
  'IB 课程',
  'AP 课程',
  '英国G5申请',
  '竞赛 获奖',
  '活动 科研',
]
