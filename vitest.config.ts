import { defineConfig } from 'vitest/config'

/**
 * store / repository 单测。
 *
 * 为什么单独一个 config（不复用 vite.config.ts）：那份配置挂着 Figma Make 的插件
 * （站点配置注入、错误浮层、react refresh 边界），跑单测既不需要也拖时间。
 *
 * 为什么 environment 用 node 而不是 jsdom：store 只碰 localStorage 和定时器，
 * 一个 20 行的内存 localStorage 就够（见 vitest.setup.ts），不必为此多装一个 jsdom。
 */
export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.test.{ts,tsx}'],
    setupFiles: ['vitest.setup.ts'],
    restoreMocks: true,
  },
})
