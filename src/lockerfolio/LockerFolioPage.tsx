import './styles/global.css'
import FolioApp from './App'
import type { NavProps } from '../App'

/**
 * locker-folio 独立体验页：全屏沉浸式 3D 储物柜（加载 → 揭幕 → 柜门打开 →
 * 物件热点 → 内容浮层），左上角提供退出回到"我的"页。
 */
export default function LockerFolioPage({ navigate }: NavProps) {
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1300, background: '#f8f7fa' }}>
      <FolioApp />
      <button
        onClick={() => navigate('profile')}
        style={{
          position: 'fixed',
          top: 18,
          left: 18,
          zIndex: 2000,
          background: 'rgba(255,255,255,0.85)',
          color: '#14161a',
          border: '1px solid rgba(20,22,26,0.15)',
          borderRadius: 999,
          padding: '8px 18px',
          fontSize: 13,
          fontWeight: 600,
          cursor: 'pointer',
          fontFamily: "'Noto Sans SC', sans-serif",
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        }}
      >
        ← 退出储物柜
      </button>
    </div>
  )
}
