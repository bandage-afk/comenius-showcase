// 首页瀑布流的卡片：引用卡 / 图片视频卡 / 广告卡。
import type { Post } from '../../data/posts'
import { postImg } from './media'

export function QuoteCard({ post }: { post: Post }) {
  return (
    <div
      style={{
        background: 'var(--surface)',
        borderRadius: 12,
        padding: '18px 16px 14px',
        cursor: 'pointer',
        breakInside: 'avoid',
        boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
        transition: 'transform 0.15s',
        border: '1px solid #E4E4E4',
      }}
      onMouseEnter={e => (e.currentTarget.style.transform = 'translateY(-2px)')}
      onMouseLeave={e => (e.currentTarget.style.transform = 'none')}
    >
      <div
        style={{
          fontSize: 28,
          color: 'var(--brand)',
          lineHeight: 1,
          marginBottom: 8,
          fontFamily: 'Georgia, serif',
          opacity: 0.85,
        }}
      >
        "
      </div>
      <div
        style={{
          fontSize: 18,
          fontWeight: 700,
          color: 'var(--ink-strong)',
          lineHeight: 1.5,
          marginBottom: post.quoteEmoji ? 10 : 16,
          whiteSpace: 'pre-line',
        }}
      >
        {post.quote}
      </div>
      {post.quoteEmoji && <div style={{ fontSize: 32, marginBottom: 12 }}>{post.quoteEmoji}</div>}
      <div style={{ height: 1, background: 'var(--surface-sunken)', marginBottom: 10 }} />
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 5,
            minWidth: 0,
            overflow: 'hidden',
            flex: 1,
          }}
        >
          <div
            style={{
              width: 20,
              height: 20,
              borderRadius: '50%',
              background: '#EBEBEB',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <svg
              width={11}
              height={11}
              viewBox="0 0 24 24"
              fill="none"
              stroke="#bbb"
              strokeWidth="2"
            >
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </div>
          <span
            style={{
              fontSize: 11,
              color: '#888',
              overflow: 'hidden',
              whiteSpace: 'nowrap',
              textOverflow: 'ellipsis',
            }}
          >
            {post.author}
          </span>
        </div>
        <div
          style={{ display: 'flex', alignItems: 'center', gap: 3, flexShrink: 0, marginLeft: 6 }}
        >
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#ccc"
            strokeWidth="1.8"
          >
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
          <span style={{ fontSize: 11, color: 'var(--grey-250)' }}>{post.likes}</span>
        </div>
      </div>
    </div>
  )
}

export function ImageCard({ post, onClick }: { post: Post; onClick: () => void }) {
  return (
    <div
      onClick={onClick}
      style={{
        background: 'var(--surface)',
        borderRadius: 12,
        overflow: 'hidden',
        cursor: 'pointer',
        breakInside: 'avoid',
        transition: 'transform 0.15s',
        boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
        border: '1px solid #E4E4E4',
      }}
      onMouseEnter={e => (e.currentTarget.style.transform = 'translateY(-2px)')}
      onMouseLeave={e => (e.currentTarget.style.transform = 'none')}
    >
      <div style={{ position: 'relative', background: 'var(--grey-150)' }}>
        <img
          src={postImg(post.img, 400, 280 + (post.id % 3) * 60)}
          alt=""
          style={{
            width: '100%',
            display: 'block',
            objectFit: 'cover',
            aspectRatio: `${400}/${280 + (post.id % 3) * 60}`,
          }}
          loading="lazy"
        />
        {post.imgOverlay && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'flex-end',
              padding: '14px 12px',
              background: 'linear-gradient(to top, rgba(0,0,0,0.55) 0%, transparent 60%)',
            }}
          >
            <span
              style={{
                color: 'var(--surface)',
                fontSize: 15,
                fontWeight: 700,
                lineHeight: 1.4,
                whiteSpace: 'pre-line',
              }}
            >
              {post.imgOverlay}
            </span>
          </div>
        )}
        {(post.type === 'article' || post.type === 'podcast') && (
          <span
            style={{
              position: 'absolute',
              top: 8,
              left: 10,
              fontSize: 11,
              color: 'var(--surface)',
              background: post.type === 'article' ? '#7C3AED' : 'var(--brand)',
              borderRadius: 4,
              padding: '2px 8px',
              fontWeight: 700,
            }}
          >
            {post.type === 'article' ? '长文' : '播客'}
          </span>
        )}
        {(post.type === 'video' || post.type === 'podcast') && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: '50%',
                background: 'rgba(0,0,0,0.45)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
                <polygon points="5 3 19 12 5 21 5 3" />
              </svg>
            </div>
          </div>
        )}
        {post.duration && (
          <div
            style={{
              position: 'absolute',
              bottom: 8,
              right: 8,
              background: 'rgba(0,0,0,0.55)',
              color: 'var(--surface)',
              fontSize: 11,
              padding: '2px 7px',
              borderRadius: 4,
            }}
          >
            {post.duration}
          </div>
        )}
      </div>
      <div style={{ padding: '12px 12px 12px' }}>
        <p
          style={{
            margin: '0 0 12px',
            fontSize: 14,
            color: 'var(--ink-strong)',
            lineHeight: 1.5,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical' as const,
            overflow: 'hidden',
            minHeight: 42,
          }}
        >
          {post.title}
        </p>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            minWidth: 0,
            paddingTop: 10,
            borderTop: '1px solid var(--surface-sunken)',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              flex: 1,
              minWidth: 0,
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                width: 24,
                height: 24,
                borderRadius: '50%',
                background: '#EBEBEB',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <svg
                width={13}
                height={13}
                viewBox="0 0 24 24"
                fill="none"
                stroke="#bbb"
                strokeWidth="2"
              >
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </div>
            <span
              style={{
                fontSize: 12,
                color: '#888',
                overflow: 'hidden',
                whiteSpace: 'nowrap',
                textOverflow: 'ellipsis',
                minWidth: 0,
              }}
            >
              {post.author}
            </span>
          </div>
          <div
            style={{ display: 'flex', alignItems: 'center', gap: 3, flexShrink: 0, marginLeft: 6 }}
          >
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#FF2442"
              strokeWidth="1.8"
            >
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
            <span style={{ fontSize: 12, color: 'var(--text-subtle)' }}>{post.likes}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

