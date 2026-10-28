interface SwitchProps {
  on: boolean
  onToggle: () => void
  label?: string
}

/** 统一开关（消息免打扰 / 置顶 / 保存到通讯录等设置项） */
export default function Switch({ on, onToggle, label }: SwitchProps) {
  return (
    <button
      type="button"
      aria-pressed={on}
      aria-label={label}
      onClick={onToggle}
      style={{
        width: 40,
        height: 22,
        borderRadius: 11,
        border: 'none',
        background: on ? 'var(--brand)' : 'var(--linkedin-border)',
        cursor: 'pointer',
        position: 'relative',
        flexShrink: 0,
        transition: 'background 0.18s',
      }}
    >
      <span
        style={{
          position: 'absolute',
          top: 2,
          left: on ? 20 : 2,
          width: 18,
          height: 18,
          borderRadius: '50%',
          background: 'var(--surface)',
          transition: 'left 0.18s',
          display: 'block',
          boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
        }}
      />
    </button>
  )
}
