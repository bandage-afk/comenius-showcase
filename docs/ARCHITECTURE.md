# 架构说明（v2）

面向接手的同学：这份文档回答「东西在哪、数据怎么流、改哪里会影响什么、怎么保证没改坏」。
部署与回滚见 [DEPLOY.md](./DEPLOY.md)，协作规范见 [../CONTRIBUTING.md](../CONTRIBUTING.md)。

---

## 1. 一句话结构

单页前端（React 19 + Vite 8 + TS 5.7），**没有后端**，所有数据在浏览器 `localStorage`。
页面由 `App.tsx` 里的 `PageName` 路由表挂载，除首页外全部懒加载。

```
index.html → src/main.tsx → src/App.tsx ─┬─ FeedPage（首页，同步加载，首屏 LCP）
                                          └─ 其余 19 个页面（React.lazy + Suspense）
```

## 2. 目录职责

| 目录                       | 职责                                                                                                                                                                                                   | 规模         |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------ |
| `src/App.tsx`              | **路由表**：`PageName` 类型、懒加载声明、页面挂载                                                                                                                                                      | 契约层       |
| `src/components/`          | 全站外壳 `AppShell`、左导航 `MainSidebar`、演示页签 `DemoNav`                                                                                                                                          | 契约层       |
| `src/app/`                 | 应用级脚手架：`flags.ts`（功能开关）、`routes.ts`（路由表）、`ErrorBoundary` 与错误上报（`errorReporting.ts`）                                                                                         | 契约层       |
| `src/components/ui/`       | 基础组件（Button / Input / Switch / Avatar / Tag / Empty）                                                                                                                                             | 设计系统     |
| `src/pages/`               | 各页面；`pages/messages/` 是消息页拆出的子模块                                                                                                                                                         | 业务         |
| `src/community/`           | 社区与消息的 mock 数据（会话、群成员、帖子池）                                                                                                                                                         | 数据         |
| `src/repositories/`        | **数据访问边界**（ADR-0006）：按资源取数 —— 帖子 / 用户 / 会话 / 消息 / 通知 / 内容 + `localStore`（唯一碰 localStorage）+ `errors`（错误语义）。页面与 store **不许**直接 import mock，这条由 lint 拦 | 契约层       |
| `src/communityStore.ts`    | 社区/消息/群设置的 zustand store：只负责组装 slice + 挂 persist（**持久化，改动要加 migrate**）                                                                                                        | 契约层       |
| `src/stores/community/`    | 上面这个 store 的拆分件：`types`（类型/默认值）、`persist`（迁移）、`messagesSlice`（私信）、`groupsSlice`（群管理）、`catalogSlice`（帖子/用户目录）、`helpers`（两边共用的小动作）                   | 契约层       |
| `src/contentStore.ts`      | 课程内容（Blog 文章 + Podcast 分类），只读、不持久化                                                                                                                                                   | 契约层       |
| `src/notesStore.ts`        | 用户发布的笔记（发布页写入，首页/个人页读取）                                                                                                                                                          | 契约层       |
| `src/profileStore.ts`      | 身份 + 学习档案 + 贴纸 + 职业档案（社区面与职业面共用同一份）                                                                                                                                          | 契约层       |
| `src/notificationStore.ts` | 通知已读状态 + 分类通知开关                                                                                                                                                                            | 契约层       |
| `src/teacher/`             | 教师模块（领英版式：**只剩动态 Home 与人脉 My Network**）                                                                                                                                              | 业务（独立） |
| `src/profile/`             | 「我的 → 职业」视图：职业档案类型、默认值与领英式档案 UI                                                                                                                                               | 业务         |
| `src/tedclone/`            | Podcast 用的 TED 版式组件                                                                                                                                                                              | 业务（独立） |
| `src/lockerfolio/`         | 3D 储物柜子应用（three / R3F / rapier，独立懒加载）                                                                                                                                                    | 业务（独立） |
| `src/forest/`              | 3D 森林场景（实验页，暂无导航入口）                                                                                                                                                                    | 实验         |
| `src/index.css`            | **设计 token 唯一来源**（`:root` + `@theme inline` 映射）                                                                                                                                              | 契约层       |
| `src/assets/fonts/`        | **自托管字体**：中文是 Google 的可变切片（按 unicode-range 分片）+ 拉丁由 `@fontsource/*` 提供；生成脚本 `scripts/fonts/`（改字重时重跑）                                                              | 资源         |
| `scripts/`                 | 验收脚本（冒烟 / 布局 / E2E / 包体预算）                                                                                                                                                               | 工程         |
| `src/scripts/assets/`      | 美术资源离线加工脚本（sharp 切图、打包图集），不参与前端构建                                                                                                                                           | 工具         |

