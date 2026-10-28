// 会话行（ConvRow）：左滑删除 / 右滑置顶 / 长按更多
// 从 MessagesPage 拆出，列表容器仍在 MessagesPage 里按分区渲染
import { useRef, useState } from 'react'
import type { Conversation } from '../../community/data'
import { Avatar, BellOffIcon, EASE, LONG_PRESS_MS, PinIcon, SWIPE_W, TrashIcon } from './parts'

export type RowAction = {
  key: string
  label: string
  icon: React.ReactNode
  danger?: boolean
  onClick: () => void
}

export function ConvRow({
  conv,
  active,
  pinned,
  muted,
  typing,
  mentioned,
  watched,
  openDir,
  onOpen,
  onSetOpenDir,
  onPin,
  onRemove,
  onLongPress,
}: {
  conv: Conversation
  active: boolean
  pinned: boolean
  muted: boolean
  typing: boolean
  mentioned?: boolean
  watched?: boolean
  openDir: 'pin' | 'delete' | null
  onOpen: () => void
  onSetOpenDir: (d: 'pin' | 'delete' | null) => void
  onPin: () => void
  onRemove: () => void
  onLongPress: () => void
}) {
  const [dragDx, setDragDx] = useState<number | null>(null)
  const startRef = useRef<{ x: number; base: number } | null>(null)
  const movedRef = useRef(false)
  const pressTimer = useRef<number | null>(null)
  const longFired = useRef(false)
  const restDx = openDir === 'delete' ? -SWIPE_W : openDir === 'pin' ? SWIPE_W : 0
  const dx = dragDx ?? restDx

  const clearTimer = () => {
    if (pressTimer.current) {
      window.clearTimeout(pressTimer.current)
      pressTimer.current = null
    }
  }

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    startRef.current = { x: e.clientX, base: dx }
    movedRef.current = false
    longFired.current = false
    e.currentTarget.setPointerCapture(e.pointerId)
    clearTimer()
    pressTimer.current = window.setTimeout(() => {
      longFired.current = true
      movedRef.current = true
      onLongPress()
    }, LONG_PRESS_MS)
  }

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const s = startRef.current
    if (!s) return
    const delta = e.clientX - s.x
    if (Math.abs(delta) > 6) {
      movedRef.current = true
      clearTimer()
    }
    setDragDx(Math.max(-SWIPE_W, Math.min(SWIPE_W, s.base + delta)))
  }

  const onPointerUp = () => {
    clearTimer()
    const s = startRef.current
    startRef.current = null
    if (!s) return
    const finalDx = dragDx ?? restDx
    if (finalDx <= -SWIPE_W / 2) onSetOpenDir('delete')
    else if (finalDx >= SWIPE_W / 2) onSetOpenDir('pin')
    else onSetOpenDir(null)
    setDragDx(null)
  }

  return (
    <div
      data-conv-id={conv.id}
      style={{ position: 'relative', borderRadius: 12, overflow: 'hidden', marginBottom: 2 }}
    >
      <div
        style={{ position: 'absolute', inset: 0, display: 'flex', justifyContent: 'space-between' }}
      >
        <button
          data-action="pin"
          tabIndex={openDir === 'pin' ? 0 : -1}
          aria-hidden={openDir !== 'pin'}
          onClick={onPin}
          aria-label={pinned ? '取消置顶' : '置顶'}
          title={pinned ? '取消置顶' : '置顶'}
          style={{
            width: SWIPE_W,
            border: 'none',
            background: '#E7F6EC',
            color: 'var(--success)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <PinIcon />
        </button>
        <div style={{ flex: 1 }} />
        <button
          data-action="delete"
          tabIndex={openDir === 'delete' ? 0 : -1}
          aria-hidden={openDir !== 'delete'}
          onClick={onRemove}
          aria-label="删除会话"
          title="删除会话"
          style={{
            width: SWIPE_W,
            border: 'none',
            background: '#FDE7EB',
            color: 'var(--brand)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <TrashIcon />
        </button>
      </div>

      <div
        data-conv-row={conv.id}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onContextMenu={e => {
          e.preventDefault()
          onLongPress()
        }}
        onClick={() => {
          if (movedRef.current || longFired.current) return
          if (openDir) {
            onSetOpenDir(null)
            return
          }
          onOpen()
        }}
        style={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          padding: '11px 12px',
          background: active ? '#F4F4F5' : 'var(--surface)',
          cursor: 'pointer',
          touchAction: 'pan-y',
          transform: `translateX(${dx}px)`,
          transition: dragDx === null ? `transform 0.24s cubic-bezier(${EASE.join(',')})` : 'none',
          userSelect: 'none',
        }}
      >
        {/* 头像 + 在线绿点（在线状态借鉴 tutor 的 Messaging 页） */}
        <span style={{ position: 'relative', flexShrink: 0, display: 'block' }}>
          <Avatar avatar={conv.avatar} size={50} square={conv.isGroup} />
          {conv.online && !conv.isGroup && (
            <span
              title="在线"
              style={{
                position: 'absolute',
                right: -1,
                bottom: -1,
                width: 13,
                height: 13,
                borderRadius: '50%',
                background: '#4CC38A',
                border: '2px solid var(--surface)',
                display: 'block',
              }}
            />
          )}
        </span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 4 }}>
            {pinned && (
              <span style={{ color: 'var(--success)', display: 'flex' }}>
                <PinIcon size={12} />
              </span>
            )}
            <span
              style={{
                flex: 1,
                minWidth: 0,
                fontSize: 14,
                fontWeight: 600,
                color: 'var(--ink-strong)',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {conv.name}
              {conv.verified && (
                <span style={{ marginLeft: 4, color: '#1E7EE6', fontSize: 11 }}>✓</span>
              )}
              {conv.isGroup && (
                <span
                  style={{
                    marginLeft: 5,
                    fontSize: 10.5,
                    color: 'var(--grey-500)',
                    fontWeight: 500,
                  }}
                >
                  {conv.memberIds?.length ?? 0}人
                </span>
              )}
            </span>
            <span style={{ fontSize: 11, color: '#C0C0C0', flexShrink: 0 }}>{conv.time}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            {muted && (
              <span style={{ color: 'var(--grey-300)', display: 'flex', flexShrink: 0 }}>
                <BellOffIcon size={12} />
              </span>
            )}
            {mentioned && (
              <span
                style={{
                  flexShrink: 0,
                  fontSize: 11,
                  fontWeight: 700,
                  color: 'var(--brand)',
                }}
              >
                [有人@我]
              </span>
            )}
            <span
              style={{
                flex: 1,
                minWidth: 0,
                fontSize: 12.5,
                color: conv.unread > 0 && !muted ? 'var(--grey-600)' : 'var(--grey-400)',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {typing ? '正在输入…' : conv.last || '开始聊天吧'}
            </span>
          </div>
        </div>
        {conv.unread > 0 &&
          (muted && !watched ? (
            <span
              style={{
                position: 'absolute',
                right: 14,
                bottom: 16,
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: '#C9C9C9',
              }}
            />
          ) : (
            <span
              style={{
                position: 'absolute',
                right: 12,
                bottom: 14,
                minWidth: 17,
                height: 17,
                padding: '0 5px',
                background: 'var(--brand)',
                borderRadius: 999,
                color: 'var(--surface)',
                fontSize: 10,
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {conv.unread}
            </span>
          ))}
      </div>
    </div>
  )
}
