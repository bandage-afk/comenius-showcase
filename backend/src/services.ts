import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import crypto from 'node:crypto'
import { config } from './config'
import { db } from './db'

/* ── 密码 ── */
export function hashPassword(pw: string): string {
  return bcrypt.hashSync(pw, 10)
}
export function verifyPassword(pw: string, hash: string): boolean {
  return bcrypt.compareSync(pw, hash)
}

/* ── JWT ── */
export function signToken(userId: string, role: string): string {
  return jwt.sign({ sub: userId, role }, config.jwtSecret, { expiresIn: '7d' })
}
export function verifyToken(token: string): { sub: string; role: string } | null {
  try {
    const payload = jwt.verify(token, config.jwtSecret) as { sub: string; role: string }
    return { sub: payload.sub, role: payload.role }
  } catch {
    return null
  }
}

/* ── 验证码 ── */
export function generateCode(): string {
  return String(crypto.randomInt(0, 1000000)).padStart(6, '0')
}

/** 生成并落库一个 6 位验证码，5 分钟有效；返回 code（dev 用，prod 只发邮件不返回给接口） */
export function issueCode(email: string): string {
  const code = generateCode()
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString()
  db.prepare('DELETE FROM verification_codes WHERE email = ?').run(email)
  db.prepare(
    'INSERT INTO verification_codes (email, code, purpose, expires_at) VALUES (?, ?, ?, ?)',
  ).run(email, code, 'register', expiresAt)
  return code
}

/** 校验并消费验证码（一次性） */
export function consumeCode(email: string, code: string): boolean {
  const row = db
    .prepare('SELECT * FROM verification_codes WHERE email = ? AND code = ?')
    .get(email, code) as { consumed_at: string | null; expires_at: string } | undefined
  if (!row) return false
  if (row.consumed_at) return false
  if (new Date(row.expires_at).getTime() < Date.now()) return false
  db.prepare('UPDATE verification_codes SET consumed_at = ? WHERE email = ? AND code = ?').run(
    new Date().toISOString(),
    email,
    code,
  )
  return true
}

/* ── 邮件 ── */
export async function sendVerificationEmail(email: string, code: string): Promise<void> {
  if (config.dev) {
    // 开发模式：把验证码打到服务端日志，方便本地跑通
    console.log(`[DEV] 验证码（${email}）: ${code}`)
    return
  }
  // TODO: 生产接入真实邮件服务（Resend / SendGrid / SMTP）
  console.log(`[PROD] 待发送邮件到 ${email}（邮件服务未配置）`)
}
