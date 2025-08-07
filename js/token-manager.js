// Access Token 管理器
class TokenManager {
    constructor() {
        this.accessToken = null;
        this.tokenExpireTime = null;
        this.isRefreshing = false;
        this.appId = 'YOUR_APPID'; // 需要替换为您的AppID
        this.appSecret = 'YOUR_SECRET'; // 需要替换为您的AppSecret
    }

    // 获取access_token
    async getAccessToken() {
        // 检查是否有有效的token
        if (this.accessToken && this.tokenExpireTime && Date.now() < this.tokenExpireTime) {
            console.log('使用缓存的access_token');
            return this.accessToken;
        }

        // 如果正在刷新，等待
        if (this.isRefreshing) {
            console.log('正在刷新token，等待...');
            await this.waitForToken();
            return this.accessToken;
        }

        // 开始刷新token
        return await this.refreshAccessToken();
    }

    // 刷新access_token
    async refreshAccessToken() {
        try {
            this.isRefreshing = true;
            console.log('开始刷新access_token...');

            // 从服务器获取token
            const response = await fetch(`${window.location.origin}/api/get-access-token`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    appid: this.appId,
                    secret: this.appSecret
                })
            });

            if (!response.ok) {
                throw new Error(`获取token失败: ${response.status}`);
            }

            const result = await response.json();
            
            if (result.success && result.access_token) {
                this.accessToken = result.access_token;
                // 设置过期时间（提前5分钟过期）
                this.tokenExpireTime = Date.now() + (result.expires_in - 300) * 1000;
                
                console.log('access_token获取成功');
                return this.accessToken;
            } else {
                throw new Error(result.error || '获取token失败');
            }
        } catch (error) {
            console.error('刷新access_token失败:', error);
            
            // 尝试从本地存储获取
            const savedToken = localStorage.getItem('access_token');
            const savedExpireTime = localStorage.getItem('token_expire_time');
            
            if (savedToken && savedExpireTime && Date.now() < parseInt(savedExpireTime)) {
                console.log('使用本地存储的access_token');
                this.accessToken = savedToken;
                this.tokenExpireTime = parseInt(savedExpireTime);
                return this.accessToken;
            }
            
            throw error;
        } finally {
            this.isRefreshing = false;
        }
    }

    // 等待token刷新完成
    async waitForToken() {
        return new Promise((resolve) => {
            const checkToken = () => {
                if (this.accessToken && !this.isRefreshing) {
                    resolve(this.accessToken);
                } else {
                    setTimeout(checkToken, 100);
                }
            };
            checkToken();
        });
    }

    // 保存token到本地存储
    saveTokenToStorage() {
        if (this.accessToken && this.tokenExpireTime) {
            localStorage.setItem('access_token', this.accessToken);
            localStorage.setItem('token_expire_time', this.tokenExpireTime.toString());
            console.log('token已保存到本地存储');
        }
    }

    // 从本地存储加载token
    loadTokenFromStorage() {
        const savedToken = localStorage.getItem('access_token');
        const savedExpireTime = localStorage.getItem('token_expire_time');
        
        if (savedToken && savedExpireTime) {
            const expireTime = parseInt(savedExpireTime);
            if (Date.now() < expireTime) {
                this.accessToken = savedToken;
                this.tokenExpireTime = expireTime;
                console.log('从本地存储加载token成功');
                return true;
            } else {
                console.log('本地存储的token已过期');
                localStorage.removeItem('access_token');
                localStorage.removeItem('token_expire_time');
            }
        }
        return false;
    }

    // 清除token
    clearToken() {
        this.accessToken = null;
        this.tokenExpireTime = null;
        localStorage.removeItem('access_token');
        localStorage.removeItem('token_expire_time');
        console.log('token已清除');
    }
}

// 创建全局token管理器实例
const tokenManager = new TokenManager(); 