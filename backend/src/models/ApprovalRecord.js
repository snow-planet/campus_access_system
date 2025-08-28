import { DataTypes } from 'sequelize'
import { sequelize } from '../config/database.js'
import { User } from './User.js'

const ApprovalRecord = sequelize.define('ApprovalRecord', {
  record_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  reservation_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  reservation_type: {
    type: DataTypes.ENUM('individual', 'group'),
    allowNull: false
  },
  approver_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: User,
      key: 'user_id'
    }
  },
  action: {
    type: DataTypes.ENUM('approve', 'reject'),
    allowNull: false
  },
  comments: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'approval_records',
  timestamps: false
})

// 定义关联关系
ApprovalRecord.belongsTo(User, {
  foreignKey: 'approver_id',
  as: 'approver'
})

export { ApprovalRecord }