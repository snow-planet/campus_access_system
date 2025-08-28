# 校园出入预约系统部署指南

## 系统架构

本系统采用前后端分离架构，包含以下组件：

- **后端服务** (Node.js + Express + Sequelize + MySQL)
- **Web前端** (Vue 3 + Vite)
- **uni-app小程序** (Vue 3 + uni-app)

## 环境要求

- Node.js >= 16.0.0
- MySQL >= 5.7
- npm >= 8.0.0

## 部署步骤

### 1. 数据库配置

```sql
-- 创建数据库
CREATE DATABASE campus_access_system CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 导入数据表结构
source campus_access_system.sql;
```

### 2. 后端部署

```bash
# 进入后端目录
cd backend

# 安装依赖
npm install

# 复制环境配置文件
cp .env.example .env

# 编辑环境配置
vim .env
```

#### 环境配置说明

```bash
# 生产环境配置
NODE_ENV=production
PORT=3001

# 数据库配置
DB_HOST=your_database_host
DB_PORT=3306
DB_USER=your_database_user
DB_PASS=your_database_password
DB_NAME=campus_access_system

# JWT配置（请使用强密码）
JWT_SECRET=your_very_secure_jwt_secret_key
JWT_EXPIRES_IN=24h
JWT_WEB_SECRET=your_web_jwt_secret_key
JWT_UNI_SECRET=your_uni_jwt_secret_key

# CORS配置
WEB_ORIGIN=https://your-web-domain.com
UNI_ORIGIN=https://your-uni-domain.com
WEB_CORS_ORIGIN=https://your-web-domain.com

# 微信配置
WECHAT_APP_ID=your_wechat_app_id
WECHAT_APP_SECRET=your_wechat_app_secret
WECHAT_TOKEN=your_wechat_token
```

```bash
# 初始化测试数据（可选）
node src/scripts/initTestUsers.js

# 启动服务
npm start

# 或使用PM2进行进程管理
npm install -g pm2
pm2 start src/server.js --name "campus-access-backend"
```

### 3. Web前端部署

```bash
# 进入Web前端目录
cd web

# 安装依赖
npm install

# 构建生产版本
npm run build

# 部署到Web服务器（如Nginx）
cp -r dist/* /var/www/html/
```

#### Nginx配置示例

```nginx
server {
    listen 80;
    server_name your-domain.com;
    
    root /var/www/html;
    index index.html;
    
    # 前端路由支持
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # API代理
    location /api/ {
        proxy_pass http://localhost:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### 4. uni-app小程序部署

```bash
# 进入uni-app目录
cd uni

# 安装依赖
npm install

# 使用HBuilderX打开项目
# 或使用命令行构建
npx @dcloudio/cli build --platform mp-weixin
```

## 配置管理

### 开发环境 vs 生产环境

| 配置项 | 开发环境 | 生产环境 |
|--------|----------|----------|
| NODE_ENV | development | production |
| DB_HOST | 127.0.0.1 | 生产数据库地址 |
| WEB_ORIGIN | http://localhost:5174 | https://your-domain.com |
| JWT_SECRET | 简单密钥 | 复杂安全密钥 |

### 安全配置建议

1. **JWT密钥**：使用至少32位的随机字符串
2. **数据库密码**：使用强密码并定期更换
3. **CORS配置**：仅允许信任的域名访问
4. **HTTPS**：生产环境必须使用HTTPS

## 测试账户

系统初始化后包含以下测试账户：

- **管理员**：`admin / 123456`
- **审批员**：`approver / 123456`

**注意**：生产环境部署后请立即修改默认密码！

## 监控和维护

### 日志管理

```bash
# 查看PM2日志
pm2 logs campus-access-backend

# 查看错误日志
pm2 logs campus-access-backend --err
```

### 数据库备份

```bash
# 备份数据库
mysqldump -u username -p campus_access_system > backup_$(date +%Y%m%d).sql

# 恢复数据库
mysql -u username -p campus_access_system < backup_20231201.sql
```

### 性能优化

1. **数据库索引**：确保关键字段已建立索引
2. **缓存策略**：考虑使用Redis缓存热点数据
3. **CDN加速**：静态资源使用CDN分发
4. **负载均衡**：高并发场景下使用负载均衡

## 故障排除

### 常见问题

1. **数据库连接失败**
   - 检查数据库服务是否启动
   - 验证连接参数是否正确
   - 确认防火墙设置

2. **CORS错误**
   - 检查WEB_CORS_ORIGIN配置
   - 确认前端请求域名

3. **JWT验证失败**
   - 检查JWT_SECRET配置
   - 确认token是否过期

### 联系支持

如遇到部署问题，请提供以下信息：
- 系统环境信息
- 错误日志
- 配置文件（隐藏敏感信息）