import type { Connection, Post } from './types'

// 教师模块（领英版式）的动态与人脉 mock 数据。
// 职业档案（经历/学历/技能/证书…）已搬到 src/profile/career.ts，由 profileStore 持有。

export const initialPosts: Post[] = [
  {
    id: '1',
    author: '李知远',
    authorRole: 'A-Level 数学 / STEP 教师',
    authorAvatar:
      'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=48&h=48&fit=crop&auto=format',
    content:
      '这轮 STEP II 集训结束了，12 场专题课 + 6 场模拟考讲评。想说的是：STEP 的分差基本不在「会不会做」，而在「读题到动笔之间那两分钟」。我们花了整整两讲专门练这件事——先写清题目给了什么、要求什么、还差什么，再动笔。学生反馈说这是整个集训里最有用的一段。🧵',
    image:
      'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&h=300&fit=crop&auto=format',
    time: '2 天前',
    likes: 847,
    reposts: 124,
    liked: false,
    reposted: false,
    comments: [
      {
        id: 'c1',
        author: '刘同学',
        avatar:
          'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=32&h=32&fit=crop&auto=format',
        content: '这两讲真的救命，之前每次都是看到题就闷头算，写到一半发现方向错了。',
        time: '1 天前',
        likes: 23,
      },
      {
        id: 'c2',
        author: '家长 M',
        avatar:
          'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=32&h=32&fit=crop&auto=format',
        content: '孩子回家主动讲题了，这个变化比分数更让我们高兴。',
        time: '18 小时前',
        likes: 14,
      },
    ],
  },
  {
    id: '2',
    author: 'Sarah Lin',
    authorRole: 'AP 微积分 / 物理教师 · 斯坦福在读',
    authorAvatar:
      'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=48&h=48&fit=crop&auto=format',
    content:
      '一个观察：理科生的英文术语障碍，八成不是词汇量问题，而是没建立「同一个概念的两种说法」之间的连接。我现在的做法是每讲一个概念，都让学生用它造一句英文句子。三周之后他们听英文讲题明显不吃力了。你们带 AP / IB 的时候有什么办法？',
    time: '1 周前',
    likes: 1203,
    reposts: 287,
    liked: false,
    reposted: false,
    comments: [
      {
        id: 'c3',
        author: '陈老师',
        avatar:
          'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=32&h=32&fit=crop&auto=format',
        content:
          '我会让学生把 past paper 的 marking scheme 念出来，术语和得分点一起过，效果也不错。',
        time: '6 天前',
        likes: 89,
      },
    ],
  },
  {
    id: '3',
    author: '陈老师',
    authorRole: 'IB 经济教师 · 教研组长',
    authorAvatar:
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=48&h=48&fit=crop&auto=format',
    content:
      '我们教研组秋季还想招 2 位 A-Level / IB 数学与经济方向的老师，线上模式，时间比较灵活。有想法直接私信我，也可以先来看看课。在读的学长学姐也欢迎来做专项课。',
    time: '2 周前',
    likes: 3421,
    reposts: 512,
    liked: false,
    reposted: false,
    comments: [],
  },
]

export const initialConnections: Connection[] = [
  {
    id: '1',
    name: '陈老师',
    role: 'IB 经济教师 · 教研组长',
    avatar:
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&h=80&fit=crop&auto=format',
    mutualConnections: 14,
    connected: true,
    pending: false,
  },
  {
    id: '2',
    name: 'Sarah Lin',
    role: 'AP 微积分 / 物理教师 · 斯坦福在读',
    avatar:
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop&auto=format',
    mutualConnections: 22,
    connected: true,
    pending: false,
  },
  {
    id: '3',
    name: '沃克老师',
    role: '国际计算机 CS 教师',
    avatar:
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&auto=format',
    mutualConnections: 8,
    connected: false,
    pending: false,
  },
  {
    id: '4',
    name: 'Betty 老师',
    role: '竞赛学科负责人 · 犀牛竞赛',
    avatar:
      'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=80&h=80&fit=crop&auto=format',
    mutualConnections: 31,
    connected: false,
    pending: false,
  },
  {
    id: '5',
    name: '刘同学',
    role: 'A-Level 数学学员 · A*',
    avatar:
      'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&h=80&fit=crop&auto=format',
    mutualConnections: 5,
    connected: false,
    pending: true,
  },
  {
    id: '6',
    name: '王同学',
    role: 'STEP II 学员 · 剑桥 conditional offer',
    avatar:
      'https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=80&h=80&fit=crop&auto=format',
    mutualConnections: 12,
    connected: false,
    pending: false,
  },
  {
    id: '7',
    name: '家长 M',
    role: '学员家长',
    avatar:
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&h=80&fit=crop&auto=format',
    mutualConnections: 7,
    connected: false,
    pending: false,
  },
  {
    id: '8',
    name: '张老师',
    role: '升学规划顾问 · 前招生官',
    avatar:
      'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=80&h=80&fit=crop&auto=format',
    mutualConnections: 19,
    connected: true,
    pending: false,
  },
]
