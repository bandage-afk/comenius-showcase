import type { ReactNode } from 'react'
import type { Talk } from './types'
import { TalkCard } from './TalkCard'
import { ArrowRightIcon } from './icons'
import { cn } from './utils'

interface TalkGridSectionProps {
  title: string
  eyebrow?: string
  talks: Talk[]
  browseHref?: string
  browseLabel?: string
  promo?: ReactNode
  className?: string
  onPlay?: (talk: Talk) => void
  id?: string
}

export function TalkGridSection({
  title,
  eyebrow,
  talks,
  browseHref = '#',
  browseLabel = '浏览全部',
  promo,
  className,
  onPlay,
  id,
}: TalkGridSectionProps) {
  return (
    <section
      id={id}
      className={cn('w-full bg-white px-5 pb-12 md:px-10 xl:px-16 scroll-mt-14', className)}
    >
      <div className="mx-auto w-full max-w-[1200px]">
        {eyebrow && (
          <div className="mb-2 text-[12px] font-semibold uppercase tracking-[0.04em] text-ted-red">
            {eyebrow}
          </div>
        )}
        <div className="mb-6 flex items-center justify-between border-t border-black pt-3">
          <h2 className="text-[14px] font-bold uppercase tracking-[0.14px] text-[#121212]">
            {title}
          </h2>
          <a
            href={browseHref}
            onClick={e => e.preventDefault()}
            className="flex items-center gap-1.5 text-[15px] font-medium text-[#121212] transition-colors hover:text-ted-red"
          >
            {browseLabel}
            <ArrowRightIcon size={16} />
          </a>
        </div>
        {promo}
        <div className="grid grid-cols-2 gap-x-5 gap-y-8 md:grid-cols-4">
          {talks.map(talk => (
            <TalkCard key={talk.id} talk={talk} onPlay={onPlay} />
          ))}
        </div>
      </div>
    </section>
  )
}
