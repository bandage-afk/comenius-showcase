# 部署与运维 Runbook

一句话：**`./deploy.sh` 发生产，`./deploy.sh staging` 发验收，`./deploy.sh rollback` 秒级回滚。**
所有部署都是「化石部署」——每次发一个新目录 `releases/<时间戳>`，然后原子切换软链，所以回滚只是把软链指回去。

---

## 1. 环境与地址

| 环境 | 地址                                      | 服务器目录                                                  |
| ---- | ----------------------------------------- | ----------------------------------------------------------- |
| 生产 | `https://www.comenius.cn:8443/community/` | `/opt/community-web/community` → `releases/<时间戳>/`       |
| 验收 | `https://www.comenius.cn:8443/staging/`   | `/opt/community-web-staging/staging` → `releases/<时间戳>/` |
| 备用 | `https://www.comenius.cn:9443/`           | 同机 nginx，需要云安全组放行 9443                           |
| 旧站 | `https://www.comenius.cn:8443/`           | Oxbridge Proctoring（**与本站无关，不要动**）               |

- 服务器：`root@YOUR_SERVER_IP`（CentOS 7 + nginx）
- 登录方式：**只应使用密钥**（`~/.ssh/comenius_deploy`）。root 密码曾通过非加密渠道传递，请轮换并禁用密码登录，见 [REPO-SETUP.md](./REPO-SETUP.md) 第 6 节
- nginx 站点配置：`/etc/nginx/conf.d/proctoring.conf`
  —— 里面**同时有旧站和本站的 location**；改本站只能新增/修改本站的 `location`，不要碰旧站规则。
  改前先 `cp proctoring.conf proctoring.conf.bak_$(date +%Y%m%d)`
- ⚠️ 云安全组只放行了 **8443**，80 / 443 / 9443 外网都不可达（这是当前最需要处理的基础设施问题）

## 2. 前置条件（新机器 / 新同学）

```bash
# 本机：把部署公钥装到服务器（只需一次）
ssh-copy-id -i ~/.ssh/comenius_deploy.pub root@YOUR_SERVER_IP
ssh -i ~/.ssh/comenius_deploy root@YOUR_SERVER_IP 'echo ok'      # 验证免密
```

`deploy.sh` 需要本机有 `pnpm` / `ssh` / `scp` / `tar`。
**服务器上没有 `rsync`**，所以脚本用 tar+scp，不要改用 rsync。

## 3. 日常操作

```bash
./deploy.sh staging     # 发验收（推荐先发这里，自己点一遍）
./deploy.sh             # 发生产
```

脚本四步：构建（`FIGMA_PUBLIC_URL` 决定子路径）→ 打包上传 → 原子切换软链（保留最近 5 个 release）→ curl 验证 HTTP 200 并打印标题。
任一步失败即中断，**不会把坏产物切到线上**。

> release 目录名统一是**北京时间**（`20260923-1839` = 晚上 18:39）。以前没指定时区，CI runner 用 UTC，
> 同一批部署会生成 `20260923-1039` 这种"看着像早上"的目录，排查时容易误判成旧版本——`deploy.sh` 已固定
> `TZ=Asia/Shanghai`。

## 4. 回滚

```bash
./deploy.sh rollback            # 生产退回上一个 release
./deploy.sh rollback staging
```

回滚只改软链，秒级生效，并会自动 curl 验证。
如果上一个 release 也是坏的（连续两次坏发版），手动指定更早的版本：

```bash
ssh -i ~/.ssh/comenius_deploy root@YOUR_SERVER_IP
ls -1dt /opt/community-web/releases/*/        # 看有哪些版本
ln -sfnT releases/20260920-2330/community /opt/community-web/community.new
mv -T /opt/community-web/community.new /opt/community-web/community
```

## 5. 自动流程

