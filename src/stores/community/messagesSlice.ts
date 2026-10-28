// 社区 store 的私信 / 会话 slice：收发消息、会话状态（置顶 / 免打扰 / 归档 / 拉黑）、未读标记。
// 从 communityStore.ts **原样搬移**（只改位置，不改逻辑）：群管理在 groupsSlice，
// 两边共用的小动作在 helpers.ts。

import type { StateCreator } from 'zustand'
import type { Message } from '../../community/data'
import * as conversationsRepo from '../../repositories/conversationsRepo'
import * as messagesRepo from '../../repositories/messagesRepo'
import { appendMessage } from './helpers'
import { toggleIn, type CommunityState } from './types'

/** 这个 slice 负责的 state / action（= CommunityState 的私信部分） */
export type MessagesSlice = Pick<
  CommunityState,
  | 'conversations'
  | 'messages'
  | 'activeConvId'
  | 'pinned'
  | 'muted'
  | 'archived'
  | 'blocked'
  | 'unreadMark'
  | 'sendMessage'
  | 'sendSticker'
  | 'sendImage'
  | 'sendVoice'
  | 'sendNote'
  | 'recallMessage'
  | 'deleteMessage'
  | 'markDelivered'
  | 'receiveMessage'
  | 'pickReply'
  | 'startConversation'
  | 'openConversation'
  | 'removeConversation'
  | 'markUnread'
  | 'markRead'
  | 'clearThread'
  | 'togglePin'
  | 'toggleMute'
  | 'toggleArchive'
  | 'toggleBlock'
  | 'pushSystem'
>

