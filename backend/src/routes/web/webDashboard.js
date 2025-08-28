import express from 'express'
import { sequelize } from '../../config/database.js'
import { QueryTypes } from 'sequelize'

const router = express.Router()

// 获取数据大屏统计数据
router.get('/stats', async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0]
    
    const currentTime = new Date().toTimeString().slice(0, 8) // HH:MM:SS格式
    
    // 获取今日预约统计
    const todayStats = await sequelize.query(`
      SELECT 
        (SELECT COUNT(*) FROM individual_reservations WHERE DATE(visit_date) = :today AND status = 'approved') as individual_approved,
        (SELECT COUNT(*) FROM group_reservations WHERE DATE(visit_date) = :today AND status = 'approved') as group_approved,
        (SELECT COALESCE(SUM(visitor_count), 0) FROM group_reservations WHERE DATE(visit_date) = :today AND status = 'approved') as group_people,
        (SELECT COUNT(*) FROM individual_reservations WHERE DATE(visit_date) = :today AND status = 'approved' AND (exit_time IS NULL OR exit_time > :currentTime)) as individual_pending,
        (SELECT COUNT(*) FROM group_reservations WHERE DATE(visit_date) = :today AND status = 'approved' AND (exit_time IS NULL OR exit_time > :currentTime)) as group_pending,
        (SELECT COUNT(*) FROM individual_reservations WHERE DATE(visit_date) = :today AND status = 'approved' AND exit_time IS NOT NULL AND exit_time <= :currentTime) as individual_completed,
        (SELECT COUNT(*) FROM group_reservations WHERE DATE(visit_date) = :today AND status = 'approved' AND exit_time IS NOT NULL AND exit_time <= :currentTime) as group_completed,
        (SELECT COUNT(DISTINCT license_plate) FROM individual_reservations WHERE DATE(visit_date) = :today AND status = 'approved' AND license_plate IS NOT NULL AND license_plate != '') as individual_vehicles,
        (SELECT COUNT(DISTINCT license_plate) FROM group_reservations WHERE DATE(visit_date) = :today AND status = 'approved' AND license_plate IS NOT NULL AND license_plate != '') as group_vehicles
    `, {
       replacements: { today, currentTime },
       type: QueryTypes.SELECT
     })
    
    const stats = todayStats[0]
    
    // 计算统计数据（确保数值类型转换）
    const todayReservations = parseInt(stats.individual_approved || 0) + parseInt(stats.group_approved || 0)
    const todayPeople = parseInt(stats.individual_approved || 0) + parseInt(stats.group_people || 0)
    const todayPending = parseInt(stats.individual_pending || 0) + parseInt(stats.group_pending || 0)
    const todayCompleted = parseInt(stats.individual_completed || 0) + parseInt(stats.group_completed || 0)
    const todayVehicles = parseInt(stats.individual_vehicles || 0) + parseInt(stats.group_vehicles || 0)
    
    res.json({
      _status: 'OK',
      data: {
        todayReservations,
        todayPeople,
        todayPending,
        todayCompleted,
        todayVehicles
      }
    })
  } catch (error) {
    console.error('获取数据大屏统计失败:', error)
    res.status(500).json({
      _status: 'FAIL',
      _error: { code: 'STATS_FETCH_ERROR', meta: error.message }
    })
  }
})

// 获取24小时人流量数据
router.get('/traffic/hourly', async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0]
    
    // 获取24小时的预约数据
    const hourlyData = await sequelize.query(`
      SELECT 
        HOUR(created_at) as hour,
        COUNT(*) as reservations,
        COALESCE(SUM(CASE WHEN type = 'individual' THEN 1 ELSE visitor_count END), 0) as people
      FROM (
        SELECT created_at, 'individual' as type, 1 as visitor_count
        FROM individual_reservations 
        WHERE DATE(visit_date) = :today AND status = 'approved'
        UNION ALL
        SELECT created_at, 'group' as type, visitor_count
        FROM group_reservations 
        WHERE DATE(visit_date) = :today AND status = 'approved'
      ) as combined
      GROUP BY HOUR(created_at)
      ORDER BY hour
    `, {
      replacements: { today },
      type: QueryTypes.SELECT
    })
    
    // 填充24小时数据（没有数据的小时补0）
    const hourlyStats = Array.from({ length: 24 }, (_, hour) => {
      const data = hourlyData.find(item => item.hour === hour)
      return {
        hour,
        reservations: data ? data.reservations : 0,
        people: data ? data.people : 0
      }
    })
    
    res.json({
      _status: 'OK',
      data: hourlyStats
    })
  } catch (error) {
    console.error('获取24小时人流量数据失败:', error)
    res.status(500).json({
      _status: 'FAIL',
      _error: { code: 'HOURLY_TRAFFIC_ERROR', meta: error.message }
    })
  }
})

