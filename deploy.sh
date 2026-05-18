#!/bin/bash
# 博客部署脚本
# 使用: bash deploy.sh

set -e

PROJECT_DIR="/var/www/blog"
cd "$PROJECT_DIR"

echo "拉取最新代码..."
git pull

echo "安装后端依赖..."
cd server
pnpm install --prod

echo "安装前端依赖..."
cd ../client
pnpm install

echo "构建前端..."
pnpm build

echo "重启服务..."
cd ../server
pm2 restart blog-server 2>/dev/null || pm2 start ecosystem.config.js
pm2 save

echo "部署完成！"
