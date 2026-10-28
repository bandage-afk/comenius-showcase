# ADR-0004：统一页面外壳 AppShell，并用 `contentLayout` 显式声明栏位

**状态**：已采纳（2026-09）

## 背景

14 个页面各自手写「外层 div + flex + MainSidebar + 内容 div」。后果：

- 改导航/间距/背景要改十几处，容易漏
- 每个页面的 flex 配置略有差异，出现「同样两栏，有的页面对齐有的不对」
- 内容区默认 flex 列，导致消息页的会话列表与聊天区变成上下堆叠、输入框被挤出视口

## 决定

抽出 `src/components/AppShell.tsx`，页面只写内容：

```tsx
<AppShell navigate={navigate} currentPage={currentPage}>
  …
</AppShell>
```

内容区布局用 **显式 prop `contentLayout`** 声明，而不是各页自己拼 flex：

| 值       | 布局             | 用于                             |
| -------- | ---------------- | -------------------------------- |
| `block`  | 普通块级（默认） | 大部分内容页                     |
| `row`    | 横向 flex        | 消息页（列表 + 聊天区）、Amos AI |
| `column` | 纵向 flex        | 通知页、发布页                   |

## 后果

- ✅ 导航/背景/滚动行为只有一份实现
- ⚠️ **选错 `contentLayout` 时 tsc / lint / build / 冒烟测试全都不会报**，
  只有真浏览器里量位置才发现（例如输入框跑到 y=1000）。
  因此布局断言（`pnpm layout`）和 E2E（输入框必须在视口内）是这次改动的**必要配套**，
  不是可选项。
