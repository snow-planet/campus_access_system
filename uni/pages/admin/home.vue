<template>
  <view class="app-container">
    <!-- 顶部导航栏 -->
    <view class="top-header">
      <view class="header-right">
        <text class="user-info">{{ userInfo.name }} ({{ userInfo.role }})</text>
        <text class="header-current">审批系统</text>
        <text class="logout-link" @click="logout">
          <uni-icons type="close" size="16" color="#666" style="margin-right: 5px;" />
          退出登录
        </text>
      </view>
    </view>

    <!-- 主体内容 -->
    <view class="main-content">
      <!-- 筛选区域 -->
      <view class="filter-section">
        <view class="filter-group">
          <text class="filter-label">类型：</text>
          <picker @change="onTypeChange" :value="filter.type" :range="typeOptions" range-key="label">
            <view class="filter-select">{{ typeOptions.find(opt => opt.value === filter.type)?.label || '全部类型' }}</view>
          </picker>
        </view>
        <view class="filter-group">
          <text class="filter-label">状态：</text>
          <picker @change="onStatusChange" :value="filter.status" :range="statusOptions" range-key="label">
            <view class="filter-select">{{ statusOptions.find(opt => opt.value === filter.status)?.label || '全部状态' }}</view>
          </picker>
        </view>
        <button class="search-btn" @click="loadApplications">搜索</button>
      </view>

      <!-- 申请列表 -->
      <view class="application-list">
        <view v-if="applications.length === 0" class="empty-state">
          <view class="empty-icon">
            <uni-icons type="search" size="48" color="#ccc" />
          </view>
          <text class="empty-text">暂无审批申请</text>
        </view>

        <view v-else class="application-cards">
          <view v-for="app in applications" :key="app.id" class="application-card">
            <view class="card-header">
              <text class="applicant-name">{{ app.applicantName }}</text>
              <text :class="['status-badge', app.status]">
                {{ getStatusText(app.status) }}
              </text>
            </view>
            
            <view class="card-content">
              <view class="info-row">
                <text class="info-label">申请类型：</text>
                <text class="info-value">{{ app.type === 'personal' ? '个人申请' : '团体申请' }}</text>
              </view>
              <view class="info-row">
                <text class="info-label">申请时间：</text>
                <text class="info-value">{{ app.applyTime }}</text>
              </view>
              <view class="info-row">
                <text class="info-label">出入时间：</text>
                <text class="info-value">{{ app.accessTime }}</text>
              </view>
              <view class="info-row">
                <text class="info-label">事由：</text>
                <text class="info-value reason">{{ app.reason }}</text>
              </view>
              
              <view v-if="app.type === 'group'" class="info-row">
                <text class="info-label">团体人数：</text>
                <text class="info-value">{{ app.groupSize }}人</text>
              </view>
            </view>
            
            <view class="card-actions" v-if="app.status === 'pending'">
              <button class="action-btn reject-btn" @click="showRejectDialog(app)">驳回</button>
              <button class="action-btn approve-btn" @click="approveApplication(app)">通过</button>
            </view>
            
            <view class="card-footer" v-if="app.status !== 'pending'">
              <text class="review-info">审批人：{{ app.reviewer }} | 审批时间：{{ app.reviewTime }}</text>
              <text v-if="app.status === 'rejected'" class="reject-reason">驳回原因：{{ app.rejectReason }}</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 分页控件 -->
      <view class="pagination" v-if="applications.length > 0">
        <button class="page-btn" :disabled="currentPage === 1" @click="prevPage">上一页</button>
        <text class="page-info">第 {{ currentPage }} 页 / 共 {{ totalPages }} 页</text>
        <button class="page-btn" :disabled="currentPage === totalPages" @click="nextPage">下一页</button>
      </view>
    </view>

    <!-- 驳回对话框 -->
    <uni-popup ref="rejectPopup" type="dialog">
      <uni-popup-dialog type="info" mode="input" title="驳回申请" placeholder="请输入驳回原因"
        :value="rejectReason" @confirm="confirmReject" @close="closeRejectDialog"></uni-popup-dialog>
    </uni-popup>
  </view>
</template>

<script>
import { ref, onMounted, computed } from 'vue';

