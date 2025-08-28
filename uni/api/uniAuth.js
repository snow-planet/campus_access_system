import { request } from '../utils/request.js'

// 管理员登录
export const adminLogin = (data) => {
  return request({
    url: '/api/uni/auth/admin/login',
    method: 'POST',
    data,
    showLoading: true
  })
}

// 提交审批人申请
export const submitApproverApplication = (data) => {
  return request({
    url: '/api/uni/auth/approver/apply',
    method: 'POST',
    data,
    showLoading: true
  })
}

// 获取审批人申请状态
export const getApproverStatus = (userId) => {
  return request({
    url: `/api/uni/auth/approver/status/${userId}`,
    method: 'GET',
    showLoading: false
  })
}