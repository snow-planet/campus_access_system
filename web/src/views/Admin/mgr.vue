<template>
  <div class="approver-management">
    <!-- 顶部统计卡片模块 -->
    <div class="stats-section">
      <div class="stats-cards">
        <div class="stat-card">
          <div class="stat-icon">
            <UserOutlined />
          </div>
          <div class="stat-content">
                <label class="filter-label">选择学院：</label>
                <select v-model="selectedCollege" class="filter-select" @change="loadStats">
                    <option v-for="college in collegeOptions" :key="college" :value="college">{{ college }}</option>
                </select>
            <div class="stat-number">{{ approverCount }}</div>
            <div class="stat-label">审批账号数量</div>
          </div>
        </div>
      </div>
      
      <div class="stats-alert" @click="showPendingApplications">
        <div class="alert-icon" v-if="hasPendingApplications">
          <ExclamationCircleOutlined />
        </div>
        <div class="alert-content">
          <div class="alert-title" v-if="hasPendingApplications">
            有 {{ pendingApplicationCount }} 个申请待处理
          </div>
          <div class="alert-title" v-else>
            暂无待处理申请
          </div>
          <div class="alert-subtitle">点击查看详情</div>
        </div>
      </div>
    </div>

    <!-- 账号管理模块 -->
    <div class="account-management-section">
      <div class="section-header">
        <h2>账号管理</h2>
        <div class="section-actions">
          <button class="create-btn" @click="showCreateModal">
            <PlusOutlined /> 创建后台账号
          </button>
        </div>
      </div>
      
      <div class="management-controls">
        <div class="filter-group">
          <label class="filter-label">账号类型：</label>
          <select v-model="accountFilters.role" class="filter-select">
            <option value="all">全部类型</option>
            <option value="admin">后台账号</option>
            <option value="approver">审批人账号</option>
          </select>
        </div>
        
        <div class="filter-group">
          <label class="filter-label">所属学院：</label>
          <select v-model="accountFilters.college" class="filter-select">
            <option value="all">全部学院</option>
            <option v-for="college in collegeOptions" :key="college" :value="college">{{ college }}</option>
          </select>
        </div>
        
        <div class="filter-actions">
          <button class="search-btn" @click="loadAccounts">
            <SearchOutlined /> 搜索
          </button>
          <button class="reset-btn" @click="resetAccountFilters">
            <ReloadOutlined /> 重置
          </button>
        </div>
      </div>
      
      <div class="accounts-table-container">
        <table class="accounts-table">
          <thead>
            <tr>
              <th>用户ID</th>
              <th>用户名</th>
              <th>联系电话</th>
              <th>学院/部门</th>
              <th>职位</th>
              <th>账号类型</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="accounts.length === 0">
              <td colspan="7" class="empty-state">
                <div class="empty-content">
                  <FileSearchOutlined />
                  <p>暂无账号记录</p>
                </div>
              </td>
            </tr>
            
            <tr v-else v-for="account in accounts" :key="account.user_id" class="account-row">
              <td>{{ account.user_id }}</td>
              <td>{{ account.username }}</td>
              <td>{{ account.real_name }}</td>
              <td>{{ account.phone }}</td>
              <td>{{ account.college || '-' }}</td>
              <td>
                {{ getPositionText(account.position) }}
              </td>
              <td>
                <span :class="['role-badge', account.role]">
                  {{ getRoleText(account.role) }}
                </span>
              </td>
              <td>
                <div class="action-buttons">
                  <button 
                    class="delete-btn" 
                    @click="deleteAccountItem(account)"
                    title="删除账号"
                  >
                    <DeleteOutlined /> 删除
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- 创建账号模态框 -->
    <div v-if="showCreateAccountModal" class="modal-overlay">
      <div class="modal-content">
        <div class="modal-header">
          <h3>创建后台账号</h3>
          <button class="modal-close" @click="closeCreateModal">
            <CloseOutlined />
          </button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label class="form-label">用户名</label>
            <input type="text" v-model="newAccount.username" class="form-input" placeholder="请输入用户名">
          </div>
          <div class="form-group">
            <label class="form-label">密码</label>
            <input type="password" v-model="newAccount.password" class="form-input" placeholder="请输入密码">
          </div>
          <div class="form-group">
            <label class="form-label">真实姓名</label>
            <input type="text" v-model="newAccount.real_name" class="form-input" placeholder="请输入真实姓名">
          </div>
          <div class="form-group">
            <label class="form-label">联系电话</label>
            <input type="text" v-model="newAccount.phone" class="form-input" placeholder="请输入联系电话">
          </div>
          <div class="form-group">
            <label class="form-label">学院/部门</label>
            <select v-model="newAccount.college" class="form-input">
              <option value="">请选择学院/部门</option>
              <option v-for="college in collegeOptions" :key="college" :value="college">{{ college }}</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">职位</label>
            <select v-model="newAccount.position" class="form-input">
              <option value="teacher">教师</option>
              <option value="security">安保人员</option>
            </select>
          </div>
        </div>
        <div class="pending-notice" v-if="pendingCount > 0">
          <ExclamationCircleOutlined :style="{ color: '#faad14', marginRight: '8px' }" />
          <span>此处是创建后台账号，如果需要创建审批人账号请在登录页面进行申请流程</span>
        </div>
        <div class="modal-footer">
          <button class="modal-cancel" @click="closeCreateModal">取消</button>
          <button class="modal-confirm" @click="createAccountItem">确认创建</button>
        </div>
      </div>
    </div>

    <!-- 处理申请模态框 -->
    <div v-if="showApplicationsModal" class="modal-overlay">
      <div class="modal-content large-modal">
        <div class="modal-header">
          <h3>处理账号申请</h3>
          <button class="modal-close" @click="closeApplicationsModal">
            <CloseOutlined />
          </button>
        </div>
        <div class="modal-body">
          <div class="application-controls">
            <div class="filter-group">
              <label class="filter-label">职位类型：</label>
              <select v-model="applicationFilters.position" class="filter-select">
                <option value="all">全部类型</option>
                <option value="teacher">教师</option>
                <option value="security">安保人员</option>
              </select>
            </div>
            
            <div class="filter-actions">
              <button class="search-btn" @click="loadApplications">
                <SearchOutlined /> 搜索
              </button>
              <button class="reset-btn" @click="resetApplicationFilters">
                <ReloadOutlined /> 重置
              </button>
            </div>
          </div>
          
          <div class="applications-table-container">
            <table class="applications-table">
              <thead>
                <tr>
                  <th>申请人</th>
                  <th>联系电话</th>
                  <th>职位</th>
                  <th>申请时间</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="applications.length === 0">
                  <td colspan="5" class="empty-state">
                    <div class="empty-content">
                      <FileSearchOutlined />
                      <p>暂无申请记录</p>
                    </div>
                  </td>
                </tr>
                
                <tr v-else v-for="application in applications" :key="application.application_id" class="application-row">
                  <td>{{ application.real_name }}</td>
                  <td>{{ application.phone }}</td>
                  <td>
                    {{ application.position === 'teacher' ? '教师' : '安保人员' }}
                  </td>
                  <td>{{ formatDate(application.created_at) }}</td>
                  <td>
                    <div class="action-buttons">
                      <button 
                        v-if="application.status === 'pending'" 
                        class="approve-btn" 
                        @click="approveApplication(application)"
                        title="通过申请"
                      >
                        <CheckOutlined /> 通过
                      </button>
                      <button 
                        v-if="application.status === 'pending'" 
                        class="reject-btn" 
                        @click="rejectApplication(application)"
                        title="拒绝申请"
                      >
                        <CloseOutlined /> 拒绝
                      </button>
                      <button 
                        v-if="application.status !== 'pending'" 
                        class="view-btn" 
                        @click="viewApplicationDetails(application)"
                        title="查看详情"
                      >
                        <EyeOutlined /> 详情
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <div class="modal-footer">
          <button class="modal-cancel" @click="closeApplicationsModal">关闭</button>
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
  FileSearchOutlined,
  EyeOutlined,
  CheckOutlined,
  CloseOutlined,
  PlusOutlined,
  DeleteOutlined,
  UserOutlined,
  ExclamationCircleOutlined,
  EditOutlined
} from '@ant-design/icons-vue';
import { 
  getManagerStats, 
  getAccounts, 
  getApplications, 
  createAccount, 
  processApplication, 
  deleteAccount, 
  updateAccount 
} from '../../api/webAdmin'

