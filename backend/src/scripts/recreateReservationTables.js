import { sequelize } from '../config/database.js'
import { User } from '../models/User.js'
import { IndividualReservation } from '../models/IndividualReservation.js'
import { GroupReservation } from '../models/GroupReservation.js'
import { ApprovalRecord } from '../models/ApprovalRecord.js'

async function recreateReservationTables() {
  try {
    console.log('开始重建预约表结构...')
    
    // 备份现有数据
    console.log('备份现有数据...')
    const individualData = await sequelize.query('SELECT * FROM individual_reservations', { type: sequelize.QueryTypes.SELECT })
    const groupData = await sequelize.query('SELECT * FROM group_reservations', { type: sequelize.QueryTypes.SELECT })
    
    console.log(`备份了 ${individualData.length} 条个人预约数据`)
    console.log(`备份了 ${groupData.length} 条团体预约数据`)
    
    // 删除并重建表
    console.log('删除现有表...')
    await sequelize.query('DROP TABLE IF EXISTS approval_records')
    await sequelize.query('DROP TABLE IF EXISTS individual_reservations')
    await sequelize.query('DROP TABLE IF EXISTS group_reservations')
    
    console.log('重建表结构...')
    await IndividualReservation.sync({ force: true })
    await GroupReservation.sync({ force: true })
    await ApprovalRecord.sync({ force: true })
    
    console.log('恢复数据...')
    
    // 恢复个人预约数据
    for (const record of individualData) {
      try {
        await IndividualReservation.create({
          reservation_id: record.reservation_id,
          user_id: record.user_id,
          purpose: record.purpose,
          visit_date: record.visit_date,
          entry_time: record.entry_time,
          exit_time: record.exit_time,
          gate: record.gate,
          license_plate: record.license_plate,
          approver_id: record.approver_id,
          status: record.status,
          created_at: record.created_at,
          updated_at: record.updated_at
        })
      } catch (error) {
        console.warn(`跳过个人预约记录 ${record.reservation_id}:`, error.message)
      }
    }
    
    // 恢复团体预约数据
    for (const record of groupData) {
      try {
        await GroupReservation.create({
          reservation_id: record.reservation_id,
          user_id: record.user_id,
          purpose: record.purpose,
          visitor_count: record.visitor_count,
          contact_name: record.contact_name,
          contact_phone: record.contact_phone,
          visit_date: record.visit_date,
          entry_time: record.entry_time,
          exit_time: record.exit_time,
          gate: record.gate,
          license_plate: record.license_plate,
          approver_id: record.approver_id,
          status: record.status,
          created_at: record.created_at,
          updated_at: record.updated_at
        })
      } catch (error) {
        console.warn(`跳过团体预约记录 ${record.reservation_id}:`, error.message)
      }
    }
    
    console.log('表结构重建完成！')
    
    // 测试更新操作
    console.log('测试更新操作...')
    const testReservation = await IndividualReservation.findOne()
    if (testReservation) {
      const originalStatus = testReservation.status
      await testReservation.update({ status: 'approved' })
      console.log('更新测试成功')
      await testReservation.update({ status: originalStatus })
      console.log('状态已恢复')
    }
    
  } catch (error) {
    console.error('重建失败:', error)
    console.error('错误详情:', error.message)
  } finally {
    await sequelize.close()
  }
}

recreateReservationTables()