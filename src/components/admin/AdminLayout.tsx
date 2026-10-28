import { useState, type ReactNode } from 'react'
import { adminHomePath, adminRoleLabels, canAccessAdminPath, useAdminStore } from '../../adminStore'
const menus = [
  ['/admin', '概览看板', '◫'],
  ['/admin/users', '用户管理', '♙'],
  ['/admin/approvals', '教师入驻审批', '▣'],
  ['/admin/content', '内容审核', '▤'],
  ['/admin/reports', '举报处理', '⚑'],
  ['/admin/logs', '操作日志', '◷'],
  ['/admin/settings', '系统设置', '⚙'],
]
export default function AdminLayout({
  path,
  navigate,
  children,
}: {
  path: string
  navigate: (path: string) => void
  children: ReactNode
}) {
  const [open, setOpen] = useState(false)
  const auth = useAdminStore(s => s.auth)
  const logout = useAdminStore(s => s.logout)
  const home = auth ? adminHomePath(auth) : '/admin/login'
  const pending = useAdminStore(s => s.reports.filter(r => r.status === 'pending').length)
  return (
    <div
      className="min-h-screen bg-grey-25 text-ink"
      style={{ fontFamily: "'Inter', 'Noto Sans SC', sans-serif" }}
    >
      <aside
        className={`${open ? 'flex' : 'hidden'} fixed inset-y-0 left-0 z-40 w-60 flex-col border-r border-grey-150 bg-surface p-5 lg:flex`}
      >
        <a
          href={home}
          onClick={e => {
            e.preventDefault()
            navigate(home)
            setOpen(false)
          }}
          className="flex items-center gap-3 px-2 py-4"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand text-xl font-bold text-surface">
            c.
          </span>
          <span className="text-lg font-bold tracking-tight">
            comenius
            <span className="block text-[10px] font-medium tracking-[0.2em] text-text-subtle">
              ADMIN CONSOLE
            </span>
          </span>
        </a>
        <div className="mb-3 mt-9 px-3 text-[10px] font-semibold tracking-widest text-text-subtle">
          工作空间 / WORKSPACE
        </div>
        <nav className="space-y-1.5" aria-label="管理员导航">
          {menus
            .filter(([url]) => canAccessAdminPath(auth, url))
            .map(([url, title, icon]) => (
              <a
                key={url}
                href={url}
                aria-current={path === url ? 'page' : undefined}
                onClick={e => {
                  if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
                  e.preventDefault()
                  navigate(url)
                  setOpen(false)
                }}
                className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm transition ${path === url ? 'bg-brand-tint font-semibold text-brand' : 'text-text-muted hover:bg-surface-sunken'}`}
              >
                <span className="w-5 text-lg" aria-hidden="true">
                  {icon}
                </span>
                {title}
                {url === '/admin/reports' && pending > 0 && (
                  <span className="ml-auto rounded bg-brand-tint px-1.5 text-xs text-brand">
                    {pending}
                  </span>
                )}
              </a>
            ))}
        </nav>
        <div className="mt-auto rounded-xl bg-grey-25 p-4">
          <div className="text-xs font-medium">让每一次交流，都值得信任。</div>
          <p className="mt-2 text-xs leading-5 text-text-subtle">共同守护友好、开放的学习社区。</p>
          <a className="mt-3 block text-xs text-brand" href="/">
            返回社区 ↗
          </a>
        </div>
      </aside>
      {open && (
        <button
          className="fixed inset-0 z-30 bg-ink/30 lg:hidden"
          aria-label="关闭导航"
          onClick={() => setOpen(false)}
        />
      )}
      <div className="lg:pl-60">
        <header className="flex h-20 items-center justify-between gap-4 border-b border-grey-150 bg-surface px-5 lg:px-9">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setOpen(!open)}
              className="rounded-lg border border-grey-200 px-3 py-2 lg:hidden"
              aria-label="打开导航"
            >
              ☰
            </button>
            <span className="hidden text-sm text-text-subtle sm:block">
              管理后台 <span className="mx-3">/</span>{' '}
              <span className="text-ink">{menus.find(m => m[0] === path)?.[1] || '页面'}</span>
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span className="hidden rounded-full border border-grey-150 px-3 py-1 text-xs text-text-muted sm:block">
              <span className="mr-2 text-warning">●</span>Mock 演示环境
            </span>
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-tint text-sm font-semibold text-brand">
              {auth?.name[0]}
            </span>
            <span className="text-xs sm:text-sm">
              {auth?.name}
              <span className="block text-[10px] text-text-subtle">
                {auth ? adminRoleLabels[auth.role] : ''}
              </span>
            </span>
            <button
              className="shrink-0 rounded-lg border border-grey-200 px-3 py-2 text-xs text-text-muted hover:bg-surface-sunken"
              onClick={() => {
                logout()
                navigate('/admin/login')
              }}
            >
              退出登录
            </button>
          </div>
        </header>
        <main className="mx-auto max-w-[1500px] p-5 lg:p-9">
          {children}
          <footer className="mt-10 flex flex-wrap justify-between gap-2 border-t border-grey-150 pt-5 text-[11px] text-text-subtle">
            <span>COMENIUS · 社区管理中心</span>
            <span>本地演示数据 · 不连接账号系统</span>
          </footer>
        </main>
      </div>
    </div>
  )
}
