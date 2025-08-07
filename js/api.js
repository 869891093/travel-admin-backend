// API接口管理
class API {
    constructor() {
        this.envId = CONFIG.envId || 'new-travel-2gy6d6oy7ee5fb0e';
        this.accessToken = CONFIG.apiKey || '';
        this.useProxy = true; // 使用代理服务器
        this.baseUrl = window.location.origin; // 使用当前域名
        this.isConnected = false; // 连接状态
        
        // 调试信息
        console.log('=== API 初始化 ===');
        console.log('当前域名:', window.location.origin);
        console.log('设置的baseUrl:', this.baseUrl);
        console.log('环境ID:', this.envId);
    }

    // 测试连接
    async testConnection() {
        try {
            console.log('=== 测试API连接 ===');
            
            // 首先尝试直接连接云开发数据库
            const directResult = await this.testDirectCloudConnection();
            if (directResult.success) {
                console.log('直接云开发连接成功:', directResult.data);
                this.isConnected = true;
                return { success: true, data: directResult.data };
            }
            
            // 如果直接连接失败，尝试通过云函数
            const result = await this.callCloudFunction('httpAPI', {
                action: 'testConnection'
            });
            
            if (result.success) {
                console.log('API连接测试成功:', result.data);
                this.isConnected = true;
                return { success: true, data: result.data };
            } else {
                console.error('API连接测试失败:', result.message);
                this.isConnected = false;
                return { success: false, message: result.message };
            }
        } catch (error) {
            console.error('API连接测试异常:', error);
            this.isConnected = false;
            return { success: false, message: error.message };
        }
    }

