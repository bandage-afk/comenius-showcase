import { useState } from 'react'
import type { ReactNode } from 'react'
import type { NavProps } from '../App'
import { useCommunity } from '../communityStore'
import { unreadTotal, useNotifications } from '../notificationStore'
import { useProfile, type Role } from '../profileStore'

export const COLLAPSED_W = 64
export const EXPANDED_W = 236

interface SideNavItemProps {
  icon: ReactNode
  label: string
  active?: boolean
  onClick?: () => void
  badge?: number
  expanded: boolean
}

function SideNavItem({ icon, label, active, onClick, badge, expanded }: SideNavItemProps) {
  return (
    <button
      onClick={onClick}
      title={!expanded ? label : undefined}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: expanded ? 14 : 0,
        justifyContent: expanded ? 'flex-start' : 'center',
        width: '100%',
        padding: expanded ? '13px 16px' : '13px 0',
        background: active ? 'var(--grey-50)' : 'transparent',
        border: 'none',
        borderRadius: 10,
        cursor: 'pointer',
        fontSize: 16,
        color: active ? '#111' : 'var(--grey-800)',
        fontFamily: 'inherit',
        fontWeight: active ? 600 : 400,
        transition: 'background 0.15s',
        marginBottom: 5,
        position: 'relative',
        flexShrink: 0,
      }}
      onMouseEnter={e => !active && (e.currentTarget.style.background = '#F8F8F8')}
      onMouseLeave={e => !active && (e.currentTarget.style.background = 'transparent')}
    >
      <span style={{ flexShrink: 0 }}>{icon}</span>
      {expanded && <span style={{ whiteSpace: 'nowrap', overflow: 'hidden' }}>{label}</span>}
      {badge && (
        <span
          style={{
            position: 'absolute',
            left: expanded ? 30 : 34,
            top: 10,
            width: 17,
            height: 17,
            background: 'var(--brand)',
            borderRadius: 999,
            color: 'var(--surface)',
            fontSize: 10,
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {badge}
        </span>
      )}
    </button>
  )
}

