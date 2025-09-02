import { request } from '../utils/request'

// 创建团体预约
export function createWebGroupReservation(data) {
  return request({ 
    url: '/api/web/group-reservations/group', 
    method: 'POST', 
    data 
  })
}

// 获取团体预约列表
export function getWebGroupReservations(params) {
  return request({ 
    url: '/api/web/group-reservations', 
    method: 'GET', 
    data: params 
  })
}

// 获取团体预约详情
export function getWebGroupReservationDetail(id) {
  return request({ 
    url: `/api/web/group-reservations/${id}`, 
    method: 'GET' 
  })
}

// 更新团体预约
export function updateWebGroupReservation(id, data) {
  return request({ 
    url: `/api/web/group-reservations/${id}`, 
    method: 'PUT', 
    data 
  })
}

// 删除团体预约
export function deleteWebGroupReservation(id) {
  return request({ 
    url: `/api/web/group-reservations/${id}`, 
    method: 'DELETE' 
  })
}