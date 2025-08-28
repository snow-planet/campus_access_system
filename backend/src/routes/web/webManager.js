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
    created_at: {
      type: sequelize.Sequelize.DATE,
      defaultValue: sequelize.Sequelize.NOW
    }
  }, {
    tableName: 'approver_applications',
    timestamps: false
  })
} catch (error) {
  console.error('ApproverApplication模型定义失败:', error)
}

// Web端获取审批人统计数据
router.get('/stats', async (req, res) => {
  try {
    const { college } = req.query
    
    // 构建查询条件
    const whereCondition = {
      role: 'approver',
      status: 'active'
    }
    
    if (college && college !== 'all') {
      whereCondition.college = college
    }
    
    // 统计审批人数量
    const approverCount = await User.count({
      where: whereCondition
    })
    
    // 统计待处理申请数量
    let pendingApplicationCount = 0
    if (ApproverApplication) {
      try {
        const applicationWhereCondition = { status: 'pending' }
        if (college && college !== 'all') {
          applicationWhereCondition.college = college
        }
        
        pendingApplicationCount = await ApproverApplication.count({
          where: applicationWhereCondition
        })
      } catch (error) {
        console.warn('获取待处理申请数量失败:', error)
      }
    }
    
    res.json({
      _status: 'OK',
      data: {
        approverCount,
        pendingApplicationCount
      }
    })
  } catch (error) {
    console.error('Web端获取统计数据失败:', error)
    res.status(500).json({
      _status: 'FAIL',
      _error: { code: 'SERVER_ERROR', meta: '服务器内部错误' }
    })
  }
})

// Web端获取账号列表
router.get('/accounts', async (req, res) => {
  try {
    const {
      role = 'all',
      college = 'all',
      page = 1,
      pageSize = 10
    } = req.query

    const limit = parseInt(pageSize)
    const offset = (parseInt(page) - 1) * limit

    // 构建查询条件
    const whereCondition = {}
    
    if (role !== 'all') {
      whereCondition.role = role
    }
    
    if (college !== 'all') {
      whereCondition.college = college
    }

    // 查询账号列表
    const { count, rows: accounts } = await User.findAndCountAll({
      where: whereCondition,
      attributes: [
        'user_id', 'username', 'real_name', 'phone', 
        'college', 'position', 'role', 'status', 'created_at'
      ],
      order: [['created_at', 'DESC']],
      limit,
      offset
    })

    res.json({
      _status: 'OK',
      data: {
        accounts,
        total: count,
        page: parseInt(page),
        pageSize: limit,
        totalPages: Math.ceil(count / limit)
      }
    })
  } catch (error) {
    console.error('Web端获取账号列表失败:', error)
    res.status(500).json({
      _status: 'FAIL',
      _error: { code: 'SERVER_ERROR', meta: '服务器内部错误' }
    })
  }
})

// Web端获取申请列表
router.get('/applications', async (req, res) => {
  try {
    if (!ApproverApplication) {
      return res.json({
        _status: 'OK',
        data: {
          applications: [],
          total: 0,
          page: 1,
          pageSize: 10,
          totalPages: 0
        }
      })
    }

    const {
      position = 'all',
      status = 'all',
      college = 'all',
      page = 1,
      pageSize = 10
    } = req.query

    const limit = parseInt(pageSize)
    const offset = (parseInt(page) - 1) * limit

    // 构建查询条件
    const whereCondition = {}
    
    if (position !== 'all') {
      whereCondition.position = position
    }
    
    if (status !== 'all') {
      whereCondition.status = status
    }
    
    if (college !== 'all') {
      whereCondition.college = college
    }

    // 查询申请列表
    const { count, rows: applications } = await ApproverApplication.findAndCountAll({
      where: whereCondition,
      order: [['created_at', 'DESC']],
      limit,
      offset
    })

    res.json({
      _status: 'OK',
      data: {
        applications,
        total: count,
        page: parseInt(page),
        pageSize: limit,
        totalPages: Math.ceil(count / limit)
      }
    })
  } catch (error) {
    console.error('Web端获取申请列表失败:', error)
    res.status(500).json({
      _status: 'FAIL',
      _error: { code: 'SERVER_ERROR', meta: '服务器内部错误' }
    })
  }
})

// Web端创建后台账号
router.post('/accounts', async (req, res) => {
  try {
    const {
      username,
      password,
      real_name,
      phone,
      college,
      position = 'other'
    } = req.body
    
    // 验证必填参数
    if (!username || !password || !real_name || !phone || !college) {
      return res.status(400).json({
        _status: 'FAIL',
        _error: { code: 'MISSING_PARAMS', meta: '缺少必要参数' }
      })
    }
    
    // 检查用户名是否已存在
    const existingUser = await User.findOne({
      where: { username }
    })
    
    if (existingUser) {
      return res.status(400).json({
        _status: 'FAIL',
        _error: { code: 'USERNAME_EXISTS', meta: '用户名已存在' }
      })
    }
    
    // 加密密码
    const hashedPassword = await bcrypt.hash(password, 10)
    
    // 创建账号
    const newUser = await User.create({
      username,
      password: hashedPassword,
      real_name,
      phone,
      college,
      position,
      role: 'admin', // 默认创建后台账号
      status: 'active'
    })
    
    res.json({
      _status: 'OK',
      data: {
        user_id: newUser.user_id,
        username: newUser.username,
        real_name: newUser.real_name,
        message: '账号创建成功'
      }
    })
  } catch (error) {
    console.error('Web端创建账号失败:', error)
    res.status(500).json({
      _status: 'FAIL',
      _error: { code: 'SERVER_ERROR', meta: '服务器内部错误' }
    })
  }
})

