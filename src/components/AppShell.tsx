import type { ReactNode } from 'react'
import MainSidebar from './MainSidebar'
import type { NavProps } from '../App'

const FONT = "'Noto Sans SC', 'PingFang SC', system-ui, sans-serif"

interface AppShellProps {
  children: ReactNode
  navigate: NavProps['navigate']
  currentPage: NavProps['currentPage']
  /**
   * 应用型页面（消息 / 通知 / Amos AI 这类自己管滚动的页面）：
   * 内容区撑满视口、禁掉外层滚动，侧栏不带分隔线。
   */
  fullHeight?: boolean
  /** 外层与内容区背景色（默认白色 --surface） */
  background?: string
  /** 内容区单独指定背景（如灰底 #F7F7F8） */
  contentBackground?: string
  /** 页面级文字色 */
  color?: string
  /**
   * 内容区的布局方式：
   *   block  —— 默认，内容区就是一个普通的块级容器（单栏页面）
   *   row    —— 内容区是横向 flex（消息页：会话列表 + 聊天区并排；Amos AI：抽屉 + 主区）
   *   column —— 内容区是纵向 flex（通知页这类自己管滚动的一栏）
   */
  contentLayout?: 'block' | 'row' | 'column'
}

/**
 * 全站统一页面外壳：左侧栏 + 内容区。
 *
 * 以前 14 个页面各自手写一遍「外层 div + flex + MainSidebar + 内容 div」，
 * 改导航/改间距要改十几处；现在只保留这一份。
 *
 *   <AppShell navigate={navigate} currentPage={currentPage}>…</AppShell>
 *   <AppShell fullHeight navigate={navigate} currentPage={currentPage}>…</AppShell>   // 消息/通知/AI
 */
export default function AppShell({
  children,
  navigate,
  currentPage,
  fullHeight = false,
  background = 'var(--surface)',
  contentBackground,
  color,
  contentLayout = 'block',
}: AppShellProps) {
  const outer: React.CSSProperties = {
    minHeight: fullHeight ? undefined : '100vh',
    height: fullHeight ? '100vh' : undefined,
    background,
    fontFamily: FONT,
    color,
    overflow: fullHeight ? 'hidden' : undefined,
  }
  const inner: React.CSSProperties = {
    display: 'flex',
    minHeight: fullHeight ? undefined : '100vh',
    height: fullHeight ? '100vh' : undefined,
  }
  return (
    <div style={outer}>
      <div style={inner}>
        <MainSidebar
          navigate={navigate}
          currentPage={currentPage}
          stickyTop={fullHeight ? undefined : 0}
          noBorder={fullHeight}
        />
        {/* 内容区布局由 contentLayout 决定：单栏页面用 block，多栏并排用 row（消息/AI），自己管滚动的单栏用 column（通知） */}
        <div
          style={{
            flex: 1,
            minWidth: 0,
            display: contentLayout === 'block' ? undefined : 'flex',
            flexDirection:
              contentLayout === 'column' ? 'column' : contentLayout === 'row' ? 'row' : undefined,
            background: contentBackground ?? background,
          }}
        >
          {children}
        </div>
      </div>
    </div>
  )
}
