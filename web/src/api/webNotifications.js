import { request } from '../utils/request.js'

// 获取入校须知（个人或团队）
export const fetchNotice = (type) => {
  return request({
    url: `/api/web/notifications/notices/${type}`,
    method: 'GET',
  })
}

// 获取公告列表
export const fetchAnnouncements = (params = {}) => {
  return request({
    url: '/api/web/notifications/announcements',
    method: 'GET',
    data: params,
  })
}

// 创建公告
export const createAnnouncement = (data) => {
  return request({
    url: '/api/web/notifications/announcements',
    method: 'POST',
    data,
  })
}

// 更新公告
export const updateAnnouncement = (id, data) => {
  return request({
    url: `/api/web/notifications/announcements/${id}`,
    method: 'PUT',
    data,
  })
}

// 删除公告
export const deleteAnnouncement = (id) => {
  return request({
    url: `/api/web/notifications/announcements/${id}`,
    method: 'DELETE',
  })
}

// 更新入校须知
export const updateNotice = (type, data) => {
  return request({
    url: `/api/web/notifications/notices/${type}`,
    method: 'PUT',
    data,
  })
}

// 获取首页系统公告（启用中的公告，展示在homepage位置，类型为announcement）
export const fetchHomepageAnnouncements = () => {
  return request({
    url: '/api/web/notifications/announcements',
    method: 'GET',
    data: {
      is_active: true,
    },
  })
}