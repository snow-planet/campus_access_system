<template>
  <view class="notification-management">
    <!-- 头部标题和按钮 -->
    <view class="filter-section">
      <view class="filter-header">
        <h2>公告与须知管理</h2>
        <button class="btn-primary" @click="showAnnouncementModal(null)">发布公告</button>
      </view>
    </view>

    <view class="content">
      <!-- 左侧公告管理 -->
      <view class="left-panel">
        <view class="panel-header">
          <h2>公告管理</h2>
        </view>
        <view class="announcement-list">
          <view v-for="announcement in announcements" :key="announcement.notification_id" 
               class="announcement-item" :class="{ inactive: !announcement.is_active }">
            <view class="announcement-content">
              <h3>{{ announcement.title }}</h3>
              <p>{{ truncateContent(announcement.content, 50) }}</p>
              <view class="announcement-actions">
                <button @click="showAnnouncementModal(announcement)" class="btn-edit">编辑</button>
                <button @click="deleteAnnouncement(announcement.notification_id)" class="btn-delete">删除</button>
              </view>
            </view>
          </view>
        </view>
      </view>
      
      <!-- 右侧入校须知管理 -->
      <view class="right-panel">
        <view class="panel-header">
          <h2>入校须知管理</h2>
          <view class="notice-tabs">
            <button :class="{ active: activeNoticeTab === 'individual' }" 
                    @click="activeNoticeTab = 'individual'">个人预约</button>
            <button :class="{ active: activeNoticeTab === 'group' }" 
                    @click="activeNoticeTab = 'group'">团体预约</button>
          </view>
        </view>
        
        <view class="notice-editor">
          <h3>{{ activeNoticeTab === 'individual' ? '个人预约入校须知' : '团体预约入校须知' }}</h3>
          <textarea v-model="currentNoticeContent" placeholder="请输入入校须知内容..." class="notice-textarea"></textarea>
          <view class="editor-actions">
            <button @click="saveNotice" class="btn-primary">保存修改</button>
            <button @click="resetNotice" class="btn-secondary">重置</button>
          </view>
        </view>
      </view>
    </view>
    
    <!-- 公告编辑模态框 -->
    <view v-if="showModal" class="modal-overlay">
      <view class="modal">
        <view class="modal-header">
          <h2>{{ editingAnnouncement ? '编辑公告' : '发布公告' }}</h2>
        </view>
        <view class="modal-body">
          <view class="form-group">
            <label>标题</label>
            <input type="text" v-model="currentAnnouncement.title" placeholder="请输入公告标题" class="form-input">
          </view>
          <view class="form-group">
            <label>内容</label>
            <textarea v-model="currentAnnouncement.content" placeholder="请输入公告内容" class="form-textarea"></textarea>
          </view>
          <view class="form-group">
            <label class="checkbox-label">
              <checkbox :checked="currentAnnouncement.is_active" @change="currentAnnouncement.is_active = !currentAnnouncement.is_active" />
              <text>立即启用</text>
            </label>
          </view>
        </view>
        <view class="modal-footer">
          <button @click="saveAnnouncement" class="btn-primary">{{ editingAnnouncement ? '更新' : '发布' }}</button>
          <button @click="showModal = false" class="btn-secondary">取消</button>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { ref, onMounted, watch } from 'vue'

