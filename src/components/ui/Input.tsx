import type { InputHTMLAttributes } from 'react'

/** 统一输入框（带可选左侧图标位） */
export default function Input({ style, ...rest }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...rest}
      style={{
        height: 38,
        width: '100%',
        borderRadius: 10,
        border: '1px solid var(--linkedin-border)',
        background: 'var(--surface)',
        padding: '0 12px',
        fontSize: 14,
        color: 'var(--ink-soft)',
        fontFamily: 'inherit',
        outline: 'none',
        ...style,
      }}
    />
  )
}
