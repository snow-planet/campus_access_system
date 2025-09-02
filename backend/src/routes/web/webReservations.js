import express from 'express'
import { IndividualReservation } from '../../models/IndividualReservation.js'
import { GroupReservation } from '../../models/GroupReservation.js'
import { User } from '../../models/User.js'
import { sendOfficialText } from '../../services/wechat.js'

const router = express.Router()

// Create individual reservation for web, requires openid proved by QR login
router.post('/', async (req, res) => {
  try {
    const { openid, real_name, phone, college, purpose, visit_date, approver_id, entry_time, exit_time, gate, license_plate } = req.body
    if (!openid) return res.status(400).json({ data: null, _status: 'FAIL', _error: { code: 'auth.no_openid' } })

    // find or create user by openid
    let user = await User.findOne({ where: { openid } })
    if (!user) {
      // Create minimal valid user (user_id is auto-increment, do not set manually)
      user = await User.create({
        openid,
        username: real_name || 'web_user',
        phone: phone || '00000000000',
        real_name: real_name || 'Web用户',
        college: college || null,
        role: 'user',
        status: 'active'
      })
    }

    const record = await IndividualReservation.create({
      user_id: user.user_id,
      purpose,
      visit_date,
      entry_time: entry_time || null,
      exit_time: exit_time || null,
      gate: gate || '北门',
      license_plate: license_plate || null,
      approver_id,
      status: 'pending'
    })

    try {
      await sendOfficialText(openid, `您的预约已提交，编号：${record.reservation_id}，请等待审批。`)
    } catch (e) {
      console.warn('sendOfficialText failed:', e?.message)
    }

    res.json({ data: { id: record.reservation_id }, _status: 'OK' })
  } catch (e) {
    res.status(500).json({ data: null, _status: 'FAIL', _error: { code: 'reservation.create_failed', meta: e.message } })
  }
})

// Create group reservation for web
router.post('/group', async (req, res) => {
  try {
    const {
      openid,
      purpose,
      visitor_count,
      contact_name,
      contact_phone,
      visit_date,
      entry_time,
      exit_time,
      gate,
      license_plate,
      approver_id
    } = req.body

    if (!openid) return res.status(400).json({ data: null, _status: 'FAIL', _error: { code: 'auth.no_openid' } })

    // Validate visitor count
    const visitorCountNum = parseInt(visitor_count)
    if (isNaN(visitorCountNum) || visitorCountNum < 1 || visitorCountNum > 100) {
      return res.status(400).json({
        data: null,
        _status: 'FAIL',
        _error: { code: 'invalid_visitor_count', meta: '访客人数必须在1-100之间' }
      })
    }

    // Validate phone format
    const phoneRegex = /^1[3-9]\d{9}$/
    if (!phoneRegex.test(contact_phone)) {
      return res.status(400).json({
        data: null,
        _status: 'FAIL',
        _error: { code: 'invalid_phone', meta: '手机号格式不正确' }
      })
    }

    // Find or create user by openid
    let user = await User.findOne({ where: { openid } })
    if (!user) {
      user = await User.create({
        openid,
        username: contact_name || 'group_user',
        phone: contact_phone || '00000000000',
        real_name: contact_name || 'Group用户',
        role: 'user',
        status: 'active'
      })
    } else {
      // Update user info
      await user.update({
        real_name: contact_name,
        phone: contact_phone
      })
    }

    const record = await GroupReservation.create({
      user_id: user.user_id,
      purpose,
      visitor_count: visitorCountNum,
      contact_name,
      contact_phone,
      visit_date,
      entry_time: entry_time || null,
      exit_time: exit_time || null,
      gate: gate || '北门',
      license_plate: license_plate || null,
      approver_id,
      status: 'pending'
    })

    try {
      await sendOfficialText(openid, `您的团体预约已提交，编号：${record.reservation_id}，请等待审批。`)
    } catch (e) {
      console.warn('sendOfficialText failed:', e?.message)
    }

    res.json({ data: { id: record.reservation_id }, _status: 'OK' })
  } catch (e) {
    res.status(500).json({ data: null, _status: 'FAIL', _error: { code: 'group_reservation.create_failed', meta: e.message } })
  }
})

// Get users list (for approver selection)
router.get('/', async (req, res) => {
  try {
    const { role = 'approver' } = req.query

    const users = await User.findAll({
      where: {
        role: ['approver', 'admin'],
        status: 'active'
      },
      attributes: ['user_id', 'real_name', 'username', 'college', 'position'],
      order: [['real_name', 'ASC']]
    })

    res.json({
      code: 0,
      data: users,
      message: '获取用户列表成功'
    })
  } catch (error) {
    console.error('获取用户列表失败:', error)
    res.status(500).json({
      code: -1,
      data: null,
      message: '服务器内部错误'
    })
  }
})

export default router