"use strict";
const common_vendor = require("./common/vendor.js");
const api_uniWechatAuth = require("./api/uniWechatAuth.js");
const api_uniUsers = require("./api/uniUsers.js");
const api_uniReservations = require("./api/uniReservations.js");
const api_uniNotifications = require("./api/uniNotifications.js");
const utils_wechatAuthFallback = require("./utils/wechatAuthFallback.js");
const common_assets = require("./common/assets.js");
const _sfc_main = {
  data() {
    const today = /* @__PURE__ */ new Date();
    const year = today.getFullYear();
    const month = (today.getMonth() + 1).toString().padStart(2, "0");
    const day = today.getDate().toString().padStart(2, "0");
    const minDate = `${year}-${month}-${day}`;
    return {
      showNoticeModal: true,
      agreeNotice: false,
      isScrolledToBottom: false,
      noticeContent: "",
      noticeTitle: "个人预约入校须知",
      isWechatLoggedIn: false,
      authLoading: false,
      showQrcodeModal: false,
      minDate,
      purposeIndex: 0,
      approverIndex: 0,
      scrollTop: 0,
      contentHeight: 0,
      scrollViewHeight: 0,
      formData: {
        purpose: "",
        name: "",
        phone: "",
        visitDate: "",
        entryTime: "",
        exitTime: "",
        gate: "北门",
        carNumber: "",
        approverId: ""
      },
      purposeOptions: [
        { id: 1, name: "学术交流" },
        { id: 2, name: "业务洽谈" },
        { id: 3, name: "参加会议" },
        { id: 4, name: "参观访问" }
      ],
      approvers: []
    };
  },
  computed: {
    selectedApprover() {
      if (this.approverIndex >= 0 && this.approverIndex < this.approvers.length) {
        return this.approvers[this.approverIndex].name;
      }
      return "";
    }
  },
  methods: {
    handleScroll(e) {
      const { scrollHeight, scrollTop, height } = e.detail;
      if (scrollHeight - scrollTop - height < 10) {
        this.isScrolledToBottom = true;
      }
    },
    // 检查内容是否需要滚动
    checkScrollability() {
      const query = common_vendor.index.createSelectorQuery().in(this);
      query.select(".modal-content").boundingClientRect((data) => {
        this.scrollViewHeight = data.height;
      }).exec();
      query.select(".notice-content").boundingClientRect((data) => {
        this.contentHeight = data.height;
        if (this.contentHeight <= this.scrollViewHeight) {
          this.isScrolledToBottom = true;
        }
      }).exec();
    },
    toggleAgree() {
      if (this.isScrolledToBottom) {
        this.agreeNotice = !this.agreeNotice;
      } else {
        common_vendor.index.showToast({
          title: "请阅读完所有内容",
          icon: "none"
        });
        this.scrollTop = this.contentHeight;
        setTimeout(() => {
          this.isScrolledToBottom = true;
        }, 300);
      }
    },
    closeNotice() {
      if (this.agreeNotice) {
        this.showNoticeModal = false;
        if (this.approvers.length === 0) {
          this.loadApprovers();
        }
      }
    },
    // 微信授权登录（真实对接）
    async handleWechatAuth() {
      var _a, _b, _c;
      if (this.authLoading)
        return;
      this.authLoading = true;
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
          username: (userInfo == null ? void 0 : userInfo.nickName) || ((_a = this.formData) == null ? void 0 : _a.name) || "微信用户",
          phone: ((_b = this.formData) == null ? void 0 : _b.phone) || "未填写",
          real_name: ((_c = this.formData) == null ? void 0 : _c.name) || (userInfo == null ? void 0 : userInfo.nickName) || "微信用户",
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
        common_vendor.index.showToast({
          title: "授权成功",
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
        this.authLoading = false;
        common_vendor.index.hideLoading();
      }
    },
    // 显示公众号二维码
    showQrcodePrompt() {
      this.showQrcodeModal = false;
    },
    // 关闭二维码弹窗
    closeQrcodeModal() {
      this.showQrcodeModal = false;
    },
    // 检查登录状态（读取本地缓存）
    checkLoginStatus() {
      try {
        const uid = common_vendor.index.getStorageSync("user_id");
        if (uid)
          this.isWechatLoggedIn = true;
      } catch (e) {
      }
    },
    // 加载入校须知
    loadNotice() {
      api_uniNotifications.fetchNotice("individual_notice").then((res) => {
        console.log("入校须知API响应:", res);
        if (res && res.code === 0 && res.data) {
          this.noticeTitle = res.data.title || "个人预约入校须知";
          this.noticeContent = res.data.content || "";
        } else {
          console.log("入校须知数据格式异常，使用默认内容");
          this.noticeContent = "1. 请提前至少1个工作日进行预约申请\n2. 入校时请携带有效身份证件以备查验\n3. 请按照预约时间段入校，不得提前或超时\n4. 车辆请停放在指定停车场，不得随意停放\n5. 入校后请遵守校园管理规定，不得进入非申请区域\n6. 如有随行人员，请在事由中说明并确保其携带身份证件\n7. 如行程有变，请及时取消或修改预约\n8. 严禁携带违禁物品入校\n9. 入校期间请保持环境整洁，不得乱扔垃圾\n10. 如有任何问题，请及时与审批人或保卫处联系";
        }
      }).catch((err) => {
        console.error("加载入校须知失败:", err);
      });
    },
    // 加载审批人列表（真实接口）
    loadApprovers() {
      common_vendor.index.showLoading({ title: "加载审批人" });
      api_uniUsers.fetchApprovers().then((res) => {
        console.log("审批人API响应:", res);
        const body = (res == null ? void 0 : res.data) || res;
        const list = (body == null ? void 0 : body.data) || body || [];
        console.log("解析后的审批人列表:", list);
        this.approvers = (Array.isArray(list) ? list : []).map((u) => ({
          id: u.user_id,
          name: `${u.real_name || u.username || "审批人"}${u.college ? " - " + u.college : ""}`
        }));
        console.log("最终审批人数组:", this.approvers);
        this.approverIndex = -1;
        this.formData.approverId = "";
        if (this.approvers.length > 0) {
          common_vendor.index.showToast({ title: `加载到${this.approvers.length}个审批人`, icon: "success" });
        } else {
          common_vendor.index.showToast({ title: "未找到审批人数据", icon: "none" });
        }
      }).catch((err) => {
        console.error("加载审批人失败:", err);
        common_vendor.index.showToast({ title: "审批人加载失败", icon: "none" });
      }).finally(() => {
        common_vendor.index.hideLoading();
      });
    },
    onPurposeChange(e) {
      const index = e.detail.value;
      this.purposeIndex = index;
      this.formData.purpose = this.purposeOptions[index].name;
    },
    onDateChange(e) {
      this.formData.visitDate = e.detail.value;
    },
    onEntryTimeChange(e) {
      this.formData.entryTime = e.target.value;
    },
    onExitTimeChange(e) {
      this.formData.exitTime = e.target.value;
    },
    onGateChange(e) {
      this.formData.gate = e.detail.value;
    },
    onApproverChange(e) {
      const index = parseInt(e.detail.value);
      this.approverIndex = index;
      if (this.approvers && this.approvers.length > index && index >= 0 && this.approvers[index]) {
        this.formData.approverId = this.approvers[index].id;
      } else {
        this.formData.approverId = "";
      }
    },
    resetForm() {
      this.formData = {
        purpose: "",
        name: "",
        phone: "",
        visitDate: "",
        entryTime: "",
        exitTime: "",
        gate: "北门",
        carNumber: "",
        approverId: ""
      };
      this.purposeIndex = 0;
      this.approverIndex = -1;
    },
    submitForm() {
      if (!this.formData.purpose || !this.formData.name || !this.formData.phone || !this.formData.visitDate || !this.formData.approverId) {
        common_vendor.index.showToast({
          title: "请填写所有必填项",
          icon: "none"
        });
        return;
      }
      const phoneRegex = /^1[3-9]\d{9}$/;
      if (!phoneRegex.test(this.formData.phone)) {
        common_vendor.index.showToast({ title: "请输入正确的手机号码", icon: "none" });
        return;
      }
      if (!this.isWechatLoggedIn) {
        common_vendor.index.showToast({ title: "请先完成微信授权", icon: "none" });
        return;
      }
      const uid = common_vendor.index.getStorageSync("user_id");
      if (!uid) {
        common_vendor.index.showToast({ title: "未获取到用户信息，请先授权", icon: "none" });
        return;
      }
      const payload = {
        user_id: uid,
        purpose: this.formData.purpose,
        visit_date: this.formData.visitDate,
        entry_time: this.formData.entryTime || "09:00",
        exit_time: this.formData.exitTime || "20:00",
        gate: this.formData.gate,
        license_plate: this.formData.carNumber || "",
        approver_id: this.formData.approverId
      };
      common_vendor.index.showLoading({ title: "提交中..." });
      api_uniReservations.createIndividualReservation(payload).then((res) => {
        const body = (res == null ? void 0 : res.data) || res;
        if ((body == null ? void 0 : body.code) && body.code !== 0) {
          throw new Error((body == null ? void 0 : body.message) || "提交失败");
        }
        common_vendor.index.showToast({ title: "申请提交成功", icon: "success" });
        setTimeout(() => {
          this.showQrcodePrompt();
        }, 600);
        this.resetForm();
      }).catch(() => {
        common_vendor.index.showToast({ title: "提交失败，请稍后重试", icon: "none" });
      }).finally(() => {
        common_vendor.index.hideLoading();
      });
    }
  },
  onLoad() {
    this.checkLoginStatus();
    this.loadApprovers();
    this.loadNotice();
  },
  // 添加mounted钩子，确保组件作为子组件时也能正确加载数据
  mounted() {
    this.checkLoginStatus();
    this.loadApprovers();
    this.loadNotice();
    this.$nextTick(() => {
      setTimeout(() => {
        this.checkScrollability();
      }, 100);
    });
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: $data.showNoticeModal
  }, $data.showNoticeModal ? common_vendor.e({
    b: common_vendor.t($data.noticeTitle),
    c: $data.noticeContent
  }, $data.noticeContent ? {
    d: common_vendor.t($data.noticeContent)
  } : {}, {
    e: common_vendor.o((...args) => $options.handleScroll && $options.handleScroll(...args)),
    f: $data.scrollTop,
    g: $data.agreeNotice,
    h: !$data.isScrolledToBottom,
    i: common_vendor.o((...args) => $options.toggleAgree && $options.toggleAgree(...args)),
    j: common_vendor.n($data.agreeNotice ? "" : "disabled"),
    k: !$data.agreeNotice,
    l: common_vendor.o((...args) => $options.closeNotice && $options.closeNotice(...args))
  }) : {}, {
    m: !$data.showNoticeModal
  }, !$data.showNoticeModal ? common_vendor.e({
    n: common_vendor.t($data.formData.purpose || "请选择来访事由"),
    o: common_vendor.o((...args) => $options.onPurposeChange && $options.onPurposeChange(...args)),
    p: $data.purposeIndex,
    q: $data.purposeOptions,
    r: $data.formData.name,
    s: common_vendor.o(($event) => $data.formData.name = $event.detail.value),
    t: $data.formData.phone,
    v: common_vendor.o(($event) => $data.formData.phone = $event.detail.value),
    w: !$data.isWechatLoggedIn
  }, !$data.isWechatLoggedIn ? common_vendor.e({
    x: $data.authLoading
  }, $data.authLoading ? {} : {}, {
    y: common_vendor.o((...args) => $options.handleWechatAuth && $options.handleWechatAuth(...args)),
    z: $data.authLoading
  }) : {}, {
    A: common_vendor.t($data.formData.visitDate || "请选择日期"),
    B: $data.formData.visitDate,
    C: $data.minDate,
    D: common_vendor.o((...args) => $options.onDateChange && $options.onDateChange(...args)),
    E: $data.formData.entryTime,
    F: common_vendor.o(($event) => $data.formData.entryTime = $event.detail.value),
    G: $data.formData.exitTime,
    H: common_vendor.o(($event) => $data.formData.exitTime = $event.detail.value),
    I: !$data.formData.entryTime && !$data.formData.exitTime
  }, !$data.formData.entryTime && !$data.formData.exitTime ? {} : {}, {
    J: $data.formData.gate === "北门",
    K: common_vendor.o((...args) => $options.onGateChange && $options.onGateChange(...args)),
    L: $data.formData.carNumber,
    M: common_vendor.o(($event) => $data.formData.carNumber = $event.detail.value),
    N: $data.approvers.length === 0
  }, $data.approvers.length === 0 ? {
    O: common_vendor.o((...args) => $options.loadApprovers && $options.loadApprovers(...args))
  } : {}, {
    P: common_vendor.t($data.approvers.length === 0 ? "加载审批人中..." : $options.selectedApprover || "请选择审批人"),
    Q: $data.approvers.length === 0 ? 1 : "",
    R: common_vendor.o((...args) => $options.onApproverChange && $options.onApproverChange(...args)),
    S: $data.approverIndex,
    T: $data.approvers,
    U: $data.approvers.length === 0,
    V: common_vendor.o((...args) => $options.resetForm && $options.resetForm(...args)),
    W: common_vendor.o((...args) => $options.submitForm && $options.submitForm(...args))
  }) : {}, {
    X: $data.showQrcodeModal
  }, $data.showQrcodeModal ? {
    Y: common_vendor.o((...args) => $options.closeQrcodeModal && $options.closeQrcodeModal(...args)),
    Z: common_assets._imports_0,
    aa: common_vendor.o((...args) => $options.closeQrcodeModal && $options.closeQrcodeModal(...args))
  } : {});
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-aad31062"]]);
exports.MiniProgramPage = MiniProgramPage;