export default function MainSidebar({
  navigate,
  currentPage,
  noBorder,
  stickyTop,
}: NavProps & { noBorder?: boolean; stickyTop?: number }) {
  const [expanded, setExpanded] = useState(false)
  const role = useProfile(s => s.profile.role)
  const patchProfile = useProfile(s => s.patch)
  const isTeacher = role === 'teacher'
  const unreadMsg = useCommunity(s => s.conversations.reduce((n, c) => n + c.unread, 0))
  const readNotifKeys = useNotifications(s => s.readKeys)
  const notifSettings = useNotifications(s => s.settings)
  const notifItems = useNotifications(s => s.items)
  // 「私信提醒」关掉后不再显示新私信角标（通知设置里的开关）
  const showMsgBadge = notifSettings.message
  const unreadNotif = unreadTotal(readNotifKeys, notifSettings, notifItems)
  return (
    <div
      onMouseEnter={() => setExpanded(true)}
      onMouseLeave={() => setExpanded(false)}
      style={{
        width: expanded ? EXPANDED_W : COLLAPSED_W,
        flexShrink: 0,
        alignSelf: stickyTop !== undefined ? 'flex-start' : 'stretch',
        position: stickyTop !== undefined ? 'sticky' : 'static',
        top: stickyTop ?? 0,
        height: stickyTop !== undefined ? `calc(100vh - ${stickyTop}px)` : undefined,
        background: '#F7F7F8',
        borderRight: noBorder ? 'none' : '1px solid #EBEBEB',
        display: 'flex',
        flexDirection: 'column',
        padding: expanded ? '12px 12px 0' : '12px 6px 0',
        transition: 'width 0.22s ease, padding 0.22s ease',
        overflow: 'hidden',
        zIndex: 205,
      }}
    >
      {/* ── 学生 / 家长导航（教师账号不显示这组）── */}
      {!isTeacher && (
        <>
          <SideNavItem
            expanded={expanded}
            active={currentPage === 'feed'}
            label="首页"
            onClick={() => navigate('feed')}
            icon={
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
              >
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
              </svg>
            }
          />
          <SideNavItem
            expanded={expanded}
            active={currentPage === 'amos'}
            label="Amos AI"
            onClick={() => navigate('amos')}
            icon={
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
              >
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                <circle cx="9" cy="10" r="1" fill="currentColor" />
                <circle cx="12" cy="10" r="1" fill="currentColor" />
                <circle cx="15" cy="10" r="1" fill="currentColor" />
              </svg>
            }
          />
          <SideNavItem
            expanded={expanded}
            active={currentPage === 'tutor'}
            label="Tutor"
            onClick={() => navigate('tutor')}
            icon={
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
              >
                <path d="M22 10L12 5 2 10l10 5 10-5z" />
                <path d="M6 12v5c3 3 9 3 12 0v-5" />
              </svg>
            }
          />
        </>
      )}

      {/* ── 教师端：只给教师账号看（学生 / 家长不显示这组）── */}
      {isTeacher && (
        <>
          <SideNavItem
            expanded={expanded}
            active={currentPage === 'teacherHome'}
            label="教师工作台"
            onClick={() => navigate('teacherHome')}
            icon={
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
              >
                <rect x="3" y="3" width="7" height="18" rx="1.5" />
                <rect x="14" y="3" width="7" height="10" rx="1.5" />
                <rect x="14" y="17" width="7" height="4" rx="1.5" />
              </svg>
            }
          />
          <SideNavItem
            expanded={expanded}
            active={currentPage === 'teacherCalendar'}
            label="排课日历"
            onClick={() => navigate('teacherCalendar')}
            icon={
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
              >
                <rect x="3" y="4" width="18" height="18" rx="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
            }
          />
          <SideNavItem
            expanded={expanded}
            active={currentPage === 'teacherCourses'}
            label="课程管理"
            onClick={() => navigate('teacherCourses')}
            icon={
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
              >
                <path d="M2 4h6a4 4 0 0 1 4 4v12a3 3 0 0 0-3-3H2z" />
                <path d="M22 4h-6a4 4 0 0 0-4 4v12a3 3 0 0 1 3-3h7z" />
              </svg>
            }
          />
          <SideNavItem
            expanded={expanded}
            active={currentPage === 'teacherStudents'}
            label="学生管理"
            onClick={() => navigate('teacherStudents')}
            icon={
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
              >
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            }
          />
          <SideNavItem
            expanded={expanded}
            active={currentPage === 'teacherEarnings'}
            label="收入中心"
            onClick={() => navigate('teacherEarnings')}
            icon={
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
              >
                <rect x="2" y="6" width="20" height="12" rx="2" />
                <circle cx="12" cy="12" r="2.5" />
              </svg>
            }
          />
          <SideNavItem
            expanded={expanded}
            active={currentPage === 'teacherProfile'}
            label="教师资料"
            onClick={() => navigate('teacherProfile')}
            icon={
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
              >
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            }
          />
        </>
      )}

      {/* ── 学生 / 家长导航（续）：课程模块与社区入口，教师账号不显示 ── */}
      {!isTeacher && (
        <>
          <SideNavItem
            expanded={expanded}
            active={currentPage === 'school'}
            label="School"
            onClick={() => navigate('school')}
            icon={
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
              >
                <path d="M3 21h18" />
                <path d="M5 21V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16" />
                <path d="M9 8h1.5M13.5 8H15M9 12h1.5M13.5 12H15M9 16h1.5M13.5 16H15" />
              </svg>
            }
          />
          <SideNavItem
            expanded={expanded}
            active={currentPage === 'podcast'}
            label="Podcast"
            onClick={() => navigate('podcast')}
            icon={
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
              >
                <circle cx="12" cy="12" r="10" />
                <polygon points="10 8 16 12 10 16 10 8" fill="currentColor" stroke="none" />
              </svg>
            }
          />
          <SideNavItem
            expanded={expanded}
            active={currentPage === 'blog'}
            label="Blog"
            onClick={() => navigate('blog')}
            icon={
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
              >
                <path d="M4 5a2 2 0 0 1 2-2h9l5 5v11a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2z" />
                <path d="M15 3v5h5" />
                <path d="M8 11h7M8 14h7M8 17h4" />
              </svg>
            }
          />
          <SideNavItem
            expanded={expanded}
            active={currentPage === 'frankscie'}
            label="Frank 的 CIE"
            onClick={() => navigate('frankscie')}
            icon={
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
              >
                <path d="M12 2.5l8 3v5.8c0 4.9-3.3 8.6-8 10.2-4.7-1.6-8-5.3-8-10.2V5.5z" />
                <path d="M8.8 12.1l2.2 2.2 4.3-4.4" />
              </svg>
            }
          />
        </>
      )}

      <SideNavItem
        expanded={expanded}
        active={currentPage === 'notifications'}
        label="通知"
        badge={unreadNotif || undefined}
        onClick={() => navigate('notifications')}
        icon={
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
          >
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
        }
      />
      <SideNavItem
        expanded={expanded}
        active={currentPage === 'messages'}
        label="消息"
        badge={showMsgBadge ? unreadMsg || undefined : undefined}
        onClick={() => navigate('messages')}
        icon={
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
          >
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        }
      />
      <SideNavItem
        expanded={expanded}
        label="我"
        onClick={() => navigate('profile')}
        icon={
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
          >
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
        }
      />
      <SideNavItem
        expanded={expanded}
        active={currentPage === 'publish'}
        label="发布"
        onClick={() => navigate('publish')}
        icon={
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#FF2442"
            strokeWidth="2"
          >
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        }
      />
      <div style={{ flex: 1 }} />
      <div style={{ borderTop: '1px solid var(--grey-75)', padding: '8px 0' }}>
        {/* 切换账号角色：教师端只对 teacher 显示，这里方便来回看两端 */}
        <SideNavItem
          expanded={expanded}
          label={isTeacher ? '切换为学生端' : '切换为教师端'}
          onClick={() => {
            const next: Role = isTeacher ? 'student' : 'teacher'
            patchProfile({ role: next })
            navigate(next === 'teacher' ? 'teacherHome' : 'feed')
          }}
          icon={
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
            >
              <path d="M8 3L4 7l4 4" />
              <path d="M4 7h16" />
              <path d="M16 21l4-4-4-4" />
              <path d="M20 17H4" />
            </svg>
          }
        />
        <SideNavItem
          expanded={expanded}
          label="更多"
          icon={
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
            >
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          }
        />
        <SideNavItem
          expanded={expanded}
          label="关于我们"
          icon={
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          }
        />
      </div>
    </div>
  )
}
