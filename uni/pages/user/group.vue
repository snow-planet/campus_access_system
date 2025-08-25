<template>
	<view class="form-container">
		<!-- 入校须知弹窗 -->
		<view v-if="showNoticeModal" class="modal-overlay">
			<view class="notice-modal">
				<view class="modal-header">
					<text class="modal-title">团体入校须知</text>
				</view>
				<scroll-view class="modal-content" scroll-y="true" @scroll="handleScroll" :scroll-top="scrollTop">
					<view class="notice-content">
						<text class="notice-subtitle">团体预约入校注意事项</text>
						<view class="notice-list">
							<text class="notice-item">1. 请提前至少3个工作日进行团体预约申请</text>
							<text class="notice-item">2. 团体负责人需提供所有成员名单及身份证信息</text>
							<text class="notice-item">3. 入校时所有成员需携带有效身份证件以备查验</text>
							<text class="notice-item">4. 请按照预约时间段集体入校，不得分散进入</text>
							<text class="notice-item">5. 团体车辆请停放在指定停车场，不得随意停放</text>
							<text class="notice-item">6. 入校后请遵守校园管理规定，保持集体行动</text>
							<text class="notice-item">7. 团体活动不得影响正常教学秩序</text>
							<text class="notice-item">8. 如行程有变，请及时取消或修改预约</text>
							<text class="notice-item">9. 严禁携带违禁物品入校</text>
							<text class="notice-item">10. 活动结束后请及时离校，保持环境整洁</text>
							<text class="notice-item">11. 团体负责人需对成员行为负责</text>
							<text class="notice-item">12. 如有任何问题，请及时与审批人或保卫处联系</text>
						</view>
						<view class="notice-highlight">
							<text>请仔细阅读以上须知，如违反规定可能会影响今后的团体预约申请。</text>
						</view>
					</view>
				</scroll-view>
				<view class="modal-footer">
					<label class="agree-checkbox">
						<checkbox :checked="agreeNotice" :disabled="!isScrolledToBottom" @click="toggleAgree" />
						<text class="checkbox-text">我已阅读并同意以上团体入校须知</text>
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
				<text class="form-title">团体预约申请</text>
				<text class="form-subtitle">请填写完整的团体预约信息</text>
			</view>
			
			<view class="form-content">
				<view class="form-group">
					<text class="form-label"><text class="required">*</text>来访事由</text>
					<picker @change="onPurposeChange" :value="purposeIndex" :range="purposeOptions" range-key="name">
						<view class="picker-input">
							<text>{{ formData.purpose || '请选择来访事由' }}</text>
							<uni-icons type="arrowdown" size="16" color="#999" class="picker-arrow"></uni-icons>
						</view>
					</picker>
				</view>

				<view class="form-row">
					<view class="form-group">
						<text class="form-label"><text class="required">*</text>来访人数</text>
						<input 
							class="form-input" 
							type="number" 
							placeholder="请输入来访人数" 
							v-model="formData.visitorCount" 
							min="2"
						/>
					</view>
					<view class="form-group">
						<text class="form-label"><text class="required">*</text>联系人姓名</text>
						<input 
							class="form-input" 
							type="text" 
							placeholder="请输入联系人姓名" 
							v-model="formData.contactName" 
						/>
					</view>
				</view>

				<view class="form-row">
					<view class="form-group">
						<text class="form-label"><text class="required">*</text>联系电话</text>
						<input 
							class="form-input" 
							type="tel" 
							placeholder="请输入联系电话" 
							v-model="formData.contactPhone" 
						/>
					</view>
					<view class="wechat-tip">
						<button class="wechat-title">微信验证</button>
						<text class="wechat-desc">请完成微信授权并关注公众号便于接收通知</text>
					</view>
					<view class="form-group">
						<text class="form-label"><text class="required">*</text>通行日期</text>
						<picker mode="date" :value="formData.visitDate" :start="minDate" @change="onDateChange">
							<view class="picker-input">
								<text>{{ formData.visitDate || '请选择日期' }}</text>
								<uni-icons type="arrowdown" size="16" color="#999" class="picker-arrow"></uni-icons>
							</view>
						</picker>
					</view>
				</view>

				<!-- #ifdef MP-WEIXIN -->
				<view class="wechat-login-section" v-if="!isWechatLoggedIn">
					<view class="wechat-login-prompt">
						<text class="prompt-text">请使用微信扫码登录并关注公众号，以便接收团体预约通知</text>
						<view class="qrcode-container">
							<image src="/static/wechat-qrcode.png" class="qrcode-image" mode="aspectFit"></image>
						</view>
						<button class="wechat-confirm-btn" @tap="handleWechatLogin">
							我已扫码关注
						</button>
					</view>
				</view>
				<!-- #endif -->

				<!-- #ifdef MP-WEIXIN -->
				<view class="login-status" v-else>
					<text class="login-success">✓ 已微信授权登录</text>
				</view>
				<!-- #endif -->

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
					<input 
						class="form-input" 
						type="text" 
						placeholder="请输入车牌号码（如有车辆）" 
						v-model="formData.carNumber" 
					/>
				</view>

				<view class="form-group">
					<text class="form-label"><text class="required">*</text>审批人</text>
					<picker @change="onApproverChange" :value="approverIndex" :range="approvers" range-key="name">
						<view class="picker-input">
							<text>{{ selectedApprover || '请选择审批人' }}</text>
							<uni-icons type="arrowdown" size="16" color="#999" class="picker-arrow"></uni-icons>
						</view>
					</picker>
				</view>

				<view class="form-actions">
					<button class="reset-btn" @tap="resetForm">取消</button>
					<button class="submit-btn" @tap="submitForm">提交申请</button>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
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
			isWechatLoggedIn: false,
			minDate: minDate,
			purposeIndex: 0,
			approverIndex: 0,
			scrollTop: 0,
			contentHeight: 0,
			scrollViewHeight: 0,
			formData: {
				purpose: '',
				visitorCount: '',
				contactName: '',
				contactPhone: '',
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
			approvers: [
				{ id: 1, name: '张老师 - 计算机学院' },
				{ id: 2, name: '李老师 - 电子工程学院' },
				{ id: 3, name: '王老师 - 保卫处' },
				{ id: 4, name: '赵老师 - 机械工程学院' }
			]
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
			}
		},
		handleWechatLogin() {
			// 模拟微信登录
			uni.showLoading({
				title: '登录中...'
			});
			
			setTimeout(() => {
				uni.hideLoading();
				this.isWechatLoggedIn = true;
				uni.showToast({
					title: '微信授权成功',
					icon: 'success'
				});
			}, 1500);
		},
		onPurposeChange(e) {
			const index = e.detail.value;
			this.purposeIndex = index;
			this.formData.purpose = this.purposeOptions[index].name;
		},
		onDateChange(e) {
			this.formData.visitDate = e.detail.value;
		},
		onGateChange(e) {
			this.formData.gate = e.detail.value;
		},
		onApproverChange(e) {
			this.approverIndex = e.detail.value;
			this.formData.approverId = this.approvers[this.approverIndex].id;
		},
		resetForm() {
			// 重置表单数据
			this.formData = {
				purpose: '',
				visitorCount: '',
				contactName: '',
				contactPhone: '',
				visitDate: '',
				entryTime: '',
				exitTime: '',
				gate: '北门',
				carNumber: '',
				approverId: ''
			};
			this.purposeIndex = 0;
			this.approverIndex = 0;
		},
		submitForm() {
			// 表单验证
			if (!this.formData.purpose || !this.formData.visitorCount || !this.formData.contactName || 
				!this.formData.contactPhone || !this.formData.visitDate || !this.formData.approverId) {
				uni.showToast({
					title: '请填写所有必填项',
					icon: 'none'
				});
				return;
			}
			
			// 来访人数验证
			if (this.formData.visitorCount < 2) {
				uni.showToast({
					title: '团体人数至少2人',
					icon: 'none'
				});
				return;
			}
			
			// 手机号验证
			const phoneRegex = /^1[3-9]\d{9}$/;
			if (!phoneRegex.test(this.formData.contactPhone)) {
				uni.showToast({
					title: '请输入正确的手机号码',
					icon: 'none'
				});
				return;
			}
			
			uni.showLoading({
				title: '提交中...'
			});
			
			// 模拟提交
			setTimeout(() => {
				uni.hideLoading();
				uni.showToast({
					title: '团体申请提交成功',
					icon: 'success'
				});
				
				// 重置表单
				this.resetForm();
				
				// 返回上一页或跳转到成功页面
				setTimeout(() => {
					uni.navigateBack();
				}, 1500);
			}, 1500);
		}
	},
	mounted() {
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

.notice-list {
	display: flex;
	flex-direction: column;
	gap: 12rpx;
}

.notice-item {
	font-size: 24rpx;
	color: #333;
	line-height: 1.4;
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

/* 微信登录部分 */
.wechat-login-section {
	background: #f9f9f9;
	border-radius: 16rpx;
	padding: 40rpx;
	margin-bottom: 40rpx;
	text-align: center;
	border: 2rpx dashed #e8e8e8;
}

.wechat-login-prompt {
	display: flex;
	flex-direction: column;
	gap: 30rpx;
}

.prompt-text {
	font-size: 28rpx;
	color: #1c4e80;
	font-weight: 500;
}

.qrcode-container {
	margin: 0 auto;
	width: 300rpx;
	height: 300rpx;
}

.qrcode-image {
	width: 100%;
	height: 100%;
}

.wechat-confirm-btn {
	background: #07c160;
	color: white;
	border: none;
	padding: 20rpx;
	border-radius: 12rpx;
	font-size: 32rpx;
	font-weight: 500;
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
	margin-bottom: 25rpx;
	border-left: 4rpx solid #1c4e80;
}

.wechat-title {
	font-size: 28rpx;
	font-weight: bold;
	color: #1c4e80;
	display: block;
	margin-bottom: 8rpx;
}

.wechat-desc {
	font-size: 24rpx;
	color: #666;
	display: block;
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