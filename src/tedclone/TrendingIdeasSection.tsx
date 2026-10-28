import { useState } from 'react'
import { trendingCategories } from './ted-data'
import { TalkCard } from './TalkCard'
import type { Talk } from './types'
import { cn } from './utils'

export function TrendingIdeasSection({ onPlay }: { onPlay?: (talk: Talk) => void }) {
  const [activeId, setActiveId] = useState(trendingCategories[0].id)
  const active = trendingCategories.find(c => c.id === activeId) ?? trendingCategories[0]

  return (
    <section className="w-full bg-white px-5 pb-12 md:px-10 xl:px-16">
      <div className="mx-auto w-full max-w-[1200px]">
        <div className="mb-4 flex items-center justify-between border-t border-black pt-3">
          <h2 className="text-[14px] font-bold uppercase tracking-[0.14px] text-[#121212]">
            Trending ideas
          </h2>
        </div>

        <div className="mb-6 flex flex-wrap gap-x-6 gap-y-2 border-b border-gray-2">
          {trendingCategories.map(cat => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setActiveId(cat.id)}
              className={cn(
                'relative pb-3 text-[15px] font-semibold transition-colors',
                activeId === cat.id ? 'text-[#121212]' : 'text-text-tertiary hover:text-[#121212]',
              )}
            >
              {cat.label}
              {activeId === cat.id && (
                <span className="absolute inset-x-0 -bottom-px h-0.5 bg-ted-red" />
              )}
            </button>
          ))}
        </div>

        <div key={active.id} className="animate-[fadeUp_0.35s_ease]">
          <h3
            className="text-[44px] font-semibold leading-[1] tracking-[-0.04em] text-[#121212] sm:text-[50px] lg:text-[56px]"
            style={{ color: active.color }}
          >
            {active.label}
          </h3>
          <p className="mb-8 mt-4 max-w-2xl text-[17px] leading-relaxed text-text-secondary">
            {active.description}
          </p>
          <div className="grid grid-cols-2 gap-x-5 gap-y-8 md:grid-cols-3 lg:grid-cols-4">
            {active.talks.map(talk => (
              <TalkCard key={talk.id} talk={talk} onPlay={onPlay} />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
