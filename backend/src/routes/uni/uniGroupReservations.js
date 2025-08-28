import { Router } from 'express'
import { GroupReservation } from '../../models/GroupReservation.js'
import { User } from '../../models/User.js'
import { sendOfficialText } from '../../services/wechat.js'

const router = Router()

// 创建团队预约
router.post('/', async (req, res) => {
  try {
    const {
      user_id,
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
    if (!user_id || !purpose || !visitor_count || !contact_name || !contact_phone || !visit_date || !approver_id) {
      return res.status(400).json({ code: 1, message: '缺少必填字段' })
    }

    // 验证访客人数
    if (visitor_count < 1 || visitor_count > 100) {
      return res.status(400).json({ code: 1, message: '访客人数必须在1-100之间' })
    }

    // 验证手机号格式
    const phoneRegex = /^1[3-9]\d{9}$/
    if (!phoneRegex.test(contact_phone)) {
      return res.status(400).json({ code: 1, message: '联系人手机号格式不正确' })
    }

    // 验证日期不能是过去
    const visitDate = new Date(visit_date)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    if (visitDate < today) {
      return res.status(400).json({ code: 1, message: '预约日期不能是过去的日期' })
    }

    // 创建团队预约记录
    const reservation = await GroupReservation.create({
      user_id,
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

    // 获取用户信息用于发送通知
    const user = await User.findByPk(user_id)
    if (user && user.openid) {
      try {
        const message = `您的团队预约申请已提交成功！\n\n预约信息：\n事由：${purpose}\n访客人数：${visitor_count}人\n联系人：${contact_name}\n联系电话：${contact_phone}\n预约日期：${visit_date}\n\n我们将尽快为您处理，请耐心等待审批结果。`
        await sendOfficialText(user.openid, message)
      } catch (notifyError) {
        console.error('发送通知失败:', notifyError)
        // 不影响预约创建，只记录错误
      }
    }

    res.json({
      code: 0,
      message: '团队预约申请提交成功',
      data: {
        reservation_id: reservation.reservation_id,
        status: reservation.status
      }
    })
  } catch (error) {
    console.error('创建团队预约失败:', error)
    res.status(500).json({ code: 1, message: '服务器内部错误' })
  }
})

// 获取用户的团队预约列表
router.get('/user/:user_id', async (req, res) => {
  try {
    const { user_id } = req.params
    const { page = 1, limit = 10, status } = req.query

    const where = { user_id }
    if (status) where.status = status

    const offset = (page - 1) * limit
    const { count, rows } = await GroupReservation.findAndCountAll({
      where,
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset),
      include: [
        {
          model: User,
          as: 'approver',
          attributes: ['user_id', 'real_name', 'college'],
          foreignKey: 'approver_id'
        }
      ]
    })

    res.json({
      code: 0,
      data: {
        reservations: rows,
        total: count,
        page: parseInt(page),
        limit: parseInt(limit)
      }
    })
  } catch (error) {
    console.error('获取团队预约列表失败:', error)
    res.status(500).json({ code: 1, message: '服务器内部错误' })
  }
})

// 获取单个团队预约详情
router.get('/:reservation_id', async (req, res) => {
  try {
    const { reservation_id } = req.params

    const reservation = await GroupReservation.findByPk(reservation_id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['user_id', 'real_name', 'phone'],
          foreignKey: 'user_id'
        },
        {
          model: User,
          as: 'approver',
          attributes: ['user_id', 'real_name', 'college'],
          foreignKey: 'approver_id'
        }
      ]
    })

    if (!reservation) {
      return res.status(404).json({ code: 1, message: '团队预约记录不存在' })
    }

    res.json({ code: 0, data: reservation })
  } catch (error) {
    console.error('获取团队预约详情失败:', error)
    res.status(500).json({ code: 1, message: '服务器内部错误' })
  }
})

// 更新团队预约状态（审批）
router.put('/:reservation_id/status', async (req, res) => {
  try {
    const { reservation_id } = req.params
    const { status, remark } = req.body

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ code: 1, message: '无效的状态值' })
    }

    const reservation = await GroupReservation.findByPk(reservation_id)
    if (!reservation) {
      return res.status(404).json({ code: 1, message: '团队预约记录不存在' })
    }

    if (reservation.status !== 'pending') {
      return res.status(400).json({ code: 1, message: '该预约已经被处理过了' })
    }

    // 更新状态
    await reservation.update({ status })

    // 发送审批结果通知
    const user = await User.findByPk(reservation.user_id)
    if (user && user.openid) {
      try {
        const statusText = status === 'approved' ? '已通过' : '已拒绝'
        const message = `您的团队预约申请${statusText}！\n\n预约信息：\n事由：${reservation.purpose}\n访客人数：${reservation.visitor_count}人\n预约日期：${reservation.visit_date}\n\n${remark ? `备注：${remark}` : ''}`
        await sendOfficialText(user.openid, message)
      } catch (notifyError) {
        console.error('发送审批通知失败:', notifyError)
      }
    }

    res.json({ code: 0, message: '审批完成', data: { status } })
  } catch (error) {
    console.error('更新团队预约状态失败:', error)
    res.status(500).json({ code: 1, message: '服务器内部错误' })
  }
})

export default router