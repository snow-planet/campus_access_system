import { Router } from 'express'
import { User } from '../../models/User.js'
import { IndividualReservation } from '../../models/IndividualReservation.js'
import { GroupReservation } from '../../models/GroupReservation.js'
import { ApprovalRecord } from '../../models/ApprovalRecord.js'
import { Op } from 'sequelize'
import { sequelize } from '../../config/database.js'

const router = Router()

// 获取审批列表
router.get('/list', async (req, res) => {
  try {
    const { 
      approver_id, 
      type = 'all', 
      status = 'all', 
      page = 1, 
      pageSize = 10 
    } = req.query
    
    if (!approver_id) {
      return res.status(400).json({
        code: 1,
        message: '缺少审批人ID参数'
      })
    }
    
    const offset = (page - 1) * pageSize
    const limit = parseInt(pageSize)
    
    // 构建查询条件
    const whereCondition = {
      approver_id: parseInt(approver_id)
    }
    
    if (status !== 'all') {
      whereCondition.status = status
    }
    
    let individualReservations = []
    let groupReservations = []
    
    // 查询个人预约
    if (type === 'all' || type === 'personal') {
      individualReservations = await IndividualReservation.findAll({
        where: whereCondition,
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['user_id', 'real_name', 'phone']
          },
          {
            model: User,
            as: 'approver',
            attributes: ['user_id', 'real_name']
          }
        ],
        order: [['created_at', 'DESC']]
      })
    }
    
    // 查询团体预约
    if (type === 'all' || type === 'group') {
      groupReservations = await GroupReservation.findAll({
        where: whereCondition,
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['user_id', 'real_name', 'phone']
          },
          {
            model: User,
            as: 'approver',
            attributes: ['user_id', 'real_name']
          }
        ],
        order: [['created_at', 'DESC']]
      })
    }
    
    // 合并并格式化数据
    const allApplications = []
    
    // 处理个人预约
    individualReservations.forEach(reservation => {
      allApplications.push({
        id: reservation.reservation_id,
        type: 'personal',
        applicantName: reservation.user?.real_name || '未知用户',
        applicantPhone: reservation.user?.phone || '',
        purpose: reservation.purpose,
        visitDate: reservation.visit_date,
        entryTime: reservation.entry_time,
        exitTime: reservation.exit_time,
        gate: reservation.gate,
        licensePlate: reservation.license_plate,
        status: reservation.status,
        applyTime: reservation.created_at,
        accessTime: `${reservation.visit_date} ${reservation.entry_time || ''}-${reservation.exit_time || ''}`,
        reason: reservation.purpose,
        reviewer: reservation.approver?.real_name || '',
        reviewTime: reservation.updated_at !== reservation.created_at ? reservation.updated_at : '',
        rejectReason: '' // 需要从审批记录中获取
      })
    })
    
    // 处理团体预约
    groupReservations.forEach(reservation => {
      allApplications.push({
        id: reservation.reservation_id,
        type: 'group',
        applicantName: reservation.contact_name,
        applicantPhone: reservation.contact_phone,
        purpose: reservation.purpose,
        visitDate: reservation.visit_date,
        entryTime: reservation.entry_time,
        exitTime: reservation.exit_time,
        gate: reservation.gate,
        licensePlate: reservation.license_plate,
        groupSize: reservation.visitor_count,
        status: reservation.status,
        applyTime: reservation.created_at,
        accessTime: `${reservation.visit_date} ${reservation.entry_time || ''}-${reservation.exit_time || ''}`,
        reason: reservation.purpose,
        reviewer: reservation.approver?.real_name || '',
        reviewTime: reservation.updated_at !== reservation.created_at ? reservation.updated_at : '',
        rejectReason: '' // 需要从审批记录中获取
      })
    })
    
    // 按创建时间排序
    allApplications.sort((a, b) => new Date(b.applyTime) - new Date(a.applyTime))
    
    // 分页处理
    const total = allApplications.length
    const paginatedApplications = allApplications.slice(offset, offset + limit)
    
    // 获取驳回原因
    for (let app of paginatedApplications) {
      if (app.status === 'rejected') {
        const approvalRecord = await ApprovalRecord.findOne({
          where: {
            reservation_id: app.id,
            reservation_type: app.type === 'personal' ? 'individual' : 'group',
            action: 'reject'
          },
          order: [['created_at', 'DESC']]
        })
        if (approvalRecord) {
          app.rejectReason = approvalRecord.comments || '无具体原因'
        }
      }
    }
    
    res.json({
      code: 0,
      data: {
        list: paginatedApplications,
        total,
        page: parseInt(page),
        pageSize: limit,
        totalPages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('获取审批列表失败:', error)
    res.status(500).json({
      code: 1,
      message: '服务器内部错误'
    })
  }
})

