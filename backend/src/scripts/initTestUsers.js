import { sequelize } from '../config/database.js'
import { User } from '../models/User.js'
import { ApproverApplication } from '../models/ApproverApplication.js'

// 初始化测试用户数据
async function initTestUsers() {
  try {
    console.log('开始初始化测试用户数据...')
    
    // 确保数据库连接
    await sequelize.authenticate()
    console.log('数据库连接成功')
    
    // 同步数据库表结构
    await sequelize.sync({ force: false })
    console.log('数据库表同步完成')
    
    // 检查是否已存在测试用户
    const existingAdmin = await User.findOne({ where: { username: 'admin' } })
    const existingApprover = await User.findOne({ where: { username: 'approver' } })
    
    if (!existingAdmin) {
      // 创建管理员用户
      await User.create({
        username: 'admin',
        phone: '13800000001',
        real_name: '系统管理员',
        role: 'admin',
        college: '信息技术中心',
        position: 'other',
        status: 'active'
      })
      console.log('管理员用户创建成功')
    } else {
      console.log('管理员用户已存在')
    }
    
    if (!existingApprover) {
      // 创建审批员用户
      await User.create({
        username: 'approver',
        phone: '13800000002',
        real_name: '审批员',
        role: 'approver',
        college: '计算机学院',
        position: 'teacher',
        status: 'active'
      })
      console.log('审批员用户创建成功')
    } else {
      console.log('审批员用户已存在')
    }
    
    // 创建更多测试用户
    const testUsers = [
      {
        username: 'teacher001',
        phone: '13800000003',
        real_name: '张老师',
        role: 'approver',
        college: '电子工程学院',
        position: 'teacher',
        status: 'active'
      },
      {
        username: 'security001',
        phone: '13800000004',
        real_name: '李保安',
        role: 'approver',
        college: '保卫处',
        position: 'security',
        status: 'active'
      },
      {
        username: 'user001',
        phone: '13800000005',
        real_name: '普通用户',
        role: 'user',
        college: '机械工程学院',
        position: 'other',
        status: 'active'
      }
    ]
    
    for (const userData of testUsers) {
      const existingUser = await User.findOne({ where: { username: userData.username } })
      if (!existingUser) {
        await User.create(userData)
        console.log(`用户 ${userData.username} 创建成功`)
      } else {
        console.log(`用户 ${userData.username} 已存在`)
      }
    }
    
    console.log('测试用户数据初始化完成！')
    console.log('\n可用的测试账户：')
    console.log('管理员: admin / 123456')
    console.log('审批员: approver / 123456')
    console.log('教师审批员: teacher001 / 123456')
    console.log('安保审批员: security001 / 123456')
    
  } catch (error) {
    console.error('初始化测试用户失败:', error)
  } finally {
    await sequelize.close()
  }
}

// 如果直接运行此脚本
if (import.meta.url === `file://${process.argv[1]}`) {
  initTestUsers()
}

export { initTestUsers }