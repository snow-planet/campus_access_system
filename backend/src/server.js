import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import notificationsRouter from './routes/notifications.js'
import authRouter from './routes/auth.js'
import individualReservationsRouter from './routes/individualReservations.js'
import groupReservationsRouter from './routes/groupReservations.js'
import uniNotificationsRouter from './routes/uniNotifications.js'
import webNotificationsRouter from './routes/webNotifications.js'
import usersRouter from './routes/users.js'
import { testConnection } from './utils/db.js'
import webAuthRouter from './routes/webAuth.js'
import webReservationsRouter from './routes/webReservations.js'
import webGroupReservationsRouter from './routes/webGroupReservations.js'

dotenv.config()

const app = express()

// CORS: allow specific origins from env
const allowedOrigin = process.env.WEB_CORS_ORIGIN || '*'
app.use(cors({ origin: allowedOrigin, credentials: true }))
app.use(express.json())

// API routes (shared)
app.use('/api/notifications', notificationsRouter)
app.use('/api/auth', authRouter)
app.use('/api/individual-reservations', individualReservationsRouter)
app.use('/api/group-reservations', groupReservationsRouter)
app.use('/api/uni/notifications', uniNotificationsRouter)
app.use('/api/web/notifications', webNotificationsRouter)
app.use('/api/users', usersRouter)

// Web-specific routes will be added (auth via OA QR, etc.)
app.use('/api/web/auth', webAuthRouter)
app.use('/api/web/individual-reservations', webReservationsRouter)
app.use('/api/web/group-reservations', webGroupReservationsRouter)

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