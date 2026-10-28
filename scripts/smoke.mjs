/**
 * 冒烟测试：逐个打开主要页面，断言关键内容存在 + 收集控制台报错。
 *
 * 用法：
 *   pnpm dev                                     # 先起本地服务（或指向已部署环境）
 *   node scripts/smoke.mjs
 *   SMOKE_BASE=https://www.comenius.cn:8443/community/ node scripts/smoke.mjs
 *
 * 依赖：playwright（pnpm add -D playwright）。默认用本机已安装的 Chrome；
 * 也可用 CHROME_PATH 指定可执行文件，CI 里用 Playwright 自带 chromium。
 */
import { Reporter, gotoNav, launch, loadPlaywright, newPage } from './lib/browser.mjs'

/** 页面清单：导航项 + 该页必须出现的关键字 */
const CHECKS = [
  { nav: '首页', expect: ['夸美纽斯', '推荐'] },
  { nav: '消息', expect: ['群聊', '普通', '发消息给'] },
  { nav: '通知', expect: ['评论和@', '赞和收藏', '新增关注'] },
  { nav: '发布', expect: ['上传视频', '上传图文'] },
  { nav: 'Podcast', expect: ['Comenius Podcast', '浏览主题'] },
  { nav: 'Tutor', expect: ['Home', 'My Network'] },
  { nav: 'Blog', expect: ['Comenius', 'Featured'] },
  { nav: 'Amos AI', expect: ['想探索些什么'] },
  { nav: '我', expect: ['Champion'] },
]

const { chromium } = loadPlaywright()
const browser = await launch(chromium)
const { page, problems } = await newPage(browser)
const r = new Reporter('冒烟结果')

for (const { nav, expect } of CHECKS) {
  const navigated = await gotoNav(page, nav)
  const body = await page.evaluate(() => document.body.innerText)
  const missing = expect.filter(k => !body.includes(k))
  r.ok(nav, navigated && missing.length === 0, missing.length ? `缺少: ${missing.join(' / ')}` : '')
}

const pass = r.summary(problems)
await browser.close()
process.exit(pass ? 0 : 1)
