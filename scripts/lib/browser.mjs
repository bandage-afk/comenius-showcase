/**
 * 浏览器验收脚本的公共工具：加载 playwright、启动浏览器、侧栏导航、断言收集。
 *
 * 用法（在 smoke / layout / e2e 里）：
 *   import { loadPlaywright, launch, newPage, gotoNav, Reporter } from './lib/browser.mjs'
 */
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)

/** CI 用 playwright（自带 chromium），本机可用 PLAYWRIGHT_CORE 指向已有的 playwright-core */
export function loadPlaywright() {
  try {
    return require('playwright')
  } catch {}
  try {
    return require(process.env.PLAYWRIGHT_CORE || 'playwright-core')
  } catch {}
  console.error(
    '缺少 playwright：先 `pnpm add -D playwright`，或用 PLAYWRIGHT_CORE=<playwright-core 路径>',
  )
  process.exit(1)
}

export const BASE = process.env.SMOKE_BASE || 'http://localhost:8443/'

/** 启动浏览器：优先 CHROME_PATH，其次系统 Chrome，最后 Playwright 自带 chromium */
export async function launch(chromium) {
  const attempts = process.env.CHROME_PATH
    ? [{ executablePath: process.env.CHROME_PATH }]
    : [{ channel: 'chrome' }, {}, { channel: 'chromium' }]
  let lastErr
  for (const opts of attempts) {
    try {
      return await chromium.launch(opts)
    } catch (err) {
      lastErr = err
    }
  }
  throw lastErr
}

/** 打开一个页面并收集控制台/运行时报错 */
export async function newPage(browser, { viewport = { width: 1560, height: 980 } } = {}) {
  const ctx = await browser.newContext({ viewport, ignoreHTTPSErrors: true })
  const page = await ctx.newPage()
  const problems = []
  page.on('pageerror', e => problems.push('pageerror: ' + e.message.slice(0, 160)))
  page.on('console', m => {
    if (m.type() === 'error' && !m.text().includes('Failed to load resource'))
      problems.push('console: ' + m.text().slice(0, 160))
  })
  return { page, problems }
}

/**
 * 从首页通过左侧栏进入某个页面。
 * 侧栏靠 hover 展开，headless 下偶尔不触发 → 最多重试 3 次。
 */
export async function gotoNav(page, label, base = BASE) {
  await page.goto(base, { waitUntil: 'load' })
  await page.waitForTimeout(1800)
  const key = label.replace(/\s+/g, '')
  for (let i = 0; i < 3; i++) {
    await page.mouse.move(900, 700)
    await page.waitForTimeout(150)
    await page.mouse.move(26, 350)
    await page.waitForTimeout(500)
    const ok = await page.evaluate(k => {
      const hit = Array.from(document.querySelectorAll('button')).find(
        b => (b.innerText || '').replace(/\s+/g, '').replace(/\d+$/, '') === k,
      )
      if (!hit) return false
      hit.click()
      return true
    }, key)
    if (ok) {
      await page.waitForTimeout(1600)
      return true
    }
  }
  return false
}

/** 点击文本匹配的按钮（面板内的操作按钮用）；exact=true 时要求完全相等（避免 'Me' 命中 'Messaging'） */
export async function clickText(page, label, { last = false, exact = false } = {}) {
  return page.evaluate(
    ({ l, last: pickLast, exact: pickExact }) => {
      const cands = Array.from(document.querySelectorAll('button')).filter(
        b =>
          (b.innerText || '').trim() === l ||
          (!pickExact && (b.innerText || '').trim().startsWith(l)),
      )
      const el = pickLast ? cands[cands.length - 1] : cands[0]
      if (!el) return false
      el.scrollIntoView({ block: 'center' })
      el.click()
      return true
    },
    { l: label, last, exact },
  )
}

/** 简易断言收集器：ok() 记录，summary() 决定退出码 */
export class Reporter {
  constructor(title) {
    this.title = title
    this.pass = 0
    this.fail = 0
  }
  ok(name, cond, extra = '') {
    if (cond) {
      this.pass++
      console.log(`✅ ${name}${extra ? '  ' + extra : ''}`)
    } else {
      this.fail++
      console.log(`❌ ${name}${extra ? '  ' + extra : ''}`)
    }
    return cond
  }
  summary(problems = []) {
    const bad = [...new Set(problems)]
    console.log(`\n${this.title}: ${this.pass} 通过 / ${this.fail} 失败`)
    console.log('控制台问题:', bad.length ? bad.join(' ;; ') : '（无）')
    return this.fail === 0 && bad.length === 0
  }
}
