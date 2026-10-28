import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

export type AdminRole = 'super_admin' | 'teacher_approver' | 'content_moderator'
export interface AdminSession {
  token: string
  role: AdminRole
  name: string
  email: string
}
export const adminRoleLabels: Record<AdminRole, string> = {
  super_admin: '超级管理员',
  teacher_approver: '教师审批员',
  content_moderator: '内容审核员',
}
/** 仅本地演示用。生产环境移除内置账号，由服务端验证密码和签发会话。 */
export const ADMIN_TEST_ACCOUNTS = [
  { email: 'admin@comenius.cn', password: 'admin123', name: '陈管理员', role: 'super_admin' },
  {
    email: 'teacher_admin@comenius.cn',
    password: 'approver123',
    name: '林审批员',
    role: 'teacher_approver',
  },
  {
    email: 'content_admin@comenius.cn',
    password: 'moderator123',
    name: '周审核员',
    role: 'content_moderator',
  },
] as const
const rolePaths: Record<AdminRole, readonly string[]> = {
  super_admin: [
    '/admin',
    '/admin/users',
    '/admin/approvals',
    '/admin/content',
    '/admin/reports',
    '/admin/logs',
    '/admin/settings',
  ],
  teacher_approver: ['/admin/approvals'],
  content_moderator: ['/admin/content', '/admin/reports'],
}
export function canAccessAdminPath(session: AdminSession | null, path: string): boolean {
  return !!session?.token && (rolePaths[session.role]?.includes(path.replace(/\/+$/, '')) ?? false)
}
export function adminHomePath(session: AdminSession): string {
  return rolePaths[session.role]?.[0] ?? '/admin/login'
}
export function adminRouteDecision(session: AdminSession | null, path: string) {
  if (!session?.token) return 'login'
  return canAccessAdminPath(session, path) ? 'allow' : 'forbidden'
}
function requirePermission(state: AdminState, path: string) {
  if (!canAccessAdminPath(state.auth, path)) throw new Error('暂无权限执行此操作')
}
/** 防止旧缓存/残缺会话被当作登录成功；这不是服务端 Token 验签。 */
function restoreSession(value: unknown): AdminSession | null {
  if (!value || typeof value !== 'object') return null
  const session = value as AdminSession
  const account = ADMIN_TEST_ACCOUNTS.find(
    a => a.email === session.email && a.role === session.role,
  )
  return account &&
    typeof session.token === 'string' &&
    /^mock-admin-[a-f0-9-]{36}$/.test(session.token)
    ? { token: session.token, role: account.role, name: account.name, email: account.email }
    : null
}

