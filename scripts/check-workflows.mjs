/**
 * GitHub Actions 工作流的「上下文」门禁。
 *
 * 为什么需要：2026-09-22 建的 deploy-staging.yml 里写了
 *   jobs.deploy.if: ${{ secrets.DEPLOY_SSH_KEY != '' }}
 * YAML 本身完全合法（本地解析、prettier、CI 都不报），但 **GitHub 不允许在 job 级 if 里用 secrets**
 * （那个位置只有 github / needs / vars / inputs）。结果：整个文件被判为 "Invalid workflow file"，
 * 25 次运行全部失败、一次都没真正执行，而日志里只有一行 `Unrecognized named-value: 'secrets'`。
 * 这类错误只有 GitHub 会报，所以本地补一道。
 *
 * 规则（依据 GitHub 文档的上下文可用性）：
 *   - jobs.<id>.if   ：不许用 secrets / env（只有 github / needs / vars / inputs）
 *   - steps[*].if    ：不许用 secrets（step 级有 env，但没有 secrets）
 *   - 其余地方（steps[*].env / run 里）用 secrets 是允许的
 *
 * 用法：node scripts/check-workflows.mjs
 */
import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'

const DIR = '.github/workflows'
const problems = []
let checked = 0

for (const name of readdirSync(DIR)) {
  if (!/\.ya?ml$/.test(name)) continue
  const file = join(DIR, name)
  const text = readFileSync(file, 'utf8')
  checked++

  // 逐行扫比引一个 YAML 解析器省事，也够用：这几条 key 的缩进是固定的
  text.split('\n').forEach((line, i) => {
    const at = `${file}:${i + 1}`
    const indentedInJob = /^ {4}if:/.test(line) // job 级（jobs: → 2 空格 → job id → 4 空格）
    const inStep = /^ {6,}if:/.test(line) // step 级（更深）
    if (indentedInJob && /secrets\./.test(line)) {
      problems.push(
        `${at} job 级 if 里用了 secrets —— GitHub 只允许 github / needs / vars / inputs，会直接判 "Invalid workflow file"（整个工作流一次都不会跑）。改法：把判断挪到第一个 step 里，用 steps.x.outputs + 后续 step 的 if`,
      )
    }
    if (indentedInJob && /\benv\./.test(line)) {
      problems.push(`${at} job 级 if 里用了 env —— 同样不在允许的上下文里，改成 step 级判断`)
    }
    if (inStep && /secrets\./.test(line)) {
      problems.push(
        `${at} step 级 if 里用了 secrets —— step 级可用 env 但没有 secrets，先用 env 接出来再判断`,
      )
    }
  })
}

console.log(`检查了 ${checked} 个工作流文件（job/step 级 if 的上下文）`)
if (problems.length) {
  console.error('\n❌ 工作流上下文检查失败：')
  for (const p of problems) console.error('  - ' + p)
  process.exit(1)
}
console.log('\n✅ 工作流上下文检查通过')
