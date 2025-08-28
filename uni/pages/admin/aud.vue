<template>
  <view class="audit-management">
    <!-- 筛选模块 -->
    <view class="filter-section">
      <view class="filter-header">
        <text class="filter-title">审批信息筛选</text>
      </view>
      <view class="filter-controls">
        <view class="filter-row">
          <view class="filter-group">
            <text class="filter-label">类型：</text>
            <picker mode="selector" :range="typeOptions" :value="filters.typeIndex" @change="onTypeChange" class="filter-select">
              <view class="picker-text">{{ getTypeText(filters.type) }}</view>
            </picker>
          </view>
          
          <view class="filter-group">
            <text class="filter-label">状态：</text>
            <picker mode="selector" :range="statusOptions" :value="filters.statusIndex" @change="onStatusChange" class="filter-select">
              <view class="picker-text">{{ getStatusText(filters.status) }}</view>
            </picker>
          </view>
        </view>
        
        <view class="action-row">
          <view class="filter-actions">
			  <text class="filter-label">日期</text>
			  <input type="date" v-model="filters.date" class="filter-input">
          </view>
        
        <view class="filter-actions">
          <button class="search-btn" @click="loadReservations">
              <text style="color: #fff; font-size: 16px;">🔍 搜索</text>
            </button>
            <button class="reset-btn" @click="resetFilters">
              <text style="color: #666; font-size: 16px;">↻ 重置</text>
            </button>
        </view>

          <!-- 统计信息 -->
          <view class="stats-info">
            <view class="stat-item">
              <view class="stat-label">今日预约次数</view>
              <view class="stat-number">{{ stats.todayReservations }}</view>
            </view>
            <view class="stat-item">
              <view class="stat-label">今日预约人次:</view>
              <view class="stat-number">{{ stats.totalVisitors }}</view>
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- 审批信息列表 -->
    <view class="reservations-list">
      <view class="table-container">
        <view class="reservations-table">
          <view class="table-header">
            <view class="table-row">
              <view class="table-cell header-cell">预约编号</view>
              <view class="table-cell header-cell">申请人</view>
              <view class="table-cell header-cell">预约类型</view>
              <view class="table-cell header-cell">事由</view>
              <view class="table-cell header-cell">预约日期</view>
              <view class="table-cell header-cell">时间段</view>
              <view class="table-cell header-cell">出入口</view>
              <view class="table-cell header-cell">车牌号</view>
              <view class="table-cell header-cell">状态</view>
              <view class="table-cell header-cell">审批人</view>
              <view class="table-cell header-cell">查看工单</view>
            </view>
          </view>
          <view class="table-body">
            <view v-if="reservations.length === 0" class="table-row">
              <view class="table-cell empty-state" style="grid-column: 1 / -1;">
                <view class="empty-content">
                  <text style="color: #999; font-size: 24px;">🔍</text>
                  <text>暂无审批信息</text>
                </view>
              </view>
            </view>
            
            <view v-else v-for="reservation in reservations" :key="reservation.reservation_id" class="table-row reservation-row">
              <view class="table-cell">{{ reservation.reservation_id }}</view>
              <view class="table-cell applicant-info">
                <view class="applicant-name">{{ reservation.user_name }}</view>
                <view class="applicant-contact" v-if="reservation.type === 'group'">
                  {{ reservation.contact_name }} - {{ reservation.contact_phone }}
                </view>
              </view>
              <view class="table-cell">
                <text :class="['type-badge', reservation.type]">
                  {{ reservation.type === 'individual' ? '个人' : '团体' }}
                </text>
                <view v-if="reservation.type === 'group'" class="visitor-count">
                  {{ reservation.visitor_count }}人
                </view>
              </view>
              <view class="table-cell purpose-cell">{{ reservation.purpose }}</view>
              <view class="table-cell">{{ formatDate(reservation.visit_date) }}</view>
              <view class="table-cell">
                <view v-if="reservation.entry_time && reservation.exit_time">
                  {{ formatTime(reservation.entry_time) }} - {{ formatTime(reservation.exit_time) }}
                </view>
                <view v-else>全天</view>
              </view>
              <view class="table-cell">{{ reservation.gate }}</view>
              <view class="table-cell">{{ reservation.license_plate || '-' }}</view>
              <view class="table-cell">
                <text :class="['status-badge', reservation.status]">
                  {{ getStatusText(reservation.status) }}
                </text>
              </view>
              <view class="table-cell">{{ reservation.approver_name || '-' }}</view>
              <view class="table-cell">
                <view class="action-buttons">
                  <button class="view-btn" @click="viewDetails(reservation)" title="查看详情">
                    <text style="color: #666; font-size: 14px;">👁</text>
                  </button>
                  <button 
                    v-if="reservation.status === 'pending'" 
                    class="approve-btn" 
                    @click="approveReservation(reservation)"
                    title="通过审批"
                  >
                    <text style="color: #52c41a; font-size: 14px;">✓</text>
                  </button>
                  <button 
                    v-if="reservation.status === 'pending'" 
                    class="reject-btn" 
                    @click="rejectReservation(reservation)"
                    title="驳回申请"
                  >
                    <text style="color: #ff4d4f; font-size: 14px;">✗</text>
                  </button>
                </view>
              </view>
            </view>
          </view>
        </view>
      </view>
      
      <!-- 分页控件 -->
      <view class="pagination" v-if="reservations.length > 0">
        <view class="pagination-controls">
          <button class="page-btn" :disabled="currentPage === 1" @click="prevPage">
             <text style="color: #fff; font-size: 14px;">‹</text>
           </button>
           <text class="page-info">第 {{ currentPage }} 页 / 共 {{ totalPages }} 页</text>
           <button class="page-btn" :disabled="currentPage === totalPages" @click="nextPage">
             <text style="color: #fff; font-size: 14px;">›</text>
           </button>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { getAuditReservations, getAuditStats, auditAction } from '../../api/uniAdmin.js';

