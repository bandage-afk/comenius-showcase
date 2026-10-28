// Podcast 长视频数据（纯前端 mock 种子），后续接后端替换。
// videoUrl 用公开示例 mp4 占位，cover 用 Unsplash photo-id。

export const PODCAST_CATEGORIES = ['TED演讲', '学校采访', '学生采访', '老师分享'] as const
export type PodcastCategory = (typeof PODCAST_CATEGORIES)[number]

export interface PodcastEpisode {
  id: string
  title: string
  author: string
  category: PodcastCategory
  duration: string
  cover: string // Unsplash photo-id
  videoUrl: string // 示例 mp4
  description?: string
  plays?: number
}

const V = (name: string) => `https://storage.googleapis.com/gtv-videos-bucket/sample/${name}`

export const EPISODES: PodcastEpisode[] = [
  // TED演讲
  {
    id: 'e1',
    title: '为什么好奇心比天赋更重要',
    author: '夸美纽斯课堂',
    category: 'TED演讲',
    duration: '12:48',
    cover: 'photo-1478737270239-2f02b77fc618',
    videoUrl: V('BigBuckBunny.mp4'),
    plays: 128000,
    description:
      '一场关于学习动力的演讲：真正拉开差距的，往往不是天赋，而是持续追问「为什么」的好奇心。',
  },
  {
    id: 'e2',
    title: '把失败讲成一个好故事',
    author: '李知远',
    category: 'TED演讲',
    duration: '09:35',
    cover: 'photo-1524178232363-1fb2b075b655',
    videoUrl: V('ForBiggerBlazes.mp4'),
    plays: 86000,
    description: '申请季的每一次被拒，其实都在帮你重新认识自己。',
  },
  {
    id: 'e3',
    title: '十年后回头看，今天的选择重要吗',
    author: '夸美纽斯课堂',
    category: 'TED演讲',
    duration: '15:20',
    cover: 'photo-1517245386807-bb43f82c33c4',
    videoUrl: V('ForBiggerEscapes.mp4'),
    plays: 210000,
    description: '关于选择与长期主义的思考。',
  },

  // 学校采访
  {
    id: 'e4',
    title: '走进剑桥：数学系的一天',
    author: '夸美纽斯编辑部',
    category: '学校采访',
    duration: '22:10',
    cover: 'photo-1523050854058-8df90110c9f1',
    videoUrl: V('ForBiggerFun.mp4'),
    plays: 154000,
    description: '跟着镜头走进剑桥数学系，看看真实的课堂与自习室。',
  },
  {
    id: 'e5',
    title: '牛津招生官面对面：他们到底在看什么',
    author: '夸美纽斯编辑部',
    category: '学校采访',
    duration: '18:42',
    cover: 'photo-1564981797816-1043664bf78d',
    videoUrl: V('ForBiggerJoyrides.mp4'),
    plays: 98000,
    description: '前招生官揭秘申请材料里真正被看重的东西。',
  },
  {
    id: 'e6',
    title: 'LSE 图书馆的深夜',
    author: '顾言秋',
    category: '学校采访',
    duration: '11:05',
    cover: 'photo-1456406644174-8ddd4cd52a06',
    videoUrl: V('ForBiggerMeltdowns.mp4'),
    plays: 47000,
    description: '凌晨两点的 LSE 图书馆，还有多少人在为 deadline 拼命。',
  },

  // 学生采访
  {
    id: 'e7',
    title: '从 B 到 A*：我的数学逆袭',
    author: '李知远',
    category: '学生采访',
    duration: '14:28',
    cover: 'photo-1434030216411-0b793f4b4173',
    videoUrl: V('Sintel.mp4'),
    plays: 72000,
    description: '一位学弟复盘自己一年内从 B 冲到 A* 的全部方法。',
  },
  {
    id: 'e8',
    title: 'IB 45 分学霸的时间表',
    author: '王述',
    category: '学生采访',
    duration: '16:50',
    cover: 'photo-1523240795612-9a054b0db644',
    videoUrl: V('TearsOfSteel.mp4'),
    plays: 61000,
    description: '满分背后，是一张被精确到半小时的时间表。',
  },
  {
    id: 'e9',
    title: '拿到剑桥 offer 的那个下午',
    author: '上岸的学姐',
    category: '学生采访',
    duration: '08:12',
    cover: 'photo-1517486808906-6ca8b3f04846',
    videoUrl: V('SubaruOutbackOnStreetAndDirt.mp4'),
    plays: 134000,
    description: '等待 87 天后，那封邮件终于来了。',
  },

  // 老师分享
  {
    id: 'e10',
    title: '竞赛教练：AMC 前 1% 是怎么练出来的',
    author: '陈明远',
    category: '老师分享',
    duration: '26:33',
    cover: 'photo-1503676260728-1c00da094a0b',
    videoUrl: V('ElephantsDream.mp4'),
    plays: 89000,
    description: '十年竞赛教练的选材眼光与训练体系。',
  },
  {
    id: 'e11',
    title: '前考官谈雅思口语：评分点到底在哪',
    author: '张静',
    category: '老师分享',
    duration: '20:15',
    cover: 'photo-1427504494785-3a9ca7044f45',
    videoUrl: V('ForBiggerFun.mp4'),
    plays: 176000,
    description: '口语不是玄学，前考官把评分点一条条拆给你看。',
  },
  {
    id: 'e12',
    title: '30 年教师：我给家长的三条建议',
    author: '林远山',
    category: '老师分享',
    duration: '19:47',
    cover: 'photo-1522202176988-66273c2fd55f',
    videoUrl: V('ForBiggerEscapes.mp4'),
    plays: 52000,
    description: '关于规划、关于放手、关于信任。',
  },
]
