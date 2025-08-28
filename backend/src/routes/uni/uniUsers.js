import { Router } from 'express'
import { User } from '../../models/User.js'

const router = Router()

// GET /api/users?role=approver
router.get('/', async (req, res) => {
  try {
    const { role } = req.query
    const where = {}
    if (role) where.role = role
    const list = await User.findAll({
      where,
      order: [['created_at', 'DESC']],
      limit: 500,
    })
    res.json({ code: 0, data: list })
  } catch (err) {
    console.error(err)
    res.status(500).json({ code: 1, message: 'Server error' })
  }
})

// GET /api/users/:userId - 获取单个用户信息
router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params
    const user = await User.findByPk(userId)
    
    if (!user) {
      return res.status(404).json({ 
        code: 1, 
        message: '用户不存在' 
      })
    }
    
    res.json({ 
      code: 0, 
      message: 'success',
      data: {
        user_id: user.user_id,
        username: user.username,
        real_name: user.real_name,
        role: user.role,
        college: user.college,
        department: user.college, // 兼容department字段
        phone: user.phone,
        position: user.position
      }
    })
  } catch (err) {
    console.error('获取用户信息失败:', err)
    res.status(500).json({ 
      code: 1, 
      message: '服务器错误' 
    })
  }
})

export default router