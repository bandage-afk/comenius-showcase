## 做了什么

<!-- 一句话说清这个 PR 解决了什么 -->

## 改了哪些模块

- [ ] 社区（Feed / 详情 / 我的 / 搜索）
- [ ] 消息 / 通知 / 群聊
- [ ] 课程（Podcast / Blog / School / Frank 的 CIE）
- [ ] 教师（领英版）
- [ ] 3D 储物柜
- [ ] 共享契约层（App.tsx / MainSidebar / store / index.css / vite.config）
- [ ] 工具链 / CI / 部署

## 截图（UI 改动必填）

改前：

改后：

## 自检

- [ ] `pnpm check` 通过（typecheck + **单测** + lint + format + 路由可达性 + 文件规模 + **设计 token** + build + 包体预算）
- [ ] `pnpm verify:ui` 通过（冒烟 9 / 布局 18 / E2E 29）
- [ ] 拆文件 / 动共享组件：`node scripts/visual.mjs --geometry` **零差异**（截图在 `scripts/visual/shots/`，看清楚了再决定要不要 `--update`）
- [ ] 改动涉及的页面**加了断言**（UI 改动必填：位置/交互类问题静态检查抓不到）
- [ ] 起本地服务，手工点过改动涉及的页面
- [ ] 若动了共享契约层，已在群里同步并通知相关模块 owner
- [ ] 若动了 store 的持久化结构，已加/更新 migrate（老用户数据不丢）
- [ ] 若有「以后会被问为什么」的技术决定，已在 `docs/adr/` 补一条并登记到 `docs/adr/README.md`
- [ ] 若新增页面，已挂入口（`pnpm routes` 会拦僵尸路由）

## 风险与回滚

<!-- 这个改动最可能出问题的地方是什么？怎么回滚？ -->
