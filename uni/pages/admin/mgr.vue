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
          <text style="color: #fff; font-size: 16px;">+ 创建后台账号</text>
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
          <picker mode="selector" :range="roleOptions" :value="accountFilters.roleIndex" @change="onRoleChange" class="filter-select">
            <view class="picker-text">{{ getRoleText(accountFilters.role) }}</view>
          </picker>
          <picker mode="selector" :range="collegeFilterOptions" :value="accountFilters.collegeIndex" @change="onCollegeFilterChange" class="filter-select">
            <view class="picker-text">{{ accountFilters.college === 'all' ? '全部学院' : accountFilters.college }}</view>
          </picker>
        </view>
        
        <view class="filter-actions">
          <button class="search-btn" @click="loadAccounts">
            <text style="color: #fff; font-size: 16px;">🔍 搜索</text>
          </button>
          <button class="reset-btn" @click="resetAccountFilters">
            <text style="color: #666; font-size: 16px;">↻ 重置</text>
          </button>
        </view>
      </view>
      
      <scroll-view class="accounts-table-container" scroll-x="true">
        <view class="table-content">
          <view class="table-header">
            <view class="table-row">
              <view class="table-cell">用户ID</view>
              <view class="table-cell">真实姓名</view>
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
                <text style="color: #999; font-size: 24px;">🔍</text>
                <text>暂无账号记录</text>
              </view>
            </view>
            
            <view v-else v-for="account in accounts" :key="account.user_id" class="table-row account-row">
              <view class="table-cell">{{ account.user_id }}</view>
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
                    <text style="color: #1890ff; font-size: 14px;">✏ 修改</text>
                  </button>
                  <button class="delete-btn" @click="deleteAccount(account)">
                    <text style="color: #ff4d4f; font-size: 14px;">🗑 删除</text>
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
            <text style="color: #999; font-size: 16px;">×</text>
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
          <text class="modal-title">处理账号申请</text>
          <button class="modal-close" @click="closeApplicationsModal">
            <text style="color: #999; font-size: 16px;">×</text>
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
                    <text style="color: #999; font-size: 24px;">🔍</text>
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
                        <text style="color: #52c41a; font-size: 14px;">✓ 通过</text>
                      </button>
                      <button v-if="application.status === 'pending'" class="reject-btn" @click="rejectApplication(application)">
                        <text style="color: #ff4d4f; font-size: 14px;">✗ 拒绝</text>
                      </button>
                      <button v-if="application.status !== 'pending'" class="view-btn" @click="viewApplicationDetails(application)">
                        <text style="color: #666; font-size: 14px;">👁 详情</text>
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
import { getManagerStats, getAccounts, getApplications, createAccount, processApplication, deleteAccount, updateAccount } from '../../api/uniAdmin.js';

