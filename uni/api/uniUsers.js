import { request } from '../utils/request.js'

export const fetchApprovers = () => {
  return request({ url: '/api/uni/users', method: 'GET', data: { role: 'approver' } })
}