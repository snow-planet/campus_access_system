"use strict";
const utils_request = require("../utils/request.js");
const fetchHomepageAnnouncements = () => {
  return utils_request.request({
    url: "/api/notifications",
    method: "GET",
    data: {
      location: "homepage",
      type: "announcement",
      active: true
    }
  });
};
exports.fetchHomepageAnnouncements = fetchHomepageAnnouncements;
