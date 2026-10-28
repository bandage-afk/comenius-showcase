// 社区 store 两个 slice 共用的「改 state 小动作」。
// 为什么不直接放进各自的 slice：messages 与 groups 互相不 import（会成环），
// 两边都要用的小动作只能放在中立模块里，避免各抄一份。

import type { Announcement, Message } from '../../community/data'
import type { CommunityState } from './types'

/** zustand 的 set：这里只用到「传补丁 / 传 updater」这一种调用方式，按最小接口声明 */
export type CommunitySet = (
  patch: Partial<CommunityState> | ((state: CommunityState) => Partial<CommunityState>),
) => void

/** 追加一条消息并同步会话摘要 */
export const appendMessage = (set: CommunitySet, convId: number, msg: Message, preview: string) =>
  set(s => ({
    messages: { ...s.messages, [convId]: [...(s.messages[convId] ?? []), msg] },
    conversations: s.conversations.map(c =>
      c.id === convId ? { ...c, last: preview, time: '刚刚' } : c,
    ),
  }))

/** 公告列表变化后，把「聊天区顶部展示的那条」同步到 conversation.announcement */
export const syncAnnouncements = (set: CommunitySet, convId: number, list: Announcement[]) =>
  set(s => ({
    announcements: { ...s.announcements, [convId]: list },
    conversations: s.conversations.map(c =>
      c.id === convId
        ? { ...c, announcement: (list.find(a => a.pinned) ?? list[0])?.text ?? '' }
        : c,
    ),
  }))
