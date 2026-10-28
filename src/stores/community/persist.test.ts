/**
 * 持久化：迁移、落盘范围、老数据回灌。
 * 这条路径坏了的表现是「老用户打开白屏 / 数据没了」，而 UI 脚本用的都是全新浏览器，
 * 抓不到 —— 只能靠单测。
 */
import { beforeEach, describe, expect, it } from 'vitest'
import { useCommunity } from '../../communityStore'
import { communityPersist } from './persist'
import type { CommunityState } from './types'

const initial = useCommunity.getState()
const migrate = communityPersist.migrate as (p: unknown, v: number) => Partial<CommunityState>
const partialize = communityPersist.partialize as (s: CommunityState) => Partial<CommunityState>

beforeEach(() => {
  localStorage.clear()
  useCommunity.setState(initial, true)
})

describe('版本迁移', () => {
  it('v5 → v7：旧版单条公告变成公告列表（保留未读名单与时间）', () => {
    const migrated = migrate(
      {
        conversations: [{ id: 100, name: '群', announcement: '旧公告' }],
        groupSettings: { 100: { announceUnread: ['g1'], announceAt: 123 } },
      },
      5,
    )
    const list = migrated.announcements?.[100] ?? []
    expect(list).toHaveLength(1)
    expect(list[0]).toMatchObject({
      text: '旧公告',
      pinned: true,
      unread: ['g1'],
      at: 123,
      by: 'me',
    })
  })

  it('v5 → v7：没有公告的会话不会凭空生成公告', () => {
    const migrated = migrate({ conversations: [{ id: 1, name: '单聊' }] }, 5)
    expect(migrated.announcements).toEqual({})
  })

  it('v6 → v7：给老会话补上 online 标记（新会话默认不在线）', () => {
    const migrated = migrate({ conversations: [{ id: 999, name: '不存在的会话' }] }, 6)
    expect(migrated.conversations?.[0].online).toBeUndefined()
  })

  it('更老的版本（v1）：补齐会话 / 消息种子与四个空列表，不炸', () => {
    const migrated = migrate({ conversations: [{ id: 1, name: '旧会话' }] }, 1)
    expect(migrated.messages).toBeDefined()
    expect(migrated.conversations?.length).toBeGreaterThan(1)
    expect(migrated.pinned).toEqual([])
    expect(migrated.muted).toEqual([])
    expect(migrated.archived).toEqual([])
    expect(migrated.blocked).toEqual([])
  })

  it('空数据也能迁（不抛异常）', () => {
    expect(() => migrate(undefined, 0)).not.toThrow()
  })
})

describe('落盘范围', () => {
  it('只落用户自己的数据，不落只读目录（posts / groupMembers）', () => {
    const keys = Object.keys(partialize(useCommunity.getState()))
    expect(keys).not.toContain('posts')
    expect(keys).not.toContain('groupMembers')
    expect(keys).not.toContain('getUser')
  })

  it('用户数据一个都不能漏（漏了就丢数据）', () => {
    const keys = partialize(useCommunity.getState())
    for (const k of [
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
    ] as const) {
      expect(keys, k).toHaveProperty(k)
    }
  })
})

describe('老数据回灌（rehydrate）', () => {
  it('localStorage 里的旧数据能读回 store', async () => {
    localStorage.setItem(
      'comenius_community',
      JSON.stringify({ state: { likes: [1, 2], follows: ['u_x'] }, version: 7 }),
    )
    await useCommunity.persist.rehydrate()
    expect(useCommunity.getState().likes).toEqual([1, 2])
    expect(useCommunity.getState().follows).toEqual(['u_x'])
  })

  it('回灌之后只读目录仍然是种子数据（不会被旧数据里的空值覆盖）', async () => {
    localStorage.setItem(
      'comenius_community',
      JSON.stringify({ state: { likes: [1], posts: [] }, version: 7 }),
    )
    await useCommunity.persist.rehydrate()
    expect(useCommunity.getState().posts.length).toBeGreaterThan(0)
  })
})
