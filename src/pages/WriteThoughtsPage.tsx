import { useState } from 'react'
import type { NavProps } from '../App'

export default function WriteThoughtsPage({ navigate }: NavProps) {
  const [text, setText] = useState('')

  return (
    <div
      style={{
        minHeight: '100vh',
        fontFamily: "'Noto Sans SC', sans-serif",
        display: 'flex',
        justifyContent: 'center',
        background: '#EBEBEB',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 480,
          minHeight: '100vh',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          background: 'linear-gradient(160deg, #B8EDE4 0%, #D4EFE8 30%, #E8F5F0 60%, #EBEBEB 100%)',
        }}
      >
        {/* Top bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px 20px',
          }}
        >
          <button
            onClick={() => navigate('feed')}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: 22,
              color: '#444',
              lineHeight: 1,
              padding: 0,
            }}
          >
            ✕
          </button>
          <button
            onClick={() => navigate('publish')}
            style={{
              background: 'linear-gradient(135deg, #FF8FAB, #FF6B8A)',
              color: 'var(--surface)',
              border: 'none',
              borderRadius: 999,
              padding: '9px 22px',
              fontSize: 15,
              fontWeight: 600,
              cursor: 'pointer',
              fontFamily: 'inherit',
            }}
          >
            下一步
          </button>
        </div>

        {/* Main card */}
        <div
          style={{
            flex: 1,
            padding: '8px 20px 20px',
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
          }}
        >
          <div
            style={{
              background: 'var(--surface)',
              borderRadius: 20,
              padding: '28px 28px 36px',
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 2px 16px rgba(0,0,0,0.06)',
              minHeight: 460,
            }}
          >
            {/* Quotation marks decoration */}
            <div style={{ marginBottom: 40 }}>
              <svg width="40" height="32" viewBox="0 0 40 32" fill="none">
                <path
                  d="M0 32V20C0 8.955 6.43 2.863 19.29 0L20 1.778C12.87 3.429 9.017 7.163 8.444 13H16V32H0zM24 32V20C24 8.955 30.43 2.863 43.29 0L44 1.778C36.87 3.429 33.017 7.163 32.444 13H40V32H24z"
                  fill="#E8E8E8"
                />
              </svg>
            </div>

            {/* Title */}
            <div
              style={{
                fontSize: 22,
                fontWeight: 700,
                color: 'var(--text)',
                marginBottom: 12,
              }}
            >
              写想法
            </div>

            {/* Text area */}
            <div style={{ flex: 1, position: 'relative' }}>
              <div
                style={{
                  position: 'absolute',
                  left: 0,
                  top: 0,
                  width: 2.5,
                  height: 20,
                  background: 'var(--brand)',
                  borderRadius: 1,
                }}
              />
              <textarea
                value={text}
                onChange={e => setText(e.target.value)}
                placeholder="说点什么或提个问题..."
                autoFocus
                style={{
                  width: '100%',
                  height: '100%',
                  border: 'none',
                  outline: 'none',
                  fontSize: 16,
                  color: 'var(--grey-900)',
                  fontFamily: 'inherit',
                  background: 'transparent',
                  resize: 'none',
                  lineHeight: 1.6,
                  paddingLeft: 10,
                  boxSizing: 'border-box',
                  minHeight: 200,
                }}
              />
            </div>
          </div>

          {/* Write long article option */}
          <div
            style={{
              background: 'var(--surface)',
              borderRadius: 16,
              padding: '16px 20px',
              display: 'flex',
              alignItems: 'center',
              gap: 14,
              cursor: 'pointer',
              boxShadow: '0 1px 8px rgba(0,0,0,0.05)',
            }}
          >
            <div
              style={{
                width: 48,
                height: 48,
                background: 'var(--grey-50)',
                borderRadius: 12,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
                <rect
                  x="3"
                  y="3"
                  width="18"
                  height="18"
                  rx="3"
                  fill="#F2F2F2"
                  stroke="#333"
                  strokeWidth="1.5"
                />
                <line
                  x1="7"
                  y1="8"
                  x2="17"
                  y2="8"
                  stroke="#333"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
                <line
                  x1="7"
                  y1="12"
                  x2="17"
                  y2="12"
                  stroke="#333"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
                <line
                  x1="7"
                  y1="16"
                  x2="13"
                  y2="16"
                  stroke="#333"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
                <circle cx="19" cy="19" r="5" fill="#00C6B2" />
                <path
                  d="M17 19l1.5 1.5L21 17"
                  stroke="white"
                  strokeWidth="1.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <div style={{ flex: 1 }}>
              <div
                style={{
                  fontSize: 16,
                  fontWeight: 600,
                  color: 'var(--text)',
                  marginBottom: 3,
                }}
              >
                写长文
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-subtle)' }}>
                支持万字，全屏阅读体验
              </div>
            </div>
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#bbb"
              strokeWidth="2"
            >
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  )
}
