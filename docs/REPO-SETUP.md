# 仓库配置清单（只能由仓库管理员在 GitHub 上操作）

工程侧的自动化已经全部写进代码（workflows / 脚本 / 门禁），下面这些是**必须在 GitHub 网页上点一次**的。
没配不影响本地开发和手动部署，但会自动化的能力会打折。

---

## 1. 加部署密钥 Secret（开自动发 staging）

**为什么**：`main` 有新提交时自动发到 staging 并跑冒烟，你可以先验收再决定发不发生产。

**怎么做**：

1. 复制本机私钥全文：

   ```bash
   cat ~/.ssh/comenius_deploy
   ```

2. 仓库 → **Settings → Secrets and variables → Actions → New repository secret**
   - Name：`DEPLOY_SSH_KEY`
   - Secret：粘贴上一步的全文（**含** `-----BEGIN ... KEY-----` 和最后一行）

3. 验证：往 main 推一个提交，看 Actions 里 `自动部署 staging` 是否变绿。
   没配这个 Secret 时该工作流会**自动跳过**（不是失败），这是刻意设计。

## 2. main 的保护（当前：免费方案 C）

⚠️ **先说结论**：私有仓库 + 个人账号下，GitHub 的 **rulesets 与分支保护都不生效**
（rulesets 会直接提示 "won't be enforced on this private repository until you move to GitHub Team"）。
要么把仓库转公开、要么升到 GitHub Team，否则**没有"拦得住"的机制**。

本项目当前采用**方案 C：本地钩子 + CI 自查**（够用、零成本，但能被绕过）：

| 这一道        | 在哪                                                           | 拦得住什么                                                      | 绕过方式               |
| ------------- | -------------------------------------------------------------- | --------------------------------------------------------------- | ---------------------- |
| 本地禁推 main | `.husky/pre-push`（装过依赖自动生效）                          | `git push origin main`（含 `git push origin :main`）            | `git push --no-verify` |
| CI 流程自查   | `.github/workflows/ci.yml` 的 `流程自查（main 只接受 PR）` job | 拦不住，但直推 main 会让这次 Actions **标红**（`::error::`）    | 无视红叉               |
| 合并方式统一  | 仓库 Settings → General → Pull Requests                        | 关掉 merge commit、只留 squash、自动删分支 → 历史线性、回滚好找 | —                      |

### 免点几下（这三格不花钱，去点上）

仓库 → **Settings → General → Pull Requests**：

- ❌ 取消 `Allow merge commits`
- ✅ 只留 `Allow squash merging`
- ✅ 勾 `Automatically delete head branches`

### 以后升级到 Team 时再配（照这个填）

仓库 → **Settings → Branches → Add branch protection rule**

- Branch name pattern：`main`
- ✅ Require a pull request before merging（Required approvals 填 **1**）
- ✅ Require status checks to pass before merging，勾选：
  - `类型检查 · lint · 构建`（含包体预算与路由检查）
  - `UI 验收（冒烟 + 布局断言 + E2E）`
- ✅ Do not allow bypassing the above settings
- ❌ 不要勾 Allow force pushes

> ⚠️ 状态检查是唯一能拦住「入口包涨回 450KB」「僵尸路由」这类问题的关卡，能配就一定配上。
> 若走 rulesets（Team 计划）：Name 填 `main-protection`，Enforcement 选 Active，
> Target branches 用 Include by pattern 选 `main`，规则勾 Require a pull request（approvals 1）
>
> - Require status checks（勾 CI 里三个 job）+ Block force pushes + Restrict deletions；
>   签名提交 / deployments / code scanning / code quality / coverage / Copilot review 都别勾（现在没有对应设置）。
>   注意：状态检查下拉框**要先让这些 check 跑过一次**才会出现。

## 3. 确认 Actions 权限

**Settings → Actions → General**

- Actions permissions：Allow all actions（默认即可，工作流只用官方 action + pnpm）
- Workflow permissions：Read repository contents（监控/CI 不需要写权限）

## 4. 通知渠道（可选，但强烈建议）

监控失败现在只会给仓库所有者发邮件，容易被忽略。建议把 `monitor.yml` 最后加一步推到群里
（企业微信 / 飞书 / Slack 的 webhook 都行），并在同一处配 `WEBHOOK_URL` Secret。
改之前记得：**不要在日志里打印 webhook 地址**。

## 5. 待办：服务器侧的基础设施（需要云控制台权限）

这些不在 GitHub 上，但也只能由人来点：

- [ ] 云安全组放行 **80 / 443**，把站点从 `:8443` 挪到标准端口（现在没有 443 会影响可信度与分享链接观感）
- [ ] 域名 ICP 备案相关事项（如未完成）
- [ ] 证书：确认 `certbot renew` 正常，或把证书托管到云厂商
- [ ] 定期检查 `/opt/backups/` 是否真的有当日快照（现在是 7 天滚动）

详见 [DEPLOY.md](./DEPLOY.md)。

## 6. 建议：收紧服务器登录方式

现状（已核对过仓库内容）：

- 仓库里**只有服务器 IP**（`deploy.sh`、`docs/DEPLOY.md`、`deploy-staging.yml` 里，属于有意公开的部署信息，域名也指向它）
- 仓库里**没有** root 密码等凭据；凭据只在本地 `~/.ssh/comenius_deploy` 与 GitHub Secrets

建议做的两件事：

1. **轮换 root 密码**：密码曾通过聊天等非加密渠道传递过，一律视为已泄露
2. **禁用密码登录**，只留密钥：

   ```bash
   # /etc/ssh/sshd_config
   PasswordAuthentication no
   PermitRootLogin prohibit-password
   # 改完
   systemctl reload sshd        # ⚠️ 先确认密钥能登录、另开一个会话保底，再退出当前会话
   ```

3. 以后新增凭据只放 `~/.ssh/` 与 GitHub Secrets，不写进仓库
