import MainSidebar from '../components/MainSidebar'
import type { NavProps } from '../App'
import { useTeacher } from '../teacherStore'

const RED = 'var(--brand)'
const TEXT = 'var(--ink-soft)'
const MUTED = 'var(--teacher-muted)'
const SERIF = "'Noto Serif SC', 'Songti SC', 'STSong', serif"

export default function TeacherStudentsPage({ navigate, currentPage }: NavProps) {
  const students = useTeacher(s => s.students)

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
              STUDENTS
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
              学生管理
            </h1>
            <span style={{ fontSize: 13, color: MUTED }}>共 {students.length} 位在学学生</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 24 }}>
            {students.map(s => (
              <div
                key={s.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 16,
                  background: 'var(--surface)',
                  borderRadius: 14,
                  padding: '18px 20px',
                  border: '1px solid var(--teacher-border)',
                }}
              >
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: '50%',
                    background:
                      'linear-gradient(135deg,var(--teacher-gradient-start),var(--teacher-gradient-end))',
                    color: 'var(--surface)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 16,
                    fontWeight: 700,
                    flexShrink: 0,
                  }}
                >
                  {s.name.slice(-1)}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 15, fontWeight: 700 }}>{s.name}</div>
                  <div style={{ fontSize: 13, color: MUTED, marginTop: 3 }}>{s.course}</div>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ fontSize: 13, color: TEXT }}>{s.progress}</div>
                  <div style={{ fontSize: 12, color: MUTED, marginTop: 3 }}>
                    下次课：{s.nextLesson || '待排'}
                  </div>
                </div>
              </div>
            ))}
            {students.length === 0 && (
              <div style={{ textAlign: 'center', color: MUTED, padding: '40px 0', fontSize: 14 }}>
                暂无学生
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
