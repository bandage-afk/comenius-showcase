# ADR-0005：路由级懒加载 + 包体预算门禁

**状态**：已采纳（2026-09）

## 背景

重构前所有页面都在 `App.tsx` 里静态 import，入口包 **1698 KB（gzip 452 KB）**。
用户打开首页要先把 3D 储物柜、教师模块、TED 版式、消息页全部下载下来——
其中绝大多数是这个用户当场不会打开的页面。

## 决定

1. **只有首页 `FeedPage` 同步加载**（首屏 LCP 路径），其余 19 个页面全部 `React.lazy` + 统一 `Suspense` 占位
2. 新增 `scripts/bundle-budget.mjs` 作为门禁：
   - 首屏 JS（`index.html` 直接引用的块）gzip 合计 **≤ 200 KB**
   - 单个 JS 块 gzip **≤ 900 KB**
   - 接进 `pnpm check` 与 CI

## 后果

- ✅ 入口包 1698 KB → **257 KB（gzip 452 KB → 75 KB）**，首屏 JS 合计 ≈ 126 KB
- ✅ 切页面时有短暂占位（`PageFallback`），比首屏多等 400 KB 划算
- ⚠️ 包体预算这条门禁防的是**很容易复发的退化**：把任一大页面改回静态 import，
  入口包会立刻涨回去，而 tsc / lint / 冒烟**都不会报**。所以改 `App.tsx` 的 import 时务必跑 `pnpm check`
- ⚠️ 如果某个页面需要「预加载」（例如 hover 侧栏就预取），用 `import()` 提前触发，
  不要为了快而改回静态 import
