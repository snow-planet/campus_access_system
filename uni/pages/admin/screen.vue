<template>
  <view class="screen-container">
    <!-- 顶部标题区域 -->
    <view class="header-section">
      <view class="header-left">
        <text class="screen-title">校园出入预约数据看板</text>
        <view class="current-time">{{ currentTime }}</view>
      </view>
      <view class="back-button" @tap="goBack">
        <text class="back-icon">←</text>
        <text class="back-text">返回</text>
      </view>
    </view>

    <!-- 数据概览区域 -->
    <view class="data-overview">
      <!-- 左侧统计卡片 -->
      <view class="left-cards">
        <view class="stat-card main-card">
          <view class="stat-number">{{ todayStats.total }}</view>
          <view class="stat-label">今日预约总数</view>
        </view>
        <view class="stat-card main-card">
          <view class="stat-number">{{ todayStats.people }}</view>
          <view class="stat-label">预约人次</view>
        </view>
        <view class="stat-card main-card">
          <view class="stat-number">{{ todayStats.vehicles }}</view>
          <view class="stat-label">今日车流量</view>
        </view>
      </view>

      <!-- 右侧仪表盘区域 -->
      <view class="right-gauges">
        <view class="gauge-container">
          <canvas 
            canvas-id="pendingGauge" 
            class="gauge-chart" 
            @touchstart="handleCanvasTouch"
          ></canvas>
          <view class="gauge-label">待入校: {{ todayStats.pending }}</view>
        </view>
        <view class="gauge-container">
          <canvas 
            canvas-id="enteredGauge" 
            class="gauge-chart" 
            @touchstart="handleCanvasTouch"
          ></canvas>
          <view class="gauge-label">已入校: {{ todayStats.entered }}</view>
        </view>
      </view>
    </view>

    <!-- 图表区域 -->
    <view class="charts-section">
      <view class="chart-panel">
        <view class="chart-header">
          <text class="chart-title">今日人流量统计 (24小时)</text>
        </view>
        <canvas 
          canvas-id="todayChart" 
          class="chart-container" 
          @touchstart="handleCanvasTouch"
        ></canvas>
      </view>

      <view class="chart-panel">
        <view class="chart-header">
          <text class="chart-title">本周人流量统计</text>
        </view>
        <canvas 
          canvas-id="weekChart" 
          class="chart-container" 
          @touchstart="handleCanvasTouch"
        ></canvas>
      </view>
    </view>

    <!-- 今日预约记录 -->
    <view class="records-section">
      <view class="records-header">
        <text class="section-title">今日待入校预约</text>
        <button class="refresh-btn" @tap="refreshData">
          <text class="refresh-icon">↻</text>
          <text>刷新</text>
        </button>
      </view>
      
      <scroll-view class="records-list" scroll-y="true">
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
        <view v-if="todayRecords.length === 0" class="empty-records">
          <text class="empty-text">暂无待入校预约</text>
        </view>
      </scroll-view>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import { 
  getDashboardStats, 
  getHourlyTraffic, 
  getWeeklyTraffic, 
  getTodayReservations 
} from '../../api/uniDashboard.js'

// 响应式数据
const currentTime = ref('')
let timeInterval = null

// 今日统计数据
const todayStats = ref({
  total: 0,
  people: 0,
  pending: 0,
  entered: 0,
  vehicles: 0
})

// 今日预约记录
const todayRecords = ref([])

// 图表数据
const chartData = ref({
  hourly: [],
  weekly: []
})

// Canvas上下文
let canvasContexts = {}