export default {
  name: 'NotificationManagement',
  setup() {
    // 公告相关数据
    const announcements = ref([])
    const showModal = ref(false)
    const editingAnnouncement = ref(null)
    const currentAnnouncement = ref({
      title: '',
      content: '',
      display_location: 'homepage',
      is_active: true
    })
    
    // 入校须知相关数据
    const activeNoticeTab = ref('individual')
    const individualNotice = ref('')
    const groupNotice = ref('')
    const currentNoticeContent = ref('')
    
    // 初始化数据
    onMounted(() => {
      fetchAnnouncements()
      fetchNotices()
    })
    
    // 监听标签切换
    watch(activeNoticeTab, (newTab) => {
      currentNoticeContent.value = newTab === 'individual' ? individualNotice.value : groupNotice.value
    })
    
    // 获取公告列表
    const fetchAnnouncements = async () => {
      try {
        // 模拟数据
        announcements.value = [
          {
            notification_id: 1,
            title: '系统维护通知',
            content: '本系统将于本周六凌晨2点至4点进行维护，期间可能无法正常使用。',
            type: 'announcement',
            display_location: 'homepage',
            publisher_id: 1,
            is_active: true,
            created_at: '2023-06-10 09:30:00',
            updated_at: '2023-06-10 09:30:00'
          },
          {
            notification_id: 2,
            title: '关于暑假期间入校预约调整的通知',
            content: '暑假期间（7月1日至8月31日），个人预约入校时间调整为上午9点至下午5点。',
            type: 'announcement',
            display_location: 'homepage',
            publisher_id: 1,
            is_active: false,
            created_at: '2023-06-01 14:20:00',
            updated_at: '2023-06-15 16:45:00'
          }
        ]
      } catch (error) {
        console.error('获取公告列表失败:', error)
      }
    }
    
    // 获取入校须知
    const fetchNotices = async () => {
      try {
        // 模拟数据
        individualNotice.value = '个人预约入校须知内容...'
        groupNotice.value = '团体预约入校须知内容...'
        currentNoticeContent.value = activeNoticeTab.value === 'individual' 
          ? individualNotice.value 
          : groupNotice.value
      } catch (error) {
        console.error('获取入校须知失败:', error)
      }
    }
    
    // 显示公告编辑模态框
    const showAnnouncementModal = (announcement) => {
      if (announcement) {
        editingAnnouncement.value = announcement
        currentAnnouncement.value = { ...announcement }
      } else {
        editingAnnouncement.value = null
        currentAnnouncement.value = {
          title: '',
          content: '',
          display_location: 'homepage',
          is_active: true
        }
      }
      showModal.value = true
    }
    
    // 保存公告
    const saveAnnouncement = async () => {
      try {
        showModal.value = false
        fetchAnnouncements()
        uni.showToast({
          title: '保存成功',
          icon: 'success'
        })
      } catch (error) {
        console.error('保存公告失败:', error)
        uni.showToast({
          title: '保存失败，请重试',
          icon: 'none'
        })
      }
    }
    
    // 删除公告
    const deleteAnnouncement = async (id) => {
      uni.showModal({
        title: '确认删除',
        content: '确定要删除这条公告吗？',
        success: async (res) => {
          if (res.confirm) {
            try {
              fetchAnnouncements()
              uni.showToast({
                title: '删除成功',
                icon: 'success'
              })
            } catch (error) {
              console.error('删除公告失败:', error)
              uni.showToast({
                title: '删除失败，请重试',
                icon: 'none'
              })
            }
          }
        }
      })
    }
    
    // 保存入校须知
    const saveNotice = async () => {
      try {
        uni.showToast({
          title: '保存成功',
          icon: 'success'
        })
        fetchNotices()
      } catch (error) {
        console.error('保存入校须知失败:', error)
        uni.showToast({
          title: '保存失败，请重试',
          icon: 'none'
        })
      }
    }
    
    // 重置入校须知内容
    const resetNotice = () => {
      currentNoticeContent.value = activeNoticeTab.value === 'individual' 
        ? individualNotice.value 
        : groupNotice.value
    }
    
    // 辅助函数：截断内容
    const truncateContent = (content, length) => {
      if (!content) return ''
      if (content.length <= length) return content
      return content.substring(0, length) + '...'
    }
    
    return {
      announcements,
      showModal,
      editingAnnouncement,
      currentAnnouncement,
      activeNoticeTab,
      currentNoticeContent,
      showAnnouncementModal,
      saveAnnouncement,
      deleteAnnouncement,
      saveNotice,
      resetNotice,
      truncateContent
    }
  }
}
</script>

<style scoped>
.notification-management {
  background: linear-gradient(#c7e9f4 0%, #446daa, #1c4e80);
  min-height: 100vh;
}

/* 头部区域 */
.filter-section {
  background: white;
  border-radius: 8rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);
}

.filter-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 32rpx;
}

