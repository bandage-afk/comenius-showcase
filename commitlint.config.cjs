/**
 * 提交信息规范（Conventional Commits）：
 *   feat(消息): 群公告支持多条
 *   fix(发布): 修掉播客 tab 空白
 *   chore / docs / refactor / test / style / perf / build / ci
 */
module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    // 允许中文 scope/描述
    'subject-case': [0],
    'header-max-length': [2, 'always', 100],
    'type-enum': [
      2,
      'always',
      [
        'feat',
        'fix',
        'docs',
        'style',
        'refactor',
        'perf',
        'test',
        'build',
        'ci',
        'chore',
        'revert',
      ],
    ],
    'body-max-line-length': [0],
  },
}
