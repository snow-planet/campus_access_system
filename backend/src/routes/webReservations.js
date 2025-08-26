import express from 'express'
import { IndividualReservation } from '../models/IndividualReservation.js'
import { User } from '../models/User.js'
import { sendOfficialText } from '../services/wechat.js'

const router = express.Router()

// Create reservation for web, requires openid proved by QR login
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

export default router