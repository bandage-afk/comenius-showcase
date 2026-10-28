# ADR-0006：store 作为数据访问边界，页面不直接 fetch

**状态**：**已实施（前端侧完成，后端未接）** —— 2026-09-23 落地，见文末「实施记录」

## 背景

现在没有后端：页面组件通过 `useCommunity` / `useNotes` / `useProfile` 读，
通过 store 的 action 写，store 负责持久化到 `localStorage`。

接后端时最危险的做法是「在页面里就地加 `fetch`」：几十个页面各自处理 loading / 错误 / 重试 / 竞态，
以后换接口要全仓搜。参考 ADR-0003 里消息页的复杂度，这类散落会很快失控。

## 决定

把 store 当作 **repository 接口**，页面只认 store：

```
页面组件 → store action（同步语义） → 内部实现（现在 = localStorage，将来 = HTTP/WebSocket）
```

- 页面**不允许**直接 `fetch` 业务数据
- 后端接入时只改 store 内部实现，页面组件零改动
- store 内部按资源拆 `repository` 模块（conversations / messages / posts / notifications），
  每个模块导出与现在 action 同名的函数
- 乐观更新、失败回滚、重试策略统一在 repository 层做一次

## 页面侧的三条硬规矩

1. 业务数据一律从 store 的 **state** 读（`useCommunity` / `useNotes` / `useProfile` /
   `useNotifications` / `useContent`），订阅式读取 —— 以后数据是异步来的，页面不用改。
2. 写一律走 store 的 **action**（`sendMessage` / `publish` / `save` …）。
3. 页面**不许** import `src/repositories/**`，也不许 import mock 数据模块
   （`community/data` / `data/posts` / `blogData` / `podcastData` / `notificationData`）。
   这条由 `.oxlintrc.json` 的 `no-restricted-imports` 在 CI 拦（**类型** import 不受限）。

错误语义见 `src/repositories/errors.ts` 顶部的策略表：`silent`（写本地失败保持乐观结果）/
`retry`（读远程失败重试后回落）/ `rollback`（写远程失败撤销乐观更新）。
repository 不向页面抛错，页面不写 try/catch。

## 后果

- ✅ 页面与传输层解耦，接后端是「替换 store 内部实现」而不是「全站改代码」
- ⚠️ 需要先定义好**错误语义**（哪些失败要 toast、哪些静默重试）再动手，
  否则会把 localStorage 时代的「永不失败」假设带进网络世界
- ⚠️ 实时消息（对方真的发过来）需要额外一条 WebSocket/SSE 通道并回写 store，
  这部分在提案里没有覆盖，实施前要单独设计

## 实施记录（2026-09-23）

**做完了什么**

- `src/repositories/`：按资源拆的取数层 —— `postsRepo` / `usersRepo` / `conversationsRepo` /
  `messagesRepo` / `notificationsRepo` / `contentRepo`，加上 `localStore`（全仓唯一碰
  `localStorage` 的地方）与 `errors`（错误语义）
- store 侧：`communityStore` 多了 `catalogSlice`（帖子 + 用户目录），`messagesSlice` 的
  发送/回执与 `groupsSlice` 的成员查询都改走 repository；`notificationStore` 的通知条目、
  新 `contentStore` 的 Blog/Podcast 内容同样来自 repository
- 页面侧：FeedPage / NoteDetailPage / UserProfilePage / ProfilePage / MessagesPage /
  GroupPanel / parts / PostLightbox / NotificationPage / BlogPage / PublishPage
  全部改成「从 store 读、往 store 写」，页面里只剩**类型** import
- 边界进 CI：`pnpm lint` 会拦「页面直连 mock / repository」「store 直连 mock」

**怎么换后端**（每一条都只动 store 内部）

| 资源                      | 现在                                | 换成                                       | 页面要改吗 |
| ------------------------- | ----------------------------------- | ------------------------------------------ | ---------- |
| 帖子 / 用户 / 会话 / 消息 | `repositories/*.ts` 读本地 mock     | 同一个文件里改成 `fetch`，写回 store state | 不用       |
| 通知条目                  | `notificationsRepo`                 | `GET /notifications` + 写回 store          | 不用       |
| Blog / Podcast            | `contentRepo`                       | `GET /blog`、`GET /podcast`                | 不用       |
| 本地持久化                | `localStore`                        | IndexedDB 或「本地 + 服务端同步」          | 不用       |
| 发送回执                  | `messagesRepo.send` 里 500ms 定时器 | `POST /messages` + 重试 + 失败回滚         | 不用       |
| 对方的消息                | 页面 setTimeout + `pickReply`       | WebSocket/SSE 推送 → `receiveMessage`      | 不用       |

**已知取舍**

- 列表过滤（搜索、按作者筛）仍在页面里对 `posts` 做本地过滤：数据量小、行为不变。
  接后端分页时再加「查询 action + repo 查询函数」，那时才需要动页面。
- `getUser` / `getMember` 是**同步**查表。接后端后要保证「store 里已有该用户」——
  做法是 repo 预热缓存（`groupMembers` 之类进 state，更新即重渲染），不要改成页面里 await。
