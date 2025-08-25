<template>
  <div class="group-container">
    <!-- 主体内容 -->
    <main class="main-content">
      <div class="form-wrapper">

        <!-- 入校须知弹窗 -->
        <div v-if="showNoticeModal" class="modal-overlay">
          <div class="notice-modal">
            <div class="modal-header">
              <h2>团体入校须知</h2>
            </div>
            <div class="modal-content" ref="noticeContent">
              <h3>团体预约入校注意事项</h3>
              <ol>
                <li>请提前至少3个工作日进行团体预约申请</li>
                <li>团体负责人需提供所有成员名单及身份证信息</li>
                <li>入校时所有成员需携带有效身份证件以备查验</li>
                <li>请按照预约时间段集体入校，不得分散进入</li>
                <li>团体车辆请停放在指定停车场，不得随意停放</li>
                <li>入校后请遵守校园管理规定，保持集体行动</li>
                <li>团体活动不得影响正常教学秩序</li>
                <li>如行程有变，请及时取消或修改预约</li>
                <li>严禁携带违禁物品入校</li>
                <li>活动结束后请及时离校，保持环境整洁</li>
                <li>团体负责人需对成员行为负责</li>
                <li>如有任何问题，请及时与审批人或保卫处联系</li>
              </ol>
              <p class="notice-highlight">请仔细阅读以上须知，如违反规定可能会影响今后的团体预约申请。</p>
            </div>
            <div class="modal-footer">
              <label class="agree-checkbox">
                <input type="checkbox" v-model="agreeNotice" :disabled="!isScrolledToBottom" />
                <span class="checkmark"></span>
                我已阅读并同意以上团体入校须知
              </label>
              <button 
                class="confirm-btn" 
                :class="{ disabled: !agreeNotice }" 
                :disabled="!agreeNotice"
                @click="closeNotice"
              >
                开始填写
              </button>
            </div>
          </div>
        </div>

        <form class="reservation-form" v-if="!showNoticeModal">
          <div class="form-group">
            <label class="form-label">来访事由 <span class="required">*</span></label>
            <select v-model="formData.purpose" class="form-select">
              <option value="">请选择来访事由</option>
              <option value="学术交流">学术交流</option>
              <option value="业务洽谈">业务洽谈</option>
              <option value="参加会议">参加会议</option>
              <option value="参观访问">参观访问</option>
            </select>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label class="form-label">来访人数 <span class="required">*</span></label>
              <input 
                type="number" 
                v-model="formData.visitorCount" 
                placeholder="请输入来访人数" 
                class="form-input"
                min="2"
              />
            </div>
            <div class="form-group">
              <label class="form-label">联系人姓名 <span class="required">*</span></label>
              <input 
                type="text" 
                v-model="formData.contactName" 
                placeholder="请输入联系人姓名" 
                class="form-input"
              />
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label class="form-label">联系电话 <span class="required">*</span></label>
              <input 
                type="tel" 
                v-model="formData.contactPhone" 
                placeholder="请输入联系电话" 
                class="form-input"
              />
            </div>

            <div class="form-group">
              <label class="form-label">通行日期 <span class="required">*</span></label>
              <input 
                type="date" 
                v-model="formData.visitDate" 
                :min="minDate"
                class="form-input"
              />
            </div>
          </div>

          <div class="wechat-login-section" v-if="!isWechatLoggedIn">
              <div class="wechat-login-prompt">
                <p>请使用微信扫码登录并关注公众号，以便接收团体预约通知</p>
                <div class="qrcode-container">
                  <!-- 这里放置微信二维码图片或生成组件 -->
                  <img src="../../assets/vue.svg" alt="微信扫码关注" class="qrcode-image">
                </div>
                <button type="button" class="wechat-confirm-btn" @click="handleWechatLogin">
                  我已扫码关注
                </button>
              </div>
            </div>

            <div class="login-status" v-else>
              <span class="login-success">✓ 已微信授权登录</span>
            </div>

          <div class="form-group">
            <label class="form-label">预计进入时段</label>
            <div class="time-inputs">
              <input 
                type="time" 
                v-model="formData.entryTime" 
                class="time-input"
              />
              <span class="time-separator">至</span>
              <input 
                type="time" 
                v-model="formData.exitTime" 
                class="time-input"
              />
            </div>
            <p class="time-hint" v-if="!formData.entryTime && !formData.exitTime">不填写则默认为9:00-20:00</p>
          </div>

          <div class="form-group">
            <label class="form-label">进出校门 <span class="required">*</span></label>
            <div class="radio-group">
              <label class="radio-label">
                <input type="radio" v-model="formData.gate" value="北门" />
                <span class="radio-text">北门</span>
              </label>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">车牌号</label>
            <input 
              type="text" 
              v-model="formData.carNumber" 
              placeholder="请输入车牌号码（如有车辆）" 
              class="form-input"
            />
          </div>

          <div class="form-group">
            <label class="form-label">审批人 <span class="required">*</span></label>
            <select v-model="formData.approverId" class="form-select">
              <option value="">请选择审批人</option>
              <option v-for="approver in approvers" :key="approver.id" :value="approver.id">
                {{ approver.name }} - {{ approver.department }}
              </option>
            </select>
          </div>

          <div class="form-actions">
            <button type="button" class="reset-btn" @click="resetForm">取消</button>
            <button type="button" class="submit-btn" @click="submitForm">提交申请</button>
          </div>
        </form>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { createGroupReservation } from '../../api/reservation.js'

