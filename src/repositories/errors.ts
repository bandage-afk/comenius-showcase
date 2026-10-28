/**
 * repository 层的错误语义（ADR-0006 要求「先定错误语义再动手」）。
 *
 * 约定：**repository 不向页面抛错**。页面不需要 try/catch，也不需要 loading 状态机；
 * 失败只在这一个出口处理，按策略分三类：
 *
 * | 场景                          | 策略       | 现在怎么做                                    | 接后端后                                    |
 * | ----------------------------- | ---------- | --------------------------------------------- | ------------------------------------------- |
 * | 写本地（localStorage 超配额） | `silent`   | 界面保持乐观结果，只记一笔（与加这层之前一致）| 不需要改                                    |
 * | 读远程失败                    | `retry`    | 现在没有远程读                                | 指数退避最多 3 次，仍失败 → 回落到 `rollback` |
 * | 写远程失败                    | `rollback` | 现在没有远程写                                | 撤销乐观更新 + 一次性重试                   |
 *
 * 之所以能「回滚」而不是「重试到成功」：store 的写入都是**先乐观改 state、再发请求**，
 * 所以只要保留请求前的快照就能退回去（快照由调用方在 store 里保存）。
 */

export type RepoFailPolicy = 'silent' | 'retry' | 'rollback'

export interface RepoError {
  /** 哪个 repository 的哪个操作，例如 `messages.send` / `localStore.write` */
  op: string
  /** 给人看的一句话（会进控制台/以后进上报） */
  message: string
  policy: RepoFailPolicy
  cause?: unknown
}

/**
 * 失败的唯一出口。
 * 现在：dev 控制台告警；生产：静默（没有上报通道，见 TECH-DEBT §4「错误上报」）。
 * 接上报/ toast 时只改这里，页面的调用方式不变。
 */
export function reportRepoError(input: Omit<RepoError, 'policy'> & { policy?: RepoFailPolicy }) {
  const err: RepoError = { policy: 'silent', ...input }
  if (import.meta.env.DEV) {
    console.warn(`[repo:${err.op}] ${err.message}（策略：${err.policy}）`, err.cause ?? '')
  }
}
