#!/usr/bin/env bash
# 本机跑 UI 验收的一键脚本（CI 上用 pnpm verify:ui；本机需要 Chrome 与 playwright-core）。
#
# 用法：
#   ./scripts/accept-ui.sh                     # 冒烟 + 布局 + E2E
#   ./scripts/accept-ui.sh visual              # 视觉基线（默认口径）
#   ./scripts/accept-ui.sh visual --geometry   # 连尺寸/位置一起比（拆大文件时用）
#   ./scripts/accept-ui.sh run /tmp/probe.mjs  # 用同一套环境变量跑一次性的脚本
#
# 环境变量（一般不用改，脚本已给默认值）：
#   SMOKE_BASE       默认 http://localhost:4173/（先 pnpm preview --port 4173）
#   CHROME_PATH      默认 macOS 上的 Google Chrome
#   PLAYWRIGHT_CORE  默认 ChatGPT 应用里那份 playwright-core
set -euo pipefail

cd "$(dirname "$0")/.."

export SMOKE_BASE="${SMOKE_BASE:-http://localhost:4173/}"
export CHROME_PATH="${CHROME_PATH:-/Applications/Google Chrome.app/Contents/MacOS/Google Chrome}"
export PLAYWRIGHT_CORE="${PLAYWRIGHT_CORE:-/Applications/ChatGPT.app/Contents/Resources/cua_node/lib/node_modules/playwright-core}"

if [ ! -e "$CHROME_PATH" ]; then
  echo "找不到浏览器：$CHROME_PATH（用 CHROME_PATH=... 指定）" >&2
  exit 1
fi

echo "→ SMOKE_BASE=$SMOKE_BASE"

case "${1:-all}" in
  all)
    node scripts/smoke.mjs
    node scripts/layout.mjs
    node scripts/e2e.mjs
    ;;
  smoke | layout | e2e)
    node "scripts/$1.mjs" "${@:2}"
    ;;
  visual)
    node scripts/visual.mjs "${@:2}"
    ;;
  run)
    shift
    node "$@"
    ;;
  *)
    echo "未知目标：$1（可选：all / smoke / layout / e2e / visual / run）" >&2
    exit 1
    ;;
esac
