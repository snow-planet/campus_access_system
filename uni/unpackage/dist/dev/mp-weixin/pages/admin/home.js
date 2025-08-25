"use strict";
const common_vendor = require("../../common/vendor.js");
const _sfc_main = {
  setup() {
    const rejectPopup = common_vendor.ref(null);
    common_vendor.index.$router;
    const userInfo = common_vendor.ref({
      name: "张老师",
      role: "审批管理员"
    });
    const typeOptions = common_vendor.ref([
      { value: "all", label: "全部类型" },
      { value: "personal", label: "个人申请" },
      { value: "group", label: "团体申请" }
    ]);
    const statusOptions = common_vendor.ref([
      { value: "all", label: "全部状态" },
      { value: "pending", label: "待审批" },
      { value: "approved", label: "已通过" },
      { value: "rejected", label: "已驳回" }
    ]);
    const filter = common_vendor.ref({
      type: "all",
      status: "all"
    });
    const currentPage = common_vendor.ref(1);
    const pageSize = 5;
    const totalItems = common_vendor.ref(15);
    const applications = common_vendor.ref([]);
    const rejectReason = common_vendor.ref("");
    const currentApplication = common_vendor.ref(null);
    const totalPages = common_vendor.computed(() => Math.ceil(totalItems.value / pageSize));
    const getStatusText = (status) => {
      const statusMap = {
        "pending": "待审批",
        "approved": "已通过",
        "rejected": "已驳回"
      };
      return statusMap[status] || "未知状态";
    };
    const onTypeChange = (e) => {
      filter.value.type = typeOptions.value[e.detail.value].value;
    };
    const onStatusChange = (e) => {
      filter.value.status = statusOptions.value[e.detail.value].value;
    };
    const loadApplications = () => {
      applications.value = [
        {
          id: 1,
          applicantName: "张三",
          type: "personal",
          status: "pending",
          applyTime: "2023-10-15 09:30",
          accessTime: "2023-10-16 14:00-16:00",
          reason: "参加学术讲座",
          reviewer: "",
          reviewTime: "",
          rejectReason: ""
        },
        {
          id: 2,
          applicantName: "李四",
          type: "personal",
          status: "approved",
          applyTime: "2023-10-14 15:20",
          accessTime: "2023-10-17 09:00-12:00",
          reason: "办理学生事务",
          reviewer: "王老师",
          reviewTime: "2023-10-14 16:45",
          rejectReason: ""
        },
        {
          id: 3,
          applicantName: "计算机科学协会",
          type: "group",
          status: "pending",
          applyTime: "2023-10-15 11:05",
          accessTime: "2023-10-18 13:00-17:00",
          reason: "举办技术沙龙活动",
          groupSize: 25,
          reviewer: "",
          reviewTime: "",
          rejectReason: ""
        },
        {
          id: 4,
          applicantName: "王五",
          type: "personal",
          status: "rejected",
          applyTime: "2023-10-13 16:40",
          accessTime: "2023-10-16 19:00-21:00",
          reason: "自习",
          reviewer: "李老师",
          reviewTime: "2023-10-14 09:15",
          rejectReason: "非开放时间段，请选择白天时段"
        },
        {
          id: 5,
          applicantName: "外语学院",
          type: "group",
          status: "pending",
          applyTime: "2023-10-15 14:20",
          accessTime: "2023-10-19 08:30-11:30",
          reason: "举办外语角活动",
          groupSize: 30,
          reviewer: "",
          reviewTime: "",
          rejectReason: ""
        }
      ].filter((app) => {
        if (filter.value.type !== "all" && app.type !== filter.value.type)
          return false;
        if (filter.value.status !== "all" && app.status !== filter.value.status)
          return false;
        return true;
      });
    };
    const showRejectDialog = (app) => {
      currentApplication.value = app;
      rejectReason.value = "";
      rejectPopup.value.open();
    };
    const closeRejectDialog = () => {
      rejectPopup.value.close();
      currentApplication.value = null;
    };
    const confirmReject = (reason) => {
      if (!reason.trim()) {
        common_vendor.index.showToast({
          title: "请填写驳回原因",
          icon: "none"
        });
        return;
      }
      const index = applications.value.findIndex((item) => item.id === currentApplication.value.id);
      if (index !== -1) {
        applications.value[index].status = "rejected";
        applications.value[index].reviewer = userInfo.value.name;
        applications.value[index].reviewTime = (/* @__PURE__ */ new Date()).toLocaleString();
        applications.value[index].rejectReason = reason;
      }
      closeRejectDialog();
      common_vendor.index.showToast({
        title: "已驳回该申请",
        icon: "success"
      });
    };
    const approveApplication = (app) => {
      common_vendor.index.showModal({
        title: "确认通过",
        content: "确定要通过该申请吗？",
        success: (res) => {
          if (res.confirm) {
            const index = applications.value.findIndex((item) => item.id === app.id);
            if (index !== -1) {
              applications.value[index].status = "approved";
              applications.value[index].reviewer = userInfo.value.name;
              applications.value[index].reviewTime = (/* @__PURE__ */ new Date()).toLocaleString();
            }
            common_vendor.index.showToast({
              title: "已通过该申请",
              icon: "success"
            });
          }
        }
      });
    };
    const prevPage = () => {
      if (currentPage.value > 1) {
        currentPage.value--;
        loadApplications();
      }
    };
    const nextPage = () => {
      if (currentPage.value < totalPages.value) {
        currentPage.value++;
        loadApplications();
      }
    };
    common_vendor.onMounted(() => {
      loadApplications();
    });
    const logout = () => {
      common_vendor.index.removeStorageSync("currentUser");
      common_vendor.index.reLaunch({
        url: "/pages/admin/login"
      });
    };
    return {
      rejectPopup,
      userInfo,
      filter,
      typeOptions,
      statusOptions,
      currentPage,
      applications,
      rejectReason,
      totalPages,
      getStatusText,
      onTypeChange,
      onStatusChange,
      loadApplications,
      showRejectDialog,
      closeRejectDialog,
      confirmReject,
      approveApplication,
      prevPage,
      nextPage,
      logout
    };
  }
};
if (!Array) {
  const _component_uni_icons = common_vendor.resolveComponent("uni-icons");
  const _component_uni_popup_dialog = common_vendor.resolveComponent("uni-popup-dialog");
  const _component_uni_popup = common_vendor.resolveComponent("uni-popup");
  (_component_uni_icons + _component_uni_popup_dialog + _component_uni_popup)();
}
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  var _a, _b;
  return common_vendor.e({
    a: common_vendor.t($setup.userInfo.name),
    b: common_vendor.t($setup.userInfo.role),
    c: common_vendor.p({
      type: "close",
      size: "16",
      color: "#666"
    }),
    d: common_vendor.o((...args) => $setup.logout && $setup.logout(...args)),
    e: common_vendor.t(((_a = $setup.typeOptions.find((opt) => opt.value === $setup.filter.type)) == null ? void 0 : _a.label) || "全部类型"),
    f: common_vendor.o((...args) => $setup.onTypeChange && $setup.onTypeChange(...args)),
    g: $setup.filter.type,
    h: $setup.typeOptions,
    i: common_vendor.t(((_b = $setup.statusOptions.find((opt) => opt.value === $setup.filter.status)) == null ? void 0 : _b.label) || "全部状态"),
    j: common_vendor.o((...args) => $setup.onStatusChange && $setup.onStatusChange(...args)),
    k: $setup.filter.status,
    l: $setup.statusOptions,
    m: common_vendor.o((...args) => $setup.loadApplications && $setup.loadApplications(...args)),
    n: $setup.applications.length === 0
  }, $setup.applications.length === 0 ? {
    o: common_vendor.p({
      type: "search",
      size: "48",
      color: "#ccc"
    })
  } : {
    p: common_vendor.f($setup.applications, (app, k0, i0) => {
      return common_vendor.e({
        a: common_vendor.t(app.applicantName),
        b: common_vendor.t($setup.getStatusText(app.status)),
        c: common_vendor.n(app.status),
        d: common_vendor.t(app.type === "personal" ? "个人申请" : "团体申请"),
        e: common_vendor.t(app.applyTime),
        f: common_vendor.t(app.accessTime),
        g: common_vendor.t(app.reason),
        h: app.type === "group"
      }, app.type === "group" ? {
        i: common_vendor.t(app.groupSize)
      } : {}, {
        j: app.status === "pending"
      }, app.status === "pending" ? {
        k: common_vendor.o(($event) => $setup.showRejectDialog(app), app.id),
        l: common_vendor.o(($event) => $setup.approveApplication(app), app.id)
      } : {}, {
        m: app.status !== "pending"
      }, app.status !== "pending" ? common_vendor.e({
        n: common_vendor.t(app.reviewer),
        o: common_vendor.t(app.reviewTime),
        p: app.status === "rejected"
      }, app.status === "rejected" ? {
        q: common_vendor.t(app.rejectReason)
      } : {}) : {}, {
        r: app.id
      });
    })
  }, {
    q: $setup.applications.length > 0
  }, $setup.applications.length > 0 ? {
    r: $setup.currentPage === 1,
    s: common_vendor.o((...args) => $setup.prevPage && $setup.prevPage(...args)),
    t: common_vendor.t($setup.currentPage),
    v: common_vendor.t($setup.totalPages),
    w: $setup.currentPage === $setup.totalPages,
    x: common_vendor.o((...args) => $setup.nextPage && $setup.nextPage(...args))
  } : {}, {
    y: common_vendor.o($setup.confirmReject),
    z: common_vendor.o($setup.closeRejectDialog),
    A: common_vendor.p({
      type: "info",
      mode: "input",
      title: "驳回申请",
      placeholder: "请输入驳回原因",
      value: $setup.rejectReason
    }),
    B: common_vendor.sr("rejectPopup", "b5384573-2"),
    C: common_vendor.p({
      type: "dialog"
    })
  });
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-b5384573"]]);
wx.createPage(MiniProgramPage);