export default {
  data() {
    return {
      currentUser: null,
      approverCount: 5,
      pendingApplicationCount: 3,
      selectedCollege: '信息技术学院',
      selectedCollegeIndex: 0,
      
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
        '信息技术学院',
        '治安学院',
        '交通管理学院',
        '保卫处'
      ],
      
      collegeFilterOptions: [
        '全部学院',
        '信息技术学院',
        '治安学院',
        '交通管理学院',
        '保卫处'
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
    
    async loadApplications() {
      try {
        // 使用当前用户的学院进行筛选
        const userCollege = this.currentUser && this.currentUser.college ? this.currentUser.college : null;
        const result = await getApplications({
          position: this.applicationFilters.position === 'all' ? null : this.applicationFilters.position,
          college: userCollege
        });
        
        if (result && result.code === 0) {
          this.applications = result.data || [];
        } else {
          uni.showToast({
            title: '获取申请数据失败',
            icon: 'none'
          });
          this.applications = [];
        }
      } catch (error) {
        console.error('获取申请数据失败:', error);
        uni.showToast({
          title: '网络错误',
          icon: 'none'
        });
        this.applications = [];
      }
    },
    
    async loadAccounts() {
      try {
        const result = await getAccounts({
          role: this.accountFilters.role === 'all' ? null : this.accountFilters.role,
          college: this.accountFilters.college === 'all' ? null : this.accountFilters.college
        });
        
        if (result && result.code === 0) {
          this.accounts = result.data || [];
        } else {
          uni.showToast({
            title: '获取账号数据失败',
            icon: 'none'
          });
          this.accounts = [];
        }
      } catch (error) {
        console.error('获取账号数据失败:', error);
        uni.showToast({
          title: '网络错误',
          icon: 'none'
        });
        this.accounts = [];
      }
    },
    
    resetApplicationFilters() {
      this.applicationFilters = { position: 'all' };
      this.loadApplications();
    },
    
    resetAccountFilters() {
      // 保持当前用户的默认学院设置
      const defaultCollege = this.currentUser && this.currentUser.college ? this.currentUser.college : 'all';
      const defaultCollegeIndex = defaultCollege === 'all' ? 0 : this.collegeFilterOptions.findIndex(college => college === defaultCollege);
      
      this.accountFilters = { 
        role: 'all', 
        college: defaultCollege,
        roleIndex: 0,
        collegeIndex: defaultCollegeIndex !== -1 ? defaultCollegeIndex : 0
      };
      this.loadAccounts();
    },
    
    async approveApplication(application) {
      try {
        const res = await uni.showModal({
          title: '确认操作',
          content: `确定要通过 ${application.real_name} 的审批人申请吗？`
        });
        
        if (res.confirm) {
          const result = await processApplication({
            application_id: application.application_id,
            action: 'approve'
          });
          
          if (result && result.code === 0) {
            uni.showToast({
              title: '已通过申请',
              icon: 'success'
            });
            this.loadApplications();
            this.loadStats();
          } else {
            uni.showToast({
              title: '操作失败',
              icon: 'none'
            });
          }
        }
      } catch (error) {
        console.error('审批申请失败:', error);
        uni.showToast({
          title: '网络错误',
          icon: 'none'
        });
      }
    },

    async rejectApplication(application) {
      try {
        const res = await uni.showModal({
          title: '确认操作',
          content: `确定要拒绝 ${application.real_name} 的审批人申请吗？`
        });
        
        if (res.confirm) {
          const result = await processApplication({
            application_id: application.application_id,
            action: 'reject'
          });
          
          if (result && result.code === 0) {
            uni.showToast({
              title: '已拒绝申请',
              icon: 'success'
            });
            this.loadApplications();
            this.loadStats();
          } else {
            uni.showToast({
              title: '操作失败',
              icon: 'none'
            });
          }
        }
      } catch (error) {
        console.error('拒绝申请失败:', error);
        uni.showToast({
          title: '网络错误',
          icon: 'none'
        });
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
    
    async deleteAccount(account) {
      try {
        const res = await uni.showModal({
          title: '确认删除',
          content: `确定要删除 ${account.real_name} 的账号吗？此操作不可恢复！`
        });
        
        if (res.confirm) {
          const result = await deleteAccount({
            user_id: account.user_id
          });
          
          if (result && result.code === 0) {
            uni.showToast({
              title: '账号已删除',
              icon: 'success'
            });
            this.loadAccounts();
            this.loadStats();
          } else {
            uni.showToast({
              title: '删除失败',
              icon: 'none'
            });
          }
        }
      } catch (error) {
        console.error('删除账号失败:', error);
        uni.showToast({
          title: '网络错误',
          icon: 'none'
        });
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
    
    async createAccount() {
      if (!this.newAccount.username || !this.newAccount.password || 
          !this.newAccount.real_name || !this.newAccount.phone || 
          !this.newAccount.college) {
        uni.showToast({ title: '请填写所有必填字段', icon: 'none' });
        return;
      }
      
      try {
        const result = await createAccount({
          username: this.newAccount.username,
          password: this.newAccount.password,
          real_name: this.newAccount.real_name,
          phone: this.newAccount.phone,
          college: this.newAccount.college,
          position: this.newAccount.position,
          role: 'admin' // 默认创建后台账号
        });
        
        if (result && result.code === 0) {
          uni.showToast({
            title: '后台账号创建成功',
            icon: 'success'
          });
          this.closeCreateModal();
          this.loadAccounts();
          this.loadStats();
        } else {
          uni.showToast({
            title: result.message || '创建失败',
            icon: 'none'
          });
        }
      } catch (error) {
        console.error('创建账号失败:', error);
        uni.showToast({
          title: '网络错误',
          icon: 'none'
        });
      }
    },
    
    async loadStats() {
      try {
        const result = await getManagerStats({
          college: this.selectedCollege === '全部学院' ? null : this.selectedCollege
        });
        
        if (result && result.code === 0) {
          this.approverCount = result.data.approverCount || 0;
          this.pendingApplicationCount = result.data.pendingApplications || 0;
        } else {
          uni.showToast({
            title: '获取统计数据失败',
            icon: 'none'
          });
        }
      } catch (error) {
        console.error('获取统计数据失败:', error);
        uni.showToast({
          title: '网络错误',
          icon: 'none'
        });
      }
    },
    
    async getCurrentUserInfo() {
      try {
        const currentUser = uni.getStorageSync('currentUser');
        if (currentUser) {
          this.currentUser = currentUser;
          // 设置默认学院为当前用户所属学院
          if (currentUser.college) {
            const collegeIndex = this.collegeOptions.findIndex(college => college === currentUser.college);
            if (collegeIndex !== -1) {
              this.selectedCollege = currentUser.college;
              this.selectedCollegeIndex = collegeIndex;
              // 设置账号筛选的默认学院
              this.accountFilters.college = currentUser.college;
              const filterIndex = this.collegeFilterOptions.findIndex(college => college === currentUser.college);
              if (filterIndex !== -1) {
                this.accountFilters.collegeIndex = filterIndex;
              }
            }
          }
        }
      } catch (error) {
        console.error('获取当前用户信息失败:', error);
      }
    },

    onLoad() {
      this.getCurrentUserInfo();
      this.loadAccounts();
      this.loadStats();
    }
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
  gap: 2px;
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