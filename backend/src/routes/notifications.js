import { Router } from 'express'
import { Notification } from '../models/Notification.js'
import { Op } from 'sequelize'

const router = Router()

// GET /api/notifications?location=homepage&type=announcement&active=true
router.get('/', async (req, res) => {
  try {
    const { location, type, active } = req.query
    const where = {}
    if (location) where.display_location = location
    if (type) where.type = type
    if (active !== undefined) where.is_active = active === 'true'

    const list = await Notification.findAll({
      where,
      order: [['created_at', 'DESC']],
      limit: 50,
    })

    res.json({ code: 0, data: list })
  } catch (err) {
    console.error(err)
    res.status(500).json({ code: 1, message: 'Server error' })
  }
})

export default router