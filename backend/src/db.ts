import { DatabaseSync } from 'node:sqlite'
import { mkdirSync } from 'node:fs'
import path from 'node:path'

// 本地开发用 SQLite（Node 内置，零安装）。
// 生产换 PostgreSQL 时只改这个文件：DatabaseSync 换成 pg 连接池，建表 SQL 基本兼容
// （id 用 TEXT 存 uuid、时间用 TEXT 存 ISO 字符串、tags/channels 用 JSON 字符串）。
//
// 【数据库文件位置】2026-10-04 从 `backend/.data/dev.sqlite` 挪到 `database/backend-dev.sqlite`：
//   1. 与 78 表那套数据库、以及 schema.sql / schema.postgres.sql 放在一起，位置统一好找
//   2. `database/` 已被根 .gitignore 忽略 *.sqlite，备份/清理时只需盯一个目录
//   3. 用 `DB_PATH` 可覆盖（服务器部署时指到 releases/ 外面的持久目录，
//      注意 deploy.sh 有 KEEP=5，放 release 里会被删）
//
// 默认落在仓库根的 database/ 下（= 从 backend/src/ 往上两级到仓库根，再进 database/）。
const dataDir = process.env.DB_PATH
  ? path.dirname(process.env.DB_PATH)
  : path.join(import.meta.dirname, '..', '..', 'database')
mkdirSync(dataDir, { recursive: true })

export const db = new DatabaseSync(process.env.DB_PATH || path.join(dataDir, 'backend-dev.sqlite'))

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('student','teacher','parent','admin')),
    name TEXT NOT NULL DEFAULT '',
    avatar TEXT NOT NULL DEFAULT '',
    bio TEXT NOT NULL DEFAULT '',
    school TEXT NOT NULL DEFAULT '',
    comenius_id TEXT NOT NULL DEFAULT '',
    verified INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL,
    last_login_at TEXT
  );

  CREATE TABLE IF NOT EXISTS verification_codes (
    email TEXT NOT NULL,
    code TEXT NOT NULL,
    purpose TEXT NOT NULL DEFAULT 'register',
    expires_at TEXT NOT NULL,
    consumed_at TEXT
  );

  CREATE TABLE IF NOT EXISTS posts (
    id TEXT PRIMARY KEY,
    author_id TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('image','text','video','article','podcast')),
    img TEXT NOT NULL DEFAULT '',
    title TEXT NOT NULL DEFAULT '',
    content TEXT NOT NULL DEFAULT '',
    quote TEXT NOT NULL DEFAULT '',
    quote_emoji TEXT NOT NULL DEFAULT '',
    tags TEXT NOT NULL DEFAULT '[]',
    duration TEXT NOT NULL DEFAULT '',
    video_url TEXT NOT NULL DEFAULT '',
    channels TEXT NOT NULL DEFAULT '["community"]',
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS comments (
    id TEXT PRIMARY KEY,
    post_id TEXT NOT NULL,
    author_id TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS likes (
    user_id TEXT NOT NULL,
    post_id TEXT NOT NULL,
    created_at TEXT NOT NULL,
    PRIMARY KEY (user_id, post_id)
  );

  CREATE TABLE IF NOT EXISTS collects (
    user_id TEXT NOT NULL,
    post_id TEXT NOT NULL,
    created_at TEXT NOT NULL,
    PRIMARY KEY (user_id, post_id)
  );

  CREATE TABLE IF NOT EXISTS follows (
    follower_id TEXT NOT NULL,
    followee_id TEXT NOT NULL,
    created_at TEXT NOT NULL,
    PRIMARY KEY (follower_id, followee_id)
  );

  -- 私信会话：一对参与者一行，user_a < user_b（保证同一对人只有一条记录）
  CREATE TABLE IF NOT EXISTS conversations (
    id TEXT PRIMARY KEY,
    user_a TEXT NOT NULL,
    user_b TEXT NOT NULL,
    created_at TEXT NOT NULL,
    -- 各方「读到哪儿了」，用于算未读数
    last_read_a TEXT NOT NULL DEFAULT '',
    last_read_b TEXT NOT NULL DEFAULT '',
    UNIQUE (user_a, user_b)
  );

  CREATE TABLE IF NOT EXISTS messages (
    id TEXT PRIMARY KEY,
    conversation_id TEXT NOT NULL,
    sender_id TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('text', 'sticker', 'video')),
    text TEXT NOT NULL DEFAULT '',
    emoji TEXT NOT NULL DEFAULT '',
    thumb TEXT NOT NULL DEFAULT '',
    created_at TEXT NOT NULL
  );

  CREATE INDEX IF NOT EXISTS idx_messages_conv ON messages (conversation_id, created_at);
`)

export type Role = 'student' | 'teacher' | 'parent' | 'admin'

export interface UserRow {
  id: string
  email: string
  password_hash: string
  role: Role
  name: string
  avatar: string
  bio: string
  school: string
  comenius_id: string
  verified: number
  created_at: string
  last_login_at: string | null
}

export type PostType = 'image' | 'text' | 'video' | 'article' | 'podcast'

export interface ConversationRow {
  id: string
  user_a: string
  user_b: string
  created_at: string
  last_read_a: string
  last_read_b: string
}

export interface MessageRow {
  id: string
  conversation_id: string
  sender_id: string
  type: 'text' | 'sticker' | 'video'
  text: string
  emoji: string
  thumb: string
  created_at: string
}

export interface CommentRow {
  id: string
  post_id: string
  author_id: string
  content: string
  created_at: string
}

export interface PostRow {
  id: string
  author_id: string
  type: PostType
  img: string
  title: string
  content: string
  quote: string
  quote_emoji: string
  tags: string
  duration: string
  video_url: string
  channels: string
  created_at: string
}
