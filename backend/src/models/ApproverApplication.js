import { DataTypes } from 'sequelize'
import { sequelize } from '../config/database.js'
import { User } from './User.js'

const ApproverApplication = sequelize.define('ApproverApplication', {
  application_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: User,
      key: 'user_id'
    }
  },
  real_name: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  phone: {
    type: DataTypes.STRING(20),
    allowNull: false
  },
  college: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  position: {
    type: DataTypes.ENUM('teacher', 'security'),
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('pending', 'approved', 'rejected'),
    defaultValue: 'pending'
  },
  reviewed_by: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: User,
      key: 'user_id'
    }
  },
  reviewed_at: {
    type: DataTypes.DATE,
    allowNull: true
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'approver_applications',
  timestamps: false
})

// 定义关联关系
ApproverApplication.belongsTo(User, {
  foreignKey: 'user_id',
  as: 'applicant'
})

ApproverApplication.belongsTo(User, {
  foreignKey: 'reviewed_by',
  as: 'reviewer'
})

export { ApproverApplication }