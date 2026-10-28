import AppShell from '../components/AppShell'
import TeacherApp from '../teacher/TeacherApp'
import type { NavProps } from '../App'

/**
 * 教师功能：整体换成「领英」那套页面（来自 LinkedIn Profile Website 这个 Figma zip）。
 * 外层仍然是站内的左栏，内部保留领英自己的顶栏（Home / My Network / Jobs / Messaging / Notifications / Me）。
 * 代码在 src/teacher/（types.ts / data.ts / TeacherApp.tsx），改动集中在那一层。
 */
export default function TeacherPage({ navigate, currentPage }: NavProps) {
  return (
    <AppShell navigate={navigate} currentPage={currentPage} background="var(--linkedin-bg)">
      <TeacherApp navigate={navigate} />
    </AppShell>
  )
}
