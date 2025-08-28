"use strict";
const utils_request = require("../utils/request.js");
const fetchNotice = (type) => {
  return utils_request.request({
    url: `/api/uni/notifications/notices/${type}`,
    method: "GET"
  });
};
const fetchHomepageAnnouncements = () => {
  return utils_request.request({
    url: "/api/uni/notifications/announcements",
    method: "GET",
    data: {
      location: "homepage",
      type: "announcement",
      active: true
    }
  });
};
exports.fetchHomepageAnnouncements = fetchHomepageAnnouncements;
exports.fetchNotice = fetchNotice;
