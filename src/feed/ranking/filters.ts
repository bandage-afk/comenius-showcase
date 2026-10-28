/**
 * 过滤器：进打分之前先淘汰不该出现的东西。
 *
 * X 的 `home-mixer/filters/` 里有 40 多个过滤器，下面是其中**与我们相关、
 * 且必须有的**那些（括号里是它对应的文件名）。这一层比打分更重要：
 * 打分算错了只是排序不好，过滤器漏了会出事故（把自己的草稿推给别人、
 * 把用户拉黑的人又推回来）。
 */
import type { Candidate, Viewer } from './types'

/** 已看过的：发现流直接剔除（对应 dedup / already-seen 逻辑） */
export const removeSeen = (list: Candidate[], viewer: Viewer, keepSeen: boolean) =>
  keepSeen ? list : list.filter(c => !viewer.seenIds.includes(c.id))

/** 自己发的内容不进推荐流（对应 author_socialgraph_filter） */
export const removeOwnPosts = (list: Candidate[], viewer: Viewer) =>
  list.filter(c => !c.isMine && c.authorId !== viewer.userId)

/** 拉黑 / 静音的人（对应 blocked_by_hydrator + muted） */
export const removeBlockedAndMuted = (list: Candidate[], viewer: Viewer) =>
  list.filter(
    c => !viewer.blockedAuthors.includes(c.authorId) && !viewer.mutedAuthors.includes(c.authorId),
  )

/** 命中静音关键词（对应 following_viewer_muted_keyword_filter） */
export const removeMutedKeywords = (list: Candidate[], viewer: Viewer) =>
  list.filter(c => {
    const text = `${c.title} ${c.tags.join(' ')}`.toLowerCase()
    return !viewer.mutedKeywords.some(k => k && text.includes(k.toLowerCase()))
  })

/** 完全重复的内容：同标题只留最新的（对应 drop_duplicates_filter） */
export const dropDuplicates = (list: Candidate[]) => {
  const kept = new Map<string, Candidate>()
  for (const c of list) {
    const key = c.title.trim().toLowerCase()
    const prev = kept.get(key)
    if (!prev || c.createdAt > prev.createdAt) kept.set(key, c)
  }
  return [...kept.values()]
}

/**
 * 时效衰减：太老的内容不再进发现流（对应 age_filter）。
 * 注意关注流要放宽——关注的人发的东西，老一点也该看到。
 */
export const filterByAge = (list: Candidate[], now: number, maxDays: number) =>
  list.filter(c => now - c.createdAt <= maxDays * 86400_000)

/**
 * 统一的过滤管线。顺序有讲究：先做便宜的判断，再做需要遍历文本的。
 * `keepSeen` 为 true 表示这是关注流（看过的保留但会被下沉）。
 */
export function runFilters(
  list: Candidate[],
  viewer: Viewer,
  opts: { now: number; maxAgeDays: number; keepSeen: boolean },
): Candidate[] {
  let out = list
  out = removeOwnPosts(out, viewer)
  out = removeBlockedAndMuted(out, viewer)
  out = dropDuplicates(out)
  out = removeMutedKeywords(out, viewer)
  out = filterByAge(out, opts.now, opts.maxAgeDays)
  out = removeSeen(out, viewer, opts.keepSeen)
  return out
}
