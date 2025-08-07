// 配置文件
const CONFIG = {
    // 云开发环境配置
    envId: 'new-travel-2gy6d6oy7ee5fb0e', // 替换为您的环境ID
    
    // API配置
    baseUrl: 'https://api.weixin.qq.com',
    
    // 页面配置
    pageSize: 20,
    
    // 状态映射
    statusMap: {
        'active': '启用',
        'inactive': '禁用',
        'pending': '待付款',
        'confirmed': '已确认',
        'completed': '已完成',
        'cancelled': '已取消'
    },
    
    // 状态颜色
    statusColors: {
        'active': '#28a745',
        'inactive': '#dc3545',
        'pending': '#ffc107',
        'confirmed': '#17a2b8',
        'completed': '#28a745',
        'cancelled': '#dc3545'
    }
};

// 从localStorage加载配置
function loadConfig() {
    const savedEnvId = localStorage.getItem('envId');
    const savedApiKey = localStorage.getItem('apiKey');
    
    if (savedEnvId) CONFIG.envId = savedEnvId;
    if (savedApiKey) CONFIG.apiKey = savedApiKey;
}

// 保存配置到localStorage
function saveConfig() {
    localStorage.setItem('envId', CONFIG.envId);
    if (CONFIG.apiKey) {
        localStorage.setItem('apiKey', CONFIG.apiKey);
    }
}

// 初始化时加载配置
loadConfig(); 