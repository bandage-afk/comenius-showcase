#!/usr/bin/env bash
# 一键部署 / 秒级回滚（化石部署：releases/<时间戳> + 软链原子切换）
#
# 用法：
#   ./deploy.sh                 # 发生产（/community/）
#   ./deploy.sh staging         # 发验收环境（/staging/）
#   ./deploy.sh rollback        # 生产回滚到上一个版本
#   ./deploy.sh rollback staging
#
# 环境变量（一般不用改）：
#   DEPLOY_HOST=root@YOUR_SERVER_IP   SSH_KEY=~/.ssh/comenius_deploy   KEEP=5
#
# 前置：本机公钥已装到服务器；服务器已装 nginx。
#       本机需要 pnpm / ssh / scp / tar（不需要 rsync，服务器上没有 rsync）
set -euo pipefail

APP_DIR="$(cd "$(dirname "$0")" && pwd)"
DEPLOY_HOST="${DEPLOY_HOST:-root@YOUR_SERVER_IP}"
SSH_KEY="${SSH_KEY:-$HOME/.ssh/comenius_deploy}"
KEEP="${KEEP:-5}"

target="${1:-prod}"
action="deploy"
if [ "$target" = "rollback" ]; then
  action="rollback"
  target="${2:-prod}"
fi

case "$target" in
  prod)
    DIRNAME=community; ROOT=/opt/community-web
    URL="https://www.comenius.cn:8443/community/"
    ;;
  staging)
    DIRNAME=staging; ROOT=/opt/community-web-staging
    URL="https://www.comenius.cn:8443/staging/"
    ;;
  *)
    echo "未知目标：$target（可选 prod / staging）"; exit 1
    ;;
esac

SSH="ssh -i $SSH_KEY -o IdentitiesOnly=yes -o StrictHostKeyChecking=accept-new $DEPLOY_HOST"
SCP="scp -i $SSH_KEY -o IdentitiesOnly=yes -o StrictHostKeyChecking=accept-new"

# ── 回滚 ──────────────────────────────────────────────────────────────────────
if [ "$action" = "rollback" ]; then
  echo "▶ 回滚 $target 到上一个 release"
  $SSH bash -s <<EOF
set -euo pipefail
cd "$ROOT/releases"
prev=\$(ls -1dt */ | sed -n '2p' | tr -d '/')
[ -n "\$prev" ] || { echo "没有更早的 release，无法回滚"; exit 1; }
ln -sfnT "releases/\$prev/$DIRNAME" "$ROOT/$DIRNAME.new"
mv -T "$ROOT/$DIRNAME.new" "$ROOT/$DIRNAME"
echo "  已切到 \$prev"
EOF
  code=$(curl -sSk -o /dev/null -w "%{http_code}" --max-time 20 "$URL" || echo 000)
  echo "▶ 验证 $URL -> HTTP $code"
  [ "$code" = "200" ] || { echo "❌ 回滚后仍是 ${code}，请人工检查"; exit 1; }
  exit 0
fi

# ── 部署 ──────────────────────────────────────────────────────────────────────
# release 名字统一按北京时间：GitHub runner 是 UTC，不指定时区的话同一批部署会生成
# 「20260923-1039」这种看着像早上的目录（实际是 18:39），排查时很容易误判成旧版本。
REL="$(TZ=Asia/Shanghai date +%Y%m%d-%H%M)"
TARBALL="/tmp/comenius-$target.tar.gz"

echo "▶ 1/4 构建（base=/$DIRNAME/）"
cd "$APP_DIR"
# 直接用本地 vite，绕开 pnpm 的依赖校验（本项目里 protobufjs 的构建脚本被忽略，
# 会让 pnpm 子进程返回非 0，从而中断部署）
FIGMA_PUBLIC_URL="/$DIRNAME" ./node_modules/.bin/vite build

echo "▶ 2/4 打包上传到 $DEPLOY_HOST:$ROOT/releases/$REL/$DIRNAME/"
tar -czf "$TARBALL" dist
$SSH "mkdir -p $ROOT/releases/$REL/$DIRNAME"
$SCP "$TARBALL" "$DEPLOY_HOST:/tmp/" >/dev/null
$SSH "tar -xzf /tmp/comenius-$target.tar.gz -C $ROOT/releases/$REL/$DIRNAME --strip-components=1 && find $ROOT/releases/$REL -name '._*' -delete && du -sh $ROOT/releases/$REL"

echo "▶ 3/4 原子切换软链"
$SSH bash -s <<EOF
set -euo pipefail
R="$ROOT"; NAME="$DIRNAME"
cd "\$R"
if [ -d "\$NAME" ] && [ ! -L "\$NAME" ]; then
  echo "  首次迁移：\$NAME/ → releases/legacy-\$NAME"
  mkdir -p releases
  mv "\$NAME" "releases/legacy-\$NAME"
  ln -sfnT "releases/legacy-\$NAME" "\$NAME"
fi
ln -sfnT "releases/$REL/\$NAME" "\$NAME.new"
mv -T "\$NAME.new" "\$NAME"
echo "  当前指向: \$(readlink \$NAME)"
cd releases && ls -1dt */ | tail -n +\$(( $KEEP + 1 )) | xargs -r rm -rf
EOF

echo "▶ 4/4 验证"
code=$(curl -sSk -o /tmp/deploy-check.html -w "%{http_code}" --max-time 20 "$URL" || echo 000)
title=$(grep -o "<title>[^<]*</title>" /tmp/deploy-check.html 2>/dev/null || true)
echo "  $URL -> HTTP $code  $title"
if [ "$code" != "200" ]; then
  echo "❌ 返回 ${code}，可执行 ./deploy.sh rollback ${target} 回滚"
  exit 1
fi
echo "✅ ${target} 部署完成（回滚：./deploy.sh rollback ${target}）"
