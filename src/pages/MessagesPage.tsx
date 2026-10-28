import { useEffect, useMemo, useRef, useState } from 'react'

import { AnimatePresence, motion } from 'framer-motion'

import AppShell from '../components/AppShell'

import type { NavProps } from '../App'

import { useCommunity } from '../communityStore'

import { useProfile } from '../profileStore'

import type { Conversation, Message, NoteCard, QuotedRef } from '../community/data'

import { AnnouncementsPanel } from './messages/AnnouncementsPanel'
import { GroupPanel } from './messages/GroupPanel'
import Composer from './messages/Composer'
import { ConvRow, type RowAction } from './messages/ConversationList'

import {
  ArchiveIcon,
  Avatar,
  BellOffIcon,
  BlockIcon,
  EASE,
  EraserIcon,
  FlagIcon,
  NoteBubble,
  NoteIcon,
  SectionLabel,
  TypingBubble,
  UsersIcon,
  VoiceBubble,
  bgStyle,
  dayLabel,
  imgUrl,
  sortPinned,
  stroke,
} from './messages/parts'

/**
 * 消息页 = 私信（一对一 + 群聊）
 *  左栏：搜索 / 未读分区 / 置顶 / 免打扰 / 归档 / 左滑删除 / 右滑置顶 / 长按更多
 *  右栏：群公告 + 未读分隔线 + 分组气泡 + 发送状态 + 笔记卡片 + 语音 + 图片 + 表情
 *
 * 拆分后本文件只留页面编排：图标/小球/气泡等公共件在 ./messages/parts.tsx，
 * 群设置与群公告在 ./messages/GroupPanel.tsx，会话行在 ./messages/ConversationList.tsx，
 * 输入框与三个拾取器在 ./messages/Composer.tsx。
 */

