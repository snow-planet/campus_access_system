import { Router } from 'express'
import { User } from '../../models/User.js'
import { IndividualReservation } from '../../models/IndividualReservation.js'
import { GroupReservation } from '../../models/GroupReservation.js'
import { ApprovalRecord } from '../../models/ApprovalRecord.js'
import { Op } from 'sequelize'
import { config } from '../../config/index.js'

const router = Router()

// Web端获取审批列表
router.get('/list', async (req, res) => {
  try {
    const { 
      approver_id, 
      type = 'all', 
      status = 'all', 
      date = 'all',
      page = 1, 
      pageSize = 10 
    } = req.query
    
    if (!approver_id) {
      return res.status(400).json({
        _status: 'FAIL',
        _error: { code: 'MISSING_APPROVER_ID', meta: '缺少审批人ID参数' }
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
    
    // 添加日期筛选条件
    if (date && date !== 'all') {
      try {
        const selectedDate = new Date(date)
        if (!isNaN(selectedDate.getTime())) {
          const startDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate())
          const endDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate() + 1)
          
          whereCondition.created_at = {
            [Op.gte]: startDate,
            [Op.lt]: endDate
          }
        }
      } catch (error) {
        console.error('日期解析错误:', error)
      }
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
      _status: 'OK',
      data: {
        list: paginatedApplications,
        page: parseInt(page),
        page_size: limit,
        total
      }
    })
  } catch (error) {
    console.error('Web端获取审批列表失败:', error)
    res.status(500).json({
      _status: 'FAIL',
      _error: { code: 'SERVER_ERROR', meta: '服务器内部错误' }
    })
  }
})

// Web端审批操作（通过/驳回）
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
    
    // 验证预约类型
    if (!['individual', 'group'].includes(reservation_type)) {
      return res.status(400).json({
        _status: 'FAIL',
        _error: { code: 'INVALID_TYPE', meta: '无效的预约类型' }
      })
    }
    
    // 如果是驳回操作，必须提供驳回原因
    if (action === 'reject' && !comments.trim()) {
      return res.status(400).json({
        _status: 'FAIL',
        _error: { code: 'MISSING_COMMENTS', meta: '驳回操作必须提供驳回原因' }
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
        _status: 'FAIL',
        _error: { code: 'RESERVATION_NOT_FOUND', meta: '预约记录不存在' }
      })
    }
    
    // 检查预约状态
    if (reservation.status !== 'pending') {
      return res.status(400).json({
        _status: 'FAIL',
        _error: { code: 'ALREADY_PROCESSED', meta: '该预约已被处理，无法重复操作' }
      })
    }
    
    // 检查审批权限
    if (reservation.approver_id !== parseInt(approver_id)) {
      return res.status(403).json({
        _status: 'FAIL',
        _error: { code: 'NO_PERMISSION', meta: '您没有权限审批此预约' }
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
      _status: 'OK',
      data: {
        reservation_id,
        status: newStatus,
        action,
        comments,
        message: action === 'approve' ? '审批通过' : '审批驳回'
      }
    })
  } catch (error) {
    console.error('Web端审批操作失败:', error)
    res.status(500).json({
      _status: 'FAIL',
      _error: { code: 'SERVER_ERROR', meta: '服务器内部错误' }
    })
  }
})

// Web端获取审批人信息
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
        _status: 'FAIL',
        _error: { code: 'APPROVER_NOT_FOUND', meta: '审批人不存在或权限不足' }
      })
    }
    
    res.json({
      _status: 'OK',
      data: {
        user_id: user.user_id,
        name: user.real_name,
        role: user.role === 'admin' ? '超级管理员' : '审批管理员',
        college: user.college,
        position: user.position
      }
    })
  } catch (error) {
    console.error('Web端获取审批人信息失败:', error)
    res.status(500).json({
      _status: 'FAIL',
      _error: { code: 'SERVER_ERROR', meta: '服务器内部错误' }
    })
  }
})

export default router