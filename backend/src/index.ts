import express from 'express'
import cors from 'cors'
import crypto from 'node:crypto'
import { config } from './config'
import {
  db,
  type UserRow,
  type PostRow,
  type CommentRow,
  type ConversationRow,
  type MessageRow,
} from './db'
import { buildBlogLayout } from './curation'
import {
  hashPassword,
  verifyPassword,
  signToken,
  verifyToken,
  issueCode,
  consumeCode,
  sendVerificationEmail,
} from './services'

const app = express()
app.use(cors())
app.use(express.json())

const REGISTERABLE_ROLES = ['student', 'teacher', 'parent'] as const

function toPublicUser(row: UserRow) {
  return {
    id: row.id,
    email: row.email,
    role: row.role,
    name: row.name,
    avatar: row.avatar,
    bio: row.bio,
    school: row.school,
    comeniusId: row.comenius_id,
    verified: !!row.verified,
  }
}

function authUser(req: express.Request): UserRow | null {
  const auth = req.headers.authorization
  const token = auth?.startsWith('Bearer ') ? auth.slice(7) : ''
  const payload = verifyToken(token)
  if (!payload) return null
  return (
    (db.prepare('SELECT * FROM users WHERE id = ?').get(payload.sub) as UserRow | undefined) ?? null
  )
}

function countOf(table: 'likes' | 'collects' | 'comments', postId: string): number {
  return (
    (
      db.prepare(`SELECT COUNT(*) AS c FROM ${table} WHERE post_id = ?`).get(postId) as
        { c: number } | undefined
    )?.c ?? 0
  )
}

function publicUser(u: UserRow | undefined) {
  if (!u) return null
  return {
    id: u.id,
    name: u.name,
    avatar: u.avatar,
    comeniusId: u.comenius_id,
    verified: !!u.verified,
  }
}

function toPublicComment(row: CommentRow) {
  const author = db.prepare('SELECT * FROM users WHERE id = ?').get(row.author_id) as
    UserRow | undefined
  return { id: row.id, content: row.content, createdAt: row.created_at, author: publicUser(author) }
}

function toPublicPost(row: PostRow) {
  const author = db.prepare('SELECT * FROM users WHERE id = ?').get(row.author_id) as
    UserRow | undefined
  return {
    id: row.id,
    type: row.type,
    img: row.img,
    title: row.title,
    content: row.content,
    quote: row.quote,
    quoteEmoji: row.quote_emoji,
    tags: JSON.parse(row.tags || '[]'),
    duration: row.duration,
    videoUrl: row.video_url,
    channels: JSON.parse(row.channels || '["community"]'),
    createdAt: row.created_at,
    likes: countOf('likes', row.id),
    collects: countOf('collects', row.id),
    comments: countOf('comments', row.id),
    author: publicUser(author),
  }
}

/** 需要登录的路由：未登录直接 401 并返回 null */
function requireUser(req: express.Request, res: express.Response): UserRow | null {
  const user = authUser(req)
  if (!user) {
    res.status(401).json({ error: '请先登录' })
    return null
  }
  return user
}

const emailOk = (e: unknown): e is string =>
  typeof e === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)

/* ── 账号 ── */
app.post('/api/auth/send-code', (req, res) => {
  const email = req.body?.email
  if (!emailOk(email)) return res.status(400).json({ error: '邮箱格式不正确' })
  const code = issueCode(email)
  // 发信是副作用，不阻塞响应；失败只记日志（dev 模式本就不真发）
  void sendVerificationEmail(email, code).catch(err => console.error('[send-code] 发信失败', err))
  res.json({ ok: true, devCode: config.dev ? code : undefined })
})

