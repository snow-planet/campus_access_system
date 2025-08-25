<template>
  <div class="dashboard-container">
    <!-- 顶部标题区域 -->
    <div class="header-section">
      <h1>校园出入预约平台·数据大屏</h1>
      <div class="header-right">
        <div class="datetime-display">
          <div class="date">{{ currentDate }}</div>
          <div class="time">{{ currentTime }}</div>
        </div>
        <div class="back-button" @click="goBack">
          <span class="back-icon">←</span>
          <span class="back-text">返回平台</span>
        </div>
      </div>
    </div>

    <!-- 主体内容区域 -->
    <main class="main-content">
      <!-- 左侧信息展示区 -->
      <aside class="left-panel">
        <!-- 今日人流量统计 -->
        <div class="chart-panel">
          <h3>今日人流量统计 (24小时)</h3>
          <div id="todayTrafficChart" style="width: 100%; height: 90%;"></div>
        </div>

        <!-- 本周人流量统计 -->
        <div class="chart-panel">
          <h3>本周人流量统计</h3>
          <div id="weekTrafficChart" style="width: 100%; height: 90%;"></div>
        </div>

        <!-- 本月人流量统计 -->
        <div class="chart-panel">
          <h3>本月人流量统计</h3>
          <div id="monthTrafficChart" style="width: 100%; height: 90%;"></div>
        </div>
      </aside>

      <!-- 中央主显示区 -->
      <section class="center-panel">
        <!-- 数据统计树状图 -->
        <div class="stats-tree">
          <!-- 根节点 -->
          <div class="tree-root">
            <div class="stat-card main-panel root-card">
              <h4>今日预约次数</h4>
              <div class="stat-number">128</div>
            </div>
          </div>
          
          <!-- 连接线 -->
          <div class="tree-lines">
            <div class="vertical-line"></div>
            <div class="horizontal-line"></div>
            <div class="branch-line branch-left"></div>
            <div class="branch-line branch-center"></div>
            <div class="branch-line branch-right"></div>
          </div>
          
          <!-- 子节点 -->
          <div class="tree-children">
            <div class="stat-card child-card">
              <h4>今日待入校</h4>
              <div class="stat-number">42</div>
            </div>
            
            <div class="stat-card child-card">
              <h4>今日已入校</h4>
              <div class="stat-number">76</div>
            </div>
            
            <div class="stat-card child-card">
              <h4>今日已离校</h4>
              <div class="stat-number">58</div>
            </div>
          </div>
        </div>

        <!-- 今日预约记录显示栏 -->
        <div class="records-panel main-panel">
          <div class="records-header">
            <h3>今日预约记录</h3>
          </div>
          <div class="records-content">
            <table class="records-table">
              <thead>
                <tr>
                  <th>申请人</th>
                  <th>预约类型</th>
                  <th>事由</th>
                  <th>预约日期</th>
                  <th>时间段</th>
                  <th>车牌号</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>张三</td>
                  <td>个人</td>
                  <td>参加学术讲座</td>
                  <td>2025/8/21</td>
                  <td>14:00 - 16:00</td>
                  <td>京A12345</td>
                </tr>
                <tr>
                  <td>李四</td>
                  <td>访客</td>
                  <td>拜访教授</td>
                  <td>2025/8/21</td>
                  <td>09:30 - 11:00</td>
                  <td>京B56789</td>
                </tr>
                <tr>
                  <td>王五</td>
                  <td>公务</td>
                  <td>部门会议</td>
                  <td>2025/8/21</td>
                  <td>13:00 - 17:00</td>
                  <td>京C24680</td>
                </tr>
                <tr>
                  <td>赵六</td>
                  <td>个人</td>
                  <td>图书馆借阅</td>
                  <td>2025/8/21</td>
                  <td>10:00 - 12:00</td>
                  <td>京D13579</td>
                </tr>
                <tr>
                  <td>钱七</td>
                  <td>供应商</td>
                  <td>设备维修</td>
                  <td>2025/8/21</td>
                  <td>14:30 - 16:30</td>
                  <td>京E11223</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <!-- 右侧功能区域 -->
      <aside class="right-panel">
        <!-- 提醒通知面板 -->
        <div class="notification-panel">
          <h3>提醒通知</h3>
          <div class="notification-content">
            <div class="notification-item">
              <span class="priority-badge high">紧急</span>
              <div class="notification-details">
                <div class="notification-text">今日14:00-16:00东门将有大型活动，请注意疏导交通</div>
                <div class="notification-info">系统管理员 · 10分钟前</div>
              </div>
            </div>
            <div class="notification-item">
              <span class="priority-badge">一般</span>
              <div class="notification-details">
                <div class="notification-text">北门入口闸机维护完成，已恢复正常使用</div>
                <div class="notification-info">后勤部 · 今天 09:30</div>
              </div>
            </div>
            <div class="notification-item">
              <span class="priority-badge">一般</span>
              <div class="notification-details">
                <div class="notification-text">预约系统将于今晚23:00-24:00进行例行维护</div>
                <div class="notification-info">IT支持 · 今天 08:45</div>
              </div>
            </div>
          </div>
        </div>

        <!-- 公告栏 -->
        <div class="announcement-panel">
          <h3>公告栏</h3>
          <div class="announcement-content">
            <div class="announcement-scroll">
              <div class="announcement-item">
                <div class="announcement-header">
                  <div class="announcement-title high-priority">重要通知</div>
                  <div class="announcement-date">2025/8/20</div>
                </div>
                <div class="announcement-content-text">根据学校安排，9月1日起将启用新的入校预约审批流程，请相关人员提前熟悉新流程。</div>
                <div class="announcement-author">发布人：校办</div>
              </div>
              <div class="announcement-item">
                <div class="announcement-header">
                  <div class="announcement-title normal-priority">温馨提示</div>
                  <div class="announcement-date">2025/8/19</div>
                </div>
                <div class="announcement-content-text">近期多有降雨，请预约入校的师生注意交通安全，减速慢行。</div>
                <div class="announcement-author">发布人：保卫处</div>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </main>
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted } from 'vue'
import * as echarts from 'echarts'

