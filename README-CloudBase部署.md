# 微信云托管部署指南

## 概述
本指南将帮助您使用CloudBase CLI将管理后台部署到微信云托管。

## 前置要求

### 1. 安装CloudBase CLI
```bash
npm install -g @cloudbase/cli
```

### 2. 登录CloudBase CLI
```bash
cloudbase login
```

### 3. 获取云开发环境ID
- 登录微信云开发控制台
- 在环境设置中获取环境ID

## 部署步骤

### 方法一：使用自动部署脚本（推荐）

1. 进入admin目录：
```bash
cd miniprogram-5/admin
```

2. 运行部署脚本：
```bash
./deploy-cloudbase.sh
```

3. 按提示输入您的云开发环境ID

### 方法二：手动部署

1. 修改配置文件：
   - 编辑 `cloudbase.json`
   - 将 `your-env-id` 替换为您的实际环境ID

2. 执行部署：
```bash
cloudbase framework deploy
```

## 配置说明

### cloudbase.json 配置
- `envId`: 云开发环境ID
- `entry`: 入口文件（server.js）
- `containerPort`: 容器端口（3000）
- `cpu`: CPU资源（0.25核）
- `mem`: 内存资源（0.5GB）
- `minNum`: 最小实例数（0）
- `maxNum`: 最大实例数（10）

### Dockerfile 说明
- 基于Node.js 12 Alpine镜像
- 安装生产环境依赖
- 暴露3000端口
- 使用npm start启动应用

## 部署后配置

### 1. 设置环境变量
在微信云托管控制台中设置以下环境变量：
- `NODE_ENV`: production
- `CLOUD_ENV_ID`: 您的云开发环境ID

### 2. 配置域名
- 在微信云托管控制台绑定自定义域名
- 或使用系统分配的域名

### 3. 配置HTTPS
- 微信云托管自动提供HTTPS支持
- 如需自定义证书，可在控制台配置

## 访问管理后台

部署成功后，您可以通过以下方式访问：

1. **微信云托管分配的域名**：
   - 格式：`https://your-service-name.region.tencentcloudapi.com`

2. **自定义域名**（如果配置了）：
   - 您绑定的自定义域名

## 常见问题

### Q: 部署失败怎么办？
A: 检查以下几点：
- 确保已正确安装CloudBase CLI
- 确保已登录并授权
- 检查环境ID是否正确
- 查看部署日志获取详细错误信息

### Q: 如何查看部署日志？
A: 使用以下命令：
```bash
cloudbase framework:deploy --log
```

### Q: 如何更新部署？
A: 修改代码后重新运行部署脚本即可

### Q: 如何停止服务？
A: 在微信云托管控制台中可以停止或删除服务

## 监控和维护

### 1. 查看服务状态
- 登录微信云托管控制台
- 查看服务运行状态和日志

### 2. 查看访问日志
- 在控制台查看访问统计
- 监控错误率和响应时间

### 3. 扩缩容
- 根据访问量调整实例数量
- 设置自动扩缩容规则

## 安全建议

1. **环境变量**：敏感信息使用环境变量存储
2. **访问控制**：配置IP白名单或访问密钥
3. **HTTPS**：确保使用HTTPS访问
4. **日志监控**：定期检查访问日志

## 联系支持

如遇到问题，可以：
1. 查看微信云托管官方文档
2. 联系微信云托管技术支持
3. 查看CloudBase CLI官方文档 