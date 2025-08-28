import { request } from '../utils/request'

// Web端管理员登录
export const adminLogin = (data) => {
  return request({
    url: '/api/web/auth/login',
    method: 'POST',
    data
  })
}

// Web端提交审批人申请
export const submitApproverApplication = (data) => {
  return request({
    url: '/api/web/auth/approver/apply',
    method: 'POST',
    data
  })
}

// Web端获取审批人申请状态
export const getApproverStatus = (userId) => {
  return request({
    url: `/api/web/auth/approver/status/${userId}`,
    method: 'GET'
  })
}

// 创建微信登录二维码
export const createLoginQRCode = () => {
  return request({
    url: '/api/web/auth/qrcode',
    method: 'POST'
  })
}

// 轮询登录状态
export const pollLoginStatus = (scene) => {
  return request({
    url: `/api/web/auth/poll/${scene}`,
    method: 'GET'
  })
}