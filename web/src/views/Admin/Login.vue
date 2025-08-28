<template>
  <div class="admin-login-container">
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
        <span class="now-title">审批系统</span>
        <span class="logout-link" @click="logout">
          <LogoutOutlined :style="{ marginRight: '5px' }" />
          返回首页
        </span>
      </div>
    </header>

    <!-- 主体区域 -->
    <main class="main-content">
      <div class="login-center-container">
        <div class="login-card">
          <!-- 左侧欢迎面板 -->
          <div class="welcome-panel">
            <div class="welcome-content">
              <h1>欢迎各位审批人</h1>
              <p>请使用您的个人账户信息登录审批系统</p>
              <div class="divider"></div>
              <button class="signin-btn" @click="showSignIn">我想成为审批人！</button>
            </div>
          </div>

          <!-- 右侧表单面板 -->
          <div class="form-panel">
            <!-- 登录表单 -->
            <div class="form-content">
              <h2>审批系统登录</h2>
              <form @submit.prevent="handleLogin">
                <div class="input-group">
                  <input type="text" placeholder="用户名" v-model="loginForm.username" required>
                </div>
                <div class="input-group">
                  <input :type="showPassword ? 'text' : 'password'" placeholder="密码" v-model="loginForm.password" required>
                  <span class="toggle-password" @click="showPassword = !showPassword">
                    {{ showPassword ? '隐藏' : '显示' }}
                  </span>
                </div>
                <div class="remember-forgot">
                  <label class="checkbox-container">
                    记住我
                    <input type="checkbox" v-model="loginForm.remember">
                    <span class="checkmark"></span>
                  </label>
                  <a href="#" class="forgot-link" @click.prevent="showForgotPasswordModal">忘记密码?</a>
                </div>
                <button type="submit" class="submit-btn">登 录</button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- 审批人申请弹窗 -->
    <div v-if="showApplicationModal" class="modal-overlay" @click.self="closeModal">
      <div class="application-modal">
        <div class="modal-header">
          <h3>成为审批人申请</h3>
          <span class="close-btn" @click="closeModal">×</span>
        </div>
        
        <div class="modal-content">
          <!-- 左侧表单 -->
          <div class="form-section">
            <form @submit.prevent="submitApplication">
              <div class="input-group">
                <label>真实姓名</label>
                <input 
                  type="text" 
                  v-model="applicationForm.real_name" 
                  placeholder="请输入您的真实姓名"
                  required
                >
              </div>
              
              <div class="input-group">
                <label>手机号</label>
                <input 
                  type="tel" 
                  v-model="applicationForm.phone" 
                  placeholder="请输入您的手机号码"
                  required
                >
              </div>
              
              <div class="input-group">
                <label>学院/部门</label>
                <input 
                  type="text" 
                  v-model="applicationForm.college" 
                  placeholder="请输入您所在的学院或部门"
                  required
                >
              </div>
              
              <div class="input-group">
                <label>职位</label>
                <select v-model="applicationForm.position" required>
                  <option value="" disabled selected>请选择您的职位</option>
                  <option value="teacher">教师</option>
                  <option value="security">安保人员</option>
                </select>
              </div>
              
              <button type="submit" class="submit-application-btn">提交申请</button>
            </form>
          </div>
          
          <!-- 右侧微信验证 -->
          <div class="wechat-section">
            <div class="wechat-tip">
              <h4>微信验证</h4>
              <p>请扫描二维码关注公众号完成验证</p>
            </div>
            <div class="qrcode-container">
              <!-- 这里放置微信二维码图片 -->
              <div class="qrcode-placeholder">
                <div class="qrcode-icon">
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="#1c4e80">
                    <path d="M15.5,3.5c1.1,0,2,0.9,2,2c0,1.1-0.9,2-2,2s-2-0.9-2-2C13.5,4.4,14.4,3.5,15.5,3.5z M8.5,3.5c1.1,0,2,0.9,2,2c0,1.1-0.9,2-2,2s-2-0.9-2-2C6.5,4.4,7.4,3.5,8.5,3.5z M15.5,14.5c1.4,0,2.5-1.1,2.5-2.5c0-1.4-1.1-2.5-2.5-2.5S13,10.6,13,12C13,13.4,14.1,14.5,15.5,14.5z M8.5,14.5c1.4,0,2.5-1.1,2.5-2.5c0-1.4-1.1-2.5-2.5-2.5S6,10.6,6,12C6,13.4,7.1,14.5,8.5,14.5z M12,18.5c2.5,0,4.5-2,4.5-4.5c0-2.5-2-4.5-4.5-4.5s-4.5,2-4.5,4.5C7.5,16.5,9.5,18.5,12,18.5z M19.5,3.5h-15C3.7,3.5,3,4.2,3,5v14c0,0.8,0.7,1.5,1.5,1.5h15c0.8,0,1.5-0.7,1.5-1.5V5C21,4.2,20.3,3.5,19.5,3.5z M19.5,19.5h-15V5h15V19.5z"/>
                  </svg>
                </div>
                <p>微信公众号二维码</p>
              </div>
            </div>
            <p class="wechat-notice">扫码关注后即可提交申请</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 忘记密码弹窗 -->
    <div v-if="showForgotModal" class="modal-overlay" @click.self="closeForgotModal">
      <div class="forgot-modal">
        <div class="modal-header">
          <h3>忘记密码</h3>
          <span class="close-btn" @click="closeForgotModal">×</span>
        </div>
        <div class="modal-content">
          <div class="forgot-content">
            <div class="forgot-icon">
              <svg width="60" height="60" viewBox="0 0 24 24" fill="#1c4e80">
                <path d="M12,1L3,5V11C3,16.55 6.84,21.74 12,23C17.16,21.74 21,16.55 21,11V5L12,1M12,7C13.4,7 14.8,8.6 14.8,10V11.5C15.4,11.5 16,12.1 16,12.7V16.2C16,16.8 15.4,17.3 14.8,17.3H9.2C8.6,17.3 8,16.8 8,16.2V12.7C8,12.1 8.6,11.5 9.2,11.5V10C9.2,8.6 10.6,7 12,7M12,8.2C11.2,8.2 10.5,8.7 10.5,10V11.5H13.5V10C13.5,8.7 12.8,8.2 12,8.2Z"/>
              </svg>
            </div>
            <h4>密码重置说明</h4>
            <p>如果您忘记了登录密码，请按照以下方式进行密码重置：</p>
            <div class="reset-steps">
              <div class="step">
                <span class="step-number">1</span>
                <span class="step-text">联系您所在学院的二级学院负责人</span>
              </div>
              <div class="step">
                <span class="step-number">2</span>
                <span class="step-text">或联系学校保卫处相关工作人员</span>
              </div>
              <div class="step">
                <span class="step-number">3</span>
                <span class="step-text">提供您的身份信息进行验证</span>
              </div>
              <div class="step">
                <span class="step-number">4</span>
                <span class="step-text">工作人员将为您重置密码</span>
              </div>
            </div>
            <div class="contact-info">
              <p><strong>联系方式：</strong></p>
              <p>保卫处电话：xxx-xxxx-xxxx</p>
              <p>办公时间：周一至周五 8:00-17:30</p>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="confirm-btn" @click="closeForgotModal">我知道了</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { BankOutlined, LogoutOutlined } from '@ant-design/icons-vue'
