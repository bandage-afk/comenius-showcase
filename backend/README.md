# Comenius 后端（账号系统 + 社区 API）

> ⚠️ **这是一个独立的新增目录，不影响现有前端（`src/`）**。
> 前端目前仍跑 `src/repositories/` 的本地 mock；接上本服务需要配置 `VITE_API_BASE`，
> 并按 `src/repositories/contracts.ts` 的契约对齐（见文末「与前端契约的关系」）。

## 技术栈

| 层       | 选型                              | 说明                              |
| -------- | --------------------------------- | --------------------------------- |
| 运行时   | Node.js 22+ / TypeScript          | `tsx` 直接跑 `.ts`，无需编译      |
| Web 框架 | Express 4                         | 生态成熟、与前端同语言            |
| 数据库   | `node:sqlite`（Node 内置）        | 零安装；生产换 PostgreSQL（见下） |
| 鉴权     | `jsonwebtoken`（JWT）+ `bcryptjs` | 邮箱验证码注册 + 邮箱密码登录     |

## 快速开始

```bash
cd backend
npm install
npm run dev               # http://localhost:3000
```

不建 `.env` 也能跑（有默认值）。可配置的环境变量：

| 变量         | 默认值                         | 说明                         |
| ------------ | ------------------------------ | ---------------------------- |
| `PORT`       | `3000`                         | 服务端口                     |
| `JWT_SECRET` | `dev-secret-change-me-in-prod` | **生产必须换成随机长字符串** |
| `SMTP_HOST`  | 空                             | 邮件服务（生产发验证码用）   |
| `SMTP_USER`  | 空                             |                              |
| `SMTP_PASS`  | 空                             |                              |
| `SMTP_FROM`  | 空                             |                              |

> 仓库根的 `.gitignore` 有 `.env*`，所以这里不提供 `.env.example`（避免绕过规则）；
> 按上表自建 `.env` 即可。

开发模式下，注册验证码**不会真发邮件**，直接打在服务端日志里，例如：

```
[DEV] 验证码（you@example.com）: 123456
```

同时 `POST /api/auth/send-code` 的响应里也会带 `devCode` 字段，方便本地调试。

### 其他命令

```bash
npm run typecheck   # tsc --noEmit
npm start           # 不用 watch，直接起
```

## 目录结构

```
backend/
├── package.json
├── tsconfig.json
├── .env.example
└── src/
    ├── index.ts      Express 入口 + 全部路由
    ├── config.ts     环境变量（端口 / JWT 密钥 / SMTP / dev 开关）
    ├── db.ts         建表 + 连接（生产换 Postgres 只改这一个文件）
    ├── services.ts   密码哈希 / JWT 签发校验 / 验证码 / 发信
    └── curation.ts   Blog 版面编排算法（打分 + 槽位填充）
```

## 数据模型

| 表                   | 作用                                                 |
| -------------------- | ---------------------------------------------------- |
| `users`              | 账号（邮箱 / 密码哈希 / 角色 / 昵称 / 头像 / 简介…） |
| `verification_codes` | 注册验证码（6 位，5 分钟有效，一次性）               |
| `posts`              | 帖子 / 长文 / 播客（含标签、频道、封面、视频地址）   |
| `comments`           | 评论                                                 |
| `likes`              | 点赞（user_id + post_id 唯一）                       |
| `collects`           | 收藏（同上）                                         |
| `follows`            | 关注（follower + followee 唯一）                     |
| `conversations`      | 私信会话（一对参与者一行 + 双方各自的已读位置）      |
| `messages`           | 私信消息（记 sender_id，按会话 + 时间索引）          |

角色：`student` / `teacher` / `parent`（可自助注册）、`admin`（不开放注册，手动入库）。

## API

所有写操作需要 `Authorization: Bearer <token>`。

### 账号

| 方法 | 路径                  | 说明                                     |
| ---- | --------------------- | ---------------------------------------- |
| POST | `/api/auth/send-code` | `{ email }` → 发 6 位验证码（注册用）    |
| POST | `/api/auth/register`  | `{ email, code, password, role, name? }` |
| POST | `/api/auth/login`     | `{ email, password }`                    |
| GET  | `/api/me`             | 当前用户                                 |

