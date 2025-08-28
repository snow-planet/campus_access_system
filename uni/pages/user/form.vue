<template>
	<view class="form-container">
		<!-- 入校须知弹窗 -->
		<view v-if="showNoticeModal" class="modal-overlay">
			<view class="notice-modal">
				<view class="modal-header">
					<text class="modal-title">入校须知</text>
				</view>
				<scroll-view class="modal-content" scroll-y="true" @scroll="handleScroll" :scroll-top="scrollTop">
					<view class="notice-content">
						<text class="notice-subtitle">{{ noticeTitle }}</text>
						<view class="notice-text" v-if="noticeContent">
							<text class="notice-content-text">{{ noticeContent }}</text>
						</view>
						<view class="notice-loading" v-else>
							<text class="loading-text">正在加载入校须知...</text>
						</view>
						<view class="notice-highlight">
							<text>请仔细阅读以上须知，如违反规定可能会影响今后的预约申请。</text>
						</view>
					</view>
				</scroll-view>
				<view class="modal-footer">
					<label class="agree-checkbox">
						<checkbox :checked="agreeNotice" :disabled="!isScrolledToBottom" @click="toggleAgree" />
						<text class="checkbox-text">我已阅读并同意以上入校须知</text>
					</label>
					<button 
						class="confirm-btn" 
						:class="agreeNotice ? '' : 'disabled'" 
						:disabled="!agreeNotice"
						@tap="closeNotice"
					>
						开始填写
					</button>
				</view>
			</view>
		</view>

		<view class="form-wrapper" v-if="!showNoticeModal">
			<view class="form-header">
				<text class="form-title">个人预约申请</text>
				<text class="form-subtitle">请填写完整的预约信息</text>
			</view>
			
			<view class="form-content">
				<view class="form-group">
					<text class="form-label"><text class="required">*</text>来访事由</text>
					<picker @change="onPurposeChange" :value="purposeIndex" :range="purposeOptions" range-key="name">
						<view class="picker-input">
							<text>{{ formData.purpose || '请选择来访事由' }}</text>
							<text class="picker-arrow">▼</text>
						</view>
					</picker>
				</view>

				<view class="form-row">
					<view class="form-group">
						<text class="form-label"><text class="required">*</text>姓名</text>
						<input class="form-input" type="text" placeholder="请输入姓名" v-model="formData.name" />
					</view>
					<view class="form-group">
						<text class="form-label"><text class="required">*</text>手机号</text>
						<input class="form-input" type="number" placeholder="请输入手机号码" v-model="formData.phone" />
					</view>
				</view>
				
				<!-- #ifdef MP-WEIXIN -->
				<view class="wechat-auth-section">
					<view class="wechat-tip">
						<text class="wechat-title">微信授权</text>
						<text class="wechat-desc">请完成微信授权以便接收预约审批通知</text>
					</view>
					<view class="auth-status" v-if="!isWechatLoggedIn">
						<button class="wechat-auth-btn" @tap="handleWechatAuth" :disabled="authLoading">
							<text v-if="authLoading">授权中...</text>
							<text v-else>微信授权登录</text>
						</button>
					</view>
					<view class="login-status" v-else>
						<text class="login-success">✓ 已完成微信授权</text>
					</view>
				</view>
				<!-- #endif -->

				<!-- #ifndef MP-WEIXIN -->
				<view class="wechat-tip">
					<text class="wechat-title">微信授权</text>
					<text class="wechat-desc">请在微信小程序中使用此功能</text>
				</view>
				<!-- #endif -->

				<view class="form-row">
					<view class="form-group">
						<text class="form-label"><text class="required">*</text>通行日期</text>
						<picker mode="date" :value="formData.visitDate" :start="minDate" @change="onDateChange">
							<view class="picker-input">
								<text>{{ formData.visitDate || '请选择日期' }}</text>
								<text class="picker-arrow">▼</text>
							</view>
						</picker>
					</view>
					<view class="form-group time-input-group">
						<text class="form-label">预计进入时段</text>
						<view class="time-inputs">
							<input 
								type="time" 
								v-model="formData.entryTime" 
								class="time-input"
								placeholder="开始时间"
							/>
							<text class="time-separator">至</text>
							<input 
								type="time" 
								v-model="formData.exitTime" 
								class="time-input"
								placeholder="结束时间"
							/>
						</view>
						<text class="time-hint" v-if="!formData.entryTime && !formData.exitTime">不填写则默认为9:00-20:00</text>
					</view>
				</view>

				<view class="form-group">
					<text class="form-label"><text class="required">*</text>进出校门</text>
					<radio-group @change="onGateChange">
						<label class="radio-label">
							<radio value="北门" :checked="formData.gate === '北门'" />
							<text>北门</text>
						</label>
					</radio-group>
				</view>

				<view class="form-group">
					<text class="form-label">车牌号</text>
					<input class="form-input" type="text" placeholder="请输入车牌号码" v-model="formData.carNumber" />
				</view>

				<view class="form-group">
					<view class="approver-header">
						<text class="form-label"><text class="required">*</text>审批人</text>
						<button class="refresh-btn" @tap="loadApprovers" v-if="approvers.length === 0">
							<text>刷新</text>
						</button>
					</view>
					<picker @change="onApproverChange" :value="approverIndex" :range="approvers" range-key="name" :disabled="approvers.length === 0">
						<view class="picker-input" :class="{ disabled: approvers.length === 0 }">
							<text>{{ approvers.length === 0 ? '加载审批人中...' : (selectedApprover || '请选择审批人') }}</text>
							<text class="picker-arrow">▼</text>
						</view>
					</picker>
				</view>

				<view class="form-actions">
					<button class="reset-btn" @tap="resetForm">取消</button>
					<button class="submit-btn" @tap="submitForm">提交申请</button>
				</view>
			</view>
		</view>
		
		<!-- 公众号关注弹窗 -->
		<view v-if="showQrcodeModal" class="modal-overlay">
			<view class="qrcode-modal">
				<view class="modal-header">
					<text class="modal-title">关注公众号</text>
					<view class="close-btn" @tap="closeQrcodeModal">
						<text style="color: #fff; font-size: 24px;">×</text>
					</view>
				</view>
				<view class="qrcode-content">
					<text class="qrcode-title">预约申请已提交成功！</text>
					<text class="qrcode-desc">请扫码关注公众号，及时接收预约审批结果通知</text>
					<view class="qrcode-container">
						<image src="/static/wechat-qrcode.png" class="qrcode-image" mode="aspectFit"></image>
					</view>
					<text class="qrcode-hint">长按识别二维码关注公众号</text>
				</view>
				<view class="qrcode-footer">
					<button class="confirm-btn" @tap="closeQrcodeModal">我知道了</button>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
