// 统一请求封装，支持H5/小程序
// 约定：
// - 使用uni.showLoading/uni.hideLoading提供加载反馈
// - 错误使用uni.showToast提示
// - 基础地址可通过 setBaseURL 在运行时配置，默认指向本地开发后端

let BASE_URL = uni.getStorageSync('API_BASE_URL') || 'http://127.0.0.1:3001'

export const setBaseURL = (url) => {
  if (url && typeof url === 'string') {
    BASE_URL = url.replace(/\/$/, '')
    try { uni.setStorageSync('API_BASE_URL', BASE_URL) } catch(e) {}
  }
}

const buildURL = (url) => {
  if (!url) return ''
  if (url.startsWith('http://') || url.startsWith('https://')) return url
  if (!url.startsWith('/')) url = '/' + url
  return BASE_URL + url
}

export const request = (options = {}) => {
  const { url = '', method = 'GET', data = {}, header = {}, showLoading = true } = options
  return new Promise((resolve, reject) => {
    if (showLoading) {
      uni.showLoading({ title: '加载中', mask: true })
    }
    uni.request({
      url: buildURL(url),
      method,
      data,
      header: {
        'Content-Type': 'application/json',
        ...header,
      },
      success: (res) => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(res.data)
        } else {
          uni.showToast({ title: '请求失败', icon: 'none' })
          reject(res)
        }
      },
      fail: (err) => {
        uni.showToast({ title: '网络错误', icon: 'none' })
        reject(err)
      },
      complete: () => {
        if (showLoading) uni.hideLoading()
      },
    })
  })
}