app.post('/api/auth/register', (req, res) => {
  const { email, code, password, role, name } = req.body ?? {}
  if (
    !emailOk(email) ||
    typeof code !== 'string' ||
    typeof password !== 'string' ||
    typeof role !== 'string'
  ) {
    return res.status(400).json({ error: '缺少必填字段' })
  }
  if (!(REGISTERABLE_ROLES as readonly string[]).includes(role)) {
    return res.status(400).json({ error: '无效的角色' })
  }
  if (password.length < 6) return res.status(400).json({ error: '密码至少 6 位' })

  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email)
  if (existing) return res.status(409).json({ error: '该邮箱已注册' })

  if (!consumeCode(email, code)) return res.status(400).json({ error: '验证码错误或已过期' })

  const id = crypto.randomUUID()
  const now = new Date().toISOString()
  db.prepare(
    'INSERT INTO users (id, email, password_hash, role, name, created_at) VALUES (?, ?, ?, ?, ?, ?)',
  ).run(id, email, hashPassword(password), role, name || '', now)

  const token = signToken(id, role)
  res.json({
    token,
    user: {
      id,
      email,
      role,
      name: name || '',
      avatar: '',
      bio: '',
      school: '',
      comeniusId: '',
      verified: false,
    },
  })
})

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body ?? {}
  if (!emailOk(email) || typeof password !== 'string') {
    return res.status(400).json({ error: '缺少邮箱或密码' })
  }
  const row = db.prepare('SELECT * FROM users WHERE email = ?').get(email) as UserRow | undefined
  if (!row || !verifyPassword(password, row.password_hash)) {
    return res.status(401).json({ error: '邮箱或密码错误' })
  }
  db.prepare('UPDATE users SET last_login_at = ? WHERE id = ?').run(
    new Date().toISOString(),
    row.id,
  )
  const token = signToken(row.id, row.role)
  res.json({ token, user: toPublicUser(row) })
})

app.get('/api/me', (req, res) => {
  const user = authUser(req)
  if (!user) return res.status(401).json({ error: '未登录' })
  res.json({ user: toPublicUser(user) })
})

/* ── 社区：帖子 ── */
app.get('/api/posts', (req, res) => {
  const rows = db
    .prepare('SELECT * FROM posts ORDER BY created_at DESC')
    .all() as unknown as PostRow[]
  res.json({ posts: rows.map(toPublicPost) })
})

app.post('/api/posts', (req, res) => {
  const user = authUser(req)
  if (!user) return res.status(401).json({ error: '未登录' })
  const { type, title, content, img, quote, quoteEmoji, tags, duration, videoUrl, channels } =
    req.body ?? {}
  const id = crypto.randomUUID()
  const now = new Date().toISOString()
  db.prepare(
    'INSERT INTO posts (id, author_id, type, img, title, content, quote, quote_emoji, tags, duration, video_url, channels, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
  ).run(
    id,
    user.id,
    type || 'text',
    img || '',
    title || '',
    content || '',
    quote || '',
    quoteEmoji || '',
    JSON.stringify(Array.isArray(tags) ? tags : []),
    duration || '',
    videoUrl || '',
    JSON.stringify(Array.isArray(channels) ? channels : ['community']),
    now,
  )
  const row = db.prepare('SELECT * FROM posts WHERE id = ?').get(id) as unknown as PostRow
  res.json({ post: toPublicPost(row) })
})

app.get('/api/posts/:id', (req, res) => {
  const row = db.prepare('SELECT * FROM posts WHERE id = ?').get(req.params.id) as unknown as
    PostRow | undefined
  if (!row) return res.status(404).json({ error: '帖子不存在' })
  res.json({ post: toPublicPost(row) })
})

/* ── 互动：点赞 / 收藏 / 关注（toggle） ── */
function toggle(table: 'likes' | 'collects', col: 'post_id', id: string, userId: string): boolean {
  const exists = db
    .prepare(`SELECT 1 FROM ${table} WHERE user_id = ? AND ${col} = ?`)
    .get(userId, id)
  if (exists) db.prepare(`DELETE FROM ${table} WHERE user_id = ? AND ${col} = ?`).run(userId, id)
  else
    db.prepare(`INSERT INTO ${table} (user_id, ${col}, created_at) VALUES (?, ?, ?)`).run(
      userId,
      id,
      new Date().toISOString(),
    )
  return !exists
}

app.post('/api/posts/:id/like', (req, res) => {
  const user = requireUser(req, res)
  if (!user) return
  const id = req.params.id
  if (!db.prepare('SELECT id FROM posts WHERE id = ?').get(id))
    return res.status(404).json({ error: '帖子不存在' })
  const liked = toggle('likes', 'post_id', id, user.id)
  res.json({ liked, likes: countOf('likes', id) })
})

app.post('/api/posts/:id/collect', (req, res) => {
  const user = requireUser(req, res)
  if (!user) return
  const id = req.params.id
  if (!db.prepare('SELECT id FROM posts WHERE id = ?').get(id))
    return res.status(404).json({ error: '帖子不存在' })
  const collected = toggle('collects', 'post_id', id, user.id)
  res.json({ collected, collects: countOf('collects', id) })
})

