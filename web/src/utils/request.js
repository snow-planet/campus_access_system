// 简易请求封装：
// - 运行时可通过环境变量 VITE_API_BASE 配置基础地址
// - 开发环境可配合 Vite 代理使用相对路径（默认"/api"前缀）
// - 不写死域名，便于后续切换环境

const getBaseURL = () => {
  const base = import.meta?.env?.VITE_API_BASE || ''
  if (!base) return '' // 使用相对路径，走 Vite 代理
  return base.replace(/\/$/, '')
}

const buildURL = (url) => {
  const base = getBaseURL()
  if (!url) return base
  if (/^https?:\/\//i.test(url)) return url
  if (!url.startsWith('/')) url = '/' + url
  return base + url
}

export async function request({ url = '', method = 'GET', data, headers = {} } = {}) {
  const fetchOptions = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
  }
  if (method && method.toUpperCase() !== 'GET' && data !== undefined) {
    fetchOptions.body = typeof data === 'string' ? data : JSON.stringify(data)
  }

  const finalURL = buildURL(url)

  const res = await fetch(
    method && method.toUpperCase() === 'GET' && data && typeof data === 'object'
      ? `${finalURL}?${new URLSearchParams(data).toString()}`
      : finalURL,
    fetchOptions
  )

  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`Request failed: ${res.status} ${text}`)
  }
  return res.json()
}