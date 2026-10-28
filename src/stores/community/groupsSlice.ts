// 社区 store 的群管理 slice：群主 / 管理员 / 昵称、成员增删、退群入群、群设置、多条群公告。
// 从 communityStore.ts **原样搬移**（只改位置，不改逻辑）；私信在 messagesSlice，
// 两边共用的小动作在 helpers.ts。

import type { StateCreator } from 'zustand'
import type { Announcement } from '../../community/data'
import * as conversationsRepo from '../../repositories/conversationsRepo'
import * as usersRepo from '../../repositories/usersRepo'
import { syncAnnouncements } from './helpers'
import { DEFAULT_GROUP_SETTINGS, toggleIn, type CommunityState } from './types'

/** 这个 slice 负责的 state / action（= CommunityState 的群聊部分） */
export type GroupsSlice = Pick<
  CommunityState,
  | 'groupAdmins'
  | 'groupOwner'
  | 'groupNickname'
  | 'leftGroups'
  | 'groupSettings'
  | 'savedGroups'
  | 'joinRequests'
  | 'announcements'
  | 'setAnnouncement'
  | 'toggleAdmin'
  | 'setGroupNickname'
  | 'addMember'
  | 'removeMember'
  | 'leaveGroup'
  | 'rejoinGroup'
  | 'renameGroup'
  | 'transferOwner'
  | 'updateGroupSettings'
  | 'publishAnnouncement'
  | 'markAnnounceRead'
  | 'toggleSavedGroup'
  | 'requestJoin'
  | 'approveJoin'
  | 'declineJoin'
  | 'addAnnouncement'
  | 'updateAnnouncement'
  | 'removeAnnouncement'
  | 'toggleAnnouncementPin'
  | 'markAnnouncementRead'
>

