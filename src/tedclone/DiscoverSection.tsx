import { useState } from 'react'
import { discoverCategories, discoverTalks } from './ted-data'
import type { Talk } from './types'
import { cn } from './utils'

/** 把 discoverTalks 的原始条目补成完整的 Talk（纯函数，放模块作用域） */
function resolve(t: {
  title: string
  author: string
  category: string
  duration: string
  thumbnail: string
  description?: string
}): Talk {
  return {
    id: t.title || Math.random().toString(36).slice(2),
    title: t.title,
    author: t.author,
    category: t.category,
    duration: t.duration,
    thumbnail: t.thumbnail,
    description: t.description,
  }
}

export function DiscoverSection({ onPlay }: { onPlay?: (talk: Talk) => void }) {
  const [active, setActive] = useState(discoverCategories[0])
  const filtered = discoverTalks.filter(t => t.category === active)
  const featured = filtered[0]

  if (!featured) return null

  const playFeatured = () => onPlay?.(resolve(featured))

  return (
    <section className="w-full bg-pure-black text-white">
      <div className="mx-auto w-full max-w-[1200px] px-5 py-12 md:px-10 xl:px-16">
        <h2 className="text-[32px] font-semibold leading-[1.1] tracking-[-0.04em]">Discover</h2>

        <div className="mt-6 flex flex-wrap gap-2">
          {discoverCategories.map(cat => (
            <button
              key={cat}
              type="button"
              onClick={() => setActive(cat)}
              className={cn(
                'rounded-full border px-4 py-1.5 text-[13px] font-semibold capitalize transition-colors',
                active === cat
                  ? 'border-white bg-white text-black'
                  : 'border-white/30 text-white hover:border-white',
              )}
            >
              {cat}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={playFeatured}
          className="group mt-8 grid w-full gap-6 text-left md:grid-cols-2 md:items-center"
        >
          <div className="relative overflow-hidden rounded-lg">
            <img
              src={featured.thumbnail}
              alt={featured.title}
              className="aspect-video w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
            />
          </div>
          <div>
            <div className="text-[12px] font-semibold uppercase tracking-[0.04em] text-ted-red">
              {featured.category}
            </div>
            <h3 className="mt-3 text-[24px] font-bold leading-tight text-white sm:text-[28px]">
              {featured.title}
            </h3>
            <p className="mt-3 text-[15px] leading-relaxed text-white/70">{featured.description}</p>
            <div className="mt-4 text-[13px] text-white/60">
              <span className="font-semibold text-white">{featured.author}</span>
              <span className="mx-1.5">·</span>
              {featured.meta}
              <span className="mx-1.5">·</span>
              {featured.duration}
            </div>
          </div>
        </button>

        {filtered.length > 1 && (
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.slice(1).map((talk, i) => (
              <button
                key={i}
                type="button"
                onClick={() => onPlay?.(resolve(talk))}
                className="group text-left"
              >
                <div className="overflow-hidden rounded-lg">
                  <img
                    src={talk.thumbnail}
                    alt={talk.title}
                    className="aspect-video w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                  />
                </div>
                <h4 className="mt-3 line-clamp-2 text-[15px] font-bold leading-snug text-white">
                  {talk.title}
                </h4>
                <p className="mt-1 text-[12px] text-white/50">{talk.author}</p>
              </button>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
