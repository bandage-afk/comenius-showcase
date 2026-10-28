import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import ErrorBoundary from './app/ErrorBoundary'
import { installGlobalErrorHandlers } from './app/errorReporting'
import './index.css'

// 全局兜底：window.onerror + 未处理的 Promise（渲染期异常另有 ErrorBoundary）
installGlobalErrorHandlers()

/** dev-only：`?crash=1` 时抛一次渲染期异常，用来手工验证 ErrorBoundary（生产构建里没有这个分支） */
function DevCrash(): never {
  throw new Error('dev 触发器：?crash=1')
}
const crash = import.meta.env.DEV && new URLSearchParams(location.search).has('crash')

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>{crash ? <DevCrash /> : <App />}</ErrorBoundary>
  </React.StrictMode>,
)
