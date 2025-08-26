import { Router } from 'express'
import { GroupReservation } from '../models/GroupReservation.js'
import { User } from '../models/User.js'
import { sendOfficialText } from '../services/wechat.js'

const router = Router()

// Web端创建团队预约
router.post('/', async (req, res) => {
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

    // 验证必填字段
    if (!openid || !purpose || !visitor_count || !contact_name || !contact_phone || !visit_date || !approver_id) {
      return res.json({ data: null, _status: 'FAIL', _error: { code: 'missing_required_fields' } })
    }

    // 验证访客人数
    if (visitor_count < 1 || visitor_count > 100) {
      return res.json({ data: null, _status: 'FAIL', _error: { code: 'invalid_visitor_count' } })
    }

    // 验证手机号格式
    const phoneRegex = /^1[3-9]\d{9}$/
    if (!phoneRegex.test(contact_phone)) {
      return res.json({ data: null, _status: 'FAIL', _error: { code: 'invalid_phone_format' } })
    }

    // 验证日期不能是过去
    const visitDate = new Date(visit_date)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    if (visitDate < today) {
      return res.json({ data: null, _status: 'FAIL', _error: { code: 'invalid_visit_date' } })
    }

    // 根据openid查找或创建用户
    let user = await User.findOne({ where: { openid } })
    if (!user) {
      // 创建新用户
      user = await User.create({
        openid,
        username: contact_name || '微信用户',
        phone: contact_phone || '未填写',
        real_name: contact_name || '微信用户',
        role: 'user',
        status: 'active'
      })
    } else {
      // 更新用户信息
      await user.update({
        username: contact_name || user.username,
        phone: contact_phone || user.phone,
        real_name: contact_name || user.real_name
      })
    }

    // 创建团队预约记录
    const reservation = await GroupReservation.create({
      user_id: user.user_id,
      purpose,
      visitor_count: parseInt(visitor_count),
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

    // 发送通知
    try {
      const message = `您的团队预约申请已提交成功！\n\n预约信息：\n事由：${purpose}\n访客人数：${visitor_count}人\n联系人：${contact_name}\n联系电话：${contact_phone}\n预约日期：${visit_date}\n\n我们将尽快为您处理，请耐心等待审批结果。`
      await sendOfficialText(openid, message)
    } catch (notifyError) {
      console.error('发送通知失败:', notifyError)
      // 不影响预约创建，只记录错误
    }

    res.json({
      data: {
        reservation_id: reservation.reservation_id,
        status: reservation.status,
        message: '团队预约申请提交成功'
      },
      _status: 'OK'
    })
  } catch (error) {
    console.error('创建Web端团队预约失败:', error)
    res.json({ data: null, _status: 'FAIL', _error: { code: 'server_error', meta: error.message } })
  }
})

export default router