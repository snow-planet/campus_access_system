import dotenv from 'dotenv'

dotenv.config()

let mpTokenCache = { token: null, expiresAt: 0 }
let oaTokenCache = { token: null, expiresAt: 0 }

const fetchJSON = async (url, options) => {
  const res = await fetch(url, options)
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}: ${JSON.stringify(data)}`)
  }
  return data
}

export async function code2Session(code) {
  const appid = process.env.MP_WECHAT_APPID
  const secret = process.env.MP_WECHAT_SECRET
  if (!appid || !secret) throw new Error('Missing MP_WECHAT_APPID/MP_WECHAT_SECRET in env')
  const url = `https://api.weixin.qq.com/sns/jscode2session?appid=${appid}&secret=${secret}&js_code=${code}&grant_type=authorization_code`
  return fetchJSON(url)
}

export async function getMpAccessToken() {
  const appid = process.env.MP_WECHAT_APPID
  const secret = process.env.MP_WECHAT_SECRET
  if (!appid || !secret) throw new Error('Missing MP_WECHAT_APPID/MP_WECHAT_SECRET in env')
  const now = Date.now()
  if (mpTokenCache.token && mpTokenCache.expiresAt > now + 60_000) return mpTokenCache.token
  const url = `https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${appid}&secret=${secret}`
  const data = await fetchJSON(url)
  mpTokenCache = { token: data.access_token, expiresAt: now + (data.expires_in - 60) * 1000 }
  return mpTokenCache.token
}

export async function getOfficialAccessToken() {
  const appid = process.env.OA_WECHAT_APPID
  const secret = process.env.OA_WECHAT_SECRET
  if (!appid || !secret) throw new Error('Missing OA_WECHAT_APPID/OA_WECHAT_SECRET in env')
  const now = Date.now()
  if (oaTokenCache.token && oaTokenCache.expiresAt > now + 60_000) return oaTokenCache.token
  const url = `https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${appid}&secret=${secret}`
  const data = await fetchJSON(url)
  oaTokenCache = { token: data.access_token, expiresAt: now + (data.expires_in - 60) * 1000 }
  return oaTokenCache.token
}

// 发送服务号文本消息（需用户已关注且有对应openid）。
export async function sendOfficialText(toOpenId, content) {
  if (!toOpenId) throw new Error('Missing recipient openid')
  const token = await getOfficialAccessToken()
  const url = `https://api.weixin.qq.com/cgi-bin/message/custom/send?access_token=${token}`
  const payload = {
    touser: toOpenId,
    msgtype: 'text',
    text: { content }
  }
  const res = await fetchJSON(url, { method: 'POST', body: JSON.stringify(payload) })
  return res
}