export const messagesSlice: StateCreator<CommunityState, [], [], MessagesSlice> = (set, get) => {
  /** 自己发的消息先落成「发送中」，500ms 后变「已送达」 */
  const sendMine = (convId: number, msg: Message, preview: string) => {
    appendMessage(set, convId, msg, preview)
    // 乐观更新在前、回执在后：回执（以后是 HTTP/WebSocket）由 repository 负责
    messagesRepo.send(msg, { onAck: () => get().markDelivered(convId) })
  }

  return {
    conversations: conversationsRepo.initialConversations(),
    messages: messagesRepo.initialMessages(),
    activeConvId: null,
    pinned: [],
    muted: [],
    archived: [],
    blocked: [],
    unreadMark: {},

    sendMessage: (convId, text, quoted) =>
      sendMine(
        convId,
        { from: 'me', type: 'text', text, quoted, status: 'sending', time: '刚刚' },
        text,
      ),
    sendSticker: (convId, emoji) =>
      sendMine(
        convId,
        { from: 'me', type: 'sticker', emoji, status: 'sending', time: '刚刚' },
        '[表情]',
      ),
    sendImage: (convId, url, quoted) =>
      sendMine(
        convId,
        { from: 'me', type: 'image', url, quoted, status: 'sending', time: '刚刚' },
        '[图片]',
      ),
    sendVoice: (convId, duration) =>
      sendMine(
        convId,
        { from: 'me', type: 'voice', duration, status: 'sending', time: '刚刚' },
        '[语音]',
      ),
    sendNote: (convId, note, quoted) =>
      sendMine(
        convId,
        { from: 'me', type: 'note', note, quoted, status: 'sending', time: '刚刚' },
        '[笔记]',
      ),

    recallMessage: (convId, index) =>
      set(s => ({
        messages: {
          ...s.messages,
          [convId]: (s.messages[convId] ?? []).map((m, i) =>
            i === index
              ? {
                  ...m,
                  recalled: true,
                  text: undefined,
                  note: undefined,
                  emoji: undefined,
                  url: undefined,
                  thumb: undefined,
                  quoted: undefined,
                }
              : m,
          ),
        },
      })),

    deleteMessage: (convId, index) =>
      set(s => ({
        messages: {
          ...s.messages,
          [convId]: (s.messages[convId] ?? []).filter((_, i) => i !== index),
        },
      })),

    markDelivered: convId =>
      set(s => ({
        messages: {
          ...s.messages,
          [convId]: (s.messages[convId] ?? []).map(m =>
            m.status === 'sending' ? { ...m, status: 'sent' } : m,
          ),
        },
      })),

    receiveMessage: (convId, text, senderId) =>
      set(s => {
        const thread = s.messages[convId] ?? []
        const active = s.activeConvId === convId
        return {
          // 对方回了消息 → 我发的消息就算已读
          messages: {
            ...s.messages,
            [convId]: [
              ...thread.map(m =>
                m.from === 'me' && m.status !== 'read' ? { ...m, status: 'read' as const } : m,
              ),
              { from: 'other' as const, type: 'text' as const, text, senderId, time: '刚刚' },
            ],
          },
          conversations: s.conversations.map(c =>
            c.id === convId
              ? { ...c, last: text, time: '刚刚', unread: active ? 0 : c.unread + 1 }
              : c,
          ),
        }
      }),

    pickReply: conv => messagesRepo.pickReply(conv),

    startConversation: u => {
      const existing = get().conversations.find(c => c.userId === u.id)
      if (existing) {
        set({ activeConvId: existing.id })
        return existing.id
      }
      const id = conversationsRepo.nextConversationId()
      set(s => ({
        conversations: [
          {
            id,
            userId: u.id,
            name: u.name,
            avatar: u.avatar,
            last: '',
            time: '现在',
            unread: 0,
            verified: u.verified,
          },
          ...s.conversations,
        ],
        activeConvId: id,
      }))
      return id
    },

    openConversation: convId =>
      set(s => {
        const conv = s.conversations.find(c => c.id === convId)
        const unreadMark = { ...s.unreadMark }
        // 只有「从别的会话切过来」才重算未读起点；同一个会话重复进入（StrictMode 会跑两次 effect）
        // 不能把已经画好的分隔线清掉
        if (s.activeConvId !== convId) {
          if (conv && conv.unread > 0) {
            const len = (s.messages[convId] ?? []).length
            unreadMark[convId] = Math.max(0, len - conv.unread)
          } else delete unreadMark[convId]
        }
        return {
          activeConvId: convId,
          unreadMark,
          conversations: s.conversations.map(c => (c.id === convId ? { ...c, unread: 0 } : c)),
        }
      }),

    removeConversation: convId =>
      set(s => {
        const nextMessages = { ...s.messages }
        delete nextMessages[convId]
        const conversations = s.conversations.filter(c => c.id !== convId)
        return {
          conversations,
          messages: nextMessages,
          archived: s.archived.filter(x => x !== convId),
          pinned: s.pinned.filter(x => x !== convId),
          muted: s.muted.filter(x => x !== convId),
          blocked: s.blocked.filter(x => x !== convId),
          activeConvId: s.activeConvId === convId ? (conversations[0]?.id ?? null) : s.activeConvId,
        }
      }),

    markUnread: convId =>
      set(s => ({
        conversations: s.conversations.map(c =>
          c.id === convId ? { ...c, unread: Math.max(1, c.unread) } : c,
        ),
      })),

    markRead: convId =>
      set(s => ({
        conversations: s.conversations.map(c => (c.id === convId ? { ...c, unread: 0 } : c)),
      })),

    clearThread: convId =>
      set(s => ({
        messages: { ...s.messages, [convId]: [] },
        conversations: s.conversations.map(c =>
          c.id === convId ? { ...c, last: '', time: '' } : c,
        ),
      })),

    togglePin: convId =>
      set(s => ({
        pinned: toggleIn(s.pinned, convId),
        archived: s.archived.filter(x => x !== convId),
      })),
    toggleMute: convId => set(s => ({ muted: toggleIn(s.muted, convId) })),
    toggleArchive: convId =>
      set(s => ({
        archived: toggleIn(s.archived, convId),
        pinned: s.pinned.filter(x => x !== convId),
      })),
    toggleBlock: convId => set(s => ({ blocked: toggleIn(s.blocked, convId) })),

    pushSystem: (convId, text) =>
      set(s => ({
        messages: {
          ...s.messages,
          [convId]: [
            ...(s.messages[convId] ?? []),
            { from: 'other', type: 'system', text, time: '刚刚' },
          ],
        },
      })),
  }
}
