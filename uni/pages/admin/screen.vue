<template>
  <view class="screen-container">
    <!-- 顶部标题区域 -->
    <view class="header-section">
      <view class="header-left">
        <text class="screen-title">校园出入预约数据看板</text>
        <view class="current-time">{{ currentTime }}</view>
      </view>
      <view class="back-button" @click="goBack">
        <text class="back-icon">←</text>
        <text class="back-text">返回</text>
      </view>
    </view>

    <!-- 数据概览区域 - 修改后的布局 -->
    <view class="data-overview">
      <!-- 左侧上下排列的卡片 -->
      <view class="left-cards">
        <view class="stat-card main-card">
          <view class="stat-number">{{ todayStats.total }}</view>
          <view class="stat-label">今日预约总数</view>
        </view>
        <view class="stat-card main-card">
          <view class="stat-number">{{ todayStats.people }}</view>
          <view class="stat-label">预约人次</view>
        </view>
      </view>

      <!-- 右侧仪表盘区域 -->
      <view class="right-gauges">
        <view class="gauge-container">
          <view class="gauge-chart" ref="pendingGauge"></view>
          <view class="gauge-label">待入校: {{ todayStats.pending }}</view>
        </view>
        <view class="gauge-container">
          <view class="gauge-chart" ref="enteredGauge"></view>
          <view class="gauge-label">已入校: {{ todayStats.entered }}</view>
        </view>
      </view>
    </view>

    <!-- 图表区域 - 修改为上下排列 -->
    <view class="charts-section">
      <view class="chart-panel">
        <view class="chart-header">
          <text class="chart-title">今日人流量统计 (24小时)</text>
        </view>
        <view class="chart-container" ref="todayChart"></view>
      </view>

      <view class="chart-panel">
        <view class="chart-header">
          <text class="chart-title">本周人流量统计</text>
        </view>
        <view class="chart-container" ref="weekChart"></view>
      </view>
    </view>

    <!-- 今日预约记录 -->
    <view class="records-section">
      <view class="records-header">
        <text class="section-title">今日预约记录</text>
        <button class="refresh-btn" @click="refreshData">
          <text class="refresh-icon">↻</text>
          <text>刷新</text>
        </button>
      </view>
      
      <view class="records-list">
        <view v-for="(item, index) in todayRecords" :key="index" class="record-item">
          <view class="item-main">
            <text class="applicant-name">{{ item.applicant }}</text>
            <text class="record-type">{{ item.type }}</text>
          </view>
          <view class="item-details">
            <text class="record-reason">{{ item.reason }}</text>
            <text class="record-time">{{ item.time }}</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { ref, onMounted, onUnmounted } from 'vue';
import * as echarts from 'echarts';

