import { sequelize } from '../config/database.js'
import { ApprovalRecord } from '../models/ApprovalRecord.js'

async function createApprovalRecordsTable() {
  try {
    console.log('正在创建approval_records表...')
    
    // 强制同步表结构
    await ApprovalRecord.sync({ force: true })
    
    console.log('approval_records表创建成功！')
    
    // 测试插入一条记录
    console.log('测试插入审批记录...')
    const testRecord = await ApprovalRecord.create({
      reservation_id: 1,
      reservation_type: 'individual',
      approver_id: 1,
      action: 'approve',
      comments: '测试审批记录'
    })
    
    console.log('测试记录插入成功:', testRecord.toJSON())
    
    // 删除测试记录
    await testRecord.destroy()
    console.log('测试记录已删除')
    
  } catch (error) {
    console.error('创建表失败:', error)
  } finally {
    await sequelize.close()
  }
}

createApprovalRecordsTable()