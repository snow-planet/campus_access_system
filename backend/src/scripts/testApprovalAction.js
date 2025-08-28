import { sequelize } from '../config/database.js'
import { IndividualReservation } from '../models/IndividualReservation.js'
import { GroupReservation } from '../models/GroupReservation.js'
import { ApprovalRecord } from '../models/ApprovalRecord.js'
import { User } from '../models/User.js'

async function testApprovalAction() {
  try {
    console.log('开始测试审批操作...')
    
    // 查找一个待审批的团体预约
    const groupReservation = await GroupReservation.findOne({
      where: { status: 'pending' },
      include: [{
        model: User,
        as: 'approver',
        attributes: ['user_id', 'real_name']
      }]
    })
    
    if (!groupReservation) {
      console.log('没有找到待审批的团体预约')
      return
    }
    
    console.log('找到待审批的团体预约:', {
      id: groupReservation.reservation_id,
      approver_id: groupReservation.approver_id,
      status: groupReservation.status
    })
    
    // 测试更新预约状态
    console.log('更新预约状态...')
    await groupReservation.update({
      status: 'approved',
      updated_at: new Date()
    })
    
    console.log('预约状态更新成功')
    
    // 测试创建审批记录
    console.log('创建审批记录...')
    const approvalRecord = await ApprovalRecord.create({
      reservation_id: groupReservation.reservation_id,
      reservation_type: 'group',
      approver_id: groupReservation.approver_id,
      action: 'approve',
      comments: '测试审批通过'
    })
    
    console.log('审批记录创建成功:', approvalRecord.toJSON())
    
    // 恢复原状态
    await groupReservation.update({ status: 'pending' })
    await approvalRecord.destroy()
    
    console.log('测试完成，已恢复原状态')
    
  } catch (error) {
    console.error('测试失败:', error)
    console.error('错误详情:', error.message)
    console.error('错误堆栈:', error.stack)
  } finally {
    await sequelize.close()
  }
}

testApprovalAction()