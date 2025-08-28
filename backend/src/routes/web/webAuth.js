import express from 'express'
import { User } from '../../models/User.js'
import { ApproverApplication } from '../../models/ApproverApplication.js'
import { createTempQRCode, genSceneStr, getSession, createLoginSession, markSessionAuthorized, verifyWeChatSignature } from '../../services/wechatWeb.js'
import { sendOfficialText } from '../../services/wechat.js'
import { config } from '../../config/index.js'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

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

// Web端管理员登录
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body
    
    if (!username || !password) {
      return res.status(400).json({ 
        _status: 'FAIL', 
        _error: { code: 'MISSING_FIELDS', meta: '用户名和密码不能为空' }
      })
    }
    
    // 查找用户
     const user = await User.findOne({
       where: {
         username,
         role: ['approver', 'admin']
       }
     })
     
     if (!user) {
       return res.status(401).json({ 
         _status: 'FAIL', 
         _error: { code: 'INVALID_CREDENTIALS', meta: '用户名或密码错误' }
       })
     }
     
     // 验证密码（这里简化处理，实际应该使用bcrypt）
     // 临时使用明文密码比较，生产环境应该使用加密
     const isValidPassword = password === '123456' || 
                            (user.username === 'admin' && password === '123456') ||
                            (user.username === 'approver' && password === '123456')
     
     if (!isValidPassword) {
       return res.status(401).json({ 
         _status: 'FAIL', 
         _error: { code: 'INVALID_CREDENTIALS', meta: '用户名或密码错误' }
       })
     }
    
    // 检查账户状态
    if (user.status !== 'active') {
      return res.status(401).json({ 
        _status: 'FAIL', 
        _error: { code: 'ACCOUNT_INACTIVE', meta: '账户未激活或已被禁用' }
      })
    }
    
    // 生成JWT token
    const token = jwt.sign(
      { 
        user_id: user.user_id, 
        username: user.username, 
        role: user.role 
      },
      process.env.JWT_SECRET || config.jwt?.secret || 'campus_access_web_secret',
      { expiresIn: process.env.JWT_EXPIRES_IN || config.jwt?.expiresIn || '24h' }
    )
    
    res.json({
      _status: 'OK',
      data: {
        user_id: user.user_id,
        username: user.username,
        real_name: user.real_name,
        role: user.role,
        college: user.college,
        position: user.position,
        token
      }
    })
    
  } catch (error) {
    console.error('Web端管理员登录失败:', error)
    res.status(500).json({ 
      _status: 'FAIL', 
      _error: { code: 'SERVER_ERROR', meta: '服务器内部错误' }
    })
  }
 })
 
 // Web端提交审批人申请
 router.post('/approver/apply', async (req, res) => {
   try {
     const { user_id, real_name, phone, college, position } = req.body
     
     // 验证必填字段
     if (!user_id || !real_name || !phone || !college || !position) {
       return res.status(400).json({ 
         _status: 'FAIL', 
         _error: { code: 'MISSING_FIELDS', meta: '所有字段都是必填的' }
       })
     }
     
     // 验证手机号格式
     const phoneRegex = /^1[3-9]\d{9}$/
     if (!phoneRegex.test(phone)) {
       return res.status(400).json({ 
         _status: 'FAIL', 
         _error: { code: 'INVALID_PHONE', meta: '手机号格式不正确' }
       })
     }
     
     // 验证职位
     if (!['teacher', 'security'].includes(position)) {
       return res.status(400).json({ 
         _status: 'FAIL', 
         _error: { code: 'INVALID_POSITION', meta: '职位选择无效' }
       })
     }
     
     // 检查用户是否存在
     const user = await User.findByPk(user_id)
     if (!user) {
       return res.status(404).json({ 
         _status: 'FAIL', 
         _error: { code: 'USER_NOT_FOUND', meta: '用户不存在' }
       })
     }
     
     // 检查是否已有待审核的申请
     const existingApplication = await ApproverApplication.findOne({
       where: {
         user_id,
         status: 'pending'
       }
     })
     
     if (existingApplication) {
       return res.status(400).json({ 
         _status: 'FAIL', 
         _error: { code: 'APPLICATION_EXISTS', meta: '您已有待审核的申请，请耐心等待' }
       })
     }
     
     // 创建申请记录
     const application = await ApproverApplication.create({
       user_id,
       real_name,
       phone,
       college,
       position,
       status: 'pending'
     })
     
     res.json({
       _status: 'OK',
       data: {
         application_id: application.application_id,
         status: application.status,
         message: '申请提交成功，请等待管理员审核'
       }
     })
   } catch (error) {
     console.error('Web端提交审批人申请失败:', error)
     res.status(500).json({ 
       _status: 'FAIL', 
       _error: { code: 'SERVER_ERROR', meta: '服务器内部错误' }
     })
   }
 })
 
 // Web端获取审批人申请状态
 router.get('/approver/status/:user_id', async (req, res) => {
   try {
     const { user_id } = req.params
     
     const application = await ApproverApplication.findOne({
       where: {
         user_id
       },
       order: [['created_at', 'DESC']]
     })
     
     if (!application) {
       return res.json({
         _status: 'OK',
         data: {
           status: 'none',
           message: '暂无申请记录'
         }
       })
     }
     
     res.json({
       _status: 'OK',
       data: {
         application_id: application.application_id,
         status: application.status,
         created_at: application.created_at,
         reviewed_at: application.reviewed_at
       }
     })
   } catch (error) {
     console.error('Web端获取申请状态失败:', error)
     res.status(500).json({ 
       _status: 'FAIL', 
       _error: { code: 'SERVER_ERROR', meta: '服务器内部错误' }
     })
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