export default {
  name: 'DashboardScreen',
  setup() {
    const currentDate = ref('')
    const currentTime = ref('')
    let dateTimeInterval = null
    let todayChart = null
    let weekChart = null
    let monthChart = null

    // 返回功能
    const goBack = () => {
      const returnPage = localStorage.getItem('dashboard_return_page')
      if (returnPage === 'guard') {
        window.location.href = '/admin/home'
      } else {
        // 默认返回首页
        window.location.href = '/admin/home'
      }
    }

    // 实时时间更新
    const updateDateTime = () => {
      const now = new Date()
      currentDate.value = now.toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      })
      currentTime.value = now.toLocaleTimeString('zh-CN', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      })
    }

    // 初始化今日人流量统计图表
    const initTodayChart = () => {
      const chartDom = document.getElementById('todayTrafficChart')
      if (!chartDom) return
      
      todayChart = echarts.init(chartDom)
      const option = {
        backgroundColor: 'transparent',
        grid: {
          left: '10%',
          right: '10%',
          top: '15%',
          bottom: '15%'
        },
        xAxis: {
          type: 'category',
          data: ['00:00', '02:00', '04:00', '06:00', '08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00', '22:00'],
          axisLine: {
            lineStyle: {
              color: 'rgba(0, 212, 255, 0.5)'
            }
          },
          axisLabel: {
            color: 'rgba(255, 255, 255, 0.7)',
            fontSize: 10
          }
        },
        yAxis: [
          {
            type: 'value',
            name: '预约数',
            position: 'left',
            axisLine: {
              lineStyle: {
                color: 'rgba(0, 212, 255, 0.5)'
              }
            },
            axisLabel: {
              color: 'rgba(255, 255, 255, 0.7)',
              fontSize: 10
            },
            splitLine: {
              lineStyle: {
                color: 'rgba(0, 212, 255, 0.2)'
              }
            }
          },
          {
            type: 'value',
            name: '预约人次',
            position: 'right',
            axisLine: {
              lineStyle: {
                color: 'rgba(0, 255, 136, 0.5)'
              }
            },
            axisLabel: {
              color: 'rgba(255, 255, 255, 0.7)',
              fontSize: 10
            }
          }
        ],
        series: [
          {
            name: '预约数',
            type: 'line',
            yAxisIndex: 0,
            data: [12, 8, 15, 25, 45, 68, 82, 95, 78, 65, 42, 28],
            areaStyle: {
              color: {
                type: 'linear',
                x: 0,
                y: 0,
                x2: 0,
                y2: 1,
                colorStops: [
                  { offset: 0, color: 'rgba(0, 50, 100, 0.8)' },
                  { offset: 1, color: 'rgba(0, 50, 100, 0.1)' }
                ]
              }
            },
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
            yAxisIndex: 1,
            data: [18, 12, 22, 38, 68, 102, 125, 142, 118, 98, 65, 42],
            lineStyle: {
              color: '#00ff88',
              width: 3,
              shadowColor: 'rgba(0, 255, 136, 0.5)',
              shadowBlur: 10
            },
            itemStyle: {
              color: '#00ff88',
              shadowColor: 'rgba(0, 255, 136, 0.8)',
              shadowBlur: 8
            },
            symbol: 'circle',
            symbolSize: 6
          }
        ],
        legend: {
          data: ['预约数', '预约人次'],
          textStyle: {
            color: 'rgba(255, 255, 255, 0.8)',
            fontSize: 10
          },
          top: '5%'
        },
        tooltip: {
          trigger: 'axis',
          backgroundColor: 'rgba(0, 30, 60, 0.9)',
          borderColor: 'rgba(0, 212, 255, 0.5)',
          textStyle: {
            color: '#fff',
            fontSize: 12
          }
        }
      }
      todayChart.setOption(option)
    }

    // 初始化本周人流量统计图表
    const initWeekChart = () => {
      const chartDom = document.getElementById('weekTrafficChart')
      if (!chartDom) return
      
      weekChart = echarts.init(chartDom)
      const option = {
        backgroundColor: 'transparent',
        grid: {
          left: '10%',
          right: '10%',
          top: '15%',
          bottom: '15%'
        },
        xAxis: {
          type: 'category',
          data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
          axisLine: {
            lineStyle: {
              color: 'rgba(0, 212, 255, 0.5)'
            }
          },
          axisLabel: {
            color: 'rgba(255, 255, 255, 0.7)',
            fontSize: 10
          }
        },
        yAxis: [
          {
            type: 'value',
            name: '预约数',
            position: 'left',
            axisLine: {
              lineStyle: {
                color: 'rgba(0, 212, 255, 0.5)'
              }
            },
            axisLabel: {
              color: 'rgba(255, 255, 255, 0.7)',
              fontSize: 10
            },
            splitLine: {
              lineStyle: {
                color: 'rgba(0, 212, 255, 0.2)'
              }
            }
          },
          {
            type: 'value',
            name: '预约人次',
            position: 'right',
            axisLine: {
              lineStyle: {
                color: 'rgba(0, 255, 136, 0.5)'
              }
            },
            axisLabel: {
              color: 'rgba(255, 255, 255, 0.7)',
              fontSize: 10
            }
          }
        ],
        series: [
          {
            name: '预约数',
            type: 'line',
            yAxisIndex: 0,
            data: [320, 280, 350, 420, 480, 380, 290],
            areaStyle: {
              color: {
                type: 'linear',
                x: 0,
                y: 0,
                x2: 0,
                y2: 1,
                colorStops: [
                  { offset: 0, color: 'rgba(0, 50, 100, 0.8)' },
                  { offset: 1, color: 'rgba(0, 50, 100, 0.1)' }
                ]
              }
            },
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
            yAxisIndex: 1,
            data: [485, 425, 528, 635, 725, 575, 438],
            lineStyle: {
              color: '#00ff88',
              width: 3,
              shadowColor: 'rgba(0, 255, 136, 0.5)',
              shadowBlur: 10
            },
            itemStyle: {
              color: '#00ff88',
              shadowColor: 'rgba(0, 255, 136, 0.8)',
              shadowBlur: 8
            },
            symbol: 'circle',
            symbolSize: 6
          }
        ],
        legend: {
          data: ['预约数', '预约人次'],
          textStyle: {
            color: 'rgba(255, 255, 255, 0.8)',
            fontSize: 10
          },
          top: '5%'
        },
        tooltip: {
          trigger: 'axis',
          backgroundColor: 'rgba(0, 30, 60, 0.9)',
          borderColor: 'rgba(0, 212, 255, 0.5)',
          textStyle: {
            color: '#fff',
            fontSize: 12
          }
        }
      }
      weekChart.setOption(option)
    }

    // 初始化本月人流量统计图表
    const initMonthChart = () => {
      const chartDom = document.getElementById('monthTrafficChart')
      if (!chartDom) return
      
      monthChart = echarts.init(chartDom)
      const option = {
        backgroundColor: 'transparent',
        grid: {
          left: '10%',
          right: '10%',
          top: '15%',
          bottom: '15%'
        },
        xAxis: {
          type: 'category',
          data: ['1日', '5日', '10日', '15日', '20日', '25日', '30日'],
          axisLine: {
            lineStyle: {
              color: 'rgba(0, 212, 255, 0.5)'
            }
          },
          axisLabel: {
            color: 'rgba(255, 255, 255, 0.7)',
            fontSize: 10
          }
        },
        yAxis: [
          {
            type: 'value',
            name: '预约数',
            position: 'left',
            axisLine: {
              lineStyle: {
                color: 'rgba(0, 212, 255, 0.5)'
              }
            },
            axisLabel: {
              color: 'rgba(255, 255, 255, 0.7)',
              fontSize: 10
            },
            splitLine: {
              lineStyle: {
                color: 'rgba(0, 212, 255, 0.2)'
              }
            }
          },
          {
            type: 'value',
            name: '预约人次',
            position: 'right',
            axisLine: {
              lineStyle: {
                color: 'rgba(0, 255, 136, 0.5)'
              }
            },
            axisLabel: {
              color: 'rgba(255, 255, 255, 0.7)',
              fontSize: 10
            }
          }
        ],
        series: [
          {
            name: '预约数',
            type: 'line',
            yAxisIndex: 0,
            data: [1250, 1380, 1520, 1680, 1850, 1920, 2100],
            areaStyle: {
              color: {
                type: 'linear',
                x: 0,
                y: 0,
                x2: 0,
                y2: 1,
                colorStops: [
                  { offset: 0, color: 'rgba(0, 50, 100, 0.8)' },
                  { offset: 1, color: 'rgba(0, 50, 100, 0.1)' }
                ]
              }
            },
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
            yAxisIndex: 1,
            data: [1890, 2085, 2295, 2535, 2795, 2900, 3175],
            lineStyle: {
              color: '#00ff88',
              width: 3,
              shadowColor: 'rgba(0, 255, 136, 0.5)',
              shadowBlur: 10
            },
            itemStyle: {
              color: '#00ff88',
              shadowColor: 'rgba(0, 255, 136, 0.8)',
              shadowBlur: 8
            },
            symbol: 'circle',
            symbolSize: 6
          }
        ],
        legend: {
          data: ['预约数', '预约人次'],
          textStyle: {
            color: 'rgba(255, 255, 255, 0.8)',
            fontSize: 10
          },
          top: '5%'
        },
        tooltip: {
          trigger: 'axis',
          backgroundColor: 'rgba(0, 30, 60, 0.9)',
          borderColor: 'rgba(0, 212, 255, 0.5)',
          textStyle: {
            color: '#fff',
            fontSize: 12
          }
        }
      }
      monthChart.setOption(option)
    }

    onMounted(() => {
      // 初始化时间显示
      updateDateTime()
      dateTimeInterval = setInterval(updateDateTime, 1000)
      
      // 延迟初始化图表，确保DOM已渲染
      setTimeout(() => {
        initTodayChart()
        initWeekChart()
        initMonthChart()
      }, 100)
    })

    onUnmounted(() => {
      // 清除定时器
      if (dateTimeInterval) {
        clearInterval(dateTimeInterval)
      }
      // 销毁图表实例
      if (todayChart) {
        todayChart.dispose()
      }
      if (weekChart) {
        weekChart.dispose()
      }
      if (monthChart) {
        monthChart.dispose()
      }
    })

    return {
      currentDate,
      currentTime,
      goBack
    }
  }
}
</script>

