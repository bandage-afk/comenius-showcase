/**
 * 会话（现在 = 种子会话；接后端 = `GET /conversations`）。
 * 页面不许 import 这个文件：会话状态在 store 的 `conversations` / `activeConvId` 里。
 */

import { INITIAL_CONVERSATIONS, type Conversation } from '../community/data'

export function initialConversations(): Conversation[] {
  return INITIAL_CONVERSATIONS
}

/** 新建会话的 id（现在是时间戳；接后端后由服务端发号） */
export function nextConversationId(): number {
  return Date.now()
}
