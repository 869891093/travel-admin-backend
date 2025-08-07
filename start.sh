#!/bin/bash

echo "=== 跟团游小程序后台管理系统启动脚本 ==="
echo ""

# 检查Node.js是否安装
if ! command -v node &> /dev/null; then
    echo "❌ 错误: 未找到Node.js，请先安装Node.js"
    echo "下载地址: https://nodejs.org/"
    exit 1
fi

# 检查npm是否安装
if ! command -v npm &> /dev/null; then
    echo "❌ 错误: 未找到npm，请先安装npm"
    exit 1
fi

echo "✅ Node.js版本: $(node --version)"
echo "✅ npm版本: $(npm --version)"
echo ""

# 检查依赖是否安装
if [ ! -d "node_modules" ]; then
    echo "📦 正在安装依赖..."
    npm install
    if [ $? -ne 0 ]; then
        echo "❌ 依赖安装失败"
        exit 1
    fi
    echo "✅ 依赖安装完成"
else
    echo "✅ 依赖已安装"
fi

echo ""
echo "🚀 启动代理服务器..."
echo "📱 管理界面地址: http://localhost:3000"
echo "🔧 健康检查: http://localhost:3000/api/health"
echo "🧪 测试接口: http://localhost:3000/api/test"
echo ""
echo "按 Ctrl+C 停止服务器"
echo ""

# 启动服务器
npm start 