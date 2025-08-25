<template>
	<view class="container">
		<!-- 顶部标题区域 -->
		<view class="header">
			<view class="logo-section">
				<view class="title-group">
					<text class="main-title">校园出入预约平台</text>
					<text class="sub-title">Campus Access System</text>
				</view>
			</view>
			<text class="welcome-desc">
			    请您严格执行校园安全管理制度，规范人员出入流程，确保校园安全。
			</text>
		</view>
		
		<!-- 功能模块区域 -->
		<view class="modules">
			
			<!-- 用户预约模块 -->
			<view class="module-card" @tap="goToUserHome">
				<view class="module-content">
					<text class="module-title">开始预约</text>
				</view>
				<view class="module-arrow">
					<text class="arrow">→</text>
				</view>
			</view>
			<!-- 审批系统模块 -->
			<view class="module-card" @tap="goToAdminLogin">
				<view class="module-content">
					<text class="module-title">审批系统</text>
				</view>
				<view class="module-arrow">
					<text class="arrow">→</text>
				</view>
			</view>
			
			<!-- 公众号区域 -->
			        <view class="gz-content">
			          <view class="gz-section">
			              <image src="/static/logo.png" class="qr-image"></image>
			              <text class="gz-desc">扫码关注公众号查询/申请结果</text>
			          </view>
			        </view>
			
			<!-- 底部信息 -->
			<view class="footer">
				<text class="footer-text">网页</text>
			</view>
		</view>
	</view>
</template>

<script>
export default {
	data() {
		return {
			
		}
	},
	methods: {
		// 跳转到用户预约页面
		goToUserHome() {
			uni.navigateTo({
				url: '/pages/user/home'
			})
		},
		// 跳转到管理员登录页面
		goToAdminLogin() {
			uni.navigateTo({
				url: '/pages/admin/login'
			})
		}
	}
}
</script>

<style>
    /* 移除通配符选择器，小程序不支持 */
    
    body, page, .container {
        height: 100vh;
        overflow: hidden;
    }
    
    .container {
        background: linear-gradient(135deg, #c7e9f4 0%, #446daa, #1c4e80);
        padding: 70rpx 40rpx 20rpx;
        box-sizing: border-box;
        display: flex;
        flex-direction: column;
    }
    
    /* 顶部标题区域 */
    .header {
        margin-bottom: 30rpx;
        flex-shrink: 0;
    }
    
    .logo-section {
        display: flex;
        flex-direction: column;
        align-items: center;
    }
    
    .title-group {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 10rpx;
    }
    
    .main-title {
        font-size: 60rpx;
        font-weight: 800;
        color: #ffffff;
        text-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.2);
    }
    
    .sub-title {
        font-size: 30rpx;
        color: rgba(255, 255, 255, 0.85);
        letter-spacing: 2rpx;
    }
    
    /* 欢迎描述 */
    .welcome-desc {
        font-size: 33rpx;
        color: rgba(255, 255, 255, 0.9);
        line-height: 1.6;
		margin-top: 30rpx;
        margin-bottom: 30rpx;
        text-align: center;
        text-shadow: 0 1rpx 3rpx rgba(0, 0, 0, 0.2);
        flex-shrink: 0;
    }
    
    /* 功能模块区域 */
    .modules {
        display: flex;
        flex-direction: column;
        gap: 20rpx;
        flex: 1;
        overflow: hidden;
		padding: 0 25rpx;
    }
    
    .module-card {
        background: rgba(255, 255, 255, 0.95);
        border-radius: 40rpx;
        padding: 50rpx 50rpx;
        display: flex;
        align-items: center;
        justify-content: space-between;
        box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.12);
        transition: all 0.3s ease;
        border: 2rpx solid transparent;
        backdrop-filter: blur(10rpx);
        flex-shrink: 0;
    }
    
    .module-card:active {
        transform: translateY(4rpx);
        box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.1);
        border-color: rgba(59, 130, 246, 0.3);
    }
    
    .module-content {
        display: flex;
        flex-direction: column;
    }
    
    .module-title {
        font-size: 40rpx;
        font-weight: 500;
        color: #2d3748;
    }
    
    .module-arrow {
        width: 44rpx;
        height: 44rpx;
        display: flex;
        align-items: center;
        justify-content: center;
        background: rgba(59, 130, 246, 0.1);
        border-radius: 50%;
    }
    
    .arrow {
        font-size: 28rpx;
        color: #3b82f6;
        font-weight: bold;
    }
    
    /* 公众号区域 */
    .gz-content {
        margin: 30rpx 0;
        display: flex;
        justify-content: center;
        flex-shrink: 0;
    }
    
    .gz-section {
        border-radius: 20rpx;
        padding: 24rpx;
        text-align: center;
        backdrop-filter: blur(10rpx);
        border: 1rpx solid rgba(255, 255, 255, 0.2);
        box-shadow: 0 6rpx 18rpx rgba(0, 0, 0, 0.1);
    }
    
    .gz-section img {
        width: 200rpx;
        height: 200rpx;
        border-radius: 12rpx;
        box-shadow: 0 6rpx 18rpx rgba(0, 0, 0, 0.15);
        margin-bottom: 35rpx;
    }
    
    .gz-desc {
        font-size: 30rpx;
        color: rgba(255, 255, 255, 0.95);
        line-height: 1.4;
        font-weight: 400;
        text-shadow: 0 1rpx 3rpx rgba(0, 0, 0, 0.3);
    }
    
    /* 底部信息 */
    .footer {
        display: flex;
        justify-content: center;
        padding: 20rpx 0;
        flex-shrink: 0;
    }
    
    .footer-text {
        font-size: 24rpx;
        color: rgba(255, 255, 255, 0.7);
    }
</style>