export type Role = 'student' | 'teacher' | 'member'
export interface User {
  id: string
  name: string
  email: string
  role: Role
  status: 'active' | 'muted' | 'banned'
  joinedAt: string
  bio: string
  posts: number
  mutedUntil?: string
  resetRequested: boolean
}
export interface TeacherApplication {
  id: string
  userId: string
  name: string
  subject: string
  institution: string
  experience: string
  resume: string
  qualification: string
  submittedAt: string
  status: 'pending' | 'approved' | 'rejected'
  reason?: string
}
export interface PostApproval {
  id: string
  authorId: string
  author: string
  title: string
  content: string
  category: string
  submittedAt: string
  status: 'pending' | 'approved' | 'rejected' | 'removed'
  views: number
  likes: number
  reason?: string
}
export interface ReportItem {
  id: string
  type: 'post' | 'comment'
  targetId: string
  authorId: string
  author: string
  reporter: string
  content: string
  reason: string
  submittedAt: string
  status: 'pending' | 'ignored' | 'removed' | 'punished'
  resolution?: string
}
export interface AuditLog {
  id: string
  operator: string
  time: string
  action: string
  target: string
  detail: string
  violation: boolean
}
export interface AdminSettings {
  preModeration: boolean
  notifyReports: boolean
}
const date = (days = 0) => new Date(Date.now() - days * 86400000).toISOString()
const names = [
  '林知夏',
  '陈予安',
  '周以宁',
  '许星遥',
  '王思齐',
  '陆景行',
  '沈书禾',
  '赵一帆',
  '苏沐晴',
  '李明远',
  '何嘉言',
  '张若溪',
]
const titles = [
  '我的 A-Level 数学复习路线图',
  '在剑桥读书，是一种怎样的体验？',
  '物理实验里的那些小惊喜',
  '给准留学生的行前清单',
  '如何写出有个人风格的申请文书',
  '一起读书：九月阅读分享',
  '经济学笔记：理解机会成本',
  '雅思口语练习搭子招募',
  '第一次参加模拟联合国',
  '这份化学思维导图请收好',
]
const users: User[] = names.map((name, i) => ({
  id: `u${i + 1}`,
  name,
  email: `member${i + 1}@example.com`,
  role: i < 7 ? 'student' : i < 10 ? 'teacher' : 'member',
  status: i === 4 ? 'muted' : i === 10 ? 'banned' : 'active',
  joinedAt: date(30 + i * 11),
  bio: i < 7 ? '正在探索自己的学习路径，喜欢分享学习笔记。' : '让知识在交流中生长。',
  posts: 12 + i * 7,
  mutedUntil: i === 4 ? new Date(Date.now() + 86400000 * 3).toISOString() : undefined,
  resetRequested: i === 2 || i === 7,
}))
const applications: TeacherApplication[] = [0, 1, 2, 3].map(i => ({
  id: `t${i + 1}`,
  userId: users[i].id,
  name: names[i],
  subject: ['数学 · A-Level', '英语 · IELTS', '物理 · IGCSE', '经济学 · AP'][i],
  institution: ['伦敦大学学院', '香港中文大学', '浙江大学', '复旦大学'][i],
  experience: `${3 + i} 年教学经验`,
  resume:
    '教育背景：相关专业硕士。曾负责国际课程教学与学生升学辅导，擅长通过案例和探究式学习帮助学生理解知识。\n教学计划：每周发布课程笔记，并组织开放答疑。',
  qualification: `模拟资质摘要：教师资格证（编号 MOCK-2026-00${i + 1}）；硕士学位证明；教学经历说明。此处为演示材料，尚未连接真实附件。`,
  submittedAt: date(i),
  status: 'pending',
}))
const posts: PostApproval[] = titles.map((title, i) => ({
  id: `p${i + 1}`,
  authorId: users[i].id,
  author: names[i],
  title,
  content: `${title}\n\n这段时间，我整理了自己的学习方法和实践经验。先明确目标，再把大任务拆成每周可以完成的小步骤，最后通过复盘调整节奏。\n\n欢迎大家分享不同的思路，也希望这些笔记能给正在准备的同学一些帮助。`,
  category: ['学习笔记', '校园生活', '经验分享'][i % 3],
  submittedAt: date(i < 4 ? 0 : i - 3),
  status: i < 4 ? 'pending' : 'approved',
  views: 2860 - i * 197,
  likes: 386 - i * 27,
}))
const reports: ReportItem[] = [0, 1, 2].map(i => ({
  id: `r${i + 1}`,
  type: i === 1 ? 'post' : 'comment',
  targetId: i === 1 ? 'p6' : `c${i + 1}`,
  authorId: users[i + 5].id,
  author: names[i + 5],
  reporter: names[i + 2],
  content: [
    '你根本不懂这个问题，不要再发这种内容了。',
    posts[5].content,
    '加我领取课程资料，付费即可获得完整答案。',
  ][i],
  reason: ['不友善言论 / 人身攻击', '涉嫌内容抄袭', '垃圾广告 / 违规引流'][i],
  submittedAt: date(),
  status: 'pending',
}))
interface AdminState {
  auth: AdminSession | null
  login: (email: string, password: string) => void
  logout: () => void
  users: User[]
  applications: TeacherApplication[]
  posts: PostApproval[]
  reports: ReportItem[]
  logs: AuditLog[]
  settings: AdminSettings
  setUserStatus: (id: string, status: User['status'], reason: string, days?: number) => void
  resolvePasswordReset: (id: string, approved: boolean) => void
  reviewTeacher: (id: string, approved: boolean, reason: string) => void
  reviewPost: (id: string, approved: boolean, reason: string) => void
  resolveReport: (
    id: string,
    action: Exclude<ReportItem['status'], 'pending'>,
    reason: string,
  ) => void
  saveSettings: (settings: AdminSettings) => void
}
const log = (action: string, target: string, detail: string, violation = false): AuditLog => ({
  id: globalThis.crypto.randomUUID(),
  operator: '管理员 · 陈',
  time: date(),
  action,
  target,
  detail,
  violation,
})
const audit = (state: AdminState, ...args: Parameters<typeof log>): AuditLog => ({
  ...log(...args),
  operator: state.auth ? `${state.auth.name} · ${adminRoleLabels[state.auth.role]}` : '未登录',
})
export const useAdminStore = create<AdminState>()(
  persist(
    set => ({
      auth: null,
      login: (email, password) => {
        const account = ADMIN_TEST_ACCOUNTS.find(
          a => a.email === email.trim().toLowerCase() && a.password === password,
        )
        if (!account) throw new Error('账号或密码错误，请重试')
        set({
          auth: {
            token: `mock-admin-${globalThis.crypto.randomUUID()}`,
            role: account.role,
            name: account.name,
            email: account.email,
          },
        })
      },
      logout: () => set({ auth: null }),
      users,
      applications,
      posts,
      reports,
      logs: [
        log('通过帖子', '这份化学思维导图请收好', '内容符合社区规范'),
        log('禁言用户', '王思齐', '重复发布广告，禁言 3 天', true),
      ],
      settings: { preModeration: true, notifyReports: true },
      setUserStatus: (id, status, reason, days) =>
        set(s => {
          requirePermission(s, '/admin/users')
          const user = s.users.find(u => u.id === id)
          if (!user) throw new Error('用户不存在')
          if (!reason.trim()) throw new Error('请填写操作原因')
          if (status === 'muted' && (!days || !Number.isInteger(days) || days < 1 || days > 365))
            throw new Error('禁言天数必须是 1–365 的整数')
          return {
            users: s.users.map(u =>
              u.id === id
                ? {
                    ...u,
                    status,
                    mutedUntil:
                      status === 'muted'
                        ? new Date(Date.now() + days! * 86400000).toISOString()
                        : undefined,
                  }
                : u,
            ),
            logs: [
              audit(
                s,
                status === 'active' ? '解除限制' : status === 'muted' ? '禁言用户' : '封禁用户',
                user.name,
                `${reason}${status === 'muted' ? `（${days} 天）` : ''}`,
                status !== 'active',
              ),
              ...s.logs,
            ],
          }
        }),
      resolvePasswordReset: (id, approved) =>
        set(s => {
          requirePermission(s, '/admin/users')
          const user = s.users.find(u => u.id === id && u.resetRequested)
          if (!user) throw new Error('申请已处理或不存在')
          return {
            users: s.users.map(u => (u.id === id ? { ...u, resetRequested: false } : u)),
            logs: [
              audit(
                s,
                approved ? '批准重置申请' : '拒绝重置申请',
                user.name,
                'Mock：仅记录申请处理结果，未修改密码或发送邮件',
              ),
              ...s.logs,
            ],
          }
        }),
      reviewTeacher: (id, approved, reason) =>
        set(s => {
          requirePermission(s, '/admin/approvals')
          const item = s.applications.find(a => a.id === id && a.status === 'pending')
          if (!item) throw new Error('申请已处理或不存在')
          if (!approved && !reason.trim()) throw new Error('拒绝时请填写原因')
          return {
            applications: s.applications.map(a =>
              a.id === id ? { ...a, status: approved ? 'approved' : 'rejected', reason } : a,
            ),
            users: s.users.map(u =>
              approved && u.id === item.userId ? { ...u, role: 'teacher' } : u,
            ),
            logs: [
              audit(
                s,
                approved ? '通过教师入驻' : '拒绝教师入驻',
                item.name,
                reason || '资格审核通过',
              ),
              ...s.logs,
            ],
          }
        }),
      reviewPost: (id, approved, reason) =>
        set(s => {
          requirePermission(s, '/admin/content')
          const item = s.posts.find(p => p.id === id && p.status === 'pending')
          if (!item) throw new Error('帖子已处理或不存在')
          if (!approved && !reason.trim()) throw new Error('驳回时请填写原因')
          return {
            posts: s.posts.map(p =>
              p.id === id ? { ...p, status: approved ? 'approved' : 'rejected', reason } : p,
            ),
            logs: [
              audit(
                s,
                approved ? '通过帖子' : '驳回帖子',
                item.title,
                reason || '内容符合社区规范',
              ),
              ...s.logs,
            ],
          }
        }),
      resolveReport: (id, action, reason) =>
        set(s => {
          requirePermission(s, '/admin/reports')
          const item = s.reports.find(r => r.id === id && r.status === 'pending')
          if (!item) throw new Error('举报已处理或不存在')
          if (!reason.trim()) throw new Error('请填写处理依据')
          return {
            reports: s.reports.map(r =>
              r.id === id ? { ...r, status: action, resolution: reason } : r,
            ),
            posts: s.posts.map(p =>
              item.type === 'post' && p.id === item.targetId && action === 'removed'
                ? { ...p, status: 'removed' }
                : p,
            ),
            users: s.users.map(u =>
              u.id === item.authorId && action === 'punished'
                ? {
                    ...u,
                    status: 'muted',
                    mutedUntil: new Date(Date.now() + 7 * 86400000).toISOString(),
                  }
                : u,
            ),
            logs: [
              audit(
                s,
                { ignored: '忽略举报', removed: '下架内容', punished: '惩罚作者' }[action],
                `${item.author} · ${item.targetId}`,
                reason + (action === 'punished' ? '（禁言 7 天）' : ''),
                action !== 'ignored',
              ),
              ...s.logs,
            ],
          }
        }),
      saveSettings: settings =>
        set(s => {
          requirePermission(s, '/admin/settings')
          return {
            settings,
            logs: [audit(s, '更新系统设置', '审核与通知', JSON.stringify(settings)), ...s.logs],
          }
        }),
    }),
    {
      name: 'comenius-admin-mock-v1',
      storage: createJSONStorage(() => localStorage),
      version: 1,
      // 保持原有业务数据；旧缓存没有 auth 时默认为未登录。密码不进入 Store。
      merge: (persisted, current) => {
        const stored = (persisted ?? {}) as Partial<AdminState>
        return { ...current, ...stored, auth: restoreSession(stored.auth) }
      },
    },
  ),
)

