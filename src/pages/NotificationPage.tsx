import { useState } from 'react'
import AppShell from '../components/AppShell'
import Switch from '../components/ui/Switch'
import type { NavProps } from '../App'
import type { Notif, NotifCategory } from '../notificationData'
import { NOTIF_SETTINGS, unreadInCategory, useNotifications } from '../notificationStore'

/**
 * 通知页：按「发布页面设计」里的截图还原。
 * 三个分类（评论和@ / 赞和收藏 / 新增关注）+ 列表 + 「- THE END-」收尾。
 * 私信不在这一页，走「消息」路由（MessagesPage）。
 *
 * 已读状态、全部已读、通知设置（齿轮弹层）三件事借鉴了 tutor 的 Notifications 页；
 * 版式仍是原来那版，设置做成弹层而不是常驻右栏。
 */

const TABS: { key: NotifCategory; label: string }[] = [
  { key: 'comment', label: '评论和@' },
  { key: 'like', label: '赞和收藏' },
  { key: 'follow', label: '新增关注' },
]

const imgUrl = (avatar: string, w = 88) =>
  `https://images.unsplash.com/${avatar}?w=${w}&h=${w}&fit=crop&auto=format`

function NotifRow({ item, unread, onRead }: { item: Notif; unread: boolean; onRead: () => void }) {
  const [hover, setHover] = useState(false)
  return (
    <div
      onClick={onRead}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: 'flex',
        gap: 14,
        alignItems: 'flex-start',
        padding: '16px 12px',
        margin: '0 -12px -6px',
        borderRadius: 12,
        // 未读：极浅的品牌色底；已读：透明（hover 才给一点灰）
        background: unread ? '#FFF8F9' : hover ? 'var(--grey-25)' : 'transparent',
        cursor: 'pointer',
        transition: 'background 0.15s',
      }}
    >
      <div
        style={{
          width: 44,
          height: 44,
          borderRadius: '50%',
          overflow: 'hidden',
          background: 'var(--grey-100)',
          flexShrink: 0,
        }}
      >
        <img
          src={imgUrl(item.avatar)}
          alt=""
          loading="lazy"
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
        />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 12 }}>
          <div
            style={{
              flex: 1,
              minWidth: 0,
              fontSize: 14,
              color: 'var(--ink-soft)',
              display: 'flex',
              alignItems: 'baseline',
              gap: 4,
              flexWrap: 'wrap',
            }}
          >
            <span style={{ fontWeight: 600, color: unread ? '#141414' : '#3A3A3A' }}>
              {item.name}
            </span>
            {item.badge && (
              <span
                style={{
                  fontSize: 11,
                  color: 'var(--grey-600)',
                  background: '#F4F4F4',
                  borderRadius: 4,
                  padding: '1px 5px',
                  fontWeight: 500,
                }}
              >
                {item.badge}
              </span>
            )}
            <span style={{ color: '#7A7A7A', fontWeight: 400 }}>{item.action}</span>
          </div>
          <span
            style={{
              fontSize: 12,
              color: unread ? 'var(--grey-600)' : 'var(--grey-400)',
              flexShrink: 0,
              fontWeight: unread ? 500 : 400,
            }}
          >
            {item.time}
          </span>
        </div>
        {item.snippet && (
          <div
            style={{
              fontSize: 13,
              color: 'var(--grey-500)',
              marginTop: 7,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {item.snippet}
          </div>
        )}
      </div>
      {/* 未读小圆点 */}
      {unread && (
        <span
          style={{
            width: 7,
            height: 7,
            borderRadius: '50%',
            background: 'var(--brand)',
            flexShrink: 0,
            marginTop: 6,
            display: 'block',
          }}
        />
      )}
    </div>
  )
}

