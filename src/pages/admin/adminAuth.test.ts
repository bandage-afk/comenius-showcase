import { beforeEach, describe, expect, it } from 'vitest'
import {
  ADMIN_TEST_ACCOUNTS,
  adminRouteDecision,
  canAccessAdminPath,
  useAdminStore,
} from '../../adminStore'
const initial = useAdminStore.getState()
beforeEach(() => {
  useAdminStore.setState({ ...initial, auth: null }, true)
})
const paths = [
  '/admin',
  '/admin/users',
  '/admin/approvals',
  '/admin/content',
  '/admin/reports',
  '/admin/logs',
  '/admin/settings',
]
describe('admin authentication and role guards', () => {
  it('redirects every protected URL to login when logged out', () => {
    for (const path of [...paths, '/admin/missing'])
      expect(adminRouteDecision(null, path)).toBe('login')
    expect(() => useAdminStore.getState().reviewTeacher('t1', true, '')).toThrow('暂无权限')
  })
  it('rejects incorrect credentials without creating a session', () => {
    expect(() => useAdminStore.getState().login('admin@comenius.cn', 'wrong')).toThrow(
      '账号或密码错误',
    )
    expect(useAdminStore.getState().auth).toBeNull()
  })
  for (const account of ADMIN_TEST_ACCOUNTS) {
    it(`enforces the exact permission matrix for ${account.role}`, () => {
      useAdminStore.getState().login(account.email, account.password)
      const auth = useAdminStore.getState().auth!
      expect(auth.role).toBe(account.role)
      expect(auth.token).toMatch(/^mock-admin-/)
      expect(auth).not.toHaveProperty('password')
      const allowed =
        account.role === 'super_admin'
          ? paths
          : account.role === 'teacher_approver'
            ? ['/admin/approvals']
            : ['/admin/content', '/admin/reports']
      for (const path of paths) {
        expect(canAccessAdminPath(auth, path)).toBe(allowed.includes(path))
        expect(adminRouteDecision(auth, path)).toBe(allowed.includes(path) ? 'allow' : 'forbidden')
      }
      expect(canAccessAdminPath(auth, '/admin/settings-other')).toBe(false)
    })
  }
  it('allows teacher reviews, attributes logs, and rejects content/settings/user mutations', () => {
    useAdminStore.getState().login('teacher_admin@comenius.cn', 'approver123')
    useAdminStore.getState().reviewTeacher('t1', true, '')
    expect(useAdminStore.getState().logs[0].operator).toBe('林审批员 · 教师审批员')
    const state = useAdminStore.getState()
    expect(() => state.reviewPost('p1', true, '')).toThrow('暂无权限')
    expect(() => state.resolveReport('r1', 'ignored', '原因')).toThrow('暂无权限')
    expect(() => state.setUserStatus('u1', 'banned', '原因')).toThrow('暂无权限')
    expect(() => state.resolvePasswordReset('u3', true)).toThrow('暂无权限')
    expect(() => state.saveSettings({ preModeration: false, notifyReports: false })).toThrow(
      '暂无权限',
    )
    expect(useAdminStore.getState()).toBe(state)
  })
  it('allows content and report review but denies teacher review', () => {
    useAdminStore.getState().login('content_admin@comenius.cn', 'moderator123')
    useAdminStore.getState().reviewPost('p1', true, '')
    useAdminStore.getState().resolveReport('r1', 'punished', '违规')
    expect(useAdminStore.getState().logs[0].operator).toBe('周审核员 · 内容审核员')
    expect(() => useAdminStore.getState().reviewTeacher('t1', true, '')).toThrow('暂无权限')
  })
  it('restores a persisted session on refresh and persists logout without losing business data', async () => {
    useAdminStore.getState().login('admin@comenius.cn', 'admin123')
    const session = useAdminStore.getState().auth
    await useAdminStore.persist.rehydrate()
    expect(useAdminStore.getState().auth).toEqual(session)
    useAdminStore.getState().logout()
    await useAdminStore.persist.rehydrate()
    expect(useAdminStore.getState().auth).toBeNull()
    expect(useAdminStore.getState().users).toEqual(initial.users)
    for (const path of paths)
      expect(adminRouteDecision(useAdminStore.getState().auth, path)).toBe('login')
  })
  it('treats pre-auth caches and malformed sessions as logged out', async () => {
    for (const auth of [undefined, {}, { token: 'fake', role: 'super_admin' }]) {
      localStorage.setItem(
        'comenius-admin-mock-v1',
        JSON.stringify({ state: { auth, users: initial.users }, version: 1 }),
      )
      await useAdminStore.persist.rehydrate()
      expect(useAdminStore.getState().auth).toBeNull()
    }
  })
})
