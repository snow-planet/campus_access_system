<template>
  <view class="approver-management">
    <!-- 顶部统计卡片模块 -->
    <view class="stats-section">
      <view class="stat-card">
        <view class="stat-content">
          <label class="filter-label">选择学院：</label>
          <picker mode="selector" :range="collegeOptions" :value="selectedCollegeIndex" @change="onCollegeChange" class="filter-select">
            <view class="picker-text">{{ selectedCollege }}</view>
          </picker>
          <view class="stat-number">审批账号数量：{{ approverCount }}</view>
        </view>
      </view>
      
      <view class="stats-alert" @click="showPendingApplications">
        <view class="alert-content">
          <view class="alert-title" v-if="hasPendingApplications">
            有 {{ pendingApplicationCount }} 个申请待处理
          </view>
          <view class="alert-title" v-else>
            暂无待处理申请
          </view>
          <view class="alert-subtitle">点击查看详情</view>
        </view>
        <button class="create-btn" @click.stop="showCreateModal">
          <uni-icons type="plus" size="16" color="#fff"></uni-icons> 创建后台账号
        </button>
      </view>
    </view>

    <!-- 账号管理模块 -->
    <view class="account-management-section">
      <view class="section-header">
        <h2>账号管理</h2>
      </view>
      
      <view class="management-controls">
        <view class="filter-group">
          <label class="filter-label">类型：</label>
          <picker mode="selector" :range="roleOptions" :value="accountFilters.roleIndex" @change="onRoleChange" class="filter-select">
            <view class="picker-text">{{ getRoleText(accountFilters.role) }}</view>
          </picker>
        </view>
        
        <view class="filter-group">
          <label class="filter-label">所属：</label>
          <picker mode="selector" :range="collegeFilterOptions" :value="accountFilters.collegeIndex" @change="onCollegeFilterChange" class="filter-select">
            <view class="picker-text">{{ accountFilters.college === 'all' ? '全部学院' : accountFilters.college }}</view>
          </picker>
        </view>
        
        <view class="filter-actions">
          <button class="search-btn" @click="loadAccounts">
            <uni-icons type="search" size="16" color="#fff"></uni-icons> 搜索
          </button>
          <button class="reset-btn" @click="resetAccountFilters">
            <uni-icons type="refresh" size="16" color="#666"></uni-icons> 重置
          </button>
        </view>
      </view>
      
      <scroll-view class="accounts-table-container" scroll-x="true">
        <view class="table-content">
          <view class="table-header">
            <view class="table-row">
              <view class="table-cell">用户ID</view>
              <view class="table-cell">用户名</view>
              <view class="table-cell">联系电话</view>
              <view class="table-cell">学院/部门</view>
              <view class="table-cell">职位</view>
              <view class="table-cell">账号类型</view>
              <view class="table-cell">操作</view>
            </view>
          </view>
          <view class="table-body">
            <view v-if="accounts.length === 0" class="empty-state">
              <view class="empty-content">
                <uni-icons type="search" size="24" color="#999"></uni-icons>
                <text>暂无账号记录</text>
              </view>
            </view>
            
            <view v-else v-for="account in accounts" :key="account.user_id" class="table-row account-row">
              <view class="table-cell">{{ account.user_id }}</view>
              <view class="table-cell">{{ account.username }}</view>
              <view class="table-cell">{{ account.real_name }}</view>
              <view class="table-cell">{{ account.phone }}</view>
              <view class="table-cell">{{ account.college || '-' }}</view>
              <view class="table-cell">
                {{ getPositionText(account.position) }}
              </view>
              <view class="table-cell">
                <text :class="['role-badge', account.role]">
                  {{ getRoleText(account.role) }}
                </text>
              </view>
              <view class="table-cell">
                <view class="action-buttons">
                  <button class="edit-btn" @click="editAccount(account)">
                    <uni-icons type="compose" size="14" color="#1890ff"></uni-icons> 修改
                  </button>
                  <button class="delete-btn" @click="deleteAccount(account)">
                    <uni-icons type="trash" size="14" color="#ff4d4f"></uni-icons> 删除
                  </button>
                </view>
              </view>
            </view>
          </view>
        </view>
      </scroll-view>
    </view>

    <!-- 创建账号模态框 -->
    <view v-if="showCreateAccountModal" class="modal-overlay">
      <view class="modal-content">
        <view class="modal-header">
          <h3>创建后台账号</h3>
          <button class="modal-close" @click="closeCreateModal">
            <uni-icons type="close" size="16" color="#999"></uni-icons>
          </button>
        </view>
        <view class="modal-body">
          <view class="form-group">
            <label class="form-label">用户名</label>
            <input type="text" v-model="newAccount.username" class="form-input" placeholder="请输入用户名">
          </view>
          <view class="form-group">
            <label class="form-label">密码</label>
            <input type="password" v-model="newAccount.password" class="form-input" placeholder="请输入密码">
          </view>
          <view class="form-group">
            <label class="form-label">联系电话</label>
            <input type="text" v-model="newAccount.phone" class="form-input" placeholder="请输入联系电话">
          </view>
          <view class="form-group">
            <label class="form-label">学院/部门</label>
            <picker mode="selector" :range="collegeOptions" :value="newAccount.collegeIndex" @change="onNewAccountCollegeChange" class="form-input">
              <view class="picker-text">{{ newAccount.college || '请选择学院/部门' }}</view>
            </picker>
          </view>
          <view class="form-group">
            <label class="form-label">职位</label>
            <picker mode="selector" :range="positionOptions" :value="newAccount.positionIndex" @change="onNewAccountPositionChange" class="form-input">
              <view class="picker-text">{{ getPositionText(newAccount.position) }}</view>
            </picker>
          </view>
        </view>
        <view class="modal-footer">
          <button class="modal-cancel" @click="closeCreateModal">取消</button>
          <button class="modal-confirm" @click="createAccount">确认创建</button>
        </view>
      </view>
    </view>

    <!-- 处理申请模态框 -->
    <view v-if="showApplicationsModal" class="modal-overlay">
      <view class="modal-content large-modal">
        <view class="modal-header">
          <h3>处理账号申请</h3>
          <button class="modal-close" @click="closeApplicationsModal">
            <uni-icons type="close" size="16" color="#999"></uni-icons>
          </button>
        </view>
        <view class="modal-body">
          <scroll-view class="applications-table-container" scroll-x="true">
            <view class="table-content">
              <view class="table-header">
                <view class="table-row">
                  <view class="table-cell">申请人</view>
                  <view class="table-cell">手机号</view>
                  <view class="table-cell">学院</view>
                  <view class="table-cell">职位</view>
                  <view class="table-cell">申请时间</view>
                  <view class="table-cell">操作</view>
                </view>
              </view>
              <view class="table-body">
                <view v-if="applications.length === 0" class="empty-state">
                  <view class="empty-content">
                    <uni-icons type="search" size="24" color="#999"></uni-icons>
                    <text>暂无申请记录</text>
                  </view>
                </view>
                
                <view v-else v-for="application in applications" :key="application.application_id" class="table-row application-row">
                  <view class="table-cell">{{ application.real_name }}</view>
                  <view class="table-cell">{{ application.phone }}</view>
                  <view class="table-cell">{{ application.college }}</view>
                  <view class="table-cell">
                    {{ getPositionText(application.position) }}
                  </view>
                  <view class="table-cell">{{ formatDate(application.created_at) }}</view>
                  <view class="table-cell">
                    <view class="action-buttons">
                      <button v-if="application.status === 'pending'" class="approve-btn" @click="approveApplication(application)">
                        <uni-icons type="checkmark" size="14" color="#52c41a"></uni-icons> 通过
                      </button>
                      <button v-if="application.status === 'pending'" class="reject-btn" @click="rejectApplication(application)">
                        <uni-icons type="close" size="14" color="#ff4d4f"></uni-icons> 拒绝
                      </button>
                      <button v-if="application.status !== 'pending'" class="view-btn" @click="viewApplicationDetails(application)">
                        <uni-icons type="eye" size="14" color="#666"></uni-icons> 详情
                      </button>
                    </view>
                  </view>
                </view>
              </view>
            </view>
          </scroll-view>
        </view>
        <view class="modal-footer">
          <button class="modal-cancel" @click="closeApplicationsModal">关闭</button>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      approverCount: 5,
      pendingApplicationCount: 3,
      selectedCollege: '信息中心',
      selectedCollegeIndex: 6,
      
      applicationFilters: {
        position: 'all'
      },
      
      accountFilters: {
        role: 'all',
        college: 'all',
        roleIndex: 0,
        collegeIndex: 0
      },
      
      applications: [],
      accounts: [],
      
      showCreateAccountModal: false,
      showApplicationsModal: false,
      
      newAccount: {
        username: '',
        password: '',
        real_name: '',
        phone: '',
        college: '',
        position: 'teacher',
        collegeIndex: -1,
        positionIndex: 0
      },
      
      roleOptions: ['全部类型', '后台账号', '审批人账号'],
      positionOptions: ['二级学院负责人', '保卫处'],
      
      collegeOptions: [
        '计算机学院',
        '外国语学院',
        '经济管理学院',
        '电子工程学院',
        '机械工程学院',
        '保卫处',
        '信息中心'
      ],
      
      collegeFilterOptions: [
        '全部学院',
        '计算机学院',
        '外国语学院',
        '经济管理学院',
        '电子工程学院',
        '机械工程学院',
        '保卫处',
        '信息中心'
      ]
    }
  },
  
  computed: {
    hasPendingApplications() {
      return this.pendingApplicationCount > 0;
    }
  },
  
  methods: {
    getPositionText(position) {
      const positionMap = {
        'teacher': '教师',
        'security': '安保人员',
        'other': '其他'
      };
      return positionMap[position] || '未知';
    },
    
    getRoleText(role) {
      const roleMap = {
        'all': '全部类型',
        'admin': '后台账号',
        'approver': '审批人',
        'user': '普通用户'
      };
      return roleMap[role] || '未知';
    },
    
    onCollegeChange(e) {
      this.selectedCollegeIndex = e.detail.value;
      this.selectedCollege = this.collegeOptions[e.detail.value];
      this.loadStats();
    },
    
    onRoleChange(e) {
      this.accountFilters.roleIndex = e.detail.value;
      const roleMap = ['all', 'admin', 'approver'];
      this.accountFilters.role = roleMap[e.detail.value];
    },
    
    onCollegeFilterChange(e) {
      this.accountFilters.collegeIndex = e.detail.value;
      if (e.detail.value === 0) {
        this.accountFilters.college = 'all';
      } else {
        this.accountFilters.college = this.collegeOptions[e.detail.value - 1];
      }
    },
    
    onNewAccountCollegeChange(e) {
      this.newAccount.collegeIndex = e.detail.value;
      this.newAccount.college = this.collegeOptions[e.detail.value];
    },
    
    onNewAccountPositionChange(e) {
      this.newAccount.positionIndex = e.detail.value;
      const positionMap = ['teacher', 'security'];
      this.newAccount.position = positionMap[e.detail.value];
    },
    
    formatDate(dateString) {
      return new Date(dateString).toLocaleDateString('zh-CN');
    },
    
    loadApplications() {
      this.applications = [
        {
          application_id: 1001,
          user_id: 101,
          real_name: '张三',
          phone: '13800138000',
          college: this.selectedCollege,
          position: 'teacher',
          status: 'pending',
          created_at: '2023-10-15 09:30:00'
        },
        {
          application_id: 1002,
          user_id: 102,
          real_name: '李四',
          phone: '13900139000',
          college: this.selectedCollege,
          position: 'security',
          status: 'pending',
          created_at: '2023-10-16 14:20:00'
        }
      ].filter(app => {
        if (this.applicationFilters.position !== 'all' && app.position !== this.applicationFilters.position) return false;
        return true;
      });
    },
    
    loadAccounts() {
      this.accounts = [
        {
          user_id: 1,
          username: 'admin01',
          real_name: '系统管理员',
          phone: '13800138001',
          college: '信息中心',
          position: 'other',
          role: 'admin',
          status: 'active',
          created_at: '2023-09-01 08:00:00'
        },
        {
          user_id: 2,
          username: 'approver01',
          real_name: '李老师',
          phone: '13900139001',
          college: '计算机学院',
          position: 'teacher',
          role: 'approver',
          status: 'active',
          created_at: '2023-09-05 10:30:00'
        }
      ].filter(acc => {
        if (this.accountFilters.role !== 'all' && acc.role !== this.accountFilters.role) return false;
        if (this.accountFilters.college !== 'all' && acc.college !== this.accountFilters.college) return false;
        return true;
      });
    },
    
    resetApplicationFilters() {
      this.applicationFilters = { position: 'all' };
      this.loadApplications();
    },
    
    resetAccountFilters() {
      this.accountFilters = { 
        role: 'all', 
        college: 'all',
        roleIndex: 0,
        collegeIndex: 0
      };
      this.loadAccounts();
    },
    
    approveApplication(application) {
      if (confirm(`确定要通过 ${application.real_name} 的审批人申请吗？`)) {
        uni.showToast({ title: '已通过申请', icon: 'success' });
        this.loadApplications();
        this.loadStats();
      }
    },
    
    rejectApplication(application) {
      if (confirm(`确定要拒绝 ${application.real_name} 的审批人申请吗？`)) {
        uni.showToast({ title: '已拒绝申请', icon: 'success' });
        this.loadApplications();
        this.loadStats();
      }
    },
    
    viewApplicationDetails(application) {
      uni.showModal({
        title: '申请详情',
        content: `申请ID: ${application.application_id}\n申请人: ${application.real_name}`
      });
    },
    
    editAccount(account) {
      uni.showModal({
        title: '修改账号',
        content: `修改账号信息：${account.real_name}`
      });
    },
    
    deleteAccount(account) {
      if (confirm(`确定要删除 ${account.real_name} 的账号吗？`)) {
        uni.showToast({ title: '账号已删除', icon: 'success' });
      }
    },
    
    showCreateModal() {
      this.showCreateAccountModal = true;
    },
    
    closeCreateModal() {
      this.showCreateAccountModal = false;
      this.newAccount = {
        username: '',
        password: '',
        real_name: '',
        phone: '',
        college: '',
        position: 'teacher',
        collegeIndex: -1,
        positionIndex: 0
      };
    },
    
    showPendingApplications() {
      this.showApplicationsModal = true;
      this.loadApplications();
    },
    
    closeApplicationsModal() {
      this.showApplicationsModal = false;
    },
    
    createAccount() {
      if (!this.newAccount.username || !this.newAccount.password || 
          !this.newAccount.real_name || !this.newAccount.phone || 
          !this.newAccount.college) {
        uni.showToast({ title: '请填写所有必填字段', icon: 'none' });
        return;
      }
      
      uni.showToast({ title: '后台账号创建成功', icon: 'success' });
      this.closeCreateModal();
    },
    
    loadStats() {
      if (this.selectedCollege === '信息中心') {
        this.approverCount = 5;
        this.pendingApplicationCount = 3;
      } else {
        this.approverCount = 0;
        this.pendingApplicationCount = 0;
      }
    }
  },
  
  onLoad() {
    this.loadAccounts();
    this.loadStats();
  }
}
</script>