const router = useRouter()
const noticeContent = ref(null)
const isScrolledToBottom = ref(false)

// 表单数据
const formData = ref({
  purpose: '',
  visitorCount: '',
  contactName: '',
  contactPhone: '',
  visitDate: '',
  entryTime: '',
  exitTime: '',
  gate: '北门',
  carNumber: '',
  approverId: '',
  remark: '',
})

// 添加微信登录状态
const isWechatLoggedIn = ref(false)

// 处理微信登录
const handleWechatLogin = () => {
  // 这里应该实现实际的微信登录逻辑
  // 暂时模拟登录成功
  isWechatLoggedIn.value = true
  alert('微信授权成功！您将收到公众号通知')
}

// 审批人列表（模拟数据）
const approvers = ref([
  { id: 1, name: '张老师', department: '计算机学院' },
  { id: 2, name: '李老师', department: '电子工程学院' },
  { id: 3, name: '王老师', department: '保卫处' },
  { id: 4, name: '赵老师', department: '机械工程学院' }
])

// 控制弹窗显示
const showNoticeModal = ref(true)
const agreeNotice = ref(false)

// 设置最小日期为今天
const minDate = new Date().toISOString().split('T')[0]

// 监听滚动事件
const handleScroll = () => {
  if (noticeContent.value) {
    const { scrollTop, scrollHeight, clientHeight } = noticeContent.value
    // 判断是否滚动到底部
    isScrolledToBottom.value = scrollTop + clientHeight >= scrollHeight - 10
  }
}

// 关闭弹窗
const closeNotice = () => {
  if (agreeNotice.value) {
    showNoticeModal.value = false
  }
}

// 初始化滚动监听
onMounted(() => {
  nextTick(() => {
    if (noticeContent.value) {
      noticeContent.value.addEventListener('scroll', handleScroll)
    }
  })
})

// 导航方法
const goBack = () => {
  router.push('/user')
}

const goHome = () => {
  router.push('/')
}

const goQuery = () => {
  router.push('/user/query')
}

const resetForm = () => {
  router.push('/user')
}

// 提交表单
const submitForm = async () => {
  // 表单验证
  if (!formData.value.purpose || !formData.value.visitorCount || !formData.value.contactName || 
      !formData.value.contactPhone || !formData.value.visitDate || !formData.value.approverId) {
    alert('请填写所有必填项')
    return
  }
  
  // 来访人数验证
  if (formData.value.visitorCount < 2) {
    alert('团体预约人数至少需要2人')
    return
  }
  
  // 手机号验证
  const phoneRegex = /^1[3-9]\d{9}$/
  if (!phoneRegex.test(formData.value.contactPhone)) {
    alert('请输入正确的手机号码')
    return
  }
  
  try {
    // 格式化时间
    const requestData = {
      ...formData.value,
      // 如果没有填写时间，使用默认值
      entryTime: formData.value.entryTime || '09:00:00',
      exitTime: formData.value.exitTime || '20:00:00'
    }
    
    // 提交团体预约
    const response = await createGroupReservation(requestData)
    
    if (response._status === 'OK') {
      alert(response.data.message || '团体申请提交成功！请等待审核结果。')
      // 重置表单
      formData.value = {
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
      }
    }
  } catch (error) {
    console.error('提交失败:', error)
    alert(error.message || '提交失败，请稍后重试')
  }
}
</script>

<style scoped>
.group-container {
  min-height: 100vh;
  background: #f5f7fa;
}

/* 主体内容 */
.main-content {
  padding: 40px 20px;
  display: flex;
  justify-content: center;
}

.form-wrapper {
  background: white;
  border-radius: 8px;
  padding: 40px;
  width: 100%;
  max-width: 800px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  border: 1px solid #e8eaed;
}

/* 入校须知弹窗 */
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

