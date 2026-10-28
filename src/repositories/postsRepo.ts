/**
 * 社区笔记 / 帖子（现在 = `src/data/posts.ts` 的 mock 数组；接后端 = `GET /posts` 系列）。
 *
 * 页面不许 import 这个文件：帖子通过 store 的 `posts` 拿（页面订阅 state，
 * 后端数据到了会自动重渲染，页面代码不用改）。
 *
 * ── 接后端（2026-10-04）──────────────────────────────────────────────────────
 * 这里有**两种数据源**，用 `VITE_API_BASE` 开关切换（照抄 ADR-0006 / `feat/backend-contracts` 的思路）：
 *
 *   [A] 本地种子数据（默认，也是单测环境）  → listPosts() 直接返回 mock 数组
 *   [B] 真后端（配了地址就用）              → fetch GET /api/posts
 *
 * 「首屏同步 + 后台异步」的取数策略（为了让页面零改动）：
 *
 *   1. `listPosts()` 是**同步**的：优先给上次成功拉取的缓存（localStorage），
 *      没有缓存就给本地种子数据。所以页面首屏永远有东西显示，不会白屏。
 *   2. `reloadPosts()` 在后台发请求，成功后**写回 store 的 state**，页面自动重渲染。
 *   3. 失败不抛错（见 errors.ts 的约定）：保留现有数据，dev 控制台记一笔。
 *
 * 「点赞数」的处理见 docs/数据对应表.md 第 4 节：后端给数字（如 15000），
 * 前端要展示文字（如 '1.5万'），所以这一层把数字格式化成文字。
 */

import { POSTS, type Post, type PostType } from '../data/posts'
import { readJSON, writeJSON } from './localStore'
import { reportRepoError } from './errors'

/**
 * 后端地址开关（照抄 ADR-0006 / `feat/backend-contracts` 的约定）：
 *
 *   const API_BASE = import.meta.env.VITE_API_BASE
 *   const hasBackend = Boolean(API_BASE)
 *
 * - 配了 `VITE_API_BASE` → 走真后端（本地开发看在 `.env.local` 里写 `http://localhost:3000`）
 * - 没配 → **回落本地种子数据，不猜地址**
 *
 * 为什么不"开发模式自动猜 localhost:3000"：那条路依赖 dev 服务器的工作目录，
 * 而且会让「有没有接后端」这件事变得不可见 —— 显式配置比聪明更可靠。
 * 开关语义见 docs/数据对应表.md 第 7 节。
 */
const API_BASE: string | undefined = import.meta.env.VITE_API_BASE

/** true = 走真后端；false = 用本地种子数据 */
export const hasBackend = Boolean(API_BASE)

/** 后端 GET /api/posts 返回的形状（照后端 src/index.ts 的 toPublicPost） */
interface BackendAuthor {
  id: string
  name: string
  avatar: string
  comeniusId: string
  verified: boolean
}
interface BackendPost {
  id: string
  type: string
  img: string
  title: string
  content: string
  quote: string
  quoteEmoji: string
  tags: string[]
  duration: string
  videoUrl: string
  channels?: string[]
  createdAt?: string
  likes?: number
  collects?: number
  comments?: number
  author: BackendAuthor
}

/** 缓存键：上次成功从后端拉到的**原始**帖子（存原始数据，见下面 toFrontendPost 的说明） */
const CACHE_KEY = 'comenius_posts_cache_v1'

/** 后端认的 5 种帖子类型 */
const VALID_TYPES: readonly PostType[] = ['image', 'text', 'video', 'article', 'podcast']

/**
 * 为什么缓存里存**原始**数据而不是转换后的 `Post`：
 * `Post.id` 是数字，需要用 uuid 稳定换算出来。如果直接缓存数字版，
 * 将来换算规则一改，缓存里的旧 id 就会和 `likes`/`collects` 里记的 id 对不上，点赞状态丢失。
 * 存原始 uuid，映射在内存里做，就永远对得上。
 */
const cachedRaw: BackendPost[] = hasBackend ? readJSON<BackendPost[]>(CACHE_KEY, []) : []

/** 数字 → 展示文字，规则与 src/pages/feed/lightboxData.ts 的 fmtCount 一致（>=1万 用「万」） */
function formatCount(n: number): string {
  if (n >= 10000) return `${(n / 10000).toFixed(1).replace(/\.0$/, '')}万`
  return String(n)
}

/**
 * uuid → **稳定的**数字 id。
 *
 * 为什么必须稳定：`likes` / `collects` 存的是数字 id（`number[]`），
 * 每次刷新都换一套 id 的话，用户点过的赞就全丢了。
 *
 * 为什么必须 **< 1e12**：`PostLightbox` 用 `post.id > 1e12` 判断「这是不是我发的帖子」
 * （自己发的用 `Date.now()`，约 1.79e12）。换算值必须留在这条线以下，
 * 否则所有后端帖子都会被误判成「我发的」。
 *
 * 算法：djb2 哈希取模 1e9，落进 [1e9, 2e9) —— 稳定、够分散、远低于 1e12。
 */
