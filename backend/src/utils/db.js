import { Sequelize } from 'sequelize'
import dotenv from 'dotenv'

dotenv.config()

// 初始化 Sequelize 实例（模块加载即创建），避免模型在sequelize未定义时被使用
export const sequelize = new Sequelize(
  process.env.DB_NAME || 'campus_access_system',
  process.env.DB_USER || 'root',
  process.env.DB_PASS || '',
  {
    host: process.env.DB_HOST || '127.0.0.1',
    port: Number(process.env.DB_PORT || '3305'),
    dialect: 'mysql',
    timezone: '+08:00',
    dialectOptions: {
      dateStrings: true,
      typeCast: true,
    },
    logging: false,
  }
)

export async function testConnection() {
  try {
    await sequelize.authenticate()
    console.log('Database connection has been established successfully.')
  } catch (error) {
    console.error('Unable to connect to the database:', error)
    throw error
  }
}