import { lazy, Suspense, useState } from 'react'

import DemoNav from './components/DemoNav'
import { ROUTES, type NavProps, type PageName } from './app/routes'
import { flags } from './app/flags'

// 兼容旧引用：别的模块一直从 App 里取 NavProps / PageName，这里继续对外导出
export type { NavProps, PageName } from './app/routes'

/** 懒加载页面的统一占位：不闪白、不跳动，与全局底色一致 */
function PageFallback({ label }: { label: string }) {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1300,
        background: '#f8f7fa',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#14161a',
        fontFamily: "'Noto Sans SC', sans-serif",
        fontSize: 14,
      }}
    >
      {label}
    </div>
  )
}

export default function App() {
  const [page, setPage] = useState<PageName>('feed')
  const [searchQuery, setSearchQuery] = useState('')
  const navigate = (p: PageName, query?: string) => {
    setSearchQuery(query ?? '')
    setPage(p)
  }
  const props: NavProps = { navigate, currentPage: page, searchQuery }
  // 路由表驱动渲染：加页面只改 src/app/routes.ts，不用再动这个文件
  const Page = ROUTES[page]

  // 独立管理员 URL 路由：保持前台路由与账号模块原样。
  const adminRoute = ADMIN_ROUTES.find(route => route.matches(window.location.pathname))
  if (adminRoute) {
    const AdminPage = adminRoute.component
    return (
      <Suspense fallback={<PageFallback label="加载管理后台…" />}>
        <AdminPage />
      </Suspense>
    )
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        fontFamily: "'Noto Sans SC', 'PingFang SC', system-ui, sans-serif",
        backgroundColor: 'var(--grey-50)',
      }}
    >
      <Suspense fallback={<PageFallback label="加载中…" />}>
        <Page {...props} />
      </Suspense>
      {/* 演示用页签：用开关控制，撤掉前先给「登录注册 / 写想法」换正式入口 */}
      {flags.demoNav && <DemoNav {...props} />}
    </div>
  )
}

// 仅在 App 末尾追加管理员入口；子路由由独立的 AdminRouter 管理。
const ADMIN_ROUTES = [
  {
    path: '/admin/*',
    matches: (path: string) => path === '/admin' || path.startsWith('/admin/'),
    component: lazy(() => import('./pages/admin/AdminRouter')),
  },
]
