# 架构决策记录（ADR）

每做一个「以后会被问为什么」的技术决定，就在这里加一条。格式：**背景 → 决定 → 后果**。
编号只增不改；改变主意就新写一条并在旧条目上标「已被 ADR-xxxx 取代」。

| 编号                                               | 标题                                                     |
| -------------------------------------------------- | -------------------------------------------------------- |
| [0001](./0001-prettier-instead-of-oxfmt.md)        | 用 Prettier 取代 oxfmt                                   |
| [0002](./0002-design-tokens-in-root.md)            | 设计 token 的原始值放 `:root` 而不是 `@theme`            |
| [0003](./0003-split-messages-and-notifications.md) | 消息与通知拆成两个页面                                   |
| [0004](./0004-appshell-content-layout.md)          | 统一页面外壳 AppShell，并用 `contentLayout` 显式声明栏位 |
| [0005](./0005-route-level-lazy-loading.md)         | 路由级懒加载 + 包体预算门禁                              |
| [0006](./0006-store-as-repository-boundary.md)     | store 作为数据访问边界，页面不直接 fetch                 |
| [0007](./0007-teacher-module-scope.md)             | 教师模块范围收敛，「我的」合并成一个页面                 |
