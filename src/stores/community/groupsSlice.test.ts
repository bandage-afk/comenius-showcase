/**
 * 群管理 / 群公告 slice。
 * 重点覆盖「联动」：公告列表 ↔ 会话顶部展示的那条、成员增删 ↔ 管理员列表、
 * 退群入群 ↔ leftGroups，以及各种「顺手落一条系统消息」。
 */
import { beforeEach, describe, expect, it } from 'vitest'
import { useCommunity } from '../../communityStore'

const initial = useCommunity.getState()
const conv = (id: number) => useCommunity.getState().conversations.find(c => c.id === id)
const announcements = (id: number) => useCommunity.getState().announcements[id] ?? []
const thread = (id: number) => useCommunity.getState().messages[String(id)] ?? []
const lastSystem = (id: number) =>
  thread(id)
    .filter(m => m.type === 'system')
    .at(-1)?.text

beforeEach(() => {
  localStorage.clear()
  useCommunity.setState(initial, true)
})

describe('群公告（多条）', () => {
  it('新增公告：插到列表最前面，并落一条系统消息', () => {
    useCommunity.getState().addAnnouncement(100, '新课表已更新')
    const list = announcements(100)
    expect(list[0].text).toBe('新课表已更新')
    expect(list[0].by).toBe('me')
    expect(lastSystem(100)).toBe('群公告已更新')
  })

  it('会话顶部那条跟着「置顶优先」走：已有置顶时，新公告不抢顶部', () => {
    const pinned = announcements(100).find(a => a.pinned)
    useCommunity.getState().addAnnouncement(100, '新课表已更新')
    expect(conv(100)?.announcement).toBe(pinned?.text)
  })

  it('在没有公告的会话里发第一条：自动置顶，并显示在会话顶部', () => {
    useCommunity.getState().addAnnouncement(1, '单聊里的第一条公告')
    expect(announcements(1)[0].pinned).toBe(true)
    expect(conv(1)?.announcement).toBe('单聊里的第一条公告')
  })

  it('未读名单是当时的群成员（新公告对全员未读）', () => {
    useCommunity.getState().addAnnouncement(100, '记得交作业')
    expect(announcements(100)[0].unread).toEqual(conv(100)?.memberIds)
  })

  it('第一条公告自动置顶；后面新增的不抢置顶', () => {
    // 种子数据里 100 已有一条置顶公告，先验证「已有置顶时新公告不置顶」
    useCommunity.getState().addAnnouncement(100, '第二条')
    expect(announcements(100)[0].pinned).toBe(false)

    // 换一个没有公告的会话：第一条自动置顶
    useCommunity.getState().addAnnouncement(1, '单聊第一条')
    expect(announcements(1)[0].pinned).toBe(true)
  })

  it('置顶只有一条：置顶新的会取消旧的', () => {
    useCommunity.getState().addAnnouncement(100, '第二条')
    const second = announcements(100)[0].id
    useCommunity.getState().toggleAnnouncementPin(100, second)
    expect(announcements(100).filter(a => a.pinned)).toHaveLength(1)
    expect(announcements(100)[0].pinned).toBe(true)
    expect(conv(100)?.announcement).toBe('第二条')
  })

  it('删除置顶的那条后，会话顶部换成下一条', () => {
    const first = announcements(100)[0]
    useCommunity.getState().removeAnnouncement(100, first.id)
    expect(announcements(100).some(a => a.id === first.id)).toBe(false)
    expect(conv(100)?.announcement).toBe(announcements(100)[0]?.text ?? '')
  })

  it('编辑公告：只改那条的文案', () => {
    const first = announcements(100)[0]
    useCommunity.getState().updateAnnouncement(100, first.id, '改过的公告')
    expect(announcements(100)[0].text).toBe('改过的公告')
    expect(conv(100)?.announcement).toBe('改过的公告')
  })

  it('已读回执：把该成员从 unread 名单里去掉，别人不受影响', () => {
    useCommunity.getState().addAnnouncement(100, '需要回执的公告')
    const fresh = announcements(100)[0]
    expect(fresh.unread).toContain('g1')

    useCommunity.getState().markAnnouncementRead(100, fresh.id, 'g2')
    expect(announcements(100)[0].unread).not.toContain('g2')
    expect(announcements(100)[0].unread).toContain('g1')
  })

  it('旧接口 publishAnnouncement：写 announceUnread/announceAt 并落系统消息', () => {
    useCommunity.getState().publishAnnouncement(100, '单条公告', ['g1', 'g3'])
    expect(conv(100)?.announcement).toBe('单条公告')
    const settings = useCommunity.getState().groupSettings[100]
    expect(settings.announceUnread).toEqual(['g1', 'g3'])
    expect(settings.announceAt).toBeGreaterThan(0)
    expect(lastSystem(100)).toBe('群公告已更新')
  })

  it('markAnnounceRead（旧接口）：只从名单里移除指定成员', () => {
    useCommunity.getState().publishAnnouncement(100, 'x', ['g1', 'g3'])
    useCommunity.getState().markAnnounceRead(100, 'g1')
    expect(useCommunity.getState().groupSettings[100].announceUnread).toEqual(['g3'])
  })

  it('会话顶部那条：置顶优先，没有置顶就用第一条', () => {
    useCommunity.getState().setAnnouncement(100, '直接改会话顶部')
    expect(conv(100)?.announcement).toBe('直接改会话顶部')
  })
})

