/**
 * 功能开关。
 *
 * 为什么需要它：4 个人并行时，最影响效率的不是写代码，而是**不完整的功能不敢合进 main**
 * （一合就上生产，用户就看见半成品）。有了开关，未完成的功能可以先合、先发，
 * 默认关着，做完再打开——这才是"小步合并"能落地的前提。
 *
 * 用法：
 *   if (flags.demoNav) return <DemoNav ... />
 *
 * 三个覆盖途径（优先级从高到低）：
 *   1. URL 参数：?flag=ranking,newComposer   /  ?flag=-demoNav（带 - 表示关闭）
 *   2. localStorage：comenius_flags = '{"ranking":true}'
 *   3. 代码里的默认值（下面这张表）
 *
 * ⚠️ 开关是**临时脚手架**，不是永久配置。功能上线并稳定后要把开关和默认值一起删掉，
 * 否则过半年没人敢动。每个开关都要写清"什么时候能删"。
 */

const DEFAULTS = {
  /** 右下角浮动页签（演示用跳板）。删掉它的前提：登录注册 / 写想法 有正式入口 */
  demoNav: true,
  /** 推荐排序器接进首页（骨架在 src/feed/ranking，尚未接线） */
  ranking: false,
} as const

export type FlagName = keyof typeof DEFAULTS

function fromUrl(): Record<string, boolean> {
  if (typeof window === 'undefined') return {}
  const raw = new URLSearchParams(window.location.search).get('flag')
  if (!raw) return {}
  const out: Record<string, boolean> = {}
  for (const part of raw.split(',')) {
    const name = part.trim()
    if (!name) continue
    out[name.startsWith('-') ? name.slice(1) : name] = !name.startsWith('-')
  }
  return out
}

function fromStorage(): Record<string, boolean> {
  if (typeof localStorage === 'undefined') return {}
  try {
    return JSON.parse(localStorage.getItem('comenius_flags') ?? '{}') as Record<string, boolean>
  } catch {
    return {}
  }
}

export function isEnabled(name: FlagName): boolean {
  const overrides = { ...fromStorage(), ...fromUrl() }
  return overrides[name] ?? DEFAULTS[name]
}

/** 一次性读全部开关（组件里用这个，避免每处都算一遍） */
export function readFlags(): Record<FlagName, boolean> {
  const keys = Object.keys(DEFAULTS) as FlagName[]
  return Object.fromEntries(keys.map(k => [k, isEnabled(k)])) as Record<FlagName, boolean>
}

/** 开发期调试：控制台里改开关后刷新即可生效 */
export function setFlag(name: FlagName, on: boolean) {
  if (typeof localStorage === 'undefined') return
  const next = { ...fromStorage(), [name]: on }
  localStorage.setItem('comenius_flags', JSON.stringify(next))
}

export const flags = readFlags()
