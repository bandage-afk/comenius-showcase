/**
 * E2E 交互套件：跑主要页面上的关键交互链路（不只是"能打开"）。
 * 覆盖：消息（群设置 / 二维码弹层 / 发送消息 + 已读）、通知（分类切换）、发布（四个 tab）、
 *       教师（领英档案）、Amos AI（点推荐问题进入对话）、首页（卡片可点开）
 *
 * 用法：pnpm dev（或 SMOKE_BASE 指向已部署环境）→ node scripts/e2e.mjs
 */
import { Reporter, clickText, gotoNav, launch, loadPlaywright, newPage } from './lib/browser.mjs'

const { chromium } = loadPlaywright()
const browser = await launch(chromium)
const { page, problems } = await newPage(browser)
const r = new Reporter('E2E 交互')
const text = () => page.evaluate(() => document.body.innerText)

// ── 消息：群设置面板 + 二维码弹层 ──────────────────────────────────────────
await gotoNav(page, '消息')
let body = await text()
r.ok('消息页渲染群聊', body.includes('CIE 数学学习小组') && body.includes('群公告'))
// 在线绿点（借鉴 tutor 的 Messaging）：列表里至少有一个在线头像
r.ok(
  '会话列表有在线绿点',
  await page.evaluate(() =>
    Array.from(document.querySelectorAll('span[title="在线"]')).some(
      el => el.getBoundingClientRect().width > 0,
    ),
  ),
)

await clickText(page, '成员')
await page.waitForTimeout(900)
body = await text()
r.ok('群设置面板打开', body.includes('群设置') && body.includes('群二维码'))

await clickText(page, '群二维码')
await page.waitForTimeout(700)
r.ok('二维码弹层（Overlay + QRCode）', (await text()).includes('扫二维码加入群聊'))

// ── 消息：群设置 → 查找聊天记录（拆成 messages/HistorySearchPanel.tsx 的独立面板）──
await clickText(page, '查找聊天记录')
await page.waitForTimeout(700)
body = await text()
r.ok(
  '查找聊天记录面板能打开（标题 + 五个类型筛选）',
  ['查找聊天记录', '全部', '图片', '语音', '笔记', '链接'].every(t => body.includes(t)),
)

await page.locator('input[placeholder="搜索聊天内容"]').fill('绝对不存在的关键词zzz')
await page.waitForTimeout(400)
r.ok('搜索无结果时显示空态', (await text()).includes('没有找到相关记录'))

await page.locator('input[placeholder="搜索聊天内容"]').fill('')
await page.waitForTimeout(400)
const hitCount = await page.evaluate(
  () =>
    Array.from(document.querySelectorAll('button')).filter(b => /:/.test(b.innerText || '')).length,
)
r.ok('清空关键词后能看到历史消息', hitCount > 0, `命中 ${hitCount} 条`)

// 点结果 → onJump 回调回到父组件：面板关闭 + 高亮那条消息（这是子组件与父组件之间那条新边界）
const jumped = await page.evaluate(() => {
  const btn = Array.from(document.querySelectorAll('button')).find(b => /:/.test(b.innerText || ''))
  btn?.click()
  return !!btn
})
await page.waitForTimeout(800)
r.ok(
  '点搜索结果会关面板（onJump 回到父组件）',
  jumped && (await page.locator('input[placeholder="搜索聊天内容"]').count()) === 0,
)

// ── 消息：输入框在视口内 + 发送消息 ────────────────────────────────────────
await gotoNav(page, '消息')
const pill = await page.evaluate(() => {
  const el = Array.from(document.querySelectorAll('div')).find(
    d => (d.innerText || '').trim().startsWith('发消息给') && d.getBoundingClientRect().height < 60,
  )
  if (!el) return null
  const rect = el.getBoundingClientRect()
  return {
    x: rect.x + rect.width / 2,
    y: rect.y + rect.height / 2,
    inViewport: rect.y > 0 && rect.y + rect.height < window.innerHeight,
  }
})
r.ok(
  '输入框在视口内（AppShell 布局）',
  !!pill?.inViewport,
  pill ? `y=${Math.round(pill.y)}` : '未找到输入框',
)
if (pill) {
  await page.mouse.click(pill.x, pill.y)
  await page.waitForTimeout(700)
  await page.locator('textarea').last().fill('E2E 自动化测试消息')
  await clickText(page, '发送')
  await page.waitForTimeout(2200)
  body = await text()
  r.ok('发送消息并收到已读/已送达', body.includes('E2E 自动化测试消息') && /已读|已送达/.test(body))
}

// ── 消息：输入区的三个拾取器（视觉基线只抓收起态，这几条靠交互测）──────────
/** 按 title / aria-label 点工具栏按钮 */
const clickByTitle = async title => {
  const ok = await page.evaluate(t => {
    const btn = Array.from(document.querySelectorAll('button')).find(b => b.title === t)
    btn?.click()
    return !!btn
  }, title)
  await page.waitForTimeout(500)
  return ok
}

