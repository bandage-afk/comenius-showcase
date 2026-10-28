// 群设置面板（GroupPanel）：成员 / 管理员 / 群主 / 昵称 / 免打扰 / 群二维码 / 群设置。
// 群公告面板已拆到 ./AnnouncementsPanel.tsx（同一批从 MessagesPage 拆出的子模块）。
// 依赖 ./parts 里的公共件与 UI 基础组件。
import { useMemo, useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import { DEFAULT_GROUP_SETTINGS, useCommunity } from '../../communityStore'
import { useProfile } from '../../profileStore'
import type { Conversation } from '../../community/data'
import Switch from '../../components/ui/Switch'
import GroupQrCard from './GroupQrCard'
import HistorySearchPanel from './HistorySearchPanel'
import MemberList from './MemberList'
import {
  Avatar,
  BACKGROUNDS,
  Overlay,
  panelCard as card,
  panelLabel as label,
  stroke,
} from './parts'

export function GroupPanel({
  conv,
  notify,
  onClose,
  onOpenAnnouncements,
}: {
  conv: Conversation
  notify: (m: string) => void
  onClose: () => void
  onOpenAnnouncements: () => void
}) {
  const myName = useProfile(s => s.profile.name)
  const groupMembers = useCommunity(s => s.groupMembers)
  const groupAdmins = useCommunity(s => s.groupAdmins)
  const myNickname = useCommunity(s => s.groupNickname[conv.id] ?? '')
  const isMuted = useCommunity(s => s.muted.includes(conv.id))
  const isPinned = useCommunity(s => s.pinned.includes(conv.id))
  const setGroupNickname = useCommunity(s => s.setGroupNickname)
  const leaveGroup = useCommunity(s => s.leaveGroup)
  const toggleMute = useCommunity(s => s.toggleMute)
  const togglePin = useCommunity(s => s.togglePin)

  const [nickDraft, setNickDraft] = useState(myNickname)
  // 成员操作菜单由 MemberList 渲染，但成员资料卡里的「···」也要能打开它 → 状态留在父组件
  const [menuFor, setMenuFor] = useState<string | null>(null)
  const [confirmLeave, setConfirmLeave] = useState(false)
  const [nameDraft, setNameDraft] = useState(conv.name)
  const [editName, setEditName] = useState(false)
  const [showQR, setShowQR] = useState(false)
  const [watchOpen, setWatchOpen] = useState(false)
  const [historyOpen, setHistoryOpen] = useState(false)
  const [bgOpen, setBgOpen] = useState(false)
  const [cardFor, setCardFor] = useState<string | null>(null)
  const [memberView, setMemberView] = useState(false)
  const [confirmDissolve, setConfirmDissolve] = useState(false)

  const settings = useCommunity(s => s.groupSettings[conv.id]) ?? DEFAULT_GROUP_SETTINGS
  const savedGroups = useCommunity(s => s.savedGroups)
  const convMessages = useCommunity(s => s.messages[conv.id])
  // memo 化，避免 ?? [] 每次渲染产生新数组（会让下游 useMemo 失效）
  const thread = useMemo(() => convMessages ?? [], [convMessages])
  const renameGroup = useCommunity(s => s.renameGroup)
  const updateGroupSettings = useCommunity(s => s.updateGroupSettings)
  const toggleSavedGroup = useCommunity(s => s.toggleSavedGroup)
  const clearThread = useCommunity(s => s.clearThread)

  const members = conv.memberIds ?? []
  const groupOwner = useCommunity(s => s.groupOwner)
  const annsAll = useCommunity(s => s.announcements)
  const anns = annsAll[conv.id] ?? []
  const ownerId = groupOwner[conv.id] ?? members[0] ?? 'me'
  const admins = groupAdmins[conv.id] ?? []
  const iAmOwner = ownerId === 'me' && !memberView
  const iAmAdmin = (ownerId === 'me' || admins.includes('me')) && !memberView

  const jumpToMessage = (index: number) => {
    setHistoryOpen(false)
    window.setTimeout(() => {
      const el = document.querySelector(`[data-msg-index="${index}"]`) as HTMLElement | null
      if (!el) return
      el.scrollIntoView({ behavior: 'smooth', block: 'center' })
      el.style.transition = 'box-shadow 0.3s'
      el.style.borderRadius = '12px'
      el.style.boxShadow = '0 0 0 3px #FFD3DA'
      window.setTimeout(() => {
        el.style.boxShadow = 'none'
      }, 1400)
    }, 140)
  }

  return (
    <div style={{ width: 320, height: '100%', overflowY: 'auto', padding: '18px 16px 28px' }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
        <span style={{ flex: 1, fontSize: 15, fontWeight: 700, color: 'var(--ink-strong)' }}>
          群设置
        </span>
        <button
          onClick={onClose}
          aria-label="关闭"
          style={{
            width: 28,
            height: 28,
            borderRadius: '50%',
            border: 'none',
            background: 'var(--grey-15)',
            color: '#777',
            cursor: 'pointer',
            fontSize: 15,
          }}
        >
          ✕
        </button>
      </div>

      {/* 群资料：群名 / 群二维码 */}
      <div style={card}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Avatar avatar={conv.avatar} size={52} square />
          <div style={{ flex: 1, minWidth: 0 }}>
            {editName ? (
              <div style={{ display: 'flex', gap: 6 }}>
                <input
                  value={nameDraft}
                  onChange={e => setNameDraft(e.target.value)}
                  autoFocus
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      const n = nameDraft.trim()
                      if (n) {
                        renameGroup(conv.id, n)
                        notify('群名称已更新')
                      }
                      setEditName(false)
                    }
                  }}
                  style={{
                    flex: 1,
                    minWidth: 0,
                    height: 30,
                    border: '1px solid #EAEAEA',
                    borderRadius: 8,
                    padding: '0 9px',
                    fontSize: 13,
                    fontFamily: 'inherit',
                    outline: 'none',
                  }}
                />
                <button
                  onClick={() => {
                    const n = nameDraft.trim()
                    if (n) {
                      renameGroup(conv.id, n)
                      notify('群名称已更新')
                    }
                    setEditName(false)
                  }}
                  style={{
                    border: 'none',
                    background: 'var(--brand)',
                    color: 'var(--surface)',
                    borderRadius: 8,
                    padding: '0 10px',
                    fontSize: 12.5,
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                  }}
                >
                  保存
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span
                  style={{
                    fontSize: 14.5,
                    fontWeight: 700,
                    color: 'var(--ink-strong)',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {conv.name}
                </span>
                {iAmAdmin && (
                  <button
                    onClick={() => {
                      setNameDraft(conv.name)
                      setEditName(true)
                    }}
                    title="修改群名称"
                    aria-label="修改群名称"
                    style={{
                      width: 24,
                      height: 24,
                      flexShrink: 0,
                      borderRadius: 7,
                      border: '1px solid #EAEAEA',
                      background: 'var(--grey-25)',
                      color: 'var(--grey-600)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: 0,
                    }}
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" {...stroke}>
                      <path d="M4 20h4L19 9a2.6 2.6 0 0 0-3.7-3.7L4 16.5V20z" />
                      <path d="M14.5 6.5l3.6 3.6" />
                    </svg>
                  </button>
                )}
              </div>
            )}
            <div style={{ fontSize: 11.5, color: 'var(--grey-400)', marginTop: 3 }}>
              {members.length + 1} 位成员 · 群主{' '}
              {iAmOwner ? '我' : (groupMembers.find(m => m.id === ownerId)?.name ?? '—')}
            </div>
          </div>
        </div>
        <button
          onClick={() => setShowQR(true)}
          style={{
            marginTop: 12,
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            border: '1px solid var(--grey-75)',
            background: 'var(--grey-25)',
            borderRadius: 10,
            padding: '9px 12px',
            cursor: 'pointer',
            fontFamily: 'inherit',
            fontSize: 12.5,
            color: 'var(--grey-800)',
          }}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" {...stroke}>
            <rect x="3" y="3" width="7" height="7" rx="1" />
            <rect x="14" y="3" width="7" height="7" rx="1" />
            <rect x="3" y="14" width="7" height="7" rx="1" />
            <path d="M14 14h3v3h-3zM19 19h2v2h-2z" />
          </svg>
          群二维码
          <span style={{ flex: 1 }} />
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            {...stroke}
            style={{ color: 'var(--grey-300)' }}
          >
            <polyline points="9 6 15 12 9 18" />
          </svg>
        </button>
      </div>

      {/* 群公告：多条公告，置顶的显示在聊天区顶部 */}
      <div style={card}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
          <span style={{ ...label, flex: 1, marginBottom: 0 }}>群公告 · {anns.length}</span>
          <button
            onClick={onOpenAnnouncements}
            style={{
              border: 'none',
              background: 'none',
              color: 'var(--brand)',
              fontSize: 12,
              cursor: 'pointer',
              fontFamily: 'inherit',
            }}
          >
            查看全部
          </button>
        </div>
        {anns.length === 0 ? (
          <button
            onClick={onOpenAnnouncements}
            style={{
              width: '100%',
              border: '1px dashed var(--grey-200)',
              background: 'var(--grey-25)',
              borderRadius: 10,
              padding: '10px 0',
              cursor: 'pointer',
              fontFamily: 'inherit',
              fontSize: 12.5,
              color: 'var(--grey-600)',
            }}
          >
            + 发布群公告
          </button>
        ) : (
          <div onClick={onOpenAnnouncements} style={{ cursor: 'pointer' }}>
            <div
              style={{
                fontSize: 12.5,
                color: '#5A5A5A',
                lineHeight: 1.7,
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical' as const,
                overflow: 'hidden',
              }}
            >
              {(anns.find(a => a.pinned) ?? anns[0]).text}
            </div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                marginTop: 7,
                fontSize: 11,
                color: 'var(--grey-400)',
              }}
            >
              <span>
                {anns.find(a => a.pinned)?.pinned ? '置顶公告' : '最新公告'} · 共 {anns.length} 条
              </span>
              <span style={{ flex: 1 }} />
              <span style={{ color: 'var(--grey-300)' }}>›</span>
            </div>
          </div>
        )}
      </div>

      {/* 群成员 + 邀请成员：见 messages/MemberList.tsx */}
      <MemberList
        conv={conv}
        ownerId={ownerId}
        admins={admins}
        iAmOwner={iAmOwner}
        iAmAdmin={iAmAdmin}
        menuFor={menuFor}
        onMenuChange={setMenuFor}
        onOpenCard={setCardFor}
        notify={notify}
      />

      {/* 昵称 */}
      <div style={card}>
        <div style={label}>我在本群的昵称</div>
        <div style={{ display: 'flex', gap: 8 }}>
          <input
            value={nickDraft}
            onChange={e => setNickDraft(e.target.value)}
            placeholder={myName}
            style={{
              flex: 1,
              minWidth: 0,
              height: 34,
              border: '1px solid #EAEAEA',
              borderRadius: 9,
              padding: '0 11px',
              fontSize: 12.5,
              fontFamily: 'inherit',
              outline: 'none',
              color: 'var(--grey-900)',
            }}
          />
          <button
            onClick={() => {
              setGroupNickname(conv.id, nickDraft.trim())
              notify('昵称已保存')
            }}
            style={{
              border: 'none',
              background: '#F2F2F3',
              borderRadius: 9,
              padding: '0 14px',
              fontSize: 12.5,
              color: '#444',
              cursor: 'pointer',
              fontFamily: 'inherit',
            }}
          >
            保存
          </button>
        </div>
      </div>

      {/* 通知与收藏 */}
      <div style={card}>
        <div style={{ display: 'flex', alignItems: 'center', padding: '7px 0' }}>
          <span style={{ flex: 1, fontSize: 13, color: 'var(--ink-soft)' }}>消息免打扰</span>
          <Switch
            on={isMuted}
            onToggle={() => {
              toggleMute(conv.id)
              notify(isMuted ? '已取消免打扰' : '已开启免打扰')
            }}
          />
        </div>
        {isMuted && (
          <button
            onClick={() => setWatchOpen(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              width: '100%',
              border: 'none',
              background: 'var(--grey-25)',
              borderRadius: 9,
              padding: '9px 11px',
              cursor: 'pointer',
              fontFamily: 'inherit',
              fontSize: 12.5,
              color: 'var(--grey-800)',
              marginBottom: 6,
            }}
          >
            关注的群成员
            <span style={{ flex: 1 }} />
            <span style={{ color: 'var(--grey-500)', fontSize: 12 }}>
              {settings.watchers.length ? `${settings.watchers.length} 人` : '未设置'}
            </span>
            <span style={{ color: 'var(--grey-300)' }}>›</span>
          </button>
        )}
        <div style={{ display: 'flex', alignItems: 'center', padding: '7px 0' }}>
          <span style={{ flex: 1, fontSize: 13, color: 'var(--ink-soft)' }}>置顶聊天</span>
          <Switch
            on={isPinned}
            onToggle={() => {
              togglePin(conv.id)
              notify(isPinned ? '已取消置顶' : '已置顶该群聊')
            }}
          />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', padding: '7px 0' }}>
          <span style={{ flex: 1, fontSize: 13, color: 'var(--ink-soft)' }}>保存到通讯录</span>
          <Switch
            on={savedGroups.includes(conv.id)}
            onToggle={() => {
              toggleSavedGroup(conv.id)
              notify(savedGroups.includes(conv.id) ? '已从通讯录移除' : '已保存到通讯录')
            }}
          />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', padding: '7px 0' }}>
          <span style={{ flex: 1, fontSize: 13, color: 'var(--ink-soft)' }}>群聊邀请确认</span>
          {iAmAdmin ? (
            <Switch
              on={settings.inviteConfirm}
              onToggle={() => {
                updateGroupSettings(conv.id, { inviteConfirm: !settings.inviteConfirm })
                notify(settings.inviteConfirm ? '已关闭邀请确认' : '已开启邀请确认')
              }}
            />
          ) : (
            <span style={{ fontSize: 11.5, color: '#C0C0C0' }}>仅群主/管理员可设置</span>
          )}
        </div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            padding: '7px 0',
            borderTop: '1px solid var(--surface-sunken)',
            marginTop: 4,
          }}
        >
          <span style={{ flex: 1, fontSize: 13, color: 'var(--ink-soft)' }}>
            以普通成员视角预览
          </span>
          <Switch on={memberView} onToggle={() => setMemberView(v => !v)} />
        </div>
      </div>

      {/* 聊天背景 */}
      <div style={card}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 10 }}>
          <span style={{ ...label, flex: 1, marginBottom: 0 }}>设置当前聊天背景</span>
          <button
            onClick={() => setBgOpen(o => !o)}
            style={{
              border: 'none',
              background: 'none',
              color: 'var(--brand)',
              fontSize: 12,
              cursor: 'pointer',
              fontFamily: 'inherit',
            }}
          >
            {bgOpen ? '收起' : '更换'}
          </button>
        </div>
        {bgOpen && (
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {BACKGROUNDS.map(b => (
              <button
                key={b.key}
                onClick={() => {
                  updateGroupSettings(conv.id, { background: b.key })
                  notify(`已切换背景：${b.label}`)
                }}
                title={b.label}
                style={{
                  width: 52,
                  height: 40,
                  borderRadius: 9,
                  cursor: 'pointer',
                  background: b.preview,
                  border: `2px solid ${settings.background === b.key ? 'var(--brand)' : 'var(--grey-100)'}`,
                }}
              />
            ))}
          </div>
        )}
        {!bgOpen && (
          <div style={{ fontSize: 12, color: 'var(--grey-500)' }}>
            当前：{BACKGROUNDS.find(b => b.key === settings.background)?.label ?? '默认'}
          </div>
        )}
      </div>

      {/* 聊天记录与群管理 */}
      <div style={card}>
        <button
          onClick={() => setHistoryOpen(true)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            width: '100%',
            border: 'none',
            background: 'none',
            padding: '9px 0',
            cursor: 'pointer',
            fontFamily: 'inherit',
            fontSize: 13,
            color: 'var(--ink-soft)',
          }}
        >
          查找聊天记录
          <span style={{ flex: 1 }} />
          <span style={{ color: 'var(--grey-300)' }}>›</span>
        </button>
        <button
          onClick={() => {
            clearThread(conv.id)
            notify('聊天记录已清空')
          }}
          style={{
            display: 'flex',
            alignItems: 'center',
            width: '100%',
            border: 'none',
            background: 'none',
            padding: '9px 0',
            cursor: 'pointer',
            fontFamily: 'inherit',
            fontSize: 13,
            color: 'var(--ink-soft)',
          }}
        >
          清空聊天记录
        </button>
        <button
          onClick={() => notify('投诉已提交，我们会尽快处理')}
          style={{
            display: 'flex',
            alignItems: 'center',
            width: '100%',
            border: 'none',
            background: 'none',
            padding: '9px 0',
            cursor: 'pointer',
            fontFamily: 'inherit',
            fontSize: 13,
            color: 'var(--ink-soft)',
          }}
        >
          投诉
        </button>
      </div>

      {/* 退出 / 解散 */}
      <div style={card}>
        {confirmLeave ? (
          <div>
            <div style={{ fontSize: 12.5, color: '#5A5A5A', marginBottom: 10 }}>
              退出后将不再接收该群消息，确定退出「{conv.name}」？
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                onClick={() => setConfirmLeave(false)}
                style={{
                  flex: 1,
                  border: 'none',
                  background: '#F2F2F3',
                  borderRadius: 9,
                  padding: '8px 0',
                  fontSize: 12.5,
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  color: 'var(--text-muted)',
                }}
              >
                再想想
              </button>
              <button
                onClick={() => {
                  leaveGroup(conv.id)
                  setConfirmLeave(false)
                  notify('已退出群聊')
                }}
                style={{
                  flex: 1,
                  border: 'none',
                  background: 'var(--brand)',
                  borderRadius: 9,
                  padding: '8px 0',
                  fontSize: 12.5,
                  color: 'var(--surface)',
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                }}
              >
                确定退出
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setConfirmLeave(true)}
            style={{
              width: '100%',
              border: 'none',
              background: 'none',
              color: 'var(--brand)',
              fontSize: 13,
              padding: '6px 0',
              cursor: 'pointer',
              fontFamily: 'inherit',
              textAlign: 'left',
            }}
          >
            退出群聊
          </button>
        )}

        <div style={{ borderTop: '1px solid var(--surface-sunken)', marginTop: 8, paddingTop: 8 }}>
          {iAmOwner ? (
            confirmDissolve ? (
              <div>
                <div style={{ fontSize: 12.5, color: '#B23A46', marginBottom: 10 }}>
                  解散后所有成员都会被移出，聊天记录不可恢复。确定解散「{conv.name}」？
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    onClick={() => setConfirmDissolve(false)}
                    style={{
                      flex: 1,
                      border: 'none',
                      background: '#F2F2F3',
                      borderRadius: 9,
                      padding: '8px 0',
                      fontSize: 12.5,
                      cursor: 'pointer',
                      fontFamily: 'inherit',
                      color: 'var(--text-muted)',
                    }}
                  >
                    再想想
                  </button>
                  <button
                    onClick={() => {
                      clearThread(conv.id)
                      setConfirmDissolve(false)
                      leaveGroup(conv.id)
                      notify('群聊已解散')
                    }}
                    style={{
                      flex: 1,
                      border: 'none',
                      background: 'var(--brand)',
                      borderRadius: 9,
                      padding: '8px 0',
                      fontSize: 12.5,
                      color: 'var(--surface)',
                      cursor: 'pointer',
                      fontFamily: 'inherit',
                    }}
                  >
                    确定解散
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setConfirmDissolve(true)}
                style={{
                  width: '100%',
                  border: 'none',
                  background: 'none',
                  color: '#B23A46',
                  fontSize: 13,
                  padding: '6px 0',
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  textAlign: 'left',
                }}
              >
                解散群聊
              </button>
            )
          ) : (
            <div style={{ fontSize: 11.5, color: '#C0C0C0' }}>
              群主为 {groupMembers.find(m => m.id === ownerId)?.name ?? '我'}，解散群聊仅群主可操作
            </div>
          )}
        </div>
      </div>

      {/* 群二维码 */}
      <GroupQrCard conv={conv} open={showQR} onClose={() => setShowQR(false)} />

      {/* 关注的群成员 */}
      <AnimatePresence>
        {watchOpen && (
          <Overlay onClose={() => setWatchOpen(false)}>
            <div
              style={{
                fontSize: 14,
                fontWeight: 700,
                color: 'var(--ink-strong)',
                marginBottom: 4,
              }}
            >
              关注的群成员
            </div>
            <div style={{ fontSize: 11.5, color: 'var(--grey-500)', marginBottom: 12 }}>
              开启免打扰后，只提醒选中成员的消息
            </div>
            {members.map(mid => {
              const m = groupMembers.find(x => x.id === mid)
              if (!m) return null
              const on = settings.watchers.includes(mid)
              return (
                <button
                  key={mid}
                  onClick={() =>
                    updateGroupSettings(conv.id, {
                      watchers: on
                        ? settings.watchers.filter(x => x !== mid)
                        : [...settings.watchers, mid],
                    })
                  }
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    width: '100%',
                    border: 'none',
                    background: 'none',
                    padding: '8px 0',
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                  }}
                >
                  <Avatar avatar={m.avatar} size={32} />
                  <span
                    style={{
                      flex: 1,
                      minWidth: 0,
                      textAlign: 'left',
                      fontSize: 13,
                      color: 'var(--ink-soft)',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {m.name}
                  </span>
                  <span
                    style={{
                      width: 18,
                      height: 18,
                      borderRadius: 5,
                      border: `1.5px solid ${on ? 'var(--brand)' : '#DCDCDC'}`,
                      background: on ? 'var(--brand)' : 'var(--surface)',
                      color: 'var(--surface)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 11,
                    }}
                  >
                    {on ? '✓' : ''}
                  </span>
                </button>
              )
            })}
          </Overlay>
        )}
      </AnimatePresence>

      {/* 查找聊天记录 */}
      <AnimatePresence>
        {historyOpen && (
          <Overlay width={440} onClose={() => setHistoryOpen(false)}>
            <HistorySearchPanel
              thread={thread}
              onClose={() => setHistoryOpen(false)}
              onJump={jumpToMessage}
            />
          </Overlay>
        )}
      </AnimatePresence>

      {/* 成员名片 */}
      <AnimatePresence>
        {cardFor &&
          (() => {
            const m = groupMembers.find(x => x.id === cardFor)
            if (!m) return null
            const isO = cardFor === ownerId
            const isA = admins.includes(cardFor)
            return (
              <Overlay onClose={() => setCardFor(null)}>
                <div style={{ textAlign: 'center' }}>
                  <Avatar avatar={m.avatar} size={64} />
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 6,
                      marginTop: 10,
                    }}
                  >
                    <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--ink-strong)' }}>
                      {m.name}
                    </span>
                    {isO && (
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
                    {!isO && isA && (
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
                  <div style={{ fontSize: 12.5, color: 'var(--grey-600)', marginTop: 6 }}>
                    {m.bio || '这个人很低调'}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--grey-400)', marginTop: 2 }}>
                    {m.school} · ID {m.comeniusId}
                  </div>
                  <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
                    <button
                      onClick={() => setCardFor(null)}
                      style={{
                        flex: 1,
                        border: 'none',
                        background: '#F2F2F3',
                        borderRadius: 9,
                        padding: '9px 0',
                        fontSize: 13,
                        cursor: 'pointer',
                        fontFamily: 'inherit',
                        color: 'var(--text-muted)',
                      }}
                    >
                      关闭
                    </button>
                    {iAmAdmin && !isO && (
                      <button
                        onClick={() => {
                          setMenuFor(cardFor)
                          setCardFor(null)
                        }}
                        style={{
                          flex: 1,
                          border: 'none',
                          background: '#FFF6F7',
                          color: 'var(--brand)',
                          borderRadius: 9,
                          padding: '9px 0',
                          fontSize: 13,
                          cursor: 'pointer',
                          fontFamily: 'inherit',
                        }}
                      >
                        管理该成员
                      </button>
                    )}
                  </div>
                </div>
              </Overlay>
            )
          })()}
      </AnimatePresence>
    </div>
  )
}
