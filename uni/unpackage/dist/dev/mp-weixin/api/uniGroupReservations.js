"use strict";
const utils_request = require("../utils/request.js");
const createGroupReservation = (data) => {
  return utils_request.request({
    url: "/api/uni/reservations/group",
    method: "POST",
    data
  });
};
exports.createGroupReservation = createGroupReservation;
