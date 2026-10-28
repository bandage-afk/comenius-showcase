import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Navbar } from './Navbar'
import { DiscoverSection } from './DiscoverSection'
import { TalkGridSection } from './TalkGridSection'
import { TrendingIdeasSection } from './TrendingIdeasSection'
import { GamesSection } from './GamesSection'
import { AboutSection } from './AboutSection'
import { CloseIcon } from './icons'
import {
  popularTalks,
  newestTalks,
  popularOnTedTalks,
  countdownTalks,
  podcastTalks,
} from './ted-data'
import type { Talk } from './types'

const EASE = [0.22, 1, 0.36, 1] as const

export default function TedxClonePage({ brand = 'Podcast' }: { brand?: string }) {
  const [introDone, setIntroDone] = useState(false)
  const [selected, setSelected] = useState<Talk | null>(null)
  const isBlog = brand.trim().toLowerCase() === 'blog'

  useEffect(() => {
    const t = window.setTimeout(() => setIntroDone(true), 1400)
    return () => window.clearTimeout(t)
  }, [])

  return (
    <>
      <Navbar brand={brand} />
      <main className="flex w-full flex-col bg-white">
        <DiscoverSection onPlay={setSelected} />

        <TalkGridSection
          id="popular"
          title="Popular"
          talks={popularTalks}
          browseLabel="Browse all Popular"
          browseHref="/talks?sort=popular"
          className="pt-4"
          onPlay={setSelected}
          promo={
            <aside className="mb-6 flex items-center gap-2 rounded-sm bg-[#2763ff] p-3 text-white">
              <span className="flex-1 text-[14px] leading-[130%]" />
              <button type="button" aria-label="Dismiss" className="shrink-0 text-white">
                <CloseIcon size={20} />
              </button>
            </aside>
          }
        />

        <TalkGridSection
          id="library"
          title={isBlog ? 'Newest articles' : 'Newest episodes'}
          talks={newestTalks}
          browseLabel="Browse all Newest"
          browseHref="/talks?sort=newest"
          onPlay={setSelected}
        />

        <TalkGridSection
          title="MOST POPULAR"
          talks={popularOnTedTalks}
          browseLabel="Browse all Popular"
          browseHref="/talks?sort=popular"
          onPlay={setSelected}
        />

        <GamesSection />
        <TrendingIdeasSection onPlay={setSelected} />
        <AboutSection />

        <TalkGridSection
          eyebrow="FEATURED"
          title="Editor's picks"
          talks={countdownTalks}
          browseLabel="Browse all Sustainability"
          browseHref="/topics/sustainability"
          onPlay={setSelected}
        />

        <TalkGridSection
          title={isBlog ? 'Popular articles' : 'Popular podcast episodes'}
          talks={podcastTalks}
          browseLabel={isBlog ? 'Browse all Blog' : 'Browse all Podcasts'}
          browseHref={isBlog ? '/blog' : '/podcasts'}
          onPlay={setSelected}
        />
      </main>

      {/* ── 播放弹层 ── */}
      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
            className="fixed inset-0 z-[1400] flex items-center justify-center bg-black/80 p-6 backdrop-blur-md"
            onMouseDown={e => {
              if (e.target === e.currentTarget) setSelected(null)
            }}
          >
            <motion.div
              initial={{ y: 30, opacity: 0, scale: 0.985 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 20, opacity: 0 }}
              transition={{ duration: 0.4, ease: EASE }}
              className="flex max-h-[92vh] w-full max-w-[920px] flex-col overflow-hidden rounded-2xl bg-white"
            >
              <div className="flex items-start gap-4 px-6 pt-6">
                <div className="min-w-0 flex-1">
                  <div className="text-[11px] font-semibold uppercase tracking-[0.08em] text-ted-red">
                    {selected.category} · {selected.duration}
                  </div>
                  <div className="mt-1 text-[20px] font-bold leading-snug text-[#121212] sm:text-[24px]">
                    {selected.title}
                  </div>
                  <div className="mt-1.5 text-[13px] text-text-secondary">{selected.author}</div>
                </div>
                <button
                  type="button"
                  aria-label="关闭"
                  onClick={() => setSelected(null)}
                  className="p-1 text-text-tertiary hover:text-black"
                >
                  <CloseIcon size={22} />
                </button>
              </div>

              <div className="relative mx-6 mt-5 aspect-video overflow-hidden rounded-xl bg-black">
                {selected.videoUrl ? (
                  <video
                    key={selected.id}
                    src={selected.videoUrl}
                    controls
                    autoPlay
                    className="h-full w-full object-contain"
                  />
                ) : (
                  <img
                    src={selected.thumbnail}
                    alt={selected.title}
                    className="h-full w-full object-cover"
                  />
                )}
              </div>

              <div className="flex-1 overflow-y-auto px-6 py-5">
                <p className="text-[14px] leading-[1.9] text-text-secondary">
                  {selected.description ?? '一场 12 分钟的演讲，一个值得记住的想法。'}
                </p>
                <div className="mt-4 flex items-center gap-2 text-[13px] font-semibold text-ted-red">
                  {isBlog ? '阅读' : '观看'} {selected.plays ?? '—'}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── 进入动画（保留） ── */}
      <AnimatePresence>
        {!introDone && (
          <motion.div
            key="tedx-intro"
            exit={{ y: '-100%' }}
            transition={{ duration: 0.7, ease: EASE }}
            className="fixed inset-0 z-[2000] flex flex-col items-center justify-center gap-6 bg-white"
          >
            <div className="flex items-baseline overflow-hidden">
              {brand
                .replace(/[^A-Za-z0-9]/g, '')
                .toUpperCase()
                .slice(0, -1)
                .split('')
                .map((ch, i) => (
                  <motion.span
                    key={i}
                    initial={{ y: '120%' }}
                    animate={{ y: 0 }}
                    transition={{ delay: 0.08 + i * 0.08, duration: 0.6, ease: EASE }}
                    className="inline-block text-[clamp(72px,14vw,150px)] font-extrabold leading-none text-[#171717]"
                    style={{
                      fontFamily:
                        "'Arial Narrow', 'Helvetica Neue Condensed', 'Avenir Next Condensed', sans-serif",
                    }}
                  >
                    {ch}
                  </motion.span>
                ))}
              <motion.span
                initial={{ y: '120%' }}
                animate={{ y: 0 }}
                transition={{ delay: 0.32, duration: 0.6, ease: EASE }}
                className="inline-block text-[clamp(72px,14vw,150px)] font-extrabold leading-none text-ted-red"
                style={{
                  fontFamily:
                    "'Arial Narrow', 'Helvetica Neue Condensed', 'Avenir Next Condensed', sans-serif",
                }}
              >
                {brand
                  .replace(/[^A-Za-z0-9]/g, '')
                  .toUpperCase()
                  .slice(-1)}
              </motion.span>
            </div>
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 0.48, duration: 0.7, ease: EASE }}
              className="h-[3px] w-[180px] origin-left bg-ted-red"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