| 工作流                                 | 触发           | 做什么                                                         |
| -------------------------------------- | -------------- | -------------------------------------------------------------- |
| `.github/workflows/ci.yml`             | PR / push main | check（含包体预算）+ UI 三套验收                               |
| `.github/workflows/deploy-staging.yml` | push main      | 自动构建并发 staging，然后对 staging 跑冒烟                    |
| `.github/workflows/monitor.yml`        | 每小时         | 探活生产/staging、校验首页标题、检查证书剩余天数（<14 天报警） |

> ⚠️ 别把它改成"每 15 分钟"：私有仓库免费版每月只有 2000 分钟 Actions 额度，每次运行至少计 1 分钟，
> 15 分钟一次一个月要约 2880 分钟——会把 PR 的 CI 挤掉。要更快的发现速度，用外部免费监控，
> 别用 Actions 定时任务（详见 workflow 里的注释）。

`deploy-staging.yml` 需要仓库 Secret **`DEPLOY_SSH_KEY`**（`~/.ssh/comenius_deploy` 私钥全文）；
没配时工作流自动跳过（不是失败）。生产永远是**手动**发布，这是有意的。

## 6. 备份

服务器上 `/opt/backups/backup.sh` 已挂在 `/etc/cron.daily/`，每天备份：

- `/etc/nginx/conf.d/`（含旧站与本站的 nginx 配置）
- 线上 `/opt/community-web/community` 与 staging 前端
- 保留 7 天，单次快照约 33 MB

手动跑一次 / 查看：

```bash
ssh -i ~/.ssh/comenius_deploy root@YOUR_SERVER_IP '/opt/backups/backup.sh && ls -lh /opt/backups/'
```

## 7. 故障处理

| 现象                         | 先查什么                                                                                                                                       |
| ---------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| 线上 502 Bad Gateway         | `nginx -t`；`systemctl status nginx`；确认 `/opt/community-web/community/index.html` 存在（软链是否指到空目录）                                |
| 线上 404（子路径资源全 404） | 构建时的 `FIGMA_PUBLIC_URL` 是否等于子路径（`/community` 或 `/staging`）；nginx `location` 的 `alias` 是否带尾斜杠                             |
| 页面白屏、控制台报 JS 错误   | `curl -sI` 看 index.html 引用的 `assets/*.js` 是否 200；对比 `releases/` 里上一个版本，坏就 rollback                                           |
| 证书告警                     | `certbot renew`；检查 `/etc/letsencrypt/live/` 下的有效期；确认 monitor 工作流恢复绿色                                                         |
| 用户报「数据没了」           | 前端数据在浏览器 `localStorage`（`comenius_community` / `comenius_user_notes`）；换浏览器/清缓存就会空，这是当前架构的已知限制，不是服务器问题 |
| 想确认线上跑的是哪个版本     | `ssh … "readlink /opt/community-web/community"`，再和 `git log` 的时间对一下                                                                   |

## 8. 上线检查清单

发生产前：

- [ ] `pnpm check` 本地绿（含包体预算）
- [ ] `pnpm verify:ui` 本地绿（冒烟 9 / 布局 18 / E2E 29）
- [ ] 已发过 staging 并自己点过一遍改动的页面
- [ ] UI 改动在 PR 里贴了前后截图

发生产后：

- [ ] `./deploy.sh` 输出 `HTTP 200` 且标题正确
- [ ] 打开线上首页 + 本次改动页面各点一次
- [ ] 有问题立刻 `./deploy.sh rollback`

## 9. 还没做的（基础设施 TODO）

- 云安全组放行 80 / 443，把站点从 `:8443` 挪到标准端口（并在 80 上做 301 跳 443）
- 443 上配好证书后用 `certbot --nginx` 自动续期，替代现在的手工证书
- 把 `/etc/nginx/conf.d/proctoring.conf` 拆成「旧站」与「本站」两个文件，降低互相误改的风险
- 服务器上加一层容器化或至少固定 Node 版本，避免「本机能构建、服务器不能」类问题（当前是纯静态产物，风险较低）
