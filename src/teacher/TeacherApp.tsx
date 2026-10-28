import { useState, useRef } from 'react'
import type { Connection, Post } from './types'
import { initialConnections, initialPosts } from './data'
import { useProfile, type ProfileData } from '../profileStore'
import type { NavProps } from '../App'
import { Ico, icons, inputCls, Modal } from './ui'

// ── Nav ────────────────────────────────────────────────────────────────────
/**
 * 教师模块只剩两块：动态（Home）、人脉（My Network）。
 * 私信与通知统一走主站的「消息 / 通知」页；招聘（Jobs）已下线；
 * 「我的」与主站合并成同一个页面（顶栏 Me → 跳主站「我的」的「职业」视图），
 * 详见 docs/adr/0007-teacher-module-scope.md。
 */
type Tab = 'feed' | 'network'

function NavBar({
  tab,
  setTab,
  profile,
  navigate,
}: {
  tab: Tab
  setTab: (t: Tab) => void
  profile: ProfileData
  navigate: NavProps['navigate']
}) {
  const [showMe, setShowMe] = useState(false)
  const navItems: { id: Tab; label: string; icon: string }[] = [
    { id: 'feed', label: 'Home', icon: icons.home },
    { id: 'network', label: 'My Network', icon: icons.network },
  ]
  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-linkedin-border shadow-sm">
      <div className="max-w-[1128px] mx-auto px-4 flex items-center h-14">
        <div className="w-9 h-9 bg-linkedin rounded flex items-center justify-center flex-shrink-0 mr-2">
          <svg viewBox="0 0 24 24" className="w-6 h-6 fill-white">
            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
          </svg>
        </div>
        <div className="relative w-[220px] hidden sm:block mr-2">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted">
            <Ico d={icons.search} size={16} />
          </div>
          <input
            type="text"
            placeholder="Search"
            className="w-full bg-[#EEF3F8] rounded pl-9 pr-3 py-1.5 text-sm placeholder:text-text-muted outline-none focus:ring-1 focus:ring-linkedin"
          />
        </div>
        <div className="flex-1" />
        <div className="flex items-center">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => setTab(item.id)}
              className={`relative flex flex-col items-center justify-center gap-0.5 h-14 px-3 min-w-[64px] text-[11px] border-b-2 transition-all cursor-pointer ${tab === item.id ? 'border-ink text-ink' : 'border-transparent text-text-muted hover:text-ink'}`}
            >
              <Ico d={item.icon} size={22} />
              <span className="hidden md:block">{item.label}</span>
            </button>
          ))}
        </div>
        <div className="w-px h-8 bg-linkedin-border mx-2 hidden md:block" />
        <div className="relative">
          <button
            onClick={() => setShowMe(v => !v)}
            className="flex flex-col items-center gap-0.5 px-2 py-1 h-14 justify-center text-[11px] text-text-muted hover:text-ink cursor-pointer"
          >
            <img src={profile.avatarUrl} alt="me" className="w-6 h-6 rounded-full object-cover" />
            <span className="hidden md:flex items-center gap-0.5">
              Me <Ico d={icons.chevDown} size={12} />
            </span>
          </button>
          {showMe && (
            <div className="absolute right-0 top-14 bg-white border border-linkedin-border rounded-xl shadow-xl w-72 z-50 overflow-hidden">
              <div className="p-4 border-b border-linkedin-border">
                <div className="flex items-center gap-3">
                  <img
                    src={profile.avatarUrl}
                    alt=""
                    className="w-14 h-14 rounded-full object-cover"
                  />
                  <div>
                    <p className="font-semibold text-sm text-ink">{profile.name}</p>
                    <p className="text-xs text-text-muted line-clamp-2">{profile.headline}</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    // 「我的」已与主站合并：跳到主站「我的」页并直达职业视图
                    navigate('profile', 'career')
                    setShowMe(false)
                  }}
                  className="mt-3 w-full py-1.5 border-2 border-linkedin text-linkedin text-sm font-semibold rounded-full hover:bg-blue-50 transition-colors cursor-pointer"
                >
                  View Profile
                </button>
              </div>
              <div className="p-3 space-y-1">
                {[
                  { icon: icons.settings, label: 'Settings & Privacy' },
                  { icon: icons.eye, label: 'Visibility' },
                  { icon: icons.logout, label: 'Sign Out' },
                ].map(item => (
                  <button
                    key={item.label}
                    className="flex items-center gap-3 w-full px-3 py-2 rounded-lg hover:bg-linkedin-bg text-sm text-ink transition-colors cursor-pointer"
                  >
                    <Ico d={item.icon} size={16} />
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
        <button className="hidden lg:block ml-2 text-xs text-[#915907] font-semibold border border-[#915907] rounded px-2.5 py-1 hover:bg-amber-50 transition-colors cursor-pointer">
          Try Premium
        </button>
      </div>
    </nav>
  )
}

// ── FEED PAGE ──────────────────────────────────────────────────────────────
function CreatePostModal({
  profile,
  onPost,
  onClose,
}: {
  profile: ProfileData
  onPost: (p: Post) => void
  onClose: () => void
}) {
  const [text, setText] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [imageFile, setImageFile] = useState<string | null>(null)
  const imgRef = useRef<HTMLInputElement>(null)

  const handleImageFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (f) setImageFile(URL.createObjectURL(f))
  }

  const submit = () => {
    if (!text.trim()) return
    onPost({
      id: Date.now().toString(),
      author: profile.name,
      authorRole: profile.headline,
      authorAvatar: profile.avatarUrl,
      content: text,
      image: imageFile || imageUrl || undefined,
      time: 'Just now',
      likes: 0,
      comments: [],
      reposts: 0,
      liked: false,
      reposted: false,
    })
    onClose()
  }

  return (
    <Modal title="Create a post" onClose={onClose} wide>
      <div className="flex items-center gap-3 mb-4">
        <img src={profile.avatarUrl} alt="" className="w-12 h-12 rounded-full object-cover" />
        <div>
          <p className="text-sm font-semibold text-ink">{profile.name}</p>
          <button className="flex items-center gap-1 text-xs border border-[#C8C6C3] rounded-full px-2.5 py-0.5 hover:bg-linkedin-bg cursor-pointer">
            🌐 Anyone <Ico d={icons.chevDown} size={10} />
          </button>
        </div>
      </div>
      <textarea
        className="w-full border-0 outline-none resize-none text-base text-ink placeholder:text-text-subtle min-h-[140px]"
        placeholder="What do you want to talk about?"
        value={text}
        onChange={e => setText(e.target.value)}
        autoFocus
      />
      {(imageFile || imageUrl) && (
        <div className="relative mt-2">
          <img
            src={imageFile || imageUrl}
            alt="Post"
            loading="lazy"
            className="w-full rounded-xl object-cover max-h-64"
          />
          <button
            onClick={() => {
              setImageFile(null)
              setImageUrl('')
            }}
            className="absolute top-2 right-2 bg-black/60 text-white p-1.5 rounded-full hover:bg-black/80 cursor-pointer"
          >
            <Ico d={icons.x} size={14} />
          </button>
        </div>
      )}
      <div className="flex items-center justify-between mt-4 pt-4 border-t border-linkedin-border">
        <div className="flex items-center gap-1">
          <button
            onClick={() => imgRef.current?.click()}
            className="p-2 rounded-full hover:bg-linkedin-bg text-text-muted hover:text-linkedin transition-colors cursor-pointer"
            title="Add photo"
          >
            <Ico d={icons.image} size={20} />
          </button>
          <input
            ref={imgRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleImageFile}
          />
          {['🎥', '📄', '📊', '⭐', '✒️'].map(emoji => (
            <button
              key={emoji}
              className="p-2 rounded-full hover:bg-linkedin-bg text-lg transition-colors cursor-pointer"
              title="Add media"
            >
              {emoji}
            </button>
          ))}
        </div>
        <button
          disabled={!text.trim()}
          onClick={submit}
          className={`px-5 py-1.5 rounded-full text-sm font-semibold transition-colors ${text.trim() ? 'bg-linkedin text-white hover:bg-[#004182] cursor-pointer' : 'bg-linkedin-border text-text-subtle cursor-not-allowed'}`}
        >
          Post
        </button>
      </div>
    </Modal>
  )
}