// 更新时间
const updateTime = () => {
  const now = new Date()
  currentTime.value = now.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

// 返回上一页
const goBack = () => {
  uni.navigateBack()
}

// 处理Canvas触摸事件
const handleCanvasTouch = (e) => {
  // 可以在这里添加图表交互逻辑
  console.log('Canvas touched:', e)
}

// 加载统计数据
const loadDashboardStats = async () => {
  try {
    const result = await getDashboardStats()
    if (result && result.code === 0) {
      const data = result.data
      todayStats.value = {
        total: data.todayApproved || 0,
        people: data.todayPeople || 0,
        pending: data.todayPending || 0,
        entered: data.todayCompleted || 0,
        vehicles: data.todayVehicles || 0
      }
      
      // 更新仪表盘
      updateGauges()
    }
  } catch (error) {
    console.error('加载统计数据失败:', error)
    uni.showToast({
      title: '加载统计数据失败',
      icon: 'none'
    })
  }
}

// 加载今日预约记录（只显示审批通过但未完成的）
const loadTodayReservations = async () => {
  try {
    const result = await getTodayReservations()
    if (result && result.code === 0) {
      // 过滤出审批通过但未完成的预约
      const currentTime = new Date()
      todayRecords.value = result.data
        .filter(item => {
          // 只显示状态为approved且预约时间未过的记录
          if (item.status !== 'approved') return false
          
          // 检查预约时间是否未过
          const reservationTime = new Date(item.reservation_date + ' ' + (item.time_slot || '00:00'))
          return reservationTime > currentTime
        })
        .map(item => ({
          applicant: item.applicant || '未知',
          type: item.type === 'individual' ? '个人' : '团队',
          reason: item.purpose || '未填写',
          time: item.time_slot || '未设置'
        }))
    }
  } catch (error) {
    console.error('加载今日预约记录失败:', error)
    uni.showToast({
      title: '加载预约记录失败',
      icon: 'none'
    })
  }
}

// 加载图表数据
const loadChartData = async () => {
  try {
    // 加载小时流量数据
    const hourlyResult = await getHourlyTraffic()
    if (hourlyResult && hourlyResult.code === 0) {
      chartData.value.hourly = hourlyResult.data
      drawLineChart('todayChart', chartData.value.hourly, 'hourly')
    }
    
    // 加载周流量数据
    const weeklyResult = await getWeeklyTraffic()
    if (weeklyResult && weeklyResult.code === 0) {
      chartData.value.weekly = weeklyResult.data
      drawLineChart('weekChart', chartData.value.weekly, 'weekly')
    }
  } catch (error) {
    console.error('加载图表数据失败:', error)
  }
}

// 绘制仪表盘
const drawGauge = (canvasId, value, maxValue = 100, label) => {
  const ctx = uni.createCanvasContext(canvasId)
  const centerX = 75
  const centerY = 75
  const radius = 60
  const startAngle = -Math.PI
  const endAngle = 0
  const currentAngle = startAngle + (endAngle - startAngle) * (value / maxValue)
  
  // 清除画布
  ctx.clearRect(0, 0, 150, 150)
  
  // 绘制背景圆弧
  ctx.beginPath()
  ctx.arc(centerX, centerY, radius, startAngle, endAngle)
  ctx.setStrokeStyle('#e0e0e0')
  ctx.setLineWidth(8)
  ctx.stroke()
  
  // 绘制进度圆弧
  ctx.beginPath()
  ctx.arc(centerX, centerY, radius, startAngle, currentAngle)
  ctx.setStrokeStyle('#00d4ff')
  ctx.setLineWidth(8)
  ctx.setLineCap('round')
  ctx.stroke()
  
  // 绘制中心数值
  ctx.setFontSize(24)
  ctx.setFillStyle('#00d4ff')
  ctx.setTextAlign('center')
  ctx.fillText(value.toString(), centerX, centerY + 5)
  
  // 绘制标签
  ctx.setFontSize(14)
  ctx.setFillStyle('#666')
  ctx.fillText(label, centerX, centerY + 30)
  
  ctx.draw()
}

// 绘制折线图
const drawLineChart = (canvasId, data, type) => {
  const ctx = uni.createCanvasContext(canvasId)
  const width = 280
  const height = 120
  const padding = 25
  const chartWidth = width - 2 * padding
  const chartHeight = height - 2 * padding
  
  // 清除画布
  ctx.clearRect(0, 0, width, height)
  
  if (!data || data.length === 0) {
    // 绘制无数据提示
    ctx.setFontSize(16)
    ctx.setFillStyle('#999')
    ctx.setTextAlign('center')
    ctx.fillText('暂无数据', width / 2, height / 2)
    ctx.draw()
    return
  }
  
  // 准备数据
  let labels, values
  if (type === 'hourly') {
    labels = data.map(item => item.hour + ':00')
    values = data.map(item => item.reservations || 0)
  } else {
    labels = ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
    values = data.map(item => item.reservations || 0)
  }
  
  const maxValue = Math.max(...values, 1)
  const stepX = chartWidth / (labels.length - 1)
  
  // 绘制坐标轴
  ctx.setStrokeStyle('#e0e0e0')
  ctx.setLineWidth(1)
  
  // X轴
  ctx.beginPath()
  ctx.moveTo(padding, height - padding)
  ctx.lineTo(width - padding, height - padding)
  ctx.stroke()
  
  // Y轴
  ctx.beginPath()
  ctx.moveTo(padding, padding)
  ctx.lineTo(padding, height - padding)
  ctx.stroke()
  
  // 绘制标签
  ctx.setFontSize(10)
  ctx.setFillStyle('#666')
  ctx.setTextAlign('center')
  
  labels.forEach((label, index) => {
    const x = padding + index * stepX
    ctx.fillText(label, x, height - 8)
  })
  
  // 绘制折线
  ctx.beginPath()
  ctx.setStrokeStyle('#00d4ff')
  ctx.setLineWidth(2)
  
  values.forEach((value, index) => {
    const x = padding + index * stepX
    const y = height - padding - (value / maxValue) * chartHeight
    
    if (index === 0) {
      ctx.moveTo(x, y)
    } else {
      ctx.lineTo(x, y)
    }
  })
  
  ctx.stroke()
  
  // 绘制数据点
  values.forEach((value, index) => {
    const x = padding + index * stepX
    const y = height - padding - (value / maxValue) * chartHeight
    
    ctx.beginPath()
    ctx.arc(x, y, 3, 0, 2 * Math.PI)
    ctx.setFillStyle('#00d4ff')
    ctx.fill()
  })
  
  ctx.draw()
}

// 更新仪表盘
const updateGauges = () => {
  drawGauge('pendingGauge', todayStats.value.pending, 100, '待入校')
  drawGauge('enteredGauge', todayStats.value.entered, 100, '已入校')
}

// 初始化图表
const initCharts = () => {
  // 初始化仪表盘
  updateGauges()
  
  // 初始化折线图（使用模拟数据）
  const mockHourlyData = [
    { hour: 8, reservations: 12 },
    { hour: 10, reservations: 25 },
    { hour: 12, reservations: 45 },
    { hour: 14, reservations: 68 },
    { hour: 16, reservations: 42 },
    { hour: 18, reservations: 28 }
  ]
  
  const mockWeeklyData = [
    { reservations: 320 },
    { reservations: 280 },
    { reservations: 350 },
    { reservations: 420 },
    { reservations: 480 },
    { reservations: 380 },
    { reservations: 290 }
  ]
  
  drawLineChart('todayChart', mockHourlyData, 'hourly')
  drawLineChart('weekChart', mockWeeklyData, 'weekly')
}

// 刷新数据
const refreshData = async () => {
  uni.showLoading({ title: '刷新中...' })
  try {
    await Promise.all([
      loadDashboardStats(),
      loadTodayReservations(),
      loadChartData()
    ])
    uni.showToast({
      title: '数据已刷新',
      icon: 'success'
    })
  } catch (error) {
    uni.showToast({
      title: '刷新失败',
      icon: 'none'
    })
  } finally {
    uni.hideLoading()
  }
}

// 生命周期钩子
onMounted(() => {
  updateTime()
  timeInterval = setInterval(updateTime, 1000)
  
  // 使用nextTick确保DOM完全渲染后再初始化图表
  nextTick(() => {
    setTimeout(() => {
      try {
        initCharts()
        // 初始化加载数据
        loadDashboardStats()
        loadTodayReservations()
        loadChartData()
      } catch (error) {
        console.error('图表初始化失败:', error)
        uni.showToast({
          title: '图表加载失败',
          icon: 'none'
        })
      }
    }, 300)
  })
})

onUnmounted(() => {
  if (timeInterval) {
    clearInterval(timeInterval)
  }
})
</script>

<style scoped>
.screen-container {
  width: 100vw;
  height: 100vh;
  background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
  padding: 16rpx;
  color: white;
  display: flex;
  flex-direction: column;
  font-family: 'PingFang SC', 'Microsoft YaHei', Arial, sans-serif;
  overflow: hidden;
  box-sizing: border-box;
}

/* 顶部标题区域 */
.header-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;
  padding: 20rpx;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 16rpx;
  backdrop-filter: blur(20rpx);
  flex-shrink: 0;
}

