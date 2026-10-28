/**
 * 单测公共环境：给 node 环境补一个内存版 localStorage。
 *
 * 为什么要它：ADR-0006 之后所有持久化都走 repositories/localStore，而 store 的初始
 * state 是「读 localStorage」得到的（notesStore / persist 的 rehydrate）。node 里没有
 * localStorage，读会走失败分支 → 测不到真实路径，所以这里补一个最小实现。
 *
 * 想测「写入失败」时用 withBrokenStorage()（见下），不要直接 mock Storage 原型 —— node 里没有 Storage。
 */

class MemoryStorage implements Storage {
  private map = new Map<string, string>()

  get length(): number {
    return this.map.size
  }

  clear(): void {
    this.map.clear()
  }

  getItem(key: string): string | null {
    return this.map.get(key) ?? null
  }

  key(index: number): string | null {
    return [...this.map.keys()][index] ?? null
  }

  removeItem(key: string): void {
    this.map.delete(key)
  }

  setItem(key: string, value: string): void {
    this.map.set(key, String(value))
  }
}

/** 写入必失败（配额满 / 隐私模式）的 storage —— 用来验证 repository 的失败语义 */
class BrokenStorage extends MemoryStorage {
  override setItem(): void {
    throw new DOMException('QuotaExceededError: 测试用', 'QuotaExceededError')
  }
}

globalThis.localStorage = new MemoryStorage()

/** 临时把 localStorage 换成「写不进去」的版本，跑完自动还原 */
export function withBrokenStorage(fn: () => void): void {
  const real = globalThis.localStorage
  globalThis.localStorage = new BrokenStorage()
  try {
    fn()
  } finally {
    globalThis.localStorage = real
  }
}
