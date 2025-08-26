import { DataTypes } from 'sequelize'
import { sequelize } from '../utils/db.js'
import { User } from './User.js'

export const GroupReservation = sequelize.define('GroupReservation', {
  reservation_id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  user_id: { type: DataTypes.INTEGER, allowNull: false },
  purpose: { type: DataTypes.STRING(500), allowNull: false },
  visitor_count: { type: DataTypes.INTEGER, allowNull: false },
  contact_name: { type: DataTypes.STRING(50), allowNull: false },
  contact_phone: { type: DataTypes.STRING(20), allowNull: false },
  visit_date: { type: DataTypes.DATEONLY, allowNull: false },
  entry_time: { type: DataTypes.TIME },
  exit_time: { type: DataTypes.TIME },
  gate: { type: DataTypes.ENUM('北门', '东门'), defaultValue: '北门' },
  license_plate: { type: DataTypes.STRING(20) },
  approver_id: { type: DataTypes.INTEGER, allowNull: false },
  status: { type: DataTypes.ENUM('pending', 'approved', 'rejected', 'completed'), defaultValue: 'pending' },
  created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
}, {
  tableName: 'group_reservations',
  timestamps: false,
})

// 建立关联关系
GroupReservation.belongsTo(User, { foreignKey: 'user_id', as: 'user' })
GroupReservation.belongsTo(User, { foreignKey: 'approver_id', as: 'approver' })