.header-left {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.screen-title {
  font-size: 36rpx;
  font-weight: 700;
  color: white;
  letter-spacing: 1rpx;
}

.current-time {
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.8);
  font-weight: 500;
}

.back-button {
  display: flex;
  align-items: center;
  gap: 8rpx;
  padding: 16rpx 24rpx;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 12rpx;
  font-size: 28rpx;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.3s;
}

.back-button:hover {
  background: rgba(255, 255, 255, 0.3);
}

/* 数据概览区域 */
.data-overview {
  display: flex;
  gap: 20rpx;
  margin-bottom: 20rpx;
  flex-shrink: 0;
}

.left-cards {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.right-gauges {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.stat-card {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 16rpx;
  padding: 20rpx;
  backdrop-filter: blur(20rpx);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.stat-card.main-card {
  background: rgba(0, 50, 100, 0.9);
  border: 2px solid rgba(0, 212, 255, 0.6);
  box-shadow: 0 0 20rpx rgba(0, 212, 255, 0.5);
}

.gauge-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 16rpx;
  padding: 16rpx;
  backdrop-filter: blur(20rpx);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.gauge-chart {
  width: 150px;
  height: 100px;
}

.gauge-label {
  font-size: 28rpx;
  color: rgba(255, 255, 255, 0.9);
  margin-top: 8rpx;
  text-align: center;
  font-weight: 600;
}

.stat-number {
  font-size: 48rpx;
  font-weight: 700;
  color: #00d4ff;
  display: block;
  margin-bottom: 8rpx;
  text-shadow: 0 0 12rpx rgba(0, 212, 255, 0.5);
}

.stat-label {
  font-size: 28rpx;
  color: rgba(255, 255, 255, 0.9);
  display: block;
  font-weight: 600;
}

/* 图表区域 */
.charts-section {
  display: flex;
  gap: 20rpx;
  margin-bottom: 20rpx;
  flex-shrink: 0;
}

.chart-panel {
  flex: 1;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 16rpx;
  padding: 20rpx;
  backdrop-filter: blur(20rpx);
  border: 1px solid rgba(255, 255, 255, 0.2);
  display: flex;
  flex-direction: column;
}

.chart-header {
  margin-bottom: 16rpx;
}

.chart-title {
  font-size: 28rpx;
  font-weight: 600;
  color: white;
}

.chart-container {
  flex: 1;
  width: 100%;
  min-height: 120px;
}

/* 记录区域 */
.records-section {
  flex: 1;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 16rpx;
  padding: 20rpx;
  backdrop-filter: blur(20rpx);
  border: 1px solid rgba(255, 255, 255, 0.2);
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.records-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16rpx;
  flex-shrink: 0;
}

.section-title {
  font-size: 32rpx;
  font-weight: 600;
  color: white;
}

.refresh-btn {
  display: flex;
  align-items: center;
  gap: 8rpx;
  padding: 12rpx 20rpx;
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: none;
  border-radius: 12rpx;
  font-size: 24rpx;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.3s;
}

.refresh-btn:hover {
  background: rgba(255, 255, 255, 0.3);
}

.records-list {
  flex: 1;
  min-height: 0;
}

.record-item {
  padding: 16rpx;
  margin-bottom: 12rpx;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12rpx;
  border-left: 6rpx solid #00d4ff;
}

.item-main {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8rpx;
}

.applicant-name {
  font-size: 30rpx;
  font-weight: 600;
  color: white;
}

.record-type {
  font-size: 24rpx;
  padding: 4rpx 12rpx;
  background: rgba(0, 212, 255, 0.3);
  color: #00d4ff;
  border-radius: 12rpx;
  font-weight: 600;
}

.item-details {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.record-reason {
  font-size: 26rpx;
  color: rgba(255, 255, 255, 0.8);
  font-weight: 500;
}

.record-time {
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.6);
  font-weight: 500;
}

.empty-records {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200rpx;
}

.empty-text {
  font-size: 28rpx;
  color: rgba(255, 255, 255, 0.6);
  font-weight: 500;
}
</style>