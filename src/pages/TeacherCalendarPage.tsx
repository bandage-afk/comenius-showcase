import { useState } from 'react'
import MainSidebar from '../components/MainSidebar'
import type { NavProps } from '../App'
import { useTeacher } from '../teacherStore'

const RED = 'var(--brand)'
const TEXT = 'var(--ink-soft)'
const MUTED = 'var(--teacher-muted)'
const SERIF = "'Noto Serif SC', 'Songti SC', 'STSong', serif"

const WEEKDAYS = ['一', '二', '三', '四', '五', '六', '日']

function fmt(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export default function TeacherCalendarPage({ navigate, currentPage }: NavProps) {
  const lessons = useTeacher(s => s.lessons)
  const simulatePurchase = useTeacher(s => s.simulatePurchase)

  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth()) // 0-based
  const [selected, setSelected] = useState(fmt(now))

  const firstDay = new Date(year, month, 1)
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const lead = (firstDay.getDay() + 6) % 7 // 周一=0
  const cells: (string | null)[] = [
    ...Array(lead).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => fmt(new Date(year, month, i + 1))),
  ]

  const countOf = (d: string) => lessons.filter(l => l.date === d).length
  const dayLessons = lessons.filter(l => l.date === selected)

  const shiftMonth = (delta: number) => {
    const d = new Date(year, month + delta, 1)
    setYear(d.getFullYear())
    setMonth(d.getMonth())
  }

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
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
            <span
              style={{
                fontFamily: "'Arial Narrow', 'Helvetica Neue Condensed', sans-serif",
                fontSize: 13,
                letterSpacing: 4,
                color: RED,
                fontWeight: 700,
              }}
            >
              SCHEDULE
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
              排课日历
            </h1>
            <div style={{ flex: 1 }} />
            <button
              onClick={() => simulatePurchase()}
              style={{
                padding: '10px 22px',
                borderRadius: 999,
                border: 'none',
                background: RED,
                color: 'var(--surface)',
                fontSize: 13.5,
                fontWeight: 700,
                cursor: 'pointer',
                fontFamily: 'inherit',
              }}
            >
              ＋ 模拟学生购课
            </button>
          </div>

          {/* 月历 */}
          <div
            style={{
              background: 'var(--surface)',
              borderRadius: 18,
              padding: 24,
              marginTop: 24,
              border: '1px solid var(--teacher-border)',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 20,
                marginBottom: 20,
              }}
            >
              <button
                onClick={() => shiftMonth(-1)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: 20,
                  color: MUTED,
                }}
              >
                ‹
              </button>
              <span style={{ fontFamily: SERIF, fontSize: 20, fontWeight: 900 }}>
                {year} 年 {month + 1} 月
              </span>
              <button
                onClick={() => shiftMonth(1)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: 20,
                  color: MUTED,
                }}
              >
                ›
              </button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 8 }}>
              {WEEKDAYS.map(w => (
                <div
                  key={w}
                  style={{
                    textAlign: 'center',
                    fontSize: 12,
                    color: MUTED,
                    fontWeight: 600,
                    padding: '6px 0',
                  }}
                >
                  {w}
                </div>
              ))}
              {cells.map((d, i) => {
                if (!d) return <div key={i} />
                const n = countOf(d)
                const isSelected = d === selected
                return (
                  <button
                    key={i}
                    onClick={() => setSelected(d)}
                    style={{
                      position: 'relative',
                      aspectRatio: '1',
                      borderRadius: 10,
                      border: isSelected ? `1.5px solid ${RED}` : '1px solid transparent',
                      background: isSelected ? 'var(--brand-tint)' : 'var(--teacher-surface)',
                      cursor: 'pointer',
                      fontFamily: 'inherit',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <span style={{ fontSize: 14, fontWeight: 600, color: isSelected ? RED : TEXT }}>
                      {Number(d.slice(-2))}
                    </span>
                    {n > 0 && (
                      <span
                        style={{
                          position: 'absolute',
                          bottom: 6,
                          left: '50%',
                          transform: 'translateX(-50%)',
                          width: 6,
                          height: 6,
                          borderRadius: '50%',
                          background: RED,
                        }}
                      />
                    )}
                  </button>
                )
              })}
            </div>
          </div>

          {/* 当日课程 */}
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
            <span style={{ fontFamily: SERIF, fontSize: 20, fontWeight: 900 }}>
              {selected} 的课程
            </span>
          </div>
          {dayLessons.length === 0 ? (
            <div
              style={{
                background: 'var(--surface)',
                borderRadius: 14,
                padding: '36px 0',
                textAlign: 'center',
                color: MUTED,
                fontSize: 14,
                border: '1px solid var(--teacher-border)',
              }}
            >
              当天没有排课
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {dayLessons.map(l => (
                <div
                  key={l.id}
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
                  <div
                    style={{
                      fontSize: 16,
                      fontWeight: 800,
                      color: RED,
                      fontFamily: SERIF,
                      width: 76,
                      flexShrink: 0,
                    }}
                  >
                    {l.startTime}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 15, fontWeight: 700 }}>{l.courseTitle}</div>
                    <div style={{ fontSize: 13, color: MUTED, marginTop: 3 }}>
                      学生：{l.studentName}
                    </div>
                  </div>
                  <span
                    style={{
                      fontSize: 12,
                      fontWeight: 700,
                      color: l.status === '待上' ? 'var(--teacher-success)' : MUTED,
                      background:
                        l.status === '待上' ? 'var(--teacher-success-soft)' : 'var(--grey-50)',
                      borderRadius: 999,
                      padding: '4px 12px',
                    }}
                  >
                    {l.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
