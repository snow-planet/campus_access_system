<template>
  <div class="notification-management">
    <div class="content">
      <!-- 左侧公告管理 -->
      <div class="left-panel">
        <div class="panel-header">
          <h2>公告管理</h2>
          <button class="btn-primary" @click="showAnnouncementModal(null)">发布公告</button>
        </div>
        
        <div class="announcement-list">
          <div v-for="announcement in announcements" :key="announcement.notification_id" 
               class="announcement-item" :class="{ inactive: !announcement.is_active }">
            <div class="announcement-content">
              <h3>{{ announcement.title }}</h3>
              <p>{{ truncateContent(announcement.content, 50) }}</p>
              <div class="meta">
                <span>发布于: {{ formatDate(announcement.created_at) }}</span>
              </div>
              <div class="announcement-actions">
                <button @click="showAnnouncementModal(announcement)" class="btn-edit">编辑</button>
                <button @click="deleteAnnouncementItem(announcement.notification_id)" class="btn-delete">删除</button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 右侧入校须知管理 -->
      <div class="right-panel">
        <div class="panel-header">
          <h2>入校须知管理</h2>
          <div class="notice-tabs">
            <button :class="{ active: activeNoticeTab === 'individual' }" 
                    @click="activeNoticeTab = 'individual'">个人预约</button>
            <button :class="{ active: activeNoticeTab === 'group' }" 
                    @click="activeNoticeTab = 'group'">团体预约</button>
          </div>
        </div>
        
        <div class="notice-editor">
          <h3>{{ activeNoticeTab === 'individual' ? '个人预约入校须知' : '团体预约入校须知' }}</h3>
          <textarea v-model="currentNoticeContent" placeholder="请输入入校须知内容..."></textarea>
          <div class="editor-actions">
            <button @click="saveNotice" class="btn-primary">保存</button>
            <button @click="resetNotice" class="btn-secondary">重置</button>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 公告编辑模态框 -->
    <div v-if="showModal" class="modal-overlay">
      <div class="modal">
        <div class="modal-header">
          <h2>{{ editingAnnouncement ? '编辑公告' : '发布公告' }}</h2>
          <button class="close-btn" @click="showModal = false">×</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label>标题</label>
            <input type="text" v-model="currentAnnouncement.title" placeholder="请输入公告标题">
          </div>
          <div class="form-group">
            <label>内容</label>
            <textarea v-model="currentAnnouncement.content" placeholder="请输入公告内容"></textarea>
          </div>
        </div>
        <div class="modal-footer">
          <button @click="saveAnnouncement" class="btn-primary">{{ editingAnnouncement ? '更新' : '发布' }}</button>
          <button @click="showModal = false" class="btn-secondary">取消</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, watch } from 'vue'
