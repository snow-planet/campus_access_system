import { request } from '../utils/request.js'

// 获取审批列表
export const getApprovalList = (params) => {
  return request({
    url: '/api/uni/approval/list',
    method: 'GET',
    data: params,
    showLoading: false
  })
}

// 审批操作（通过/驳回）
export const approvalAction = (data) => {
  return request({
    url: '/api/uni/approval/action',
    method: 'POST',
    data,
    showLoading: true
  })
}

// 获取审批人信息
export const getApproverInfo = (userId) => {
  return request({
    url: `/api/uni/approval/approver/${userId}`,
    method: 'GET',
    showLoading: false
  })
}