import { request } from '../utils/request.js'

// ==================== 审批信息管理 API ====================

// 获取审批信息列表
export const getAuditReservations = (params) => {
  return request({
    url: '/api/uni/approval/reservations',
    method: 'GET',
    data: params,
    showLoading: false
  })
}

// 获取用户信息
export const getUserInfo = (userId) => {
  return request({
    url: `/api/uni/users/${userId}`,
    method: 'GET',
    showLoading: false
  })
}

// 获取审批统计数据
export const getAuditStats = () => {
  return request({
    url: '/api/uni/approval/stats',
    method: 'GET',
    showLoading: false
  })
}

// 审批操作（通过/驳回）
export const auditAction = (data) => {
  return request({
    url: '/api/uni/approval/action',
    method: 'POST',
    data,
    showLoading: true
  })
}

// ==================== 账号管理 API ====================

// 获取管理统计数据
export const getManagerStats = (params) => {
  return request({
    url: '/api/uni/manager/stats',
    method: 'GET',
    data: params,
    showLoading: false
  })
}

// 获取账号列表
export const getAccounts = (params) => {
  return request({
    url: '/api/uni/manager/accounts',
    method: 'GET',
    data: params,
    showLoading: false
  })
}

// 获取申请列表
export const getApplications = (params) => {
  return request({
    url: '/api/uni/manager/applications',
    method: 'GET',
    data: params,
    showLoading: false
  })
}

// 创建后台账号
export const createAccount = (data) => {
  return request({
    url: '/api/uni/manager/accounts',
    method: 'POST',
    data,
    showLoading: true
  })
}

// 处理申请（通过/拒绝）
export const processApplication = (applicationId, data) => {
  return request({
    url: `/api/uni/manager/applications/${applicationId}/action`,
    method: 'POST',
    data,
    showLoading: true
  })
}

// 删除账号
export const deleteAccount = (userId) => {
  return request({
    url: `/api/uni/manager/accounts/${userId}`,
    method: 'DELETE',
    showLoading: true
  })
}

// 更新账号信息
export const updateAccount = (userId, data) => {
  return request({
    url: `/api/uni/manager/accounts/${userId}`,
    method: 'PUT',
    data,
    showLoading: true
  })
}

// ==================== 通知管理 API ====================

// 获取公告列表
export const getAnnouncements = (params) => {
  return request({
    url: '/api/uni/notifications/announcements',
    method: 'GET',
    data: params,
    showLoading: false
  })
}

// 创建公告
export const createAnnouncement = (data) => {
  return request({
    url: '/api/uni/notifications/announcements',
    method: 'POST',
    data,
    showLoading: true
  })
}

// 更新公告
export const updateAnnouncement = (notificationId, data) => {
  return request({
    url: `/api/uni/notifications/announcements/${notificationId}`,
    method: 'PUT',
    data,
    showLoading: true
  })
}

// 删除公告
export const deleteAnnouncement = (notificationId) => {
  return request({
    url: `/api/uni/notifications/announcements/${notificationId}`,
    method: 'DELETE',
    showLoading: true
  })
}

// 获取入校须知
export const getNotice = (noticeType) => {
  return request({
    url: `/api/uni/notifications/notices/${noticeType}`,
    method: 'GET',
    showLoading: false
  })
}

// 更新入校须知
export const updateNotice = (noticeType, data) => {
  return request({
    url: `/api/uni/notifications/notices/${noticeType}`,
    method: 'PUT',
    data,
    showLoading: true
  })
}

// ==================== 数据看板 API ====================

// 获取数据看板统计数据
export const getDashboardStats = () => {
  return request({
    url: '/api/uni/dashboard/stats',
    method: 'GET',
    showLoading: false
  })
}

// 获取24小时人流量数据
export const getHourlyTraffic = () => {
  return request({
    url: '/api/uni/dashboard/traffic/hourly',
    method: 'GET',
    showLoading: false
  })
}

// 获取本周人流量数据
export const getWeeklyTraffic = () => {
  return request({
    url: '/api/uni/dashboard/traffic/weekly',
    method: 'GET',
    showLoading: false
  })
}

// 获取本月人流量数据
export const getMonthlyTraffic = () => {
  return request({
    url: '/api/uni/dashboard/traffic/monthly',
    method: 'GET',
    showLoading: false
  })
}

// 获取今日预约记录
export const getTodayReservations = () => {
  return request({
    url: '/api/uni/dashboard/reservations/today',
    method: 'GET',
    showLoading: false
  })
}

// 获取审批申请统计
export const getApplicationsStats = () => {
  return request({
    url: '/api/uni/dashboard/applications/stats',
    method: 'GET',
    showLoading: false
  })
}

// 获取公告数据
export const getDashboardAnnouncements = () => {
  return request({
    url: '/api/uni/dashboard/announcements',
    method: 'GET',
    showLoading: false
  })
}