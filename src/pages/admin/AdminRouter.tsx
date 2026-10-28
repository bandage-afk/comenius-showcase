import { useCallback, useEffect, useState } from 'react'
import AdminProtectedRoute from '../../components/admin/AdminProtectedRoute'
import AdminLoginPage from './AdminLoginPage'
import { useAdminStore } from '../../adminStore'
import AdminDashboardPage from './AdminDashboardPage'
import UserManagementPage from './UserManagementPage'
import ApprovalManagementPage from './ApprovalManagementPage'
import AuditLogsPage from './AuditLogsPage'
import AdminSettingsPage from './AdminSettingsPage'
const pathname = () => window.location.pathname.replace(/\/+$/, '') || '/'
/** 独立后台路由，不依赖也不修改前台 PageName 或账号 Store。 */
export default function AdminRouter() {
  const [path, setPath] = useState(pathname)
  useEffect(() => {
    const onPop = () => setPath(pathname())
    window.addEventListener('popstate', onPop)
    const onStorage = (event: StorageEvent) => {
      if (event.key === 'comenius-admin-mock-v1' || event.key === null) {
        if (!event.newValue) useAdminStore.getState().logout()
        else void useAdminStore.persist?.rehydrate()
      }
    }
    window.addEventListener('storage', onStorage)
    return () => {
      window.removeEventListener('popstate', onPop)
      window.removeEventListener('storage', onStorage)
    }
  }, [])
  const navigate = useCallback((next: string, replace = false) => {
    if (replace) window.history.replaceState({}, '', next)
    else if (next !== pathname()) window.history.pushState({}, '', next)
    setPath(next)
    window.scrollTo(0, 0)
  }, [])
  if (path === '/admin/login') return <AdminLoginPage navigate={navigate} />
  let page
  switch (path) {
    case '/admin':
      page = <AdminDashboardPage navigate={navigate} />
      break
    case '/admin/users':
      page = <UserManagementPage />
      break
    case '/admin/approvals':
      page = <ApprovalManagementPage key="teachers" tab="teachers" navigate={navigate} />
      break
    case '/admin/content':
      page = <ApprovalManagementPage key="posts" tab="posts" navigate={navigate} />
      break
    case '/admin/reports':
      page = <ApprovalManagementPage key="reports" tab="reports" navigate={navigate} />
      break
    case '/admin/logs':
      page = <AuditLogsPage />
      break
    case '/admin/settings':
      page = <AdminSettingsPage />
      break
    default:
      page = (
        <div className="py-20 text-center">
          <h1 className="text-2xl font-semibold">页面不存在</h1>
          <button className="mt-5 text-brand" onClick={() => navigate('/admin')}>
            返回概览 →
          </button>
        </div>
      )
  }
  return (
    <AdminProtectedRoute path={path} navigate={navigate}>
      {page}
    </AdminProtectedRoute>
  )
}