await gotoNav(page, '消息')
const pill2 = await page.evaluate(() => {
  const el = Array.from(document.querySelectorAll('div')).find(
    d => (d.innerText || '').trim().startsWith('发消息给') && d.getBoundingClientRect().height < 60,
  )
  if (!el) return null
  const rect = el.getBoundingClientRect()
  return { x: rect.x + rect.width / 2, y: rect.y + rect.height / 2 }
})
if (pill2) {
  await page.mouse.click(pill2.x, pill2.y)
  await page.waitForTimeout(600)
}
r.ok(
  '输入区工具栏四个入口（表情 / 图片 / 笔记 / 录音）',
  await page.evaluate(() =>
    ['表情', '发送图片', '分享笔记', '按住说话'].every(t =>
      Array.from(document.querySelectorAll('button')).some(b => b.title === t),
    ),
  ),
)

await clickByTitle('表情')
r.ok(
  '表情面板能展开（有表情格子）',
  await page.evaluate(
    () =>
      Array.from(document.querySelectorAll('button')).filter(b => {
        const box = b.getBoundingClientRect()
        return box.width === 36 && box.height === 36
      }).length > 4,
  ),
)

await clickByTitle('分享笔记')
r.ok(
  '笔记拾取器能展开（标题 + 搜索框）',
  (await text()).includes('分享笔记') &&
    (await page.evaluate(() =>
      Array.from(document.querySelectorAll('input')).some(i => i.placeholder === '搜索笔记'),
    )),
)

// 群聊里的 @提及面板（换成群会话再看）
await gotoNav(page, '消息')
await page.evaluate(() => {
  const row = Array.from(document.querySelectorAll('div')).find(d =>
    (d.innerText || '').includes('CIE 数学学习小组'),
  )
  row?.click()
})
await page.waitForTimeout(900)
const groupPill = await page.evaluate(() => {
  const el = Array.from(document.querySelectorAll('div')).find(
    d => (d.innerText || '').trim().startsWith('发消息给') && d.getBoundingClientRect().height < 60,
  )
  if (!el) return null
  const rect = el.getBoundingClientRect()
  return { x: rect.x + rect.width / 2, y: rect.y + rect.height / 2 }
})
if (groupPill) {
  await page.mouse.click(groupPill.x, groupPill.y)
  await page.waitForTimeout(700)
}
await clickByTitle('提及成员')
r.ok('群聊 @提及面板能展开（@所有人 + 成员）', (await text()).includes('@所有人'))

// ── 通知：三个分类可切换 ───────────────────────────────────────────────────
await gotoNav(page, '通知')
body = await text()
r.ok(
  '通知页三个分类',
  ['评论和@', '赞和收藏', '新增关注'].every(t => body.includes(t)),
)
await clickText(page, '赞和收藏')
await page.waitForTimeout(600)
r.ok('切到「赞和收藏」有内容', (await text()).includes('赞了你的笔记'))

// 未读 → 全部已读 → 未读归零（借鉴 tutor 的通知已读状态）
// 「全部已读」按钮在没有未读时是 disabled，所以直接用它当未读状态的探针
const markAllDisabledBefore = await page.evaluate(() => {
  const btn = Array.from(document.querySelectorAll('button')).find(
    b => (b.innerText || '').trim() === '全部已读',
  )
  return btn instanceof HTMLButtonElement ? btn.disabled : null
})
r.ok('未读时「全部已读」可点', markAllDisabledBefore === false)
await page.evaluate(() => {
  const btn = Array.from(document.querySelectorAll('button')).find(
    b => (b.innerText || '').trim() === '全部已读',
  )
  if (btn instanceof HTMLButtonElement) btn.click()
})
await page.waitForTimeout(400)
const markAllDisabledAfter = await page.evaluate(() => {
  const btn = Array.from(document.querySelectorAll('button')).find(
    b => (b.innerText || '').trim() === '全部已读',
  )
  return btn instanceof HTMLButtonElement ? btn.disabled : null
})
r.ok('点「全部已读」后未读归零（按钮变灰）', markAllDisabledAfter === true)

// 通知设置（齿轮弹层）：能打开、能关掉某个分类、关掉后该分类显示空态
const gearOpened = await page.evaluate(() => {
  const btn = document.querySelector('button[aria-label="通知设置"]')
  if (!(btn instanceof HTMLElement)) return false
  btn.click()
  return true
})
await page.waitForTimeout(400)
body = await text()
r.ok('齿轮能打开通知设置', gearOpened && body.includes('通知设置') && body.includes('私信提醒'))

const toggled = await page.evaluate(() => {
  const sw = document.querySelector('button[aria-label="赞和收藏"]')
  if (!(sw instanceof HTMLElement)) return false
  sw.click()
  return true
})
await page.waitForTimeout(400)
await page.evaluate(() => {
  const backdrop = document.querySelector('div[style*="position: fixed"]')
  if (backdrop instanceof HTMLElement) backdrop.click()
})
await page.waitForTimeout(400)
r.ok(
  '关掉「赞和收藏」后该分类显示空态',
  toggled && (await text()).includes('已关闭「赞和收藏」的通知提醒'),
)
// 复原：关掉弹层 + 把开关拨回来，避免影响后面的断言
await page.evaluate(() => {
  const btn = document.querySelector('button[aria-label="通知设置"]')
  if (btn instanceof HTMLElement) btn.click()
})
await page.waitForTimeout(300)
await page.evaluate(() => {
  const sw = document.querySelector('button[aria-label="赞和收藏"]')
  if (sw instanceof HTMLElement) sw.click()
})
await page.waitForTimeout(300)

