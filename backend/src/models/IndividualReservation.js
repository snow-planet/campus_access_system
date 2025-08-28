import { DataTypes } from 'sequelize'
import { sequelize } from '../config/database.js'
import { User } from './User.js'

export const IndividualReservation = sequelize.define('IndividualReservation', {
  reservation_id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  user_id: { type: DataTypes.INTEGER, allowNull: false },
  purpose: { type: DataTypes.STRING(500), allowNull: false },
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
  tableName: 'individual_reservations',
  timestamps: false,
})

// 定义关联关系
IndividualReservation.belongsTo(User, {
  foreignKey: 'user_id',
  as: 'user'
})

IndividualReservation.belongsTo(User, {
  foreignKey: 'approver_id',
  as: 'approver'
})