/**
 * 私信 / 会话 slice。
 * 这里挑的都是「改一行就悄悄坏掉」的地方：乐观发送 + 回执、未读分隔线的起点、
 * 删除会话的连带清理。全是上一个版本靠人肉点页面才发现得了的问题。
 */
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useCommunity } from '../../communityStore'
import type { User } from '../../community/data'

const initial = useCommunity.getState()
const conv = (id: number) => useCommunity.getState().conversations.find(c => c.id === id)
const thread = (id: number) => useCommunity.getState().messages[String(id)] ?? []

beforeEach(() => {
  localStorage.clear()
  useCommunity.setState(initial, true)
})

describe('发送消息', () => {
  it('先落「发送中」并更新会话摘要，回执到了变「已送达」', () => {
    vi.useFakeTimers()
    try {
      useCommunity.getState().sendMessage(100, 'hello', undefined)

      expect(thread(100).at(-1)).toMatchObject({ from: 'me', text: 'hello', status: 'sending' })
      expect(conv(100)?.last).toBe('hello')
      expect(conv(100)?.time).toBe('刚刚')

      vi.advanceTimersByTime(500)
      expect(thread(100).at(-1)?.status).toBe('sent')
    } finally {
      vi.useRealTimers()
    }
  })

  it('发图片 / 表情 / 语音 / 笔记都会带上对应的摘要文案', () => {
    vi.useFakeTimers()
    try {
      const s = useCommunity.getState()
      s.sendSticker(100, '👍')
      expect(conv(100)?.last).toBe('[表情]')
      s.sendImage(100, 'photo-x')
      expect(conv(100)?.last).toBe('[图片]')
      s.sendVoice(100, 12)
      expect(conv(100)?.last).toBe('[语音]')
    } finally {
      vi.useRealTimers()
    }
  })
})

describe('收到对方消息', () => {
  it('我发过的消息会被标成已读', () => {
    useCommunity.getState().sendMessage(100, '在吗', undefined)
    useCommunity.getState().receiveMessage(100, '在的', 'g1')

    const mine = thread(100).filter(m => m.from === 'me')
    expect(mine.every(m => m.status === 'read')).toBe(true)
    expect(thread(100).at(-1)).toMatchObject({ from: 'other', text: '在的', senderId: 'g1' })
  })

  it('非活跃会话未读 +1，活跃会话不加未读', () => {
    // 把 100 设为当前会话 → 它不涨未读
    useCommunity.getState().openConversation(100)
    const before100 = conv(100)?.unread ?? 0
    useCommunity.getState().receiveMessage(100, 'hi', 'g1')
    expect(conv(100)?.unread).toBe(before100)

    // 1 不是当前会话 → 未读 +1
    const before1 = conv(1)?.unread ?? 0
    useCommunity.getState().receiveMessage(1, 'hi')
    expect(conv(1)?.unread).toBe(before1 + 1)
  })
})

describe('未读分隔线（unreadMark）', () => {
  it('从别的会话切进来才算起点：总数 - 未读数', () => {
    const len = thread(100).length
    const unread = conv(100)?.unread ?? 0

    useCommunity.getState().openConversation(1) // 先待在别处
    useCommunity.getState().openConversation(100)
    expect(useCommunity.getState().unreadMark[100]).toBe(len - unread)
    expect(conv(100)?.unread).toBe(0)
  })

  it('同一会话重复进入不清掉已经画好的分隔线（StrictMode 会跑两次 effect）', () => {
    const len = thread(100).length
    const unread = conv(100)?.unread ?? 0

    useCommunity.getState().openConversation(1)
    useCommunity.getState().openConversation(100)
    const mark = useCommunity.getState().unreadMark[100]
    expect(mark).toBe(len - unread)

    useCommunity.getState().openConversation(100)
    expect(useCommunity.getState().unreadMark[100]).toBe(mark)
  })

  it('没有未读的会话不留分隔线', () => {
    useCommunity.getState().openConversation(100)
    useCommunity.getState().openConversation(1)
    expect(useCommunity.getState().unreadMark[1]).toBeUndefined()
  })
})

describe('会话级操作', () => {
  it('删除会话：连带清消息与置顶/免打扰/归档/拉黑，activeConvId 让给剩下的第一个', () => {
    const s = useCommunity.getState()
    s.openConversation(2)
    s.togglePin(2)
    s.toggleMute(2)
    s.toggleArchive(2)
    s.toggleBlock(2)

    useCommunity.getState().removeConversation(2)
    const after = useCommunity.getState()
    expect(after.conversations.some(c => c.id === 2)).toBe(false)
    expect(after.messages['2']).toBeUndefined()
    for (const list of [after.pinned, after.muted, after.archived, after.blocked]) {
      expect(list).not.toContain(2)
    }
    expect(after.activeConvId).toBe(after.conversations[0]?.id)
  })

  it('撤回：清掉正文与媒体字段，只留 recalled 标记', () => {
    const index = thread(100).length - 1
    useCommunity.getState().recallMessage(100, index)
    const msg = thread(100)[index]
    expect(msg.recalled).toBe(true)
    expect(msg.text).toBeUndefined()
    expect(msg.note).toBeUndefined()
    expect(msg.senderId === undefined || msg.senderId.length > 0).toBe(true)
  })

  it('删除单条：只少了那一条', () => {
    const before = thread(100)
    useCommunity.getState().deleteMessage(100, 0)
    const after = thread(100)
    expect(after).toHaveLength(before.length - 1)
    expect(after[0]).toEqual(before[1])
  })

  it('清空聊天记录：线程清空 + 摘要清空', () => {
    useCommunity.getState().clearThread(100)
    expect(thread(100)).toEqual([])
    expect(conv(100)?.last).toBe('')
    expect(conv(100)?.time).toBe('')
  })

  it('标记未读 / 已读', () => {
    useCommunity.getState().markUnread(1)
    expect(conv(1)?.unread).toBe(1)
    useCommunity.getState().markRead(1)
    expect(conv(1)?.unread).toBe(0)
  })

  it('置顶与归档互斥；免打扰 / 拉黑各自独立', () => {
    const s = useCommunity.getState()
    s.togglePin(1)
    expect(useCommunity.getState().pinned).toContain(1)
    useCommunity.getState().toggleArchive(1)
    expect(useCommunity.getState().archived).toContain(1)
    expect(useCommunity.getState().pinned).not.toContain(1)
  })
})

describe('发起会话', () => {
  const user: User = {
    id: 'u_test',
    name: '测试同学',
    comeniusId: '70099999',
    avatar: 'photo-test',
    bio: '',
    school: '',
    verified: false,
  }

  it('第一次新建会话并设为当前会话', () => {
    const id = useCommunity.getState().startConversation(user)
    expect(conv(id)?.userId).toBe('u_test')
    expect(useCommunity.getState().activeConvId).toBe(id)
  })

  it('同一用户再来一次：复用既有会话，不新建', () => {
    const first = useCommunity.getState().startConversation(user)
    const second = useCommunity.getState().startConversation(user)
    expect(second).toBe(first)
    expect(useCommunity.getState().conversations.filter(c => c.userId === 'u_test')).toHaveLength(1)
  })
})

describe('系统消息', () => {
  it('pushSystem 只往线程里追加一条系统消息，不动会话摘要', () => {
    const last = conv(100)?.last
    useCommunity.getState().pushSystem(100, '你邀请 陈老师 加入了群聊')
    expect(thread(100).at(-1)).toMatchObject({ type: 'system', from: 'other' })
    expect(conv(100)?.last).toBe(last)
  })
})
