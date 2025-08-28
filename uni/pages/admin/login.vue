<template>
	<view class="login-container">
		<!-- 顶部标题区域 -->
		<view class="header">
			<view class="title-group">
				<text class="main-title">欢迎各位审批人</text>
				<text class="sub-title">请使用您的个人账户信息登录审批系统</text>
			</view>
		</view>
		
		<!-- 登录表单区域 -->
		<view v-if="!showApplicationModal" class="login-form">
			<view class="form-item">
				<text class="form-label">用户名</text>
				<input class="form-input" type="text" placeholder="请输入用户名" v-model="username" />
			</view>
			
			<view class="form-item">
				<text class="form-label">密码</text>
				<input class="form-input" type="password" placeholder="请输入密码" v-model="password" />
			</view>
			
			<button class="login-btn" @tap="handleLogin">登录</button>
			
			<view class="back-link" @tap="goBack">
				<text>返回首页</text>
			</view>
		</view>
		
		<!-- 申请表单区域 -->
		<view v-if="showApplicationModal" class="application-form">
			<view class="form-header">
				<text class="modal-title">成为审批人申请</text>
				<text class="close-btn" @tap="closeModal">×</text>
			</view>
			
			<view class="form-content">
				<view class="form-section">
					<view class="input-group">
						<text class="input-label">真实姓名</text>
						<input 
							type="text" 
							v-model="applicationForm.real_name" 
							placeholder="请输入您的真实姓名"
							class="form-input"
						/>
					</view>
					
					<view class="input-group">
						<text class="input-label">手机号</text>
						<input 
							type="tel" 
							v-model="applicationForm.phone" 
							placeholder="请输入您的手机号码"
							class="form-input"
						/>
					</view>

					<view class="wechat-tip">
				<view v-if="!isWechatLoggedIn" class="wechat-auth">
					<button class="wechat-auth-btn" @tap="handleWechatAuth">微信授权登录</button>
					<text class="wechat-desc">请完成微信授权并关注公众号便于接收通知</text>
				</view>
				<view v-else class="wechat-success">
					<text class="wechat-title">✓ 已完成微信授权</text>
					<text class="wechat-desc">可以提交申请了</text>
				</view>
			</view>
					
					<view class="input-group">
						<text class="input-label">学院/部门</text>
						<picker 
							mode="selector" 
							:range="collegeOptions" 
							@change="onCollegeChange"
							class="form-select"
						>
							<view class="picker-content">
								<text :class="['select-text', applicationForm.college ? '' : 'placeholder']">
									{{ applicationForm.college || '请选择学院/部门' }}
								</text>
								<text style="color: #999; font-size: 16px;">▼</text>
							</view>
						</picker>
					</view>
					
					<view class="input-group">
						<text class="input-label">职位</text>
						<picker 
							mode="selector" 
							:range="positionLabels" 
							@change="onPositionChange"
							class="form-select"
						>
							<view class="picker-content">
								<text :class="['select-text', applicationForm.position ? '' : 'placeholder']">
									{{ getPositionLabel(applicationForm.position) || '请选择您的职位' }}
								</text>
								<text style="color: #999; font-size: 16px;">▼</text>
							</view>
						</picker>
					</view>
					
					<button class="submit-application-btn" @tap="submitApplication">提交申请</button>
					<button class="back-to-login-btn" @tap="closeModal">返回登录</button>
				</view>
			</view>
		</view>
		
		<button v-if="!showApplicationModal" class="signin-btn" @tap="showSignIn">我想成为审批人！</button>
	</view>
</template>

<script>
import { adminLogin, submitApproverApplication } from '../../api/uniAuth.js'
import { wechatLogin } from '../../api/uniWechatAuth.js'

