# Git部署指南

## 概述

本项目支持通过Git进行自动部署，包括GitHub Actions自动部署到Vercel、Netlify或GitHub Pages等平台。

## 部署方式

### 1. GitHub Pages部署（推荐）

GitHub Pages是免费的静态网站托管服务，适合部署前端项目。

#### 设置步骤：

1. **推送代码到GitHub**
   ```bash
   ./deploy-git.sh
   ```

2. **启用GitHub Pages**
   - 进入GitHub仓库设置
   - 找到"Pages"选项
   - 选择"Deploy from a branch"
   - 选择"gh-pages"分支
   - 保存设置

3. **访问网站**
   - 部署完成后，网站地址为：`https://869891093.github.io/travel-admin-backend`

### 2. Vercel部署

Vercel提供更强大的部署功能，支持自动部署和自定义域名。

#### 设置步骤：

1. **注册Vercel账户**
   - 访问 https://vercel.com
   - 使用GitHub账户登录

2. **导入项目**
   - 点击"New Project"
   - 选择GitHub仓库：`travel-admin-backend`
   - 配置部署设置：
     - Framework Preset: Other
     - Build Command: `npm run build`
     - Output Directory: `dist`
     - Install Command: `npm install`

3. **配置环境变量**
   - 在Vercel项目设置中添加必要的环境变量
   - 例如：`NODE_ENV=production`

4. **自动部署**
   - 每次推送到main分支都会自动触发部署
   - 可以在Vercel仪表板查看部署状态

### 3. Netlify部署

Netlify是另一个优秀的静态网站托管平台。

#### 设置步骤：

1. **注册Netlify账户**
   - 访问 https://netlify.com
   - 使用GitHub账户登录

2. **导入项目**
   - 点击"New site from Git"
   - 选择GitHub仓库
   - 配置构建设置：
     - Build command: `npm run build`
     - Publish directory: `dist`

3. **自定义域名**
   - 在Netlify设置中可以配置自定义域名
   - 支持HTTPS证书自动配置

## 部署脚本使用

### 自动部署脚本

```bash
# 运行Git部署脚本
./deploy-git.sh
```

这个脚本会：
1. 检查Git状态
2. 自动提交更改
3. 推送到GitHub
4. 触发自动部署

### 手动部署步骤

```bash
# 1. 添加所有文件
git add .

# 2. 提交更改
git commit -m "更新部署"

# 3. 推送到GitHub
git push origin main
```

## 环境变量配置

### GitHub Secrets（用于GitHub Actions）

在GitHub仓库设置中添加以下Secrets：

- `VERCEL_TOKEN`: Vercel API Token
- `ORG_ID`: Vercel Organization ID
- `PROJECT_ID`: Vercel Project ID

### 获取Vercel配置

```bash
# 安装Vercel CLI
npm i -g vercel

# 登录Vercel
vercel login

# 获取项目信息
vercel project ls
```

## 部署平台对比

| 平台 | 优点 | 缺点 | 适用场景 |
|------|------|------|----------|
| GitHub Pages | 免费、简单 | 功能有限 | 静态网站 |
| Vercel | 功能强大、自动部署 | 免费版有限制 | 全栈应用 |
| Netlify | 功能丰富、CDN | 免费版有限制 | 静态网站 |

## 故障排除

### 常见问题

1. **部署失败**
   - 检查GitHub Actions日志
   - 确认环境变量配置正确
   - 验证构建命令是否正确

2. **网站无法访问**
   - 检查域名配置
   - 确认HTTPS证书状态
   - 验证DNS设置

3. **自动部署不触发**
   - 确认GitHub Actions已启用
   - 检查分支名称是否正确
   - 验证工作流文件语法

### 调试命令

```bash
# 检查Git状态
git status

# 查看提交历史
git log --oneline

# 检查远程仓库
git remote -v

# 查看GitHub Actions状态
# 访问：https://github.com/869891093/travel-admin-backend/actions
```

## 联系支持

如果遇到部署问题，可以：

1. 查看GitHub Issues
2. 检查部署日志
3. 联系技术支持

---

**注意**: 确保在部署前测试所有功能，并备份重要数据。 