/**
 * 设计 token 门禁：内联颜色存量冻结，**只许变小**。
 *
 * 为什么需要它：ARCHITECTURE §6 写着「全站颜色的唯一来源是 src/index.css 的 :root」，
 * 但这条规矩只有 review 能守 —— 2026-09 盘了一次，主站 ts/tsx 里有 1000+ 处内联颜色，
 * 而且四种写法都有：样式对象、CSS 字符串、Tailwind 任意值类名（`text-[#191919]`）、
 * SVG 属性（`fill="#FF2442"`）。四个人并行时，新写的内联色会顺着复制粘贴扩散，
 * 改品牌色就得全仓搜字符串。
 *
 * 这条门禁做三件事：
 *   1. **存量冻结**：`token-baseline.json` 里记了每个文件的内联颜色数，超了就红
 *      （和 check-file-size.mjs 同一个套路：不是要求立刻还清，是要求不许变多）。
 *   2. **新代码零内联色**：不在基线里的文件一旦出现颜色字面量就红 —— 新文件只能从 token 取色。
 *      （例外：**从别的文件搬过来的代码**。`--update` 只在总数不增时登记新文件，
 *      所以拆文件不会卡住，凭空多出来的颜色仍会被拦。）
 *   3. **`var(--x)` 必须定义在 `:root`**：Tailwind v4 会 tree-shake 掉「没被工具类引用」的
 *      @theme 变量，所以写成 `var(--gray-1)` 而只定义在 @theme 里 → 颜色直接消失、且不报错。
 *
 * ⚠️ 计量是**纯文本**匹配：注释里写 `React #185` 这类文本也会被算成一处颜色（`#185` 是合法 hex）。
 *    写注释时避开 `#` + 3~8 位十六进制的写法即可。
 *
 * 用法：
 *   node scripts/check-token-usage.mjs            # 校验（pnpm tokens / CI 里跑这个）
 *   node scripts/check-token-usage.mjs --list     # 列存量最多的文件（排下一轮活）
 *   node scripts/check-token-usage.mjs --update   # 把当前数字写回基线（只允许调小/新增文件，
 *                                                 #   调大要用 --force，PR 里会被 review 看到）
 */
import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs'
import { extname, join } from 'node:path'

const BASELINE = 'scripts/token-baseline.json'
const THEME_FILE = 'src/index.css'

/**
 * 豁免目录：3D 子应用。
 * `lockerfolio` / `forest` 的颜色要喂给 three.js 与 canvas 2D（`ctx.fillStyle`），
 * **CSS 变量在那里根本不生效**，而且它们自带一套独立色板（见 ARCHITECTURE §2）。
 * 主站（页面 / 组件 / store）不在豁免范围里。
 */
const ALLOW = [/^src\/lockerfolio\//, /^src\/forest\//]

const args = process.argv.slice(2)
const update = args.includes('--update')
const force = args.includes('--force')
const list = args.includes('--list')

const walk = dir => {
  const out = []
  for (const name of readdirSync(dir)) {
    const full = join(dir, name)
    if (statSync(full).isDirectory()) {
      out.push(...walk(full))
      continue
    }
    if (!['.ts', '.tsx', '.css'].includes(extname(name))) continue
    if (ALLOW.some(re => re.test(full))) continue
    out.push(full)
  }
  return out
}

/** `src/index.css` 里的 `:root { … }` 是 token 的**定义处**，那一段里的 hex 不算内联色 */
const stripTokenBlock = src => {
  const start = src.indexOf(':root {')
  if (start < 0) return src
  const end = src.indexOf('}', start)
  return end < 0 ? src : src.slice(0, start) + src.slice(end)
}

const counts = {}
let totalAll = 0
let hexAll = 0
let rgbAll = 0

for (const file of walk('src')) {
  const raw = readFileSync(file, 'utf8')
  const src = file === THEME_FILE ? stripTokenBlock(raw) : raw
  const hexes = src.match(/#[0-9a-fA-F]{3,8}\b/g) ?? []
  const rbgs = (src.match(/rgba?\([^)]*\)/g) ?? []).length
  const hsls = (src.match(/hsla?\([^)]*\)/g) ?? []).length
  const n = hexes.length + rbgs + hsls
  if (!n) continue
  counts[file] = n
  totalAll += n
  hexAll += hexes.length
  rgbAll += rbgs + hsls
}

