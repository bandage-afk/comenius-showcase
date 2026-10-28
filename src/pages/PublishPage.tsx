import { useRef, useState } from 'react'
import AppShell from '../components/AppShell'
import type { NavProps } from '../App'
import { useNotes } from '../notesStore'
import { useContent } from '../contentStore'

type PublishTab = 'video' | 'image' | 'article' | 'podcast'

function PublishComposer({
  kind,
  navigate,
}: {
  kind: 'image' | 'video' | 'article' | 'podcast'
  navigate: NavProps['navigate']
}) {
  const blogCategories = useContent(s => s.blogCategories)
  const podcastCategories = useContent(s => s.podcastCategories)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [tagDraft, setTagDraft] = useState('')
  const [visibility, setVisibility] = useState<'public' | 'self'>('public')
  const [category, setCategory] = useState<string>(
    kind === 'podcast' ? '老师分享' : 'UK Applications',
  )
  const [channels, setChannels] = useState<string[]>(() =>
    kind === 'article' ? ['blog'] : kind === 'podcast' ? ['podcast'] : ['community'],
  )
  const [mediaUrl, setMediaUrl] = useState('')
  const [cover, setCover] = useState('')
  const [duration, setDuration] = useState('')
  const [notice, setNotice] = useState('')
  const publishNote = useNotes(s => s.publish)
  const videoRef = useRef<HTMLInputElement>(null)
  const coverRef = useRef<HTMLInputElement>(null)

  const TITLES: Record<string, string> = {
    image: '发布图文',
    video: '发布视频',
    article: '发布长文',
    podcast: '发布长视频',
  }
  const SUGGESTIONS: Record<string, string[]> = {
    image: ['A-Level', '数学', '备考', '留学', '学习日常'],
    video: ['视频', '记录', '讲解', 'Vlog', '经验分享'],
    article: ['长文', '思考', '留学', '申请季', '复盘'],
    podcast: ['TED演讲', '采访', '老师分享', '经验', '留学'],
  }

  const notify = (m: string) => {
    setNotice(m)
    window.setTimeout(() => setNotice(''), 2000)
  }

  const pickVideo = (file: File | undefined) => {
    if (!file || !file.type.startsWith('video/')) return
    setMediaUrl(URL.createObjectURL(file))
    const probe = document.createElement('video')
    probe.preload = 'metadata'
    probe.addEventListener('loadedmetadata', () => {
      const m = Math.floor(probe.duration / 60)
      const sec = Math.floor(probe.duration % 60)
      setDuration(`${m}:${String(sec).padStart(2, '0')}`)
    })
    probe.src = URL.createObjectURL(file)
  }

  const pickCover = (file: File | undefined) => {
    if (!file || !file.type.startsWith('image/')) return
    const r = new FileReader()
    r.addEventListener('load', () => setCover(String(r.result || '')))
    r.readAsDataURL(file)
  }

  const addTag = (raw: string) => {
    const t = raw.trim().replace(/^#/, '')
    if (!t) return
    setTags(prev => (prev.includes(t) ? prev : [...prev, t].slice(0, 6)))
    setTagDraft('')
  }

  const canPublish = title.trim().length > 0

  const doPublish = () => {
    const t = title.trim()
    if (!t) return
    const base = { tags: tags.length ? tags : ['学习'], author: '我', channels }
    if (kind === 'video') {
      publishNote({
        ...base,
        type: 'video',
        title: t,
        duration: duration || '--',
        videoUrl: mediaUrl || undefined,
      })
    } else if (kind === 'image') {
      publishNote({
        ...base,
        type: cover ? 'image' : 'text',
        title: t,
        quote: cover ? undefined : t,
        img: cover || undefined,
      })
    } else if (kind === 'article') {
      publishNote({
        ...base,
        type: 'article',
        title: t,
        category,
        content: content.trim() || undefined,
        img: cover || undefined,
      })
    } else {
      publishNote({
        ...base,
        type: 'podcast',
        title: t,
        category,
        duration: duration || '--',
        videoUrl: mediaUrl || undefined,
        img: cover || undefined,
      })
    }
    navigate(
      channels.includes('community') ? 'feed' : channels.includes('podcast') ? 'podcast' : 'blog',
    )
  }

  const saveDraft = () => {
    notify('已存为草稿（演示）')
  }

  const inputBase: React.CSSProperties = {
    width: '100%',
    boxSizing: 'border-box',
    border: '1px solid #E3E3E3',
    borderRadius: 12,
    background: 'var(--surface)',
    color: 'var(--text)',
    fontFamily: 'inherit',
    outline: 'none',
  }

  return (
    <div
      style={{
        padding: '28px 40px 60px',
        flex: 1,
        overflowY: 'auto',
        display: 'flex',
        justifyContent: 'center',
      }}
    >
      <div style={{ width: '100%', maxWidth: 1040 }}>
        {/* Page head */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 22,
          }}
        >
          <div>
            <div style={{ fontSize: 22, fontWeight: 800, color: '#171717', letterSpacing: 0.5 }}>
              {TITLES[kind]}
            </div>
            <div style={{ fontSize: 13, color: 'var(--text-subtle)', marginTop: 4 }}>
              分享有价值的内容，让同路人都能看见
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button
              onClick={saveDraft}
              style={{
                padding: '9px 20px',
                borderRadius: 999,
                border: '1px solid var(--grey-200)',
                background: 'var(--surface)',
                color: 'var(--grey-800)',
                fontSize: 13.5,
                cursor: 'pointer',
                fontFamily: 'inherit',
              }}
            >
              存草稿
            </button>
            <button
              onClick={doPublish}
              disabled={!canPublish}
              style={{
                padding: '9px 24px',
                borderRadius: 999,
                border: 'none',
                background: canPublish ? 'var(--brand)' : '#F3C1C9',
                color: 'var(--surface)',
                fontSize: 13.5,
                fontWeight: 700,
                cursor: canPublish ? 'pointer' : 'default',
                fontFamily: 'inherit',
              }}
            >
              发布
            </button>
          </div>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1.15fr)',
            gap: 26,
            alignItems: 'start',
          }}
        >
          {/* 左侧：媒体大区 */}
          <div>
            <div
              style={{ fontSize: 13, color: 'var(--grey-800)', fontWeight: 700, marginBottom: 10 }}
            >
              封面与媒体
            </div>
            <div
              style={{
                border: '1px solid var(--grey-150)',
                borderRadius: 18,
                overflow: 'hidden',
                background: '#F7F7F8',
              }}
            >
              <div
                style={{
                  position: 'relative',
                  aspectRatio: kind === 'image' ? '3 / 4' : kind === 'video' ? '16 / 10' : '4 / 3',
                }}
              >
                {kind === 'video' && mediaUrl ? (
                  <video
                    src={mediaUrl}
                    controls
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'contain',
                      background: '#000',
                      display: 'block',
                    }}
                  />
                ) : cover ? (
                  <>
                    <img
                      src={cover}
                      alt="封面预览"
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        display: 'block',
                      }}
                    />
                    <button
                      onClick={() => {
                        setCover('')
                        if (coverRef.current) coverRef.current.value = ''
                      }}
                      aria-label="移除封面"
                      style={{
                        position: 'absolute',
                        top: 12,
                        right: 12,
                        background: 'rgba(0,0,0,0.55)',
                        color: 'var(--surface)',
                        border: 'none',
                        width: 30,
                        height: 30,
                        borderRadius: '50%',
                        cursor: 'pointer',
                        fontSize: 14,
                      }}
                    >
                      ✕
                    </button>
                  </>
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
                      cursor: 'pointer',
                    }}
                    onClick={() => (kind === 'video' ? videoRef : coverRef).current?.click()}
                  >
                    <div
                      style={{
                        width: 64,
                        height: 64,
                        borderRadius: '50%',
                        background: 'rgba(255,36,66,0.08)',
                        color: 'var(--brand)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {kind === 'video' ? (
                        <svg
                          width="26"
                          height="26"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.8"
                        >
                          <polygon points="8 5 19 12 8 19 8 5" />
                        </svg>
                      ) : (
                        <svg
                          width="26"
                          height="26"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.8"
                        >
                          <rect x="3" y="3" width="18" height="18" rx="3" />
                          <circle cx="8.5" cy="8.5" r="1.5" />
                          <polyline points="21 15 16 10 5 21" />
                        </svg>
                      )}
                    </div>
                    <span style={{ fontSize: 14.5, color: 'var(--text-muted)' }}>
                      {kind === 'video' ? '点击上传视频' : '点击上传封面图'}
                    </span>
                    <span style={{ fontSize: 12, color: 'var(--grey-450)' }}>
                      {kind === 'video' ? 'mp4 / webm，建议竖版 3:4' : '建议竖版 3:4，画质更高清'}
                    </span>
                  </div>
                )}
                {((kind !== 'video' && cover) || (kind === 'video' && mediaUrl)) && (
                  <button
                    onClick={() => (kind === 'video' ? videoRef : coverRef).current?.click()}
                    style={{
                      position: 'absolute',
                      left: 12,
                      bottom: 12,
                      background: 'rgba(0,0,0,0.55)',
                      color: 'var(--surface)',
                      border: 'none',
                      borderRadius: 999,
                      padding: '7px 16px',
                      cursor: 'pointer',
                      fontSize: 12.5,
                      fontFamily: 'inherit',
                    }}
                  >
                    更换
                  </button>
                )}
              </div>
            </div>
            <div style={{ fontSize: 12, color: 'var(--grey-450)', marginTop: 10, lineHeight: 1.8 }}>
              {kind === 'image' &&
                '支持拖拽上传，大小不超过 20MB；图文笔记会自动在首页以 3:4 展示。'}
              {kind === 'video' &&
                '支持 4 小时以内视频，建议分辨率 1080P+；发布后可直接在详情页播放。'}
              {kind === 'article' && '没有封面也没关系，会自动生成文字卡片；配上封面图观感更佳。'}
            </div>
          </div>

          {/* 右侧：表单 */}
          <div>
            <div
              style={{ fontSize: 13, color: 'var(--grey-800)', fontWeight: 700, marginBottom: 10 }}
            >
              内容
            </div>
            <input
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder={kind === 'image' ? '一句话介绍你的笔记（可选）' : '给你的内容起个名字'}
              maxLength={40}
              style={{ ...inputBase, padding: '12px 14px', fontSize: 16, fontWeight: 600 }}
            />
            <div
              style={{ textAlign: 'right', fontSize: 11.5, color: 'var(--grey-350)', marginTop: 6 }}
            >
              {title.length}/40
            </div>

            {kind === 'article' && (
              <>
                <div
                  style={{
                    fontSize: 13,
                    color: 'var(--grey-800)',
                    fontWeight: 700,
                    margin: '16px 0 10px',
                  }}
                >
                  正文
                </div>
                <textarea
                  value={content}
                  onChange={e => setContent(e.target.value)}
                  placeholder="开始写你的长文…支持分段换行，发布后正文可全文阅读"
                  style={{
                    ...inputBase,
                    padding: '14px',
                    height: 250,
                    fontSize: 15,
                    lineHeight: 1.95,
                    resize: 'none',
                  }}
                />
              </>
            )}

            <div
              style={{
                fontSize: 13,
                color: 'var(--grey-800)',
                fontWeight: 700,
                margin: '18px 0 10px',
              }}
            >
              标签（最多 6 个）
            </div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                flexWrap: 'wrap',
                border: '1px solid #E3E3E3',
                borderRadius: 12,
                padding: '8px 10px',
                minHeight: 44,
              }}
            >
              {tags.map(t => (
                <span
                  key={t}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    background: 'var(--brand-tint)',
                    color: 'var(--brand)',
                    borderRadius: 999,
                    padding: '5px 10px 5px 12px',
                    fontSize: 13,
                    fontWeight: 600,
                  }}
                >
                  #{t}
                  <button
                    onClick={() => setTags(prev => prev.filter(x => x !== t))}
                    aria-label={`移除 ${t}`}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--brand)',
                      cursor: 'pointer',
                      fontSize: 12,
                      padding: 0,
                    }}
                  >
                    ✕
                  </button>
                </span>
              ))}
              <input
                value={tagDraft}
                onChange={e => setTagDraft(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter' || e.key === ',') {
                    e.preventDefault()
                    addTag(tagDraft)
                  }
                }}
                onBlur={() => addTag(tagDraft)}
                placeholder={tags.length ? '' : '输入后回车添加标签'}
                style={{
                  flex: 1,
                  minWidth: 140,
                  border: 'none',
                  outline: 'none',
                  padding: '6px 4px',
                  fontSize: 13.5,
                  fontFamily: 'inherit',
                  color: 'var(--grey-900)',
                }}
              />
            </div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 8 }}>
              {(SUGGESTIONS[kind] || []).map(sg => (
                <button
                  key={sg}
                  onClick={() => addTag(sg)}
                  style={{
                    background: 'none',
                    border: '1px solid #E6E6E6',
                    color: tags.includes(sg) ? 'var(--brand)' : '#777',
                    borderRadius: 999,
                    padding: '5px 12px',
                    fontSize: 12,
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                  }}
                >
                  #{sg}
                </button>
              ))}
            </div>

            {(kind === 'article' || kind === 'podcast') && (
              <>
                <div
                  style={{
                    fontSize: 13,
                    color: 'var(--grey-800)',
                    fontWeight: 700,
                    margin: '20px 0 10px',
                  }}
                >
                  发布到
                </div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {[
                    { v: 'community', label: '社区 feed' },
                    ...(kind === 'article'
                      ? [{ v: 'blog', label: '博客 Blog' }]
                      : [{ v: 'podcast', label: '播客 Podcast' }]),
                  ].map(opt => {
                    const checked = channels.includes(opt.v)
                    return (
                      <button
                        key={opt.v}
                        onClick={() =>
                          setChannels(prev =>
                            checked ? prev.filter(x => x !== opt.v) : [...prev, opt.v],
                          )
                        }
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 6,
                          padding: '8px 16px',
                          borderRadius: 999,
                          border: checked ? '1px solid var(--brand)' : '1px solid var(--grey-200)',
                          background: checked ? 'var(--brand-tint)' : 'var(--surface)',
                          color: checked ? 'var(--brand)' : 'var(--text-muted)',
                          fontSize: 13,
                          cursor: 'pointer',
                          fontFamily: 'inherit',
                        }}
                      >
                        <span
                          style={{
                            width: 6,
                            height: 6,
                            borderRadius: '50%',
                            background: checked ? 'var(--brand)' : 'var(--grey-250)',
                          }}
                        />
                        {opt.label}
                      </button>
                    )
                  })}
                </div>
                {(kind === 'podcast' || kind === 'article') && (
                  <>
                    <div
                      style={{
                        fontSize: 13,
                        color: 'var(--grey-800)',
                        fontWeight: 700,
                        margin: '16px 0 10px',
                      }}
                    >
                      分类
                    </div>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      {(
                        (kind === 'podcast'
                          ? podcastCategories
                          : blogCategories) as readonly string[]
                      ).map(c => {
                        const active = category === c
                        return (
                          <button
                            key={c}
                            onClick={() => setCategory(c)}
                            style={{
                              padding: '7px 15px',
                              borderRadius: 999,
                              border: active
                                ? '1px solid var(--brand)'
                                : '1px solid var(--grey-200)',
                              background: active ? 'var(--brand-tint)' : 'var(--surface)',
                              color: active ? 'var(--brand)' : 'var(--text-muted)',
                              fontSize: 12.5,
                              cursor: 'pointer',
                              fontFamily: 'inherit',
                            }}
                          >
                            #{c}
                          </button>
                        )
                      })}
                    </div>
                  </>
                )}
              </>
            )}
            <div
              style={{
                fontSize: 13,
                color: 'var(--grey-800)',
                fontWeight: 700,
                margin: '20px 0 10px',
              }}
            >
              谁可以看
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              {(
                [
                  ['public', '公开'],
                  ['self', '仅自己'],
                ] as const
              ).map(([v, label]) => (
                <button
                  key={v}
                  onClick={() => setVisibility(v)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '8px 16px',
                    borderRadius: 999,
                    border:
                      visibility === v ? '1px solid var(--brand)' : '1px solid var(--grey-200)',
                    background: visibility === v ? 'var(--brand-tint)' : 'var(--surface)',
                    color: visibility === v ? 'var(--brand)' : 'var(--text-muted)',
                    fontSize: 13,
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                  }}
                >
                  <span
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: '50%',
                      background: visibility === v ? 'var(--brand)' : 'var(--grey-250)',
                    }}
                  />
                  {label}
                </button>
              ))}
            </div>

            <div style={{ display: 'flex', gap: 10, marginTop: 28 }}>
              <button
                onClick={saveDraft}
                style={{
                  flex: 1,
                  padding: '12px 0',
                  borderRadius: 999,
                  border: '1px solid var(--grey-200)',
                  background: 'var(--surface)',
                  color: 'var(--text-muted)',
                  fontSize: 14,
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                }}
              >
                存草稿
              </button>
              <button
                onClick={doPublish}
                disabled={!canPublish}
                style={{
                  flex: 2,
                  padding: '12px 0',
                  borderRadius: 999,
                  border: 'none',
                  background: canPublish ? 'var(--brand)' : '#F3C1C9',
                  color: 'var(--surface)',
                  fontSize: 14.5,
                  fontWeight: 700,
                  cursor: canPublish ? 'pointer' : 'default',
                  fontFamily: 'inherit',
                }}
              >
                发布{TITLES[kind].replace('发布', '')}
              </button>
            </div>
          </div>
        </div>

        {/* hidden inputs */}
        <input
          ref={videoRef}
          type="file"
          accept="video/*"
          style={{ display: 'none' }}
          onChange={e => pickVideo(e.target.files?.[0])}
        />
        <input
          ref={coverRef}
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          onChange={e => pickCover(e.target.files?.[0])}
        />

        {notice && (
          <div
            style={{
              position: 'fixed',
              left: '50%',
              bottom: 40,
              transform: 'translateX(-50%)',
              background: '#1F1F24',
              color: 'var(--surface)',
              padding: '10px 22px',
              borderRadius: 999,
              fontSize: 13,
              boxShadow: '0 12px 40px rgba(0,0,0,0.22)',
              zIndex: 1500,
            }}
          >
            {notice}
          </div>
        )}
      </div>
    </div>
  )
}

