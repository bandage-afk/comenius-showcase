import { useAdminStore } from '../../adminStore'
import { Heading, formatDate } from '../../components/admin/AdminUI'
export default function AdminDashboardPage({ navigate }: { navigate: (path: string) => void }) {
  const { users, posts, applications, reports, logs } = useAdminStore()
  const today = new Date().toDateString()
  const queue =
    applications.filter(a => a.status === 'pending').length +
    posts.filter(p => p.status === 'pending').length +
    reports.filter(r => r.status === 'pending').length
  const students = users.filter(u => u.role === 'student').length
  const teachers = users.filter(u => u.role === 'teacher').length
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - 6 + i)
    return {
      label: `${d.getMonth() + 1}/${d.getDate()}`,
      count: posts.filter(p => new Date(p.submittedAt).toDateString() === d.toDateString()).length,
    }
  })
  const max = Math.max(1, ...days.map(d => d.count))
  const cards = [
    [
      '总用户数',
      users.length,
      `学生 ${Math.round((students / users.length) * 100)}% · 教师 ${Math.round((teachers / users.length) * 100)}%`,
      '♙',
    ],
    [
      '今日新增帖子',
      posts.filter(p => new Date(p.submittedAt).toDateString() === today).length,
      '按提交时间统计 · 包含待审',
      '▤',
    ],
    ['待审核队列', queue, '教师申请 / 帖子 / 举报', '◷'],
    [
      '今日违规处理',
      logs.filter(l => l.violation && new Date(l.time).toDateString() === today).length,
      '禁言、封禁及举报处置',
      '⚑',
    ],
  ]
  return (
    <>
      <Heading title="社区概览" subtitle="欢迎回来，陈管理员。这里是今天的社区动态。">
        <span className="rounded-lg border border-grey-150 bg-surface px-3 py-2 text-xs text-text-muted">
          {new Date().toLocaleDateString('zh-CN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            weekday: 'long',
          })}
        </span>
      </Heading>
      <div className="mb-7 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-brand/10 bg-brand-tint px-5 py-4">
        <div>
          <span className="mr-3 text-brand">✦</span>
          <span className="text-sm font-medium">每一份认真分享，都值得被看见。</span>
          <p className="mt-1 pl-7 text-xs text-text-muted">
            目前有 {queue} 项内容等待处理，一起维护社区的好氛围。
          </p>
        </div>
        <button
          onClick={() => navigate('/admin/approvals')}
          className="rounded-lg bg-brand px-4 py-2 text-sm font-medium text-surface hover:bg-brand-hover"
        >
          开始审核 →
        </button>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map(([title, value, subtitle, icon]) => (
          <section key={title} className="rounded-xl border border-grey-150 bg-surface p-5">
            <div className="flex items-center justify-between text-sm text-text-muted">
              {title}
              <span className="rounded-lg bg-grey-25 px-2.5 py-1.5 text-lg">{icon}</span>
            </div>
            <div className="mt-4 text-4xl font-semibold tracking-tight">{value}</div>
            <div className="mt-3 text-xs text-text-subtle">{subtitle}</div>
          </section>
        ))}
      </div>
      <div className="mt-6 grid gap-6 xl:grid-cols-[1.8fr_1fr]">
        <section className="rounded-xl border border-grey-150 bg-surface p-6">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="font-semibold">发帖量趋势</h2>
              <p className="mt-1 text-xs text-text-subtle">近 7 天 · 当前 Mock 帖子提交量</p>
            </div>
            <span className="text-xs text-brand">● 新增帖子</span>
          </div>
          <div
            className="mt-8 flex h-52 items-end gap-3 border-b border-grey-150 px-2 sm:gap-6"
            role="img"
            aria-label={days.map(d => `${d.label}：${d.count}篇`).join('，')}
          >
            {days.map((d, i) => (
              <div key={d.label} className="flex h-full flex-1 flex-col justify-end text-center">
                <span className="mb-2 text-xs text-text-muted">{d.count}</span>
                <div
                  className={`mx-auto w-full max-w-12 rounded-t-md ${i === 6 ? 'bg-brand' : 'bg-brand/20'}`}
                  style={{ height: `${Math.max(2, (d.count / max) * 80)}%` }}
                />
              </div>
            ))}
          </div>
          <div className="mt-3 flex gap-3 px-2 sm:gap-6">
            {days.map(d => (
              <span key={d.label} className="flex-1 text-center text-[11px] text-text-subtle">
                {d.label}
              </span>
            ))}
          </div>
        </section>
        <section className="rounded-xl border border-grey-150 bg-surface p-6">
          <h2 className="font-semibold">待办工作台</h2>
          <p className="mt-1 text-xs text-text-subtle">审核进度实时同步</p>
          <div className="mt-6 space-y-3">
            {[
              [
                '教师入驻',
                applications.filter(a => a.status === 'pending').length,
                '/admin/approvals',
              ],
              ['待发布帖子', posts.filter(p => p.status === 'pending').length, '/admin/content'],
              ['用户举报', reports.filter(r => r.status === 'pending').length, '/admin/reports'],
            ].map(([name, count, url]) => (
              <button
                key={name}
                onClick={() => navigate(String(url))}
                className="flex w-full items-center justify-between rounded-xl bg-grey-25 p-4 text-sm hover:bg-brand-tint"
              >
                <span>{name}</span>
                <span className="font-semibold">
                  {count} <span className="ml-3 text-text-subtle">→</span>
                </span>
              </button>
            ))}
          </div>
        </section>
      </div>
      <div className="mt-6 grid gap-6 xl:grid-cols-[1.8fr_1fr]">
        <section className="overflow-hidden rounded-xl border border-grey-150 bg-surface">
          <div className="flex justify-between p-6">
            <h2 className="font-semibold">
              热门帖子 <span className="ml-2 text-xs font-normal text-text-subtle">TOP 10</span>
            </h2>
            <span className="text-xs text-text-subtle">按点击量排序 · 含待审预览</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-grey-25 text-xs text-text-muted">
                <tr>
                  <th className="px-6 py-3">排名 / 内容</th>
                  <th className="px-4">点击量</th>
                  <th className="px-4">点赞量</th>
                </tr>
              </thead>
              <tbody>
                {[...posts]
                  .sort((a, b) => b.views - a.views)
                  .slice(0, 10)
                  .map((p, i) => (
                    <tr key={p.id} className="border-t border-grey-100">
                      <td className="px-6 py-3">
                        <span
                          className={`mr-4 font-medium ${i < 3 ? 'text-brand' : 'text-text-subtle'}`}
                        >
                          {String(i + 1).padStart(2, '0')}
                        </span>
                        {p.title}
                      </td>
                      <td className="px-4 tabular-nums">{p.views.toLocaleString()}</td>
                      <td className="px-4 text-text-muted">{p.likes}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </section>
        <section className="rounded-xl border border-grey-150 bg-surface p-6">
          <h2 className="font-semibold">最近操作</h2>
          <div className="mt-6 space-y-6">
            {logs.slice(0, 6).map(l => (
              <div key={l.id} className="border-l-2 border-brand/20 pl-4">
                <div className="text-sm font-medium">{l.action}</div>
                <p className="mt-1 text-xs text-text-muted">{l.target}</p>
                <p className="mt-2 text-[11px] text-text-subtle">
                  {l.operator} · {formatDate(l.time)}
                </p>
              </div>
            ))}
          </div>
          <button onClick={() => navigate('/admin/logs')} className="mt-6 text-xs text-brand">
            查看全部日志 →
          </button>
        </section>
      </div>
    </>
  )
}
