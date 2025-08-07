#!/bin/bash

echo "=== 跟团游后台管理系统部署脚本 ==="
echo ""

# 检查Node.js
if ! command -v node &> /dev/null; then
    echo "❌ 错误: 未找到Node.js"
    exit 1
fi

# 检查npm
if ! command -v npm &> /dev/null; then
    echo "❌ 错误: 未找到npm"
    exit 1
fi

echo "✅ Node.js版本: $(node --version)"
echo "✅ npm版本: $(npm --version)"
echo ""

# 安装依赖
echo "📦 安装依赖..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ 依赖安装失败"
    exit 1
fi

echo "✅ 依赖安装完成"
echo ""

# 创建部署包
echo "📦 创建部署包..."
tar -czf admin-deploy.tar.gz --exclude=node_modules --exclude=.git --exclude=*.log --exclude=admin-deploy.tar.gz .

if [ $? -ne 0 ]; then
    echo "❌ 部署包创建失败"
    exit 1
fi

echo "✅ 部署包创建完成: admin-deploy.tar.gz"
echo ""

# 显示部署信息
echo "🚀 部署信息:"
echo "📁 部署包: admin-deploy.tar.gz"
echo "📊 包大小: $(du -h admin-deploy.tar.gz | cut -f1)"
echo ""
echo "📋 部署步骤:"
echo "1. 访问: https://cloud.weixin.qq.com/"
echo "2. 选择环境: new-travel-2gy6d6oy7ee5fb0e"
echo "3. 进入'云托管'服务"
echo "4. 点击'新建服务'"
echo "5. 上传 admin-deploy.tar.gz"
echo "6. 配置服务参数:"
echo "   - 服务名称: admin-server"
echo "   - 端口: 3000"
echo "   - 启动命令: npm start"
echo "   - 构建命令: npm install"
echo ""
echo "🌐 部署完成后访问地址:"
echo "https://your-service-url.weixin.qq.com"
echo ""
echo "📝 注意事项:"
echo "- 确保云开发环境已开通云托管服务"
echo "- 部署后需要配置自定义域名（可选）"
echo "- 建议配置HTTPS证书"
echo ""
echo "✅ 部署准备完成！" 