// 当前用户信息（模拟数据）
const currentUser = ref({
  user_id: 1,
  username: 'admin01',
  real_name: '系统管理员',
  college: '信息技术学院',
  role: 'admin'
});

// 顶部统计信息
const approverCount = ref(5);
const pendingApplicationCount = ref(3);
const selectedCollege = ref(currentUser.value.college);
const hasPendingApplications = computed(() => pendingApplicationCount.value > 0);

// 申请筛选条件
const applicationFilters = ref({
  position: 'all'
});

// 账号筛选条件
const accountFilters = ref({
  role: 'all',
  college: 'all'
});

// 申请数据
const applications = ref([]);

// 账号数据
const accounts = ref([]);

// 创建账号模态框
const showCreateAccountModal = ref(false);
const showApplicationsModal = ref(false);
const newAccount = ref({
  username: '',
  password: '',
  real_name: '',
  phone: '',
  college: '',
  position: 'teacher'
});

// 学院选项
const collegeOptions = ref([
  '信息技术学院',
  '交通管理学院',
  '治安学院',
  '保卫处'
]);

// 获取申请状态文本
const getApplicationStatusText = (status) => {
  const statusMap = {
    'pending': '待处理',
    'approved': '已通过',
    'rejected': '已拒绝'
  };
  return statusMap[status] || '未知状态';
};

