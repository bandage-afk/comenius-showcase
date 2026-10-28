import { beforeEach, describe, expect, it } from 'vitest'
import {
  unreadInCategory,
  unreadTotal,
  useNotifications,
  type NotifSettingKey,
} from './notificationStore'

const initial = useNotifications.getState()
const snapshot = () => useNotifications.getState()

beforeEach(() => {
  localStorage.clear()
  useNotifications.setState(initial, true)
})

describe('已读状态', () => {
  it('三个分类的条目 id 会重复，所以已读键必须带分类', () => {
    snapshot().markRead('comment', 1)
    expect(snapshot().isRead('comment', 1)).toBe(true)
    expect(snapshot().isRead('like', 1)).toBe(false)
  })

  it('重复标记同一条不会产生重复键', () => {
    snapshot().markRead('comment', 1)
    snapshot().markRead('comment', 1)
    expect(snapshot().readKeys.filter(k => k === 'comment:1')).toHaveLength(1)
  })

  it('全部标为已读：该分类未读归零，其它分类不受影响', () => {
    const keys = snapshot().keysOfCategory('like')
    expect(keys).toHaveLength(snapshot().items.like.length)

    snapshot().markAllRead(keys)
    const s = snapshot()
    expect(unreadInCategory('like', s.readKeys, s.settings, s.items)).toBe(0)
    expect(unreadInCategory('comment', s.readKeys, s.settings, s.items)).toBeGreaterThan(0)
  })
})

describe('通知设置', () => {
  it('关掉的分类：详情空态 + 左栏角标都不计入', () => {
    const before = unreadTotal(snapshot().readKeys, snapshot().settings, snapshot().items)
    snapshot().toggleSetting('comment')
    const s = snapshot()
    expect(unreadInCategory('comment', s.readKeys, s.settings, s.items)).toBe(0)
    expect(unreadTotal(s.readKeys, s.settings, s.items)).toBeLessThan(before)
  })

  it('四种开关（三类通知 + 私信提醒）都是 toggle', () => {
    const settings = snapshot().settings
    for (const key of Object.keys(settings) as NotifSettingKey[]) {
      const before = snapshot().settings[key]
      snapshot().toggleSetting(key)
      expect(snapshot().settings[key]).toBe(!before)
    }
  })
})

describe('持久化范围', () => {
  it('只落用户状态（readKeys / settings），不把通知条目写进本地数据', () => {
    snapshot().markRead('comment', 1)
    const raw = JSON.parse(localStorage.getItem('comenius_notifications') as string) as {
      state: Record<string, unknown>
    }
    expect(Object.keys(raw.state).sort()).toEqual(['readKeys', 'settings'])
  })
})
