import { useState } from 'react'
import type { NavProps } from '../App'
import { useCommunity } from '../communityStore'

const FALLBACK_IMGS = [
  'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=600&h=800&fit=crop&auto=format',
  'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=600&h=800&fit=crop&auto=format',
  'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=600&h=800&fit=crop&auto=format',
]

const MY_AVATAR =
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=60&h=60&fit=crop&auto=format'

const COMMENTS = [
  {
    id: 1,
    name: 'zookeeper',
    avatar:
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&auto=format',
    time: '3小时前',
    ip: '四川',
    content:
      '说没有短期的市场行为或者判断，很难说得过去。毕竟 call 出让了未来上涨的空间，但是他自己也讲过卖 put 和 call 就是挣投机者的钱，喜欢玩弄一下投机者。当然 call 容易把好股票卖飞哈。',
    likes: 0,
    isAuthor: true,
    pinned: true,
    replies: [
      {
        id: 11,
        name: 'momo',
        avatar:
          'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=60&h=60&fit=crop&auto=format',
        time: '2小时前',
        content:
          '说明人家短期对 ppmt 的判断是震荡市，上有顶下有底，如果觉得很快会开启上行通道的话是不会卖这种接近于 OTM call 的，只不过是不好公开说破而已',
        likes: 0,
      },
    ],
  },
  {
    id: 2,
    name: '我为ZG挣美元',
    avatar:
      'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=60&h=60&fit=crop&auto=format',
    time: '5小时前',
    ip: '江苏',
    content: '在散户的认知里就只有低买高卖一种赚钱方式🥹',
    likes: 13,
    isAuthor: false,
    pinned: false,
    replies: [],
    expandCount: 8,
  },
  {
    id: 3,
    name: '牛津梦想家',
    avatar:
      'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=60&h=60&fit=crop&auto=format',
    time: '1天前',
    ip: '北京',
    content: '太有用了！请问面试前需要准备哪些数学题类型？',
    likes: 234,
    isAuthor: false,
    pinned: false,
    replies: [],
  },
]

const RELATED = [
  {
    img: 'photo-1481627834876-b7833e8f5570',
    title: '剑桥PAT物理备考攻略',
    author: 'PhysicsAce',
    likes: '1.2万',
  },
  {
    img: 'photo-1523050854058-8df90110c9f1',
    title: '英国大学排名深度解读',
    author: '留学顾问Jenny',
    likes: '8.7千',
  },
  {
    img: 'photo-1501504905252-473c47e087f8',
    title: '高效复习时间管理法',
    author: '学习博主Lucy',
    likes: '5.4千',
  },
  {
    img: 'photo-1546410531-bb4caa6b424d',
    title: 'UCAS文书写作技巧',
    author: '文书大神',
    likes: '2.1万',
  },
]