export default {
  name: 'DashboardScreen',
  setup() {
    const currentTime = ref('');
    const todayChart = ref(null);
    const weekChart = ref(null);
    const pendingGauge = ref(null);
    const enteredGauge = ref(null);
    let todayChartInstance = null;
    let weekChartInstance = null;
    let pendingGaugeInstance = null;
    let enteredGaugeInstance = null;
    let timeInterval = null;

    // 模拟数据
    const todayStats = ref({
      total: 128,
      people: 210,
      pending: 42,
      entered: 76
    });

    const todayRecords = ref([
      {
        applicant: '张三',
        type: '个人',
        reason: '参加学术讲座',
        time: '14:00 - 16:00'
      },
      {
        applicant: '李四',
        type: '访客',
        reason: '拜访教授',
        time: '09:30 - 11:00'
      },
      {
        applicant: '王五',
        type: '公务',
        reason: '部门会议',
        time: '13:00 - 17:00'
      },
      {
        applicant: '赵六',
        type: '个人',
        reason: '图书馆借阅',
        time: '10:00 - 12:00'
      },
      {
        applicant: '钱七',
        type: '供应商',
        reason: '设备维修',
        time: '14:30 - 16:30'
      }
    ]);

    const updateTime = () => {
      const now = new Date();
      currentTime.value = now.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
    };

    const goBack = () => {
      uni.navigateBack();
    };

    const refreshData = () => {
      // 模拟刷新数据
      todayStats.value = {
        total: Math.floor(Math.random() * 50) + 100,
        people: Math.floor(Math.random() * 100) + 150,
        pending: Math.floor(Math.random() * 30) + 20,
        entered: Math.floor(Math.random() * 50) + 50
      };
      
      // 更新仪表盘
      if (pendingGaugeInstance) {
        pendingGaugeInstance.setOption({
          series: [{
            data: [{
              value: todayStats.value.pending,
              name: '待入校'
            }]
          }]
        });
      }
      
      if (enteredGaugeInstance) {
        enteredGaugeInstance.setOption({
          series: [{
            data: [{
              value: todayStats.value.entered,
              name: '已入校'
            }]
          }]
        });
      }
      
      alert('数据已刷新');
    };

    const initCharts = () => {
      // 今日数据
      const todayData = {
        categories: ['00:00', '02:00', '04:00', '06:00', '08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00', '22:00'],
        series: [
          {
            name: '预约数',
            data: [12, 8, 15, 25, 45, 68, 82, 95, 78, 65, 42, 28]
          },
          {
            name: '预约人次',
            data: [18, 12, 22, 38, 68, 102, 125, 142, 118, 98, 65, 42]
          }
        ]
      };

      // 周数据
      const weekData = {
        categories: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
        series: [
          {
            name: '预约数',
            data: [320, 280, 350, 420, 480, 380, 290]
          },
          {
            name: '预约人次',
            data: [485, 425, 528, 635, 725, 575, 438]
          }
        ]
      };

      // 初始化今日图表
      if (todayChart.value) {
        todayChartInstance = echarts.init(todayChart.value);
        todayChartInstance.setOption({
          grid: {
            left: '10%',
            right: '10%',
            top: '15%',
            bottom: '15%'
          },
          xAxis: {
            type: 'category',
            data: todayData.categories,
            axisLine: {
              lineStyle: {
                color: 'rgba(0, 212, 255, 0.5)'
              }
            },
            axisLabel: {
              color: 'rgba(255, 255, 255, 0.7)',
              fontSize: 8
            }
          },
          yAxis: {
            type: 'value',
            axisLine: {
              lineStyle: {
                color: 'rgba(0, 212, 255, 0.5)'
              }
            },
            axisLabel: {
              color: 'rgba(255, 255, 255, 0.7)',
              fontSize: 8
            },
            splitLine: {
              lineStyle: {
                color: 'rgba(0, 212, 255, 0.2)'
              }
            }
          },
          series: [
            {
              name: '预约数',
              type: 'line',
              data: todayData.series[0].data,
              smooth: true,
              lineStyle: {
                color: 'rgba(0, 100, 200, 0.8)',
                width: 2
              },
              itemStyle: {
                color: 'rgba(0, 100, 200, 0.9)'
              }
            },
            {
              name: '预约人次',
              type: 'line',
              data: todayData.series[1].data,
              smooth: true,
              lineStyle: {
                color: '#00ff88',
                width: 2
              },
              itemStyle: {
                color: '#00ff88'
              }
            }
          ],
          tooltip: {
            trigger: 'axis',
            backgroundColor: 'rgba(0, 30, 60, 0.9)',
            textStyle: {
              color: '#fff',
              fontSize: 10
            }
          }
        });
      }

      // 初始化周图表
      if (weekChart.value) {
        weekChartInstance = echarts.init(weekChart.value);
        weekChartInstance.setOption({
          grid: {
            left: '10%',
            right: '10%',
            top: '15%',
            bottom: '15%'
          },
          xAxis: {
            type: 'category',
            data: weekData.categories,
            axisLine: {
              lineStyle: {
                color: 'rgba(0, 212, 255, 0.5)'
              }
            },
            axisLabel: {
              color: 'rgba(255, 255, 255, 0.7)',
              fontSize: 8
            }
          },
          yAxis: {
            type: 'value',
            axisLine: {
              lineStyle: {
                color: 'rgba(0, 212, 255, 0.5)'
              }
            },
            axisLabel: {
              color: 'rgba(255, 255, 255, 0.7)',
              fontSize: 8
            },
            splitLine: {
              lineStyle: {
                color: 'rgba(0, 212, 255, 0.2)'
              }
            }
          },
          series: [
            {
              name: '预约数',
              type: 'line',
              data: weekData.series[0].data,
              smooth: true,
              lineStyle: {
                color: 'rgba(0, 100, 200, 0.8)',
                width: 2
              },
              itemStyle: {
                color: 'rgba(0, 100, 200, 0.9)'
              }
            },
            {
              name: '预约人次',
              type: 'line',
              data: weekData.series[1].data,
              smooth: true,
              lineStyle: {
                color: '#00ff88',
                width: 2
              },
              itemStyle: {
                color: '#00ff88'
              }
            }
          ],
          tooltip: {
            trigger: 'axis',
            backgroundColor: 'rgba(0, 30, 60, 0.9)',
            textStyle: {
              color: '#fff',
              fontSize: 10
            }
          }
        });
      }

      // 初始化仪表盘
      if (pendingGauge.value && enteredGauge.value) {
        // 待入校仪表盘
        pendingGaugeInstance = echarts.init(pendingGauge.value);
        pendingGaugeInstance.setOption({
          series: [{
            type: 'gauge',
            radius: '100%',
            center: ['50%', '60%'],
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
              offsetCenter: [0, '0%'],
              fontSize: 12,
              fontWeight: 'normal',
              formatter: '{value}',
              color: '#fff'
            },
            data: [{
              value: todayStats.value.pending,
              name: '待入校'
            }]
          }]
        });

        // 已入校仪表盘
        enteredGaugeInstance = echarts.init(enteredGauge.value);
        enteredGaugeInstance.setOption({
          series: [{
            type: 'gauge',
            radius: '100%',
            center: ['50%', '60%'],
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
              offsetCenter: [0, '0%'],
              fontSize: 12,
              fontWeight: 'normal',
              formatter: '{value}',
              color: '#fff'
            },
            data: [{
              value: todayStats.value.entered,
              name: '已入校'
            }]
          }]
        });
      }
    };

    onMounted(() => {
      updateTime();
      timeInterval = setInterval(updateTime, 1000);
      
      // 初始化图表
      setTimeout(() => {
        initCharts();
      }, 100);

      // 监听窗口大小变化，重新渲染图表
      uni.onWindowResize(() => {
        if (todayChartInstance) todayChartInstance.resize();
        if (weekChartInstance) weekChartInstance.resize();
        if (pendingGaugeInstance) pendingGaugeInstance.resize();
        if (enteredGaugeInstance) enteredGaugeInstance.resize();
      });
    });

    onUnmounted(() => {
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
</script>

<style scoped>
/* 移除通配符选择器，小程序不支持 */

.screen-container {
  width: 100vw;
  min-height: 100vh;
  background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
  padding: 8px;
  color: white;
  display: flex;
  flex-direction: column;
  font-family: 'Microsoft YaHei', Arial, sans-serif;
  overflow-x: hidden;
}

/* 顶部标题区域 */
.header-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  padding: 10px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  backdrop-filter: blur(10px);
}

.header-left {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.screen-title {
  font-size: 1.1rem;
  font-weight: 700;
  color: white;
}

.current-time {
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.8);
}

.back-button {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 6px;
  font-size: 0.8rem;
  cursor: pointer;
  transition: background 0.3s;
}

.back-button:hover {
  background: rgba(255, 255, 255, 0.3);
}

/* 数据概览区域 - 修改后的布局 */
.data-overview {
  display: flex;
  gap: 12px;
  margin-bottom: 12px;
  height: 150px;
}

.left-cards {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.right-gauges {
  flex: 1;
  display: flex;
  gap: 12px;
}

.stat-card {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 8px;
  padding: 10px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.stat-card.main-card {
  background: rgba(0, 50, 100, 0.9);
  border: 2px solid rgba(0, 212, 255, 0.6);
  box-shadow: 0 0 10px rgba(0, 212, 255, 0.5);
}

.gauge-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 8px;
  padding: 8px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.gauge-chart {
  width: 100%;
  height: 70%;
}

.gauge-label {
  font-size: 0.7rem;
  color: rgba(255, 255, 255, 0.9);
  margin-top: 4px;
  text-align: center;
}

.stat-number {
  font-size: 1.4rem;
  font-weight: 700;
  color: #00d4ff;
  display: block;
  margin-bottom: 4px;
  text-shadow: 0 0 6px rgba(0, 212, 255, 0.5);
}

.stat-label {
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.9);
  display: block;
}

/* 图表区域 - 修改为上下排列 */
.charts-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 12px;
}

.chart-panel {
  flex: 1;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 10px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  display: flex;
  flex-direction: column;
  min-height: 180px;
}

.chart-header {
  margin-bottom: 10px;
}

.chart-title {
  font-size: 0.9rem;
  font-weight: 600;
  color: white;
}

.chart-container {
  flex: 1;
  width: 100%;
  min-height: 140px;
}

/* 记录区域 */
.records-section {
  min-height: 160px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 10px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  display: flex;
  flex-direction: column;
}

.records-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.section-title {
  font-size: 0.9rem;
  font-weight: 600;
  color: white;
}

.refresh-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 10px;
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 0.7rem;
  cursor: pointer;
  transition: background 0.3s;
}

.refresh-btn:hover {
  background: rgba(255, 255, 255, 0.3);
}

.records-list {
  flex: 1;
  overflow-y: auto;
  max-height: 240px;
}

.record-item {
  padding: 8px;
  margin-bottom: 8px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  border-left: 3px solid #00d4ff;
}

.item-main {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
}

.applicant-name {
  font-size: 0.8rem;
  font-weight: 500;
  color: white;
}

.record-type {
  font-size: 0.7rem;
  padding: 2px 6px;
  background: rgba(0, 212, 255, 0.3);
  color: #00d4ff;
  border-radius: 6px;
}

.item-details {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.record-reason {
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.8);
}

.record-time {
  font-size: 0.7rem;
  color: rgba(255, 255, 255, 0.6);
}

/* 滚动条样式 */
.records-list::-webkit-scrollbar {
  width: 4px;
}

.records-list::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 2px;
}

.records-list::-webkit-scrollbar-thumb {
  background: rgba(0, 212, 255, 0.5);
  border-radius: 2px;
}

.records-list::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 212, 255, 0.7);
}
</style>