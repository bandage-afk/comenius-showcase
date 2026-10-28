// 社区 / 消息 / 群设置的 zustand store —— 这里只负责组装：
// 持久化键在 stores/community/persist.ts（**改名 = 老用户数据丢失**），类型与默认值在 types.ts，
// 私信在 stores/community/messagesSlice.ts，群管理在 stores/community/groupsSlice.ts，
// 只读目录（帖子/用户）在 stores/community/catalogSlice.ts，slice 共用的小动作在 helpers.ts。
//
// ⚠️ 数据源一律走 src/repositories/（ADR-0006）：页面只认这个 store，
// 以后接后端只改 repository + slice 里的取数，页面组件零改动。

import { create } from 'zustand'
import type { StateCreator } from 'zustand'
import { persist } from 'zustand/middleware'
import { catalogSlice } from './stores/community/catalogSlice'
import { groupsSlice } from './stores/community/groupsSlice'
import { messagesSlice } from './stores/community/messagesSlice'
import { communityPersist } from './stores/community/persist'
import { toggleIn, type CommunityState } from './stores/community/types'

export { DEFAULT_GROUP_SETTINGS } from './stores/community/types'

/**
 * 社区互动（关注 / 点赞 / 收藏 / 评论 + 点开用户卡片）：
 * 只有 5 个字段 + 5 个一行 action，单开一个 slice 文件不划算，就留在组装处。
 */
type SocialSlice = Pick<
  CommunityState,
  | 'follows'
  | 'likes'
  | 'collects'
  | 'comments'
  | 'viewingUser'
  | 'viewUser'
  | 'toggleFollow'
  | 'toggleLike'
  | 'toggleCollect'
  | 'addComment'
>

const socialSlice: StateCreator<CommunityState, [], [], SocialSlice> = set => ({
  follows: [],
  likes: [],
  collects: [],
  comments: {},
  viewingUser: null,

  viewUser: u => set({ viewingUser: u }),
  toggleFollow: id => set(s => ({ follows: toggleIn(s.follows, id) })),
  toggleLike: id => set(s => ({ likes: toggleIn(s.likes, id) })),
  toggleCollect: id => set(s => ({ collects: toggleIn(s.collects, id) })),
  addComment: (postId, text) =>
    set(s => ({
      comments: {
        ...s.comments,
        [postId]: [...(s.comments[postId] ?? []), { name: 'Champion', text, time: '刚刚' }],
      },
    })),
})

export const useCommunity = create<CommunityState>()(
  persist(
    (...a) => ({
      ...socialSlice(...a),
      ...catalogSlice(...a),
      ...messagesSlice(...a),
      ...groupsSlice(...a),
    }),
    communityPersist,
  ),
)

// 开发期调试：浏览器控制台可直接查看 store（生产构建里会被 tree-shake 掉）
if (import.meta.env.DEV) {
  ;(globalThis as unknown as Record<string, unknown>).__community = useCommunity
}