function VideoUploadTab({ navigate }: { navigate: NavProps['navigate'] }) {
  return <PublishComposer kind="video" navigate={navigate} />
}

function ImageUploadTab({ navigate }: { navigate: NavProps['navigate'] }) {
  return <PublishComposer kind="image" navigate={navigate} />
}

export default function PublishPage({ navigate }: NavProps) {
  const [activeTab, setActiveTab] = useState<PublishTab>('video')

  const TABS: { key: PublishTab; label: string }[] = [
    { key: 'video', label: '上传视频' },
    { key: 'image', label: '上传图文' },
    { key: 'article', label: '写长文' },
    { key: 'podcast', label: '发播客' },
  ]

  return (
    <AppShell navigate={navigate} currentPage="publish" contentLayout="column">
      {/* Tab bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          borderBottom: '1px solid #EBEBEB',
          padding: '0 24px',
          flexShrink: 0,
        }}
      >
        {TABS.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            style={{
              padding: '16px 18px',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: 14,
              fontWeight: activeTab === tab.key ? 600 : 400,
              color: activeTab === tab.key ? '#111' : '#888',
              fontFamily: 'inherit',
              position: 'relative',
              whiteSpace: 'nowrap',
              transition: 'color 0.15s',
            }}
          >
            {tab.label}
            {activeTab === tab.key && (
              <span
                style={{
                  position: 'absolute',
                  bottom: 0,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: 24,
                  height: 2.5,
                  background: 'var(--ink-strong)',
                  borderRadius: 999,
                }}
              />
            )}
          </button>
        ))}
        <div style={{ flex: 1 }} />
        <button
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontSize: 13,
            color: 'var(--text-muted)',
            fontFamily: 'inherit',
            padding: '8px 12px',
            borderRadius: 8,
          }}
          onMouseEnter={e => (e.currentTarget.style.background = 'var(--surface-sunken)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'none')}
        >
          <svg
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
          >
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
          草稿箱(0)
        </button>
      </div>

      {/* Tab content */}
      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
        {activeTab === 'video' && <VideoUploadTab navigate={navigate} />}
        {activeTab === 'image' && <ImageUploadTab navigate={navigate} />}
        {activeTab === 'article' && <PublishComposer kind="article" navigate={navigate} />}
        {activeTab === 'podcast' && <PublishComposer kind="podcast" navigate={navigate} />}
      </div>
    </AppShell>
  )
}
