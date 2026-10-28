import MainSidebar from '../components/MainSidebar'
import type { NavProps } from '../App'
import { useTeacher } from '../teacherStore'

const RED = 'var(--brand)'
const TEXT = 'var(--ink-soft)'
const MUTED = 'var(--teacher-muted)'
const SERIF = "'Noto Serif SC', 'Songti SC', 'STSong', serif"

function todayStr(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export default function TeacherHomePage({ navigate, currentPage }: NavProps) {
  const myProfile = useTeacher(s => s.myProfile)
  const lessons = useTeacher(s => s.lessons)
  const students = useTeacher(s => s.students)
  const orders = useTeacher(s => s.orders)

  const today = todayStr()
  const todayLessons = lessons.filter(l => l.date === today)
  const totalEarnings = orders.reduce((sum, o) => sum + o.amount, 0)

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
              TUTOR · WORKSPACE
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
              {myProfile.name} 的工作台
            </h1>
          </div>

          {/* 统计 */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: 16,
              marginTop: 28,
            }}
          >
            {[
              { label: '在学学生', value: String(students.length), sub: '位' },
              {
                label: '待上课程',
                value: String(lessons.filter(l => l.status === '待上').length),
                sub: '节',
              },
              { label: '累计收入', value: `¥${totalEarnings}`, sub: '' },
            ].map(s => (
              <div
                key={s.label}
                style={{
                  background: 'var(--surface)',
                  borderRadius: 16,
                  padding: '20px 22px',
                  border: '1px solid var(--teacher-border)',
                }}
              >
                <div style={{ fontSize: 13, color: MUTED }}>{s.label}</div>
                <div style={{ fontSize: 28, fontWeight: 800, marginTop: 6, fontFamily: SERIF }}>
                  {s.value}
                  <span style={{ fontSize: 13, fontWeight: 400, color: MUTED, marginLeft: 4 }}>
                    {s.sub}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* 今日课程 */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              marginTop: 36,
              marginBottom: 16,
            }}
          >
            <span style={{ width: 4, height: 18, background: RED, borderRadius: 2 }} />
            <span style={{ fontFamily: SERIF, fontSize: 20, fontWeight: 900 }}>今日课程</span>
            <span style={{ fontSize: 13, color: MUTED }}>{today}</span>
          </div>
          {todayLessons.length === 0 ? (
            <div
              style={{
                background: 'var(--surface)',
                borderRadius: 14,
                padding: '40px 0',
                textAlign: 'center',
                color: MUTED,
                fontSize: 14,
                border: '1px solid var(--teacher-border)',
              }}
            >
              今天没有排课
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {todayLessons.map(l => (
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
                  <div style={{ textAlign: 'center', flexShrink: 0, width: 72 }}>
                    <div style={{ fontSize: 20, fontWeight: 800, color: RED, fontFamily: SERIF }}>
                      {l.startTime}
                    </div>
                    <div style={{ fontSize: 12, color: MUTED }}>至 {l.endTime}</div>
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

          {/* 快捷入口 */}
          <div style={{ display: 'flex', gap: 12, marginTop: 28, flexWrap: 'wrap' }}>
            <button
              onClick={() => navigate('teacherCalendar')}
              style={{
                padding: '12px 26px',
                borderRadius: 999,
                border: 'none',
                background: RED,
                color: 'var(--surface)',
                fontSize: 14,
                fontWeight: 700,
                cursor: 'pointer',
                fontFamily: 'inherit',
              }}
            >
              查看排课日历
            </button>
            <button
              onClick={() => navigate('teacherCourses')}
              style={{
                padding: '12px 26px',
                borderRadius: 999,
                border: '1px solid var(--teacher-border-strong)',
                background: 'var(--surface)',
                color: TEXT,
                fontSize: 14,
                fontWeight: 600,
                cursor: 'pointer',
                fontFamily: 'inherit',
              }}
            >
              管理课程与定价
            </button>
            <button
              onClick={() => navigate('teacherProfile')}
              style={{
                padding: '12px 26px',
                borderRadius: 999,
                border: '1px solid var(--teacher-border-strong)',
                background: 'var(--surface)',
                color: TEXT,
                fontSize: 14,
                fontWeight: 600,
                cursor: 'pointer',
                fontFamily: 'inherit',
              }}
            >
              编辑个人资料
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
