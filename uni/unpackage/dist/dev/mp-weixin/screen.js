"use strict";
const common_vendor = require("./common/vendor.js");
const _sfc_main = {
  name: "DashboardScreen",
  setup() {
    const currentTime = common_vendor.ref("");
    const todayChart = common_vendor.ref(null);
    const weekChart = common_vendor.ref(null);
    const pendingGauge = common_vendor.ref(null);
    const enteredGauge = common_vendor.ref(null);
    let todayChartInstance = null;
    let weekChartInstance = null;
    let pendingGaugeInstance = null;
    let enteredGaugeInstance = null;
    let timeInterval = null;
    const todayStats = common_vendor.ref({
      total: 128,
      people: 210,
      pending: 42,
      entered: 76
    });
    const todayRecords = common_vendor.ref([
      {
        applicant: "张三",
        type: "个人",
        reason: "参加学术讲座",
        time: "14:00 - 16:00"
      },
      {
        applicant: "李四",
        type: "访客",
        reason: "拜访教授",
        time: "09:30 - 11:00"
      },
      {
        applicant: "王五",
        type: "公务",
        reason: "部门会议",
        time: "13:00 - 17:00"
      },
      {
        applicant: "赵六",
        type: "个人",
        reason: "图书馆借阅",
        time: "10:00 - 12:00"
      },
      {
        applicant: "钱七",
        type: "供应商",
        reason: "设备维修",
        time: "14:30 - 16:30"
      }
    ]);
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
    const refreshData = () => {
      todayStats.value = {
        total: Math.floor(Math.random() * 50) + 100,
        people: Math.floor(Math.random() * 100) + 150,
        pending: Math.floor(Math.random() * 30) + 20,
        entered: Math.floor(Math.random() * 50) + 50
      };
      if (pendingGaugeInstance) {
        pendingGaugeInstance.setOption({
          series: [{
            data: [{
              value: todayStats.value.pending,
              name: "待入校"
            }]
          }]
        });
      }
      if (enteredGaugeInstance) {
        enteredGaugeInstance.setOption({
          series: [{
            data: [{
              value: todayStats.value.entered,
              name: "已入校"
            }]
          }]
        });
      }
      alert("数据已刷新");
    };
    const initCharts = () => {
      const todayData = {
        categories: ["00:00", "02:00", "04:00", "06:00", "08:00", "10:00", "12:00", "14:00", "16:00", "18:00", "20:00", "22:00"],
        series: [
          {
            name: "预约数",
            data: [12, 8, 15, 25, 45, 68, 82, 95, 78, 65, 42, 28]
          },
          {
            name: "预约人次",
            data: [18, 12, 22, 38, 68, 102, 125, 142, 118, 98, 65, 42]
          }
        ]
      };
      const weekData = {
        categories: ["周一", "周二", "周三", "周四", "周五", "周六", "周日"],
        series: [
          {
            name: "预约数",
            data: [320, 280, 350, 420, 480, 380, 290]
          },
          {
            name: "预约人次",
            data: [485, 425, 528, 635, 725, 575, 438]
          }
        ]
      };
      if (todayChart.value) {
        todayChartInstance = common_vendor.init(todayChart.value);
        todayChartInstance.setOption({
          grid: {
            left: "10%",
            right: "10%",
            top: "15%",
            bottom: "15%"
          },
          xAxis: {
            type: "category",
            data: todayData.categories,
            axisLine: {
              lineStyle: {
                color: "rgba(0, 212, 255, 0.5)"
              }
            },
            axisLabel: {
              color: "rgba(255, 255, 255, 0.7)",
              fontSize: 8
            }
          },
          yAxis: {
            type: "value",
            axisLine: {
              lineStyle: {
                color: "rgba(0, 212, 255, 0.5)"
              }
            },
            axisLabel: {
              color: "rgba(255, 255, 255, 0.7)",
              fontSize: 8
            },
            splitLine: {
              lineStyle: {
                color: "rgba(0, 212, 255, 0.2)"
              }
            }
          },
          series: [
            {
              name: "预约数",
              type: "line",
              data: todayData.series[0].data,
              smooth: true,
              lineStyle: {
                color: "rgba(0, 100, 200, 0.8)",
                width: 2
              },
              itemStyle: {
                color: "rgba(0, 100, 200, 0.9)"
              }
            },
            {
              name: "预约人次",
              type: "line",
              data: todayData.series[1].data,
              smooth: true,
              lineStyle: {
                color: "#00ff88",
                width: 2
              },
              itemStyle: {
                color: "#00ff88"
              }
            }
          ],
          tooltip: {
            trigger: "axis",
            backgroundColor: "rgba(0, 30, 60, 0.9)",
            textStyle: {
              color: "#fff",
              fontSize: 10
            }
          }
        });
      }
      if (weekChart.value) {
        weekChartInstance = common_vendor.init(weekChart.value);
        weekChartInstance.setOption({
          grid: {
            left: "10%",
            right: "10%",
            top: "15%",
            bottom: "15%"
          },
          xAxis: {
            type: "category",
            data: weekData.categories,
            axisLine: {
              lineStyle: {
                color: "rgba(0, 212, 255, 0.5)"
              }
            },
            axisLabel: {
              color: "rgba(255, 255, 255, 0.7)",
              fontSize: 8
            }
          },
          yAxis: {
            type: "value",
            axisLine: {
              lineStyle: {
                color: "rgba(0, 212, 255, 0.5)"
              }
            },
            axisLabel: {
              color: "rgba(255, 255, 255, 0.7)",
              fontSize: 8
            },
            splitLine: {
              lineStyle: {
                color: "rgba(0, 212, 255, 0.2)"
              }
            }
          },
          series: [
            {
              name: "预约数",
              type: "line",
              data: weekData.series[0].data,
              smooth: true,
              lineStyle: {
                color: "rgba(0, 100, 200, 0.8)",
                width: 2
              },
              itemStyle: {
                color: "rgba(0, 100, 200, 0.9)"
              }
            },
            {
              name: "预约人次",
              type: "line",
              data: weekData.series[1].data,
              smooth: true,
              lineStyle: {
                color: "#00ff88",
                width: 2
              },
              itemStyle: {
                color: "#00ff88"
              }
            }
          ],
          tooltip: {
            trigger: "axis",
            backgroundColor: "rgba(0, 30, 60, 0.9)",
            textStyle: {
              color: "#fff",
              fontSize: 10
            }
          }
        });
      }
      if (pendingGauge.value && enteredGauge.value) {
        pendingGaugeInstance = common_vendor.init(pendingGauge.value);
        pendingGaugeInstance.setOption({
          series: [{
            type: "gauge",
            radius: "100%",
            center: ["50%", "60%"],
            startAngle: 180,
            endAngle: 0,
            min: 0,
            max: 100,
            progress: {
              show: true,
              width: 10
            },
            axisLine: {
              lineStyle: {
                width: 10
              }
            },
            axisTick: {
              show: false
            },
            splitLine: {
              show: false
            },
            axisLabel: {
              show: false
            },
            pointer: {
              show: false
            },
            detail: {
              valueAnimation: true,
              offsetCenter: [0, "0%"],
              fontSize: 12,
              fontWeight: "normal",
              formatter: "{value}",
              color: "#fff"
            },
            data: [{
              value: todayStats.value.pending,
              name: "待入校"
            }]
          }]
        });
        enteredGaugeInstance = common_vendor.init(enteredGauge.value);
        enteredGaugeInstance.setOption({
          series: [{
            type: "gauge",
            radius: "100%",
            center: ["50%", "60%"],
            startAngle: 180,
            endAngle: 0,
            min: 0,
            max: 100,
            progress: {
              show: true,
              width: 10
            },
            axisLine: {
              lineStyle: {
                width: 10
              }
            },
            axisTick: {
              show: false
            },
            splitLine: {
              show: false
            },
            axisLabel: {
              show: false
            },
            pointer: {
              show: false
            },
            detail: {
              valueAnimation: true,
              offsetCenter: [0, "0%"],
              fontSize: 12,
              fontWeight: "normal",
              formatter: "{value}",
              color: "#fff"
            },
            data: [{
              value: todayStats.value.entered,
              name: "已入校"
            }]
          }]
        });
      }
    };
    common_vendor.onMounted(() => {
      updateTime();
      timeInterval = setInterval(updateTime, 1e3);
      setTimeout(() => {
        initCharts();
      }, 100);
      common_vendor.index.onWindowResize(() => {
        if (todayChartInstance)
          todayChartInstance.resize();
        if (weekChartInstance)
          weekChartInstance.resize();
        if (pendingGaugeInstance)
          pendingGaugeInstance.resize();
        if (enteredGaugeInstance)
          enteredGaugeInstance.resize();
      });
    });
    common_vendor.onUnmounted(() => {
      if (timeInterval) {
        clearInterval(timeInterval);
      }
      if (todayChartInstance) {
        todayChartInstance.dispose();
      }
      if (weekChartInstance) {
        weekChartInstance.dispose();
      }
      if (pendingGaugeInstance) {
        pendingGaugeInstance.dispose();
      }
      if (enteredGaugeInstance) {
        enteredGaugeInstance.dispose();
      }
    });
    return {
      currentTime,
      todayStats,
      todayRecords,
      todayChart,
      weekChart,
      pendingGauge,
      enteredGauge,
      goBack,
      refreshData
    };
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return {
    a: common_vendor.t($setup.currentTime),
    b: common_vendor.o((...args) => $setup.goBack && $setup.goBack(...args)),
    c: common_vendor.t($setup.todayStats.total),
    d: common_vendor.t($setup.todayStats.people),
    e: common_vendor.t($setup.todayStats.pending),
    f: common_vendor.t($setup.todayStats.entered),
    g: common_vendor.o((...args) => $setup.refreshData && $setup.refreshData(...args)),
    h: common_vendor.f($setup.todayRecords, (item, index, i0) => {
      return {
        a: common_vendor.t(item.applicant),
        b: common_vendor.t(item.type),
        c: common_vendor.t(item.reason),
        d: common_vendor.t(item.time),
        e: index
      };
    })
  };
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-ac5f71b6"]]);
exports.MiniProgramPage = MiniProgramPage;
