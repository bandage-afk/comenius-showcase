// 从 MessagesPage 拆出的公共件：图标、气泡组件、格式化工具与弹层
import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import type { Conversation, Message, NoteCard } from '../../community/data'
import { useCommunity } from '../../communityStore'

export const imgUrl = (avatar: string, w = 88) =>
  `https://images.unsplash.com/${avatar}?w=${w}&h=${w}&fit=crop&auto=format`

export const fmtDur = (s: number) =>
  `${Math.floor(s / 60)}:${String(Math.round(s % 60)).padStart(2, '0')}`

/** 群设置面板里的小标题样式（GroupPanel / MemberList 共用，别各抄一份） */
export const panelLabel = {
  fontSize: 12,
  fontWeight: 700,
  color: 'var(--grey-600)',
  letterSpacing: 0.3,
  marginBottom: 10,
}

/** 群设置面板里的卡片样式（同上，共用） */
export const panelCard = {
  background: 'var(--surface)',
  border: '1px solid var(--grey-75)',
  borderRadius: 12,
  padding: '12px 14px',
  marginBottom: 14,
}

/** 群公告的时间戳（本地化） */
export const fmtTime = (t: number) =>
  new Date(t).toLocaleString('zh-CN', {
    month: 'numeric',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

/** 引用某条消息时显示的一行摘要 */
export const previewOf = (m: Message) =>
  m.type === 'text'
    ? (m.text ?? '')
    : m.type === 'image'
      ? '[图片]'
      : m.type === 'video'
        ? '[视频]'
        : m.type === 'voice'
          ? `[语音 ${m.duration ?? 0}″]`
          : m.type === 'note'
            ? `[笔记] ${m.note?.title ?? ''}`
            : m.type === 'sticker'
              ? (m.emoji ?? '[表情]')
              : '[消息]'

export function dayLabel(t: string): string {
  if (!t) return '今天'
  if (t.includes('刚刚') || t.includes('分钟前') || t.includes('小时前')) return '今天'
  if (t.includes('昨天')) return '昨天'
  const m = t.match(/(\d{1,2})月(\d{1,2})日/)
  return m ? `${m[1]}月${m[2]}日` : '今天'
}

/* ── 图标 ── */

export const stroke = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.75,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
}

export const TrashIcon = ({ size = 21 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" {...stroke}>
    <path d="M4 7h16" />
    <path d="M10 4h4" />
    <path d="M6.5 7l.9 12.1a1.5 1.5 0 0 0 1.5 1.4h6.2a1.5 1.5 0 0 0 1.5-1.4L17.5 7" />
    <path d="M10.5 11v6M13.5 11v6" />
  </svg>
)

export const PinIcon = ({ size = 21 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" {...stroke}>
    <path d="M12 13.5V21" />
    <path d="M8.6 3.5h6.8l-.6 5.6 3.1 3.1a1 1 0 0 1-.7 1.7H6.8a1 1 0 0 1-.7-1.7l3.1-3.1-.6-5.6z" />
  </svg>
)

export const BellOffIcon = ({ size = 21 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" {...stroke}>
    <path d="M18 8a6 6 0 0 0-9.3-5" />
    <path d="M6.3 6.3A6 6 0 0 0 6 8c0 7-3 9-3 9h13" />
    <path d="M13.7 21a2 2 0 0 1-3.4 0" />
    <line x1="3" y1="3" x2="21" y2="21" />
  </svg>
)

export const ArchiveIcon = ({ size = 21 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" {...stroke}>
    <rect x="3" y="4" width="18" height="4" rx="1" />
    <path d="M5 8v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8" />
    <path d="M10 12h4" />
  </svg>
)

export const EraserIcon = ({ size = 21 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" {...stroke}>
    <path d="M4 16 12.5 7.5a2 2 0 0 1 2.8 0l3.2 3.2a2 2 0 0 1 0 2.8L14 18H7z" />
    <path d="M6 20h14" />
  </svg>
)

export const FlagIcon = ({ size = 21 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" {...stroke}>
    <path d="M5 21V4" />
    <path d="M5 5h11l-1.5 4L16 13H5z" />
  </svg>
)

export const BlockIcon = ({ size = 21 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" {...stroke}>
    <circle cx="12" cy="12" r="9" />
    <line x1="5.6" y1="5.6" x2="18.4" y2="18.4" />
  </svg>
)

export const MicIcon = ({ size = 19 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" {...stroke}>
    <rect x="9" y="3" width="6" height="11" rx="3" />
    <path d="M5.5 11.5a6.5 6.5 0 0 0 13 0" />
    <line x1="12" y1="18" x2="12" y2="21" />
  </svg>
)

export const NoteIcon = ({ size = 19 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" {...stroke}>
    <rect x="4" y="4" width="16" height="16" rx="3" />
    <line x1="8" y1="10" x2="16" y2="10" />
    <line x1="8" y1="14" x2="13" y2="14" />
  </svg>
)

export const SmileIcon = ({ size = 19 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" {...stroke}>
    <circle cx="12" cy="12" r="9" />
    <path d="M8.5 14.5s1.3 1.8 3.5 1.8 3.5-1.8 3.5-1.8" />
    <circle cx="9" cy="10" r="1" fill="currentColor" />
    <circle cx="15" cy="10" r="1" fill="currentColor" />
  </svg>
)

export const ImageIcon = ({ size = 19 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" {...stroke}>
    <rect x="3" y="4" width="18" height="16" rx="3" />
    <circle cx="8.5" cy="9.5" r="1.4" />
    <path d="M4 17l5-4.5 4 3.5 3-2.5 4 3.5" />
  </svg>
)

export const MoreIcon = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <circle cx="5" cy="12" r="1.6" />
    <circle cx="12" cy="12" r="1.6" />
    <circle cx="19" cy="12" r="1.6" />
  </svg>
)

export const UsersIcon = ({ size = 17 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" {...stroke}>
    <path d="M16 20v-1.5a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4V20" />
    <circle cx="9" cy="7" r="3.4" />
    <path d="M17 4.5a3.4 3.4 0 0 1 0 6.6" />
    <path d="M22 20v-1.5a4 4 0 0 0-3-3.8" />
  </svg>
)

export function Avatar({
  avatar,
  size,
  square,
}: {
  avatar: string
  size: number
  square?: boolean
}) {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: square ? size / 3.2 : '50%',
        overflow: 'hidden',
        background: 'var(--grey-100)',
        flexShrink: 0,
      }}
    >
      <img
        src={imgUrl(avatar, size * 2)}
        alt=""
        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
      />
    </div>
  )
}

export function TypingBubble() {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10 }}>
      <div style={{ width: 34 }} />
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 5,
          background: 'var(--surface)',
          border: '1px solid var(--grey-100)',
          borderRadius: '6px 18px 18px 18px',
          padding: '12px 16px',
        }}
      >
        {[0, 1, 2].map(i => (
          <motion.span
            key={i}
            animate={{ opacity: [0.25, 1, 0.25], y: [0, -2, 0] }}
            transition={{ duration: 1, repeat: Infinity, delay: i * 0.15 }}
            style={{
              width: 5,
              height: 5,
              borderRadius: '50%',
              background: '#B9B9B9',
              display: 'block',
            }}
          />
        ))}
      </div>
    </div>
  )
}

export function VoiceBubble({ duration, own }: { duration: number; own: boolean }) {
  const [playing, setPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const bars = useMemo(() => Array.from({ length: 16 }, (_, i) => 7 + ((i * 37) % 15)), [])

  useEffect(() => {
    if (!playing) return
    const started = Date.now()
    const timer = window.setInterval(() => {
      const p = Math.min(1, (Date.now() - started) / (duration * 1000))
      setProgress(p)
      if (p >= 1) {
        setPlaying(false)
        setProgress(0)
      }
    }, 60)
    return () => window.clearInterval(timer)
  }, [playing, duration])

  // 宽度要同时容得下播放键、波形和时长，否则短语音会把时长压在波形上
  const width = Math.max(170, Math.min(248, 104 + Math.min(duration, 60) * 2.4))

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '10px 14px',
        width,
        background: own ? 'linear-gradient(135deg,#FF5A70,var(--brand))' : 'var(--surface)',
        border: own ? 'none' : '1px solid var(--grey-100)',
        borderRadius: 18,
        boxShadow: own ? '0 6px 16px -10px rgba(255,36,66,0.9)' : '0 2px 10px -8px rgba(0,0,0,0.5)',
      }}
    >
      <button
        onClick={() => {
          setPlaying(p => !p)
          if (playing) setProgress(0)
        }}
        aria-label={playing ? '暂停' : '播放'}
        style={{
          width: 28,
          height: 28,
          flexShrink: 0,
          borderRadius: '50%',
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: own ? 'rgba(255,255,255,0.22)' : 'var(--brand-tint)',
          color: own ? 'var(--surface)' : 'var(--brand)',
        }}
      >
        {playing ? (
          <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor">
            <rect x="6" y="5" width="4" height="14" rx="1" />
            <rect x="14" y="5" width="4" height="14" rx="1" />
          </svg>
        ) : (
          <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor">
            <polygon points="7 4 20 12 7 20" />
          </svg>
        )}
      </button>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          flex: '1 1 auto',
          minWidth: 0,
          overflow: 'hidden',
        }}
      >
        {bars.map((h, i) => {
          const filled = i / bars.length <= progress
          return (
            <span
              key={i}
              style={{
                width: 2.5,
                height: h,
                borderRadius: 2,
                background: own
                  ? filled
                    ? 'var(--surface)'
                    : 'rgba(255,255,255,0.45)'
                  : filled
                    ? 'var(--brand)'
                    : '#DCDCDC',
                display: 'block',
                flexShrink: 1,
              }}
            />
          )
        })}
      </div>
      <span
        style={{
          fontSize: 11.5,
          color: own ? 'rgba(255,255,255,0.9)' : 'var(--grey-500)',
          flexShrink: 0,
          minWidth: 30,
          textAlign: 'right',
        }}
      >
        {fmtDur(duration)}
      </span>
    </div>
  )
}

