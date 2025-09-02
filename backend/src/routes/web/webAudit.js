import { Router } from 'express'
import { User } from '../../models/User.js'
import { IndividualReservation } from '../../models/IndividualReservation.js'
import { GroupReservation } from '../../models/GroupReservation.js'
import { ApprovalRecord } from '../../models/ApprovalRecord.js'
import { Op } from 'sequelize'
import { sequelize } from '../../config/database.js'

const router = Router()

// Web端获取审批信息列表
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

    const limit = parseInt(pageSize)
    const offset = (parseInt(page) - 1) * limit

    // 构建查询条件
    const whereCondition = {}
    
    if (status !== 'all') {
      whereCondition.status = status
    }
    
    if (gate !== 'all') {
      whereCondition.gate = gate
    }
    
    // 添加日期筛选条件
    if (date) {
      try {
        const selectedDate = new Date(date)
        if (!isNaN(selectedDate.getTime())) {
          const startDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate())
          const endDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate() + 1)
          
          whereCondition.visit_date = {
            [Op.gte]: startDate,
            [Op.lt]: endDate
          }
        }
      } catch (error) {
        console.error('日期解析错误:', error)
      }
    }

    let allReservations = []

    // 查询个人预约
    if (type === 'all' || type === 'individual') {
      const individualReservations = await IndividualReservation.findAll({
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

      const formattedIndividual = individualReservations.map(reservation => ({
        reservation_id: reservation.reservation_id,
        user_id: reservation.user_id,
        user_name: reservation.user?.real_name || '未知用户',
        type: 'individual',
        purpose: reservation.purpose,
        visit_date: reservation.visit_date,
        entry_time: reservation.entry_time,
        exit_time: reservation.exit_time,
        gate: reservation.gate,
        license_plate: reservation.license_plate,
        approver_id: reservation.approver_id,
        approver_name: reservation.approver?.real_name || null,
        status: reservation.status,
        created_at: reservation.created_at,
        updated_at: reservation.updated_at
      }))

      allReservations = allReservations.concat(formattedIndividual)
    }

    // 查询团体预约
    if (type === 'all' || type === 'group') {
      const groupReservations = await GroupReservation.findAll({
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

      const formattedGroup = groupReservations.map(reservation => ({
        reservation_id: reservation.reservation_id,
        user_id: reservation.user_id,
        user_name: reservation.user?.real_name || '未知用户',
        type: 'group',
        purpose: reservation.purpose,
        visitor_count: reservation.visitor_count,
        contact_name: reservation.contact_name,
        contact_phone: reservation.contact_phone,
        visit_date: reservation.visit_date,
        entry_time: reservation.entry_time,
        exit_time: reservation.exit_time,
        gate: reservation.gate,
        license_plate: reservation.license_plate,
        approver_id: reservation.approver_id,
        approver_name: reservation.approver?.real_name || null,
        status: reservation.status,
        created_at: reservation.created_at,
        updated_at: reservation.updated_at
      }))

      allReservations = allReservations.concat(formattedGroup)
    }

    // 按创建时间排序
    allReservations.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))

    // 分页处理
    const total = allReservations.length
    const paginatedReservations = allReservations.slice(offset, offset + limit)

    res.json({
      _status: 'OK',
      data: {
        reservations: paginatedReservations,
        page: parseInt(page),
        page_size: limit,
        total
      }
    })
  } catch (error) {
    console.error('Web端获取审批信息失败:', error)
    res.status(500).json({
      _status: 'FAIL',
      _error: { code: 'SERVER_ERROR', meta: '服务器内部错误' }
    })
  }
})

// Web端获取统计数据
router.get('/stats', async (req, res) => {
  try {
    const today = new Date()
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate())
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1)

    // 今日预约次数统计
    const [individualCount, groupCount] = await Promise.all([
      IndividualReservation.count({
        where: {
          visit_date: {
            [Op.gte]: startOfDay,
            [Op.lt]: endOfDay
          },
          status: 'approved'
        }
      }),
      GroupReservation.count({
        where: {
          visit_date: {
            [Op.gte]: startOfDay,
            [Op.lt]: endOfDay
          },
          status: 'approved'
        }
      })
    ])

    // 今日预约人次统计（个人预约算1人，团体预约按visitor_count计算）
    const groupVisitorCount = await GroupReservation.sum('visitor_count', {
      where: {
        visit_date: {
          [Op.gte]: startOfDay,
          [Op.lt]: endOfDay
        },
        status: 'approved'
      }
    }) || 0

    const todayReservations = individualCount + groupCount
    const totalVisitors = individualCount + groupVisitorCount

    res.json({
      _status: 'OK',
      data: {
        todayReservations,
        totalVisitors
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

export default router