    // 直接测试云开发连接（不需要access_token）
    async testDirectCloudConnection() {
        try {
            console.log('尝试直接连接云开发数据库...');
            
            // 使用云开发HTTP API直接访问数据库
            const url = `${this.baseUrl}/api/direct-cloud`;
            
            const response = await fetch(url, {
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

    // 获取访问令牌
    async getAccessToken() {
        if (this.accessToken) {
            return this.accessToken.trim();
        }
        
        // 检查本地存储中是否有API密钥
        const savedApiKey = localStorage.getItem('apiKey');
        if (savedApiKey) {
            this.accessToken = savedApiKey;
            return this.accessToken;
        }
        
        console.warn('未配置access_token，将使用本地存储模式');
        return null;
    }

    // 调用云函数
    async callCloudFunction(functionName, data) {
        try {
            console.log('调用云函数:', functionName, data);
            
            // 如果是httpAPI函数，使用HTTP调用
            if (functionName === 'httpAPI') {
                return await this.callHTTPAPI(data);
            }
            
            // 其他云函数调用
            return await this.callDirectCloudFunction(functionName, data);
        } catch (error) {
            console.error('云函数调用失败:', error);
            throw error;
        }
    }

    // 直接调用云函数（通过代理）
    async callDirectCloudFunction(functionName, data) {
        try {
            const accessToken = await this.getAccessToken();
            
            // 如果没有access_token，直接使用本地存储
            if (!accessToken) {
                console.log('没有access_token，使用本地存储');
                return this.handleLocalStorage(data);
            }

            const url = `${this.baseUrl}/api/cloud-function`;
            
            console.log('直接调用云函数:', url);
            console.log('请求数据:', { envId: this.envId, functionName, data });

            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    accessToken: accessToken,
                    envId: this.envId,
                    functionName: functionName,
                    data: data
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            console.log('云函数调用结果:', result);
            
            // 检查微信API返回的错误
            if (result.errcode && result.errcode !== 0) {
                throw new Error(`微信API错误: ${result.errmsg}`);
            }
            
            return result.resp_data ? JSON.parse(result.resp_data) : result;
        } catch (error) {
            console.error('直接云函数调用失败:', error);
            // 回退到本地存储
            return this.handleLocalStorage(data);
        }
    }

    // HTTP API调用
    async callHTTPAPI(data) {
        try {
            const accessToken = await this.getAccessToken();
            
            // 如果没有access_token，直接使用本地存储
            if (!accessToken) {
                console.log('没有access_token，使用本地存储');
                return this.handleLocalStorage(data);
            }

            if (this.useProxy) {
                // 使用代理服务器
                const url = `${this.baseUrl}/api/cloud-function`;
                
                console.log('通过代理调用云函数:', url);
                console.log('请求数据:', data);

                const response = await fetch(url, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        accessToken: accessToken,
                        envId: this.envId,
                        functionName: 'httpAPI',
                        data: data
                    })
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const result = await response.json();
                console.log('云函数调用结果:', result);
                
                // 检查微信API返回的错误
                if (result.errcode && result.errcode !== 0) {
                    throw new Error(`微信API错误: ${result.errmsg}`);
                }
                
                return result.resp_data ? JSON.parse(result.resp_data) : result;
            } else {
                // 直接调用（会失败，因为有CORS问题）
                const url = `https://api.weixin.qq.com/tcb/invokecloudfunction?access_token=${encodeURIComponent(accessToken)}&env=${this.envId}&name=httpAPI`;
                
                const response = await fetch(url, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(data)
                });

                const result = await response.json();
                return result.resp_data ? JSON.parse(result.resp_data) : result;
            }
        } catch (error) {
            console.error('HTTP API调用失败:', error);
            console.log('回退到本地存储');
            return this.handleLocalStorage(data);
        }
    }

    // 本地存储处理（备用方案）
    handleLocalStorage(data) {
        const { action, collection, data: itemData, id } = data;
        
        switch (action) {
            case 'get':
                return this.handleLocalGet(collection, itemData);
            case 'add':
                return this.handleLocalAdd(collection, itemData);
            case 'update':
                return this.handleLocalUpdate(collection, id, itemData);
            case 'delete':
                return this.handleLocalDelete(collection, id);
            case 'getStats':
                return this.handleLocalGetStats();
            case 'testConnection':
                return this.handleLocalTestConnection();
            default:
                return { success: false, message: '未知操作' };
        }
    }

    // 本地测试连接
    handleLocalTestConnection() {
        return {
            success: true,
            data: {
                products: 2,
                regions: 2,
                banners: 2,
                orders: 1,
                message: '本地存储模式'
            }
        };
    }

    // 本地获取数据
    handleLocalGet(collection, query) {
        const key = `admin_${collection}`;
        const data = JSON.parse(localStorage.getItem(key) || '[]');
        
        console.log(`从本地存储获取${collection}:`, data);
        return { success: true, data: data };
    }

    // 本地添加数据
    handleLocalAdd(collection, data) {
        const key = `admin_${collection}`;
        const existingData = JSON.parse(localStorage.getItem(key) || '[]');
        
        // 生成ID
        const newItem = {
            _id: Date.now().toString(),
            ...data,
            createTime: new Date(),
            updateTime: new Date()
        };
        
        existingData.push(newItem);
        localStorage.setItem(key, JSON.stringify(existingData));
        
        console.log(`添加数据到本地存储${collection}:`, newItem);
        return { success: true, data: { _id: newItem._id } };
    }

    // 本地更新数据
    handleLocalUpdate(collection, id, data) {
        const key = `admin_${collection}`;
        const existingData = JSON.parse(localStorage.getItem(key) || '[]');
        
        const index = existingData.findIndex(item => item._id === id);
        if (index !== -1) {
            existingData[index] = {
                ...existingData[index],
                ...data,
                updateTime: new Date()
            };
            localStorage.setItem(key, JSON.stringify(existingData));
            
            console.log(`更新本地存储${collection}:`, existingData[index]);
            return { success: true };
        }
        
        return { success: false, message: '数据不存在' };
    }

    // 本地删除数据
    handleLocalDelete(collection, id) {
        const key = `admin_${collection}`;
        const existingData = JSON.parse(localStorage.getItem(key) || '[]');
        
        const filteredData = existingData.filter(item => item._id !== id);
        localStorage.setItem(key, JSON.stringify(filteredData));
        
        console.log(`从本地存储删除${collection}:`, id);
        return { success: true };
    }

    // 本地获取统计数据
    handleLocalGetStats() {
        const products = JSON.parse(localStorage.getItem('admin_products') || '[]');
        const regions = JSON.parse(localStorage.getItem('admin_regions') || '[]');
        const orders = JSON.parse(localStorage.getItem('admin_orders') || '[]');
        const users = JSON.parse(localStorage.getItem('admin_users') || '[]');
        
        return {
            success: true,
            data: {
                productCount: products.length,
                regionCount: regions.length,
                orderCount: orders.length,
                userCount: users.length
            }
        };
    }

    // 初始化本地存储
    initLocalStorage() {
        // 只在本地存储为空时才初始化模拟数据
        if (!localStorage.getItem('admin_products')) {
            localStorage.setItem('admin_products', JSON.stringify(this.mockProducts()));
        }
        
        if (!localStorage.getItem('admin_regions')) {
            localStorage.setItem('admin_regions', JSON.stringify(this.mockRegions()));
        }
        
        if (!localStorage.getItem('admin_banners')) {
            localStorage.setItem('admin_banners', JSON.stringify(this.mockBanners()));
        }
        
        if (!localStorage.getItem('admin_orders')) {
            localStorage.setItem('admin_orders', JSON.stringify(this.mockOrders()));
        }
        
        console.log('本地存储初始化完成');
    }

    // 清除本地存储（强制从云端重新加载）
    clearLocalStorage() {
        localStorage.removeItem('admin_products');
        localStorage.removeItem('admin_regions');
        localStorage.removeItem('admin_banners');
        localStorage.removeItem('admin_orders');
        console.log('本地存储已清除');
    }

    // 强制从云端重新加载数据
    async forceReloadFromCloud() {
        console.log('强制从云端重新加载数据...');
        this.clearLocalStorage();
        
        try {
            // 测试连接
            const connectionResult = await this.testConnection();
            if (connectionResult.success) {
                console.log('云端连接成功，数据将从云端加载');
                return true;
            } else {
                console.log('云端连接失败，将使用本地存储');
                this.initLocalStorage();
                return false;
            }
        } catch (error) {
            console.error('强制重新加载失败:', error);
            this.initLocalStorage();
            return false;
        }
    }

    // 产品相关API
    async getProducts(query = {}) {
        const result = await this.callCloudFunction('httpAPI', {
            action: 'get',
            collection: 'products',
            query: query
        });
        return result.success ? result.data : [];
    }

    async createProduct(productData) {
        console.log('创建产品数据:', productData);
        
        const result = await this.callCloudFunction('httpAPI', {
            action: 'add',
            collection: 'products',
            data: productData
        });
        
        console.log('创建产品结果:', result);
        return result;
    }

    async updateProduct(id, productData) {
        const result = await this.callCloudFunction('httpAPI', {
            action: 'update',
            collection: 'products',
            id: id,
            data: productData
        });
        return result;
    }

    async deleteProduct(id) {
        const result = await this.callCloudFunction('httpAPI', {
            action: 'delete',
            collection: 'products',
            id: id
        });
        return result;
    }

    async getProductById(id) {
        const result = await this.callCloudFunction('httpAPI', {
            action: 'get',
            collection: 'products',
            query: { where: { _id: id } }
        });
        return result.success && result.data.length > 0 ? result.data[0] : null;
    }

    // 区域相关API
    async getRegions(query = {}) {
        const result = await this.callCloudFunction('httpAPI', {
            action: 'get',
            collection: 'regions',
            query: query
        });
        return result.success ? result.data : [];
    }

    async createRegion(regionData) {
        const result = await this.callCloudFunction('httpAPI', {
            action: 'add',
            collection: 'regions',
            data: regionData
        });
        return result;
    }

    async updateRegion(id, regionData) {
        const result = await this.callCloudFunction('httpAPI', {
            action: 'update',
            collection: 'regions',
            id: id,
            data: regionData
        });
        return result;
    }

    async deleteRegion(id) {
        const result = await this.callCloudFunction('httpAPI', {
            action: 'delete',
            collection: 'regions',
            id: id
        });
        return result;
    }

    async getRegionById(id) {
        const result = await this.callCloudFunction('httpAPI', {
            action: 'get',
            collection: 'regions',
            query: { where: { _id: id } }
        });
        return result.success && result.data.length > 0 ? result.data[0] : null;
    }

    // 轮播图相关API
    async getBanners(query = {}) {
        const result = await this.callCloudFunction('httpAPI', {
            action: 'get',
            collection: 'banners',
            query: query
        });
        return result.success ? result.data : [];
    }

    async createBanner(bannerData) {
        const result = await this.callCloudFunction('httpAPI', {
            action: 'add',
            collection: 'banners',
            data: bannerData
        });
        return result;
    }

    async updateBanner(id, bannerData) {
        const result = await this.callCloudFunction('httpAPI', {
            action: 'update',
            collection: 'banners',
            id: id,
            data: bannerData
        });
        return result;
    }

    async deleteBanner(id) {
        const result = await this.callCloudFunction('httpAPI', {
            action: 'delete',
            collection: 'banners',
            id: id
        });
        return result;
    }

    async getBannerById(id) {
        const result = await this.callCloudFunction('httpAPI', {
            action: 'get',
            collection: 'banners',
            query: { where: { _id: id } }
        });
        return result.success && result.data.length > 0 ? result.data[0] : null;
    }

    // 订单相关API
    async getOrders(query = {}) {
        const result = await this.callCloudFunction('httpAPI', {
            action: 'get',
            collection: 'orders',
            query: query
        });
        return result.success ? result.data : [];
    }

    async updateOrderStatus(id, status) {
        const result = await this.callCloudFunction('httpAPI', {
            action: 'update',
            collection: 'orders',
            id: id,
            data: { status: status }
        });
        return result;
    }

    async getOrderById(id) {
        const result = await this.callCloudFunction('httpAPI', {
            action: 'get',
            collection: 'orders',
            query: { where: { _id: id } }
        });
        return result.success && result.data.length > 0 ? result.data[0] : null;
    }

    // 统计数据API
    async getStats() {
        const result = await this.callCloudFunction('httpAPI', {
            action: 'getStats'
        });
        return result.success ? result.data : {
            productCount: 0,
            regionCount: 0,
            orderCount: 0,
            userCount: 0
        };
    }

    // 模拟数据（保留用于测试）
    mockProducts() {
        return [
            {
                _id: 'product_001',
                title: '三亚5日4晚双飞游',
                description: '享受阳光、沙滩、海浪，体验热带风情',
                coverImage: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400',
                adultPrice: 2999,
                childPrice: 1999,
                region: '海南',
                status: 'active',
                createTime: new Date('2024-01-15')
            },
            {
                _id: 'product_002',
                title: '云南丽江大理6日游',
                description: '感受古城魅力，体验民族风情',
                coverImage: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400',
                adultPrice: 3999,
                childPrice: 2499,
                region: '云南',
                status: 'active',
                createTime: new Date('2024-01-20')
            }
        ];
    }

    mockRegions() {
        return [
            {
                _id: 'region_001',
                name: '海南',
                imageUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=200',
                productCount: 5,
                isHot: true,
                sort: 1,
                status: 'active'
            },
            {
                _id: 'region_002',
                name: '云南',
                imageUrl: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=200',
                productCount: 8,
                isHot: true,
                sort: 2,
                status: 'active'
            }
        ];
    }

    mockBanners() {
        return [
            {
                _id: 'banner_001',
                imageUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
                title: '美丽的海滩度假',
                sort: 1,
                status: 'active'
            },
            {
                _id: 'banner_002',
                imageUrl: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800',
                title: '山间徒步旅行',
                sort: 2,
                status: 'active'
            }
        ];
    }

    mockOrders() {
        return [
            {
                _id: 'order_001',
                orderNo: 'T175424818024955743K',
                productTitle: '三亚5日4晚双飞游',
                openid: 'user_001',
                travelDate: '2025-08-14',
                adultCount: 1,
                childCount: 1,
                totalPrice: 4998,
                status: 'cancelled',
                createTime: new Date('2024-01-15')
            }
        ];
    }
}

// 创建全局API实例
const api = new API();

// 初始化本地存储
api.initLocalStorage(); 