/**
 * 视觉/结构指纹的采集与比对。
 *
 * 为什么不直接做像素 diff：
 *   1. 像素对比对字体渲染极度敏感（macOS 与 CI 的 Linux 渲染差一点就全红），
 *      在本项目的 CI 里会产生大量假失败；
 *   2. 我们真正怕的回归是「颜色变了 / 字号变了 / 圆角变了 / 元素消失了 /
 *      间距被挤扁」——这些用「结构 + 关键计算样式」就能稳定抓住。
 *
 * 所以默认指纹 = DOM 结构 + 每层的关键计算样式（不含几何尺寸），CI 安全。
 * 需要几何时（比如拆大文件后验证"搬完没变样"）用 `--geometry` 打开，
 * 尺寸带容差，只适合本地跑。
 */

const STYLE_KEYS = [
  ['color', 'c'],
  ['backgroundColor', 'bg'],
  ['fontSize', 'fs'],
  ['fontWeight', 'fw'],
  ['borderRadius', 'br'],
  ['display', 'd'],
  ['position', 'pos'],
  ['textDecorationLine', 'td'],
]

/** 在页面里跑：把 body 走一遍，产出扁平的指纹数组 */
export async function captureFingerprint(page) {
  return page.evaluate(
    ({ styleKeys }) => {
      const out = []
      /**
       * 归一化"天生会变"的文案，否则门禁会随时间和数据漂移：
       *   · 问候语（Amos AI 按小时显示 早上好/中午好/下午好/晚上好）
       *   · 相对时间（刚刚 / 3 分钟前 / 2 小时前）
       *   · 绝对日期（2025-04-28 / 8月6日）
       */
      const normalize = t =>
        t
          .replace(/(早上|上午|中午|下午|晚上|凌晨|深夜)好/g, '[时段]好')
          .replace(/刚刚|\d+\s*(秒|分钟|小时|天|周|个月)前/g, '[相对时间]')
          .replace(/\d{4}-\d{2}-\d{2}/g, '[日期]')
          .replace(/\d{1,2}月\d{1,2}日/g, '[日期]')
      const ownText = el => {
        let t = ''
        for (const n of el.childNodes) if (n.nodeType === 3) t += n.nodeValue || ''
        t = normalize(t.replace(/\s+/g, ' ').trim())
        if (!t) return ''
        // 长文本只留长度 + 前 16 字，避免把随机数字/时间戳当回归
        return t.length > 16 ? `${t.slice(0, 16)}…${t.length}` : t
      }
      const walk = (el, path) => {
        const tag = el.tagName
        if (tag === 'SCRIPT' || tag === 'STYLE') return
        const cs = getComputedStyle(el)
        if (cs.display === 'none' || cs.visibility === 'hidden') {
          out.push({ p: path, t: tag.toLowerCase(), hidden: 1 })
          return
        }
        const node = { p: path, t: tag.toLowerCase() }
        for (const [prop, key] of styleKeys) node[key] = cs[prop]
        const txt = ownText(el)
        if (txt) node.x = txt
        // 几何始终记录（供 --geometry 使用），默认比对时会忽略——因为
        // macOS 与 CI 的字体度量不同，几何在跨环境比对时必然有噪声。
        const r = el.getBoundingClientRect()
        const q = v => Math.round(v / 4) * 4
        node.g = `${q(r.width)}x${q(r.height)}@${q(r.left)},${q(r.top)}`
        out.push(node)
        let i = 0
        for (const child of el.children) walk(child, `${path}/${i++}`)
      }
      walk(document.body, 'b')
      return out
    },
    { styleKeys: STYLE_KEYS },
  )
}

const styleEqual = (a, b) => STYLE_KEYS.every(([, k]) => a[k] === b[k])

/**
 * 连续采两次，直到两次完全一致才算"稳定"。
 *
 * 为什么需要：页面刚渲染时可能先出默认值再被 store/异步数据覆盖（例如未读角标
 * 一开始是 1、随后变成 4）。如果不滤掉这种中间帧，基线就会随机漂移，
 * 门禁天天假红，最后没人看它。
 */
export async function captureStable(page, { tries = 6 } = {}) {
  await waitForAssets(page)
  let prev = await captureFingerprint(page)
  for (let i = 0; i < tries; i++) {
    await page.waitForTimeout(500)
    const next = await captureFingerprint(page)
    if (JSON.stringify(prev) === JSON.stringify(next)) return next
    prev = next
  }
  return prev
}

/**
 * 等「料」到位再采样：字体就绪 + 已在文档里的图片加载完（或超时）。
 *
 * 为什么需要：captureStable 原本只看「两次采样是否一样」，冷缓存下图片一批批到达时，
 * 中间某一对采样偶然相同就会提前返回，采到的是半加载状态 —— 表现是几何基线假红
 * （图多的页面最明显，比如 Blog），复跑又好了。给一个 4 秒上限，别让门禁挂死。
 */
async function waitForAssets(page, timeoutMs = 4000) {
  await page.evaluate(
    ms =>
      Promise.race([
        Promise.all([
          document.fonts ? document.fonts.ready : Promise.resolve(),
          ...Array.from(document.images)
            .filter(img => !img.complete)
            .map(
              img =>
                new Promise(res => {
                  img.addEventListener('load', res, { once: true })
                  img.addEventListener('error', res, { once: true })
                }),
            ),
        ]),
        new Promise(res => setTimeout(res, ms)),
      ]),
    timeoutMs,
  )
}

/** 比对两份指纹，返回人类可读的差异列表 */
export function diffFingerprint(baseline, current, { compareGeometry = false } = {}) {
  const diffs = []
  const baseByPath = new Map(baseline.map(n => [n.p, n]))
  const curByPath = new Map(current.map(n => [n.p, n]))

  for (const [p, b] of baseByPath) {
    const c = curByPath.get(p)
    if (!c) {
      diffs.push({ kind: 'removed', path: p, detail: `${b.t}${b.x ? ` 「${b.x}」` : ''} 消失了` })
      continue
    }
    if (c.t !== b.t) {
      diffs.push({ kind: 'tag', path: p, detail: `${b.t} → ${c.t}` })
      continue
    }
    if (!styleEqual(b, c)) {
      const changed = STYLE_KEYS.filter(([, k]) => b[k] !== c[k])
        .map(([prop, k]) => `${prop}: ${b[k]} → ${c[k]}`)
        .join('; ')
      diffs.push({
        kind: 'style',
        path: p,
        detail: `${b.t}${b.x ? ` 「${b.x}」` : ''} ${changed}`,
      })
    }
    if ((b.x ?? '') !== (c.x ?? '')) {
      diffs.push({ kind: 'text', path: p, detail: `「${b.x ?? ''}」 → 「${c.x ?? ''}」` })
    }
    if (compareGeometry && (b.g ?? '') !== (c.g ?? '')) {
      diffs.push({ kind: 'geometry', path: p, detail: `${b.t} 尺寸/位置 ${b.g} → ${c.g}` })
    }
    if ((b.hidden ?? 0) !== (c.hidden ?? 0)) {
      diffs.push({ kind: 'visibility', path: p, detail: `${b.t} 显示状态变了` })
    }
  }
  for (const [p, c] of curByPath) {
    if (!baseByPath.has(p)) {
      diffs.push({ kind: 'added', path: p, detail: `新增 ${c.t}${c.x ? ` 「${c.x}」` : ''}` })
    }
  }
  return diffs
}