function PostCard({
  post,
  myAvatar,
  onLike,
  onComment,
  onRepost,
}: {
  post: Post
  myAvatar: string
  onLike: () => void
  onComment: (text: string) => void
  onRepost: () => void
}) {
  const [showComments, setShowComments] = useState(false)
  const [commentText, setCommentText] = useState('')
  return (
    <div className="bg-white rounded-xl border border-linkedin-border overflow-hidden hover:shadow-sm transition-shadow">
      <div className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-start gap-3">
            <img
              src={post.authorAvatar}
              alt={post.author}
              className="w-12 h-12 rounded-full object-cover flex-shrink-0"
            />
            <div>
              <p className="text-sm font-semibold text-ink hover:underline cursor-pointer">
                {post.author}
              </p>
              <p className="text-xs text-text-muted line-clamp-1">{post.authorRole}</p>
              <p className="text-xs text-text-muted">{post.time}</p>
            </div>
          </div>
          <button className="text-text-muted hover:text-ink p-1 cursor-pointer">
            <Ico d={icons.more} size={18} fill />
          </button>
        </div>
        <p className="text-sm text-ink leading-relaxed">{post.content}</p>
      </div>
      {post.image && (
        <img src={post.image} alt="Post" loading="lazy" className="w-full max-h-96 object-cover" />
      )}
      <div className="px-4 pb-1">
        <div className="flex items-center justify-between py-2 text-xs text-text-muted border-b border-linkedin-border">
          <span>👍 {post.likes.toLocaleString()}</span>
          <button
            onClick={() => setShowComments(v => !v)}
            className="hover:text-linkedin hover:underline cursor-pointer"
          >
            {post.comments.length} comments · {post.reposts} reposts
          </button>
        </div>
        <div className="flex items-center">
          {[
            {
              icon: icons.like,
              label: post.liked ? 'Liked' : 'Like',
              active: post.liked,
              action: onLike,
            },
            {
              icon: icons.comment,
              label: 'Comment',
              active: false,
              action: () => setShowComments(v => !v),
            },
            {
              icon: icons.share,
              label: post.reposted ? 'Reposted' : 'Repost',
              active: post.reposted,
              action: onRepost,
            },
            { icon: icons.send, label: 'Send', active: false, action: () => {} },
          ].map(btn => (
            <button
              key={btn.label}
              onClick={btn.action}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded text-xs font-medium transition-all cursor-pointer ${btn.active ? 'text-linkedin' : 'text-text-muted hover:bg-linkedin-bg hover:text-ink'}`}
            >
              <Ico d={btn.icon} size={16} />
              <span className="hidden sm:block">{btn.label}</span>
            </button>
          ))}
        </div>
        {showComments && (
          <div className="pb-3 space-y-3">
            {post.comments.map(c => (
              <div key={c.id} className="flex gap-2.5">
                <img
                  src={c.avatar}
                  alt={c.author}
                  className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                />
                <div className="flex-1 bg-linkedin-bg rounded-2xl px-3 py-2">
                  <p className="text-xs font-semibold text-ink">{c.author}</p>
                  <p className="text-xs text-ink mt-0.5">{c.content}</p>
                </div>
              </div>
            ))}
            <div className="flex gap-2.5 items-center">
              <img
                src={myAvatar}
                alt="me"
                className="w-8 h-8 rounded-full object-cover flex-shrink-0"
              />
              <div className="flex-1 flex items-center gap-2 bg-linkedin-bg rounded-full px-4 py-1.5">
                <input
                  className="flex-1 bg-transparent text-xs text-ink outline-none placeholder:text-text-subtle"
                  placeholder="Add a comment..."
                  value={commentText}
                  onChange={e => setCommentText(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter' && commentText.trim()) {
                      onComment(commentText)
                      setCommentText('')
                    }
                  }}
                />
                <button
                  disabled={!commentText.trim()}
                  onClick={() => {
                    onComment(commentText)
                    setCommentText('')
                  }}
                  className={`transition-colors cursor-pointer ${commentText.trim() ? 'text-linkedin' : 'text-[#C8C6C3]'}`}
                >
                  <Ico d={icons.send} size={14} />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function FeedPage({
  profile,
  posts,
  setPosts,
}: {
  profile: ProfileData
  posts: Post[]
  setPosts: (p: Post[]) => void
}) {
  const [showCreatePost, setShowCreatePost] = useState(false)
  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-4">
      <div className="space-y-3">
        {/* Create post box */}
        <div className="bg-white rounded-xl border border-linkedin-border p-4">
          <div className="flex items-center gap-3 mb-3">
            <img src={profile.avatarUrl} alt="" className="w-12 h-12 rounded-full object-cover" />
            <button
              onClick={() => setShowCreatePost(true)}
              className="flex-1 text-left px-4 py-2.5 rounded-full border border-[#C8C6C3] text-sm text-text-muted hover:bg-linkedin-bg transition-colors cursor-pointer"
            >
              Start a post, try writing with AI
            </button>
          </div>
          <div className="flex items-center gap-1">
            {[
              { emoji: '🖼', label: 'Media', action: () => setShowCreatePost(true) },
              { emoji: '📅', label: 'Event', action: () => {} },
              { emoji: '✏️', label: 'Write article', action: () => {} },
            ].map(btn => (
              <button
                key={btn.label}
                onClick={btn.action}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium text-text-muted hover:bg-linkedin-bg hover:text-ink transition-colors cursor-pointer"
              >
                <span>{btn.emoji}</span>
                {btn.label}
              </button>
            ))}
          </div>
        </div>
        {posts.map(post => (
          <PostCard
            key={post.id}
            post={post}
            myAvatar={profile.avatarUrl}
            onLike={() =>
              setPosts(
                posts.map(p =>
                  p.id === post.id
                    ? { ...p, liked: !p.liked, likes: p.liked ? p.likes - 1 : p.likes + 1 }
                    : p,
                ),
              )
            }
            onComment={text =>
              setPosts(
                posts.map(p =>
                  p.id === post.id
                    ? {
                        ...p,
                        comments: [
                          ...p.comments,
                          {
                            id: Date.now().toString(),
                            author: profile.name,
                            avatar: profile.avatarUrl,
                            content: text,
                            time: 'Just now',
                            likes: 0,
                          },
                        ],
                      }
                    : p,
                ),
              )
            }
            onRepost={() =>
              setPosts(
                posts.map(p =>
                  p.id === post.id
                    ? {
                        ...p,
                        reposted: !p.reposted,
                        reposts: p.reposted ? p.reposts - 1 : p.reposts + 1,
                      }
                    : p,
                ),
              )
            }
          />
        ))}
      </div>
      <div className="space-y-3">
        <div className="bg-white rounded-xl border border-linkedin-border p-4">
          <div className="flex items-center gap-3">
            <img src={profile.avatarUrl} alt="" className="w-16 h-16 rounded-full object-cover" />
            <div>
              <p className="text-sm font-semibold text-ink">{profile.name}</p>
              <p className="text-xs text-text-muted line-clamp-2">{profile.headline}</p>
            </div>
          </div>
          <div className="mt-3 space-y-2 border-t border-linkedin-border pt-3">
            {[
              { label: 'Profile viewers', value: '2,847' },
              { label: 'Post impressions', value: '18.4K' },
            ].map(s => (
              <div
                key={s.label}
                className="flex items-center justify-between text-xs cursor-pointer hover:text-linkedin"
              >
                <span className="text-text-muted">{s.label}</span>
                <span className="font-semibold text-linkedin">{s.value}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white rounded-xl border border-linkedin-border p-4">
          <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wide mb-3">
            LinkedIn News
          </h3>
          <div className="space-y-3">
            {[
              { headline: 'AI tools reshape design workflows', readers: '24K readers' },
              { headline: "Stripe's new banking features explained", readers: '18K readers' },
              { headline: 'Remote work trends 2025 report', readers: '31K readers' },
              { headline: 'Best design tools of the year', readers: '15K readers' },
            ].map(news => (
              <div key={news.headline} className="cursor-pointer hover:text-linkedin group">
                <p className="text-xs font-medium text-ink group-hover:text-linkedin leading-tight">
                  · {news.headline}
                </p>
                <p className="text-xs text-text-muted ml-2">{news.readers}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
      {showCreatePost && (
        <CreatePostModal
          profile={profile}
          onPost={p => setPosts([p, ...posts])}
          onClose={() => setShowCreatePost(false)}
        />
      )}
    </div>
  )
}

// ── NETWORK PAGE ───────────────────────────────────────────────────────────
function NetworkPage({
  connections,
  setConnections,
}: {
  connections: Connection[]
  setConnections: (c: Connection[]) => void
}) {
  const [filter, setFilter] = useState<'all' | 'connected' | 'pending'>('all')
  const [search, setSearch] = useState('')
  const pending = connections.filter(c => c.pending)
  const visible = connections.filter(c => {
    if (filter === 'connected' && !c.connected) return false
    if (filter === 'pending' && !c.pending) return false
    if (search && !c.name.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })
  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-4">
      <div className="space-y-3">
        {pending.length > 0 && (
          <div className="bg-white rounded-xl border border-linkedin-border p-5">
            <h2 className="text-base font-semibold text-ink mb-4">
              Invitations ({pending.length})
            </h2>
            <div className="space-y-4">
              {pending.map(c => (
                <div key={c.id} className="flex items-center gap-3">
                  <img
                    src={c.avatar}
                    alt={c.name}
                    loading="lazy"
                    className="w-14 h-14 rounded-full object-cover"
                  />
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-ink hover:underline cursor-pointer">
                      {c.name}
                    </p>
                    <p className="text-xs text-text-muted">{c.role}</p>
                    <p className="text-xs text-text-muted">
                      {c.mutualConnections} mutual connections
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() =>
                        setConnections(
                          connections.map(x => (x.id === c.id ? { ...x, pending: false } : x)),
                        )
                      }
                      className="px-4 py-1.5 border border-[#C8C6C3] rounded-full text-sm text-text-muted hover:bg-linkedin-bg cursor-pointer"
                    >
                      Ignore
                    </button>
                    <button
                      onClick={() =>
                        setConnections(
                          connections.map(x =>
                            x.id === c.id ? { ...x, pending: false, connected: true } : x,
                          ),
                        )
                      }
                      className="px-4 py-1.5 bg-linkedin text-white rounded-full text-sm font-semibold hover:bg-[#004182] cursor-pointer"
                    >
                      Accept
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        <div className="bg-white rounded-xl border border-linkedin-border p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-ink">People you may know</h2>
          </div>
          <div className="flex items-center gap-2 mb-4">
            <div className="relative flex-1">
              <Ico d={icons.search} size={15} />
              <input
                className={inputCls + ' pl-8'}
                placeholder="Search people..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <div className="flex gap-1">
              {(['all', 'connected', 'pending'] as const).map(f => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium capitalize transition-colors cursor-pointer ${filter === f ? 'bg-linkedin text-white' : 'border border-[#C8C6C3] text-text-muted hover:bg-linkedin-bg'}`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {visible.map(c => (
              <div
                key={c.id}
                className="border border-linkedin-border rounded-xl overflow-hidden hover:shadow-sm transition-shadow"
              >
                <div className="h-16 bg-gradient-to-r from-blue-100 to-blue-50" />
                <div className="px-4 pb-4">
                  <div className="-mt-8 mb-2">
                    <img
                      src={c.avatar}
                      alt={c.name}
                      className="w-16 h-16 rounded-full object-cover border-2 border-white"
                    />
                  </div>
                  <p className="text-sm font-semibold text-ink hover:underline cursor-pointer">
                    {c.name}
                  </p>
                  <p className="text-xs text-text-muted line-clamp-1 mt-0.5">{c.role}</p>
                  <p className="text-xs text-text-muted mt-0.5">
                    {c.mutualConnections} mutual connections
                  </p>
                  <button
                    onClick={() =>
                      setConnections(
                        connections.map(x =>
                          x.id === c.id ? { ...x, connected: !x.connected, pending: false } : x,
                        ),
                      )
                    }
                    className={`mt-3 w-full py-1.5 rounded-full text-sm font-semibold border-2 transition-all cursor-pointer ${c.connected ? 'bg-white border-linkedin text-linkedin hover:bg-blue-50' : 'border-linkedin text-linkedin hover:bg-blue-50'}`}
                  >
                    {c.connected ? '✓ Connected' : '+ Connect'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="space-y-3">
        <div className="bg-white rounded-xl border border-linkedin-border p-4">
          <h3 className="text-sm font-semibold text-ink mb-2">Manage my network</h3>
          {[
            { label: 'Connections', value: connections.filter(c => c.connected).length.toString() },
            { label: 'Following & Followers', value: '12,400' },
            { label: 'Groups', value: '8' },
            { label: 'Events', value: '3' },
            { label: 'Pages', value: '12' },
          ].map(item => (
            <div
              key={item.label}
              className="flex items-center justify-between py-2 border-b border-linkedin-border last:border-0 cursor-pointer hover:text-linkedin group"
            >
              <span className="text-sm text-ink group-hover:text-linkedin">{item.label}</span>
              <span className="text-sm font-semibold text-text-muted">{item.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── ROOT ───────────────────────────────────────────────────────────────────
export default function TeacherApp({ navigate }: { navigate: NavProps['navigate'] }) {
  const [tab, setTab] = useState<Tab>('feed')
  const [posts, setPosts] = useState(initialPosts)
  const [connections, setConnections] = useState(initialConnections)
  // 身份资料统一来自 profileStore：和主站「我的」共用同一份，改一处两边都变
  const profile = useProfile(s => s.profile)

  return (
    <div className="min-h-screen bg-linkedin-bg">
      <NavBar tab={tab} setTab={setTab} profile={profile} navigate={navigate} />
      <main className="max-w-[1128px] mx-auto px-4 py-5">
        {tab === 'feed' && <FeedPage profile={profile} posts={posts} setPosts={setPosts} />}
        {tab === 'network' && (
          <NetworkPage connections={connections} setConnections={setConnections} />
        )}
      </main>
    </div>
  )
}
