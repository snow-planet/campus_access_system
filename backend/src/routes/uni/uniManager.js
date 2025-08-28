import { Router } from 'express'
import { User } from '../../models/User.js'
import { ApprovalRecord } from '../../models/ApprovalRecord.js'
import { Op } from 'sequelize'
import { sequelize } from '../../config/database.js'
import bcrypt from 'bcrypt'

const router = Router()

// 检查是否存在approver_applications表的模型
let ApproverApplication
try {
  // 定义审批人申请模型
  ApproverApplication = sequelize.define('ApproverApplication', {
    application_id: {
      type: sequelize.Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    user_id: {
      type: sequelize.Sequelize.INTEGER,
      allowNull: false
    },
    real_name: {
      type: sequelize.Sequelize.STRING(50),
      allowNull: false
    },
    phone: {
      type: sequelize.Sequelize.STRING(20),
      allowNull: false
    },
    college: {
      type: sequelize.Sequelize.STRING(100),
      allowNull: false
    },
    position: {
      type: sequelize.Sequelize.ENUM('teacher', 'security'),
      allowNull: false
    },
    status: {
      type: sequelize.Sequelize.ENUM('pending', 'approved', 'rejected'),
      defaultValue: 'pending'
    },
    reviewed_by: {
      type: sequelize.Sequelize.INTEGER,
      allowNull: true
    },
    reviewed_at: {
      type: sequelize.Sequelize.DATE,
      allowNull: true
    },
    rejection_reason: {
      type: sequelize.Sequelize.TEXT,
      allowNull: true
    }
  }, {
    tableName: 'approver_applications',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  })
} catch (error) {
  console.error('ApproverApplication模型定义失败:', error)
}

// 获取管理统计数据
router.get('/stats', async (req, res) => {
  try {
    const { college } = req.query
    
    // 构建查询条件
    const whereCondition = {}
    if (college) {
      whereCondition.college = college
    }

    // 获取用户统计
    const totalUsers = await User.count({ where: whereCondition })
    const activeUsers = await User.count({ 
      where: { 
        ...whereCondition,
        status: 'active' 
      } 
    })
    const pendingUsers = await User.count({ 
      where: { 
        ...whereCondition,
        status: 'pending' 
      } 
    })

    // 获取各角色用户数量
    const studentCount = await User.count({ 
      where: { 
        ...whereCondition,
        role: 'student' 
      } 
    })
    const teacherCount = await User.count({ 
      where: { 
        ...whereCondition,
        role: 'teacher' 
      } 
    })
    const securityCount = await User.count({ 
      where: { 
        ...whereCondition,
        role: 'security' 
      } 
    })

    res.json({
      code: 0,
      message: 'success',
      data: {
        approverCount: teacherCount + securityCount,
        pendingApplications: 0, // 将在下面的代码中计算
        totalUsers,
        activeUsers,
        pendingUsers,
        studentCount,
        teacherCount,
        securityCount
      }
    })
  } catch (error) {
    console.error('获取管理统计数据失败:', error)
    res.status(500).json({ code: 1, message: '获取统计数据失败' })
  }
})

// 获取账号列表
router.get('/accounts', async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      role, 
      status, 
      college, 
      search 
    } = req.query

    const offset = (page - 1) * limit
    
    // 构建查询条件
    const whereCondition = {}
    
    // 处理role参数，避免'null'字符串
    if (role && role !== 'null' && role !== 'all') {
      whereCondition.role = role
    }
    
    // 处理status参数，避免'null'字符串
    if (status && status !== 'null' && status !== 'all') {
      whereCondition.status = status
    }
    
    // 处理college参数，避免'null'字符串
    if (college && college !== 'null' && college !== 'all') {
      whereCondition.college = college
    }
    
    if (search) {
      whereCondition[Op.or] = [
        { real_name: { [Op.like]: `%${search}%` } },
        { username: { [Op.like]: `%${search}%` } },
        { phone: { [Op.like]: `%${search}%` } }
      ]
    }

    const { count, rows } = await User.findAndCountAll({
      where: whereCondition,
      attributes: ['user_id', 'real_name', 'username', 'phone', 'college', 'role', 'status', 'position', 'created_at'],
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    })

    res.json({
      code: 0,
      message: 'success',
      data: rows
    })
  } catch (error) {
    console.error('获取账号列表失败:', error)
    res.status(500).json({ code: 1, message: '获取账号列表失败' })
  }
})

// 获取申请列表
router.get('/applications', async (req, res) => {
  try {
    if (!ApproverApplication) {
      return res.status(500).json({ code: 1, message: 'ApproverApplication模型未定义' })
    }

    const { 
      page = 1, 
      limit = 10, 
      status, 
      position,
      college 
    } = req.query

    const offset = (page - 1) * limit
    
    // 构建查询条件
    const whereCondition = {}
    
    if (status) {
      whereCondition.status = status
    }
    
    if (position) {
      whereCondition.position = position
    }
    
    if (college) {
      whereCondition.college = college
    }

    const { count, rows } = await ApproverApplication.findAndCountAll({
      where: whereCondition,
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    })

    res.json({
      code: 0,
      message: 'success',
      data: {
        applications: rows,
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / limit)
      }
    })
  } catch (error) {
    console.error('获取申请列表失败:', error)
    res.status(500).json({ code: 1, message: '获取申请列表失败' })
  }
})

