import MainSidebar from '../components/MainSidebar'
import type { NavProps } from '../App'
import { useTeacher } from '../teacherStore'

const RED = 'var(--brand)'
const TEXT = 'var(--ink-soft)'
const MUTED = 'var(--teacher-muted)'
const SERIF = "'Noto Serif SC', 'Songti SC', 'STSong', serif"

export default function TeacherEarningsPage({ navigate, currentPage }: NavProps) {
  const orders = useTeacher(s => s.orders)

  const total = orders.reduce((sum, o) => sum + o.amount, 0)
  const month = (() => {
    const m = new Date().getMonth() + 1
    const y = new Date().getFullYear()
    const mm = String(m).padStart(2, '0')
    return `${y}-${mm}`
  })()
  const monthTotal = orders
    .filter(o => o.date.startsWith(month))
    .reduce((sum, o) => sum + o.amount, 0)

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'var(--grey-50)',
        fontFamily: "'Noto Sans SC', 'PingFang SC', system-ui, sans-serif",
        color: TEXT,
      }}
    >
      <div style={{ display: 'flex', minHeight: '100vh' }}>
        <MainSidebar navigate={navigate} currentPage={currentPage} stickyTop={0} />
        <div
          style={{
            flex: 1,
            minWidth: 0,
            padding: '32px clamp(24px, 4vw, 56px) 80px',
            maxWidth: 1080,
            width: '100%',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 14, flexWrap: 'wrap' }}>
            <span
              style={{
                fontFamily: "'Arial Narrow', 'Helvetica Neue Condensed', sans-serif",
                fontSize: 13,
                letterSpacing: 4,
                color: RED,
                fontWeight: 700,
              }}
            >
              EARNINGS
            </span>
            <h1
              style={{
                fontFamily: SERIF,
                fontSize: 28,
                fontWeight: 900,
                margin: 0,
                letterSpacing: 1,
              }}
            >
              收入中心
            </h1>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: 16,
              marginTop: 28,
            }}
          >
            <div
              style={{
                background: 'var(--surface)',
                borderRadius: 16,
                padding: '22px 24px',
                border: '1px solid var(--teacher-border)',
              }}
            >
              <div style={{ fontSize: 13, color: MUTED }}>本月收入</div>
              <div
                style={{
                  fontSize: 26,
                  fontWeight: 800,
                  marginTop: 6,
                  fontFamily: SERIF,
                  color: RED,
                }}
              >
                ¥{monthTotal}
              </div>
            </div>
            <div
              style={{
                background: 'var(--surface)',
                borderRadius: 16,
                padding: '22px 24px',
                border: '1px solid var(--teacher-border)',
              }}
            >
              <div style={{ fontSize: 13, color: MUTED }}>累计收入</div>
              <div style={{ fontSize: 26, fontWeight: 800, marginTop: 6, fontFamily: SERIF }}>
                ¥{total}
              </div>
            </div>
            <div
              style={{
                background: 'var(--surface)',
                borderRadius: 16,
                padding: '22px 24px',
                border: '1px solid var(--teacher-border)',
              }}
            >
              <div style={{ fontSize: 13, color: MUTED }}>订单数</div>
              <div style={{ fontSize: 26, fontWeight: 800, marginTop: 6, fontFamily: SERIF }}>
                {orders.length}
              </div>
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              marginTop: 32,
              marginBottom: 16,
            }}
          >
            <span style={{ width: 4, height: 18, background: RED, borderRadius: 2 }} />
            <span style={{ fontFamily: SERIF, fontSize: 20, fontWeight: 900 }}>订单记录</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {orders.map(o => (
              <div
                key={o.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 16,
                  background: 'var(--surface)',
                  borderRadius: 14,
                  padding: '16px 20px',
                  border: '1px solid var(--teacher-border)',
                }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 15, fontWeight: 700 }}>{o.courseTitle}</div>
                  <div style={{ fontSize: 13, color: MUTED, marginTop: 3 }}>
                    {o.studentName} · {o.date}
                  </div>
                </div>
                <div style={{ fontSize: 16, fontWeight: 800, color: RED, flexShrink: 0 }}>
                  ¥{o.amount}
                </div>
                <span
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                    color: 'var(--teacher-success)',
                    background: 'var(--teacher-success-soft)',
                    borderRadius: 999,
                    padding: '4px 12px',
                    flexShrink: 0,
                  }}
                >
                  {o.status}
                </span>
              </div>
            ))}
            {orders.length === 0 && (
              <div style={{ textAlign: 'center', color: MUTED, padding: '40px 0', fontSize: 14 }}>
                暂无订单
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
