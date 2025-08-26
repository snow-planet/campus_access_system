"use strict";
const utils_request = require("../utils/request.js");
const fetchNotice = (type) => {
  return utils_request.request({
    url: `/api/uni/notifications/notices/${type}`,
    method: "GET"
  });
};
const fetchAnnouncements = (params = {}) => {
  return utils_request.request({
    url: "/api/uni/notifications/announcements",
    method: "GET",
    data: params
  });
};
const createAnnouncement = (data) => {
  return utils_request.request({
    url: "/api/uni/notifications/announcements",
    method: "POST",
    data
  });
};
const updateAnnouncement = (id, data) => {
  return utils_request.request({
    url: `/api/uni/notifications/announcements/${id}`,
    method: "PUT",
    data
  });
};
const deleteAnnouncement = (id) => {
  return utils_request.request({
    url: `/api/uni/notifications/announcements/${id}`,
    method: "DELETE"
  });
};
const updateNotice = (type, data) => {
  return utils_request.request({
    url: `/api/uni/notifications/notices/${type}`,
    method: "PUT",
    data
  });
};
exports.createAnnouncement = createAnnouncement;
exports.deleteAnnouncement = deleteAnnouncement;
exports.fetchAnnouncements = fetchAnnouncements;
exports.fetchNotice = fetchNotice;
exports.updateAnnouncement = updateAnnouncement;
exports.updateNotice = updateNotice;
