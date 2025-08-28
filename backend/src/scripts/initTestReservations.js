import { sequelize } from '../config/database.js'
import { User } from '../models/User.js'
import { IndividualReservation } from '../models/IndividualReservation.js'
import { GroupReservation } from '../models/GroupReservation.js'

// 初始化测试预约数据
async function initTestReservations() {
  try {
    console.log('开始初始化测试预约数据...')
    
    // 确保数据库连接
    await sequelize.authenticate()
    console.log('数据库连接成功')
    
    // 同步数据库表结构
    await sequelize.sync({ force: false })
    console.log('数据库表同步完成')
    
    // 检查是否已存在测试数据
    const existingIndividual = await IndividualReservation.count()
    const existingGroup = await GroupReservation.count()
    
    if (existingIndividual === 0) {
      // 创建个人预约测试数据
      const individualReservations = [
        {
          user_id: 1,
          purpose: '参加学术讲座',
          visit_date: '2024-01-15',
          entry_time: '14:00:00',
          exit_time: '16:00:00',
          gate: '北门',
          license_plate: null,
          approver_id: 1,
          status: 'pending'
        },
        {
          user_id: 1,
          purpose: '办理学生事务',
          visit_date: '2024-01-17',
          entry_time: '09:00:00',
          exit_time: '12:00:00',
          gate: '东门',
          license_plate: '京A12345',
          approver_id: 10,
          status: 'approved'
        },
        {
          user_id: 1,
          purpose: '图书馆自习',
          visit_date: '2024-01-16',
          entry_time: '19:00:00',
          exit_time: '21:00:00',
          gate: '北门',
          license_plate: null,
          approver_id: 1,
          status: 'rejected'
        }
      ]
      
      for (const reservation of individualReservations) {
        await IndividualReservation.create(reservation)
      }
      console.log('个人预约测试数据创建成功')
    } else {
      console.log('个人预约测试数据已存在')
    }
    
    if (existingGroup === 0) {
      // 创建团体预约测试数据
      const groupReservations = [
        {
          user_id: 1,
          purpose: '举办技术沙龙活动',
          visitor_count: 25,
          contact_name: '计算机科学协会',
          contact_phone: '13800000001',
          visit_date: '2024-01-18',
          entry_time: '13:00:00',
          exit_time: '17:00:00',
          gate: '北门',
          license_plate: '京B67890',
          approver_id: 1,
          status: 'pending'
        },
        {
          user_id: 1,
          purpose: '举办外语角活动',
          visitor_count: 30,
          contact_name: '外语学院',
          contact_phone: '13800000002',
          visit_date: '2024-01-19',
          entry_time: '08:30:00',
          exit_time: '11:30:00',
          gate: '东门',
          license_plate: null,
          approver_id: 10,
          status: 'pending'
        },
        {
          user_id: 1,
          purpose: '学生社团联谊活动',
          visitor_count: 50,
          contact_name: '学生会',
          contact_phone: '13800000003',
          visit_date: '2024-01-20',
          entry_time: '14:00:00',
          exit_time: '18:00:00',
          gate: '北门',
          license_plate: '京C11111',
          approver_id: 1,
          status: 'approved'
        }
      ]
      
      for (const reservation of groupReservations) {
        await GroupReservation.create(reservation)
      }
      console.log('团体预约测试数据创建成功')
    } else {
      console.log('团体预约测试数据已存在')
    }
    
    console.log('测试预约数据初始化完成！')
    console.log('\n可用的测试数据：')
    console.log('- 个人预约：3条记录（待审批、已通过、已驳回）')
    console.log('- 团体预约：3条记录（待审批、待审批、已通过）')
    console.log('- 审批人ID：1（系统管理员）、10（审批员）')
    
  } catch (error) {
    console.error('初始化测试预约数据失败:', error)
  } finally {
    await sequelize.close()
  }
}

// 如果直接运行此脚本
if (import.meta.url === `file://${process.argv[1]}`) {
  initTestReservations()
}

export { initTestReservations }