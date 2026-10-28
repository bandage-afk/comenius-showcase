import { useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import MainSidebar from '../components/MainSidebar'
import type { NavProps } from '../App'
import { useContent } from '../contentStore'
import { useNotes } from '../notesStore'
import type { BlogCategory } from '../blogData'

import { buildBlogLayout, type BlogLayout, type RankablePost } from '../blogCuration'

const RED = '#E3120B'
const NAVY = '#1a1a5c'
const SERIF = "'Lora',Georgia,serif"

function img(key: string, w = 600, h?: number) {
  if (!key) return ''
  if (key.startsWith('data:') || key.startsWith('http')) return key
  return `https://images.unsplash.com/${key}?w=${w}${h ? `&h=${h}` : ''}&fit=crop&auto=format`
}

/** 阅读时长：按正文长度估算（每 500 字≈1 分钟） */
function readTime(p: RankablePost): string {
  return p.readTime
}
function catOf(p: RankablePost): string {
  return p.category
}
function excerpt(p: RankablePost, n = 90): string {
  return (p.excerpt ?? '').slice(0, n)
}

/* ── 小组件 ── */
function Category({ label }: { label: string }) {
  return (
    <p className="text-xs font-semibold mb-1" style={{ color: RED }}>
      {label}
    </p>
  )
}
function ReadTime({ t }: { t: string }) {
  return <p className="text-[12px] text-[#777] mt-1">{t}</p>
}
function SectionHeading({ title, arrow = true }: { title: string; arrow?: boolean }) {
  return (
    <div className="flex items-center gap-2 mb-4 border-t border-gray-300 pt-4">
      <h2 className="text-[18px] font-bold" style={{ fontFamily: SERIF }}>
        {title}
      </h2>
      {arrow && <span style={{ color: RED, fontSize: 18 }}>→</span>}
    </div>
  )
}
function ArticleRow({
  post,
  onClick,
  linked = false,
}: {
  post: RankablePost
  onClick: () => void
  linked?: boolean
}) {
  return (
    <div
      className="flex gap-4 py-4 border-b border-gray-200 last:border-b-0 cursor-pointer group"
      onClick={onClick}
    >
      <div className="flex-1 min-w-0">
        <Category label={catOf(post)} />
        <h3
          className="text-[15px] font-bold leading-snug group-hover:underline"
          style={{ fontFamily: SERIF, color: linked ? '#1a3a8c' : '#111' }}
        >
          {post.title}
        </h3>
        <ReadTime t={readTime(post)} />
      </div>
      {post.img && (
        <img
          src={img(post.img, 260, 180)}
          alt=""
          className="w-[130px] h-[90px] object-cover flex-shrink-0"
        />
      )}
    </div>
  )
}
function AdSlot({ h = 130, wide = false }: { h?: number; wide?: boolean }) {
  return (
    <div
      className={`${wide ? 'w-full max-w-[728px]' : ''} border border-gray-200 flex items-center justify-center`}
      style={{ height: h }}
    >
      <p className="text-[10px] tracking-widest text-gray-400 uppercase">Advertisement</p>
    </div>
  )
}

function ArticleModal({ post, onClose }: { post: RankablePost; onClose: () => void }) {
  // 用户长文展示全文；种子文章没有正文时回落到摘要。
  const paras = (post.content || post.excerpt || '').split('\n\n').filter(Boolean)
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1400,
        background: 'rgba(0,0,0,0.7)',
        overflowY: 'auto',
        padding: '32px 16px',
      }}
    >
      <motion.div
        initial={{ y: 24, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 16, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 280, damping: 30 }}
        onClick={e => e.stopPropagation()}
        style={{
          maxWidth: 760,
          margin: '0 auto',
          background: '#fff',
          borderRadius: 14,
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        <button
          onClick={onClose}
          aria-label="关闭"
          style={{
            position: 'absolute',
            top: 14,
            right: 14,
            zIndex: 5,
            width: 34,
            height: 34,
            borderRadius: '50%',
            border: 'none',
            background: 'rgba(0,0,0,0.5)',
            color: '#fff',
            fontSize: 16,
            cursor: 'pointer',
            lineHeight: 1,
          }}
        >
          ✕
        </button>
        {post.img && (
          <div style={{ aspectRatio: '16 / 8', overflow: 'hidden', background: '#f0f0f0' }}>
            <img
              src={img(post.img, 760, 380)}
              alt=""
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            />
          </div>
        )}
        <div style={{ padding: '28px 36px 44px' }}>
          <p className="text-xs font-semibold mb-2" style={{ color: RED }}>
            {catOf(post)}
          </p>
          <h1
            style={{ fontFamily: SERIF, fontSize: 26, fontWeight: 700, lineHeight: 1.4, margin: 0 }}
          >
            {post.title}
          </h1>
          <p style={{ fontSize: 13, color: '#696969', marginTop: 10 }}>{readTime(post)}</p>
          <div style={{ marginTop: 20 }}>
            {paras.map((p, i) => (
              <p
                key={i}
                style={{
                  fontFamily: SERIF,
                  fontSize: 16,
                  lineHeight: 1.9,
                  color: '#222',
                  margin: '0 0 18px',
                }}
              >
                {p}
              </p>
            ))}
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

export default function BlogPage({ navigate }: NavProps) {
  const blogPosts = useContent(s => s.blogPosts)
  const notes = useNotes(s => s.notes)
  const blogCategories = useContent(s => s.blogCategories)
  const [activeNav, setActiveNav] = useState('Featured')
  const [selected, setSelected] = useState<RankablePost | null>(null)

  // 将本地发布的长文与内容目录合并，再按分数排进版面槽位。
  const layout = useMemo<BlogLayout>(() => {
    const published: RankablePost[] = notes
      .filter(n => n.type === 'article' && (n.channels ?? ['blog']).includes('blog'))
      .map(n => ({
        id: `published-${n.id}`,
        title: n.title || '未命名',
        category: blogCategories.includes(n.category as BlogCategory)
          ? (n.category as BlogCategory)
          : 'Student Life',
        readTime: `${Math.max(1, Math.ceil((n.content?.length ?? 0) / 500))} 分钟`,
        img: n.img || '',
        excerpt: n.content?.slice(0, 180) || '',
        content: n.content,
        createdAt: new Date(n.createdAt).toISOString(),
      }))
    return buildBlogLayout([...published, ...blogPosts])
  }, [blogPosts, blogCategories, notes])
  const navCategories = ['Featured', ...blogCategories]

  const open = (p: RankablePost) => setSelected(p)

  const header = (
    <>
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
        <div className="max-w-[1280px] mx-auto px-4 flex items-center justify-between h-[72px]">
          <button onClick={() => navigate('feed')}>
            <div
              className="flex flex-col items-center justify-center px-3 py-1 text-white"
              style={{ backgroundColor: RED, width: 150, height: 52 }}
            >
              <span style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 17 }}>Comenius</span>
              <span
                style={{
                  fontFamily: SERIF,
                  fontWeight: 700,
                  fontSize: 11,
                  marginTop: -1,
                  letterSpacing: '0.16em',
                }}
              >
                NEWS
              </span>
            </div>
          </button>
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('publish')}
              className="rounded-full px-5 py-2 text-sm font-semibold text-white"
              style={{ backgroundColor: NAVY }}
            >
              写文章
            </button>
            <button
              onClick={() => navigate('login')}
              className="text-sm font-medium hover:underline"
            >
              登录
            </button>
          </div>
        </div>
      </header>
      <nav className="border-b border-gray-200 overflow-x-auto">
        <div className="max-w-[1280px] mx-auto px-4">
          <ul className="flex whitespace-nowrap">
            {navCategories.map(cat => (
              <li key={cat}>
                <button
                  onClick={() => setActiveNav(cat)}
                  className="px-3 py-3 text-[13px] font-medium transition-colors border-b-2"
                  style={{
                    borderBottomColor: activeNav === cat ? RED : 'transparent',
                    color: activeNav === cat ? RED : '#222',
                  }}
                >
                  {cat}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </nav>
    </>
  )

  return (
    <div className="relative min-h-screen bg-white text-[#111] text-sm">
      <div className="flex min-h-screen">
        <MainSidebar navigate={navigate} currentPage={'blog'} stickyTop={0} />
        <div className="flex-1 min-w-0">
          {header}

          {layout.total === 0 ? (
            <div className="text-center py-24 text-[#999]">
              <div className="text-[40px] mb-3">📰</div>
              还没有文章，去「写文章」发布第一篇吧
            </div>
          ) : activeNav !== 'Featured' ? (
            /* ── 分类视图 ── */
            <main className="max-w-[1280px] mx-auto px-4 py-8">
              <h2 className="text-[22px] font-bold mb-6" style={{ fontFamily: SERIF }}>
                {activeNav}
                <span className="text-[13px] font-normal text-[#777] ml-3">
                  {layout.all.filter(p => p.category === activeNav).length} 篇
                </span>
              </h2>
              {layout.all.filter(p => p.category === activeNav).length === 0 ? (
                <div className="text-center py-20 text-[#999]">该分类下暂无文章</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {layout.all
                    .filter(p => p.category === activeNav)
                    .map(p => (
                      <div key={p.id} onClick={() => open(p)} className="cursor-pointer group">
                        {p.img && (
                          <div className="aspect-[16/9] overflow-hidden bg-[#f0f0f0] mb-3">
                            <img
                              src={img(p.img, 480, 270)}
                              alt=""
                              loading="lazy"
                              className="w-full h-full object-cover group-hover:opacity-90 transition-opacity"
                            />
                          </div>
                        )}
                        <Category label={catOf(p)} />
                        <h3
                          className="text-[16px] font-bold leading-snug group-hover:underline"
                          style={{ fontFamily: SERIF }}
                        >
                          {p.title}
                        </h3>
                        <ReadTime t={readTime(p)} />
                      </div>
                    ))}
                </div>
              )}
            </main>
          ) : (
            /* ── 杂志版面 ── */
            <main className="max-w-[1280px] mx-auto px-4 py-6">
              <div className="flex gap-8">
                {/* 主栏 */}
                <div className="flex-1 min-w-0">
                  {/* Hero */}
                  {(layout.hero || layout.heroSecondary.length > 0) && (
                    <div className="flex gap-6 pb-6 border-b border-gray-200">
                      {layout.hero && (
                        <div
                          className="w-[46%] flex-shrink-0 cursor-pointer group"
                          onClick={() => open(layout.hero!)}
                        >
                          <img
                            src={img(layout.hero.img, 600, 380)}
                            alt=""
                            className="w-full object-cover group-hover:opacity-95 transition-opacity"
                            style={{ height: 260 }}
                          />
                          <div className="mt-3">
                            <Category label={catOf(layout.hero)} />
                            <h2
                              className="text-[22px] font-bold leading-tight mb-2 group-hover:underline"
                              style={{ fontFamily: SERIF }}
                            >
                              {layout.hero.title}
                            </h2>
                            <p className="text-[13px] text-[#444] leading-snug mb-1">
                              {excerpt(layout.hero, 110)}
                            </p>
                            <ReadTime t={readTime(layout.hero)} />
                          </div>
                        </div>
                      )}
                      {layout.heroSecondary.length > 0 && (
                        <div className="flex-1 flex flex-col divide-y divide-gray-200">
                          {layout.heroSecondary.map(p => (
                            <div
                              key={p.id}
                              className="py-4 first:pt-0 cursor-pointer group"
                              onClick={() => open(p)}
                            >
                              <Category label={catOf(p)} />
                              <div className="flex gap-3">
                                <div className="flex-1">
                                  <h3
                                    className="text-[16px] font-bold leading-snug mb-1 group-hover:underline"
                                    style={{ fontFamily: SERIF }}
                                  >
                                    {p.title}
                                  </h3>
                                  <p className="text-[12px] text-[#444] leading-snug mb-1">
                                    {excerpt(p, 70)}
                                  </p>
                                  <ReadTime t={readTime(p)} />
                                </div>
                                {p.img && (
                                  <img
                                    src={img(p.img, 220, 150)}
                                    alt=""
                                    className="w-[155px] h-[108px] object-cover flex-shrink-0"
                                  />
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* 四列网格 */}
                  {layout.grid.length > 0 && (
                    <div className="py-6 border-b border-gray-200">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
                        {layout.grid.map(p => (
                          <div key={p.id} className="cursor-pointer group" onClick={() => open(p)}>
                            {p.img && (
                              <img
                                src={img(p.img, 400, 240)}
                                alt=""
                                className="w-full h-[148px] object-cover mb-2 group-hover:opacity-90 transition-opacity"
                              />
                            )}
                            <Category label={catOf(p)} />
                            <h3
                              className="text-[13.5px] font-bold leading-snug group-hover:underline"
                              style={{ fontFamily: SERIF }}
                            >
                              {p.title}
                            </h3>
                            <ReadTime t={readTime(p)} />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Admissions Insider 深色面板 */}
                  {layout.insider && (
                    <div className="py-6 border-b border-gray-200">
                      <SectionHeading title="Admissions Insider" />
                      <div
                        className="flex overflow-hidden cursor-pointer"
                        style={{ minHeight: 288 }}
                        onClick={() => open(layout.insider!)}
                      >
                        <div className="w-[50%] flex-shrink-0 relative">
                          <img
                            src={img(layout.insider.img, 600, 400)}
                            alt=""
                            className="w-full h-full object-cover opacity-70 min-h-[288px]"
                          />
                        </div>
                        <div className="flex-1 bg-[#111] flex flex-col items-center justify-center px-8 py-8 text-center text-white">
                          <p className="text-[10px] tracking-[0.2em] uppercase text-gray-400 mb-3">
                            The Admissions Insider
                          </p>
                          <h2
                            className="text-[26px] md:text-[30px] font-bold leading-tight mb-3"
                            style={{ fontFamily: SERIF }}
                          >
                            {layout.insider.title}
                          </h2>
                          <p className="text-[13px] text-gray-300 mb-3 max-w-[310px]">
                            {excerpt(layout.insider, 70)}
                          </p>
                          <p className="text-[11px] text-gray-400 mb-4">
                            {readTime(layout.insider)}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Recent highlights */}
                  {layout.highlights.length > 0 && (
                    <div className="py-6 border-b border-gray-200">
                      <h2 className="text-[18px] font-bold mb-4" style={{ fontFamily: SERIF }}>
                        Recent highlights
                      </h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
                        <div className="md:border-r md:border-gray-200 md:pr-6 divide-y divide-gray-200">
                          {layout.highlights
                            .slice(0, Math.ceil(layout.highlights.length / 2))
                            .map(p => (
                              <ArticleRow key={p.id} post={p} onClick={() => open(p)} />
                            ))}
                        </div>
                        <div className="md:pl-6 divide-y divide-gray-200">
                          {layout.highlights
                            .slice(Math.ceil(layout.highlights.length / 2))
                            .map(p => (
                              <ArticleRow key={p.id} post={p} onClick={() => open(p)} linked />
                            ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 全宽广告 */}
                  <div className="py-8 border-b border-gray-200 flex flex-col items-center justify-center">
                    <p className="text-[11px] tracking-widest text-gray-400 uppercase mb-2">
                      Advertisement
                    </p>
                    <AdSlot h={90} wide />
                  </div>

                  {/* University profiles */}
                  {layout.profiles.length > 0 && (
                    <div className="py-6 border-b border-gray-200">
                      <h2
                        className="text-[18px] font-bold mb-5 border-t border-gray-300 pt-4"
                        style={{ fontFamily: SERIF }}
                      >
                        University profiles
                      </h2>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {layout.profiles.map(p => (
                          <div key={p.id} className="cursor-pointer group" onClick={() => open(p)}>
                            <Category label={catOf(p)} />
                            <h3
                              className="text-[14px] font-bold leading-snug mb-1 group-hover:underline"
                              style={{ fontFamily: SERIF }}
                            >
                              {p.title}
                            </h3>
                            <ReadTime t={readTime(p)} />
                            {p.img && (
                              <img
                                src={img(p.img, 360, 220)}
                                alt=""
                                className="w-full h-[120px] object-cover mt-2"
                              />
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* 右栏 */}
                <aside className="w-[280px] flex-shrink-0 hidden lg:block space-y-6">
                  {layout.sidebar.weekInReview && (
                    <div
                      className="border-b border-gray-200 pb-5 cursor-pointer group"
                      onClick={() => open(layout.sidebar.weekInReview!)}
                    >
                      {layout.sidebar.weekInReview.img && (
                        <img
                          src={img(layout.sidebar.weekInReview.img, 560, 220)}
                          alt=""
                          className="w-full object-cover mb-3"
                          style={{ height: 172 }}
                        />
                      )}
                      <h3
                        className="text-[14px] font-bold leading-snug mb-3 group-hover:underline"
                        style={{ fontFamily: SERIF }}
                      >
                        {layout.sidebar.weekInReview.title}
                      </h3>
                      <span
                        className="flex items-center gap-1 text-[12px] font-semibold"
                        style={{ color: RED }}
                      >
                        <span>→</span>
                        <span>Read the full story</span>
                      </span>
                    </div>
                  )}

                  <AdSlot h={130} />

                  {layout.sidebar.counselors.length > 0 && (
                    <div className="border-t border-gray-300 pt-4 space-y-4">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-[15px] font-bold" style={{ fontFamily: SERIF }}>
                          Counselor&apos;s corner
                        </h3>
                        <span style={{ color: RED }}>→</span>
                      </div>
                      {layout.sidebar.counselors.map(p => (
                        <div
                          key={p.id}
                          className="flex gap-3 pb-4 border-b border-gray-200 cursor-pointer group"
                          onClick={() => open(p)}
                        >
                          <div className="flex-1">
                            <p className="text-[10px] font-semibold mb-0.5" style={{ color: RED }}>
                              {catOf(p)}
                            </p>
                            <h4
                              className="text-[12px] font-bold leading-snug group-hover:underline"
                              style={{ fontFamily: SERIF }}
                            >
                              {p.title}
                            </h4>
                            <ReadTime t={readTime(p)} />
                          </div>
                          {p.img && (
                            <img
                              src={img(p.img, 120, 90)}
                              alt=""
                              className="w-[76px] h-[56px] object-cover flex-shrink-0"
                            />
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  <AdSlot h={130} />
                </aside>
              </div>
            </main>
          )}
        </div>
      </div>

      <AnimatePresence>
        {selected && <ArticleModal post={selected} onClose={() => setSelected(null)} />}
      </AnimatePresence>
    </div>
  )
}