export default {
	data() {
		return {
			username: '',
			password: '',
			showApplicationModal: false,
			positionIndex: 0,
			collegeIndex: 0,
			positionOptions: ['teacher', 'security'],
			positionLabels: ['教师', '安保人员'],
			collegeOptions: [
				'信息技术学院',
				'治安学院',
				'交通管理学院',
				'保卫处'
			],
			applicationForm: {
				real_name: '',
				phone: '',
				college: '',
				position: ''
			},
			isWechatLoggedIn: false,
			currentUserId: null
		}
	},
	methods: {
		// 处理登录
		async handleLogin() {
			if (!this.username || !this.password) {
				uni.showToast({
					title: '请输入用户名和密码',
					icon: 'none'
				})
				return
			}
			
			try {
				const res = await adminLogin({
					username: this.username,
					password: this.password
				})
				
				if (res && res.code === 0) {
					// 登录成功，保存用户信息
					const userData = res.data
					uni.setStorageSync('currentUser', {
						user_id: userData.user_id,
						username: userData.username,
						real_name: userData.real_name,
						role: userData.role,
						college: userData.college,
						position: userData.position,
						token: userData.token
					})
					
					uni.showToast({
						title: '登录成功',
						icon: 'success'
					})
					
					// 根据角色跳转到不同页面
					setTimeout(() => {
						if (userData.role === 'approver') {
							uni.navigateTo({
								url: '/pages/admin/home'
							})
						} else if (userData.role === 'admin') {
							uni.navigateTo({
								url: '/pages/admin/adminhome'
							})
						} else {
							uni.showToast({
								title: '权限不足',
								icon: 'none'
							})
						}
					}, 1000)
				} else {
					uni.showToast({
						title: res.message || '登录失败',
						icon: 'none'
					})
				}
			} catch (error) {
				console.error('登录失败:', error)
				uni.showToast({
					title: '登录失败，请重试',
					icon: 'none'
				})
			}
		},
		// 返回首页
		goBack() {
			uni.reLaunch({
				url: '/pages/index/index'
			})
		},
		// 显示申请表单
		showSignIn() {
			this.showApplicationModal = true;
		},
		// 关闭申请表单
		closeModal() {
			this.showApplicationModal = false;
		},
		// 学院选择变化
		onCollegeChange(e) {
			const index = e.detail.value;
			this.collegeIndex = index;
			this.applicationForm.college = this.collegeOptions[index];
		},
		// 职位选择变化
		onPositionChange(e) {
			const index = e.detail.value;
			this.positionIndex = index;
			this.applicationForm.position = this.positionOptions[index];
		},
		
		// 获取职位中文标签
		getPositionLabel(position) {
			const index = this.positionOptions.indexOf(position);
			return index >= 0 ? this.positionLabels[index] : '';
			},
			
			// 微信授权登录
			handleWechatAuth() {
				// #ifdef MP-WEIXIN
				uni.login({
					provider: 'weixin',
					success: async (loginRes) => {
						try {
							const code = loginRes?.code
							if (!code) throw new Error('未获取到微信code')
							
							const payload = {
								code,
								username: '申请用户',
								phone: this.applicationForm.phone || '未填写',
								real_name: this.applicationForm.real_name || '申请用户'
							}
							
							const res = await wechatLogin(payload)
							const body = res?.data || res
							const user = body?.data || body
							const userId = user?.user_id
							
							if (!userId) throw new Error('登录返回数据异常')
							
							this.isWechatLoggedIn = true
							this.currentUserId = userId
							
							uni.showToast({ title: '微信授权成功', icon: 'success' })
						} catch (err) {
							console.error('微信授权失败:', err)
							uni.showToast({ title: '授权失败，请重试', icon: 'none' })
						}
					},
					fail: () => {
						uni.showToast({ title: '授权失败', icon: 'none' })
					}
				})
				// #endif
				
				// #ifndef MP-WEIXIN
				uni.showToast({ title: '请在微信小程序中使用授权', icon: 'none' })
				// #endif
			},
			
			// 检查登录状态
			checkLoginStatus() {
				try {
					const uid = uni.getStorageSync('user_id')
					if (uid) {
						this.isWechatLoggedIn = true
						this.currentUserId = uid
					}
				} catch(e) {
					console.error('检查登录状态失败:', e)
				}
			},
		// 提交申请
		async submitApplication() {
			if (!this.applicationForm.real_name || !this.applicationForm.phone || 
				!this.applicationForm.college || !this.applicationForm.position) {
				uni.showToast({
					title: '请填写完整信息',
					icon: 'none'
				});
				return;
			}
			
			// 手机号验证
			const phoneRegex = /^1[3-9]\d{9}$/;
			if (!phoneRegex.test(this.applicationForm.phone)) {
				uni.showToast({
					title: '请输入正确的手机号码',
					icon: 'none'
				});
				return;
			}
			
			// 检查是否已微信登录
			if (!this.isWechatLoggedIn || !this.currentUserId) {
				uni.showToast({
					title: '请先完成微信授权',
					icon: 'none'
				});
				return;
			}
			
			try {
				const res = await submitApproverApplication({
					user_id: this.currentUserId,
					real_name: this.applicationForm.real_name,
					phone: this.applicationForm.phone,
					college: this.applicationForm.college,
					position: this.applicationForm.position
				});
				
				if (res && res.code === 0) {
					uni.showToast({
						title: '申请提交成功',
						icon: 'success'
					});
					
					// 关闭表单
					this.closeModal();
					
					// 重置表单
					this.applicationForm = {
						real_name: '',
						phone: '',
						college: '',
						position: ''
					};
					this.positionIndex = 0;
					this.collegeIndex = 0;
				} else {
					uni.showToast({
						title: res.message || '申请提交失败',
						icon: 'none'
					});
				}
			} catch (error) {
				console.error('提交申请失败:', error);
				uni.showToast({
					title: '申请提交失败，请重试',
					icon: 'none'
				});
			}
		},
		
		// 页面生命周期
		onLoad() {
			this.checkLoginStatus();
		}
	}
}
</script>

