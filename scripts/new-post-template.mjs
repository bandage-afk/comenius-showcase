#!/usr/bin/env node
/**
 * 生成"新增帖子"的 SQL 模板（本地测试用）。
 *
 * 为什么需要它：`posts` 表有两个"身份证"字段容易填错 ——
 *   - `author_id` 必须是 users 表里真实存在的 id（填错 → 作者显示成"匿名用户"）
 *   - `id` 必须唯一（重复 → 写入失败）
 * 这个脚本自动帮你取好这两个值，并直接印出可以粘贴的 SQL。
 *
 * 用法：
 *   node scripts/new-post-template.mjs            打印 5 种类型的模板
 *   node scripts/new-post-template.mjs image      只打印 image 类型
 *
 * 生成后把 SQL 粘贴到 sqlite3，或在 DB Browser 的 Execute SQL 里跑。
 */
import { DatabaseSync } from 'node:sqlite'
import { randomUUID } from 'node:crypto'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const dbPath = process.env.DB_PATH || path.join(repoRoot, 'database', 'backend-dev.sqlite')

const db = new DatabaseSync(dbPath, { readOnly: true })
const user = db.prepare('SELECT id, name FROM users LIMIT 1').get()
db.close()

if (!user) {
  console.error(`❌ ${dbPath} 里没有用户，先注册一个再跑这个脚本。`)
  process.exit(1)
}

/** 各类型的必填字段说明（照 FeedPage 的渲染规则：text 走 QuoteCard，其余走 ImageCard） */
const SPECS = {
  text: {
    note: '引文卡：必须填 quote（title 会被忽略！）',
    cols: { type: 'text', quote: '在这里写引文正文', quote_emoji: '🌙', tags: '["测试"]' },
  },
  image: {
    note: '图片卡：必须填 title + img',
    cols: { type: 'image', img: 'photo-1456513080510-7bf3a84b82f8', title: '在这里写标题', content: '正文可选', tags: '["测试"]' },
  },
  video: {
    note: '视频卡：title + img + duration（会显示播放按钮和时长）',
    cols: { type: 'video', img: 'photo-1481627834876-b7833e8f5570', title: '在这里写标题', duration: '12:34', video_url: '', tags: '["测试"]' },
  },
  article: {
    note: '长文卡：title 必填，左上角会显示「长文」标',
    cols: { type: 'article', title: '在这里写标题', content: '正文', tags: '["测试"]' },
  },
  podcast: {
    note: '播客卡：title 必填，左上角显示「播客」标',
    cols: { type: 'podcast', img: 'photo-1509062522246-3755977927d7', title: '在这里写标题', duration: '30:00', tags: '["测试"]' },
  },
}

const wanted = process.argv[2]
const types = wanted ? [wanted] : Object.keys(SPECS)
if (wanted && !SPECS[wanted]) {
  console.error(`❌ 未知类型 "${wanted}"。可选：${Object.keys(SPECS).join(' / ')}`)
  process.exit(1)
}

console.log(`数据库：${dbPath}`)
console.log(`作者：${user.name}  (author_id = ${user.id})\n`)
console.log('把下面的 SQL 复制到 DB Browser 的 Execute SQL 标签页执行，或粘进 sqlite3：\n')

for (const t of types) {
  const spec = SPECS[t]
  const cols = {
    id: randomUUID(),
    author_id: user.id,
    ...spec.cols,
    created_at: new Date().toISOString(),
  }
  const names = Object.keys(cols)
  const vals = names.map(n => `'${String(cols[n]).replace(/'/g, "''")}'`)
  console.log(`-- ${t}：${spec.note}`)
  console.log(`INSERT INTO posts (${names.join(', ')}) VALUES (${vals.join(', ')});\n`)
}