<style scoped>
/* global */
* {margin:0;padding:0;box-sizing:border-box;}
html, body {
	width:100%;
	height:100%;
	min-width:1200px;
	min-height:600px;
	overflow:hidden;
}
body {
	position:relative;
	font-family:"Microsoft Yahei", Arial, sans-serif;
	background: 
        url('../../assets/background.jpg') center center / cover no-repeat fixed,
        linear-gradient(135deg, rgba(33, 39, 56, 0.9), rgba(45, 55, 75, 0.8));
    background-blend-mode: overlay;
}

/* 整体容器 */
.dashboard-container {
    width: 100vw;
    height: 100vh;
    background: 
        url('../../assets/background.jpg') center center / cover no-repeat fixed,
        linear-gradient(135deg, rgba(33, 39, 56, 0.95), rgba(45, 55, 75, 0.9));
    background-blend-mode: overlay;
    position: relative;
    display: flex;
    flex-direction: column;
    backdrop-filter: blur(1px);
}

/* 顶部标题区域 */
.header-section {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 15px 30px;
    background: 
        url('../../assets/footer.png') center center / cover no-repeat,
        rgba(0, 0, 0, 0.2);
    background-blend-mode: overlay;
    border-bottom: 1px solid rgba(0, 212, 255, 0.3);
}

