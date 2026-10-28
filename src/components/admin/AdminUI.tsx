import { useEffect, useRef, type ReactNode } from 'react'
export const buttonClass =
  'inline-flex items-center justify-center rounded-lg border border-grey-200 bg-surface px-3 py-2 text-sm font-medium transition hover:bg-surface-sunken focus-visible:outline-2 focus-visible:outline-brand disabled:opacity-40 disabled:cursor-not-allowed'
export const primaryButtonClass =
  'inline-flex items-center justify-center rounded-lg border border-brand bg-brand px-3 py-2 text-sm font-medium text-surface transition hover:bg-brand-hover focus-visible:outline-2 focus-visible:outline-brand disabled:opacity-40 disabled:cursor-not-allowed'
export const inputClass =
  'w-full rounded-lg border border-grey-200 bg-surface px-3 py-2.5 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/10'
export const labels: Record<string, string> = {
  student: '学生',
  teacher: '教师',
  member: '普通用户',
  active: '正常',
  muted: '禁言中',
  banned: '已封禁',
  pending: '待审核',
  approved: '已通过',
  rejected: '已驳回',
  removed: '已下架',
  ignored: '已忽略',
  punished: '已惩罚',
}
export function Badge({ value }: { value: string }) {
  return (
    <span
      className={`inline-flex whitespace-nowrap rounded-md px-2 py-1 text-xs font-medium ${['active', 'approved'].includes(value) ? 'bg-success/10 text-success' : ['pending', 'muted'].includes(value) ? 'bg-warning/10 text-warning' : ['banned', 'rejected', 'removed', 'punished'].includes(value) ? 'bg-brand-tint text-danger' : 'bg-surface-sunken text-text-muted'}`}
    >
      {labels[value] || value}
    </span>
  )
}
export function Heading({
  title,
  subtitle,
  children,
}: {
  title: string
  subtitle: string
  children?: ReactNode
}) {
  return (
    <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-ink">{title}</h1>
        <p className="mt-2 text-sm text-text-muted">{subtitle}</p>
      </div>
      {children}
    </div>
  )
}
export function Empty() {
  return <div className="py-16 text-center text-sm text-text-muted">暂无符合条件的记录</div>
}
export function formatDate(value: string) {
  return new Date(value).toLocaleString('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}
export default function Modal({
  title,
  children,
  onClose,
}: {
  title: string
  children: ReactNode
  onClose: () => void
}) {
  const ref = useRef<HTMLDialogElement>(null)
  useEffect(() => {
    const previous = document.activeElement as HTMLElement
    ref.current?.showModal()
    return () => {
      previous?.focus()
    }
  }, [])
  return (
    <dialog
      ref={ref}
      onCancel={onClose}
      className="fixed inset-0 m-auto max-h-[85vh] w-[calc(100%_-_2rem)] max-w-xl overflow-y-auto rounded-2xl border border-grey-150 bg-surface p-6 text-ink shadow-xl backdrop:bg-ink/40"
      aria-label={title}
    >
      <div className="mb-5 flex items-center justify-between gap-4">
        <h2 className="text-lg font-semibold">{title}</h2>
        <button autoFocus className={buttonClass} onClick={onClose} aria-label="关闭弹窗">
          ✕
        </button>
      </div>
      {children}
    </dialog>
  )
}
