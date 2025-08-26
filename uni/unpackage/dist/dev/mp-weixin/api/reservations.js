"use strict";
const utils_request = require("../utils/request.js");
const createIndividualReservation = (data) => {
  return utils_request.request({ url: "/api/individual-reservations", method: "POST", data });
};
exports.createIndividualReservation = createIndividualReservation;
