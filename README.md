# 夸美纽斯 Comenius · 国际课程学习社区（全栈）

面向国际课程学生与教师的社区平台：小红书式内容社区、私信与群聊、课程内容、教师职业档案、3D 储物柜。
**前端 + 后端 + 数据库结构完整收录。**

---

## 技术栈

| 层 | 选型 |
| --- | --- |
| 前端 | React 19 · Vite 8 · TypeScript 5.7 · Tailwind CSS v4 · zustand · framer-motion · three / R3F / rapier |
| 后端 | Express 4 · TypeScript · `node:sqlite`（Node 内置，零安装）· JWT · bcryptjs |
| 数据库 | SQLite（生产可换 PostgreSQL，建表 SQL 基本兼容） |
| 质量 | Vitest（98 个单测）· oxlint · Prettier · Playwright（视觉基线）· commitlint |

---

## 目录结构

```text
.
├── src/                    前端源码（195 个 ts/tsx）
│   ├── pages/              24 个页面
│   ├── repositories/       ★ 数据访问层（接后端的唯一入口）
│   ├── stores/             zustand 状态（页面读取的数据边界，见 ADR-0006）
│   └── data/               本地种子数据（未接后端时的 fallback）
│
├── backend/                后端（Express + SQLite）
│   ├── src/index.ts        20 个 API 接口 + 业务逻辑
│   ├── src/db.ts           建表 + 数据库连接
│   ├── src/curation.ts     Blog 版面编排算法
│   └── src/services.ts     密码哈希 / JWT / 验证码
│
├── database/               数据库
│   ├── schema.sqlite.sql   ★ 78 张表建表语句（SQLite）
│   ├── schema.postgres.sql ★ 78 张表建表语句（PostgreSQL）
│   └── coverage.json       数据统计
│
├── docs/                   文档
│   ├── 数据对应表.md        ★ 前端字段 ↔ 数据库表的完整对照
│   ├── HANDOFF.md          项目交接说明
│   ├── TECH-DEBT.md        已知技术债
│   ├── DEPLOY.md           部署说明
│   └── adr/                7 个架构决策记录
│
└── uploads/                用户上传图片目录（仅骨架，内容不入库）
```

---

## 快速开始

### 1. 前端

```bash
pnpm install
pnpm dev                 # http://localhost:8443
```

### 2. 后端（可选，前端会自动回落本地种子数据）

```bash
cd backend
npm install
npm run dev              # http://localhost:3000
```

### 3. 让前端连上后端

在项目根建 `.env.local`：

```bash
VITE_API_BASE=http://localhost:3000
```

重启 `pnpm dev` 即生效。**留空则使用 `src/data/` 的本地种子数据**，页面表现完全一致。

### 4. 初始化数据库（可选）

```bash
sqlite3 database/app.sqlite < database/schema.sqlite.sql
```

> 数据库文件本身不入库（`.gitignore` 已排除 `*.sqlite`）——表结构在 `schema.*.sql`，数据由应用运行时写入。

---

## 架构要点

### 页面只认 store，不直接取数

```text
页面组件 → store action（同步语义） → repository 内部实现（localStorage / HTTP）
```

这条边界由 `.oxlintrc.json` 的 `no-restricted-imports` **强制检查**，页面无法绕过。
接后端只需改 `src/repositories/`，**页面代码零改动**（见 `docs/adr/0006`）。

### 双模式取数

`src/repositories/postsRepo.ts` 用 `VITE_API_BASE` 当开关：

- **没配** → 返回本地种子数据（首屏同步、不闪白）
- **配了** → 后台异步请求后端，成功后写回 store，页面自动重渲染
- **请求失败** → 保留现有数据、记一笔日志，**不抛错给页面**

### 点赞数：文字 ↔ 数字

前端展示 `'1.5万'`，数据库存 `15000`。`posts` 表用三列承载：

| 列 | 用途 |
| --- | --- |
| `likes` | 原始展示字符串（`'1.5万'`） |
| `likes_count` | 规范数字（排序 / 加减 / 统计），带 `CHECK` 约束保证与 `likes` 一致 |
| `likes_display` | 展示副本 |

转换规则见 `docs/数据对应表.md` 第 4 节。

---

## 常用命令

```bash
pnpm dev            # 开发服务器 http://localhost:8443
pnpm build          # 生产构建
pnpm test           # 98 个单元测试
pnpm typecheck      # 类型检查
pnpm lint           # oxlint（含分层边界检查）
pnpm check          # 全套质量门禁
```

---

## 文档索引

| 文档 | 内容 |
| --- | --- |
| [`docs/数据对应表.md`](docs/数据对应表.md) | **前端能显示的每样东西 ↔ 数据库哪张表**，含字段对照与缺口清单 |
| [`docs/HANDOFF.md`](docs/HANDOFF.md) | 项目现状、已查清的事实、下一步计划 |
| [`docs/adr/`](docs/adr/) | 7 个架构决策（尤其是 0006：store 作为数据边界） |
| [`backend/README.md`](backend/README.md) | 20 个 API 接口与数据模型 |

---

## 说明

本项目为学习社区平台的前后端完整实现。演示数据存放于前端种子文件与本地 SQLite，
不含真实用户信息；部署相关的主机地址已脱敏为占位符。