.notice-modal {
  background: white;
  border-radius: 12px;
  width: 90%;
  max-width: 600px;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.modal-header {
  background: #1c4e80;
  color: white;
  padding: 20px;
  text-align: center;
}

.modal-header h2 {
  margin: 0;
  font-size: 20px;
}

.modal-content {
  padding: 20px;
  overflow-y: auto;
  max-height: 50vh;
  line-height: 1.6;
}

.modal-content h3 {
  color: #1c4e80;
  margin-top: 0;
}

.modal-content ol {
  padding-left: 20px;
}

.modal-content li {
  margin-bottom: 10px;
}

.notice-highlight {
  background: #fff7e6;
  padding: 15px;
  border-radius: 6px;
  border-left: 4px solid #ffa940;
  margin-top: 20px;
  font-weight: 500;
}

.modal-footer {
  padding: 20px;
  border-top: 1px solid #e8e8e8;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.agree-checkbox {
  display: flex;
  align-items: center;
  cursor: pointer;
}

.agree-checkbox input {
  margin-right: 8px;
}

.agree-checkbox input:disabled {
  cursor: not-allowed;
}

.confirm-btn {
  background: #1c4e80;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
}

.confirm-btn:hover:not(.disabled) {
  background: #164066;
}

.confirm-btn.disabled {
  background: #ccc;
  cursor: not-allowed;
}

/* 微信登录部分样式 */
.wechat-login-section {
  background: #f9f9f9;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 25px;
  text-align: center;
  border: 1px dashed #e8e8e8;
}

.wechat-login-prompt p {
  margin-bottom: 15px;
  color: #1c4e80;
  font-weight: 500;
}

.qrcode-container {
  margin: 15px 0;
}

.qrcode-image {
  width: 150px;
  height: 150px;
  border: 1px solid #e8e8e8;
}

.wechat-confirm-btn {
  background: #07c160;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
}

.wechat-confirm-btn:hover {
  background: #06ae56;
}

.login-status {
  text-align: center;
  margin-bottom: 25px;
}

.login-success {
  color: #07c160;
  font-weight: 500;
  display: inline-flex;
  align-items: center;
  gap: 5px;
}

/* 表单样式 */
.reservation-form {
  max-width: 100%;
}

.form-row {
  display: flex;
  gap: 20px;
  margin-bottom: 25px;
}

.form-group {
  flex: 1;
  margin-bottom: 25px;
}

.form-label {
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: #1c4e80;
  margin-bottom: 8px;
}

.required {
  color: #ff4d4f;
}

.form-input, .form-select, .form-textarea {
  width: 100%;
  padding: 12px 15px;
  border: 1px solid #d9d9d9;
  border-radius: 6px;
  font-size: 14px;
  transition: border-color 0.3s ease;
  box-sizing: border-box;
}

.form-input:focus, .form-select:focus, .form-textarea:focus {
  outline: none;
  border-color: #1c4e80;
  box-shadow: 0 0 0 2px rgba(28, 78, 128, 0.2);
}

.form-textarea {
  resize: vertical;
  min-height: 80px;
}

/* 时间选择器样式 */
.time-inputs {
  display: flex;
  align-items: center;
  gap: 10px;
}

.time-input {
  flex: 1;
  padding: 12px;
  border: 1px solid #d9d9d9;
  border-radius: 6px;
  font-size: 14px;
}

.time-separator {
  color: #666;
  font-size: 14px;
}

.time-hint {
  font-size: 12px;
  color: #999;
  margin-top: 5px;
}

/* 单选按钮组 */
.radio-group {
  display: flex;
  gap: 30px;
}

.radio-label {
  display: flex;
  align-items: center;
  cursor: pointer;
  font-size: 14px;
}

.radio-label input[type="radio"] {
  margin-right: 8px;
}

.radio-text {
  color: #333;
}

/* 表单操作按钮 */
.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 15px;
  margin-top: 40px;
}

.reset-btn, .submit-btn {
  padding: 12px 30px;
  border: none;
  border-radius: 6px;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
}

.reset-btn {
  background: #f5f5f5;
  color: #666;
}

.reset-btn:hover {
  background: #e8e8e8;
}

.submit-btn {
  background: #1c4e80;
  color: white;
}

.submit-btn:hover {
  background: #164066;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .top-header {
    padding: 0 15px;
  }
  
  .main-content {
    padding: 20px 15px;
  }
  
  .form-wrapper {
    padding: 25px 20px;
  }
  
  .form-row {
    flex-direction: column;
    gap: 0;
  }
  
  .radio-group {
    flex-direction: column;
    gap: 15px;
  }
  
  .time-inputs {
    flex-direction: column;
    align-items: stretch;
  }
  
  .time-separator {
    text-align: center;
  }
  
  .modal-footer {
    flex-direction: column;
    gap: 15px;
    align-items: stretch;
  }
  
  .form-actions {
    flex-direction: column;
  }
  
  .reset-btn, .submit-btn {
    width: 100%;
  }
}
</style>