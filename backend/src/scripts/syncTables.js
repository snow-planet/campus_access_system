import { sequelize } from '../config/database.js'
import { User } from '../models/User.js'
import { IndividualReservation } from '../models/IndividualReservation.js'
import { GroupReservation } from '../models/GroupReservation.js'
import { ApprovalRecord } from '../models/ApprovalRecord.js'

async function syncTables() {
  try {
    console.log('开始同步数据库表结构...')
    
    // 同步所有表结构，但不删除现有数据
    await sequelize.sync({ alter: true })
    
    console.log('数据库表结构同步完成！')
    
    // 测试查询
    console.log('测试查询团体预约...')
    const groupReservations = await GroupReservation.findAll({
      limit: 1,
      attributes: ['reservation_id', 'status', 'approver_id']
    })
    
    console.log('查询结果:', groupReservations.map(r => r.toJSON()))
    
  } catch (error) {
    console.error('同步失败:', error)
    console.error('错误详情:', error.message)
  } finally {
    await sequelize.close()
  }
}

syncTables()