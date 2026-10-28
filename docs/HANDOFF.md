# 项目现状与交接说明

> **这份文档的用途**：给"新会话 / 新同事 / AI 助手"快速接上项目现状。
> 写于 2026-10-04。作者：yuxinzhou（非程序员，AI 辅助开发）。
>
> **给 AI 助手的话**：读完这份文档，你就知道了仓库现状、已查清的事实、以及下一步该做什么。
> 不要重新去猜"有没有后端"——答案在下面，而且都经过实测验证。

---

## 0. 一句话总结

**这是一个纯前端 SPA，没有后端在跑。** 仓库里**有**一个写得不错的后端和一份数据丰富的数据库，
但它们在另外的分支上、且**从未与前端连接过**。当前 `main` 分支的界面全部使用硬编码假数据。

---

## 1. 本机环境（2026-10-04 已修复）

| 工具 | 版本 | 备注 |
| --- | --- | --- |
| Node | **v26.10.0** | 从 20 切到 26，因为后端需要 `node:sqlite`（Node 20 没有） |
| npm | 11.19.1 | 切换 Node 后软链接曾损坏，已修复 |
| pnpm | 12.8.1 | 正常 |
| sqlite3 | 3.51.0 | 系统自带，可直接查库 |
| git | 2.50.1 | 凭证助手 `osxkeychain` |

### ⚠️ 项目位置：有两个副本，容易搞混

| | 路径 | 状态 |
| --- | --- | --- |
| **工作副本（用这个）** | `~/Projects/comenius` | 依赖已装，构建/测试/开发服务器均已验证通过 |
| 备份副本（只读，别动） | iCloud `.../Mobile Documents/.../Frank-cie-` | 完整保留，**不要在里面改代码或提交** |

**两个副本都有独立 `.git`。只在 `~/Projects/comenius` 里操作 git**，否则历史会分叉。

### 回退 Node 版本（如果需要）

```bash
brew unlink node && brew link --overwrite node@20
```

### 已知的误报（不要被它误导）

`npm` 曾经报错 `Your cache folder contains root-owned files` 并建议 `sudo chown -R 501:20 ~/.npm`。
**实测这是误报**：`~/.npm` 里没有任何 root 属主文件，权限正常，`npm install` 完全可用。
**不要执行那条 `sudo chown`。**

---

## 2. 已实测确认的核心事实

### 2.1 前端数据全是假的，分三层

| 类型 | 存放位置 | 例子 | 特点 |
| --- | --- | --- | --- |
| ① 种子数据 | `src/` 里 9 个 `.ts` 文件 | 200 条帖子、2800 条评论 | 硬编码，编译进 JS |
| ② 用户数据 | 浏览器 **localStorage** | 点赞、私信、自己发的笔记 | 只在**本机浏览器**里，换设备就没了 |
| ③ 图片 | **Unsplash 图床** | 所有头像和配图 | 需要联网，断网就空白 |

**种子数据文件清单**（约 2700 行，全部硬编码）：

| 文件 | 行数 | 内容 |
| --- | --- | --- |
| `src/data/posts.ts` | 1798 | 200 条帖子 |
| `src/community/data.ts` | 500 | 62 个用户、11 个会话、消息种子 |
| `src/blogData.ts` | 194 | Blog 文章 + 分类 |
| `src/podcastData.ts` | 162 | 播客剧集 |
| `src/notificationData.ts` | 99 | 16 条通知 |
| `src/teacherData.ts` | 56 | 教师资料 |
| `src/lockerfolio/data/content.ts` | 279 | 3D 储物柜内容 |

**localStorage 键名**（接后端后需要清理/迁移）：

```
comenius_community        社区/私信/群设置 (persist 版本 v7)
comenius_notifications    通知已读状态
comenius_profile          个人档案
comenius_teacher          教师工作台
comenius_user_notes       用户发布的笔记
comenius-admin-mock-v1    管理后台（完全独立的一套 mock）
comenius_flags            功能开关
```

**图片是这么来的**（`src/components/ui/Avatar.tsx`）：

