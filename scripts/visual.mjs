/**
 * 视觉/结构回归：拿当前页面和入库的基线对比。
 *
 * 为什么要它：4 个人同时改 UI 时，「谁把别人的间距/颜色/元素改掉了」靠人眼是抓不住的，
 * tsc / lint / 冒烟测试也抓不到。这个脚本把「值钱的界面长什么样」变成可 diff 的基线。
 *
 * 用法：
 *   pnpm build && pnpm preview          # 先起服务
 *   node scripts/visual.mjs             # 对比基线，有差异就退出码 1
 *   node scripts/visual.mjs --update     # 确认改动无误后，把当前结果写成新基线
 *   node scripts/visual.mjs --geometry   # 本地强校验：连尺寸/位置一起比（拆大文件时用）
 *   node scripts/visual.mjs --only=消息   # 只比某个页面
 *
 * ⚠️ `--geometry` 有个前提：**Web 字体要加载得出来**。几何基线是在字体正常时采的，
 *    字体回落后文字宽度会变（样式其实一样），表现是"好几个页面几百处几何差异"，看着像大回归。
 *    脚本会先检查字体，没到位就直接说明原因；确实要继续加 `--allow-missing-fonts`。
 *
 * 基线文件：scripts/visual/baseline.json（入库）
 * 截图留档：scripts/visual/shots/（不入库，供人工比对）
 */
import { mkdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import { launch, loadPlaywright, gotoNav, newPage } from './lib/browser.mjs'
import { captureStable, diffFingerprint } from './lib/visual.mjs'

const DIR = 'scripts/visual'
const BASELINE = join(DIR, 'baseline.json')
const SHOTS = join(DIR, 'shots')

const PAGES = ['首页', '消息', '通知', '发布', 'Podcast', 'Tutor', 'Blog', 'Amos AI', '我']

const args = process.argv.slice(2)
const update = args.includes('--update')
const geometry = args.includes('--geometry')
const allowMissingFonts = args.includes('--allow-missing-fonts')
const only = args.find(a => a.startsWith('--only='))?.slice('--only='.length)

const pages = only ? PAGES.filter(p => p.includes(only)) : PAGES
if (pages.length === 0) {
  console.error(`--only=${only} 没有匹配的页面；可选：${PAGES.join(' / ')}`)
  process.exit(1)
}

const { chromium } = loadPlaywright()
const browser = await launch(chromium)
const { page, problems } = await newPage(browser)
let fontsChecked = false
// 门禁最怕 flake：超时短一点，失败就重试，而不是挂在那里等 30 秒
page.setDefaultTimeout(15000)
mkdirSync(SHOTS, { recursive: true })

const baseline = existsSync(BASELINE) ? JSON.parse(readFileSync(BASELINE, 'utf8')) : {}
const current = { ...baseline }
const failures = []

for (const name of pages) {
  let fp = null
  // 每页最多试两次：第一次失败就 reload 重来，避免偶发导航/渲染超时导致假红
  for (let attempt = 1; attempt <= 2 && fp === null; attempt++) {
    try {
      if (!(await gotoNav(page, name))) throw new Error('导航失败')
      await page.waitForTimeout(1200)

      // 几何比对的前提检查：字体没加载出来时，比出来的差异不可信（见文件头注释）
      if (geometry && !fontsChecked) {
        fontsChecked = true
        // 注意不能只看 document.fonts.size：CSS 到了、但 woff2 没下来时 size 也是 >0，
        // 而文字其实回落到系统字体了。所以这里真的去 load 一次，加载不到才算不合格。
        const probe = await page.evaluate(async () => {
          try {
            await document.fonts.ready
            const family = getComputedStyle(document.body)
              .fontFamily.split(',')[0]
              .replace(/["']/g, '')
              .trim()
            const loaded = (await document.fonts.load(`16px "${family}"`, '夸美纽斯')).length
            return { family, size: document.fonts.size, loaded }
          } catch {
            return { family: '?', size: document.fonts.size, loaded: 0 }
          }
        })
        if (probe.loaded === 0 && !allowMissingFonts) {
          console.error('⚠️ Web 字体一个都没加载（fonts.googleapis.com 不可达）—— 几何差异不可信：')
          console.error(`   正文字体 ${probe.family} 加载失败（@font-face 数量 ${probe.size}）`)
          console.error(
            '   基线是在字体正常时采集的；现在文字回落到系统字体，宽高会变，静态样式却没变。',
          )
          console.error(
            '   处理：恢复网络后重跑；或做「字体自托管」（TECH-DEBT §3），让门禁不再依赖境外 CDN。',
          )
          console.error(
            '   确实要继续比对：node scripts/visual.mjs --geometry --allow-missing-fonts',
          )
          await browser.close()
          process.exit(1)
        }
      }

      fp = await captureStable(page)
    } catch (err) {
      if (attempt === 2) failures.push(`${name}: ${String(err.message || err).split('\n')[0]}`)
      else await page.reload({ waitUntil: 'domcontentloaded' }).catch(() => {})
    }
  }
  if (fp === null) continue

  // 截图只是给人看的留档，失败不影响判定
  const shot = join(SHOTS, `${name.replace(/\s+/g, '_')}${geometry ? '.geo' : ''}.png`)
  await page.screenshot({ path: shot, fullPage: false, timeout: 15000 }).catch(() => {})

  if (update || !baseline[name]) {
    current[name] = fp
    console.log(
      `${!baseline[name] && !update ? '＋ 建立基线' : '✔ 更新基线'}  ${name}（${fp.length} 个节点）`,
    )
    continue
  }

  const diffs = diffFingerprint(baseline[name], fp, { compareGeometry: geometry })
  if (diffs.length === 0) {
    console.log(`✅ ${name}（${fp.length} 个节点，无变化）`)
  } else {
    failures.push(`${name}: ${diffs.length} 处差异`)
    console.log(
      `❌ ${name}: ${diffs.length} 处差异（基线 ${baseline[name].length} → 现在 ${fp.length} 个节点）`,
    )
    for (const d of diffs.slice(0, 12)) console.log(`     [${d.kind}] ${d.detail}`)
    if (diffs.length > 12)
      console.log(`     …另外 ${diffs.length - 12} 处（完整列表见下方 JSON 导出）`)
    writeFileSync(
      join(SHOTS, `diff-${name.replace(/\s+/g, '_')}.json`),
      JSON.stringify(diffs, null, 2),
    )
  }
}

if (update) {
  writeFileSync(BASELINE, JSON.stringify(current, null, 2) + '\n')
  console.log(`\n基线已写入 ${BASELINE}`)
}

await browser.close()

if (problems.length) console.log(`\n控制台问题：${problems.join(' / ')}`)

if (failures.length) {
  console.error(`\n❌ 视觉基线有差异（${failures.length} 个页面）：`)
  for (const f of failures) console.error('  - ' + f)
  console.error(
    '\n确认这些改动是有意的 → `node scripts/visual.mjs --update`；截图在 scripts/visual/shots/',
  )
  process.exit(1)
}

console.log('\n✅ 视觉/结构基线与当前一致')
