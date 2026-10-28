import { db, type PostRow, type UserRow } from './db'

/**
 * Blog 版面编排：把文章按分数排入「槽位」（hero / grid / highlights ...）。
 *
 * score = freshness + engagement + imageBonus
 *   freshness   = exp(-ageHours / 72)   3 天半衰期，越新越高（0~1）
 *   engagement  = log(1 + likes*3 + comments*5) 的归一化值（点赞 3 分、评论 5 分）
 *   imageBonus  = hasCover ? 0.35 : 0
 *
 * 不含作者权重（产品决策）。热度数据（likes/comments）在 Phase 2 前为 0，自动退化。
 */

const HALF_LIFE_HOURS = 72
const IMAGE_BONUS = 0.35

export interface Article {
  id: string
  title: string
  content: string
  img: string
  tags: string[]
  createdAt: string
  likes: number
  comments: number
  author: { id: string; name: string; avatar: string; verified: boolean } | null
}

function toArticle(row: PostRow): Article {
  const author = db.prepare('SELECT * FROM users WHERE id = ?').get(row.author_id) as
    UserRow | undefined
  const likes =
    (
      db.prepare('SELECT COUNT(*) AS c FROM likes WHERE post_id = ?').get(row.id) as
        { c: number } | undefined
    )?.c ?? 0
  const comments =
    (
      db.prepare('SELECT COUNT(*) AS c FROM comments WHERE post_id = ?').get(row.id) as
        { c: number } | undefined
    )?.c ?? 0
  return {
    id: row.id,
    title: row.title,
    content: row.content,
    img: row.img,
    tags: JSON.parse(row.tags || '[]'),
    createdAt: row.created_at,
    likes,
    comments,
    author: author
      ? { id: author.id, name: author.name, avatar: author.avatar, verified: !!author.verified }
      : null,
  }
}

function score(a: Article): number {
  const ageHours = (Date.now() - new Date(a.createdAt).getTime()) / 3_600_000
  const freshness = Math.exp(-Math.max(0, ageHours) / HALF_LIFE_HOURS)

  const raw = a.likes * 3 + a.comments * 5
  // log(1+x)/log(1+100) 把常见量级压到 0~1
  const engagement = Math.log(1 + raw) / Math.log(101)

  const imageBonus = a.img ? IMAGE_BONUS : 0
  return freshness + engagement + imageBonus
}

export interface BlogLayout {
  hero: Article | null
  heroSecondary: Article[]
  grid: Article[]
  insider: Article | null
  highlights: Article[]
  profiles: Article[]
  sidebar: { weekInReview: Article | null; counselors: Article[] }
  /** 全部候选文章（按分数排序），供前端按分类筛选 */
  all: Article[]
  total: number
}

/** 取出候选文章（type=article 且发布到 blog 渠道），按分数降序 */
function candidates(): Article[] {
  const rows = db
    .prepare(
      "SELECT * FROM posts WHERE type = 'article' AND channels LIKE '%blog%' ORDER BY created_at DESC",
    )
    .all() as unknown as PostRow[]
  return rows.map(toArticle).toSorted((a, b) => score(b) - score(a))
}

/** 从池子里按「是否必须有图」取 n 篇；取走的从池子移除 */
function take(pool: Article[], n: number, requireImage: boolean): Article[] {
  const out: Article[] = []
  for (let i = 0; i < pool.length && out.length < n;) {
    const a = pool[i]
    if (!requireImage || a.img) {
      out.push(a)
      pool.splice(i, 1) // 取走
    } else {
      i++ // 没图，跳过本篇继续找
    }
  }
  return out
}

export function buildBlogLayout(): BlogLayout {
  const all = candidates()
  const total = all.length
  const pool = [...all]

  // 头版必须有图
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
    total,
  }
}
