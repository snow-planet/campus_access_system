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
        <span class="header-current">点击这里，进入 → </span>
        <button class="admin-btn" @click="enterSystem('后台管理')">
          审批系统
        </button>
      </div>
    </header>

    <!-- 主体区域 -->
    <main class="main-content">
      <!-- 内容容器（左右布局） -->
      <div class="content-container">
        <!-- 左侧内容 -->
        <div class="left-content">
          <!-- 主内容模块 -->
          <div class="main-module">
             <!-- 欢迎标题 -->
            <div class="welcome-section">
              <h1 class="welcome-title">欢迎来到校门出入预约平台 !</h1>
            </div>
            <div class="modules-section">
              <p class="welcome-desc">
                请您严格执行校园安全管理制度，规范人员出入流程，确保校园安全。
                <br>
                如果您是审批人，请点击右上角按钮，进入审批系统
                <br>
                如果您是用户，<span class="header-current-noow">点击这里  ↓ </span>
              </p>
              <div class="module">
                <button class="user-btn" @click="enterSystem('用户预约')">
                  开始预约
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- 右侧二维码区域 -->
        <div class="right-content">
          <div class="qr-code-section">
              <img src="../assets/vue.svg" alt="预约二维码">
              <p class="qr-code-desc">手机扫码进入小程序预约</p>
          </div>
        </div>
      </div>
    </main>

    <!-- 底部导航栏 -->
    <footer class="bottom-footer">
      <div class="footer-content">
        <div class="footer-section">
          <h4>联系方式</h4>
          <p>电话：0571-88358888</p>
          <p>邮箱：security@university.edu.cn</p>
        </div>
        <div class="footer-section">
          <h4>服务时间</h4>
          <p>工作日：6:00 - 22:00</p>
          <p>周末：8:00 - 20:00</p>
        </div>
        <div class="footer-section">
          <h4>服务时间</h4>
          <p>用户指南</p>
          <p>常见问题</p>
        </div>
      </div>
    </footer>
  </div>
</template>

<script>
import { useRouter } from 'vue-router'
import { BankOutlined } from '@ant-design/icons-vue'

export default {
  name: 'Home',
  components: {
    BankOutlined
  },
  setup() {
    const router = useRouter()

    const enterSystem = (systemType) => {
      switch(systemType) {
        case '用户预约':
          router.push('/user/home')
          break
        case '后台管理':
          router.push('/admin/login')
          break
        default:
          console.log(`进入${systemType}系统`)
      }
    }

    return {
      enterSystem
    }
  }
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
  font-size: 16px;
  color: #333;
  font-weight: 500;
}

.header-current {
  font-size: 20px;
  color: #1c4e80;
  font-weight: 500;
}

.header-current-noow {
  font-size: 20px;
  color: #fafafa;
  font-weight: 500;
}

/* 主体区域 */
.main-content {
  flex: 1;
  background: linear-gradient(#c7e9f4 0%, #446daa, #1c4e80);
  padding: 120px 120px 10px 120px;
  display: flex;
  flex-direction: column;
}

/* 内容容器（左右布局） */
.content-container {
  display: flex;
  justify-content: space-between;
  margin-bottom: 30px;
  gap: 20px;
}

.left-content {
  flex: 1;
}

.right-content {
  width: 35%;
  flex-shrink: 0;
}

/* 欢迎区域 */
.welcome-section {
  margin-bottom: 10px;
}

.welcome-title {
  font-size: 45px;
  font-weight: 700;
  color: #fcfcfc;
  margin-bottom: 15px;
}

.welcome-desc {
  font-size: 16px;
  color: #d4d4d4;
  line-height: 1.6;
  margin-bottom: 25px;
}

/* 功能模块 */
.main-module{
  margin-left: 95px;
  margin-top: 29px;
}

.modules-section {
  display: flex;
  flex-direction: column;
}

/*流光按钮*/
.user-btn {
    display: inline-block;
    padding: 12px 28px;
/* linear-gradient()创建一个由多种颜色沿一条直线进行线性过渡的图像 */
    background: linear-gradient(90deg,#03a9f4,#3794f0,#ffeb3b,#03a9f4);
    background-size: 400%;
    text-decoration: none;
    position: absolute;
    border-radius: 50px;
    /* box-shadow: 0 0 10px #b7b2a9; */
    width: 200px;
    font-size: 20px; 
    text-align: center;
    color: #fff;
    letter-spacing: 1px;
    font-weight: 300; 
    transition: 0.5s ease;
    animation: slideTop 1s ease forwards;
    animation-delay: 2s;
}

/* 伪元素 */
.user-btn::before {
    content: "";
    position: absolute;
    left:-5px;
    right: -5px;
    top: -5px;
    bottom: -5px;
    background: linear-gradient(90deg,#03a9f4,#1c4e80,#ffeb3b,#03a9f4);
    background-size: 400%;
    border-radius: 50px;
    filter:blur(20px);
    z-index:-1;
}

.user-btn:hover::before {
    animation: sun 8s infinite;
}

.user-btn:hover {
    animation: sun 8s infinite;
}

.user-btn:active {
    background: none;
    color: #b7b2a9;
    border: 2px solid #b7b2a9;
}
/* 流动效果制作 */
@keyframes sun{
    100%{
      background-position: -400% 0;
    }
}
/*流光按钮*/

.admin-btn {
  color: #3d6bb3;
  width: 170px;
  height: 40px;
  border: none;
  border-radius: 50px;
  font-size: 20px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
}

.admin-btn:hover {
  background: #335a99;
  color:#fff;
}

/* 二维码区域 */
.qr-code-section {
  border-radius: 12px;
  padding: 20px;
  margin-right: 70px;
  text-align: center;
}

.qr-code-section img {
  width: 180px;
  height: 180px;
}

.qr-code-desc {
  font-size: 16px;
  color: #d4d4d4;
  line-height: 1.6;
}

/* 底部导航栏 */
.bottom-footer {
  background: #112a50;
  color: white;
  padding: 15px 0 10px;
}

.footer-content {
  display: flex;
  justify-content: space-around;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.footer-section h4 {
  font-size: 16px;
  margin-bottom: 15px;
  color: #ecf0f1;
}

.footer-section p {
  font-size: 14px;
  margin: 8px 0;
  color: #bdc3c7;
  cursor: pointer;
  transition: color 0.3s ease;
}

.footer-section p:hover {
  color: #3498db;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .top-header {
    padding: 0 15px;
    height: 60px;
  }

  .main-title {
    font-size: 18px;
  }

  .sub-title {
    font-size: 10px;
  }

  .main-content {
    padding: 80px 15px 15px;
  }

  .content-container {
    flex-direction: column;
    margin-bottom: 50px;
  }

  .right-content {
    width: 100%;
    order: -1;
    margin-bottom: 30px;
  }

  .welcome-title {
    font-size: 28px;
  }

  .footer-content {
    flex-direction: column;
    gap: 20px;
    text-align: center;
  }
}
</style>