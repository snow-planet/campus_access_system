import { Router } from 'express'
import { Notification } from '../models/Notification.js'
import { User } from '../models/User.js'

const router = Router()

// 获取入校须知（根据类型）
router.get('/notices/:type', async (req, res) => {
  try {
    const { type } = req.params
    
    // 验证类型参数
    if (!['individual_notice', 'group_notice'].includes(type)) {
      return res.status(400).json({ code: 1, message: '无效的须知类型' })
    }
    
    const notice = await Notification.findOne({
      where: {
        type,
        is_active: true
      },
      order: [['updated_at', 'DESC']]
    })
    
    res.json({
      code: 0,
      data: notice ? {
        notification_id: notice.notification_id,
        title: notice.title,
        content: notice.content,
        updated_at: notice.updated_at
      } : null
    })
  } catch (error) {
    console.error('获取入校须知失败:', error)
    res.status(500).json({ code: 1, message: '服务器内部错误' })
  }
})

// 获取公告列表
router.get('/announcements', async (req, res) => {
  try {
    const { page = 1, limit = 10, is_active } = req.query
    
    const where = { type: 'announcement' }
    if (is_active !== undefined) {
      where.is_active = is_active === 'true'
    }
    
    const offset = (page - 1) * limit
    const { count, rows } = await Notification.findAndCountAll({
      where,
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset),
      include: [
        {
          model: User,
          as: 'publisher',
          attributes: ['user_id', 'real_name', 'username']
        }
      ]
    })
    
    res.json({
      code: 0,
      data: {
        announcements: rows,
        total: count,
        page: parseInt(page),
        limit: parseInt(limit)
      }
    })
  } catch (error) {
    console.error('获取公告列表失败:', error)
    res.status(500).json({ code: 1, message: '服务器内部错误' })
  }
})

// 创建公告
router.post('/announcements', async (req, res) => {
  try {
    const { title, content, display_location = 'homepage', publisher_id, is_active = true } = req.body
    
    // 验证必填字段
    if (!title || !content || !publisher_id) {
      return res.status(400).json({ code: 1, message: '缺少必填字段' })
    }
    
    // 验证发布者是否存在
    const publisher = await User.findByPk(publisher_id)
    if (!publisher) {
      return res.status(400).json({ code: 1, message: '发布者不存在' })
    }
    
    const announcement = await Notification.create({
      title,
      content,
      type: 'announcement',
      display_location,
      publisher_id,
      is_active
    })
    
    res.json({
      code: 0,
      message: '公告创建成功',
      data: {
        notification_id: announcement.notification_id,
        title: announcement.title,
        is_active: announcement.is_active
      }
    })
  } catch (error) {
    console.error('创建公告失败:', error)
    res.status(500).json({ code: 1, message: '服务器内部错误' })
  }
})

// 更新公告
router.put('/announcements/:id', async (req, res) => {
  try {
    const { id } = req.params
    const { title, content, display_location, is_active } = req.body
    
    const announcement = await Notification.findOne({
      where: {
        notification_id: id,
        type: 'announcement'
      }
    })
    
    if (!announcement) {
      return res.status(404).json({ code: 1, message: '公告不存在' })
    }
    
    const updateData = {}
    if (title !== undefined) updateData.title = title
    if (content !== undefined) updateData.content = content
    if (display_location !== undefined) updateData.display_location = display_location
    if (is_active !== undefined) updateData.is_active = is_active
    updateData.updated_at = new Date()
    
    await announcement.update(updateData)
    
    res.json({
      code: 0,
      message: '公告更新成功',
      data: {
        notification_id: announcement.notification_id,
        title: announcement.title,
        is_active: announcement.is_active
      }
    })
  } catch (error) {
    console.error('更新公告失败:', error)
    res.status(500).json({ code: 1, message: '服务器内部错误' })
  }
})

// 删除公告
router.delete('/announcements/:id', async (req, res) => {
  try {
    const { id } = req.params
    
    const announcement = await Notification.findOne({
      where: {
        notification_id: id,
        type: 'announcement'
      }
    })
    
    if (!announcement) {
      return res.status(404).json({ code: 1, message: '公告不存在' })
    }
    
    await announcement.destroy()
    
    res.json({
      code: 0,
      message: '公告删除成功'
    })
  } catch (error) {
    console.error('删除公告失败:', error)
    res.status(500).json({ code: 1, message: '服务器内部错误' })
  }
})

// 更新入校须知
router.put('/notices/:type', async (req, res) => {
  try {
    const { type } = req.params
    const { title, content, publisher_id } = req.body
    
    // 验证类型参数
    if (!['individual_notice', 'group_notice'].includes(type)) {
      return res.status(400).json({ code: 1, message: '无效的须知类型' })
    }
    
    // 验证必填字段
    if (!title || !content || !publisher_id) {
      return res.status(400).json({ code: 1, message: '缺少必填字段' })
    }
    
    // 验证发布者是否存在
    const publisher = await User.findByPk(publisher_id)
    if (!publisher) {
      return res.status(400).json({ code: 1, message: '发布者不存在' })
    }
    
    // 查找现有须知
    let notice = await Notification.findOne({
      where: {
        type,
        is_active: true
      }
    })
    
    const display_location = type === 'individual_notice' ? 'individual_form' : 'group_form'
    
    if (notice) {
      // 更新现有须知
      await notice.update({
        title,
        content,
        publisher_id,
        updated_at: new Date()
      })
    } else {
      // 创建新须知
      notice = await Notification.create({
        title,
        content,
        type,
        display_location,
        publisher_id,
        is_active: true
      })
    }
    
    res.json({
      code: 0,
      message: '入校须知更新成功',
      data: {
        notification_id: notice.notification_id,
        title: notice.title,
        type: notice.type
      }
    })
  } catch (error) {
    console.error('更新入校须知失败:', error)
    res.status(500).json({ code: 1, message: '服务器内部错误' })
  }
})

export default router