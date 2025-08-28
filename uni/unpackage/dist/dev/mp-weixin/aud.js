"use strict";
const common_vendor = require("./common/vendor.js");
const api_uniAdmin = require("./api/uniAdmin.js");
const pageSize = 10;
const _sfc_main = {
  __name: "aud",
  setup(__props) {
    const filters = common_vendor.ref({
      type: "all",
      status: "approved",
      // 默认只显示已通过
      date: getTodayDate(),
      // 默认显示今日
      gate: "all",
      typeIndex: 0,
      statusIndex: 1
      // 对应已通过状态
    });
    const typeOptions = ["全部类型", "个人预约", "团体预约"];
    const statusOptions = ["全部状态", "已通过", "待审批", "已驳回", "已完成"];
    function getTodayDate() {
      const today = /* @__PURE__ */ new Date();
      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, "0");
      const day = String(today.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    }
    const currentPage = common_vendor.ref(1);
    const totalItems = common_vendor.ref(0);
    const stats = common_vendor.ref({
      todayReservations: 0,
      totalVisitors: 0
    });
    const reservations = common_vendor.ref([]);
    const totalPages = common_vendor.computed(() => Math.ceil(totalItems.value / pageSize));
    const getStatusText = (status) => {
      const statusMap = {
        "all": "全部状态",
        "pending": "待审批",
        "approved": "已通过",
        "rejected": "已驳回",
        "completed": "已完成"
      };
      return statusMap[status] || "未知状态";
    };
    const getTypeText = (type) => {
      const typeMap = {
        "all": "全部类型",
        "individual": "个人预约",
        "group": "团体预约"
      };
      return typeMap[type] || "未知类型";
    };
    const onTypeChange = (e) => {
      filters.value.typeIndex = e.detail.value;
      const typeMap = ["all", "individual", "group"];
      filters.value.type = typeMap[e.detail.value];
    };
    const onStatusChange = (e) => {
      filters.value.statusIndex = e.detail.value;
      const statusMap = ["all", "approved", "pending", "rejected", "completed"];
      filters.value.status = statusMap[e.detail.value];
    };
    const formatDate = (dateString) => {
      return new Date(dateString).toLocaleDateString("zh-CN");
    };
    const formatTime = (timeString) => {
      return timeString.substring(0, 5);
    };
    const loadStats = async () => {
      try {
        const res = await api_uniAdmin.getAuditStats();
        if (res && res.code === 0) {
          stats.value = {
            todayReservations: res.data.todayReservations || 0,
            totalVisitors: res.data.totalVisitors || 0
          };
        }
      } catch (error) {
        console.error("加载统计数据失败:", error);
        common_vendor.index.showToast({
          title: "加载统计数据失败",
          icon: "none"
        });
        stats.value = {
          todayReservations: 0,
          totalVisitors: 0
        };
      }
    };
    const loadReservations = async () => {
      try {
        const params = {
          type: filters.value.type,
          status: filters.value.status,
          date: filters.value.date,
          gate: filters.value.gate,
          page: currentPage.value,
          pageSize
        };
        const res = await api_uniAdmin.getAuditReservations(params);
        if (res && res.code === 0) {
          reservations.value = res.data.reservations || [];
          totalItems.value = res.data.total || 0;
        } else {
          reservations.value = [];
          totalItems.value = 0;
        }
      } catch (error) {
        console.error("加载预约数据失败:", error);
        common_vendor.index.showToast({
          title: "加载数据失败",
          icon: "none"
        });
        reservations.value = [];
        totalItems.value = 0;
      }
    };
    const resetFilters = () => {
      filters.value = {
        type: "all",
        status: "approved",
        // 重置后仍默认显示已通过
        date: getTodayDate(),
        // 重置后仍默认显示今日
        gate: "all",
        typeIndex: 0,
        statusIndex: 1
        // 对应已通过状态
      };
      loadReservations();
    };
    const viewDetails = (reservation) => {
      common_vendor.index.showModal({
        title: "预约详情",
        content: `预约编号：${reservation.reservation_id}
申请人：${reservation.user_name}
预约类型：${reservation.type === "individual" ? "个人" : "团体"}
事由：${reservation.purpose}
预约日期：${reservation.visit_date}
时间段：${reservation.entry_time}-${reservation.exit_time}`,
        showCancel: false
      });
    };
    const approveReservation = async (reservation) => {
      try {
        const res = await common_vendor.index.showModal({
          title: "确认操作",
          content: "确定要通过该预约申请吗？"
        });
        if (res.confirm) {
          const result = await api_uniAdmin.auditAction({
            reservation_id: reservation.reservation_id,
            action: "approve",
            reason: "审批通过"
          });
          if (result && result.code === 0) {
            common_vendor.index.showToast({
              title: "审批成功",
              icon: "success"
            });
            loadReservations();
          } else {
            common_vendor.index.showToast({
              title: "审批失败",
              icon: "none"
            });
          }
        }
      } catch (error) {
        console.error("审批操作失败:", error);
        common_vendor.index.showToast({
          title: "操作失败",
          icon: "none"
        });
      }
    };
    const rejectReservation = async (reservation) => {
      try {
        const res = await common_vendor.index.showModal({
          title: "确认操作",
          content: "确定要驳回该预约申请吗？请输入驳回理由：",
          editable: true,
          placeholderText: "请输入驳回理由"
        });
        if (res.confirm) {
          const reason = res.content || "不符合要求";
          const result = await api_uniAdmin.auditAction({
            reservation_id: reservation.reservation_id,
            action: "reject",
            reason
          });
          if (result && result.code === 0) {
            common_vendor.index.showToast({
              title: "驳回成功",
              icon: "success"
            });
            loadReservations();
          } else {
            common_vendor.index.showToast({
              title: "驳回失败",
              icon: "none"
            });
          }
        }
      } catch (error) {
        console.error("驳回操作失败:", error);
        common_vendor.index.showToast({
          title: "操作失败",
          icon: "none"
        });
      }
    };
    const prevPage = () => {
      if (currentPage.value > 1) {
        currentPage.value--;
        loadReservations();
      }
    };
    const nextPage = () => {
      if (currentPage.value < totalPages.value) {
        currentPage.value++;
        loadReservations();
      }
    };
    common_vendor.onMounted(() => {
      loadStats();
      loadReservations();
    });
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.t(getTypeText(filters.value.type)),
        b: typeOptions,
        c: filters.value.typeIndex,
        d: common_vendor.o(onTypeChange),
        e: common_vendor.t(getStatusText(filters.value.status)),
        f: statusOptions,
        g: filters.value.statusIndex,
        h: common_vendor.o(onStatusChange),
        i: filters.value.date,
        j: common_vendor.o(($event) => filters.value.date = $event.detail.value),
        k: common_vendor.o(loadReservations),
        l: common_vendor.o(resetFilters),
        m: common_vendor.t(stats.value.todayReservations),
        n: common_vendor.t(stats.value.totalVisitors),
        o: reservations.value.length === 0
      }, reservations.value.length === 0 ? {} : {
        p: common_vendor.f(reservations.value, (reservation, k0, i0) => {
          return common_vendor.e({
            a: common_vendor.t(reservation.reservation_id),
            b: common_vendor.t(reservation.user_name),
            c: reservation.type === "group"
          }, reservation.type === "group" ? {
            d: common_vendor.t(reservation.contact_name),
            e: common_vendor.t(reservation.contact_phone)
          } : {}, {
            f: common_vendor.t(reservation.type === "individual" ? "个人" : "团体"),
            g: common_vendor.n(reservation.type),
            h: reservation.type === "group"
          }, reservation.type === "group" ? {
            i: common_vendor.t(reservation.visitor_count)
          } : {}, {
            j: common_vendor.t(reservation.purpose),
            k: common_vendor.t(formatDate(reservation.visit_date)),
            l: reservation.entry_time && reservation.exit_time
          }, reservation.entry_time && reservation.exit_time ? {
            m: common_vendor.t(formatTime(reservation.entry_time)),
            n: common_vendor.t(formatTime(reservation.exit_time))
          } : {}, {
            o: common_vendor.t(reservation.gate),
            p: common_vendor.t(reservation.license_plate || "-"),
            q: common_vendor.t(getStatusText(reservation.status)),
            r: common_vendor.n(reservation.status),
            s: common_vendor.t(reservation.approver_name || "-"),
            t: common_vendor.o(($event) => viewDetails(reservation), reservation.reservation_id),
            v: reservation.status === "pending"
          }, reservation.status === "pending" ? {
            w: common_vendor.o(($event) => approveReservation(reservation), reservation.reservation_id)
          } : {}, {
            x: reservation.status === "pending"
          }, reservation.status === "pending" ? {
            y: common_vendor.o(($event) => rejectReservation(reservation), reservation.reservation_id)
          } : {}, {
            z: reservation.reservation_id
          });
        })
      }, {
        q: reservations.value.length > 0
      }, reservations.value.length > 0 ? {
        r: currentPage.value === 1,
        s: common_vendor.o(prevPage),
        t: common_vendor.t(currentPage.value),
        v: common_vendor.t(totalPages.value),
        w: currentPage.value === totalPages.value,
        x: common_vendor.o(nextPage)
      } : {});
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-ec62db0b"]]);
exports.MiniProgramPage = MiniProgramPage;