import { wechatLogin } from '../../api/uniWechatAuth.js'
import { fetchApprovers } from '../../api/uniUsers.js'
import { createIndividualReservation } from '../../api/uniReservations.js'
import { fetchNotice } from '../../api/uniNotifications.js'

export default {
	data() {
		const today = new Date();
		const year = today.getFullYear();
		const month = (today.getMonth() + 1).toString().padStart(2, '0');
		const day = today.getDate().toString().padStart(2, '0');
		const minDate = `${year}-${month}-${day}`;
		
		return {
				showNoticeModal: true,
			agreeNotice: false,
			isScrolledToBottom: false,
			noticeContent: '',
			noticeTitle: '个人预约入校须知',
				isWechatLoggedIn: false,
				authLoading: false,
				showQrcodeModal: false,
				minDate: minDate,
				purposeIndex: 0,
				approverIndex: 0,
				scrollTop: 0,
				contentHeight: 0,
				scrollViewHeight: 0,
			formData: {
				purpose: '',
				name: '',
				phone: '',
				visitDate: '',
				entryTime: '',
				exitTime: '',
				gate: '北门',
				carNumber: '',
				approverId: ''
			},
			purposeOptions: [
				{ id: 1, name: '学术交流' },
				{ id: 2, name: '业务洽谈' },
				{ id: 3, name: '参加会议' },
				{ id: 4, name: '参观访问' }
			],
			approvers: []
		}
	},
	computed: {
		selectedApprover() {
			if (this.approverIndex >= 0 && this.approverIndex < this.approvers.length) {
				return this.approvers[this.approverIndex].name;
			}
			return '';
		}
	},
	methods: {
		handleScroll(e) {
			const { scrollHeight, scrollTop, height } = e.detail;
			// 当滚动到底部时
			if (scrollHeight - scrollTop - height < 10) {
				this.isScrolledToBottom = true;
			}
		},
		
		// 检查内容是否需要滚动
		checkScrollability() {
			const query = uni.createSelectorQuery().in(this);
			query.select('.modal-content').boundingClientRect(data => {
				this.scrollViewHeight = data.height;
			}).exec();
			
			query.select('.notice-content').boundingClientRect(data => {
				this.contentHeight = data.height;
				// 如果内容高度小于或等于滚动视图高度，则不需要滚动
				if (this.contentHeight <= this.scrollViewHeight) {
					this.isScrolledToBottom = true;
				}
			}).exec();
		},
		
		toggleAgree() {
			if (this.isScrolledToBottom) {
				this.agreeNotice = !this.agreeNotice;
			} else {
				uni.showToast({
					title: '请阅读完所有内容',
					icon: 'none'
				});
				// 自动滚动到底部
				this.scrollTop = this.contentHeight;
				setTimeout(() => {
					this.isScrolledToBottom = true;
				}, 300);
			}
		},
		
		closeNotice() {
			if (this.agreeNotice) {
				this.showNoticeModal = false;
				// 确保在表单显示时重新加载审批人数据
				if (this.approvers.length === 0) {
					this.loadApprovers();
				}
			}
		},
		// 微信授权登录（真实对接）
		handleWechatAuth() {
			// #ifdef MP-WEIXIN
			if (this.authLoading) return;
			this.authLoading = true;
			uni.showLoading({ title: '授权中' });
			uni.login({
				provider: 'weixin',
				success: async (loginRes) => {
					try {
						const code = loginRes?.code
						if (!code) throw new Error('未获取到微信code')
						const payload = {
							code,
							username: this.formData?.name || '微信用户',
							phone: this.formData?.phone || '未填写',
							real_name: this.formData?.name || '微信用户'
						}
						const res = await wechatLogin(payload)
						const body = res?.data || res
						const user = body?.data || body
						const userId = user?.user_id
						const openid = user?.openid
						if (!userId) throw new Error('登录返回数据异常')
						try { uni.setStorageSync('user_id', userId) } catch(e) {}
						try { uni.setStorageSync('openid', openid || '') } catch(e) {}
						this.isWechatLoggedIn = true
						uni.showToast({ title: '授权成功', icon: 'success' })
					} catch (err) {
						uni.showToast({ title: '授权失败，请重试', icon: 'none' })
					} finally {
						this.authLoading = false
						uni.hideLoading()
					}
				},
				fail: () => {
					this.authLoading = false
					uni.hideLoading()
					uni.showToast({ title: '授权失败', icon: 'none' })
				}
			})
			// #endif

			// #ifndef MP-WEIXIN
			uni.showToast({ title: '请在微信小程序中使用授权', icon: 'none' })
			// #endif
		},

		// 显示公众号二维码
		showQrcodePrompt() {
			// 删除：不再显示公众号关注弹窗
			this.showQrcodeModal = false;
		},

		// 关闭二维码弹窗
		closeQrcodeModal() {
			// 删除：不再显示公众号关注弹窗
			this.showQrcodeModal = false;
		},

		// 检查登录状态（读取本地缓存）
		checkLoginStatus() {
			try {
				const uid = uni.getStorageSync('user_id')
				if (uid) this.isWechatLoggedIn = true
			} catch(e) {}
		},

		// 加载入校须知
		loadNotice() {
			fetchNotice('individual_notice')
				.then((res) => {
					console.log('入校须知API响应:', res)
					// 后端返回格式：{code: 0, data: {notification_id, title, content, updated_at}}
					if (res && res.code === 0 && res.data) {
						this.noticeTitle = res.data.title || '个人预约入校须知'
						this.noticeContent = res.data.content || ''
					} else {
						console.log('入校须知数据格式异常，使用默认内容')
						// 使用默认内容
						this.noticeContent = '1. 请提前至少1个工作日进行预约申请\n2. 入校时请携带有效身份证件以备查验\n3. 请按照预约时间段入校，不得提前或超时\n4. 车辆请停放在指定停车场，不得随意停放\n5. 入校后请遵守校园管理规定，不得进入非申请区域\n6. 如有随行人员，请在事由中说明并确保其携带身份证件\n7. 如行程有变，请及时取消或修改预约\n8. 严禁携带违禁物品入校\n9. 入校期间请保持环境整洁，不得乱扔垃圾\n10. 如有任何问题，请及时与审批人或保卫处联系'
					}
				})
				.catch((err) => {
					console.error('加载入校须知失败:', err)
					// 使用默认内容（与上面相同）
				})
		},

		// 加载审批人列表（真实接口）
		loadApprovers() {
			uni.showLoading({ title: '加载审批人' })
			fetchApprovers()
				.then((res) => {
					console.log('审批人API响应:', res)
					const body = res?.data || res
					const list = body?.data || body || []
					console.log('解析后的审批人列表:', list)
					this.approvers = (Array.isArray(list) ? list : []).map(u => ({
						id: u.user_id,
						name: `${u.real_name || u.username || '审批人'}${u.college ? ' - ' + u.college : ''}`
					}))
					console.log('最终审批人数组:', this.approvers)
					// 重置审批人选择状态
					this.approverIndex = -1
					this.formData.approverId = ''
					if (this.approvers.length > 0) {
						uni.showToast({ title: `加载到${this.approvers.length}个审批人`, icon: 'success' })
					} else {
						uni.showToast({ title: '未找到审批人数据', icon: 'none' })
					}
				})
				.catch((err) => {
					console.error('加载审批人失败:', err)
					uni.showToast({ title: '审批人加载失败', icon: 'none' })
				})
				.finally(() => {
					uni.hideLoading()
				})
		},

		onPurposeChange(e) {
			const index = e.detail.value;
			this.purposeIndex = index;
			this.formData.purpose = this.purposeOptions[index].name;
		},
		onDateChange(e) {
			this.formData.visitDate = e.detail.value;
		},
		onEntryTimeChange(e) {
			this.formData.entryTime = e.target.value;
		},
		onExitTimeChange(e) {
			this.formData.exitTime = e.target.value;
		},
		onGateChange(e) {
			this.formData.gate = e.detail.value;
		},
		onApproverChange(e) {
			const index = parseInt(e.detail.value);
			this.approverIndex = index;
			
			// 安全检查，确保审批人存在
			if (this.approvers && this.approvers.length > index && index >= 0 && this.approvers[index]) {
				this.formData.approverId = this.approvers[index].id;
			} else {
				this.formData.approverId = '';
			}
		},
		resetForm() {
			// 重置表单数据
			this.formData = {
				purpose: '',
				name: '',
				phone: '',
				visitDate: '',
				entryTime: '',
				exitTime: '',
				gate: '北门',
				carNumber: '',
				approverId: ''
			};
			this.purposeIndex = 0;
			this.approverIndex = -1; // 重置为未选择状态
		},
		submitForm() {
			// 表单验证
			if (!this.formData.purpose || !this.formData.name || !this.formData.phone || 
				!this.formData.visitDate || !this.formData.approverId) {
				uni.showToast({
					title: '请填写所有必填项',
					icon: 'none'
				});
				return;
			}
			// 手机号验证
			const phoneRegex = /^1[3-9]\d{9}$/;
			if (!phoneRegex.test(this.formData.phone)) {
				uni.showToast({ title: '请输入正确的手机号码', icon: 'none' });
				return;
			}
			// #ifdef MP-WEIXIN
			if (!this.isWechatLoggedIn) {
				uni.showToast({ title: '请先完成微信授权', icon: 'none' });
				return;
			}
			// #endif

			const uid = uni.getStorageSync('user_id')
			if (!uid) {
				uni.showToast({ title: '未获取到用户信息，请先授权', icon: 'none' })
				return
			}

			const payload = {
				user_id: uid,
				purpose: this.formData.purpose,
				visit_date: this.formData.visitDate,
				entry_time: this.formData.entryTime || '09:00',
				exit_time: this.formData.exitTime || '20:00',
				gate: this.formData.gate,
				license_plate: this.formData.carNumber || '',
				approver_id: this.formData.approverId,
			}

			uni.showLoading({ title: '提交中...' })
			createIndividualReservation(payload)
				.then((res) => {
					const body = res?.data || res
					if (body?.code && body.code !== 0) {
						throw new Error(body?.message || '提交失败')
					}
					uni.showToast({ title: '申请提交成功', icon: 'success' })
					setTimeout(() => { this.showQrcodePrompt() }, 600)
					this.resetForm()
				})
				.catch(() => {
					uni.showToast({ title: '提交失败，请稍后重试', icon: 'none' })
				})
				.finally(() => {
					uni.hideLoading()
				})
		}
	},
		onLoad() {
		// 检查用户登录状态
		this.checkLoginStatus();
		// 加载审批人列表
		this.loadApprovers();
		// 加载入校须知
		this.loadNotice();
	},
	// 添加mounted钩子，确保组件作为子组件时也能正确加载数据
	mounted() {
		// 检查用户登录状态
		this.checkLoginStatus();
		// 加载审批人列表
		this.loadApprovers();
		// 加载入校须知
		this.loadNotice();
		this.$nextTick(() => {
			setTimeout(() => {
				this.checkScrollability();
			}, 100);
		});
	}
}
</script>

