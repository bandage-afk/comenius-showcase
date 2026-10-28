/**
 * 中文字体自托管：从 Google Fonts 拉 CJK 切片 → 存到 src/assets/fonts/cjk/ → 生成本地 @font-face。
 *
 * 为什么要这么做（而不是继续挂 fonts.googleapis.com）：
 *   1. 国内基本不可达；`@import`/`link rel=stylesheet` 会卡住整份 CSS 解析 → 首屏白等超时
 *   2. 自托管后字体跟着站点一起发，用户端零境外依赖
 * 为什么保留"切片"而不是自己子集化：Google 的切片是按 unicode-range 分的，
 *   浏览器只会取用到的那几片 —— 观感与现在**完全一致**（同一批字体文件），且用户产生的内容也不缺字。
 *   这里额外做一步裁剪：把用不到的片删掉（见 CHARSET），减小仓库与部署体积。
 *
 * 用法（改了字重 / 字体，或 UI 里新增了大批生僻字时才需要重跑）：
 *   node scripts/fonts/fetch-cjk-fonts.mjs
 *
 * ⚠️ 生成的 src/styles/fonts-cjk.css 与 src/assets/fonts/cjk/ 都要入库（构建时不再联网）。
 */
import { mkdirSync, writeFileSync, readdirSync, statSync, readFileSync } from 'node:fs'
import { join, extname } from 'node:path'
import { execFileSync } from 'node:child_process'

const OUT_DIR = 'src/assets/fonts/cjk'
const OUT_CSS = 'src/styles/fonts-cjk.css'
const UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36'

/**
 * 需要自托管的中文字族。
 * 用**可变字体**（wght 区间）而不是逐字重：Google 对 CJK 本来就是同一个变量文件，
 * 逐字重声明只会让同一批文件被下载/入库好几遍（实测 6 字重 = 6 倍体积）。
 */
const FAMILIES = [
  { name: 'Noto Sans SC', axis: 'wght@300..900' },
  { name: 'Noto Serif SC', axis: 'wght@400..900' },
]

// ── 需要覆盖的字符集：站点源码里的所有字符 + GB2312 一级常用字（3755 个）──
const charset = new Set()
const collectFrom = dir => {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name)
    if (statSync(full).isDirectory()) {
      collectFrom(full)
      continue
    }
    if (!['.ts', '.tsx', '.css', '.json', '.html'].includes(extname(name))) continue
    for (const ch of readFileSync(full, 'utf8')) charset.add(ch)
  }
}
collectFrom('src')
for (const ch of readFileSync('index.html', 'utf8')) charset.add(ch)

const gb = new TextDecoder('gb18030')
for (let b1 = 0xb0; b1 <= 0xd7; b1++) {
  for (let b2 = 0xa1; b2 <= 0xfe; b2++) {
    const ch = gb.decode(new Uint8Array([b1, b2]))
    if (ch && ch !== '\uFFFD') charset.add(ch)
  }
}
console.log(`字符集：源码 ${charset.size} 个字符（含 GB2312 一级常用字）`)

/** 字符集的码点（升序），用来判断某个 unicode-range 是否和它相交 */
const codes = [...charset].map(ch => ch.codePointAt(0)).toSorted((a, b) => a - b)

/** "U+4E00-9FFF, U+1f300" → [[0x4e00, 0x9fff], [0x1f300, 0x1f300]] */
const rangesOf = range =>
  range
    .split(',')
    .map(part => {
      const [from, to = from] = part
        .trim()
        .replace(/^U\+/i, '')
        .split('-')
        .map(h => Number.parseInt(h, 16))
      return Number.isNaN(from) ? null : [from, to]
    })
    .filter(Boolean)

/** 这个 unicode-range 里有多少我们需要的字（0 = 这片可以整片丢掉） */
const neededIn = range => rangesOf(range).flatMap(([a, b]) => codes.filter(c => c >= a && c <= b))
const rangeHits = range => neededIn(range).length > 0

const slug = name => name.toLowerCase().replace(/\s+/g, '-')
let kept = 0
let dropped = 0
let bytes = 0
const css = [
  '/* 由 scripts/fonts/fetch-cjk-fonts.mjs 生成 —— 不要手改。',
  '   中文字体自托管：Google 的切片文件已下载到 src/assets/fonts/cjk/，按 unicode-range 声明。',
  '   改了字重或新增了大量生僻字，重跑那个脚本。 */',
  '',
]

for (const { name, axis } of FAMILIES) {
  const url = `https://fonts.googleapis.com/css2?family=${name.replace(/ /g, '+')}:${axis}&display=swap`
  const res = await fetch(url, { headers: { 'User-Agent': UA } })
  if (!res.ok) throw new Error(`拉 ${name} 的 CSS 失败：HTTP ${res.status}`)
  const text = await res.text()
  const dir = join(OUT_DIR, slug(name))
  mkdirSync(dir, { recursive: true })

  const blocks = text.split('@font-face').slice(1)
  let index = 0
  for (const block of blocks) {
    // 可变字体给的是区间（"400 900"），照抄进 CSS 即可
    const weight = /font-weight:\s*([\d ]+);/.exec(block)?.[1]?.trim() ?? '400'
    const style = /font-style:\s*(\w+);/.exec(block)?.[1] ?? 'normal'
    const src = /url\((https:[^)]+)\)/.exec(block)?.[1]
    const range = /unicode-range:\s*([^;]+);/.exec(block)?.[1]
    if (!src || !range) continue
    if (!rangeHits(range)) {
      dropped++
      continue
    }
    const file = `${style === 'italic' ? 'italic-' : ''}${index++}.woff2`
    const bin = await fetch(src, { headers: { 'User-Agent': UA } })
    if (!bin.ok) throw new Error(`下载切片失败：${src}`)
    // 再裁一刀：Google 的切片里仍含大量我们用不到的字。按「本片范围 ∩ 我们的字符集」
    // 用 pyftsubset 重新生成 woff2 —— 字形/字距不变，只是把无关字形删掉（体积能降一个数量级）。
    const tmp = join('/tmp', `cjk-slice-${process.pid}.woff2`)
    writeFileSync(tmp, Buffer.from(await bin.arrayBuffer()))
    const unicodes = neededIn(range)
      .map(c => `U+${c.toString(16).toUpperCase()}`)
      .join(',')
    const out = join(dir, file)
    execFileSync(
      'python3',
      [
        '-m',
        'fontTools.subset',
        tmp,
        `--unicodes=${unicodes}`,
        '--flavor=woff2',
        '--layout-features=*',
        `--output-file=${out}`,
      ],
      { stdio: 'pipe' },
    )
    bytes += statSync(out).size
    kept++
    css.push(
      '@font-face {',
      `  font-family: '${name}';`,
      `  font-style: ${style};`,
      `  font-weight: ${weight};`,
      '  font-display: swap;',
      `  src: url('../assets/fonts/cjk/${slug(name)}/${file}') format('woff2');`,
      `  unicode-range: ${range};`,
      '}',
      '',
    )
  }
  console.log(`  ${name}：保留 ${index} 片`)
}

mkdirSync('src/styles', { recursive: true })
writeFileSync(OUT_CSS, css.join('\n'))
console.log(
  `\n✅ 共保留 ${kept} 片 / 裁掉 ${dropped} 片，合计 ${(bytes / 1024 / 1024).toFixed(1)} MB`,
)
console.log(`   CSS → ${OUT_CSS}`)
