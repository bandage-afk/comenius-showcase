// 输入区 + 三个拾取器（@提及 / 表情 / 笔记）+ 语音录制条。
//
// 从 MessagesPage 拆出的第二块：页面只剩「会话编排」，输入框自己的浮层状态（开没开、
// 开哪一个）留在这里；**草稿与引用目标仍由页面持有** —— 切会话要清空草稿（页面里那条 effect），
// 引用是从消息菜单点出来的，两者都是会话级状态。
//
// 切会话时页面用 key={activeConvId} 重新挂载本组件，浮层状态自然归零，
// 于是不需要「拿 deps 当触发器」的 effect（那条 lint 例外不用再扩大）。

import { useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useCommunity } from '../../communityStore'
import type { Conversation, NoteCard, QuotedRef } from '../../community/data'
import type { Post } from '../../data/posts'
import {
  Avatar,
  EASE,
  EMOJIS,
  ImageIcon,
  MicIcon,
  NoteIcon,
  PHOTO_POOL,
  SmileIcon,
  fmtDur,
} from './parts'

/** 随机挑一张图库照片（放模块作用域，避免在组件体里调用 Math.random） */
const pickRandomPhoto = () => PHOTO_POOL[Math.floor(Math.random() * PHOTO_POOL.length)]

export interface ComposerProps {
  /** 当前会话；null 时文案按「对方」兜底 */
  conv: Conversation | null
  isBlocked: boolean
  isLeft: boolean
  onUnblock: () => void
  onRejoin: () => void
  /** 草稿由页面持有（切会话要清空） */
  draft: string
  onDraftChange: (v: string) => void
  /**
   * 输入框展开状态由页面持有：消息菜单点「引用」时页面要把它打开。
   * 其余浮层（表情 / 笔记 / @提及 / 录音）都是本组件内部状态。
   */
  open: boolean
  onOpenChange: (v: boolean) => void
  /** 被引用的消息（从消息菜单点出来的） */
  quoted: QuotedRef | null
  onClearQuote: () => void
  /** 「↓ 新消息」浮标 */
  showJump: boolean
  onJump: () => void
  onSend: (text: string) => void
  onSendSticker: (emoji: string) => void
  onSendImage: (url: string) => void
  onSendVoice: (secs: number) => void
  onSendNote: (note: NoteCard) => void
}

