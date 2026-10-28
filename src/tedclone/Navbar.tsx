import { useEffect, useState } from 'react'
import { navMenus } from './ted-data'
import { TedxWordmark, SearchIcon, MenuIcon, CloseIcon, ChevronDownIcon, GlobeIcon } from './icons'
import { cn } from './utils'

export function Navbar({ brand = 'Podcast' }: { brand?: string }) {
  const [scrolled, setScrolled] = useState(false)
  const [openMenu, setOpenMenu] = useState<string | null>(null)
  const [mobileOpen, setMobileOpen] = useState(false)
  const isBlog = brand.trim().toLowerCase() === 'blog'
  const ctaLabel = isBlog ? '发布文章' : '上传演讲'

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header className="sticky top-0 z-50 w-full">
      <div
        className={cn(
          'h-14 w-full bg-white px-5 transition-shadow md:px-10 lg:px-6',
          scrolled ? 'shadow-md' : 'shadow-sm',
        )}
      >
        <div className="relative flex h-full items-center justify-between">
          <div className="flex items-center">
            <button
              type="button"
              className="-ml-2 flex items-center justify-center p-2 text-black lg:hidden"
              aria-label="Menu"
              onClick={() => setMobileOpen(v => !v)}
            >
              {mobileOpen ? <CloseIcon size={24} /> : <MenuIcon size={24} />}
            </button>
            <a
              href="#"
              onClick={e => e.preventDefault()}
              aria-label={`${brand} 首页`}
              className="flex items-center py-4"
            >
              <TedxWordmark className="text-[26px]" word={brand} />
              <div className="hidden text-sm text-text-tertiary lg:block lg:ml-3" />
            </a>
          </div>

          <div className="flex items-center lg:mr-14">
            <nav className="hidden lg:block" aria-label="Primary">
              <ul className="flex" onMouseLeave={() => setOpenMenu(null)}>
                {navMenus.map(menu => (
                  <li key={menu.label} className="group relative">
                    <button
                      type="button"
                      className={cn(
                        'border-4 border-transparent px-3 py-5 text-xs font-bold text-text-secondary',
                        'transition-colors hover:bg-gray-1',
                      )}
                      aria-expanded={openMenu === menu.label}
                      aria-haspopup="true"
                      onMouseEnter={() => setOpenMenu(menu.label)}
                    >
                      <span className="flex items-center gap-0.5">
                        {menu.label}
                        <ChevronDownIcon size={12} className="opacity-70" />
                      </span>
                    </button>
                    <div
                      role="menu"
                      className={cn(
                        'absolute left-1/2 top-full z-10 -translate-x-1/2 overflow-hidden rounded-md border border-gray-2 bg-white shadow-xl outline-none',
                        openMenu === menu.label ? 'block' : 'hidden',
                      )}
                    >
                      {menu.items.map(item => (
                        <a
                          key={item.label}
                          role="menuitem"
                          href={item.href}
                          onClick={e => {
                            if (item.href.startsWith('#')) {
                              e.preventDefault()
                              document
                                .querySelector(item.href)
                                ?.scrollIntoView({ behavior: 'smooth' })
                            }
                          }}
                          className="block px-8 py-4 hover:bg-gray-1 first:pt-8 last:pb-8"
                        >
                          <div className="w-60 text-base font-bold leading-[1.4] text-black">
                            {item.label}
                          </div>
                          <div className="w-60 text-sm text-text-secondary">{item.description}</div>
                        </a>
                      ))}
                    </div>
                  </li>
                ))}
              </ul>
            </nav>

            <div className="ml-3 flex items-center gap-1">
              <a
                href="#"
                onClick={e => e.preventDefault()}
                className="hidden items-center p-2 text-xs font-bold text-text-secondary hover:bg-gray-1 lg:flex"
              >
                登录
              </a>
              <a
                href="#"
                onClick={e => e.preventDefault()}
                className="ml-3 hidden rounded-sm bg-ted-red px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-ted-red-hover lg:block"
              >
                {ctaLabel}
              </a>
              <button
                type="button"
                aria-label="Search"
                className="flex h-11 w-11 shrink-0 items-center justify-center text-black"
              >
                <SearchIcon size={22} />
              </button>
              <button
                type="button"
                aria-label="Language"
                className="hidden p-2 text-black sm:block"
              >
                <GlobeIcon size={22} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {mobileOpen && (
        <div className="max-h-[calc(100vh-3.5rem)] overflow-y-auto border-t border-gray-2 bg-white lg:hidden">
          {navMenus.map(menu => (
            <div key={menu.label} className="border-b border-gray-2">
              <div className="px-5 py-3 text-xs font-bold uppercase tracking-wide text-text-secondary">
                {menu.label}
              </div>
              {menu.items.map(item => (
                <a
                  key={item.label}
                  href={item.href}
                  onClick={e => {
                    if (item.href.startsWith('#')) e.preventDefault()
                  }}
                  className="block px-5 py-2.5"
                >
                  <div className="text-base font-bold text-black">{item.label}</div>
                  <div className="text-sm text-text-secondary">{item.description}</div>
                </a>
              ))}
            </div>
          ))}
          <a
            href="#"
            onClick={e => e.preventDefault()}
            className="block bg-ted-red px-5 py-4 text-center text-sm font-bold text-white"
          >
            {ctaLabel}
          </a>
        </div>
      )}
    </header>
  )
}
