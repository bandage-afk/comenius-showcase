#!/bin/bash
cd "$(dirname "$0")" || exit 1

echo "========================================"
echo "  夸美纽斯网站 启动器"
echo "========================================"

# 首次运行自动安装依赖
if [ ! -d "node_modules" ]; then
  echo ""
  echo "📦 首次运行，正在安装依赖（需联网，约 1-2 分钟）..."
  CI=true corepack pnpm install
  if [ $? -ne 0 ]; then
    echo ""
    echo "❌ 依赖安装失败，请检查网络后重试"
    read -n 1 -s -r -p "按任意键退出..."
    exit 1
  fi
fi

echo ""
echo "🌐 启动开发服务器：http://localhost:8443/"
echo "   浏览器将自动打开；若未打开，请手动访问上述地址"
echo "   （关闭此窗口即可停止服务器）"
echo ""

(sleep 3 && open "http://localhost:8443/" >/dev/null 2>&1) &
corepack pnpm dev
