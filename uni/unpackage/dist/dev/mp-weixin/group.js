"use strict";
const common_vendor = require("./common/vendor.js");
const api_auth = require("./api/auth.js");
const api_users = require("./api/users.js");
const api_groupReservations = require("./api/groupReservations.js");
const api_uniNotifications = require("./api/uniNotifications.js");
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
      noticeTitle: "团队预约入校须知",
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
        visitorCount: "",
        contactName: "",
        contactPhone: "",
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
    handleWechatAuth() {
      if (this.authLoading)
        return;
      this.authLoading = true;
      common_vendor.index.showLoading({ title: "授权中" });
      common_vendor.index.login({
        provider: "weixin",
        success: async (loginRes) => {
          var _a, _b, _c;
          try {
            const code = loginRes == null ? void 0 : loginRes.code;
            if (!code)
              throw new Error("未获取到微信code");
            const payload = {
              code,
              username: ((_a = this.formData) == null ? void 0 : _a.contactName) || "微信用户",
              phone: ((_b = this.formData) == null ? void 0 : _b.contactPhone) || "未填写",
              real_name: ((_c = this.formData) == null ? void 0 : _c.contactName) || "微信用户"
            };
            const res = await api_auth.wechatLogin(payload);
            const body = (res == null ? void 0 : res.data) || res;
            const user = (body == null ? void 0 : body.data) || body;
            const userId = user == null ? void 0 : user.user_id;
            const openid = user == null ? void 0 : user.openid;
            if (!userId)
              throw new Error("登录返回数据异常");
            try {
              common_vendor.index.setStorageSync("user_id", userId);
            } catch (e) {
            }
            try {
              common_vendor.index.setStorageSync("openid", openid || "");
            } catch (e) {
            }
            this.isWechatLoggedIn = true;
            common_vendor.index.showToast({ title: "授权成功", icon: "success" });
          } catch (err) {
            common_vendor.index.showToast({ title: "授权失败，请重试", icon: "none" });
          } finally {
            this.authLoading = false;
            common_vendor.index.hideLoading();
          }
        },
        fail: () => {
          this.authLoading = false;
          common_vendor.index.hideLoading();
          common_vendor.index.showToast({ title: "授权失败", icon: "none" });
        }
      });
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
      api_uniNotifications.fetchNotice("group_notice").then((res) => {
        console.log("团队入校须知API响应:", res);
        if (res && res.code === 0 && res.data) {
          this.noticeTitle = res.data.title || "团队预约入校须知";
          this.noticeContent = res.data.content || "";
        } else {
          console.log("团队入校须知数据格式异常，使用默认内容");
          this.noticeContent = "1. 请提前至少3个工作日进行团队预约申请\n2. 团队负责人需提供所有成员名单及身份证信息\n3. 入校时所有成员需携带有效身份证件以备查验\n4. 请按照预约时间段集体入校，不得分散进入\n5. 团队车辆请停放在指定停车场，不得随意停放\n6. 入校后请遵守校园管理规定，保持集体行动\n7. 团队活动不得影响正常教学秩序\n8. 如行程有变，请及时取消或修改预约\n9. 严禁携带违禁物品入校\n10. 活动结束后请及时离校，保持环境整洁\n11. 团队负责人需对成员行为负责\n12. 如有任何问题，请及时与审批人或保卫处联系";
        }
      }).catch((err) => {
        console.error("加载入校须知失败:", err);
        this.noticeContent = "1. 请提前至少3个工作日进行团队预约申请\n2. 团队负责人需提供所有成员名单及身份证信息\n3. 入校时所有成员需携带有效身份证件以备查验\n4. 请按照预约时间段集体入校，不得分散进入\n5. 团队车辆请停放在指定停车场，不得随意停放\n6. 入校后请遵守校园管理规定，保持集体行动\n7. 团队活动不得影响正常教学秩序\n8. 如行程有变，请及时取消或修改预约\n9. 严禁携带违禁物品入校\n10. 活动结束后请及时离校，保持环境整洁\n11. 团队负责人需对成员行为负责\n12. 如有任何问题，请及时与审批人或保卫处联系";
      });
    },
    // 加载审批人列表（真实接口）
    loadApprovers() {
      common_vendor.index.showLoading({ title: "加载审批人" });
      api_users.fetchApprovers().then((res) => {
        const body = (res == null ? void 0 : res.data) || res;
        const list = (body == null ? void 0 : body.data) || body || [];
        this.approvers = (Array.isArray(list) ? list : []).map((u) => ({
          id: u.user_id,
          name: `${u.real_name || u.username || "审批人"}${u.college ? " - " + u.college : ""}`
        }));
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
        visitorCount: "",
        contactName: "",
        contactPhone: "",
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
      if (!this.formData.purpose || !this.formData.visitorCount || !this.formData.contactName || !this.formData.contactPhone || !this.formData.visitDate || !this.formData.approverId) {
        common_vendor.index.showToast({
          title: "请填写所有必填项",
          icon: "none"
        });
        return;
      }
      const visitorCount = parseInt(this.formData.visitorCount);
      if (isNaN(visitorCount) || visitorCount < 1 || visitorCount > 100) {
        common_vendor.index.showToast({ title: "访客人数必须在1-100之间", icon: "none" });
        return;
      }
      const phoneRegex = /^1[3-9]\d{9}$/;
      if (!phoneRegex.test(this.formData.contactPhone)) {
        common_vendor.index.showToast({
          title: "请输入正确的手机号码",
          icon: "none"
        });
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
        visitor_count: visitorCount,
        contact_name: this.formData.contactName,
        contact_phone: this.formData.contactPhone,
        visit_date: this.formData.visitDate,
        entry_time: this.formData.entryTime || "09:00",
        exit_time: this.formData.exitTime || "20:00",
        gate: this.formData.gate,
        license_plate: this.formData.carNumber || "",
        approver_id: this.formData.approverId
      };
      common_vendor.index.showLoading({ title: "提交中..." });
      api_groupReservations.createGroupReservation(payload).then((res) => {
        const body = (res == null ? void 0 : res.data) || res;
        if ((body == null ? void 0 : body.code) && body.code !== 0) {
          throw new Error((body == null ? void 0 : body.message) || "提交失败");
        }
        common_vendor.index.showToast({ title: "团队预约申请提交成功", icon: "success" });
        this.resetForm();
      }).catch((err) => {
        common_vendor.index.showToast({ title: (err == null ? void 0 : err.message) || "提交失败，请稍后重试", icon: "none" });
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
if (!Array) {
  const _component_uni_icons = common_vendor.resolveComponent("uni-icons");
  _component_uni_icons();
}
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
    o: common_vendor.p({
      type: "arrowdown",
      size: "16",
      color: "#999"
    }),
    p: common_vendor.o((...args) => $options.onPurposeChange && $options.onPurposeChange(...args)),
    q: $data.purposeIndex,
    r: $data.purposeOptions,
    s: $data.formData.visitorCount,
    t: common_vendor.o(($event) => $data.formData.visitorCount = $event.detail.value),
    v: $data.formData.contactName,
    w: common_vendor.o(($event) => $data.formData.contactName = $event.detail.value),
    x: $data.formData.contactPhone,
    y: common_vendor.o(($event) => $data.formData.contactPhone = $event.detail.value),
    z: !$data.isWechatLoggedIn
  }, !$data.isWechatLoggedIn ? common_vendor.e({
    A: $data.authLoading
  }, $data.authLoading ? {} : {}, {
    B: common_vendor.o((...args) => $options.handleWechatAuth && $options.handleWechatAuth(...args)),
    C: $data.authLoading
  }) : {}, {
    D: common_vendor.t($data.formData.visitDate || "请选择日期"),
    E: common_vendor.p({
      type: "arrowdown",
      size: "16",
      color: "#999"
    }),
    F: $data.formData.visitDate,
    G: $data.minDate,
    H: common_vendor.o((...args) => $options.onDateChange && $options.onDateChange(...args)),
    I: $data.formData.entryTime,
    J: common_vendor.o(($event) => $data.formData.entryTime = $event.detail.value),
    K: $data.formData.exitTime,
    L: common_vendor.o(($event) => $data.formData.exitTime = $event.detail.value),
    M: !$data.formData.entryTime && !$data.formData.exitTime
  }, !$data.formData.entryTime && !$data.formData.exitTime ? {} : {}, {
    N: $data.formData.gate === "北门",
    O: common_vendor.o((...args) => $options.onGateChange && $options.onGateChange(...args)),
    P: $data.formData.carNumber,
    Q: common_vendor.o(($event) => $data.formData.carNumber = $event.detail.value),
    R: common_vendor.t($options.selectedApprover || "请选择审批人"),
    S: common_vendor.p({
      type: "arrowdown",
      size: "16",
      color: "#999"
    }),
    T: common_vendor.o((...args) => $options.onApproverChange && $options.onApproverChange(...args)),
    U: $data.approverIndex,
    V: $data.approvers,
    W: common_vendor.o((...args) => $options.resetForm && $options.resetForm(...args)),
    X: common_vendor.o((...args) => $options.submitForm && $options.submitForm(...args))
  }) : {}, {
    Y: $data.showQrcodeModal
  }, $data.showQrcodeModal ? {
    Z: common_vendor.p({
      type: "closeempty",
      size: "24",
      color: "#fff"
    }),
    aa: common_vendor.o((...args) => $options.closeQrcodeModal && $options.closeQrcodeModal(...args)),
    ab: common_assets._imports_0$1,
    ac: common_vendor.o((...args) => $options.closeQrcodeModal && $options.closeQrcodeModal(...args))
  } : {});
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-afedccba"]]);
exports.MiniProgramPage = MiniProgramPage;
