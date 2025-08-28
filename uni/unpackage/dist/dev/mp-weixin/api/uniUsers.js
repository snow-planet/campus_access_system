"use strict";
const utils_request = require("../utils/request.js");
const fetchApprovers = () => {
  return utils_request.request({ url: "/api/uni/users", method: "GET", data: { role: "approver" } });
};
exports.fetchApprovers = fetchApprovers;
