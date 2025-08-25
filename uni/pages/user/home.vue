<template>
	<view class="user-home">
		<!-- 顶部导航栏 -->
		<view class="header">
			<view class="header-left">
				<view class="logout-link" @tap="logout">
					<text>← 返回首页</text>
				</view>
			</view>
			<view class="header-center">
				<text class="header-current">用户中心</text>
			</view>
			<view class="header-right">
				<!-- 右侧可放置其他功能 -->
			</view>
		</view>

		<!-- 切换按钮区域 - 修改为占据整行 -->
		<view class="tab-buttons">
			<view 
				:class="['tab-button', activeTab === 'notice' ? 'tab-button-active' : '']"
				@tap="activeTab = 'notice'"
			>
				<text>公告查看</text>
			</view>
			<view 
				:class="['tab-button', activeTab === 'personal' ? 'tab-button-active' : '']"
				@tap="activeTab = 'personal'"
			>
				<text>个人预约</text>
			</view>
			<view 
				:class="['tab-button', activeTab === 'group' ? 'tab-button-active' : '']"
				@tap="activeTab = 'group'"
			>
				<text>团体预约</text>
			</view>
		</view>

    	<!-- 主体内容 -->
		<view class="main">
			<!-- 系统公告区域 -->
			<view v-if="activeTab === 'notice'" class="tab-content">
				<view class="announcement-section">
					<view class="announcement-header">
						<text class="announcement-title">系统公告</text>
					</view>
					<scroll-view class="announcement-list" scroll-y="true" :show-scrollbar="false">
						<view v-if="announcements.length > 0">
							<!-- 修复v-if和v-for不能同级使用的问题 -->
							<view class="announcement-item" v-for="(item, index) in announcements" :key="index" @tap="viewAnnouncement(item)">
								<view class="announcement-content">
									<view class="announcement-meta">
										<text class="announcement-type" :class="item.important ? 'important' : ''">{{item.type}}</text>
										<text class="announcement-time">{{item.time}}</text>
									</view>
									<text class="announcement-text">{{item.content}}</text>
								</view>
								<view class="announcement-arrow">
									<text class="arrow">→</text>
								</view>
							</view>
						</view>
						<view v-else class="empty-announcement">
							<text class="empty-text">暂无公告信息</text>
						</view>
					</scroll-view>
				</view>
			</view>

			<!-- 个人预约 -->
			<view v-if="activeTab === 'personal'" class="tab-content">
				<personal-form></personal-form>
			</view>

			<!-- 团体预约 -->
			<view v-if="activeTab === 'group'" class="tab-content">
				<group-form></group-form>
			</view>
		</view>
	</view>
</template>

<script>
// 修复组件导入方式，避免使用动态导入
import PersonalForm from './form.vue';
import GroupForm from './group.vue';

export default {
	data() {
		return {
			activeTab: 'notice',
			// 模拟公告数据
			announcements: [
				{
					id: 1,
					type: '重要通知',
					content: '校园出入管理系统将于本周六进行升级维护，届时系统将暂停服务2小时。',
					time: '2023-10-15',
					important: true
				},
				{
					id: 2,
					type: '规则更新',
					content: '为进一步加强校园安全管理，即日起所有预约需提前至少2小时提交。',
					time: '2023-10-10',
					important: false
				},
				{
					id: 3,
					type: '温馨提示',
					content: '请师生们合理安排预约时间，避免高峰期系统拥堵。',
					time: '2023-10-05',
					important: false
				}
			]
		}
	},
	methods: {
		// 返回首页
		logout() {
			uni.navigateBack()
		},
		// 查看公告详情
		viewAnnouncement(item) {
			uni.showModal({
				title: item.type,
				content: item.content,
				showCancel: false,
				confirmText: '知道了'
			})
		}
	},
	components: {
		'personal-form': PersonalForm,
		'group-form': GroupForm
	}
}
</script>

<style scoped>
.user-home {
	min-height: 100vh;
	display: flex;
	flex-direction: column;
	background: linear-gradient(#c7e9f4 0%, #446daa, #1c4e80);
}

/* 顶部导航栏样式 */
.header {
	background: white;
	height: 100rpx;
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 0 30rpx;
	box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.1);
}

.header-center {
	flex: 1;
	text-align: center;
}

.header-current {
	font-size: 36rpx;
	color: #1c4e80;
	font-weight: 600;
}

.logout-link {
	color: #666;
	font-size: 28rpx;
	padding: 12rpx 20rpx;
}

/* 切换按钮区域 - 修改为占据整行 */
.tab-buttons {
	display: flex;
	justify-content: center;
	background: white;
	box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.08);
	width: 100%; /* 添加宽度100% */
}

.tab-button {
	padding: 20rpx 50rpx;
	background: #f0f0f0;
	color: #666;
	font-size: 28rpx;
	font-weight: 500;
	transition: all 0.3s ease;
	flex: 1; /* 添加flex:1使每个按钮平均分配宽度 */
	text-align: center; /* 文字居中 */
}

.tab-button-active {
	background: #1c4e80;
	color: white;
}

/* 主体内容样式 */
.main {
	flex: 1;
	padding: 30rpx;
}

/* 系统公告区域 */
.announcement-section {
	background: rgba(255, 255, 255, 0.9);
	border-radius: 20rpx;
	padding: 30rpx;
	box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.08);
}

.announcement-header {
	display: flex;
	align-items: center;
	margin-bottom: 30rpx;
	padding-bottom: 20rpx;
	border-bottom: 2rpx solid #f0f0f0;
}

.announcement-title {
	font-size: 36rpx;
	font-weight: 600;
	color: #1c4e80;
}

.announcement-list {
	max-height: 1000rpx;
}

.announcement-item {
	display: flex;
	align-items: center;
	padding: 24rpx;
	border-radius: 12rpx;
	background: #f8f9fa;
	margin-bottom: 20rpx;
	transition: all 0.3s ease;
}

.announcement-item:active {
	background: #e9ecef;
	transform: translateY(2rpx);
}

.announcement-content {
	flex: 1;
}

.announcement-meta {
	display: flex;
	align-items: center;
	justify-content: space-between;
	margin-bottom: 12rpx;
}

.announcement-type {
	font-size: 24rpx;
	padding: 6rpx 16rpx;
	border-radius: 8rpx;
	background: #e3f2fd;
	color: #1976d2;
	font-weight: 500;
}

.announcement-type.important {
	background: #ffebee;
	color: #d32f2f;
}

.announcement-time {
	font-size: 24rpx;
	color: #999;
}

.announcement-text {
	font-size: 28rpx;
	color: #374151;
	line-height: 1.5;
}

.announcement-arrow {
	width: 40rpx;
	height: 40rpx;
	display: flex;
	align-items: center;
	justify-content: center;
}

.arrow {
	font-size: 28rpx;
	color: #9ca3af;
	font-weight: bold;
}

.empty-announcement {
	display: flex;
	justify-content: center;
	align-items: center;
	padding: 60rpx 20rpx;
}

.empty-text {
	font-size: 28rpx;
	color: #9ca3af;
	font-style: italic;
}
</style>