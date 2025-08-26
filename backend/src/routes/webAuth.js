import express from 'express'
import { User } from '../models/User.js'
import { createTempQRCode, genSceneStr, getSession, createLoginSession, markSessionAuthorized, verifyWeChatSignature } from '../services/wechatWeb.js'
import { sendOfficialText } from '../services/wechat.js'

const router = express.Router()

// 1) Frontend: create QR code for login
router.post('/qrcode', async (req, res) => {
  try {
    const scene = genSceneStr()
    createLoginSession(scene)
    
    // 开发环境下使用模拟二维码
    if (process.env.NODE_ENV === 'development') {
      const mockQrUrl = `data:image/svg+xml;base64,${Buffer.from(`
        <svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
          <rect width="200" height="200" fill="white"/>
          <text x="100" y="100" text-anchor="middle" font-size="12" fill="black">
            开发模式二维码\n场景值: ${scene.slice(-8)}
          </text>
          <text x="100" y="130" text-anchor="middle" font-size="10" fill="gray">
            点击下方按钮模拟扫码
          </text>
        </svg>
      `).toString('base64')}`
      return res.json({ data: { scene, qrUrl: mockQrUrl, expire_seconds: 300, isDev: true }, _status: 'OK' })
    }
    
    const { qrUrl, expire_seconds } = await createTempQRCode(scene)
    res.json({ data: { scene, qrUrl, expire_seconds }, _status: 'OK' })
  } catch (e) {
    console.error('QR Code generation failed:', e.message)
    // 如果微信API失败，返回开发模式二维码
    const scene = genSceneStr()
    createLoginSession(scene)
    const mockQrUrl = `data:image/svg+xml;base64,${Buffer.from(`
      <svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
        <rect width="200" height="200" fill="#f0f0f0"/>
        <text x="100" y="90" text-anchor="middle" font-size="12" fill="red">
          微信API错误
        </text>
        <text x="100" y="110" text-anchor="middle" font-size="10" fill="black">
          场景值: ${scene.slice(-8)}
        </text>
        <text x="100" y="130" text-anchor="middle" font-size="10" fill="gray">
          点击下方按钮模拟扫码
        </text>
      </svg>
    `).toString('base64')}`
    res.json({ data: { scene, qrUrl: mockQrUrl, expire_seconds: 300, isDev: true, error: e.message }, _status: 'OK' })
  }
})

// 2) Frontend: poll login status
router.get('/poll', async (req, res) => {
  try {
    const { scene } = req.query
    const s = getSession(scene)
    if (!s) return res.json({ data: { status: 'expired' }, _status: 'OK' })
    res.json({ data: { status: s.status, openid: s.openid }, _status: 'OK' })
  } catch (e) {
    res.status(500).json({ data: null, _status: 'FAIL', _error: { code: 'wechat.poll_failed', meta: e.message } })
  }
})

// 开发模式：模拟扫码授权
router.post('/dev-authorize', async (req, res) => {
  try {
    const { scene } = req.body
    if (!scene) return res.status(400).json({ data: null, _status: 'FAIL', _error: { code: 'missing_scene' } })
    
    // 模拟用户扫码并关注
    const mockOpenId = 'dev_openid_' + Math.random().toString(36).slice(2, 10)
    markSessionAuthorized(scene, mockOpenId)
    
    res.json({ data: { success: true, openid: mockOpenId }, _status: 'OK' })
  } catch (e) {
    res.status(500).json({ data: null, _status: 'FAIL', _error: { code: 'dev_auth_failed', meta: e.message } })
  }
})

// 3) WeChat server callback (follow + scan)
// Configure this url in Official Account server: /api/web/auth/notify
router.get('/notify', (req, res) => {
  const { signature, timestamp, nonce, echostr } = req.query
  if (verifyWeChatSignature({ signature, timestamp, nonce })) {
    return res.send(echostr)
  }
  return res.status(401).send('Invalid signature')
})

router.post('/notify', express.text({ type: '*/*' }), async (req, res) => {
  // WeChat will send XML; to reduce deps, parse minimally
  const body = req.body || ''
  // Very light XML parse for essentials
  const getTag = (tag) => {
    const m = body.match(new RegExp(`<${tag}><!\[CDATA\[(.*?)\]\]></${tag}>`)) || body.match(new RegExp(`<${tag}>([^<]*)</${tag}>`))
    return m ? m[1] : ''
  }
  const msgType = getTag('MsgType')
  const event = getTag('Event')
  const fromUser = getTag('FromUserName') // openid
  const eventKey = getTag('EventKey') // qrscene_scene_str or scene_str

  try {
    if (msgType === 'event' && (event === 'subscribe' || event === 'SCAN')) {
      let scene = eventKey
      if (scene && scene.startsWith('qrscene_')) scene = scene.replace('qrscene_', '')
      if (scene) {
        markSessionAuthorized(scene, fromUser)
      }
      // welcome message (optional)
      await sendOfficialText(fromUser, '关注成功，您已完成认证，可返回网页继续操作。')
    }
  } catch (e) {
    // log but don't break WeChat response
    console.error('WeChat notify error:', e)
  }

  // Respond empty string to acknowledge
  res.send('')
})

export default router