// 创建后台账号
router.post('/accounts', async (req, res) => {
  try {
    const { real_name, student_id, phone, college, role, password } = req.body

    // 验证必填字段
    if (!real_name || !student_id || !phone || !college || !role || !password) {
      return res.status(400).json({ code: 1, message: '请填写所有必填字段' })
    }

    // 检查学号是否已存在
    const existingUser = await User.findOne({ where: { student_id } })
    if (existingUser) {
      return res.status(400).json({ code: 1, message: '该学号已存在' })
    }

    // 加密密码
    const hashedPassword = await bcrypt.hash(password, 10)

    // 创建用户
    const newUser = await User.create({
      real_name,
      student_id,
      phone,
      college,
      role,
      password: hashedPassword,
      status: 'active'
    })

    res.json({
      code: 0,
      message: '账号创建成功',
      data: {
        user_id: newUser.user_id,
        real_name: newUser.real_name,
        student_id: newUser.student_id,
        phone: newUser.phone,
        college: newUser.college,
        role: newUser.role,
        status: newUser.status
      }
    })
  } catch (error) {
    console.error('创建账号失败:', error)
    res.status(500).json({ code: 1, message: '创建账号失败' })
  }
})

// 处理申请（通过/拒绝）
router.post('/applications/:applicationId/action', async (req, res) => {
  try {
    if (!ApproverApplication) {
      return res.status(500).json({ code: 1, message: 'ApproverApplication模型未定义' })
    }

    const { applicationId } = req.params
    const { action, rejection_reason } = req.body

    if (!['approve', 'reject'].includes(action)) {
      return res.status(400).json({ code: 1, message: '无效的操作类型' })
    }

    // 查找申请
    const application = await ApproverApplication.findByPk(applicationId)
    if (!application) {
      return res.status(404).json({ code: 1, message: '申请不存在' })
    }

    if (application.status !== 'pending') {
      return res.status(400).json({ code: 1, message: '该申请已被处理' })
    }

    // 更新申请状态
    const updateData = {
      status: action === 'approve' ? 'approved' : 'rejected',
      reviewed_at: new Date()
    }

    if (action === 'reject' && rejection_reason) {
      updateData.rejection_reason = rejection_reason
    }

    await application.update(updateData)

    // 如果通过申请，创建用户账号
    if (action === 'approve') {
      try {
        // 生成默认密码（学号后6位）
        const defaultPassword = application.user_id.toString().slice(-6).padStart(6, '0')
        const hashedPassword = await bcrypt.hash(defaultPassword, 10)

        await User.create({
          real_name: application.real_name,
          student_id: application.user_id.toString(),
          phone: application.phone,
          college: application.college,
          role: application.position,
          password: hashedPassword,
          status: 'active'
        })
      } catch (userError) {
        console.error('创建用户账号失败:', userError)
        // 回滚申请状态
        await application.update({ status: 'pending', reviewed_at: null })
        return res.status(500).json({ code: 1, message: '创建用户账号失败' })
      }
    }

    res.json({
      code: 0,
      message: action === 'approve' ? '申请已通过' : '申请已拒绝'
    })
  } catch (error) {
    console.error('处理申请失败:', error)
    res.status(500).json({ code: 1, message: '处理申请失败' })
  }
})

// 删除账号
router.delete('/accounts/:userId', async (req, res) => {
  try {
    const { userId } = req.params

    const user = await User.findByPk(userId)
    if (!user) {
      return res.status(404).json({ code: 1, message: '用户不存在' })
    }

    await user.destroy()

    res.json({
      code: 0,
      message: '账号删除成功'
    })
  } catch (error) {
    console.error('删除账号失败:', error)
    res.status(500).json({ code: 1, message: '删除账号失败' })
  }
})

// 更新账号信息
router.put('/accounts/:userId', async (req, res) => {
  try {
    const { userId } = req.params
    const { real_name, phone, college, role, status, password } = req.body

    const user = await User.findByPk(userId)
    if (!user) {
      return res.status(404).json({ code: 1, message: '用户不存在' })
    }

    const updateData = {}
    if (real_name) updateData.real_name = real_name
    if (phone) updateData.phone = phone
    if (college) updateData.college = college
    if (role) updateData.role = role
    if (status) updateData.status = status
    if (password) {
      updateData.password = await bcrypt.hash(password, 10)
    }

    await user.update(updateData)

    res.json({
      code: 0,
      message: '账号信息更新成功',
      data: {
        user_id: user.user_id,
        real_name: user.real_name,
        student_id: user.student_id,
        phone: user.phone,
        college: user.college,
        role: user.role,
        status: user.status
      }
    })
  } catch (error) {
    console.error('更新账号信息失败:', error)
    res.status(500).json({ code: 1, message: '更新账号信息失败' })
  }
})

export default router