// 简化的API接口管理
class SimpleAPI {
    constructor() {
        this.envId = CONFIG.envId || 'new-travel-2gy6d6oy7ee5fb0e';
        this.baseUrl = 'https://travel-admin-backend-v2-178239-9-1372522107.sh.run.tcloudbase.com';
        this.isConnected = false;
    }

    // 测试连接
    async testConnection() {
        try {
            console.log('=== 测试API连接 ===');
            
            const response = await fetch(`${this.baseUrl}/api/health`);
            const data = await response.json();
            
            if (data.status === 'ok') {
                console.log('API连接测试成功:', data);
                this.isConnected = true;
                return { success: true, data: data };
            } else {
                console.error('API连接测试失败:', data);
                this.isConnected = false;
                return { success: false, message: '服务响应异常' };
            }
        } catch (error) {
            console.error('API连接测试异常:', error);
            this.isConnected = false;
            return { success: false, message: error.message };
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
            console.log('获取产品数据...');
            
            // 尝试从云开发获取数据
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
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const result = await response.json();
            
            if (result.success && result.data) {
                return result.data;
            } else {
                console.warn('云开发获取失败，使用模拟数据');
                return this.getMockProducts();
            }
        } catch (error) {
            console.error('获取产品数据失败:', error);
            return this.getMockProducts();
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
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const result = await response.json();
            
            if (result.success && result.data) {
                return result.data;
            } else {
                console.warn('云开发获取失败，使用模拟数据');
                return this.getMockRegions();
            }
        } catch (error) {
            console.error('获取区域数据失败:', error);
            return this.getMockRegions();
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
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const result = await response.json();
            
            if (result.success && result.data) {
                return result.data;
            } else {
                console.warn('云开发获取失败，使用模拟数据');
                return this.getMockBanners();
            }
        } catch (error) {
            console.error('获取轮播图数据失败:', error);
            return this.getMockBanners();
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
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const result = await response.json();
            
            if (result.success && result.data) {
                return result.data;
            } else {
                console.warn('云开发获取失败，使用模拟数据');
                return this.getMockOrders();
            }
        } catch (error) {
            console.error('获取订单数据失败:', error);
            return this.getMockOrders();
        }
    }

    // 模拟产品数据
    getMockProducts() {
        return [
            {
                id: '1',
                name: '新疆北疆8日游',
                region: '北疆',
                adultPrice: 3999,
                childPrice: 2999,
                status: 'active',
                image: 'images/products/north-xinjiang.jpg'
            },
            {
                id: '2',
                name: '新疆南疆7日游',
                region: '南疆',
                adultPrice: 3599,
                childPrice: 2699,
                status: 'active',
                image: 'images/products/south-xinjiang.jpg'
            },
            {
                id: '3',
                name: '徒步旅行5日游',
                region: '徒步',
                adultPrice: 2599,
                childPrice: 1999,
                status: 'active',
                image: 'images/products/hiking.jpg'
            }
        ];
    }

    // 模拟区域数据
    getMockRegions() {
        return [
            {
                id: '1',
                name: '北疆',
                productCount: 1,
                isHot: true,
                sort: 1,
                status: 'active',
                image: 'images/regions/north-xinjiang.jpg'
            },
            {
                id: '2',
                name: '南疆',
                productCount: 1,
                isHot: true,
                sort: 2,
                status: 'active',
                image: 'images/regions/south-xinjiang.jpg'
            }
        ];
    }

    // 模拟轮播图数据
    getMockBanners() {
        return [
            {
                id: '1',
                title: '新疆北疆风光',
                image: 'images/banners/banner1.jpg',
                link: '/product/1',
                sort: 1,
                status: 'active'
            },
            {
                id: '2',
                title: '新疆南疆风情',
                image: 'images/banners/banner2.jpg',
                link: '/product/2',
                sort: 2,
                status: 'active'
            }
        ];
    }

    // 模拟订单数据
    getMockOrders() {
        return [
            {
                id: '1',
                productName: '新疆北疆8日游',
                userName: '张三',
                travelDate: '2025-09-01',
                totalPrice: 7998,
                status: 'confirmed',
                createTime: '2025-08-07 10:30:00'
            }
        ];
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
            return {
                productCount: 3,
                regionCount: 2,
                bannerCount: 2,
                orderCount: 1
            };
        }
    }
} 