export default function MessagesPage({ navigate, currentPage }: NavProps) {
  const getMember = useCommunity(s => s.getMember)
  const getUser = useCommunity(s => s.getUser)
  const pickReply = useCommunity(s => s.pickReply)
  const conversations = useCommunity(s => s.conversations)
  const messages = useCommunity(s => s.messages)
  const activeConvId = useCommunity(s => s.activeConvId)
  const unreadMark = useCommunity(s => s.unreadMark)
  const pinned = useCommunity(s => s.pinned)
  const muted = useCommunity(s => s.muted)
  const archived = useCommunity(s => s.archived)
  const blocked = useCommunity(s => s.blocked)
  const leftGroups = useCommunity(s => s.leftGroups)
  const rejoinGroup = useCommunity(s => s.rejoinGroup)
  const openConversation = useCommunity(s => s.openConversation)
  const removeConversation = useCommunity(s => s.removeConversation)
  const sendMessage = useCommunity(s => s.sendMessage)
  const sendSticker = useCommunity(s => s.sendSticker)
  const sendImage = useCommunity(s => s.sendImage)
  const sendVoice = useCommunity(s => s.sendVoice)
  const sendNote = useCommunity(s => s.sendNote)
  const recallMessage = useCommunity(s => s.recallMessage)
  const deleteMessage = useCommunity(s => s.deleteMessage)
  const receiveMessage = useCommunity(s => s.receiveMessage)
  const viewUser = useCommunity(s => s.viewUser)
  const markUnread = useCommunity(s => s.markUnread)
  const markRead = useCommunity(s => s.markRead)
  const clearThread = useCommunity(s => s.clearThread)
  const togglePin = useCommunity(s => s.togglePin)
  const toggleMute = useCommunity(s => s.toggleMute)
  const toggleArchive = useCommunity(s => s.toggleArchive)
  const toggleBlock = useCommunity(s => s.toggleBlock)
  const myAvatar = useProfile(s => s.profile.avatarUrl)
  const myProfileName = useProfile(s => s.profile.name)
  const groupSettingsAll = useCommunity(s => s.groupSettings)
  const annsAllMap = useCommunity(s => s.announcements)
  const groupNicknames = useCommunity(s => s.groupNickname)
  const groupOwnerAll = useCommunity(s => s.groupOwner)
  const groupAdminsAll = useCommunity(s => s.groupAdmins)

  const [draft, setDraft] = useState('')
  // 输入框展开状态放页面：消息菜单的「引用」要把它打开（其余浮层在 Composer 内部）
  const [composerOpen, setComposerOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [openRow, setOpenRow] = useState<{ id: number; dir: 'pin' | 'delete' } | null>(null)
  const [sheetConv, setSheetConv] = useState<number | null>(null)
  const [membersOpen, setMembersOpen] = useState(false)
  const [archiveOpen, setArchiveOpen] = useState(false)
  const [typingConv, setTypingConv] = useState<number | null>(null)
  const [showJump, setShowJump] = useState(false)
  const [toast, setToast] = useState('')
  const [announceUnseen, setAnnounceUnseen] = useState<Record<number, boolean>>({})
  const [annsOpen, setAnnsOpen] = useState(false)
  const [msgMenu, setMsgMenu] = useState<{
    index: number
    x: number
    y: number
    own: boolean
  } | null>(null)
  const [quotedMsg, setQuotedMsg] = useState<QuotedRef | null>(null)

  const scrollRef = useRef<HTMLDivElement | null>(null)
  const endRef = useRef<HTMLDivElement | null>(null)
  const pressRef = useRef<{ timer: number; x: number; y: number } | null>(null)

  /** 长按消息：450ms 后在手指位置弹出操作条（微信那套） */
  const cancelPress = () => {
    if (pressRef.current) {
      window.clearTimeout(pressRef.current.timer)
      pressRef.current = null
    }
  }
  const startPress = (e: React.PointerEvent, index: number, own: boolean) => {
    cancelPress()
    const x = e.clientX,
      y = e.clientY
    pressRef.current = {
      timer: window.setTimeout(() => {
        pressRef.current = null
        setMsgMenu({ index, x, y, own })
      }, 450),
      x,
      y,
    }
  }
  const movePress = (e: React.PointerEvent) => {
    const p = pressRef.current
    if (p && (Math.abs(e.clientX - p.x) > 8 || Math.abs(e.clientY - p.y) > 8)) cancelPress()
  }
  const notify = (m: string) => {
    setToast(m)
    window.setTimeout(() => setToast(t => (t === m ? '' : t)), 1900)
  }

  useEffect(() => {
    if (activeConvId == null && conversations.length > 0) openConversation(conversations[0].id)
  }, [activeConvId, conversations, openConversation])

  const activeConv = conversations.find(c => c.id === activeConvId)
  // memo 化：messages[convId] 缺失时 ?? [] 每次渲染都会产生新数组，会让下游 useMemo 失去意义
  const thread: Message[] = useMemo(
    () => (activeConvId != null ? (messages[activeConvId] ?? []) : []),
    [messages, activeConvId],
  )
  const isTyping = typingConv != null && typingConv === activeConvId
  const isGroup = !!activeConv?.isGroup
  const isBlocked = activeConvId != null && blocked.includes(activeConvId)
  const isLeft = activeConvId != null && leftGroups.includes(activeConvId)
  const annsOfActive = activeConvId != null ? (annsAllMap[activeConvId] ?? []) : []

  // 切换会话时重置草稿与浮层；activeConvId 只当「变化触发器」用，不参与计算
  useEffect(() => {
    setComposerOpen(false)
    setMembersOpen(false)
    setDraft('')
  }, [activeConvId])

  const { pinnedList, groupList, directList, archivedList } = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (q) {
      const hit = conversations.filter(
        c => c.name.toLowerCase().includes(q) || (c.last ?? '').toLowerCase().includes(q),
      )
      return {
        pinnedList: [] as Conversation[],
        groupList: [] as Conversation[],
        directList: sortPinned(pinned, hit),
        archivedList: [] as Conversation[],
      }
    }
    const live = conversations.filter(c => !archived.includes(c.id))
    const byUnread = (list: Conversation[]) => [...list].sort((a, b) => b.unread - a.unread)
    return {
      pinnedList: byUnread(live.filter(c => pinned.includes(c.id))),
      groupList: byUnread(live.filter(c => !pinned.includes(c.id) && c.isGroup)),
      directList: byUnread(live.filter(c => !pinned.includes(c.id) && !c.isGroup)),
      archivedList: sortPinned(
        pinned,
        conversations.filter(c => archived.includes(c.id)),
      ),
    }
  }, [conversations, query, pinned, archived])

  // 新消息/对方正在输入时贴底滚动；length 只当触发器，不参与计算
  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    const nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 160
    if (nearBottom || thread.length <= 1) {
      endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
      setShowJump(false)
    } else setShowJump(true)
  }, [thread.length, isTyping])

  const reply = (conv: Conversation) => {
    setTypingConv(conv.id)
    window.setTimeout(() => {
      // 「对方」说什么由 repository 决定（现在是 mock，接后端后是真推送）
      const r = pickReply(conv)
      receiveMessage(conv.id, r.text, r.senderId)
      setTypingConv(null)
    }, 1100)
  }

  /* ── 输入区的四个发送口子（输入框本身在 messages/Composer.tsx）────────────── */
  const sendText = (text: string) => {
    if (!activeConv) return
    sendMessage(activeConv.id, text, quotedMsg ?? undefined)
    setQuotedMsg(null)
    reply(activeConv)
  }

  const sendStickerNow = (emoji: string) => {
    if (!activeConv) return
    sendSticker(activeConv.id, emoji)
    reply(activeConv)
  }

  const sendImageNow = (url: string) => {
    if (!activeConv) return
    sendImage(activeConv.id, url)
    reply(activeConv)
  }

  const sendVoiceNow = (secs: number) => {
    if (!activeConv) return
    sendVoice(activeConv.id, secs)
    reply(activeConv)
  }

  const sendNoteNow = (note: NoteCard) => {
    if (!activeConv) return
    sendNote(activeConv.id, note)
    reply(activeConv)
  }

  const goProfile = (conv: Conversation) => {
    viewUser(getUser(conv.name))
    navigate('userProfile')
  }

  const lastOwnIndex = (() => {
    for (let i = thread.length - 1; i >= 0; i--) if (thread[i].from === 'me') return i
    return -1
  })()

  const sheetTarget = conversations.find(c => c.id === sheetConv) ?? null
  const sheetActions: RowAction[] = sheetTarget
    ? [
        sheetTarget.unread > 0
          ? {
              key: 'read',
              label: '标记已读',
              icon: <NoteIcon />,
              onClick: () => {
                markRead(sheetTarget.id)
                notify('已标记为已读')
              },
            }
          : {
              key: 'unread',
              label: '标记未读',
              icon: <NoteIcon />,
              onClick: () => {
                markUnread(sheetTarget.id)
                notify('已标记为未读')
              },
            },
        muted.includes(sheetTarget.id)
          ? {
              key: 'unmute',
              label: '取消免打扰',
              icon: <BellOffIcon />,
              onClick: () => {
                toggleMute(sheetTarget.id)
                notify('已取消免打扰')
              },
            }
          : {
              key: 'mute',
              label: '消息免打扰',
              icon: <BellOffIcon />,
              onClick: () => {
                toggleMute(sheetTarget.id)
                notify('已开启免打扰')
              },
            },
        archived.includes(sheetTarget.id)
          ? {
              key: 'unarchive',
              label: '移出归档',
              icon: <ArchiveIcon />,
              onClick: () => {
                toggleArchive(sheetTarget.id)
                notify('已移出归档')
              },
            }
          : {
              key: 'archive',
              label: '归档会话',
              icon: <ArchiveIcon />,
              onClick: () => {
                toggleArchive(sheetTarget.id)
                notify('已归档')
              },
            },
        {
          key: 'clear',
          label: '清空聊天记录',
          icon: <EraserIcon />,
          onClick: () => {
            clearThread(sheetTarget.id)
            notify('聊天记录已清空')
          },
        },
        {
          key: 'report',
          label: '举报',
          icon: <FlagIcon />,
          onClick: () => notify('举报已提交，我们会尽快处理'),
        },
        blocked.includes(sheetTarget.id)
          ? {
              key: 'unblock',
              label: '取消拉黑',
              icon: <BlockIcon />,
              danger: true,
              onClick: () => {
                toggleBlock(sheetTarget.id)
                notify('已取消拉黑')
              },
            }
          : {
              key: 'block',
              label: '拉黑',
              icon: <BlockIcon />,
              danger: true,
              onClick: () => {
                toggleBlock(sheetTarget.id)
                notify('已拉黑，对方消息不再提醒')
              },
            },
      ]
    : []

  const rowProps = (conv: Conversation) => ({
    conv,
    active: activeConvId === conv.id,
    pinned: pinned.includes(conv.id),
    muted: muted.includes(conv.id),
    typing: isTyping && activeConvId === conv.id,
    mentioned: (() => {
      const last = (messages[conv.id] ?? []).slice(-1)[0]
      if (!last?.text) return false
      const name = groupNicknames[conv.id] || myProfileName
      return last.text.includes('@所有人') || last.text.includes(`@${name}`)
    })(),
    watched: (() => {
      if (!conv.isGroup || !muted.includes(conv.id)) return false
      const last = (messages[conv.id] ?? []).slice(-1)[0]
      return (groupSettingsAll[conv.id]?.watchers ?? []).includes(last?.senderId ?? '')
    })(),
    openDir: openRow?.id === conv.id ? openRow.dir : null,
    onOpen: () => {
      setOpenRow(null)
      openConversation(conv.id)
    },
    onSetOpenDir: (d: 'pin' | 'delete' | null) => setOpenRow(d ? { id: conv.id, dir: d } : null),
    onPin: () => {
      setOpenRow(null)
      togglePin(conv.id)
    },
    onRemove: () => {
      setOpenRow(null)
      removeConversation(conv.id)
    },
    onLongPress: () => {
      setOpenRow(null)
      setSheetConv(conv.id)
    },
  })

  return (
    <AppShell fullHeight contentLayout="row" navigate={navigate} currentPage={currentPage}>
      {/* ── 左栏 ── */}
      <div
        style={{
          width: 336,
          flexShrink: 0,
          borderRight: '1px solid #F0F0F0',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        <div style={{ padding: '22px 20px 18px', flexShrink: 0 }}>
          <div style={{ padding: '0 8px 12px', margin: '0 -8px', overflow: 'hidden' }}>
            <div
              style={{
                position: 'relative',
                height: 46,
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '0 16px',
                background: 'var(--surface)',
                border: '1px solid #EAEAEA',
                borderRadius: 20,
                boxShadow: '0 10px 22px -18px rgba(255,36,66,0.75), 0 1px 2px rgba(0,0,0,0.03)',
              }}
            >
              <svg
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#999"
                strokeWidth="2.2"
                style={{ flexShrink: 0 }}
              >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
              <input
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="搜索"
                style={{
                  flex: 1,
                  minWidth: 0,
                  border: 'none',
                  outline: 'none',
                  background: 'transparent',
                  fontSize: 15,
                  color: '#333',
                  fontWeight: 500,
                  fontFamily: 'inherit',
                }}
              />
              {query && (
                <button
                  onClick={() => setQuery('')}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#BBB',
                    fontSize: 17,
                    lineHeight: 1,
                    padding: 0,
                    flexShrink: 0,
                  }}
                >
                  ×
                </button>
              )}
            </div>
          </div>
        </div>

        <div style={{ overflowY: 'auto', flex: 1, padding: '0 10px 12px' }}>
          {pinnedList.length + groupList.length + directList.length === 0 && (
            <div
              style={{
                padding: '28px 16px',
                textAlign: 'center',
                color: '#BDBDBD',
                fontSize: 13,
                lineHeight: 1.7,
              }}
            >
              {conversations.length === 0 ? '还没有私信\n去别人的主页聊聊吧' : '没有找到相关会话'}
            </div>
          )}

          {/* 三个分区：置顶 → 群聊 → 普通（搜索时不分段，直接出结果） */}
          {pinnedList.length > 0 && (
            <>
              {!query && (
                <SectionLabel label="置顶" unread={pinnedList.reduce((n, c) => n + c.unread, 0)} />
              )}
              {pinnedList.map(c => (
                <ConvRow key={c.id} {...rowProps(c)} />
              ))}
            </>
          )}
          {groupList.length > 0 && (
            <>
              {!query && (
                <SectionLabel label="群聊" unread={groupList.reduce((n, c) => n + c.unread, 0)} />
              )}
              {groupList.map(c => (
                <ConvRow key={c.id} {...rowProps(c)} />
              ))}
            </>
          )}
          {directList.length > 0 && (
            <>
              {!query && (
                <SectionLabel label="普通" unread={directList.reduce((n, c) => n + c.unread, 0)} />
              )}
              {directList.map(c => (
                <ConvRow key={c.id} {...rowProps(c)} />
              ))}
            </>
          )}

          {archivedList.length > 0 && (
            <div style={{ marginTop: 10, borderTop: '1px solid #F4F4F4', paddingTop: 6 }}>
              <button
                onClick={() => setArchiveOpen(o => !o)}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '10px 12px',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  color: '#8A8A8A',
                  fontSize: 12.5,
                }}
              >
                <ArchiveIcon size={14} />
                已归档 · {archivedList.length}
                <span style={{ flex: 1 }} />
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  {...stroke}
                  style={{
                    transform: archiveOpen ? 'rotate(180deg)' : 'none',
                    transition: 'transform 0.2s',
                  }}
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>
              {archiveOpen && archivedList.map(c => <ConvRow key={c.id} {...rowProps(c)} />)}
            </div>
          )}
        </div>
      </div>

      {/* ── 右栏 ── */}
      <div
        style={{
          flex: 1,
          minWidth: 0,
          display: 'flex',
          flexDirection: 'column',
          background: '#F7F7F8',
          position: 'relative',
        }}
      >
        <div
          style={{
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            padding: '16px 24px',
            background: 'var(--surface)',
            borderBottom: '1px solid #F0F0F0',
          }}
        >
          {activeConv ? (
            <>
              <button
                onClick={() => goProfile(activeConv)}
                title={isGroup ? '查看群资料' : '查看主页'}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 11,
                  background: 'none',
                  border: 'none',
                  padding: 0,
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  textAlign: 'left',
                }}
              >
                <Avatar avatar={activeConv.avatar} size={40} square={isGroup} />
                <span>
                  <span
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      fontSize: 15.5,
                      fontWeight: 600,
                      color: 'var(--ink-strong)',
                    }}
                  >
                    {activeConv.name}
                    {isGroup && (
                      <span
                        style={{
                          fontSize: 11,
                          color: '#9A9A9A',
                          fontWeight: 500,
                          background: '#F4F4F5',
                          borderRadius: 6,
                          padding: '2px 6px',
                        }}
                      >
                        群聊
                      </span>
                    )}
                  </span>
                  <span
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 5,
                      fontSize: 11.5,
                      color: '#B5B5B5',
                      marginTop: 2,
                    }}
                  >
                    {isGroup ? (
                      `${activeConv.memberIds?.length ?? 0} 位成员`
                    ) : (
                      <>
                        <span
                          style={{
                            width: 6,
                            height: 6,
                            borderRadius: '50%',
                            background: isTyping ? '#F0B429' : '#4CC38A',
                            display: 'block',
                          }}
                        />
                        {isTyping ? '正在输入…' : '在线'}
                      </>
                    )}
                  </span>
                </span>
              </button>
              <div style={{ flex: 1 }} />
              {isGroup && (
                <button
                  onClick={() => setMembersOpen(o => !o)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    height: 34,
                    padding: '0 14px',
                    borderRadius: 999,
                    border: '1px solid #EAEAEA',
                    background: membersOpen ? '#F4F4F5' : 'var(--surface)',
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                    fontSize: 13,
                    color: '#555',
                  }}
                >
                  <UsersIcon />
                  成员
                </button>
              )}
            </>
          ) : (
            <span style={{ fontSize: 15, color: '#B5B5B5' }}>选择左侧会话开始聊天</span>
          )}
        </div>

        <div style={{ flex: 1, display: 'flex', minHeight: 0 }}>
          {/* 消息流 */}
          <div
            ref={scrollRef}
            onScroll={() => {
              const el = scrollRef.current
              if (!el) return
              setShowJump(el.scrollHeight - el.scrollTop - el.clientHeight >= 160)
            }}
            style={{
              flex: 1,
              minWidth: 0,
              overflowY: 'auto',
              padding: '18px 28px 8px',
              background: bgStyle(groupSettingsAll[activeConvId ?? -1]?.background ?? 'default'),
              transition: 'background 0.2s',
            }}
          >
            <div
              style={{ maxWidth: 760, margin: '0 auto', display: 'flex', flexDirection: 'column' }}
            >
              {isGroup && activeConv?.announcement && (
                <div
                  onClick={() => {
                    setAnnsOpen(true)
                    setAnnounceUnseen(m => ({ ...m, [activeConv.id]: false }))
                  }}
                  style={{
                    position: 'relative',
                    display: 'flex',
                    gap: 10,
                    background: '#FFF8E8',
                    border: '1px solid #FBE7BF',
                    borderRadius: 12,
                    padding: '11px 14px',
                    marginBottom: 16,
                    cursor: 'pointer',
                  }}
                >
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      color: 'var(--warning)',
                      flexShrink: 0,
                      paddingTop: 1,
                    }}
                  >
                    群公告
                  </span>
                  <span
                    style={{
                      flex: 1,
                      fontSize: 12.5,
                      color: '#7A5B1B',
                      lineHeight: 1.6,
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical' as const,
                      overflow: 'hidden',
                    }}
                  >
                    {activeConv.announcement}
                  </span>
                  <span
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                      flexShrink: 0,
                      alignSelf: 'center',
                      fontSize: 11,
                      color: '#C7A45A',
                    }}
                  >
                    {annsOfActive.length > 1 ? `${annsOfActive.length} 条` : '查看'}
                    <svg width="11" height="11" viewBox="0 0 24 24" {...stroke}>
                      <polyline points="9 6 15 12 9 18" />
                    </svg>
                  </span>
                  {announceUnseen[activeConv.id] && (
                    <span
                      style={{
                        position: 'absolute',
                        top: -6,
                        right: -6,
                        background: 'var(--brand)',
                        color: 'var(--surface)',
                        fontSize: 10,
                        fontWeight: 700,
                        borderRadius: 999,
                        padding: '2px 7px',
                      }}
                    >
                      新公告
                    </span>
                  )}
                </div>
              )}

              {isGroup && isLeft && activeConv && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 10,
                    background: '#F4F4F5',
                    borderRadius: 10,
                    padding: '10px 14px',
                    marginBottom: 16,
                    fontSize: 12.5,
                    color: '#8A8A8A',
                  }}
                >
                  你已退出该群聊，不再接收群消息
                  <button
                    onClick={() => rejoinGroup(activeConv.id)}
                    style={{
                      border: 'none',
                      background: 'none',
                      color: 'var(--brand)',
                      fontSize: 12.5,
                      cursor: 'pointer',
                      fontFamily: 'inherit',
                    }}
                  >
                    重新加入
                  </button>
                </div>
              )}

              {thread.length === 0 && !isTyping && (
                <div
                  style={{ textAlign: 'center', color: '#BDBDBD', fontSize: 13, padding: '70px 0' }}
                >
                  {isGroup
                    ? '群里还没有消息，说点什么吧'
                    : `打个招呼，开始和 ${activeConv?.name ?? '对方'} 聊天吧`}
                </div>
              )}

              {thread.map((msg, i) => {
                const prev = thread[i - 1]
                const next = thread[i + 1]
                const showDay = !prev || dayLabel(prev.time) !== dayLabel(msg.time)
                const firstOfGroup =
                  showDay || prev.from !== msg.from || prev.senderId !== msg.senderId
                const lastOfGroup =
                  !next ||
                  next.from !== msg.from ||
                  next.senderId !== msg.senderId ||
                  dayLabel(next.time) !== dayLabel(msg.time)
                const own = msg.from === 'me'
                const big = 18
                const sender = isGroup && !own ? getMember(msg.senderId) : undefined
                const markIndex = activeConvId != null ? unreadMark[activeConvId] : undefined
                // 每条消息都是完整四角圆弧，不做连续消息之间的「缺角拼合」
                const bubbleRadius = { borderRadius: big }
                const myDisplayName = groupNicknames[activeConvId ?? -1] || myProfileName
                const mentioned =
                  !own &&
                  !!msg.text &&
                  (msg.text.includes('@所有人') || msg.text.includes(`@${myDisplayName}`))

                // 系统消息：居中灰字
                if (msg.type === 'system') {
                  return (
                    <div
                      key={i}
                      data-msg-index={i}
                      style={{
                        textAlign: 'center',
                        fontSize: 11.5,
                        color: '#A8A8A8',
                        padding: firstOfGroup ? '14px 24px 6px' : '4px 24px 6px',
                      }}
                    >
                      {msg.text}
                    </div>
                  )
                }

                // 撤回后只留一条居中提示
                if (msg.recalled) {
                  return (
                    <div
                      key={i}
                      data-msg-index={i}
                      style={{
                        textAlign: 'center',
                        fontSize: 11.5,
                        color: '#A8A8A8',
                        padding: '8px 24px',
                      }}
                    >
                      {own
                        ? '你撤回了一条消息'
                        : `${sender?.name ?? activeConv?.name ?? '对方'} 撤回了一条消息`}
                    </div>
                  )
                }

                return (
                  <div key={i} data-msg-index={i}>
                    {showDay && (
                      <div
                        style={{
                          textAlign: 'center',
                          fontSize: 11.5,
                          color: '#C0C0C0',
                          padding: i === 0 ? '6px 0 14px' : '20px 0 14px',
                        }}
                      >
                        {dayLabel(msg.time)}
                      </div>
                    )}
                    {markIndex === i && (
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 10,
                          padding: '10px 0 12px',
                        }}
                      >
                        <span style={{ flex: 1, height: 1, background: '#FFD5DB' }} />
                        <span style={{ fontSize: 11, color: 'var(--brand)', flexShrink: 0 }}>
                          以下为新消息
                        </span>
                        <span style={{ flex: 1, height: 1, background: '#FFD5DB' }} />
                      </div>
                    )}
                    <motion.div
                      data-msg-row={own ? 'me' : 'other'}
                      onPointerDown={e => startPress(e, i, own)}
                      onPointerMove={movePress}
                      onPointerUp={cancelPress}
                      onPointerCancel={cancelPress}
                      onContextMenu={e => {
                        e.preventDefault()
                        cancelPress()
                        setMsgMenu({ index: i, x: e.clientX, y: e.clientY, own })
                      }}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.18 }}
                      style={{
                        display: 'flex',
                        flexDirection: own ? 'row-reverse' : 'row',
                        alignItems: 'center',
                        gap: 10,
                        marginTop: firstOfGroup ? 0 : 3,
                      }}
                    >
                      <div style={{ width: 34, flexShrink: 0 }}>
                        {/* 每条消息都带头像 */}
                        <Avatar
                          avatar={own ? myAvatar : (sender?.avatar ?? activeConv?.avatar ?? '')}
                          size={34}
                        />
                      </div>

                      <div
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: own ? 'flex-end' : 'flex-start',
                          maxWidth: '70%',
                        }}
                      >
                        {isGroup && !own && firstOfGroup && (
                          <span style={{ fontSize: 11.5, color: '#9A9A9A', margin: '0 0 4px 2px' }}>
                            {sender?.name ?? '群成员'}
                          </span>
                        )}

                        {msg.type === 'text' && (
                          <div
                            style={{
                              background: own
                                ? 'linear-gradient(135deg,#FF5A70,var(--brand))'
                                : mentioned
                                  ? '#FFF8E8'
                                  : 'var(--surface)',
                              color: own ? '#fff' : 'var(--ink-soft)',
                              border: own
                                ? 'none'
                                : mentioned
                                  ? '1px solid #F2D9A0'
                                  : '1px solid #EFEFEF',
                              ...bubbleRadius,
                              padding: '10px 15px',
                              fontSize: 14.5,
                              lineHeight: 1.65,
                              whiteSpace: 'pre-wrap',
                              boxShadow: own
                                ? '0 6px 16px -10px rgba(255,36,66,0.9)'
                                : '0 2px 10px -8px rgba(0,0,0,0.5)',
                            }}
                          >
                            {msg.quoted && (
                              <div
                                style={{
                                  borderLeft: `3px solid ${own ? 'rgba(255,255,255,0.65)' : '#E2E2E2'}`,
                                  paddingLeft: 8,
                                  marginBottom: 7,
                                }}
                              >
                                <div
                                  style={{
                                    fontSize: 11.5,
                                    fontWeight: 600,
                                    color: own ? 'rgba(255,255,255,0.95)' : '#8A8A8A',
                                  }}
                                >
                                  {msg.quoted.author}
                                </div>
                                <div
                                  style={{
                                    fontSize: 12,
                                    color: own ? 'rgba(255,255,255,0.85)' : '#9A9A9A',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap',
                                    maxWidth: 190,
                                  }}
                                >
                                  {msg.quoted.preview}
                                </div>
                              </div>
                            )}
                            {msg.text}
                            {mentioned && (
                              <span
                                style={{
                                  display: 'inline-block',
                                  marginLeft: 6,
                                  fontSize: 11,
                                  color: 'var(--warning)',
                                  fontWeight: 600,
                                }}
                              >
                                @我
                              </span>
                            )}
                          </div>
                        )}

                        {msg.type === 'sticker' && (
                          <div style={{ fontSize: 54, lineHeight: 1, padding: '2px 6px' }}>
                            {msg.emoji}
                          </div>
                        )}

                        {msg.type === 'voice' && (
                          <VoiceBubble duration={msg.duration ?? 1} own={own} />
                        )}

                        {msg.type === 'note' && msg.note && (
                          <NoteBubble
                            note={msg.note}
                            onOpen={() => navigate('detail', String(msg.note!.id))}
                          />
                        )}

                        {(msg.type === 'video' || msg.type === 'image') && (
                          <div
                            style={{
                              maxWidth: 240,
                              borderRadius: 14,
                              overflow: 'hidden',
                              background: 'var(--surface)',
                              border: '1px solid #EFEFEF',
                              position: 'relative',
                              boxShadow: '0 4px 14px -10px rgba(0,0,0,0.6)',
                            }}
                          >
                            <img
                              src={msg.type === 'image' ? msg.url : imgUrl(msg.thumb ?? '', 480)}
                              alt=""
                              style={{ width: '100%', display: 'block', objectFit: 'cover' }}
                            />
                            {msg.type === 'video' && (
                              <div
                                style={{
                                  position: 'absolute',
                                  inset: 0,
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  background: 'rgba(0,0,0,0.18)',
                                }}
                              >
                                <div
                                  style={{
                                    width: 40,
                                    height: 40,
                                    borderRadius: '50%',
                                    background: 'rgba(0,0,0,0.45)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                  }}
                                >
                                  <svg width="15" height="15" viewBox="0 0 24 24" fill="white">
                                    <polygon points="5 3 19 12 5 21 5 3" />
                                  </svg>
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </motion.div>

                    {own && lastOfGroup && i === lastOwnIndex && (
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'flex-end',
                          padding: '5px 44px 0 0',
                          fontSize: 11,
                          color:
                            msg.status === 'sending'
                              ? '#C4C4C4'
                              : msg.status === 'read'
                                ? '#B0B0B0'
                                : '#C4C4C4',
                        }}
                      >
                        {msg.status === 'sending' ? (
                          <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                            <motion.span
                              animate={{ rotate: 360 }}
                              transition={{ duration: 0.9, repeat: Infinity, ease: 'linear' }}
                              style={{
                                width: 9,
                                height: 9,
                                borderRadius: '50%',
                                border: '1.4px solid #E4E4E4',
                                borderTopColor: '#B9B9B9',
                                display: 'block',
                              }}
                            />
                            发送中…
                          </span>
                        ) : msg.status === 'read' ? (
                          '已读'
                        ) : (
                          '已送达'
                        )}
                      </div>
                    )}
                  </div>
                )
              })}

              {isTyping && (
                <div style={{ marginTop: 10 }}>
                  <TypingBubble />
                </div>
              )}
              <div ref={endRef} />
            </div>
          </div>

          {/* 群设置面板 */}
          <AnimatePresence>
            {membersOpen && isGroup && activeConv && (
              <motion.aside
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 320, opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                transition={{ duration: 0.24, ease: EASE }}
                style={{
                  flexShrink: 0,
                  background: 'var(--surface)',
                  borderLeft: '1px solid #F0F0F0',
                  overflow: 'hidden',
                }}
              >
                <GroupPanel
                  conv={activeConv}
                  notify={notify}
                  onClose={() => setMembersOpen(false)}
                  onOpenAnnouncements={() => {
                    setMembersOpen(false)
                    setAnnsOpen(true)
                  }}
                />
              </motion.aside>
            )}
          </AnimatePresence>
        </div>

        {/* 输入区（输入框 + @提及 / 表情 / 笔记拾取器 + 语音录制）在 messages/Composer.tsx */}
        <Composer
          key={activeConvId ?? 0}
          conv={activeConv ?? null}
          isBlocked={isBlocked}
          isLeft={isLeft}
          onUnblock={() => activeConv && toggleBlock(activeConv.id)}
          onRejoin={() => activeConv && rejoinGroup(activeConv.id)}
          draft={draft}
          onDraftChange={setDraft}
          open={composerOpen}
          onOpenChange={setComposerOpen}
          quoted={quotedMsg}
          onClearQuote={() => setQuotedMsg(null)}
          showJump={showJump}
          onJump={() => {
            endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
            setShowJump(false)
          }}
          onSend={sendText}
          onSendSticker={sendStickerNow}
          onSendImage={sendImageNow}
          onSendVoice={sendVoiceNow}
          onSendNote={sendNoteNow}
        />
      </div>

      {/* 群公告列表 */}
      <AnimatePresence>
        {annsOpen && activeConv && (
          <AnnouncementsPanel
            conv={activeConv}
            notify={notify}
            onClose={() => setAnnsOpen(false)}
            canManage={
              !!activeConv.isGroup &&
              (groupOwnerAll[activeConv.id] === 'me' ||
                (groupAdminsAll[activeConv.id] ?? []).includes('me'))
            }
            onPublished={() => setAnnounceUnseen(m => ({ ...m, [activeConv.id]: true }))}
          />
        )}
      </AnimatePresence>

      {/* 消息操作条（长按 / 右键）：复制 · 引用 · 撤回 · 删除 */}
      {msgMenu &&
        activeConv &&
        (() => {
          const target = thread[msgMenu.index]
          if (!target) return null
          const author = msgMenu.own ? '我' : (getMember(target.senderId)?.name ?? activeConv.name)
          const preview =
            target.type === 'text'
              ? (target.text ?? '')
              : target.type === 'note'
                ? `[笔记] ${target.note?.title ?? ''}`
                : target.type === 'image'
                  ? '[图片]'
                  : target.type === 'voice'
                    ? `[语音 ${target.duration ?? 0}″]`
                    : target.type === 'sticker'
                      ? (target.emoji ?? '[表情]')
                      : target.type === 'video'
                        ? '[视频]'
                        : '[消息]'
          const itemStyle: React.CSSProperties = {
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 3,
            width: 58,
            padding: '8px 0 7px',
            border: 'none',
            background: 'none',
            color: 'var(--surface)',
            fontSize: 11.5,
            cursor: 'pointer',
            fontFamily: 'inherit',
          }
          const icon = {
            width: 19,
            height: 19,
            fill: 'none',
            stroke: 'currentColor',
            strokeWidth: 1.7,
            strokeLinecap: 'round' as const,
            strokeLinejoin: 'round' as const,
          }
          return (
            <>
              <div
                onClick={() => setMsgMenu(null)}
                onContextMenu={e => {
                  e.preventDefault()
                  setMsgMenu(null)
                }}
                style={{ position: 'fixed', inset: 0, zIndex: 380 }}
              />
              <div
                style={{
                  position: 'fixed',
                  left: Math.max(12, Math.min(msgMenu.x - 30, window.innerWidth - 280)),
                  top: Math.max(12, msgMenu.y - 68),
                  zIndex: 381,
                  display: 'flex',
                  background: 'rgba(44,44,46,0.97)',
                  borderRadius: 12,
                  padding: '2px 6px',
                  boxShadow: '0 14px 34px -14px rgba(0,0,0,0.6)',
                }}
              >
                {target.type === 'text' && (
                  <button
                    style={itemStyle}
                    onClick={() => {
                      navigator.clipboard?.writeText(target.text ?? '')
                      setMsgMenu(null)
                      notify('已复制')
                    }}
                  >
                    <svg {...icon}>
                      <rect x="9" y="9" width="11" height="11" rx="2" />
                      <path d="M5 15V6a2 2 0 0 1 2-2h9" />
                    </svg>
                    复制
                  </button>
                )}
                <button
                  style={itemStyle}
                  onClick={() => {
                    setQuotedMsg({ author, preview: preview.slice(0, 40) })
                    setComposerOpen(true)
                    setMsgMenu(null)
                  }}
                >
                  <svg {...icon}>
                    <path d="M9 7H6a3 3 0 0 0 0 6h1v4" />
                    <path d="M17 7h-3a3 3 0 0 0 0 6h1v4" />
                  </svg>
                  引用
                </button>
                {msgMenu.own && (
                  <button
                    style={itemStyle}
                    onClick={() => {
                      recallMessage(activeConv.id, msgMenu.index)
                      setMsgMenu(null)
                      notify('已撤回')
                    }}
                  >
                    <svg {...icon}>
                      <path d="M9 14L4 9l5-5" />
                      <path d="M4 9h9a7 7 0 0 1 0 14H8" />
                    </svg>
                    撤回
                  </button>
                )}
                <button
                  style={itemStyle}
                  onClick={() => {
                    deleteMessage(activeConv.id, msgMenu.index)
                    setMsgMenu(null)
                    notify('已删除')
                  }}
                >
                  <svg {...icon}>
                    <path d="M4 7h16" />
                    <path d="M10 4h4" />
                    <path d="M6.5 7l.9 12.1a1.5 1.5 0 0 0 1.5 1.4h6.2a1.5 1.5 0 0 0 1.5-1.4L17.5 7" />
                  </svg>
                  删除
                </button>
              </div>
            </>
          )
        })()}

      {/* 长按菜单 */}
      <AnimatePresence>
        {sheetTarget && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSheetConv(null)}
              style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.28)', zIndex: 300 }}
            />
            <motion.div
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 20, opacity: 0 }}
              transition={{ duration: 0.22, ease: EASE }}
              style={{
                position: 'fixed',
                left: '50%',
                bottom: 40,
                transform: 'translateX(-50%)',
                width: 320,
                background: 'var(--surface)',
                borderRadius: 18,
                boxShadow: '0 24px 60px -24px rgba(0,0,0,0.5)',
                zIndex: 301,
                overflow: 'hidden',
                padding: '6px 0',
              }}
            >
              <div style={{ padding: '12px 18px 10px', borderBottom: '1px solid #F4F4F4' }}>
                <div style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--ink-strong)' }}>
                  {sheetTarget.name}
                </div>
                <div style={{ fontSize: 11.5, color: '#B5B5B5', marginTop: 2 }}>会话操作</div>
              </div>
              {sheetActions.map(a => (
                <button
                  key={a.key}
                  onClick={() => {
                    a.onClick()
                    setSheetConv(null)
                  }}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: '12px 18px',
                    border: 'none',
                    background: 'none',
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                    fontSize: 14,
                    color: a.danger ? 'var(--brand)' : 'var(--ink-soft)',
                    textAlign: 'left',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = '#FAFAFA')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'none')}
                >
                  <span style={{ color: a.danger ? 'var(--brand)' : '#8A8A8A', display: 'flex' }}>
                    {a.icon}
                  </span>
                  {a.label}
                </button>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            style={{
              position: 'fixed',
              left: '50%',
              bottom: 120,
              transform: 'translateX(-50%)',
              background: 'rgba(28,28,30,0.92)',
              color: 'var(--surface)',
              fontSize: 13,
              padding: '10px 18px',
              borderRadius: 999,
              zIndex: 400,
            }}
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </AppShell>
  )
}
