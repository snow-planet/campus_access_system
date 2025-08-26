import { request } from '../utils/request'

export function createLoginQRCode() {
  return request({ url: '/api/web/auth/qrcode', method: 'POST' })
}

export function pollLoginStatus(scene) {
  return request({ url: '/api/web/auth/poll', method: 'GET', data: { scene } })
}