<style scoped>
/* 弹窗样式 */
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
	padding: 20rpx;
	box-sizing: border-box;
}

.notice-modal {
	background: white;
	border-radius: 20rpx;
	width: 100%;
	max-width: 650rpx;
	max-height: 85vh;
	display: flex;
	flex-direction: column;
	overflow: hidden;
	box-sizing: border-box;
}

.modal-header {
	background: #1c4e80;
	color: white;
	padding: 25rpx 30rpx;
	text-align: center;
	flex-shrink: 0;
}

.modal-title {
	font-size: 32rpx;
	font-weight: bold;
}

.modal-content {
	flex: 1;
	padding: 25rpx 30rpx;
	max-height: calc(85vh - 200rpx);
	box-sizing: border-box;
	overflow: hidden;
}

.notice-content {
	display: flex;
	flex-direction: column;
	gap: 18rpx;
}

.notice-subtitle {
	font-size: 28rpx;
	color: #1c4e80;
	font-weight: 600;
	line-height: 1.4;
}

.notice-text {
	display: flex;
	flex-direction: column;
	gap: 12rpx;
}

.notice-content-text {
	font-size: 24rpx;
	color: #333;
	line-height: 1.6;
	white-space: pre-line;
}

.notice-loading {
	text-align: center;
	padding: 40rpx 0;
}

