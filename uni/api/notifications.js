import { request } from '../utils/request.js'

// 获取首页系统公告（启用中的公告，展示在homepage位置，类型为announcement）
export const fetchHomepageAnnouncements = () => {
  return request({
    url: '/api/notifications',
    method: 'GET',
    data: {
      location: 'homepage',
      type: 'announcement',
      active: true,
    },
  })
}