export function NoteBubble({ note, onOpen }: { note: NoteCard; onOpen: () => void }) {
  const [hover, setHover] = useState(false)
  const getUser = useCommunity(s => s.getUser)
  return (
    <div
      onClick={onOpen}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        width: 244,
        background: 'var(--surface)',
        borderRadius: 14,
        overflow: 'hidden',
        cursor: 'pointer',
        border: `1px solid ${hover ? '#FFD3DA' : 'var(--grey-100)'}`,
        boxShadow: hover
          ? '0 14px 30px -18px rgba(0,0,0,0.55)'
          : '0 6px 18px -14px rgba(0,0,0,0.5)',
        transition: 'border-color 0.15s, box-shadow 0.15s',
      }}
    >
      <div style={{ height: 128, background: 'var(--grey-50)' }}>
        <img
          src={`https://images.unsplash.com/${note.img}?w=520&h=300&fit=crop&auto=format`}
          alt=""
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
        />
      </div>
      <div style={{ padding: '12px 13px 13px' }}>
        <div
          style={{
            fontSize: 13.5,
            fontWeight: 600,
            color: 'var(--ink-soft)',
            lineHeight: 1.5,
            marginBottom: 10,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical' as const,
            overflow: 'hidden',
          }}
        >
          {note.title}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Avatar avatar={getUser(note.author).avatar} size={19} />
          <span
            style={{
              flex: 1,
              minWidth: 0,
              fontSize: 11.5,
              color: 'var(--grey-500)',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {note.author}
          </span>
          <span style={{ fontSize: 11.5, color: 'var(--grey-400)', flexShrink: 0 }}>
            ♥ {note.likes}
          </span>
        </div>
      </div>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          padding: '9px 13px',
          borderTop: '1px solid #F6F6F6',
          background: '#FCFCFC',
        }}
      >
        <svg
          width="13"
          height="13"
          viewBox="0 0 24 24"
          {...stroke}
          style={{ color: 'var(--grey-400)' }}
        >
          <rect x="4" y="4" width="16" height="16" rx="3" />
          <line x1="8" y1="10" x2="16" y2="10" />
          <line x1="8" y1="14" x2="13" y2="14" />
        </svg>
        <span style={{ flex: 1, fontSize: 11.5, color: 'var(--grey-500)' }}>查看笔记</span>
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          {...stroke}
          style={{ color: 'var(--grey-300)' }}
        >
          <polyline points="9 6 15 12 9 18" />
        </svg>
      </div>
    </div>
  )
}