export default function NotificationPage({ navigate, currentPage }: NavProps) {
  const [tab, setTab] = useState<NotifCategory>('comment')
  const [settingsOpen, setSettingsOpen] = useState(false)

  const readKeys = useNotifications(s => s.readKeys)
  const settings = useNotifications(s => s.settings)
  const items = useNotifications(s => s.items)
  const markRead = useNotifications(s => s.markRead)
  const markAllRead = useNotifications(s => s.markAllRead)
  const keysOfCategory = useNotifications(s => s.keysOfCategory)
  const isReadNotif = useNotifications(s => s.isRead)
  const toggleSetting = useNotifications(s => s.toggleSetting)

  const list = items[tab] ?? []
  const categoryOn = settings[tab]
  const unread = unreadInCategory(tab, readKeys, settings, items)
  const isRead = (n: Notif) => isReadNotif(tab, n.id)

  return (
    <AppShell fullHeight contentLayout="column" navigate={navigate} currentPage={currentPage}>
      <div
        style={{
          flex: 1,
          minWidth: 0,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {/* 分类 */}
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-end',
            padding: '34px 32px 0',
            flexShrink: 0,
            borderBottom: '1px solid var(--grey-75)',
          }}
        >
          <div style={{ display: 'flex', gap: 30 }}>
            {TABS.map(t => {
              const active = tab === t.key
              return (
                <button
                  key={t.key}
                  onClick={() => setTab(t.key)}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                    padding: '0 2px 11px',
                    fontSize: 15,
                    fontWeight: active ? 600 : 400,
                    color: active ? 'var(--ink-soft)' : 'var(--grey-600)',
                    borderBottom: active ? '2px solid var(--brand)' : '2px solid transparent',
                    marginBottom: -1,
                    transition: 'color 0.15s',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                  }}
                >
                  {t.label}
                  {/* 未读数：只在该分类开启时显示 */}
                  {settings[t.key] && unreadInCategory(t.key, readKeys, settings, items) > 0 && (
                    <span
                      style={{
                        minWidth: 16,
                        height: 16,
                        padding: '0 4px',
                        borderRadius: 8,
                        background: active ? 'var(--brand)' : 'var(--grey-75)',
                        color: active ? 'var(--surface)' : 'var(--grey-600)',
                        fontSize: 10.5,
                        fontWeight: 600,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {unreadInCategory(t.key, readKeys, settings, items)}
                    </span>
                  )}
                </button>
              )
            })}
          </div>

          <div style={{ flex: 1 }} />

          {/* 操作区：全部已读 + 通知设置（齿轮弹层） */}
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 4 }}>
            <button
              onClick={() => markAllRead(keysOfCategory(tab))}
              disabled={unread === 0}
              style={{
                background: 'none',
                border: 'none',
                cursor: unread === 0 ? 'default' : 'pointer',
                fontFamily: 'inherit',
                fontSize: 13,
                color: unread === 0 ? '#C8C8C8' : 'var(--brand)',
                padding: '0 6px 11px',
                transition: 'color 0.15s',
              }}
            >
              全部已读
            </button>
            <button
              onClick={() => setSettingsOpen(o => !o)}
              title="通知设置"
              aria-label="通知设置"
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '0 4px 11px',
                color: settingsOpen ? 'var(--brand)' : 'var(--grey-600)',
                display: 'flex',
                transition: 'color 0.15s',
              }}
            >
              <svg
                width="17"
                height="17"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
              >
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
              </svg>
            </button>

            {settingsOpen && (
              <>
                {/* 点空白处关闭 */}
                <div
                  onClick={() => setSettingsOpen(false)}
                  style={{ position: 'fixed', inset: 0, zIndex: 40 }}
                />
                <div
                  style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    zIndex: 41,
                    width: 296,
                    background: 'var(--surface)',
                    borderRadius: 14,
                    boxShadow: '0 8px 32px rgba(0,0,0,0.14)',
                    border: '1px solid var(--grey-75)',
                    padding: '14px 16px 6px',
                  }}
                >
                  <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink-soft)' }}>
                    通知设置
                  </div>
                  <div
                    style={{
                      fontSize: 12,
                      color: 'var(--grey-500)',
                      marginTop: 3,
                      lineHeight: 1.6,
                    }}
                  >
                    关掉的分类不会出现在这一页，也不再计入左栏角标。
                  </div>
                  <div style={{ marginTop: 10 }}>
                    {NOTIF_SETTINGS.map(s => (
                      <div
                        key={s.key}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 12,
                          padding: '10px 0',
                          borderTop: '1px solid var(--surface-sunken)',
                        }}
                      >
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 13.5, color: 'var(--ink-soft)' }}>{s.label}</div>
                          <div style={{ fontSize: 11.5, color: '#A0A0A0', marginTop: 2 }}>
                            {s.desc}
                          </div>
                        </div>
                        <Switch
                          on={settings[s.key]}
                          onToggle={() => toggleSetting(s.key)}
                          label={s.label}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* 列表 */}
        <div style={{ flex: 1, overflowY: 'auto' }}>
          <div style={{ maxWidth: 780, margin: '0 auto', padding: '6px 32px 40px' }}>
            {!categoryOn ? (
              <div style={{ padding: '60px 0 8px', textAlign: 'center' }}>
                <div style={{ fontSize: 14, color: 'var(--grey-500)' }}>
                  已关闭「{TABS.find(t => t.key === tab)?.label}」的通知提醒
                </div>
                <button
                  onClick={() => setSettingsOpen(true)}
                  style={{
                    marginTop: 12,
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                    fontSize: 13,
                    color: 'var(--brand)',
                  }}
                >
                  去开启
                </button>
              </div>
            ) : (
              list.map(item => (
                <NotifRow
                  key={item.id}
                  item={item}
                  unread={!isRead(item)}
                  onRead={() => markRead(tab, item.id)}
                />
              ))
            )}
            <div
              style={{
                textAlign: 'center',
                color: '#C0C0C0',
                fontSize: 12.5,
                letterSpacing: 0.6,
                padding: '26px 0 6px',
              }}
            >
              - THE END-
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  )
}
