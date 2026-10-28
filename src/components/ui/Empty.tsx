import type { ReactNode } from 'react'

/** 统一空态（没有内容 / 没有搜索结果 / 没有会话） */
export default function Empty({ children, hint }: { children?: ReactNode; hint?: ReactNode }) {
  return (
    <div style={{ padding: '48px 24px', textAlign: 'center', color: 'var(--text-subtle)' }}>
      <div style={{ fontSize: 14, lineHeight: 1.7 }}>{children}</div>
      {hint && (
        <div style={{ fontSize: 12.5, color: 'var(--text-subtle)', marginTop: 6, lineHeight: 1.7 }}>
          {hint}
        </div>
      )}
    </div>
  )
}
