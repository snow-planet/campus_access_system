import { Sequelize } from 'sequelize'
import { config } from './index.js'

// 创建Sequelize实例
const sequelize = new Sequelize(
  config.db.name,
  config.db.user,
  config.db.pass,
  {
    host: config.db.host,
    port: config.db.port,
    dialect: 'mysql',
    logging: console.log,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    },
    timezone: '+08:00'
  }
)

export { sequelize }