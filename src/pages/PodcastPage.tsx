import { useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import AppShell from '../components/AppShell'
import type { NavProps } from '../App'
import { useContent } from '../contentStore'
import type { PodcastEpisode } from '../podcastData'
import '../styles/podcast.css'

/**
 * Podcast 页：经济学人版式的深色播客界面（从 Figma Make 原型移植）。
 *
 * 数据只认 `useContent`（ADR-0006）：页面不 import podcastData / repositories，
 * 剧集与分类都由 store 提供，换后端时这一页零改动。
 *
 * 相对原型**没有搬过来**的部分，都是「看着能用、其实没有真实来源」的空壳，
 * 摆出来反而误导。要哪个说一声，单个加回来都不难：
 *   · 上传视频弹窗 —— 没有上传后端；站内已有的发布入口走顶栏「上传视频」按钮跳 publish
 *   · 语音搜索、卡片三点菜单、订阅栏「展开」—— 没有对应行为
 *   · 「订阅在线」绿点、「已认证」对勾 —— 没有真实的在线/认证状态，标了就是编的
 *   · 分类里的「最新发布」—— 剧集数据没有时间字段，排不出来
 */
export default function PodcastPage({ navigate, currentPage }: NavProps) {
  const episodes = useContent(s => s.podcastEpisodes)
  const categories = useContent(s => s.podcastCategories)

  const [activeCategory, setActiveCategory] = useState('全部')
  const [activeAuthor, setActiveAuthor] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [subsOpen, setSubsOpen] = useState(true)

  /** 订阅列表 = 出现过的作者，按首次出现顺序去重（数据里就这些，不另编频道） */
  const authors = useMemo(() => {
    const seen = new Map<string, PodcastEpisode>()
    for (const episode of episodes) {
      if (!seen.has(episode.author)) seen.set(episode.author, episode)
    }
    return [...seen.values()]
  }, [episodes])

  /** 头图右侧推荐位：取播放量最高的那集 */
  const featured = useMemo(
    () =>
      episodes.reduce<PodcastEpisode | null>(
        (best, episode) => (!best || (episode.plays ?? 0) > (best.plays ?? 0) ? episode : best),
        null,
      ),
    [episodes],
  )

  const visible = useMemo(() => {
    const keyword = search.trim().toLowerCase()
    return episodes.filter(episode => {
      if (activeCategory !== '全部' && episode.category !== activeCategory) return false
      if (activeAuthor && episode.author !== activeAuthor) return false
      if (!keyword) return true
      return `${episode.title} ${episode.author} ${episode.category}`
        .toLowerCase()
        .includes(keyword)
    })
  }, [episodes, activeCategory, activeAuthor, search])

  function toggleAuthor(name: string) {
    setActiveAuthor(current => (current === name ? null : name))
  }

  return (
    <AppShell navigate={navigate} currentPage={currentPage} background="var(--pc-bg)">
      <div className="pc-shell">
        <header className="pc-topbar">
          <div className="pc-topbar-left">
            <button
              className="pc-icon-btn pc-menu-btn"
              type="button"
              onClick={() => setSubsOpen(open => !open)}
              aria-label={subsOpen ? '收起订阅栏' : '展开订阅栏'}
            >
              <Icon className="pc-header-icon">
                <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="1.8" />
              </Icon>
            </button>
            <button
              className="pc-brand"
              type="button"
              onClick={() => {
                setActiveCategory('全部')
                setActiveAuthor(null)
                setSearch('')
              }}
              aria-label="Comenius Podcast 首页"
            >
              <span className="pc-brand-mark">
                <span />
                <span />
                <span />
              </span>
              <span className="pc-brand-name">Comenius Podcast</span>
            </button>
          </div>

          <form className="pc-search" onSubmit={event => event.preventDefault()}>
            <label className="pc-search-box">
              <span className="pc-sr-only">搜索播客内容</span>
              <input
                value={search}
                onChange={event => setSearch(event.target.value)}
                placeholder="搜索剧集、作者、分类"
              />
              <button type="submit" aria-label="搜索">
                <Icon className="pc-search-icon">
                  <circle cx="11" cy="11" r="6.5" stroke="currentColor" strokeWidth="1.8" />
                  <path d="m16 16 4 4" stroke="currentColor" strokeWidth="1.8" />
                </Icon>
              </button>
            </label>
          </form>

          <div className="pc-topbar-actions">
            <button className="pc-create-btn" type="button" onClick={() => navigate('publish')}>
              <span className="pc-plus">＋</span>
              上传视频
            </button>
            <button
              className="pc-icon-btn pc-notify-btn"
              type="button"
              onClick={() => navigate('notifications')}
              aria-label="通知"
            >
              <Icon className="pc-header-icon">
                <path
                  d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 8h18c0-1-3-1-3-8ZM9.5 20h5"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.7"
                />
              </Icon>
            </button>
            <button
              className="pc-profile-btn"
              type="button"
              onClick={() => navigate('profile')}
              aria-label="个人资料"
            >
              U
            </button>
          </div>
        </header>

        <div className="pc-layout">
          <aside className={`pc-subs ${subsOpen ? 'pc-subs-open' : 'pc-subs-closed'}`}>
            <div className="pc-subs-heading">
              <h2>订阅</h2>
            </div>
            {authors.map(author => (
              <button
                className="pc-sub"
                type="button"
                key={author.id}
                onClick={() => toggleAuthor(author.author)}
                aria-pressed={activeAuthor === author.author}
              >
                <span className="pc-sub-avatar" style={{ background: avatarColor(author.author) }}>
                  {initialsOf(author.author)}
                </span>
                <span className="pc-sub-name">{author.author}</span>
              </button>
            ))}
            <div className="pc-note">
              <strong>Comenius Podcast</strong>
              <p>让每一次申请都有方向。</p>
            </div>
          </aside>

          <main className="pc-content">
            <section className="pc-hero">
              <div className="pc-hero-copy">
                <p className="pc-hero-eyebrow">COMENIUS VIDEO JOURNAL</p>
                <h1>把复杂的国际申请，讲得清楚一点</h1>
                <p className="pc-hero-desc">
                  来自学生、老师与招生顾问的真实经验。每周更新选校策略、学科教程和申请故事。
                </p>
              </div>
              {featured && (
                <div className="pc-hero-feature">
                  <span className="pc-hero-label">热门推荐</span>
                  <p>{featured.category}</p>
                  <strong>{featured.title}</strong>
                  <button type="button" onClick={() => setActiveCategory(featured.category)}>
                    查看专题
                    <span>↗</span>
                  </button>
                </div>
              )}
            </section>

            <div className="pc-cat-heading">
              <div>
                <span>EXPLORE</span>
                <h2>浏览主题</h2>
              </div>
              <p>
                {visible.length} / {episodes.length} 集{activeAuthor ? ` · ${activeAuthor}` : ''}
              </p>
            </div>

            <div className="pc-cat-strip">
              {['全部', ...categories].map(category => (
                <button
                  className={activeCategory === category ? 'pc-cat-active' : ''}
                  type="button"
                  key={category}
                  onClick={() => setActiveCategory(category)}
                >
                  {category}
                </button>
              ))}
              {activeAuthor && (
                <button type="button" onClick={() => setActiveAuthor(null)}>
                  取消订阅筛选 ✕
                </button>
              )}
            </div>

            {visible.length ? (
              <section className="pc-grid" aria-label="播客剧集">
                {visible.map(episode => (
                  <EpisodeCard key={episode.id} episode={episode} />
                ))}
              </section>
            ) : (
              <div className="pc-empty">
                <h2>没有找到相关内容</h2>
                <p>试试搜索其他主题、作者或关键词。</p>
              </div>
            )}
          </main>
        </div>
      </div>
    </AppShell>
  )
}

/* ── 以下都是模块级组件：写在页面组件内部会导致每次渲染重新挂载（输入框一次只能打一个字母）── */

function Icon({
  children,
  className = '',
  viewBox = '0 0 24 24',
}: {
  children: ReactNode
  className?: string
  viewBox?: string
}) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      viewBox={viewBox}
      xmlns="http://www.w3.org/2000/svg"
    >
      {children}
    </svg>
  )
}

