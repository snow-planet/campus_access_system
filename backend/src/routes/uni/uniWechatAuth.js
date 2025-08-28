import { Router } from 'express'
import { User } from '../../models/User.js'
import { code2Session } from '../../services/wechat.js'

const router = Router()

// POST /api/auth/wechat/login
// body: { code, username?, phone?, real_name?, avatar_url? }
router.post('/login', async (req, res) => {
  try {
    const { code, username, phone, real_name, avatar_url } = req.body || {}
    if (!code) return res.status(400).json({ code: 1, message: 'Missing code' })

    const sess = await code2Session(code)
    if (!sess || !sess.openid) {
      return res.status(400).json({ code: 1, message: 'Failed to exchange code' })
    }

    const [user, created] = await User.findOrCreate({
      where: { openid: sess.openid },
      defaults: {
        username: username || '微信用户',
        phone: phone || '未填写',
        real_name: real_name || '微信用户',
        avatar_url: avatar_url || '',
        role: 'user',
        status: 'active',
      },
    })

    // Optional update on login
    const fieldsToUpdate = {}
    if (username && user.username !== username) fieldsToUpdate.username = username
    if (phone && user.phone !== phone) fieldsToUpdate.phone = phone
    if (real_name && user.real_name !== real_name) fieldsToUpdate.real_name = real_name
    if (avatar_url && user.avatar_url !== avatar_url) fieldsToUpdate.avatar_url = avatar_url
    if (Object.keys(fieldsToUpdate).length) await user.update(fieldsToUpdate)

    return res.json({ code: 0, data: { user_id: user.user_id, openid: user.openid } })
  } catch (err) {
    console.error(err)
    res.status(500).json({ code: 1, message: 'Server error' })
  }
})

export default router