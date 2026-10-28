/**
 * 文件规模门禁。
 *
 * 为什么需要它：这个项目最贵的一次重构，就是把 4000+ 行的 FeedPage 拆开。
 * 拆完如果没人管，三个月后又会有人往一个文件里塞整套功能。这条门禁是唯一能
 * 自动拦住「再长出一个巨型文件」的机制（4 个人并行时尤其重要：文件越大，
 * 两个人同一天改到同一段代码的概率越高）。
 *
 * 用法：node scripts/check-file-size.mjs
 */
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { extname, join } from 'node:path'

const SRC = 'src'
const WARN_LINES = 800
const ERROR_LINES = 1500

/**
 * 历史遗留的巨型文件：暂时豁免，但**不许再变大**。
 * 拆一个就从这里删一条。新增文件一律不得进入本名单。
 */
const LEGACY_MAX = {
  // 2026-09-23：输入区拆到 messages/Composer.tsx，上限跟着压到当前行数（只许变小）
  'src/pages/MessagesPage.tsx': 1454,
  // 2026-09-23：群公告面板 → AnnouncementsPanel.tsx；聊天记录搜索 → HistorySearchPanel.tsx；
  // 成员与邀请 → MemberList.tsx。上限一路跟着压（只许变小）。
  'src/pages/messages/GroupPanel.tsx': 924,
}

/**
 * 纯数据文件（src/data/**）放宽：它们长是因为内容多，不是因为逻辑纠缠，
 * 而且改一条数据不会和别人冲突。所以给一个独立的、更高的上限。
 */
const DATA_ERROR_LINES = 3000
const isDataFile = p => p.startsWith('src/data/')

const files = []
const walk = dir => {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name)
    if (statSync(full).isDirectory()) {
      walk(full)
      continue
    }
    if (!['.ts', '.tsx'].includes(extname(name))) continue
    files.push({ path: full, lines: readFileSync(full, 'utf8').split('\n').length })
  }
}
walk(SRC)

const failures = []
const warnings = []

for (const f of files.toSorted((a, b) => b.lines - a.lines)) {
  const legacyCap = LEGACY_MAX[f.path]
  if (legacyCap !== undefined) {
    if (f.lines > legacyCap) {
      failures.push(
        `${f.path} 是历史巨型文件（上限 ${legacyCap} 行），现在 ${f.lines} 行——只许变小`,
      )
    } else {
      warnings.push(`${f.path} ${f.lines} 行（历史遗留，待拆，上限 ${legacyCap}）`)
    }
    continue
  }
  const errorCap = isDataFile(f.path) ? DATA_ERROR_LINES : ERROR_LINES
  if (f.lines > errorCap) {
    failures.push(`${f.path} ${f.lines} 行，超过 ${errorCap} 行上限——请拆分模块`)
  } else if (f.lines > WARN_LINES) {
    warnings.push(`${f.path} ${f.lines} 行，接近上限（预警线 ${WARN_LINES}）`)
  }
}

console.log(`检查了 ${files.length} 个源文件（预警 ${WARN_LINES} 行 / 上限 ${ERROR_LINES} 行）`)
if (warnings.length) {
  console.log('\n预警：')
  for (const w of warnings) console.log('  · ' + w)
}

if (failures.length) {
  console.error('\n❌ 文件规模检查失败：')
  for (const f of failures) console.error('  - ' + f)
  process.exit(1)
}

console.log('\n✅ 文件规模检查通过')
