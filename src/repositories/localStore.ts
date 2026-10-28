/**
 * 本地持久化：**全仓唯一直接碰 localStorage 的地方**。
 *
 * 这里是 ADR-0006 说的「现在 = localStorage」那一半：三个 zustand persist 存储
 * （社区 / 资料 / 通知）和 notesStore 都走这个模块，所以以后要换成 IndexedDB
 * 或者「先本地、再同步到服务端」，只改这一个文件。
 *
 * 失败语义见 errors.ts：读失败回落默认值、写失败保持乐观结果，都不抛给页面。
 */

import { reportRepoError } from './errors'

const READ = 'localStore.read'
const WRITE = 'localStore.write'

/** 读 JSON；解析失败/不可用 → 返回默认值（老用户数据坏了也不会白屏） */
export function readJSON<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch (cause) {
    reportRepoError({ op: READ, message: `读取 ${key} 失败，用默认值继续`, cause })
    return fallback
  }
}

/** 写 JSON；配额满 / 隐私模式 → 记一笔，界面保持已经乐观更新的结果 */
export function writeJSON(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch (cause) {
    reportRepoError({
      op: WRITE,
      message: `写入 ${key} 失败（配额满或隐私模式），界面保持乐观结果`,
      cause,
    })
  }
}

/** zustand persist 的 storage 适配（接口：getItem/setItem/removeItem） */
export const storage = {
  getItem: (key: string): string | null => {
    try {
      return localStorage.getItem(key)
    } catch (cause) {
      reportRepoError({ op: READ, message: `读取 ${key} 失败`, cause })
      return null
    }
  },
  setItem: (key: string, value: string): void => {
    try {
      localStorage.setItem(key, value)
    } catch (cause) {
      reportRepoError({
        op: WRITE,
        message: `写入 ${key} 失败（配额满或隐私模式），界面保持乐观结果`,
        cause,
      })
    }
  },
  removeItem: (key: string): void => {
    try {
      localStorage.removeItem(key)
    } catch (cause) {
      reportRepoError({ op: WRITE, message: `清除 ${key} 失败`, cause })
    }
  },
}