// ── 检查 3：ts/tsx 里用到的 var(--x) 必须在 :root 里定义 ──────────────────────
const rootBlock = (() => {
  const css = readFileSync(THEME_FILE, 'utf8')
  const start = css.indexOf(':root {')
  const end = css.indexOf('}', start)
  return start < 0 || end < 0 ? '' : css.slice(start, end)
})()
const defined = new Set([...rootBlock.matchAll(/--([\w-]+)\s*:/g)].map(m => m[1]))
const missingVars = new Map()
for (const file of walk('src')) {
  if (extname(file) === '.css') continue
  for (const m of readFileSync(file, 'utf8').matchAll(/var\(--([\w-]+)/g)) {
    if (defined.has(m[1])) continue
    const key = `--${m[1]}`
    if (!missingVars.has(key)) missingVars.set(key, new Set())
    missingVars.get(key).add(file)
  }
}

const baseline = JSON.parse(readFileSync(BASELINE, 'utf8'))
const frozen = baseline.files ?? {}

if (list) {
  console.log('内联颜色最多的文件（下一轮从上面挑）：')
  for (const [file, n] of Object.entries(counts)
    .toSorted((a, b) => b[1] - a[1])
    .slice(0, 20)) {
    console.log(`  ${String(n).padStart(4)}  ${file}`)
  }
  process.exit(0)
}

if (update) {
  // 唯一的不变量是**总数**：
  //   · 拆文件 / 把重复代码收敛到共享模块，会让某个文件变多、另一个变少，总数不变 —— 该放行
  //   · 总数涨了，说明是**新写**的颜色 —— 挡住
  // 每个文件的增减会打印出来（也就会出现在 PR diff 里），需要看的话看得住。
  const frozenTotal = baseline.total ?? 0
  if (totalAll > frozenTotal && !force) {
    console.error(
      `❌ 只许变小 —— 内联颜色总数 ${frozenTotal} → ${totalAll}（多了 ${totalAll - frozenTotal} 处）`,
    )
    console.error('  从别的文件搬过来的代码不会让总数变多；新颜色请先在 :root 加 token')
    console.error('  （确实要放开就加 --force，并在 PR 描述里说明理由）')
    process.exit(1)
  }
  const grown = Object.entries(counts).filter(([f, n]) => f in frozen && n > frozen[f])
  if (grown.length) {
    console.log('以下文件的内联颜色变多了（总数没涨，属搬家/收敛，记一笔）：')
    for (const [f, n] of grown) console.log(`  · ${f}: ${frozen[f]} → ${n}`)
  }
  const sorted = Object.fromEntries(
    Object.entries(counts).toSorted((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])),
  )
  const removed = Object.keys(frozen).filter(f => !(f in counts))
  const lowered = Object.entries(sorted).filter(
    ([f, n]) => frozen[f] !== undefined && n < frozen[f],
  )
  writeFileSync(
    BASELINE,
    JSON.stringify(
      { ...baseline, total: totalAll, hex: hexAll, rgb: rgbAll, files: sorted },
      null,
      2,
    ) + '\n',
  )
  console.log(`✅ 基线已更新：${Object.keys(sorted).length} 个文件 / ${totalAll} 处`)
  if (lowered.length) console.log(`   调小 ${lowered.length} 个文件，清零移除 ${removed.length} 个`)
  process.exit(0)
}

const failures = []
const suggestions = []
for (const [file, n] of Object.entries(counts)) {
  if (!(file in frozen)) {
    failures.push(
      `${file} 有 ${n} 处内联颜色，但不在基线里 —— 新代码请直接用 token（\`var(--x)\` / \`text-brand\`）；` +
        '若是从别的文件搬过来的，跑 `pnpm tokens --update` 登记（总数不变才会放行）',
    )
    continue
  }
  if (n > frozen[file]) {
    failures.push(`${file} 内联颜色 ${frozen[file]} → ${n}（只许变小，请改用 token）`)
  } else if (n < frozen[file]) {
    suggestions.push(`${file} ${frozen[file]} → ${n}（可以 run: pnpm tokens --update 把上限调小）`)
  }
}
for (const [name, files] of missingVars) {
  failures.push(
    `var(${name}) 没有定义在 ${THEME_FILE} 的 :root 里（用到的文件：${[...files].join(', ')}）——` +
      '只写在 @theme 里会被 Tailwind tree-shake 掉，颜色会静默消失',
  )
}

console.log(
  `内联颜色存量：${totalAll} 处（hex ${hexAll} / rgb·hsl ${rgbAll}），分布在 ${Object.keys(counts).length} 个文件`,
)
if (suggestions.length) {
  console.log('\n可以收紧的上限：')
  for (const s of suggestions) console.log('  · ' + s)
}
if (failures.length) {
  console.error('\n❌ 设计 token 检查失败：')
  for (const f of failures) console.error('  - ' + f)
  console.error('\n改法（四种写法各有对应）：')
  console.error("  · 样式对象 / CSS 字符串：'#FF2442' → 'var(--brand)'")
  console.error(
    '  · Tailwind 任意值类名：text-[#191919] → text-ink（映射见 index.css 的 @theme inline）',
  )
  console.error('  · SVG 属性：fill="#FF2442" → style={{ fill: \'var(--brand)\' }}')
  console.error('  · 新颜色：先在 src/index.css 的 :root 加 token，再到 @theme inline 映射一行')
  process.exit(1)
}

console.log('\n✅ 设计 token 检查通过（存量冻结，没有新增）')