.loading-text {
	font-size: 24rpx;
	color: #999;
}

.notice-highlight {
	background: #fff7e6;
	padding: 18rpx;
	border-radius: 8rpx;
	border-left: 5rpx solid #ffa940;
	margin-top: 12rpx;
}

.notice-highlight text {
	font-size: 24rpx;
	font-weight: 500;
	color: #333;
	line-height: 1.4;
}

.modal-footer {
	padding: 25rpx 30rpx;
	border-top: 2rpx solid #e8e8e8;
	display: flex;
	flex-direction: column;
	gap: 20rpx;
	flex-shrink: 0;
	box-sizing: border-box;
}

.agree-checkbox {
	display: flex;
	align-items: center;
}

.checkbox-text {
	font-size: 24rpx;
	margin-left: 12rpx;
}

.confirm-btn {
	background: #1c4e80;
	color: white;
	border: none;
	padding: 20rpx;
	border-radius: 20rpx;
	font-size: 28rpx;
	font-weight: 500;
}

.confirm-btn.disabled {
	background: #ccc;
	color: #999;
}

/* 响应式调整 */
@media (max-width: 768px) {
	.modal-overlay {
		padding: 15rpx;
	}
	
	.notice-modal {
		max-width: 90%;
		max-height: 90vh;
	}
	
	.modal-header {
		padding: 20rpx 25rpx;
	}
	
	.modal-title {
		font-size: 30rpx;
	}
	
	.modal-content {
		padding: 20rpx 25rpx;
		max-height: calc(90vh - 180rpx);
	}
	
	.notice-content {
		gap: 15rpx;
	}
	
	.notice-subtitle {
		font-size: 26rpx;
	}
	
	.notice-list {
		gap: 10rpx;
	}
	
	.notice-item {
		font-size: 22rpx;
	}
	
	.notice-highlight {
		padding: 15rpx;
	}
	
	.notice-highlight text {
		font-size: 22rpx;
	}
	
	.modal-footer {
		padding: 20rpx 25rpx;
		gap: 15rpx;
	}
	
	.checkbox-text {
		font-size: 22rpx;
	}
	
	.confirm-btn {
		padding: 14rpx;
		font-size: 26rpx;
	}
}

