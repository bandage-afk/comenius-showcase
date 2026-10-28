import { create } from 'zustand'
import { readJSON, writeJSON } from './repositories/localStore'

export interface UserNote {
  id: number
  type: 'image' | 'text' | 'video' | 'article' | 'podcast'
  img?: string
  title?: string
  quote?: string
  quoteEmoji?: string
  tags: string[]
  author: string
  likes: string
  duration?: string
  content?: string
  videoUrl?: string
  channels?: string[]
  category?: string
  createdAt: number
}

const KEY = 'comenius_user_notes'

/**
 * 用户发布的笔记。
 * 读写都走 repositories/localStore（唯一碰 localStorage 的地方，见 ADR-0006），
 * 所以这里不再自己 try/catch：配额满等失败由 repository 按策略记一笔，页面照常。
 */
export const useNotes = create<{
  notes: UserNote[]
  publish: (n: Omit<UserNote, 'id' | 'createdAt' | 'likes'>) => void
}>(set => ({
  notes: readJSON<UserNote[]>(KEY, []),
  publish: n =>
    set(state => {
      const note: UserNote = { ...n, id: Date.now(), likes: '0', createdAt: Date.now() }
      const next = [note, ...state.notes]
      writeJSON(KEY, next)
      return { notes: next }
    }),
}))
