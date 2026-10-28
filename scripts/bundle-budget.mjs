/**
 * 首屏包体预算检查。
 *
 * 为什么需要它：这个项目最容易悄悄退化的指标就是「首屏要下载多少 JS」。
 * 只要有人不小心把某个重页面改成静态 import，入口包就会从 ~75KB 涨回 ~450KB，
 * 而 tsc / lint / 冒烟测试都发现不了。这里把预算固化成门禁。
 *
 * 用法：先 pnpm build，再 node scripts/bundle-budget.mjs
 */
import { gzipSync } from 'node:zlib'
import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'

const DIST = process.env.DIST_DIR || 'dist'
const ASSETS = join(DIST, 'assets')

/** 首屏（index.html 直接 preload / script）JS 的 gzip 预算 */
const INITIAL_BUDGET_KB = Number(process.env.INITIAL_BUDGET_KB || 200)
/** 单个 JS 块的 gzip 预算（懒加载的重型页也建议别超过这个数） */
const CHUNK_BUDGET_KB = Number(process.env.CHUNK_BUDGET_KB || 900)

const kb = n => Math.round(n / 102.4) / 10

const gzipSize = path => gzipSync(readFileSync(path), { level: 9 }).length

if (!existsSync(join(DIST, 'index.html')))
  throw new Error(`找不到 ${DIST}/index.html，请先运行 pnpm build`)

const html = readFileSync(join(DIST, 'index.html'), 'utf8')

/** index.html 里的 <script src> 与 <link rel=modulepreload href> 就是首屏必须下载的 JS */
const initialRefs = new Set()
for (const m of html.matchAll(/<script[^>]+src="([^"]+)"/g)) initialRefs.add(m[1])
for (const m of html.matchAll(/<link[^>]+rel="modulepreload"[^>]+href="([^"]+)"/g))
  initialRefs.add(m[1])

const toLocal = ref => join(DIST, ref.replace(/^\//, '').split('?')[0])

const initial = [...initialRefs]
  .filter(r => r.endsWith('.js'))
  .map(ref => ({ ref, size: gzipSize(toLocal(ref)) }))

const initialTotal = initial.reduce((s, f) => s + f.size, 0)

/** 全量块大小榜，用于观察懒加载是否真的生效 */
const allChunks = readdirSync(ASSETS)
  .filter(f => f.endsWith('.js'))
  .map(f => ({ file: f, size: gzipSize(join(ASSETS, f)) }))
  .toSorted((a, b) => b.size - a.size)

const failures = []

if (initial.length === 0) failures.push('index.html 里找不到任何 JS 引用，构建产物可能不完整')
if (kb(initialTotal) > INITIAL_BUDGET_KB)
  failures.push(
    `首屏 JS ${kb(initialTotal)} KB(gzip) 超出预算 ${INITIAL_BUDGET_KB} KB —— 检查是不是有页面被改回静态 import`,
  )

const overChunks = allChunks.filter(c => kb(c.size) > CHUNK_BUDGET_KB)
for (const c of overChunks)
  failures.push(`单块 ${c.file} = ${kb(c.size)} KB(gzip) 超出 ${CHUNK_BUDGET_KB} KB`)

console.log('首屏 JS（index.html 直接引用）：')
for (const f of initial.toSorted((a, b) => b.size - a.size))
  console.log(`  ${String(kb(f.size)).padStart(7)} KB  ${f.ref}`)
console.log(`  ${String(kb(initialTotal)).padStart(7)} KB  合计 / 预算 ${INITIAL_BUDGET_KB} KB`)

console.log('\n最大的 10 个块（含懒加载）：')
for (const c of allChunks.slice(0, 10))
  console.log(`  ${String(kb(c.size)).padStart(7)} KB  ${c.file}`)

const totalJs = allChunks.reduce((s, c) => s + c.size, 0)
console.log(`\n全部 JS 合计（gzip）：${kb(totalJs)} KB / ${allChunks.length} 块`)

if (failures.length) {
  console.error('\n❌ 包体预算失败：')
  for (const f of failures) console.error('  - ' + f)
  process.exit(1)
}

console.log('\n✅ 包体预算通过')
