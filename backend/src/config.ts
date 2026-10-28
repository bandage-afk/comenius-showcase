import 'dotenv/config'

export const config = {
  port: Number(process.env.PORT || 3000),
  jwtSecret: process.env.JWT_SECRET || 'dev-secret-change-me-in-prod',
  dev: process.env.NODE_ENV !== 'production',
  // 邮件服务（prod 才用；dev 模式把验证码打到服务端日志）
  smtp: {
    host: process.env.SMTP_HOST || '',
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
    from: process.env.SMTP_FROM || '',
  },
}
