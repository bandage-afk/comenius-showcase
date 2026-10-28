import { useState, type FormEvent } from 'react'
import { ADMIN_TEST_ACCOUNTS, adminRoleLabels, useAdminStore } from '../../adminStore'
import { buttonClass, inputClass, primaryButtonClass } from '../../components/admin/AdminUI'
export default function AdminLoginPage({
  navigate,
}: {
  navigate: (path: string, replace?: boolean) => void
}) {
  const login = useAdminStore(s => s.login)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')
    try {
      login(email, password)
      navigate('/admin', true)
    } catch (failure) {
      setError((failure as Error).message)
    }
  }
  return (
    <main className="flex min-h-screen items-center justify-center bg-grey-25 px-5 py-12 text-ink">
      <div className="w-full max-w-md">
        <div className="mb-8 flex items-center justify-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand text-2xl font-bold text-surface">
            c.
          </span>
          <span className="text-2xl font-bold tracking-tight">
            comenius
            <span className="block text-[10px] font-medium tracking-[0.2em] text-text-subtle">
              ADMIN CONSOLE
            </span>
          </span>
        </div>
        <section className="rounded-2xl border border-grey-150 bg-surface p-7 shadow-sm sm:p-9">
          <h1 className="text-2xl font-semibold">管理员登录</h1>
          <p className="mt-2 text-sm text-text-muted">登录你的管理账号，继续守护社区。</p>
          <form onSubmit={submit} className="mt-7 space-y-5">
            <label className="block text-sm font-medium">
              管理员邮箱
              <input
                type="email"
                autoComplete="username"
                required
                className={`${inputClass} mt-2`}
                value={email}
                onChange={e => {
                  setEmail(e.target.value)
                  setError('')
                }}
                placeholder="输入管理员邮箱"
              />
            </label>
            <label className="block text-sm font-medium">
              密码
              <input
                type="password"
                autoComplete="current-password"
                required
                className={`${inputClass} mt-2`}
                value={password}
                onChange={e => {
                  setPassword(e.target.value)
                  setError('')
                }}
                placeholder="输入密码"
              />
            </label>
            {error && (
              <p role="alert" className="rounded-lg bg-brand-tint p-3 text-sm text-danger">
                {error}
              </p>
            )}
            <button type="submit" className={`${primaryButtonClass} w-full`}>
              登录管理后台 →
            </button>
          </form>
          <div className="mt-7 border-t border-grey-150 pt-6">
            <h2 className="text-xs font-medium text-text-muted">本地测试账号 · 点击填充后登录</h2>
            <div className="mt-3 grid gap-2">
              {ADMIN_TEST_ACCOUNTS.map(account => (
                <button
                  key={account.email}
                  type="button"
                  className={`${buttonClass} flex-col items-start gap-1 text-left`}
                  onClick={() => {
                    setEmail(account.email)
                    setPassword(account.password)
                    setError('')
                  }}
                >
                  <span>{adminRoleLabels[account.role]}</span>
                  <span className="text-xs text-text-subtle">{account.email}</span>
                </button>
              ))}
            </div>
          </div>
          <p className="mt-5 text-xs leading-6 text-text-subtle">
            Mock
            登录仅用于本地体验。教师审批员和内容审核员没有概览权限，登录后可通过提示进入各自工作台。
          </p>
        </section>
        <a href="/" className="mt-6 block text-center text-sm text-text-muted hover:text-brand">
          ← 返回社区
        </a>
      </div>
    </main>
  )
}