<style scoped>
.login-container {
	min-height: 100vh;
	background: linear-gradient(135deg, #c7e9f4 0%, #446daa, #1c4e80);
	padding: 100rpx 60rpx;
	display: flex;
	flex-direction: column;
	align-items: center;
}

.header {
	margin-bottom: 80rpx;
	text-align: center;
}

.title-group {
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 20rpx;
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

.login-form {
	width: 100%;
	max-width: 600rpx;
	background: rgba(255, 255, 255, 0.95);
	border-radius: 40rpx;
	padding: 60rpx 50rpx;
	box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.12);
	backdrop-filter: blur(10rpx);
	margin-bottom: 40rpx;
}

.application-form {
	width: 100%;
	max-width: 600rpx;
	background: rgba(255, 255, 255, 0.95);
	border-radius: 40rpx;
	padding: 0;
	box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.12);
	backdrop-filter: blur(10rpx);
	margin-bottom: 40rpx;
	overflow: hidden;
}

.form-header {
	background: #1c4e80;
	color: white;
	padding: 25rpx 30rpx;
	display: flex;
	justify-content: space-between;
	align-items: center;
}

.form-content {
	padding: 30rpx;
}

.form-item {
	margin-bottom: 40rpx;
}

.form-label {
	display: block;
	font-size: 32rpx;
	color: #333;
	margin-bottom: 20rpx;
	font-weight: 500;
}

.form-input {
	width: 100%;
	height: 80rpx;
	border: 2rpx solid #e0e0e0;
	border-radius: 20rpx;
	padding: 0 30rpx;
	font-size: 30rpx;
	background: #fff;
	box-sizing: border-box;
}

.form-input:focus {
	border-color: #1c4e80;
}

.login-btn {
	width: 100%;
	height: 80rpx;
	background: #1c4e80;
	color: white;
	border: none;
	border-radius: 20rpx;
	font-size: 32rpx;
	font-weight: 600;
	margin-top: 20rpx;
	margin-bottom: 30rpx;
}

.login-btn:active {
	background: #164066;
}

.back-link {
	text-align: center;
	padding: 20rpx;
}

.back-link text {
	font-size: 35rpx;
	color: #666;
	text-decoration: underline;
}

.signin-btn {
	background: rgba(255, 255, 255, 0);
	border: none;
	font-size: 35rpx;
	color: #ffffff;
	margin-top: 20rpx;
	width: 100%;
	text-align: center;
	text-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.2);
}

.modal-title {
	font-size: 32rpx;
	font-weight: bold;
}

.close-btn {
	font-size: 40rpx;
	cursor: pointer;
}

.form-section {
	width: 100%;
}

.input-group {
	margin-bottom: 25rpx;
}

.input-label {
	display: block;
	font-size: 28rpx;
	color: #333;
	margin-bottom: 15rpx;
	font-weight: 500;
}

.form-select {
	width: 100%;
	height: 80rpx;
	border: 2rpx solid #e0e0e0;
	border-radius: 20rpx;
	background: #fff;
	box-sizing: border-box;
}

.picker-content {
	width: 100%;
	height: 100%;
	padding: 0 30rpx;
	display: flex;
	align-items: center;
	justify-content: space-between;
}

.select-text {
	color: #333;
	font-size: 30rpx;
}

.select-text.placeholder {
	color: #999;
}

.submit-application-btn {
	width: 100%;
	height: 80rpx;
	background: #1c4e80;
	color: white;
	border: none;
	border-radius: 20rpx;
	font-size: 32rpx;
	font-weight: 600;
	margin-top: 20rpx;
	margin-bottom: 20rpx;
}

.back-to-login-btn {
	width: 100%;
	height: 80rpx;
	background: #f0f0f0;
	color: #666;
	border: none;
	border-radius: 20rpx;
	font-size: 32rpx;
	font-weight: 600;
}

.wechat-tip {
	background: #f0f8ff;
	padding: 20rpx;
	border-radius: 12rpx;
	margin-bottom: 25rpx;
	border-left: 4rpx solid #1c4e80;
}

.wechat-auth {
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 10rpx;
}

.wechat-auth-btn {
	background: #07c160;
	color: white;
	border: none;
	padding: 15rpx 30rpx;
	border-radius: 12rpx;
	font-size: 28rpx;
	font-weight: 500;
	width: 100%;
	box-sizing: border-box;
}

.wechat-auth-btn:active {
	background: #06ae56;
}

.wechat-success {
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 8rpx;
}

.wechat-title {
	font-size: 28rpx;
	font-weight: bold;
	color: #07c160;
	display: block;
}

.wechat-desc {
	font-size: 24rpx;
	color: #666;
	display: block;
	text-align: center;
}
</style>