import { request } from '../utils/request.js'

export const createIndividualReservation = (data) => {
  return request({ url: '/api/individual-reservations', method: 'POST', data })
}