/* 表单样式 */
.form-wrapper {
	background: rgba(255, 255, 255, 0.9);
	padding: 40rpx;
	box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.08);
}

.form-header {
	text-align: center;
	margin-bottom: 60rpx;
}

.form-title {
	font-size: 48rpx;
	font-weight: 600;
	color: #1c4e80;
	display: block;
	margin-bottom: 20rpx;
}

.form-subtitle {
	font-size: 28rpx;
	color: #666;
	display: block;
}

.form-content {
	display: flex;
	flex-direction: column;
	gap: 40rpx;
}

.form-row {
	display: flex;
	gap: 30rpx;
}

.form-group {
	flex: 1;
	display: flex;
	flex-direction: column;
}

.form-label {
	font-size: 32rpx;
	color: #333;
	margin-bottom: 20rpx;
	font-weight: 500;
	display: flex;
	align-items: center;
}

.required {
	color: #ff4d4f;
	margin-right: 8rpx;
}

.form-input, .picker-input, .time-picker, .time-input {
	height: 80rpx;
	border: 2rpx solid #e0e0e0;
	border-radius: 12rpx;
	padding: 0 30rpx;
	font-size: 30rpx;
	background: #fff;
	box-sizing: border-box;
	display: flex;
	align-items: center;
	justify-content: space-between;
	position: relative;
}

