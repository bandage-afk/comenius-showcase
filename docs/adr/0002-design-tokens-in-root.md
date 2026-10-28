# ADR-0002：设计 token 的原始值放 `:root`，`@theme` 只做映射

**状态**：已采纳（2026-09）

## 背景

项目用 Tailwind v4。直觉写法是把颜色定义在 `@theme { --color-brand: #ff2442 }` 里，
但 Tailwind v4 **会 tree-shake 掉「没有被任何工具类引用」的 `@theme` 变量**——
产物 CSS 里直接没有这条变量。

而本项目大量使用内联样式（`style={{ color: 'var(--brand)' }}`）。一旦变量被摇掉，
内联的 `var()` 解析失败，颜色变透明/继承，页面看起来「莫名其妙白了一块」，
而且**只在生产构建里出现**，开发模式下一切正常。

## 决定

1. 颜色的**唯一来源**是 `src/index.css` 的 `:root`（`:root` 一定输出，不会被摇）
2. `@theme inline` 里只写 `--color-brand: var(--brand)` 这类映射，供 Tailwind 工具类（`text-brand`）使用
3. 页面里**不写十六进制**：新颜色先加 token，再加一行 `@theme` 映射

## 后果

- ✅ 内联样式与 Tailwind 工具类共享同一套取值，改一处全站生效
- ⚠️ 写 token 时必须同时改两个地方（`:root` 加值 + `@theme` 加映射），漏了第二处只是 Tailwind 类不可用，不会报错