export const groupsSlice: StateCreator<CommunityState, [], [], GroupsSlice> = (set, get) => ({
  // 当前用户是群 100 的群主，陈老师（g1）是管理员，便于演示群主/管理员两种权限
  groupAdmins: { 100: ['g1'] },
  groupOwner: { 100: 'me' },
  groupNickname: {},
  leftGroups: [],
  groupSettings: {},
  savedGroups: [],
  joinRequests: {},
  announcements: {
    100: [
      {
        id: 1,
        text: conversationsRepo.initialConversations()[0].announcement ?? '',
        at: Date.now() - 3 * 24 * 3600 * 1000,
        by: 'me',
        pinned: true,
        unread: [],
      },
    ],
  },

  /* ── 群管理 ── */
  setAnnouncement: (convId, text) =>
    set(s => ({
      conversations: s.conversations.map(c => (c.id === convId ? { ...c, announcement: text } : c)),
    })),

  toggleAdmin: (convId, memberId) =>
    set(s => {
      const cur = s.groupAdmins[convId] ?? []
      return { groupAdmins: { ...s.groupAdmins, [convId]: toggleIn(cur, memberId) } }
    }),

  setGroupNickname: (convId, name) =>
    set(s => ({ groupNickname: { ...s.groupNickname, [convId]: name } })),

  addMember: (convId, memberId) => {
    const name = usersRepo.findMember(memberId)?.name ?? '新成员'
    get().pushSystem(convId, `你邀请 ${name} 加入了群聊`)
    set(s => ({
      conversations: s.conversations.map(c =>
        c.id === convId && !(c.memberIds ?? []).includes(memberId)
          ? { ...c, memberIds: [...(c.memberIds ?? []), memberId] }
          : c,
      ),
    }))
  },

  removeMember: (convId, memberId) => {
    const name = usersRepo.findMember(memberId)?.name ?? '该成员'
    get().pushSystem(convId, `${name} 被移出群聊`)
    set(s => ({
      conversations: s.conversations.map(c =>
        c.id === convId ? { ...c, memberIds: (c.memberIds ?? []).filter(m => m !== memberId) } : c,
      ),
      groupAdmins: {
        ...s.groupAdmins,
        [convId]: (s.groupAdmins[convId] ?? []).filter(m => m !== memberId),
      },
    }))
  },

  leaveGroup: convId => {
    get().pushSystem(convId, '你退出了群聊')
    set(s => ({
      leftGroups: s.leftGroups.includes(convId) ? s.leftGroups : [...s.leftGroups, convId],
      conversations: s.conversations.map(c => (c.id === convId ? { ...c, unread: 0 } : c)),
    }))
  },

  rejoinGroup: convId => {
    get().pushSystem(convId, '你加入了群聊')
    set(s => ({ leftGroups: s.leftGroups.filter(id => id !== convId) }))
  },

  renameGroup: (convId, name) => {
    get().pushSystem(convId, `群名称已改为「${name}」`)
    set(s => ({
      conversations: s.conversations.map(c => (c.id === convId ? { ...c, name } : c)),
    }))
  },

  transferOwner: (convId, memberId) => {
    const name = usersRepo.findMember(memberId)?.name ?? '新群主'
    get().pushSystem(convId, `${name} 成为新群主`)
    set(s => ({
      groupOwner: { ...s.groupOwner, [convId]: memberId },
      groupAdmins: {
        ...s.groupAdmins,
        [convId]: (s.groupAdmins[convId] ?? []).filter(m => m !== memberId),
      },
    }))
  },

  updateGroupSettings: (convId, patch) =>
    set(s => ({
      groupSettings: {
        ...s.groupSettings,
        [convId]: { ...DEFAULT_GROUP_SETTINGS, ...s.groupSettings[convId], ...patch },
      },
    })),

  publishAnnouncement: (convId, text, unread) => {
    get().pushSystem(convId, '群公告已更新')
    set(s => ({
      conversations: s.conversations.map(c => (c.id === convId ? { ...c, announcement: text } : c)),
      groupSettings: {
        ...s.groupSettings,
        [convId]: {
          ...DEFAULT_GROUP_SETTINGS,
          ...s.groupSettings[convId],
          announceUnread: unread,
          announceAt: Date.now(),
        },
      },
    }))
  },

  markAnnounceRead: (convId, memberId) =>
    set(s => {
      const cur = { ...DEFAULT_GROUP_SETTINGS, ...s.groupSettings[convId] }
      return {
        groupSettings: {
          ...s.groupSettings,
          [convId]: {
            ...cur,
            announceUnread: cur.announceUnread.filter(m => m !== memberId),
          },
        },
      }
    }),

  toggleSavedGroup: convId => set(s => ({ savedGroups: toggleIn(s.savedGroups, convId) })),

  requestJoin: (convId, memberId) => {
    const name = usersRepo.findMember(memberId)?.name ?? '新成员'
    get().pushSystem(convId, `邀请 ${name} 加入群聊，等待群主确认`)
    set(s => ({
      joinRequests: {
        ...s.joinRequests,
        [convId]: [...(s.joinRequests[convId] ?? []), memberId],
      },
    }))
  },

  approveJoin: (convId, memberId) => {
    set(s => ({
      joinRequests: {
        ...s.joinRequests,
        [convId]: (s.joinRequests[convId] ?? []).filter(m => m !== memberId),
      },
    }))
    get().addMember(convId, memberId)
  },

  declineJoin: (convId, memberId) => {
    const name = usersRepo.findMember(memberId)?.name ?? '该成员'
    get().pushSystem(convId, `${name} 的入群申请已被拒绝`)
    set(s => ({
      joinRequests: {
        ...s.joinRequests,
        [convId]: (s.joinRequests[convId] ?? []).filter(m => m !== memberId),
      },
    }))
  },

  /* ── 群公告（多条） ── */
  addAnnouncement: (convId, text) => {
    const members = get().conversations.find(c => c.id === convId)?.memberIds ?? []
    const list = get().announcements[convId] ?? []
    const ann: Announcement = {
      id: Date.now(),
      text,
      at: Date.now(),
      by: 'me',
      pinned: list.length === 0 || !list.some(a => a.pinned),
      unread: members,
    }
    get().pushSystem(convId, '群公告已更新')
    syncAnnouncements(set, convId, [ann, ...list])
  },

  updateAnnouncement: (convId, annId, text) =>
    syncAnnouncements(
      set,
      convId,
      (get().announcements[convId] ?? []).map(a => (a.id === annId ? { ...a, text } : a)),
    ),

  removeAnnouncement: (convId, annId) =>
    syncAnnouncements(
      set,
      convId,
      (get().announcements[convId] ?? []).filter(a => a.id !== annId),
    ),

  toggleAnnouncementPin: (convId, annId) =>
    syncAnnouncements(
      set,
      convId,
      (get().announcements[convId] ?? []).map(a => ({
        ...a,
        pinned: a.id === annId ? !a.pinned : false,
      })),
    ),

  markAnnouncementRead: (convId, annId, memberId) =>
    syncAnnouncements(
      set,
      convId,
      (get().announcements[convId] ?? []).map(a =>
        a.id === annId ? { ...a, unread: a.unread.filter(m => m !== memberId) } : a,
      ),
    ),
})
