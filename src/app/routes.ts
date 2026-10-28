/**
 * 全站路由表 —— **唯一**声明"有哪些页面"的地方。
 *
 * 以前加一个页面要改三处：App.tsx 的 lazy 声明 + PageName 联合类型 + 渲染分支；
 * 4 个人同时加页面就会在同一个文件里撞车。现在只有这一张表：
 *
 *   feed:  FeedPage,                                   // 首页同步加载（首屏）
 *   blog:  lazy(() => import('../pages/BlogPage')),    // 其余懒加载
 *
 * 加页面只需在这里加一行 + 建页面文件，然后挂入口（MainSidebar 或某个 navigate()），
 * 忘了挂入口会被 `pnpm routes` 拦下。
 */
import { lazy } from 'react'
import type { ComponentType } from 'react'

import FeedPage from '../pages/FeedPage'

/** 页面的 props 契约：所有页面都只吃这一个接口 */
export interface NavProps {
  navigate: (page: PageName, query?: string) => void
  currentPage: PageName
  searchQuery?: string
}

type PageComponent = ComponentType<NavProps>

export const ROUTES = {
  feed: FeedPage,
  detail: lazy(() => import('../pages/NoteDetailPage')),
  profile: lazy(() => import('../pages/ProfilePage')),
  userProfile: lazy(() => import('../pages/UserProfilePage')),
  publish: lazy(() => import('../pages/PublishPage')),
  search: lazy(() => import('../pages/SearchPage')),
  messages: lazy(() => import('../pages/MessagesPage')),
  notifications: lazy(() => import('../pages/NotificationPage')),
  login: lazy(() => import('../pages/LoginPage')),
  write: lazy(() => import('../pages/WriteThoughtsPage')),
  amos: lazy(() => import('../pages/AmosAIPage')),
  tutor: lazy(() => import('../pages/TeacherPage')),
  school: lazy(() => import('../pages/SchoolPage')),
  podcast: lazy(() => import('../pages/PodcastPage')),
  blog: lazy(() => import('../pages/BlogPage')),
  // 教师工作台（ClassIn 版式：工作台 / 排课 / 课程 / 学生 / 收入 / 资料）
  teacherHome: lazy(() => import('../pages/TeacherHomePage')),
  teacherCalendar: lazy(() => import('../pages/TeacherCalendarPage')),
  teacherCourses: lazy(() => import('../pages/TeacherCoursesPage')),
  teacherStudents: lazy(() => import('../pages/TeacherStudentsPage')),
  teacherEarnings: lazy(() => import('../pages/TeacherEarningsPage')),
  teacherProfile: lazy(() => import('../pages/TeacherProfilePage')),
  frankscie: lazy(() => import('../pages/FranksCiePage')),
  locker: lazy(() => import('../lockerfolio/LockerFolioPage')),
  forest: lazy(() => import('../forest/ForestPage')) as PageComponent,
} satisfies Record<string, PageComponent>

export type PageName = keyof typeof ROUTES

/** 路由 key 的稳定顺序（脚本、调试面板、动线梳理都用它） */
export const PAGE_KEYS = Object.keys(ROUTES) as PageName[]
