"use strict";
const common_vendor = require("./common/vendor.js");
const _sfc_main = {
  name: "NotificationManagement",
  setup() {
    const announcements = common_vendor.ref([]);
    const showModal = common_vendor.ref(false);
    const editingAnnouncement = common_vendor.ref(null);
    const currentAnnouncement = common_vendor.ref({
      title: "",
      content: "",
      display_location: "homepage",
      is_active: true
    });
    const activeNoticeTab = common_vendor.ref("individual");
    const individualNotice = common_vendor.ref("");
    const groupNotice = common_vendor.ref("");
    const currentNoticeContent = common_vendor.ref("");
    common_vendor.onMounted(() => {
      fetchAnnouncements();
      fetchNotices();
    });
    common_vendor.watch(activeNoticeTab, (newTab) => {
      currentNoticeContent.value = newTab === "individual" ? individualNotice.value : groupNotice.value;
    });
    const fetchAnnouncements = async () => {
      try {
        announcements.value = [
          {
            notification_id: 1,
            title: "系统维护通知",
            content: "本系统将于本周六凌晨2点至4点进行维护，期间可能无法正常使用。",
            type: "announcement",
            display_location: "homepage",
            publisher_id: 1,
            is_active: true,
            created_at: "2023-06-10 09:30:00",
            updated_at: "2023-06-10 09:30:00"
          },
          {
            notification_id: 2,
            title: "关于暑假期间入校预约调整的通知",
            content: "暑假期间（7月1日至8月31日），个人预约入校时间调整为上午9点至下午5点。",
            type: "announcement",
            display_location: "homepage",
            publisher_id: 1,
            is_active: false,
            created_at: "2023-06-01 14:20:00",
            updated_at: "2023-06-15 16:45:00"
          }
        ];
      } catch (error) {
        console.error("获取公告列表失败:", error);
      }
    };
    const fetchNotices = async () => {
      try {
        individualNotice.value = "个人预约入校须知内容...";
        groupNotice.value = "团体预约入校须知内容...";
        currentNoticeContent.value = activeNoticeTab.value === "individual" ? individualNotice.value : groupNotice.value;
      } catch (error) {
        console.error("获取入校须知失败:", error);
      }
    };
    const showAnnouncementModal = (announcement) => {
      if (announcement) {
        editingAnnouncement.value = announcement;
        currentAnnouncement.value = { ...announcement };
      } else {
        editingAnnouncement.value = null;
        currentAnnouncement.value = {
          title: "",
          content: "",
          display_location: "homepage",
          is_active: true
        };
      }
      showModal.value = true;
    };
    const saveAnnouncement = async () => {
      try {
        showModal.value = false;
        fetchAnnouncements();
        common_vendor.index.showToast({
          title: "保存成功",
          icon: "success"
        });
      } catch (error) {
        console.error("保存公告失败:", error);
        common_vendor.index.showToast({
          title: "保存失败，请重试",
          icon: "none"
        });
      }
    };
    const deleteAnnouncement = async (id) => {
      common_vendor.index.showModal({
        title: "确认删除",
        content: "确定要删除这条公告吗？",
        success: async (res) => {
          if (res.confirm) {
            try {
              fetchAnnouncements();
              common_vendor.index.showToast({
                title: "删除成功",
                icon: "success"
              });
            } catch (error) {
              console.error("删除公告失败:", error);
              common_vendor.index.showToast({
                title: "删除失败，请重试",
                icon: "none"
              });
            }
          }
        }
      });
    };
    const saveNotice = async () => {
      try {
        common_vendor.index.showToast({
          title: "保存成功",
          icon: "success"
        });
        fetchNotices();
      } catch (error) {
        console.error("保存入校须知失败:", error);
        common_vendor.index.showToast({
          title: "保存失败，请重试",
          icon: "none"
        });
      }
    };
    const resetNotice = () => {
      currentNoticeContent.value = activeNoticeTab.value === "individual" ? individualNotice.value : groupNotice.value;
    };
    const truncateContent = (content, length) => {
      if (!content)
        return "";
      if (content.length <= length)
        return content;
      return content.substring(0, length) + "...";
    };
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
    };
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: common_vendor.o(($event) => $setup.showAnnouncementModal(null)),
    b: common_vendor.f($setup.announcements, (announcement, k0, i0) => {
      return {
        a: common_vendor.t(announcement.title),
        b: common_vendor.t($setup.truncateContent(announcement.content, 50)),
        c: common_vendor.o(($event) => $setup.showAnnouncementModal(announcement), announcement.notification_id),
        d: common_vendor.o(($event) => $setup.deleteAnnouncement(announcement.notification_id), announcement.notification_id),
        e: announcement.notification_id,
        f: !announcement.is_active ? 1 : ""
      };
    }),
    c: $setup.activeNoticeTab === "individual" ? 1 : "",
    d: common_vendor.o(($event) => $setup.activeNoticeTab = "individual"),
    e: $setup.activeNoticeTab === "group" ? 1 : "",
    f: common_vendor.o(($event) => $setup.activeNoticeTab = "group"),
    g: common_vendor.t($setup.activeNoticeTab === "individual" ? "个人预约入校须知" : "团体预约入校须知"),
    h: $setup.currentNoticeContent,
    i: common_vendor.o(($event) => $setup.currentNoticeContent = $event.detail.value),
    j: common_vendor.o((...args) => $setup.saveNotice && $setup.saveNotice(...args)),
    k: common_vendor.o((...args) => $setup.resetNotice && $setup.resetNotice(...args)),
    l: $setup.showModal
  }, $setup.showModal ? {
    m: common_vendor.t($setup.editingAnnouncement ? "编辑公告" : "发布公告"),
    n: $setup.currentAnnouncement.title,
    o: common_vendor.o(($event) => $setup.currentAnnouncement.title = $event.detail.value),
    p: $setup.currentAnnouncement.content,
    q: common_vendor.o(($event) => $setup.currentAnnouncement.content = $event.detail.value),
    r: $setup.currentAnnouncement.is_active,
    s: common_vendor.o(($event) => $setup.currentAnnouncement.is_active = !$setup.currentAnnouncement.is_active),
    t: common_vendor.t($setup.editingAnnouncement ? "更新" : "发布"),
    v: common_vendor.o((...args) => $setup.saveAnnouncement && $setup.saveAnnouncement(...args)),
    w: common_vendor.o(($event) => $setup.showModal = false)
  } : {});
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-38f6fdde"]]);
exports.MiniProgramPage = MiniProgramPage;
