/**
 * 打分的权重表。
 *
 * ⚠️ 重要事实：**X 的权重值不在开源仓库里**，它们是线上运行时参数
 * （`home-mixer/params/param.rs` 通过 params 服务取）。仓库公开的是
 * **结构**——有哪些特征、正负项怎么合、多样性怎么衰减。
 * 所以下面的数值是**我们自己定的初值**，key 名保持和 X 一致，方便对照与替换。
 *
 * 定值思路（教育社区，不是社交信息流）：
 *   · 收藏 > 点赞（收藏代表"以后还要用"，是学习场景最强信号）
 *   · 回复 > 转发（问答是这个社区的核心价值）
 *   · 关注作者权重高（把好老师沉淀成关系，而不是一次性消费）
 *   · 负反馈一律重罚（教育社区最怕内容质量崩，宁可少推）
 */
export interface RankingWeights {
  favorited: number
  replied: number
  shared: number
  clicked: number
  dwelled: number
  followedAuthor: number
  profileClicked: number
  notInterested: number
  blocked: number
  muted: number
  reported: number
  notDwelled: number
  /** 探索加成：把没见过的好内容推出来（X 的 post_unexplored） */
  unexplored: number
  /** 互关加成：加在「回复」的预测权重上（X 的 bidirectional_follow_reply_weight_boost） */
  bidirectionalFollowBoost: number
  /** 负分区间归一用的常数（X 的 negative_sum / total_sum） */
  negativeSum: number
  totalSum: number
  /** 负分偏移量（X 的 NEGATIVE_SCORES_OFFSET） */
  negativeScoresOffset: number
}

export const DEFAULT_WEIGHTS: RankingWeights = {
  favorited: 1.0,
  replied: 1.6,
  shared: 0.6,
  clicked: 0.3,
  dwelled: 0.45,
  followedAuthor: 1.2,
  profileClicked: 0.35,
  notInterested: 3.0,
  blocked: 6.0,
  muted: 3.0,
  reported: 8.0,
  notDwelled: 1.2,
  unexplored: 0.35,
  bidirectionalFollowBoost: 15,
  negativeSum: 12,
  totalSum: 3,
  negativeScoresOffset: 1,
}
