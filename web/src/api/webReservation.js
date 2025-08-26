import { request } from '../utils/request'

export function createWebIndividualReservation(data) {
  return request({ url: '/api/web/individual-reservations', method: 'POST', data })
}