```ts
const url = (avatar, w) => `https://images.unsplash.com/${avatar}?w=${w}&h=${w}&fit=crop&auto=format`
```

种子里存的只是一个 ID 字符串（如 `photo-1535713875002-d1d0cf377fde`），运行时才拼成 URL。

### 2.2 有两个互不相干的数据库

| | 数据库 1：`database/` | 数据库 2：`backend/.data/`（分支上） |
| --- | --- | --- |
| 文件 | `comenius-demo.sqlite`（1.9 MB） | `dev.sqlite`（启动后端时自动生成） |
| 表数量 | **78 张** | **9 张** |
| 数据 | ✅ 3903 行 | ❌ 空，只有表结构 |
| 谁在用 | **没有任何代码在读它** ❌ | 后端 |
| 字段风格 | `author`（文本）、`likes`（文本） | `author_id`（外键）、`likes`（数字） |

**结论：两者字段结构不同，不能直接互导，需要写转换脚本。**

`database/` 里的文件：

```
comenius-demo.sqlite    1.9 MB   数据库本体（二进制）
schema.sqlite.sql        35 KB   建表语句（SQLite 版）
schema.postgres.sql      31 KB   建表语句（PostgreSQL 版）
seed.sqlite.sql         2.6 MB   灌数据语句（SQLite 版）
seed.postgres.sql       2.6 MB   灌数据语句（PostgreSQL 版）
coverage.json            30 KB   数据统计（78 表 / 3903 行）
source-data.json        1.4 MB   原始数据快照
```

它由某个已丢失的脚本 `scripts/database/build_database.py` 生成（该脚本**不在仓库里**，也从未提交过），
生成时间是 10-03，**晚于后端分支的 09-30**——所以写后端的人并不知道它存在。

### 2.3 三个"接后端"的分支，各做了一半，从未合并

项目实际有 **12 个分支**，其中三个都是想解决"接后端"，但方案完全不同：

| 分支 | 提交日 | 有什么 | 缺什么 |
| --- | --- | --- | --- |
| `feat/backend-contracts` | 09-25 | ✅ **最完善的接入层** | ❌ 没有 `backend/` |
| `feat/backend-account-community-api` | 09-30 | ✅ **能跑的后端**（20 接口） | ❌ 没有前端接入层 |
| `feat/full-app-and-backend` | 09-30 | ✅ **另一套完整实现** | ⚠️ 是另一套界面，1 个提交塞进 2086 个文件 |

**`feat/backend-contracts` 的设计（最值得参考）**：

- `src/repositories/http.ts` —— 传输层。用环境变量 `VITE_API_BASE` 当开关：
  ```ts
  export const API_BASE = import.meta.env.VITE_API_BASE
  export const hasBackend = Boolean(API_BASE)
  ```
  GET 失败指数退避重试 2 次；4xx 不重试。
- `src/repositories/contracts.ts` —— **zod 契约**，校验后端返回的数据形状。
- `src/repositories/postsRepo.ts` —— **双模式**：
  ```ts
  export async function fetchPosts(): Promise<Post[]> {
    if (!hasBackend) return listPosts()                    // 没配 → 本地种子
    return PostListSchema.parse(await getJSON('/posts'))   // 配了 → 走 HTTP
  }
  ```
  好处：一个开关切换真假数据，**页面代码一行都不用改**（符合 ADR-0006）。

**`feat/backend-account-community-api` 的后端**（实测可跑）：

```
backend/                    878 行后端代码
├── src/index.ts    490 行  ★ 20 个接口 + 全部业务逻辑
├── src/db.ts       169 行  ★ 建 9 张表 + 连数据库
├── src/curation.ts 136 行    Blog 版面排序算法
├── src/services.ts  69 行    密码加密(bcrypt) / JWT / 验证码
└── src/config.ts    14 行    环境变量
```

技术栈：Express 4 + `node:sqlite`（Node 内置，零安装）+ JWT + bcryptjs。
20 个接口覆盖：注册/登录/验证码、帖子增查、点赞、收藏、关注、评论、私信会话与消息、Blog 版面。

**正确做法不是 merge，而是"组装"**：

```
main 的界面
  + 分支 A 的 http.ts / contracts.ts（接入层）
  + 分支 B 的 backend/（后端）
  + 自写字段映射（对齐两边数据格式）