// 筛选条件 - 默认只显示今日已通过审批的信息
const filters = ref({
  type: 'all',
  status: 'approved', // 默认只显示已通过
  date: getTodayDate(), // 默认显示今日
  gate: 'all',
  typeIndex: 0,
  statusIndex: 1 // 对应已通过状态
});

// 选项数组
const typeOptions = ['全部类型', '个人预约', '团体预约'];
const statusOptions = ['全部状态', '已通过', '待审批', '已驳回', '已完成'];

// 获取今日日期
function getTodayDate() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// 分页信息
const currentPage = ref(1);
const pageSize = 10;
const totalItems = ref(0);

// 统计数据
const stats = ref({
  todayReservations: 0,
  totalVisitors: 0
});

// 预约数据
const reservations = ref([]);

// 计算总页数
const totalPages = computed(() => Math.ceil(totalItems.value / pageSize));

// 获取状态文本
const getStatusText = (status) => {
  const statusMap = {
    'all': '全部状态',
    'pending': '待审批',
    'approved': '已通过',
    'rejected': '已驳回',
    'completed': '已完成'
  };
  return statusMap[status] || '未知状态';
};

// 获取类型文本
const getTypeText = (type) => {
  const typeMap = {
    'all': '全部类型',
    'individual': '个人预约',
    'group': '团体预约'
  };
  return typeMap[type] || '未知类型';
};

// picker事件处理
const onTypeChange = (e) => {
  filters.value.typeIndex = e.detail.value;
  const typeMap = ['all', 'individual', 'group'];
  filters.value.type = typeMap[e.detail.value];
};

const onStatusChange = (e) => {
  filters.value.statusIndex = e.detail.value;
  const statusMap = ['all', 'approved', 'pending', 'rejected', 'completed'];
  filters.value.status = statusMap[e.detail.value];
};

// 格式化日期
const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('zh-CN');
};

// 格式化时间
const formatTime = (timeString) => {
  return timeString.substring(0, 5);
};

// 加载统计数据
const loadStats = async () => {
  try {
    const res = await getAuditStats();
    if (res && res.code === 0) {
      stats.value = {
        todayReservations: res.data.todayReservations || 0,
        totalVisitors: res.data.totalVisitors || 0
      };
    }
  } catch (error) {
    console.error('加载统计数据失败:', error);
    uni.showToast({
      title: '加载统计数据失败',
      icon: 'none'
    });
    stats.value = {
      todayReservations: 0,
      totalVisitors: 0
    };
  }
};