## 3. 页面与路由

`PageName` 是**唯一的路由来源**。新增页面要做三件事：

1. `src/App.tsx` 的 `PageName` 联合类型里加一项；
2. `const XxxPage = lazy(() => import('./pages/XxxPage'))`；
3. 在 `<Suspense>` 里挂 `{page === 'xxx' && <XxxPage {...props} />}`；
4. 最后**别忘了挂入口**：`src/components/MainSidebar.tsx` 或页面内的 `navigate('xxx')`，
   否则页面永远打不开（`pnpm deadcode` 会报「未引用文件」，但不会告诉你路由不可达）。

页面拿到的统一 props 是 `NavProps`：

```ts
interface NavProps {
  navigate: (page: PageName, query?: string) => void
  currentPage: PageName
  searchQuery?: string
}
```

## 4. 页面外壳 AppShell

以前 14 个页面各写一遍「外层 div + flex + MainSidebar」，改导航要改十几处。
现在统一走 `src/components/AppShell.tsx`：

```tsx
<AppShell navigate={navigate} currentPage={currentPage}>
  …
</AppShell>
```

关键 prop 是 **`contentLayout`**，选错会出现「两栏变上下堆叠 / 输入框被挤出视口」这类**静态检查发现不了**的问题：

| 取值     | 内容区布局       | 用在哪些页面                       |
| -------- | ---------------- | ---------------------------------- |
| `block`  | 普通块级（默认） | 大部分内容页                       |
| `row`    | 横向 flex        | 消息页（列表 + 聊天区）、Amos AI   |
| `column` | 纵向 flex        | 通知页、发布页（自己管滚动的一栏） |

`fullHeight` 用于「自己管滚动、内容区撑满视口」的应用型页面（消息 / 通知 / AI）。

## 5. 数据流

```
用户操作 → 页面组件 → zustand action ─┬→ repositories/（现在 = mock + localStore，将来 = HTTP/WebSocket）
                                    ↘ React 订阅 store state → 重新渲染
```

页面**只认 store**：读走 state（订阅式），写走 action；页面里不许出现 `fetch`、
不许 import `src/repositories/**` 或 mock 数据模块（lint 拦，见 [ADR-0006](./adr/0006-store-as-repository-boundary.md)）。

三个 store 的持久化键（**改名 = 老用户数据丢失**）：

| store               | 存储键                   | 内容                                                                                 |
| ------------------- | ------------------------ | ------------------------------------------------------------------------------------ |
| `communityStore`    | `comenius_community`     | 会话、消息、群成员/管理员/昵称、公告、置顶/免打扰/归档、通知已读                     |
| `notesStore`        | `comenius_user_notes`    | 用户发布的笔记（发布页 → 首页/个人页）                                               |
| `profileStore`      | `comenius_profile`       | 身份（姓名/头像/封面/简介/地区）+ 学习档案 + 贴纸 + 职业档案（经历/学历/技能/证书…） |
| `notificationStore` | `comenius_notifications` | 通知已读状态 + 分类通知开关（关掉的分类不进列表也不进角标）                          |

`communityStore` 里已经有 `version` + `migrate`。**改持久化结构必须同步升 version 并在 migrate 里兼容旧数据**，
否则老用户打开就是白屏或丢数据。

### 与后端的边界（已按 ADR-0006 收敛，后端未接）

「发消息」「发帖」现在仍然只写本地，但**替换点只剩 `src/repositories/` 一个目录**：

| 资源                | 现在的实现                        | 换成后端时改哪               |
| ------------------- | --------------------------------- | ---------------------------- |
| 帖子 / 用户 / 会话  | `postsRepo` / `usersRepo` …       | 同一个文件里换成 `fetch`     |
| 通知条目            | `notificationsRepo`               | `GET /notifications`         |
| Blog / Podcast      | `contentRepo`                     | `GET /blog` / `GET /podcast` |
| 本地持久化          | `localStore`                      | IndexedDB 或本地+服务端同步  |
| 发送回执 / 对方消息 | `messagesRepo.send` + `pickReply` | `POST /messages` + WebSocket |

失败怎么处理也定在一处：`repositories/errors.ts` 的策略表（`silent` / `retry` / `rollback`），
页面不写 try/catch。后端骨架（Postgres + PostgREST + Fastify + MinIO，含 RLS 与迁移）
在初版目录 `backend/`，尚未并入本仓库。

## 6. 设计 token

全站颜色的**唯一来源**是 `src/index.css` 的 `:root`（`--brand` / `--surface` /
`--text-muted` / `--linkedin` / `--ted-red` …）。`@theme inline` 只做 `var()` 映射，供 Tailwind 工具类使用。

