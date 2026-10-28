import type { ReactNode } from 'react'

type Tone = 'neutral' | 'brand' | 'warning' | 'success'

const TONES: Record<Tone, React.CSSProperties> = {
  neutral: { background: 'var(--surface-sunken)', color: 'var(--text-muted)' },
  brand: { background: '#ffe9ec', color: 'var(--brand)' },
  warning: { background: '#fff3d6', color: 'var(--warning)' },
  success: { background: '#e7f6ec', color: 'var(--success)' },
}

/** 小标签（群主 / 管理员 / 置顶 / 未读等） */
export default function Tag({ children, tone = 'neutral' }: { children: ReactNode; tone?: Tone }) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        fontSize: 10,
        fontWeight: 600,
        borderRadius: 4,
        padding: '1px 5px',
        ...TONES[tone],
      }}
    >
      {children}
    </span>
  )
}
