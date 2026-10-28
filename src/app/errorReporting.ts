/**
 * 错误上报：全站**唯一**的失败出口。
 *
 * 为什么需要：以前线上白屏你不可见——没有 window.onerror、没有 ErrorBoundary、没有任何埋点
 * （TECH-DEBT §4 挂着这条）。现在分两层：
 *   1. **用户看得见**：ErrorBoundary 兜住渲染期异常，显示一个能重试/回首页的页面（不再是白屏）
 *   2. **你收得到**：所有异常（含未处理 Promise）都经过 reportError()，默认只进内存环形缓冲 + dev 控制台；
 *      配好 `VITE_ERROR_ENDPOINT` 就用 sendBeacon 发出去（后端接口就绪后一行开启，见 docs/TECH-DEBT.md §4）
 *
 * 三条纪律：
 *   · 上报本身**绝不能抛错**（网络失败、JSON 循环引用都不能把页面带崩）
 *   · 不采集隐私内容（只带 message / stack / 来源 / URL），要带上下文请显式传
 *   · 出口只有一个：以后接 Sentry 之类也只改这个文件
 */

export interface ErrorPayload {
  /** 人能看懂的一句话 */
  message: string
  stack?: string
  /** 谁报的：boundary（渲染期）/ error（window.onerror）/ unhandledrejection / 自定义 */
  source: string
  url: string
  at: string
}

/** 最近若干条错误（排查现场用；接上报后也从这里取） */
const buffer: ErrorPayload[] = []
const MAX_BUFFER = 20

/**
 * 上报地址。**默认不发**——现在还没有 /api/log 这个接口，
 * 配了就会发（构建时注入：VITE_ERROR_ENDPOINT=https://…/api/log pnpm build）。
 */
const ENDPOINT: string | undefined = import.meta.env.VITE_ERROR_ENDPOINT

let installed = false

const toMessage = (input: unknown): string => {
  if (input instanceof Error) return input.message || input.name
  if (typeof input === 'string') return input
  try {
    return JSON.stringify(input)?.slice(0, 500) ?? String(input)
  } catch {
    return String(input)
  }
}

const toStack = (input: unknown): string | undefined =>
  input instanceof Error && input.stack ? input.stack.slice(0, 4000) : undefined

/** 记一条错误：进缓冲 + dev 控制台；配了端点才真的发出去。返回值便于测试与串联。 */
export function reportError(input: unknown, source = 'runtime'): ErrorPayload {
  const payload: ErrorPayload = {
    message: toMessage(input),
    stack: toStack(input),
    source,
    url: typeof location === 'undefined' ? '' : location.href,
    at: new Date().toISOString(),
  }

  buffer.push(payload)
  if (buffer.length > MAX_BUFFER) buffer.shift()

  if (import.meta.env.DEV) console.error(`[error:${source}]`, payload.message, input)
  if (ENDPOINT) send(payload)

  return payload
}

/** 最近错误（新的在后）。只读，避免调用方改坏缓冲。 */
export function recentErrors(): readonly ErrorPayload[] {
  return buffer
}

function send(payload: ErrorPayload): void {
  try {
    const body = JSON.stringify(payload)
    // sendBeacon 在页面卸载时也发得出去，且不阻塞；不支持时退化成 keepalive fetch
    if (typeof navigator !== 'undefined' && navigator.sendBeacon) {
      navigator.sendBeacon(ENDPOINT as string, body)
      return
    }
    void fetch(ENDPOINT as string, { method: 'POST', body, keepalive: true }).catch(() => {})
  } catch {
    // 上报失败就失败，绝不影响页面
  }
}

/**
 * 装全局兜底：window.onerror + unhandledrejection。幂等（StrictMode / HMR 会重复调用）。
 * 返回卸载函数，主要给测试用。
 */
export function installGlobalErrorHandlers(): () => void {
  if (typeof window === 'undefined' || installed) return () => {}
  installed = true

  const onError = (event: ErrorEvent) => reportError(event.error ?? event.message, 'error')
  const onRejection = (event: PromiseRejectionEvent) =>
    reportError(event.reason, 'unhandledrejection')

  window.addEventListener('error', onError)
  window.addEventListener('unhandledrejection', onRejection)

  return () => {
    window.removeEventListener('error', onError)
    window.removeEventListener('unhandledrejection', onRejection)
    installed = false
  }
}