// 获取本周人流量数据
router.get('/traffic/weekly', async (req, res) => {
  try {
    // 获取本周的日期范围
    const today = new Date()
    const startOfWeek = new Date(today)
    startOfWeek.setDate(today.getDate() - today.getDay() + 1) // 周一
    
    const weeklyData = await sequelize.query(`
      SELECT 
        DAYOFWEEK(visit_date) as day_of_week,
        COUNT(*) as reservations,
        COALESCE(SUM(CASE WHEN type = 'individual' THEN 1 ELSE visitor_count END), 0) as people
      FROM (
        SELECT visit_date, 'individual' as type, 1 as visitor_count
        FROM individual_reservations 
        WHERE visit_date >= DATE_SUB(CURDATE(), INTERVAL WEEKDAY(CURDATE()) DAY)
        AND visit_date < DATE_ADD(DATE_SUB(CURDATE(), INTERVAL WEEKDAY(CURDATE()) DAY), INTERVAL 7 DAY)
        AND status = 'approved'
        UNION ALL
        SELECT visit_date, 'group' as type, visitor_count
        FROM group_reservations 
        WHERE visit_date >= DATE_SUB(CURDATE(), INTERVAL WEEKDAY(CURDATE()) DAY)
        AND visit_date < DATE_ADD(DATE_SUB(CURDATE(), INTERVAL WEEKDAY(CURDATE()) DAY), INTERVAL 7 DAY)
        AND status = 'approved'
      ) as combined
      GROUP BY DAYOFWEEK(visit_date)
      ORDER BY day_of_week
    `, {
      type: QueryTypes.SELECT
    })
    
    // 填充一周7天数据（周一到周日）
    const weeklyStats = Array.from({ length: 7 }, (_, index) => {
      const dayOfWeek = index + 2 // MySQL DAYOFWEEK: 1=Sunday, 2=Monday
      const adjustedDay = dayOfWeek > 7 ? 1 : dayOfWeek // 处理周日
      const data = weeklyData.find(item => item.day_of_week === adjustedDay)
      return {
        day: index, // 0=Monday, 6=Sunday
        reservations: data ? data.reservations : 0,
        people: data ? data.people : 0
      }
    })
    
    res.json({
      _status: 'OK',
      data: weeklyStats
    })
  } catch (error) {
    console.error('获取本周人流量数据失败:', error)
    res.status(500).json({
      _status: 'FAIL',
      _error: { code: 'WEEKLY_TRAFFIC_ERROR', meta: error.message }
    })
  }
})

// 获取本月人流量数据
router.get('/traffic/monthly', async (req, res) => {
  try {
    const currentMonth = new Date().toISOString().slice(0, 7) // YYYY-MM
    
    const monthlyData = await sequelize.query(`
      SELECT 
        DAY(visit_date) as day,
        COUNT(*) as reservations,
        COALESCE(SUM(CASE WHEN type = 'individual' THEN 1 ELSE visitor_count END), 0) as people
      FROM (
        SELECT visit_date, 'individual' as type, 1 as visitor_count
        FROM individual_reservations 
        WHERE DATE_FORMAT(visit_date, '%Y-%m') = :currentMonth AND status = 'approved'
        UNION ALL
        SELECT visit_date, 'group' as type, visitor_count
        FROM group_reservations 
        WHERE DATE_FORMAT(visit_date, '%Y-%m') = :currentMonth AND status = 'approved'
      ) as combined
      GROUP BY DAY(visit_date)
      ORDER BY day
    `, {
      replacements: { currentMonth },
      type: QueryTypes.SELECT
    })
    
    // 按5天间隔分组显示
    const monthlyStats = []
    for (let i = 1; i <= 30; i += 5) {
      const endDay = Math.min(i + 4, 30)
      const periodData = monthlyData.filter(item => item.day >= i && item.day <= endDay)
      const totalReservations = periodData.reduce((sum, item) => sum + item.reservations, 0)
      const totalPeople = periodData.reduce((sum, item) => sum + item.people, 0)
      
      monthlyStats.push({
        period: `${i}日`,
        reservations: totalReservations,
        people: totalPeople
      })
    }
    
    res.json({
      _status: 'OK',
      data: monthlyStats
    })
  } catch (error) {
    console.error('获取本月人流量数据失败:', error)
    res.status(500).json({
      _status: 'FAIL',
      _error: { code: 'MONTHLY_TRAFFIC_ERROR', meta: error.message }
    })
  }
})

