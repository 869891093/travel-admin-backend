const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

// 代理微信云函数调用
app.post('/api/cloud-function', async (req, res) => {
    try {
        const { accessToken, envId, functionName, data } = req.body;
        
        console.log('=== 代理云函数调用 ===');
        console.log('环境ID:', envId);
        console.log('函数名:', functionName);
        console.log('数据:', data);
        
        if (!accessToken || !envId || !functionName) {
            console.error('缺少必要参数');
            return res.status(400).json({ 
                error: '缺少必要参数',
                required: ['accessToken', 'envId', 'functionName'],
                received: { accessToken: !!accessToken, envId: !!envId, functionName: !!functionName }
            });
        }
        
        const url = `https://api.weixin.qq.com/tcb/invokecloudfunction?access_token=${accessToken}&env=${envId}&name=${functionName}`;
        
        console.log('调用微信API:', url);
        console.log('请求数据:', data);

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
        
        const result = await response.json();
        console.log('微信API响应:', result);
        
        // 检查微信API错误
        if (result.errcode && result.errcode !== 0) {
            console.error('微信API错误:', result);
            return res.status(400).json({
                error: '微信API错误',
                errcode: result.errcode,
                errmsg: result.errmsg
            });
        }
        
        // 解析响应数据
        let parsedResult = result;
        if (result.resp_data) {
            try {
                parsedResult = JSON.parse(result.resp_data);
            } catch (parseError) {
                console.warn('解析resp_data失败:', parseError);
                parsedResult = result;
            }
        }
        
        console.log('最终返回结果:', parsedResult);
        res.json(parsedResult);
        
    } catch (error) {
        console.error('代理调用失败:', error);
        res.status(500).json({ 
            error: error.message,
            stack: error.stack
        });
    }
});

// 健康检查接口
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'ok', 
        timestamp: new Date().toISOString(),
        message: '代理服务器运行正常'
    });
});

// 测试接口
app.get('/api/test', (req, res) => {
    res.json({ 
        message: '代理服务器测试成功',
        timestamp: new Date().toISOString()
    });
});

// 直接访问云开发数据库（不需要access_token）
app.post('/api/direct-cloud', async (req, res) => {
    try {
        const { envId, action, collection, data, id, query } = req.body;
        
        console.log('=== 直接云开发数据库访问 ===');
        console.log('环境ID:', envId);
        console.log('操作:', action);
        console.log('集合:', collection);
        console.log('数据:', data);
        
        if (!envId) {
            return res.status(400).json({ 
                error: '缺少环境ID',
                success: false 
            });
        }
        
        // 这里我们可以使用云开发的HTTP API直接访问数据库
        // 但是需要先获取有效的access_token
        
        // 临时方案：返回模拟的成功响应，实际应该调用云开发API
        const mockResult = {
            success: true,
            data: {
                products: 3, // 您的实际产品数量
                regions: 2,
                banners: 2,
                orders: 1,
                message: '直接云开发连接成功（模拟）'
            }
        };
        
        console.log('返回模拟结果:', mockResult);
        res.json(mockResult);
        
    } catch (error) {
        console.error('直接云开发访问失败:', error);
        res.status(500).json({ 
            error: error.message,
            success: false
        });
    }
});

// 获取access_token的接口
app.post('/api/get-access-token', async (req, res) => {
    try {
        const { appid, secret } = req.body;
        
        if (!appid || !secret) {
            return res.status(400).json({
                error: '缺少appid或secret',
                success: false
            });
        }
        
        console.log('获取access_token...');
        console.log('AppID:', appid);
        
        const url = `https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${appid}&secret=${secret}`;
        
        const response = await fetch(url);
        const result = await response.json();
        
        console.log('微信API响应:', result);
        
        if (result.access_token) {
            res.json({
                success: true,
                access_token: result.access_token,
                expires_in: result.expires_in
            });
        } else {
            res.json({
                success: false,
                error: result.errmsg || '获取access_token失败'
            });
        }
        
    } catch (error) {
        console.error('获取access_token失败:', error);
        res.status(500).json({
            error: error.message,
            success: false
        });
    }
});

// 静态文件服务 - 放在API路由之后
app.use(express.static(__dirname));

// 根路径处理
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

// 处理所有其他路径，返回index.html（SPA应用）
app.get('*', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

app.listen(port, () => {
    console.log(`代理服务器运行在端口 ${port}`);
    console.log(`健康检查: http://localhost:${port}/api/health`);
    console.log(`测试接口: http://localhost:${port}/api/test`);
    console.log('环境变量 PORT:', process.env.PORT);
    console.log('环境变量 NODE_ENV:', process.env.NODE_ENV);
}); 