.filter-header h2 {
  margin: 0;
  font-size: 36rpx;
  color: #333;
  font-weight: 600;
}

/* 内容区域 */
.content {
  display: flex;
  flex-direction: column;
}

.left-panel, .right-panel {
  background: #fff;
  padding: 32rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32rpx;
}

.panel-header h2 {
  font-size: 32rpx;
  color: #333;
}

/* 按钮样式 */
.btn-primary {
  background: #1c4e80;
  color: white;
  border: none;
  padding: 2rpx 60rpx;
  border-radius: 20rpx;
  font-size: 28rpx;
  cursor: pointer;
}

.btn-secondary {
  background: #f5f5f5;
  color: #666;
  border: 1px solid #ddd;
  padding: 5rpx 20rpx;
  border-radius: 8rpx;
  font-size: 28rpx;
  cursor: pointer;
}

/* 公告列表 */
.announcement-list {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

.announcement-item {
  padding: 24rpx;
  border: 1px solid #e8e8e8;
  border-radius: 8rpx;
}

.announcement-item.inactive {
  background: #fafafa;
  opacity: 0.7;
}

.announcement-content h3 {
  margin: 0 0 16rpx 0;
  font-size: 30rpx;
  color: #333;
}

.announcement-content p {
  margin: 0 0 24rpx 0;
  color: #666;
  font-size: 26rpx;
}

.announcement-actions {
  display: flex;
  gap: 5rpx;
  justify-content: flex-end;
}

.btn-edit, .btn-delete {
  padding: 2rpx 30rpx;
  border: none;
  border-radius: 20rpx;
  font-size: 30rpx;
  cursor: pointer;
}

.btn-edit {
  background: #e6f7ff;
  color: #1890ff;
  border: 1px solid #91d5ff;
}

.btn-delete {
  background: #fff2f0;
  color: #ff4d4f;
  border: 1px solid #ffccc7;
}

/* 入校须知标签 */
.notice-tabs {
  display: flex;
  gap: 16rpx;
}

.notice-tabs button {
  padding: 12rpx 24rpx;
  border: 1px solid #d9d9d9;
  background: #fafafa;
  border-radius: 6rpx;
  font-size: 26rpx;
  cursor: pointer;
}

.notice-tabs button.active {
  background: #1c4e80;
  color: white;
  border-color: #1c4e80;
}

/* 编辑器 */
.notice-editor h3 {
  margin: 0 0 24rpx 0;
  font-size: 30rpx;
  color: #333;
}

.notice-textarea {
  width: 100%;
  min-height: 300rpx;
  padding: 20rpx;
  border: 1px solid #d9d9d9;
  border-radius: 8rpx;
  margin-bottom: 24rpx;
  font-size: 26rpx;
}

.editor-actions {
  display: flex;
  gap: 16rpx;
  justify-content: flex-end;
}

/* 模态框 */
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

.modal {
  background: white;
  border-radius: 12rpx;
  width: 600rpx;
  max-width: 90%;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 32rpx;
  border-bottom: 1px solid #e8e8e8;
}

.modal-header h2 {
  margin: 0;
  font-size: 32rpx;
  color: #333;
}

.close-btn {
  background: none;
  border: none;
  font-size: 36rpx;
  cursor: pointer;
  color: #999;
}

.modal-body {
  padding: 32rpx;
}

.form-group {
  margin-bottom: 24rpx;
}

.form-group label {
  display: block;
  margin-bottom: 8rpx;
  font-weight: 500;
  font-size: 26rpx;
  color: #333;
}

.form-input, .form-textarea {
  width: 100%;
  padding: 10rpx 5rpx;
  border: 1px solid #d9d9d9;
  border-radius: 6rpx;
  font-size: 26rpx;
}

.form-textarea {
  min-height: 150rpx;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 8rpx;
}

.modal-footer {
  padding: 24rpx 32rpx;
  border-top: 1px solid #e8e8e8;
  display: flex;
  justify-content: flex-end;
  gap: 16rpx;
}

/* 响应式设计 */
@media (min-width: 768px) {
  .content {
    flex-direction: row;
  }
}
</style>