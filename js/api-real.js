// 真实API接口管理 - 直接调用云函数
class RealAPI {
    constructor() {
        this.envId = CONFIG.envId || 'new-travel-2gy6d6oy7ee5fb0e';
        // 使用当前域名作为baseUrl，避免跨域问题
        this.baseUrl = window.location.origin;
        
        // 调试信息
        console.log('=== RealAPI 初始化 ===');
        console.log('当前域名:', window.location.origin);
        console.log('设置的baseUrl:', this.baseUrl);
        console.log('环境ID:', this.envId);
        
        this.isConnected = false;
        this.accessToken = null;
        
        // 初始化时尝试从本地存储加载token
        if (typeof tokenManager !== 'undefined') {
            tokenManager.loadTokenFromStorage();
        }
    }

    // 测试连接
    async testConnection() {
        try {
            console.log('=== 测试API连接 ===');
            console.log('当前域名:', window.location.origin);
            console.log('API地址:', `${this.baseUrl}/api/health`);
            
            const response = await fetch(`${this.baseUrl}/api/health`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            console.log('响应状态:', response.status);
            
            if (response.ok) {
                const data = await response.json();
                console.log('API连接测试成功:', data);
                this.isConnected = true;
                return { success: true, data: data };
            } else {
                console.error('API连接测试失败:', response.status, response.statusText);
                this.isConnected = false;
                return { success: false, message: `HTTP ${response.status}: ${response.statusText}` };
            }
        } catch (error) {
            console.error('API连接测试异常:', error);
            this.isConnected = false;
            return { success: false, message: error.message };
        }
    }

    // 获取access_token
    async getAccessToken() {
        try {
            if (typeof tokenManager !== 'undefined') {
                const token = await tokenManager.getAccessToken();
                if (token) {
                    tokenManager.saveTokenToStorage();
                    return token;
                }
            }
            
            // 如果没有token管理器，尝试从服务器获取
            console.log('尝试从服务器获取access_token...');
            const response = await fetch(`${this.baseUrl}/api/get-access-token`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    appid: 'YOUR_APPID',
                    secret: 'YOUR_SECRET'
                })
            });
            
            if (response.ok) {
                const result = await response.json();
                if (result.success && result.access_token) {
                    return result.access_token;
                }
            }
            
            throw new Error('无法获取access_token');
        } catch (error) {
            console.error('获取access_token失败:', error);
            return null;
        }
    }

    // 直接云开发连接测试
    async testDirectCloudConnection() {
        try {
            console.log('尝试直接连接云开发数据库...');
            
            const response = await fetch(`${this.baseUrl}/api/direct-cloud`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    envId: this.envId,
                    action: 'testConnection'
                })
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const result = await response.json();
            console.log('直接云开发连接结果:', result);
            
            return result;
        } catch (error) {
            console.error('直接云开发连接失败:', error);
            return { success: false, message: error.message };
        }
    }

    // 获取产品数据
    async getProducts(query = {}) {
        try {
            console.log('=== 获取产品数据 ===');
            console.log('当前baseUrl:', this.baseUrl);
            console.log('当前域名:', window.location.origin);
            console.log('请求地址:', `${this.baseUrl}/api/direct-cloud`);
            console.log('请求数据:', { envId: this.envId, action: 'get', collection: 'products', query: query });
            
            const response = await fetch(`${this.baseUrl}/api/direct-cloud`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    envId: this.envId,
                    action: 'get',
                    collection: 'products',
                    query: query
                })
            });
            
            console.log('响应状态:', response.status);
            
            if (response.ok) {
                const result = await response.json();
                console.log('API响应:', result);
                
                if (result.success && result.data) {
                    console.log('获取产品数据成功:', result.data);
                    return result.data;
                } else {
                    throw new Error(result.error || 'API返回错误');
                }
            } else {
                const errorText = await response.text();
                console.error('HTTP错误:', response.status, errorText);
                throw new Error(`HTTP ${response.status}: ${errorText}`);
            }
        } catch (error) {
            console.error('获取产品数据失败:', error);
            throw error;
        }
    }

    // 获取区域数据
    async getRegions(query = {}) {
        try {
            console.log('获取区域数据...');
            
            const response = await fetch(`${this.baseUrl}/api/direct-cloud`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    envId: this.envId,
                    action: 'get',
                    collection: 'regions',
                    query: query
                })
            });
            
            if (response.ok) {
                const result = await response.json();
                if (result.success && result.data) {
                    console.log('获取区域数据成功:', result.data);
                    return result.data;
                }
            }
            
            throw new Error('无法从API获取区域数据');
        } catch (error) {
            console.error('获取区域数据失败:', error);
            throw error;
        }
    }

    // 获取轮播图数据
    async getBanners(query = {}) {
        try {
            console.log('获取轮播图数据...');
            
            const response = await fetch(`${this.baseUrl}/api/direct-cloud`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    envId: this.envId,
                    action: 'get',
                    collection: 'banners',
                    query: query
                })
            });
            
            if (response.ok) {
                const result = await response.json();
                if (result.success && result.data) {
                    console.log('获取轮播图数据成功:', result.data);
                    return result.data;
                }
            }
            
            throw new Error('无法从API获取轮播图数据');
        } catch (error) {
            console.error('获取轮播图数据失败:', error);
            throw error;
        }
    }

    // 获取订单数据
    async getOrders(query = {}) {
        try {
            console.log('获取订单数据...');
            
            const response = await fetch(`${this.baseUrl}/api/direct-cloud`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    envId: this.envId,
                    action: 'get',
                    collection: 'orders',
                    query: query
                })
            });
            
            if (response.ok) {
                const result = await response.json();
                if (result.success && result.data) {
                    console.log('获取订单数据成功:', result.data);
                    return result.data;
                }
            }
            
            throw new Error('无法从API获取订单数据');
        } catch (error) {
            console.error('获取订单数据失败:', error);
            throw error;
        }
    }

    // 获取统计数据
    async getStats() {
        try {
            const products = await this.getProducts();
            const regions = await this.getRegions();
            const banners = await this.getBanners();
            const orders = await this.getOrders();
            
            return {
                productCount: products.length,
                regionCount: regions.length,
                bannerCount: banners.length,
                orderCount: orders.length
            };
        } catch (error) {
            console.error('获取统计数据失败:', error);
            throw error;
        }
    }
}

// 创建全局api实例
const api = new RealAPI();

// 调试信息
console.log('=== api-real.js 加载完成 ===');
console.log('创建的api实例:', api);
console.log('api.baseUrl:', api.baseUrl);
console.log('api.envId:', api.envId); 