import { request } from '../utils/request'

// ==================== 审批信息管理 API ====================

// 获取审批信息列表
export const getAuditReservations = (params) => {
  return request({
    url: '/api/web/audit/reservations',
    method: 'GET',
    data: params
  })
}

// 获取审批统计数据
export const getAuditStats = () => {
  return request({
    url: '/api/web/audit/stats',
    method: 'GET'
  })
}

// 审批操作（通过/驳回）
export const auditAction = (data) => {
  return request({
    url: '/api/web/audit/action',
    method: 'POST',
    data
  })
}

// ==================== 账号管理 API ====================

// 获取管理统计数据
export const getManagerStats = (params) => {
  return request({
    url: '/api/web/manager/stats',
    method: 'GET',
    data: params
  })
}

// 获取账号列表
export const getAccounts = (params) => {
  return request({
    url: '/api/web/manager/accounts',
    method: 'GET',
    data: params
  })
}

// 获取申请列表
export const getApplications = (params) => {
  return request({
    url: '/api/web/manager/applications',
    method: 'GET',
    data: params
  })
}

// 创建后台账号
export const createAccount = (data) => {
  return request({
    url: '/api/web/manager/accounts',
    method: 'POST',
    data
  })
}

// 处理申请（通过/拒绝）
export const processApplication = (applicationId, data) => {
  return request({
    url: `/api/web/manager/applications/${applicationId}/action`,
    method: 'POST',
    data
  })
}

// 删除账号
export const deleteAccount = (userId) => {
  return request({
    url: `/api/web/manager/accounts/${userId}`,
    method: 'DELETE'
  })
}

// 更新账号信息
export const updateAccount = (userId, data) => {
  return request({
    url: `/api/web/manager/accounts/${userId}`,
    method: 'PUT',
    data
  })
}

// ==================== 通知管理 API ====================

// 获取公告列表
export const getAnnouncements = (params) => {
  return request({
    url: '/api/web/notifications/announcements',
    method: 'GET',
    data: params
  })
}

// 创建公告
export const createAnnouncement = (data) => {
  return request({
    url: '/api/web/notifications/announcements',
    method: 'POST',
    data
  })
}

// 更新公告
export const updateAnnouncement = (notificationId, data) => {
  return request({
    url: `/api/web/notifications/announcements/${notificationId}`,
    method: 'PUT',
    data
  })
}

// 删除公告
export const deleteAnnouncement = (notificationId) => {
  return request({
    url: `/api/web/notifications/announcements/${notificationId}`,
    method: 'DELETE'
  })
}

// 获取入校须知
export const getNotice = (noticeType) => {
  return request({
    url: `/api/web/notifications/notices/${noticeType}`,
    method: 'GET'
  })
}

// 更新入校须知
export const updateNotice = (noticeType, data) => {
  return request({
    url: `/api/web/notifications/notices/${noticeType}`,
    method: 'PUT',
    data
  })
}