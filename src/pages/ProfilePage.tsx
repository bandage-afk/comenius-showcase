import { useState } from 'react'
import type { NavProps } from '../App'
import AppShell from '../components/AppShell'
import { useProfile } from '../profileStore'
import { useNotes } from '../notesStore'
import { useCommunity } from '../communityStore'
import CareerProfile from '../profile/CareerProfile'

/**
 * 「我的」= 同一个人的两套展示：
 *   社区 —— 小红书式（笔记 / 收藏 / 点赞 + 学习档案 + 贴纸）
 *   职业 —— 领英式（经历 / 学历 / 技能 / 证书 / 简历，原 tutor 的 Me 页）
 * 身份（姓名 / 头像 / 封面 / 简介 / 地区）两边共用 profileStore 的同一份数据。
 */
type ProfileView = 'community' | 'career'

function ViewSwitch({ view, onChange }: { view: ProfileView; onChange: (v: ProfileView) => void }) {
  const items: { key: ProfileView; label: string }[] = [
    { key: 'community', label: '社区' },
    { key: 'career', label: '职业' },
  ]
  return (
    <div
      style={{
        display: 'inline-flex',
        background: '#F2F2F4',
        borderRadius: 999,
        padding: 3,
        gap: 2,
      }}
    >
      {items.map(it => {
        const on = it.key === view
        return (
          <button
            key={it.key}
            onClick={() => onChange(it.key)}
            aria-pressed={on}
            style={{
              border: 'none',
              cursor: 'pointer',
              fontFamily: 'inherit',
              fontSize: 13,
              fontWeight: on ? 600 : 400,
              color: on ? 'var(--ink-soft)' : 'var(--grey-600)',
              background: on ? 'var(--surface)' : 'transparent',
              borderRadius: 999,
              padding: '6px 18px',
              boxShadow: on ? '0 1px 4px rgba(0,0,0,0.1)' : 'none',
              transition: 'background 0.15s, color 0.15s',
            }}
          >
            {it.label}
          </button>
        )
      })}
    </div>
  )
}