export default {
  setup() {
    const rejectPopup = ref(null);
    const router = uni.$router;

    // 用户信息
    const userInfo = ref({
      name: '张老师',
      role: '审批管理员'
    });

    // 筛选条件选项
    const typeOptions = ref([
      { value: 'all', label: '全部类型' },
      { value: 'personal', label: '个人申请' },
      { value: 'group', label: '团体申请' }
    ]);

    const statusOptions = ref([
      { value: 'all', label: '全部状态' },
      { value: 'pending', label: '待审批' },
      { value: 'approved', label: '已通过' },
      { value: 'rejected', label: '已驳回' }
    ]);

    // 筛选条件
    const filter = ref({
      type: 'all',
      status: 'all'
    });

    // 分页信息
    const currentPage = ref(1);
    const pageSize = 5;
    const totalItems = ref(15);

    // 申请数据
    const applications = ref([]);

    // 驳回相关状态
    const rejectReason = ref('');
    const currentApplication = ref(null);

    // 计算总页数
    const totalPages = computed(() => Math.ceil(totalItems.value / pageSize));

    // 获取状态文本
    const getStatusText = (status) => {
      const statusMap = {
        'pending': '待审批',
        'approved': '已通过',
        'rejected': '已驳回'
      };
      return statusMap[status] || '未知状态';
    };

    // 类型选择变化
    const onTypeChange = (e) => {
      filter.value.type = typeOptions.value[e.detail.value].value;
    };

    // 状态选择变化
    const onStatusChange = (e) => {
      filter.value.status = statusOptions.value[e.detail.value].value;
    };

    // 加载申请数据
    const loadApplications = () => {
      // 模拟数据
      applications.value = [
        {
          id: 1,
          applicantName: '张三',
          type: 'personal',
          status: 'pending',
          applyTime: '2023-10-15 09:30',
          accessTime: '2023-10-16 14:00-16:00',
          reason: '参加学术讲座',
          reviewer: '',
          reviewTime: '',
          rejectReason: ''
        },
        {
          id: 2,
          applicantName: '李四',
          type: 'personal',
          status: 'approved',
          applyTime: '2023-10-14 15:20',
          accessTime: '2023-10-17 09:00-12:00',
          reason: '办理学生事务',
          reviewer: '王老师',
          reviewTime: '2023-10-14 16:45',
          rejectReason: ''
        },
        {
          id: 3,
          applicantName: '计算机科学协会',
          type: 'group',
          status: 'pending',
          applyTime: '2023-10-15 11:05',
          accessTime: '2023-10-18 13:00-17:00',
          reason: '举办技术沙龙活动',
          groupSize: 25,
          reviewer: '',
          reviewTime: '',
          rejectReason: ''
        },
        {
          id: 4,
          applicantName: '王五',
          type: 'personal',
          status: 'rejected',
          applyTime: '2023-10-13 16:40',
          accessTime: '2023-10-16 19:00-21:00',
          reason: '自习',
          reviewer: '李老师',
          reviewTime: '2023-10-14 09:15',
          rejectReason: '非开放时间段，请选择白天时段'
        },
        {
          id: 5,
          applicantName: '外语学院',
          type: 'group',
          status: 'pending',
          applyTime: '2023-10-15 14:20',
          accessTime: '2023-10-19 08:30-11:30',
          reason: '举办外语角活动',
          groupSize: 30,
          reviewer: '',
          reviewTime: '',
          rejectReason: ''
        }
      ].filter(app => {
        // 根据筛选条件过滤
        if (filter.value.type !== 'all' && app.type !== filter.value.type) return false;
        if (filter.value.status !== 'all' && app.status !== filter.value.status) return false;
        return true;
      });
    };

    // 显示驳回对话框
    const showRejectDialog = (app) => {
      currentApplication.value = app;
      rejectReason.value = '';
      rejectPopup.value.open();
    };

    // 关闭驳回对话框
    const closeRejectDialog = () => {
      rejectPopup.value.close();
      currentApplication.value = null;
    };

    // 确认驳回
    const confirmReject = (reason) => {
      if (!reason.trim()) {
        uni.showToast({
          title: '请填写驳回原因',
          icon: 'none'
        });
        return;
      }
      
      // 模拟驳回操作
      const index = applications.value.findIndex(item => item.id === currentApplication.value.id);
      if (index !== -1) {
        applications.value[index].status = 'rejected';
        applications.value[index].reviewer = userInfo.value.name;
        applications.value[index].reviewTime = new Date().toLocaleString();
        applications.value[index].rejectReason = reason;
      }
      
      closeRejectDialog();
      uni.showToast({
        title: '已驳回该申请',
        icon: 'success'
      });
    };

    // 通过申请
    const approveApplication = (app) => {
      uni.showModal({
        title: '确认通过',
        content: '确定要通过该申请吗？',
        success: (res) => {
          if (res.confirm) {
            // 模拟通过操作
            const index = applications.value.findIndex(item => item.id === app.id);
            if (index !== -1) {
              applications.value[index].status = 'approved';
              applications.value[index].reviewer = userInfo.value.name;
              applications.value[index].reviewTime = new Date().toLocaleString();
            }
            uni.showToast({
              title: '已通过该申请',
              icon: 'success'
            });
          }
        }
      });
    };

    // 分页操作
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

    // 初始化加载
    onMounted(() => {
      loadApplications();
    });

    // 退出登录
    const logout = () => {
      uni.removeStorageSync('currentUser');
      uni.reLaunch({
        url: '/pages/admin/login'
      });
    };

    return {
      rejectPopup,
      userInfo,
      filter,
      typeOptions,
      statusOptions,
      currentPage,
      applications,
      rejectReason,
      totalPages,
      getStatusText,
      onTypeChange,
      onStatusChange,
      loadApplications,
      showRejectDialog,
      closeRejectDialog,
      confirmReject,
      approveApplication,
      prevPage,
      nextPage,
      logout
    };
  }
}
</script>

