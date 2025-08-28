import { request } from '../utils/request'

// Web端获取审批列表
export const getApprovalList = (params) => {
  return request({
    url: '/api/web/approval/list',
    method: 'GET',
    data: params
  })
}

// Web端审批操作（通过/驳回）
export const approvalAction = (data) => {
  return request({
    url: '/api/web/approval/action',
    method: 'POST',
    data
  })
}

// Web端获取审批人信息
export const getApproverInfo = (userId) => {
  return request({
    url: `/api/web/approval/approver/${userId}`,
    method: 'GET'
  })
}