// 审批操作（通过/驳回）
router.post('/action', async (req, res) => {
  try {
    const { 
      reservation_id, 
      reservation_type, 
      action, 
      approver_id, 
      comments = '' 
    } = req.body
    
    // 验证必填参数
    if (!reservation_id || !reservation_type || !action || !approver_id) {
      return res.status(400).json({
        code: 1,
        message: '缺少必要参数'
      })
    }
    
    // 验证操作类型
    if (!['approve', 'reject'].includes(action)) {
      return res.status(400).json({
        code: 1,
        message: '无效的操作类型'
      })
    }
    
    // 验证预约类型
    if (!['individual', 'group'].includes(reservation_type)) {
      return res.status(400).json({
        code: 1,
        message: '无效的预约类型'
      })
    }
    
    // 如果是驳回操作，必须提供驳回原因
    if (action === 'reject' && !comments.trim()) {
      return res.status(400).json({
        code: 1,
        message: '驳回操作必须提供驳回原因'
      })
    }
    
    // 根据预约类型选择对应的模型
    const ReservationModel = reservation_type === 'individual' 
      ? IndividualReservation 
      : GroupReservation
    
    // 查找预约记录
    const reservation = await ReservationModel.findByPk(reservation_id)
    if (!reservation) {
      return res.status(404).json({
        code: 1,
        message: '预约记录不存在'
      })
    }
    
    // 检查预约状态
    if (reservation.status !== 'pending') {
      return res.status(400).json({
        code: 1,
        message: '该预约已被处理，无法重复操作'
      })
    }
    
    // 检查审批权限
    if (reservation.approver_id !== parseInt(approver_id)) {
      return res.status(403).json({
        code: 1,
        message: '您没有权限审批此预约'
      })
    }
    
    // 更新预约状态
    const newStatus = action === 'approve' ? 'approved' : 'rejected'
    await reservation.update({
      status: newStatus,
      updated_at: new Date()
    })
    
    // 创建审批记录
    await ApprovalRecord.create({
      reservation_id: parseInt(reservation_id),
      reservation_type,
      approver_id: parseInt(approver_id),
      action,
      comments: comments.trim()
    })
    
    res.json({
      code: 0,
      message: action === 'approve' ? '审批通过' : '审批驳回',
      data: {
        reservation_id,
        status: newStatus,
        action,
        comments
      }
    })
  } catch (error) {
    console.error('审批操作失败:', error)
    res.status(500).json({
      code: 1,
      message: '服务器内部错误'
    })
  }
})

// 获取审批人信息
router.get('/approver/:user_id', async (req, res) => {
  try {
    const { user_id } = req.params
    
    const user = await User.findOne({
      where: {
        user_id: parseInt(user_id),
        role: ['approver', 'admin']
      },
      attributes: ['user_id', 'real_name', 'role', 'college', 'position']
    })
    
    if (!user) {
      return res.status(404).json({
        code: 1,
        message: '审批人不存在或权限不足'
      })
    }
    
    res.json({
      code: 0,
      data: {
        user_id: user.user_id,
        name: user.real_name,
        role: user.role === 'admin' ? '超级管理员' : '审批管理员',
        college: user.college,
        position: user.position
      }
    })
  } catch (error) {
    console.error('获取审批人信息失败:', error)
    res.status(500).json({
      code: 1,
      message: '服务器内部错误'
    })
  }
})