export default function NoteDetailPage({ navigate, searchQuery }: NavProps) {
  const posts = useCommunity(s => s.posts)
  const getUser = useCommunity(s => s.getUser)
  // 从私信里的笔记卡片进来时，searchQuery 是被分享笔记的 id
  const post = posts.find(p => String(p.id) === String(searchQuery ?? ''))
  const author = getUser(post?.author ?? 'zookeeper')
  const authorAvatar = `https://images.unsplash.com/${author.avatar}?w=80&h=80&fit=crop&auto=format`
  const imgs = post?.img
    ? [
        `https://images.unsplash.com/${post.img}?w=600&h=800&fit=crop&auto=format`,
        ...FALLBACK_IMGS.slice(0, 2),
      ]
    : FALLBACK_IMGS
  const noteTitle = (post?.title ?? post?.quote ?? '需要 roll。我继续卖 put 就可以了啊。').replace(
    /\n/g,
    ' ',
  )
  const noteTags = post?.tags?.length
    ? post.tags.map(t => `#${t}`)
    : ['#价值投资', '#段永平', '#泡泡玛特']
  const noteLikes = post?.likes ?? '258'
  const [imgIdx, setImgIdx] = useState(0)
  const [liked, setLiked] = useState(false)
  const [starred, setStarred] = useState(false)
  const [following, setFollowing] = useState(false)
  const [comment, setComment] = useState('')
  const [showShare, setShowShare] = useState(false)
  const [expandedReplies, setExpandedReplies] = useState<Set<number>>(new Set())

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'var(--surface-sunken)',
        fontFamily: "'Noto Sans SC', sans-serif",
      }}
    >
      {/* Top bar */}
      <div
        style={{
          position: 'sticky',
          top: 0,
          background: 'var(--surface)',
          borderBottom: '1px solid #EBEBEB',
          height: 56,
          display: 'flex',
          alignItems: 'center',
          padding: '0 32px',
          zIndex: 100,
          gap: 16,
        }}
      >
        <button
          onClick={() => navigate('feed')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontSize: 14,
            color: 'var(--grey-800)',
            fontFamily: 'inherit',
            padding: '6px 10px 6px 0',
            borderRadius: 8,
          }}
          onMouseEnter={e => (e.currentTarget.style.color = '#111')}
          onMouseLeave={e => (e.currentTarget.style.color = 'var(--grey-800)')}
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <polyline points="15 18 9 12 15 6" />
          </svg>
          返回
        </button>
        <div style={{ flex: 1 }} />
        <button
          onClick={() => setShowShare(s => !s)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            background: 'var(--surface-sunken)',
            border: 'none',
            borderRadius: 999,
            padding: '7px 16px',
            fontSize: 13,
            color: 'var(--grey-800)',
            cursor: 'pointer',
            fontFamily: 'inherit',
          }}
        >
          <svg
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
          >
            <circle cx="18" cy="5" r="3" />
            <circle cx="6" cy="12" r="3" />
            <circle cx="18" cy="19" r="3" />
            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
            <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
          </svg>
          分享
        </button>
      </div>

      {/* Share dropdown */}
      {showShare && (
        <div
          style={{
            position: 'fixed',
            top: 60,
            right: 36,
            background: 'var(--surface)',
            borderRadius: 12,
            boxShadow: '0 6px 24px rgba(0,0,0,0.12)',
            padding: '8px 0',
            zIndex: 200,
            minWidth: 150,
          }}
          onClick={() => setShowShare(false)}
        >
          {['复制链接', '生成分享图', '微信', '微博', '二维码'].map(opt => (
            <div
              key={opt}
              style={{
                padding: '10px 20px',
                fontSize: 14,
                color: 'var(--grey-900)',
                cursor: 'pointer',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = '#FFF5F6')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
            >
              {opt}
            </div>
          ))}
        </div>
      )}

      {/* Main two-column layout */}
      <div
        style={{
          maxWidth: 1100,
          margin: '28px auto',
          padding: '0 32px',
          display: 'flex',
          gap: 28,
          alignItems: 'flex-start',
        }}
      >
        {/* LEFT: image viewer */}
        <div style={{ width: 440, flexShrink: 0, position: 'sticky', top: 80 }}>
          <div
            style={{
              background: 'var(--ink-strong)',
              borderRadius: 16,
              overflow: 'hidden',
              position: 'relative',
              aspectRatio: '3/4',
            }}
          >
            <img
              src={imgs[imgIdx]}
              alt=""
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            />

            {/* Arrows */}
            {imgIdx > 0 && (
              <button
                onClick={() => setImgIdx(i => i - 1)}
                style={{
                  position: 'absolute',
                  left: 12,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'rgba(0,0,0,0.45)',
                  border: 'none',
                  borderRadius: '50%',
                  width: 40,
                  height: 40,
                  cursor: 'pointer',
                  color: 'var(--surface)',
                  fontSize: 20,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                ‹
              </button>
            )}
            {imgIdx < imgs.length - 1 && (
              <button
                onClick={() => setImgIdx(i => i + 1)}
                style={{
                  position: 'absolute',
                  right: 12,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'rgba(0,0,0,0.45)',
                  border: 'none',
                  borderRadius: '50%',
                  width: 40,
                  height: 40,
                  cursor: 'pointer',
                  color: 'var(--surface)',
                  fontSize: 20,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                ›
              </button>
            )}

            {/* Dots */}
            <div
              style={{
                position: 'absolute',
                bottom: 14,
                left: '50%',
                transform: 'translateX(-50%)',
                display: 'flex',
                gap: 6,
              }}
            >
              {imgs.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setImgIdx(i)}
                  style={{
                    width: i === imgIdx ? 20 : 6,
                    height: 6,
                    borderRadius: 999,
                    background: i === imgIdx ? 'var(--surface)' : 'rgba(255,255,255,0.5)',
                    border: 'none',
                    cursor: 'pointer',
                    padding: 0,
                    transition: 'width 0.2s',
                  }}
                />
              ))}
            </div>
          </div>

          {/* Thumbnail strip */}
          <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
            {imgs.map((img, i) => (
              <div
                key={i}
                onClick={() => setImgIdx(i)}
                style={{
                  width: 72,
                  height: 72,
                  borderRadius: 8,
                  overflow: 'hidden',
                  cursor: 'pointer',
                  border: `2.5px solid ${i === imgIdx ? 'var(--brand)' : 'transparent'}`,
                  transition: 'border-color 0.15s',
                  flexShrink: 0,
                }}
              >
                <img
                  src={img}
                  alt=""
                  loading="lazy"
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                />
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT: content + comments */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Author row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
            <div
              onClick={() => navigate('profile')}
              style={{
                width: 44,
                height: 44,
                borderRadius: '50%',
                overflow: 'hidden',
                cursor: 'pointer',
                flexShrink: 0,
              }}
            >
              <img
                src={authorAvatar}
                alt=""
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>
            <div style={{ flex: 1 }}>
              <div
                onClick={() => navigate('profile')}
                style={{
                  fontSize: 15,
                  fontWeight: 700,
                  color: 'var(--ink-strong)',
                  cursor: 'pointer',
                  marginBottom: 2,
                }}
              >
                {author.name}
              </div>
              <div style={{ fontSize: 12, color: 'var(--grey-450)' }}>9小时前 · 四川</div>
            </div>
            <button
              onClick={() => setFollowing(f => !f)}
              style={{
                border: `1.5px solid ${following ? 'var(--grey-200)' : 'var(--brand)'}`,
                borderRadius: 999,
                padding: '7px 22px',
                fontSize: 13,
                fontWeight: 600,
                color: following ? '#999' : 'var(--brand)',
                background: 'var(--surface)',
                cursor: 'pointer',
                fontFamily: 'inherit',
                transition: 'all 0.15s',
              }}
            >
              {following ? '已关注' : '关注'}
            </button>
          </div>

          {/* Content */}
          <div
            style={{
              background: 'var(--surface)',
              borderRadius: 16,
              padding: '24px 28px',
              marginBottom: 16,
              boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
            }}
          >
            <div
              style={{
                fontSize: 19,
                fontWeight: 700,
                color: 'var(--ink-strong)',
                lineHeight: 1.5,
                marginBottom: 12,
              }}
            >
              {noteTitle}
            </div>
            <p
              style={{
                fontSize: 15.5,
                color: 'var(--grey-900)',
                lineHeight: 1.8,
                margin: '0 0 16px',
              }}
            >
              这条笔记由同学分享给我，先把要点记下来，周末整理成自己的复习清单。
            </p>
            {/* Hashtags */}
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
              {noteTags.map(tag => (
                <span
                  key={tag}
                  style={{ color: '#1565C0', fontSize: 14, cursor: 'pointer' }}
                  onMouseEnter={e => (e.currentTarget.style.opacity = '0.7')}
                  onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
                >
                  {tag}
                </span>
              ))}
            </div>
            {/* Hot topic */}
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                background: '#FFF5EC',
                borderRadius: 999,
                padding: '5px 14px',
                gap: 6,
              }}
            >
              <span>🔥</span>
              <span
                style={{
                  fontSize: 12,
                  color: '#FF6B00',
                  fontWeight: 600,
                  borderRight: '1px solid #FFD4A8',
                  paddingRight: 8,
                }}
              >
                热点
              </span>
              <span style={{ fontSize: 12, color: 'var(--grey-800)', paddingLeft: 2 }}>
                段永平回应减持泡泡玛特
              </span>
            </div>

            {/* Action bar */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                marginTop: 20,
                paddingTop: 16,
                borderTop: '1px solid #F5F5F5',
              }}
            >
              <button
                onClick={() => setLiked(l => !l)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  background: liked ? 'var(--brand-tint)' : 'var(--surface-sunken)',
                  border: 'none',
                  borderRadius: 999,
                  padding: '8px 18px',
                  fontSize: 14,
                  color: liked ? 'var(--brand)' : 'var(--text-muted)',
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  transition: 'all 0.15s',
                }}
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill={liked ? '#FF2442' : 'none'}
                  stroke={liked ? '#FF2442' : 'var(--text-muted)'}
                  strokeWidth="1.8"
                >
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                </svg>
                {liked ? `已赞 · ${noteLikes}` : noteLikes}
              </button>
              <button
                onClick={() => setStarred(s => !s)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  background: starred ? '#FFFBEC' : 'var(--surface-sunken)',
                  border: 'none',
                  borderRadius: 999,
                  padding: '8px 18px',
                  fontSize: 14,
                  color: starred ? '#FFB800' : 'var(--text-muted)',
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  transition: 'all 0.15s',
                }}
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill={starred ? '#FFB800' : 'none'}
                  stroke={starred ? '#FFB800' : 'var(--text-muted)'}
                  strokeWidth="1.8"
                >
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
                {starred ? 239 : 238}
              </button>
              <button
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  background: 'var(--surface-sunken)',
                  border: 'none',
                  borderRadius: 999,
                  padding: '8px 18px',
                  fontSize: 14,
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                }}
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#666"
                  strokeWidth="1.8"
                >
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
                82
              </button>
              <div style={{ flex: 1 }} />
              <button
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--grey-450)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                  fontSize: 13,
                  fontFamily: 'inherit',
                }}
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#aaa"
                  strokeWidth="1.8"
                >
                  <circle cx="12" cy="12" r="10" />
                  <line x1="15" y1="9" x2="9" y2="15" />
                  <line x1="9" y1="9" x2="15" y2="15" />
                </svg>
                不喜欢
              </button>
            </div>
          </div>

          {/* Comments section */}
          <div
            style={{
              background: 'var(--surface)',
              borderRadius: 16,
              padding: '24px 28px',
              boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
              marginBottom: 16,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
              <span style={{ fontSize: 16, fontWeight: 700, color: 'var(--ink-strong)' }}>
                共 82 条评论
              </span>
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#aaa"
                strokeWidth="2"
              >
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </div>

            {/* Comment input */}
            <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: '50%',
                  overflow: 'hidden',
                  flexShrink: 0,
                }}
              >
                <img
                  src={MY_AVATAR}
                  alt=""
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>
              <div
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  background: 'var(--surface-sunken)',
                  borderRadius: 999,
                  padding: '9px 16px',
                }}
              >
                <input
                  value={comment}
                  onChange={e => setComment(e.target.value)}
                  placeholder="说点什么..."
                  style={{
                    flex: 1,
                    border: 'none',
                    outline: 'none',
                    background: 'transparent',
                    fontSize: 14,
                    color: 'var(--grey-900)',
                    fontFamily: 'inherit',
                  }}
                />
                <svg
                  width="17"
                  height="17"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#bbb"
                  strokeWidth="1.8"
                >
                  <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                  <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                </svg>
                <svg
                  width="17"
                  height="17"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#bbb"
                  strokeWidth="1.8"
                >
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <polyline points="21 15 16 10 5 21" />
                </svg>
              </div>
            </div>

            {/* Comment list */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              {COMMENTS.map(c => (
                <div
                  key={c.id}
                  style={{ paddingBottom: 20, borderBottom: '1px solid #F5F5F5', marginBottom: 20 }}
                >
                  <div style={{ display: 'flex', gap: 12 }}>
                    <div
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: '50%',
                        overflow: 'hidden',
                        flexShrink: 0,
                      }}
                    >
                      <img
                        src={c.avatar}
                        alt=""
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div
                        style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 5 }}
                      >
                        <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{c.name}</span>
                        {c.isAuthor && (
                          <span
                            style={{
                              background: 'var(--brand)',
                              color: 'var(--surface)',
                              fontSize: 10,
                              fontWeight: 700,
                              padding: '1px 6px',
                              borderRadius: 999,
                            }}
                          >
                            作者
                          </span>
                        )}
                        {c.pinned && (
                          <span
                            style={{
                              background: '#FFF0F0',
                              color: 'var(--brand)',
                              fontSize: 10,
                              padding: '1px 6px',
                              borderRadius: 999,
                            }}
                          >
                            置顶
                          </span>
                        )}
                      </div>
                      <p
                        style={{
                          fontSize: 14,
                          color: 'var(--text)',
                          margin: '0 0 8px',
                          lineHeight: 1.65,
                        }}
                      >
                        {c.content}
                      </p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <span style={{ fontSize: 12, color: 'var(--grey-350)' }}>
                          {c.time}
                          {c.ip ? ` · ${c.ip}` : ''}
                        </span>
                        <button
                          style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            fontSize: 12,
                            color: 'var(--grey-450)',
                            fontFamily: 'inherit',
                            padding: 0,
                          }}
                        >
                          回复
                        </button>
                        <div style={{ flex: 1 }} />
                        <button
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 3,
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            fontSize: 12,
                            color: 'var(--grey-450)',
                            fontFamily: 'inherit',
                            padding: 0,
                          }}
                        >
                          <svg
                            width="13"
                            height="13"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="#aaa"
                            strokeWidth="1.8"
                          >
                            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                          </svg>
                          {c.likes > 0 ? c.likes : ''}
                        </button>
                      </div>

                      {/* Nested replies */}
                      {c.replies && c.replies.length > 0 && (
                        <div style={{ marginTop: 12, paddingLeft: 0 }}>
                          {c.replies.map(r => (
                            <div
                              key={r.id}
                              style={{
                                display: 'flex',
                                gap: 10,
                                padding: '12px 14px',
                                background: '#F9F9F9',
                                borderRadius: 10,
                                marginBottom: 6,
                              }}
                            >
                              <div
                                style={{
                                  width: 28,
                                  height: 28,
                                  borderRadius: '50%',
                                  overflow: 'hidden',
                                  flexShrink: 0,
                                }}
                              >
                                <img
                                  src={r.avatar}
                                  alt=""
                                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                />
                              </div>
                              <div style={{ flex: 1 }}>
                                <span style={{ fontSize: 12, color: '#888', marginRight: 8 }}>
                                  {r.name}
                                </span>
                                <p
                                  style={{
                                    fontSize: 13,
                                    color: 'var(--grey-900)',
                                    margin: '4px 0 6px',
                                    lineHeight: 1.6,
                                  }}
                                >
                                  {r.content}
                                </p>
                                <div style={{ display: 'flex', gap: 10 }}>
                                  <span style={{ fontSize: 11, color: 'var(--grey-350)' }}>
                                    {r.time}
                                  </span>
                                  <button
                                    style={{
                                      background: 'none',
                                      border: 'none',
                                      cursor: 'pointer',
                                      fontSize: 11,
                                      color: 'var(--grey-450)',
                                      fontFamily: 'inherit',
                                      padding: 0,
                                    }}
                                  >
                                    回复
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Expand replies */}
                      {'expandCount' in c && c.expandCount && !expandedReplies.has(c.id) && (
                        <button
                          onClick={() => setExpandedReplies(s => new Set([...s, c.id]))}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 5,
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            fontSize: 12,
                            color: '#888',
                            fontFamily: 'inherit',
                            padding: '8px 0 0',
                          }}
                        >
                          展开 {c.expandCount} 条回复
                          <svg
                            width="12"
                            height="12"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="#aaa"
                            strokeWidth="2"
                          >
                            <polyline points="6 9 12 15 18 9" />
                          </svg>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Related notes */}
          <div
            style={{
              background: 'var(--surface)',
              borderRadius: 16,
              padding: '24px 28px',
              boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
            }}
          >
            <div
              style={{
                fontSize: 16,
                fontWeight: 700,
                color: 'var(--ink-strong)',
                marginBottom: 16,
              }}
            >
              相关笔记
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
              {RELATED.map((r, i) => (
                <div
                  key={i}
                  onClick={() => navigate('detail')}
                  style={{
                    cursor: 'pointer',
                    borderRadius: 10,
                    overflow: 'hidden',
                    background: 'var(--surface-sunken)',
                    transition: 'transform 0.15s',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.transform = 'translateY(-2px)')}
                  onMouseLeave={e => (e.currentTarget.style.transform = 'none')}
                >
                  <img
                    src={`https://images.unsplash.com/${r.img}?w=200&h=260&fit=crop&auto=format`}
                    alt=""
                    loading="lazy"
                    style={{
                      width: '100%',
                      aspectRatio: '3/4',
                      objectFit: 'cover',
                      display: 'block',
                    }}
                  />
                  <div style={{ padding: '8px 10px 10px' }}>
                    <div
                      style={{
                        fontSize: 12,
                        fontWeight: 600,
                        color: 'var(--text)',
                        lineHeight: 1.4,
                        marginBottom: 4,
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical' as const,
                        overflow: 'hidden',
                      }}
                    >
                      {r.title}
                    </div>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <span style={{ fontSize: 11, color: 'var(--grey-450)' }}>{r.author}</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="#FFB0BB">
                          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                        </svg>
                        <span style={{ fontSize: 11, color: 'var(--grey-350)' }}>{r.likes}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