function EpisodeCard({ episode }: { episode: PodcastEpisode }) {
  return (
    <article className="pc-card">
      <a
        className="pc-thumb"
        href={episode.videoUrl}
        target="_blank"
        rel="noreferrer"
        aria-label={`播放：${episode.title}`}
      >
        <img alt="" loading="lazy" src={cover(episode.cover)} />
        <span className="pc-topic">{episode.category}</span>
        <span className="pc-duration">{episode.duration}</span>
        <span className="pc-play">
          <Icon className="pc-play-icon">
            <path d="m9 7 7 5-7 5V7Z" fill="currentColor" />
          </Icon>
        </span>
      </a>
      <div className="pc-info">
        <span className="pc-ch-avatar" style={{ background: avatarColor(episode.author) }}>
          {initialsOf(episode.author)}
        </span>
        <div className="pc-copy">
          <h2>{episode.title}</h2>
          <p className="pc-ch-name">{episode.author}</p>
          <p>{playCount(episode.plays)}</p>
        </div>
      </div>
    </article>
  )
}

/* ── 小工具 ───────────────────────────────────────────────────────────── */

/** Unsplash photo-id → 图片地址（和 BlogPage 的约定一致） */
function cover(key: string, width = 800) {
  if (!key) return ''
  if (key.startsWith('data:') || key.startsWith('http')) return key
  return `https://images.unsplash.com/${key}?w=${width}&fit=crop&auto=format`
}

/** 头像文字：作者名前两个字 */
function initialsOf(name: string) {
  return name.slice(0, 2)
}

const AVATAR_COLORS = [
  'var(--pc-av-1)',
  'var(--pc-av-2)',
  'var(--pc-av-3)',
  'var(--pc-av-4)',
  'var(--pc-av-5)',
  'var(--pc-av-6)',
]

/** 同一个人永远同一个色：名字哈希取模，纯展示、不入库 */
function avatarColor(name: string) {
  let hash = 0
  for (const char of name) hash = (hash * 31 + char.codePointAt(0)!) % 997
  return AVATAR_COLORS[hash % AVATAR_COLORS.length]
}

/** 播放量：128000 → 12.8万次观看 */
function playCount(plays?: number) {
  if (!plays) return ''
  if (plays >= 10000) return `${Number((plays / 10000).toFixed(1))}万次观看`
  return `${plays}次观看`
}
