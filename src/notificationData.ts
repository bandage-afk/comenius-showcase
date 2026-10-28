// 消息页（通知中心）数据：评论和@ / 赞和收藏 / 新增关注
// 头像走 community/data 的 getUser()，和站内其它页面同一套头像池。
import { getUser } from './community/data'

export interface Notif {
  id: number
  name: string
  avatar: string
  /** 名字后面的小标，例如「作者」 */
  badge?: string
  /** 动作文案：评论了你的笔记 / 回复了你的评论 / 赞了你的笔记 / 关注了你 */
  action: string
  /** 评论内容或笔记标题 */
  snippet?: string
  time: string
}

function list(rows: Array<Omit<Notif, 'id' | 'avatar'>>): Notif[] {
  return rows.map((r, i) => ({ ...r, id: i + 1, avatar: getUser(r.name).avatar }))
}

/** 通知分类：和通知页三个 tab 一一对应 */
export type NotifCategory = 'comment' | 'like' | 'follow'

/**
 * 分类 → 列表。
 * 注意：三个分类的 id 都是 1..n（各自独立编号），所以「已读」要用 `分类:id` 做键，
 * 不能只用 id，否则点开「评论和@」的第 1 条会把「赞和收藏」的第 1 条也标成已读。
 */
export function notifKey(category: NotifCategory, id: number): string {
  return `${category}:${id}`
}

export const COMMENT_NOTIFS: Notif[] = list([
  { name: 'Alex', action: '评论了你的笔记', snippet: '小姐姐认识一下呗', time: '2025-05-16' },
  { name: '小红薯651BDA2A', action: '评论了你的笔记', snippet: '原评论已删除', time: '2025-05-16' },
  { name: 'Ares77', action: '评论了你的笔记', snippet: '原评论已删除', time: '2025-05-16' },
  { name: '绛蛛仙子', action: '评论了你的笔记', snippet: 'P1在定位吗', time: '2025-05-16' },
  {
    name: '小红薯682BFC61',
    badge: '作者',
    action: '回复了你的评论',
    snippet: '该评论已删除',
    time: '2025-04-28',
  },
  {
    name: '星焕-Dev Goyal',
    action: '在笔记中提到了你',
    snippet: '一起看看这份 A-Level 数学刷题清单？',
    time: '2025-04-20',
  },
])

export const LIKE_NOTIFS: Notif[] = list([
  {
    name: 'Bambi',
    action: '赞了你的笔记',
    snippet: '6个Skill实现Codex做视频全流程！',
    time: '2025-05-16',
  },
  {
    name: 'A星拿不完',
    action: '收藏了你的笔记',
    snippet: '英国G5大学申请时间线全攻略',
    time: '2025-05-12',
  },
  {
    name: '土豆土豆🥔',
    action: '赞了你的笔记',
    snippet: '市场换技术，真的有效吗？',
    time: '2025-05-09',
  },
  {
    name: 'cUILt',
    action: '赞和收藏了你的笔记',
    snippet: '牛津数学系面试真题合集',
    time: '2025-05-06',
  },
  {
    name: '学术加速器',
    action: '赞了你的笔记',
    snippet: '研究生必须掌握的全球十大科研软件',
    time: '2025-04-28',
  },
])

export const FOLLOW_NOTIFS: Notif[] = list([
  { name: '小红薯6A25E445', action: '关注了你', snippet: '你的粉丝', time: '2025-05-16' },
  { name: 'Panda AI', action: '关注了你', snippet: '你的粉丝', time: '2025-05-14' },
  { name: '索亚加德', action: '关注了你', snippet: '你的粉丝', time: '2025-05-10' },
  { name: 'R.', action: '关注了你', snippet: '你的粉丝', time: '2025-05-06' },
  { name: '犀牛竞赛学科Betty老师', action: '关注了你', snippet: '你的粉丝', time: '2025-05-02' },
])

export const NOTIFS_BY_CATEGORY: Record<NotifCategory, Notif[]> = {
  comment: COMMENT_NOTIFS,
  like: LIKE_NOTIFS,
  follow: FOLLOW_NOTIFS,
}