import { adminLogin, submitApproverApplication } from '../../api/webAuth'

export default {
  name: 'AdminLogin',
  components: {
    BankOutlined,
    LogoutOutlined
  },
  setup() {
    const router = useRouter()
    const showPassword = ref(false)
    const showApplicationModal = ref(false)
    const showForgotModal = ref(false)
    
    const loginForm = reactive({
      username: '',
      password: '',
      remember: false
    })
    
    const applicationForm = reactive({
      real_name: '',
      phone: '',
      college: '',
      position: ''
    })
    
    // 虚拟账号数据
    const accounts = [
      {
        username: 'approver',
        password: '123456',
        role: 'approver',
        name: '审批员'
      },
      {
        username: 'admin',
        password: '123456',
        role: 'admin',
        name: '超级管理员'
      }
    ]
    
    const handleLogin = async () => {
      try {
        const res = await adminLogin({
          username: loginForm.username,
          password: loginForm.password
        })
        
        if (res && res._status === 'OK') {
          // 登录成功，保存用户信息
          const userData = res.data
          localStorage.setItem('currentUser', JSON.stringify({
            user_id: userData.user_id,
            username: userData.username,
            real_name: userData.real_name,
            role: userData.role,
            college: userData.college,
            position: userData.position,
            token: userData.token
          }))
          
          // 根据角色跳转到不同页面
          if (userData.role === 'admin') {
            router.push('/admin/adminhome')
          } else if (userData.role === 'approver') {
            router.push('/admin/home')
          } else {
            alert('权限不足，无法访问管理系统')
            return
          }
          
          alert(`欢迎 ${userData.real_name}！`)
        } else {
          const errorMsg = res._error?.meta || '登录失败'
          alert(errorMsg)
        }
      } catch (error) {
        console.error('登录失败:', error)
        alert('登录失败，请检查网络连接或稍后重试')
      }
    }
    
    const showSignIn = () => {
      showApplicationModal.value = true
    }
    
    const closeModal = () => {
      showApplicationModal.value = false
      // 重置表单
      Object.assign(applicationForm, {
        real_name: '',
        phone: '',
        college: '',
        position: ''
      })
    }
    
    const submitApplication = async () => {
      // 表单验证
      if (!applicationForm.real_name || !applicationForm.phone || 
          !applicationForm.college || !applicationForm.position) {
        alert('请填写所有必填字段')
        return
      }
      
      // 手机号格式验证
      const phoneRegex = /^1[3-9]\d{9}$/
      if (!phoneRegex.test(applicationForm.phone)) {
        alert('请输入正确的手机号码')
        return
      }
      
      try {
        // 这里需要先获取用户ID，实际应用中可能需要微信登录
        // 暂时使用固定用户ID进行演示
        const tempUserId = 1
        
        const res = await submitApproverApplication({
          user_id: tempUserId,
          real_name: applicationForm.real_name,
          phone: applicationForm.phone,
          college: applicationForm.college,
          position: applicationForm.position
        })
        
        if (res && res._status === 'OK') {
          alert('申请已提交，请等待管理员审核')
          closeModal()
        } else {
          const errorMsg = res._error?.meta || '申请提交失败'
          alert(errorMsg)
        }
      } catch (error) {
        console.error('提交申请失败:', error)
        alert('申请提交失败，请检查网络连接或稍后重试')
      }
    }
    
    const showForgotPasswordModal = () => {
      showForgotModal.value = true
    }
    
    const closeForgotModal = () => {
      showForgotModal.value = false
    }
    
    const logout = () => {
      router.push('/')
    }
    
    return {
      showPassword,
      loginForm,
      showApplicationModal,
      showForgotModal,
      applicationForm,
      handleLogin,
      showSignIn,
      closeModal,
      submitApplication,
      showForgotPasswordModal,
      closeForgotModal,
      logout
    }
  }
}
</script>

