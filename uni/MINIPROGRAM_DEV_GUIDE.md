# 小程序开发期间配置指南

## 🎯 目标

在小程序无法备案的情况下，让开发期间的小程序能够使用已部署的后端（campus.gxwxit.top）进行测试版体验。

## 📋 配置步骤

### 1. 修改API配置

已将 `uni/utils/request.js` 中的默认API地址修改为生产环境：

```javascript
// 修改前
let BASE_URL = uni.getStorageSync('API_BASE_URL') || 'http://127.0.0.1:3001'

// 修改后
let BASE_URL = uni.getStorageSync('API_BASE_URL') || 'https://campus.gxwxit.top'
```

### 2. 微信小程序后台配置

#### 2.1 登录微信公众平台

1. 访问 [微信公众平台](https://mp.weixin.qq.com/)
2. 使用小程序账号登录

#### 2.2 配置服务器域名

在 **开发 -> 开发管理 -> 开发设置 -> 服务器域名** 中添加：

```
request合法域名：
https://campus.gxwxit.top

uploadFile合法域名：
https://campus.gxwxit.top

downloadFile合法域名：
https://campus.gxwxit.top

websocket合法域名：
（暂不需要）
```

#### 2.3 配置业务域名（可选）

在 **设置 -> 基本设置 -> 业务域名** 中添加：
```
https://campus.gxwxit.top
```

### 3. 开发者工具配置

#### 3.1 关闭域名校验（仅开发期间）

在微信开发者工具中：
1. 点击右上角 **详情**
2. 在 **本地设置** 中勾选：
   - ✅ 不校验合法域名、web-view（业务域名）、TLS 版本以及 HTTPS 证书
   - ✅ 启用调试模式

#### 3.2 项目配置

确保 `project.config.json` 包含正确配置：

```json
{
  "description": "校园出入预约平台",
  "packOptions": {
    "ignore": []
  },
  "setting": {
    "urlCheck": false,
    "es6": true,
    "enhance": true,
    "postcss": true,
    "preloadBackgroundData": false,
    "minified": true,
    "newFeature": false,
    "coverView": true,
    "nodeModules": false,
    "autoAudits": false,
    "showShadowRootInWxmlPanel": true,
    "scopeDataCheck": false,
    "uglifyFileName": false,
    "checkInvalidKey": true,
    "checkSiteMap": true,
    "uploadWithSourceMap": true,
    "compileHotReLoad": false,
    "lazyloadPlaceholderEnable": false,
    "useMultiFrameRuntime": true,
    "useApiHook": true,
    "useApiHostProcess": true,
    "babelSetting": {
      "ignore": [],
      "disablePlugins": [],
      "outputPath": ""
    },
    "enableEngineNative": false,
    "useIsolateContext": true,
    "userConfirmedBundleSwitch": false,
    "packNpmManually": false,
    "packNpmRelationList": [],
    "minifyWXSS": true,
    "disableUseStrict": false,
    "minifyWXML": true,
    "showES6CompileOption": false,
    "useCompilerPlugins": false
  },
  "compileType": "miniprogram",
  "libVersion": "2.19.4",
  "appid": "你的小程序AppID",
  "projectname": "校园出入预约平台",
  "debugOptions": {
    "hidedInDevtools": []
  },
  "scripts": {},
  "staticServerOptions": {
    "baseURL": "",
    "servePath": ""
  },
  "isGameTourist": false,
  "condition": {
    "search": {
      "list": []
    },
    "conversation": {
      "list": []
    },
    "game": {
      "list": []
    },
    "plugin": {
      "list": []
    },
    "gamePlugin": {
      "list": []
    },
    "miniprogram": {
      "list": []
    }
  }
}
```

### 4. 测试流程

#### 4.1 本地开发测试

1. 使用HBuilderX打开uni项目
2. 运行到微信开发者工具
3. 在开发者工具中测试各项功能

#### 4.2 真机预览测试

1. 在微信开发者工具中点击 **预览**
2. 使用微信扫描二维码
3. 在真机上测试功能

#### 4.3 体验版发布

1. 在微信开发者工具中点击 **上传**
2. 填写版本号和项目备注
3. 在微信公众平台中将上传的版本设为体验版
4. 添加体验成员进行测试

## ⚠️ 注意事项

### 1. 域名限制

- **开发期间**：可以通过关闭域名校验来测试
- **体验版/正式版**：必须配置合法域名
- **HTTPS要求**：生产环境必须使用HTTPS

### 2. 接口调用

确保后端接口支持跨域访问，在后端 `.env` 文件中配置：

```env
# CORS配置
WEB_ORIGIN=https://campus.gxwxit.top
UNI_ORIGIN=https://campus.gxwxit.top
WEB_CORS_ORIGIN=https://campus.gxwxit.top
```

### 3. 功能测试清单

- [ ] 用户登录/注册
- [ ] 个人预约功能
- [ ] 团体预约功能
- [ ] 预约查询功能
- [ ] 审批流程（如果小程序包含）
- [ ] 公告查看
- [ ] 数据同步

## 🚀 发布流程

### 开发版 -> 体验版

1. **代码上传**
   ```bash
   # 在HBuilderX中
   发行 -> 小程序-微信 -> 微信开发者工具
   ```

2. **开发者工具上传**
   - 点击 "上传" 按钮
   - 填写版本号（如：1.0.0）
   - 填写项目备注

3. **设置体验版**
   - 登录微信公众平台
   - 版本管理 -> 开发版本
   - 选择刚上传的版本，点击 "选为体验版"

4. **添加体验成员**
   - 成员管理 -> 体验成员
   - 添加微信号或扫码邀请

### 体验版 -> 正式版（需要备案后）

1. **提交审核**
   - 版本管理 -> 体验版本
   - 点击 "提交审核"
   - 填写审核信息

2. **审核通过后发布**
   - 审核通过后点击 "发布"
   - 正式版本上线

## 🔧 故障排除

### 1. 网络请求失败

**问题**：小程序无法访问API

**解决方案**：
- 检查服务器域名配置
- 确认HTTPS证书有效
- 检查后端CORS配置
- 开发期间关闭域名校验

### 2. 登录功能异常

**问题**：微信登录失败

**解决方案**：
- 检查小程序AppID配置
- 确认后端微信配置正确
- 检查微信授权流程

### 3. 数据加载失败

**问题**：接口返回错误

**解决方案**：
- 检查API地址配置
- 确认后端服务运行正常
- 检查数据库连接
- 查看后端日志

## 📞 技术支持

如遇到问题，请检查：

1. **微信开发者工具控制台**：查看错误信息
2. **网络面板**：检查API请求状态
3. **后端日志**：`pm2 logs campus-backend`
4. **服务器状态**：确认服务正常运行

---

**重要提醒**：此配置仅适用于开发和测试阶段。正式发布前，请确保完成域名备案和相关合规要求。