.header-section h1 {
    font-size: 24px;
    font-weight: bold;
    color: #00d4ff;
    text-shadow: 0 0 10px rgba(0, 212, 255, 0.5);
    letter-spacing: 2px;
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
}

.header-right {
    display: flex;
    align-items: center;
    gap: 20px;
    margin-left: auto;
}

.datetime-display {
    display: flex;
    align-items: center;
    gap: 10px;
}

.datetime-display .date {
    font-size: 16px;
    color: #fff;
}

.datetime-display .time {
    font-size: 18px;
    color: #00d4ff;
    font-weight: bold;
    text-shadow: 0 0 8px rgba(0, 212, 255, 0.6);
}

.back-button {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 16px;
    background: 
        url('../../assets/leave.png') center center / contain no-repeat,
        rgba(0, 50, 100, 0.6);
    background-blend-mode: overlay;
    border: 1px solid rgba(0, 150, 255, 0.3);
    border-radius: 5px;
    color: #fff;
    cursor: pointer;
    transition: all 0.3s ease;
    font-size: 14px;
}

.back-button:hover {
    background: rgba(0, 100, 200, 0.8);
    border-color: rgba(0, 212, 255, 0.6);
    transform: translateY(-2px);
}

.back-icon {
    font-size: 18px;
    font-weight: bold;
}

