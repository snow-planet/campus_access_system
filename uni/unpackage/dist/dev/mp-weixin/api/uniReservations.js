"use strict";
const utils_request = require("../utils/request.js");
const createIndividualReservation = (data) => {
  return utils_request.request({ url: "/api/uni/reservations/individual", method: "POST", data });
};
exports.createIndividualReservation = createIndividualReservation;
