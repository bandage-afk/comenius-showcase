import { useState } from 'react'
import { useAdminStore } from '../../adminStore'
import { Heading, Empty, inputClass, buttonClass } from '../../components/admin/AdminUI'
export default function AuditLogsPage() {
  const logs = useAdminStore(s => s.logs)
  const [search, setSearch] = useState('')
  const [action, setAction] = useState('')
  const [date, setDate] = useState('')
  const [page, setPage] = useState(1)
  const filtered = logs.filter(
    l =>
      (!action || l.action === action) &&
      (!date || new Date(l.time).toLocaleDateString('sv-SE') === date) &&
      `${l.operator} ${l.target} ${l.detail}`.toLowerCase().includes(search.trim().toLowerCase()),
  )
  const pages = Math.max(1, Math.ceil(filtered.length / 10))
  const current = Math.min(page, pages)
  return (
    <>
      <Heading
        title="操作日志与审计"
        subtitle="每一次治理操作都有迹可循。以下为本地演示记录，正式审计应由服务端保存。"
      />
      <section className="overflow-hidden rounded-xl border border-grey-150 bg-surface">
        <div className="flex flex-wrap gap-3 p-5">
          <input
            aria-label="搜索日志"
            className={`${inputClass} sm:max-w-xs`}
            placeholder="搜索操作人、目标或操作详情…"
            value={search}
            onChange={e => {
              setSearch(e.target.value)
              setPage(1)
            }}
          />
          <select
            aria-label="动作类型"
            className={`${inputClass} sm:max-w-48`}
            value={action}
            onChange={e => {
              setAction(e.target.value)
              setPage(1)
            }}
          >
            <option value="">全部动作</option>
            {[...new Set(logs.map(l => l.action))].map(a => (
              <option key={a}>{a}</option>
            ))}
          </select>
          <input
            aria-label="操作日期"
            className={`${inputClass} sm:max-w-44`}
            type="date"
            value={date}
            onChange={e => {
              setDate(e.target.value)
              setPage(1)
            }}
          />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[850px] text-left text-sm">
            <thead className="bg-grey-25 text-xs text-text-muted">
              <tr>
                {['操作人', '操作时间', '动作类型', '受影响目标', '操作详情'].map(h => (
                  <th key={h} className="px-5 py-4">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.slice((current - 1) * 10, current * 10).map(l => (
                <tr key={l.id} className="border-t border-grey-100">
                  <td className="whitespace-nowrap px-5 py-5">{l.operator}</td>
                  <td className="whitespace-nowrap px-5 text-xs text-text-muted">
                    {new Date(l.time).toLocaleString('zh-CN')}
                  </td>
                  <td className="whitespace-nowrap px-5">
                    <span
                      className={`rounded-md px-2 py-1 text-xs ${l.violation ? 'bg-brand-tint text-brand' : 'bg-grey-25 text-text-muted'}`}
                    >
                      {l.action}
                    </span>
                  </td>
                  <td className="px-5">{l.target}</td>
                  <td className="max-w-sm break-words px-5 text-xs leading-6 text-text-muted">
                    {l.detail}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!filtered.length && <Empty />}
        <div className="flex items-center justify-between p-5 text-xs text-text-muted">
          <span>
            共 {filtered.length} 条记录 · {current} / {pages}
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
    </>
  )
}
