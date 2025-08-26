import { request } from '../utils/request.js'

// 创建团队预约
export const createGroupReservation = (data) => {
  return request({
    url: '/api/group-reservations',
    method: 'POST',
    data,
  })
}

// 获取用户的团队预约列表
export const fetchUserGroupReservations = (userId, params = {}) => {
  return request({
    url: `/api/group-reservations/user/${userId}`,
    method: 'GET',
    data: params,
  })
}

// 获取团队预约详情
export const fetchGroupReservationDetail = (reservationId) => {
  return request({
    url: `/api/group-reservations/${reservationId}`,
    method: 'GET',
  })
}

// 更新团队预约状态（审批用）
export const updateGroupReservationStatus = (reservationId, data) => {
  return request({
    url: `/api/group-reservations/${reservationId}/status`,
    method: 'PUT',
    data,
  })
}