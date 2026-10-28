# 协作规范（3–10 人）

## 基本原则

1. **main 永远可部署** —— 任何时候从 main 拉下来都能跑、能发版。
2. **小批量** —— 分支活不过 2 天；PR 改动尽量控制在 400 行以内。大改拆成多个 PR。
3. **契约先行** —— 改共享层（见下）之前先在群里说一声，或者由架构 owner 统一改。
4. **能回滚才敢快** —— 每个改动都要能一条命令退回上一版。

## 分支与提交

```bash
git switch -c feat/messages-group-announcement   # 或 fix/… chore/…
# …开发…
pnpm check        # 本地先过一遍门禁
git commit -m "feat(消息): 群公告支持多条发布"
git push -u origin HEAD
```

- 提交信息走 **Conventional Commits**（husky 会在 commit 时校验）：
  `type(scope): 描述`，type ∈ feat / fix / docs / style / refactor / perf / test / build / ci / chore
- 禁止直接 push main，禁止 force push（GitHub 分支保护会拦）
- ⚠️ 现实情况：私有仓库 + 个人账号下 GitHub 的**分支保护 / rulesets 不生效**（要 Team 计划，见
  [docs/REPO-SETUP.md](./docs/REPO-SETUP.md) §2）。当前用**方案 C**兜底：
  本地 `.husky/pre-push` 拦直推 main、CI 的 `流程自查（main 只接受 PR）` job 对直推 main 标红、
  PR 只允许 squash 合并。**这些都能被 `--no-verify` 或无视红叉绕过 —— 所以更靠纪律。**
- PR 必须 1 人 review；UI 改动必须在 PR 里贴前后截图

## 模块归属（改别人的模块请先打招呼）

| 模块               | 主要文件                                                                                                   | Owner                        |
| ------------------ | ---------------------------------------------------------------------------------------------------------- | ---------------------------- |
| 社区主站           | `src/pages/FeedPage.tsx`、`NoteDetailPage.tsx`、`ProfilePage.tsx`、`UserProfilePage.tsx`、`SearchPage.tsx` | 待定                         |
| 消息 / 通知 / 群聊 | `src/pages/MessagesPage.tsx`、`NotificationPage.tsx`、`src/communityStore.ts`、`src/community/data.ts`     | 待定（这块最复杂，固定一人） |
| 课程模块           | `src/tedclone/*`、`BlogPage.tsx`、`blogData.ts`、`PodcastPage.tsx`、`SchoolPage.tsx`、`FranksCiePage.tsx`  | 待定                         |
| 教师（领英版）     | `src/teacher/*`（只剩动态/人脉）、`src/pages/TeacherPage.tsx`                                              | 待定                         |
| 我的（含职业档案） | `src/pages/ProfilePage.tsx`、`src/profile/*`、`src/profileStore.ts`                                        | 待定                         |
| 3D 储物柜          | `src/lockerfolio/*`、`public/models`、`public/assets`                                                      | 待定                         |
| **共享契约层**     | `src/App.tsx`、`src/components/MainSidebar.tsx`、各 store 的对外 API、`src/index.css`、`vite.config.ts`    | 架构 owner                   |
| 部署 / 服务器      | nginx 配置、`deploy.sh`、服务器目录                                                                        | 部署 owner                   |

> owner 现在还都是"待定"：定了名字之后，**同时**更新 `.github/CODEOWNERS`
> （那边现在是占位，PR 只会 @ 到仓库管理员）。

## 共享契约层（变更需 review + 通知）

- `src/App.tsx`：路由表 `PageName` 与页面挂载
- `src/components/MainSidebar.tsx`：全局导航（每个新页面都要挂入口）
- `src/communityStore.ts` / `notesStore.ts` / `profileStore.ts`：跨模块状态
  - **改持久化结构必须加 migrate**，否则老用户浏览器里的数据会丢
- `src/repositories/**`：**数据访问边界**（[ADR-0006](./docs/adr/0006-store-as-repository-boundary.md)）。
  - 页面只认 store：读走 state、写走 action；页面**不许** import `src/repositories/**`，
    store 与页面也不许直接 import mock 数据模块（`community/data` / `data/posts` / `blogData` /
    `podcastData` / `notificationData`）—— 这条边界由 `.oxlintrc.json` 的 `no-restricted-imports` 在 CI 拦
  - 换数据源（接后端）只改这里 + 对应 slice，页面零改动
- `src/index.css`：设计 token（改这里影响全站视觉）
- `.figma/make/site.json`：站点标题/语言/robots

## 测试与验收（改完必须跑）

```bash
pnpm check       # 静态门禁：typecheck + lint + format + build + 包体预算
pnpm verify:ui   # 需要先 pnpm build && pnpm preview，再跑冒烟 + 布局 + E2E
```

### 单测（`pnpm test`，~0.2 秒）

- 跑在 `vitest`（`vitest.config.ts`）+ node 环境，不装 jsdom；测试与源码同目录：`src/**/*.test.ts`
- 该写什么：store 的**对外契约**（`communityStore.test.ts` 里的 key 快照）、action 的联动与边界、
  持久化迁移、失败语义。**拆 slice / 搬 action / 动持久化之前先跑它** ——
  比视觉基线快 300 倍，而且能发现视觉基线抓不到的「action 悄悄少了」
- 不该写什么：像素、真实网络、three.js 场景 —— 那些归 `visual` / `smoke` / `layout` / `e2e`
- 加新 store / 新 action 时顺手在契约快照里登记，否则 `pnpm test` 会红（这是有意的）

### 本地跑 UI 验收（新机器 / 新同学必看）

