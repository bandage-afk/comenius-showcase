import type { ButtonHTMLAttributes, ReactNode } from 'react'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger'
type Size = 'sm' | 'md' | 'lg'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  children: ReactNode
}

const VARIANTS: Record<Variant, React.CSSProperties> = {
  primary: { background: 'var(--brand)', color: 'var(--surface)', border: 'none' },
  secondary: {
    background: 'var(--surface)',
    color: 'var(--ink-soft)',
    border: '1px solid var(--text-subtle)',
  },
  ghost: { background: 'transparent', color: 'var(--text-muted)', border: 'none' },
  danger: { background: 'var(--danger)', color: 'var(--surface)', border: 'none' },
}

const SIZES: Record<Size, React.CSSProperties> = {
  sm: { height: 28, padding: '0 12px', fontSize: 12.5 },
  md: { height: 36, padding: '0 16px', fontSize: 14 },
  lg: { height: 44, padding: '0 22px', fontSize: 15 },
}

/** 统一按钮：主色 / 次色 / 无边框 / 危险色，三档尺寸 */
export default function Button({
  variant = 'primary',
  size = 'md',
  style,
  children,
  ...rest
}: ButtonProps) {
  const disabled = rest.disabled
  return (
    <button
      {...rest}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        borderRadius: 999,
        fontFamily: 'inherit',
        fontWeight: variant === 'primary' || variant === 'danger' ? 600 : 500,
        cursor: disabled ? 'default' : 'pointer',
        opacity: disabled ? 0.55 : 1,
        transition: 'background 0.15s, opacity 0.15s',
        ...VARIANTS[variant],
        ...SIZES[size],
        ...style,
      }}
    >
      {children}
    </button>
  )
}