describe('成员与权限', () => {
  it('邀请成员：memberIds 增加并落系统消息', () => {
    useCommunity.getState().addMember(100, 'g9')
    expect(conv(100)?.memberIds).toContain('g9')
    expect(lastSystem(100)).toContain('加入了群聊')
  })

  it('重复邀请同一成员不会加两次', () => {
    useCommunity.getState().addMember(100, 'g1')
    expect(conv(100)?.memberIds?.filter(id => id === 'g1')).toHaveLength(1)
  })

  it('移出成员：同时从管理员列表里剔除', () => {
    useCommunity.getState().toggleAdmin(100, 'g2')
    expect(useCommunity.getState().groupAdmins[100]).toContain('g2')

    useCommunity.getState().removeMember(100, 'g2')
    expect(conv(100)?.memberIds).not.toContain('g2')
    expect(useCommunity.getState().groupAdmins[100]).not.toContain('g2')
    expect(lastSystem(100)).toContain('被移出群聊')
  })

  it('设为管理员是 toggle 语义', () => {
    useCommunity.getState().toggleAdmin(100, 'g2')
    expect(useCommunity.getState().groupAdmins[100]).toContain('g2')
    useCommunity.getState().toggleAdmin(100, 'g2')
    expect(useCommunity.getState().groupAdmins[100]).not.toContain('g2')
  })

  it('转让群主：群主换人，新群主不再留在管理员列表', () => {
    useCommunity.getState().toggleAdmin(100, 'g2')
    useCommunity.getState().transferOwner(100, 'g2')
    expect(useCommunity.getState().groupOwner[100]).toBe('g2')
    expect(useCommunity.getState().groupAdmins[100]).not.toContain('g2')
    expect(lastSystem(100)).toContain('成为新群主')
  })

  it('退群 / 重新入群：leftGroups 增删 + 各自落系统消息', () => {
    useCommunity.getState().leaveGroup(100)
    expect(useCommunity.getState().leftGroups).toContain(100)
    expect(conv(100)?.unread).toBe(0)
    expect(lastSystem(100)).toContain('退出了群聊')

    useCommunity.getState().rejoinGroup(100)
    expect(useCommunity.getState().leftGroups).not.toContain(100)
    expect(lastSystem(100)).toContain('加入了群聊')
  })

  it('改群名：会话名更新 + 落系统消息', () => {
    useCommunity.getState().renameGroup(100, '新群名')
    expect(conv(100)?.name).toBe('新群名')
    expect(lastSystem(100)).toBe('群名称已改为「新群名」')
  })

  it('我的群昵称：按会话存', () => {
    useCommunity.getState().setGroupNickname(100, '阿宝')
    expect(useCommunity.getState().groupNickname[100]).toBe('阿宝')
  })
})

describe('入群申请', () => {
  it('申请 → 待确认列表里出现，并落系统消息', () => {
    useCommunity.getState().requestJoin(100, 'g9')
    expect(useCommunity.getState().joinRequests[100]).toEqual(['g9'])
    expect(lastSystem(100)).toContain('等待群主确认')
  })

  it('同意：从待确认移除并真的进群', () => {
    useCommunity.getState().requestJoin(100, 'g9')
    useCommunity.getState().approveJoin(100, 'g9')
    expect(useCommunity.getState().joinRequests[100]).not.toContain('g9')
    expect(conv(100)?.memberIds).toContain('g9')
  })

  it('拒绝：从待确认移除，但不进群', () => {
    useCommunity.getState().requestJoin(100, 'g9')
    useCommunity.getState().declineJoin(100, 'g9')
    expect(useCommunity.getState().joinRequests[100]).not.toContain('g9')
    expect(conv(100)?.memberIds).not.toContain('g9')
    expect(lastSystem(100)).toContain('已被拒绝')
  })
})

describe('群设置', () => {
  it('patch 只改传进来的字段，其余字段保留默认值', () => {
    useCommunity.getState().updateGroupSettings(100, { background: 'night' })
    const settings = useCommunity.getState().groupSettings[100]
    expect(settings.background).toBe('night')
    expect(settings.watchers).toEqual([])
    expect(settings.inviteConfirm).toBe(false)
  })

  it('连续 patch 会累积，不会被第二次覆盖掉', () => {
    useCommunity.getState().updateGroupSettings(100, { background: 'night' })
    useCommunity.getState().updateGroupSettings(100, { inviteConfirm: true })
    const settings = useCommunity.getState().groupSettings[100]
    expect(settings).toMatchObject({ background: 'night', inviteConfirm: true })
  })

  it('保存到通讯录是 toggle 语义', () => {
    useCommunity.getState().toggleSavedGroup(100)
    expect(useCommunity.getState().savedGroups).toContain(100)
    useCommunity.getState().toggleSavedGroup(100)
    expect(useCommunity.getState().savedGroups).not.toContain(100)
  })
})
