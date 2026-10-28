// 社区统一数据层（纯前端 mock）：用户、会话、消息种子。
// 帖子 POSTS 仍在 src/pages/FeedPage.tsx（已 export），这里只放用户、会话与消息，
// 供「关注 / 私信 / 点作者进主页 / 群聊」等跨页逻辑复用。

export interface User {
  id: string
  name: string
  comeniusId: string
  avatar: string // Unsplash photo-id
  bio: string
  school: string
  verified: boolean
}

/** 分享进聊天的笔记卡片 */
export interface NoteCard {
  id: number
  title: string
  img: string
  author: string
  likes: string
}

/** 引用的那条消息（存快照，避免原消息被删后引用失效） */
export interface QuotedRef {
  author: string
  preview: string
}

export interface Message {
  from: 'me' | 'other'
  type: 'text' | 'sticker' | 'video' | 'image' | 'voice' | 'note' | 'system'
  text?: string
  emoji?: string
  thumb?: string
  /** 图片消息地址 */
  url?: string
  /** 语音时长（秒） */
  duration?: number
  /** 分享的笔记卡片 */
  note?: NoteCard
  /** 群聊里这条消息的发送者 id（from === 'other' 时用） */
  senderId?: string
  /** 发送状态，只有自己发的消息有 */
  status?: 'sending' | 'sent' | 'read'
  /** 已撤回：只显示一条系统提示 */
  recalled?: boolean
  /** 引用回复 */
  quoted?: QuotedRef
  time: string
}

export interface Conversation {
  id: number
  userId: string
  name: string
  avatar: string
  last: string
  time: string
  unread: number
  verified?: boolean
  /** 群聊 */
  isGroup?: boolean
  memberIds?: string[]
  announcement?: string
  /** 对方是否在线（会话列表头像右下角显示绿点，参考 tutor 的 Messaging） */
  online?: boolean
}

/** 群公告（可以有多条：置顶的显示在聊天区顶部，其余进历史） */
export interface Announcement {
  id: number
  text: string
  /** 发布时间戳 */
  at: number
  /** 发布者：'me' 或成员 id */
  by: string
  /** 置顶（聊天区顶部显示这条） */
  pinned: boolean
  /** 还没读的成员 id */
  unread: string[]
}

const AVATAR_POOL = [
  'photo-1535713875002-d1d0cf377fde',
  'photo-1494790108377-be9c29b29330',
  'photo-1507003211169-0a1dd7228f2d',
  'photo-1438761681033-6461ffad8d80',
  'photo-1472099645785-5658abf4ff4e',
  'photo-1544005313-94ddf0286df2',
  'photo-1500648767791-00dcc994a43e',
  'photo-1463453091185-61582044d556',
  'photo-1519345182560-3f2917c472ef',
  'photo-1534528741775-53994a69daeb',
  'photo-1508804185872-d7badad00f7d',
  'photo-1517483000871-1dbf64a6e1c6',
]

function hashStr(s: string): number {
  let h = 0
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0
  return h
}

/** 已知用户（私信对象），有稳定 id 和头像 */
const SEED_USERS: User[] = [
  {
    id: 'u1',
    name: '小红薯6A25E445',
    comeniusId: '70001234',
    avatar: 'photo-1535713875002-d1d0cf377fde',
    bio: '',
    school: '',
    verified: false,
  },
  {
    id: 'u2',
    name: '陌生人消息',
    comeniusId: '70002345',
    avatar: 'photo-1494790108377-be9c29b29330',
    bio: '',
    school: '',
    verified: false,
  },
  {
    id: 'u3',
    name: '星焕-Dev Goyal',
    comeniusId: '70003456',
    avatar: 'photo-1507003211169-0a1dd7228f2d',
    bio: '',
    school: '',
    verified: true,
  },
  {
    id: 'u4',
    name: 'Bambi',
    comeniusId: '70004567',
    avatar: 'photo-1438761681033-6461ffad8d80',
    bio: '',
    school: '',
    verified: false,
  },
  {
    id: 'u5',
    name: 'OSG求职',
    comeniusId: '70005678',
    avatar: 'photo-1472099645785-5658abf4ff4e',
    bio: '',
    school: '',
    verified: true,
  },
  {
    id: 'u6',
    name: '犀牛竞赛学科Betty老师',
    comeniusId: '70006789',
    avatar: 'photo-1544005313-94ddf0286df2',
    bio: '',
    school: '',
    verified: false,
  },
  {
    id: 'u7',
    name: '小红薯6A1F1FFD',
    comeniusId: '70007890',
    avatar: 'photo-1500648767791-00dcc994a43e',
    bio: '',
    school: '',
    verified: false,
  },
  {
    id: 'u8',
    name: 'cUILt',
    comeniusId: '70008901',
    avatar: 'photo-1463453091185-61582044d556',
    bio: '',
    school: '',
    verified: false,
  },
  {
    id: 'u9',
    name: 'R.',
    comeniusId: '70009012',
    avatar: 'photo-1519345182560-3f2917c472ef',
    bio: '',
    school: '',
    verified: false,
  },
  {
    id: 'u10',
    name: 'A星拿不完',
    comeniusId: '70010123',
    avatar: 'photo-1534528741775-53994a69daeb',
    bio: '',
    school: '',
    verified: false,
  },
]

