<template>
  <view class="app-container">
    <!-- 顶部导航栏 -->
    <view class="top-header">
      <view class="header-left">
            <text class="header-current">后台管理系统</text>
      </view>
      <view class="header-right">
        <text class="current-module">当前：{{ getCurrentModuleName() }}</text>
        <text class="logout-link" @tap="logout">
          退出登录
        </text>
      </view>
    </view>

    <!-- 主体内容 -->
    <view class="main-content">
      <!-- 左侧侧拉栏 -->
      <view :class="['sidebar', { 'sidebar-collapsed': !drawerVisible }]">
        <!-- 侧拉栏内容 -->
        <view class="sidebar-content">
          <!-- 菜单列表 -->
          <view class="menu-list">
            <view 
              v-for="item in menuItems" 
              :key="item.key"
              :class="['menu-item', { active: activeMenu === item.key }]"
              @tap="switchMenu(item.key)"
            >
              <text class="menu-icon">{{ item.icon }}</text>
              <text v-if="drawerVisible" class="menu-title">{{ item.title }}</text>
            </view>
          </view>
          
          <!-- 菜单切换按钮 -->
          <view class="menu-toggle" @tap="toggleDrawer">
            <text class="toggle-text">{{ drawerVisible ? '点击收起菜单' : ' ←展开' }}</text>
          </view>
          
          <!-- 用户信息 -->
          <view v-if="drawerVisible" class="user-info">
            <text class="user-name">{{ currentUser.real_name }}</text>
            <text class="user-dept">{{ currentUser.department }}</text>
          </view>
        </view>
      </view>

      <!-- 模块内容区域 -->
      <view class="module-content">
        <!-- 审批信息管理 -->
        <view v-if="activeMenu === 'approval'" class="module-view">
          <audit-management></audit-management>
        </view>
        <!-- 审批账号管理 -->
        <view v-if="activeMenu === 'account'" class="module-view">
          <account-management></account-management>
        </view>
        <!-- 通知管理 -->
        <view v-if="activeMenu === 'notification'" class="module-view">
          <notification-management></notification-management>
        </view>
        <!-- 数据看板 -->
        <view v-if="activeMenu === 'dashboard'" class="module-view">
          <data-screen></data-screen>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
// 修复组件导入方式，避免使用动态导入
import AuditManagement from './aud.vue';
import AccountManagement from './mgr.vue';
import NotificationManagement from './not.vue';
import DataScreen from './screen.vue';

export default {
	data() {
		return {
			// 当前用户信息
			currentUser: {
				real_name: '管理员',
				role: '超级管理员',
				department: '信息技术中心',
				username: 'admin'
			},
			// 菜单项
			menuItems: [
				{ key: 'approval', title: '审批信息管理', icon: '审' },
				{ key: 'account', title: '审批账号管理', icon: '号' },
				{ key: 'notification', title: '通知管理', icon: '告' },
				{ key: 'dashboard', title: '数据看板', icon: '图' }
			],
			// 当前激活的菜单
			activeMenu: 'approval',
			drawerVisible: false
		}
	},
	components: {
		'audit-management': AuditManagement,
		'account-management': AccountManagement,
		'notification-management': NotificationManagement,
		'data-screen': DataScreen
	},
	methods: {
		// 获取当前模块名称
		getCurrentModuleName() {
			const currentItem = this.menuItems.find(item => item.key === this.activeMenu)
			return currentItem ? currentItem.title : '后台管理'
		},
		// 切换菜单
		switchMenu(menuKey) {
			if (menuKey === 'dashboard') {
				// 数据大屏跳转到新页面
				uni.navigateTo({
					url: '/pages/admin/screen'
				})
			} else {
				this.activeMenu = menuKey
			}
			// 关闭侧边栏
			this.drawerVisible = false
		},
		// 切换侧边栏显示
		toggleDrawer() {
			this.drawerVisible = !this.drawerVisible
		},
		// 退出登录
		logout() {
			uni.removeStorageSync('currentUser')
			uni.reLaunch({
				url: '/pages/admin/login'
			})
		}
	},
	onLoad() {
		// 页面加载时的逻辑
	},
	onShow() {
		// 页面显示时的逻辑
	}
}
</script>

<style scoped>
.app-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f5f7fa;
}

/* 顶部导航栏 */
.top-header {
  height: 60px;
  background: #1c4e80;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
}

.header-left {
  background-color: #ffffff;
}

.current-module {
  font-size: 15px;
  font-weight: 600;
  color: #ffffff;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 20px;
}

.header-current {
  font-size: 20px;
  color: #1c4e80;
  font-weight: 500;
}

.logout-link {
  color: #b5f5fd;
  cursor: pointer;
  display: flex;
  align-items: center;
}

.logout-link:active {
  color: #ff4d4f;
}

/* 主体内容 */
.main-content {
  flex: 1;
  display: flex;
  margin-top: 60px; /* 为固定导航栏留出空间 */
}

/* 左侧侧拉栏 */
.sidebar {
  width: 250px;
  background: white;
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.1);
  transition: width 0.3s ease;
  overflow: hidden;
  position: relative;
}

.sidebar-collapsed {
  width: 60px;
}

/* 菜单切换按钮 */
.menu-toggle {
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f8f9fa;
  border-top: 1px solid #e9ecef;
  cursor: pointer;
  margin-top: 10px;
}

.menu-toggle:hover {
  background: #e9ecef;
}

.toggle-text {
  font-size: 16px;
  font-weight: 600;
  color: #1c4e80;
}

/* 侧拉栏内容 */
.sidebar-content {
  padding: 20px 0;
}

/* 用户信息 */
.user-info {
  text-align: center;
  padding: 20px;
  border-top: 1px solid #e9ecef;
  margin-top: 10px;
}

.user-avatar {
  width: 50px;
  height: 50px;
  background: #f0f7ff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 10px;
}

.user-name {
  display: block;
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin-bottom: 5px;
}

.user-dept {
  display: block;
  font-size: 12px;
  color: #666;
}

/* 菜单列表 */
.menu-list {
  padding: 0;
}

.menu-item {
  display: flex;
  align-items: center;
  padding: 15px 20px;
  margin-bottom: 5px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.menu-item:hover {
  background: #f0f7ff;
}

.menu-item.active {
  background: #1c4e80;
  color: white;
}

.menu-icon {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f0f7ff;
  border-radius: 4px;
  font-size: 18px;
  font-weight: 600;
  color: #1c4e80;
  margin-right: 12px;
  flex-shrink: 0;
}

.menu-title {
  font-size: 14px;
  font-weight: 500;
}

/* 模块内容区域 */
.module-content {
  flex: 1;
  background: linear-gradient(#c7e9f4 0%, #446daa, #1c4e80);
  overflow-y: auto;
  min-height: calc(100vh - 60px); /* 减去顶部导航栏高度 */
  height: calc(100vh - 60px);
}

.module-view {
  width: 100%;
  height: 100%;
  min-height: calc(100vh - 60px);
  flex-direction: column;
}

</style>