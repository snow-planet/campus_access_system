<template>
  <div class="audit-management">
    <!-- 筛选模块 -->
    <div class="filter-section">
      <div class="filter-header">
        <h2>审批信息筛选</h2>
      </div>
      <div class="filter-controls">
        <div class="filter-row">
          <div class="filter-group">
            <label class="filter-label">类型：</label>
            <select v-model="filters.type" class="filter-select">
              <option value="all">全部类型</option>
              <option value="individual">个人预约</option>
              <option value="group">团体预约</option>
            </select>
          </div>
          
          <div class="filter-group">
            <label class="filter-label">状态：</label>
            <select v-model="filters.status" class="filter-select">
              <option value="all">全部状态</option>
              <option value="approved">已通过</option>
              <option value="pending">待审批</option>
              <option value="rejected">已驳回</option>
              <option value="completed">已完成</option>
            </select>
          </div>
          
          <div class="filter-group">
            <label class="filter-label">日期：</label>
            <input type="date" v-model="filters.date" class="filter-input">
          </div>
        </div>
        
        <div class="action-row">
          <div class="filter-actions">
            <button class="search-btn" @click="loadReservations">
              <SearchOutlined /> 搜索
            </button>
            <button class="reset-btn" @click="resetFilters">
              <ReloadOutlined /> 重置
            </button>
          </div>

          <!-- 统计信息 -->
          <div class="stats-info">
            <div class="stat-item">
              <div class="stat-label">今日预约次数</div>
              <div class="stat-number">{{ stats.todayReservations }}</div>
            </div>
            <div class="stat-item">
              <div class="stat-label">今日预约人次:</div>
              <div class="stat-number">{{ stats.totalVisitors }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 审批信息列表 -->
    <div class="reservations-list">
      <div class="table-container">
        <table class="reservations-table">
          <thead>
            <tr>
              <th>预约编号</th>
              <th>申请人</th>
              <th>预约类型</th>
              <th>事由</th>
              <th>预约日期</th>
              <th>时间段</th>
              <th>出入口</th>
              <th>车牌号</th>
              <th>状态</th>
              <th>审批人</th>
              <th>查看工单</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="reservations.length === 0">
              <td colspan="11" class="empty-state">
                <div class="empty-content">
                  <FileSearchOutlined />
                  <p>暂无审批信息</p>
                </div>
              </td>
            </tr>
            
            <tr v-else v-for="reservation in reservations" :key="reservation.reservation_id" class="reservation-row">
              <td>{{ reservation.reservation_id }}</td>
              <td class="applicant-info">
                <div class="applicant-name">{{ reservation.user_name }}</div>
                <div class="applicant-contact" v-if="reservation.type === 'group'">
                  {{ reservation.contact_name }} - {{ reservation.contact_phone }}
                </div>
              </td>
              <td>
                <span :class="['type-badge', reservation.type]">
                  {{ reservation.type === 'individual' ? '个人' : '团体' }}
                </span>
                <div v-if="reservation.type === 'group'" class="visitor-count">
                  {{ reservation.visitor_count }}人
                </div>
              </td>
              <td class="purpose-cell">{{ reservation.purpose }}</td>
              <td>{{ formatDate(reservation.visit_date) }}</td>
              <td>
                <div v-if="reservation.entry_time && reservation.exit_time">
                  {{ formatTime(reservation.entry_time) }} - {{ formatTime(reservation.exit_time) }}
                </div>
                <div v-else>全天</div>
              </td>
              <td>{{ reservation.gate }}</td>
              <td>{{ reservation.license_plate || '-' }}</td>
              <td>
                <span :class="['status-badge', reservation.status]">
                  {{ getStatusText(reservation.status) }}
                </span>
              </td>
              <td>{{ reservation.approver_name || '-' }}</td>
              <td>
                <div class="action-buttons">
                  <button class="view-btn" @click="viewDetails(reservation)" title="查看详情">
                    <EyeOutlined />
                  </button>
                  <button 
                    v-if="reservation.status === 'pending'" 
                    class="approve-btn" 
                    @click="approveReservation(reservation)"
                    title="通过审批"
                  >
                    <CheckOutlined />
                  </button>
                  <button 
                    v-if="reservation.status === 'pending'" 
                    class="reject-btn" 
                    @click="rejectReservation(reservation)"
                    title="驳回申请"
                  >
                    <CloseOutlined />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <!-- 分页控件 -->
      <div class="pagination" v-if="reservations.length > 0">
        <div class="pagination-controls">
          <button class="page-btn" :disabled="currentPage === 1" @click="prevPage">
            <LeftOutlined /> 上一页
          </button>
          <span class="page-info">第 {{ currentPage }} 页 / 共 {{ totalPages }} 页</span>
          <button class="page-btn" :disabled="currentPage === totalPages" @click="nextPage">
            下一页 <RightOutlined />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { 
  SearchOutlined, 
  ReloadOutlined, 
  ExportOutlined,
  FileSearchOutlined,
  EyeOutlined,
  CheckOutlined,
  CloseOutlined,
  LeftOutlined,
  RightOutlined
} from '@ant-design/icons-vue';
import { getAuditReservations, getAuditStats, auditAction } from '../../api/webAdmin'

// 筛选条件 - 默认只显示今日已通过审批的信息
const filters = ref({
  type: 'all',
  status: 'approved', // 默认只显示已通过
  date: getTodayDate(), // 默认显示今日
  gate: 'all'
});

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
    'pending': '待审批',
    'approved': '已通过',
    'rejected': '已驳回',
    'completed': '已完成'
  };
  return statusMap[status] || '未知状态';
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
    const res = await getAuditStats()
    if (res && res._status === 'OK') {
      stats.value = {
        todayReservations: res.data.todayReservations || 0,
        totalVisitors: res.data.totalVisitors || 0
      }
    }
  } catch (error) {
    console.error('加载统计数据失败:', error)
    stats.value = {
      todayReservations: 0,
      totalVisitors: 0
    }
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
    }
    
    const res = await getAuditReservations(params)
    if (res && res._status === 'OK') {
      reservations.value = res.data.reservations || []
      totalItems.value = res.data.total || 0
    } else {
      reservations.value = []
      totalItems.value = 0
    }
  } catch (error) {
    console.error('加载预约数据失败:', error)
    reservations.value = []
    totalItems.value = 0
  }
};

