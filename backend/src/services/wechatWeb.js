import crypto from 'crypto'
import { getOfficialAccessToken } from './wechat.js'

// In-memory login session store
const sessions = new Map() // scene -> { status: 'pending'|'authorized', openid?: string, createdAt: number }
const SESSION_TTL_MS = 5 * 60 * 1000 // 5 minutes

function cleanupSessions() {
  const now = Date.now()
  for (const [scene, v] of sessions.entries()) {
    if (now - (v.createdAt || 0) > SESSION_TTL_MS) sessions.delete(scene)
  }
}

export function createLoginSession(scene) {
  cleanupSessions()
  const item = { status: 'pending', createdAt: Date.now() }
  sessions.set(scene, item)
  return item
}

export function markSessionAuthorized(scene, openid) {
  const item = sessions.get(scene)
  if (!item) return null
  item.status = 'authorized'
  item.openid = openid
  return item
}

export function getSession(scene) {
  cleanupSessions()
  return sessions.get(scene) || null
}

export function genSceneStr() {
  return 'scn_' + Math.random().toString(36).slice(2) + Date.now().toString(36)
}

export async function createTempQRCode(scene_str, expire_seconds = 300) {
  const token = await getOfficialAccessToken()
  const url = `https://api.weixin.qq.com/cgi-bin/qrcode/create?access_token=${token}`
  const payload = {
    expire_seconds,
    action_name: 'QR_STR_SCENE',
    action_info: { scene: { scene_str } }
  }
  const res = await fetch(url, { method: 'POST', body: JSON.stringify(payload) })
  const data = await res.json()
  if (!res.ok || data.errcode) {
    throw new Error(`Create QR failed: ${data.errmsg || res.status}`)
  }
  const { ticket, expire_seconds: exp } = data
  const qrUrl = `https://mp.weixin.qq.com/cgi-bin/showqrcode?ticket=${encodeURIComponent(ticket)}`
  return { ticket, qrUrl, expire_seconds: exp || expire_seconds }
}

export function verifyWeChatSignature({ timestamp, nonce, signature }) {
  const token = process.env.OA_CALLBACK_TOKEN || ''
  const arr = [token, timestamp, nonce].sort()
  const sha = crypto.createHash('sha1').update(arr.join('')).digest('hex')
  return sha === signature
}