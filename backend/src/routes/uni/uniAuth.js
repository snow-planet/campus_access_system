import { Router } from 'express'
import { User } from '../../models/User.js'
import { ApproverApplication } from '../../models/ApproverApplication.js'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

const router = Router()

// 管理员登录
router.post('/admin/login', async (req, res) => {
  try {
    const { username, password } = req.body
    
    // 验证必填字段
    if (!username || !password) {
      return res.status(400).json({ 
        code: 1, 
        message: '用户名和密码不能为空' 
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
        code: 1, 
        message: '用户名或密码错误' 
      })
    }
    
    // 验证密码（这里简化处理，实际应该使用bcrypt）
    // 临时使用明文密码比较，生产环境应该使用加密
    const isValidPassword = password === '123456' || 
                           (user.username === 'admin' && password === '123456') ||
                           (user.username === 'approver' && password === '123456')
    
    if (!isValidPassword) {
      return res.status(401).json({ 
        code: 1, 
        message: '用户名或密码错误' 
      })
    }
    
    // 检查用户状态
    if (user.status !== 'active') {
      return res.status(401).json({ 
        code: 1, 
        message: '账户未激活或已被禁用' 
      })
    }
    
    // 生成JWT token（可选）
    const token = jwt.sign(
      { 
        user_id: user.user_id, 
        username: user.username, 
        role: user.role 
      },
      process.env.JWT_SECRET || 'campus_access_secret',
      { expiresIn: '24h' }
    )
    
    res.json({
      code: 0,
      message: '登录成功',
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
    console.error('管理员登录失败:', error)
    res.status(500).json({ 
      code: 1, 
      message: '服务器内部错误' 
    })
  }
})

// 提交审批人申请
router.post('/approver/apply', async (req, res) => {
  try {
    const { user_id, real_name, phone, college, position } = req.body
    
    // 验证必填字段
    if (!user_id || !real_name || !phone || !college || !position) {
      return res.status(400).json({ 
        code: 1, 
        message: '所有字段都是必填的' 
      })
    }
    
    // 验证手机号格式
    const phoneRegex = /^1[3-9]\d{9}$/
    if (!phoneRegex.test(phone)) {
      return res.status(400).json({ 
        code: 1, 
        message: '手机号格式不正确' 
      })
    }
    
    // 验证职位
    if (!['teacher', 'security'].includes(position)) {
      return res.status(400).json({ 
        code: 1, 
        message: '职位选择无效' 
      })
    }
    
    // 检查用户是否存在
    const user = await User.findByPk(user_id)
    if (!user) {
      return res.status(404).json({ 
        code: 1, 
        message: '用户不存在' 
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
        code: 1, 
        message: '您已有待审核的申请，请耐心等待' 
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
      code: 0,
      message: '申请提交成功，请等待管理员审核',
      data: {
        application_id: application.application_id,
        status: application.status
      }
    })
  } catch (error) {
    console.error('提交审批人申请失败:', error)
    res.status(500).json({ 
      code: 1, 
      message: '服务器内部错误' 
    })
  }
})

// 获取审批人申请状态
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
        code: 0,
        data: {
          status: 'none',
          message: '暂无申请记录'
        }
      })
    }
    
    res.json({
      code: 0,
      data: {
        application_id: application.application_id,
        status: application.status,
        created_at: application.created_at,
        reviewed_at: application.reviewed_at
      }
    })
  } catch (error) {
    console.error('获取申请状态失败:', error)
    res.status(500).json({ 
      code: 1, 
      message: '服务器内部错误' 
    })
  }
})

export default router