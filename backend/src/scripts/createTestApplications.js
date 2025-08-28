import { sequelize } from '../config/database.js'
import { User } from '../models/User.js'

// 定义审批人申请模型
const ApproverApplication = sequelize.define('ApproverApplication', {
  application_id: {
    type: sequelize.Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  user_id: {
    type: sequelize.Sequelize.INTEGER,
    allowNull: false
  },
  real_name: {
    type: sequelize.Sequelize.STRING(50),
    allowNull: false
  },
  phone: {
    type: sequelize.Sequelize.STRING(20),
    allowNull: false
  },
  college: {
    type: sequelize.Sequelize.STRING(100),
    allowNull: false
  },
  position: {
    type: sequelize.Sequelize.ENUM('teacher', 'security'),
    allowNull: false
  },
  status: {
    type: sequelize.Sequelize.ENUM('pending', 'approved', 'rejected'),
    defaultValue: 'pending'
  },
  reviewed_by: {
    type: sequelize.Sequelize.INTEGER,
    allowNull: true
  },
  reviewed_at: {
    type: sequelize.Sequelize.DATE,
    allowNull: true
  },
  created_at: {
    type: sequelize.Sequelize.DATE,
    defaultValue: sequelize.Sequelize.NOW
  }
}, {
  tableName: 'approver_applications',
  timestamps: false
})

async function createTestApplications() {
  try {
    console.log('开始创建测试申请数据...')
    
    // 强制同步表结构
    await ApproverApplication.sync({ force: true })
    console.log('approver_applications表已重建')
    
    // 创建测试申请数据
    const testApplications = [
      {
        user_id: 1,
        real_name: '张教授',
        phone: '13800138001',
        college: '信息技术学院',
        position: 'teacher',
        status: 'pending'
      },
      {
        user_id: 2,
        real_name: '李老师',
        phone: '13800138002',
        college: '信息技术学院',
        position: 'teacher',
        status: 'pending'
      },
      {
        user_id: 3,
        real_name: '王保安',
        phone: '13800138003',
        college: '保卫处',
        position: 'security',
        status: 'pending'
      },
      {
        user_id: 4,
        real_name: '赵老师',
        phone: '13800138004',
        college: '交通管理学院',
        position: 'teacher',
        status: 'approved',
        reviewed_by: 1,
        reviewed_at: new Date()
      },
      {
        user_id: 5,
        real_name: '刘老师',
        phone: '13800138005',
        college: '治安学院',
        position: 'teacher',
        status: 'pending'
      }
    ]
    
    for (const appData of testApplications) {
      await ApproverApplication.create(appData)
      console.log(`创建申请: ${appData.real_name} - ${appData.college}`)
    }
    
    console.log('测试申请数据创建完成！')
    
    // 查询验证
    const applications = await ApproverApplication.findAll()
    console.log(`总共创建了 ${applications.length} 条申请记录`)
    
    applications.forEach(app => {
      console.log(`- ${app.real_name} (${app.college}) - ${app.status}`)
    })
    
  } catch (error) {
    console.error('创建测试申请数据失败:', error)
  } finally {
    await sequelize.close()
  }
}

createTestApplications()