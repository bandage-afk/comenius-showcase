import AppShell from '../components/AppShell'
import type { NavProps } from '../App'

export default function FranksCiePage({ navigate, currentPage }: NavProps) {
  return (
    <AppShell navigate={navigate} currentPage={currentPage} color={'var(--ink-soft)'}>
      {/* 拉长的 COMENIUS：直接居中，无外框 */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          pointerEvents: 'none',
        }}
      >
        <span
          style={{
            fontFamily:
              "'Avenir Next Condensed', 'Arial Narrow', 'Helvetica Neue Condensed', sans-serif",
            fontSize: 'clamp(110px, 16vw, 200px)',
            fontWeight: 700,
            letterSpacing: '0.14em',
            color: 'rgba(255,36,66,0.10)',
            lineHeight: 1,
            whiteSpace: 'nowrap',
            userSelect: 'none',
            transform: 'scaleY(3.9)',
            display: 'inline-block',
          }}
        >
          COMENIUS
        </span>
      </div>

      {/* 敬请期待毛玻璃框，居中叠在上面 */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 16,
          padding: 48,
        }}
      >
        <div
          style={{
            fontSize: 12,
            letterSpacing: 8,
            color: 'var(--brand)',
            fontWeight: 600,
          }}
        >
          FRANK'S CIE
        </div>
        <div
          style={{
            width: '100%',
            maxWidth: 560,
            background: 'rgba(255,255,255,0.78)',
            WebkitBackdropFilter: 'blur(12px)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(231,231,231,0.9)',
            borderRadius: 22,
            minHeight: 132,
            boxShadow:
              '0 22px 60px -14px rgba(255,36,66,0.35), 0 10px 28px -12px rgba(255,36,66,0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 18,
            padding: '0 28px',
          }}
        >
          <span
            style={{
              width: 44,
              height: 1,
              background: 'rgba(229,100,124,0.35)',
              flexShrink: 0,
            }}
          />
          <span
            style={{
              fontSize: 18,
              fontWeight: 700,
              fontFamily:
                "'Avenir Next Condensed', 'Arial Narrow', 'Helvetica Neue Condensed', sans-serif",
              letterSpacing: 8,
              color: '#E5647C',
              whiteSpace: 'nowrap',
            }}
          >
            COMING SOON
          </span>
          <span
            style={{
              width: 44,
              height: 1,
              background: 'rgba(229,100,124,0.35)',
              flexShrink: 0,
            }}
          />
        </div>
      </div>
    </AppShell>
  )
}
