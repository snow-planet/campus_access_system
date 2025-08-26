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
}