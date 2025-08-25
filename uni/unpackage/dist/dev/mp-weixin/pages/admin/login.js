"use strict";
const common_vendor = require("../../common/vendor.js");
const _sfc_main = {
  data() {
    return {
      username: "",
      password: "",
      showApplicationModal: false,
      positionIndex: 0,
      collegeIndex: 0,
      positionOptions: ["教师", "安保人员"],
      collegeOptions: [
        "计算机学院",
        "电子工程学院",
        "机械工程学院",
        "理学院",
        "文学院",
        "保卫处"
      ],
      applicationForm: {
        real_name: "",
        phone: "",
        college: "",
        position: ""
      }
    };
  },
  methods: {
    // 处理登录
    handleLogin() {
      if (!this.username || !this.password) {
        common_vendor.index.showToast({
          title: "请输入用户名和密码",
          icon: "none"
        });
        return;
      }
      if (this.username === "approver" && this.password === "123456") {
        common_vendor.index.setStorageSync("currentUser", {
          username: "approver",
          role: "审批员",
          name: "审批员"
        });
        common_vendor.index.showToast({
          title: "审批员登录成功",
          icon: "success"
        });
        setTimeout(() => {
          common_vendor.index.navigateTo({
            url: "/pages/admin/home"
          });
        }, 1e3);
      } else if (this.username === "admin" && this.password === "123456") {
        common_vendor.index.setStorageSync("currentUser", {
          username: "admin",
          role: "超级管理员",
          name: "管理员"
        });
        common_vendor.index.showToast({
          title: "管理员登录成功",
          icon: "success"
        });
        setTimeout(() => {
          common_vendor.index.navigateTo({
            url: "/pages/admin/adminhome"
          });
        }, 1e3);
      } else {
        common_vendor.index.showToast({
          title: "用户名或密码错误",
          icon: "none"
        });
      }
    },
    // 返回首页
    goBack() {
      common_vendor.index.navigateBack();
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
    // 提交申请
    submitApplication() {
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
      common_vendor.index.showLoading({
        title: "提交中..."
      });
      setTimeout(() => {
        common_vendor.index.hideLoading();
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
      }, 1500);
    }
  }
};
if (!Array) {
  const _component_uni_icons = common_vendor.resolveComponent("uni-icons");
  _component_uni_icons();
}
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
  }, $data.showApplicationModal ? {
    i: common_vendor.o((...args) => $options.closeModal && $options.closeModal(...args)),
    j: $data.applicationForm.real_name,
    k: common_vendor.o(($event) => $data.applicationForm.real_name = $event.detail.value),
    l: $data.applicationForm.phone,
    m: common_vendor.o(($event) => $data.applicationForm.phone = $event.detail.value),
    n: common_vendor.t($data.applicationForm.college || "请选择学院/部门"),
    o: common_vendor.n($data.applicationForm.college ? "" : "placeholder"),
    p: common_vendor.p({
      type: "arrowdown",
      size: "16",
      color: "#999"
    }),
    q: $data.collegeOptions,
    r: common_vendor.o((...args) => $options.onCollegeChange && $options.onCollegeChange(...args)),
    s: common_vendor.t($data.applicationForm.position || "请选择您的职位"),
    t: common_vendor.n($data.applicationForm.position ? "" : "placeholder"),
    v: common_vendor.p({
      type: "arrowdown",
      size: "16",
      color: "#999"
    }),
    w: $data.positionOptions,
    x: common_vendor.o((...args) => $options.onPositionChange && $options.onPositionChange(...args)),
    y: common_vendor.o((...args) => $options.submitApplication && $options.submitApplication(...args)),
    z: common_vendor.o((...args) => $options.closeModal && $options.closeModal(...args))
  } : {}, {
    A: !$data.showApplicationModal
  }, !$data.showApplicationModal ? {
    B: common_vendor.o((...args) => $options.showSignIn && $options.showSignIn(...args))
  } : {});
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-3190821f"]]);
wx.createPage(MiniProgramPage);
