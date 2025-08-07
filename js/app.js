// 主应用逻辑
class AdminApp {
    constructor() {
        console.log('AdminApp 初始化开始...');
        this.currentPage = 'dashboard';
        this.charts = {}; // 存储图表实例
        this.editingItem = null; // 当前编辑的项目
        this.init();
    }

    init() {
        console.log('AdminApp 初始化中...');
        this.bindEvents();
        
        // 自动从localStorage读取同步的Token
        this.loadSyncedToken();
        
        // 测试连接
        this.testConnection();
        
        this.loadDashboard();
        console.log('AdminApp 初始化完成');
    }

    // 加载同步的Token
    loadSyncedToken() {
        try {
            const syncedToken = localStorage.getItem('apiKey');
            const syncTime = localStorage.getItem('token_sync_time');
            
            if (syncedToken && syncTime) {
                console.log('检测到同步的Token，自动加载到系统设置');
                
                // 更新系统设置页面的API密钥输入框
                const apiKeyInput = document.getElementById('api-key');
                if (apiKeyInput) {
                    apiKeyInput.value = syncedToken;
                    console.log('Token已自动加载到系统设置');
                }
                
                // 更新配置
                CONFIG.apiKey = syncedToken;
                
                // 显示同步状态
                const syncTimeDate = new Date(parseInt(syncTime));
                const timeDiff = Math.floor((Date.now() - parseInt(syncTime)) / 1000 / 60); // 分钟
                console.log(`Token同步时间: ${syncTimeDate.toLocaleString()}, 距今${timeDiff}分钟`);
                
                // 更新状态显示
                const statusElement = document.getElementById('token-sync-status');
                if (statusElement) {
                    if (timeDiff < 120) { // 2小时内
                        statusElement.innerHTML = `<span style="color: #28a745;">✓ Token已同步 (${timeDiff}分钟前)</span>`;
                    } else {
                        statusElement.innerHTML = `<span style="color: #ffc107;">⚠ Token同步时间较久 (${timeDiff}分钟前)，建议重新获取</span>`;
                    }
                }
                
                if (timeDiff < 120) { // 2小时内
                    showMessage(`Token已自动同步 (${timeDiff}分钟前)`, 'success');
                } else {
                    showMessage('Token同步时间较久，建议重新获取', 'warning');
                }
            }
        } catch (error) {
            console.error('加载同步Token失败:', error);
        }
    }

    async testConnection() {
        try {
            console.log('测试API连接...');
            const result = await api.testConnection();
            
            if (result.success) {
                console.log('API连接成功:', result.data);
                showMessage('API连接成功！', 'success');
                return true;
            } else {
                console.warn('API连接失败:', result.message);
                showMessage('API连接失败，将使用模拟数据', 'warning');
                return false;
            }
        } catch (error) {
            console.error('连接测试异常:', error);
            showMessage('连接测试异常，将使用模拟数据', 'warning');
            return false;
        }
    }

    // 强制重新加载数据
    async forceReloadData() {
        try {
            showMessage('正在重新加载数据...', 'info');
            
            // 重新加载当前页面数据
            this.loadPageData(this.currentPage);
            showMessage('数据已重新加载！', 'success');
        } catch (error) {
            console.error('重新加载失败:', error);
            showMessage('重新加载失败', 'error');
        }
    }

