<template>
  <div class="user-home">
    <!-- 顶部导航栏 -->
    <header class="header">
      <div class="header-left">
        <div class="header-title">
          <BankOutlined :style="{ fontSize: '24px', color: '#1c4e80', marginRight: '10px' }" />
          <span class="header-title-main">校园出入预约平台</span>
          <span class="header-title-sub">Campus Access System</span>
        </div>
      </div>
      <div class="header-right">
        <span class="header-current">用户中心，点击这里切换服务 →</span>
         <button 
        :class="['tab-button', activeTab === 'notice' ? 'tab-button-active' : '']"
        @click="activeTab = 'notice'"
      >
        公告查看
      </button>
      <button 
        :class="['tab-button', activeTab === 'personal' ? 'tab-button-active' : '']"
        @click="activeTab = 'personal'"
      >
        个人预约
      </button>
      <button 
        :class="['tab-button', activeTab === 'group' ? 'tab-button-active' : '']"
        @click="activeTab = 'group'"
      >
        团体预约
      </button>
      <span class="logout-link" @click="logout">
          <LogoutOutlined :style="{ marginRight: '5px' }" />
          返回首页
        </span>
      </div>
    </header>

    <!-- 主体内容 -->
    <main class="main">
      <!-- 公告查看 -->
      <div v-if="activeTab === 'notice'" class="tab-content">
        <!-- 标题区域 -->
        <div class="main-title-section">
          <h1 class="main-title">校园公告与查询</h1>
          <p class="main-description">查看最新校园公告，或扫描二维码查询预约结果</p>
        </div>

        <!-- 公告内容区域 -->
        <div class="notice-content-layout">
          <!-- 左侧公告区域 -->
          <div class="notice-left">
            <div class="notice-section">
              <div class="notice-header">
                <h3>系统公告</h3>
              </div>
              <div class="notice-body">
                <template v-if="loading">
                  <div class="notice-title">加载中...</div>
                </template>
                <template v-else>
                  <div v-if="currentAnnouncement" class="notice-current">
                    <div class="notice-title">{{ currentAnnouncement.title }}</div>
                    <div class="notice-text">{{ currentAnnouncement.content }}</div>
                    <div class="notice-date">发布时间：{{ (currentAnnouncement.created_at || '').toString().slice(0,10) }}</div>
                  </div>
                  <div v-else class="notice-empty">
                    <div class="notice-title">暂无公告</div>
                    <div class="notice-text">当前没有系统公告信息。</div>
                    <div class="notice-date">发布时间：</div>
                  </div>
                </template>
                <div class="notice-controls">
                  <button class="notice-btn" :disabled="!announcements.length" @click="prevAnnouncement">‹</button>
                  <button class="notice-btn" :disabled="!announcements.length" @click="nextAnnouncement">›</button>
                </div>
              </div>
            </div>
          </div>

          <!-- 右侧二维码区域 -->
          <div class="notice-right">
            <div class="qr-section">
              <div class="qr-header">
                <h3>预约查询</h3>
              </div>
              <div class="qr-body">
                <div class="qr-code">
                  <div class="qr-placeholder">
                    <QrcodeOutlined :style="{ fontSize: '80px', color: '#1c4e80' }" />
                    <p>微信公众号二维码</p>
                  </div>
                </div>
                <div class="qr-description">
                  <p>扫描二维码关注公众号</p>
                  <p>查询预约审批结果</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 个人预约 -->
      <div v-if="activeTab === 'personal'" class="tab-content">
        <PersonalForm />
      </div>

      <!-- 团体预约 -->
      <div v-if="activeTab === 'group'" class="tab-content">
        <GroupForm />
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { BankOutlined, QrcodeOutlined, LogoutOutlined } from '@ant-design/icons-vue';
import PersonalForm from '../User/Form.vue';
import GroupForm from '../User/Groud.vue';
import { fetchHomepageAnnouncements } from '../../api/notifications.js'

const router = useRouter();
const activeTab = ref('notice');

// 公告数据与状态
const announcements = ref([])
const currentIndex = ref(0)
const currentAnnouncement = ref(null)
const loading = ref(false)

const loadAnnouncements = async () => {
  try {
    loading.value = true
    const res = await fetchHomepageAnnouncements()
    if (res && res.code === 0 && Array.isArray(res.data)) {
      announcements.value = res.data
      currentIndex.value = 0
      currentAnnouncement.value = announcements.value[0] || null
    } else {
      announcements.value = []
      currentAnnouncement.value = null
    }
  } catch (e) {
    console.error('加载公告失败:', e)
    announcements.value = []
    currentAnnouncement.value = null
  } finally {
    loading.value = false
  }
}

