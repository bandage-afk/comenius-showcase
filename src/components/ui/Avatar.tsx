const url = (avatar: string, w: number) =>
  `https://images.unsplash.com/${avatar}?w=${w}&h=${w}&fit=crop&auto=format`

interface AvatarProps {
  /** Unsplash photo-id，或完整 URL（以 http 开头时原样使用） */
  src: string
  size?: number
  /** 群聊/机构用圆角方块 */
  square?: boolean
  alt?: string
}

/** 统一头像：圆形（默认）或圆角方形（群聊 / 机构） */
export default function Avatar({ src, size = 40, square = false, alt = '' }: AvatarProps) {
  const resolved = src.startsWith('http') ? src : url(src, size * 2)
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: square ? size / 3.2 : '50%',
        overflow: 'hidden',
        background: 'var(--surface-sunken)',
        flexShrink: 0,
      }}
    >
      <img
        src={resolved}
        alt={alt}
        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
      />
    </div>
  )
}