function stableNumericId(uuid: string): number {
  let h = 5381
  for (let i = 0; i < uuid.length; i++) h = ((h * 33) ^ uuid.charCodeAt(i)) >>> 0
  return 1_000_000_000 + (h % 1_000_000_000)
}

/** ISO 时间 → 界面上的相对时间（「刚刚 / 3 分钟前 / 2 天前」），与前端现有文案风格一致 */
function relativeTime(iso?: string): string {
  if (!iso) return ''
  const t = Date.parse(iso)
  if (Number.isNaN(t)) return ''
  const diff = Date.now() - t
  if (diff < 60_000) return '刚刚'
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)} 分钟前`
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)} 小时前`
  if (diff < 7 * 86_400_000) return `${Math.floor(diff / 86_400_000)} 天前`
  return new Date(t).toLocaleDateString('zh-CN')
}

/** 后端形状 → 前端 `Post` 形状（字段对照见 docs/数据对应表.md 第 3、7 节） */
function toFrontendPost(raw: BackendPost): Post {
  const type = VALID_TYPES.includes(raw.type as PostType) ? (raw.type as PostType) : 'text'
  return {
    id: stableNumericId(raw.id),
    type,
    // 后端空字符串 = 没有；前端用可选字段（undefined）表示没有
    img: raw.img || undefined,
    quote: raw.quote || undefined,
    quoteEmoji: raw.quoteEmoji || undefined,
    title: raw.title || undefined,
    tags: raw.tags?.length ? raw.tags : undefined,
    author: raw.author?.name || '匿名用户',
    // ⭐ 字段翻译：后端数字 → 前端展示文字
    likes: formatCount(raw.likes ?? 0),
    duration: raw.duration || undefined,
    content: raw.content || undefined,
    videoUrl: raw.videoUrl || undefined,
    // 后端没有的字段，由这一层补默认值
    imgOverlay: undefined,
  }
}

/**
 * 同一个 uuid 只映射一次，**保证引用稳定**。
 *
 * 为什么重要：`listPosts()` 每次返回同一个数组/同一批对象引用，
 * 页面和 store 才不会误判成「数据变了」而反复重渲染；
 * 单测里 `expect(state.posts).toBe(postsRepo.listPosts())` 也依赖这一点。
 */
const mapped = new WeakMap<BackendPost, Post>()
function mapPost(raw: BackendPost): Post {
  let p = mapped.get(raw)
  if (!p) {
    p = toFrontendPost(raw)
    mapped.set(raw, p)
  }
  return p
}

/** 缓存映射结果，让 `listPosts()` 在同步调用之间返回同一个数组引用 */
let cachedList: Post[] | null = null
let cachedFrom: BackendPost[] | null = null

function cachedPostsAsFrontend(): Post[] {
  if (cachedList === null || cachedFrom !== cachedRaw) {
    cachedList = cachedRaw.map(mapPost)
    cachedFrom = cachedRaw
  }
  return cachedList
}

/**
 * 帖子列表（唯一的取数入口，**同步**）。
 *
 * - 走后端时：给上次成功拉取的缓存；**第一次还没缓存 → 给本地种子数据**（首屏不空）
 * - 不走后端时：给本地种子数据
 *
 * 没有做 `findPost` / `searchPosts` 这类查询函数：现在数据在内存里，
 * 页面拿到列表自己过滤最省事；等接了后端、列表要分页时再加「查询 action + 对应 repo 函数」，
 * 那时页面才需要从「本地过滤」改成「调 action」。
 */
export function listPosts(): Post[] {
  if (hasBackend && cachedRaw.length > 0) return cachedPostsAsFrontend()
  return POSTS
}

/**
 * 后台去后端拉最新帖子，成功后写进缓存（**异步**）。
 *
 * 调用方是 store：拿到结果写回 state，订阅了 `posts` 的页面自动重渲染。
 * 失败不抛错，返回 `null`（调用方保持现有数据不动）。
 */
export async function reloadPosts(): Promise<Post[] | null> {
  if (!API_BASE) return null
  try {
    const res = await fetch(`${API_BASE}/api/posts`, { headers: { Accept: 'application/json' } })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const body = (await res.json()) as { posts?: BackendPost[] }
    const posts = Array.isArray(body.posts) ? body.posts : []

    // 原地更新缓存数组（保持 `cachedRaw` 的引用不变，引用变了会触发上面重新映射整表）
    cachedRaw.length = 0
    cachedRaw.push(...posts)
    cachedList = null // 让下一次 listPosts() 重新映射
    cachedFrom = null
    writeJSON(CACHE_KEY, posts)

    return cachedPostsAsFrontend()
  } catch (cause) {
    reportRepoError({
      op: 'posts.reload',
      message: `拉取帖子失败（${API_BASE}），继续用现有数据`,
      policy: 'retry',
      cause,
    })
    return null
  }
}

/** 清掉缓存（调试用：想回到本地种子数据时调用） */
export function clearPostsCache(): void {
  cachedRaw.length = 0
  cachedList = null
  cachedFrom = null
  writeJSON(CACHE_KEY, [])
}
