import { useState } from 'react'
import { canAccessAdminPath, useAdminStore, type ReportItem } from '../../adminStore'
import Modal, {
  Badge,
  Empty,
  Heading,
  buttonClass,
  primaryButtonClass,
  inputClass,
  formatDate,
} from '../../components/admin/AdminUI'
type Tab = 'teachers' | 'posts' | 'reports'
export default function ApprovalManagementPage({
  tab,
  navigate,
}: {
  tab: Tab
  navigate: (path: string) => void
}) {
  const store = useAdminStore()
  const [status, setStatus] = useState('pending')
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<string | null>(null)
  const [reason, setReason] = useState('')
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const teachers = tab === 'teachers'
  const reports = tab === 'reports'
  const rows = teachers
    ? store.applications.map(a => ({
        id: a.id,
        title: a.name,
        sub: `${a.institution} · ${a.subject}`,
        status: a.status,
        date: a.submittedAt,
      }))
    : reports
      ? store.reports.map(r => ({
          id: r.id,
          title: `${r.type === 'post' ? '帖子' : '评论'}举报 · ${r.author}`,
          sub: r.reason,
          status: r.status,
          date: r.submittedAt,
        }))
      : store.posts.map(p => ({
          id: p.id,
          title: p.title,
          sub: `${p.author} · ${p.category}`,
          status: p.status,
          date: p.submittedAt,
        }))
  const filtered = rows.filter(
    r =>
      (!status || r.status === status) &&
      `${r.title} ${r.sub}`.toLowerCase().includes(search.trim().toLowerCase()),
  )
  const application = store.applications.find(a => a.id === selected)
  const post = store.posts.find(p => p.id === selected)
  const report = store.reports.find(r => r.id === selected)
  const current = rows.find(r => r.id === selected)
  const act = (action: boolean | Exclude<ReportItem['status'], 'pending'>) => {
    if (!selected) return
    try {
      if (teachers) store.reviewTeacher(selected, action === true, reason)
      else if (reports)
        store.resolveReport(selected, action as Exclude<ReportItem['status'], 'pending'>, reason)
      else store.reviewPost(selected, action === true, reason)
      setSelected(null)
      setNotice('处理完成，状态与审计日志已同步更新。')
    } catch (e) {
      setError((e as Error).message)
    }
  }
  return (
    <>
      <Heading
        title="审批与内容治理"
        subtitle="认真审核每一份申请，为社区建立值得信任的交流环境。"
      />
      <div className="mb-6 flex flex-wrap gap-2 border-b border-grey-150">
        {(
          [
            ['teachers', '教师入驻审核', '/admin/approvals'],
            ['posts', '先审后发 · 帖子审批', '/admin/content'],
            ['reports', '举报复审 · 评论与帖子', '/admin/reports'],
          ] as const
        )
          .filter(([, , url]) => canAccessAdminPath(store.auth, url))
          .map(([key, label, url]) => (
            <button
              key={key}
              onClick={() => navigate(url)}
              className={`border-b-2 px-4 py-3 text-sm ${tab === key ? 'border-brand font-semibold text-brand' : 'border-transparent text-text-muted'}`}
            >
              {label}
            </button>
          ))}
      </div>
      {notice && (
        <p role="status" className="mb-4 rounded-lg bg-success/10 p-3 text-sm text-success">
          {notice}
        </p>
      )}
      <section className="overflow-hidden rounded-xl border border-grey-150 bg-surface">
        <div className="flex flex-wrap items-center gap-3 p-5">
          <input
            aria-label="搜索审核记录"
            className={`${inputClass} sm:max-w-xs`}
            placeholder="搜索姓名、内容或原因…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <select
            aria-label="审核状态"
            className={`${inputClass} sm:max-w-40`}
            value={status}
            onChange={e => setStatus(e.target.value)}
          >
            <option value="pending">待处理</option>
            <option value="">全部记录</option>
            {reports ? (
              <>
                <option value="ignored">已忽略</option>
                <option value="removed">已下架</option>
                <option value="punished">已惩罚</option>
              </>
            ) : (
              <>
                <option value="approved">已通过</option>
                <option value="rejected">已驳回</option>
                {!teachers && <option value="removed">已下架</option>}
              </>
            )}
          </select>
          <span className="ml-auto text-xs text-text-subtle">{filtered.length} 条记录</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[650px] text-left text-sm">
            <thead className="bg-grey-25 text-xs text-text-muted">
              <tr>
                <th className="px-6 py-4">
                  {teachers ? '申请人 / 教学信息' : reports ? '举报对象 / 举报原因' : '帖子 / 作者'}
                </th>
                <th className="px-5">提交时间</th>
                <th className="px-5">状态</th>
                <th className="px-5">操作</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(r => (
                <tr key={r.id} className="border-t border-grey-100">
                  <td className="px-6 py-5">
                    <div className="font-medium">{r.title}</div>
                    <p className="mt-1.5 text-xs text-text-subtle">{r.sub}</p>
                  </td>
                  <td className="px-5 text-xs text-text-muted">{formatDate(r.date)}</td>
                  <td className="px-5">
                    <Badge value={r.status} />
                  </td>
                  <td className="px-5">
                    <button
                      className={`${buttonClass} text-brand`}
                      onClick={() => {
                        setSelected(r.id)
                        setReason('')
                        setError('')
                      }}
                    >
                      {r.status === 'pending' ? '查看并审核' : '查看详情'} →
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!filtered.length && <Empty />}
      </section>
      {current && (
        <Modal title={current.title} onClose={() => setSelected(null)}>
          <div className="space-y-4 text-sm leading-7">
            {teachers && application && (
              <>
                <div className="rounded-lg bg-grey-25 p-4">
                  {application.institution} · {application.subject}
                  <br />
                  {application.experience}
                </div>
                <h3 className="font-semibold">个人简历</h3>
                <p className="whitespace-pre-wrap">{application.resume}</p>
                <h3 className="font-semibold">资质材料（模拟）</h3>
                <p>{application.qualification}</p>
                {application.reason && <p>审核意见：{application.reason}</p>}
              </>
            )}
            {!teachers && !reports && post && (
              <>
                <p className="text-text-subtle">
                  {post.author} · {post.category}
                </p>
                <p className="whitespace-pre-wrap rounded-lg bg-grey-25 p-4">{post.content}</p>
                {post.reason && <p>审核意见：{post.reason}</p>}
              </>
            )}
            {reports && report && (
              <>
                <p>
                  举报人：{report.reporter} · 作者：{report.author}
                </p>
                <p className="rounded-lg bg-brand-tint p-3 text-danger">
                  举报原因：{report.reason}
                </p>
                <p className="whitespace-pre-wrap rounded-lg bg-grey-25 p-4">{report.content}</p>
                <p className="text-xs text-text-subtle">
                  目标 ID：{report.targetId}。惩罚作者会禁言 7 天；下架内容为独立操作。
                </p>
                {report.resolution && <p>处理依据：{report.resolution}</p>}
              </>
            )}
            {current.status === 'pending' ? (
              <>
                <label className="block">
                  {reports ? '处理依据（必填）' : '审核意见（拒绝 / 驳回时必填）'}
                  <textarea
                    rows={3}
                    className={`${inputClass} mt-2`}
                    value={reason}
                    onChange={e => setReason(e.target.value)}
                  />
                </label>
                {error && (
                  <p role="alert" className="text-danger">
                    {error}
                  </p>
                )}
                <div className="flex flex-wrap justify-end gap-2">
                  {reports ? (
                    <>
                      <button className={buttonClass} onClick={() => act('ignored')}>
                        忽略
                      </button>
                      <button
                        className={`${buttonClass} text-danger`}
                        onClick={() => act('removed')}
                      >
                        下架内容
                      </button>
                      <button
                        className={`${buttonClass} text-danger`}
                        onClick={() => act('punished')}
                      >
                        惩罚作者（禁言 7 天）
                      </button>
                    </>
                  ) : (
                    <>
                      <button className={buttonClass} onClick={() => act(false)}>
                        {teachers ? '拒绝' : '驳回'}
                      </button>
                      <button className={primaryButtonClass} onClick={() => act(true)}>
                        通过
                      </button>
                    </>
                  )}
                </div>
              </>
            ) : (
              <Badge value={current.status} />
            )}
          </div>
        </Modal>
      )}
    </>
  )
}
