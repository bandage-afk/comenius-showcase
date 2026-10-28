/**
 * 只读目录 slice：帖子 + 用户/群成员。
 * 它本身没什么逻辑（数据都来自 repository），但「页面读到的就是同一份数据」这件事值得钉住 ——
 * 以后接后端时，这里会变成「repo 拉回来写进 state」，页面侧不该有任何改动。
 */
import { beforeEach, describe, expect, it } from 'vitest'
import { useCommunity } from '../../communityStore'
import * as usersRepo from '../../repositories/usersRepo'

const initial = useCommunity.getState()

beforeEach(() => {
  useCommunity.setState(initial, true)
})

describe('catalogSlice', () => {
  it('帖子列表非空且每篇都有 id / author', () => {
    const posts = useCommunity.getState().posts
    expect(posts.length).toBeGreaterThan(0)
    expect(posts.every(p => typeof p.id === 'number' && p.author.length > 0)).toBe(true)
  })

  it('群成员池与 usersRepo 一致，且成员 id 唯一', () => {
    const members = useCommunity.getState().groupMembers
    expect(members).toBe(usersRepo.listMembers())
    expect(new Set(members.map(m => m.id)).size).toBe(members.length)
  })

  it('getUser 对未知昵称也会合成一个稳定用户（页面不会崩）', () => {
    const { getUser } = useCommunity.getState()
    const a = getUser('从没见过的昵称')
    const b = getUser('从没见过的昵称')
    expect(a).toBe(b)
    expect(a.avatar.length).toBeGreaterThan(0)
    expect(a.id.length).toBeGreaterThan(0)
  })
})
