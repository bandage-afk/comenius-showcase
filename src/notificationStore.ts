import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import type { Notif, NotifCategory } from './notificationData'
import { storage } from './repositories/localStore'
import * as notifsRepo from './repositories/notificationsRepo'

/** 通知设置项：三类通知 + 私信提醒 */
export type NotifSettingKey = NotifCategory | 'message'

export const NOTIF_SETTINGS: { key: NotifSettingKey; label: string; desc: string }[] = [
  { key: 'comment', label: '评论和 @', desc: '有人评论你的笔记或在评论里 @ 你' },
  { key: 'like', label: '赞和收藏', desc: '有人点赞或收藏你的笔记' },
  { key: 'follow', label: '新增关注', desc: '有人关注了你' },
  { key: 'message', label: '私信提醒', desc: '关闭后左栏不再显示新私信角标' },
]

const ALL_ON: Record<NotifSettingKey, boolean> = {
  comment: true,
  like: true,
  follow: true,
  message: true,
}

interface NotificationState {
  /** 通知条目（只读目录，来自 notificationsRepo，不落盘） */
  items: Record<NotifCategory, Notif[]>
  /** 已读通知：键是 `分类:id`（三个分类各自从 1 编号，只存 id 会串） */
  readKeys: string[]
  settings: Record<NotifSettingKey, boolean>
  markRead: (category: NotifCategory, id: number) => void
  markAllRead: (keys: string[]) => void
  isRead: (category: NotifCategory, id: number) => boolean
  /** 某个分类全部条目的已读键（「全部标为已读」用） */
  keysOfCategory: (category: NotifCategory) => string[]
  toggleSetting: (key: NotifSettingKey) => void
}

/** 落盘的那部分：只有「用户自己的状态」，条目是只读目录 */
type PersistedNotif = Pick<NotificationState, 'readKeys' | 'settings'>

/**
 * 通知的已读状态与通知设置（持久化在 localStorage）。
 * 通知条目本身来自 repository（现在是 mock），只有「读没读过」和「开关」是用户状态，
 * 所以 partialize 里只落这两个，不把通知列表写进老用户的本地数据。
 */
export const useNotifications = create<NotificationState>()(
  persist(
    (set, get) => ({
      items: notifsRepo.listByCategory(),
      readKeys: [],
      settings: { ...ALL_ON },
      markRead: (category, id) =>
        set(s => {
          const k = notifsRepo.keyOf(category, id)
          return s.readKeys.includes(k) ? s : { readKeys: [...s.readKeys, k] }
        }),
      markAllRead: keys => set(s => ({ readKeys: [...new Set([...s.readKeys, ...keys])] })),
      isRead: (category, id) => get().readKeys.includes(notifsRepo.keyOf(category, id)),
      keysOfCategory: category =>
        (get().items[category] ?? []).map(n => notifsRepo.keyOf(category, n.id)),
      toggleSetting: key => set(s => ({ settings: { ...s.settings, [key]: !s.settings[key] } })),
    }),
    {
      name: 'comenius_notifications',
      version: 1,
      // 落盘走 repositories/localStore（全仓唯一碰 localStorage 的地方，见 ADR-0006）
      storage: createJSONStorage(() => storage),
      partialize: s => ({ readKeys: s.readKeys, settings: s.settings }),
      // 老用户的本地数据里可能没有 readKeys / settings（或以后新增了分类），
      // 这里统一兜底成「全部已读键为空 + 设置全开」，避免读出 undefined 后崩在 settings[tab]。
      migrate: (persisted: unknown, version: number): PersistedNotif => {
        const p = (persisted ?? {}) as Partial<PersistedNotif>
        if (version >= 1) {
          return {
            readKeys: p.readKeys ?? [],
            settings: { ...ALL_ON, ...p.settings },
          }
        }
        return { readKeys: [], settings: { ...ALL_ON } }
      },
    },
  ),
)

/** 某个分类当前未读数（该分类被关掉时算 0） */
export function unreadInCategory(
  category: NotifCategory,
  readKeys: string[],
  settings: Record<NotifSettingKey, boolean>,
  items: Record<NotifCategory, Notif[]>,
): number {
  if (!settings[category]) return 0
  return (items[category] ?? []).filter(n => !readKeys.includes(notifsRepo.keyOf(category, n.id)))
    .length
}

/** 全部未读数（左栏角标用；被关掉的分类不计入） */
export function unreadTotal(
  readKeys: string[],
  settings: Record<NotifSettingKey, boolean>,
  items: Record<NotifCategory, Notif[]>,
): number {
  return (Object.keys(items) as NotifCategory[]).reduce(
    (sum, c) => sum + unreadInCategory(c, readKeys, settings, items),
    0,
  )
}
