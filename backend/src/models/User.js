import { DataTypes } from 'sequelize'
import { sequelize } from '../utils/db.js'

export const User = sequelize.define('User', {
  user_id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  openid: { type: DataTypes.STRING(255), unique: true },
  username: { type: DataTypes.STRING(50), allowNull: false },
  phone: { type: DataTypes.STRING(20), allowNull: false },
  real_name: { type: DataTypes.STRING(50), allowNull: false },
  avatar_url: { type: DataTypes.STRING(500) },
  role: { type: DataTypes.ENUM('user', 'approver', 'admin'), defaultValue: 'user' },
  college: { type: DataTypes.STRING(100) },
  position: { type: DataTypes.ENUM('teacher', 'security', 'other'), defaultValue: 'other' },
  status: { type: DataTypes.ENUM('active', 'pending', 'inactive'), defaultValue: 'active' },
  created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
}, {
  tableName: 'users',
  timestamps: false,
})