app.post('/api/users/:id/follow', (req, res) => {
  const user = requireUser(req, res)
  if (!user) return
  const targetId = req.params.id
  if (targetId === user.id) return res.status(400).json({ error: '不能关注自己' })
  if (!db.prepare('SELECT id FROM users WHERE id = ?').get(targetId))
    return res.status(404).json({ error: '用户不存在' })
  const exists = db
    .prepare('SELECT 1 FROM follows WHERE follower_id = ? AND followee_id = ?')
    .get(user.id, targetId)
  if (exists)
    db.prepare('DELETE FROM follows WHERE follower_id = ? AND followee_id = ?').run(
      user.id,
      targetId,
    )
  else
    db.prepare('INSERT INTO follows (follower_id, followee_id, created_at) VALUES (?, ?, ?)').run(
      user.id,
      targetId,
      new Date().toISOString(),
    )
  res.json({ following: !exists })
})

/* ── 评论 ── */
app.get('/api/posts/:id/comments', (req, res) => {
  const rows = db
    .prepare('SELECT * FROM comments WHERE post_id = ? ORDER BY created_at ASC')
    .all(req.params.id) as unknown as CommentRow[]
  res.json({ comments: rows.map(toPublicComment) })
})

app.post('/api/posts/:id/comments', (req, res) => {
  const user = requireUser(req, res)
  if (!user) return
  const content = String(req.body?.content ?? '').trim()
  if (!content) return res.status(400).json({ error: '评论不能为空' })
  if (content.length > 1000) return res.status(400).json({ error: '评论过长' })
  const id = req.params.id
  if (!db.prepare('SELECT id FROM posts WHERE id = ?').get(id))
    return res.status(404).json({ error: '帖子不存在' })
  const cid = crypto.randomUUID()
  db.prepare(
    'INSERT INTO comments (id, post_id, author_id, content, created_at) VALUES (?, ?, ?, ?, ?)',
  ).run(cid, id, user.id, content, new Date().toISOString())
  const row = db.prepare('SELECT * FROM comments WHERE id = ?').get(cid) as unknown as CommentRow
  res.json({ comment: toPublicComment(row) })
})

/* ── 我的互动状态（供 feed / 个人页合并显示） ── */
app.get('/api/me/community', (req, res) => {
  const user = requireUser(req, res)
  if (!user) return
  const ids = (table: 'likes' | 'collects', col: string) =>
    (
      db.prepare(`SELECT ${col} AS v FROM ${table} WHERE user_id = ?`).all(user.id) as unknown as {
        v: string
      }[]
    ).map(r => r.v)
  const follows = (
    db
      .prepare('SELECT followee_id AS v FROM follows WHERE follower_id = ?')
      .all(user.id) as unknown as { v: string }[]
  ).map(r => r.v)
  res.json({ likes: ids('likes', 'post_id'), collects: ids('collects', 'post_id'), follows })
})

/* ── 私信 ── */

/** 一对参与者只有一条会话：按 id 排序保证 (a,b) 唯一 */
function findOrCreateConversation(me: string, peer: string): ConversationRow {
  const [a, b] = me < peer ? [me, peer] : [peer, me]
  const existing = db
    .prepare('SELECT * FROM conversations WHERE user_a = ? AND user_b = ?')
    .get(a, b) as ConversationRow | undefined
  if (existing) return existing
  const id = crypto.randomUUID()
  db.prepare('INSERT INTO conversations (id, user_a, user_b, created_at) VALUES (?, ?, ?, ?)').run(
    id,
    a,
    b,
    new Date().toISOString(),
  )
  return db
    .prepare('SELECT * FROM conversations WHERE id = ?')
    .get(id) as unknown as ConversationRow
}

/** 我在这个会话里是否 a 方 */
const isA = (conv: ConversationRow, me: string) => conv.user_a === me

function toPublicMessage(row: MessageRow, me: string) {
  return {
    id: row.id,
    from: row.sender_id === me ? ('me' as const) : ('other' as const),
    type: row.type,
    text: row.text,
    emoji: row.emoji,
    thumb: row.thumb,
    time: row.created_at,
  }
}

function toPublicConversation(row: ConversationRow, me: string) {
  const peerId = isA(row, me) ? row.user_b : row.user_a
  const peer = db.prepare('SELECT * FROM users WHERE id = ?').get(peerId) as UserRow | undefined
  const lastMsg = db
    .prepare('SELECT * FROM messages WHERE conversation_id = ? ORDER BY created_at DESC LIMIT 1')
    .get(row.id) as MessageRow | undefined
  const lastRead = isA(row, me) ? row.last_read_a : row.last_read_b
  const unread =
    (
      db
        .prepare(
          'SELECT COUNT(*) AS c FROM messages WHERE conversation_id = ? AND sender_id != ? AND created_at > ?',
        )
        .get(row.id, me, lastRead) as { c: number } | undefined
    )?.c ?? 0
  return {
    id: row.id,
    peer: publicUser(peer),
    last: lastMsg ? lastMsg.text || `[${lastMsg.type}]` : '',
    lastAt: lastMsg?.created_at ?? row.created_at,
    unread,
  }
}

