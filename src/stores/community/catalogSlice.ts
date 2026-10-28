// 社区 store 的「只读目录」slice：帖子 + 用户/群成员。
//
// 数据来自 src/repositories/（现在 mock，接后端后由 store 拉取后写进同一个 state）。
// 页面不许绕过来直接 import repository 或 mock 模块——这条边界由 .oxlintrc.json 的
// no-restricted-imports 拦（见 docs/adr/0006）。
//
// ── 接后端（2026-10-04）──────────────────────────────────────────────────────
// 「首屏同步 + 后台异步」就在这里合拢（ADR-0006 预设的正是这个形状）：
//
//   1. `posts` 首屏 = `postsRepo.listPosts()`（同步：缓存或本地种子数据）→ 页面立刻有内容
//   2. store 建好后在后台跑 `postsRepo.reloadPosts()`
//   3. 拉到后端数据 → 写回同一个 `posts` state → **页面自动重渲染，页面代码零改动**
//   4. 拉失败 → 什么都不做，页面保持第 1 步的数据（repo 层已经记了一笔，不抛错）
//
// 所以页面侧不需要 loading 状态机，也不需要 try/catch —— 见 src/repositories/errors.ts 的约定。

import type { StateCreator } from 'zustand'
import * as postsRepo from '../../repositories/postsRepo'
import * as usersRepo from '../../repositories/usersRepo'
import type { CommunityState } from './types'

/** 这个 slice 负责的 state / action（= CommunityState 的目录部分） */
export type CatalogSlice = Pick<CommunityState, 'posts' | 'groupMembers' | 'getUser' | 'getMember'>

export const catalogSlice: StateCreator<CommunityState, [], [], CatalogSlice> = set => {
  // 后台刷新：只有真的配了后端才会发请求（`reloadPosts()` 内部判断），
  // 单测环境（无 window / 无后端）不会触发任何网络调用。
  void postsRepo.reloadPosts().then(posts => {
    if (!posts) return // 没配后端 / 拉失败 → 保持现有的种子或缓存数据
    set({ posts })
  })

  return {
    posts: postsRepo.listPosts(),
    groupMembers: usersRepo.listMembers(),
    getUser: usersRepo.findByName,
    getMember: usersRepo.findMember,
  }
}