export default function ProfilePage(props: NavProps) {
  const { navigate, currentPage } = props
  const [activeTab, setActiveTab] = useState(0)
  const [subTab, setSubTab] = useState(0)
  const [toast, setToast] = useState('')
  // 从教师模块的「Me → 我的」进来时直达职业视图（navigate('profile', 'career')）
  const [view, setView] = useState<ProfileView>(
    props.searchQuery === 'career' ? 'career' : 'community',
  )
  const notify = (m: string) => {
    setToast(m)
    window.setTimeout(() => setToast(''), 2200)
  }
  const creatorItems = [
    {
      key: 'notes',
      label: '笔记管理',
      hint: '管理你发布的图文/视频/长文',
      go: () => navigate('publish'),
    },
    {
      key: 'overview',
      label: '账号概览',
      hint: '账号与认证信息',
      go: () => notify('账号概览建设中，敬请期待'),
    },
    {
      key: 'analysis',
      label: '内容分析',
      hint: '笔记数据表现',
      go: () => notify('内容分析建设中，敬请期待'),
    },
    {
      key: 'fans',
      label: '粉丝数据',
      hint: '粉丝增长与画像',
      go: () => notify('粉丝数据建设中，敬请期待'),
    },
    {
      key: 'activity',
      label: '活动中心',
      hint: '平台活动与激励',
      go: () => notify('活动中心建设中，敬请期待'),
    },
  ]
  const profile = useProfile(s => s.profile)
  const myNotes = useNotes(s => s.notes)
  const follows = useCommunity(s => s.follows)
  const collects = useCommunity(s => s.collects)
  const likes = useCommunity(s => s.likes)
  const feedPosts = useCommunity(s => s.posts)
  const collectedPosts = feedPosts.filter(p => collects.includes(p.id))
  const likedPosts = feedPosts.filter(p => likes.includes(p.id))

  const TABS = ['笔记', '收藏', '点赞', '浏览记录']
  const SUB_TABS = [`笔记·${myNotes.length}`, '专辑·0', '文件·1']

  return (
    <AppShell navigate={navigate} currentPage={currentPage}>
      {/* 视图切换条：社区面 / 职业面（固定在顶部，两边同一位置） */}
      <div
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 20,
          display: 'flex',
          justifyContent: 'center',
          padding: '10px 0',
          background: 'rgba(255,255,255,0.82)',
          backdropFilter: 'blur(10px)',
          borderBottom: view === 'community' ? 'none' : '1px solid var(--grey-75)',
        }}
      >
        <ViewSwitch view={view} onChange={setView} />
      </div>
      {view === 'career' ? (
        <div style={{ padding: '16px 60px 80px', maxWidth: 1128, margin: '0 auto' }}>
          <CareerProfile />
        </div>
      ) : (
        <>
          {/* 头部：背景图从顶部一直铺到 tab 分割线 */}
          <div
            style={{ padding: '0 60px', maxWidth: 1200, margin: '0 auto', position: 'relative' }}
          >
            {/* 背景图（绝对定位铺满整个头部，含 tab 行，止于分割线） */}
            <div
              style={{
                position: 'absolute',
                left: -60,
                right: -60,
                top: 0,
                bottom: 0,
                overflow: 'hidden',
                background: 'var(--grey-150)',
              }}
            >
              <img
                src={`https://images.unsplash.com/${profile.bg}?w=1600&h=900&fit=crop&auto=format`}
                alt=""
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
              />
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  background:
                    'linear-gradient(to bottom, rgba(0,0,0,0.18), rgba(0,0,0,0.55) 72%, rgba(0,0,0,0.74))',
                }}
              />
            </div>

            {/* 右上角：编辑资料按钮 */}
            <button
              onClick={() => navigate('locker')}
              style={{
                position: 'absolute',
                top: 16,
                right: 20,
                zIndex: 5,
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                background: 'rgba(255,255,255,0.92)',
                color: 'var(--ink-soft)',
                border: 'none',
                borderRadius: 999,
                padding: '8px 18px',
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
                fontFamily: 'inherit',
                boxShadow: '0 2px 10px rgba(0,0,0,0.14)',
              }}
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
              >
                <path d="M12 20h9" />
                <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z" />
              </svg>
              编辑资料
            </button>

            {/* 头像 + 资料（白字叠在图上） */}
            <div
              style={{
                position: 'relative',
                display: 'flex',
                alignItems: 'flex-end',
                gap: 28,
                paddingTop: 44,
              }}
            >
              <div style={{ flexShrink: 0 }}>
                <div
                  style={{
                    width: 138,
                    height: 138,
                    borderRadius: '50%',
                    overflow: 'hidden',
                    border: '4px solid var(--surface)',
                    boxShadow: '0 2px 16px rgba(0,0,0,0.25)',
                    background: 'var(--grey-150)',
                  }}
                >
                  <img
                    src={`https://images.unsplash.com/${profile.avatarUrl}?w=260&h=260&fit=crop&auto=format`}
                    alt="avatar"
                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                  />
                </div>
              </div>

              <div style={{ paddingBottom: 2 }}>
                <h1
                  style={{
                    fontSize: 28,
                    fontWeight: 700,
                    color: 'var(--surface)',
                    margin: '0 0 4px',
                    textShadow: '0 1px 8px rgba(0,0,0,0.35)',
                  }}
                >
                  {profile.name || '未设置名字'}
                </h1>
                <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', marginBottom: 10 }}>
                  Comenius号：{profile.comeniusId || '——'}
                </div>
                {profile.bio && (
                  <div
                    style={{
                      fontSize: 14,
                      color: 'rgba(255,255,255,0.92)',
                      marginBottom: 8,
                      maxWidth: 560,
                      lineHeight: 1.6,
                      textShadow: '0 1px 4px rgba(0,0,0,0.3)',
                    }}
                  >
                    {profile.bio}
                  </div>
                )}

                {/* Stats */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 12 }}>
                  {[
                    [String(follows.length), '关注'],
                    ['16', '粉丝'],
                    [String(likes.length + collects.length), '获赞与收藏'],
                  ].map(([num, label], i) => (
                    <div
                      key={label}
                      style={{ display: 'flex', alignItems: 'baseline', gap: 3, cursor: 'pointer' }}
                    >
                      {i > 0 && (
                        <span
                          style={{ color: 'rgba(255,255,255,0.45)', margin: '0 4px', fontSize: 13 }}
                        >
                          |
                        </span>
                      )}
                      <span
                        style={{
                          fontSize: 17,
                          fontWeight: 700,
                          color: 'var(--surface)',
                          textShadow: '0 1px 4px rgba(0,0,0,0.35)',
                        }}
                      >
                        {num}
                      </span>
                      <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.75)' }}>{label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Tabs（分割线即背景图下缘） */}
            <div style={{ position: 'relative', paddingTop: 28 }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  borderBottom: '1px solid rgba(255,255,255,0.4)',
                }}
              >
                {TABS.map((tab, i) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(i)}
                    style={{
                      padding: '12px 20px',
                      fontSize: 15,
                      fontWeight: i === activeTab ? 600 : 400,
                      color: i === activeTab ? 'var(--surface)' : 'rgba(255,255,255,0.65)',
                      border: 'none',
                      background: 'none',
                      cursor: 'pointer',
                      fontFamily: 'inherit',
                      position: 'relative',
                      whiteSpace: 'nowrap',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      textShadow: '0 1px 4px rgba(0,0,0,0.3)',
                    }}
                  >
                    {tab === '收藏' && (
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <rect x="3" y="11" width="18" height="11" rx="2" />
                        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                      </svg>
                    )}
                    {tab}
                    {i === activeTab && (
                      <span
                        style={{
                          position: 'absolute',
                          bottom: 0,
                          left: '50%',
                          transform: 'translateX(-50%)',
                          width: 20,
                          height: 2,
                          background: 'var(--surface)',
                          borderRadius: 999,
                        }}
                      />
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Sub-tabs (only for 笔记 tab，白色区域) */}
          {activeTab === 0 && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 0,
                padding: '16px 60px 12px',
                maxWidth: 1200,
                margin: '0 auto',
              }}
            >
              {SUB_TABS.map((t, i) => (
                <div key={t} style={{ display: 'flex', alignItems: 'center' }}>
                  {i > 0 && <span style={{ color: 'var(--grey-200)', margin: '0 2px' }}>·</span>}
                  <button
                    onClick={() => setSubTab(i)}
                    style={{
                      padding: '4px 10px',
                      fontSize: 14,
                      fontWeight: i === subTab ? 600 : 400,
                      color: i === subTab ? '#111' : 'var(--grey-450)',
                      border: 'none',
                      background: 'none',
                      cursor: 'pointer',
                      fontFamily: 'inherit',
                    }}
                  >
                    {t}
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* 创作中心 */}
          <div style={{ padding: '12px 60px 8px', maxWidth: 1200, margin: '0 auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
              <span
                style={{
                  width: 3,
                  height: 14,
                  background: 'var(--brand)',
                  borderRadius: 999,
                }}
              />
              <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)' }}>创作中心</span>
              <span style={{ fontSize: 12, color: 'var(--grey-450)' }}>发布与管理你的内容</span>
              <div style={{ flex: 1 }} />
              <button
                onClick={() => navigate('publish')}
                style={{
                  background: 'var(--brand)',
                  color: 'var(--surface)',
                  border: 'none',
                  borderRadius: 999,
                  padding: '7px 18px',
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                }}
              >
                + 发布
              </button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12 }}>
              {creatorItems.map(it => (
                <button
                  key={it.key}
                  onClick={it.go}
                  style={{
                    background: 'var(--surface)',
                    border: '1px solid #EFEFF1',
                    borderRadius: 14,
                    padding: '14px 12px',
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                    textAlign: 'left',
                    transition: 'transform 0.15s, box-shadow 0.15s',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.transform = 'translateY(-2px)'
                    e.currentTarget.style.boxShadow = '0 10px 24px rgba(0,0,0,0.07)'
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.transform = 'none'
                    e.currentTarget.style.boxShadow = 'none'
                  }}
                >
                  <span
                    style={{
                      fontSize: 13.5,
                      fontWeight: 700,
                      color: 'var(--text)',
                      display: 'block',
                    }}
                  >
                    {it.label}
                  </span>
                  <span
                    style={{
                      fontSize: 11.5,
                      color: 'var(--grey-450)',
                      marginTop: 5,
                      display: 'block',
                    }}
                  >
                    {it.hint}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Content grid — 5 columns */}
          <div style={{ padding: '8px 60px 40px', maxWidth: 1200, margin: '0 auto' }}>
            {activeTab === 1 || activeTab === 2 ? (
              (activeTab === 1 ? collectedPosts : likedPosts).length === 0 ? (
                <div
                  style={{ textAlign: 'center', padding: '80px 0', color: '#9A9AA2', fontSize: 14 }}
                >
                  还没有{activeTab === 1 ? '收藏' : '点赞'}的内容
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12 }}>
                  {(activeTab === 1 ? collectedPosts : likedPosts).map(p => (
                    <div
                      key={p.id}
                      style={{
                        borderRadius: 10,
                        overflow: 'hidden',
                        cursor: 'pointer',
                        background: '#F8F8F8',
                      }}
                    >
                      <div style={{ position: 'relative', background: 'var(--grey-200)' }}>
                        {p.img ? (
                          <img
                            src={`https://images.unsplash.com/${p.img}?w=300&h=380&fit=crop&auto=format`}
                            alt=""
                            style={{ width: '100%', display: 'block', objectFit: 'cover' }}
                            loading="lazy"
                          />
                        ) : (
                          <div
                            style={{
                              height: 120,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              padding: 12,
                              fontSize: 13,
                              color: 'var(--grey-800)',
                            }}
                          >
                            {p.title}
                          </div>
                        )}
                      </div>
                      <div style={{ padding: '8px 10px 10px' }}>
                        <div
                          style={{
                            fontSize: 13,
                            color: 'var(--ink-strong)',
                            lineHeight: 1.45,
                            marginBottom: 8,
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                          }}
                        >
                          {p.title}
                        </div>
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 5,
                            fontSize: 11,
                            color: '#888',
                          }}
                        >
                          <span
                            style={{
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {p.author}
                          </span>
                          <span
                            style={{
                              marginLeft: 'auto',
                              display: 'flex',
                              alignItems: 'center',
                              gap: 3,
                              color: 'var(--grey-350)',
                            }}
                          >
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="#ccc">
                              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                            </svg>
                            {p.likes}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )
            ) : activeTab === 0 ? (
              myNotes.length === 0 ? (
                <div
                  style={{ textAlign: 'center', padding: '80px 0', color: '#9A9AA2', fontSize: 14 }}
                >
                  还没有发布笔记
                  <div style={{ marginTop: 16 }}>
                    <button
                      onClick={() => navigate('publish')}
                      style={{
                        background: 'var(--brand)',
                        color: 'var(--surface)',
                        border: 'none',
                        borderRadius: 999,
                        padding: '9px 24px',
                        fontSize: 13,
                        fontWeight: 600,
                        cursor: 'pointer',
                        fontFamily: 'inherit',
                      }}
                    >
                      去发布
                    </button>
                  </div>
                </div>
              ) : (
                <div style={{ columnCount: 5, columnGap: 12 }}>
                  {myNotes.map(n => (
                    <div
                      key={n.id}
                      onClick={() => navigate('detail')}
                      style={{
                        breakInside: 'avoid',
                        marginBottom: 12,
                        borderRadius: 10,
                        overflow: 'hidden',
                        cursor: 'pointer',
                        background: '#F8F8F8',
                      }}
                    >
                      <div style={{ position: 'relative', background: 'var(--grey-200)' }}>
                        {n.type === 'text' ? (
                          <div
                            style={{
                              minHeight: 140,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              padding: 16,
                              fontSize: 13,
                              color: 'var(--grey-800)',
                              whiteSpace: 'pre-line',
                            }}
                          >
                            {n.quote}
                          </div>
                        ) : (
                          <img
                            src={
                              n.img && (n.img.startsWith('data:') || n.img.startsWith('http'))
                                ? n.img
                                : `https://images.unsplash.com/${n.img}?w=300&h=280&fit=crop&auto=format`
                            }
                            alt=""
                            style={{ width: '100%', display: 'block', objectFit: 'cover' }}
                            loading="lazy"
                          />
                        )}
                        {n.type === 'video' && (
                          <div
                            style={{
                              position: 'absolute',
                              top: 7,
                              right: 7,
                              background: 'rgba(0,0,0,0.55)',
                              borderRadius: 4,
                              padding: '2px 7px',
                              display: 'flex',
                              alignItems: 'center',
                              gap: 3,
                            }}
                          >
                            <svg width="9" height="9" viewBox="0 0 24 24" fill="white">
                              <polygon points="5 3 19 12 5 21 5 3" />
                            </svg>
                          </div>
                        )}
                      </div>
                      <div style={{ padding: '8px 10px 10px' }}>
                        <div
                          style={{
                            fontSize: 13,
                            color: 'var(--ink-strong)',
                            lineHeight: 1.45,
                            marginBottom: 8,
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                          }}
                        >
                          {n.title || n.quote}
                        </div>
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 3,
                            fontSize: 11,
                            color: 'var(--grey-350)',
                          }}
                        >
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="#ccc">
                            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                          </svg>
                          {n.likes}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )
            ) : (
              <div
                style={{ textAlign: 'center', padding: '80px 0', color: '#9A9AA2', fontSize: 14 }}
              >
                暂无浏览记录
              </div>
            )}
          </div>
        </>
      )}
      {toast && (
        <div
          style={{
            position: 'fixed',
            left: '50%',
            bottom: 34,
            transform: 'translateX(-50%)',
            zIndex: 1500,
            background: '#1F1F24',
            color: 'var(--surface)',
            padding: '10px 20px',
            borderRadius: 999,
            fontSize: 13,
            boxShadow: '0 12px 40px rgba(0,0,0,0.22)',
          }}
        >
          {toast}
        </div>
      )}
    </AppShell>
  )
}