### 内容

| 方法 | 路径               | 说明                                 |
| ---- | ------------------ | ------------------------------------ |
| GET  | `/api/posts`       | 帖子列表（含作者、点赞/收藏/评论数） |
| POST | `/api/posts`       | 发布（需登录）                       |
| GET  | `/api/posts/:id`   | 单篇                                 |
| GET  | `/api/users/:id`   | 用户资料 + TA 的帖子                 |
| GET  | `/api/blog/layout` | Blog 编排好的版面（见下）            |

### 互动（均需登录）

| 方法 | 路径                      | 说明                               |
| ---- | ------------------------- | ---------------------------------- |
| POST | `/api/posts/:id/like`     | 点赞切换 → `{liked, likes}`        |
| POST | `/api/posts/:id/collect`  | 收藏切换 → `{collected, collects}` |
| POST | `/api/users/:id/follow`   | 关注切换 → `{following}`           |
| GET  | `/api/posts/:id/comments` | 评论列表                           |
| POST | `/api/posts/:id/comments` | 发评论                             |
| GET  | `/api/me/community`       | 我点赞/收藏/关注的 id 集合         |

### 私信（均需登录）

一对参与者只有一条会话记录（`user_a < user_b` 保证唯一）；拉消息即把「已读位置」推进到现在。

| 方法 | 路径                              | 说明                                             |
| ---- | --------------------------------- | ------------------------------------------------ |
| GET  | `/api/conversations`              | 我的会话列表（含对方信息、最后一条消息、未读数） |
| POST | `/api/conversations`              | `{ userId }` 发起（或拿到）与某人的会话          |
| GET  | `/api/conversations/:id/messages` | 消息列表（同时标记已读）                         |
| POST | `/api/conversations/:id/messages` | `{ text }` 发消息                                |

## Blog 版面编排（`src/curation.ts`）

杂志式版面需要回答「哪篇文章放哪个位置」。这里用**算法自动编排**（无人工）：

```
score = freshness + engagement + imageBonus
  freshness  = exp(-ageHours / 72)          3 天半衰期
  engagement = log(1 + likes*3 + comments*5) 归一化
  imageBonus = hasCover ? 0.35 : 0           杂志版式的大图位必须有图
```

把版式拆成有序**槽位**（hero / heroSecondary / grid / insider / highlights / profiles /
右栏），按分数从高到低填充；**必须有图**的槽位只接受带封面的文章。
文章不够填满时，后面的区块不返回（前端整块不渲染）。

## 与前端契约的关系

前端（`feat/backend-contracts` 分支）已在 `src/repositories/contracts.ts` 用 zod 定义了
数据契约，`http.ts` 通过 `VITE_API_BASE` 切换 mock / 真后端。

**当前两者的差异（需要在合并前对齐）**：

| 项            | 前端契约            | 本后端                                             |
| ------------- | ------------------- | -------------------------------------------------- |
| 路径前缀      | `GET /posts`        | `GET /api/posts`                                   |
| 列表返回      | 裸数组 `Post[]`     | `{ posts: [...] }`                                 |
| `Post.id`     | `number`            | `string`（uuid）                                   |
| `Post.author` | `string`（昵称）    | 对象 `{id, name, avatar…}`                         |
| `Post.likes`  | `string`（"1.5万"） | `number`                                           |
| 额外字段      | —                   | `collects` / `comments` / `channels` / `createdAt` |

对齐方向建议：契约随真实后端**演进**（`author` 升级为对象、`likes` 用 number、
列表返回带分页信封），而不是让后端迁就 mock 时代的形状。这一步单独开 PR 讨论。

## 生产环境

- **数据库**：`src/db.ts` 顶部注释写了迁移方式 —— 把 `DatabaseSync` 换成 `pg` 连接池，
  建表 SQL 基本兼容（uuid / ISO 时间都用 `TEXT` 存）。
- **邮件**：`src/services.ts` 的 `sendVerificationEmail` 里预留了接入点（Resend / SendGrid / SMTP）。
- **部署**：参考仓库根目录的 `deploy.sh` 与 `docs/DEPLOY.md`。
