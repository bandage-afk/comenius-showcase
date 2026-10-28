import { beforeEach, describe, expect, it } from 'vitest'
import { adminApi, useAdminStore } from '../../adminStore'
const initial = useAdminStore.getState()
beforeEach(() => {
  useAdminStore.setState(initial, true)
  useAdminStore.getState().login('admin@comenius.cn', 'admin123')
})
describe('isolated admin moderation', () => {
  it('approves a teacher and records the role change exactly once', () => {
    const app = initial.applications[0]
    useAdminStore.getState().reviewTeacher(app.id, true, '')
    expect(useAdminStore.getState().users.find(u => u.id === app.userId)?.role).toBe('teacher')
    expect(useAdminStore.getState().applications[0].status).toBe('approved')
    expect(useAdminStore.getState().logs).toHaveLength(initial.logs.length + 1)
    expect(() => useAdminStore.getState().reviewTeacher(app.id, true, '')).toThrow()
    expect(useAdminStore.getState().logs).toHaveLength(initial.logs.length + 1)
  })
  it('requires rejection reasons and retains pending state on failure', () => {
    expect(() => useAdminStore.getState().reviewPost('p1', false, ' ')).toThrow()
    expect(useAdminStore.getState().posts[0].status).toBe('pending')
    useAdminStore.getState().reviewPost('p1', false, '缺少出处')
    expect(useAdminStore.getState().posts[0].status).toBe('rejected')
  })
  it('validates mute duration and clears expiry when unbanned', () => {
    expect(() => useAdminStore.getState().setUserStatus('u1', 'muted', '广告', 0)).toThrow()
    expect(() => useAdminStore.getState().setUserStatus('u1', 'muted', '广告', 1.5)).toThrow()
    useAdminStore.getState().setUserStatus('u1', 'muted', '广告', 7)
    expect(Date.parse(useAdminStore.getState().users[0].mutedUntil!)).toBeGreaterThan(Date.now())
    useAdminStore.getState().setUserStatus('u1', 'active', '申诉通过')
    expect(useAdminStore.getState().users[0].mutedUntil).toBeUndefined()
  })
  it('removes the reported post and audits the violation', () => {
    useAdminStore.getState().resolveReport('r2', 'removed', '抄袭属实')
    expect(useAdminStore.getState().posts.find(p => p.id === 'p6')?.status).toBe('removed')
    expect(useAdminStore.getState().reports[1].status).toBe('removed')
    expect(useAdminStore.getState().logs[0].violation).toBe(true)
  })
  it('punishes the reported comment author without touching other users', () => {
    useAdminStore.getState().resolveReport('r1', 'punished', '人身攻击')
    expect(
      useAdminStore.getState().users.find(u => u.id === initial.reports[0].authorId)?.status,
    ).toBe('muted')
    expect(useAdminStore.getState().users[0]).toEqual(initial.users[0])
  })
  it('resolves reset requests and prevents duplicate processing', () => {
    useAdminStore.getState().resolvePasswordReset('u3', true)
    expect(useAdminStore.getState().users[2].resetRequested).toBe(false)
    expect(() => useAdminStore.getState().resolvePasswordReset('u3', true)).toThrow()
  })
  it('saves settings independently and reports disconnected API stubs', async () => {
    useAdminStore.getState().saveSettings({ preModeration: false, notifyReports: true })
    expect(useAdminStore.getState().settings.preModeration).toBe(false)
    await expect(adminApi.fetchTeacherApplications()).rejects.toThrow('尚未接入 Strapi')
  })
})
