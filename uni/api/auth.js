import { request } from '../utils/request.js'

// 微信小程序登录，后端通过 code2session 交换 openid 并落库/更新用户
export const wechatLogin = (data) => {
  return request({
    url: '/api/auth/wechat/login',
    method: 'POST',
    data,
  })
}