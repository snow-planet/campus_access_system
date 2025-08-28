"use strict";
const utils_request = require("../utils/request.js");
const adminLogin = (data) => {
  return utils_request.request({
    url: "/api/uni/auth/admin/login",
    method: "POST",
    data,
    showLoading: true
  });
};
const submitApproverApplication = (data) => {
  return utils_request.request({
    url: "/api/uni/auth/approver/apply",
    method: "POST",
    data,
    showLoading: true
  });
};
exports.adminLogin = adminLogin;
exports.submitApproverApplication = submitApproverApplication;