export function sortPinned(pinned: number[], list: Conversation[]): Conversation[] {
  return [...list].sort((a, b) => Number(pinned.includes(b.id)) - Number(pinned.includes(a.id)))
}

export function SectionLabel({ label, unread }: { label: string; unread: number }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        padding: '12px 12px 6px',
        fontSize: 11.5,
        color: 'var(--grey-500)',
        letterSpacing: 0.4,
      }}
    >
      {label}
      {unread > 0 && (
        <span
          style={{
            minWidth: 15,
            height: 15,
            padding: '0 4px',
            borderRadius: 999,
            background: '#FFE9EC',
            color: 'var(--brand)',
            fontSize: 10,
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {unread}
        </span>
      )}
    </div>
  )
}

export function Overlay({
  children,
  onClose,
  width = 320,
}: {
  children: React.ReactNode
  onClose: () => void
  width?: number
}) {
  return (
    <>
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.32)',
          zIndex: 400,
          animation: 'fadeUp 0.16s ease',
        }}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.98 }}
        transition={{ duration: 0.16 }}
        style={{
          position: 'fixed',
          left: '50%',
          top: '50%',
          transform: 'translate(-50%,-50%)',
          width,
          maxHeight: '78vh',
          overflowY: 'auto',
          background: 'var(--surface)',
          borderRadius: 16,
          padding: 18,
          boxShadow: '0 24px 60px -24px rgba(0,0,0,0.5)',
          zIndex: 401,
        }}
      >
        {children}
      </motion.div>
    </>
  )
}

