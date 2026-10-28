/**
 * 错误上报是"出事时才跑"的代码，最容易写成"一出错再抛一个错"。
 * 这几条钉住：形状对、不抛错、缓冲有上限、全局监听幂等。
 */
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { installGlobalErrorHandlers, recentErrors, reportError } from './errorReporting'

beforeEach(() => {
  // 缓冲是模块级的，用例之间要清干净
  const buffer = recentErrors() as unknown as unknown[]
  buffer.length = 0
})

describe('reportError', () => {
  it('Error 对象：留下 message 与 stack', () => {
    const payload = reportError(new Error('炸了'), 'boundary')
    expect(payload.message).toBe('炸了')
    expect(payload.source).toBe('boundary')
    expect(payload.stack).toContain('Error')
    expect(payload.at).toMatch(/^\d{4}-\d{2}-\d{2}T/)
  })

  it('字符串 / 普通对象 / 循环引用都不会抛', () => {
    expect(reportError('纯字符串').message).toBe('纯字符串')
    expect(reportError({ a: 1 }).message).toBe('{"a":1}')
    const circular: Record<string, unknown> = {}
    circular.self = circular
    expect(() => reportError(circular)).not.toThrow()
  })

  it('缓冲有上限（不会无限增长）', () => {
    for (let i = 0; i < 25; i++) reportError(`e${i}`)
    expect(recentErrors()).toHaveLength(20)
    expect(recentErrors().at(-1)?.message).toBe('e24')
  })

  it('没有配置端点时不会发请求（默认不打扰）', () => {
    const beacon = vi.fn()
    vi.stubGlobal('navigator', { sendBeacon: beacon })
    reportError('随便一条')
    expect(beacon).not.toHaveBeenCalled()
    vi.unstubAllGlobals()
  })
})

describe('installGlobalErrorHandlers', () => {
  it('挂上 error / unhandledrejection 两个监听，且幂等', () => {
    const listeners = new Map<string, (e: unknown) => void>()
    const fakeWindow = {
      addEventListener: (type: string, fn: (e: unknown) => void) => listeners.set(type, fn),
      removeEventListener: (type: string) => listeners.delete(type),
    }
    vi.stubGlobal('window', fakeWindow)

    const uninstall = installGlobalErrorHandlers()
    installGlobalErrorHandlers() // 再调一次不该重复挂
    expect([...listeners.keys()].sort()).toEqual(['error', 'unhandledrejection'])

    listeners.get('error')?.({ error: new Error('window 上的错'), message: 'x' })
    expect(recentErrors().at(-1)).toMatchObject({ message: 'window 上的错', source: 'error' })

    listeners.get('unhandledrejection')?.({ reason: 'promise 挂了' })
    expect(recentErrors().at(-1)).toMatchObject({
      message: 'promise 挂了',
      source: 'unhandledrejection',
    })

    uninstall()
    vi.unstubAllGlobals()
  })
})