```tsx
style={{ color: 'var(--brand)', background: 'var(--surface)' }}   // 内联
<div className="text-brand bg-surface" />                          // Tailwind
```

⚠️ **Tailwind v4 会 tree-shake 掉「没被工具类引用」的 `@theme` 变量**（产物 CSS 里直接消失），
所以原始值必须在 `:root`，不能直接写在 `@theme` 里——否则内联 `var()` 解析失败、颜色变透明。
这条现在由门禁兜底（`pnpm tokens` 会检查每个 `var(--x)` 都能在 `:root` 里找到定义）。

### 内联颜色门禁（存量冻结，只许变小）

`scripts/check-token-usage.mjs` + `scripts/token-baseline.json`：数 `src/**` 里的颜色字面量
（hex + `rgb/rgba/hsl`，`src/index.css` 的 `:root` 块不算），和 `check-file-size.mjs` 一个套路——
**存量记在基线里，超了就红；不在基线里的文件出现颜色就直接红**。豁免目录只有
`src/lockerfolio/`、`src/forest/`（three.js / canvas 不认 CSS 变量，自带独立色板）。

```bash
pnpm tokens                   # 校验（CI 的 static job 里跑）
pnpm tokens --list            # 存量最多的文件，排下一轮活
pnpm tokens --update          # 把当前数字写回基线（调大需要 --force）
```

四种写法各有对应改法（门禁失败时也会打印这几条）：

| 写法                  | 改法                                                    |
| --------------------- | ------------------------------------------------------- |
| 样式对象 / CSS 字符串 | `color: '#FF2442'` → `color: 'var(--brand)'`            |
| Tailwind 任意值类名   | `text-[#191919]` → `text-ink`（映射见 `@theme inline`） |
| SVG 属性              | `fill="#FF2442"` → `style={{ fill: 'var(--brand)' }}`   |
| 确实需要新颜色        | 先在 `:root` 加 token，再到 `@theme inline` 加一行映射  |

⚠️ 别用 `--update` 给「刚写进去的内联色」盖章（和 `visual --update` 同理）：基线数字的
变化会出现在 PR diff 里，那正是给 review 看的。

## 7. 质量门禁

四层，全部在 CI 跑（`.github/workflows/ci.yml`）：

| 层   | 命令          | 覆盖什么                                                                                  |
| ---- | ------------- | ----------------------------------------------------------------------------------------- |
| 静态 | `pnpm check`  | typecheck + oxlint + prettier + 路由可达性 + 文件规模 + 设计 token + build + 包体预算     |
| 冒烟 | `pnpm smoke`  | 9 个主要页面能打开、无控制台报错（9 条断言）                                              |
| 布局 | `pnpm layout` | 9 个页面无横向溢出、侧栏宽度与内容起点正确（18 条断言）                                   |
| 交互 | `pnpm e2e`    | 群设置/二维码/输入框在视口内/发送已读、通知分类、发布 tab、教师档案、AI 问句（13 条断言） |

```bash
pnpm check                 # 提交前必跑
pnpm test                  # 只跑单测（~0.2 秒）
pnpm verify:ui             # 本地先 pnpm build && pnpm preview，再跑三套 UI 脚本
```

### 单测（store / repository）

`vitest`，配置见 `vitest.config.ts`（**不**复用 `vite.config.ts`：那份挂着 Figma Make 的插件，
跑单测不需要）。`environment: 'node'` + `vitest.setup.ts` 里 20 行的内存 `localStorage`，
不额外装 jsdom。

写测试的地方：`src/**/*.test.ts`（与源码同目录）。目前覆盖：

- `communityStore.test.ts`：**对外契约快照** —— 72 个 key，多一个少一个都要显式改契约。
  拆 slice / 搬 action（比如把 485 行 action 块拆成 messages / groups）跑这个就够，不用等视觉基线
- `stores/community/{messages,groups,catalog}Slice.test.ts`：乐观发送与回执、未读分隔线起点、
  删除会话的连带清理、公告置顶与已读、成员增删与权限联动
- `stores/community/persist.test.ts`：版本迁移、落盘范围、老数据回灌
- `notesStore` / `notificationStore` / `repositories/localStore`：发布落盘、通知已读与开关、失败语义

**有意不测**：像素级视觉、真实网络、three.js 场景 —— 这些交给 `visual` / `smoke` / `layout` / `e2e`。
单测只回答「状态与接口有没有变」。

**为什么要布局断言**：`AppShell` 的 `contentLayout` 选错时，tsc / lint / build / 冒烟**全部会过**，
但页面上输入框会被挤到视口外（y=1000+）。只有真开浏览器量 `getBoundingClientRect` 才抓得到。
同类问题（元素溢出、被遮挡、点不到）以后都往 `scripts/layout.mjs` / `e2e.mjs` 里加断言。

