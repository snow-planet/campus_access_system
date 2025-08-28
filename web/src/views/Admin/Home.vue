<template>
  <div class="app-container">
    <!-- 顶部导航栏 -->
    <header class="top-header">
      <div class="header-left">
        <div class="system-title">
          <BankOutlined :style="{ fontSize: '24px', color: '#1c4e80', marginRight: '10px' }" />
          <span class="main-title">校园出入预约平台</span>
          <span class="sub-title">Campus Access System</span>
        </div>
      </div>
      <div class="header-right">
        <span class="user-info">{{ userInfo.name }} ({{ userInfo.role }})</span>
        <span class="header-current">审批系统</span>
        <span class="logout-link" @click="logout">
          <LogoutOutlined :style="{ marginRight: '5px' }" />
          退出登录
        </span>
      </div>
    </header>

    <!-- 主体内容 -->
    <main class="main-content">
      <!-- 筛选区域 -->
      <div class="filter-section">
        <div class="filter-group">
          <span class="filter-label">申请类型：</span>
          <select v-model="filter.type" class="filter-select">
            <option value="all">全部类型</option>
            <option value="personal">个人申请</option>
            <option value="group">团体申请</option>
          </select>
        </div>
        <div class="filter-group">
          <span class="filter-label">申请状态：</span>
          <select v-model="filter.status" class="filter-select">
            <option value="all">全部状态</option>
            <option value="pending">待审批</option>
            <option value="approved">已通过</option>
            <option value="rejected">已驳回</option>
          </select>
        </div>
        <div class="filter-group">
          <span class="filter-label">申请日期：</span>
          <input 
            type="date" 
            v-model="filter.date" 
            class="filter-select"
            :max="maxDate"
          />
        </div>
        <button class="search-btn" @click="loadApplications">搜索</button>
      </div>

      <!-- 申请列表 -->
      <div class="application-list">
        <div v-if="applications.length === 0" class="empty-state">
          <div class="empty-icon">
            <FileSearchOutlined :style="{ fontSize: '48px', color: '#ccc' }" />
          </div>
          <p class="empty-text">暂无审批申请</p>
        </div>

        <div v-else class="application-cards">
          <div v-for="app in applications" :key="app.id" class="application-card">
            <div class="card-header">
              <span class="applicant-name">{{ app.applicantName }}</span>
              <span :class="['status-badge', app.status]">
                {{ getStatusText(app.status) }}
              </span>
            </div>
            
            <div class="card-content">
              <div class="info-row">
                <span class="info-label">申请类型：</span>
                <span class="info-value">{{ app.type === 'personal' ? '个人申请' : '团体申请' }}</span>
              </div>
              <div class="info-row">
                <span class="info-label">申请时间：</span>
                <span class="info-value">{{ app.applyTime }}</span>
              </div>
              <div class="info-row">
                <span class="info-label">出入时间：</span>
                <span class="info-value">{{ app.accessTime }}</span>
              </div>
              <div class="info-row">
                <span class="info-label">事由：</span>
                <span class="info-value reason">{{ app.reason }}</span>
              </div>
              
              <div v-if="app.type === 'group'" class="info-row">
                <span class="info-label">团体人数：</span>
                <span class="info-value">{{ app.groupSize }}人</span>
              </div>
            </div>
            
            <div class="card-actions" v-if="app.status === 'pending'">
              <button class="action-btn reject-btn" @click="showRejectDialog(app)">驳回</button>
              <button class="action-btn approve-btn" @click="approveApplication(app)">通过</button>
            </div>
            
            <div class="card-footer" v-if="app.status !== 'pending'">
              <span class="review-info">审批人：{{ app.reviewer }} | 审批时间：{{ app.reviewTime }}</span>
              <span v-if="app.status === 'rejected'" class="reject-reason">驳回原因：{{ app.rejectReason }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 分页控件 -->
      <div class="pagination" v-if="applications.length > 0">
        <button class="page-btn" :disabled="currentPage === 1" @click="prevPage">上一页</button>
        <span class="page-info">第 {{ currentPage }} 页 / 共 {{ totalPages }} 页</span>
        <button class="page-btn" :disabled="currentPage === totalPages" @click="nextPage">下一页</button>
      </div>
    </main>

    <!-- 驳回对话框 -->
    <div v-if="showRejectModal" class="modal-overlay">
      <div class="modal-content">
        <div class="modal-header">
          <h3>驳回申请</h3>
          <button class="close-btn" @click="closeRejectDialog">×</button>
        </div>
        <div class="modal-body">
          <p>请填写驳回原因：</p>
          <textarea v-model="rejectReason" class="reason-textarea" placeholder="请输入驳回原因..."></textarea>
        </div>
        <div class="modal-footer">
          <button class="modal-btn cancel-btn" @click="closeRejectDialog">取消</button>
          <button class="modal-btn confirm-btn" @click="confirmReject">确认驳回</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { BankOutlined, FileSearchOutlined, LogoutOutlined } from '@ant-design/icons-vue';
import { getApprovalList, approvalAction, getApproverInfo } from '../../api/webApproval';

const router = useRouter();

// 用户信息
const userInfo = ref({
  name: '加载中...',
  role: '审批管理员'
});

// 当前用户ID
const currentUserId = ref(null);

// 筛选条件
const filter = ref({
  type: 'all',
  status: 'pending',
  date: new Date().toISOString().split('T')[0] // 今日日期
});

// 最大日期（今天）
const maxDate = computed(() => new Date().toISOString().split('T')[0]);

// 分页信息
const currentPage = ref(1);
const pageSize = 10;
const totalItems = ref(0);

// 申请数据
const applications = ref([]);

// 加载状态
const loading = ref(false);

// 驳回相关状态
const showRejectModal = ref(false);
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

// 加载申请数据
const loadApplications = async () => {
  if (!currentUserId.value) {
    console.error('用户ID未获取');
    return;
  }
  
  try {
    loading.value = true;
    
    const params = {
      approver_id: currentUserId.value,
      type: filter.value.type,
      status: filter.value.status,
      page: currentPage.value,
      pageSize: pageSize
    };
    
    // 如果选择了具体日期，添加日期筛选
    if (filter.value.date) {
      params.date = filter.value.date;
    }
    
    const res = await getApprovalList(params);
    
    if (res && res._status === 'OK') {
      applications.value = res.data.list || [];
      totalItems.value = res.data.total || 0;
      
      // 格式化时间显示
      applications.value.forEach(app => {
        if (app.applyTime) {
          app.applyTime = formatDateTime(app.applyTime);
        }
        if (app.reviewTime) {
          app.reviewTime = formatDateTime(app.reviewTime);
        }
      });
    } else {
      console.error('获取审批列表失败:', res._error?.meta);
      // 使用友好的错误提示
      const errorMsg = res._error?.meta || '获取数据失败';
      console.warn(errorMsg);
    }
  } catch (error) {
    console.error('加载申请数据失败:', error);
    // 网络错误时的处理
    console.warn('网络错误，请重试');
  } finally {
    loading.value = false;
  }
};

// 显示驳回对话框
const showRejectDialog = (app) => {
  currentApplication.value = app;
  rejectReason.value = '';
  showRejectModal.value = true;
};

// 关闭驳回对话框
const closeRejectDialog = () => {
  showRejectModal.value = false;
  currentApplication.value = null;
};

// 确认驳回
const confirmReject = async () => {
  if (!rejectReason.value.trim()) {
    alert('请填写驳回原因');
    return;
  }
  
  try {
    const data = {
      reservation_id: currentApplication.value.id,
      reservation_type: currentApplication.value.type === 'personal' ? 'individual' : 'group',
      action: 'reject',
      approver_id: currentUserId.value,
      comments: rejectReason.value
    };
    
    const res = await approvalAction(data);
    
    if (res && res._status === 'OK') {
      closeRejectDialog();
      alert('已驳回该申请');
      // 重新加载数据
      loadApplications();
    } else {
      alert(res._error?.meta || '操作失败');
    }
  } catch (error) {
    console.error('驳回操作失败:', error);
    alert('网络错误，请重试');
  }
};

// 通过申请
const approveApplication = async (app) => {
  if (confirm('确定要通过该申请吗？')) {
    try {
      const data = {
        reservation_id: app.id,
        reservation_type: app.type === 'personal' ? 'individual' : 'group',
        action: 'approve',
        approver_id: currentUserId.value,
        comments: '审批通过'
      };
      
      const res = await approvalAction(data);
      
      if (res && res._status === 'OK') {
        alert('已通过该申请');
        // 重新加载数据
        loadApplications();
      } else {
        alert(res._error?.meta || '操作失败');
      }
    } catch (error) {
      console.error('通过操作失败:', error);
      alert('网络错误，请重试');
    }
  }
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

// 格式化日期时间
const formatDateTime = (dateTime) => {
  if (!dateTime) return '';
  const date = new Date(dateTime);
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// 获取当前用户信息
const getCurrentUserInfo = async () => {
  try {
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    if (currentUser && currentUser.user_id) {
      currentUserId.value = currentUser.user_id;
      
      // 从后端获取最新的用户信息
      const res = await getApproverInfo(currentUser.user_id);
      if (res && res._status === 'OK') {
        userInfo.value = {
          name: res.data.name,
          role: res.data.role
        };
      } else {
        // 使用本地存储的信息作为备用
        userInfo.value = {
          name: currentUser.real_name || currentUser.username,
          role: currentUser.role === 'admin' ? '超级管理员' : '审批管理员'
        };
      }
    } else {
      // 用户未登录，跳转到登录页
      router.push('/admin/login');
    }
  } catch (error) {
    console.error('获取用户信息失败:', error);
    // 使用默认信息
    userInfo.value = {
      name: '审批员',
      role: '审批管理员'
    };
  }
};

// 初始化加载
onMounted(async () => {
  await getCurrentUserInfo();
  if (currentUserId.value) {
    loadApplications();
  }
});

// 退出登录
const logout = () => {
  localStorage.removeItem('currentUser')
  router.push('/admin/login')
}
</script>

<style scoped>
.app-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  margin: 0;
  padding: 0;
  overflow-x: hidden;
}

/* 顶部导航栏 */
.top-header {
  background: white;
  height: 70px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 30px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
}

.header-left .system-title {
  display: flex;
  align-items: center;
}

.main-title {
  font-size: 27px;
  font-weight: 700;
  color: #1c4e80;
  margin-right: 12px;
}

.sub-title {
  font-size: 17px;
  color: #666;
  font-weight: 400;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 20px;
  font-size: 16px;
  color: #333;
  font-weight: 500;
}

.user-info {
  color: #1c4e80;
  font-weight: 500;
}

.header-current {
  font-size: 20px;
  color: #1c4e80;
  font-weight: 500;
}

.logout-link {
  color: #666;
  cursor: pointer;
  display: flex;
  align-items: center;
  font-size: 14px;
  transition: color 0.3s ease;
}

.logout-link:hover {
  color: #ff4d4f;
}

/* 主体区域 */
.main-content {
  flex: 1;
  background: linear-gradient(#c7e9f4 0%, #446daa, #1c4e80);
  padding: 100px 120px 30px 120px;
  display: flex;
  flex-direction: column;
}

/* 筛选区域 */
.filter-section {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 30px;
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.filter-group {
  display: flex;
  align-items: center;
}

.filter-label {
  font-size: 14px;
  color: #666;
  margin-right: 8px;
}

.filter-select {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.search-btn {
  padding: 8px 20px;
  background: #1c4e80;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: background 0.3s;
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
  padding: 60px 20px;
  text-align: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.empty-icon {
  margin-bottom: 20px;
}

.empty-text {
  font-size: 16px;
  color: #999;
}

.application-cards {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.application-card {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  padding-bottom: 15px;
  border-bottom: 1px solid #eee;
}

.applicant-name {
  font-size: 18px;
  font-weight: 600;
  color: #333;
}

.status-badge {
  padding: 4px 10px;
  border-radius: 12px;
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

.card-content {
  margin-bottom: 20px;
}

.info-row {
  display: flex;
  margin-bottom: 10px;
}

.info-label {
  width: 80px;
  font-size: 14px;
  color: #666;
  flex-shrink: 0;
}

.info-value {
  font-size: 14px;
  color: #333;
  flex: 1;
}

.reason {
  line-height: 1.6;
}

.card-actions {
  display: flex;
  justify-content: flex-end;
  gap: 15px;
  padding-top: 15px;
  border-top: 1px solid #eee;
}

.action-btn {
  padding: 8px 20px;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
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
  padding-top: 15px;
  border-top: 1px solid #eee;
  font-size: 12px;
  color: #999;
}

.review-info {
  display: block;
  margin-bottom: 5px;
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
  gap: 20px;
  margin-top: 30px;
  background: white;
  padding: 15px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.page-btn {
  padding: 8px 16px;
  background: #1c4e80;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
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

/* 模态框 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2000;
}

.modal-content {
  background: white;
  border-radius: 8px;
  width: 500px;
  max-width: 90%;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #eee;
}

.modal-header h3 {
  margin: 0;
  font-size: 18px;
  color: #333;
}

.close-btn {
  background: none;
  border: none;
  font-size: 20px;
  color: #999;
  cursor: pointer;
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-btn:hover {
  color: #666;
}

.modal-body {
  padding: 20px;
}

.modal-body p {
  margin: 0 0 10px 0;
  font-size: 14px;
  color: #666;
}

.reason-textarea {
  width: 100%;
  height: 100px;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  resize: vertical;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 16px 20px;
  border-top: 1px solid #eee;
}

.modal-btn {
  padding: 8px 20px;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s;
}

.cancel-btn {
  background: #f5f5f5;
  color: #666;
}

.cancel-btn:hover {
  background: #e8e8e8;
}

.confirm-btn {
  background: #ff4d4f;
  color: white;
}

.confirm-btn:hover {
  background: #d9363e;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .main-content {
    padding: 100px 20px 20px 20px;
  }
  
  .filter-section {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .application-card {
    padding: 15px;
  }
  
  .card-actions {
    flex-direction: column;
  }
  
  .action-btn {
    width: 100%;
  }
}
</style>