/** 群聊成员 */
export const GROUP_MEMBERS: User[] = [
  {
    id: 'g1',
    name: '陈老师',
    comeniusId: '70020001',
    avatar: 'photo-1500648767791-00dcc994a43e',
    bio: 'IB 经济教师 · 教研组长',
    school: 'Comenius',
    verified: true,
  },
  {
    id: 'g2',
    name: 'Sarah Lin',
    comeniusId: '70020002',
    avatar: 'photo-1494790108377-be9c29b29330',
    bio: 'AP 微积分 / 物理教师',
    school: 'Stanford',
    verified: false,
  },
  {
    id: 'g3',
    name: '刘同学',
    comeniusId: '70020003',
    avatar: 'photo-1438761681033-6461ffad8d80',
    bio: 'A-Level 数学 A*',
    school: '上海某国际学校',
    verified: false,
  },
  {
    id: 'g4',
    name: 'Betty 老师',
    comeniusId: '70020004',
    avatar: 'photo-1544005313-94ddf0286df2',
    bio: '竞赛学科负责人',
    school: '犀牛竞赛',
    verified: true,
  },
  {
    id: 'g5',
    name: '王同学',
    comeniusId: '70020005',
    avatar: 'photo-1519345182560-3f2917c472ef',
    bio: 'STEP II 学员',
    school: '上海某国际学校',
    verified: false,
  },
  // 以下两位还没有加入群聊，用来演示「邀请成员」
  {
    id: 'g6',
    name: '赵老师',
    comeniusId: '70020006',
    avatar: 'photo-1472099645785-5658abf4ff4e',
    bio: 'IB 化学教师',
    school: 'Comenius',
    verified: true,
  },
  {
    id: 'g7',
    name: '陈同学',
    comeniusId: '70020007',
    avatar: 'photo-1534528741775-53994a69daeb',
    bio: 'A-Level 高数 A*',
    school: '上海某国际学校',
    verified: false,
  },
]

export function getMember(id?: string): User | undefined {
  if (!id) return undefined
  return GROUP_MEMBERS.find(m => m.id === id)
}

const userCache = new Map<string, User>()

/** 任意昵称 → 稳定 User（已知用户直接返回，其余合成） */
export function getUser(name: string): User {
  const key = name.trim()
  const hit = userCache.get(key)
  if (hit) return hit
  const seed = SEED_USERS.find(u => u.name === key) ?? GROUP_MEMBERS.find(u => u.name === key)
  const user: User = seed ?? {
    id: 'u_' + key,
    name: key,
    comeniusId: String(71000000 + (hashStr(key) % 1000000)),
    avatar: AVATAR_POOL[hashStr(key) % AVATAR_POOL.length],
    bio: '',
    school: '',
    verified: false,
  }
  userCache.set(key, user)
  return user
}

export const userId = (name: string) => getUser(name).id

