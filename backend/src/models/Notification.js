import { DataTypes } from 'sequelize'
import { sequelize } from '../utils/db.js'
import { User } from './User.js'

export const Notification = sequelize.define('Notification', {
  notification_id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  title: {
    type: DataTypes.STRING(200),
    allowNull: false,
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  type: {
    type: DataTypes.ENUM('announcement', 'individual_notice', 'group_notice'),
    allowNull: false,
  },
  display_location: {
    type: DataTypes.ENUM('homepage', 'individual_form', 'group_form'),
    allowNull: false,
  },
  publisher_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  updated_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: 'notifications',
  timestamps: false,
})

// 建立关联关系
Notification.belongsTo(User, { foreignKey: 'publisher_id', as: 'publisher' })