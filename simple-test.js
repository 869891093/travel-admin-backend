const express = require('express');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3000;

// 中间件
app.use(cors());
app.use(express.json());

// 健康检查
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'ok', 
        timestamp: new Date().toISOString(),
        port: port,
        env: process.env.NODE_ENV || 'development',
        message: '简单测试服务器运行正常'
    });
});

// 测试接口
app.get('/api/test', (req, res) => {
    res.json({ 
        message: '测试成功',
        timestamp: new Date().toISOString(),
        port: port
    });
});

// 根路径
app.get('/', (req, res) => {
    res.json({
        message: '简单测试服务器',
        endpoints: {
            health: '/api/health',
            test: '/api/test'
        },
        port: port,
        env: process.env.NODE_ENV || 'development'
    });
});

// 启动服务器
app.listen(port, '0.0.0.0', () => {
    console.log(`简单测试服务器运行在端口 ${port}`);
    console.log(`环境: ${process.env.NODE_ENV || 'development'}`);
    console.log(`健康检查: http://localhost:${port}/api/health`);
    console.log(`测试接口: http://localhost:${port}/api/test`);
}); 