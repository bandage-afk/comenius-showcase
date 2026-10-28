// 「查找聊天记录」浮层的内容：搜索框 + 类型筛选（全部/图片/语音/笔记/链接）+ 结果列表。
//
// 为什么只搬内容、不搬浮层本身：AnimatePresence + Overlay 留在 GroupPanel 里，
// 这样进出场动画与 DOM 结构和拆分前逐字一致；本组件只在浮层打开时挂载，
// 所以搜索词与筛选天然是干净的（以前是在入口按钮里手动 setHistoryQuery('') / setHistoryTab('all') 重置）。

import { useMemo, useState } from 'react'
import { useCommunity } from '../../communityStore'
import type { Message } from '../../community/data'
import { previewOf } from './parts'

export default function HistorySearchPanel({
  thread,
  onClose,
  onJump,
}: {
  /** 当前会话的全部消息 */
  thread: Message[]
  onClose: () => void
  /** 点某条结果：由父组件负责关浮层 + 滚到那条消息 */
  onJump: (index: number) => void
}) {
  const getMember = useCommunity(s => s.getMember)
  const [historyQuery, setHistoryQuery] = useState('')
  const [historyTab, setHistoryTab] = useState<'all' | 'image' | 'voice' | 'note' | 'link'>('all')

  /** 聊天记录搜索结果 */
  const historyResults = useMemo(() => {
    const q = historyQuery.trim().toLowerCase()
    return thread
      .map((m, index) => ({ m, index }))
      .filter(({ m }) => {
        if (m.type === 'system') return false
        if (historyTab === 'image' && !(m.type === 'image' || m.type === 'video')) return false
        if (historyTab === 'voice' && m.type !== 'voice') return false
        if (historyTab === 'note' && m.type !== 'note') return false
        if (historyTab === 'link' && !/https?:\/\//.test(m.text ?? '')) return false
        if (!q) return true
        return `${m.text ?? ''} ${m.note?.title ?? ''} ${m.note?.author ?? ''}`
          .toLowerCase()
          .includes(q)
      })
      .slice(-60)
      .reverse()
  }, [thread, historyQuery, historyTab])

  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 12 }}>
        <span style={{ flex: 1, fontSize: 14, fontWeight: 700, color: 'var(--ink-strong)' }}>
          查找聊天记录
        </span>
        <button
          onClick={onClose}
          style={{
            width: 26,
            height: 26,
            borderRadius: '50%',
            border: 'none',
            background: 'var(--grey-15)',
            color: '#777',
            cursor: 'pointer',
          }}
        >
          ✕
        </button>
      </div>
      <input
        value={historyQuery}
        onChange={e => setHistoryQuery(e.target.value)}
        placeholder="搜索聊天内容"
        autoFocus
        style={{
          width: '100%',
          height: 36,
          border: '1px solid #EAEAEA',
          background: 'var(--grey-25)',
          borderRadius: 10,
          padding: '0 12px',
          fontSize: 13,
          fontFamily: 'inherit',
          outline: 'none',
          color: 'var(--grey-900)',
        }}
      />
      <div style={{ display: 'flex', gap: 6, margin: '10px 0' }}>
        {(
          [
            ['all', '全部'],
            ['image', '图片'],
            ['voice', '语音'],
            ['note', '笔记'],
            ['link', '链接'],
          ] as const
        ).map(([k, l]) => (
          <button
            key={k}
            onClick={() => setHistoryTab(k)}
            style={{
              border: 'none',
              borderRadius: 999,
              padding: '5px 12px',
              fontSize: 12,
              cursor: 'pointer',
              fontFamily: 'inherit',
              background: historyTab === k ? '#FFE9EC' : 'var(--grey-15)',
              color: historyTab === k ? 'var(--brand)' : 'var(--text-muted)',
              fontWeight: historyTab === k ? 600 : 400,
            }}
          >
            {l}
          </button>
        ))}
      </div>
      <div style={{ maxHeight: 320, overflowY: 'auto' }}>
        {historyResults.length === 0 && (
          <div
            style={{
              padding: '26px 0',
              textAlign: 'center',
              color: '#BDBDBD',
              fontSize: 12.5,
            }}
          >
            没有找到相关记录
          </div>
        )}
        {historyResults.map(({ m, index }) => (
          <button
            key={index}
            onClick={() => onJump(index)}
            style={{
              display: 'block',
              width: '100%',
              textAlign: 'left',
              border: 'none',
              background: 'none',
              padding: '9px 8px',
              borderRadius: 9,
              cursor: 'pointer',
              fontFamily: 'inherit',
            }}
            onMouseEnter={e => (e.currentTarget.style.background = 'var(--grey-25)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'none')}
          >
            <div
              style={{
                fontSize: 12.5,
                color: 'var(--ink-soft)',
                lineHeight: 1.5,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {getMember(m.senderId)?.name
                ? `${getMember(m.senderId)!.name}: `
                : m.from === 'me'
                  ? '我: '
                  : ''}
              {previewOf(m)}
            </div>
            <div style={{ fontSize: 11, color: 'var(--grey-400)', marginTop: 2 }}>{m.time}</div>
          </button>
        ))}
      </div>
    </>
  )
}
