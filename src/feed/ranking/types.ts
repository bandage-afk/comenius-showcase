/**
 * 推荐系统的输入 / 输出类型。
 *
 * 命名刻意对齐 X 开源算法（x-algorithm-main），方便日后对照它改了哪里：
 *   home-mixer/models/candidate.rs   → Candidate
 *   home-mixer/models/query.rs       → Viewer（对应它的 user_features）
 */

/** 候选内容（帖 / 笔记 / 播客） */
export interface Candidate {
  id: number
  authorId: string
  authorName: string
  title: string
  tags: string[]
  likes: number
  collects: number
  comments: number
  /** 发布时间戳（ms） */
  createdAt: number
  kind: 'image' | 'video' | 'article' | 'podcast' | 'text'
  /** 该作者已发布的内容条数——冷启动判断用（对应 author_cold_start.rs） */
  authorPostCount: number
  /** 我自己发的：不进推荐流 */
  isMine?: boolean
}

/** 看信息流的人（对应 X 的 user_features） */
export interface Viewer {
  userId: string
  /** 我关注的人 */
  following: string[]
  /** 互关的人——对应 X 2026-07 上线的 bidirectional follow boost */
  mutuals: string[]
  likedIds: number[]
  collectedIds: number[]
  /** 已看过：发现流要剔除，关注流要下沉 */
  seenIds: number[]
  /** 话题兴趣权重 0–1，来自浏览/停留统计 */
  topicWeights: Record<string, number>
  blockedAuthors: string[]
  mutedAuthors: string[]
  mutedKeywords: string[]
}

/** 候选来源分层（对应 home-mixer/sources/） */
export type SourceKey = 'following' | 'mutual' | 'outOfNetwork' | 'popular' | 'fresh'

export interface ScoredTerm {
  /** 特征名，对齐 X 的 PhoenixScores 字段 */
  key: string
  /** 该特征对总分的贡献（已乘权重，带符号） */
  value: number
}

export interface ScoredCandidate {
  candidate: Candidate
  source: SourceKey
  score: number
  positive: number
  negative: number
  /** 命中多样性衰减时记录乘子 */
  diversityMultiplier: number
  terms: ScoredTerm[]
  /** 给人看的推荐理由（"因为你关注了 X"） */
  reasons: string[]
}

export interface RankOptions {
  /** 取前 N 条 */
  limit?: number
  /** 同一作者在这一屏最多几条（对应 author diversity） */
  maxPerAuthor?: number
  /** 注入"现在"，便于测试确定性 */
  now?: number
}
