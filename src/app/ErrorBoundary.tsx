import { Component, type ErrorInfo, type ReactNode } from 'react'
import { recentErrors, reportError } from './errorReporting'

/**
 * 渲染期异常兜底：出错时给用户一个能重试/回首页的页面，而不是白屏。
 *
 * 之前的状况：任何组件抛错，React 会卸载整棵树 → 用户看到纯白页面，而你也收不到任何信号
 * （没有 window.onerror、没有上报）。现在：异常进 reportError()（缓冲 + 可选上报），
 * 界面上给出「重新加载 / 回首页」，dev 下还把最近错误摊开方便定位。
 *
 * 手工验证：本地 `pnpm dev` 后访问 `?crash=1`（main.tsx 里的 dev-only 触发器）就能看到这个兜底页。
 */

interface Props {
  children: ReactNode
}

interface State {
  failed: boolean
  message: string
}

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { failed: false, message: '' }

  static getDerivedStateFromError(error: unknown): State {
    return { failed: true, message: error instanceof Error ? error.message : String(error) }
  }

  componentDidCatch(error: unknown, info: ErrorInfo): void {
    reportError(error, 'boundary')
    if (import.meta.env.DEV) console.error('[boundary] 组件栈：', info.componentStack)
  }

  render(): ReactNode {
    if (!this.state.failed) return this.props.children

    const base = import.meta.env.BASE_URL || '/'
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 24,
          background: 'var(--surface-sunken)',
          color: 'var(--text)',
          fontFamily: 'inherit',
        }}
      >
        <div
          style={{
            maxWidth: 520,
            width: '100%',
            background: 'var(--surface)',
            border: '1px solid var(--surface-sunken)',
            borderRadius: 16,
            padding: '28px 26px',
          }}
        >
          <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 10 }}>页面出了点问题</div>
          <div style={{ fontSize: 13.5, lineHeight: 1.7, color: 'var(--text-muted)' }}>
            这一屏没能渲染出来，已经记录下来。可以先重新加载；如果反复出现，把下面这段信息发给我们。
          </div>
          <div
            style={{
              margin: '14px 0 18px',
              padding: '10px 12px',
              background: 'var(--surface-sunken)',
              borderRadius: 10,
              fontSize: 12.5,
              color: 'var(--text-muted)',
              wordBreak: 'break-word',
            }}
          >
            {this.state.message || '未知错误'}
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button
              onClick={() => location.reload()}
              style={{
                border: 'none',
                background: 'var(--brand)',
                color: 'var(--surface)',
                borderRadius: 999,
                padding: '9px 18px',
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
                fontFamily: 'inherit',
              }}
            >
              重新加载
            </button>
            <button
              onClick={() => location.assign(base)}
              style={{
                border: '1px solid var(--surface-sunken)',
                background: 'var(--surface)',
                color: 'var(--text)',
                borderRadius: 999,
                padding: '9px 18px',
                fontSize: 13,
                cursor: 'pointer',
                fontFamily: 'inherit',
              }}
            >
              回到首页
            </button>
          </div>
          {import.meta.env.DEV && (
            <div
              style={{
                marginTop: 18,
                fontSize: 11.5,
                color: 'var(--text-subtle)',
                whiteSpace: 'pre-wrap',
                maxHeight: 160,
                overflow: 'auto',
              }}
            >
              {/* 注意：componentDidCatch 在首次渲染之后才跑，所以引发兜底的这条要自己带上，
                  不然摊开列表里恰好少了最关键的一条 */}
              {[
                `[boundary] ${this.state.message}`,
                ...recentErrors()
                  .slice(-4)
                  .map(e => `[${e.source}] ${e.message}`),
              ].join('\n')}
            </div>
          )}
        </div>
      </div>
    )
  }
}
