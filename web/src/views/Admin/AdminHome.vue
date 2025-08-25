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
        <span class="admin-info">{{ currentUser.department }}，{{ currentUser.username }}，{{ currentUser.real_name }}</span>
        <span class="header-current">后台管理系统</span>
        <span class="logout-link" @click="logout">
          <LogoutOutlined :style="{ marginRight: '5px' }" />
          退出登录
        </span>
      </div>
    </header>

    <!-- 主体内容 -->
    <main class="main-content">
      <!-- 左侧菜单 -->
      <div class="sidebar">
        <div class="menu-section">
          <div 
            v-for="item in menuItems" 
            :key="item.key"
            :class="['menu-item', { active: activeMenu === item.key }]"
            @click="switchMenu(item.key)"
          >
            <component :is="item.icon" class="menu-icon" />
            <span class="menu-text">{{ item.title }}</span>
          </div>
        </div>
      </div>

      <!-- 右侧内容区域 -->
      <div class="content-area">
        <!-- 根据选择的菜单显示不同的内容模块 -->
        <component :is="getCurrentComponent()" />
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { 
  BankOutlined,
  BarChartOutlined,
  LogoutOutlined,
  EyeOutlined,
  UserOutlined,
  NotificationOutlined,
  DashboardOutlined
} from '@ant-design/icons-vue'
import AuditManagement from './aud.vue'
import AccountManagement from './mgr.vue'
import NotificationManagement from './not.vue'
import DataScreen from './screen.vue'

const router = useRouter()

// 当前用户信息
// 当前用户信息
const currentUser = reactive({
  real_name: '管理员',
  role: '超级管理员',
  department: '信息技术中心',
  username: 'admin' 
})

// 菜单项
const menuItems = [
  { key: 'approval', title: '审批信息管理', icon: EyeOutlined },
  { key: 'account', title: '审批账号管理', icon: UserOutlined },
  { key: 'notification', title: '通知管理', icon: NotificationOutlined },
  { key: 'dashboard', title: '数据大屏', icon: BarChartOutlined }
]

// 当前激活的菜单
const activeMenu = ref('approval')

// 获取菜单图标
const getMenuIcon = (menuKey) => {
  const menu = menuItems.find(item => item.key === menuKey)
  return menu ? menu.icon : DashboardOutlined
}

// 获取菜单标题
const getMenuTitle = (menuKey) => {
  const menu = menuItems.find(item => item.key === menuKey)
  return menu ? menu.title : '功能模块'
}

// 获取当前组件
const getCurrentComponent = () => {
  const componentMap = {
    'approval': AuditManagement,
    'account': AccountManagement,
    'notification': NotificationManagement,
    'dashboard': DataScreen
  }
  return componentMap[activeMenu.value] || AuditManagement
}

// 切换菜单（修改dashboard处理）
const switchMenu = (menuKey) => {
  if (menuKey === 'dashboard') {
    // 数据大屏跳转到新页面
    router.push('/admin/screen')
  } else {
    activeMenu.value = menuKey
  }
}

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
  background: #f5f7fa;
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
  font-size: 24px;
  font-weight: 700;
  color: #1c4e80;
  margin-right: 12px;
}

.sub-title {
  font-size: 14px;
  color: #666;
  font-weight: 400;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 20px;
}

.admin-info {
  font-size: 14px;
  color: #1c4e80;
  background: #f0f7ff;
  padding: 6px 12px;
  border-radius: 12px;
  font-weight: 500;
}

.header-current {
  font-size: 16px;
  color: #333;
  font-weight: 500;
}

.dashboard-btn {
  background: #1c4e80;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  font-size: 14px;
  transition: all 0.3s ease;
}

.dashboard-btn:hover {
  background: #164066;
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
  background: linear-gradient(135deg, #c7e9f4 0%, #446daa 50%, #1c4e80 100%);
  padding: 0;
  display: flex;
  min-height: calc(100vh - 70px);
  margin-top: 70px;
}

/* 左侧菜单 */
.sidebar {
  width: 250px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  padding: 20px 0;
  box-shadow: 2px 0 10px rgba(0, 0, 0, 0.1);
}

.menu-section {
  display: flex;
  flex-direction: column;
}

.menu-item {
  display: flex;
  align-items: center;
  padding: 15px 25px;
  cursor: pointer;
  transition: all 0.3s ease;
  color: #666;
  font-size: 16px;
  border-left: 4px solid transparent;
}

.menu-item:hover {
  background: #f0f7ff;
  color: #1c4e80;
}

.menu-item.active {
  background: #1c4e80;
  color: white;
  border-left-color: #164066;
}

.menu-icon {
  margin-right: 12px;
  font-size: 18px;
}

.menu-text {
  font-weight: 500;
}

/* 右侧内容区域 */
.content-area {
  flex: 1;
  padding: 0;
  overflow-y: auto;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .top-header {
    padding: 0 15px;
    flex-direction: column;
    height: auto;
    padding: 15px;
  }
  
  .header-left, .header-right {
    width: 100%;
    justify-content: center;
  }
  
  .header-right {
    margin-top: 10px;
    flex-wrap: wrap;
    gap: 10px;
  }
  
  .main-content {
    flex-direction: column;
    margin-top: 120px;
  }
  
  .sidebar {
    width: 100%;
    order: 2;
  }
  
  .menu-section {
    flex-direction: row;
    overflow-x: auto;
    padding: 0 15px;
  }
  
  .menu-item {
    white-space: nowrap;
    padding: 10px 15px;
    border-left: none;
    border-bottom: 3px solid transparent;
  }
  
  .menu-item.active {
    border-left: none;
    border-bottom-color: #164066;
  }
  
  .content-area {
    order: 1;
    padding: 20px;
  }
  
  .module-placeholder {
    padding: 30px 20px;
  }
  
  .placeholder-icon {
    font-size: 48px;
  }
  
  .module-placeholder h3 {
    font-size: 20px;
  }
}

@media (max-width: 480px) {
  .main-title {
    font-size: 20px;
  }
  
  .sub-title {
    font-size: 12px;
  }
  
  .admin-info {
    font-size: 12px;
    padding: 4px 8px;
  }
  
  .header-current {
    font-size: 14px;
  }
  
  .dashboard-btn, .logout-link {
    font-size: 12px;
    padding: 6px 12px;
  }
  
  .menu-text {
    font-size: 14px;
  }
  
  .menu-icon {
    font-size: 16px;
    margin-right: 8px;
  }
}
</style>