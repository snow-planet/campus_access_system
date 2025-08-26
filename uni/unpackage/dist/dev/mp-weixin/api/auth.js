"use strict";
const utils_request = require("../utils/request.js");
const wechatLogin = (data) => {
  return utils_request.request({
    url: "/api/auth/wechat/login",
    method: "POST",
    data
  });
};
exports.wechatLogin = wechatLogin;
