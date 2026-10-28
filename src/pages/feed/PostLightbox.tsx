// 笔记详情灯箱：大图 + 作者栏 + 评论区（首页点卡片后打开）。
// 从 FeedPage 拆出（原先这一块 1200 行）。
import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useCommunity } from '../../communityStore'
import type { Post } from '../../data/posts'
import {
  AVATAR_COLORS,
  getComments,
  getReplies,
  fmtCount,
  parseCount,
  PINNED_NOTICE,
  type LightboxComment,
} from './lightboxData'
import { postImg } from './media'

export default function PostLightbox({
  post,
  onClose,
  onOpenTag,
  onOpenAuthor,
}: {
  post: Post
  onClose: () => void
  onOpenTag: (tag: string) => void
  onOpenAuthor: (author: string) => void
}) {
  const isMine = post.id > 1e12
  const [comments, setComments] = useState<LightboxComment[]>(() =>
    post.id > 1e12 ? [] : getComments(post),
  )
  const [page, setPage] = useState(0)
  const [extra, setExtra] = useState(0)
  const [draft, setDraft] = useState('')
  const followedIds = useCommunity(s => s.follows)
  const toggleFollow = useCommunity(s => s.toggleFollow)
  const likedIds = useCommunity(s => s.likes)
  const toggleLike = useCommunity(s => s.toggleLike)
  const collectedIds = useCommunity(s => s.collects)
  const toggleCollect = useCommunity(s => s.toggleCollect)
  const addComment = useCommunity(s => s.addComment)
  const commentMap = useCommunity(s => s.comments)
  const storeComments = commentMap[post.id] ?? []
  const getUser = useCommunity(s => s.getUser)
  const authorUser = getUser(post.author)
  const following = followedIds.includes(authorUser.id)
  const liked = likedIds.includes(post.id)
  const collect = collectedIds.includes(post.id)
  const [likedComments, setLikedComments] = useState<Set<string>>(new Set())
  const toggleCommentLike = (key: string) =>
    setLikedComments(prev => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  const commentLiked = (key: string, base: number) => base + (likedComments.has(key) ? 1 : 0)
  const [composerPhase, setComposerPhase] = useState<'closed' | 'wide' | 'open'>('closed')
  const composerTimer = useRef<number | null>(null)
  const [expandedReplies, setExpandedReplies] = useState<Set<number>>(new Set())
  const [replyTo, setReplyTo] = useState<number | null>(null)
  const [myReplies, setMyReplies] = useState<Record<number, { text: string; url?: string }[]>>({})
  const [attachmentUrl, setAttachmentUrl] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const totalComments = (isMine ? comments.length : 1439) + extra + storeComments.length
  const collects = isMine ? 0 : ((post.id * 977) % 4000) + 800
  const likesShown = fmtCount(parseCount(post.likes) + (liked ? 1 : 0))
  const collectsShown = fmtCount(collects + (collect ? 1 : 0))

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [onClose])

  const submit = () => {
    const text = draft.trim()
    if (!text) return
    const url = attachmentUrl || undefined
    if (replyTo !== null) {
      setMyReplies(prev => ({ ...prev, [replyTo]: [...(prev[replyTo] || []), { text, url }] }))
      setExpandedReplies(prev => new Set(prev).add(replyTo))
      setReplyTo(null)
    } else {
      addComment(post.id, text)
    }
    setExtra(e => e + 1)
    setDraft('')
    setAttachmentUrl(null)
  }

  const startReply = (i: number, name: string) => {
    setReplyTo(i)
    setDraft(`@${name} `)
    if (composerPhase === 'closed') openComposer()
  }

  const pickImage = (file: File | undefined) => {
    if (file && file.type.startsWith('image/')) {
      if (attachmentUrl) URL.revokeObjectURL(attachmentUrl)
      setAttachmentUrl(URL.createObjectURL(file))
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const loadMore = () => {
    setComments(c => [...c, ...getComments(post, page + 1)])
    setPage(p => p + 1)
  }

  const toggleReply = (i: number) => {
    setExpandedReplies(prev => {
      const next = new Set(prev)
      if (next.has(i)) next.delete(i)
      else next.add(i)
      return next
    })
  }

  useEffect(
    () => () => {
      if (composerTimer.current) window.clearTimeout(composerTimer.current)
    },
    [],
  )

  const openComposer = () => {
    if (composerPhase !== 'closed') return
    setComposerPhase('wide')
    composerTimer.current = window.setTimeout(() => setComposerPhase('open'), 210)
  }

  const closeComposer = () => {
    if (composerPhase === 'closed') return
    setComposerPhase('wide')
    setDraft('')
    composerTimer.current = window.setTimeout(
      () => setComposerPhase('closed'),
      composerPhase === 'open' ? 240 : 0,
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.72)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
      }}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.92, opacity: 0, y: 12 }}
        transition={{ type: 'spring', stiffness: 300, damping: 26 }}
        onClick={e => e.stopPropagation()}
        style={{ position: 'relative' }}
      >
        <button
          onClick={onClose}
          aria-label="关闭"
          style={{
            position: 'absolute',
            top: -38,
            left: -38,
            zIndex: 6,
            width: 34,
            height: 34,
            borderRadius: '50%',
            background: 'rgba(0,0,0,0.65)',
            border: 'none',
            color: 'var(--surface)',
            fontSize: 16,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            lineHeight: 1,
            boxShadow: '0 4px 14px rgba(0,0,0,0.3)',
          }}
        >
          ✕
        </button>
        <div
          style={{
            display: 'flex',
            width: '100%',
            maxWidth: 920,
            height: 'min(88vh, 720px)',
            borderRadius: 18,
            overflow: 'hidden',
            background: 'var(--surface)',
            boxShadow: '0 32px 90px rgba(0,0,0,0.5)',
          }}
        >
          {/* 左侧：大图 */}
          <div
            style={{
              width: '56%',
              flexShrink: 0,
              position: 'relative',
              background: 'var(--grey-150)',
            }}
          >
            {post.videoUrl ? (
              <video
                src={post.videoUrl}
                controls
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain',
                  background: '#000',
                  display: 'block',
                }}
              />
            ) : post.img ? (
              <img
                src={postImg(post.img, 900, 1200)}
                alt=""
                style={{ width: '100%', height: '100%', display: 'block', objectFit: 'cover' }}
              />
            ) : (
              <div
                style={{
                  width: '100%',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 14,
                  background: 'linear-gradient(150deg, var(--brand-tint), #F6F6F7)',
                  padding: 24,
                  boxSizing: 'border-box',
                }}
              >
                <div
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: '50%',
                    background: 'var(--brand)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="#fff">
                    <polygon points="8 5 19 12 8 19 8 5" />
                  </svg>
                </div>
                <p
                  style={{
                    fontSize: 16,
                    lineHeight: 1.9,
                    color: '#444',
                    whiteSpace: 'pre-line',
                    textAlign: 'center',
                    margin: 0,
                    fontFamily: "'Noto Serif SC', serif",
                  }}
                >
                  {post.quote || post.title}
                </p>
              </div>
            )}
            {post.imgOverlay && (
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  display: 'flex',
                  alignItems: 'flex-end',
                  padding: '18px 16px',
                  background: 'linear-gradient(to top, rgba(0,0,0,0.55) 0%, transparent 60%)',
                }}
              >
                <span
                  style={{
                    color: 'var(--surface)',
                    fontSize: 17,
                    fontWeight: 700,
                    lineHeight: 1.4,
                    whiteSpace: 'pre-line',
                  }}
                >
                  {post.imgOverlay}
                </span>
              </div>
            )}
            {post.type === 'video' && (
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
                    width: 52,
                    height: 52,
                    borderRadius: '50%',
                    background: 'rgba(0,0,0,0.45)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                    <polygon points="5 3 19 12 5 21 5 3" />
                  </svg>
                </div>
              </div>
            )}
            {post.duration && (
              <div
                style={{
                  position: 'absolute',
                  bottom: 10,
                  right: 10,
                  background: 'rgba(0,0,0,0.55)',
                  color: 'var(--surface)',
                  fontSize: 12,
                  padding: '2px 8px',
                  borderRadius: 5,
                }}
              >
                {post.duration}
              </div>
            )}
          </div>

          {/* 右侧：作者 + 文字/标签 + 评论 + 输入框 */}
          <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
            <div
              style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '16px 16px 12px' }}
            >
              <div
                onClick={() => onOpenAuthor(post.author)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  flex: 1,
                  minWidth: 0,
                  cursor: 'pointer',
                }}
              >
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: '50%',
                    background: '#FFB347',
                    color: 'var(--surface)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 16,
                    fontWeight: 700,
                    flexShrink: 0,
                  }}
                >
                  {post.author.charAt(0)}
                </div>
                <div
                  style={{ minWidth: 0, fontSize: 15, fontWeight: 600, color: 'var(--grey-900)' }}
                >
                  {post.author}
                </div>
              </div>
              <button
                onClick={() => toggleFollow(authorUser.id)}
                style={{
                  border: 'none',
                  borderRadius: 999,
                  padding: '8px 20px',
                  fontSize: 14,
                  fontWeight: 700,
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  background: following ? 'var(--surface-sunken)' : 'var(--brand)',
                  color: following ? 'var(--text-subtle)' : 'var(--surface)',
                  flexShrink: 0,
                }}
              >
                {following ? '已关注' : '关注'}
              </button>
            </div>

            <div style={{ padding: '4px 16px 12px' }}>
              <p
                style={{
                  margin: 0,
                  fontSize: 16,
                  color: 'var(--ink-strong)',
                  lineHeight: 1.55,
                }}
              >
                {post.title}
              </p>
              {post.tags && post.tags.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
                  {post.tags.map(t => (
                    <button
                      key={t}
                      onClick={() => onOpenTag(t)}
                      style={{
                        color: '#2E6BE6',
                        fontSize: 13,
                        fontWeight: 500,
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        padding: 0,
                        fontFamily: 'inherit',
                        transition: 'color 0.15s ease',
                      }}
                      onMouseEnter={e => (e.currentTarget.style.color = 'var(--brand)')}
                      onMouseLeave={e => (e.currentTarget.style.color = '#2E6BE6')}
                    >
                      #{t}
                    </button>
                  ))}
                </div>
              )}

              {post.content && (
                <div
                  style={{
                    margin: '10px 16px 4px',
                    maxHeight: 150,
                    overflowY: 'auto',
                    background: 'var(--grey-25)',
                    borderRadius: 10,
                    padding: '10px 12px',
                  }}
                >
                  <p
                    style={{
                      fontSize: 14,
                      lineHeight: 1.95,
                      color: 'var(--grey-900)',
                      margin: 0,
                      whiteSpace: 'pre-wrap',
                    }}
                  >
                    {post.content}
                  </p>
                </div>
              )}
            </div>

            <div style={{ flex: 1, overflowY: 'auto' }}>
              <div style={{ padding: '12px 16px 8px', fontSize: 14, color: 'var(--text)' }}>
                共 {totalComments} 条评论
              </div>

              {storeComments.map((c, ci) => (
                <div key={'uc' + ci} style={{ display: 'flex', gap: 10, padding: '11px 16px' }}>
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: '50%',
                      background: 'var(--brand)',
                      color: 'var(--surface)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 14,
                      fontWeight: 700,
                      flexShrink: 0,
                    }}
                  >
                    {c.name.charAt(0)}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, color: 'var(--grey-800)' }}>{c.name}</div>
                    <div
                      style={{
                        fontSize: 14,
                        color: 'var(--text)',
                        marginTop: 2,
                        lineHeight: 1.55,
                      }}
                    >
                      {c.text}
                    </div>
                    <div style={{ marginTop: 5, fontSize: 12, color: 'var(--text-subtle)' }}>
                      {c.time}
                    </div>
                  </div>
                </div>
              ))}

              {!isMine && (
                <div style={{ padding: '10px 16px', background: 'var(--grey-25)' }}>
                  <div style={{ display: 'flex', gap: 10 }}>
                    <div
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: '50%',
                        background: '#FFB347',
                        color: 'var(--surface)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 14,
                        fontWeight: 700,
                        flexShrink: 0,
                      }}
                    >
                      {post.author.charAt(0)}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ fontSize: 13, color: 'var(--grey-800)' }}>
                          {post.author}
                        </span>
                        <span
                          style={{
                            fontSize: 10,
                            color: 'var(--surface)',
                            background: 'var(--brand)',
                            borderRadius: 3,
                            padding: '1px 5px',
                            fontWeight: 700,
                          }}
                        >
                          作者
                        </span>
                      </div>
                      <div
                        style={{
                          fontSize: 14,
                          color: 'var(--text)',
                          marginTop: 3,
                          lineHeight: 1.5,
                        }}
                      >
                        {PINNED_NOTICE}
                      </div>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 6,
                          marginTop: 5,
                          fontSize: 12,
                          color: 'var(--text-subtle)',
                        }}
                      >
                        <span>07-19 · 广东</span>
                        <span style={{ color: 'var(--brand)', fontWeight: 600 }}>置顶评论</span>
                      </div>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 14,
                          marginTop: 6,
                          fontSize: 12,
                          color: 'var(--text-subtle)',
                        }}
                      >
                        <button
                          onClick={() => toggleCommentLike('pinned')}
                          aria-label={likedComments.has('pinned') ? '取消点赞' : '点赞'}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 4,
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            padding: 0,
                            fontFamily: 'inherit',
                            color: 'var(--text-subtle)',
                          }}
                        >
                          <svg
                            width="12"
                            height="12"
                            viewBox="0 0 24 24"
                            fill={likedComments.has('pinned') ? '#FF2442' : 'none'}
                            stroke="#FF2442"
                            strokeWidth="2"
                          >
                            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                          </svg>
                          {commentLiked('pinned', 752)}
                        </button>
                        <button
                          onClick={() => startReply(-1, post.author)}
                          style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            padding: 0,
                            fontSize: 12,
                            color: 'var(--text-subtle)',
                            fontFamily: 'inherit',
                          }}
                        >
                          回复
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {comments.map((c, i) => {
                const open = expandedReplies.has(i)
                const replies = c.replies > 0 ? getReplies(post, post.id * 97 + i * 31 + 7) : []
                const mine = (myReplies[i] || []).map(t => ({
                  name: '我',
                  text: t.text,
                  time: '刚刚',
                  location: '',
                  likes: 0,
                  url: t.url,
                }))
                const allReplies = [...replies, ...mine]
                return (
                  <div key={i}>
                    <div style={{ display: 'flex', gap: 10, padding: '11px 16px' }}>
                      <div
                        style={{
                          width: 32,
                          height: 32,
                          borderRadius: '50%',
                          background: AVATAR_COLORS[i % AVATAR_COLORS.length],
                          color: 'var(--surface)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: 14,
                          fontWeight: 700,
                          flexShrink: 0,
                        }}
                      >
                        {c.name.charAt(0)}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13, color: 'var(--grey-800)' }}>{c.name}</div>
                        <div
                          style={{
                            fontSize: 14,
                            color: 'var(--text)',
                            marginTop: 2,
                            lineHeight: 1.55,
                          }}
                        >
                          {c.text}
                        </div>
                        {c.url && (
                          <img
                            src={c.url}
                            alt="评论图片"
                            style={{
                              width: 'min(220px, 100%)',
                              borderRadius: 10,
                              marginTop: 8,
                              display: 'block',
                            }}
                          />
                        )}
                        <div style={{ marginTop: 5, fontSize: 12, color: 'var(--text-subtle)' }}>
                          {c.time} · {c.location}
                        </div>
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 14,
                            marginTop: 6,
                            fontSize: 12,
                            color: 'var(--text-subtle)',
                          }}
                        >
                          <button
                            onClick={() => toggleCommentLike(`c${i}-${c.name}-${c.text}`)}
                            aria-label={
                              likedComments.has(`c${i}-${c.name}-${c.text}`) ? '取消点赞' : '点赞'
                            }
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 4,
                              background: 'none',
                              border: 'none',
                              cursor: 'pointer',
                              padding: 0,
                              fontFamily: 'inherit',
                              color: 'var(--text-subtle)',
                            }}
                          >
                            <svg
                              width="12"
                              height="12"
                              viewBox="0 0 24 24"
                              fill={
                                likedComments.has(`c${i}-${c.name}-${c.text}`)
                                  ? 'var(--brand)'
                                  : 'none'
                              }
                              stroke="#FF2442"
                              strokeWidth="2"
                            >
                              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                            </svg>
                            {commentLiked(`c${i}-${c.name}-${c.text}`, c.likes)}
                          </button>
                          <button
                            onClick={() => startReply(i, c.name)}
                            style={{
                              background: 'none',
                              border: 'none',
                              cursor: 'pointer',
                              padding: 0,
                              fontSize: 12,
                              color: 'var(--text-subtle)',
                              fontFamily: 'inherit',
                            }}
                          >
                            回复
                          </button>
                        </div>
                        {c.replies > 0 && (
                          <div style={{ marginTop: 5 }}>
                            <button
                              onClick={() => toggleReply(i)}
                              style={{
                                border: 'none',
                                background: 'none',
                                cursor: 'pointer',
                                padding: 0,
                                fontSize: 12,
                                color: '#2E6BE6',
                                fontFamily: 'inherit',
                              }}
                            >
                              {open ? '收起回复' : `展开 ${c.replies} 条回复`}
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                    {open &&
                      allReplies.map((r, j) => (
                        <div
                          key={j}
                          style={{
                            display: 'flex',
                            gap: 10,
                            padding: '8px 16px 8px 58px',
                            background: 'var(--grey-25)',
                          }}
                        >
                          <div
                            style={{
                              width: 24,
                              height: 24,
                              borderRadius: '50%',
                              background: AVATAR_COLORS[(i + j + 1) % AVATAR_COLORS.length],
                              color: 'var(--surface)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: 11,
                              fontWeight: 700,
                              flexShrink: 0,
                            }}
                          >
                            {r.name.charAt(0)}
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: 12, color: '#888' }}>
                              {r.name} 回复 @{c.name}
                            </div>
                            <div
                              style={{
                                fontSize: 13,
                                color: 'var(--grey-900)',
                                marginTop: 1,
                                lineHeight: 1.5,
                              }}
                            >
                              {r.text}
                            </div>
                            {r.url && (
                              <img
                                src={r.url}
                                alt="回复图片"
                                style={{
                                  width: 'min(180px, 100%)',
                                  borderRadius: 10,
                                  marginTop: 6,
                                  display: 'block',
                                }}
                              />
                            )}
                            <div style={{ marginTop: 3, fontSize: 11, color: 'var(--grey-450)' }}>
                              {r.time} · {r.location}
                            </div>
                          </div>
                          <button
                            onClick={() => toggleCommentLike(`r${i}-${j}-${r.name}-${r.text}`)}
                            aria-label={
                              likedComments.has(`r${i}-${j}-${r.name}-${r.text}`)
                                ? '取消点赞'
                                : '点赞'
                            }
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 4,
                              background: 'none',
                              border: 'none',
                              cursor: 'pointer',
                              padding: 0,
                              fontFamily: 'inherit',
                              fontSize: 11,
                              color: likedComments.has(`r${i}-${j}-${r.name}-${r.text}`)
                                ? 'var(--brand)'
                                : 'var(--grey-450)',
                              flexShrink: 0,
                              marginTop: 2,
                            }}
                          >
                            <svg
                              width="11"
                              height="11"
                              viewBox="0 0 24 24"
                              fill={
                                likedComments.has(`r${i}-${j}-${r.name}-${r.text}`)
                                  ? 'var(--brand)'
                                  : 'none'
                              }
                              stroke={
                                likedComments.has(`r${i}-${j}-${r.name}-${r.text}`)
                                  ? 'var(--brand)'
                                  : 'var(--grey-450)'
                              }
                              strokeWidth="2"
                            >
                              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                            </svg>
                            {commentLiked(`r${i}-${j}-${r.name}-${r.text}`, r.likes)}
                          </button>
                        </div>
                      ))}
                  </div>
                )
              })}

              <button
                onClick={loadMore}
                style={{
                  width: '100%',
                  padding: '12px 0',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: 13,
                  color: 'var(--brand)',
                  fontWeight: 600,
                  fontFamily: 'inherit',
                }}
              >
                查看更多评论
              </button>
            </div>

            <div>
              {composerPhase === 'open' && (
                <div style={{ margin: '0 16px', borderTop: '1px solid #EEEEEE' }} />
              )}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 14,
                  padding: '12px 16px 14px',
                }}
              >
                <motion.div
                  layout
                  onClick={() => {
                    if (composerPhase === 'closed') openComposer()
                  }}
                  transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
                  style={{
                    flex: 1,
                    minWidth: 0,
                    background: 'var(--surface-sunken)',
                    borderRadius: composerPhase === 'open' ? 16 : 999,
                    overflow: 'hidden',
                    cursor: composerPhase === 'open' ? 'default' : 'text',
                    transition: 'border-radius 0.32s cubic-bezier(0.22,1,0.36,1)',
                  }}
                >
                  <AnimatePresence initial={false}>
                    {composerPhase !== 'open' ? (
                      <motion.div
                        key="closed"
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.12 }}
                        style={{
                          height: 42,
                          display: 'flex',
                          alignItems: 'center',
                          padding: '0 18px',
                        }}
                      >
                        <span style={{ fontSize: 14, color: 'var(--text-subtle)' }}>说点什么…</span>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="open"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        style={{ padding: '12px 14px 12px' }}
                      >
                        <motion.div
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.24, delay: 0.06 }}
                        >
                          <textarea
                            value={draft}
                            onChange={e => setDraft(e.target.value)}
                            onKeyDown={e => {
                              if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing)
                                submit()
                            }}
                            placeholder="说点什么…"
                            autoFocus
                            rows={2}
                            style={{
                              width: '100%',
                              display: 'block',
                              border: 'none',
                              outline: 'none',
                              background: 'var(--surface-sunken)',
                              borderRadius: 10,
                              padding: '10px 12px',
                              fontSize: 14,
                              resize: 'none',
                              fontFamily: 'inherit',
                              color: 'var(--grey-900)',
                              lineHeight: 1.5,
                            }}
                          />
                        </motion.div>
                        <motion.div
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.24, delay: 0.14 }}
                        >
                          {attachmentUrl && (
                            <div
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 8,
                                marginBottom: 8,
                                background: 'var(--surface)',
                                border: '1px solid var(--grey-150)',
                                borderRadius: 10,
                                padding: 4,
                              }}
                            >
                              <img
                                src={attachmentUrl}
                                alt="待发送图片"
                                style={{
                                  width: 46,
                                  height: 46,
                                  objectFit: 'cover',
                                  borderRadius: 8,
                                  display: 'block',
                                }}
                              />
                              <button
                                onClick={() => {
                                  if (attachmentUrl) URL.revokeObjectURL(attachmentUrl)
                                  setAttachmentUrl(null)
                                }}
                                aria-label="移除图片"
                                style={{
                                  background: 'none',
                                  border: 'none',
                                  color: 'var(--text-subtle)',
                                  cursor: 'pointer',
                                  fontSize: 16,
                                  lineHeight: 1,
                                  padding: 4,
                                }}
                              >
                                ✕
                              </button>
                            </div>
                          )}
                          <div style={{ display: 'flex', alignItems: 'center', marginTop: 10 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                              <button
                                onClick={submit}
                                disabled={!draft.trim()}
                                style={{
                                  background: draft.trim() ? 'var(--brand)' : '#F3C1C9',
                                  color: 'var(--surface)',
                                  border: 'none',
                                  borderRadius: 999,
                                  padding: '7px 16px',
                                  fontSize: 13,
                                  fontWeight: 600,
                                  cursor: draft.trim() ? 'pointer' : 'default',
                                  fontFamily: 'inherit',
                                }}
                              >
                                发送
                              </button>
                              <button
                                onClick={closeComposer}
                                style={{
                                  background: 'var(--surface-sunken)',
                                  color: 'var(--text-muted)',
                                  border: 'none',
                                  borderRadius: 999,
                                  padding: '7px 16px',
                                  fontSize: 13,
                                  cursor: 'pointer',
                                  fontFamily: 'inherit',
                                }}
                              >
                                取消
                              </button>
                            </div>
                            <div style={{ flex: 1 }} />
                            <div
                              style={{
                                position: 'relative',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 18,
                              }}
                            >
                              <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                style={{ display: 'none' }}
                                onChange={e => pickImage(e.target.files?.[0])}
                              />
                              <button
                                onClick={() => setDraft(d => d + '@')}
                                aria-label="提及"
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  background: 'none',
                                  border: 'none',
                                  cursor: 'pointer',
                                  padding: 0,
                                  color: 'var(--text-muted)',
                                }}
                              >
                                <svg
                                  width="20"
                                  height="20"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="#666"
                                  strokeWidth="1.8"
                                >
                                  <circle cx="12" cy="12" r="4" />
                                  <path d="M16 8v5a3 3 0 0 0 6 0v-1a10 10 0 1 0-3.9 7.9" />
                                </svg>
                              </button>
                              <button
                                onClick={() => fileInputRef.current?.click()}
                                aria-label="上传图片"
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  background: 'none',
                                  border: 'none',
                                  cursor: 'pointer',
                                  padding: 0,
                                  color: 'var(--text-muted)',
                                }}
                              >
                                <svg
                                  width="20"
                                  height="20"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="#666"
                                  strokeWidth="1.8"
                                >
                                  <rect x="3" y="3" width="18" height="18" rx="3" />
                                  <circle cx="9" cy="9" r="2" />
                                  <path d="M21 15l-5-5L5 21" />
                                </svg>
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
                <AnimatePresence>
                  {composerPhase === 'closed' && (
                    <motion.div
                      key="tabs"
                      initial={{ opacity: 0, x: 18 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 14 }}
                      transition={{ duration: 0.2 }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 16,
                        flexShrink: 0,
                        color: 'var(--text-muted)',
                        fontSize: 13,
                      }}
                    >
                      <button
                        onClick={() => toggleLike(post.id)}
                        aria-label={liked ? '取消点赞' : '点赞'}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 4,
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          padding: 0,
                          fontFamily: 'inherit',
                          color: liked ? 'var(--brand)' : 'var(--text-muted)',
                          transition: 'transform 0.15s ease',
                        }}
                      >
                        <svg
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          fill={liked ? '#FF2442' : 'none'}
                          stroke="#FF2442"
                          strokeWidth="1.8"
                        >
                          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                        </svg>
                        {likesShown}
                      </button>
                      <button
                        onClick={() => toggleCollect(post.id)}
                        aria-label={collect ? '取消收藏' : '收藏'}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 4,
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          padding: 0,
                          fontFamily: 'inherit',
                          color: collect ? '#FFB800' : 'var(--text-muted)',
                          transition: 'transform 0.15s ease',
                        }}
                      >
                        <svg
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          fill={collect ? '#FFB800' : 'none'}
                          stroke={collect ? '#FFB800' : 'var(--text-muted)'}
                          strokeWidth="1.8"
                        >
                          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01z" />
                        </svg>
                        {collectsShown}
                      </button>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <svg
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="#666"
                          strokeWidth="1.8"
                        >
                          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                        </svg>
                        {totalComments}
                      </span>
                      <span
                        aria-label="分享"
                        style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
                      >
                        <svg
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="#666"
                          strokeWidth="1.8"
                        >
                          <path d="M15 3h6v6M21 3l-8.5 8.5M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                        </svg>
                      </span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
