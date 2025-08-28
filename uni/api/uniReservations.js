import { request } from '../utils/request.js'

export const createIndividualReservation = (data) => {
  return request({ url: '/api/uni/reservations/individual', method: 'POST', data })
}