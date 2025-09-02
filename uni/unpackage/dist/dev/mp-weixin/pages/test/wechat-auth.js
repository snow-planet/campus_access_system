"use strict";
const common_vendor = require("../../common/vendor.js");
const api_uniWechatAuth = require("../../api/uniWechatAuth.js");
const utils_wechatAuthFallback = require("../../utils/wechatAuthFallback.js");
const _sfc_main = {
  data() {
    return {
      authLoading: false,
      isLoggedIn: false,
      userInfo: null,
      logs: [],
      platformInfo: "",
      isWechatEnv: false
    };
  },
  methods: {
    // 添加日志
    addLog(message, type = "info") {
      const now = /* @__PURE__ */ new Date();
      const time = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}:${now.getSeconds().toString().padStart(2, "0")}`;
      this.logs.unshift({
        time,
        message,
        type
      });
      if (this.logs.length > 50) {
        this.logs = this.logs.slice(0, 50);
      }
    },
    // 清除日志
    clearLogs() {
      this.logs = [];
    },
    // 检查平台信息
    checkPlatform() {
      this.platformInfo = "微信小程序";
      this.isWechatEnv = true;
      this.addLog(`平台检测: ${this.platformInfo}, 微信环境: ${this.isWechatEnv}`);
    },
    // 检查登录状态
    checkLoginStatus() {
      try {
        const userId = common_vendor.index.getStorageSync("user_id");
        const openid = common_vendor.index.getStorageSync("openid");
        const userInfo = common_vendor.index.getStorageSync("user_info");
        if (userId) {
          this.isLoggedIn = true;
          this.userInfo = {
            user_id: userId,
            openid,
            ...userInfo
          };
          this.addLog(`检测到已登录用户: ${userId}`, "success");
        } else {
          this.isLoggedIn = false;
          this.userInfo = null;
          this.addLog("未检测到登录信息", "warning");
        }
      } catch (e) {
        this.addLog(`检查登录状态失败: ${e.message}`, "error");
      }
    },
    // 测试微信授权
    async testWechatAuth() {
      if (this.authLoading)
        return;
      this.addLog("开始测试微信授权...");
      this.authLoading = true;
      common_vendor.index.showLoading({ title: "授权测试中..." });
      try {
        this.addLog("正在获取微信登录凭证...");
        const loginRes = await new Promise((resolve, reject) => {
          common_vendor.index.login({
            provider: "weixin",
            success: resolve,
            fail: reject
          });
        });
        const code = loginRes == null ? void 0 : loginRes.code;
        if (!code) {
          throw new Error("未获取到微信授权码");
        }
        this.addLog(`获取到授权码: ${code.substring(0, 10)}...`, "success");
        let userProfile = null;
        try {
          userProfile = await utils_wechatAuthFallback.wechatAuthFallback.getUserInfo();
          this.addLog(`获取用户资料成功: ${userProfile.nickName}`, "success");
        } catch (e) {
          this.addLog(`获取用户资料失败: ${e.message}`, "warning");
        }
        const payload = {
          code,
          username: (userProfile == null ? void 0 : userProfile.nickName) || "测试用户",
          phone: "13800138000",
          real_name: (userProfile == null ? void 0 : userProfile.nickName) || "测试用户",
          avatar_url: (userProfile == null ? void 0 : userProfile.avatarUrl) || ""
        };
        this.addLog("正在调用后端授权接口...");
        const res = await api_uniWechatAuth.wechatLogin(payload);
        const body = (res == null ? void 0 : res.data) || res;
        this.addLog(`后端响应: ${JSON.stringify(body)}`, "info");
        if ((body == null ? void 0 : body.code) !== 0) {
          throw new Error((body == null ? void 0 : body.message) || "登录失败");
        }
        const user = (body == null ? void 0 : body.data) || body;
        const userId = user == null ? void 0 : user.user_id;
        const openid = user == null ? void 0 : user.openid;
        if (!userId) {
          throw new Error("登录返回数据异常");
        }
        try {
          common_vendor.index.setStorageSync("user_id", userId);
          common_vendor.index.setStorageSync("openid", openid || "");
          if (userProfile) {
            common_vendor.index.setStorageSync("user_info", userProfile);
          }
          this.addLog("用户信息保存成功", "success");
        } catch (e) {
          this.addLog(`保存用户信息失败: ${e.message}`, "error");
        }
        this.userInfo = user;
        this.isLoggedIn = true;
        this.addLog("微信授权测试成功！", "success");
        common_vendor.index.showToast({ title: "授权成功", icon: "success" });
      } catch (err) {
        this.addLog(`微信授权失败: ${err.message}`, "error");
        const handled = await utils_wechatAuthFallback.wechatAuthFallback.handleAuthFailure(
          err,
          () => this.testWechatAuth(),
          this
        );
        if (!handled) {
          common_vendor.index.showToast({ title: "授权失败", icon: "none" });
        }
      } finally {
        this.authLoading = false;
        common_vendor.index.hideLoading();
      }
    },
    // 获取用户资料
    async getUserProfile() {
      try {
        this.addLog("正在获取用户资料...");
        const userInfo = await utils_wechatAuthFallback.wechatAuthFallback.getUserInfo();
        this.addLog(`用户资料: ${JSON.stringify(userInfo)}`, "info");
        common_vendor.index.showToast({ title: "获取成功", icon: "success" });
      } catch (e) {
        this.addLog(`获取用户资料失败: ${e.message}`, "error");
        common_vendor.index.showToast({ title: "获取失败", icon: "none" });
      }
    },
    // 清除本地存储
    clearStorage() {
      try {
        common_vendor.index.removeStorageSync("user_id");
        common_vendor.index.removeStorageSync("openid");
        common_vendor.index.removeStorageSync("user_info");
        this.isLoggedIn = false;
        this.userInfo = null;
        this.addLog("本地存储已清除", "success");
        common_vendor.index.showToast({ title: "清除成功", icon: "success" });
      } catch (e) {
        this.addLog(`清除存储失败: ${e.message}`, "error");
      }
    },
    // 检查本地存储
    checkStorage() {
      try {
        const userId = common_vendor.index.getStorageSync("user_id");
        const openid = common_vendor.index.getStorageSync("openid");
        const userInfo = common_vendor.index.getStorageSync("user_info");
        this.addLog(`本地存储检查:`, "info");
        this.addLog(`- user_id: ${userId || "无"}`, "info");
        this.addLog(`- openid: ${openid || "无"}`, "info");
        this.addLog(`- user_info: ${userInfo ? JSON.stringify(userInfo) : "无"}`, "info");
      } catch (e) {
        this.addLog(`检查存储失败: ${e.message}`, "error");
      }
    }
  },
  onLoad() {
    this.checkPlatform();
    this.checkLoginStatus();
    this.addLog("微信授权测试页面已加载");
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: common_vendor.t($data.platformInfo),
    b: common_vendor.t($data.isWechatEnv ? "是" : "否"),
    c: common_vendor.t($data.isLoggedIn ? "已登录" : "未登录"),
    d: common_vendor.n($data.isLoggedIn ? "success" : "error"),
    e: $data.userInfo
  }, $data.userInfo ? {
    f: common_vendor.t($data.userInfo.user_id || "未获取"),
    g: common_vendor.t($data.userInfo.openid || "未获取"),
    h: common_vendor.t($data.userInfo.username || "未获取"),
    i: common_vendor.t($data.userInfo.real_name || "未获取")
  } : {}, {
    j: $data.authLoading
  }, $data.authLoading ? {} : {}, {
    k: common_vendor.o((...args) => $options.testWechatAuth && $options.testWechatAuth(...args)),
    l: $data.authLoading,
    m: common_vendor.o((...args) => $options.getUserProfile && $options.getUserProfile(...args)),
    n: !$data.isLoggedIn,
    o: common_vendor.o((...args) => $options.clearStorage && $options.clearStorage(...args)),
    p: common_vendor.o((...args) => $options.checkStorage && $options.checkStorage(...args)),
    q: common_vendor.o((...args) => $options.clearLogs && $options.clearLogs(...args)),
    r: common_vendor.f($data.logs, (log, index, i0) => {
      return {
        a: common_vendor.t(log.time),
        b: common_vendor.t(log.message),
        c: index,
        d: common_vendor.n(log.type)
      };
    }),
    s: $data.logs.length === 0
  }, $data.logs.length === 0 ? {} : {});
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-bf9a08ca"]]);
wx.createPage(MiniProgramPage);
