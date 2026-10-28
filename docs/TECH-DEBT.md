# 技术债台账

## ⏭️ 下一步已排期（施工方案写在这里，下一轮直接执行）

**⑫ 设计 token 的长尾 + 灰阶归并**（收敛后仍剩 544 处；其中 MessagesPage 66 处是有意留的）

1. 现在剩下的多是**孤立色值**（各出现 1~5 次）与 SVG 属性（`fill="#…"`）——后者要逐个改成
   `style={{ fill: 'var(--x)' }}` 并截图核对，适合按页做
2. **灰阶归并**（16 级 → 6 级左右）属于设计决策：要逐页看观感，别顺手做；做完记得重采视觉基线
3. `pnpm tokens` 会自动收紧基线；每批都跑 `visual --geometry`（颜色替换属于"看着没变"，几何必须零差异）
4. knip 存量已分类（见 §5），要清哪一类先确认加载链

✅ 本轮（⑪）已完成：**内联颜色 810 → 544 处**

- 新增一套**灰阶 token**（`--grey-15 … --grey-900`，共 17 级）+ `--brand-tint` / `--linkedin-dark`，
  值是 Figma 里散落的原始值**一个没改**，所以视觉零差异；`@theme inline` 里也补了映射
- 用 codemod 替换 **288 处**（25 个文件），跳过 SVG 属性与 Tailwind 任意值类名（两种写法要单独处理）
- 记账收紧 25 个文件；`MessagesPage.tsx`（66 处）**有意不转**：token 名字比 `#333` 长，
  prettier 会给它多折 13 行、顶穿 1454 行的历史上限——等它下次拆分时随拆分一起收敛
- 顺带把「群二维码」浮层拆成 `messages/GroupQrCard.tsx`（46 行），GroupPanel 943 → **924 行**
  （拆它本来是 ⑥ 收尾，这里用来抵消 token 改名带来的行数增长）

原则：**能被 CI 接管的，不写在这里**；写在这里的每条都要有「现象 / 影响 / 为什么不马上动 / 什么时候必须动」。
目的是让它有数、有人认、有触发条件——而不是变成"大家都知道但没人修"的传说。

最后更新：2026-09-23（数字变了请顺手更新）

---

## 0. 已经被门禁接管（不用人盯）

| 检查                                       | 命令                                      | 状态                              |
| ------------------------------------------ | ----------------------------------------- | --------------------------------- |
| 类型                                       | `pnpm typecheck`                          | 0 错                              |
| 单测（store / repository）                 | `pnpm test`（vitest，约 0.2 秒）          | **77 条通过**，见 §7              |
| lint / 格式                                | `pnpm lint` · `pnpm format:check`         | **0 错 0 警**                     |
| 死代码 / 未用依赖                          | `pnpm deadcode`（knip，非阻断）           | 有存量，见 §5                     |
| 僵尸路由（有路由没入口）                   | `pnpm routes`                             | 通过                              |
| 文件规模                                   | `pnpm filesize`                           | 存量冻结上限，见 §1               |
| 首屏包体                                   | `pnpm budget`                             | 首屏 ≈126 KB(gzip)，入口块 ≈71 KB |
| 契约边界（页面不许直连 mock / repository） | `pnpm lint`（`no-restricted-imports`）    | 通过，见 §5                       |
| 设计 token（内联颜色只许变小）             | `pnpm tokens`                             | 存量 810 处已冻结，见 §6          |
| 直推 main（无分支保护，走免费方案 C）      | `.husky/pre-push` + CI `流程自查` job     | 本地拦下；直推则 CI 标红，见 §5   |
| 界面回归（结构 + 关键样式）                | `pnpm visual`                             | 9 页 / 约 6.4k 节点基线已入库     |
| 交互回归                                   | `pnpm smoke` · `pnpm layout` · `pnpm e2e` | 9 / 18 / 29 条                    |

## 1. 待拆的大文件（已冻结上限，只许变小）

当前源文件 **147** 个 / **37,149** 行（`pnpm filesize` 的口径）。历史最大文件已经拆掉：

