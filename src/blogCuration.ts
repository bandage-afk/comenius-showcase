/**
 * Blog 杂志版面的**编排算法**（从另一套实现移植）。
 *
 * 杂志式版面需要回答「哪篇文章放哪个位置」——真实杂志是编辑手工排的，
 * 这里是自动排：给每篇文章打分，按分数从高到低填进**有序槽位**。
 *
 *   score = freshness + engagement + imageBonus
 *     freshness  = exp(-ageHours / 72)            3 天半衰期
 *     engagement = log(1 + likes*3 + comments*5)  对数归一
 *     imageBonus = hasCover ? 0.35 : 0
 *
 * ⚠️ 当前 `BlogPost` 只有 id/title/category/readTime/img/excerpt，
 * 没有 createdAt / likes / comments —— 缺失的维度按 0 处理，
 * 于是现在实际生效的是「**有图优先**」。等数据源补齐字段，算法自动完整生效。
 */
import type { BlogPost } from './blogData'

/** 编排用的中间形状：BlogPost + 可选的热度/时间字段 */
export interface RankablePost extends BlogPost {
  content?: string
  createdAt?: string
  likes?: number
  comments?: number
}

export interface BlogLayout {
  hero: RankablePost | null
  heroSecondary: RankablePost[]
  grid: RankablePost[]
  insider: RankablePost | null
  highlights: RankablePost[]
  profiles: RankablePost[]
  sidebar: { weekInReview: RankablePost | null; counselors: RankablePost[] }
  /** 全部候选（按分数排序），供分类筛选 */
  all: RankablePost[]
  total: number
}

const HALF_LIFE_HOURS = 72
const IMAGE_BONUS = 0.35

function score(p: RankablePost): number {
  // 时效：没有 createdAt 就按「一样新」处理（freshness = 1 的等价做法：取中位）
  const ageHours = p.createdAt ? (Date.now() - new Date(p.createdAt).getTime()) / 3_600_000 : 0
  const freshness = p.createdAt ? Math.exp(-Math.max(0, ageHours) / HALF_LIFE_HOURS) : 0.5

  // 热度：没有点赞/评论就是 0（对数归一后仍为 0）
  const raw = (p.likes ?? 0) * 3 + (p.comments ?? 0) * 5
  const engagement = raw > 0 ? Math.log(1 + raw) / Math.log(101) : 0

  const imageBonus = p.img ? IMAGE_BONUS : 0
  return freshness + engagement + imageBonus
}

/** 从池子里按「是否必须有图」取 n 篇；取走的从池子移除 */
function take(pool: RankablePost[], n: number, requireImage: boolean): RankablePost[] {
  const out: RankablePost[] = []
  for (let i = 0; i < pool.length && out.length < n;) {
    const p = pool[i]
    if (!requireImage || p.img) {
      out.push(p)
      pool.splice(i, 1)
    } else {
      i++
    }
  }
  return out
}

/** 把候选文章排进槽位 */
export function buildBlogLayout(source: RankablePost[]): BlogLayout {
  const all = [...source].sort((a, b) => score(b) - score(a))
  const pool = [...all]

  // 头版大图位必须有图
  const hero = take(pool, 1, true)[0] ?? null
  const heroSecondary = take(pool, 2, true)
  const grid = take(pool, 4, true)
  const insider = take(pool, 1, true)[0] ?? null

  // 以下图可选
  const highlights = take(pool, 4, false)
  const profiles = take(pool, 3, false)

  const weekInReview = take(pool, 1, true)[0] ?? null
  const counselors = take(pool, 3, false)

  return {
    hero,
    heroSecondary,
    grid,
    insider,
    highlights,
    profiles,
    sidebar: { weekInReview, counselors },
    all,
    total: all.length,
  }
}
