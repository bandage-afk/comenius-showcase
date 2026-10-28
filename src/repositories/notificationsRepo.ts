/**
 * 通知（现在 = 三类写死的 mock；接后端 = `GET /notifications?category=`）。
 *
 * 页面不许 import 这个文件：通知条目由 store 的 `items` 提供，
 * 已读状态与开关由 store 的 action 管（那部分才是用户数据，会持久化）。
 */

import { NOTIFS_BY_CATEGORY, notifKey, type Notif, type NotifCategory } from '../notificationData'

export function listByCategory(): Record<NotifCategory, Notif[]> {
  return NOTIFS_BY_CATEGORY
}

/** 已读键：键里带分类，避免三个分类的 id 串在一起 */
export function keyOf(category: NotifCategory, id: number): string {
  return notifKey(category, id)
}
