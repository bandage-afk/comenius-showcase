import { useState } from 'react'
import { useAdminStore, type User } from '../../adminStore'
import Modal, {
  Badge,
  Empty,
  Heading,
  buttonClass,
  primaryButtonClass,
  inputClass,
  formatDate,
  labels,
} from '../../components/admin/AdminUI'
export default function UserManagementPage() {
  const store = useAdminStore()
  const [search, setSearch] = useState('')
  const [role, setRole] = useState('')
  const [status, setStatus] = useState('')
  const [selected, setSelected] = useState<string | null>(null)
  const [action, setAction] = useState('detail')
  const [days, setDays] = useState(7)
  const [reason, setReason] = useState('')
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [page, setPage] = useState(1)
  const user = store.users.find(u => u.id === selected)
  const filtered = store.users.filter(
    u =>
      (!role || u.role === role) &&
      (!status || u.status === status) &&
      `${u.name} ${u.email} ${u.id}`.toLowerCase().includes(search.trim().toLowerCase()),
  )
  const pages = Math.max(1, Math.ceil(filtered.length / 8))
  const current = Math.min(page, pages)
  const open = (u: User, a: string) => {
    setSelected(u.id)
    setAction(a)
    setReason('')
    setError('')
  }
  const submit = () => {
    if (!user) return
    try {
      if (action === 'reset') store.resolvePasswordReset(user.id, true)
      else store.setUserStatus(user.id, action as User['status'], reason, days)
      setNotice(
        action === 'reset'
          ? '重置申请已批准（演示模式，未发送邮件）'
          : '用户状态已更新，操作已记入审计日志',
      )
      setSelected(null)
    } catch (e) {
      setError((e as Error).message)
    }
  }
  return (
    <>
      <Heading title="用户管理" subtitle="了解社区成员，管理账号状态与安全申请。">
        <span className="text-sm text-text-muted">共 {store.users.length} 位成员</span>
      </Heading>
      {notice && (
        <p role="status" className="mb-4 rounded-lg bg-success/10 p-3 text-sm text-success">
          {notice}
        </p>
      )}
      <section className="rounded-xl border border-grey-150 bg-surface">
        <div className="flex flex-wrap gap-3 border-b border-grey-150 p-5">
          <input
            aria-label="搜索用户"
            placeholder="搜索姓名、邮箱或用户 ID…"
            className={`${inputClass} sm:max-w-xs`}
            value={search}
            onChange={e => {
              setSearch(e.target.value)
              setPage(1)
            }}
          />
          <select
            aria-label="筛选角色"
            className={`${inputClass} sm:max-w-36`}
            value={role}
            onChange={e => {
              setRole(e.target.value)
              setPage(1)
            }}
          >
            <option value="">全部角色</option>
            {['student', 'teacher', 'member'].map(r => (
              <option key={r} value={r}>
                {labels[r]}
              </option>
            ))}
          </select>
          <select
            aria-label="筛选状态"
            className={`${inputClass} sm:max-w-36`}
            value={status}
            onChange={e => {
              setStatus(e.target.value)
              setPage(1)
            }}
          >
            <option value="">全部状态</option>
            {['active', 'muted', 'banned'].map(r => (
              <option key={r} value={r}>
                {labels[r]}
              </option>
            ))}
          </select>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead className="bg-grey-25 text-xs text-text-muted">
              <tr>
                {['用户', '角色', '状态', '注册时间', '发布数', '操作'].map(h => (
                  <th key={h} className="px-5 py-4">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.slice((current - 1) * 8, current * 8).map(u => (
                <tr key={u.id} className="border-t border-grey-100 hover:bg-grey-25">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-tint font-medium text-brand">
                        {u.name[0]}
                      </span>
                      <div className="font-medium">
                        {u.name}
                        <span className="mt-1 block text-xs font-normal text-text-subtle">
                          {u.email}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="px-5">
                    <Badge value={u.role} />
                  </td>
                  <td className="px-5">
                    <Badge value={u.status} />
                  </td>
                  <td className="px-5 text-xs text-text-muted">{formatDate(u.joinedAt)}</td>
                  <td className="px-5">{u.posts}</td>
                  <td className="px-5">
                    <div className="flex flex-wrap gap-2">
                      <button className={buttonClass} onClick={() => open(u, 'detail')}>
                        详情
                      </button>
                      {u.status !== 'banned' && (
                        <>
                          <button className={buttonClass} onClick={() => open(u, 'muted')}>
                            禁言
                          </button>
                          <button
                            className={`${buttonClass} text-danger`}
                            onClick={() => open(u, 'banned')}
                          >
                            封号
                          </button>
                        </>
                      )}
                      {u.status !== 'active' && (
                        <button className={buttonClass} onClick={() => open(u, 'active')}>
                          解除限制
                        </button>
                      )}
                      {u.resetRequested && (
                        <button
                          className={`${buttonClass} text-brand`}
                          onClick={() => open(u, 'reset')}
                        >
                          重置申请
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!filtered.length && <Empty />}
        <div className="flex items-center justify-between p-5 text-xs text-text-muted">
          <span>
            共 {filtered.length} 条 · 第 {current} / {pages} 页
          </span>
          <div className="flex gap-2">
            <button
              className={buttonClass}
              disabled={current === 1}
              onClick={() => setPage(current - 1)}
            >
              上一页
            </button>
            <button
              className={buttonClass}
              disabled={current === pages}
              onClick={() => setPage(current + 1)}
            >
              下一页
            </button>
          </div>
        </div>
      </section>
      {user && (
        <Modal
          title={`${action === 'detail' ? '用户详情' : action === 'reset' ? '密码重置申请' : action === 'active' ? '解除账号限制' : action === 'muted' ? '禁言用户' : '封禁账号'} · ${user.name}`}
          onClose={() => setSelected(null)}
        >
          {action === 'detail' ? (
            <div className="space-y-4 text-sm">
              <p>{user.bio}</p>
              <p>
                ID：{user.id} · {user.email}
              </p>
              <p>
                角色：{labels[user.role]} · 状态：{labels[user.status]}
              </p>
              <p>注册时间：{new Date(user.joinedAt).toLocaleDateString('zh-CN')}</p>
              <p>发布数量：{user.posts}</p>
              {user.mutedUntil && (
                <p>禁言截止：{new Date(user.mutedUntil).toLocaleString('zh-CN')}</p>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {action === 'reset' ? (
                <p className="text-sm leading-6 text-text-muted">
                  用户申请重置登录密码。此演示只记录审批结果；正式环境应由服务端发送一次性重置链接。
                </p>
              ) : (
                <>
                  <p className="text-sm text-text-muted">
                    此操作将在本地演示数据中更新用户状态，并记录审核依据。
                  </p>
                  {action === 'muted' && (
                    <label className="block text-sm">
                      禁言天数（1–365）
                      <input
                        className={`${inputClass} mt-2`}
                        type="number"
                        min={1}
                        max={365}
                        value={days}
                        onChange={e => setDays(Number(e.target.value))}
                      />
                    </label>
                  )}
                  <label className="block text-sm">
                    操作原因（必填）
                    <textarea
                      className={`${inputClass} mt-2`}
                      rows={3}
                      value={reason}
                      onChange={e => setReason(e.target.value)}
                    />
                  </label>
                </>
              )}
              {error && (
                <p role="alert" className="text-sm text-danger">
                  {error}
                </p>
              )}
              <div className="flex justify-end gap-2">
                {action === 'reset' && (
                  <button
                    className={buttonClass}
                    onClick={() => {
                      try {
                        store.resolvePasswordReset(user.id, false)
                        setNotice('重置申请已拒绝')
                        setSelected(null)
                      } catch (e) {
                        setError((e as Error).message)
                      }
                    }}
                  >
                    拒绝申请
                  </button>
                )}
                <button className={primaryButtonClass} onClick={submit}>
                  {action === 'reset' ? '批准申请' : '确认操作'}
                </button>
              </div>
            </div>
          )}
        </Modal>
      )}
    </>
  )
}