    bindEvents() {
        console.log('绑定事件...');
        
        // 导航事件
        const navItems = document.querySelectorAll('.nav-item');
        console.log('找到导航项数量:', navItems.length);
        
        navItems.forEach((item, index) => {
            console.log(`绑定导航项 ${index}:`, item.dataset.page);
            item.addEventListener('click', (e) => {
                console.log('点击导航项:', e.currentTarget.dataset.page);
                const page = e.currentTarget.dataset.page;
                this.switchPage(page);
            });
        });

        // 侧边栏切换
        const sidebarToggle = document.querySelector('.sidebar-toggle');
        if (sidebarToggle) {
            sidebarToggle.addEventListener('click', () => {
                console.log('切换侧边栏');
                document.querySelector('.sidebar').classList.toggle('active');
            });
        }

        // 模态框关闭
        const closeBtn = document.querySelector('.close');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                console.log('关闭模态框');
                this.closeModal();
            });
        }

        // 点击模态框外部关闭
        window.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                console.log('点击模态框外部');
                this.closeModal();
            }
        });

        // 设置保存
        const envIdInput = document.getElementById('env-id');
        if (envIdInput) {
            envIdInput.addEventListener('input', (e) => {
                CONFIG.envId = e.target.value;
            });
        }
        
        console.log('事件绑定完成');
    }

    switchPage(page) {
        console.log('切换到页面:', page);
        
        // 更新导航状态
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });
        const activeNav = document.querySelector(`[data-page="${page}"]`);
        if (activeNav) {
            activeNav.classList.add('active');
        }

        // 更新页面标题
        const pageTitles = {
            dashboard: '仪表盘',
            products: '产品管理',
            regions: '区域管理',
            banners: '轮播图管理',
            orders: '订单管理',
            settings: '系统设置'
        };
        
        const pageTitleEl = document.getElementById('page-title');
        if (pageTitleEl && pageTitles[page]) {
            pageTitleEl.textContent = pageTitles[page];
        }

        // 切换页面内容
        document.querySelectorAll('.page').forEach(p => {
            p.classList.remove('active');
        });
        
        const targetPage = document.getElementById(page);
        if (targetPage) {
            targetPage.classList.add('active');
        }

        // 加载页面数据
        this.loadPageData(page);
    }

    async loadPageData(page) {
        switch (page) {
            case 'dashboard':
                await this.loadDashboard();
                break;
            case 'products':
                await this.loadProducts();
                break;
            case 'regions':
                await this.loadRegions();
                break;
            case 'banners':
                await this.loadBanners();
                break;
            case 'orders':
                await this.loadOrders();
                break;
        }
    }

    // 加载仪表盘数据
    async loadDashboard() {
        try {
            const stats = await api.getStats();
            
            // 更新统计数据
            document.getElementById('product-count').textContent = stats.productCount;
            document.getElementById('region-count').textContent = stats.regionCount;
            document.getElementById('order-count').textContent = stats.orderCount;
            
            // 创建图表
            this.createOrderChart();
            this.createProductChart();
            
            showMessage('仪表盘数据加载成功', 'success');
        } catch (error) {
            console.error('加载仪表盘数据失败:', error);
            showMessage(`加载仪表盘数据失败: ${error.message}`, 'error');
        }
    }

    // 加载产品数据
    async loadProducts() {
        try {
            const products = await api.getProducts();
            this.renderProductsTable(products);
        } catch (error) {
            console.error('加载产品数据失败:', error);
            showMessage(`加载产品数据失败: ${error.message}`, 'error');
        }
    }

    // 加载区域数据
    async loadRegions() {
        try {
            const regions = await api.getRegions();
            this.renderRegionsTable(regions);
        } catch (error) {
            console.error('加载区域数据失败:', error);
            showMessage(`加载区域数据失败: ${error.message}`, 'error');
        }
    }

    // 加载轮播图数据
    async loadBanners() {
        try {
            const banners = await api.getBanners();
            this.renderBannersGrid(banners);
        } catch (error) {
            console.error('加载轮播图数据失败:', error);
            showMessage(`加载轮播图数据失败: ${error.message}`, 'error');
        }
    }

    // 加载订单数据
    async loadOrders() {
        try {
            const orders = await api.getOrders();
            this.renderOrdersTable(orders);
        } catch (error) {
            console.error('加载订单数据失败:', error);
            showMessage(`加载订单数据失败: ${error.message}`, 'error');
        }
    }

    // 渲染产品表格
    renderProductsTable(products) {
        const tbody = document.getElementById('products-table-body');
        if (!tbody) return;
        
        tbody.innerHTML = products.map(product => `
            <tr>
                <td><img src="${product.coverImage || '/images/default-goods-image.png'}" class="table-image" alt="${product.title}" onerror="this.src='/images/default-goods-image.png'"></td>
                <td>${product.title}</td>
                <td>${product.region}</td>
                <td>¥${product.adultPrice}</td>
                <td>¥${product.childPrice}</td>
                <td><span class="status-badge status-${product.status}">${CONFIG.statusMap[product.status] || product.status}</span></td>
                <td>
                    <button class="btn btn-secondary" onclick="app.editProduct('${product._id}')">编辑</button>
                    <button class="btn btn-danger" onclick="app.deleteProduct('${product._id}')">删除</button>
                </td>
            </tr>
        `).join('');
    }

    // 渲染区域表格
    renderRegionsTable(regions) {
        const tbody = document.getElementById('regions-table-body');
        if (!tbody) return;
        
        tbody.innerHTML = regions.map(region => `
            <tr>
                <td><img src="${region.imageUrl || '/images/default-goods-image.png'}" class="table-image" alt="${region.name}" onerror="this.src='/images/default-goods-image.png'"></td>
                <td>${region.name}</td>
                <td>${region.productCount || 0}</td>
                <td>${region.isHot ? '是' : '否'}</td>
                <td>${region.sort || 0}</td>
                <td><span class="status-badge status-${region.status}">${CONFIG.statusMap[region.status] || region.status}</span></td>
                <td>
                    <button class="btn btn-secondary" onclick="app.editRegion('${region._id}')">编辑</button>
                    <button class="btn btn-danger" onclick="app.deleteRegion('${region._id}')">删除</button>
                </td>
            </tr>
        `).join('');
    }

    // 渲染轮播图网格
    renderBannersGrid(banners) {
        const grid = document.getElementById('banner-grid');
        if (!grid) return;
        
        grid.innerHTML = banners.map(banner => `
            <div class="banner-card">
                <img src="${banner.imageUrl || '/images/default-goods-image.png'}" class="banner-image" alt="${banner.title}" onerror="this.src='/images/default-goods-image.png'">
                <div class="banner-content">
                    <div class="banner-title">${banner.title}</div>
                    <div class="banner-actions">
                        <button class="btn btn-secondary" onclick="app.editBanner('${banner._id}')">编辑</button>
                        <button class="btn btn-danger" onclick="app.deleteBanner('${banner._id}')">删除</button>
                    </div>
                </div>
            </div>
        `).join('');
    }

    // 渲染订单表格
    renderOrdersTable(orders) {
        const tbody = document.getElementById('orders-table-body');
        if (!tbody) return;
        
        tbody.innerHTML = orders.map(order => `
            <tr>
                <td>${order.orderNo}</td>
                <td>${order.productTitle}</td>
                <td>${order.openid}</td>
                <td>${order.travelDate}</td>
                <td>¥${order.totalPrice}</td>
                <td><span class="status-badge status-${order.status}">${CONFIG.statusMap[order.status] || order.status}</span></td>
                <td>${new Date(order.createTime).toLocaleDateString()}</td>
                <td>
                    <button class="btn btn-secondary" onclick="app.viewOrder('${order._id}')">查看</button>
                </td>
            </tr>
        `).join('');
    }

    // 创建订单图表
    createOrderChart() {
        const ctx = document.getElementById('orderChart');
        if (!ctx) return;

        // 销毁旧图表
        if (this.charts.orderChart) {
            this.charts.orderChart.destroy();
        }

        this.charts.orderChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: ['1月', '2月', '3月', '4月', '5月', '6月'],
                datasets: [{
                    label: '订单数量',
                    data: [12, 19, 3, 5, 2, 3],
                    borderColor: '#4b6e58',
                    backgroundColor: 'rgba(75, 110, 88, 0.1)',
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'top',
                    }
                }
            }
        });
    }

    // 创建产品分布图表
    createProductChart() {
        const ctx = document.getElementById('productChart');
        if (!ctx) return;

        // 销毁旧图表
        if (this.charts.productChart) {
            this.charts.productChart.destroy();
        }

        this.charts.productChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['海南', '云南', '四川', '西藏', '新疆'],
                datasets: [{
                    data: [5, 8, 6, 4, 3],
                    backgroundColor: [
                        '#4b6e58',
                        '#6b8e78',
                        '#8baa8a',
                        '#adc69c',
                        '#cfe2ae'
                    ]
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'bottom',
                    }
                }
            }
        });
    }

    // 模态框相关方法
    openModal(title, content) {
        document.getElementById('modal-title').textContent = title;
        document.getElementById('modal-body').innerHTML = content;
        document.getElementById('modal').style.display = 'block';
    }

    closeModal() {
        document.getElementById('modal').style.display = 'none';
        this.editingItem = null; // 清除编辑状态
    }

    // 编辑产品
    async editProduct(id) {
        try {
            console.log('编辑产品:', id);
            const product = await api.getProductById(id);
            
            if (!product) {
                showMessage('产品不存在', 'error');
                return;
            }
            
            this.editingItem = product;
            console.log('编辑产品数据:', product);
            console.log('行程安排数据:', product.itinerary);
            this.openProductModal(product);
        } catch (error) {
            console.error('获取产品详情失败:', error);
            showMessage('获取产品详情失败', 'error');
        }
    }

    // 删除产品
    async deleteProduct(id) {
        if (confirm('确认删除这个产品吗？')) {
            try {
                await api.deleteProduct(id);
                this.loadProducts();
                showMessage('产品删除成功！', 'success');
            } catch (error) {
                console.error('删除产品失败:', error);
                showMessage('产品删除失败！', 'error');
            }
        }
    }

    // 编辑区域
    async editRegion(id) {
        try {
            console.log('编辑区域:', id);
            const region = await api.getRegionById(id);
            
            if (!region) {
                showMessage('区域不存在', 'error');
                return;
            }
            
            this.editingItem = region;
            this.openRegionModal(region);
        } catch (error) {
            console.error('获取区域详情失败:', error);
            showMessage('获取区域详情失败', 'error');
        }
    }

    // 删除区域
    async deleteRegion(id) {
        if (confirm('确认删除这个区域吗？')) {
            try {
                await api.deleteRegion(id);
                this.loadRegions();
                showMessage('区域删除成功！', 'success');
            } catch (error) {
                console.error('删除区域失败:', error);
                showMessage('区域删除失败！', 'error');
            }
        }
    }

    // 编辑轮播图
    async editBanner(id) {
        try {
            console.log('编辑轮播图:', id);
            const banner = await api.getBannerById(id);
            
            if (!banner) {
                showMessage('轮播图不存在', 'error');
                return;
            }
            
            this.editingItem = banner;
            this.openBannerModal(banner);
        } catch (error) {
            console.error('获取轮播图详情失败:', error);
            showMessage('获取轮播图详情失败', 'error');
        }
    }

    // 删除轮播图
    async deleteBanner(id) {
        if (confirm('确认删除这个轮播图吗？')) {
            try {
                await api.deleteBanner(id);
                this.loadBanners();
                showMessage('轮播图删除成功！', 'success');
            } catch (error) {
                console.error('删除轮播图失败:', error);
                showMessage('轮播图删除失败！', 'error');
            }
        }
    }

    // 查看订单
    async viewOrder(id) {
        try {
            console.log('查看订单:', id);
            const order = await api.getOrderById(id);
            
            if (!order) {
                showMessage('订单不存在', 'error');
                return;
            }
            
            this.openOrderDetailModal(order);
        } catch (error) {
            console.error('获取订单详情失败:', error);
            showMessage('获取订单详情失败', 'error');
        }
    }

    // 打开产品模态框
    openProductModal(product = null) {
        const isEditing = !!product;
        const content = `
            <form id="product-form">
                <!-- 基本信息 -->
                <div class="form-section">
                    <h3>基本信息</h3>
                    <div class="form-group">
                        <label>产品名称 *</label>
                        <input type="text" id="product-title" value="${product?.title || ''}" required>
                    </div>
                    <div class="form-group">
                        <label>产品描述 *</label>
                        <textarea id="product-description" rows="3" required>${product?.description || ''}</textarea>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label>成人基础价格 *</label>
                            <input type="number" id="product-adult-price" value="${product?.adultPrice || ''}" required>
                        </div>
                        <div class="form-group">
                            <label>儿童基础价格</label>
                            <input type="number" id="product-child-price" value="${product?.childPrice || ''}">
                        </div>
                    </div>
                    <div class="form-group">
                        <label>所属区域 *</label>
                        <select id="product-region" required>
                            <option value="">请选择区域</option>
                            <option value="北疆" ${product?.region === '北疆' ? 'selected' : ''}>北疆</option>
                            <option value="南疆" ${product?.region === '南疆' ? 'selected' : ''}>南疆</option>
                            <option value="内蒙" ${product?.region === '内蒙' ? 'selected' : ''}>内蒙</option>
                            <option value="东北" ${product?.region === '东北' ? 'selected' : ''}>东北</option>
                            <option value="海南" ${product?.region === '海南' ? 'selected' : ''}>海南</option>
                            <option value="云南" ${product?.region === '云南' ? 'selected' : ''}>云南</option>
                            <option value="四川" ${product?.region === '四川' ? 'selected' : ''}>四川</option>
                            <option value="湖南" ${product?.region === '湖南' ? 'selected' : ''}>湖南</option>
                            <option value="西藏" ${product?.region === '西藏' ? 'selected' : ''}>西藏</option>
                            <option value="新疆" ${product?.region === '新疆' ? 'selected' : ''}>新疆</option>
                            <option value="北京" ${product?.region === '北京' ? 'selected' : ''}>北京</option>
                            <option value="上海" ${product?.region === '上海' ? 'selected' : ''}>上海</option>
                        </select>
                    </div>
                    
                    <!-- 标签管理 -->
                    <div class="form-group">
                        <label>产品标签</label>
                        <div class="tags-container">
                            <div class="tags-list" id="tags-list">
                                ${(product?.tags || []).map(tag => `
                                    <span class="tag-item">
                                        <span class="tag-text">${tag}</span>
                                        <span class="tag-remove" onclick="removeTag(this)">×</span>
                                    </span>
                                `).join('')}
                            </div>
                            <div class="tag-input-container">
                                <input type="text" id="new-tag" placeholder="输入标签后按回车添加" onkeypress="addTagOnEnter(event)">
                                <button type="button" class="btn btn-secondary" onclick="addTag()">添加</button>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- 主图管理 -->
                <div class="form-section">
                    <h3>主图管理</h3>
                    <div class="form-group">
                        <label>主图上传</label>
                        <div class="image-upload-container">
                            <input type="file" id="main-images-upload" multiple accept="image/*" style="display: none;">
                            <button type="button" class="btn btn-secondary" onclick="document.getElementById('main-images-upload').click()">
                                <i class="fas fa-upload"></i> 选择主图
                            </button>
                            <span class="upload-tip">支持多张图片，建议尺寸 800x600 像素</span>
                        </div>
                        <div id="main-images-preview" class="images-preview">
                            ${(product?.images || []).map((img, index) => `
                                <div class="image-preview-item">
                                    <img src="${img}" alt="主图${index + 1}" onerror="this.style.display='none'">
                                    <span class="image-name">${img.split('/').pop() || '主图 ' + (index + 1)}</span>
                                    <button type="button" class="btn btn-danger btn-sm" onclick="removeImage('main-images-preview', ${index})">删除</button>
                                </div>
                            `).join('')}
                        </div>
                        <div class="form-group">
                            <label>主图URL（手动输入，用逗号分隔）</label>
                            <textarea id="product-images" rows="2" placeholder="请输入图片URL，多个图片用逗号分隔">${(product?.images || []).join(', ')}</textarea>
                        </div>
                    </div>
                    <div class="form-group">
                        <label>封面图片URL（兼容旧版本）</label>
                        <input type="url" id="product-cover-image" value="${product?.coverImage || ''}" placeholder="请输入图片URL">
                    </div>
                </div>

                <!-- 详情图片管理 -->
                <div class="form-section">
                    <h3>详情图片</h3>
                    <div class="form-group">
                        <label>详情图片上传</label>
                        <div class="image-upload-container">
                            <input type="file" id="detail-images-upload" multiple accept="image/*" style="display: none;">
                            <button type="button" class="btn btn-secondary" onclick="document.getElementById('detail-images-upload').click()">
                                <i class="fas fa-upload"></i> 选择详情图片
                            </button>
                            <span class="upload-tip">支持多张图片</span>
                        </div>
                        <div id="detail-images-preview" class="images-preview">
                            ${(product?.detailImages || []).map((img, index) => `
                                <div class="image-preview-item">
                                    <img src="${img}" alt="详情图${index + 1}" onerror="this.style.display='none'">
                                    <span class="image-name">${img.split('/').pop() || '详情图片 ' + (index + 1)}</span>
                                    <button type="button" class="btn btn-danger btn-sm" onclick="removeImage('detail-images-preview', ${index})">删除</button>
                                </div>
                            `).join('')}
                        </div>
                        <div class="form-group">
                            <label>详情图片URL（手动输入，用逗号分隔）</label>
                            <textarea id="product-detail-images" rows="2" placeholder="请输入详情图片URL，多个图片用逗号分隔">${(product?.detailImages || []).join(', ')}</textarea>
                        </div>
                    </div>
                </div>

                <!-- 行程安排管理 -->
                <div class="form-section">
                    <h3>行程安排</h3>
                    <div class="itinerary-container">
                        <button type="button" class="btn btn-secondary" onclick="addItineraryItem()">添加行程</button>
                        <div id="itinerary-list">
                            ${(product?.itinerary || []).map((item, index) => {
                                let displayText = '';
                                if (typeof item === 'string') {
                                    displayText = item;
                                } else if (typeof item === 'object' && item !== null) {
                                    // 如果是对象，尝试提取有用的信息
                                    if (item.content) {
                                        displayText = item.content;
                                    } else if (item.description) {
                                        displayText = item.description;
                                    } else if (item.day) {
                                        displayText = `第${item.day}天：${item.content || item.description || ''}`;
                                    } else {
                                        displayText = JSON.stringify(item);
                                    }
                                } else {
                                    displayText = String(item);
                                }
                                return `
                                    <div class="itinerary-item">
                                        <label>第${index + 1}天:</label>
                                        <textarea class="itinerary-content" rows="2" placeholder="请输入行程安排">${displayText}</textarea>
                                        <button type="button" class="btn btn-danger" onclick="removeItineraryItem(this)">删除</button>
                                    </div>
                                `;
                            }).join('')}
                        </div>
                    </div>
                </div>

                <!-- 费用说明管理 -->
                <div class="form-section">
                    <h3>费用说明</h3>
                    <div class="fees-container">
                        <button type="button" class="btn btn-secondary" onclick="addFeeItem('包含')">添加包含费用</button>
                        <button type="button" class="btn btn-secondary" onclick="addFeeItem('不包含')">添加不包含费用</button>
                        <div id="fees-list">
                            ${(product?.fees || []).map((fee, index) => `
                                <div class="fee-item">
                                    <label>${fee.type}:</label>
                                    <input type="text" class="fee-description" value="${fee.description}" placeholder="请输入费用说明">
                                    <button type="button" class="btn btn-danger" onclick="removeFeeItem(this)">删除</button>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>

                <!-- 预订须知管理 -->
                <div class="form-section">
                    <h3>预订须知</h3>
                    <div class="notices-container">
                        <button type="button" class="btn btn-secondary" onclick="addNoticeItem()">添加须知</button>
                        <div id="notices-list">
                            ${(product?.notices || []).map((notice, index) => `
                                <div class="notice-item">
                                    <label>须知${index + 1}:</label>
                                    <textarea class="notice-content" rows="2" placeholder="请输入预订须知">${notice}</textarea>
                                    <button type="button" class="btn btn-danger" onclick="removeNoticeItem(this)">删除</button>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>

                <!-- 价格日历管理 -->
                <div class="form-section">
                    <h3>价格日历管理</h3>
                    <div class="calendar-controls">
                        <button type="button" class="btn btn-secondary" onclick="addCalendarDate()">
                            <i class="fas fa-plus"></i> 添加日期
                        </button>
                        <button type="button" class="btn btn-secondary" onclick="batchSetCalendar()">
                            <i class="fas fa-calendar"></i> 批量设置
                        </button>
                    </div>
                    <div id="calendar-dates-list">
                        ${Object.entries(product?.priceCalendar || {}).map(([date, priceData]) => `
                            <div class="calendar-date-item">
                                <div class="date-inputs">
                                    <input type="date" class="calendar-date" value="${date}" onchange="updateCalendarDate(this)">
                                    <input type="number" class="calendar-adult-price" placeholder="成人价" value="${priceData.adultPrice || ''}" onchange="updateCalendarPrice(this)">
                                    <input type="number" class="calendar-child-price" placeholder="儿童价" value="${priceData.childPrice || ''}" onchange="updateCalendarPrice(this)">
                                    <label class="calendar-available">
                                        <input type="checkbox" ${priceData.available !== false ? 'checked' : ''} onchange="updateCalendarAvailable(this)">
                                        可售
                                    </label>
                                </div>
                                <button type="button" class="btn btn-danger btn-sm" onclick="removeCalendarDate(this)">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </div>
                        `).join('')}
                    </div>
                    <div class="form-group">
                        <label>价格日历数据（JSON格式，自动生成）</label>
                        <textarea id="product-price-calendar" rows="3" readonly>${JSON.stringify(product?.priceCalendar || {}, null, 2)}</textarea>
                        <small>此字段会根据上方的日期设置自动更新</small>
                    </div>
                </div>

                <div class="form-group">
                    <label>状态</label>
                    <select id="product-status">
                        <option value="active" ${product?.status === 'active' ? 'selected' : ''}>启用</option>
                        <option value="inactive" ${product?.status === 'inactive' ? 'selected' : ''}>禁用</option>
                    </select>
                </div>
                
                <div class="form-actions">
                    <button type="submit" class="btn btn-primary">${isEditing ? '更新' : '保存'}</button>
                    <button type="button" class="btn btn-secondary" onclick="app.closeModal()">取消</button>
                </div>
            </form>
        `;
        
        this.openModal(isEditing ? '编辑产品' : '添加产品', content);
        
        // 绑定表单提交事件
        document.getElementById('product-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.saveProduct();
        });
        
        // 初始化图片上传功能
        setTimeout(() => {
            setupImageUpload();
        }, 100);
    }

    // 打开区域模态框
    openRegionModal(region = null) {
        const isEditing = !!region;
        const content = `
            <form id="region-form">
                <div class="form-group">
                    <label>区域名称 *</label>
                    <input type="text" id="region-name" value="${region?.name || ''}" required>
                </div>
                <div class="form-group">
                    <label>区域图片</label>
                    <input type="url" id="region-image" value="${region?.imageUrl || ''}" placeholder="请输入图片URL">
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>产品数量</label>
                        <input type="number" id="region-product-count" value="${region?.productCount || 0}">
                    </div>
                    <div class="form-group">
                        <label>排序</label>
                        <input type="number" id="region-sort" value="${region?.sort || 0}">
                    </div>
                </div>
                <div class="form-group">
                    <label>是否热门</label>
                    <select id="region-is-hot">
                        <option value="true" ${region?.isHot ? 'selected' : ''}>是</option>
                        <option value="false" ${!region?.isHot ? 'selected' : ''}>否</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>状态</label>
                    <select id="region-status">
                        <option value="active" ${region?.status === 'active' ? 'selected' : ''}>启用</option>
                        <option value="inactive" ${region?.status === 'inactive' ? 'selected' : ''}>禁用</option>
                    </select>
                </div>
                <div class="form-actions">
                    <button type="submit" class="btn btn-primary">${isEditing ? '更新' : '保存'}</button>
                    <button type="button" class="btn btn-secondary" onclick="app.closeModal()">取消</button>
                </div>
            </form>
        `;
        
        this.openModal(isEditing ? '编辑区域' : '添加区域', content);
        
        document.getElementById('region-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.saveRegion();
        });
    }

    // 打开轮播图模态框
    openBannerModal(banner = null) {
        const isEditing = !!banner;
        const content = `
            <form id="banner-form">
                <div class="form-group">
                    <label>轮播图标题 *</label>
                    <input type="text" id="banner-title" value="${banner?.title || ''}" required>
                </div>
                <div class="form-group">
                    <label>轮播图图片 *</label>
                    <input type="url" id="banner-image" value="${banner?.imageUrl || ''}" placeholder="请输入图片URL" required>
                </div>
                <div class="form-group">
                    <label>排序</label>
                    <input type="number" id="banner-sort" value="${banner?.sort || 0}">
                </div>
                <div class="form-group">
                    <label>状态</label>
                    <select id="banner-status">
                        <option value="active" ${banner?.status === 'active' ? 'selected' : ''}>启用</option>
                        <option value="inactive" ${banner?.status === 'inactive' ? 'selected' : ''}>禁用</option>
                    </select>
                </div>
                <div class="form-actions">
                    <button type="submit" class="btn btn-primary">${isEditing ? '更新' : '保存'}</button>
                    <button type="button" class="btn btn-secondary" onclick="app.closeModal()">取消</button>
                </div>
            </form>
        `;
        
        this.openModal(isEditing ? '编辑轮播图' : '添加轮播图', content);
        
        document.getElementById('banner-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.saveBanner();
        });
    }

    // 打开订单详情模态框
    openOrderDetailModal(order) {
        const content = `
            <div class="order-detail">
                <div class="detail-row">
                    <label>订单号:</label>
                    <span>${order.orderNo}</span>
                </div>
                <div class="detail-row">
                    <label>产品名称:</label>
                    <span>${order.productTitle}</span>
                </div>
                <div class="detail-row">
                    <label>用户ID:</label>
                    <span>${order.openid}</span>
                </div>
                <div class="detail-row">
                    <label>出行日期:</label>
                    <span>${order.travelDate}</span>
                </div>
                <div class="detail-row">
                    <label>成人数量:</label>
                    <span>${order.adultCount}</span>
                </div>
                <div class="detail-row">
                    <label>儿童数量:</label>
                    <span>${order.childCount}</span>
                </div>
                <div class="detail-row">
                    <label>总价:</label>
                    <span>¥${order.totalPrice}</span>
                </div>
                <div class="detail-row">
                    <label>状态:</label>
                    <span class="status-badge status-${order.status}">${CONFIG.statusMap[order.status] || order.status}</span>
                </div>
                <div class="detail-row">
                    <label>创建时间:</label>
                    <span>${new Date(order.createTime).toLocaleString()}</span>
                </div>
                <div class="form-actions">
                    <button type="button" class="btn btn-secondary" onclick="app.closeModal()">关闭</button>
                </div>
            </div>
        `;
        
        this.openModal('订单详情', content);
    }

    // 保存产品
    async saveProduct() {
        // 收集标签数据
        const tags = Array.from(document.getElementById('tags-list').querySelectorAll('.tag-text')).map(el => el.textContent);
        
        // 收集图片数据
        const images = document.getElementById('product-images').value.split(',').map(img => img.trim()).filter(img => img);
        const detailImages = document.getElementById('product-detail-images').value.split(',').map(img => img.trim()).filter(img => img);
        
        // 收集行程数据
        const itinerary = Array.from(document.getElementById('itinerary-list').querySelectorAll('.itinerary-content')).map(el => el.value);
        console.log('收集到的行程数据:', itinerary);
        
        // 收集费用数据
        const fees = Array.from(document.getElementById('fees-list').querySelectorAll('.fee-item')).map(item => ({
            type: item.querySelector('label').textContent.replace(':', '').trim(),
            description: item.querySelector('.fee-description').value
        }));
        
        // 收集须知数据
        const notices = Array.from(document.getElementById('notices-list').querySelectorAll('.notice-content')).map(el => el.value);
        
        // 解析价格日历数据
        let priceCalendar = {};
        try {
            priceCalendar = JSON.parse(document.getElementById('product-price-calendar').value);
        } catch (e) {
            console.warn('价格日历数据格式错误，使用空对象');
            priceCalendar = {};
        }
        
        const formData = {
            title: document.getElementById('product-title').value,
            description: document.getElementById('product-description').value,
            adultPrice: parseInt(document.getElementById('product-adult-price').value),
            childPrice: parseInt(document.getElementById('product-child-price').value),
            region: document.getElementById('product-region').value,
            coverImage: document.getElementById('product-cover-image').value,
            tags: tags,
            images: images,
            detailImages: detailImages,
            itinerary: itinerary,
            fees: fees,
            notices: notices,
            priceCalendar: priceCalendar,
            status: document.getElementById('product-status').value
        };

        try {
            if (this.editingItem) {
                // 更新产品
                await api.updateProduct(this.editingItem._id, formData);
                showMessage('产品更新成功！', 'success');
            } else {
                // 创建产品
                await api.createProduct(formData);
                showMessage('产品创建成功！', 'success');
            }
            
            this.closeModal();
            this.loadProducts();
        } catch (error) {
            console.error('保存产品失败:', error);
            showMessage('保存产品失败！', 'error');
        }
    }

    // 保存区域
    async saveRegion() {
        const formData = {
            name: document.getElementById('region-name').value,
            imageUrl: document.getElementById('region-image').value,
            productCount: parseInt(document.getElementById('region-product-count').value),
            sort: parseInt(document.getElementById('region-sort').value),
            isHot: document.getElementById('region-is-hot').value === 'true',
            status: document.getElementById('region-status').value
        };

        try {
            if (this.editingItem) {
                // 更新区域
                await api.updateRegion(this.editingItem._id, formData);
                showMessage('区域更新成功！', 'success');
            } else {
                // 创建区域
                await api.createRegion(formData);
                showMessage('区域创建成功！', 'success');
            }
            
            this.closeModal();
            this.loadRegions();
        } catch (error) {
            console.error('保存区域失败:', error);
            showMessage('保存区域失败！', 'error');
        }
    }

    // 保存轮播图
    async saveBanner() {
        const formData = {
            title: document.getElementById('banner-title').value,
            imageUrl: document.getElementById('banner-image').value,
            sort: parseInt(document.getElementById('banner-sort').value),
            status: document.getElementById('banner-status').value
        };

        try {
            if (this.editingItem) {
                // 更新轮播图
                await api.updateBanner(this.editingItem._id, formData);
                showMessage('轮播图更新成功！', 'success');
            } else {
                // 创建轮播图
                await api.createBanner(formData);
                showMessage('轮播图创建成功！', 'success');
            }
            
            this.closeModal();
            this.loadBanners();
        } catch (error) {
            console.error('保存轮播图失败:', error);
            showMessage('保存轮播图失败！', 'error');
        }
    }
}

