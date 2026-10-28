import AppShell from '../components/AppShell'
import type { NavProps } from '../App'
import { useCommunity } from '../communityStore'

const RED = 'var(--brand)'
const TEXT = '#1F1F1F'
const MUTED = '#6F6F77'
const SERIF = "'Noto Serif SC', 'Songti SC', 'STSong', serif"

function img(key: string, w = 400, h?: number) {
  if (!key) return ''
  if (key.startsWith('data:') || key.startsWith('http')) return key
  return `https://images.unsplash.com/${key}?w=${w}${h ? `&h=${h}` : ''}&fit=crop&auto=format`
}

export default function UserProfilePage({ navigate }: NavProps) {
  const viewingUser = useCommunity(s => s.viewingUser)
  const follows = useCommunity(s => s.follows)
  const toggleFollow = useCommunity(s => s.toggleFollow)
  const allPosts = useCommunity(s => s.posts)
  const startConversation = useCommunity(s => s.startConversation)

  if (!viewingUser) {
    return (
      <div
        style={{
          minHeight: '100vh',
          background: 'var(--grey-50)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: "'Noto Sans SC', 'PingFang SC', system-ui, sans-serif",
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 15, color: MUTED, marginBottom: 16 }}>未找到该用户</div>
          <button
            onClick={() => navigate('feed')}
            style={{
              padding: '10px 24px',
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
            返回首页
          </button>
        </div>
      </div>
    )
  }

  const user = viewingUser
  const isFollowing = follows.includes(user.id)
  const posts = allPosts.filter(p => p.author === user.name).slice(0, 12)

  const dm = () => {
    startConversation(user)
    navigate('messages')
  }

  return (
    <AppShell navigate={navigate} currentPage={'feed'} background="#F2F2F2" color={TEXT}>
      {/* 顶部栏 */}
      <div
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 40,
          background: 'rgba(255,255,255,0.94)',
          WebkitBackdropFilter: 'blur(12px)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid #F0F0F2',
          padding: '11px clamp(16px, 3vw, 40px)',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
        }}
      >
        <button
          onClick={() => navigate('feed')}
          aria-label="返回"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: TEXT,
            fontSize: 14,
            fontWeight: 600,
            fontFamily: 'inherit',
            padding: 0,
          }}
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>
        <span style={{ fontSize: 15, fontWeight: 700, color: '#B0B0B6' }}>用户主页</span>
      </div>

      {/* 封面 + 资料 */}
      <div
        style={{
          position: 'relative',
          overflow: 'hidden',
          background: 'linear-gradient(135deg, #4A7DFF 0%, #7C3AED 100%)',
          padding: '40px clamp(16px, 4vw, 56px) 28px',
        }}
      >
        <span
          style={{
            position: 'absolute',
            right: 8,
            bottom: -46,
            fontFamily: "'Arial Narrow', sans-serif",
            fontSize: 240,
            fontWeight: 800,
            color: 'rgba(255,255,255,0.12)',
            lineHeight: 1,
            userSelect: 'none',
          }}
        >
          {user.name.slice(-1)}
        </span>
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(to bottom, rgba(0,0,0,0.12), rgba(0,0,0,0.34))',
          }}
        />

        <div
          style={{
            position: 'relative',
            display: 'flex',
            alignItems: 'flex-end',
            gap: 24,
            flexWrap: 'wrap',
          }}
        >
          <div style={{ flexShrink: 0 }}>
            <div
              style={{
                width: 120,
                height: 120,
                borderRadius: '50%',
                overflow: 'hidden',
                border: '4px solid var(--surface)',
                boxShadow: '0 2px 16px rgba(0,0,0,0.25)',
                background: 'var(--grey-150)',
              }}
            >
              <img
                src={img(user.avatar, 240, 240)}
                alt=""
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
              />
            </div>
          </div>
          <div style={{ paddingBottom: 2, minWidth: 0, flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              <h1
                style={{
                  fontSize: 26,
                  fontWeight: 800,
                  color: 'var(--surface)',
                  margin: 0,
                  textShadow: '0 1px 8px rgba(0,0,0,0.35)',
                }}
              >
                {user.name}
              </h1>
              {user.verified && (
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="11" fill="#fff" />
                  <path
                    d="M7.5 12.2l3 3 6-6.4"
                    stroke={RED}
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    fill="none"
                  />
                </svg>
              )}
            </div>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.75)', marginTop: 6 }}>
              Comenius号：{user.comeniusId || '——'}
              {user.school ? ' · ' + user.school : ''}
            </div>
            <div
              style={{
                fontSize: 14,
                color: 'rgba(255,255,255,0.92)',
                marginTop: 8,
                maxWidth: 560,
                lineHeight: 1.7,
                textShadow: '0 1px 4px rgba(0,0,0,0.3)',
              }}
            >
              {user.bio || '这个人还没有填写简介'}
            </div>
          </div>
        </div>

        {/* 操作 */}
        <div
          style={{
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            marginTop: 22,
          }}
        >
          <button
            onClick={() => toggleFollow(user.id)}
            style={{
              padding: '9px 26px',
              borderRadius: 999,
              border: 'none',
              cursor: 'pointer',
              fontFamily: 'inherit',
              fontSize: 14,
              fontWeight: 700,
              background: isFollowing ? 'rgba(255,255,255,0.2)' : 'var(--surface)',
              color: isFollowing ? 'var(--surface)' : RED,
            }}
          >
            {isFollowing ? '已关注' : '+ 关注'}
          </button>
          <button
            onClick={dm}
            style={{
              padding: '9px 26px',
              borderRadius: 999,
              border: '1px solid rgba(255,255,255,0.5)',
              cursor: 'pointer',
              fontFamily: 'inherit',
              fontSize: 14,
              fontWeight: 700,
              background: 'transparent',
              color: 'var(--surface)',
            }}
          >
            私信
          </button>
        </div>
      </div>

      {/* 帖子列表 */}
      <div style={{ padding: '24px clamp(16px, 4vw, 56px) 80px', maxWidth: 1080 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
          <span style={{ width: 4, height: 18, background: RED, borderRadius: 2 }} />
          <span style={{ fontFamily: SERIF, fontSize: 20, fontWeight: 900 }}>TA 的笔记</span>
          <span style={{ fontSize: 13, color: MUTED }}>{posts.length} 篇</span>
        </div>
        {posts.length === 0 ? (
          <div style={{ fontSize: 14, color: MUTED, padding: '40px 0', textAlign: 'center' }}>
            TA 还没有发布笔记
          </div>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
              gap: 16,
            }}
          >
            {posts.map(p => (
              <div
                key={p.id}
                style={{
                  background: 'var(--surface)',
                  borderRadius: 12,
                  overflow: 'hidden',
                  border: '1px solid #EFEFF1',
                }}
              >
                {p.img ? (
                  <div
                    style={{
                      aspectRatio: '3 / 4',
                      overflow: 'hidden',
                      background: 'var(--grey-15)',
                    }}
                  >
                    <img
                      src={img(p.img, 400, 533)}
                      alt=""
                      loading="lazy"
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        display: 'block',
                      }}
                    />
                  </div>
                ) : (
                  <div
                    style={{
                      aspectRatio: '3 / 4',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: 16,
                      background: '#FAFAFB',
                      boxSizing: 'border-box',
                    }}
                  >
                    <span
                      style={{
                        fontSize: 14,
                        color: 'var(--grey-800)',
                        lineHeight: 1.7,
                        textAlign: 'center',
                        whiteSpace: 'pre-line',
                        fontFamily: SERIF,
                      }}
                    >
                      {p.quote || p.title}
                    </span>
                  </div>
                )}
                <div style={{ padding: '10px 12px 12px' }}>
                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: 600,
                      lineHeight: 1.5,
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      minHeight: 39,
                      color: 'var(--text)',
                    }}
                  >
                    {p.title || p.quote}
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 5,
                      marginTop: 8,
                      fontSize: 12,
                      color: '#9A9AA2',
                    }}
                  >
                    <svg
                      width="13"
                      height="13"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                    </svg>
                    {p.likes}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  )
}
