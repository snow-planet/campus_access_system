"use strict";
const utils_request = require("../utils/request.js");
const getApprovalList = (params) => {
  return utils_request.request({
    url: "/api/uni/approval/list",
    method: "GET",
    data: params,
    showLoading: false
  });
};
const approvalAction = (data) => {
  return utils_request.request({
    url: "/api/uni/approval/action",
    method: "POST",
    data,
    showLoading: true
  });
};
const getApproverInfo = (userId) => {
  return utils_request.request({
    url: `/api/uni/approval/approver/${userId}`,
    method: "GET",
    showLoading: false
  });
};
exports.approvalAction = approvalAction;
exports.getApprovalList = getApprovalList;
exports.getApproverInfo = getApproverInfo;