<style scoped>
.approver-management {
  background: linear-gradient(#c7e9f4 0%, #446daa, #1c4e80);
  height: 100%;
  min-height: 100%;
  display: flex;
  flex-direction: column;
}

.stats-section {
  display: flex;
  flex-direction: column;
}

.stat-card, .stats-alert {
  background: white;
  padding: 20px 10px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.stat-content {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.filter-label {
  font-size: 14px;
  color: #333;
  font-weight: 500;
}

.filter-select {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  background: white;
  min-width: 120px;
}

.form-input {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  background: white;
  min-width: 200px;
}

.picker-text {
  color: #333;
  font-size: 14px;
}

.stat-number {
  font-size: 18px;
  font-weight: bold;
  color: #1c4e80;
}

.stats-alert {
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
}

.alert-title {
  font-size: 16px;
  font-weight: bold;
  color: #1c4e80;
}

.alert-subtitle {
  font-size: 12px;
  color: #999;
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
}

.account-management-section {
  background: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.section-header {
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

.management-controls {
  padding: 20px;
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  align-items: end;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
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
}

.search-btn {
  background: #1c4e80;
  color: white;
}

.reset-btn {
  background: #f5f5f5;
  color: #666;
  border: 1px solid #ddd;
}

.accounts-table-container, .applications-table-container {
  width: 100%;
  overflow-x: auto;
  flex: 1;
}

.table-content {
  min-width: 100%;
}

.table-header, .table-body {
  display: table;
  width: 100%;
}

.table-row {
  display: table-row;
}

.table-cell {
  display: table-cell;
  padding: 16px;
  border-bottom: 1px solid #f0f0f0;
  vertical-align: middle;
  text-align: left;
  white-space: nowrap;
}

.table-header .table-cell {
  background: #fafafa;
  font-weight: 600;
  color: #333;
  font-size: 14px;
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

.action-buttons {
  display: flex;
  gap: 8px;
}

.view-btn, .approve-btn, .reject-btn, .edit-btn, .delete-btn {
  padding: 6px 12px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  display: flex;
  align-items: center;
  gap: 4px;
}

.view-btn {
  background: #f0f0f0;
  color: #666;
}

.approve-btn {
  background: #f6ffed;
  color: #52c41a;
  border: 1px solid #b7eb8f;
}

.reject-btn {
  background: #fff2f0;
  color: #ff4d4f;
  border: 1px solid #ffccc7;
}

.edit-btn {
  background: #e6f7ff;
  color: #1890ff;
  border: 1px solid #91d5ff;
}

.delete-btn {
  background: #fff2f0;
  color: #ff4d4f;
  border: 1px solid #ffccc7;
}

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
  width: 90%;
  max-height: 80%;
  overflow-y: auto;
}

.large-modal {
  width: 95%;
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
  cursor: pointer;
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
  font-size: 14px;
}

.form-input {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
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

.modal-confirm {
  background: #1c4e80;
  color: white;
}

.account-row:hover, .application-row:hover {
  background: #fafafa;
}
</style>