// 全局函数
function openProductModal() {
    app.openProductModal();
}

function openRegionModal() {
    app.openRegionModal();
}

function openBannerModal() {
    app.openBannerModal();
}

// 设置相关函数
function saveSettings() {
    console.log('保存设置');
    const envId = document.getElementById('env-id');
    const apiKey = document.getElementById('api-key');
    
    if (envId) CONFIG.envId = envId.value;
    if (apiKey) CONFIG.apiKey = apiKey.value;
    
    saveConfig();
    showMessage('设置保存成功！', 'success');
}

// 消息提示函数
function showMessage(message, type = 'info') {
    console.log('显示消息:', message, type);
    
    // 创建消息元素
    const messageEl = document.createElement('div');
    messageEl.className = `message message-${type}`;
    messageEl.textContent = message;
    messageEl.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        border-radius: 8px;
        color: white;
        font-weight: 500;
        z-index: 10000;
        transform: translateX(100%);
        transition: transform 0.3s ease;
        ${type === 'success' ? 'background: #28a745;' : 
          type === 'error' ? 'background: #dc3545;' : 
          type === 'warning' ? 'background: #ffc107; color: #333;' :
          'background: #17a2b8;'}
    `;
    
    // 添加到页面
    document.body.appendChild(messageEl);
    
    // 显示动画
    setTimeout(() => {
        messageEl.style.transform = 'translateX(0)';
    }, 100);
    
    // 自动隐藏
    setTimeout(() => {
        messageEl.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (document.body.contains(messageEl)) {
                document.body.removeChild(messageEl);
            }
        }, 300);
    }, 3000);
}

// 初始化应用
console.log('开始初始化应用...');
const app = new AdminApp();
console.log('应用初始化完成');

// 标签管理函数
function addTag() {
    const input = document.getElementById('new-tag');
    const tag = input.value.trim();
    if (!tag) return;
    
    const tagsList = document.getElementById('tags-list');
    const tagItem = document.createElement('span');
    tagItem.className = 'tag-item';
    tagItem.innerHTML = `
        <span class="tag-text">${tag}</span>
        <span class="tag-remove" onclick="removeTag(this)">×</span>
    `;
    tagsList.appendChild(tagItem);
    input.value = '';
}

function addTagOnEnter(event) {
    if (event.key === 'Enter') {
        event.preventDefault();
        addTag();
    }
}

function removeTag(element) {
    element.closest('.tag-item').remove();
}

// 行程安排管理函数
function addItineraryItem() {
    const itineraryList = document.getElementById('itinerary-list');
    const items = itineraryList.querySelectorAll('.itinerary-item');
    const dayNumber = items.length + 1;
    
    const item = document.createElement('div');
    item.className = 'itinerary-item';
    item.innerHTML = `
        <label>第${dayNumber}天:</label>
        <textarea class="itinerary-content" rows="2" placeholder="请输入行程安排"></textarea>
        <button type="button" class="btn btn-danger" onclick="removeItineraryItem(this)">删除</button>
    `;
    itineraryList.appendChild(item);
}

function removeItineraryItem(element) {
    element.closest('.itinerary-item').remove();
    // 重新编号
    const items = document.getElementById('itinerary-list').querySelectorAll('.itinerary-item');
    items.forEach((item, index) => {
        item.querySelector('label').textContent = `第${index + 1}天:`;
    });
}

// 费用说明管理函数
function addFeeItem(type) {
    const feesList = document.getElementById('fees-list');
    
    const item = document.createElement('div');
    item.className = 'fee-item';
    item.innerHTML = `
        <label>${type}:</label>
        <input type="text" class="fee-description" placeholder="请输入费用说明">
        <button type="button" class="btn btn-danger" onclick="removeFeeItem(this)">删除</button>
    `;
    feesList.appendChild(item);
}

function removeFeeItem(element) {
    element.closest('.fee-item').remove();
}

// 预订须知管理函数
function addNoticeItem() {
    const noticesList = document.getElementById('notices-list');
    const items = noticesList.querySelectorAll('.notice-item');
    const noticeNumber = items.length + 1;
    
    const item = document.createElement('div');
    item.className = 'notice-item';
    item.innerHTML = `
        <label>须知${noticeNumber}:</label>
        <textarea class="notice-content" rows="2" placeholder="请输入预订须知"></textarea>
        <button type="button" class="btn btn-danger" onclick="removeNoticeItem(this)">删除</button>
    `;
    noticesList.appendChild(item);
}

function removeNoticeItem(element) {
    element.closest('.notice-item').remove();
    // 重新编号
    const items = document.getElementById('notices-list').querySelectorAll('.notice-item');
    items.forEach((item, index) => {
        item.querySelector('label').textContent = `须知${index + 1}:`;
    });
}

// 图片上传和管理函数
function setupImageUpload() {
    // 主图上传
    const mainImagesUpload = document.getElementById('main-images-upload');
    if (mainImagesUpload) {
        mainImagesUpload.addEventListener('change', function(e) {
            handleImageUpload(e.target.files, 'main-images-preview', 'product-images');
        });
    }
    
    // 详情图片上传
    const detailImagesUpload = document.getElementById('detail-images-upload');
    if (detailImagesUpload) {
        detailImagesUpload.addEventListener('change', function(e) {
            handleImageUpload(e.target.files, 'detail-images-preview', 'product-detail-images');
        });
    }
}

function handleImageUpload(files, previewId, textareaId) {
    const preview = document.getElementById(previewId);
    const textarea = document.getElementById(textareaId);
    
    Array.from(files).forEach((file, index) => {
        const reader = new FileReader();
        reader.onload = function(e) {
            const imageUrl = e.target.result;
            
            // 添加到预览
            const previewItem = document.createElement('div');
            previewItem.className = 'image-preview-item';
            previewItem.innerHTML = `
                <img src="${imageUrl}" alt="上传图片${index + 1}">
                <span class="image-name">${file.name}</span>
                <button type="button" class="btn btn-danger btn-sm" onclick="removeImage('${previewId}', this)">删除</button>
            `;
            preview.appendChild(previewItem);
            
            // 更新文本框
            const currentUrls = textarea.value.split(',').map(url => url.trim()).filter(url => url);
            currentUrls.push(imageUrl);
            textarea.value = currentUrls.join(', ');
        };
        reader.readAsDataURL(file);
    });
}

function removeImage(previewId, element) {
    const preview = document.getElementById(previewId);
    const textarea = previewId === 'main-images-preview' ? 'product-images' : 'product-detail-images';
    const textareaElement = document.getElementById(textarea);
    
    const imageItem = element.closest('.image-preview-item');
    const imageSrc = imageItem.querySelector('img').src;
    
    // 从预览中删除
    imageItem.remove();
    
    // 从文本框中删除对应的URL
    const currentUrls = textareaElement.value.split(',').map(url => url.trim()).filter(url => url !== imageSrc);
    textareaElement.value = currentUrls.join(', ');
}

// 价格日历管理函数
function addCalendarDate() {
    const calendarList = document.getElementById('calendar-dates-list');
    const dateItem = document.createElement('div');
    dateItem.className = 'calendar-date-item';
    dateItem.innerHTML = `
        <div class="date-inputs">
            <input type="date" class="calendar-date" onchange="updateCalendarDate(this)">
            <input type="number" class="calendar-adult-price" placeholder="成人价" onchange="updateCalendarPrice(this)">
            <input type="number" class="calendar-child-price" placeholder="儿童价" onchange="updateCalendarPrice(this)">
            <label class="calendar-available">
                <input type="checkbox" checked onchange="updateCalendarAvailable(this)">
                可售
            </label>
        </div>
        <button type="button" class="btn btn-danger btn-sm" onclick="removeCalendarDate(this)">
            <i class="fas fa-trash"></i>
        </button>
    `;
    calendarList.appendChild(dateItem);
    updateCalendarJSON();
}

function removeCalendarDate(element) {
    element.closest('.calendar-date-item').remove();
    updateCalendarJSON();
}

function updateCalendarDate(element) {
    updateCalendarJSON();
}

function updateCalendarPrice(element) {
    updateCalendarJSON();
}

function updateCalendarAvailable(element) {
    updateCalendarJSON();
}

function updateCalendarJSON() {
    const calendarList = document.getElementById('calendar-dates-list');
    const textarea = document.getElementById('product-price-calendar');
    const calendarData = {};
    
    calendarList.querySelectorAll('.calendar-date-item').forEach(item => {
        const date = item.querySelector('.calendar-date').value;
        const adultPrice = item.querySelector('.calendar-adult-price').value;
        const childPrice = item.querySelector('.calendar-child-price').value;
        const available = item.querySelector('.calendar-available input').checked;
        
        if (date) {
            calendarData[date] = {
                adultPrice: adultPrice ? parseInt(adultPrice) : '',
                childPrice: childPrice ? parseInt(childPrice) : '',
                available: available
            };
        }
    });
    
    textarea.value = JSON.stringify(calendarData, null, 2);
}

function batchSetCalendar() {
    const startDate = prompt('请输入开始日期 (YYYY-MM-DD):');
    const endDate = prompt('请输入结束日期 (YYYY-MM-DD):');
    const adultPrice = prompt('请输入成人价格:');
    const childPrice = prompt('请输入儿童价格:');
    
    if (!startDate || !endDate || !adultPrice) {
        alert('请填写完整信息');
        return;
    }
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    const calendarList = document.getElementById('calendar-dates-list');
    
    // 清空现有日期
    calendarList.innerHTML = '';
    
    // 添加日期范围
    for (let date = new Date(start); date <= end; date.setDate(date.getDate() + 1)) {
        const dateStr = date.toISOString().split('T')[0];
        const dateItem = document.createElement('div');
        dateItem.className = 'calendar-date-item';
        dateItem.innerHTML = `
            <div class="date-inputs">
                <input type="date" class="calendar-date" value="${dateStr}" onchange="updateCalendarDate(this)">
                <input type="number" class="calendar-adult-price" placeholder="成人价" value="${adultPrice}" onchange="updateCalendarPrice(this)">
                <input type="number" class="calendar-child-price" placeholder="儿童价" value="${childPrice || ''}" onchange="updateCalendarPrice(this)">
                <label class="calendar-available">
                    <input type="checkbox" checked onchange="updateCalendarAvailable(this)">
                    可售
                </label>
            </div>
            <button type="button" class="btn btn-danger btn-sm" onclick="removeCalendarDate(this)">
                <i class="fas fa-trash"></i>
            </button>
        `;
        calendarList.appendChild(dateItem);
    }
    
    updateCalendarJSON();
}

// 刷新同步的Token
function refreshSyncedToken() {
    try {
        const syncedToken = localStorage.getItem('apiKey');
        const syncTime = localStorage.getItem('token_sync_time');
        
        if (syncedToken && syncTime) {
            // 更新系统设置页面的API密钥输入框
            const apiKeyInput = document.getElementById('api-key');
            if (apiKeyInput) {
                apiKeyInput.value = syncedToken;
            }
            
            // 更新配置
            CONFIG.apiKey = syncedToken;
            
            // 显示同步状态
            const syncTimeDate = new Date(parseInt(syncTime));
            const timeDiff = Math.floor((Date.now() - parseInt(syncTime)) / 1000 / 60); // 分钟
            
            const statusElement = document.getElementById('token-sync-status');
            if (statusElement) {
                if (timeDiff < 120) { // 2小时内
                    statusElement.innerHTML = `<span style="color: #28a745;">✓ Token已同步 (${timeDiff}分钟前)</span>`;
                } else {
                    statusElement.innerHTML = `<span style="color: #ffc107;">⚠ Token同步时间较久 (${timeDiff}分钟前)，建议重新获取</span>`;
                }
            }
            
            showMessage(`Token已刷新 (${timeDiff}分钟前同步)`, 'success');
        } else {
            showMessage('没有找到同步的Token', 'warning');
        }
    } catch (error) {
        console.error('刷新同步Token失败:', error);
        showMessage('刷新Token失败', 'error');
    }
}

// Token配置相关函数
function saveTokenConfig() {
    const appId = document.getElementById('appId').value.trim();
    const appSecret = document.getElementById('appSecret').value.trim();
    
    if (!appId || !appSecret) {
        showMessage('请填写完整的AppID和AppSecret', 'error');
        return;
    }
    
    localStorage.setItem('appId', appId);
    localStorage.setItem('appSecret', appSecret);
    
    if (typeof tokenManager !== 'undefined') {
        tokenManager.appId = appId;
        tokenManager.appSecret = appSecret;
    }
    
    showMessage('配置保存成功！', 'success');
}

async function testToken() {
    try {
        showMessage('正在测试Token获取...', 'info');
        
        if (typeof tokenManager !== 'undefined') {
            const token = await tokenManager.getAccessToken();
            
            if (token) {
                showMessage(`Token获取成功！\nToken: ${token.substring(0, 20)}...`, 'success');
                refreshTokenStatus();
                // 自动同步到系统设置
                await syncToSettings();
            } else {
                showMessage('Token获取失败，请检查配置', 'error');
            }
        } else {
            showMessage('Token管理器未初始化', 'error');
        }
    } catch (error) {
        showMessage(`Token获取失败: ${error.message}`, 'error');
    }
}

function clearToken() {
    if (typeof tokenManager !== 'undefined') {
        tokenManager.clearToken();
    }
    showMessage('Token已清除', 'success');
    refreshTokenStatus();
    updateSyncStatus('未同步', 'sync-pending');
}

function refreshTokenStatus() {
    if (typeof tokenManager === 'undefined') {
        return;
    }
    
    const currentToken = tokenManager.accessToken;
    const expireTime = tokenManager.tokenExpireTime;
    
    if (currentToken) {
        document.getElementById('currentToken').textContent = currentToken.substring(0, 20) + '...';
        document.getElementById('fullToken').textContent = currentToken;
        document.getElementById('expireTime').textContent = new Date(expireTime).toLocaleString();
        
        if (Date.now() < expireTime) {
            document.getElementById('tokenStatus').textContent = '有效';
            document.getElementById('tokenStatus').style.color = '#28a745';
        } else {
            document.getElementById('tokenStatus').textContent = '已过期';
            document.getElementById('tokenStatus').style.color = '#dc3545';
        }
    } else {
        document.getElementById('currentToken').textContent = '未设置';
        document.getElementById('fullToken').textContent = '未设置';
        document.getElementById('expireTime').textContent = '未设置';
        document.getElementById('tokenStatus').textContent = '未获取';
        document.getElementById('tokenStatus').style.color = '#6c757d';
    }
}

let autoRefreshInterval = null;

function startAutoRefresh() {
    if (autoRefreshInterval) {
        clearInterval(autoRefreshInterval);
    }
    
    // 立即执行一次
    autoRefreshToken();
    
    // 每5分钟自动更新一次
    autoRefreshInterval = setInterval(autoRefreshToken, 5 * 60 * 1000);
    
    showMessage('自动更新已启动，每5分钟更新一次token', 'success');
}

function stopAutoRefresh() {
    if (autoRefreshInterval) {
        clearInterval(autoRefreshInterval);
        autoRefreshInterval = null;
        showMessage('自动更新已停止', 'info');
    }
}

async function autoRefreshToken() {
    try {
        console.log('自动更新token...');
        if (typeof tokenManager !== 'undefined') {
            const token = await tokenManager.getAccessToken();
            if (token) {
                refreshTokenStatus();
                console.log('token自动更新成功');
                // 自动同步到系统设置
                await syncToSettings();
            }
        }
    } catch (error) {
        console.error('自动更新token失败:', error);
    }
}

async function syncToSettings() {
    if (typeof tokenManager === 'undefined') {
        return;
    }
    
    const token = tokenManager.accessToken;
    if (!token) {
        showMessage('没有可同步的Token', 'error');
        updateSyncStatus('同步失败', 'sync-error');
        return;
    }

    try {
        updateSyncStatus('同步中...', 'sync-pending');
        
        // 保存到localStorage，供主页面使用
        localStorage.setItem('apiKey', token);
        
        // 如果主页面存在，直接更新
        if (window.parent && window.parent !== window) {
            try {
                const apiKeyInput = window.parent.document.getElementById('api-key');
                if (apiKeyInput) {
                    apiKeyInput.value = token;
                    showMessage('Token已同步到系统设置', 'success');
                    updateSyncStatus('已同步', 'sync-success');
                    return;
                }
            } catch (e) {
                console.log('无法直接更新父页面，使用localStorage同步');
            }
        }

        // 通过localStorage同步
        localStorage.setItem('token_sync_time', Date.now().toString());
        showMessage('Token已保存到localStorage，请在系统设置页面刷新查看', 'success');
        updateSyncStatus('已同步', 'sync-success');
        
    } catch (error) {
        showMessage(`同步失败: ${error.message}`, 'error');
        updateSyncStatus('同步失败', 'sync-error');
    }
}

function updateSyncStatus(text, className) {
    const syncStatus = document.getElementById('syncStatus');
    if (syncStatus) {
        syncStatus.textContent = text;
        syncStatus.className = `sync-status ${className}`;
    }
}