export function QRCode({ seed, size = 168 }: { seed: string; size?: number }) {
  const cells = useMemo(() => {
    const n = 21
    const hash = (x: number, y: number) => {
      let v =
        (x * 73856093) ^
        (y * 19349663) ^
        (seed.length * 83492791) ^
        (seed.charCodeAt(0) * 2654435761)
      v = (v ^ (v >>> 13)) * 1274126177
      return ((v ^ (v >>> 16)) >>> 0) % 100
    }
    const grid: boolean[][] = []
    for (let y = 0; y < n; y++) {
      grid[y] = []
      for (let x = 0; x < n; x++) grid[y][x] = hash(x, y) < 48
    }
    const finder = (x: number, y: number) =>
      (x < 7 && y < 7) || (x > 13 && y < 7) || (x < 7 && y > 13)
    for (let y = 0; y < n; y++) {
      for (let x = 0; x < n; x++) {
        if (!finder(x, y)) continue
        const lx = x > 13 ? x - 14 : x
        const ly = y > 13 ? y - 14 : y
        grid[y][x] = Math.max(Math.abs(lx - 3), Math.abs(ly - 3)) !== 2
      }
    }
    return grid
  }, [seed])
  const cell = size / 21
  return (
    <div
      style={{
        display: 'inline-block',
        padding: 10,
        background: 'var(--surface)',
        border: '1px solid var(--grey-100)',
        borderRadius: 12,
      }}
    >
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <rect width={size} height={size} fill="#fff" />
        {cells.map((row, y) =>
          row.map((on, x) =>
            on ? (
              <rect
                key={`${x}-${y}`}
                x={x * cell}
                y={y * cell}
                width={cell}
                height={cell}
                fill="#1F1F1F"
              />
            ) : null,
          ),
        )}
      </svg>
    </div>
  )
}

export const EASE = [0.22, 1, 0.36, 1] as const

export const SWIPE_W = 84

export const LONG_PRESS_MS = 450

export const EMOJIS = ['😹', '🥰', '👍', '🙌', '🎉', '📚', '🔥', '😭']

export const PHOTO_POOL = [
  'photo-1456513080510-7bf3a84b82f8',
  'photo-1434030216411-0b793f4b4173',
  'photo-1503676260728-1c00da094a0b',
]

export const BACKGROUNDS = [
  { key: 'default', label: '默认', preview: '#F7F7F8' },
  { key: 'paper', label: '米色', preview: 'linear-gradient(135deg,#FDF6EC,#F4E7D3)' },
  { key: 'mint', label: '浅绿', preview: 'linear-gradient(135deg,#EAF7EF,#D8EFE1)' },
  { key: 'dusk', label: '浅灰蓝', preview: 'linear-gradient(135deg,#EEF2F7,#E0E7F1)' },
  { key: 'rose', label: '浅粉', preview: 'linear-gradient(135deg,#FDF0F2,#FAE2E7)' },
  { key: 'dark', label: '深灰', preview: 'linear-gradient(135deg,#3A3A3C,#25252A)' },
]

export const bgStyle = (key: string) => BACKGROUNDS.find(b => b.key === key)?.preview ?? '#F7F7F8'