/** 我的会话列表（按最后消息时间倒序） */
app.get('/api/conversations', (req, res) => {
  const user = requireUser(req, res)
  if (!user) return
  const rows = db
    .prepare('SELECT * FROM conversations WHERE user_a = ? OR user_b = ?')
    .all(user.id, user.id) as unknown as ConversationRow[]
  const list = rows
    .map(r => toPublicConversation(r, user.id))
    .toSorted((x, y) => (x.lastAt < y.lastAt ? 1 : -1))
  res.json({ conversations: list })
})

/** 发起（或拿到）与某人的会话 */
app.post('/api/conversations', (req, res) => {
  const user = requireUser(req, res)
  if (!user) return
  const peerId = String(req.body?.userId ?? '')
  if (!peerId) return res.status(400).json({ error: '缺少 userId' })
  if (peerId === user.id) return res.status(400).json({ error: '不能和自己私信' })
  if (!db.prepare('SELECT id FROM users WHERE id = ?').get(peerId))
    return res.status(404).json({ error: '用户不存在' })
  const conv = findOrCreateConversation(user.id, peerId)
  res.json({ conversation: toPublicConversation(conv, user.id) })
})

/** 会话内的消息（同时把我的已读位置推进到现在） */
app.get('/api/conversations/:id/messages', (req, res) => {
  const user = requireUser(req, res)
  if (!user) return
  const conv = db
    .prepare('SELECT * FROM conversations WHERE id = ?')
    .get(req.params.id) as unknown as ConversationRow | undefined
  if (!conv || (!isA(conv, user.id) && conv.user_b !== user.id))
    return res.status(404).json({ error: '会话不存在' })
  const rows = db
    .prepare('SELECT * FROM messages WHERE conversation_id = ? ORDER BY created_at ASC')
    .all(conv.id) as unknown as MessageRow[]
  // 标记已读
  const now = new Date().toISOString()
  db.prepare(
    isA(conv, user.id)
      ? 'UPDATE conversations SET last_read_a = ? WHERE id = ?'
      : 'UPDATE conversations SET last_read_b = ? WHERE id = ?',
  ).run(now, conv.id)
  res.json({ messages: rows.map(r => toPublicMessage(r, user.id)) })
})

/** 发消息 */
app.post('/api/conversations/:id/messages', (req, res) => {
  const user = requireUser(req, res)
  if (!user) return
  const conv = db
    .prepare('SELECT * FROM conversations WHERE id = ?')
    .get(req.params.id) as unknown as ConversationRow | undefined
  if (!conv || (!isA(conv, user.id) && conv.user_b !== user.id))
    return res.status(404).json({ error: '会话不存在' })
  const text = String(req.body?.text ?? '').trim()
  if (!text) return res.status(400).json({ error: '消息不能为空' })
  if (text.length > 2000) return res.status(400).json({ error: '消息过长' })
  const id = crypto.randomUUID()
  const now = new Date().toISOString()
  db.prepare(
    'INSERT INTO messages (id, conversation_id, sender_id, type, text, created_at) VALUES (?, ?, ?, ?, ?, ?)',
  ).run(id, conv.id, user.id, 'text', text, now)
  // 自己发的消息，自己肯定是已读的
  db.prepare(
    isA(conv, user.id)
      ? 'UPDATE conversations SET last_read_a = ? WHERE id = ?'
      : 'UPDATE conversations SET last_read_b = ? WHERE id = ?',
  ).run(now, conv.id)
  const row = db.prepare('SELECT * FROM messages WHERE id = ?').get(id) as unknown as MessageRow
  res.json({ message: toPublicMessage(row, user.id) })
})

/* ── Blog：编排好的版面 ── */
app.get('/api/blog/layout', (_req, res) => {
  res.json(buildBlogLayout())
})

/* ── 社区：用户 ── */
app.get('/api/users/:id', (req, res) => {
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.params.id) as
    UserRow | undefined
  if (!user) return res.status(404).json({ error: '用户不存在' })
  const posts = db
    .prepare('SELECT * FROM posts WHERE author_id = ? ORDER BY created_at DESC')
    .all(user.id) as unknown as PostRow[]
  res.json({ user: toPublicUser(user), posts: posts.map(toPublicPost) })
})

app.listen(config.port, () => {
  console.log(`✅ 后端已启动 http://localhost:${config.port}`)
})
