import { useState } from 'react'
import MainSidebar from '../components/MainSidebar'
import type { NavProps } from '../App'
import { useTeacher } from '../teacherStore'
import { img } from '../teacherData'

const RED = 'var(--brand)'
const TEXT = 'var(--ink-soft)'
const MUTED = 'var(--teacher-muted)'
const SERIF = "'Noto Serif SC', 'Songti SC', 'STSong', serif"

/**
 * ⚠️ 必须定义在模块级、**不能**写进组件内部：
 * 组件内部定义的箭头组件每次渲染都是新的函数引用，React 会当成不同类型，
 * 从而卸载重建整棵子树 —— 里面的 <input> 会因此失焦（一次只能打一个字母）。
 */
function SectionHead({ children }: { children: React.ReactNode }) {
  return (
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
      <span style={{ fontFamily: SERIF, fontSize: 20, fontWeight: 900 }}>{children}</span>
    </div>
  )
}

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

export default function TeacherProfilePage({ navigate, currentPage }: NavProps) {
  const myProfile = useTeacher(s => s.myProfile)
  const updateProfile = useTeacher(s => s.updateProfile)

  const [editing, setEditing] = useState(false)
  const [name, setName] = useState(myProfile.name)
  const [headline, setHeadline] = useState(myProfile.headline)
  const [intro, setIntro] = useState(myProfile.intro)
  const [subjects, setSubjects] = useState(myProfile.subjects.join('、'))
  const [tags, setTags] = useState(myProfile.tags.join('、'))

  const startEdit = () => {
    setName(myProfile.name)
    setHeadline(myProfile.headline)
    setIntro(myProfile.intro)
    setSubjects(myProfile.subjects.join('、'))
    setTags(myProfile.tags.join('、'))
    setEditing(true)
  }
  const save = () => {
    updateProfile({
      name: name.trim() || myProfile.name,
      headline: headline.trim(),
      intro: intro.trim(),
      subjects: subjects
        .split(/[、,，]/)
        .map(s => s.trim())
        .filter(Boolean),
      tags: tags
        .split(/[、,，]/)
        .map(s => s.trim())
        .filter(Boolean),
    })
    setEditing(false)
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
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 14,
              flexWrap: 'wrap',
            }}
          >
            <span
              style={{
                fontFamily: "'Arial Narrow', 'Helvetica Neue Condensed', sans-serif",
                fontSize: 13,
                letterSpacing: 4,
                color: RED,
                fontWeight: 700,
              }}
            >
              PROFILE
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
              我的
            </h1>
            <div style={{ flex: 1 }} />
            {editing ? (
              <>
                <button
                  onClick={save}
                  style={{
                    padding: '10px 24px',
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
                  保存
                </button>
                <button
                  onClick={() => setEditing(false)}
                  style={{
                    padding: '10px 20px',
                    borderRadius: 999,
                    border: '1px solid var(--teacher-border-strong)',
                    background: 'var(--surface)',
                    color: TEXT,
                    fontSize: 13.5,
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                  }}
                >
                  取消
                </button>
              </>
            ) : (
              <button
                onClick={startEdit}
                style={{
                  padding: '10px 24px',
                  borderRadius: 999,
                  border: '1px solid var(--teacher-border-strong)',
                  background: 'var(--surface)',
                  color: TEXT,
                  fontSize: 13.5,
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                }}
              >
                编辑资料
              </button>
            )}
          </div>

          {/* 头部卡片 */}
          <div
            style={{
              position: 'relative',
              overflow: 'hidden',
              borderRadius: 18,
              marginTop: 24,
              background: `linear-gradient(135deg, ${myProfile.gradient[0]}, ${myProfile.gradient[1]})`,
              padding: '34px 28px',
            }}
          >
            <span
              style={{
                position: 'absolute',
                right: 4,
                bottom: -40,
                fontFamily: "'Arial Narrow', sans-serif",
                fontSize: 200,
                fontWeight: 800,
                color: 'var(--teacher-white-12)',
                lineHeight: 1,
                userSelect: 'none',
              }}
            >
              {name.slice(-1)}
            </span>
            <div
              style={{
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                gap: 20,
                flexWrap: 'wrap',
              }}
            >
              <div
                style={{
                  width: 88,
                  height: 88,
                  borderRadius: '50%',
                  background: 'var(--teacher-white-20)',
                  color: 'var(--surface)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 30,
                  fontWeight: 700,
                  flexShrink: 0,
                  border: '3px solid var(--teacher-white-60)',
                  fontFamily: SERIF,
                }}
              >
                {name.slice(-2)}
              </div>
              <div style={{ minWidth: 0, flex: 1 }}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    flexWrap: 'wrap',
                  }}
                >
                  <span
                    style={{
                      fontSize: 26,
                      fontWeight: 800,
                      color: 'var(--surface)',
                      textShadow: '0 1px 6px var(--teacher-shadow)',
                    }}
                  >
                    {name}
                  </span>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="11" fill="var(--surface)" />
                    <path
                      d="M7.5 12.2l3 3 6-6.4"
                      stroke={RED}
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      fill="none"
                    />
                  </svg>
                </div>
                <div
                  style={{
                    fontSize: 14,
                    color: 'var(--teacher-white-92)',
                    marginTop: 6,
                  }}
                >
                  {headline}
                </div>
                <div
                  style={{
                    display: 'flex',
                    gap: 8,
                    flexWrap: 'wrap',
                    marginTop: 10,
                  }}
                >
                  {subjects
                    .split(/[、,，]/)
                    .filter(Boolean)
                    .map(s => (
                      <span
                        key={s}
                        style={{
                          fontSize: 12,
                          background: 'var(--teacher-white-18)',
                          borderRadius: 999,
                          padding: '3px 12px',
                          color: 'var(--surface)',
                        }}
                      >
                        {s}
                      </span>
                    ))}
                </div>
              </div>
              <div style={{ textAlign: 'right', color: 'var(--surface)', flexShrink: 0 }}>
                <div style={{ fontSize: 22, fontWeight: 800 }}>★ {myProfile.rating}</div>
                <div style={{ fontSize: 12, opacity: 0.85 }}>{myProfile.reviews} 条评价</div>
              </div>
            </div>
          </div>

          {/* 编辑表单 */}
          {editing && (
            <div
              style={{
                background: 'var(--surface)',
                borderRadius: 16,
                padding: 24,
                marginTop: 20,
                border: '1px solid var(--teacher-border)',
              }}
            >
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: 14,
                }}
              >
                <div>
                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: 700,
                      color: MUTED,
                      marginBottom: 7,
                    }}
                  >
                    姓名
                  </div>
                  <input value={name} onChange={e => setName(e.target.value)} style={inputStyle} />
                </div>
                <div>
                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: 700,
                      color: MUTED,
                      marginBottom: 7,
                    }}
                  >
                    一句话简介（headline）
                  </div>
                  <input
                    value={headline}
                    onChange={e => setHeadline(e.target.value)}
                    style={inputStyle}
                  />
                </div>
              </div>
              <div style={{ marginTop: 14 }}>
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 700,
                    color: MUTED,
                    marginBottom: 7,
                  }}
                >
                  详细介绍
                </div>
                <textarea
                  value={intro}
                  onChange={e => setIntro(e.target.value)}
                  rows={3}
                  style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.8 }}
                />
              </div>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: 14,
                  marginTop: 14,
                }}
              >
                <div>
                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: 700,
                      color: MUTED,
                      marginBottom: 7,
                    }}
                  >
                    学科（用顿号/逗号分隔）
                  </div>
                  <input
                    value={subjects}
                    onChange={e => setSubjects(e.target.value)}
                    style={inputStyle}
                  />
                </div>
                <div>
                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: 700,
                      color: MUTED,
                      marginBottom: 7,
                    }}
                  >
                    标签（用顿号/逗号分隔）
                  </div>
                  <input value={tags} onChange={e => setTags(e.target.value)} style={inputStyle} />
                </div>
              </div>
            </div>
          )}

          {/* 课程与定价 */}
          <SectionHead>课程与定价</SectionHead>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {myProfile.courses.map(c => (
              <div
                key={c.id}
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
                  <div style={{ fontSize: 15, fontWeight: 700 }}>{c.title}</div>
                  <div style={{ fontSize: 13, color: MUTED, marginTop: 3 }}>
                    {c.description || '—'}
                  </div>
                </div>
                <div
                  style={{
                    fontSize: 17,
                    fontWeight: 800,
                    color: RED,
                    flexShrink: 0,
                  }}
                >
                  ¥{c.price}
                  <span style={{ fontSize: 12, fontWeight: 400, color: MUTED }}>/小时</span>
                </div>
              </div>
            ))}
          </div>
          <button
            onClick={() => navigate('teacherCourses')}
            style={{
              marginTop: 12,
              background: 'none',
              border: 'none',
              color: RED,
              fontSize: 13,
              cursor: 'pointer',
              fontFamily: 'inherit',
              padding: 0,
            }}
          >
            在「课程管理」中编辑 →
          </button>

          {/* 履历 */}
          <SectionHead>教育背景 · 教学经历</SectionHead>
          <div style={{ position: 'relative', paddingLeft: 24, maxWidth: 720 }}>
            <div
              style={{
                position: 'absolute',
                left: 7,
                top: 8,
                bottom: 8,
                width: 2,
                background: 'var(--teacher-timeline)',
                borderRadius: 2,
              }}
            />
            {[
              ...myProfile.education.map(e => ({
                time: e.years,
                title: `${e.school} · ${e.degree}${e.major ? ' · ' + e.major : ''}`,
                kind: '教育' as const,
              })),
              ...myProfile.experience.map(x => ({
                time: x.years,
                title: `${x.role} · ${x.org}`,
                kind: '经历' as const,
              })),
            ].map((item, i) => (
              <div key={i} style={{ position: 'relative', paddingBottom: 20 }}>
                <span
                  style={{
                    position: 'absolute',
                    left: -21,
                    top: 6,
                    width: 10,
                    height: 10,
                    borderRadius: '50%',
                    background: RED,
                    boxShadow: '0 0 0 3px var(--teacher-brand-soft)',
                  }}
                />
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 12.5, color: MUTED, fontWeight: 600 }}>{item.time}</span>
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      color:
                        item.kind === '教育' ? 'var(--teacher-info)' : 'var(--teacher-warning)',
                      background:
                        item.kind === '教育'
                          ? 'var(--teacher-info-soft)'
                          : 'var(--teacher-warning-soft)',
                      padding: '2px 9px',
                      borderRadius: 999,
                    }}
                  >
                    {item.kind}
                  </span>
                </div>
                <div style={{ fontSize: 15, fontWeight: 600, marginTop: 5 }}>{item.title}</div>
              </div>
            ))}
          </div>

          {/* 证书凭证 */}
          <SectionHead>证书凭证</SectionHead>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
              gap: 14,
            }}
          >
            {myProfile.credentials.map((c, i) => (
              <div
                key={i}
                style={{
                  background: 'var(--surface)',
                  borderRadius: 14,
                  overflow: 'hidden',
                  border: '1px solid var(--teacher-border)',
                }}
              >
                <div
                  style={{
                    aspectRatio: '4 / 3',
                    overflow: 'hidden',
                    background: 'var(--grey-15)',
                  }}
                >
                  <img
                    src={img(c.image, 400, 300)}
                    alt={c.title}
                    loading="lazy"
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      display: 'block',
                    }}
                  />
                </div>
                <div style={{ padding: '12px 14px' }}>
                  <div style={{ fontSize: 13.5, fontWeight: 700 }}>{c.title}</div>
                  <div style={{ fontSize: 12, color: MUTED, marginTop: 4 }}>
                    {c.issuer} · {c.year}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
