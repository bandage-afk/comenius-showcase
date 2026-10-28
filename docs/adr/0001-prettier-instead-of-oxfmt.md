# ADR-0001：用 Prettier 取代 oxfmt

**状态**：已采纳（2026-09）

## 背景

项目最初用 oxfmt 做格式化。对 TS 类型字面量它会删掉分号，产出**语法错误**的代码：

```ts
// 输入
type A = { a: string; b: string }
// oxfmt 产物（语法错误）
type A = { a: string b: string }
```

这个问题会让「格式化」直接毁掉代码，而且 CI 才报错、本地看不出来。

## 决定

- 格式化统一用 **Prettier**（`pnpm format` / `pnpm format:check`）
- oxfmt 的格式化配置与依赖移除，不在本项目使用
- husky + lint-staged 里对暂存文件跑 `oxlint` + `prettier --write`
- 全仓一次性格式化单独成一个提交（`style:`），并把该提交写进 `.git-blame-ignore-revs`，
  避免 `git blame` 被格式化噪音污染

## 后果

- ✅ 格式化不会再破坏语法；CI 有 `format:check` 门禁
- ⚠️ 新同学不要被网上「oxfmt 更快」带偏；本项目的结论是它有 correctness bug