UI 脚本需要一个浏览器，脚本按 `CHROME_PATH` → 系统 Chrome → Playwright 自带 chromium 的顺序回退。
本机最省事的写法（**不装 playwright，直接借已装的 Chrome 和一份 playwright-core**）：

```bash
pnpm build && pnpm preview --port 4173 &     # 预览服务

./scripts/accept-ui.sh                     # 冒烟 9 + 布局 18 + E2E（一键）
./scripts/accept-ui.sh visual              # 视觉基线（拆大文件前后靠它证明"搬完没变样"）
./scripts/accept-ui.sh visual --geometry   # 连尺寸/位置一起比
./scripts/accept-ui.sh run /tmp/x.mjs      # 用同一套环境变量跑一次性脚本
```

想看错误兜底页长什么样：本地 `pnpm dev` 后访问 `?crash=1`（dev-only 触发器，生产构建里没有这段）。

`scripts/accept-ui.sh` 内置了 `SMOKE_BASE` / `CHROME_PATH` / `PLAYWRIGHT_CORE` 三个环境变量
（要覆盖就 `CHROME_PATH=... ./scripts/accept-ui.sh`），省得每次手打三行 export。

⚠️ 两条纪律：

1. **拆大文件 / 动共享组件之前**先 `node scripts/visual.mjs --update` 存基线，改完跑 `node scripts/visual.mjs --geometry`；
   **必须是零差异**，否则说明你改到了界面。
2. 视觉基线**不要在没看清差异的情况下 `--update`**——那是把回归"盖章通过"。差异截图在 `scripts/visual/shots/`。

- **改 UI 就要加/改断言**：布局类问题（元素溢出、被遮挡、跑到视口外）tsc / lint / build / 冒烟**都抓不到**，
  只有真浏览器量位置才抓得到。加断言的位置：`scripts/layout.mjs`（位置/尺寸）、`scripts/e2e.mjs`（交互）
- **别把页面改回静态 import**：入口包会从 75 KB 涨回 450 KB，`pnpm budget` 会拦你（见 ADR-0005）
- **删文件/删页面前先确认路由不可达**：`App.tsx` 里有 `PageName` 不等于有人能打开它，
  要同时确认没有任何 `navigate('xxx')` 指向它
- **不要用 `toSorted` / `toReversed`**：项目 lib 是 ES2020，旧 Safari（<16.4）不支持，统一用 `[...arr].sort()`

## 重要技术决定要写 ADR

凡是「以后会被问为什么」的决定（换工具链、改目录结构、拆/合模块、引入依赖），
在 `docs/adr/` 加一条（背景 → 决定 → 后果），并在 `docs/adr/README.md` 的表格里登记。
格式参考 [docs/adr/0001](./docs/adr/0001-prettier-instead-of-oxfmt.md)。

## 文档索引

- [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md) —— 模块地图、数据流、设计 token、质量门禁、lint 策略与债务
- [docs/DEPLOY.md](./docs/DEPLOY.md) —— 部署 / 回滚 / 备份 / 监控 / 故障处理 runbook
- [docs/adr/](./docs/adr/) —— 架构决策记录

## 设计 token（颜色）

- 所有颜色的**唯一来源**是 `src/index.css` 的 `:root` 块（`--brand`、`--surface`、`--text-muted` …）
- 内联样式写法：`style={{ color: 'var(--brand)', background: 'var(--surface)' }}`
- Tailwind 也可用（映射在 `@theme inline`）：`text-brand` / `bg-surface` / `border-linkedin`
- **不要在页面里写十六进制**；要新颜色先在 `:root` 加 token，再到 `@theme inline` 加一行映射
- ⚠️ 踩坑：Tailwind v4 会 tree-shake 掉「没被工具类引用」的 `@theme` 变量（产物 CSS 里消失），
  所以原始值必须放 `:root`，`@theme` 只做 `var()` 映射，否则内联样式里的 `var()` 解析失败、颜色丢失
- **有门禁了**：`pnpm tokens`（CI 的 static job 也会跑）——存量内联颜色冻结在
  `scripts/token-baseline.json`，**只许变小**；新文件出现颜色字面量、或 `var(--x)` 没定义在 `:root` 里，都会红。
  四种改法（样式对象 → `var(--brand)`、`text-[#191919]` → `text-ink`、`fill="#…"` → `style={{ fill: 'var(--brand)' }}`、
  新颜色先加 token）门禁失败时会直接打印
- ⚠️ 别用 `oxfmt` 格式化本项目：0.2.0 会删掉 TS 类型字面量里的分号（直接语法错误）。用 `pnpm format`（Prettier）

## 常用命令

```bash
pnpm dev          # 本地开发（8443）
pnpm check        # typecheck + lint + format + build + 包体预算（提交前必跑）
pnpm lint         # oxlint
pnpm deadcode     # knip：找没人引用的文件和未用依赖
pnpm smoke        # 无头浏览器冒烟：9 个主要页面 + 控制台报错
pnpm layout       # 布局断言：横向溢出 / 侧栏宽度 / 内容起点
pnpm e2e          # 交互断言：群设置 / 通知分类 / 发布 tab / 教师档案 / AI
pnpm budget       # 首屏包体预算（需先 build）
pnpm verify:ui    # 上面三套 UI 脚本一起跑
SMOKE_BASE=https://www.comenius.cn:8443/community/ node scripts/smoke.mjs   # 打线上
```

## 数据库（后端就绪后）

- 迁移**只允许前向追加**（`0007_xxx.sql`），不要改已执行过的迁移
- 每个迁移必须幂等（可重复执行不报错）
- 破坏性变更走两阶段：先加新字段 + 双写 → 前端迁完 → 再删旧字段
