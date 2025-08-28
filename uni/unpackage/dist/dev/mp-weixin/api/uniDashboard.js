"use strict";
const utils_request = require("../utils/request.js");
const getDashboardStats = () => {
  return utils_request.request({
    url: "/api/uni/dashboard/stats",
    method: "GET"
  });
};
const getHourlyTraffic = () => {
  return utils_request.request({
    url: "/api/uni/dashboard/traffic/hourly",
    method: "GET"
  });
};
const getWeeklyTraffic = () => {
  return utils_request.request({
    url: "/api/uni/dashboard/traffic/weekly",
    method: "GET"
  });
};
const getTodayReservations = () => {
  return utils_request.request({
    url: "/api/uni/dashboard/reservations/today",
    method: "GET"
  });
};
exports.getDashboardStats = getDashboardStats;
exports.getHourlyTraffic = getHourlyTraffic;
exports.getTodayReservations = getTodayReservations;
exports.getWeeklyTraffic = getWeeklyTraffic;
