"use strict";
const common_vendor = require("../../common/vendor.js");
const api_uniAuth = require("../../api/uniAuth.js");
const api_uniWechatAuth = require("../../api/uniWechatAuth.js");
const utils_wechatAuthFallback = require("../../utils/wechatAuthFallback.js");
const _sfc_main = {
  data() {
    return {
      username: "",
      password: "",
      showApplicationModal: false,
      positionIndex: 0,
      collegeIndex: 0,
      positionOptions: ["teacher", "security"],
      positionLabels: ["教师", "安保人员"],
      collegeOptions: [
        "信息技术学院",
        "治安学院",
        "交通管理学院",
        "保卫处"
      ],
      applicationForm: {
        real_name: "",
        phone: "",
        college: "",
        position: ""
      },
      isWechatLoggedIn: false,
      currentUserId: null
    };
  },
  methods: {
    // 处理登录
    async handleLogin() {
      if (!this.username || !this.password) {
        common_vendor.index.showToast({
          title: "请输入用户名和密码",
          icon: "none"
        });
        return;
      }
      try {
        const res = await api_uniAuth.adminLogin({
          username: this.username,
          password: this.password
        });
        if (res && res.code === 0) {
          const userData = res.data;
          common_vendor.index.setStorageSync("currentUser", {
            user_id: userData.user_id,
            username: userData.username,
            real_name: userData.real_name,
            role: userData.role,
            college: userData.college,
            position: userData.position,
            token: userData.token
          });
          common_vendor.index.showToast({
            title: "登录成功",
            icon: "success"
          });
          setTimeout(() => {
            if (userData.role === "approver") {
              common_vendor.index.navigateTo({
                url: "/pages/admin/home"
              });
            } else if (userData.role === "admin") {
              common_vendor.index.navigateTo({
                url: "/pages/admin/adminhome"
              });
            } else {
              common_vendor.index.showToast({
                title: "权限不足",
                icon: "none"
              });
            }
          }, 1e3);
        } else {
          common_vendor.index.showToast({
            title: res.message || "登录失败",
            icon: "none"
          });
        }
      } catch (error) {
        console.error("登录失败:", error);
        common_vendor.index.showToast({
          title: "登录失败，请重试",
          icon: "none"
        });
      }
    },
    // 返回首页
    goBack() {
      common_vendor.index.reLaunch({
        url: "/pages/index/index"
      });
    },
    // 显示申请表单
    showSignIn() {
      this.showApplicationModal = true;
    },
    // 关闭申请表单
    closeModal() {
      this.showApplicationModal = false;
    },
    // 学院选择变化
    onCollegeChange(e) {
      const index = e.detail.value;
      this.collegeIndex = index;
      this.applicationForm.college = this.collegeOptions[index];
    },
    // 职位选择变化
    onPositionChange(e) {
      const index = e.detail.value;
      this.positionIndex = index;
      this.applicationForm.position = this.positionOptions[index];
    },
    // 获取职位中文标签
    getPositionLabel(position) {
      const index = this.positionOptions.indexOf(position);
      return index >= 0 ? this.positionLabels[index] : "";
    },
    // 微信授权登录
    async handleWechatAuth() {
      common_vendor.index.showLoading({ title: "正在授权..." });
      try {
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
        let userInfo = null;
        try {
          userInfo = await utils_wechatAuthFallback.wechatAuthFallback.getUserInfo();
        } catch (e) {
          console.log("获取用户信息失败，使用默认信息:", e);
        }
        const payload = {
          code,
          username: (userInfo == null ? void 0 : userInfo.nickName) || this.applicationForm.real_name || "申请用户",
          phone: this.applicationForm.phone || "未填写",
          real_name: this.applicationForm.real_name || (userInfo == null ? void 0 : userInfo.nickName) || "申请用户",
          avatar_url: (userInfo == null ? void 0 : userInfo.avatarUrl) || ""
        };
        const res = await api_uniWechatAuth.wechatLogin(payload);
        const body = (res == null ? void 0 : res.data) || res;
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
          if (userInfo) {
            common_vendor.index.setStorageSync("user_info", userInfo);
          }
        } catch (e) {
          console.error("保存用户信息失败:", e);
        }
        this.isWechatLoggedIn = true;
        this.currentUserId = userId;
        common_vendor.index.showToast({
          title: "微信授权成功",
          icon: "success",
          duration: 2e3
        });
      } catch (err) {
        console.error("微信授权失败:", err);
        const handled = await utils_wechatAuthFallback.wechatAuthFallback.handleAuthFailure(
          err,
          () => this.handleWechatAuth(),
          this
        );
        if (!handled) {
          let errorMsg = "授权失败，请重试";
          if (err.message) {
            if (err.message.includes("网络")) {
              errorMsg = "网络连接异常，请检查网络";
            } else if (err.message.includes("超时")) {
              errorMsg = "授权超时，请重试";
            } else {
              errorMsg = err.message;
            }
          }
          common_vendor.index.showToast({
            title: errorMsg,
            icon: "none",
            duration: 3e3
          });
        }
      } finally {
        common_vendor.index.hideLoading();
      }
    },
    // 检查登录状态
    checkLoginStatus() {
      try {
        const uid = common_vendor.index.getStorageSync("user_id");
        if (uid) {
          this.isWechatLoggedIn = true;
          this.currentUserId = uid;
        }
      } catch (e) {
        console.error("检查登录状态失败:", e);
      }
    },
    // 提交申请
    async submitApplication() {
      if (!this.applicationForm.real_name || !this.applicationForm.phone || !this.applicationForm.college || !this.applicationForm.position) {
        common_vendor.index.showToast({
          title: "请填写完整信息",
          icon: "none"
        });
        return;
      }
      const phoneRegex = /^1[3-9]\d{9}$/;
      if (!phoneRegex.test(this.applicationForm.phone)) {
        common_vendor.index.showToast({
          title: "请输入正确的手机号码",
          icon: "none"
        });
        return;
      }
      if (!this.isWechatLoggedIn || !this.currentUserId) {
        common_vendor.index.showToast({
          title: "请先完成微信授权",
          icon: "none"
        });
        return;
      }
      try {
        const res = await api_uniAuth.submitApproverApplication({
          user_id: this.currentUserId,
          real_name: this.applicationForm.real_name,
          phone: this.applicationForm.phone,
          college: this.applicationForm.college,
          position: this.applicationForm.position
        });
        if (res && res.code === 0) {
          common_vendor.index.showToast({
            title: "申请提交成功",
            icon: "success"
          });
          this.closeModal();
          this.applicationForm = {
            real_name: "",
            phone: "",
            college: "",
            position: ""
          };
          this.positionIndex = 0;
          this.collegeIndex = 0;
        } else {
          common_vendor.index.showToast({
            title: res.message || "申请提交失败",
            icon: "none"
          });
        }
      } catch (error) {
        console.error("提交申请失败:", error);
        common_vendor.index.showToast({
          title: "申请提交失败，请重试",
          icon: "none"
        });
      }
    },
    // 页面生命周期
    onLoad() {
      this.checkLoginStatus();
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: !$data.showApplicationModal
  }, !$data.showApplicationModal ? {
    b: $data.username,
    c: common_vendor.o(($event) => $data.username = $event.detail.value),
    d: $data.password,
    e: common_vendor.o(($event) => $data.password = $event.detail.value),
    f: common_vendor.o((...args) => $options.handleLogin && $options.handleLogin(...args)),
    g: common_vendor.o((...args) => $options.goBack && $options.goBack(...args))
  } : {}, {
    h: $data.showApplicationModal
  }, $data.showApplicationModal ? common_vendor.e({
    i: common_vendor.o((...args) => $options.closeModal && $options.closeModal(...args)),
    j: $data.applicationForm.real_name,
    k: common_vendor.o(($event) => $data.applicationForm.real_name = $event.detail.value),
    l: $data.applicationForm.phone,
    m: common_vendor.o(($event) => $data.applicationForm.phone = $event.detail.value),
    n: !$data.isWechatLoggedIn
  }, !$data.isWechatLoggedIn ? {
    o: common_vendor.o((...args) => $options.handleWechatAuth && $options.handleWechatAuth(...args))
  } : {}, {
    p: common_vendor.t($data.applicationForm.college || "请选择学院/部门"),
    q: common_vendor.n($data.applicationForm.college ? "" : "placeholder"),
    r: $data.collegeOptions,
    s: common_vendor.o((...args) => $options.onCollegeChange && $options.onCollegeChange(...args)),
    t: common_vendor.t($options.getPositionLabel($data.applicationForm.position) || "请选择您的职位"),
    v: common_vendor.n($data.applicationForm.position ? "" : "placeholder"),
    w: $data.positionLabels,
    x: common_vendor.o((...args) => $options.onPositionChange && $options.onPositionChange(...args)),
    y: common_vendor.o((...args) => $options.submitApplication && $options.submitApplication(...args)),
    z: common_vendor.o((...args) => $options.closeModal && $options.closeModal(...args))
  }) : {}, {
    A: !$data.showApplicationModal
  }, !$data.showApplicationModal ? {
    B: common_vendor.o((...args) => $options.showSignIn && $options.showSignIn(...args))
  } : {});
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-3190821f"]]);
wx.createPage(MiniProgramPage);
