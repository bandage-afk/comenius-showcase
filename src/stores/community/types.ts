// 社区 store 的类型与默认值（从 communityStore.ts 拆出）。
// 关注点分离：这里是「数据长什么样」，communityStore 里是「能做什么」。
// 改 schema / 默认值只动这个文件，不会和改 action 的人撞车。

import type {
  Announcement,
  Conversation,
  Message,
  NoteCard,
  QuotedRef,
  User,
} from '../../community/data'
import type { Post } from '../../data/posts'

export interface UserComment {
  name: string
  text: string
  time: string
}

/** 群聊设置（对齐微信的会话设置项） */
export interface GroupSettings {
  /** 只提醒这些群成员的消息（消息免打扰下的"关注的群成员"） */
  watchers: string[]
  /** 仅群主/管理员可邀请成员 */
  inviteConfirm: boolean
  /** 聊天背景 */
  background: string
  /** 群公告未读成员 */
  announceUnread: string[]
  announceAt?: number
}

export const DEFAULT_GROUP_SETTINGS: GroupSettings = {
  watchers: [],
  inviteConfirm: false,
  background: 'default',
  announceUnread: [],
}

export interface CommunityState {
  /** 社区互动 */
  follows: string[]
  likes: number[]
  collects: number[]
  comments: Record<number, UserComment[]>
  /** 私信 */
  conversations: Conversation[]
  messages: Record<string, Message[]>
  activeConvId: number | null
  viewingUser: User | null
  /** 会话状态：置顶 / 免打扰 / 归档 / 拉黑 */
  pinned: number[]
  muted: number[]
  archived: number[]
  blocked: number[]
  /** 打开会话时记下「未读从第几条开始」，用来画未读分隔线 */
  unreadMark: Record<number, number>
  /** 群管理：管理员列表（成员 id，当前用户固定用 'me'）、我在群里的昵称、已退出的群 */
  groupAdmins: Record<number, string[]>
  groupOwner: Record<number, string>
  groupNickname: Record<number, string>
  leftGroups: number[]
  /** 群设置 & 保存到通讯录 */
  groupSettings: Record<number, GroupSettings>
  savedGroups: number[]
  /** 开启了「邀请确认」时，待群主确认的成员 */
  joinRequests: Record<number, string[]>
  /** 群公告（多条） */
  announcements: Record<number, Announcement[]>
  /**
   * 只读目录（由 repositories/ 提供，页面只通过 store 读）。
   * 不落 localStorage：它们不是用户数据，写进持久化只会让老用户的数据白白变大。
   */
  posts: Post[]
  groupMembers: User[]

  getUser: (name: string) => User
  getMember: (id?: string) => User | undefined
  viewUser: (u: User | null) => void
  toggleFollow: (id: string) => void
  toggleLike: (id: number) => void
  toggleCollect: (id: number) => void
  addComment: (postId: number, text: string) => void

  sendMessage: (convId: number, text: string, quoted?: QuotedRef) => void
  sendSticker: (convId: number, emoji: string) => void
  sendImage: (convId: number, url: string, quoted?: QuotedRef) => void
  sendVoice: (convId: number, duration: number) => void
  sendNote: (convId: number, note: NoteCard, quoted?: QuotedRef) => void
  /** 撤回（自己发的消息） */
  recallMessage: (convId: number, index: number) => void
  /** 删除（只删本地这条记录） */
  deleteMessage: (convId: number, index: number) => void
  markDelivered: (convId: number) => void
  receiveMessage: (convId: number, text: string, senderId?: string) => void
  /** 「对方」的下一条回复（群聊带发言人）；发完消息后由页面驱动 */
  pickReply: (conv: { isGroup?: boolean; memberIds?: string[] }) => {
    text: string
    senderId?: string
  }

  startConversation: (u: User) => number
  openConversation: (convId: number) => void
  removeConversation: (convId: number) => void
  markUnread: (convId: number) => void
  markRead: (convId: number) => void
  clearThread: (convId: number) => void
  togglePin: (convId: number) => void
  toggleMute: (convId: number) => void
  toggleArchive: (convId: number) => void
  toggleBlock: (convId: number) => void
  setAnnouncement: (convId: number, text: string) => void
  toggleAdmin: (convId: number, memberId: string) => void
  setGroupNickname: (convId: number, name: string) => void
  addMember: (convId: number, memberId: string) => void
  removeMember: (convId: number, memberId: string) => void
  leaveGroup: (convId: number) => void
  rejoinGroup: (convId: number) => void
  renameGroup: (convId: number, name: string) => void
  transferOwner: (convId: number, memberId: string) => void
  updateGroupSettings: (convId: number, patch: Partial<GroupSettings>) => void
  publishAnnouncement: (convId: number, text: string, unread: string[]) => void
  markAnnounceRead: (convId: number, memberId: string) => void
  toggleSavedGroup: (convId: number) => void
  pushSystem: (convId: number, text: string) => void
  requestJoin: (convId: number, memberId: string) => void
  approveJoin: (convId: number, memberId: string) => void
  declineJoin: (convId: number, memberId: string) => void
  addAnnouncement: (convId: number, text: string) => void
  updateAnnouncement: (convId: number, annId: number, text: string) => void
  removeAnnouncement: (convId: number, annId: number) => void
  toggleAnnouncementPin: (convId: number, annId: number) => void
  markAnnouncementRead: (convId: number, annId: number, memberId: string) => void
}

export const toggleIn = <T>(list: T[], id: T): T[] =>
  list.includes(id) ? list.filter(x => x !== id) : [...list, id]
