import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import AppShell from '../components/AppShell'
import type { NavProps } from '../App'

/**
 * Amos AI 页：空态按「发布页面设计」里的 AI 页截图重做 ——
 * 一句问候「晚上好，想探索些什么？」+ 搜索式提问框（左侧 +）+ 推荐问题列表。
 * 提问后仍然走原来的对话逻辑（气泡 + mock 回复），右侧的对话列表抽屉保留。
 */

interface Msg {
  role: 'user' | 'assistant'
  text: string
}
interface Conv {
  id: number
  name: string
  messages: Msg[]
}

let nextId = 1

const AI_REPLIES = [
  '好的，收到！我正在为你整理答案（接入真实模型后这里会有完整回复）。',
  '这个问题很有意思，我从几个角度帮你分析一下，稍等。',
  '明白了，已按你的要求整理成学习计划，一会儿发给你。',
]

const SUGGESTIONS = [
  'A-Level 数学都考哪些内容？',
  'TMUA 真题怎么刷？',
  '留学文书怎么写？',
  '剑桥面试怎么准备？',
  'UCAS 时间线怎么排？',
  '每天怎么安排学习计划？',
]

const greeting = (() => {
  const h = new Date().getHours()
  if (h < 6) return '凌晨好'
  if (h < 12) return '早上好'
  if (h < 14) return '中午好'
  if (h < 18) return '下午好'
  return '晚上好'
})()

/** 提问框：搜索框造型，左下「+」，右下发送；占位文案轮播推荐问题 */
export function AmosInput({
  draft,
  setDraft,
  send,
  menuOpen,
  setMenuOpen,
}: {
  draft: string
  setDraft: (s: string) => void
  send: () => void
  menuOpen: boolean
  setMenuOpen: (b: boolean) => void
}) {
  const [hint, setHint] = useState(0)
  useEffect(() => {
    const t = window.setInterval(() => setHint(i => (i + 1) % SUGGESTIONS.length), 3200)
    return () => window.clearInterval(t)
  }, [])

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        background: 'var(--surface)',
        border: '1px solid #EAEAEA',
        borderRadius: 26,
        padding: '20px 20px 12px',
        minHeight: 136,
        boxShadow: '0 14px 40px -26px rgba(0,0,0,0.28)',
      }}
    >
      <textarea
        value={draft}
        onChange={e => setDraft(e.target.value)}
        onKeyDown={e => {
          if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) send()
        }}
        placeholder={SUGGESTIONS[hint]}
        rows={2}
        style={{
          width: '100%',
          display: 'block',
          border: 'none',
          outline: 'none',
          background: 'transparent',
          fontSize: 16,
          resize: 'none',
          fontFamily: 'inherit',
          color: 'var(--ink-soft)',
          lineHeight: 1.6,
          maxHeight: 150,
          padding: '8px 4px 0',
        }}
      />
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginTop: 10,
          paddingTop: 8,
        }}
      >
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            title="添加"
            style={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              border: 'none',
              background: '#F2F2F4',
              color: 'var(--grey-800)',
              fontSize: 19,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              lineHeight: 1,
            }}
          >
            +
          </button>
          {menuOpen && (
            <div
              style={{
                position: 'absolute',
                bottom: 40,
                left: 0,
                background: 'var(--surface)',
                border: '1px solid #E7E7E7',
                borderRadius: 12,
                boxShadow: '0 12px 32px rgba(0,0,0,0.14)',
                padding: 6,
                zIndex: 5,
                width: 150,
              }}
            >
              <button
                onClick={() => {
                  setDraft(draft + ' 📄 文档')
                  setMenuOpen(false)
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  width: '100%',
                  padding: '9px 10px',
                  border: 'none',
                  background: 'none',
                  borderRadius: 8,
                  cursor: 'pointer',
                  fontSize: 13,
                  fontFamily: 'inherit',
                  textAlign: 'left',
                  color: 'var(--ink-soft)',
                }}
              >
                📄 上传文档
              </button>
              <button
                onClick={() => {
                  setDraft(draft + ' 🖼️ 图片')
                  setMenuOpen(false)
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  width: '100%',
                  padding: '9px 10px',
                  border: 'none',
                  background: 'none',
                  borderRadius: 8,
                  cursor: 'pointer',
                  fontSize: 13,
                  fontFamily: 'inherit',
                  textAlign: 'left',
                  color: 'var(--ink-soft)',
                }}
              >
                🖼️ 上传图片
              </button>
            </div>
          )}
        </div>
        <button
          onClick={send}
          disabled={!draft.trim()}
          title="发送"
          style={{
            width: 34,
            height: 34,
            flexShrink: 0,
            borderRadius: '50%',
            border: 'none',
            background: draft.trim() ? 'var(--brand)' : 'var(--grey-15)',
            color: draft.trim() ? 'var(--surface)' : 'var(--grey-300)',
            cursor: draft.trim() ? 'pointer' : 'default',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'background 0.15s',
          }}
        >
          <svg
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M12 19V5M5 12l7-7 7 7" />
          </svg>
        </button>
      </div>
    </div>
  )
}

