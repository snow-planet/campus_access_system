import { request } from '../utils/request.js'

export const fetchApprovers = () => {
  return request({ url: '/api/users', method: 'GET', data: { role: 'approver' } })
}