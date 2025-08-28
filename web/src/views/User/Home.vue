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
                  <div class="notice-loading">加载中...</div>
                </template>
                <template v-else>
                  <div v-if="currentPageAnnouncements.length > 0" class="announcements-grid">
                    <div v-for="announcement in currentPageAnnouncements" :key="announcement.notification_id" class="announcement-card">
                      <div class="announcement-title">{{ announcement.title }}</div>
                      <div class="announcement-content">{{ truncateContent(announcement.content, 100) }}</div>
                      <div class="announcement-date">发布时间：{{ formatDate(announcement.created_at) }}</div>
                      <button class="read-more-btn" @click="viewAnnouncementDetail(announcement)">查看详情</button>
                    </div>
                  </div>
                  <div v-else class="notice-empty">
                    <div class="notice-title">暂无公告</div>
                    <div class="notice-text">当前没有系统公告信息。</div>
                  </div>
                </template>
                <div class="notice-controls" v-if="announcements.length > 3">
                  <button class="notice-btn" :disabled="currentPage === 1" @click="prevPage">‹</button>
                  <span class="page-info">{{ currentPage }} / {{ totalPages }}</span>
                  <button class="notice-btn" :disabled="currentPage === totalPages" @click="nextPage">›</button>
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

    <!-- 公告详情弹窗 -->
    <div v-if="showDetailModal" class="modal-overlay" @click.self="closeDetailModal">
      <div class="detail-modal">
        <div class="modal-header">
          <h3>公告详情</h3>
          <span class="close-btn" @click="closeDetailModal">×</span>
        </div>
        <div class="modal-content" v-if="selectedAnnouncement">
          <div class="announcement-detail">
            <h4>{{ selectedAnnouncement.title }}</h4>
            <div class="announcement-meta">
              <span>发布时间：{{ formatDate(selectedAnnouncement.created_at) }}</span>
            </div>
            <div class="announcement-full-content">
              {{ selectedAnnouncement.content }}
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="confirm-btn" @click="closeDetailModal">关闭</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { BankOutlined, QrcodeOutlined, LogoutOutlined } from '@ant-design/icons-vue';
import PersonalForm from '../User/Form.vue';
import GroupForm from '../User/Groud.vue';
import { fetchHomepageAnnouncements } from '../../api/webNotifications.js'

const router = useRouter();
const activeTab = ref('notice');

// 公告数据与状态
const announcements = ref([])
const currentPage = ref(1)
const pageSize = 3
const loading = ref(false)
const showDetailModal = ref(false)
const selectedAnnouncement = ref(null)

// 计算属性
const totalPages = computed(() => Math.ceil(announcements.value.length / pageSize))
const currentPageAnnouncements = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  const end = start + pageSize
  return announcements.value.slice(start, end)
})

const loadAnnouncements = async () => {
  try {
    loading.value = true
    const res = await fetchHomepageAnnouncements()
    if (res && res.code === 0 && Array.isArray(res.data)) {
      announcements.value = res.data
      currentPage.value = 1
    } else {
      announcements.value = []
    }
  } catch (e) {
    console.error('加载公告失败:', e)
    announcements.value = []
  } finally {
    loading.value = false
  }
}

const prevPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--
  }
}

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++
  }
}

const truncateContent = (content, maxLength) => {
  if (!content) return ''
  if (content.length <= maxLength) return content
  return content.substring(0, maxLength) + '...'
}

const formatDate = (dateString) => {
  if (!dateString) return ''
  return dateString.toString().slice(0, 10)
}

const viewAnnouncementDetail = (announcement) => {
  selectedAnnouncement.value = announcement
  showDetailModal.value = true
}

const closeDetailModal = () => {
  showDetailModal.value = false
  selectedAnnouncement.value = null
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

.notice-loading {
  text-align: center;
  font-size: 16px;
  color: #666;
  padding: 40px 0;
}

.announcements-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 15px;
  flex: 1;
}

.announcement-card {
  background: #f9f9f9;
  border-radius: 8px;
  padding: 15px;
  border: 1px solid #e8e8e8;
  transition: all 0.3s ease;
}

.announcement-card:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.announcement-title {
  font-size: 16px;
  font-weight: bold;
  color: #333;
  margin-bottom: 8px;
  line-height: 1.4;
}

.announcement-content {
  font-size: 14px;
  color: #666;
  line-height: 1.6;
  margin-bottom: 10px;
}

.announcement-date {
  font-size: 12px;
  color: #999;
  margin-bottom: 10px;
}

.read-more-btn {
  background: #1c4e80;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.read-more-btn:hover {
  background: #164066;
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

.notice-empty {
  text-align: center;
  padding: 40px 0;
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

.page-info {
  font-size: 14px;
  color: #666;
  margin: 0 10px;
}

/* 公告详情弹窗样式 */
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

.detail-modal {
  background: white;
  border-radius: 12px;
  width: 600px;
  max-width: 90%;
  max-height: 80vh;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 30px;
  border-bottom: 1px solid #eee;
  background: #f9f9f9;
}

.modal-header h3 {
  margin: 0;
  font-size: 18px;
  color: #333;
}

.close-btn {
  font-size: 24px;
  cursor: pointer;
  color: #666;
  font-weight: bold;
  transition: color 0.3s ease;
}

.close-btn:hover {
  color: #333;
}

.modal-content {
  padding: 30px;
  max-height: 60vh;
  overflow-y: auto;
}

.announcement-detail h4 {
  color: #1c4e80;
  margin-bottom: 15px;
  font-size: 20px;
  line-height: 1.4;
}

.announcement-meta {
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid #eee;
}

.announcement-meta span {
  font-size: 14px;
  color: #666;
}

.announcement-full-content {
  font-size: 16px;
  line-height: 1.8;
  color: #333;
  white-space: pre-wrap;
}

.modal-footer {
  padding: 20px 30px;
  border-top: 1px solid #eee;
  text-align: right;
  background: #f9f9f9;
}

.confirm-btn {
  background: #1c4e80;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.confirm-btn:hover {
  background: #164066;
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