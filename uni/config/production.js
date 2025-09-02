// uni-app 生产环境配置
// 微信云开发环境配置

export const config = {
  // API基础地址
  apiBaseUrl: 'https://campus.gxwxit.top',
  
  // 微信云开发环境ID
  cloudEnvId: 'your-cloud-env-id', // 请替换为实际的云开发环境ID
  
  // 微信小程序配置
  wechat: {
    appId: 'your-wechat-appid', // 请替换为实际的小程序AppID
  },
  
  // 请求超时时间
  timeout: 10000,
  
  // 是否开启调试模式
  debug: false,
  
  // 版本信息
  version: '1.0.0',
  
  // 环境标识
  env: 'production'
}

// 设置全局API地址
if (typeof uni !== 'undefined') {
  uni.setStorageSync('API_BASE_URL', config.apiBaseUrl)
}