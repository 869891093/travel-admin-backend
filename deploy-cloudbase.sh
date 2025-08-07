#!/bin/bash

# 微信云托管部署脚本
# 使用CloudBase CLI部署

echo "=== 开始部署到微信云托管 ==="

# 检查是否安装了CloudBase CLI
if ! command -v cloudbase &> /dev/null; then
    echo "错误: 未安装CloudBase CLI"
    echo "请先安装: npm install -g @cloudbase/cli"
    exit 1
fi

# 检查是否登录
if ! cloudbase auth list &> /dev/null; then
    echo "请先登录CloudBase CLI:"
    echo "cloudbase login"
    exit 1
fi

# 获取环境ID
read -p "请输入您的云开发环境ID: " ENV_ID

if [ -z "$ENV_ID" ]; then
    echo "错误: 环境ID不能为空"
    exit 1
fi

# 更新cloudbase.json中的环境ID
sed -i '' "s/your-env-id/$ENV_ID/g" cloudbase.json

echo "环境ID已设置为: $ENV_ID"

# 构建和部署
echo "开始构建和部署..."

# 使用CloudBase CLI部署
cloudbase framework deploy

if [ $? -eq 0 ]; then
    echo "=== 部署成功! ==="
    echo "您的管理后台已部署到微信云托管"
    echo "访问地址将在部署完成后显示"
else
    echo "=== 部署失败 ==="
    echo "请检查错误信息并重试"
    exit 1
fi 