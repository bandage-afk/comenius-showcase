import { ArrowRightIcon } from './icons'

export function GamesSection() {
  return (
    <section className="w-full bg-white px-5 py-6 sm:px-10 xl:px-16">
      <div className="mx-auto flex max-w-[1200px] flex-col gap-6 rounded-2xl bg-gray-1 p-6 sm:flex-row sm:items-center sm:justify-between sm:p-10">
        <div className="max-w-xl">
          <h2 className="text-[32px] font-semibold leading-[1.1] tracking-[-0.02em] text-[#121212]" />
          <p className="mt-3 text-[16px] leading-relaxed text-text-secondary" />
          <a
            href="#"
            onClick={e => e.preventDefault()}
            className="mt-5 inline-flex items-center gap-2 rounded-sm bg-ted-red px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-ted-red-hover"
          >
            Play now
            <ArrowRightIcon size={16} />
          </a>
        </div>
        <div className="flex shrink-0 gap-3">
          {['🧩', '🔤', '♟️', '🎨'].map((g, i) => (
            <div
              key={i}
              className="flex h-20 w-20 items-center justify-center rounded-xl bg-white text-4xl shadow-sm sm:h-24 sm:w-24"
            >
              {g}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
