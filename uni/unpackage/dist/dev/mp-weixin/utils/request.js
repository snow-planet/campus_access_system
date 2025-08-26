"use strict";
const common_vendor = require("../common/vendor.js");
let BASE_URL = common_vendor.index.getStorageSync("API_BASE_URL") || "http://127.0.0.1:3001";
const buildURL = (url) => {
  if (!url)
    return "";
  if (url.startsWith("http://") || url.startsWith("https://"))
    return url;
  if (!url.startsWith("/"))
    url = "/" + url;
  return BASE_URL + url;
};
const request = (options = {}) => {
  const { url = "", method = "GET", data = {}, header = {}, showLoading = true } = options;
  return new Promise((resolve, reject) => {
    if (showLoading) {
      common_vendor.index.showLoading({ title: "加载中", mask: true });
    }
    common_vendor.index.request({
      url: buildURL(url),
      method,
      data,
      header: {
        "Content-Type": "application/json",
        ...header
      },
      success: (res) => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(res.data);
        } else {
          common_vendor.index.showToast({ title: "请求失败", icon: "none" });
          reject(res);
        }
      },
      fail: (err) => {
        common_vendor.index.showToast({ title: "网络错误", icon: "none" });
        reject(err);
      },
      complete: () => {
        if (showLoading)
          common_vendor.index.hideLoading();
      }
    });
  });
};
exports.request = request;
