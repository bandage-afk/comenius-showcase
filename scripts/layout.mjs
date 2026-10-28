/**
 * 布局断言：每个主要页面检查「横向溢出 / 侧栏存在 / 内容起点正确」。
 * 这类结构性问题 tsc / lint / build 都发现不了
 * （例：AppShell 内容区方向写错，消息页会话列表与聊天区变成上下堆叠、输入框被挤出视口）。
 *
 * 用法：pnpm dev（或 SMOKE_BASE 指向已部署环境）→ node scripts/layout.mjs
 */
import { Reporter, gotoNav, launch, loadPlaywright, newPage } from './lib/browser.mjs'

const PAGES = ['首页', '消息', '通知', '发布', 'Podcast', 'Tutor', 'Blog', 'Amos AI', '我']

const { chromium } = loadPlaywright()
const browser = await launch(chromium)
const { page, problems } = await newPage(browser)
const r = new Reporter('布局断言')

for (const label of PAGES) {
  const navigated = await gotoNav(page, label)
  if (!r.ok(`${label} 导航`, navigated)) continue

  const m = await page.evaluate(() => {
    const overflowX = document.documentElement.scrollWidth - window.innerWidth
    const sidebar = Array.from(document.querySelectorAll('div')).find(d => {
      const cs = getComputedStyle(d)
      const rect = d.getBoundingClientRect()
      return (
        (cs.position === 'sticky' || cs.position === 'static') &&
        rect.width >= 60 &&
        rect.width <= 240 &&
        rect.x <= 2
      )
    })
    const content = sidebar ? sidebar.nextElementSibling : null
    return {
      overflowX,
      sidebarW: sidebar ? Math.round(sidebar.getBoundingClientRect().width) : null,
      contentX: content ? Math.round(content.getBoundingClientRect().x) : null,
      hasContent: document.body.innerText.trim().length > 40,
    }
  })

  const ok =
    m.overflowX <= 2 &&
    m.sidebarW !== null &&
    m.contentX !== null &&
    m.contentX >= 60 &&
    m.hasContent
  r.ok(`${label} 版式`, ok, `溢出=${m.overflowX}px 侧栏宽=${m.sidebarW} 内容起点=${m.contentX}`)
}

const pass = r.summary(problems)
await browser.close()
process.exit(pass ? 0 : 1)