// 加载预约数据
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
    
    const res = await getAuditReservations(params);
    if (res && res.code === 0) {
      reservations.value = res.data.reservations || [];
      totalItems.value = res.data.total || 0;
    } else {
      reservations.value = [];
      totalItems.value = 0;
    }
  } catch (error) {
    console.error('加载预约数据失败:', error);
    uni.showToast({
      title: '加载数据失败',
      icon: 'none'
    });
    reservations.value = [];
    totalItems.value = 0;
  }
};

// 重置筛选条件
const resetFilters = () => {
  filters.value = {
    type: 'all',
    status: 'approved', // 重置后仍默认显示已通过
    date: getTodayDate(), // 重置后仍默认显示今日
    gate: 'all',
    typeIndex: 0,
    statusIndex: 1 // 对应已通过状态
  };
  loadReservations();
};

// 查看详情
const viewDetails = (reservation) => {
  uni.showModal({
    title: '预约详情',
    content: `预约编号：${reservation.reservation_id}\n申请人：${reservation.user_name}\n预约类型：${reservation.type === 'individual' ? '个人' : '团体'}\n事由：${reservation.purpose}\n预约日期：${reservation.visit_date}\n时间段：${reservation.entry_time}-${reservation.exit_time}`,
    showCancel: false
  });
};

// 通过审批
const approveReservation = async (reservation) => {
  try {
    const res = await uni.showModal({
      title: '确认操作',
      content: '确定要通过该预约申请吗？'
    });
    
    if (res.confirm) {
      const result = await auditAction({
        reservation_id: reservation.reservation_id,
        action: 'approve',
        reason: '审批通过'
      });
      
      if (result && result.code === 0) {
        uni.showToast({
          title: '审批成功',
          icon: 'success'
        });
        loadReservations(); // 重新加载数据
      } else {
        uni.showToast({
          title: '审批失败',
          icon: 'none'
        });
      }
    }
  } catch (error) {
    console.error('审批操作失败:', error);
    uni.showToast({
      title: '操作失败',
      icon: 'none'
    });
  }
};

// 驳回申请
const rejectReservation = async (reservation) => {
  try {
    const res = await uni.showModal({
      title: '确认操作',
      content: '确定要驳回该预约申请吗？请输入驳回理由：',
      editable: true,
      placeholderText: '请输入驳回理由'
    });
    
    if (res.confirm) {
      const reason = res.content || '不符合要求';
      const result = await auditAction({
        reservation_id: reservation.reservation_id,
        action: 'reject',
        reason: reason
      });
      
      if (result && result.code === 0) {
        uni.showToast({
          title: '驳回成功',
          icon: 'success'
        });
        loadReservations(); // 重新加载数据
      } else {
        uni.showToast({
          title: '驳回失败',
          icon: 'none'
        });
      }
    }
  } catch (error) {
    console.error('驳回操作失败:', error);
    uni.showToast({
      title: '操作失败',
      icon: 'none'
    });
  }
};

// 导出数据
const exportData = () => {
  console.log('导出数据');
  alert('数据导出功能');
};

// 分页操作
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

// 初始化加载
onMounted(() => {
  loadStats();
  loadReservations();
});
</script>

