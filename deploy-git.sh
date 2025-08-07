#!/bin/bash

echo "=== 跟团游后台管理系统 Git 部署脚本 ==="
echo ""

# 检查Git
if ! command -v git &> /dev/null; then
    echo "❌ 错误: 未找到Git"
    exit 1
fi

echo "✅ Git版本: $(git --version)"
echo ""

# 检查当前分支
CURRENT_BRANCH=$(git branch --show-current)
echo "📍 当前分支: $CURRENT_BRANCH"

# 检查是否有未提交的更改
if [ -n "$(git status --porcelain)" ]; then
    echo "📝 检测到未提交的更改，正在提交..."
    
    # 添加所有文件
    git add .
    
    # 提交更改
    COMMIT_MESSAGE="自动部署更新 - $(date '+%Y-%m-%d %H:%M:%S')"
    git commit -m "$COMMIT_MESSAGE"
    
    if [ $? -ne 0 ]; then
        echo "❌ 提交失败"
        exit 1
    fi
    
    echo "✅ 更改已提交: $COMMIT_MESSAGE"
else
    echo "✅ 没有未提交的更改"
fi

# 检查远程仓库
REMOTE_URL=$(git remote get-url origin 2>/dev/null)
if [ -z "$REMOTE_URL" ]; then
    echo "❌ 错误: 未配置远程仓库"
    echo "请先运行: git remote add origin https://github.com/869891093/travel-admin-backend.git"
    exit 1
fi

echo "🌐 远程仓库: $REMOTE_URL"

# 推送到远程仓库
echo "🚀 推送到远程仓库..."
git push origin $CURRENT_BRANCH

if [ $? -ne 0 ]; then
    echo "❌ 推送失败"
    echo "请检查网络连接和GitHub权限"
    exit 1
fi

echo "✅ 代码已推送到GitHub"
echo ""

# 显示部署信息
echo "🎉 Git部署完成！"
echo ""
echo "📋 部署信息:"
echo "🌐 GitHub仓库: https://github.com/869891093/travel-admin-backend"
echo "📁 分支: $CURRENT_BRANCH"
echo "🕐 部署时间: $(date '+%Y-%m-%d %H:%M:%S')"
echo ""
echo "🔗 相关链接:"
echo "- GitHub仓库: https://github.com/869891093/travel-admin-backend"
echo "- 部署状态: https://github.com/869891093/travel-admin-backend/actions"
echo ""
echo "📝 下一步:"
echo "1. 在GitHub仓库中配置GitHub Actions自动部署"
echo "2. 或者使用Vercel、Netlify等平台连接GitHub仓库"
echo "3. 配置自定义域名（可选）"
echo ""
echo "✅ Git部署流程完成！" 