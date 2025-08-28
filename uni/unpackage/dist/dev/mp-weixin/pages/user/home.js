"use strict";
const common_vendor = require("../../common/vendor.js");
const api_uniNotifications = require("../../api/uniNotifications.js");
if (!Math) {
  (PersonalForm + GroupForm)();
}
const PersonalForm = () => "./form2.js";
const GroupForm = () => "./group2.js";
const _sfc_main = {
  __name: "home",
  setup(__props) {
    const activeTab = common_vendor.ref("notice");
    const announcements = common_vendor.ref([]);
    const logout = () => {
      common_vendor.index.navigateBack();
    };
    const viewAnnouncement = (item) => {
      common_vendor.index.showModal({
        title: item.type,
        content: item.content,
        showCancel: false,
        confirmText: "知道了"
      });
    };
    const loadAnnouncements = async () => {
      try {
        const res = await api_uniNotifications.fetchHomepageAnnouncements();
        if (res && res.code === 0 && res.data && Array.isArray(res.data.announcements)) {
          announcements.value = res.data.announcements.map((n) => ({
            notification_id: n.notification_id,
            type: n.title || "系统公告",
            content: n.content,
            time: (n.created_at || "").toString().slice(0, 10),
            important: !!n.is_active
          }));
        } else {
          announcements.value = [];
        }
      } catch (e) {
        announcements.value = [];
        common_vendor.index.showToast({ title: "公告加载失败", icon: "none" });
      }
    };
    common_vendor.onShow(() => {
      loadAnnouncements();
    });
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.o(logout),
        b: common_vendor.n(activeTab.value === "notice" ? "tab-button-active" : ""),
        c: common_vendor.o(() => activeTab.value = "notice"),
        d: common_vendor.n(activeTab.value === "personal" ? "tab-button-active" : ""),
        e: common_vendor.o(() => activeTab.value = "personal"),
        f: common_vendor.n(activeTab.value === "group" ? "tab-button-active" : ""),
        g: common_vendor.o(() => activeTab.value = "group"),
        h: activeTab.value === "notice"
      }, activeTab.value === "notice" ? common_vendor.e({
        i: announcements.value.length > 0
      }, announcements.value.length > 0 ? {
        j: common_vendor.f(announcements.value, (item, index, i0) => {
          return {
            a: common_vendor.t(item.type),
            b: common_vendor.n(item.important ? "important" : ""),
            c: common_vendor.t(item.time),
            d: common_vendor.t(item.content),
            e: item.notification_id || index,
            f: common_vendor.o(() => viewAnnouncement(item), item.notification_id || index)
          };
        })
      } : {}) : {}, {
        k: activeTab.value === "personal"
      }, activeTab.value === "personal" ? {} : {}, {
        l: activeTab.value === "group"
      }, activeTab.value === "group" ? {} : {});
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-f834fd70"]]);
wx.createPage(MiniProgramPage);
