import { Router } from 'express'
import { User } from '../models/User.js'

const router = Router()

// GET /api/users?role=approver
router.get('/', async (req, res) => {
  try {
    const { role } = req.query
    const where = {}
    if (role) where.role = role
    const list = await User.findAll({
      where,
      order: [['created_at', 'DESC']],
      limit: 500,
    })
    res.json({ code: 0, data: list })
  } catch (err) {
    console.error(err)
    res.status(500).json({ code: 1, message: 'Server error' })
  }
})

export default router