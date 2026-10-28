import { useState } from 'react'
import MainSidebar from '../components/MainSidebar'
import type { NavProps } from '../App'
import { useTeacher } from '../teacherStore'
import type { Course } from '../teacherData'

const RED = 'var(--brand)'
const TEXT = 'var(--ink-soft)'
const MUTED = 'var(--teacher-muted)'
const SERIF = "'Noto Serif SC', 'Songti SC', 'STSong', serif"

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '11px 14px',
  borderRadius: 10,
  border: '1px solid var(--teacher-input-border)',
  fontSize: 14,
  color: 'var(--text)',
  fontFamily: 'inherit',
  outline: 'none',
  background: 'var(--surface)',
  boxSizing: 'border-box',
}

export default function TeacherCoursesPage({ navigate, currentPage }: NavProps) {
  const myProfile = useTeacher(s => s.myProfile)
  const addCourse = useTeacher(s => s.addCourse)
  const editCourse = useTeacher(s => s.editCourse)
  const deleteCourse = useTeacher(s => s.deleteCourse)

  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [duration, setDuration] = useState('60 分钟')

  const openAdd = () => {
    setEditId(null)
    setTitle('')
    setDescription('')
    setPrice('')
    setDuration('60 分钟')
    setShowForm(true)
  }
  const openEdit = (c: Course) => {
    setEditId(c.id)
    setTitle(c.title)
    setDescription(c.description)
    setPrice(String(c.price))
    setDuration(c.duration)
    setShowForm(true)
  }

  const submit = () => {
    const p = Number(price)
    if (!title.trim() || !p) return
    if (editId)
      editCourse(editId, {
        title: title.trim(),
        description: description.trim(),
        price: p,
        duration,
      })
    else addCourse({ title: title.trim(), description: description.trim(), price: p, duration })
    setShowForm(false)
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
              COURSES
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
              课程与定价
            </h1>
            <span style={{ fontSize: 13, color: MUTED }}>学生端 tutor 页展示的内容</span>
            <div style={{ flex: 1 }} />
            <button
              onClick={openAdd}
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
              ＋ 新增课程
            </button>
          </div>

          {showForm && (
            <div
              style={{
                background: 'var(--surface)',
                borderRadius: 16,
                padding: 24,
                marginTop: 24,
                border: '1px solid var(--teacher-border)',
              }}
            >
              <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>
                {editId ? '编辑课程' : '新增课程'}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <input
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="课程名称，如：A-Level 数学 1对1"
                  style={inputStyle}
                />
                <input
                  value={price}
                  onChange={e => setPrice(e.target.value)}
                  placeholder="价格（¥/小时）"
                  type="number"
                  style={inputStyle}
                />
                <input
                  value={duration}
                  onChange={e => setDuration(e.target.value)}
                  placeholder="时长，如：60 分钟"
                  style={inputStyle}
                />
                <input
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="课程简介（一句话）"
                  style={inputStyle}
                />
              </div>
              <div style={{ display: 'flex', gap: 12, marginTop: 18 }}>
                <button
                  onClick={submit}
                  style={{
                    padding: '11px 28px',
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
                  保存
                </button>
                <button
                  onClick={() => setShowForm(false)}
                  style={{
                    padding: '11px 24px',
                    borderRadius: 999,
                    border: '1px solid var(--teacher-border-strong)',
                    background: 'var(--surface)',
                    color: TEXT,
                    fontSize: 14,
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                  }}
                >
                  取消
                </button>
              </div>
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 24 }}>
            {myProfile.courses.map(c => (
              <div
                key={c.id}
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
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 15, fontWeight: 700 }}>{c.title}</div>
                  <div style={{ fontSize: 13, color: MUTED, marginTop: 4 }}>
                    {c.description || '—'}
                  </div>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ fontSize: 18, fontWeight: 800, color: RED, fontFamily: SERIF }}>
                    ¥{c.price}
                    <span style={{ fontSize: 12, fontWeight: 400, color: MUTED }}>/小时</span>
                  </div>
                  <div style={{ fontSize: 12, color: MUTED, marginTop: 2 }}>{c.duration}</div>
                </div>
                <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                  <button
                    onClick={() => openEdit(c)}
                    style={{
                      padding: '8px 16px',
                      borderRadius: 999,
                      border: '1px solid var(--teacher-border-strong)',
                      background: 'var(--surface)',
                      color: TEXT,
                      fontSize: 13,
                      cursor: 'pointer',
                      fontFamily: 'inherit',
                    }}
                  >
                    编辑
                  </button>
                  <button
                    onClick={() => deleteCourse(c.id)}
                    style={{
                      padding: '8px 14px',
                      borderRadius: 999,
                      border: '1px solid var(--teacher-selected-border)',
                      background: 'var(--surface)',
                      color: RED,
                      fontSize: 13,
                      cursor: 'pointer',
                      fontFamily: 'inherit',
                    }}
                  >
                    删除
                  </button>
                </div>
              </div>
            ))}
            {myProfile.courses.length === 0 && (
              <div style={{ textAlign: 'center', color: MUTED, padding: '40px 0', fontSize: 14 }}>
                还没有课程，点「新增课程」添加
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