// Web端处理申请（通过/拒绝）
router.post('/applications/:applicationId/action', async (req, res) => {
  try {
    if (!ApproverApplication) {
      return res.status(400).json({
        _status: 'FAIL',
        _error: { code: 'FEATURE_UNAVAILABLE', meta: '申请功能不可用' }
      })
    }

    const { applicationId } = req.params
    const { action, reviewer_id } = req.body
    
    // 验证必填参数
    if (!action || !reviewer_id) {
      return res.status(400).json({
        _status: 'FAIL',
        _error: { code: 'MISSING_PARAMS', meta: '缺少必要参数' }
      })
    }
    
    // 验证操作类型
    if (!['approve', 'reject'].includes(action)) {
      return res.status(400).json({
        _status: 'FAIL',
        _error: { code: 'INVALID_ACTION', meta: '无效的操作类型' }
      })
    }
    
    // 查找申请记录
    const application = await ApproverApplication.findByPk(applicationId)
    if (!application) {
      return res.status(404).json({
        _status: 'FAIL',
        _error: { code: 'APPLICATION_NOT_FOUND', meta: '申请记录不存在' }
      })
    }
    
    // 检查申请状态
    if (application.status !== 'pending') {
      return res.status(400).json({
        _status: 'FAIL',
        _error: { code: 'ALREADY_PROCESSED', meta: '该申请已被处理' }
      })
    }
    
    const newStatus = action === 'approve' ? 'approved' : 'rejected'
    
    // 如果是通过申请，需要创建审批人账号
    if (action === 'approve') {
      // 生成用户名（可以基于姓名和时间戳）
      const timestamp = Date.now().toString().slice(-4)
      const username = `approver_${application.real_name}_${timestamp}`
      
      // 生成默认密码
      const defaultPassword = '123456'
      const hashedPassword = await bcrypt.hash(defaultPassword, 10)
      
      // 创建审批人账号
      await User.create({
        username,
        password: hashedPassword,
        real_name: application.real_name,
        phone: application.phone,
        college: application.college,
        position: application.position,
        role: 'approver',
        status: 'active'
      })
    }
    
    // 更新申请状态
    await application.update({
      status: newStatus,
      reviewed_by: parseInt(reviewer_id),
      reviewed_at: new Date()
    })
    
    res.json({
      _status: 'OK',
      data: {
        application_id: applicationId,
        status: newStatus,
        action,
        message: action === 'approve' ? '申请已通过，账号已创建' : '申请已拒绝'
      }
    })
  } catch (error) {
    console.error('Web端处理申请失败:', error)
    res.status(500).json({
      _status: 'FAIL',
      _error: { code: 'SERVER_ERROR', meta: '服务器内部错误' }
    })
  }
})

// Web端删除账号
router.delete('/accounts/:userId', async (req, res) => {
  try {
    const { userId } = req.params
    
    // 查找用户
    const user = await User.findByPk(userId)
    if (!user) {
      return res.status(404).json({
        _status: 'FAIL',
        _error: { code: 'USER_NOT_FOUND', meta: '用户不存在' }
      })
    }
    
    // 删除用户
    await user.destroy()
    
    res.json({
      _status: 'OK',
      data: {
        user_id: userId,
        message: '账号删除成功'
      }
    })
  } catch (error) {
    console.error('Web端删除账号失败:', error)
    res.status(500).json({
      _status: 'FAIL',
      _error: { code: 'SERVER_ERROR', meta: '服务器内部错误' }
    })
  }
})

// Web端更新账号信息
router.put('/accounts/:userId', async (req, res) => {
  try {
    const { userId } = req.params
    const {
      real_name,
      phone,
      college,
      position,
      status
    } = req.body
    
    // 查找用户
    const user = await User.findByPk(userId)
    if (!user) {
      return res.status(404).json({
        _status: 'FAIL',
        _error: { code: 'USER_NOT_FOUND', meta: '用户不存在' }
      })
    }
    
    // 更新用户信息
    const updateData = {}
    if (real_name) updateData.real_name = real_name
    if (phone) updateData.phone = phone
    if (college) updateData.college = college
    if (position) updateData.position = position
    if (status) updateData.status = status
    
    await user.update(updateData)
    
    res.json({
      _status: 'OK',
      data: {
        user_id: userId,
        message: '账号信息更新成功'
      }
    })
  } catch (error) {
    console.error('Web端更新账号失败:', error)
    res.status(500).json({
      _status: 'FAIL',
      _error: { code: 'SERVER_ERROR', meta: '服务器内部错误' }
    })
  }
})

export default router