// 获取账号状态文本
const getAccountStatusText = (status) => {
  const statusMap = {
    'active': '活跃',
    'inactive': '已禁用',
    'pending': '待激活'
  };
  return statusMap[status] || '未知状态';
};

// 获取职位文本
const getPositionText = (position) => {
  const positionMap = {
    'teacher': '教师',
    'security': '安保人员',
    'other': '其他'
  };
  return positionMap[position] || '未知';
};

// 获取角色文本
const getRoleText = (role) => {
  const roleMap = {
    'admin': '后台账号',
    'approver': '审批人',
    'user': '普通用户'
  };
  return roleMap[role] || '未知';
};

// 格式化日期
const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('zh-CN');
};

// 加载申请数据
const loadApplications = async () => {
  try {
    const params = {
      position: applicationFilters.value.position,
      status: 'all',
      college: selectedCollege.value,
      page: 1,
      pageSize: 50
    }
    
    const res = await getApplications(params)
    if (res && res._status === 'OK') {
      applications.value = res.data.applications || []
    } else {
      applications.value = []
    }
  } catch (error) {
    console.error('加载申请数据失败:', error)
    applications.value = []
  }
};

// 加载账号数据
const loadAccounts = async () => {
  try {
    const params = {
      role: accountFilters.value.role,
      college: accountFilters.value.college,
      page: 1,
      pageSize: 50
    }
    
    const res = await getAccounts(params)
    if (res && res._status === 'OK') {
      // 只显示admin和approver角色的账号
      accounts.value = (res.data.accounts || []).filter(account => 
        account.role === 'admin' || account.role === 'approver'
      )
    } else {
      accounts.value = []
    }
  } catch (error) {
    console.error('加载账号数据失败:', error)
    accounts.value = []
  }
};

// 重置申请筛选条件
const resetApplicationFilters = () => {
  applicationFilters.value = {
    position: 'all'
  };
  loadApplications();
};

// 重置账号筛选条件
const resetAccountFilters = () => {
  accountFilters.value = {
    role: 'all',
    college: 'all'
  };
  loadAccounts();
};

// 通过申请
const approveApplication = async (application) => {
  if (confirm(`确定要通过 ${application.real_name} 的审批人申请吗？`)) {
    try {
      // 获取当前用户ID
      const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}')
      const reviewerId = currentUser.user_id || 1
      
      const res = await processApplication(application.application_id, {
        action: 'approve',
        reviewer_id: reviewerId
      })
      
      if (res && res._status === 'OK') {
        alert('已通过申请，账号已生成')
        loadApplications()
        loadStats()
      } else {
        alert('处理失败：' + (res._error?.meta || '未知错误'))
      }
    } catch (error) {
      console.error('处理申请失败:', error)
      alert('处理失败，请稍后重试')
    }
  }
};

// 拒绝申请
const rejectApplication = async (application) => {
  if (confirm(`确定要拒绝 ${application.real_name} 的审批人申请吗？`)) {
    try {
      // 获取当前用户ID
      const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}')
      const reviewerId = currentUser.user_id || 1
      
      const res = await processApplication(application.application_id, {
        action: 'reject',
        reviewer_id: reviewerId
      })
      
      if (res && res._status === 'OK') {
        alert('已拒绝申请')
        loadApplications()
        loadStats()
      } else {
        alert('处理失败：' + (res._error?.meta || '未知错误'))
      }
    } catch (error) {
      console.error('处理申请失败:', error)
      alert('处理失败，请稍后重试')
    }
  }
};