```

> ❌ 不要尝试 merge 这三个分支：B 和 C 有两份不同的 `backend/` 会冲突；
> C 会覆盖 main 的一半前端文件，把现在的界面毁掉。

---

## 3. `database/` 是否入库：**尚未决定**

当前 `git status`：

```
?? ARCHITECTURE.md     ← 未跟踪
?? database/          ← 未跟踪，8.4 MB
```

- 这两个都**还没提交**，所以现在处理还来得及。
- `database/` 里有 1.9 MB 的二进制 `.sqlite` 和两个 2.6 MB 的 `.sql`。
- 二进制文件在 git 里每次改动都存完整副本，仓库会膨胀。**建议加进 `.gitignore`。**
- `ARCHITECTURE.md`（41 KB）是有价值的架构说明，可以考虑提交。

**注意**：`database/` 一旦加进 `.gitignore`，本机仍保留文件，只是 git 不再跟踪它。
如果其他人也需要这份数据库，应该另找共享方式（网盘 / Release 附件），而不是塞进 git。

---

## 4. 团队与协作

**这个仓库不是你的**，是 `dongyuming0717-ctrl` 的：

```
origin  https://github.com/dongyuming0717-ctrl/Frank-cie-.git
```

贡献者统计（`git log --all`）：

| 提交数 | 谁 |
| --- | --- |
| 119 | yumingdong `<dongyuming0717@gmail.com>` |
| 13 | Dream `<Dreamm202106@163.com>` |
| 7 | dongyuming0717-ctrl |
| 6 | dependabot[bot]（机器人） |
| 5 | **39 `<dai.char39@gmail.com>`（= 本机 git 身份，即你）** |

### ⚠️ 待确认：你有没有 push 权限

在**自己的终端**里跑（只试探，不会真的推）：

```bash
cd ~/Projects/comenius
git push --dry-run origin main
```

- `Everything up-to-date` → ✅ 有权限
- `403` / `Permission denied` → ❌ 需要让仓库主加你为 collaborator

### ⚠️ `admin-ui` 分支本地领先远程 6 个提交

```
admin-ui  ae250fd [origin/admin-ui: ahead 6]
```

有人在 `admin-ui` 上提交了但没推。**先问清楚是谁的，别乱动。**

### 📌 建议的沟通事项

1. 后端到底走哪条路线？`backend-contracts` 的双模式，还是 `backend-account-community-api` 的 20 接口？
2. `feat/profile-backend-prep` 有 20+ 提交未合并，还要不要？
3. `feat/mobile-messages` 的窄屏适配要不要合进 main？
4. 加我（`dai.char39@gmail.com` 对应的 GitHub 账号）为 collaborator。

---

## 5. 下一步计划（按优先级）

### 第 1 步：统一工作区

把 AI 助手 / 编辑器的工作目录设为 `~/Projects/comenius`，不要再用 iCloud 那份。

### 第 2 步：处理 `database/` 入库问题

决定加 `.gitignore` 还是提交。建议加 `.gitignore`。

### 第 3 步：把后端跑起来（不改前端）

从 `feat/backend-account-community-api` 把 `backend/` 取到 main，让它跑在 3000 端口。
**此时前端仍然用假数据，互不影响**——目的是先确认后端能跑、能写库。

```bash
cd ~/Projects/comenius/backend
npm install
npm run dev            # http://localhost:3000
```

开发模式下注册验证码不发邮件，直接打在服务端日志里，也在接口响应的 `devCode` 字段里。

### 第 4 步：打通"读"链路（**最小可用目标，强烈建议只做这一个**）

只接**帖子列表**一个接口，走完这条链路：

```
网页打开首页
  → postsRepo.listPosts()（改成 fetch）
  → HTTP GET http://localhost:3000/api/posts
  → 后端查 SQLite
  → 返回 JSON
  → 网页显示
```

**只做这一条**。彻底理解后再复制到第 2、3 个接口。不要一次接 20 个。

参考实现：`feat/backend-contracts` 的 `http.ts` + `postsRepo.ts` 双模式写法。

### 第 5 步（以后再说）：文件上传

**后端目前完全没有文件上传能力**（搜遍代码：无 multer / 无 multipart / 无 static）。
前端现在的做法是 `URL.createObjectURL(file)` 和 `FileReader.readAsDataURL()`，只存在本机浏览器。

要做上传，需要额外解决：后端装 multer + 加 `/api/upload` + 决定图片存哪（服务器磁盘 or 对象存储）。
**这是独立难题，可以晚点做**；不做也不影响发纯文字帖。

---

## 6. 常用命令

**都在 `~/Projects/comenius` 下执行。**

```bash
pnpm dev            # 启动前端开发服务器  http://localhost:8443
pnpm build          # 打包生产版本
pnpm test           # 跑 98 个单元测试
pnpm typecheck      # 类型检查
pnpm check          # 全套质量门禁（慢）
```

直接查数据库：

```bash
sqlite3 ~/Projects/comenius/database/comenius-demo.sqlite
# .tables                          看有哪些表
# SELECT * FROM users LIMIT 5;     看前 5 个用户
# .quit
```

Git 日常：

```bash
git status                  # 最常用，先跑这个
git pull                    # 拉取别人的更新
git add -A
git commit -m "feat: 说明"   # 仓库有 commitlint，用 feat:/fix:/docs: 前缀
git push
```

---

## 7. 关键文件地图

| 路径 | 作用 |
| --- | --- |
| `src/` | **全部前端代码**（浏览器里跑的） |
| `src/pages/` | 24 个页面 |
| `src/stores/` | Zustand 状态切片 |
| `src/repositories/` | **数据源适配层 ← 接后端要改这里** |
| `src/data/posts.ts` 等 9 个文件 | 硬编码假数据 |
| `backend/`（在分支上） | 后端，878 行 |
| `database/` | 那份被孤立的 78 表数据库 |
| `docs/adr/` | **7 个架构决策，理解项目最快的捷径** |
| `ARCHITECTURE.md` | 41 KB 架构说明（根目录，未跟踪） |
| `docs/TECH-DEBT.md` | 已知技术债 |
| `deploy.sh` | 部署脚本（SSH + nginx） |

---

## 8. 一句话给未来的自己

> 这个项目的**前端分层做得很好**（ADR-0006 把 store 当数据访问边界，页面不直接 fetch），
> **后端也写好了**，**数据库也有数据**——唯一缺的就是**把它们接起来**。
> 接口层照抄 `feat/backend-contracts`，后端拿 `feat/backend-account-community-api`，
> 先打通**帖子列表**一个接口，剩下的都是复制粘贴改字段名。
