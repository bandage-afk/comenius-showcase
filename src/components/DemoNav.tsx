import { useState } from 'react'
import type { PageName } from '../App'

const PAGES: { key: PageName; label: string; icon: string }[] = [
  { key: 'feed', label: '首页', icon: '🏠' },
  { key: 'profile', label: '个人主页', icon: '👤' },
  { key: 'search', label: '搜索', icon: '🔍' },
  { key: 'messages', label: '消息', icon: '💬' },
  { key: 'login', label: '登录注册', icon: '🔐' },
  { key: 'write', label: '写想法', icon: '✏️' },
]

export default function DemoNav({
  currentPage,
  navigate,
}: {
  currentPage: PageName
  navigate: (p: PageName) => void
}) {
  const [open, setOpen] = useState(false)

  return (
    <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 9999 }}>
      {open && (
        <div
          style={{
            position: 'absolute',
            bottom: 52,
            right: 0,
            background: 'var(--surface)',
            borderRadius: 12,
            boxShadow: '0 4px 24px rgba(0,0,0,0.12)',
            padding: '8px 0',
            minWidth: 160,
            overflow: 'hidden',
          }}
        >
          {PAGES.map(p => (
            <button
              key={p.key}
              onClick={() => {
                navigate(p.key)
                setOpen(false)
              }}
              style={{
                width: '100%',
                padding: '10px 16px',
                textAlign: 'left',
                background: currentPage === p.key ? 'var(--brand-tint)' : 'none',
                border: 'none',
                cursor: 'pointer',
                fontSize: 13,
                color: currentPage === p.key ? 'var(--brand)' : 'var(--grey-900)',
                fontFamily: 'inherit',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                fontWeight: currentPage === p.key ? 700 : 400,
              }}
            >
              <span>{p.icon}</span> {p.label}
            </button>
          ))}
        </div>
      )}
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: 44,
          height: 44,
          borderRadius: '50%',
          background: 'var(--brand)',
          border: 'none',
          cursor: 'pointer',
          boxShadow: '0 2px 12px rgba(255,36,66,0.35)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--surface)',
          fontSize: 20,
        }}
      >
        {open ? '✕' : '☰'}
      </button>
    </div>
  )
}