| 文件                                | 行数              | 拆法                                                           | 优先级                     |
| ----------------------------------- | ----------------- | -------------------------------------------------------------- | -------------------------- |
| `src/pages/MessagesPage.tsx`        | 2172 → **1454**   | ✅ 输入区 + 三个拾取器已抽到 `messages/Composer.tsx`（842 行） | 完成                       |
| `src/pages/messages/GroupPanel.tsx` | 1865 → **1403**   | 群公告 + 聊天记录搜索已拆出；仅剩成员与权限                    | **高**（下一轮，见顶部 ⑥） |
| ~~`src/profile/CareerProfile.tsx`~~ | ✅ 1763 → **716** | 已拆：9 个编辑弹窗 → `profile/careerModals.tsx`（视觉零差异）  | 完成                       |
| `src/pages/BlogPage.tsx`            | 1447              | 按板块拆（正文 / 侧栏 / 卡片）                                 | 低                         |

✅ 已完成：`FeedPage.tsx` 4318 → **712 行**（拆成 cards / PostLightbox / lightboxData / constants / media + `src/data/posts.ts`），
并用视觉基线证明**零视觉差异**。

✅ 已完成：`communityStore.ts` 485 → **69 行**（action 按域拆成 `stores/community/messagesSlice.ts` /
`groupsSlice.ts`，共用的小动作进 `helpers.ts`，组装处只剩三个 slice 的拼接）。
「原样搬移」是机械校验过的：逐 key 去掉注释与空白后比对，67 个字段/action 里 61 个逐字相同，
其余 6 个只差 helper 的调用签名（`syncAnnounce(convId, …)` → `syncAnnouncements(set, convId, …)`）和一处换行；
视觉基线 9 页零差异。

✅ 已完成：`MessagesPage.tsx` 2172 → **1454 行**（输入区 + @提及/表情/笔记拾取器 + 语音录制条
整块搬到 `pages/messages/Composer.tsx`，草稿与引用目标留在页面）。几何基线零差异；
E2E 补了 4 条断言盯输入区（21 → 25 条）。

> 拆之前先跑 `node scripts/visual.mjs --update` 存基线，拆完用 `node scripts/visual.mjs --geometry` 验证"搬完没变样"。

## 2. 有意的 lint 例外（不是"忘了"）

lint 现在是 0 告警，但这几条规则被**有理由地**关掉了（配置见 `.oxlintrc.json` 的 `overrides`）：

| 范围                                                             | 规则                                                                | 理由                                                                                                                                                              |
| ---------------------------------------------------------------- | ------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `MessagesPage` / `FeedPage` / `AmosAIPage` / `PostersThreeScene` | `react/exhaustive-effect-dependencies`、`react/set-state-in-effect` | 这些 effect 是**拿 deps 当触发器**：切会话重置草稿、新消息贴底滚动、贴图到达重算姿态。改成规则要的样子会改行为。**MessagesPage 拆分（§1）时应该顺手改成事件驱动** |
| `src/**`                                                         | `unicorn/no-array-sort` / `no-array-reverse`                        | 项目 lib 是 ES2020，**不能用 `toSorted`/`toReversed`**（Safari <16.4 不支持），统一 `[...arr].sort()`                                                             |
| `src/forest/**`、`src/lockerfolio/scene/**`、`…/work/**`         | `react/purity`、`react/immutability`                                | three.js 必须在 render / `useFrame` 里就地改对象；随机布局用 `useMemo(…, [])` 才稳定                                                                              |
| `scripts/lib/visual.mjs`                                         | `unicorn/consistent-function-scoping`                               | 注入到浏览器里执行的辅助函数无法外提，属误报                                                                                                                      |
| 全仓                                                             | `no-underscore-dangle` 的 allow 列表                                | `_plane` / `_normal` 等是 three.js 预分配临时对象的既定命名                                                                                                       |

## 3. 外部依赖风险（会直接影响真实用户）

1. **外链图片 117 处**（`images.unsplash.com` 热链，其中 55 条是硬编码 URL）
   - 影响：国内加载慢/不稳；商用有版权问题；没有尺寸规范（各页面自己写 w/h）
   - 为什么不动：换图源是产品决策（自建图床？买图？用户上传？）
   - 触发条件：确定图片方案后，一次性收敛到一个 `imgUrl()` 工具
