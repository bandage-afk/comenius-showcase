// 持久化配置与版本迁移（从 communityStore.ts 拆出）。
// ⚠️ 改这里的规则：只能前向追加，且必须幂等——老用户浏览器里有旧数据。

import type { Announcement, Conversation } from '../../community/data'
import * as conversationsRepo from '../../repositories/conversationsRepo'
import * as messagesRepo from '../../repositories/messagesRepo'
import { storage } from '../../repositories/localStore'
import type { CommunityState, GroupSettings } from './types'
import { createJSONStorage, type PersistOptions } from 'zustand/middleware'

/**
 * 该落盘的字段（partialize 与 merge 共用这一份清单）。
 * 只落「用户自己产生的数据」：只读目录（posts / groupMembers）不写盘，
 * 否则老用户的本地下数据会凭空变大，而且种子一改就和新用户不一致。
 */
const PERSISTED = [
  'follows',
  'likes',
  'collects',
  'comments',
  'conversations',
  'messages',
  'pinned',
  'muted',
  'archived',
  'blocked',
  'groupAdmins',
  'groupNickname',
  'leftGroups',
  'groupSettings',
  'savedGroups',
  'joinRequests',
  'groupOwner',
  'announcements',
] as const

type PersistedKey = (typeof PERSISTED)[number]

export const communityPersist: PersistOptions<CommunityState, Partial<CommunityState>> = {
  name: 'comenius_community',
  version: 7,
  // 落盘走 repositories/localStore（全仓唯一碰 localStorage 的地方，见 ADR-0006）
  storage: createJSONStorage(() => storage),
  /**
   * 只把「该落盘的字段」合并回来。
   * zustand 默认是浅合并，即 localStorage 里的**任何**多余键都会盖到 store 上——
   * 比如旧版本（或人为改过）的本地下数据里带着 `posts`，首页笔记就会变成空数组，
   * 而且只在老用户那儿复现。只读目录一律以 repository 的种子为准。
   */
  merge: (persisted, current) => {
    const p = (persisted ?? {}) as Partial<Record<PersistedKey, unknown>>
    const next: Record<string, unknown> = { ...current }
    for (const key of PERSISTED) {
      if (key in p && p[key] !== undefined) next[key] = p[key]
    }
    return next as unknown as CommunityState
  },
  // v1 → v2：补上群聊会话、新的消息种子和会话状态字段（不动已有的关注/点赞/评论）
  migrate: (persisted: unknown, version: number) => {
    const p = (persisted ?? {}) as Partial<CommunityState>
    if (version >= 7) return p as CommunityState
    if (version === 6) {
      // v6 → v7：会话补上「在线」标记（老用户本地数据里没有这个字段）
      const convs = (p.conversations ?? []) as Conversation[]
      return {
        ...p,
        conversations: convs.map(c => ({
          ...c,
          online: conversationsRepo.initialConversations().find(x => x.id === c.id)?.online,
        })),
      } as CommunityState
    }
    if (version === 5) {
      // 旧版单条公告 → 公告列表
      const convs = (p.conversations ?? []) as Conversation[]
      const settings = (p.groupSettings ?? {}) as Record<number, GroupSettings>
      const announcements: Record<number, Announcement[]> = {}
      for (const c of convs) {
        if (!c.announcement) continue
        const s = settings[c.id]
        announcements[c.id] = [
          {
            id: c.id * 1000 + 1,
            text: c.announcement,
            at: s?.announceAt ?? Date.now(),
            by: 'me',
            pinned: true,
            unread: s?.announceUnread ?? [],
          },
        ]
      }
      return { ...p, announcements } as CommunityState
    }
    if (version === 4) {
      return { ...p, joinRequests: p.joinRequests ?? {} } as CommunityState
    }
    if (version === 3) {
      return {
        ...p,
        groupSettings: p.groupSettings ?? {},
        savedGroups: p.savedGroups ?? [],
      } as CommunityState
    }
    if (version === 2) {
      return {
        ...p,
        groupAdmins: p.groupAdmins ?? { 100: ['me'] },
        groupNickname: {},
        leftGroups: [],
      } as CommunityState
    }
    const existingIds = new Set((p.conversations ?? []).map(c => c.id))
    const missing = conversationsRepo.initialConversations().filter(c => !existingIds.has(c.id))
    return {
      ...p,
      conversations: [...missing, ...(p.conversations ?? [])],
      messages: p.messages ?? messagesRepo.initialMessages(),
      pinned: p.pinned ?? [],
      muted: p.muted ?? [],
      archived: p.archived ?? [],
      blocked: p.blocked ?? [],
      unreadMark: {},
    } as CommunityState
  },
  partialize: s =>
    Object.fromEntries(PERSISTED.map(key => [key, s[key]])) as Partial<CommunityState>,
}
