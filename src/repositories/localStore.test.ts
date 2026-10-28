/**
 * 持久化失败语义（ADR-0006 里定的策略表）：读失败回落默认值、写失败不抛给界面。
 * 这是「换后端之前先把错误语义定死」那条要求的可执行版本。
 */
import { describe, expect, it, vi } from 'vitest'
import { withBrokenStorage } from '../../vitest.setup'
import { readJSON, storage, writeJSON } from './localStore'

describe('readJSON', () => {
  it('没有数据时返回默认值', () => {
    expect(readJSON('不存在的键', { a: 1 })).toEqual({ a: 1 })
  })

  it('坏 JSON 返回默认值，不抛异常', () => {
    localStorage.setItem('坏的', '{不是 JSON')
    expect(readJSON('坏的', [])).toEqual([])
  })
})

describe('writeJSON', () => {
  it('写入成功时能读回来', () => {
    writeJSON('好的', { a: 1 })
    expect(readJSON('好的', null)).toEqual({ a: 1 })
  })

  it('配额满 / 隐私模式：不抛异常，只记一笔（界面保持乐观结果）', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    withBrokenStorage(() => {
      expect(() => writeJSON('写不进去', { a: 1 })).not.toThrow()
    })
    expect(warn).toHaveBeenCalled()
  })
})

describe('storage 适配器（给 zustand persist 用）', () => {
  it('set / get / remove 一套走通', () => {
    storage.setItem('k', 'v')
    expect(storage.getItem('k')).toBe('v')
    storage.removeItem('k')
    expect(storage.getItem('k')).toBeNull()
  })

  it('写失败不抛，返回 null 当读不到', () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {})
    withBrokenStorage(() => {
      expect(() => storage.setItem('k2', 'v')).not.toThrow()
    })
    expect(storage.getItem('k2')).toBeNull()
  })
})
