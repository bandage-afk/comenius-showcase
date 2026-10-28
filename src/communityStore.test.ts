/**
 * 社区 store 的「组装契约」测试。
 *
 * 为什么值得有：2026-09 把 485 行 action 块拆成 messagesSlice / groupsSlice、后来又接上
 * repository + catalogSlice 时，「67 个 key 有没有搬全」是靠人肉比对核对的。
 * 这类拆文件 / 搬 action 的改动，现在跑一遍这个文件 2 秒就能确认没漏，
 * 不用等视觉基线那 55 秒（视觉基线也测不到 action 有没有丢）。
 */
import { beforeEach, describe, expect, it } from 'vitest'
import { useCommunity } from './communityStore'
import * as postsRepo from './repositories/postsRepo'
import * as usersRepo from './repositories/usersRepo'

/** CommunityState 里的「数据字段」 */
const STATE_FIELDS = [
  'follows',
  'likes',
  'collects',
  'comments',
  'conversations',
  'messages',
  'activeConvId',
  'viewingUser',
  'pinned',
  'muted',
  'archived',
  'blocked',
  'unreadMark',
  'groupAdmins',
  'groupOwner',
  'groupNickname',
  'leftGroups',
  'groupSettings',
  'savedGroups',
  'joinRequests',
  'announcements',
  'posts',
  'groupMembers',
]

/** CommunityState 里的 action —— 少一个就是「搬 slice 时搬漏了」 */
const ACTIONS = [
  'getUser',
  'getMember',
  'viewUser',
  'toggleFollow',
  'toggleLike',
  'toggleCollect',
  'addComment',
  'sendMessage',
  'sendSticker',
  'sendImage',
  'sendVoice',
  'sendNote',
  'recallMessage',
  'deleteMessage',
  'markDelivered',
  'receiveMessage',
  'pickReply',
  'startConversation',
  'openConversation',
  'removeConversation',
  'markUnread',
  'markRead',
  'clearThread',
  'togglePin',
  'toggleMute',
  'toggleArchive',
  'toggleBlock',
  'setAnnouncement',
  'toggleAdmin',
  'setGroupNickname',
  'addMember',
  'removeMember',
  'leaveGroup',
  'rejoinGroup',
  'renameGroup',
  'transferOwner',
  'updateGroupSettings',
  'publishAnnouncement',
  'markAnnounceRead',
  'toggleSavedGroup',
  'pushSystem',
  'requestJoin',
  'approveJoin',
  'declineJoin',
  'addAnnouncement',
  'updateAnnouncement',
  'removeAnnouncement',
  'toggleAnnouncementPin',
  'markAnnouncementRead',
]

const initial = useCommunity.getState()

beforeEach(() => {
  // store 是模块级单例：不重置的话用例之间会互相污染
  localStorage.clear()
  useCommunity.setState(initial, true)
})

describe('对外契约', () => {
  it('暴露的 key 与 CommunityState 完全一致（多一个 / 少一个都要显式改这个契约）', () => {
    // 项目 lib 是 ES2020（不用 toSorted，见 .oxlintrc.json 的 no-array-sort 例外）；
    // Object.keys 已经是新数组，直接 sort 不会动到 store
    expect(Object.keys(useCommunity.getState()).sort()).toEqual(
      [...STATE_FIELDS, ...ACTIONS].sort(),
    )
  })

  it('每个 action 都是函数', () => {
    const state = useCommunity.getState() as unknown as Record<string, unknown>
    for (const name of ACTIONS) expect(typeof state[name], name).toBe('function')
  })

  it('每个数据字段都有初始值（不是 undefined）', () => {
    const state = useCommunity.getState() as unknown as Record<string, unknown>
    for (const name of STATE_FIELDS) expect(state[name], name).not.toBeUndefined()
  })
})

describe('只读目录来自 repository（ADR-0006）', () => {
  it('posts 就是 postsRepo 给的列表', () => {
    expect(useCommunity.getState().posts).toBe(postsRepo.listPosts())
  })

  it('groupMembers 就是 usersRepo 给的成员池', () => {
    expect(useCommunity.getState().groupMembers).toBe(usersRepo.listMembers())
  })

  it('getUser 对同一昵称返回同一个对象（头像不会每次渲染都换）', () => {
    const { getUser } = useCommunity.getState()
    expect(getUser('小橙子学长')).toBe(getUser('小橙子学长'))
  })

  it('getMember 认已知成员；未知 / 空 id 返回 undefined', () => {
    const { getMember } = useCommunity.getState()
    expect(getMember('g1')?.name).toBe('陈老师')
    expect(getMember('不存在')).toBeUndefined()
    expect(getMember()).toBeUndefined()
  })

  it('pickReply：单聊不带发言人，群聊会挑一个成员当发言人', () => {
    const { pickReply } = useCommunity.getState()
    expect(pickReply({ isGroup: false }).senderId).toBeUndefined()

    const group = pickReply({ isGroup: true, memberIds: ['g1', 'g2'] })
    expect(['g1', 'g2']).toContain(group.senderId)
    expect(group.text.length).toBeGreaterThan(0)
  })
})