<style scoped>
.audit-management {
  background: linear-gradient(#c7e9f4 0%, #446daa, #1c4e80);
  height: 100%;
  min-height: 100%;
  display: flex;
  flex-direction: column;
}

/* 筛选模块 */
.filter-section {
  background: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.filter-header {
  background: #f5f7fa;
  padding: 30px 20px 10px 20px;
  border-bottom: 1px solid #e8e8e8;
}

.filter-title {
  margin: 0;
  font-size: 18px;
  color: #333;
  font-weight: 600;
}

.filter-controls {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.filter-row {
  display: flex;
  gap: 20px;
  align-items: end;
}

.action-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.filter-label {
  font-size: 14px;
  color: #666;
  font-weight: 500;
}

.filter-select, .filter-input {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  background: white;
  min-width: 120px;
}

.picker-text {
  color: #333;
  font-size: 14px;
}

.filter-actions {
  display: flex;
  gap: 20px;
  align-items: center;
}

.search-btn, .reset-btn {
  padding: 1px 30px;
  font-size: 15px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.3s;
}

.search-btn {
  background: #1c4e80;
  color: white;
}

.search-btn:hover {
  background: #164066;
}

.reset-btn {
  background: #f5f5f5;
  color: #666;
  border: 1px solid #ddd;
}

.reset-btn:hover {
  background: #e8e8e8;
}

/* 统计信息 */
.stats-info {
  display: flex;
  gap: 20px;
  align-items: center;
}

.stat-item {
  text-align: center;
  padding: 10px 15px;
  background: #f9f9f9;
  border-radius: 6px;
  min-width: 100px;
}

.stat-number {
  font-size: 20px;
  font-weight: 700;
  color: #1c4e80;
  margin-top: 5px;
}

.stat-label {
  font-size: 14px;
  color: #666;
}

/* 审批信息列表 */
.reservations-list {
  background: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  flex: 1;
  display: flex;
  flex-direction: column;
}



.table-container {
  overflow-x: auto;
  flex: 1;
}

.reservations-table {
  width: 100%;
  display: flex;
  flex-direction: column;
}

.table-header {
  background: #fafafa;
  border-bottom: 1px solid #e8e8e8;
}

.table-row {
  display: grid;
  grid-template-columns: 80px 120px 100px 150px 100px 120px 80px 100px 80px 100px 120px;
  border-bottom: 1px solid #f0f0f0;
  min-height: 60px;
  align-items: center;
}

.table-cell {
  padding: 16px 8px;
  font-size: 14px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.header-cell {
  font-weight: 600;
  color: #333;
  background: #fafafa;
}

.reservation-row:hover {
  background: #fafafa;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
}

.empty-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  color: #999;
  gap: 12px;
}

.empty-content p {
  margin: 0;
  font-size: 16px;
}

.applicant-info {
  min-width: 120px;
}

.applicant-name {
  font-weight: 500;
  color: #333;
  margin-bottom: 4px;
}

.applicant-contact {
  font-size: 12px;
  color: #666;
}

.type-badge {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}

.type-badge.individual {
  background: #e6f7ff;
  color: #1890ff;
  border: 1px solid #91d5ff;
}

.type-badge.group {
  background: #f6ffed;
  color: #52c41a;
  border: 1px solid #b7eb8f;
}

.visitor-count {
  font-size: 12px;
  color: #666;
  margin-top: 4px;
}

.purpose-cell {
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.status-badge {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}

.status-badge.pending {
  background: #fffbe6;
  color: #faad14;
  border: 1px solid #ffe58f;
}

.status-badge.approved {
  background: #f6ffed;
  color: #52c41a;
  border: 1px solid #b7eb8f;
}

.status-badge.rejected {
  background: #fff2f0;
  color: #ff4d4f;
  border: 1px solid #ffccc7;
}

.status-badge.completed {
  background: #f9f0ff;
  color: #722ed1;
  border: 1px solid #d3adf7;
}

.action-buttons {
  display: flex;
  gap: 8px;
}

.view-btn, .approve-btn, .reject-btn {
  padding: 6px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s;
}

.view-btn {
  background: #f0f0f0;
  color: #666;
}

.view-btn:hover {
  background: #d9d9d9;
}

.approve-btn {
  background: #f6ffed;
  color: #52c41a;
  border: 1px solid #b7eb8f;
}

.approve-btn:hover {
  background: #52c41a;
  color: white;
}

.reject-btn {
  background: #fff2f0;
  color: #ff4d4f;
  border: 1px solid #ffccc7;
}

.reject-btn:hover {
  background: #ff4d4f;
  color: white;
}

/* 分页控件 */
.pagination {
  padding: 20px;
  border-top: 1px solid #f0f0f0;
}

.pagination-controls {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 20px;
}

.page-btn {
  padding: 8px 16px;
  background: #1c4e80;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: background 0.3s;
}

.page-btn:hover:not(:disabled) {
  background: #164066;
}

.page-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.page-info {
  font-size: 14px;
  color: #666;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .filter-row {
    gap: 15px;
  }
  
  .action-row {
    flex-direction: column;
    gap: 15px;
    align-items: flex-start;
  }
  
  .stats-info {
    gap: 15px;
    align-self: stretch;
  }
  
  .reservations-table {
    font-size: 12px;
  }
  
  .table-header,
  .table-cell {
    padding: 12px 8px;
  }
  
  .action-buttons {
    flex-direction: column;
  }
}
</style>