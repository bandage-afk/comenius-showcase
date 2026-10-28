/**
 * 消息：种子、发送、以及「对方」的自动回复（现在全是 mock；接后端 = HTTP + WebSocket）。
 *
 * 页面不许 import 这个文件：发送走 store 的 `sendMessage` 等 action，
 * 对方回复走 store 的 `pickReply` + `receiveMessage`。
 */

import { INITIAL_MESSAGES, mockGroupReply, mockReply, type Message } from '../community/data'

/** 会话 → 消息种子 */
export function initialMessages(): Record<string, Message[]> {
  return INITIAL_MESSAGES
}

/**
 * 「对方」的下一条回复。
 * 群聊会顺便挑一个成员当发言人（所以返回 senderId）；单聊没有 senderId。
 */
export function pickReply(conv: { isGroup?: boolean; memberIds?: string[] }): {
  text: string
  senderId?: string
} {
  if (conv.isGroup && conv.memberIds?.length) return mockGroupReply(conv.memberIds)
  return { text: mockReply() }
}

/** 发送回执延迟：现在是 mock 的 500ms，够让「发送中」露个脸 */
const ACK_DELAY_MS = 500

/**
 * 发送一条消息。
 * 现在：不真的发，`ACK_DELAY_MS` 后回调 `onAck`（= store 把「发送中」改成「已送达」）。
 * 接后端：这里换成 `POST /conversations/:id/messages` + 重试 + 失败回滚
 * （策略见 repositories/errors.ts），store 与页面的调用方式不变。
 *
 * `message` 现在没用上，是留给后端请求体的。
 */
export function send(_message: Message, handlers: { onAck: () => void }): void {
  // 用全局 setTimeout（不是 window.setTimeout）：浏览器里等价，但 store 单测跑在 node 环境，
  // 没有 window —— 这样发送回执这条路在单测里也能用假时钟走一遍。
  setTimeout(handlers.onAck, ACK_DELAY_MS)
}