const AD_VARIANTS = [
  {
    emoji: '📚',
    title: 'A-Level 提分训练营',
    sub1: '名师直播 · 真题精讲',
    sub2: '限时 5 折 · 仅剩 30 席',
  },
  {
    emoji: '🎓',
    title: '剑桥面试 1v1 模拟',
    sub1: '前考官亲授 · 全真流程',
    sub2: '本周仅剩 6 个名额',
  },
  { emoji: '✍️', title: 'UCAS 文书急救包', sub1: 'G5 学长逐句精修', sub2: '3 天出稿 · 不满意退款' },
]

export function AdCard({ id, imgH }: { id: number; imgH: number }) {
  const v = AD_VARIANTS[id % AD_VARIANTS.length]
  return (
    <div
      style={{
        background: 'var(--grey-25)',
        borderRadius: 12,
        overflow: 'hidden',
        cursor: 'pointer',
        breakInside: 'avoid',
        transition: 'transform 0.15s',
        boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
        border: '1px solid #E4E4E4',
      }}
      onMouseEnter={e => (e.currentTarget.style.transform = 'translateY(-2px)')}
      onMouseLeave={e => (e.currentTarget.style.transform = 'none')}
    >
      <div
        style={{
          position: 'relative',
          height: imgH,
          background: 'linear-gradient(135deg,#FFE9ED,#FFF3F5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div style={{ fontSize: 42 }}>{v.emoji}</div>
        <span
          style={{
            position: 'absolute',
            top: 8,
            left: 10,
            fontSize: 10,
            color: 'var(--brand)',
            background: 'var(--surface)',
            border: '1px solid #FFD4DA',
            borderRadius: 4,
            padding: '2px 6px',
            fontWeight: 600,
          }}
        >
          广告
        </span>
      </div>
      <div style={{ padding: 12 }}>
        <div
          style={{
            fontSize: 14,
            fontWeight: 700,
            color: 'var(--ink-strong)',
            lineHeight: 1.4,
          }}
        >
          {v.title}
        </div>
        <div style={{ fontSize: 12, color: '#888', lineHeight: 1.5, marginTop: 4, minHeight: 36 }}>
          {v.sub1}
          <br />
          {v.sub2}
        </div>
        <div style={{ marginTop: 10 }}>
          <span
            style={{
              display: 'inline-block',
              background: 'var(--brand)',
              color: 'var(--surface)',
              borderRadius: 999,
              padding: '6px 18px',
              fontSize: 12,
              fontWeight: 600,
            }}
          >
            立即了解
          </span>
        </div>
      </div>
    </div>
  )
}

export { postImg }