function SuggestList({ onPick }: { onPick: (q: string) => void }) {
  return (
    <div
      style={{
        width: '100%',
        display: 'grid',
        gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
        columnGap: 28,
        rowGap: 2,
      }}
    >
      {SUGGESTIONS.map(q => (
        <button
          key={q}
          onClick={() => onPick(q)}
          style={{
            textAlign: 'left',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontFamily: 'inherit',
            fontSize: 14,
            color: '#5A5A5A',
            padding: '12px 10px',
            borderRadius: 10,
            lineHeight: 1.5,
            transition: 'background 0.15s, color 0.15s',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = '#F6F6F7'
            e.currentTarget.style.color = '#1F1F1F'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = 'none'
            e.currentTarget.style.color = '#5A5A5A'
          }}
        >
          {q}
        </button>
      ))}
    </div>
  )
}

export default function AmosAIPage({ navigate }: NavProps) {
  const [convs, setConvs] = useState<Conv[]>([])
  const [activeId, setActiveId] = useState<number | null>(null)
  const [draft, setDraft] = useState('')
  const [menuOpen, setMenuOpen] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editName, setEditName] = useState('')
  const [convOpen, setConvOpen] = useState(false)
  const msgsEndRef = useRef<HTMLDivElement | null>(null)

  const active = convs.find(c => c.id === activeId) ?? null
  const hasMessages = !!active && active.messages.length > 0

  useEffect(() => {
    msgsEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [active?.messages.length])

  const createConv = () => {
    const c: Conv = { id: nextId++, name: '新对话', messages: [] }
    setConvs(list => [...list, c])
    setActiveId(c.id)
    setEditingId(null)
  }

  const rename = (id: number, name: string) => {
    setConvs(list => list.map(c => (c.id === id ? { ...c, name: name.trim() || '新对话' } : c)))
    setEditingId(null)
  }

  const remove = (id: number) => {
    setConvs(list => {
      const next = list.filter(c => c.id !== id)
      if (activeId === id) setActiveId(next[0]?.id ?? null)
      return next
    })
  }

  const ensureActive = (): number => {
    if (activeId && convs.some(c => c.id === activeId)) return activeId
    const c: Conv = { id: nextId++, name: '新对话', messages: [] }
    setConvs(list => [...list, c])
    setActiveId(c.id)
    return c.id
  }

  const sendText = (text: string) => {
    const t = text.trim()
    if (!t) return
    const id = ensureActive()
    setConvs(list =>
      list.map(c =>
        c.id === id ? { ...c, messages: [...c.messages, { role: 'user', text: t }] } : c,
      ),
    )
    setDraft('')
    setMenuOpen(false)
    window.setTimeout(() => {
      setConvs(list =>
        list.map(c =>
          c.id === id
            ? {
                ...c,
                messages: [
                  ...c.messages,
                  { role: 'assistant', text: AI_REPLIES[id % AI_REPLIES.length] },
                ],
              }
            : c,
        ),
      )
    }, 500)
  }

  const send = () => sendText(draft)

  return (
    <AppShell fullHeight contentLayout="row" navigate={navigate} currentPage="amos">
      {/* 对话列表抽屉 */}
      <div style={{ display: 'flex', alignItems: 'flex-start' }}>
        {convOpen && (
          <aside
            style={{
              width: 264,
              flexShrink: 0,
              alignSelf: 'stretch',
              background: 'var(--surface)',
              borderRight: '1px solid var(--grey-50)',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <div style={{ padding: '14px 12px 12px' }}>
              <button
                onClick={createConv}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 7,
                  background: 'none',
                  border: 'none',
                  color: 'var(--brand)',
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  padding: '6px 4px',
                }}
              >
                <svg
                  width="17"
                  height="17"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#FF2442"
                  strokeWidth="2.2"
                >
                  <path d="M12 5v14M5 12h14" />
                </svg>
                添加聊天
              </button>
            </div>
            <div style={{ height: 1, background: 'var(--grey-75)', margin: '0 12px 8px' }} />
            <div style={{ flex: 1, overflowY: 'auto', padding: '0 8px 12px' }}>
              {convs.length === 0 && (
                <div
                  style={{
                    padding: '20px 12px',
                    color: 'var(--grey-500)',
                    fontSize: 13,
                    textAlign: 'center',
                    lineHeight: 1.6,
                  }}
                >
                  还没有对话
                  <br />
                  点"添加聊天"新建一个
                </div>
              )}
              {convs.map(c => (
                <div
                  key={c.id}
                  onClick={() => {
                    setActiveId(c.id)
                    setEditingId(null)
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                    padding: '8px 6px 8px 10px',
                    borderRadius: 8,
                    cursor: 'pointer',
                    background: c.id === activeId ? '#F4F4F5' : 'transparent',
                    marginBottom: 2,
                    minWidth: 0,
                  }}
                >
                  {editingId === c.id ? (
                    <input
                      autoFocus
                      value={editName}
                      onChange={e => setEditName(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter') rename(c.id, editName)
                      }}
                      onBlur={() => rename(c.id, editName)}
                      style={{
                        flex: 1,
                        minWidth: 0,
                        border: '1px solid var(--grey-200)',
                        borderRadius: 6,
                        padding: '4px 6px',
                        fontSize: 13,
                        outline: 'none',
                        fontFamily: 'inherit',
                        background: 'var(--surface)',
                      }}
                    />
                  ) : (
                    <>
                      <span
                        style={{
                          flex: 1,
                          minWidth: 0,
                          fontSize: 13,
                          color: c.id === activeId ? 'var(--ink-soft)' : 'var(--grey-800)',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        {c.name}
                      </span>
                      <button
                        title="改名"
                        onClick={e => {
                          e.stopPropagation()
                          setEditingId(c.id)
                          setEditName(c.name)
                        }}
                        style={{
                          width: 24,
                          height: 24,
                          border: 'none',
                          background: 'none',
                          cursor: 'pointer',
                          fontSize: 12,
                          color: 'var(--text-subtle)',
                          flexShrink: 0,
                        }}
                      >
                        ✎
                      </button>
                      <button
                        title="删除"
                        onClick={e => {
                          e.stopPropagation()
                          remove(c.id)
                        }}
                        style={{
                          width: 24,
                          height: 24,
                          border: 'none',
                          background: 'none',
                          cursor: 'pointer',
                          fontSize: 12,
                          color: 'var(--text-subtle)',
                          flexShrink: 0,
                        }}
                      >
                        🗑
                      </button>
                    </>
                  )}
                </div>
              ))}
            </div>
          </aside>
        )}
        <button
          onClick={() => setConvOpen(o => !o)}
          title="对话列表"
          style={{
            width: 40,
            height: 40,
            margin: 12,
            flexShrink: 0,
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <svg
            width="26"
            height="26"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#1F1F1F"
            strokeWidth="1.8"
          >
            <rect x="3" y="3" width="18" height="18" rx="3" />
            <line x1="8" y1="9" x2="16" y2="9" />
            <line x1="8" y1="13" x2="16" y2="13" />
          </svg>
        </button>
      </div>

      {/* 主区域 */}
      <main
        style={{
          flex: 1,
          minWidth: 0,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {hasMessages ? (
          <>
            <div
              style={{
                flex: 1,
                overflowY: 'auto',
                padding: '24px 20px',
                display: 'flex',
                flexDirection: 'column',
                gap: 14,
                maxWidth: 780,
                width: '100%',
                margin: '0 auto',
              }}
            >
              {active!.messages.map((m, i) =>
                m.role === 'assistant' ? (
                  <div
                    key={i}
                    style={{ display: 'flex', gap: 10, alignSelf: 'flex-start', maxWidth: '80%' }}
                  >
                    <div
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: 8,
                        background: 'linear-gradient(135deg,var(--brand),#FF7A6E)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="#fff">
                        <path d="M12 2c.8 4.7 3.3 7.2 8 8-4.7.8-7.2 3.3-8 8-.8-4.7-3.3-7.2-8-8 4.7-.8 7.2-3.3 8-8z" />
                      </svg>
                    </div>
                    <div
                      style={{
                        background: 'var(--surface)',
                        border: '1px solid #EAEAEA',
                        borderRadius: '4px 14px 14px 14px',
                        padding: '10px 14px',
                        fontSize: 14,
                        lineHeight: 1.65,
                        color: 'var(--ink-soft)',
                        whiteSpace: 'pre-wrap',
                      }}
                    >
                      {m.text}
                    </div>
                  </div>
                ) : (
                  <div
                    key={i}
                    style={{
                      alignSelf: 'flex-end',
                      maxWidth: '80%',
                      background: 'var(--brand)',
                      color: 'var(--surface)',
                      borderRadius: '14px 4px 14px 14px',
                      padding: '10px 14px',
                      fontSize: 14,
                      lineHeight: 1.65,
                      whiteSpace: 'pre-wrap',
                    }}
                  >
                    {m.text}
                  </div>
                ),
              )}
              <div ref={msgsEndRef} />
            </div>
            <motion.div
              layout
              transition={{ type: 'spring', stiffness: 220, damping: 28 }}
              style={{
                flexShrink: 0,
                display: 'flex',
                alignItems: 'flex-end',
                justifyContent: 'center',
                padding: '14px 20px 26px',
              }}
            >
              <div style={{ width: '100%', maxWidth: 680 }}>
                <AmosInput
                  draft={draft}
                  setDraft={setDraft}
                  send={send}
                  menuOpen={menuOpen}
                  setMenuOpen={setMenuOpen}
                />
              </div>
            </motion.div>
          </>
        ) : (
          <div style={{ flex: 1, overflowY: 'auto' }}>
            <div
              style={{
                maxWidth: 720,
                margin: '0 auto',
                padding: '104px 32px 48px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 26,
              }}
            >
              <div
                style={{
                  fontSize: 31,
                  fontWeight: 600,
                  color: 'var(--ink-soft)',
                  textAlign: 'center',
                  letterSpacing: 0.3,
                  lineHeight: 1.3,
                }}
              >
                {greeting}，想探索些什么？
              </div>
              <AmosInput
                draft={draft}
                setDraft={setDraft}
                send={send}
                menuOpen={menuOpen}
                setMenuOpen={setMenuOpen}
              />
              <SuggestList onPick={sendText} />
            </div>
          </div>
        )}
      </main>
    </AppShell>
  )
}