import { getAnnouncements, createAnnouncement, updateAnnouncement, deleteAnnouncement, getNotice, updateNotice } from '../../api/webAdmin.js'

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
      fetchAnnouncementsList()
      fetchNotices()
    })
    
    // 监听标签切换
    watch(activeNoticeTab, (newTab) => {
      currentNoticeContent.value = newTab === 'individual' ? individualNotice.value : groupNotice.value
    })
    
    // 获取公告列表
    const fetchAnnouncementsList = async () => {
      try {
        const res = await getAnnouncements({ page: 1, limit: 50 })
        if (res && res._status === 'OK' && res.data) {
          announcements.value = res.data.announcements || []
        } else {
          announcements.value = []
        }
      } catch (error) {
        console.error('获取公告列表失败:', error)
        alert('获取公告列表失败')
      }
    }
    
    // 获取入校须知
    const fetchNotices = async () => {
      try {
        // 获取个人预约须知
        const individualRes = await getNotice('individual_notice')
        if (individualRes && individualRes._status === 'OK' && individualRes.data) {
          individualNotice.value = individualRes.data.content || ''
        } else {
          individualNotice.value = '暂无个人预约入校须知'
        }
        
        // 获取团队预约须知
        const groupRes = await getNotice('group_notice')
        if (groupRes && groupRes._status === 'OK' && groupRes.data) {
          groupNotice.value = groupRes.data.content || ''
        } else {
          groupNotice.value = '暂无团队预约入校须知'
        }
        
        currentNoticeContent.value = activeNoticeTab.value === 'individual' 
          ? individualNotice.value 
          : groupNotice.value
      } catch (error) {
        console.error('获取入校须知失败:', error)
        alert('获取入校须知失败')
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
        // 获取当前用户ID
        const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}')
        const publisherId = currentUser.user_id || 1
        
        const payload = {
          title: currentAnnouncement.value.title,
          content: currentAnnouncement.value.content,
          display_location: currentAnnouncement.value.display_location,
          publisher_id: publisherId,
          is_active: currentAnnouncement.value.is_active
        }
        
        if (editingAnnouncement.value) {
          // 更新公告
          await updateAnnouncement(editingAnnouncement.value.notification_id, payload)
        } else {
          // 创建公告
          await createAnnouncement(payload)
        }
        
        showModal.value = false
        fetchAnnouncementsList()
        alert('保存成功')
      } catch (error) {
        console.error('保存公告失败:', error)
        alert('保存失败，请重试')
      }
    }
    
    // 删除公告
    const deleteAnnouncementItem = async (id) => {
      if (!confirm('确定要删除这条公告吗？')) return
      
      try {
        await deleteAnnouncement(id)
        fetchAnnouncementsList()
        alert('删除成功')
      } catch (error) {
        console.error('删除公告失败:', error)
        alert('删除失败，请重试')
      }
    }
    
    // 保存入校须知
    const saveNotice = async () => {
      try {
        // 获取当前用户ID
        const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}')
        const publisherId = currentUser.user_id || 1
        
        const noticeType = activeNoticeTab.value === 'individual' ? 'individual_notice' : 'group_notice'
        const title = activeNoticeTab.value === 'individual' ? '个人预约入校须知' : '团队预约入校须知'
        
        const payload = {
          title,
          content: currentNoticeContent.value,
          publisher_id: publisherId
        }
        
        await updateNotice(noticeType, payload)
        
        // 更新本地数据
        if (activeNoticeTab.value === 'individual') {
          individualNotice.value = currentNoticeContent.value
        } else {
          groupNotice.value = currentNoticeContent.value
        }
        
        alert('保存成功')
      } catch (error) {
        console.error('保存入校须知失败:', error)
        alert('保存失败，请重试')
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
      if (content.length <= length) return content
      return content.substring(0, length) + '...'
    }
    
    // 辅助函数：格式化日期
    const formatDate = (dateString) => {
      const date = new Date(dateString)
      return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`
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
      deleteAnnouncementItem,
      saveNotice,
      resetNotice,
      truncateContent,
      formatDate
    }
  }
}
</script>

<style scoped>
.notification-management {
  padding: 20px;
  width: 100%;
  min-height: 100vh;
  margin: 0 auto;
  background: linear-gradient(#c7e9f4 0%, #446daa, #1c4e80);
}

.content {
  display: flex;
  gap: 20px;
}

.left-panel, .right-panel {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 20px;
}

.left-panel {
  flex: 1;
}

.right-panel {
  flex: 1;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.panel-header h2 {
  font-size: 18px;
  color: #333;
}

.btn-primary {
  background: #1890ff;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
}

.btn-primary:hover {
  background: #40a9ff;
}

.btn-secondary {
  background: #f5f5f5;
  color: #333;
  border: 1px solid #d9d9d9;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
}

.btn-secondary:hover {
  background: #e6e6e6;
}

.announcement-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.announcement-item {
  padding: 15px;
  border: 1px solid #e8e8e8;
  border-radius: 4px;
  margin-bottom: 15px;
}

.announcement-item.inactive {
  background: #fafafa;
  opacity: 0.7;
}

.announcement-content h3 {
  margin: 0 0 10px 0;
  font-size: 16px;
}

.announcement-content p {
  margin: 0 0 10px 0;
  color: #666;
}

.meta {
  display: flex;
  gap: 15px;
  font-size: 12px;
  color: #999;
}

.announcement-actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
  margin-top: 15px;
}

.btn-edit {
  background: #52c41a;
  color: white;
  border: none;
  padding: 4px 8px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
}

.btn-delete {
  background: #f5222d;
  color: white;
  border: none;
  padding: 4px 8px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
}

.notice-tabs {
  display: flex;
  gap: 8px;
}

.notice-tabs button {
  padding: 8px 16px;
  border: 1px solid #d9d9d9;
  background: #fafafa;
  cursor: pointer;
}

.notice-tabs button.active {
  background: #1890ff;
  color: white;
  border-color: #1890ff;
}

.notice-editor h3 {
  margin: 0 0 15px 0;
  font-size: 16px;
}

.notice-editor textarea {
  width: 100%;
  min-height: 300px;
  padding: 10px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  margin-bottom: 15px;
  resize: vertical;
}

.editor-actions {
  display: flex;
  gap: 10px;
}

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
  border-radius: 8px;
  width: 500px;
  max-width: 90%;
  max-height: 90%;
  overflow: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid #e8e8e8;
}

.modal-header h2 {
  margin: 0;
  font-size: 18px;
}

.close-btn {
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
}

.modal-body {
  padding: 16px;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: 500;
}

.form-group input, .form-group textarea {
  width: 100%;
  padding: 8px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
}

.form-group textarea {
  min-height: 100px;
  resize: vertical;
}

.modal-footer {
  padding: 16px;
  border-top: 1px solid #e8e8e8;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

@media (max-width: 768px) {
  .content {
    flex-direction: column;
  }
}
</style>