.back-text {
    font-size: 14px;
}

/* 主体内容区域 */
.main-content {
    height: calc(100vh - 80px);
    display: grid;
    grid-template-columns: 3fr 4fr 3fr;
    gap: 20px;
    padding: 20px;
    overflow: hidden;
    box-sizing: border-box;
}

/* 左侧面板 */
.left-panel {
    display: flex;
    flex-direction: column;
    gap: 15px;
    overflow: hidden;
}

.chart-panel {
    background: 
        url('../../assets/panel.png') center center / cover no-repeat,
        linear-gradient(135deg, rgba(0, 30, 60, 0.8), rgba(0, 50, 100, 0.6));
    background-blend-mode: overlay;
    border-radius: 12px;
    padding: 15px;
    flex: 1;
    height: calc((100vh - 140px) / 3 - 10px);
    backdrop-filter: blur(8px);
    border: 2px solid rgba(0, 150, 255, 0.4);
    box-shadow: 
        0 0 20px rgba(0, 212, 255, 0.3),
        inset 0 0 20px rgba(0, 212, 255, 0.1);
    overflow: hidden;
    box-sizing: border-box;
    position: relative;
    transition: all 0.3s ease;
}

.chart-panel:hover {
    border-color: rgba(0, 212, 255, 0.6);
    box-shadow: 
        0 0 30px rgba(0, 212, 255, 0.5),
        inset 0 0 30px rgba(0, 212, 255, 0.15);
    transform: translateY(-2px);
}