// 获取审批信息列表（管理员视图）
router.get('/reservations', async (req, res) => {
  try {
    const { 
      type = 'all', 
      status = 'all', 
      date,
      gate = 'all',
      page = 1, 
      pageSize = 10 
    } = req.query
    
    const offset = (page - 1) * pageSize
    const limit = parseInt(pageSize)
    
    // 构建查询条件
    const whereCondition = {}
    
    if (status !== 'all') {
      whereCondition.status = status
    }
    
    if (date) {
      const startDate = new Date(date)
      const endDate = new Date(date)
      endDate.setDate(endDate.getDate() + 1)
      
      whereCondition.visit_date = {
        [Op.gte]: startDate,
        [Op.lt]: endDate
      }
    }
    
    if (gate !== 'all') {
      whereCondition.gate = gate
    }
    
    let individualReservations = []
    let groupReservations = []
    
    // 查询个人预约
    if (type === 'all' || type === 'individual') {
      individualReservations = await IndividualReservation.findAll({
        where: whereCondition,
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['user_id', 'real_name', 'phone', 'college']
          },
          {
            model: User,
            as: 'approver',
            attributes: ['user_id', 'real_name']
          }
        ],
        order: [['created_at', 'DESC']]
      })
    }
    
    // 查询团体预约
    if (type === 'all' || type === 'group') {
      groupReservations = await GroupReservation.findAll({
        where: whereCondition,
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['user_id', 'real_name', 'phone', 'college']
          },
          {
            model: User,
            as: 'approver',
            attributes: ['user_id', 'real_name']
          }
        ],
        order: [['created_at', 'DESC']]
      })
    }
    
    // 合并结果并添加类型标识
    const allReservations = [
      ...individualReservations.map(item => ({
        ...item.toJSON(),
        reservation_type: 'individual'
      })),
      ...groupReservations.map(item => ({
        ...item.toJSON(),
        reservation_type: 'group'
      }))
    ]
    
    // 按创建时间排序
    allReservations.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    
    // 分页
    const paginatedReservations = allReservations.slice(offset, offset + limit)
    
    res.json({
      code: 0,
      data: {
        reservations: paginatedReservations,
        total: allReservations.length,
        page: parseInt(page),
        pageSize: limit
      }
    })
  } catch (error) {
    console.error('获取审批信息列表失败:', error)
    res.status(500).json({
      code: 1,
      message: '获取审批信息列表失败',
      error: error.message
    })
  }
})

// 获取审批统计数据
router.get('/stats', async (req, res) => {
  try {
    const today = new Date()
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate())
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1)
    
    // 统计今日预约次数（个人+团体）
    const todayIndividualCount = await IndividualReservation.count({
      where: {
        visit_date: {
          [Op.gte]: startOfDay,
          [Op.lt]: endOfDay
        }
      }
    })
    
    const todayGroupCount = await GroupReservation.count({
      where: {
        visit_date: {
          [Op.gte]: startOfDay,
          [Op.lt]: endOfDay
        }
      }
    })
    
    const todayTotal = todayIndividualCount + todayGroupCount
    
    // 统计各状态的预约数量
    const statusStats = await sequelize.query(`
      SELECT 
        'individual' as type,
        status,
        COUNT(*) as count
      FROM individual_reservations 
      GROUP BY status
      UNION ALL
      SELECT 
        'group' as type,
        status,
        COUNT(*) as count
      FROM group_reservations 
      GROUP BY status
    `, { type: sequelize.QueryTypes.SELECT })
    
    // 处理统计数据
    const stats = {
      pending: 0,
      approved: 0,
      rejected: 0
    }
    
    statusStats.forEach(item => {
      if (stats.hasOwnProperty(item.status)) {
        stats[item.status] += parseInt(item.count)
      }
    })
    
    res.json({
      code: 0,
      data: {
        todayReservations: todayTotal,
        pendingApprovals: stats.pending,
        approvedCount: stats.approved,
        rejectedCount: stats.rejected,
        totalReservations: stats.pending + stats.approved + stats.rejected
      }
    })
  } catch (error) {
    console.error('获取统计数据失败:', error)
    res.status(500).json({
      code: 1,
      message: '获取统计数据失败',
      error: error.message
    })
  }
})

export default router