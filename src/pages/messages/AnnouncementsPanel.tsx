// 群公告面板：发布 / 编辑 / 置顶 / 已读回执 / 未读名单。
// 从 GroupPanel.tsx 拆出的一整块 —— 它的 props 本来就自洽（conv / notify / onClose / canManage /
// onPublished），搬过来只换了 import，逻辑一行没动。

import { useState } from 'react'
import { useCommunity } from '../../communityStore'
import type { Conversation } from '../../community/data'
import { Avatar, Overlay, fmtTime, stroke } from './parts'

export function AnnouncementsPanel({
  conv,
  notify,
  onClose,
  canManage,
  onPublished,
}: {
  conv: Conversation
  notify: (m: string) => void
  onClose: () => void
  canManage: boolean
  onPublished?: () => void
}) {
  const groupMembers = useCommunity(s => s.groupMembers)
  const annsAll = useCommunity(s => s.announcements)
  const anns = annsAll[conv.id] ?? []
  const addAnnouncement = useCommunity(s => s.addAnnouncement)
  const updateAnnouncement = useCommunity(s => s.updateAnnouncement)
  const removeAnnouncement = useCommunity(s => s.removeAnnouncement)
  const toggleAnnouncementPin = useCommunity(s => s.toggleAnnouncementPin)
  const markAnnouncementRead = useCommunity(s => s.markAnnouncementRead)
  const members = conv.memberIds ?? []

  const [composing, setComposing] = useState(false)
  const [draft, setDraft] = useState('')
  const [editId, setEditId] = useState<number | null>(null)
  const [readFor, setReadFor] = useState<number | null>(null)

  const submit = () => {
    const text = draft.trim()
    if (!text) return
    if (editId != null) {
      updateAnnouncement(conv.id, editId, text)
      notify('公告已更新')
    } else {
      addAnnouncement(conv.id, text)
      notify('公告已发布')
      onPublished?.()
    }
    setDraft('')
    setComposing(false)
    setEditId(null)
  }

  return (
    <Overlay width={470} onClose={onClose}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 12 }}>
        <span style={{ flex: 1, fontSize: 15, fontWeight: 700, color: 'var(--ink-strong)' }}>
          群公告 · {anns.length}
        </span>
        <button
          onClick={onClose}
          aria-label="关闭"
          style={{
            width: 28,
            height: 28,
            borderRadius: '50%',
            border: 'none',
            background: 'var(--grey-15)',
            color: '#777',
            cursor: 'pointer',
            fontSize: 15,
          }}
        >
          ✕
        </button>
      </div>

      {anns.length === 0 && !composing && (
        <div style={{ padding: '30px 0', textAlign: 'center', color: '#BDBDBD', fontSize: 13 }}>
          还没有群公告
        </div>
      )}

      {anns.map(a => (
        <div
          key={a.id}
          style={{
            border: '1px solid var(--grey-75)',
            borderRadius: 12,
            padding: '12px 13px',
            marginBottom: 10,
            background: a.pinned ? '#FFFCF3' : 'var(--surface)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            {a.pinned && (
              <span
                style={{
                  fontSize: 10.5,
                  fontWeight: 700,
                  color: 'var(--warning)',
                  background: '#FFF3D6',
                  borderRadius: 4,
                  padding: '1px 6px',
                }}
              >
                置顶
              </span>
            )}
            <span style={{ fontSize: 11.5, color: 'var(--grey-400)' }}>
              {a.by === 'me' ? '我' : (groupMembers.find(m => m.id === a.by)?.name ?? '群成员')}{' '}
              发布 · {fmtTime(a.at)}
            </span>
            <span style={{ flex: 1 }} />
            {canManage && (
              <>
                <button
                  onClick={() => {
                    toggleAnnouncementPin(conv.id, a.id)
                    notify(a.pinned ? '已取消置顶' : '已置顶公告')
                  }}
                  style={{
                    border: 'none',
                    background: 'none',
                    color: 'var(--grey-600)',
                    fontSize: 11.5,
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                  }}
                >
                  {a.pinned ? '取消置顶' : '置顶'}
                </button>
                <button
                  onClick={() => {
                    setEditId(a.id)
                    setDraft(a.text)
                    setComposing(true)
                  }}
                  style={{
                    border: 'none',
                    background: 'none',
                    color: 'var(--grey-600)',
                    fontSize: 11.5,
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                  }}
                >
                  编辑
                </button>
                <button
                  onClick={() => {
                    removeAnnouncement(conv.id, a.id)
                    notify('公告已删除')
                  }}
                  style={{
                    border: 'none',
                    background: 'none',
                    color: 'var(--brand)',
                    fontSize: 11.5,
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                  }}
                >
                  删除
                </button>
              </>
            )}
          </div>

          {editId === a.id && composing ? (
            <div style={{ fontSize: 12.5, color: 'var(--grey-400)' }}>正在下方编辑…</div>
          ) : (
            <div
              style={{
                fontSize: 13,
                color: 'var(--grey-900)',
                lineHeight: 1.7,
                whiteSpace: 'pre-wrap',
              }}
            >
              {a.text}
            </div>
          )}

          <button
            onClick={() => setReadFor(readFor === a.id ? null : a.id)}
            style={{
              marginTop: 10,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              width: '100%',
              border: 'none',
              background: 'var(--grey-25)',
              borderRadius: 9,
              padding: '7px 10px',
              cursor: 'pointer',
              fontFamily: 'inherit',
              fontSize: 11.5,
              color: 'var(--grey-600)',
            }}
          >
            已读 {members.length - a.unread.length}/{members.length}
            <span style={{ flex: 1 }} />
            <svg
              width="11"
              height="11"
              viewBox="0 0 24 24"
              {...stroke}
              style={{
                color: 'var(--grey-300)',
                transform: readFor === a.id ? 'rotate(180deg)' : 'none',
                transition: 'transform 0.2s',
              }}
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>
          {readFor === a.id && (
            <div style={{ marginTop: 6 }}>
              {members.map(mid => {
                const m = groupMembers.find(x => x.id === mid)
                if (!m) return null
                const read = !a.unread.includes(mid)
                return (
                  <div
                    key={mid}
                    style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '5px 0' }}
                  >
                    <Avatar avatar={m.avatar} size={26} />
                    <span style={{ flex: 1, fontSize: 12.5, color: 'var(--grey-900)' }}>
                      {m.name}
                    </span>
                    <button
                      onClick={() => markAnnouncementRead(conv.id, a.id, mid)}
                      style={{
                        border: 'none',
                        background: read ? '#F2F2F3' : '#FFF3D6',
                        color: read ? 'var(--grey-600)' : 'var(--warning)',
                        borderRadius: 999,
                        padding: '3px 10px',
                        fontSize: 11.5,
                        cursor: 'pointer',
                        fontFamily: 'inherit',
                      }}
                    >
                      {read ? '已读' : '未读'}
                    </button>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      ))}

      {composing ? (
        <div style={{ borderTop: '1px solid #F4F4F4', paddingTop: 10 }}>
          <textarea
            value={draft}
            onChange={e => setDraft(e.target.value)}
            rows={3}
            autoFocus
            placeholder="写群公告，比如作业、时间安排…"
            style={{
              width: '100%',
              border: '1px solid #EAEAEA',
              borderRadius: 10,
              padding: '10px 12px',
              fontSize: 13,
              lineHeight: 1.6,
              resize: 'none',
              fontFamily: 'inherit',
              outline: 'none',
              color: 'var(--grey-900)',
            }}
          />
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 8 }}>
            <button
              onClick={() => {
                setComposing(false)
                setDraft('')
                setEditId(null)
              }}
              style={{
                border: 'none',
                background: '#F2F2F3',
                borderRadius: 999,
                padding: '6px 14px',
                fontSize: 12.5,
                cursor: 'pointer',
                fontFamily: 'inherit',
                color: 'var(--text-muted)',
              }}
            >
              取消
            </button>
            <button
              onClick={submit}
              style={{
                border: 'none',
                background: 'var(--brand)',
                borderRadius: 999,
                padding: '6px 14px',
                fontSize: 12.5,
                color: 'var(--surface)',
                cursor: 'pointer',
                fontFamily: 'inherit',
              }}
            >
              {editId != null ? '保存' : '发布'}
            </button>
          </div>
        </div>
      ) : (
        canManage && (
          <button
            onClick={() => {
              setComposing(true)
              setEditId(null)
              setDraft('')
            }}
            style={{
              width: '100%',
              border: '1px dashed var(--grey-200)',
              background: 'var(--grey-25)',
              borderRadius: 10,
              padding: '10px 0',
              cursor: 'pointer',
              fontFamily: 'inherit',
              fontSize: 12.5,
              color: 'var(--grey-600)',
            }}
          >
            + 发布新公告
          </button>
        )
      )}
    </Overlay>
  )
}
