export const config = {
  env: process.env.NODE_ENV || 'development',
  port: process.env.PORT || 3001,
  db: {
    host: process.env.DB_HOST || '127.0.0.1',
    port: process.env.DB_PORT || '3305',
    user: process.env.DB_USER || 'root',
    pass: process.env.DB_PASS || '',
    name: process.env.DB_NAME || 'campus_access_system',
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'campus_access_system_secret_key',
    expiresIn: process.env.JWT_EXPIRES_IN || '24h',
    webSecret: process.env.JWT_WEB_SECRET || 'campus_access_web_secret_key',
    uniSecret: process.env.JWT_UNI_SECRET || 'campus_access_uni_secret_key'
  },
  cors: {
    webOrigin: process.env.WEB_ORIGIN || 'http://localhost:5174',
    uniOrigin: process.env.UNI_ORIGIN || 'http://localhost:8080'
  }
}