.chart-panel h3 {
    font-size: 14px;
    color: #00d4ff;
    margin-bottom: 10px;
    text-align: center;
    text-shadow: 0 0 8px rgba(0, 212, 255, 0.8);
    font-weight: bold;
    letter-spacing: 1px;
}

/* 中央面板 */
.center-panel {
    display: flex;
    flex-direction: column;
    gap: 10px;
    height: calc(100vh - 120px);
    box-sizing: border-box;
}

/* 数据统计树状图 */
.stats-tree {    
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 150px;
    padding: 10px 0;
    overflow: hidden;
}

.tree-root {
    display: flex;
    justify-content: center;
    margin-bottom: 20px;
}

.root-card {
    width: 180px;
    padding: 10px;
}

.tree-lines {
    position: absolute;
    top: 80px;
    left: 50%;
    transform: translateX(-50%);
    width: 80%;
    height: 60px;
}

.vertical-line {
    position: absolute;
    top: 20px;
    left: 50%;
    transform: translateX(-50%);
    width: 2px;
    height: 20px;
    background: linear-gradient(180deg, #00d4ff 0%, rgba(0, 212, 255, 0.6) 100%);
    box-shadow: 0 0 5px rgba(0, 212, 255, 0.8);
}

.horizontal-line {
    position: absolute;
    top: 38px;
    left: 20%;
    width: 60%;
    height: 2px;
    background: linear-gradient(90deg, rgba(0, 212, 255, 0.6) 0%, #00d4ff 50%, rgba(0, 212, 255, 0.6) 100%);
    box-shadow: 0 0 5px rgba(0, 212, 255, 0.8);
}

.branch-line {
    position: absolute;
    top: 40px;
    width: 2px;
    height: 30px;
    background: linear-gradient(180deg, #00d4ff 0%, rgba(0, 212, 255, 0.6) 100%);
    box-shadow: 0 0 5px rgba(0, 212, 255, 0.8);
}

.branch-left {
    left: 20%;
    transform: translateX(-50%);
}

.branch-center {
    left: 50%;
    transform: translateX(-50%);
}

.branch-right {
    left: 80%;
    transform: translateX(-50%);
}

.tree-children {
    display: flex;
    justify-content: space-between;
    width: 100%;
    padding: 0 10px;
}

.child-card {
    width: 150px;
    padding: 10px;
}

.stat-card {
    background: rgba(0, 50, 100, 0.9);
    border-radius: 8px;
    padding: 15px;
    text-align: center;
    border: 1px solid rgba(0, 150, 255, 0.2);
    backdrop-filter: blur(5px);
    position: relative;
    overflow: hidden;
}

.stat-card.main-panel {
    background: 
        url('../../assets/main_panel.png') center center / cover no-repeat,
        linear-gradient(135deg, rgba(0, 50, 100, 0.9), rgba(0, 80, 150, 0.7));
    background-blend-mode: overlay;
    border: 3px solid rgba(0, 212, 255, 0.6);
    box-shadow: 
        0 0 25px rgba(0, 212, 255, 0.5),
        inset 0 0 25px rgba(0, 212, 255, 0.2),
        0 0 50px rgba(0, 212, 255, 0.3);
    position: relative;
    overflow: hidden;
}

.stat-card.main-panel::before {
    content: '';
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: linear-gradient(45deg, transparent, rgba(0, 212, 255, 0.1), transparent);
    animation: mainPanelScan 3s linear infinite;
    pointer-events: none;
}

@keyframes mainPanelScan {
    0% {
        transform: translateX(-100%) translateY(-100%) rotate(45deg);
    }
    100% {
        transform: translateX(100%) translateY(100%) rotate(45deg);
    }
}

.stat-card h4 {
    font-size: 12px;
    color: #00d4ff;
    margin-bottom: 5px;
    text-shadow: 0 0 5px rgba(0, 212, 255, 0.5);
}

.stat-number {
    font-size: 24px;
    font-weight: bold;
    color: #fff;
    margin-bottom: 5px;
    text-shadow: 0 0 10px rgba(255, 255, 255, 0.5);
}

/* 今日预约记录面板 */
.records-panel {
    height: calc((100vh - 120px) * 0.7 - 20px);
    background: 
        url('../../assets/main_panel.png') center center / cover no-repeat,
        linear-gradient(135deg, rgba(0, 50, 100, 0.9), rgba(0, 80, 150, 0.7));
    background-blend-mode: overlay;
    border-radius: 12px;
    padding: 20px;
    border: 3px solid rgba(0, 212, 255, 0.5);
    box-shadow: 
        0 0 25px rgba(0, 212, 255, 0.4),
        inset 0 0 20px rgba(0, 212, 255, 0.15);
    backdrop-filter: blur(8px);
    overflow: hidden;
    box-sizing: border-box;
    position: relative;
    transition: all 0.3s ease;
}

.records-panel:hover {
    border-color: rgba(0, 212, 255, 0.7);
    box-shadow: 
        0 0 35px rgba(0, 212, 255, 0.6),
        inset 0 0 25px rgba(0, 212, 255, 0.2);
}

.records-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 15px;
}

.records-header h3 {
    font-size: 15px;
    color: #00d4ff;
    text-shadow: 0 0 5px rgba(0, 212, 255, 0.5);
}

.records-content {
    height: calc(100% - 40px);
    overflow-y: auto;
    overflow-x: hidden;
}

.records-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 12px;
    table-layout: fixed;
}

.records-table th {
    background: rgba(0, 50, 100, 0.8);
    color: #00d4ff;
    padding: 10px 8px;
    text-align: left;
    border-bottom: 1px solid rgba(0, 150, 255, 0.3);
    text-shadow: 0 0 5px rgba(0, 212, 255, 0.5);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.records-table td {
    padding: 8px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    color: rgba(255, 255, 255, 0.9);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.records-table tbody tr:hover {
    background: rgba(0, 100, 200, 0.3);
}

/* 右侧面板 */
.right-panel {
    display: flex;
    flex-direction: column;
    gap: 15px;
    height: calc(100vh - 120px);
    overflow: hidden;
    box-sizing: border-box;
}

.notification-panel,
.announcement-panel {
    background: 
        url('../../assets/panel.png') center center / cover no-repeat,
        linear-gradient(135deg, rgba(0, 30, 60, 0.8), rgba(0, 50, 100, 0.6));
    background-blend-mode: overlay;
    border-radius: 12px;
    padding: 20px;
    height: calc((100vh - 150px) / 2 - 7.5px);
    border: 2px solid rgba(0, 150, 255, 0.4);
    backdrop-filter: blur(8px);
    box-shadow: 
        0 0 20px rgba(0, 212, 255, 0.3),
        inset 0 0 15px rgba(0, 212, 255, 0.1);
    overflow: hidden;
    box-sizing: border-box;
    position: relative;
    transition: all 0.3s ease;
}

.notification-panel:hover,
.announcement-panel:hover {
    border-color: rgba(0, 212, 255, 0.6);
    box-shadow: 
        0 0 30px rgba(0, 212, 255, 0.5),
        inset 0 0 20px rgba(0, 212, 255, 0.15);
    transform: translateY(-1px);
}

.notification-content {
    height: calc(100% - 40px);
    overflow-y: auto;
    overflow-x: hidden;
}

.notification-panel h3,
.announcement-panel h3 {
    font-size: 16px;
    color: #00d4ff;
    margin-bottom: 15px;
    text-align: center;
    text-shadow: 0 0 5px rgba(0, 212, 255, 0.5);
}

.notification-item {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    padding: 12px;
    margin-bottom: 10px;
    background: rgba(0, 30, 60, 0.4);
    border-radius: 8px;
    border-left: 3px solid rgba(0, 150, 255, 0.5);
    transition: all 0.3s ease;
}

.notification-item:hover {
    background: rgba(0, 30, 60, 0.6);
    transform: translateX(5px);
}

.notification-item.high-priority {
    border-left-color: #ff4444;
    background: rgba(60, 0, 0, 0.4);
}

.notification-item.high-priority:hover {
    background: rgba(60, 0, 0, 0.6);
}

.priority-badge {
    background: #1890ff;
    color: #fff;
    padding: 4px 8px;
    border-radius: 12px;
    font-size: 10px;
    font-weight: bold;
    min-width: 40px;
    text-align: center;
}

.priority-badge.high {
    background: #ff4444;
}

.notification-details {
    flex: 1;
}

.notification-text {
    font-size: 13px;
    color: rgba(255, 255, 255, 0.9);
    margin-bottom: 4px;
    font-weight: 500;
}

.notification-info {
    font-size: 11px;
    color: rgba(255, 255, 255, 0.6);
}

.announcement-content {
    height: calc(100% - 40px);
    overflow: hidden;
}

.announcement-scroll {
    height: 100%;
    overflow-y: auto;
    padding-right: 5px;
}

.announcement-item {
    padding: 12px;
    margin-bottom: 12px;
    background: rgba(0, 30, 60, 0.3);
    border-radius: 8px;
    border: 1px solid rgba(0, 150, 255, 0.1);
    transition: all 0.3s ease;
}

.announcement-item:hover {
    background: rgba(0, 30, 60, 0.5);
    border-color: rgba(0, 150, 255, 0.3);
}

.announcement-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;
}

.announcement-title {
    font-size: 14px;
    font-weight: bold;
    color: rgba(255, 255, 255, 0.9);
}

.announcement-title.high-priority {
    color: #ff6b35;
}

.announcement-title.normal-priority {
    color: #00d4ff;
}

.announcement-date {
    font-size: 11px;
    color: rgba(255, 255, 255, 0.6);
}

.announcement-content-text {
    font-size: 12px;
    color: rgba(255, 255, 255, 0.8);
    line-height: 1.5;
    margin-bottom: 8px;
    max-height: 60px;
    overflow: hidden;
    text-overflow: ellipsis;
}

.announcement-author {
    font-size: 10px;
    color: rgba(255, 255, 255, 0.5);
    text-align: right;
}

/* 滚动条样式 */
::-webkit-scrollbar {
    width: 6px;
}

::-webkit-scrollbar-track {
    background: rgba(0, 30, 60, 0.3);
}

::-webkit-scrollbar-thumb {
    background: rgba(0, 150, 255, 0.6);
    border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
    background: rgba(0, 212, 255, 0.8);
}

/* 动画效果 */
@keyframes glow {
    0%, 100% {
        text-shadow: 0 0 5px rgba(0, 212, 255, 0.5);
    }
    50% {
        text-shadow: 0 0 20px rgba(0, 212, 255, 0.8), 0 0 30px rgba(0, 212, 255, 0.6);
    }
}

.header-section h1 {
    animation: glow 3s ease-in-out infinite;
}
</style>