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
      approvers: [
        { id: 1, name: "张老师 - 计算机学院" },
        { id: 2, name: "李老师 - 电子工程学院" },
        { id: 3, name: "王老师 - 保卫处" },
        { id: 4, name: "赵老师 - 机械工程学院" }
      ]
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
    handleWechatLogin() {
      common_vendor.index.showLoading({
        title: "登录中..."
      });
      setTimeout(() => {
        common_vendor.index.hideLoading();
        this.isWechatLoggedIn = true;
        common_vendor.index.showToast({
          title: "微信授权成功",
          icon: "success"
        });
      }, 1500);
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
      this.approverIndex = e.detail.value;
      this.formData.approverId = this.approvers[this.approverIndex].id;
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
      this.approverIndex = 0;
    },
    submitForm() {
      if (!this.formData.purpose || !this.formData.visitorCount || !this.formData.contactName || !this.formData.contactPhone || !this.formData.visitDate || !this.formData.approverId) {
        common_vendor.index.showToast({
          title: "请填写所有必填项",
          icon: "none"
        });
        return;
      }
      if (this.formData.visitorCount < 2) {
        common_vendor.index.showToast({
          title: "团体人数至少2人",
          icon: "none"
        });
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
      common_vendor.index.showLoading({
        title: "提交中..."
      });
      setTimeout(() => {
        common_vendor.index.hideLoading();
        common_vendor.index.showToast({
          title: "团体申请提交成功",
          icon: "success"
        });
        this.resetForm();
        setTimeout(() => {
          common_vendor.index.navigateBack();
        }, 1500);
      }, 1500);
    }
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
    p: $data.formData.visitorCount,
    q: common_vendor.o(($event) => $data.formData.visitorCount = $event.detail.value),
    r: $data.formData.contactName,
    s: common_vendor.o(($event) => $data.formData.contactName = $event.detail.value),
    t: $data.formData.contactPhone,
    v: common_vendor.o(($event) => $data.formData.contactPhone = $event.detail.value),
    w: common_vendor.t($data.formData.visitDate || "请选择日期"),
    x: common_vendor.p({
      type: "arrowdown",
      size: "16",
      color: "#999"
    }),
    y: $data.formData.visitDate,
    z: $data.minDate,
    A: common_vendor.o((...args) => $options.onDateChange && $options.onDateChange(...args)),
    B: !$data.isWechatLoggedIn
  }, !$data.isWechatLoggedIn ? {
    C: common_assets._imports_0$1,
    D: common_vendor.o((...args) => $options.handleWechatLogin && $options.handleWechatLogin(...args))
  } : {}, {
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
    N: common_vendor.t($options.selectedApprover || "请选择审批人"),
    O: common_vendor.p({
      type: "arrowdown",
      size: "16",
      color: "#999"
    }),
    P: common_vendor.o((...args) => $options.onApproverChange && $options.onApproverChange(...args)),
    Q: $data.approverIndex,
    R: $data.approvers,
    S: common_vendor.o((...args) => $options.resetForm && $options.resetForm(...args)),
    T: common_vendor.o((...args) => $options.submitForm && $options.submitForm(...args))
  }) : {});
}
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-afedccba"]]);
wx.createComponent(Component);
