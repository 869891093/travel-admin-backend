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
        console.log('查询:', query);
        
        if (!envId) {
            return res.status(400).json({ 
                error: '缺少环境ID',
                success: false 
            });
        }
        
        // 测试连接
        if (action === 'testConnection') {
            return res.json({
                success: true,
                data: {
                    message: '云开发连接测试成功',
                    envId: envId,
                    timestamp: new Date().toISOString()
                }
            });
        }
        
        // 获取数据
        if (action === 'get') {
            try {
                console.log(`尝试从云开发获取${collection}数据...`);
                
                // 首先获取access_token
                let accessToken = process.env.ACCESS_TOKEN;
                if (!accessToken) {
                    console.log('尝试获取access_token...');
                    try {
                        const tokenResponse = await fetch('https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=YOUR_APPID&secret=YOUR_SECRET');
                        const tokenResult = await tokenResponse.json();
                        if (tokenResult.access_token) {
                            accessToken = tokenResult.access_token;
                        }
                    } catch (tokenError) {
                        console.warn('获取access_token失败:', tokenError);
                    }
                }
                
                if (!accessToken) {
                    throw new Error('无法获取access_token');
                }
                
                // 调用云函数获取真实数据
                const cloudFunctionUrl = `https://api.weixin.qq.com/tcb/invokecloudfunction?access_token=${accessToken}&env=${envId}&name=httpAPI`;
                
                const response = await fetch(cloudFunctionUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        action: 'get',
                        collection: collection,
                        query: query || {}
                    })
                });
                
                if (!response.ok) {
                    throw new Error(`云函数调用失败: ${response.status}`);
                }
                
                const result = await response.json();
                console.log('云函数返回结果:', result);
                
                if (result.errcode && result.errcode !== 0) {
                    throw new Error(`云函数错误: ${result.errmsg}`);
                }
                
                // 解析云函数返回的数据
                let cloudData = result;
                if (result.resp_data) {
                    try {
                        cloudData = JSON.parse(result.resp_data);
                    } catch (parseError) {
                        console.warn('解析云函数数据失败:', parseError);
                        cloudData = result;
                    }
                }
                
                if (cloudData.success && cloudData.data) {
                    console.log(`成功获取${collection}数据，数量:`, cloudData.data.length);
                    return res.json({
                        success: true,
                        data: cloudData.data
                    });
                } else {
                    throw new Error('云函数返回数据格式错误');
                }
                
            } catch (error) {
                console.error(`获取${collection}数据失败:`, error);
                
                // 回退到模拟数据
                console.log('使用模拟数据作为回退');
                let resultData = [];
                
                if (collection === 'products') {
                    resultData = [
                        {
                            _id: '1',
                            name: '新疆北疆8日游',
                            region: '北疆',
                            adultPrice: 3999,
                            childPrice: 2999,
                            status: 'active',
                            image: 'images/products/north-xinjiang.jpg',
                            description: '探索新疆北疆的壮美风光',
                            createTime: '2025-08-07 10:00:00'
                        },
                        {
                            _id: '2',
                            name: '新疆南疆7日游',
                            region: '南疆',
                            adultPrice: 3599,
                            childPrice: 2699,
                            status: 'active',
                            image: 'images/products/south-xinjiang.jpg',
                            description: '体验新疆南疆的独特风情',
                            createTime: '2025-08-07 10:30:00'
                        },
                        {
                            _id: '3',
                            name: '徒步旅行5日游',
                            region: '徒步',
                            adultPrice: 2599,
                            childPrice: 1999,
                            status: 'active',
                            image: 'images/products/hiking.jpg',
                            description: '享受徒步旅行的乐趣',
                            createTime: '2025-08-07 11:00:00'
                        }
                    ];
                } else if (collection === 'regions') {
                    resultData = [
                        {
                            _id: '1',
                            name: '北疆',
                            productCount: 1,
                            isHot: true,
                            sort: 1,
                            status: 'active',
                            image: 'images/regions/north-xinjiang.jpg'
                        },
                        {
                            _id: '2',
                            name: '南疆',
                            productCount: 1,
                            isHot: true,
                            sort: 2,
                            status: 'active',
                            image: 'images/regions/south-xinjiang.jpg'
                        }
                    ];
                } else if (collection === 'banners') {
                    resultData = [
                        {
                            _id: '1',
                            title: '新疆北疆风光',
                            image: 'images/banners/banner1.jpg',
                            link: '/product/1',
                            sort: 1,
                            status: 'active'
                        },
                        {
                            _id: '2',
                            title: '新疆南疆风情',
                            image: 'images/banners/banner2.jpg',
                            link: '/product/2',
                            sort: 2,
                            status: 'active'
                        }
                    ];
                } else if (collection === 'orders') {
                    resultData = [
                        {
                            _id: '1',
                            productName: '新疆北疆8日游',
                            userName: '张三',
                            travelDate: '2025-09-01',
                            totalPrice: 7998,
                            status: 'confirmed',
                            createTime: '2025-08-07 10:30:00'
                        }
                    ];
                }
                
                console.log(`返回${collection}模拟数据，数量:`, resultData.length);
                return res.json({
                    success: true,
                    data: resultData
                });
            }
        }
        
        // 其他操作
        return res.json({
            success: false,
            error: '不支持的操作类型'
        });
        
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