2. ~~**Google Fonts 阻塞**~~ ✅ **2026-09-23 已解决（字体全部自托管）**
   - 之前：`index.html` 一条 `link rel=stylesheet` + CSS 里 2 处 `@import url(fonts.googleapis.com/…)`；
     国内不可达时整份 CSS 解析被卡住、首屏白等超时，当天还因此让 `visual --geometry` 报了 8 页假红
   - 现在：**拉丁**用 `@fontsource/*` 包（Vite 一起打包、按内容哈希命名）；
     **中文**用 Google 的切片自托管到 `src/assets/fonts/cjk/`（可变字体，一片覆盖 300–900 全字重，
     按 `unicode-range` 分片、浏览器只取用到的），再由 `scripts/fonts/fetch-cjk-fonts.mjs` 里的
     `pyftsubset` 按「本片范围 ∩ 我们的字符集」裁掉无关字形
   - 体积：**186 片 / 3.0 MB**（不裁是 41.9 MB；逐字重下载是 6 倍冗余——Google 对 CJK 本来就是同一份变量文件）
   - 覆盖：站点源码里的所有字符 ∪ GB2312 一级常用字（3755）。**超出这个集合的生僻字会回落到系统字体**
     （用户昵称里的罕见字可能混排）；要彻底消除得改全量自托管（体积 ×5）
   - 验收：`visual --geometry` 9 页**零差异**（同一批字体文件），运行时 `performance` 里
     **没有任何 fonts.googleapis/gstatic 请求**
   - 维护：改字重/字体 → 改 `src/index.css` 的 import，或重跑那个脚本；生成物已进 `.prettierignore`
   - 附带：`visual --geometry` 现在会先 `document.fonts.load()` 探一次字体，加载不到就直接说明原因
     并退出（强跑加 `--allow-missing-fonts`）——字形回落造成的假红不会再伪装成"8 页回归"
3. **23.9 MB onnx wasm**（gzip 5.7 MB）：只为 3D 储物柜里的"抠图"功能（`@imgly/background-removal`）
   - 影响：用户点进储物柜可能拉这一坨；已懒加载所以不影响首屏
   - 修法：改成点击抠图时再 `import()`，或挪到服务端
4. **开发工具链的已知漏洞（12 条：4 moderate / 8 high）**：来自 `vite` / `postcss` / `nanoid` 这类构建依赖，**生产依赖为 0**（`pnpm audit --prod` 干净）。
   - 影响：只影响构建机，不进用户浏览器；但会让"以后没人敢升大版本"
   - 现在怎么做：CI 里**生产依赖阻断**（有高危就红）、**全量只报告**；Dependabot 每周自动开 PR（补丁/次版本合成一个）
   - ⚠️ 国内镜像没有 audit 端点（`ERR_PNPM_AUDIT_ENDPOINT_NOT_EXISTS`），所以 audit 命令显式带 `--registry=https://registry.npmjs.org`
   - 什么时候必须动：升 `vite` / `@tailwindcss/vite` 大版本时一起清掉

5. **rapier 2.2 MB**（gzip 842 KB）：储物柜的物理引擎，已懒加载，暂不动

## 4. 需要产品决策的（我不能替你决定）

| 事项                       | 现状                                                                                                                       | 决策点                                                                     |
| -------------------------- | -------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| **移动端**                 | 主站 `@media` 数量 = **0**，验收只跑 1560×980                                                                              | 这是当前最大的用户侧缺口。做成"只在窄屏生效"可以不碰桌面观感               |
| **错误上报**               | ✅ 已落地 `ErrorBoundary` + `window.onerror` / `unhandledrejection`（`src/app/errorReporting.ts`），白屏变成可重试的兜底页 | 只剩"往哪发"待定：配 `VITE_ERROR_ENDPOINT` 即可开启（Sentry 还是自建接口） |
| **DemoNav 线上可见**       | 右下角浮动页签，是"登录注册 / 写想法"**唯一**入口                                                                          | 撤掉必须同时给这两个页面换入口，否则 `pnpm routes` 会拦                    |
| **`components/ui` 采用率** | 只有 `Switch` 被 2 处使用                                                                                                  | 其余是设计系统种子：改到相关页面时顺手替换，不要为替换而替换               |
| **搜索**                   | 搜的是写死的 `SEARCH_POOL`，不是真内容                                                                                     | 真搜索要么前端索引要么后端                                                 |

## 5. 结构性（接后端之前必须做）

- ~~**repository 层**（ADR-0006 提案）~~ ✅ 已完成：页面/store 对 mock 的直连已收敛到 `src/repositories/`
  （帖子 / 用户 / 会话 / 消息 / 通知 / 内容 + `localStore` + `errors`），页面只剩类型 import，
  **边界由 `pnpm lint` 的 `no-restricted-imports` 接管**（直连会红）。
  还剩这些是「接后端时」才做的：真实 HTTP + 分页查询 action + WebSocket 推送 + 把 `errors.ts`
  的失败出口接上错误上报（§4 那条）。
