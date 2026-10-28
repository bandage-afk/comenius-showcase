/**
 * 路由可达性守卫。
 *
 * 为什么需要它：`App.tsx` 的 `PageName` 里有某一项，**不代表用户能打开这个页面**。
 * 页面文件在、类型在、能编译、knip 也未必报——但只要没有任何 `navigate('xxx')` 指过去，
 * 它就是一个永远打不开的僵尸路由。清理时我们删错过（TeacherApply/TeacherResume 互相指来指去，
 * 却没有任何入口），这个脚本把「有没有人指过来」变成可执行的检查。
 *
 * 用法：node scripts/check-routes.mjs
 */
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join, extname } from 'node:path'

const SRC = 'src'

/**
 * 有意保留、暂时没有入口的页面（允许不可达，不会失败）。
 * 写清楚理由，不要往这里随手加东西。
 */
const ALLOW_UNREACHABLE = {
  forest: '3D 森林实验页，暂无导航入口（刻意保留）',
}

/**
 * 1. 从路由表抓所有页面 key。
 *    单一来源是 src/app/routes.ts —— 它改了这里就跟着改，不要再回去解析 App.tsx。
 */
const routeSrc = readFileSync(join(SRC, 'app/routes.ts'), 'utf8')
const tableMatch = routeSrc.match(/export const ROUTES = \{([\s\S]*?)\n\}/)
if (!tableMatch) {
  console.error('❌ 没能从 src/app/routes.ts 解析出 ROUTES 表（结构变了？请更新本脚本）')
  process.exit(1)
}
const pages = [...tableMatch[1].matchAll(/^\s*([a-zA-Z0-9_]+):/gm)].map(m => m[1])
if (pages.length === 0) {
  console.error('❌ src/app/routes.ts 里没解析出任何路由 key')
  process.exit(1)
}

/**
 * 2. 遍历所有源码，收集入口。
 *   两种写法都算入口：
 *     navigate('messages')                       —— 直接跳转
 *     { key: 'messages', label: '消息' }          —— 导航项表（如 DemoNav），点击时 navigate(p.key)
 *   第二种只在「该文件确实调用了 navigate」时才算，避免把无关的 key 当入口。
 */
const navigatedTo = new Set()
const walk = dir => {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name)
    if (statSync(full).isDirectory()) {
      if (name === 'node_modules') continue
      walk(full)
      continue
    }
    if (!['.ts', '.tsx'].includes(extname(name))) continue
    // App.tsx 自己不算「有入口」——它就是路由表
    if (full === join(SRC, 'App.tsx')) continue
    const text = readFileSync(full, 'utf8')
    if (!text.includes('navigate(')) continue
    for (const m of text.matchAll(/\bnavigate\(\s*'([a-zA-Z0-9_]+)'/g)) navigatedTo.add(m[1])
    // 导航项表里的 key 只在该值确实是 PageName 时才算入口，避免把 tab 的 key 误当路由
    for (const m of text.matchAll(/\bkey:\s*'([a-zA-Z0-9_]+)'/g))
      if (pages.includes(m[1])) navigatedTo.add(m[1])
  }
}
walk(SRC)

/** 3. 默认页：首屏就是它，不需要入口 */
const ENTRY_PAGES = new Set(['feed'])

const unreachable = pages.filter(
  p => !ENTRY_PAGES.has(p) && !navigatedTo.has(p) && !(p in ALLOW_UNREACHABLE),
)
const staleTargets = [...navigatedTo].filter(t => !pages.includes(t))

console.log(`路由 ${pages.length} 个；被 navigate() 指向的有 ${navigatedTo.size} 个`)

const allowed = pages.filter(p => p in ALLOW_UNREACHABLE)
if (allowed.length) {
  console.log('\n允许不可达（已在白名单里说明理由）：')
  for (const p of allowed) console.log(`  · ${p} —— ${ALLOW_UNREACHABLE[p]}`)
}

const failures = []
if (unreachable.length) {
  failures.push(
    `以下路由没有任何入口，用户无法打开：${unreachable.join(', ')}\n` +
      `  → 挂个入口（MainSidebar / navigate），删掉这个页面，或加进本脚本的 ALLOW_UNREACHABLE 并说明理由`,
  )
}
if (staleTargets.length) {
  failures.push(`以下 navigate() 目标不在 PageName 里，点了不会跳转：${staleTargets.join(', ')}`)
}

if (failures.length) {
  console.error('\n❌ 路由检查失败：')
  for (const f of failures) console.error('  - ' + f)
  process.exit(1)
}

console.log('\n✅ 路由检查通过：没有僵尸路由，也没有指向不存在页面的导航')
