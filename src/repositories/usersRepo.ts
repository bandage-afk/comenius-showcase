/**
 * 用户 / 群成员（现在 = 静态头像池；接后端 = `GET /users`、`GET /groups/:id/members`）。
 *
 * 页面不许 import 这个文件（有 lint 规则拦）：要用户信息就通过 store 的
 * `getUser` / `getMember` / `groupMembers` 拿，这样换数据源不用动页面。
 */

import { GROUP_MEMBERS, getMember, getUser, type User } from '../community/data'

/** 群成员池（邀请成员、判定群主/管理员用） */
export function listMembers(): User[] {
  return GROUP_MEMBERS
}

/** 成员 id（'me' / 'g1' …）→ User */
export function findMember(id?: string): User | undefined {
  return getMember(id)
}

/** 任意昵称 → 稳定 User（已知用户返回真身，其余按昵称合成，保证头像稳定） */
export function findByName(name: string): User {
  return getUser(name)
}
