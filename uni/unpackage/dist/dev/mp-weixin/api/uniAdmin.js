"use strict";
const utils_request = require("../utils/request.js");
const getAuditReservations = (params) => {
  return utils_request.request({
    url: "/api/uni/approval/reservations",
    method: "GET",
    data: params,
    showLoading: false
  });
};
const getUserInfo = (userId) => {
  return utils_request.request({
    url: `/api/uni/users/${userId}`,
    method: "GET",
    showLoading: false
  });
};
const getAuditStats = () => {
  return utils_request.request({
    url: "/api/uni/approval/stats",
    method: "GET",
    showLoading: false
  });
};
const auditAction = (data) => {
  return utils_request.request({
    url: "/api/uni/approval/action",
    method: "POST",
    data,
    showLoading: true
  });
};
const getManagerStats = (params) => {
  return utils_request.request({
    url: "/api/uni/manager/stats",
    method: "GET",
    data: params,
    showLoading: false
  });
};
const getAccounts = (params) => {
  return utils_request.request({
    url: "/api/uni/manager/accounts",
    method: "GET",
    data: params,
    showLoading: false
  });
};
const getApplications = (params) => {
  return utils_request.request({
    url: "/api/uni/manager/applications",
    method: "GET",
    data: params,
    showLoading: false
  });
};
const createAccount = (data) => {
  return utils_request.request({
    url: "/api/uni/manager/accounts",
    method: "POST",
    data,
    showLoading: true
  });
};
const processApplication = (applicationId, data) => {
  return utils_request.request({
    url: `/api/uni/manager/applications/${applicationId}/action`,
    method: "POST",
    data,
    showLoading: true
  });
};
const deleteAccount = (userId) => {
  return utils_request.request({
    url: `/api/uni/manager/accounts/${userId}`,
    method: "DELETE",
    showLoading: true
  });
};
const getAnnouncements = (params) => {
  return utils_request.request({
    url: "/api/uni/notifications/announcements",
    method: "GET",
    data: params,
    showLoading: false
  });
};
const createAnnouncement = (data) => {
  return utils_request.request({
    url: "/api/uni/notifications/announcements",
    method: "POST",
    data,
    showLoading: true
  });
};
const updateAnnouncement = (notificationId, data) => {
  return utils_request.request({
    url: `/api/uni/notifications/announcements/${notificationId}`,
    method: "PUT",
    data,
    showLoading: true
  });
};
const deleteAnnouncement = (notificationId) => {
  return utils_request.request({
    url: `/api/uni/notifications/announcements/${notificationId}`,
    method: "DELETE",
    showLoading: true
  });
};
const getNotice = (noticeType) => {
  return utils_request.request({
    url: `/api/uni/notifications/notices/${noticeType}`,
    method: "GET",
    showLoading: false
  });
};
const updateNotice = (noticeType, data) => {
  return utils_request.request({
    url: `/api/uni/notifications/notices/${noticeType}`,
    method: "PUT",
    data,
    showLoading: true
  });
};
exports.auditAction = auditAction;
exports.createAccount = createAccount;
exports.createAnnouncement = createAnnouncement;
exports.deleteAccount = deleteAccount;
exports.deleteAnnouncement = deleteAnnouncement;
exports.getAccounts = getAccounts;
exports.getAnnouncements = getAnnouncements;
exports.getApplications = getApplications;
exports.getAuditReservations = getAuditReservations;
exports.getAuditStats = getAuditStats;
exports.getManagerStats = getManagerStats;
exports.getNotice = getNotice;
exports.getUserInfo = getUserInfo;
exports.processApplication = processApplication;
exports.updateAnnouncement = updateAnnouncement;
exports.updateNotice = updateNotice;
