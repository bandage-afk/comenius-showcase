// 灯箱用的评论池、地点、头像底色与派生数据（常量 + 纯函数）。
import type { Post } from '../../data/posts'

export const COMMENT_NAMES = [
  '数学小能手',
  '上岸的学姐',
  '牛津预备生',
  '熬夜刷题人',
  '留学路上',
  'A*冲刺中',
  '剑桥候鸟',
  '卷王本卷',
  '深夜图书馆',
  'offer收割机',
  '经济学人',
  '物理爱好者',
  '曼大在读',
  'IC码农',
  'LSE商科',
  '文书改稿人',
  '面试恐惧症',
  '备考日记',
  '宿舍楼长',
  '图书馆常客',
]

export const COMMENT_TEXTS = [
  '太真实了，感同身受',
  '收藏了，谢谢分享！',
  '请问有完整版吗？',
  '这不就是我吗哈哈哈',
  '求更新下一篇！',
  '学到就是赚到',
  '已转发给闺蜜，一起卷',
  '这个方法真的有用，亲测',
  '同款经历，握手',
  '最后一句扎心了',
  '讲得很清楚，比老师讲的明白',
  '想问一下大概准备了多久？',
  '码住，明天就开始',
  '看完默默放下了手机',
  '太强了，望尘莫及',
  '这就是传说中的别人家孩子吗',
  '已收藏，谢谢大佬',
  '说得太对了，点赞',
  '我直接一个收藏',
  '救命，太真实了',
]

export const LOCATIONS = [
  '广东',
  '浙江',
  '北京',
  '上海',
  '四川',
  '福建',
  '江苏',
  '山东',
  '河南',
  '湖南',
  '湖北',
  '陕西',
  '日本',
  '英国',
  '美国',
  '澳大利亚',
  '新加坡',
]
export const AVATAR_COLORS = ['#FFB347', '#7C9EFF', '#58C9A8', '#E58EC9', '#A78BFA', '#F28B82']
export const PINNED_NOTICE = '评论区出现骂人的词汇我会删除，请友好发言！'

export interface LightboxComment {
  name: string
  text: string
  time: string
  location: string
  likes: number
  replies: number
  url?: string
}

export function getComments(post: Post, page = 0): LightboxComment[] {
  const out: LightboxComment[] = []
  const count = page === 0 ? 14 : 10
  for (let i = 0; i < count; i++) {
    const seed = post.id * 131 + page * 97 + i * 13 + 11
    out.push({
      name: COMMENT_NAMES[seed % COMMENT_NAMES.length],
      text: COMMENT_TEXTS[(seed + 7) % COMMENT_TEXTS.length],
      time: `07-${String(((seed * 3) % 28) + 1).padStart(2, '0')}`,
      location: LOCATIONS[seed % LOCATIONS.length],
      likes: (seed * 37) % 9000,
      replies: i % 3 === 1 ? ((seed * 13) % 200) + 3 : 0,
    })
  }
  return out
}

export function getReplies(post: Post, seed: number): LightboxComment[] {
  const count = 2 + (seed % 3)
  const out: LightboxComment[] = []
  for (let i = 0; i < count; i++) {
    const s = seed * 17 + i * 29 + 5
    out.push({
      name: COMMENT_NAMES[(s + 3) % COMMENT_NAMES.length],
      text: COMMENT_TEXTS[(s + 11) % COMMENT_TEXTS.length],
      time: `07-${String(((s * 5) % 28) + 1).padStart(2, '0')}`,
      location: LOCATIONS[(s + 5) % LOCATIONS.length],
      likes: (s * 19) % 1200,
      replies: 0,
    })
  }
  return out
}

/** 「1.2万」↔ 数字，纯函数所以放模块作用域，避免每次渲染重建 */
export const parseCount = (s: string): number =>
  s.includes('万') ? Math.round(parseFloat(s) * 10000) : parseInt(s.replace(/,/g, ''), 10) || 0
export const fmtCount = (n: number): string =>
  n >= 10000 ? `${(n / 10000).toFixed(1).replace(/\.0$/, '')}万` : String(n)