/** 初始会话（从 MessagesPage 迁来，补 userId；末尾一个是群聊） */
export const INITIAL_CONVERSATIONS: Conversation[] = [
  {
    id: 100,
    userId: 'group1',
    name: 'CIE 数学学习小组',
    avatar: 'photo-1524178232363-1fb2b075b655',
    last: '@Champion 周三晚七点老时间，STEP 卷二对答案',
    time: '10:24',
    unread: 3,
    isGroup: true,
    memberIds: ['g1', 'g2', 'g3', 'g4', 'g5'],
    announcement: '本周三 19:00 线上对 STEP 卷二，讲义已发群文件，先自己做完前 6 题。',
  },
  {
    id: 1,
    userId: 'u1',
    name: '小红薯6A25E445',
    last: '[谢谢你的赞H]谢谢你的赞',
    time: '8月6日',
    unread: 0,
    avatar: 'photo-1535713875002-d1d0cf377fde',
  },
  {
    id: 2,
    userId: 'u2',
    name: '陌生人消息',
    last: '沃克老师[国际计算机CS(吞晓)]: 可以进群...',
    time: '7月18日',
    unread: 1,
    avatar: 'photo-1494790108377-be9c29b29330',
  },
  {
    id: 3,
    userId: 'u3',
    name: '星焕-Dev Goyal',
    last: '[卡片]',
    time: '7月12日',
    unread: 0,
    avatar: 'photo-1507003211169-0a1dd7228f2d',
    verified: true,
    online: true,
  },
  {
    id: 4,
    userId: 'u4',
    name: 'Bambi',
    last: '这个笔记整理得好清楚，收藏了',
    time: '6月16日',
    unread: 0,
    avatar: 'photo-1438761681033-6461ffad8d80',
    online: true,
  },
  {
    id: 5,
    userId: 'u5',
    name: 'OSG求职',
    last: '[商家名片] OSG求职',
    time: '5月19日',
    unread: 0,
    avatar: 'photo-1472099645785-5658abf4ff4e',
    verified: true,
  },
  {
    id: 6,
    userId: 'u6',
    name: '犀牛竞赛学科Betty老师',
    last: '[商家名片] 犀牛竞赛学科Betty老师',
    time: '5月15日',
    unread: 0,
    avatar: 'photo-1544005313-94ddf0286df2',
  },
  {
    id: 7,
    userId: 'u7',
    name: '小红薯6A1F1FFD',
    last: '我这边是alevel考前面授一手源头 这边看到你...',
    time: '5月7日',
    unread: 0,
    avatar: 'photo-1500648767791-00dcc994a43e',
  },
  {
    id: 8,
    userId: 'u8',
    name: 'cUILt',
    last: '我这套只能说是90%概率',
    time: '5月6日',
    unread: 0,
    avatar: 'photo-1463453091185-61582044d556',
  },
  {
    id: 9,
    userId: 'u9',
    name: 'R.',
    last: '3个人拼也就几百',
    time: '5月6日',
    unread: 0,
    avatar: 'photo-1519345182560-3f2917c472ef',
  },
  {
    id: 10,
    userId: 'u10',
    name: 'A星拿不完',
    last: '非常抱歉这里回复不及时，麻烦留个🦆',
    time: '4月27日',
    unread: 0,
    avatar: 'photo-1534528741775-53994a69daeb',
  },
]

/** 初始聊天记录：群聊有完整历史（含笔记卡片与语音），Bambi 用来演示未读分隔线 */
export const INITIAL_MESSAGES: Record<string, Message[]> = {
  '100': [
    {
      from: 'other',
      senderId: 'g1',
      type: 'text',
      text: '这周的 STEP 卷二先自己做，周三我们只对答案不讲题。',
      time: '6月16日 09:40',
    },
    {
      from: 'other',
      senderId: 'g1',
      type: 'note',
      note: {
        id: 34,
        title: 'STEP 2 真题逐题精讲',
        img: 'photo-1501504905252-473c47e087f8',
        author: '宿舍楼长',
        likes: '1550',
      },
      time: '6月16日 09:41',
    },
    {
      from: 'me',
      type: 'text',
      text: '收到，我先做前六题，卡住的地方标出来。',
      status: 'read',
      time: '6月16日 09:52',
    },
    { from: 'other', senderId: 'g3', type: 'voice', duration: 12, time: '6月16日 10:02' },
    {
      from: 'other',
      senderId: 'g2',
      type: 'text',
      text: '第三题的积分换元容易走错方向，先画图再动手。',
      time: '6月16日 10:08',
    },
    {
      from: 'other',
      senderId: 'g3',
      type: 'text',
      text: '我上次就是卡在第三题，看了讲义才反应过来。',
      time: '6月16日 10:12',
    },
    {
      from: 'other',
      senderId: 'g4',
      type: 'text',
      text: '要参赛的同学注意，周三之后我这边开始集训报名。',
      time: '6月16日 10:20',
    },
    {
      from: 'other',
      senderId: 'g1',
      type: 'text',
      text: '@Champion 周三晚七点老时间，STEP 卷二对答案',
      time: '6月16日 10:24',
    },
  ],
  '4': [
    {
      from: 'me',
      type: 'text',
      text: '上次那份错题整理我发你了，你先看看有没有漏的。',
      status: 'read',
      time: '6月16日 14:20',
    },
    {
      from: 'other',
      type: 'text',
      text: '看完了，第七类题型我这边也有，回头补给你。',
      time: '6月16日 14:26',
    },
    { from: 'other', type: 'text', text: '这个笔记整理得好清楚，收藏了', time: '6月16日 14:27' },
  ],
}

const REPLIES = ['收到！', '好的，我看看～', '哈哈哈哈对', '没问题，稍后回你']

/** 对方 mock 自动回复 */
export function mockReply(): string {
  return REPLIES[hashStr(String(Date.now())) % REPLIES.length]
}

/** 群聊里的 mock 回复（顺便挑一个成员当发言人） */
export function mockGroupReply(memberIds: string[]): { text: string; senderId: string } {
  const n = hashStr(String(Date.now()))
  const texts = [
    '同意，我周三带讲义过去。',
    '这个思路我试过，确实比直接算快。',
    '收到，我今晚先把前六题过一遍。',
    '那我把上次的错题也一起发群里。',
  ]
  return { text: texts[n % texts.length], senderId: memberIds[n % memberIds.length] }
}