/** Strapi REST 接入边界。当前只提供异步桩，不发送网络请求，避免误报保存成功。
 * 后续配置服务地址与认证；使用服务端授权，禁止将管理员 API Token 嵌入前端。
 * Strapi 5 使用 documentId 替代数值 id；通过适配层映射为以上领域类型。
 * GET 需处理 pagination、filters、populate 及 {data, meta}；PUT body 通常为 {data: payload}。
 * 角色修改、惩罚、密码重置和审计记录应由服务端校验并在事务中完成；失败时保留旧状态。
 */
async function pendingApi<T>(endpoint: string): Promise<T> {
  throw new Error(`尚未接入 Strapi：${endpoint}`)
}
export const adminApi = {
  fetchUsers: () => pendingApi<User[]>('GET /api/users?populate=role'),
  fetchTeacherApplications: () => pendingApi<TeacherApplication[]>('GET /api/teacher-applications'),
  fetchPosts: () =>
    pendingApi<PostApproval[]>('GET /api/posts?filters[moderationStatus][$eq]=pending'),
  fetchReports: () => pendingApi<ReportItem[]>('GET /api/reports?populate=*'),
  fetchAuditLogs: () => pendingApi<AuditLog[]>('GET /api/audit-logs?sort=createdAt:desc'),
  updateUser: (id: string, payload: Partial<User>) => {
    void payload
    return pendingApi<User>(`PUT /api/users/${encodeURIComponent(id)}`)
  },
  reviewTeacher: (id: string, payload: Partial<TeacherApplication>) => {
    void payload
    return pendingApi<TeacherApplication>(`PUT /api/teacher-applications/${encodeURIComponent(id)}`)
  },
  updatePost: (id: string, payload: Partial<PostApproval>) => {
    void payload
    return pendingApi<PostApproval>(`PUT /api/posts/${encodeURIComponent(id)}`)
  },
  // 自定义服务端路由：在同一事务内完成举报处理、内容下架/作者惩罚和审计写入。
  resolveReport: (id: string, action: ReportItem['status'], reason: string) => {
    void action
    void reason
    return pendingApi<ReportItem>(`POST /api/admin/reports/${encodeURIComponent(id)}/resolve`)
  },
  // 自定义路由：批准后由服务端生成一次性重置链接并发送邮件，不返回明文密码。
  resolvePasswordReset: (id: string, approved: boolean) => {
    void approved
    return pendingApi<void>(
      `POST /api/admin/password-reset-requests/${encodeURIComponent(id)}/resolve`,
    )
  },
  saveSettings: (payload: AdminSettings) => {
    void payload
    return pendingApi<AdminSettings>('PUT /api/admin-setting')
  },
}