const prevAnnouncement = () => {
  if (!announcements.value.length) return
  currentIndex.value = (currentIndex.value - 1 + announcements.value.length) % announcements.value.length
  currentAnnouncement.value = announcements.value[currentIndex.value]
}

const nextAnnouncement = () => {
  if (!announcements.value.length) return
  currentIndex.value = (currentIndex.value + 1) % announcements.value.length
  currentAnnouncement.value = announcements.value[currentIndex.value]
}

// 返回首页
const logout = () => {
  router.push('/');
}

onMounted(() => {
  loadAnnouncements()
})
</script>

<style scoped>
.user-home {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  margin: 0;
  padding: 0;
  overflow-x: hidden;
}

/* 顶部导航栏样式 */
.header {
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

.header-left .header-title {
  display: flex;
  align-items: center;
}

.header-title-main {
  font-size: 27px;
  font-weight: 700;
  color: #1c4e80;
  margin-right: 12px;
}

.header-title-sub {
  font-size: 17px;
  color: #666;
  font-weight: 400;
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

/* 切换按钮样式 */

.tab-button {
  padding: 10px 25px;
  margin: 0 10px;
  border: none;
  border-radius: 6px;
  background: #f0f0f0;
  color: #666;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.tab-button:hover {
  background: #e0e0e0;
}

.tab-button-active {
  background: #1c4e80;
  color: white;
}

.tab-button-active:hover {
  background: #164066;
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

/* 主体内容样式 */
.main {
  flex: 1;
  background: linear-gradient(#c7e9f4 0%, #446daa, #1c4e80);
  padding: 80px 120px 30px 120px;
  display: flex;
  flex-direction: column;
}

.tab-content {
  width: 100%;
}

/* 标题区域样式 */
.main-title-section {
  text-align: center;
  margin-bottom: 40px;
}

.main-title {
  font-size: 36px;
  font-weight: 600;
  color: white;
  margin-bottom: 15px;
  letter-spacing: 1px;
  text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.2);
}

.main-description {
  font-size: 16px;
  color: rgba(255, 255, 255, 0.9);
  max-width: 600px;
  margin: 0 auto;
  line-height: 1.6;
}

/* 公告内容布局 */
.notice-content-layout {
  display: flex;
  gap: 30px;
  margin-bottom: 10px;
}

.notice-left {
  flex: 3;
}

.notice-right {
  flex: 2;
}

/* 公告区域样式 */
.notice-section, .qr-section {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  height: 100%;
}

.notice-header, .qr-header {
  background: #f5f5f5;
  padding: 15px 22px;
  border-bottom: 1px solid #e8e8e8;
}

.notice-header h3, .qr-header h3 {
  margin: 0;
  font-size: 18px;
  color: #333;
}

.notice-body, .qr-body {
  padding: 20px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: calc(100% - 55px);
}

.notice-title {
  font-size: 16px;
  font-weight: bold;
  color: #333;
  margin-bottom: 10px;
}

.notice-text {
  font-size: 14px;
  color: #666;
  line-height: 1.6;
  margin-bottom: 10px;
}

.notice-date {
  font-size: 12px;
  color: #999;
}

.notice-controls {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 15px;
  margin-top: 20px;
}

.notice-btn {
  background: #f5f5f5;
  border: none;
  width: 35px;
  height: 35px;
  border-radius: 50%;
  cursor: pointer;
  font-size: 18px;
  color: #666;
  transition: all 0.3s ease;
}

.notice-btn:hover:not(:disabled) {
  background: #1c4e80;
  color: white;
}

.notice-btn:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

/* 二维码区域样式 */
.qr-body {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.qr-code {
  margin-bottom: 20px;
  text-align: center;
}

.qr-placeholder {
  padding: 20px;
  border: 2px dashed #ddd;
  border-radius: 8px;
  display: inline-block;
}

.qr-placeholder p {
  margin-top: 10px;
  font-size: 14px;
  color: #666;
}

.qr-description {
  text-align: center;
}

.qr-description p {
  margin: 5px 0;
  font-size: 14px;
  color: #666;
}

/* 占位内容样式 */
.placeholder-content {
  background: white;
  border-radius: 12px;
  padding: 40px;
  text-align: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.placeholder-content p {
  font-size: 18px;
  color: #666;
}

/* 响应式设计 */
@media (max-width: 992px) {
  .notice-content-layout {
    flex-direction: column;
  }
  
  .main {
    padding: 180px 40px 30px 40px;
  }
}

@media (max-width: 768px) {
  .header {
    padding: 0 15px;
  }
  
  .tab-buttons {
    flex-wrap: wrap;
    padding: 10px;
  }
  
  .tab-button {
    margin: 5px;
    flex: 1;
    min-width: 120px;
  }
  
  .main {
    padding: 200px 20px 30px 20px;
  }
  
  .main-title {
    font-size: 28px;
  }
}
</style>