.form-input:focus {
	border-color: #1c4e80;
}

.picker-input, .time-picker {
	color: #333;
}

.picker-arrow {
	position: absolute;
	right: 30rpx;
}

/* 微信授权部分 */
.wechat-auth-section {
	margin-bottom: 40rpx;
}

.auth-status {
	margin-top: 20rpx;
}

.wechat-auth-btn {
	background: #07c160;
	color: white;
	border: none;
	padding: 20rpx 40rpx;
	border-radius: 12rpx;
	font-size: 28rpx;
	font-weight: 500;
	width: 100%;
	box-sizing: border-box;
}

.wechat-auth-btn:disabled {
	background: #ccc;
	color: #999;
}

/* 公众号二维码弹窗 */
.qrcode-modal {
	background: white;
	border-radius: 20rpx;
	width: 100%;
	max-width: 600rpx;
	display: flex;
	flex-direction: column;
	overflow: hidden;
	box-sizing: border-box;
}

.close-btn {
	position: absolute;
	right: 20rpx;
	top: 50%;
	transform: translateY(-50%);
	padding: 10rpx;
}

.qrcode-content {
	padding: 40rpx 30rpx;
	text-align: center;
	display: flex;
	flex-direction: column;
	gap: 25rpx;
}

.qrcode-title {
	font-size: 32rpx;
	color: #1c4e80;
	font-weight: 600;
}

