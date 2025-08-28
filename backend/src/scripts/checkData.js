import { sequelize } from '../config/database.js'
import { QueryTypes } from 'sequelize'

async function checkTodayData() {
  try {
    const today = new Date().toISOString().split('T')[0]
    console.log('检查日期:', today)
    
    // 检查个人预约
    const individualData = await sequelize.query(`
      SELECT 
        COUNT(*) as total_count,
        SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) as approved_count,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending_count,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed_count
      FROM individual_reservations 
      WHERE DATE(visit_date) = :today
    `, {
      replacements: { today },
      type: QueryTypes.SELECT
    })
    
    console.log('个人预约数据:', individualData[0])
    
    // 检查团体预约
    const groupData = await sequelize.query(`
      SELECT 
        COUNT(*) as total_count,
        SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) as approved_count,
        SUM(CASE WHEN status = 'approved' THEN visitor_count ELSE 0 END) as approved_people,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending_count,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed_count
      FROM group_reservations 
      WHERE DATE(visit_date) = :today
    `, {
      replacements: { today },
      type: QueryTypes.SELECT
    })
    
    console.log('团体预约数据:', groupData[0])
    
    // 计算总人数
    const individualApproved = individualData[0].approved_count || 0
    const groupApprovedPeople = groupData[0].approved_people || 0
    const totalPeople = individualApproved + groupApprovedPeople
    
    console.log('计算结果:')
    console.log('- 个人预约已审批:', individualApproved)
    console.log('- 团体预约已审批人数:', groupApprovedPeople)
    console.log('- 总人数:', totalPeople)
    
    // 检查待入校和已完成
    const individualPending = individualData[0].pending_count || 0
    const groupPending = groupData[0].pending_count || 0
    const individualCompleted = individualData[0].completed_count || 0
    const groupCompleted = groupData[0].completed_count || 0
    
    console.log('状态统计:')
    console.log('- 待入校:', individualPending + groupPending)
    console.log('- 已完成:', individualCompleted + groupCompleted)
    
  } catch (error) {
    console.error('查询失败:', error)
  } finally {
    await sequelize.close()
  }
}

checkTodayData()