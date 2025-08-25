"use strict";
const common_vendor = require("../../common/vendor.js");
const common_assets = require("../../common/assets.js");
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
      }
    },
    // 微信授权登录
    handleWechatAuth() {
      this.authLoading = true;
      common_vendor.index.getUserProfile({
        desc: "用于完善用户资料",
        success: (res) => {
          console.log("获取用户信息成功", res.userInfo);
          this.loginWithWechat(res.userInfo);
        },
        fail: (err) => {
          console.error("获取用户信息失败", err);
          common_vendor.index.showToast({
            title: "授权失败，请重试",
            icon: "none"
          });
          this.authLoading = false;
        }
      });
    },
    // 调用云函数登录
    async loginWithWechat(userInfo) {
      try {
        const result = await common_vendor.Ys.callFunction({
          name: "user-auth",
          data: {
            action: "login",
            userInfo
          }
        });
        if (result.result.code === 0) {
          this.isWechatLoggedIn = true;
          common_vendor.index.setStorageSync("userInfo", result.result.data);
          common_vendor.index.showToast({
            title: "授权成功",
            icon: "success"
          });
        } else {
          common_vendor.index.showToast({
            title: result.result.message || "授权失败",
            icon: "none"
          });
        }
      } catch (error) {
        console.error("登录失败", error);
        common_vendor.index.showToast({
          title: "网络错误，请重试",
          icon: "none"
        });
      } finally {
        this.authLoading = false;
      }
    },
    // 显示公众号二维码
    showQrcodePrompt() {
      this.showQrcodeModal = true;
    },
    // 关闭二维码弹窗
    closeQrcodeModal() {
      this.showQrcodeModal = false;
    },
    // 检查登录状态
    checkLoginStatus() {
      const userInfo = common_vendor.index.getStorageSync("userInfo");
      if (userInfo && userInfo.openid) {
        this.isWechatLoggedIn = true;
        if (userInfo.real_name) {
          this.formData.name = userInfo.real_name;
        }
        if (userInfo.phone) {
          this.formData.phone = userInfo.phone;
        }
      }
    },
    // 加载审批人列表
    async loadApprovers() {
      common_vendor.index.showLoading({
        title: "加载审批人..."
      });
      try {
        const result = await common_vendor.Ys.callFunction({
          name: "user-auth",
          // 确保云函数名称正确
          data: {
            action: "getApprovers"
          }
        });
        console.log("审批人获取结果:", result);
        if (result.result.code === 0 && result.result.data && result.result.data.length > 0) {
          this.approvers = result.result.data.map((approver) => ({
            id: approver._id || approver.user_id,
            name: `${approver.real_name} - ${approver.college || "未设置学院"}`
          }));
          console.log("成功加载审批人数据:", this.approvers);
        } else {
          console.warn("未找到审批人数据或数据为空:", result.result);
          this.approvers = [];
          common_vendor.index.showToast({
            title: result.result.message || "暂无可用审批人",
            icon: "none"
          });
        }
      } catch (error) {
        console.error("加载审批人列表错误:", error);
        this.approvers = [];
        common_vendor.index.showToast({
          title: "加载审批人失败",
          icon: "none"
        });
      } finally {
        common_vendor.index.hideLoading();
      }
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
      try {
        const index = parseInt(e.detail.value);
        console.log("选择的审批人索引:", index, "审批人列表:", this.approvers);
        this.approverIndex = index;
        if (Array.isArray(this.approvers) && this.approvers.length > 0 && index >= 0 && index < this.approvers.length && this.approvers[index]) {
          this.formData.approverId = this.approvers[index].id;
          console.log("选择的审批人ID:", this.formData.approverId);
        } else {
          console.error("审批人选择错误，索引:", index, "审批人列表:", this.approvers);
          this.formData.approverId = "";
          common_vendor.index.showToast({
            title: "请选择有效的审批人",
            icon: "none"
          });
        }
      } catch (error) {
        console.error("审批人选择处理错误:", error);
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
    async submitForm() {
      if (!this.formData.purpose || !this.formData.name || !this.formData.phone || !this.formData.visitDate || !this.formData.approverId) {
        common_vendor.index.showToast({
          title: "请填写所有必填项",
          icon: "none"
        });
        return;
      }
      const phoneRegex = /^1[3-9]\d{9}$/;
      if (!phoneRegex.test(this.formData.phone)) {
        common_vendor.index.showToast({
          title: "请输入正确的手机号码",
          icon: "none"
        });
        return;
      }
      if (!this.isWechatLoggedIn) {
        common_vendor.index.showToast({
          title: "请先完成微信授权",
          icon: "none"
        });
        return;
      }
      common_vendor.index.showLoading({
        title: "提交中..."
      });
      try {
        const result = await common_vendor.Ys.callFunction({
          name: "reservation-manager",
          data: {
            action: "create",
            reservationData: {
              purpose: this.formData.purpose,
              real_name: this.formData.name,
              phone: this.formData.phone,
              visit_date: this.formData.visitDate,
              entry_time: this.formData.entryTime || "09:00:00",
              exit_time: this.formData.exitTime || "20:00:00",
              gate: this.formData.gate,
              license_plate: this.formData.carNumber,
              approver_id: this.formData.approverId
            }
          }
        });
        common_vendor.index.hideLoading();
        if (result.result.code === 0) {
          common_vendor.index.showToast({
            title: "申请提交成功",
            icon: "success"
          });
          setTimeout(() => {
            this.showQrcodePrompt();
          }, 1e3);
          this.resetForm();
        } else {
          common_vendor.index.showToast({
            title: result.result.message || "提交失败",
            icon: "none"
          });
        }
      } catch (error) {
        common_vendor.index.hideLoading();
        console.error("提交失败", error);
        common_vendor.index.showToast({
          title: "网络错误，请重试",
          icon: "none"
        });
      }
    }
  },
  onLoad() {
    this.checkLoginStatus();
    this.loadApprovers();
  },
  mounted() {
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
  }, $data.showNoticeModal ? {
    b: common_vendor.o((...args) => $options.handleScroll && $options.handleScroll(...args)),
    c: $data.scrollTop,
    d: $data.agreeNotice,
    e: !$data.isScrolledToBottom,
    f: common_vendor.o((...args) => $options.toggleAgree && $options.toggleAgree(...args)),
    g: common_vendor.n($data.agreeNotice ? "" : "disabled"),
    h: !$data.agreeNotice,
    i: common_vendor.o((...args) => $options.closeNotice && $options.closeNotice(...args))
  } : {}, {
    j: !$data.showNoticeModal
  }, !$data.showNoticeModal ? common_vendor.e({
    k: common_vendor.t($data.formData.purpose || "请选择来访事由"),
    l: common_vendor.p({
      type: "arrowdown",
      size: "16",
      color: "#999"
    }),
    m: common_vendor.o((...args) => $options.onPurposeChange && $options.onPurposeChange(...args)),
    n: $data.purposeIndex,
    o: $data.purposeOptions,
    p: $data.formData.name,
    q: common_vendor.o(($event) => $data.formData.name = $event.detail.value),
    r: $data.formData.phone,
    s: common_vendor.o(($event) => $data.formData.phone = $event.detail.value),
    t: !$data.isWechatLoggedIn
  }, !$data.isWechatLoggedIn ? common_vendor.e({
    v: $data.authLoading
  }, $data.authLoading ? {} : {}, {
    w: common_vendor.o((...args) => $options.handleWechatAuth && $options.handleWechatAuth(...args)),
    x: $data.authLoading
  }) : {}, {
    y: common_vendor.t($data.formData.visitDate || "请选择日期"),
    z: common_vendor.p({
      type: "arrowdown",
      size: "16",
      color: "#999"
    }),
    A: $data.formData.visitDate,
    B: $data.minDate,
    C: common_vendor.o((...args) => $options.onDateChange && $options.onDateChange(...args)),
    D: $data.formData.entryTime,
    E: common_vendor.o(($event) => $data.formData.entryTime = $event.detail.value),
    F: $data.formData.exitTime,
    G: common_vendor.o(($event) => $data.formData.exitTime = $event.detail.value),
    H: !$data.formData.entryTime && !$data.formData.exitTime
  }, !$data.formData.entryTime && !$data.formData.exitTime ? {} : {}, {
    I: $data.formData.gate === "北门",
    J: common_vendor.o((...args) => $options.onGateChange && $options.onGateChange(...args)),
    K: $data.formData.carNumber,
    L: common_vendor.o(($event) => $data.formData.carNumber = $event.detail.value),
    M: common_vendor.t($options.selectedApprover || "请选择审批人"),
    N: common_vendor.p({
      type: "arrowdown",
      size: "16",
      color: "#999"
    }),
    O: common_vendor.o((...args) => $options.onApproverChange && $options.onApproverChange(...args)),
    P: $data.approverIndex,
    Q: $data.approvers,
    R: common_vendor.o((...args) => $options.resetForm && $options.resetForm(...args)),
    S: common_vendor.o((...args) => $options.submitForm && $options.submitForm(...args))
  }) : {}, {
    T: $data.showQrcodeModal
  }, $data.showQrcodeModal ? {
    U: common_vendor.p({
      type: "closeempty",
      size: "24",
      color: "#fff"
    }),
    V: common_vendor.o((...args) => $options.closeQrcodeModal && $options.closeQrcodeModal(...args)),
    W: common_assets._imports_0$1,
    X: common_vendor.o((...args) => $options.closeQrcodeModal && $options.closeQrcodeModal(...args))
  } : {});
}
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-aad31062"]]);
wx.createComponent(Component);