// 获取今日预约记录
router.get('/reservations/today', async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0]
    const currentTime = new Date().toTimeString().slice(0, 8)
    
    // 获取今日未完成的预约记录
    const reservations = await sequelize.query(`
      SELECT 
        u.real_name as applicant,
        'individual' as type,
        ir.purpose,
        ir.visit_date,
        CONCAT(COALESCE(ir.entry_time, ''), ' - ', COALESCE(ir.exit_time, '')) as time_slot,
        ir.license_plate,
        ir.created_at
      FROM individual_reservations ir
      JOIN users u ON ir.user_id = u.user_id
      WHERE DATE(ir.visit_date) = :today 
      AND ir.status IN ('approved', 'pending')
      AND (ir.exit_time IS NULL OR ir.exit_time > :currentTime)
      
      UNION ALL
      
      SELECT 
        u.real_name as applicant,
        'group' as type,
        gr.purpose,
        gr.visit_date,
        CONCAT(COALESCE(gr.entry_time, ''), ' - ', COALESCE(gr.exit_time, '')) as time_slot,
        gr.license_plate,
        gr.created_at
      FROM group_reservations gr
      JOIN users u ON gr.user_id = u.user_id
      WHERE DATE(gr.visit_date) = :today 
      AND gr.status IN ('approved', 'pending')
      AND (gr.exit_time IS NULL OR gr.exit_time > :currentTime)
      
      ORDER BY created_at DESC
      LIMIT 20
    `, {
      replacements: { today, currentTime },
      type: QueryTypes.SELECT
    })
    
    res.json({
      _status: 'OK',
      data: reservations
    })
  } catch (error) {
    console.error('获取今日预约记录失败:', error)
    res.status(500).json({
      _status: 'FAIL',
      _error: { code: 'TODAY_RESERVATIONS_ERROR', meta: error.message }
    })
  }
})

// 获取审批申请统计
router.get('/applications/stats', async (req, res) => {
  try {
    const stats = await sequelize.query(`
      SELECT 
        college,
        position,
        COUNT(*) as pending_count
      FROM approver_applications 
      WHERE status = 'pending'
      GROUP BY college, position
      ORDER BY college, position
    `, {
      type: QueryTypes.SELECT
    })
    
    res.json({
        _status: 'OK',
        data: stats
      })
  } catch (error) {
    console.error('获取审批申请统计失败:', error)
    res.status(500).json({
      _status: 'FAIL',
      _error: { code: 'APPLICATIONS_STATS_ERROR', meta: error.message }
    })
  }
})

// 获取公告数据
router.get('/announcements', async (req, res) => {
  try {
    const announcements = await sequelize.query(`
      SELECT 
        n.title,
        n.content,
        n.created_at,
        u.real_name as publisher
      FROM notifications n
      JOIN users u ON n.publisher_id = u.user_id
      WHERE n.type = 'announcement' 
      AND n.is_active = TRUE
      ORDER BY n.created_at DESC
      LIMIT 10
    `, {
      type: QueryTypes.SELECT
    })
    
    res.json({
        _status: 'OK',
        data: announcements
      })
  } catch (error) {
    console.error('获取公告数据失败:', error)
    res.status(500).json({
      _status: 'FAIL',
      _error: { code: 'ANNOUNCEMENTS_ERROR', meta: error.message }
    })
  }
})

export default router