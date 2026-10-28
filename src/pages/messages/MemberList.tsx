// 「群成员 + 邀请成员」：成员列表（角色标记、管理员操作菜单、搜索）+ 邀请弹层。
//
// 从 GroupPanel.tsx 拆出的第三块。成员资料卡（`cardFor` 那个 Overlay）仍留在父组件里，
// 所以"点某个成员"是通过 `onOpenCard` 回调出去的 —— 子组件不碰父组件的 state。
// 数据一律自己 `useCommunity` 取（和 Composer / HistorySearchPanel 一致）。

import { useState } from 'react'
import { DEFAULT_GROUP_SETTINGS, useCommunity } from '../../communityStore'
import { useProfile } from '../../profileStore'
import type { Conversation } from '../../community/data'
import { Avatar, MoreIcon, panelCard as card, panelLabel as label, stroke } from './parts'

export default function MemberList({
  conv,
  ownerId,
  admins,
  iAmOwner,
  iAmAdmin,
  menuFor,
  onMenuChange,
  onOpenCard,
  notify,
}: {
  conv: Conversation
  /** 群主 id（父组件算好的，含"没设过就取第一个成员"的兜底） */
  ownerId: string
  admins: string[]
  /** 当前用户是不是群主 / 管理员（受"以成员身份预览"开关影响，所以由父组件传） */
  iAmOwner: boolean
  iAmAdmin: boolean
  /** 展开的是哪个成员的操作菜单（父组件的成员资料卡里也有个「···」要打开它，所以由父组件持有） */
  menuFor: string | null
  onMenuChange: (id: string | null) => void
  /** 点某个成员 → 父组件打开资料卡 */
  onOpenCard: (id: string) => void
  notify: (m: string) => void
}) {
  const groupMembers = useCommunity(s => s.groupMembers)
  const addMember = useCommunity(s => s.addMember)
  const removeMember = useCommunity(s => s.removeMember)
  const toggleAdmin = useCommunity(s => s.toggleAdmin)
  const transferOwner = useCommunity(s => s.transferOwner)
  const myNickname = useCommunity(s => s.groupNickname[conv.id] ?? '')
  const settings = useCommunity(s => s.groupSettings[conv.id]) ?? DEFAULT_GROUP_SETTINGS
  // ⚠️ 别把 `?? []` 写进 selector：每次都会返回新数组 → zustand 认为 state 变了 → 无限重渲染
  // （React 报的 "Maximum update depth exceeded"；E2E 的「群设置面板打开」那条当场抓住过）
  const joinRequestsAll = useCommunity(s => s.joinRequests)
  const joinRequests = joinRequestsAll[conv.id] ?? []
  const requestJoin = useCommunity(s => s.requestJoin)
  const approveJoin = useCommunity(s => s.approveJoin)
  const declineJoin = useCommunity(s => s.declineJoin)
  const myName = useProfile(s => s.profile.name)
  const myAvatar = useProfile(s => s.profile.avatarUrl)

  const members = conv.memberIds ?? []
  const inviteCandidates = groupMembers.filter(m => !members.includes(m.id))

  const [memberQuery, setMemberQuery] = useState('')
  const [inviteOpen, setInviteOpen] = useState(false)

  return (
    <>
      {/* 群成员 */}
      <div style={card}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
          <span style={{ ...label, flex: 1, marginBottom: 0 }}>群成员 · {members.length + 1}</span>
        </div>
        <input
          value={memberQuery}
          onChange={e => setMemberQuery(e.target.value)}
          placeholder="搜索群成员"
          style={{
            width: '100%',
            height: 32,
            border: '1px solid #EEEEEE',
            background: 'var(--grey-25)',
            borderRadius: 9,
            padding: '0 11px',
            fontSize: 12.5,
            fontFamily: 'inherit',
            outline: 'none',
            color: 'var(--grey-900)',
            marginBottom: 8,
          }}
        />

        {/* 我 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '7px 0' }}>
          <Avatar avatar={myAvatar} size={36} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 5,
                fontSize: 13,
                fontWeight: 600,
                color: 'var(--ink-strong)',
              }}
            >
              {myNickname || myName}
              <span
                style={{
                  fontSize: 10,
                  color: 'var(--grey-600)',
                  background: '#F4F4F5',
                  borderRadius: 4,
                  padding: '1px 5px',
                  fontWeight: 500,
                }}
              >
                我
              </span>
              {ownerId === 'me' && (
                <span
                  style={{
                    fontSize: 10,
                    color: 'var(--warning)',
                    background: '#FFF3D6',
                    borderRadius: 4,
                    padding: '1px 5px',
                    fontWeight: 600,
                  }}
                >
                  群主
                </span>
              )}
              {ownerId !== 'me' && admins.includes('me') && (
                <span
                  style={{
                    fontSize: 10,
                    color: 'var(--warning)',
                    background: '#FFF3D6',
                    borderRadius: 4,
                    padding: '1px 5px',
                    fontWeight: 600,
                  }}
                >
                  管理员
                </span>
              )}
            </div>
            <div style={{ fontSize: 11, color: 'var(--grey-400)' }}>群聊昵称可修改</div>
          </div>
        </div>

        {members
          .filter(mid => {
            const mm = groupMembers.find(x => x.id === mid)
            const q = memberQuery.trim()
            return !q || (mm?.name ?? '').includes(q)
          })
          .map(mid => {
            const m = groupMembers.find(x => x.id === mid)
            if (!m) return null
            const isOwner = mid === ownerId
            const isAdmin = admins.includes(mid)
            return (
              <div
                key={mid}
                style={{
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '7px 0',
                }}
              >
                <div
                  onClick={() => onOpenCard(mid)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    flex: 1,
                    minWidth: 0,
                    cursor: 'pointer',
                  }}
                >
                  <Avatar avatar={m.avatar} size={36} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 5,
                        fontSize: 13,
                        fontWeight: 600,
                        color: 'var(--ink-strong)',
                      }}
                    >
                      {m.name}
                      {isOwner && (
                        <span
                          style={{
                            fontSize: 10,
                            color: 'var(--warning)',
                            background: '#FFF3D6',
                            borderRadius: 4,
                            padding: '1px 5px',
                            fontWeight: 600,
                          }}
                        >
                          群主
                        </span>
                      )}
                      {!isOwner && isAdmin && (
                        <span
                          style={{
                            fontSize: 10,
                            color: 'var(--warning)',
                            background: '#FFF3D6',
                            borderRadius: 4,
                            padding: '1px 5px',
                            fontWeight: 600,
                          }}
                        >
                          管理员
                        </span>
                      )}
                    </div>
                    <div
                      style={{
                        fontSize: 11,
                        color: 'var(--grey-400)',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {m.bio || m.school}
                    </div>
                  </div>
                </div>
                {iAmAdmin && !isOwner && (
                  <button
                    onClick={() => onMenuChange(menuFor === mid ? null : mid)}
                    aria-label="成员操作"
                    style={{
                      width: 26,
                      height: 26,
                      borderRadius: '50%',
                      border: 'none',
                      background: menuFor === mid ? '#F0F0F1' : 'none',
                      color: 'var(--text-subtle)',
                      cursor: 'pointer',
                    }}
                  >
                    <MoreIcon size={16} />
                  </button>
                )}
                {menuFor === mid && (
                  <div
                    style={{
                      position: 'absolute',
                      right: 0,
                      top: 44,
                      width: 148,
                      background: 'var(--surface)',
                      border: '1px solid #EEEEEE',
                      borderRadius: 12,
                      boxShadow: '0 14px 36px -14px rgba(0,0,0,0.3)',
                      padding: 6,
                      zIndex: 30,
                    }}
                  >
                    <button
                      onClick={() => {
                        toggleAdmin(conv.id, mid)
                        onMenuChange(null)
                        notify(isAdmin ? '已取消管理员' : '已设为管理员')
                      }}
                      style={{
                        width: '100%',
                        textAlign: 'left',
                        padding: '8px 10px',
                        border: 'none',
                        background: 'none',
                        borderRadius: 8,
                        cursor: 'pointer',
                        fontSize: 12.5,
                        fontFamily: 'inherit',
                        color: 'var(--ink-soft)',
                      }}
                    >
                      {isAdmin ? '取消管理员' : '设为管理员'}
                    </button>
                    <button
                      onClick={() => {
                        removeMember(conv.id, mid)
                        onMenuChange(null)
                        notify('已移出群聊')
                      }}
                      style={{
                        width: '100%',
                        textAlign: 'left',
                        padding: '8px 10px',
                        border: 'none',
                        background: 'none',
                        borderRadius: 8,
                        cursor: 'pointer',
                        fontSize: 12.5,
                        fontFamily: 'inherit',
                        color: 'var(--brand)',
                      }}
                    >
                      移出群聊
                    </button>
                    {iAmOwner && (
                      <button
                        onClick={() => {
                          transferOwner(conv.id, mid)
                          onMenuChange(null)
                          notify(`已把群主转让给 ${m.name}`)
                        }}
                        style={{
                          width: '100%',
                          textAlign: 'left',
                          padding: '8px 10px',
                          border: 'none',
                          background: 'none',
                          borderRadius: 8,
                          cursor: 'pointer',
                          fontSize: 12.5,
                          fontFamily: 'inherit',
                          color: 'var(--ink-soft)',
                        }}
                      >
                        转让群主
                      </button>
                    )}
                  </div>
                )}
              </div>
            )
          })}

        {/* 邀请成员：虚线头像 + 一个框，整块可点 */}
        <div
          onClick={() => setInviteOpen(o => !o)}
          title="邀请成员"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 11,
            marginTop: 10,
            padding: '9px 11px',
            borderRadius: 12,
            border: '1px solid var(--grey-100)',
            background: inviteOpen ? 'var(--grey-25)' : 'var(--surface)',
            cursor: 'pointer',
          }}
        >
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 10,
              border: '1.5px dashed #D8D8D8',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#BFBFBF',
              flexShrink: 0,
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" {...stroke}>
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13, color: 'var(--ink-soft)' }}>邀请成员</div>
            <div style={{ fontSize: 11, color: 'var(--grey-400)', marginTop: 2 }}>
              {inviteOpen ? '收起邀请列表' : '邀请联系人加入群聊'}
            </div>
          </div>
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            {...stroke}
            style={{
              color: 'var(--grey-300)',
              flexShrink: 0,
              transform: inviteOpen ? 'rotate(180deg)' : 'none',
              transition: 'transform 0.2s',
            }}
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </div>

        {inviteOpen && (
          <div style={{ marginTop: 8, borderTop: '1px solid #F4F4F4', paddingTop: 8 }}>
            {inviteCandidates.length === 0 && (
              <div style={{ fontSize: 12, color: 'var(--grey-400)', padding: '6px 0' }}>
                没有可邀请的联系人
              </div>
            )}
            {inviteCandidates.map(m => (
              <div
                key={m.id}
                style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 0' }}
              >
                <Avatar avatar={m.avatar} size={30} />
                <span
                  style={{
                    flex: 1,
                    minWidth: 0,
                    fontSize: 12.5,
                    color: 'var(--ink-soft)',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {m.name}
                </span>
                <button
                  onClick={() => {
                    if (settings.inviteConfirm) {
                      requestJoin(conv.id, m.id)
                      notify('已发送入群邀请，等待群主确认')
                    } else {
                      addMember(conv.id, m.id)
                      notify(`已邀请 ${m.name} 加入群聊`)
                    }
                  }}
                  style={{
                    border: '1px solid #FFD3DA',
                    background: '#FFF6F7',
                    color: 'var(--brand)',
                    borderRadius: 999,
                    padding: '4px 12px',
                    fontSize: 12,
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                  }}
                >
                  邀请
                </button>
              </div>
            ))}
          </div>
        )}

        {joinRequests.length > 0 && (
          <div style={{ marginTop: 10, borderTop: '1px solid #F4F4F4', paddingTop: 8 }}>
            <div style={{ fontSize: 11.5, color: 'var(--warning)', marginBottom: 6 }}>
              待确认入群 · {joinRequests.length}
            </div>
            {joinRequests.map(mid => {
              const m = groupMembers.find(x => x.id === mid)
              if (!m) return null
              return (
                <div
                  key={mid}
                  style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 0' }}
                >
                  <Avatar avatar={m.avatar} size={30} />
                  <span
                    style={{
                      flex: 1,
                      minWidth: 0,
                      fontSize: 12.5,
                      color: 'var(--ink-soft)',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {m.name}
                  </span>
                  {iAmAdmin ? (
                    <>
                      <button
                        onClick={() => {
                          declineJoin(conv.id, mid)
                          notify('已拒绝入群申请')
                        }}
                        style={{
                          border: 'none',
                          background: '#F2F2F3',
                          color: 'var(--text-muted)',
                          borderRadius: 999,
                          padding: '4px 11px',
                          fontSize: 12,
                          cursor: 'pointer',
                          fontFamily: 'inherit',
                        }}
                      >
                        拒绝
                      </button>
                      <button
                        onClick={() => {
                          approveJoin(conv.id, mid)
                          notify('已同意入群')
                        }}
                        style={{
                          border: 'none',
                          background: 'var(--brand)',
                          color: 'var(--surface)',
                          borderRadius: 999,
                          padding: '4px 11px',
                          fontSize: 12,
                          cursor: 'pointer',
                          fontFamily: 'inherit',
                        }}
                      >
                        同意
                      </button>
                    </>
                  ) : (
                    <span style={{ fontSize: 11.5, color: 'var(--grey-400)' }}>等待群主确认</span>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </>
  )
}
