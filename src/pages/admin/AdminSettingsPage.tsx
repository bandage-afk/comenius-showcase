import { useState } from 'react'
import { useAdminStore } from '../../adminStore'
import { Heading, primaryButtonClass } from '../../components/admin/AdminUI'
export default function AdminSettingsPage() {
  const { settings, saveSettings } = useAdminStore()
  const [draft, setDraft] = useState(settings)
  const [saved, setSaved] = useState(false)
  return (
    <>
      <Heading title="系统设置" subtitle="配置社区审核偏好，为后续服务端接入预留设置。" />
      <section className="max-w-3xl rounded-xl border border-grey-150 bg-surface p-6">
        <h2 className="font-semibold">审核与通知</h2>
        <p className="mt-2 text-xs leading-6 text-text-subtle">
          设置仅保存在独立 Mock Store。发布拦截和通知发送需接入 Strapi
          后由服务端执行，当前不影响前台账号或发帖系统。
        </p>
        {(
          [
            ['preModeration', '帖子先审后发', '新增帖子在审核通过后公开展示。'],
            ['notifyReports', '举报处理通知', '举报处理后通知举报人和内容作者。'],
          ] as const
        ).map(([key, title, description]) => (
          <label
            key={key}
            className="flex cursor-pointer items-center justify-between gap-5 border-b border-grey-100 py-6"
          >
            <span className="text-sm font-medium">
              {title}
              <span className="mt-2 block text-xs font-normal text-text-muted">{description}</span>
            </span>
            <input
              type="checkbox"
              className="h-5 w-5 accent-brand"
              checked={draft[key]}
              onChange={e => {
                setDraft({ ...draft, [key]: e.target.checked })
                setSaved(false)
              }}
            />
          </label>
        ))}
        <div className="mt-6 flex items-center gap-4">
          <button
            className={primaryButtonClass}
            onClick={() => {
              saveSettings(draft)
              setSaved(true)
            }}
          >
            保存设置
          </button>
          {saved && (
            <span role="status" className="text-sm text-success">
              设置已保存，已记录审计日志。
            </span>
          )}
        </div>
      </section>
    </>
  )
}
