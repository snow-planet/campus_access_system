"use strict";
const common_vendor = require("./common/vendor.js");
if (!Array) {
  const _component_uni_icons = common_vendor.resolveComponent("uni-icons");
  _component_uni_icons();
}
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
    const loadStats = () => {
      stats.value = {
        todayReservations: 24,
        totalVisitors: 156
      };
    };
    const loadReservations = () => {
      const allReservations = [
        {
          reservation_id: 1001,
          user_id: 101,
          user_name: "张三",
          type: "individual",
          purpose: "参加学术讲座",
          visit_date: getTodayDate(),
          entry_time: "14:00:00",
          exit_time: "16:00:00",
          gate: "北门",
          license_plate: "京A12345",
          approver_id: 1,
          approver_name: "李老师",
          status: "approved",
          created_at: "2023-10-15 09:30:00",
          updated_at: "2023-10-15 10:15:00"
        },
        {
          reservation_id: 1002,
          user_id: 102,
          user_name: "计算机科学协会",
          type: "group",
          purpose: "举办技术沙龙活动",
          visitor_count: 25,
          contact_name: "李四",
          contact_phone: "13800138000",
          visit_date: "2023-10-18",
          entry_time: "13:00:00",
          exit_time: "17:00:00",
          gate: "东门",
          license_plate: "京B67890",
          approver_id: null,
          approver_name: null,
          status: "pending",
          created_at: "2023-10-15 11:05:00",
          updated_at: "2023-10-15 11:05:00"
        },
        {
          reservation_id: 1003,
          user_id: 103,
          user_name: "王五",
          type: "individual",
          purpose: "办理学生事务",
          visit_date: "2023-10-17",
          entry_time: "09:00:00",
          exit_time: "12:00:00",
          gate: "北门",
          license_plate: "",
          approver_id: 1,
          approver_name: "李老师",
          status: "completed",
          created_at: "2023-10-14 15:20:00",
          updated_at: "2023-10-17 12:30:00"
        },
        {
          reservation_id: 1004,
          user_id: 104,
          user_name: "外语学院",
          type: "group",
          purpose: "举办外语角活动",
          visitor_count: 30,
          contact_name: "赵六",
          contact_phone: "13900139000",
          visit_date: getTodayDate(),
          entry_time: "08:30:00",
          exit_time: "11:30:00",
          gate: "北门",
          license_plate: "京C54321",
          approver_id: 2,
          approver_name: "王老师",
          status: "approved",
          created_at: "2023-10-15 14:20:00",
          updated_at: "2023-10-15 16:45:00"
        },
        {
          reservation_id: 1005,
          user_id: 105,
          user_name: "钱七",
          type: "individual",
          purpose: "实验室工作",
          visit_date: getTodayDate(),
          entry_time: "08:00:00",
          exit_time: "18:00:00",
          gate: "东门",
          license_plate: "京D09876",
          approver_id: 1,
          approver_name: "李老师",
          status: "approved",
          created_at: "2023-10-16 10:30:00",
          updated_at: "2023-10-16 10:30:00"
        }
      ];
      reservations.value = allReservations.filter((res) => {
        if (filters.value.type !== "all" && res.type !== filters.value.type)
          return false;
        if (filters.value.status !== "all" && res.status !== filters.value.status)
          return false;
        if (filters.value.date && res.visit_date !== filters.value.date)
          return false;
        if (filters.value.gate !== "all" && res.gate !== filters.value.gate)
          return false;
        return true;
      });
      totalItems.value = reservations.value.length;
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
      console.log("查看详情:", reservation);
      alert(`查看预约详情：${reservation.reservation_id}`);
    };
    const approveReservation = (reservation) => {
      if (confirm("确定要通过该预约申请吗？")) {
        console.log("通过审批:", reservation);
        alert("已通过审批");
      }
    };
    const rejectReservation = (reservation) => {
      if (confirm("确定要驳回该预约申请吗？")) {
        console.log("驳回申请:", reservation);
        alert("已驳回申请");
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
        k: common_vendor.p({
          type: "search",
          size: "16",
          color: "#fff"
        }),
        l: common_vendor.o(loadReservations),
        m: common_vendor.p({
          type: "refresh",
          size: "16",
          color: "#666"
        }),
        n: common_vendor.o(resetFilters),
        o: common_vendor.t(stats.value.todayReservations),
        p: common_vendor.t(stats.value.totalVisitors),
        q: reservations.value.length === 0
      }, reservations.value.length === 0 ? {
        r: common_vendor.p({
          type: "search",
          size: "24",
          color: "#999"
        })
      } : {
        s: common_vendor.f(reservations.value, (reservation, k0, i0) => {
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
            t: "ec62db0b-3-" + i0,
            v: common_vendor.o(($event) => viewDetails(reservation), reservation.reservation_id),
            w: reservation.status === "pending"
          }, reservation.status === "pending" ? {
            x: "ec62db0b-4-" + i0,
            y: common_vendor.p({
              type: "checkmark",
              size: "14",
              color: "#52c41a"
            }),
            z: common_vendor.o(($event) => approveReservation(reservation), reservation.reservation_id)
          } : {}, {
            A: reservation.status === "pending"
          }, reservation.status === "pending" ? {
            B: "ec62db0b-5-" + i0,
            C: common_vendor.p({
              type: "close",
              size: "14",
              color: "#ff4d4f"
            }),
            D: common_vendor.o(($event) => rejectReservation(reservation), reservation.reservation_id)
          } : {}, {
            E: reservation.reservation_id
          });
        }),
        t: common_vendor.p({
          type: "eye",
          size: "14",
          color: "#666"
        })
      }, {
        v: reservations.value.length > 0
      }, reservations.value.length > 0 ? {
        w: common_vendor.p({
          type: "left",
          size: "14",
          color: "#fff"
        }),
        x: currentPage.value === 1,
        y: common_vendor.o(prevPage),
        z: common_vendor.t(currentPage.value),
        A: common_vendor.t(totalPages.value),
        B: common_vendor.p({
          type: "right",
          size: "14",
          color: "#fff"
        }),
        C: currentPage.value === totalPages.value,
        D: common_vendor.o(nextPage)
      } : {});
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-ec62db0b"]]);
exports.MiniProgramPage = MiniProgramPage;