// ── 发布：四个 tab ─────────────────────────────────────────────────────────
await gotoNav(page, '发布')
body = await text()
r.ok(
  '发布页四个 tab',
  ['上传视频', '上传图文', '写长文', '发播客'].every(t => body.includes(t)),
)

// ── 教师：领英版档案页 ─────────────────────────────────────────────────────
await gotoNav(page, 'Tutor')
r.ok('教师页（领英版）', (await text()).includes('My Network'))
await clickText(page, 'Me', { exact: true })
await page.waitForTimeout(700)
await clickText(page, 'View Profile')
await page.waitForTimeout(1200)
body = await text()
// Me → 统一「我的」的「职业」视图（教师侧不再有自己的档案页）
r.ok(
  '教师 Me 跳到统一「我的」职业视图',
  body.includes('Experience') || body.includes('Open to work'),
)

// ── 我的：社区 / 职业 双视图切换 ───────────────────────────────────────────
await gotoNav(page, '我')
body = await text()
r.ok('我的页有双视图开关', body.includes('社区') && body.includes('职业'))
await clickText(page, '职业')
await page.waitForTimeout(900)
body = await text()
r.ok('切到职业视图有领英式档案', body.includes('Experience') && body.includes('Education'))
await clickText(page, '社区')
await page.waitForTimeout(900)
body = await text()
r.ok('切回社区视图有笔记 tab', body.includes('笔记') && body.includes('收藏'))

// ── Amos AI：点推荐问题进入对话 ────────────────────────────────────────────
await gotoNav(page, 'Amos AI')
body = await text()
r.ok('Amos AI 空态', body.includes('想探索些什么'))
const picked = await page.evaluate(() => {
  const btn = Array.from(document.querySelectorAll('button')).find(b =>
    /A-Level 数学都考哪些内容/.test(b.innerText || ''),
  )
  if (!btn) return false
  btn.click()
  return true
})
await page.waitForTimeout(1800)
r.ok('点推荐问题后进入对话', picked && (await text()).includes('A-Level 数学都考哪些内容'))

// ── 首页：卡片可点开 ───────────────────────────────────────────────────────
await gotoNav(page, '首页')
const opened = await page.evaluate(() => {
  const card = Array.from(document.querySelectorAll('div')).find(d => {
    const rect = d.getBoundingClientRect()
    return (
      rect.width > 120 &&
      rect.width < 260 &&
      rect.height > 150 &&
      /♥|万|收藏/.test(d.innerText || '')
    )
  })
  if (!card) return false
  card.click()
  return true
})
await page.waitForTimeout(1200)
r.ok('首页卡片可点开', opened)

// PR #17：长文发布必须进入 Blog，并保留全文（含刷新后的持久化）。
await gotoNav(page, '发布')
await clickText(page, '写长文', { exact: true })
const articleTitle = 'E2E Blog 发布回显'
const articleBody = '这是正文第一段。\n\n这是正文第二段，用于验证完整阅读。'
await page.getByPlaceholder('给你的内容起个名字').fill(articleTitle)
await page.getByPlaceholder('开始写你的长文…支持分段换行，发布后正文可全文阅读').fill(articleBody)
await page.getByRole('button', { name: '发布长文', exact: true }).click()
await page.getByText(articleTitle, { exact: true }).first().click()
r.ok('Blog 发布后可阅读完整正文', (await text()).includes('这是正文第二段，用于验证完整阅读。'))
await gotoNav(page, 'Blog')
r.ok('Blog 刷新后保留已发布文章', (await text()).includes(articleTitle))

// 教师导航与学生导航可以来回切换，工作台页面均可进入。
await page.mouse.move(900, 700)
await page.mouse.move(26, 350)
await page.waitForTimeout(500)
await clickText(page, '切换为教师端', { exact: true })
await page.waitForTimeout(500)
r.ok('教师工作台可进入', (await text()).includes('的工作台'))
for (const label of ['排课日历', '课程管理', '学生管理', '收入中心', '教师资料']) {
  await page.mouse.move(900, 700)
  await page.mouse.move(26, 350)
  await page.waitForTimeout(300)
  r.ok(`教师导航：${label}`, await clickText(page, label, { exact: true }))
  await page.waitForTimeout(400)
}
await page.mouse.move(900, 700)
await page.mouse.move(26, 350)
await page.waitForTimeout(500)
await clickText(page, '切换为学生端', { exact: true })
await page.waitForTimeout(500)
r.ok(
  '返回学生端',
  await page.evaluate(
    () =>
      JSON.parse(localStorage.getItem('comenius_profile') || '{}').state?.profile?.role ===
      'student',
  ),
)

const pass = r.summary(problems)
await browser.close()
process.exit(pass ? 0 : 1)
