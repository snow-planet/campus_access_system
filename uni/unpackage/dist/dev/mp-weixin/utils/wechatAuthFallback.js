"use strict";
const common_vendor = require("../common/vendor.js");
const wechatAuthFallback = {
  /**
   * 处理授权失败
   * @param {Error} error - 错误对象
   * @param {Function} retryCallback - 重试回调函数
   * @param {Object} context - 组件上下文
   * @returns {boolean} 是否已处理
   */
  async handleAuthFailure(error, retryCallback, context) {
    const errorMsg = (error == null ? void 0 : error.errMsg) || (error == null ? void 0 : error.message) || "未知错误";
    if (errorMsg.includes("cancel") || errorMsg.includes("deny")) {
      common_vendor.index.showModal({
        title: "授权提示",
        content: "微信授权被取消，部分功能可能无法正常使用。是否重新授权？",
        confirmText: "重新授权",
        cancelText: "稍后再说",
        success: (res) => {
          if (res.confirm && retryCallback) {
            retryCallback();
          }
        }
      });
      return true;
    }
    if (errorMsg.includes("network") || errorMsg.includes("timeout")) {
      common_vendor.index.showModal({
        title: "网络错误",
        content: "网络连接异常，请检查网络后重试",
        confirmText: "重试",
        cancelText: "取消",
        success: (res) => {
          if (res.confirm && retryCallback) {
            setTimeout(() => {
              retryCallback();
            }, 1e3);
          }
        }
      });
      return true;
    }
    if (errorMsg.includes("version")) {
      common_vendor.index.showModal({
        title: "版本提示",
        content: "当前微信版本过低，请更新微信后重试",
        showCancel: false,
        confirmText: "我知道了"
      });
      return true;
    }
    if (errorMsg.includes("server") || errorMsg.includes("500")) {
      common_vendor.index.showModal({
        title: "服务异常",
        content: "服务器暂时繁忙，请稍后重试",
        confirmText: "重试",
        cancelText: "取消",
        success: (res) => {
          if (res.confirm && retryCallback) {
            setTimeout(() => {
              retryCallback();
            }, 2e3);
          }
        }
      });
      return true;
    }
    return false;
  },
  /**
   * 检查微信环境
   * @returns {boolean} 是否在微信环境中
   */
  checkWechatEnv() {
    return true;
  },
  /**
   * 获取用户信息（降级处理）
   * @param {Object} options - 选项
   * @returns {Promise} 用户信息
   */
  async getUserInfo(options = {}) {
    return new Promise((resolve, reject) => {
      common_vendor.index.getUserProfile({
        desc: "用于完善用户资料",
        success: (res) => {
          resolve(res.userInfo);
        },
        fail: (err) => {
          resolve({
            nickName: "微信用户",
            avatarUrl: "",
            gender: 0,
            country: "",
            province: "",
            city: ""
          });
        }
      });
    });
  }
};
exports.wechatAuthFallback = wechatAuthFallback;
