"use strict";
const common_vendor = require("./common/vendor.js");
const api_uniAdmin = require("./api/uniAdmin.js");
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
      fetchAnnouncementsList();
      fetchNotices();
    });
    common_vendor.watch(activeNoticeTab, (newTab) => {
      currentNoticeContent.value = newTab === "individual" ? individualNotice.value : groupNotice.value;
    });
    const fetchAnnouncementsList = async () => {
      var _a;
      try {
        const result = await api_uniAdmin.getAnnouncements({ page: 1, limit: 50 });
        if (result && result.code === 0) {
          announcements.value = ((_a = result.data) == null ? void 0 : _a.announcements) || [];
        } else {
          announcements.value = [];
          common_vendor.index.showToast({ title: result.message || "获取公告列表失败", icon: "none" });
        }
      } catch (error) {
        console.error("获取公告列表失败:", error);
        common_vendor.index.showToast({ title: "网络错误", icon: "none" });
      }
    };
    const fetchNotices = async () => {
      try {
        const individualResult = await api_uniAdmin.getNotice("individual_notice");
        if (individualResult && individualResult.code === 0 && individualResult.data) {
          individualNotice.value = individualResult.data.content || "";
        } else {
          individualNotice.value = "暂无个人预约入校须知";
        }
        const groupResult = await api_uniAdmin.getNotice("group_notice");
        if (groupResult && groupResult.code === 0 && groupResult.data) {
          groupNotice.value = groupResult.data.content || "";
        } else {
          groupNotice.value = "暂无团队预约入校须知";
        }
        currentNoticeContent.value = activeNoticeTab.value === "individual" ? individualNotice.value : groupNotice.value;
      } catch (error) {
        console.error("获取入校须知失败:", error);
        common_vendor.index.showToast({ title: "网络错误", icon: "none" });
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
        if (!currentAnnouncement.value.title || !currentAnnouncement.value.content) {
          common_vendor.index.showToast({
            title: "请填写标题和内容",
            icon: "none"
          });
          return;
        }
        const publisherId = common_vendor.index.getStorageSync("user_id") || 1;
        const payload = {
          title: currentAnnouncement.value.title,
          content: currentAnnouncement.value.content,
          display_location: currentAnnouncement.value.display_location,
          publisher_id: publisherId,
          is_active: currentAnnouncement.value.is_active
        };
        let result;
        if (editingAnnouncement.value) {
          result = await api_uniAdmin.updateAnnouncement(editingAnnouncement.value.notification_id, payload);
        } else {
          result = await api_uniAdmin.createAnnouncement(payload);
        }
        if (result && result.code === 0) {
          showModal.value = false;
          fetchAnnouncementsList();
          common_vendor.index.showToast({
            title: "保存成功",
            icon: "success"
          });
        } else {
          common_vendor.index.showToast({
            title: result.message || "保存失败",
            icon: "none"
          });
        }
      } catch (error) {
        console.error("保存公告失败:", error);
        common_vendor.index.showToast({
          title: "网络错误",
          icon: "none"
        });
      }
    };
    const deleteAnnouncementItem = async (id) => {
      try {
        const res = await common_vendor.index.showModal({
          title: "确认删除",
          content: "确定要删除这条公告吗？此操作不可恢复！"
        });
        if (res.confirm) {
          const result = await api_uniAdmin.deleteAnnouncement(id);
          if (result && result.code === 0) {
            fetchAnnouncementsList();
            common_vendor.index.showToast({
              title: "删除成功",
              icon: "success"
            });
          } else {
            common_vendor.index.showToast({
              title: result.message || "删除失败",
              icon: "none"
            });
          }
        }
      } catch (error) {
        console.error("删除公告失败:", error);
        common_vendor.index.showToast({
          title: "网络错误",
          icon: "none"
        });
      }
    };
    const saveNotice = async () => {
      try {
        if (!currentNoticeContent.value.trim()) {
          common_vendor.index.showToast({
            title: "请填写须知内容",
            icon: "none"
          });
          return;
        }
        const publisherId = common_vendor.index.getStorageSync("user_id") || 1;
        const noticeType = activeNoticeTab.value === "individual" ? "individual_notice" : "group_notice";
        const title = activeNoticeTab.value === "individual" ? "个人预约入校须知" : "团队预约入校须知";
        const payload = {
          title,
          content: currentNoticeContent.value,
          publisher_id: publisherId
        };
        const result = await api_uniAdmin.updateNotice(noticeType, payload);
        if (result && result.code === 0) {
          if (activeNoticeTab.value === "individual") {
            individualNotice.value = currentNoticeContent.value;
          } else {
            groupNotice.value = currentNoticeContent.value;
          }
          common_vendor.index.showToast({
            title: "保存成功",
            icon: "success"
          });
        } else {
          common_vendor.index.showToast({
            title: result.message || "保存失败",
            icon: "none"
          });
        }
      } catch (error) {
        console.error("保存入校须知失败:", error);
        common_vendor.index.showToast({
          title: "网络错误",
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
      deleteAnnouncementItem,
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
        d: common_vendor.o(($event) => $setup.deleteAnnouncementItem(announcement.notification_id), announcement.notification_id),
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