// 重置筛选条件
const resetFilters = () => {
  filters.value = {
    type: 'all',
    status: 'approved', // 重置后仍默认显示已通过
    date: getTodayDate(), // 重置后仍默认显示今日
    gate: 'all'
  };
  loadReservations();
};

// 查看详情
const viewDetails = (reservation) => {
  console.log('查看详情:', reservation);
  alert(`查看预约详情：${reservation.reservation_id}`);
};

// 通过审批
const approveReservation = async (reservation) => {
  if (confirm('确定要通过该预约申请吗？')) {
    try {
      // 获取当前用户ID
      const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}')
      const approverId = currentUser.user_id || 1
      
      const res = await auditAction({
        reservation_id: reservation.reservation_id,
        reservation_type: reservation.type,
        action: 'approve',
        approver_id: approverId,
        comments: '管理员审批通过'
      })
      
      if (res && res._status === 'OK') {
        alert('已通过审批')
        loadReservations() // 重新加载数据
      } else {
        alert('审批失败：' + (res._error?.meta || '未知错误'))
      }
    } catch (error) {
      console.error('审批操作失败:', error)
      alert('审批失败，请稍后重试')
    }
  }
};

// 驳回申请
const rejectReservation = async (reservation) => {
  const reason = prompt('请输入驳回原因：')
  if (reason && confirm('确定要驳回该预约申请吗？')) {
    try {
      // 获取当前用户ID
      const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}')
      const approverId = currentUser.user_id || 1
      
      const res = await auditAction({
        reservation_id: reservation.reservation_id,
        reservation_type: reservation.type,
        action: 'reject',
        approver_id: approverId,
        comments: reason
      })
      
      if (res && res._status === 'OK') {
        alert('已驳回申请')
        loadReservations() // 重新加载数据
      } else {
        alert('驳回失败：' + (res._error?.meta || '未知错误'))
      }
    } catch (error) {
      console.error('驳回操作失败:', error)
      alert('驳回失败，请稍后重试')
    }
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
  padding: 20px;
  background: linear-gradient(#c7e9f4 0%, #446daa, #1c4e80);
  min-height: 100vh;
}

/* 筛选模块 */
.filter-section {
  background: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.filter-header {
  background: #f5f7fa;
  padding: 16px 20px;
  border-bottom: 1px solid #e8e8e8;
}

.filter-header h2 {
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
}

.filter-actions {
  display: flex;
  gap: 10px;
  align-items: center;
}

.search-btn, .reset-btn {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  font-size: 14px;
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
}



.table-container {
  overflow-x: auto;
}

.reservations-table {
  width: 100%;
  border-collapse: collapse;
}

.reservations-table th {
  background: #fafafa;
  padding: 16px;
  text-align: left;
  font-weight: 600;
  color: #333;
  border-bottom: 1px solid #e8e8e8;
  white-space: nowrap;
}

.reservations-table td {
  padding: 16px;
  border-bottom: 1px solid #f0f0f0;
  vertical-align: top;
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
    flex-direction: column;
    gap: 15px;
    align-self: stretch;
  }
  
  .reservations-table {
    font-size: 12px;
  }
  
  .reservations-table th,
  .reservations-table td {
    padding: 12px 8px;
  }
  
  .action-buttons {
    flex-direction: column;
  }
}

@media (max-width: 480px) {
  .pagination-controls {
    flex-direction: column;
    gap: 15px;
  }
}
</style>