<style scoped>
.app-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: linear-gradient(#c7e9f4 0%, #446daa, #1c4e80);
}

/* 顶部导航栏 */
.top-header {
  background: white;
  height: 60px;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  padding: 0 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 1000;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 15px;
  font-size: 14px;
  color: #333;
}

.user-info {
  color: #1c4e80;
  font-weight: 500;
}

.header-current {
  font-size: 17px;
  color: #1c4e80;
  font-weight: 600;
}

.logout-link {
  color: #666;
  cursor: pointer;
  display: flex;
  align-items: center;
  font-size: 12px;
  transition: color 0.3s ease;
}

.logout-link:hover {
  color: #ff4d4f;
}

/* 主体区域 */
.main-content {
  flex: 1;
  padding: 20px;
  display: flex;
  flex-direction: column;
}

/* 筛选区域 */
.filter-section {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
  background: white;
  padding: 12px 15px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.filter-group {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.filter-label {
  font-size: 14px;
  color: #666;
  white-space: nowrap;
}

.filter-select {
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 15px;
  text-align: center;
  background-color: #fff;
}

.search-btn {
  padding: 5px 13px;
  background: #1c4e80;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: background 0.3s;
  white-space: nowrap;
  margin-left: auto;
}

.search-btn:hover {
  background: #164066;
}

/* 申请列表 */
.application-list {
  flex: 1;
}

.empty-state {
  background: white;
  border-radius: 8px;
  padding: 40px 20px;
  text-align: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.empty-icon {
  margin-bottom: 15px;
}

.empty-text {
  font-size: 14px;
  color: #999;
}

.application-cards {
  display: flex;
  flex-direction: column;
}

.application-card {
  background: white;
  padding: 15px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  padding-bottom: 12px;
  border-bottom: 1px solid #eee;
}

.applicant-name {
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.status-badge {
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 11px;
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

.card-content {
  margin-bottom: 15px;
}

.info-row {
  display: flex;
  margin-bottom: 8px;
  flex-wrap: wrap;
}

.info-label {
  width: 70px;
  font-size: 13px;
  color: #666;
  flex-shrink: 0;
}

.info-value {
  font-size: 13px;
  color: #333;
  flex: 1;
}

.reason {
  line-height: 1.5;
}

.card-actions {
  display: flex;
  justify-content: space-around;
  gap: 10px;
  padding-top: 12px;
  border-top: 1px solid #eee;
}

.action-btn {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
  flex: 1;
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

.approve-btn {
  background: #f6ffed;
  color: #52c41a;
  border: 1px solid #b7eb8f;
}

.approve-btn:hover {
  background: #52c41a;
  color: white;
}

.card-footer {
  padding-top: 12px;
  border-top: 1px solid #eee;
  font-size: 11px;
  color: #999;
}

.review-info {
  display: block;
  margin-bottom: 4px;
}

.reject-reason {
  display: block;
  color: #ff4d4f;
}

/* 分页控件 */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 15px;
  margin-top: 20px;
  background: white;
  padding: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.page-btn {
  padding: 6px 12px;
  background: #1c4e80;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 13px;
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
  font-size: 13px;
  color: #666;
}

/* 响应式设计 */
@media (min-width: 768px) {
  .filter-section {
    flex-wrap: wrap;
  }
  
  .filter-group {
    flex: 1;
    min-width: 45%;
  }
  
  .search-btn {
  margin-left: 0;
  flex: 1 0 100%;
  }

  .card-actions {
    justify-content: flex-end;
  }
  
  .action-btn {
    flex: none;
    min-width: 80px;
  }
}
</style>