// 查看申请详情
const viewApplicationDetails = (application) => {
  console.log('查看申请详情:', application);
  alert(`查看申请详情：${application.application_id}`);
};

// 删除账号
const deleteAccountItem = async (account) => {
  if (confirm(`确定要删除 ${account.real_name} 的账号吗？此操作不可恢复！`)) {
    try {
      const res = await deleteAccount(account.user_id)
      
      if (res && res._status === 'OK') {
        alert('账号已删除')
        loadAccounts()
        loadStats()
      } else {
        alert('删除失败：' + (res._error?.meta || '未知错误'))
      }
    } catch (error) {
      console.error('删除账号失败:', error)
      alert('删除失败，请稍后重试')
    }
  }
};

// 显示创建模态框
const showCreateModal = () => {
  showCreateAccountModal.value = true;
};

// 关闭创建模态框
const closeCreateModal = () => {
  showCreateAccountModal.value = false;
  // 重置表单
  newAccount.value = {
    username: '',
    password: '',
    real_name: '',
    phone: '',
    college: '',
    position: 'teacher'
  };
};

// 显示申请处理模态框
const showPendingApplications = () => {
  showApplicationsModal.value = true;
  loadApplications();
};

// 关闭申请处理模态框
const closeApplicationsModal = () => {
  showApplicationsModal.value = false;
};

// 创建账号
const createAccountItem = async () => {
  // 简单验证
  if (!newAccount.value.username || !newAccount.value.password || 
      !newAccount.value.real_name || !newAccount.value.phone || 
      !newAccount.value.college) {
    alert('请填写所有必填字段');
    return;
  }
  
  try {
    const res = await createAccount(newAccount.value)
    
    if (res && res._status === 'OK') {
      alert('后台账号创建成功')
      closeCreateModal()
      loadAccounts()
      loadStats()
    } else {
      alert('创建失败：' + (res._error?.meta || '未知错误'))
    }
  } catch (error) {
    console.error('创建账号失败:', error)
    alert('创建失败，请稍后重试')
  }
};

// 加载统计数据
const loadStats = async () => {
  try {
    const params = {
      college: selectedCollege.value
    }
    
    const res = await getManagerStats(params)
    if (res && res._status === 'OK') {
      approverCount.value = res.data.approverCount || 0
      pendingApplicationCount.value = res.data.pendingApplicationCount || 0
    } else {
      approverCount.value = 0
      pendingApplicationCount.value = 0
    }
  } catch (error) {
    console.error('加载统计数据失败:', error)
    approverCount.value = 0
    pendingApplicationCount.value = 0
  }
};

// 初始化加载
onMounted(() => {
  loadAccounts();
  loadStats();
});
</script>

