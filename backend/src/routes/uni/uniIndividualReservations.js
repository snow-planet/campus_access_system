import { Router } from 'express'
import { IndividualReservation } from '../../models/IndividualReservation.js'
import { User } from '../../models/User.js'
import { sendOfficialText } from '../../services/wechat.js'

const router = Router()

// POST /api/individual-reservations
router.post('/', async (req, res) => {
  try {
    const {
      user_id, purpose, visit_date, entry_time, exit_time,
      gate, license_plate, approver_id
    } = req.body || {}

    if (!user_id || !purpose || !visit_date || !approver_id) {
      return res.status(400).json({ code: 1, message: 'Missing required fields' })
    }

    const reservation = await IndividualReservation.create({
      user_id,
      purpose,
      visit_date,
      entry_time: entry_time || null,
      exit_time: exit_time || null,
      gate: gate || '北门',
      license_plate: license_plate || null,
      approver_id,
      status: 'pending',
    })

    // 尝试发送服务号文本消息（预约提交成功）
    try {
      const user = await User.findByPk(user_id)
      if (user && user.openid) {
        await sendOfficialText(user.openid, `您的个人预约已提交成功，预约日期：${visit_date}。待审批人处理。`)
      }
    } catch (e) {
      console.warn('send wechat message failed:', e.message)
    }

    res.json({ code: 0, data: reservation })
  } catch (err) {
    console.error(err)
    res.status(500).json({ code: 1, message: 'Server error' })
  }
})

export default router