export default function Composer({
  conv,
  isBlocked,
  isLeft,
  onUnblock,
  onRejoin,
  draft,
  onDraftChange,
  open,
  onOpenChange,
  quoted,
  onClearQuote,
  showJump,
  onJump,
  onSend,
  onSendSticker,
  onSendImage,
  onSendVoice,
  onSendNote,
}: ComposerProps) {
  const getMember = useCommunity(s => s.getMember)
  const groupOwner = useCommunity(s => s.groupOwner)
  const groupAdmins = useCommunity(s => s.groupAdmins)
  const posts = useCommunity(s => s.posts)

  const [emojiOpen, setEmojiOpen] = useState(false)
  const [noteOpen, setNoteOpen] = useState(false)
  const [noteQuery, setNoteQuery] = useState('')
  const [mentionOpen, setMentionOpen] = useState(false)
  const [recording, setRecording] = useState(false)
  const [recordSecs, setRecordSecs] = useState(0)
  const recordTimer = useRef<number | null>(null)

  const isGroup = !!conv?.isGroup

  const closeComposer = () => {
    onOpenChange(false)
    setEmojiOpen(false)
    setNoteOpen(false)
    onDraftChange('')
  }

  /** 插入 @提及（群聊） */
  const insertMention = (name: string) => {
    onOpenChange(true)
    onDraftChange(draft ? `${draft}@${name} ` : `@${name} `)
    setMentionOpen(false)
    setEmojiOpen(false)
    setNoteOpen(false)
  }

  const submit = () => {
    const t = draft.trim()
    if (!t || !conv) return
    onSend(t)
    closeComposer()
  }

  const doSendEmoji = (e: string) => {
    if (!conv) return
    onSendSticker(e)
    setEmojiOpen(false)
  }

  const doSendPhoto = () => {
    if (!conv) return
    onSendImage(`https://images.unsplash.com/${pickRandomPhoto()}?w=520&fit=crop&auto=format`)
    setEmojiOpen(false)
  }

  const doSendNote = (p: Post) => {
    if (!conv) return
    onSendNote({
      id: p.id,
      title: (p.title ?? p.quote ?? '笔记').replace(/\n/g, ' '),
      img: p.img ?? PHOTO_POOL[0],
      author: p.author,
      likes: p.likes ?? '0',
    })
    setNoteOpen(false)
    setNoteQuery('')
  }

  /* 按住说话 */
  const startRecord = () => {
    if (!conv || isBlocked) return
    setRecording(true)
    setRecordSecs(0)
    const started = Date.now()
    recordTimer.current = window.setInterval(
      () => setRecordSecs(Math.floor((Date.now() - started) / 1000)),
      200,
    )
  }

  const stopRecord = (send: boolean) => {
    if (recordTimer.current) {
      window.clearInterval(recordTimer.current)
      recordTimer.current = null
    }
    const secs = Math.max(1, recordSecs)
    setRecording(false)
    setRecordSecs(0)
    if (send && conv) onSendVoice(secs)
  }

  // 卸载时收掉录音计时器（切会话会把整块重挂载，不清理就会留着 interval）
  useEffect(
    () => () => {
      if (recordTimer.current) window.clearInterval(recordTimer.current)
    },
    [],
  )

  const noteResults = useMemo(() => {
    const q = noteQuery.trim().toLowerCase()
    const list = q
      ? posts.filter(p => `${p.title ?? p.quote ?? ''}${p.author}`.toLowerCase().includes(q))
      : posts
    return list.slice(0, 24)
  }, [noteQuery, posts])

  return (
    <div
      style={{
        flexShrink: 0,
        position: 'relative',
        padding: '12px 28px 22px',
        background: 'var(--surface)',
        borderTop: '1px solid var(--grey-50)',
      }}
    >
      <AnimatePresence>
        {showJump && (
          <motion.button
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            onClick={onJump}
            style={{
              position: 'absolute',
              top: -46,
              left: '50%',
              transform: 'translateX(-50%)',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '8px 16px',
              borderRadius: 999,
              border: '1px solid #EEEEEE',
              background: 'var(--surface)',
              boxShadow: '0 8px 24px -14px rgba(0,0,0,0.4)',
              cursor: 'pointer',
              fontSize: 12.5,
              color: 'var(--grey-800)',
              fontFamily: 'inherit',
            }}
          >
            ↓ 新消息
          </motion.button>
        )}
      </AnimatePresence>

      <div style={{ maxWidth: 760, margin: '0 auto', position: 'relative' }}>
        {(isBlocked || isLeft) && conv ? (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              background: '#FFF4F5',
              border: '1px solid #FFE1E5',
              borderRadius: 16,
              padding: '12px 16px',
            }}
          >
            <span style={{ fontSize: 13, color: '#B23A46' }}>
              {isBlocked ? `你已拉黑 ${conv.name}，无法发送消息` : '你已退出该群聊，无法发送消息'}
            </span>
            <div style={{ flex: 1 }} />
            <button
              onClick={() => (isBlocked ? onUnblock() : onRejoin())}
              style={{
                border: 'none',
                background: 'var(--surface)',
                color: 'var(--brand)',
                borderRadius: 999,
                padding: '6px 14px',
                fontSize: 12.5,
                cursor: 'pointer',
                fontFamily: 'inherit',
              }}
            >
              {isBlocked ? '解除拉黑' : '重新加入'}
            </button>
          </div>
        ) : (
          <motion.div
            layout
            transition={{ duration: 0.32, ease: EASE }}
            style={{
              background: 'var(--grey-15)',
              borderRadius: open ? 16 : 999,
              overflow: 'hidden',
            }}
          >
            <AnimatePresence initial={false} mode="wait">
              {!open ? (
                <motion.div
                  key="closed"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.12 }}
                  onClick={() => onOpenChange(true)}
                  style={{
                    height: 46,
                    display: 'flex',
                    alignItems: 'center',
                    padding: '0 18px',
                    cursor: 'text',
                  }}
                >
                  <span style={{ fontSize: 14, color: 'var(--text-subtle)' }}>
                    发消息给 {conv?.name ?? '对方'}…
                  </span>
                </motion.div>
              ) : (
                <motion.div
                  key="open"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  style={{ padding: '12px 14px' }}
                  onKeyDown={e => {
                    if (e.key === 'Escape') closeComposer()
                  }}
                >
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.24, delay: 0.06 }}
                  >
                    {quoted && (
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 8,
                          background: 'var(--surface)',
                          border: '1px solid var(--grey-100)',
                          borderRadius: 10,
                          padding: '7px 10px',
                          marginBottom: 8,
                        }}
                      >
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div
                            style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--grey-600)' }}
                          >
                            {quoted.author}
                          </div>
                          <div
                            style={{
                              fontSize: 12,
                              color: 'var(--grey-500)',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {quoted.preview}
                          </div>
                        </div>
                        <button
                          onClick={() => onClearQuote()}
                          aria-label="取消引用"
                          style={{
                            border: 'none',
                            background: 'none',
                            color: 'var(--grey-350)',
                            fontSize: 15,
                            cursor: 'pointer',
                            padding: 0,
                            flexShrink: 0,
                          }}
                        >
                          ✕
                        </button>
                      </div>
                    )}
                    {recording ? (
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 10,
                          background: 'var(--brand-tint)',
                          borderRadius: 10,
                          padding: '12px 14px',
                          height: 66,
                        }}
                      >
                        <motion.span
                          animate={{ opacity: [1, 0.25, 1] }}
                          transition={{ duration: 1, repeat: Infinity }}
                          style={{
                            width: 9,
                            height: 9,
                            borderRadius: '50%',
                            background: 'var(--brand)',
                            display: 'block',
                          }}
                        />
                        <span style={{ fontSize: 14, color: '#B23A46', fontWeight: 600 }}>
                          {fmtDur(recordSecs)}
                        </span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 3, flex: 1 }}>
                          {Array.from({ length: 22 }).map((_, i) => (
                            <motion.span
                              key={i}
                              animate={{ scaleY: [0.4, 1, 0.4] }}
                              transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.05 }}
                              style={{
                                width: 2.5,
                                height: 22,
                                borderRadius: 2,
                                background: '#FF9AA8',
                                display: 'block',
                              }}
                            />
                          ))}
                        </div>
                        <span style={{ fontSize: 12, color: '#B23A46', flexShrink: 0 }}>
                          松开发送 · Esc 取消
                        </span>
                      </div>
                    ) : (
                      <textarea
                        value={draft}
                        onChange={e => onDraftChange(e.target.value)}
                        onKeyDown={e => {
                          if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
                            e.preventDefault()
                            submit()
                          }
                        }}
                        placeholder={`发消息给 ${conv?.name ?? '对方'}…`}
                        autoFocus
                        rows={2}
                        style={{
                          width: '100%',
                          display: 'block',
                          border: 'none',
                          outline: 'none',
                          background: 'var(--grey-15)',
                          borderRadius: 10,
                          padding: '10px 12px',
                          fontSize: 14,
                          resize: 'none',
                          fontFamily: 'inherit',
                          color: 'var(--grey-900)',
                          lineHeight: 1.5,
                        }}
                      />
                    )}
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.24, delay: 0.14 }}
                    style={{ display: 'flex', alignItems: 'center', marginTop: 10 }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      {isGroup && (
                        <button
                          onClick={() => {
                            setMentionOpen(o => !o)
                            setEmojiOpen(false)
                            setNoteOpen(false)
                          }}
                          title="提及成员"
                          aria-label="提及成员"
                          style={{
                            width: 32,
                            height: 32,
                            borderRadius: '50%',
                            border: 'none',
                            background: mentionOpen ? '#E9E9EC' : 'transparent',
                            cursor: 'pointer',
                            color: mentionOpen ? 'var(--brand)' : 'var(--text-muted)',
                            fontSize: 15,
                            fontWeight: 700,
                            fontFamily: 'inherit',
                          }}
                        >
                          @
                        </button>
                      )}
                      <button
                        onPointerDown={startRecord}
                        onPointerUp={() => stopRecord(true)}
                        onPointerLeave={() => recording && stopRecord(false)}
                        title="按住说话"
                        aria-label="按住说话"
                        style={{
                          width: 32,
                          height: 32,
                          borderRadius: '50%',
                          border: 'none',
                          background: recording ? '#FFE1E5' : 'transparent',
                          cursor: 'pointer',
                          color: recording ? 'var(--brand)' : 'var(--text-muted)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <MicIcon />
                      </button>
                      <button
                        onClick={() => {
                          setEmojiOpen(o => !o)
                          setNoteOpen(false)
                        }}
                        title="表情"
                        style={{
                          width: 32,
                          height: 32,
                          borderRadius: '50%',
                          border: 'none',
                          background: emojiOpen ? '#E9E9EC' : 'transparent',
                          cursor: 'pointer',
                          color: 'var(--text-muted)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <SmileIcon />
                      </button>
                      <button
                        onClick={doSendPhoto}
                        title="发送图片"
                        style={{
                          width: 32,
                          height: 32,
                          borderRadius: '50%',
                          border: 'none',
                          background: 'transparent',
                          cursor: 'pointer',
                          color: 'var(--text-muted)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <ImageIcon />
                      </button>
                      <button
                        onClick={() => {
                          setNoteOpen(o => !o)
                          setEmojiOpen(false)
                        }}
                        title="分享笔记"
                        style={{
                          width: 32,
                          height: 32,
                          borderRadius: '50%',
                          border: 'none',
                          background: noteOpen ? '#E9E9EC' : 'transparent',
                          cursor: 'pointer',
                          color: 'var(--text-muted)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <NoteIcon />
                      </button>
                    </div>
                    <div style={{ flex: 1 }} />
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <button
                        onClick={submit}
                        disabled={!draft.trim()}
                        style={{
                          background: draft.trim() ? 'var(--brand)' : '#F3C1C9',
                          color: 'var(--surface)',
                          border: 'none',
                          borderRadius: 999,
                          padding: '7px 16px',
                          fontSize: 13,
                          fontWeight: 600,
                          cursor: draft.trim() ? 'pointer' : 'default',
                          fontFamily: 'inherit',
                        }}
                      >
                        发送
                      </button>
                      <button
                        onClick={closeComposer}
                        style={{
                          background: '#EDEDEF',
                          color: 'var(--text-muted)',
                          border: 'none',
                          borderRadius: 999,
                          padding: '7px 16px',
                          fontSize: 13,
                          cursor: 'pointer',
                          fontFamily: 'inherit',
                        }}
                      >
                        取消
                      </button>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}

        {/* @提及列表 */}
        <AnimatePresence>
          {mentionOpen && open && conv && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 6 }}
              transition={{ duration: 0.15 }}
              style={{
                position: 'absolute',
                bottom: 78,
                left: 0,
                width: 230,
                maxHeight: 280,
                overflowY: 'auto',
                background: 'var(--surface)',
                border: '1px solid #EEEEEE',
                borderRadius: 14,
                boxShadow: '0 18px 44px -20px rgba(0,0,0,0.4)',
                padding: 8,
                zIndex: 31,
              }}
            >
              {(() => {
                const canAll =
                  groupOwner[conv.id] === 'me' || (groupAdmins[conv.id] ?? []).includes('me')
                return (
                  <>
                    {canAll && (
                      <button
                        onClick={() => insertMention('所有人')}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 8,
                          width: '100%',
                          border: 'none',
                          background: 'none',
                          borderRadius: 9,
                          padding: '8px 8px',
                          cursor: 'pointer',
                          fontFamily: 'inherit',
                          fontSize: 13,
                          color: 'var(--brand)',
                          fontWeight: 600,
                        }}
                        onMouseEnter={e => (e.currentTarget.style.background = '#FFF6F7')}
                        onMouseLeave={e => (e.currentTarget.style.background = 'none')}
                      >
                        @所有人
                      </button>
                    )}
                    {(conv.memberIds ?? []).map(mid => {
                      const m = getMember(mid)
                      if (!m) return null
                      return (
                        <button
                          key={mid}
                          onClick={() => insertMention(m.name)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 8,
                            width: '100%',
                            border: 'none',
                            background: 'none',
                            borderRadius: 9,
                            padding: '7px 8px',
                            cursor: 'pointer',
                            fontFamily: 'inherit',
                            fontSize: 13,
                            color: 'var(--ink-soft)',
                          }}
                          onMouseEnter={e => (e.currentTarget.style.background = 'var(--grey-25)')}
                          onMouseLeave={e => (e.currentTarget.style.background = 'none')}
                        >
                          <Avatar avatar={m.avatar} size={24} />
                          {m.name}
                        </button>
                      )
                    })}
                  </>
                )
              })()}
            </motion.div>
          )}
        </AnimatePresence>

        {/* 表情面板 */}
        <AnimatePresence>
          {emojiOpen && open && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 6 }}
              transition={{ duration: 0.15 }}
              style={{
                position: 'absolute',
                bottom: 78,
                left: 0,
                background: 'var(--surface)',
                border: '1px solid #EEEEEE',
                borderRadius: 14,
                boxShadow: '0 18px 44px -20px rgba(0,0,0,0.4)',
                padding: 10,
                display: 'flex',
                gap: 4,
                zIndex: 30,
              }}
            >
              {EMOJIS.map(e => (
                <button
                  key={e}
                  onClick={() => doSendEmoji(e)}
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    border: 'none',
                    background: 'none',
                    cursor: 'pointer',
                    fontSize: 21,
                    lineHeight: 1,
                  }}
                  onMouseEnter={ev => (ev.currentTarget.style.background = 'var(--grey-15)')}
                  onMouseLeave={ev => (ev.currentTarget.style.background = 'none')}
                >
                  {e}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* 笔记选择器 */}
        <AnimatePresence>
          {noteOpen && open && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 6 }}
              transition={{ duration: 0.16 }}
              style={{
                position: 'absolute',
                bottom: 78,
                left: 0,
                width: 420,
                background: 'var(--surface)',
                border: '1px solid #EEEEEE',
                borderRadius: 16,
                boxShadow: '0 22px 50px -24px rgba(0,0,0,0.45)',
                zIndex: 30,
                overflow: 'hidden',
              }}
            >
              <div style={{ padding: '12px 14px 8px' }}>
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 700,
                    color: 'var(--ink-strong)',
                    marginBottom: 10,
                  }}
                >
                  分享笔记
                </div>
                <input
                  value={noteQuery}
                  onChange={e => setNoteQuery(e.target.value)}
                  placeholder="搜索笔记"
                  style={{
                    width: '100%',
                    height: 34,
                    borderRadius: 17,
                    border: 'none',
                    outline: 'none',
                    background: 'var(--grey-15)',
                    padding: '0 14px',
                    fontSize: 13,
                    fontFamily: 'inherit',
                  }}
                />
              </div>
              <div style={{ maxHeight: 300, overflowY: 'auto', padding: '4px 8px 10px' }}>
                {noteResults.map(p => (
                  <div
                    key={p.id}
                    onClick={() => doSendNote(p)}
                    style={{
                      display: 'flex',
                      gap: 10,
                      alignItems: 'center',
                      padding: '8px 6px',
                      borderRadius: 10,
                      cursor: 'pointer',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'var(--grey-25)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                  >
                    <div
                      style={{
                        width: 46,
                        height: 46,
                        borderRadius: 8,
                        overflow: 'hidden',
                        background: 'var(--grey-50)',
                        flexShrink: 0,
                      }}
                    >
                      <img
                        src={`https://images.unsplash.com/${p.img ?? PHOTO_POOL[0]}?w=120&h=120&fit=crop&auto=format`}
                        alt=""
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          display: 'block',
                        }}
                      />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          fontSize: 13,
                          color: 'var(--ink-soft)',
                          lineHeight: 1.4,
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical' as const,
                          overflow: 'hidden',
                        }}
                      >
                        {(p.title ?? p.quote ?? '笔记').replace(/\n/g, ' ')}
                      </div>
                      <div style={{ fontSize: 11.5, color: 'var(--grey-400)', marginTop: 3 }}>
                        {p.author} · ♥ {p.likes}
                      </div>
                    </div>
                  </div>
                ))}
                {noteResults.length === 0 && (
                  <div
                    style={{
                      padding: '20px 0',
                      textAlign: 'center',
                      color: '#BDBDBD',
                      fontSize: 12.5,
                    }}
                  >
                    没有找到笔记
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
