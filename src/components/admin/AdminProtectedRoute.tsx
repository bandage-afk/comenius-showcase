import { useEffect, type ReactNode } from 'react'
import { adminHomePath, adminRoleLabels, adminRouteDecision, useAdminStore } from '../../adminStore'
import AdminLayout from './AdminLayout'
import { primaryButtonClass } from './AdminUI'
export default function AdminProtectedRoute({
  path,
  navigate,
  children,
}: {
  path: string
  navigate: (path: string, replace?: boolean) => void
  children: ReactNode
}) {
  const auth = useAdminStore(s => s.auth)
  const decision = adminRouteDecision(auth, path)
  useEffect(() => {
    if (decision === 'login') navigate('/admin/login', true)
  }, [decision, navigate])
  // 未登录时绝不挂载后台页面或布局，避免重定向之前闪现内容。
  if (decision === 'login' || !auth) return null
  return (
    <AdminLayout path={path} navigate={navigate}>
      {decision === 'allow' ? (
        children
      ) : (
        <section className="mx-auto max-w-xl rounded-2xl border border-grey-150 bg-surface p-8 text-center sm:p-12">
          <div className="text-6xl font-semibold tracking-tight text-brand/30">403</div>
          <h1 className="mt-5 text-2xl font-semibold">403 暂无权限访问</h1>
          <p className="mt-4 text-sm leading-7 text-text-muted">
            你当前的角色是「{adminRoleLabels[auth.role]}
            」，无法访问此页面。请进入获授权的工作台，或联系超级管理员。
          </p>
          <button
            className={`${primaryButtonClass} mt-7`}
            onClick={() => navigate(adminHomePath(auth))}
          >
            前往我的工作台 →
          </button>
        </section>
      )}
    </AdminLayout>
  )
}
