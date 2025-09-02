# 校园出入预约平台部署指南

## 项目概述

校园出入预约平台是一个完整的预约管理系统，包含：
- **Web前端**：Vue3 + Vite 构建的管理后台和用户界面
- **后端API**：Node.js + Express + Sequelize 构建的RESTful API
- **小程序前端**：uni-app 构建的微信小程序（使用微信云开发）
- **数据库**：MySQL 数据库

## 部署架构

```
阿里云服务器 (campus.gxwxit.top)
├── Web前端 (静态文件部署)
├── 后端API (Node.js应用)
├── MySQL数据库 (宝塔面板管理)
└── 宝塔面板 (服务器管理)

微信云开发
└── uni-app小程序前端
```

## 一、服务器环境准备

### 1.1 宝塔面板环境要求

确保宝塔面板已安装以下组件：
- **Nginx** (1.20+)
- **MySQL** (5.7+ 或 8.0+)
- **Node.js** (18.0+)
- **PM2** (进程管理器)
- **SSL证书** (Let's Encrypt)

### 1.2 域名配置

在域名解析中添加A记录：
```
campus.gxwxit.top -> 你的服务器IP
```

## 二、数据库部署

### 2.1 创建数据库

在宝塔面板 -> 数据库中：
1. 创建数据库：`campus_access_system`
2. 创建数据库用户：`campus_user`
3. 设置密码并授权

### 2.2 数据库表结构

数据库表将通过后端应用自动创建，包含以下表：
- `users` - 用户表
- `individual_reservations` - 个人预约表
- `group_reservations` - 团体预约表
- `approval_records` - 审批记录表
- `approver_applications` - 审批人申请表
- `notifications` - 通知公告表

## 三、后端API部署

### 3.1 上传代码

将 `backend` 目录上传到服务器：
```bash
/www/wwwroot/campus.gxwxit.top/backend/
```

### 3.2 安装依赖

在宝塔面板终端中执行：
```bash
cd /www/wwwroot/campus.gxwxit.top/backend
npm install --production
```

### 3.3 环境配置

创建 `.env` 文件：
```bash
cp .env.example .env
```

编辑 `.env` 文件：
```env
# 环境配置
NODE_ENV=production
PORT=3001

# 数据库配置
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=campus_user
DB_PASS=你的数据库密码
DB_NAME=campus_access_system

# JWT配置
JWT_SECRET=your_very_secure_jwt_secret_key_here
JWT_EXPIRES_IN=24h
JWT_WEB_SECRET=your_web_jwt_secret_key_here
JWT_UNI_SECRET=your_uni_jwt_secret_key_here

# CORS配置
WEB_ORIGIN=https://campus.gxwxit.top
UNI_ORIGIN=https://campus.gxwxit.top
WEB_CORS_ORIGIN=https://campus.gxwxit.top

# 微信配置
WECHAT_APP_ID=你的微信小程序AppID
WECHAT_APP_SECRET=你的微信小程序AppSecret
WECHAT_TOKEN=你的微信Token
```

### 3.4 初始化数据库

```bash
# 同步数据库表结构
node src/scripts/syncTables.js

# 初始化测试用户（可选）
node src/scripts/initTestUsers.js
```

### 3.5 PM2进程管理

创建 `ecosystem.config.js`：
```javascript
module.exports = {
  apps: [{
    name: 'campus-backend',
    script: 'src/server.js',
    cwd: '/www/wwwroot/campus.gxwxit.top/backend',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3001
    }
  }]
}
```

启动应用：
```bash
pm2 start src/server.js --name "campus-backend" --watch
pm2 save
pm2 startup
```

## 四、Web前端部署

### 4.1 本地构建

在本地开发环境中：
```bash
cd web
npm install
npm run build
```

### 4.2 上传静态文件

将 `web/dist` 目录中的所有文件上传到：
```bash
/www/wwwroot/campus.gxwxit.top/
```

### 4.3 Nginx配置

在宝塔面板 -> 网站 -> campus.gxwxit.top -> 配置文件中添加：

```nginx
server {
    listen 80;
    listen 443 ssl http2;
    server_name campus.gxwxit.top;
    
    # SSL配置
    ssl_certificate /www/server/panel/vhost/cert/campus.gxwxit.top/fullchain.pem;
    ssl_certificate_key /www/server/panel/vhost/cert/campus.gxwxit.top/privkey.pem;
    
    # 网站根目录
    root /www/wwwroot/campus.gxwxit.top;
    index index.html;
    
    # 前端路由支持
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # API代理到后端
    location /api/ {
        proxy_pass http://127.0.0.1:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    # 静态资源缓存
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # 安全头
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
}
```

## 五、uni-app小程序部署

### 5.1 微信云开发配置

1. 登录微信公众平台
2. 进入小程序管理后台
3. 开通云开发服务
4. 创建云开发环境

### 5.2 修改API配置

编辑 `uni/utils/request.js`：
```javascript
// 修改BASE_URL为生产环境地址
let BASE_URL = 'https://campus.gxwxit.top'
```

### 5.3 小程序配置

编辑 `uni/manifest.json`：
```json
{
  "mp-weixin": {
    "appid": "你的小程序AppID",
    "setting": {
      "urlCheck": true,
      "es6": true,
      "postcss": true,
      "minified": true
    }
  }
}
```

### 5.4 构建和发布

1. 使用HBuilderX打开uni项目
2. 发行 -> 小程序-微信
3. 使用微信开发者工具打开生成的项目
4. 上传代码到微信后台
5. 提交审核

## 六、SSL证书配置

### 6.1 申请SSL证书

在宝塔面板中：
1. 网站 -> campus.gxwxit.top -> SSL
2. 选择Let's Encrypt免费证书
3. 申请并部署

### 6.2 强制HTTPS

在SSL设置中开启：
- 强制HTTPS
- HSTS

## 七、安全配置

### 7.1 防火墙设置

在宝塔面板 -> 安全中：
- 开放端口：80, 443, 3001
- 禁用不必要的端口
- 配置SSH密钥登录

### 7.2 数据库安全

- 修改MySQL默认端口
- 禁用root远程登录
- 定期备份数据库

## 八、监控和维护

### 8.1 日志监控

```bash
# 查看PM2日志
pm2 logs campus-backend

# 查看Nginx日志
tail -f /www/wwwlogs/campus.gxwxit.top.log
```

### 8.2 性能监控

```bash
# PM2监控
pm2 monit

# 系统资源监控
top
htop
```

### 8.3 备份策略

1. **数据库备份**：宝塔面板自动备份
2. **代码备份**：Git版本控制
3. **配置备份**：定期备份.env和nginx配置

## 九、测试验证

### 9.1 功能测试清单

- [ ] Web前端访问正常
- [ ] 管理员登录功能
- [ ] 用户预约功能
- [ ] 审批流程
- [ ] 小程序功能
- [ ] API接口响应
- [ ] 数据库连接
- [ ] SSL证书有效

### 9.2 性能测试

```bash
# API性能测试
curl -w "@curl-format.txt" -o /dev/null -s https://campus.gxwxit.top/api/web/auth/login

# 网站速度测试
wget --spider https://campus.gxwxit.top
```

## 十、故障排除

### 10.1 常见问题

**问题1：API 502错误**
```bash
# 检查后端服务状态
pm2 status
pm2 restart campus-backend
```

**问题2：数据库连接失败**
```bash
# 检查数据库服务
systemctl status mysql
# 检查数据库配置
cat /www/wwwroot/campus.gxwxit.top/backend/.env
```

**问题3：前端路由404**
- 检查Nginx配置中的try_files设置
- 确保index.html存在

### 10.2 日志分析

```bash
# 后端应用日志
pm2 logs campus-backend --lines 100

# Nginx错误日志
tail -f /www/wwwlogs/campus.gxwxit.top.error.log

# 系统日志
journalctl -u nginx -f
```

## 十一、更新部署

### 11.1 后端更新

```bash
# 停止服务
pm2 stop campus-backend

# 更新代码
git pull origin main
npm install

# 数据库迁移（如需要）
node src/scripts/syncTables.js

# 重启服务
pm2 start campus-backend
```

### 11.2 前端更新

```bash
# 本地构建
npm run build

# 上传新文件
# 替换 /www/wwwroot/campus.gxwxit.top/ 中的文件
```

## 十二、联系信息

如遇到部署问题，请检查：
1. 服务器日志文件
2. 网络连接状态
3. 配置文件正确性
4. 端口开放情况

---

**注意事项：**
- 部署前请备份现有数据
- 确保所有密钥和密码的安全性
- 定期更新系统和依赖包
- 监控服务器资源使用情况