"use strict";
const common_vendor = require("../../common/vendor.js");
const common_assets = require("../../common/assets.js");
const _sfc_main = {
  data() {
    return {};
  },
  methods: {
    // 跳转到用户预约页面
    goToUserHome() {
      common_vendor.index.navigateTo({
        url: "/pages/user/home"
      });
    },
    // 跳转到管理员登录页面
    goToAdminLogin() {
      common_vendor.index.navigateTo({
        url: "/pages/admin/login"
      });
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return {
    a: common_vendor.o((...args) => $options.goToUserHome && $options.goToUserHome(...args)),
    b: common_vendor.o((...args) => $options.goToAdminLogin && $options.goToAdminLogin(...args)),
    c: common_assets._imports_0
  };
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render]]);
wx.createPage(MiniProgramPage);