### 包体预算

`scripts/bundle-budget.mjs`：首屏 JS（`index.html` 直接引用的块）gzip 合计 **≤ 200 KB**，
单块 ≤ 900 KB。当前首屏 ≈ 126 KB，入口块 ≈ 75 KB。

这条门禁防的是一个很容易复发的退化：**只要有人把某个重页面从 `lazy()` 改回静态 import，
入口包会从 75 KB 涨回 450 KB**，而 tsc / lint / 冒烟全都不会报。

### 路由可达性

`scripts/check-routes.mjs`：从 `App.tsx` 解析 `PageName`，再全仓找 `navigate('xxx')`
与导航项表里的 `key: 'xxx'`，**报出「有路由但没人指过去」的僵尸页面**。
新页面忘了挂入口时会在这里被拦下；确属刻意保留的（如 `forest`）要在脚本的
`ALLOW_UNREACHABLE` 里写清理由。

### 图片策略

- 列表/卡片里的图片一律加 `loading="lazy"`（首页瀑布流、博客、教师动态已加）
- 图片必须**显式给定宽高或 `aspectRatio`**，否则懒加载会带来布局抖动（CLS）
- 图片地址统一带 Unsplash 的 `?w=&h=&fit=crop&auto=format` 参数按需取尺寸，不要直接引用原图

## 8. lint 策略与已知债务

oxlint 规则集显式写在 `.oxlintrc.json`（不靠默认值），分三类：

1. **必须修**（error）：correctness 类别 + `unicorn/no-array-sort`（脚本目录）。
2. **有意关掉**（带 overrides，见下）。
3. **暂留 warn**（下表）：不影响 CI，属于已知债务。

有意关掉的规则与理由：

| 范围                                                     | 规则                                 | 理由                                                                                                       |
| -------------------------------------------------------- | ------------------------------------ | ---------------------------------------------------------------------------------------------------------- |
| `src/forest/**`、`src/lockerfolio/scene/**`、`…/work/**` | `react/purity`、`react/immutability` | 3D 场景必须在 render/`useFrame` 里改 three.js 对象；随机布局用 `useMemo(…, [])` 生成才稳定                 |
| `src/**`                                                 | `unicorn/no-array-sort` / `-reverse` | 项目 lib 是 ES2020，**不能用 `toSorted`/`toReversed`**（Safari 16.4 以下不支持），统一用 `[...arr].sort()` |
| 全仓                                                     | `no-underscore-dangle` 的 allow 列表 | `_plane` / `_normal` 等是 three.js 预分配临时对象的既定命名                                                |

仍然存在的 7 条 warn（都是「用 deps 当触发器」的**有意写法**，改掉会改行为，故保留）：

| 位置                                       | 规则                                                    | 为什么保留                            |
| ------------------------------------------ | ------------------------------------------------------- | ------------------------------------- |
| `MessagesPage` 切会话重置草稿的那个 effect | `set-state-in-effect`、`exhaustive-effect-dependencies` | `activeConvId` 只当触发器，不参与计算 |
| `MessagesPage` 新消息贴底滚动              | `exhaustive-effect-dependencies`                        | `thread.length` 只当触发器            |
| `FeedPage` 搜索词同步                      | `set-state-in-effect`                                   | 输入框需要跟随外部 `searchQuery` 变化 |
| `AmosAIPage` / `TeacherApp` 新消息滚动     | `exhaustive-effect-dependencies`                        | 同上，`messages.length` 只当触发器    |
| `PostersThreeScene` 贴图到达后重算姿态     | `exhaustive-effect-dependencies`                        | `textures` 是有意加的第二触发源       |

## 9. 已知限制 / 下一步

- **没有后端**：数据全在本地，换设备不同步；「对方」不会真的回消息。
- **`TeacherApp.tsx` 3264 行**：还没拆（`FeedPage.tsx` 已拆到 712 行）。消息页已经从 4859 行拆到 1454 行
  （`pages/messages/parts.tsx` / `GroupPanel.tsx` / `AnnouncementsPanel.tsx` / `HistorySearchPanel.tsx` /
  `ConversationList.tsx` /
  `Composer.tsx`），拆法可参考。
- **`src/components/ui/` 目前只有 `Switch` 被真正使用**，其余是设计系统种子，
  要在改到相关页面时顺手替换（不要为替换而替换，视觉要逐页对）。
- **`src/lockerfolio/` 有大量未接入的半成品文件**（`pnpm deadcode` 里可见），
  动 3D 之前先确认加载链。
- **`DemoNav`（右下角浮动页签）目前在线上也显示**，正式对外前需要决定是否只在 dev 显示。