<style scoped>
.admin-login-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  margin: 0;
  padding: 0;
  overflow-x: hidden;
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
  font-size: 27px;
  font-weight: 700;
  color: #1c4e80;
  margin-right: 12px;
}

.sub-title {
  font-size: 17px;
  color: #666;
  font-weight: 400;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 20px;
}

.now-title {
  font-size: 20px;
  color: #1c4e80;
  font-weight: 500;
}

.logout-link {
  color: #666;
  cursor: pointer;
  display: flex;
  align-items: center;
  font-size: 14px;
  transition: color 0.3s ease;
  margin-left: 20px;
}

.logout-link:hover {
  color: #ff4d4f;
}

.main-content {
  flex: 1;
  background: linear-gradient(#c7e9f4 0%, #446daa, #1c4e80);
  padding: 120px 120px 10px 120px;
  display: flex;
  flex-direction: column;
}

/* 登录区域容器 */
.login-center-container {
  display: flex;
  justify-content: center;
  align-items: center;
  flex: 1;
  padding: 20px 0;
}

.login-card {
  display: flex;
  width: 800px;
  height: 450px;
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 15px 30px rgba(0, 0, 0, 0.2);
}

/* 左侧欢迎面板 */
.welcome-panel {
  flex: 1;
  background: linear-gradient(135deg, #4a6fa5 0%, #1c4e80 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
  position: relative;
}

.welcome-content {
  text-align: center;
  z-index: 2;
}

.welcome-content h1 {
  font-size: 32px;
  margin-bottom: 20px;
  font-weight: 600;
}

.welcome-content p {
  font-size: 16px;
  line-height: 1.6;
  margin-bottom: 30px;
  opacity: 0.9;
}

.divider {
  width: 50px;
  height: 3px;
  background: rgba(255, 255, 255, 0.5);
  margin: 0 auto 30px;
  border-radius: 3px;
}

.signin-btn {
  background: transparent;
  border: 2px solid rgba(255, 255, 255, 0.5);
  color: white;
  padding: 12px 30px;
  border-radius: 30px;
  font-size: 14px;
  font-weight: 600;
  letter-spacing: 1px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.signin-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: white;
}

/* 右侧表单面板 */
.form-panel {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
  background: white;
}

.form-content {
  width: 100%;
  max-width: 320px;
}

.form-content h2 {
  color: #1c4e80;
  font-size: 24px;
  margin-bottom: 30px;
  text-align: center;
  font-weight: 600;
}

/* 输入框组 */
.input-group {
  position: relative;
  margin-bottom: 20px;
}

.input-group input {
  width: 100%;
  padding: 14px 15px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  transition: border 0.3s ease;
}

.input-group input:focus {
  border-color: #1c4e80;
  outline: none;
}

.toggle-password {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  cursor: pointer;
  user-select: none;
}

/* 记住我和忘记密码 */
.remember-forgot {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px;
  font-size: 13px;
}

.checkbox-container {
  display: flex;
  align-items: center;
  cursor: pointer;
  color: #666;
}

.checkbox-container input {
  position: absolute;
  opacity: 0;
  cursor: pointer;
}

.checkmark {
  height: 16px;
  width: 16px;
  background-color: #f9f9f9;
  border: 1px solid #ddd;
  border-radius: 3px;
  margin-right: 8px;
  position: relative;
}

.checkbox-container input:checked ~ .checkmark {
  background-color: #1c4e80;
  border-color: #1c4e80;
}

.checkmark:after {
  content: "";
  position: absolute;
  display: none;
}

.checkbox-container input:checked ~ .checkmark:after {
  display: block;
  left: 5px;
  top: 2px;
  width: 4px;
  height: 8px;
  border: solid white;
  border-width: 0 2px 2px 0;
  transform: rotate(45deg);
}

.forgot-link {
  color: #1c4e80;
  text-decoration: none;
  transition: color 0.2s ease;
}

.forgot-link:hover {
  color: #0f3057;
  text-decoration: underline;
}

/* 提交按钮 */
.submit-btn {
  width: 100%;
  padding: 14px;
  background: linear-gradient(to right, #1c4e80, #4a6fa5);
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.submit-btn:hover {
  background: linear-gradient(to right, #0f3057, #3d5a80);
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(28, 78, 128, 0.3);
}

/* 审批人申请弹窗样式 */
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
  z-index: 2000;
}

.application-modal {
  background: white;
  border-radius: 12px;
  width: 800px;
  max-width: 90%;
  max-height: 90vh;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 30px;
  border-bottom: 1px solid #eee;
  background: linear-gradient(to right, #1c4e80, #4a6fa5);
  color: white;
}

.modal-header h3 {
  margin: 0;
  font-size: 20px;
}

.close-btn {
  font-size: 24px;
  cursor: pointer;
  font-weight: bold;
}

.close-btn:hover {
  color: #ffdddd;
}

.modal-content {
  display: flex;
  padding: 0;
}

.form-section {
  flex: 1;
  padding: 30px;
  border-right: 1px solid #eee;
}

.form-section .input-group {
  margin-bottom: 20px;
}

.form-section label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #333;
}

.form-section input,
.form-section select {
  width: 100%;
  padding: 12px 15px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.form-section input:focus,
.form-section select:focus {
  border-color: #1c4e80;
  outline: none;
}

.submit-application-btn {
  width: 100%;
  padding: 14px;
  background: linear-gradient(to right, #1c4e80, #4a6fa5);
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  margin-top: 10px;
}

.submit-application-btn:hover {
  background: linear-gradient(to right, #0f3057, #3d5a80);
}

.wechat-section {
  flex: 1;
  padding: 30px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: #f9f9f9;
}

.wechat-tip {
  text-align: center;
  margin-bottom: 20px;
}

.wechat-tip h4 {
  color: #1c4e80;
  margin-bottom: 8px;
}

.wechat-tip p {
  color: #666;
  font-size: 14px;
}

.qrcode-container {
  width: 180px;
  height: 180px;
  background: white;
  padding: 10px;
  border-radius: 8px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.qrcode-placeholder {
  text-align: center;
  color: #666;
}

.qrcode-icon {
  margin-bottom: 10px;
}

.wechat-notice {
  font-size: 13px;
  color: #888;
  text-align: center;
}

/* 响应式设计 */
@media (max-width: 900px) {
  .main-content {
    padding: 100px 20px 20px;
  }
  
  .login-card {
    flex-direction: column;
    height: auto;
    width: 100%;
    max-width: 450px;
  }
  
  .welcome-panel {
    padding: 30px 20px;
  }
  
  .form-panel {
    padding: 30px 20px;
  }
}

@media (max-width: 768px) {
  .modal-content {
    flex-direction: column;
  }
  
  .form-section {
    border-right: none;
    border-bottom: 1px solid #eee;
  }
  
  .application-modal {
    max-height: 80vh;
    overflow-y: auto;
  }
}

/* 忘记密码弹窗样式 */
.forgot-modal {
  background: white;
  border-radius: 12px;
  width: 500px;
  max-width: 90%;
  max-height: 90vh;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
}

.forgot-content {
  text-align: center;
  padding: 20px;
}

.forgot-icon {
  margin-bottom: 20px;
}

.forgot-content h4 {
  color: #1c4e80;
  margin-bottom: 15px;
  font-size: 20px;
}

.forgot-content p {
  color: #666;
  margin-bottom: 20px;
  line-height: 1.6;
}

.reset-steps {
  text-align: left;
  margin: 20px 0;
}

.step {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
  padding: 8px;
  background: #f9f9f9;
  border-radius: 6px;
}

.step-number {
  background: #1c4e80;
  color: white;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: bold;
  margin-right: 12px;
  flex-shrink: 0;
}

.step-text {
  color: #333;
  font-size: 14px;
}

.contact-info {
  background: #f0f8ff;
  padding: 15px;
  border-radius: 6px;
  margin-top: 20px;
  text-align: left;
}

.contact-info p {
  margin: 5px 0;
  color: #333;
  font-size: 14px;
}

.contact-info strong {
  color: #1c4e80;
}

.confirm-btn {
  background: linear-gradient(to right, #1c4e80, #4a6fa5);
  color: white;
  border: none;
  padding: 12px 30px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.confirm-btn:hover {
  background: linear-gradient(to right, #0f3057, #3d5a80);
  transform: translateY(-1px);
}

@media (max-width: 480px) {
  .top-header {
    padding: 0 15px;
  }
  
  .main-title {
    font-size: 20px;
  }
  
  .sub-title {
    font-size: 14px;
  }
  
  .now-title {
    font-size: 18px;
  }
  
  .remember-forgot {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
  
  .form-section,
  .wechat-section {
    padding: 20px;
  }
  
  .forgot-modal {
    width: 95%;
  }
  
  .forgot-content {
    padding: 15px;
  }
}
</style>