"use strict";
const common_vendor = require("./common/vendor.js");
const api_uniDashboard = require("./api/uniDashboard.js");
const _sfc_main = {
  __name: "screen",
  setup(__props) {
    const currentTime = common_vendor.ref("");
    let timeInterval = null;
    const todayStats = common_vendor.ref({
      total: 0,
      people: 0,
      pending: 0,
      entered: 0,
      vehicles: 0
    });
    const todayRecords = common_vendor.ref([]);
    const chartData = common_vendor.ref({
      hourly: [],
      weekly: []
    });
    const updateTime = () => {
      const now = /* @__PURE__ */ new Date();
      currentTime.value = now.toLocaleString("zh-CN", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit"
      });
    };
    const goBack = () => {
      common_vendor.index.navigateBack();
    };
    const handleCanvasTouch = (e) => {
      console.log("Canvas touched:", e);
    };
    const loadDashboardStats = async () => {
      try {
        const result = await api_uniDashboard.getDashboardStats();
        if (result && result.code === 0) {
          const data = result.data;
          todayStats.value = {
            total: data.todayApproved || 0,
            people: data.todayPeople || 0,
            pending: data.todayPending || 0,
            entered: data.todayCompleted || 0,
            vehicles: data.todayVehicles || 0
          };
          updateGauges();
        }
      } catch (error) {
        console.error("加载统计数据失败:", error);
        common_vendor.index.showToast({
          title: "加载统计数据失败",
          icon: "none"
        });
      }
    };
    const loadTodayReservations = async () => {
      try {
        const result = await api_uniDashboard.getTodayReservations();
        if (result && result.code === 0) {
          const currentTime2 = /* @__PURE__ */ new Date();
          todayRecords.value = result.data.filter((item) => {
            if (item.status !== "approved")
              return false;
            const reservationTime = /* @__PURE__ */ new Date(item.reservation_date + " " + (item.time_slot || "00:00"));
            return reservationTime > currentTime2;
          }).map((item) => ({
            applicant: item.applicant || "未知",
            type: item.type === "individual" ? "个人" : "团队",
            reason: item.purpose || "未填写",
            time: item.time_slot || "未设置"
          }));
        }
      } catch (error) {
        console.error("加载今日预约记录失败:", error);
        common_vendor.index.showToast({
          title: "加载预约记录失败",
          icon: "none"
        });
      }
    };
    const loadChartData = async () => {
      try {
        const hourlyResult = await api_uniDashboard.getHourlyTraffic();
        if (hourlyResult && hourlyResult.code === 0) {
          chartData.value.hourly = hourlyResult.data;
          drawLineChart("todayChart", chartData.value.hourly, "hourly");
        }
        const weeklyResult = await api_uniDashboard.getWeeklyTraffic();
        if (weeklyResult && weeklyResult.code === 0) {
          chartData.value.weekly = weeklyResult.data;
          drawLineChart("weekChart", chartData.value.weekly, "weekly");
        }
      } catch (error) {
        console.error("加载图表数据失败:", error);
      }
    };
    const drawGauge = (canvasId, value, maxValue = 100, label) => {
      const ctx = common_vendor.index.createCanvasContext(canvasId);
      const centerX = 75;
      const centerY = 75;
      const radius = 60;
      const startAngle = -Math.PI;
      const endAngle = 0;
      const currentAngle = startAngle + (endAngle - startAngle) * (value / maxValue);
      ctx.clearRect(0, 0, 150, 150);
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, startAngle, endAngle);
      ctx.setStrokeStyle("#e0e0e0");
      ctx.setLineWidth(8);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, startAngle, currentAngle);
      ctx.setStrokeStyle("#00d4ff");
      ctx.setLineWidth(8);
      ctx.setLineCap("round");
      ctx.stroke();
      ctx.setFontSize(24);
      ctx.setFillStyle("#00d4ff");
      ctx.setTextAlign("center");
      ctx.fillText(value.toString(), centerX, centerY + 5);
      ctx.setFontSize(14);
      ctx.setFillStyle("#666");
      ctx.fillText(label, centerX, centerY + 30);
      ctx.draw();
    };
    const drawLineChart = (canvasId, data, type) => {
      const ctx = common_vendor.index.createCanvasContext(canvasId);
      const width = 280;
      const height = 120;
      const padding = 25;
      const chartWidth = width - 2 * padding;
      const chartHeight = height - 2 * padding;
      ctx.clearRect(0, 0, width, height);
      if (!data || data.length === 0) {
        ctx.setFontSize(16);
        ctx.setFillStyle("#999");
        ctx.setTextAlign("center");
        ctx.fillText("暂无数据", width / 2, height / 2);
        ctx.draw();
        return;
      }
      let labels, values;
      if (type === "hourly") {
        labels = data.map((item) => item.hour + ":00");
        values = data.map((item) => item.reservations || 0);
      } else {
        labels = ["周一", "周二", "周三", "周四", "周五", "周六", "周日"];
        values = data.map((item) => item.reservations || 0);
      }
      const maxValue = Math.max(...values, 1);
      const stepX = chartWidth / (labels.length - 1);
      ctx.setStrokeStyle("#e0e0e0");
      ctx.setLineWidth(1);
      ctx.beginPath();
      ctx.moveTo(padding, height - padding);
      ctx.lineTo(width - padding, height - padding);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(padding, padding);
      ctx.lineTo(padding, height - padding);
      ctx.stroke();
      ctx.setFontSize(10);
      ctx.setFillStyle("#666");
      ctx.setTextAlign("center");
      labels.forEach((label, index) => {
        const x = padding + index * stepX;
        ctx.fillText(label, x, height - 8);
      });
      ctx.beginPath();
      ctx.setStrokeStyle("#00d4ff");
      ctx.setLineWidth(2);
      values.forEach((value, index) => {
        const x = padding + index * stepX;
        const y = height - padding - value / maxValue * chartHeight;
        if (index === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      });
      ctx.stroke();
      values.forEach((value, index) => {
        const x = padding + index * stepX;
        const y = height - padding - value / maxValue * chartHeight;
        ctx.beginPath();
        ctx.arc(x, y, 3, 0, 2 * Math.PI);
        ctx.setFillStyle("#00d4ff");
        ctx.fill();
      });
      ctx.draw();
    };
    const updateGauges = () => {
      drawGauge("pendingGauge", todayStats.value.pending, 100, "待入校");
      drawGauge("enteredGauge", todayStats.value.entered, 100, "已入校");
    };
    const initCharts = () => {
      updateGauges();
      const mockHourlyData = [
        { hour: 8, reservations: 12 },
        { hour: 10, reservations: 25 },
        { hour: 12, reservations: 45 },
        { hour: 14, reservations: 68 },
        { hour: 16, reservations: 42 },
        { hour: 18, reservations: 28 }
      ];
      const mockWeeklyData = [
        { reservations: 320 },
        { reservations: 280 },
        { reservations: 350 },
        { reservations: 420 },
        { reservations: 480 },
        { reservations: 380 },
        { reservations: 290 }
      ];
      drawLineChart("todayChart", mockHourlyData, "hourly");
      drawLineChart("weekChart", mockWeeklyData, "weekly");
    };
    const refreshData = async () => {
      common_vendor.index.showLoading({ title: "刷新中..." });
      try {
        await Promise.all([
          loadDashboardStats(),
          loadTodayReservations(),
          loadChartData()
        ]);
        common_vendor.index.showToast({
          title: "数据已刷新",
          icon: "success"
        });
      } catch (error) {
        common_vendor.index.showToast({
          title: "刷新失败",
          icon: "none"
        });
      } finally {
        common_vendor.index.hideLoading();
      }
    };
    common_vendor.onMounted(() => {
      updateTime();
      timeInterval = setInterval(updateTime, 1e3);
      common_vendor.nextTick$1(() => {
        setTimeout(() => {
          try {
            initCharts();
            loadDashboardStats();
            loadTodayReservations();
            loadChartData();
          } catch (error) {
            console.error("图表初始化失败:", error);
            common_vendor.index.showToast({
              title: "图表加载失败",
              icon: "none"
            });
          }
        }, 300);
      });
    });
    common_vendor.onUnmounted(() => {
      if (timeInterval) {
        clearInterval(timeInterval);
      }
    });
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.t(currentTime.value),
        b: common_vendor.o(goBack),
        c: common_vendor.t(todayStats.value.total),
        d: common_vendor.t(todayStats.value.people),
        e: common_vendor.t(todayStats.value.vehicles),
        f: common_vendor.o(handleCanvasTouch),
        g: common_vendor.t(todayStats.value.pending),
        h: common_vendor.o(handleCanvasTouch),
        i: common_vendor.t(todayStats.value.entered),
        j: common_vendor.o(handleCanvasTouch),
        k: common_vendor.o(handleCanvasTouch),
        l: common_vendor.o(refreshData),
        m: common_vendor.f(todayRecords.value, (item, index, i0) => {
          return {
            a: common_vendor.t(item.applicant),
            b: common_vendor.t(item.type),
            c: common_vendor.t(item.reason),
            d: common_vendor.t(item.time),
            e: index
          };
        }),
        n: todayRecords.value.length === 0
      }, todayRecords.value.length === 0 ? {} : {});
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-ac5f71b6"]]);
exports.MiniProgramPage = MiniProgramPage;