.qrcode-desc {
	font-size: 26rpx;
	color: #666;
	line-height: 1.4;
}

.qrcode-container {
	margin: 20rpx auto;
	width: 300rpx;
	height: 300rpx;
	border: 2rpx solid #e8e8e8;
	border-radius: 12rpx;
	padding: 20rpx;
	box-sizing: border-box;
}

.qrcode-image {
	width: 100%;
	height: 100%;
}

.qrcode-hint {
	font-size: 24rpx;
	color: #999;
}

.qrcode-footer {
	padding: 20rpx 30rpx 30rpx;
}

.login-status {
	text-align: center;
	margin-bottom: 40rpx;
	padding: 20rpx;
	background-color: #f0f9eb;
	border-radius: 12rpx;
	border: 1rpx solid #e1f3d8;
}

.login-success {
	color: #67c23a;
	font-weight: 500;
	font-size: 28rpx;
}

/* 时间选择器 */
.time-input-group {
	flex: 1.5; /* 给时间输入组更多空间 */
}

.time-inputs {
	display: flex;
	align-items: center;
	gap: 15rpx;
}

.time-input {
	flex: 1;
	min-width: 0;
	font-size: 26rpx;
	height: 80rpx;
	padding: 0 20rpx;
}

.time-separator {
	color: #666;
	font-size: 26rpx;
	white-space: nowrap;
}

.time-hint {
	font-size: 22rpx;
	color: #999;
	margin-top: 8rpx;
}

/* 单选按钮组 */
.radio-group {
	display: flex;
	flex-wrap: wrap;
}

.radio-label {
	display: flex;
	align-items: center;
	font-size: 30rpx;
	margin-right: 40rpx;
}

/* 审批人区域样式 */
.approver-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 20rpx;
}

.refresh-btn {
	background: #1c4e80;
	color: white;
	border: none;
	padding: 8rpx 16rpx;
	border-radius: 6rpx;
	font-size: 24rpx;
}

.picker-input.disabled {
	background: #f5f5f5;
	color: #999;
	border-color: #e0e0e0;
}

/* 表单操作按钮 */
.form-actions {
	display: flex;
	justify-content: space-between;
	gap: 30rpx;
	margin-top: 60rpx;
}

.reset-btn, .submit-btn {
	padding: 20rpx 40rpx;
	border: none;
	border-radius: 10rpx;
	font-size: 30rpx;
	font-weight: 500;
	width: 45%;
}

.reset-btn {
	background: #f5f5f5;
	color: #666;
}

.submit-btn {
	background: #1c4e80;
	color: white;
}

.wechat-tip {
	background: #f0f8ff;
	padding: 20rpx;
	border-radius: 12rpx;
	border-left: 4rpx solid #1c4e80;
	display: flex;
	flex-direction: column;
	gap: 8rpx;
}

.wechat-title {
	font-size: 28rpx;
	font-weight: bold;
	color: #1c4e80;
}

.wechat-desc {
	font-size: 24rpx;
	color: #666;
	line-height: 1.4;
}

/* 响应式设计 */
@media (max-width: 768px) {
	.form-row {
		flex-direction: column;
		gap: 40rpx;
	}
	
	.time-inputs {
		flex-direction: row;
		align-items: center;
		gap: 15rpx;
	}
	
	.time-separator {
		text-align: center;
	}
	
	.form-actions {
		flex-direction: row;
	}
	
	.reset-btn, .submit-btn {
		width: 45%;
	}
	
	.radio-group {
		flex-direction: column;
		gap: 20rpx;
	}
	
	.radio-label {
		margin-right: 0;
	}
	
	/* 弹窗响应式调整 */
	.modal-header {
		padding: 25rpx 30rpx;
	}
	
	.modal-content {
		padding: 20rpx 30rpx;
	}
	
	.modal-footer {
		padding: 25rpx 30rpx;
	}
	
	.notice-item {
		font-size: 24rpx;
	}
}
</style>
/* 删除公众号二维码弹窗样式与相关元素，这里保持空以避免影响 */