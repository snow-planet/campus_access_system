import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import uniNotificationsRouter from './routes/uni/uniNotifications.js'
import uniWechatAuthRouter from './routes/uni/uniWechatAuth.js'
import uniIndividualReservationsRouter from './routes/uni/uniIndividualReservations.js'
import uniGroupReservationsRouter from './routes/uni/uniGroupReservations.js'
import uniAuthRouter from './routes/uni/uniAuth.js'
import uniApprovalRouter from './routes/uni/uniApproval.js'
import uniUsersRouter from './routes/uni/uniUsers.js'
import uniManagerRouter from './routes/uni/uniManager.js'
import uniDashboardRouter from './routes/uni/uniDashboard.js'
import { testConnection } from './utils/db.js'

import webApprovalRouter from './routes/web/webApproval.js'
import webAuthRouter from './routes/web/webAuth.js'
import webAuditRouter from './routes/web/webAudit.js'
import webManagerRouter from './routes/web/webManager.js'
import webNotificationsRouter from './routes/web/webNotifications.js'
import webDashboardRouter from './routes/web/webDashboard.js'

dotenv.config()

const app = express()

// CORS: allow specific origins from env
const allowedOrigin = process.env.WEB_CORS_ORIGIN || '*'
app.use(cors({ origin: allowedOrigin, credentials: true }))
app.use(express.json())

// uni-app端路由
app.use('/api/uni/notifications', uniNotificationsRouter)
app.use('/api/auth/wechat', uniWechatAuthRouter)
app.use('/api/uni/reservations/individual', uniIndividualReservationsRouter)
app.use('/api/uni/reservations/group', uniGroupReservationsRouter)
app.use('/api/uni/auth', uniAuthRouter)
app.use('/api/uni/approval', uniApprovalRouter)
app.use('/api/uni/users', uniUsersRouter)
app.use('/api/uni/manager', uniManagerRouter)
app.use('/api/uni/dashboard', uniDashboardRouter)

// Web端路由
app.use('/api/web/approval', webApprovalRouter)
app.use('/api/web/audit', webAuditRouter)
app.use('/api/web/auth', webAuthRouter)
app.use('/api/web/manager', webManagerRouter)
app.use('/api/web/notifications', webNotificationsRouter)
app.use('/api/web/dashboard', webDashboardRouter)

const PORT = process.env.PORT || 3001

async function start() {
  await testConnection()
  app.listen(PORT, () => {
    console.log(`Backend server listening on port ${PORT}`)
  })
}

start().catch((err) => {
  console.error('Failed to start server:', err)
  process.exit(1)
})