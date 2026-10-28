import type { Talk } from './types'
import { cn } from './utils'

interface TalkCardProps {
  talk: Talk
  className?: string
  imageClassName?: string
  showPlays?: boolean
  onPlay?: (talk: Talk) => void
}

export function TalkCard({
  talk,
  className,
  imageClassName,
  showPlays = true,
  onPlay,
}: TalkCardProps) {
  const inner = (
    <>
      <div
        className={cn(
          'relative overflow-hidden rounded-lg bg-gray-1',
          imageClassName ?? 'aspect-video',
        )}
      >
        <img
          src={talk.thumbnail}
          alt={talk.title}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
        />
      </div>
      <div className="mt-3 flex items-center gap-2">
        <span className="text-[12px] font-semibold uppercase tracking-[0.03em] text-ted-red">
          {talk.category}
        </span>
        <span className="text-[12px] text-text-tertiary">{talk.duration}</span>
      </div>
      <h3 className="mt-1.5 line-clamp-2 text-[16px] font-bold leading-snug text-[#121212]">
        {talk.title}
      </h3>
      {talk.author && (
        <p className="mt-1 text-[12px] text-text-tertiary">
          {talk.author}
          {showPlays && talk.plays ? <span> · {talk.plays}</span> : null}
        </p>
      )}
    </>
  )

  if (onPlay) {
    return (
      <button
        type="button"
        onClick={() => onPlay(talk)}
        className={cn('group block w-full text-left', className)}
      >
        {inner}
      </button>
    )
  }
  return (
    <a
      href={talk.href ?? '/tedx'}
      onClick={e => e.preventDefault()}
      className={cn('group block', className)}
    >
      {inner}
    </a>
  )
}
