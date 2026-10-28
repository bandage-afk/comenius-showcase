import { ArrowRightIcon } from './icons'

export function AboutSection() {
  return (
    <section id="about" className="w-full bg-white px-5 pb-12 md:px-10 xl:px-16">
      <div className="mx-auto flex max-w-[1200px] flex-col gap-6 rounded-2xl bg-black p-8 text-white sm:p-12 lg:flex-row lg:items-center lg:justify-between">
        <div className="max-w-2xl">
          <h2 className="text-[40px] font-bold leading-[1.05] tracking-[-0.02em]" />
          <p className="mt-5 text-[17px] leading-relaxed text-white/75" />
        </div>
        <a
          href="#"
          onClick={e => e.preventDefault()}
          className="inline-flex shrink-0 items-center gap-2 rounded-sm bg-white px-6 py-3.5 text-sm font-bold text-black transition-colors hover:bg-gray-1"
        >
          <ArrowRightIcon size={16} />
        </a>
      </div>
    </section>
  )
}
