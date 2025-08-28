import { sequelize } from '../config/database.js'
import { IndividualReservation } from '../models/IndividualReservation.js'

async function fixIndividualReservationsTable() {
  try {
    console.log('开始修复individual_reservations表结构...')
    
    // 强制同步表结构
    await IndividualReservation.sync({ alter: true })
    
    console.log('individual_reservations表结构修复完成！')
    
    // 测试查询
    console.log('测试查询个人预约...')
    const individualReservations = await IndividualReservation.findAll({
      limit: 1,
      attributes: ['reservation_id', 'status', 'approver_id']
    })
    
    console.log('查询结果:', individualReservations.map(r => r.toJSON()))
    
    // 测试更新操作
    if (individualReservations.length > 0) {
      const testReservation = individualReservations[0]
      console.log('测试更新操作...')
      
      const originalStatus = testReservation.status
      await testReservation.update({ status: 'approved' })
      console.log('更新成功')
      
      // 恢复原状态
      await testReservation.update({ status: originalStatus })
      console.log('状态已恢复')
    }
    
  } catch (error) {
    console.error('修复失败:', error)
    console.error('错误详情:', error.message)
  } finally {
    await sequelize.close()
  }
}

fixIndividualReservationsTable()