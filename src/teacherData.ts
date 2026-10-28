/**
 * 教师端用的类型与工具（从另一套实现移植过来）。
 *
 * 只有类型 + 图片 URL 助手：教师端页面（工作台 / 排课日历 / 课程管理 /
 * 学生管理 / 收入中心 / 我的）自己的数据在 teacherStore 里。
 */

export interface Course {
  id: string
  title: string
  description: string
  price: number // ¥/小时
  duration: string
  category?: string
}

export interface Credential {
  title: string
  issuer: string
  year: string
  image: string
}

export interface Evidence {
  type: string
  caption: string
  image: string
}

export interface ReviewItem {
  name: string
  star: number
  text: string
  date: string
  images?: string[]
}

export interface EducationItem {
  school: string
  degree: string
  major: string
  years: string
}

export interface ExperienceItem {
  role: string
  org: string
  years: string
}

/** Unsplash photo-id → 按尺寸裁剪的 URL（已是完整 URL / data URL 就原样返回） */
export function img(key: string, w = 800, h?: number) {
  if (!key) return ''
  if (key.startsWith('data:') || key.startsWith('http')) return key
  return `https://images.unsplash.com/${key}?w=${w}${h ? `&h=${h}` : ''}&fit=crop&auto=format`
}
