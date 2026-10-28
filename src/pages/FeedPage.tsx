import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import AppShell from '../components/AppShell'
import { useNotes } from '../notesStore'
import { useCommunity } from '../communityStore'
import type { Post } from '../data/posts'
import { FEED_TABS, FILTER_TAGS, HOT_SEARCHES, HOT_VALUES, SEARCH_POOL } from './feed/constants'
import type { FeedTab } from './feed/constants'
import { AdCard, ImageCard, QuoteCard } from './feed/cards'
import PostLightbox from './feed/PostLightbox'
import type { NavProps } from '../App'

export default function FeedPage({ navigate, currentPage, searchQuery }: NavProps) {
  const myNotes = useNotes(s => s.notes).filter(n =>
    (n.channels ?? ['community']).includes('community'),
  )
  const follows = useCommunity(s => s.follows)
  const viewUser = useCommunity(s => s.viewUser)
  const posts = useCommunity(s => s.posts)
  const getUser = useCommunity(s => s.getUser)
  const [feedTab, setFeedTab] = useState<FeedTab>('recommend')
  const [activeTag, setActiveTag] = useState<string | null>(null)
  const N = 5
  const gap = 14
  const colW = (window.innerWidth - 64 - 48 - 56) / 5
  const q = (searchQuery || '').trim()
  const allPosts: Post[] = [
    ...myNotes.map(
      n =>
        ({
          id: n.id,
          type: n.type,
          img: n.img,
          quote: n.quote,
          quoteEmoji: n.quoteEmoji,
          title: n.title,
          tags: n.tags,
          author: n.author || '我',
          likes: n.likes || '0',
          duration: n.duration,
          content: n.content,
          videoUrl: n.videoUrl,
        }) as Post,
    ),
    ...posts,
  ]
  const followFiltered =
    feedTab === 'follow' ? allPosts.filter(p => follows.includes(getUser(p.author).id)) : allPosts
  const tagFiltered = activeTag
    ? followFiltered.filter(p => (p.tags || []).includes(activeTag))
    : followFiltered
  const visiblePosts = q
    ? tagFiltered.filter(
        p =>
          (p.title || '').toLowerCase().includes(q.toLowerCase()) ||
          p.author.toLowerCase().includes(q.toLowerCase()) ||
          (p.tags || []).some(t => t.toLowerCase().includes(q.toLowerCase())),
      )
    : tagFiltered
  const estH = (post: Post): number => {
    if (post.type === 'text') return 300
    return (colW * (280 + (post.id % 3) * 60)) / 400 + 113
  }
  // 信息流广告：每 14 篇帖子插入一张列内广告卡，与帖子一起按最短列分配，天然对齐
  const AD_IMG_H = Math.round(colW * 0.7)
  const AD_EST = AD_IMG_H + 120
  type FeedItem = { type: 'post'; post: Post } | { type: 'ad'; id: number }
  const feedItems: FeedItem[] = []
  visiblePosts.forEach((post, i) => {
    feedItems.push({ type: 'post', post })
    if ((i + 1) % 14 === 0) feedItems.push({ type: 'ad', id: i })
  })
  const cols: FeedItem[][] = Array.from({ length: N }, () => [])
  const hs = Array.from({ length: N }, () => 0)
  for (const it of feedItems) {
    let mi = 0
    for (let i = 1; i < N; i++) if (hs[i] < hs[mi]) mi = i
    cols[mi].push(it)
    hs[mi] += (it.type === 'ad' ? AD_EST : estH(it.post)) + gap
  }

  const [, setScrolled] = useState(false)
  const [lightboxPost, setLightboxPost] = useState<Post | null>(null)
  const [refreshing, setRefreshing] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)
  const [searchOpen, setSearchOpen] = useState(false)
  const [history, setHistory] = useState(['A-Level 数学', 'TMUA 真题', '剑桥面试', 'UCAS 文书'])
  const [query, setQuery] = useState(searchQuery ?? '')
  const searchInputRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    setQuery(searchQuery ?? '')
  }, [searchQuery])

  const addHistory = (term: string) => {
    setHistory(h => [term, ...h.filter(x => x !== term)].slice(0, 8))
  }
  const removeHistory = (term: string) => {
    setHistory(h => h.filter(x => x !== term))
  }
  const doSearch = (term: string) => {
    const t = term.trim()
    if (!t) return
    addHistory(t)
    setQuery('')
    setSearchOpen(false)
    navigate('feed', t)
  }
  const prevScrollRef = useRef(0)
  const refreshingRef = useRef(false)

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY
      setScrolled(y > 60)
      // 从下面滚回顶部 → 刷新
      if (prevScrollRef.current > 80 && y <= 0 && !refreshingRef.current) {
        refreshingRef.current = true
        setRefreshing(true)
        setFeedTab('recommend')
        setRefreshKey(k => k + 1)
        window.scrollTo(0, 0)
        window.setTimeout(() => {
          setRefreshing(false)
          refreshingRef.current = false
        }, 1000)
      }
      prevScrollRef.current = y
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'var(--surface)',
        fontFamily: "'Noto Sans SC', sans-serif",
      }}
    >
      {/* 搜索弹窗 */}
      {searchOpen && (
        <div
          style={{ position: 'fixed', inset: 0, zIndex: 300, background: 'rgba(0,0,0,0.35)' }}
          onClick={() => setSearchOpen(false)}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              background: 'var(--surface)',
              padding: '14px 24px 20px',
              borderBottom: '1px solid #F0F0F2',
            }}
          >
            <div style={{ maxWidth: 620, margin: '0 auto' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  background: 'var(--surface-sunken)',
                  borderRadius: 999,
                  padding: '10px 16px',
                }}
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#999"
                  strokeWidth="2"
                >
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.35-4.35" />
                </svg>
                <input
                  ref={searchInputRef}
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') doSearch(query)
                  }}
                  placeholder="搜索笔记 / 作者 / 标签"
                  autoFocus
                  style={{
                    flex: 1,
                    minWidth: 0,
                    border: 'none',
                    outline: 'none',
                    background: 'transparent',
                    fontSize: 16,
                    color: 'var(--grey-900)',
                    fontFamily: 'inherit',
                  }}
                />
                {query && (
                  <button
                    onClick={() => setQuery('')}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--text-subtle)',
                      cursor: 'pointer',
                      fontSize: 16,
                      fontFamily: 'inherit',
                      padding: 0,
                    }}
                  >
                    ×
                  </button>
                )}
              </div>
              {query.trim() ? (
                <div style={{ padding: '10px 4px 0' }}>
                  <div
                    style={{
                      fontSize: 14,
                      fontWeight: 600,
                      color: 'var(--ink-soft)',
                      margin: '8px 0 6px',
                    }}
                  >
                    相关搜索
                  </div>
                  {(() => {
                    const kw = query.trim()
                    const matched = SEARCH_POOL.filter(s =>
                      s.toLowerCase().includes(kw.toLowerCase()),
                    )
                    const list = matched.length
                      ? matched.slice(0, 8)
                      : [`${kw} 攻略`, `${kw} 备考方法`, `${kw} 真题`]
                    return list.map(s => (
                      <button
                        key={s}
                        onClick={() => doSearch(s)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 10,
                          width: '100%',
                          padding: '9px 4px',
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          fontFamily: 'inherit',
                          textAlign: 'left',
                        }}
                      >
                        <svg
                          width="13"
                          height="13"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="#ccc"
                          strokeWidth="2"
                        >
                          <circle cx="11" cy="11" r="8" />
                          <path d="m21 21-4.35-4.35" />
                        </svg>
                        <span style={{ fontSize: 14, color: 'var(--grey-900)' }}>
                          <span style={{ color: 'var(--brand)' }}>{kw}</span>
                          {s.slice(kw.length)}
                        </span>
                      </button>
                    ))
                  })()}
                </div>
              ) : (
                <div style={{ padding: '10px 4px 0' }}>
                  <div style={{ display: 'flex', alignItems: 'center', marginBottom: 10 }}>
                    <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink-soft)' }}>
                      搜索记录
                    </span>
                    <div style={{ flex: 1 }} />
                    <button
                      onClick={() => setHistory([])}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--text-subtle)',
                        fontSize: 12,
                        cursor: 'pointer',
                        fontFamily: 'inherit',
                      }}
                    >
                      清空
                    </button>
                  </div>
                  {history.length === 0 ? (
                    <div style={{ fontSize: 13, color: 'var(--grey-350)', padding: '4px 0 6px' }}>
                      暂无搜索记录
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                      {history.map(h => (
                        <div
                          key={h}
                          style={{
                            position: 'relative',
                            background: 'var(--surface-sunken)',
                            borderRadius: 999,
                            padding: '7px 26px 7px 13px',
                            fontSize: 13,
                            color: 'var(--grey-800)',
                          }}
                        >
                          <span onClick={() => doSearch(h)} style={{ cursor: 'pointer' }}>
                            {h}
                          </span>
                          <button
                            onClick={() => removeHistory(h)}
                            aria-label="删除记录"
                            style={{
                              position: 'absolute',
                              top: 1,
                              right: 4,
                              width: 16,
                              height: 16,
                              borderRadius: '50%',
                              background: '#D9D9D9',
                              color: 'var(--surface)',
                              fontSize: 10,
                              lineHeight: 1,
                              border: 'none',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontFamily: 'inherit',
                              padding: 0,
                            }}
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  <div
                    style={{
                      fontSize: 14,
                      fontWeight: 600,
                      color: 'var(--ink-soft)',
                      margin: '16px 0 6px',
                    }}
                  >
                    🔥 热搜
                  </div>
                  {HOT_SEARCHES.map((h, i) => (
                    <button
                      key={h}
                      onClick={() => doSearch(h)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 12,
                        width: '100%',
                        padding: '8px 0',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        fontFamily: 'inherit',
                        textAlign: 'left',
                      }}
                    >
                      <span
                        style={{
                          width: 20,
                          fontSize: 14,
                          fontWeight: 700,
                          color: i < 3 ? 'var(--brand)' : '#C0C0C0',
                          flexShrink: 0,
                        }}
                      >
                        {i + 1}
                      </span>
                      <span
                        style={{
                          flex: 1,
                          fontSize: 14,
                          color: 'var(--grey-900)',
                          overflow: 'hidden',
                          whiteSpace: 'nowrap',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        {h}
                      </span>
                      <span style={{ fontSize: 11, color: 'var(--grey-350)', flexShrink: 0 }}>
                        {HOT_VALUES[i]}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 往上滚回顶部的刷新提示：最上边滑出红色"在刷新…" */}
      <AnimatePresence>
        {refreshing && (
          <motion.div
            key="refresh"
            initial={{ y: -44, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -44, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 320, damping: 30 }}
            style={{
              position: 'fixed',
              top: 64,
              left: 0,
              right: 0,
              margin: '0 auto',
              width: 560,
              zIndex: 120,
              display: 'flex',
              justifyContent: 'center',
              pointerEvents: 'none',
            }}
          >
            <div
              style={{
                background: 'var(--brand)',
                color: 'var(--surface)',
                borderRadius: 999,
                padding: '8px 20px',
                fontSize: 13,
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: 9,
                boxShadow: '0 8px 24px rgba(255,36,66,0.4)',
              }}
            >
              <svg
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#fff"
                strokeWidth="2.2"
                style={{ animation: 'spin 0.8s linear infinite' }}
              >
                <path d="M21 12a9 9 0 1 1-6.2-8.56" />
              </svg>
              在刷新…
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Body */}
      <AppShell navigate={navigate} currentPage={currentPage}>
        {/* 顶栏：品牌 + 居中三 tab + 右上角搜索（侧栏右侧，sticky） */}
        <div
          style={{
            position: 'sticky',
            top: 0,
            zIndex: 200,
            height: 56,
            background: 'var(--surface)',
            display: 'flex',
            alignItems: 'center',
            borderBottom: '1px solid #F0F0F2',
            padding: '0 24px',
          }}
        >
          <div
            style={{
              fontFamily: "'Noto Serif SC', 'Songti SC', 'STSong', serif",
              fontWeight: 900,
              fontSize: 20,
              color: 'var(--brand)',
              letterSpacing: 1,
            }}
          >
            夸美纽斯
          </div>
          <div
            style={{
              position: 'absolute',
              left: '50%',
              transform: 'translateX(-50%)',
              display: 'flex',
              gap: 6,
            }}
          >
            {FEED_TABS.map(t => (
              <button
                key={t.key}
                onClick={() => setFeedTab(t.key)}
                style={{
                  padding: '8px 18px',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: 15,
                  fontWeight: feedTab === t.key ? 700 : 400,
                  color: feedTab === t.key ? '#111' : '#888',
                  fontFamily: 'inherit',
                  position: 'relative',
                  whiteSpace: 'nowrap',
                  transition: 'color 0.15s',
                }}
              >
                {t.label}
                {feedTab === t.key && (
                  <span
                    style={{
                      position: 'absolute',
                      bottom: -1,
                      left: '50%',
                      transform: 'translateX(-50%)',
                      width: 22,
                      height: 2.5,
                      background: 'var(--brand)',
                      borderRadius: 999,
                    }}
                  />
                )}
              </button>
            ))}
          </div>
          <button
            onClick={() => setSearchOpen(true)}
            aria-label="搜索"
            style={{
              marginLeft: 'auto',
              width: 38,
              height: 38,
              borderRadius: '50%',
              border: 'none',
              background: 'var(--surface-sunken)',
              color: 'var(--grey-900)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
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
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
          </button>
        </div>
        <div style={{ padding: '12px 24px 0' }}>
          {!q && feedTab !== 'club' && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '8px 0 12px',
                overflowX: 'auto',
                scrollbarWidth: 'none',
              }}
            >
              <button
                onClick={() => setActiveTag(null)}
                style={{
                  flexShrink: 0,
                  padding: '6px 16px',
                  borderRadius: 999,
                  border: activeTag === null ? '1px solid var(--brand)' : '1px solid #E7E7E7',
                  background: activeTag === null ? 'var(--brand-tint)' : 'var(--surface)',
                  color: activeTag === null ? 'var(--brand)' : 'var(--text-muted)',
                  fontSize: 13,
                  fontWeight: activeTag === null ? 700 : 500,
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.15s',
                }}
              >
                全部
              </button>
              {FILTER_TAGS.map(tag => {
                const active = activeTag === tag
                return (
                  <button
                    key={tag}
                    onClick={() => setActiveTag(active ? null : tag)}
                    style={{
                      flexShrink: 0,
                      padding: '6px 16px',
                      borderRadius: 999,
                      border: active ? '1px solid var(--brand)' : '1px solid #E7E7E7',
                      background: active ? 'var(--brand-tint)' : 'var(--surface)',
                      color: active ? 'var(--brand)' : 'var(--text-muted)',
                      fontSize: 13,
                      fontWeight: active ? 700 : 500,
                      cursor: 'pointer',
                      fontFamily: 'inherit',
                      whiteSpace: 'nowrap',
                      transition: 'all 0.15s',
                    }}
                  >
                    #{tag}
                  </button>
                )
              })}
            </div>
          )}
          {q ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 0 12px' }}>
              <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--ink-soft)' }}>
                “{q}” 的相关笔记
              </span>
              <span style={{ fontSize: 13, color: 'var(--text-subtle)' }}>
                {visiblePosts.length} 篇
              </span>
              <div style={{ flex: 1 }} />
              <button
                onClick={() => navigate('feed')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--brand)',
                  fontSize: 13,
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                }}
              >
                清除搜索 ×
              </button>
            </div>
          ) : feedTab === 'club' ? (
            <div
              style={{ textAlign: 'center', padding: '120px 0', color: '#9A9AA2', fontSize: 14 }}
            >
              <div style={{ fontSize: 40, marginBottom: 12 }}>🏛️</div>
              俱乐部建设中，敬请期待
            </div>
          ) : feedTab === 'follow' && follows.length === 0 ? (
            <div
              style={{ textAlign: 'center', padding: '120px 0', color: '#9A9AA2', fontSize: 14 }}
            >
              <div style={{ fontSize: 40, marginBottom: 12 }}>👀</div>
              还没有关注的人，去「推荐」逛逛吧
            </div>
          ) : activeTag && visiblePosts.length === 0 ? (
            <div
              style={{ textAlign: 'center', padding: '120px 0', color: '#9A9AA2', fontSize: 14 }}
            >
              <div style={{ fontSize: 40, marginBottom: 12 }}>🏷️</div>
              该标签下暂无帖子
            </div>
          ) : (
            <div key={refreshKey} style={{ display: 'flex', gap, paddingTop: 8 }}>
              {cols.map((col, ci) => (
                <div
                  key={ci}
                  style={{
                    flex: 1,
                    minWidth: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 14,
                  }}
                >
                  {col.map(it =>
                    it.type === 'ad' ? (
                      <AdCard key={'ad' + it.id} id={it.id} imgH={AD_IMG_H} />
                    ) : it.post.type === 'text' ? (
                      <QuoteCard key={it.post.id} post={it.post} />
                    ) : (
                      <ImageCard
                        key={it.post.id}
                        post={it.post}
                        onClick={() => setLightboxPost(it.post)}
                      />
                    ),
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </AppShell>
      <AnimatePresence>
        {lightboxPost && (
          <PostLightbox
            key={lightboxPost.id}
            post={lightboxPost}
            onClose={() => setLightboxPost(null)}
            onOpenTag={tag => {
              setLightboxPost(null)
              navigate('feed', tag)
            }}
            onOpenAuthor={author => {
              setLightboxPost(null)
              viewUser(getUser(author))
              navigate('userProfile')
            }}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
