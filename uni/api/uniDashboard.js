import { request } from '../utils/request.js'

// 获取数据大屏统计数据
export const getDashboardStats = () => {
  return request({
    url: '/api/uni/dashboard/stats',
    method: 'GET'
  })
}

// 获取24小时人流量数据
export const getHourlyTraffic = () => {
  return request({
    url: '/api/uni/dashboard/traffic/hourly',
    method: 'GET'
  })
}

// 获取本周人流量数据
export const getWeeklyTraffic = () => {
  return request({
    url: '/api/uni/dashboard/traffic/weekly',
    method: 'GET'
  })
}

// 获取本月人流量数据
export const getMonthlyTraffic = () => {
  return request({
    url: '/api/uni/dashboard/traffic/monthly',
    method: 'GET'
  })
}

// 获取今日预约记录
export const getTodayReservations = () => {
  return request({
    url: '/api/uni/dashboard/reservations/today',
    method: 'GET'
  })
}

// 获取审批申请统计
export const getApplicationsStats = () => {
  return request({
    url: '/api/uni/dashboard/applications/stats',
    method: 'GET'
  })
}

// 获取公告数据
export const getDashboardAnnouncements = () => {
  return request({
    url: '/api/uni/dashboard/announcements',
    method: 'GET'
  })
}