- **feature flag**：现在没有，导致"不完整的功能不能合进 main"
- **契约层 expand–contract**：改字段名要分两步（先加新、双写、再删旧），避免 4 人互改引用
- **knip 存量**（2026-09-24 分类过）：`src/lockerfolio/` 71 处未接入的半成品（动 3D 前先确认加载链）、`src/components/ui/` 6 个设计系统种子（见 §4）、`src/feed/ranking/` 3 个排序骨架（flag 默认关）。三类都已在台账登记，删除各自是产品决策
- **UI 脚本在远程环境偶发失败（固定等待）**：`smoke` / `e2e` 里有若干 `waitForTimeout` 固定等待，
  本机跑 21/21，打 staging / 生产时偶发 17/21、19/21、8/9 —— **复跑都恢复**（2026-09-23 各遇到一次）。
  影响：远程门禁的红要人再跑一遍才敢判断真假，容易麻痹（真回归也会被当成 flake）。
  为什么不马上动：改等待策略要逐个链路换成「等选择器 / 等文案」，属于脚本重构。
  什么时候必须动：**下一次真回归被误判成 flake 时**，或远程验收变成固定流程前。
  （2026-09-23 补：`visual --geometry` 也踩到过同类假红 —— Blog 265 处、我 20 处几何差异，复跑即好。
  根因是 `captureStable` 只比较「相邻两次采样是否相同」，冷缓存下图片陆续到达时会提前收手；
  已在 `scripts/lib/visual.mjs` 加「等字体就绪 + 图片加载完（4 秒上限）」再采样，重建后首跑已零差异。）
- **入口 chunk 的文件名在两次构建之间不一定相同**（2026-09-23 发现）：入口块里写着所有懒加载块的名字
  （`__vite__mapDeps`），懒加载块又 import 入口块 —— 循环引用下入口 hash 不保证跨构建复现。
  影响：想用「chunk 名一样」证明「线上产物 = 当前源码」会误判（我这次就被绕了一圈：
  线上 `index-Dw0yBnMi.js` vs 本地 `index-CFpSGe4N.js`，但逐字节比下来**只有这一处 8 字节不同**，
  懒加载块完全相同，说明代码一致）。
  什么时候必须动：等我们要做「发布产物指纹入库 / 灰度对比」时，改成比对**懒加载块**或整包 tar hash，
  别看入口块名字。
- **`deploy-staging.yml` 从 2026-09-22 建起来那天就是红的**（25 次运行全失败）：**根因是 job 级 `if`
  里用了 `secrets`**（`if: secrets.DEPLOY_SSH_KEY != ''`）——GitHub 在那个位置只允许
  `github / needs / vars / inputs`，于是整个文件被判成 **"Invalid workflow file"、一次都没真正执行过**
  （日志里只有一行 `Unrecognized named-value: 'secrets'`）。
  阴险之处：YAML 本地能解析、prettier、CI 全都不报，静默失效了一整天，我一度还怀疑是密钥内容不对。
  影响过：这一天里「合进 main 自动发 staging」实际不存在，staging 全是本机手动 `./deploy.sh staging` 发的。
  **已修**：判断挪到第一个 step（`steps.guard.outputs.ready`）、后续 step 各自加 `if`；
  并把「job/step 级 if 的上下文」加进本地门禁 `pnpm workflows`（用探针验证过能抓到当年那行）。
  **2026-09-23 18:36 实测通过**：合并后 CI 自己发出了新 release 并切好软链，产物与本地同 base 构建逐块一致
  （那个 release 目录叫 `20260923-1039` 是因为 runner 在 UTC——已把 `deploy.sh` 的 release 命名固定为北京时间）。

## 6. 每轮改完顺手更新的数字

- 源文件 **168** 个 / **38,572** 行
- 首屏 JS ≈ **126.4 KB**(gzip)；入口块 ≈ **71.2 KB**
- 设计 token：内联颜色 **544** 处（hex 524 / rgb·hsl 20 上下），42 个文件——基线在 `scripts/token-baseline.json`
- 单测：**77** 条（8 个文件，约 0.2 秒）
- 验收：冒烟 9 · 布局 18 · E2E 29 · 视觉 9 页
- 部署：生产 `https://www.comenius.cn:8443/community/`，回滚 `./deploy.sh rollback`
