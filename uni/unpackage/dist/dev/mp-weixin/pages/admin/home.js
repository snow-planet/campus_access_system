"use strict";
const common_vendor = require("../../common/vendor.js");
const api_uniApproval = require("../../api/uniApproval.js");
const _sfc_main = {
  setup() {
    const showRejectModal = common_vendor.ref(false);
    common_vendor.index.$router;
    const userInfo = common_vendor.ref({
      name: "加载中...",
      role: "审批管理员"
    });
    const currentUserId = common_vendor.ref(null);
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
      status: "pending"
    });
    const currentPage = common_vendor.ref(1);
    const pageSize = 10;
    const totalItems = common_vendor.ref(0);
    const applications = common_vendor.ref([]);
    const loading = common_vendor.ref(false);
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
    const loadApplications = async () => {
      if (!currentUserId.value) {
        console.error("用户ID未获取");
        return;
      }
      try {
        loading.value = true;
        const params = {
          approver_id: currentUserId.value,
          type: filter.value.type,
          status: filter.value.status,
          page: currentPage.value,
          pageSize
        };
        const res = await api_uniApproval.getApprovalList(params);
        if (res && res.code === 0) {
          applications.value = res.data.list || [];
          totalItems.value = res.data.total || 0;
          applications.value.forEach((app) => {
            if (app.applyTime) {
              app.applyTime = formatDateTime(app.applyTime);
            }
            if (app.reviewTime) {
              app.reviewTime = formatDateTime(app.reviewTime);
            }
          });
        } else {
          console.error("获取审批列表失败:", res.message);
          common_vendor.index.showToast({
            title: res.message || "获取数据失败",
            icon: "none"
          });
        }
      } catch (error) {
        console.error("加载申请数据失败:", error);
        common_vendor.index.showToast({
          title: "网络错误，请重试",
          icon: "none"
        });
      } finally {
        loading.value = false;
      }
    };
    const showRejectDialog = (app) => {
      currentApplication.value = app;
      rejectReason.value = "";
      showRejectModal.value = true;
    };
    const closeRejectDialog = () => {
      showRejectModal.value = false;
      currentApplication.value = null;
    };
    const handleConfirmReject = () => {
      confirmReject(rejectReason.value);
    };
    const confirmReject = async (reason) => {
      if (!reason.trim()) {
        common_vendor.index.showToast({
          title: "请填写驳回原因",
          icon: "none"
        });
        return;
      }
      try {
        const data = {
          reservation_id: currentApplication.value.id,
          reservation_type: currentApplication.value.type === "personal" ? "individual" : "group",
          action: "reject",
          approver_id: currentUserId.value,
          comments: reason
        };
        const res = await api_uniApproval.approvalAction(data);
        if (res && res.code === 0) {
          closeRejectDialog();
          common_vendor.index.showToast({
            title: "已驳回该申请",
            icon: "success"
          });
          loadApplications();
        } else {
          common_vendor.index.showToast({
            title: res.message || "操作失败",
            icon: "none"
          });
        }
      } catch (error) {
        console.error("驳回操作失败:", error);
        common_vendor.index.showToast({
          title: "网络错误，请重试",
          icon: "none"
        });
      }
    };
    const approveApplication = (app) => {
      common_vendor.index.showModal({
        title: "确认通过",
        content: "确定要通过该申请吗？",
        success: async (res) => {
          if (res.confirm) {
            try {
              const data = {
                reservation_id: app.id,
                reservation_type: app.type === "personal" ? "individual" : "group",
                action: "approve",
                approver_id: currentUserId.value,
                comments: "审批通过"
              };
              const result = await api_uniApproval.approvalAction(data);
              if (result && result.code === 0) {
                common_vendor.index.showToast({
                  title: "已通过该申请",
                  icon: "success"
                });
                loadApplications();
              } else {
                common_vendor.index.showToast({
                  title: result.message || "操作失败",
                  icon: "none"
                });
              }
            } catch (error) {
              console.error("通过操作失败:", error);
              common_vendor.index.showToast({
                title: "网络错误，请重试",
                icon: "none"
              });
            }
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
    const formatDateTime = (dateTime) => {
      if (!dateTime)
        return "";
      const date = new Date(dateTime);
      return date.toLocaleString("zh-CN", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit"
      });
    };
    const getCurrentUserInfo = async () => {
      try {
        const currentUser = common_vendor.index.getStorageSync("currentUser");
        if (currentUser && currentUser.user_id) {
          currentUserId.value = currentUser.user_id;
          const res = await api_uniApproval.getApproverInfo(currentUser.user_id);
          if (res && res.code === 0) {
            userInfo.value = {
              name: res.data.name,
              role: res.data.role
            };
          } else {
            userInfo.value = {
              name: currentUser.real_name || currentUser.username,
              role: currentUser.role === "admin" ? "超级管理员" : "审批管理员"
            };
          }
        } else {
          common_vendor.index.reLaunch({
            url: "/pages/admin/login"
          });
        }
      } catch (error) {
        console.error("获取用户信息失败:", error);
        userInfo.value = {
          name: "审批员",
          role: "审批管理员"
        };
      }
    };
    common_vendor.onMounted(async () => {
      await getCurrentUserInfo();
      if (currentUserId.value) {
        loadApplications();
      }
    });
    const logout = () => {
      common_vendor.index.removeStorageSync("currentUser");
      common_vendor.index.reLaunch({
        url: "/pages/admin/login"
      });
    };
    return {
      showRejectModal,
      userInfo,
      filter,
      typeOptions,
      statusOptions,
      currentPage,
      applications,
      rejectReason,
      totalPages,
      loading,
      getStatusText,
      onTypeChange,
      onStatusChange,
      loadApplications,
      showRejectDialog,
      closeRejectDialog,
      confirmReject,
      handleConfirmReject,
      approveApplication,
      prevPage,
      nextPage,
      logout
    };
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  var _a, _b;
  return common_vendor.e({
    a: common_vendor.t($setup.userInfo.name),
    b: common_vendor.t($setup.userInfo.role),
    c: common_vendor.o((...args) => $setup.logout && $setup.logout(...args)),
    d: common_vendor.t(((_a = $setup.typeOptions.find((opt) => opt.value === $setup.filter.type)) == null ? void 0 : _a.label) || "全部类型"),
    e: common_vendor.o((...args) => $setup.onTypeChange && $setup.onTypeChange(...args)),
    f: $setup.filter.type,
    g: $setup.typeOptions,
    h: common_vendor.t(((_b = $setup.statusOptions.find((opt) => opt.value === $setup.filter.status)) == null ? void 0 : _b.label) || "全部状态"),
    i: common_vendor.o((...args) => $setup.onStatusChange && $setup.onStatusChange(...args)),
    j: $setup.filter.status,
    k: $setup.statusOptions,
    l: common_vendor.o((...args) => $setup.loadApplications && $setup.loadApplications(...args)),
    m: $setup.applications.length === 0
  }, $setup.applications.length === 0 ? {} : {
    n: common_vendor.f($setup.applications, (app, k0, i0) => {
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
    o: $setup.applications.length > 0
  }, $setup.applications.length > 0 ? {
    p: $setup.currentPage === 1,
    q: common_vendor.o((...args) => $setup.prevPage && $setup.prevPage(...args)),
    r: common_vendor.t($setup.currentPage),
    s: common_vendor.t($setup.totalPages),
    t: $setup.currentPage === $setup.totalPages,
    v: common_vendor.o((...args) => $setup.nextPage && $setup.nextPage(...args))
  } : {}, {
    w: $setup.showRejectModal
  }, $setup.showRejectModal ? {
    x: common_vendor.o((...args) => $setup.closeRejectDialog && $setup.closeRejectDialog(...args)),
    y: $setup.rejectReason,
    z: common_vendor.o(($event) => $setup.rejectReason = $event.detail.value),
    A: common_vendor.o((...args) => $setup.closeRejectDialog && $setup.closeRejectDialog(...args)),
    B: common_vendor.o((...args) => $setup.handleConfirmReject && $setup.handleConfirmReject(...args)),
    C: common_vendor.o(() => {
    }),
    D: common_vendor.o((...args) => $setup.closeRejectDialog && $setup.closeRejectDialog(...args))
  } : {});
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-b5384573"]]);
wx.createPage(MiniProgramPage);