<style scoped>
.approver-management {
  padding: 20px;
  background: linear-gradient(#c7e9f4 0%, #446daa, #1c4e80);
  min-height: 100vh;
}

/* 顶部统计卡片样式 */
.stats-section {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.stats-cards {
  flex: 1;
  min-width: 250px;
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.stat-card {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 15px;
}

.college-selector {
  background: white;
  border-radius: 8px;
  padding: 15px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.stat-icon {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: #e6f7ff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  color: #1890ff;
}

.stat-content {
  flex: 1;
}

.stat-number {
  font-size: 28px;
  font-weight: bold;
  color: #1c4e80;
  margin-bottom: 5px;
}

.stat-label {
  font-size: 14px;
  color: #666;
}

.stats-alert {
  flex: 1;
  min-width: 250px;
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 15px;
  cursor: pointer;
  transition: all 0.3s;
}

.stats-alert:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.alert-icon {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: #fff2e8;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  color: #fa541c;
}

.alert-content {
  flex: 1;
}

.alert-title {
  font-size: 18px;
  font-weight: bold;
  color: #1c4e80;
  margin-bottom: 5px;
}

.alert-subtitle {
  font-size: 14px;
  color: #999;
}

.account-management-section {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
  overflow: hidden;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background: #f5f7fa;
  border-bottom: 1px solid #e8e8e8;
}

.section-header h2 {
  margin: 0;
  font-size: 18px;
  color: #333;
  font-weight: 600;
}

.create-btn {
  padding: 8px 16px;
  background: #1c4e80;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: background 0.3s;
}

.create-btn:hover {
  background: #164066;
}

.application-controls,
.management-controls {
  padding: 20px;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  align-items: end;
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

.filter-select {
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

.applications-table-container,
.accounts-table-container {
  overflow-x: auto;
  padding: 0 20px 20px;
}

.applications-table,
.accounts-table {
  width: 100%;
  border-collapse: collapse;
}

.applications-table th,
.accounts-table th {
  background: #fafafa;
  padding: 16px;
  text-align: left;
  font-weight: 600;
  color: #333;
  border-bottom: 1px solid #e8e8e8;
  white-space: nowrap;
}

.applications-table td,
.accounts-table td {
  padding: 16px;
  border-bottom: 1px solid #f0f0f0;
  vertical-align: top;
}

.application-row:hover,
.account-row:hover {
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

.role-badge {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}

.role-badge.admin {
  background: #fff7e6;
  color: #fa8c16;
  border: 1px solid #ffd591;
}

.role-badge.approver {
  background: #f6ffed;
  color: #52c41a;
  border: 1px solid #b7eb8f;
}

.role-badge.user {
  background: #f9f0ff;
  color: #722ed1;
  border: 1px solid #d3adf7;
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

.status-badge.active {
  background: #f6ffed;
  color: #52c41a;
  border: 1px solid #b7eb8f;
}

.status-badge.inactive {
  background: #f5f5f5;
  color: #999;
  border: 1px solid #d9d9d9;
}

.action-buttons {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.view-btn, .approve-btn, .reject-btn,
.edit-btn, .delete-btn {
  padding: 6px 10px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  gap: 4px;
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

.edit-btn {
  background: #e6f7ff;
  color: #1890ff;
  border: 1px solid #91d5ff;
}

.edit-btn:hover {
  background: #1890ff;
  color: white;
}

.delete-btn {
  background: #fff2f0;
  color: #ff4d4f;
  border: 1px solid #ffccc7;
}

.delete-btn:hover {
  background: #ff4d4f;
  color: white;
}

/* 模态框样式 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 8px;
  width: 500px;
  max-width: 90%;
  max-height: 90%;
  overflow-y: auto;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.large-modal {
  width: 800px;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #e8e8e8;
}

.modal-header h3 {
  margin: 0;
  font-size: 18px;
  color: #333;
}

.modal-close {
  background: none;
  border: none;
  font-size: 16px;
  cursor: pointer;
  color: #999;
}

.modal-close:hover {
  color: #666;
}

.modal-body {
  padding: 20px;
}

.form-group {
  margin-bottom: 16px;
}

.form-label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #333;
}

.form-input {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.form-input:focus {
  outline: none;
  border-color: #1c4e80;
}

.pending-notice {
  display: flex;
  align-items: center;
  padding: 10px 15px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
}

.pending-notice:first-of-type {
  background: #fffbe6;
  color: #faad14;
  border: 1px solid #ffe58f;
}

.pending-notice:last-of-type {
  background: #f6ffed;
  color: #52c41a;
  border: 1px solid #b7eb8f;
}

.modal-footer {
  padding: 16px 20px;
  border-top: 1px solid #e8e8e8;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.modal-cancel, .modal-confirm {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
}

.modal-cancel {
  background: #f5f5f5;
  color: #666;
}

.modal-cancel:hover {
  background: #e8e8e8;
}

.modal-confirm {
  background: #1c4e80;
  color: white;
}

.modal-confirm:hover {
  background: #164066;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .stats-section {
    flex-direction: column;
  }
  
  .application-controls,
  .management-controls {
    grid-template-columns: 1fr;
  }
  
  .applications-table,
  .accounts-table {
    font-size: 12px;
  }
  
  .applications-table th,
  .applications-table td,
  .accounts-table th,
  .accounts-table td {
    padding: 12px 8px;
  }
  
  .action-buttons {
    flex-direction: column;
  }
  
  .view-btn, .approve-btn, .reject-btn,
  .edit-btn, .delete-btn {
    padding: 4px 6px;
    font-size: 11px;
  }
  
  .large-modal {
    width: 95%;
  }
}

@media (max-width: 480px) {
  .section-header {
    flex-direction: column;
    gap: 15px;
    align-items: flex-start;
  }
  
  .modal-content {
    width: 95%;
  }
}
</style>